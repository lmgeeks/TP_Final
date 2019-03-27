const url = require('url');
const db = require('./db_manager');
const body_parser = require('../body_parser');
const {getFecha} = require('../opciones');

// ROUTER
module.exports = async (connection,req,res) => {
    const fecha = getFecha();
    const {pathname, query} = url.parse(req.url,true);
    const {method} = req;
    let response = { error: null, data: null};
    // SI la ruta buscada no existe tira error
    if (pathname !== '/') response.error = `No existe endpoint`;
    else {
        // Segun el método
        switch(method) {
            case 'GET':
                // Obtener UN Usuario por ID
                if (query.id) {
                    try {
                        response.data = await db.buscarPorId(connection,query.id);
                        console.log(`[USUARIOS] - DDBB | ${fecha.dia} | ${fecha.hora} | BUSCAR USUARIO DE ID ${query.id} - OK`);
                    } catch (err) {
                        response.error = `Al buscar Usuario de ID ${query.id} : ${err}`;
                    }
                // Obtener TODOS los Usuarios
                } else if (Object.keys(query).length === 0) {
                    try {
                        response.data = await db.buscarTodos(connection);
                        console.log(`[USUARIOS] - DDBB | ${fecha.dia} | ${fecha.hora} | BUSCAR TODOS LOS USUARIOS - OK`);
                    } catch (err) {
                        response.error = `Al buscar Usuarios : ${err}`;
                    }
                } else response.error = `No existe endpoint`;
                break;
            case 'POST':
                // Crear un Usuario
                if (Object.keys(query).length === 0) {
                    try {
                        // Consigo la información entrante primero
                        const nuevo_usuario = await body_parser(req);
                        response.data = await db.crear(connection,nuevo_usuario);
                        console.log(`[USUARIOS] - DDBB | ${fecha.dia} | ${fecha.hora} | Ingresar Usuario - OK`);
                    } catch (err) {
                        response.error = `Al crear Usuario : ${err}`;
                    }
                } else response.error = `No existe endpoint`;
                break;
            case 'PUT':
            case 'PATCH':
                // Cambiar el Estado (CONECTADO <-> DESCONECTADO) de un Usuario
                if (query.id && query.status) {
                    try {
                        response.data = await db.cambiarStatus(connection,query.id,query.status);
                        console.log(`[USUARIOS] - DDBB | ${fecha.dia} | ${fecha.hora} | Cambiar de STATUS a Usuario ${query.id} - OK`);
                    } catch (err) {
                        response.error = `Al cambiar de estado de Usuario de ID ${query.id} : ${err}`;
                    }
                // Actualizar un Usuario
                } else if (query.id) {
                    try {
                        // Consigo la información entrante primero
                        const nuevo_usuario = await body_parser(req);
                        response.data = await db.actualizar(connection,query.id,nuevo_usuario);
                        console.log(`[USUARIOS] - DDBB | ${fecha.dia} | ${fecha.hora} | Actualizar Usuario de ID ${query.id} - OK`);
                    } catch (err) {
                        response.error = `Al actualizar Usuario de ID ${query.id} : ${err}`;
                    }
                } else response.error = `No existe endpoint`;
                break;
            // Otro
            default:
                response.error = `No existe endpoint`;
        }
    }
    if (response.error) {
        console.error(`[USUARIOS] - DDBB | ${fecha.dia} | ${fecha.hora} | Error : ${response.error}`);
    }
    res.writeHeader(response.error ? 404 : 200, response.error ? "Not Found" : "OK", {"Content-Type":"application/json"} );
    res.end(JSON.stringify(response));
}