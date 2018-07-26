# Sistema de control para puerta automática desde cliente web
Proyecto final para la asignatura Microprocesadores y Microcontroladores

## Autores

Sebastián Collado Montañez

Juan Carlos Castillo Alcántara

## Introducción

Diseño e implementación de un sistema para controlar la apertura y cierre de una puerta de forma remota, mediante el uso de tecnologías web en tiempo real.

Partes del proyecto:

- Servicio de gestión GPIO sobre Raspberry Pi 3.
- Servidor web (Node.js, Express, WebSocket).
- Aplicación web cliente.

## Despliegue

1. Preparación de paquetes necesarios

    `sudo apt-get update`

    `sudo apt-get install git`

    `sudo apt-get install build-essential`

    `sudo apt-get install nodejs`

    `sudo apt-get install npm`

    `sudo npm install -g forever`

2. Clonar proyecto desde GitLab UJA

    `git clone http://gitlab.ujaen.es/scollado/proyecto-micro.git`

3. Ejecución con `forever` desde la carpeta del proyecto

    Lanzar servidor: `sudo forever start webserver.js --debug`

    Reiniciar servidor: `sudo forever start webserver.js --debug`

    Parar servidor: `sudo forever stopall`
