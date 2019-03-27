const mysql = require('mysql');
const ejecutarQuery = require('../ejecutarQuery');

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
            // Tabla de Status de Usuarios
            const QUERY_CREAR_TABLA_STATUS = 'CREATE TABLE IF NOT EXISTS `status_usuarios` ( `id_status` TINYINT NOT NULL UNIQUE, `descripcion` VARCHAR(12) NOT NULL, PRIMARY KEY(id_status));';
            ejecutarQuery(conexion, QUERY_CREAR_TABLA_STATUS)
                .then(({conexion}) => {
                    // Tabla Agrego el STATUS -1 de DESCONECTADO
                    const QUERY_AGREGAR_STATUS_DES = 'INSERT INTO `status_usuarios` VALUES (-1, "DESCONECTADO");'
                    return ejecutarQuery(conexion,QUERY_AGREGAR_STATUS_DES);
                })
                .then(({conexion}) => {
                    // Si creo el anterior registro o ya existe agrego el siguiente
                    // Tabla Agrego el STATUS 1 de CONECTADO
                    const QUERY_AGREGAR_STATUS_CON = 'INSERT INTO `status_usuarios` VALUES (1, "CONECTADO");'
                    return ejecutarQuery(conexion,QUERY_AGREGAR_STATUS_CON);
                })
                .then(({conexion}) => {
                    // Si creo el anterior registro o ya existe creo la ultima tabla
                    const QUERY_CREAR_TABLA_USUARIOS ='CREATE TABLE IF NOT EXISTS `usuarios` ( `id_usuario` TINYINT UNSIGNED AUTO_INCREMENT NOT NULL UNIQUE, `nombre_usuario` VARCHAR(50) NOT NULL UNIQUE, `nombre` VARCHAR(50) NOT NULL, `apellido` VARCHAR(50) NOT NULL, `email` VARCHAR(60) NOT NULL UNIQUE, `creado_en` DATETIME NOT NULL DEFAULT NOW(), `actualizo_en` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(), `id_status` TINYINT NOT NULL DEFAULT 1, PRIMARY KEY(id_usuario), FOREIGN KEY(id_status) REFERENCES `status_usuarios`(id_status));'
                    return ejecutarQuery(conexion,QUERY_CREAR_TABLA_USUARIOS);
                }).then(({conexion}) => res({status: 200, mensaje: "Tablas creadas e inicializadas", conexion}))

                .catch(error => err(error));
        })
    },
    // BUSQUEDA de usuario
    // TODOS
    buscarTodos: function(conexion) {
        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!conexion) err("No esta Conectado a una Base de Datos");
            // Busco en la base de datos, devuelvo la descripción del codigo de status
            const QUERY_BUSCAR_TODOS = 'SELECT u.`id_usuario`, u.`nombre_usuario`, u.`nombre`, u.`apellido`, u.`email`, u.`creado_en`, u.`actualizo_en`, s.`descripcion` AS "status" FROM `usuarios` u JOIN `status_usuarios` s ON s.id_status = u.id_status;'
            ejecutarQuery(conexion,QUERY_BUSCAR_TODOS)
                .then(({status, resultados}) => {
                    if (status === 200) {
                        res({
                            usuarios: resultados
                        })
                    } else
                        err('No se pudo procesar bien la busqueda')
                })
                .catch(({mensaje}) => err(mensaje));
        })
    },
    // UNO por ID
    buscarPorId: function(conexion, id=0) {
        //paso el ID a numero
        const id_usuario = parseInt(id);
        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!conexion) err("No esta Conectado a una Base de Datos");
            // si ingreso un ID valido 
            if (id_usuario > 0) {
                // Busco en la base de datos
                const QUERY_BUSCAR_USUARIO_ID = 'SELECT u.`id_usuario`, u.`nombre_usuario`, u.`nombre`, u.`apellido`, u.`email`, u.`creado_en`, u.`actualizo_en`, s.`descripcion` AS "status" FROM `usuarios` u JOIN `status_usuarios` s ON s.id_status = u.id_status WHERE u.`id_usuario` = ?;';
                ejecutarQuery(conexion, QUERY_BUSCAR_USUARIO_ID, [id_usuario])
                    .then(({resultados}) => {
                        // Si no hubo problemas con la busqueda
                        // ID deberia ser unico, resultados viene con un array, la primera posicion deberia existir y ser el usuario
                        if (resultados[0]) {
                            res({ usuario: resultados[0]});
                            
                        // Si no existe, no encontro el usuario
                        } else err(`No existe Usuario con ID ${id}`)
                    })
                    .catch( (error) => err(`No se pudo buscar Usuario, ${error}`))
            } else err(`No es valido ID ${id} para Buscar`)
        })  
    },
    // CREA un usuario
    crear: function(conexion, data=null) {        
        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!conexion) err("No esta Conectado a una Base de Datos");
            if (data && data.nombre_usuario && data.nombre && data.apellido && data.email) {
                // Busco ingresar el Usuario a la Base de Datos
                const QUERY_CREAR_MENSAJE = 'INSERT INTO `usuarios` (`nombre_usuario`, `nombre`, `apellido`, `email`) VALUES (?, ?, ?, ?);';
                ejecutarQuery(conexion, QUERY_CREAR_MENSAJE, [data.nombre_usuario, data.nombre, data.apellido, data.email])
                    .then(({status, resultados})=>{
                        // Si trae un codigo de que ya existe lo devuelvo como error
                        if (status === 300) {
                            err('Usuario existente');
                        } else {
                            // Si el codigo es otro, es que lo ingreso
                            // Agrego el ID asignado al mensaje original y lo envio como respuesta
                            data.id_usuario = resultados.insertId;
                            res({usuario: data});
                        }
                    })
                    // Si hubo otro problema devuelvo error
                    .catch(({mensaje}) => err(`No se pudo ingresar Usuario, ${mensaje}`))
            // Si no tenia todos los datos necesarios
            } else {
                err(`Input incumpleto`);
            }
        })       
    },
    // ACTUALIZA el usuario con ID
    actualizar: function(conexion, id, data) {
        //paso el ID a numero
        const id_usuario = parseInt(id);

        let nombre, apellido, email, nombre_usuario;

        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!conexion) err("No esta Conectado a una Base de Datos");
            // Si el ID Es valido
            if (id_usuario > 0) {
                // Busco si existe el User
                const QUERY_BUSCAR_USUARIO = 'SELECT `id_usuario`, `nombre_usuario`, `nombre`, `apellido`, `email` FROM `usuarios` WHERE `id_usuario` = ?';
                ejecutarQuery(conexion,QUERY_BUSCAR_USUARIO,[id_usuario])
                    .then(({status,resultados}) => {
                        // Si existe es unico y esta en la posición 0
                        
                        if (status === 200 && resultados[0]) {
                            // Si hay contenido para actualizar
                            if (data && (data.nombre || data.apellido || data.email || data.nombre_usuario)) {

                                const QUERY_ACTUALIZAR_USUARIO = 'UPDATE `usuarios` SET `nombre` = ? , `apellido` = ? , `email` = ? , `nombre_usuario` = ? WHERE `id_usuario` = ?';
                                nombre = data.nombre ? data.nombre : resultados[0].nombre;
                                apellido = data.apellido ? data.apellido : resultados[0].apellido;
                                email = data.email ? data.email : resultados[0].email;
                                nombre_usuario = data.nombre_usuario ? data.nombre_usuario : resultados[0].nombre_usuario;
                                // intento Actualizar
                                return ejecutarQuery(conexion, QUERY_ACTUALIZAR_USUARIO, [nombre, apellido, email, nombre_usuario, id_usuario])
                            } err(`Input incumpleto`);
                        } else err(`No Existe Usuario de ID ${id}`)
                    })
                    .then(({status,resultados}) => {
                        // Si actualizo (y hubo filas afectadas)
                        if (status === 200 && resultados.affectedRows>0) {
                            // Construyo el objeto Usuario y lo envio como respuesta

                            const usuario = {
                                id_usuario, 
                                nombre_usuario,
                                nombre,
                                apellido,
                                email
                            };
                            res({usuario});
                        // Si el valor del email que es unico ya existia en otro usuario
                        } else if (status === 300) err(`No se pudo Actualizar Usuario de ID ${id}, Email o Nombre de Usuario existentes`)
                        // Otro problema
                        else err(`No se pudo actualizar Usuario de ID ${id}`)
                    })
                    .catch((error) => err(`Problema al Actualizar Usuario de ID ${1}, ${error}`))
            } else err(`No es valido ID ${id}`)
        })
    },
    // Cambia el estado de un usuario
    cambiarStatus: function(conexion, id, status=-1) {
        //paso el ID a numero
        const id_usuario = parseInt(id);
        const status_code = status.toUpperCase() === "CONECTADO" || parseInt(status) === 1 ? 1 :
                            status.toUpperCase() === "DESCONECTADO" || parseInt(status) === -1 ? -1 :
                            0;

        return new Promise((res,err) => {
            // Si existe la Base de datos
            if (!conexion) err("No esta Conectado a una Base de Datos");
            // Si el ID es valido
            if (id_usuario > 0 && status_code) {
                // Busco si existe el usuario
                const QUERY_BUSCAR_USUARIO = 'SELECT `id_usuario`, `id_status` FROM `usuarios` WHERE `id_usuario` = ?';
                ejecutarQuery(conexion, QUERY_BUSCAR_USUARIO, [id_usuario])
                    .then(({resultados}) => {
                        // Si no hubo problemas con la busqueda
                        // El ID debe ser unico, resultados vuelve en array, me fijo si existe la primera posición sino esta vacio y no existe
                        if (resultados[0]) {
                            // Si existe actualizo
                            const QUERY_ACTUALIZAR_STATUS = 'UPDATE `usuarios` SET `id_status` = ? WHERE `id_usuario` = ?';
                            return ejecutarQuery(conexion, QUERY_ACTUALIZAR_STATUS,[status_code, id_usuario]);

                        } else err(`No existe Usuario con ID ${id}`)
                    })
                    .then(({status, resultados}) => {
                        // si salio todo bien y hubo cambios
                        if (status === 200 && resultados.affectedRows>0) {
                            res({usuario: { 
                                id_usuario, 
                                status: status_code === 1 ? "CONECTADO" : "DESCONECTADO"
                            }})
                        // si hubo otro codigo de status
                        } else err(`No se pudo cambiar status`)
                    })
                    .catch(({mensaje}) => err(`No se pudo cambiar status, ${mensaje}`))
            } else err(`No es valido ID = ${id} para Buscar`)
        })

    }
}