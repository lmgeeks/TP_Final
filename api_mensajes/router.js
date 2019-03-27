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
                // Obtener UN mensaje por ID
                if (query.id) {
                    try {
                        response.data = await db.buscarPorId(connection,query.id);
                        console.log(`[MENSAJES] - DDBB | ${fecha.dia} | ${fecha.hora} | BUSCAR MENSAJE DE ID ${query.id} - OK`);
                    } catch (err) {
                        response.error = `No se pudo buscar Mensaje de ID ${query.id} : ${err}`;
                    }
                // Obtener TODOS los mensajes desde UNA fecha ISO (Dia= YYYY-MM-DD, Hora= HH:MM:SS)
                } else if (query.dia && query.hora) {
                    try {
                        response.data = await db.buscarDesde(connection,query.dia,query.hora);
                        console.log(`[MENSAJES] - DDBB | ${fecha.dia} | ${fecha.hora} | BUSCAR TODOS LOS MENSAJES DESDE ${query.dia} A LAS ${query.hora}- OK`);
                    } catch (err) {
                        response.error = `No se pudo buscar Mensajes desde ${query.dia} a las ${query.hora} : ${err}`;
                    }
                // Obtener TODOS los Mensajes
                } else if (Object.keys(query).length === 0) {
                    try {
                        response.data = await db.buscarTodos(connection);
                        console.log(`[MENSAJES] - DDBB | ${fecha.dia} | ${fecha.hora} | BUSCAR TODOS LOS MENSAJES - OK`);
                    } catch (err) {
                        response.error = `No se pudo buscar Mensajes : ${err}`;
                    }
                // Si usa otros endpoints, error
                } else response.error = `No existe endpoint`;
                break;
            case 'POST':
                // INGRESAR un mensaje
                if (Object.keys(query).length === 0) {
                    try {
                        // Parseo la info entrante
                        const nuevo_usuario = await body_parser(req);
                        // Se lo paso a la base de datos
                        response.data = await db.crear(connection,nuevo_usuario);
                        console.log(`[MENSAJES] - DDBB | ${fecha.dia} | ${fecha.hora} | Ingresar Mensaje - OK`);
                    } catch (err) {
                        response.error = `No se pudo crear Mensaje : ${err}`;
                    }
                } else response.error = `No existe endpoint`;
                break;
            case 'PUT' :
            case 'PATH' :
                // Cambiar el STATUS de un mensaje - Solo se puede cambiar de NO LEIDO a LEIDO
                if (query.id) {
                    try {
                        response.data = await db.cambiarStatus(connection,query.id);
                        console.log(`[MENSAJES] - DDBB | ${fecha.dia} | ${fecha.hora} | Cambiar de STATUS a Mensaje ${query.id} - OK`);
                    } catch (err) {
                        response.error = `No se pudo cambiar de estado de Mensaje de ID ${query.id} : ${err}`;
                    }
                } else response.error = `No existe endpoint`;
                break;
            // Cualquier otra peticion
            default:
                response.error = `No existe endpoint`;
        }
    }
    if (response.error) {
        console.error(`[MENSAJES] - DDBB | ${fecha.dia} | ${fecha.hora} | Error : ${response.error}`);
    }
    res.writeHeader(response.error ? 404 : 200, response.error ? "Not Found" : "OK", {"Content-Type":"application/json"} );
    res.end(JSON.stringify(response));
}