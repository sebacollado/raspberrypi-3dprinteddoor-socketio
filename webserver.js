var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Gpio = require('pigpio').Gpio;

/*
 GPIO
 */

// Puerta cerrada: 1850
// Puerta abierta: 950
// Rango apertura: 900


// Inicializacion
var RED = new Gpio(4, { mode: Gpio.OUTPUT });
var GREEN = new Gpio(17, { mode: Gpio.OUTPUT });
var BLUE = new Gpio(27, { mode: Gpio.OUTPUT });
var motor = new Gpio(13, { mode: Gpio.OUTPUT });
var trigger = new Gpio(23, {mode: Gpio.OUTPUT});
var echo = new Gpio(24, {mode: Gpio.INPUT, alert: true});
var obstaculo = false;

var MICROSECDONDS_PER_CM = 1e6/34321;

var pulseWidth = 1850;
motor.servoWrite(pulseWidth);
RED.pwmWrite(255);
GREEN.pwmWrite(0);
BLUE.pwmWrite(0);
trigger.digitalWrite(0);

// Ultrasonidos
(function () {
  var startTick;

  echo.on('alert', function (level, tick) {
    var endTick,
      diff;

    if (level == 1) {
      startTick = tick;
    } else {
      endTick = tick;
      diff = (endTick >> 0) - (startTick >> 0);
      //console.log(diff / 2 / MICROSECDONDS_PER_CM);
      if((diff / 2 / MICROSECDONDS_PER_CM) < 10.0){
        obstaculo = true;
      }else{
        obstaculo = false;
      }

    }
  });
}());
// Lanza la medicion de distancia una vez cada segundo
setInterval(function () {
  trigger.trigger(10, 1); // Lanza una señal HIGHT durante 10ms
}, 1000);

// Abrir puerta
function abrirPuerta(){

    RED.pwmWrite(0);
    GREEN.pwmWrite(255);

    var increment = -10;

    var intervalo = setInterval(function () {

        motor.servoWrite(pulseWidth);

        pulseWidth += increment;

        if (pulseWidth <= 950) {
            clearInterval(intervalo);
        }

    }, 100);
}

// Cerrar puerta
function cerrarPuerta(socket){

    GREEN.pwmWrite(0);
    RED.pwmWrite(255);

    var increment = 10;

    var intervalo = setInterval(function () {

        motor.servoWrite(pulseWidth);

        pulseWidth += increment;

        if (pulseWidth >= 1850) {
            clearInterval(intervalo);
        }

        if(obstaculo){
          clearInterval(intervalo);
          abrirPuerta();

          estadoPuerta = 1;
          socket.broadcast.emit("actualizarEstado", Number(estadoPuerta));
          socket.emit("actualizarEstado", Number(estadoPuerta));
        }

    }, 100);
}


/*
  WEB SERVER
 */
app.use('/public', express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});
server.listen('8080');


/*
  WEBSOCKET
 */

var estadoPuerta = 0; //cerrada

io.sockets.on('connection', function (socket) { // Conexion WebSocket

    console.log("Cliente conectado");

    //Al conectarse el cliente, emite un valor de inicializacion sobre el estado de la puerta
    socket.emit("inicializacion", Number(estadoPuerta));

    //Escucha la orden del cliente
    socket.on('emisionOrden', function (data) {

        var ordenRecibida = data;

        if (estadoPuerta == 0 && ordenRecibida == 0) console.log("La puerta ya se encuentra cerrada");
        if (estadoPuerta == 0 && ordenRecibida == 1) {
            abrirPuerta();
            console.log("Abriendo puerta");

            setTimeout(function(){
                cerrarPuerta(socket);
                estadoPuerta = 0;
                socket.broadcast.emit("actualizarEstado", Number(estadoPuerta));
                socket.emit("actualizarEstado", Number(estadoPuerta));
            }, 15000);
        }
        if (estadoPuerta == 1 && ordenRecibida == 0) {
            cerrarPuerta(socket);
            console.log("Cerrando puerta");
        }
        if (estadoPuerta == 1 && ordenRecibida == 1) console.log("La puerta ya se encuentra abierta");

        estadoPuerta = ordenRecibida;

        socket.broadcast.emit("actualizarEstado", Number(estadoPuerta));
        socket.emit("actualizarEstado", Number(estadoPuerta));

    });

});
