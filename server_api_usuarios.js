// Modulos
const http = require('http');
const db = require('./api_usuarios/db_manager');
const {server_host, server_api_usuarios_port, database_mysql, getFecha} = require('./opciones');
const router = require('./api_usuarios/router');

// Conectar base de datos MYSQL
db.conectar(database_mysql)
    .then(({status,mensaje,conexion}) => {
        const fecha = getFecha();
        console.log(`[USUARIOS] - DDBB | ${fecha.dia} | ${fecha.hora} | ${status} | ${mensaje} `);
        return db.iniciarTablas(conexion);
    })
    .then(({status,mensaje,conexion}) => {
        const fecha = getFecha();
        console.log(`[USUARIOS] - DDBB | ${fecha.dia} | ${fecha.hora} | ${status} | ${mensaje} `);
        // Crear Server
        const server_api_usuarios = http.createServer( (req,res) => {
            const fecha = getFecha();
            console.log(`[USUARIOS] > API | ${fecha.dia} | ${fecha.hora} | HTTP/${req.httpVersion} | ${req.method} | '${req.url}' `);
            router(conexion,req,res);
        });

        // Conectar Server y ponerlo a "escuchar"
        server_api_usuarios.listen(server_api_usuarios_port, server_host, () => {
            const fecha = getFecha();
            console.log(`[USUARIOS] - SERVER | ${fecha.dia} | ${fecha.hora} | Conectado en http://${server_host}:${server_api_usuarios_port} *`)
        })
    })
    .catch(({status,mensaje}) => {
        const fecha = getFecha();
        console.log(`[USUARIOS] - DDBB | ${fecha.dia} | ${fecha.hora} | ${status} | ${mensaje} `);
    });

