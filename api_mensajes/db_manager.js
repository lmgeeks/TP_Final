const mysql = require('mysql');
const ejecutarQuery = require('../ejecutarQuery');

// Manipulación de la Base de Datos
module.exports = {
    // CONECTAR la base de datos
    conectar : function (opciones) {

        return new Promise ( (res,err) =>  { 
            // creo la conexión
            const conexion = mysql.createConnection(opciones);
            // Conecto
            conexion.connect(function (error) {
                // si se produce un error
                if (error) 
                    err({
                        status: 500,
                        mensaje: `No se pudo conectar a la Base de datos - ${error.message}`
                    });
                // Si se conecta
                else res({
                    status: 200,
                    mensaje: "Base de Datos Conectada",
                    conexion
                })
            }) 
        })
    },
    // INICIALIZAR tablas
    iniciarTablas: function (conexion) {
        // Inicializo las tablas si no existen
                    
        return new Promise((res,err)=> {
            // Tabla de Status de Mensajes
            const QUERY_CREAR_TABLA_STATUS = 'CREATE TABLE IF NOT EXISTS `status_mensajes` ( `id_status` TINYINT NOT NULL UNIQUE, descripcion VARCHAR(8) NOT NULL, PRIMARY KEY(id_status) );'
            ejecutarQuery(conexion, QUERY_CREAR_TABLA_STATUS)
                .then(({conexion}) => {
                    // Tabla Agrego el STATUS 0 de NO LEIDO
                    const QUERY_AGREGAR_STATUS_0 = 'INSERT INTO `status_mensajes` VALUES (0, "NO LEIDO");'
                    return ejecutarQuery(conexion,QUERY_AGREGAR_STATUS_0);
                })
                .then(({conexion}) => {
                    // Si creo el anterior registro o ya existe agrego el siguiente
                    // Tabla Agrego el STATUS 1 de LEIDO
                    const QUERY_AGREGAR_STATUS_1 = 'INSERT INTO `status_mensajes` VALUES (1, "LEIDO");'
                    return ejecutarQuery(conexion,QUERY_AGREGAR_STATUS_1);
                })
                .then(({conexion}) => {
                    // Si creo el anterior registro o ya existe creo la ultima tabla
                    const QUERY_CREAR_TABLA_MENSAJES ='CREATE TABLE IF NOT EXISTS `mensajes` ( `id_mensaje` MEDIUMINT UNSIGNED AUTO_INCREMENT NOT NULL UNIQUE, `cuerpo` TEXT NOT NULL, `creado_en` DATETIME NOT NULL DEFAULT NOW(),`actualizo_en` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(), `id_usuario` TINYINT UNSIGNED NOT NULL, `id_status` TINYINT NOT NULL DEFAULT 0, PRIMARY KEY(id_mensaje), FOREIGN KEY(id_status) REFERENCES `status_mensajes`(id_status));'
                    return ejecutarQuery(conexion,QUERY_CREAR_TABLA_MENSAJES);
                }).then(({conexion}) => res({status: 200, mensaje: "Tablas creadas e inicializadas", conexion}))

                .catch(error => err(error));
        })
    },
    // BUSQUEDA de Mensajes
    // TODOS
    buscarTodos: function(conexion) {
        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!conexion) err("No esta Conectado a una Base de Datos");
            // Busco en la base de datos, devuelvo la descripción del codigo de status
            const QUERY_BUSCAR_TODOS = 'SELECT `id_mensaje`, m.`cuerpo`, m.`id_usuario`, m.`creado_en`, m.`actualizo_en`, s.`descripcion` AS "status" FROM `mensajes` m JOIN `status_mensajes` s ON s.id_status = m.id_status;'
            ejecutarQuery(conexion,QUERY_BUSCAR_TODOS)
                .then(({status, resultados}) => {
                    if (status === 200) {
                        res({
                            mensajes: resultados
                        })
                    } else
                        err('No se pudo procesar bien la busqueda')
                })
                .catch(({mensaje}) => err(mensaje));
        })
    },
    // TODOS los que Mensajes desde una fecha
    buscarDesde: function(conexion, dia="2019-01-01", hora="00:00:00") {
        // armo el DATETIME
        const fecha_desde = new Date(`${dia}T${hora}.000Z`);
        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!conexion) err("No esta Conectado a una Base de Datos");
            // Me Fijo si la Fecha es Valida
            if (fecha_desde == 'Invalid Date') {
                err('Fecha Invalida')
            } else {
                // Busco en la base de datos
                const QUERY_BUSCAR_TODOS_DESDE = 'SELECT m.`id_mensaje`, m.`cuerpo`, m.`id_usuario`, m.`creado_en`, m.`actualizo_en`, s.`descripcion` AS "status" FROM `mensajes` m JOIN `status_mensajes` s ON s.id_status = m.id_status WHERE m.`creado_en` >= ?;';
            
                ejecutarQuery(conexion, QUERY_BUSCAR_TODOS_DESDE, [fecha_desde] )
                    .then(({resultados}) => {
                        // Si dio resultados
                        res({ usuarios: resultados});
                    })
                    .catch(({mensaje}) => err(`No se pudo Buscar Mensajes, ${mensaje}`))
            } 
        })
    },
    // UNO por ID
    buscarPorId: function(conexion, id=0) {
        //paso el ID a numero
        const id_mensaje = parseInt(id);
        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!conexion) err("No esta Conectado a una Base de Datos");
            // si ingreso un ID valido 
            if (id_mensaje > 0) {
                // Busco en la base de datos
                const QUERY_BUSCAR_MENSAJE_ID = 'SELECT m.`id_mensaje`, m.`cuerpo`, m.`id_usuario`, m.`creado_en`, m.`actualizo_en`, s.`descripcion` AS "status" FROM `mensajes` m JOIN `status_mensajes` s ON s.id_status = m.id_status WHERE m.`id_mensaje` = ?;';
                ejecutarQuery(conexion, QUERY_BUSCAR_MENSAJE_ID, [id_mensaje])
                    .then(({resultados}) => {
                        // Si no hubo problemas con la busqueda
                        // ID deberia ser unico, resultados viene con un array, la primera posicion deberia existir y ser el mensaje
                        if (resultados[0]) {
                            res({ mensaje: resultados[0]});
                            
                        // Si no existe, no encontro el mensaje
                        } else err(`No existe Mensaje con ID ${id}`)
                    })
                    .catch( (error) => err(`No se pudo buscar Mensaje, ${error}`))
            } else err(`No es valido ID = ${id} para Buscar`)
        })  
    },
    // CREA un Mensaje
    crear: function(conexion, data=null) {        
        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!conexion) err("No esta Conectado a una Base de Datos");
            if (data && data.id_usuario && data.cuerpo) {
                // Busco ingresar el Mensaje a la Base de Datos
                const QUERY_CREAR_MENSAJE = 'INSERT INTO `mensajes` (`cuerpo`, `id_usuario`) VALUES (?, ?);';
                ejecutarQuery(conexion, QUERY_CREAR_MENSAJE, [data.cuerpo, data.id_usuario])
                    .then(({status, resultados})=>{
                        // Si trae un codigo de que ya existe lo devuelvo como error
                        if (status === 300) {
                            err('Mensaje existente');
                        } else {
                            // Si el codigo es otro, es que lo ingreso
                            // Agrego el ID asignado al mensaje original y lo envio como respuesta
                            data.id_mensaje = resultados.insertId;
                            res({mensaje: data});
                        }
                    })
                    // Si hubo otro problema devuelvo error
                    .catch(({mensaje}) => err(`No se pudo ingresar Mensaje, ${mensaje}`))
            // Si no tenia todos los datos necesarios
            } else {
                err(`Input incumpleto`);
            }
        })
    },
    // Cambia el estado de un Mensaje de NO LEIDO a LEIDO (y no puede cambiar más)
    cambiarStatus: function(conexion, id=0) {
        //paso el ID a numero
        const id_mensaje = parseInt(id);
        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!conexion) err("No esta Conectado a una Base de Datos");
            // Si el ID es valido
            if (id_mensaje > 0) {
                const estaLeido = {id_mensaje, status: "LEIDO"};
                // Busco si existe el mensaje
                const QUERY_BUSCAR_MENSAJE = 'SELECT `id_mensaje`, `id_status` FROM `mensajes` WHERE `id_mensaje` = ?';
                ejecutarQuery(conexion, QUERY_BUSCAR_MENSAJE, [id_mensaje])
                    .then(({resultados}) => {
                        // Si no hubo problemas con la busqueda
                        // El ID debe ser unico, resultados vuelve en array, me fijo si existe la primera posición sino esta vacio y no existe
                        if (resultados[0]) {
                            // Si el ID es 0 (osea NO LEIDO)
                            if (resultados[0].id_status === 0) {
                                const QUERY_ACTUALIZAR_STATUS = 'UPDATE `mensajes` SET `id_status` = 1 WHERE `id_mensaje` = ?';
                                return ejecutarQuery(conexion, QUERY_ACTUALIZAR_STATUS,[id_mensaje]);
                            // Si ya estaba leido
                            } else res({mensaje: estaLeido})

                        } else err(`No existe Mensaje con ID ${id}`)
                    })
                    .then(({status, mensaje}) => {
                        // si salio todo bien
                        if (status === 200) {
                            res({mensaje: estaLeido})
                        // si hubo otro codigo de status
                        } else err(`No se pudo cambiar status, ${mensaje}`)
                    })
                    .catch(({mensaje}) => err(`No se pudo cambiar status, ${mensaje}`))
            } else err(`No es valido ID = ${id} para Buscar`)
        })
    }
}