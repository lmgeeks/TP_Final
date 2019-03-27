// Modulos
const http = require('http');
const db = require('./api_mensajes/db_manager');
const router = require('./api_mensajes/router');
const {server_host, server_api_mensajes_port, database_mysql, getFecha} = require('./opciones');

// Conectar con Base de Datos
db.conectar(database_mysql)
    .then(({status, mensaje, conexion}) => {
        
        let fecha = getFecha();
        console.log(`[MENSAJES] - DDBB | ${fecha.dia} / ${fecha.hora} | ${status} | ${mensaje} `);
        // Inicializo las tablas
        return db.iniciarTablas(conexion);

    }).then(({status, mensaje, conexion})=> {

        let fecha = getFecha();
        console.log(`[MENSAJES] - DDBB | ${fecha.dia} / ${fecha.hora} | ${status} | ${mensaje} `)
        // Crear Server
        const server_api_mensajes = http.createServer((req,res) => {
            fecha = getFecha();
            console.log(`[MENSAJES] > API | ${fecha.dia} / ${fecha.hora} | HTTP/${req.httpVersion} | ${req.method} | '${req.url}' `);
            router(conexion,req,res);
            
        });

        // Conectar Server y ponerlo a "escuchar"
        server_api_mensajes.listen(server_api_mensajes_port, server_host, () => {
            fecha = getFecha();
            console.log(`[MENSAJES] - SERVER | ${fecha.dia} / ${fecha.hora} | Conectado en http://${server_host}:${server_api_mensajes_port} *`)
        })
// Si hay algun error
}).catch(err => {
    let fecha = getFecha();
    console.log(`[MENSAJES] - No se pudo conectar el Server | ${fecha.dia} / ${fecha.hora} | ${err.status} | ${err.mensaje} `)
});



