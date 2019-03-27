module.exports = {
    server_host : "localhost",
    server_web_port : 8000,
    server_api_usuarios_port : 8080,
    server_api_mensajes_port : 9090,
    server_websockets_port : 3000,
    database_mysql : {
        host     : 'localhost',
        port     : "3306",
        user     : 'root',
    //  password : 'AQUI PASSWORD'
        database : 'fizzmod'
      },
    getFecha : function () {
        return ({ 
            dia: new Date().toISOString().split('T')[0],
            hora: new Date().toISOString().split('T')[1].split('.')[0]
        })
    }
}