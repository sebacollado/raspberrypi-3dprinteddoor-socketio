//Variables
var socket = io(); //socket.io
var timeCloseOpen = 10000;
var estado = 0;

/*
  Procedimiento que se ejecuta al cargar la pagina
 */
window.addEventListener("load", function() {

    //Inicializacion del menu izquierdo
    $(".button-collapse").sideNav();

    //Maneja las peticiones GET que puedan existir
    manejadorGET();
});

/*
  Escucha mensajes de inicializacion por parte del servidor
 */
socket.on('inicializacion', function(data) {

    estado = data;

    // Puerta se encuentra abierta, hay que cambiar su inicializacion
    if (estado == 1) {
        // Situa la puerta abierta, sin animacion
        document.getElementById('puerta').style.transition = 'none';
        document.getElementById('puerta').style.right = -$("#puerta").width() + "px";
        // Cambia el boton por el de cerrar
        document.getElementById('abrir').style.display = 'none';
        document.getElementById('cerrar').disabled = false;
        document.getElementById('cerrar').style.display = 'initial';
    }
});

/*
  Escucha mensajes de actualizacion por parte del servidor
 */
socket.on('actualizarEstado', function(data) {

    // Si el estado entrante es distinto del local
    if (estado != data) {
        // Actualiza estado local
        estado = data;
        // Habilita las transiciones CSS para la animacion
        document.getElementById('puerta').style.transition = '';
        // El nuevo estado es cerrado
        if (estado == 0) {
            // Cambia botones y hace la animacion
            document.getElementById('cerrar').disabled = true;
            document.getElementById('puerta').style.right = 0 + "px";
            setTimeout(function() {
                document.getElementById('cerrar').style.display = 'none';
                document.getElementById('abrir').disabled = false;
                document.getElementById('abrir').style.display = 'initial';
            }, timeCloseOpen);
        }
        // El nuevo estado es abierto
        if (estado == 1) {
            // Cambia botones y hace la animacion
            document.getElementById('abrir').disabled = true;
            document.getElementById('puerta').style.right = -$("#puerta").width() + "px";
            setTimeout(function() {
                document.getElementById('abrir').style.display = 'none';
                document.getElementById('cerrar').disabled = false;
                document.getElementById('cerrar').style.display = 'initial';
            }, timeCloseOpen);
        }
    }

});

/*
  Lee los parametros GET si existen para abrir o cerrar directamente, sin boton
 */
function manejadorGET() {
    var url = new URL(window.location.href);
    var ordenAbrir = url.searchParams.get("abrir");
    var ordenCerrar = url.searchParams.get("cerrar");

    //Lanza apertura o cierre segun la peticion GET
    if (ordenAbrir == "1" && ordenCerrar == null) abrirPuerta();
    if (ordenCerrar == "1" && ordenAbrir == null) cerrarPuerta();
}

/*
  Funcion para abrir la puerta
 */
function abrirPuerta() {
    // Habilita las transiciones CSS para la animacion
    document.getElementById('puerta').style.transition = '';
    // Emite la orden de apertura
    socket.emit("emisionOrden", Number(1));
    // Limpia los parametros GET de la URL
    window.history.replaceState({}, document.title, "/");
    // Cambia botones y hace la animacion
    document.getElementById('abrir').disabled = true;
    document.getElementById('puerta').style.right = -$("#puerta").width() + "px";
    setTimeout(function() {
        document.getElementById('abrir').style.display = 'none';
        document.getElementById('cerrar').disabled = false;
        document.getElementById('cerrar').style.display = 'initial';
    }, timeCloseOpen);
}

/*
  Funcion para cerrar la puerta
 */
function cerrarPuerta() {
    // Habilita las transiciones CSS para la animacion
    document.getElementById('puerta').style.transition = '';
    // Emite la orden de apertura
    socket.emit("emisionOrden", Number(0));
    // Limpia los parametros GET de la URL
    window.history.replaceState({}, document.title, "/");
    // Cambia botones y hace la animacion
    document.getElementById('cerrar').disabled = true;
    document.getElementById('puerta').style.right = 0 + "px";
    setTimeout(function() {
        document.getElementById('cerrar').style.display = 'none';
        document.getElementById('abrir').disabled = false;
        document.getElementById('abrir').style.display = 'initial';
    }, timeCloseOpen);
}
