// Modulos
const server_web = require('http').createServer(manejarServerWeb);
const io = require('socket.io')(server_web);
const router = require('./api_web/router');
const {server_host, server_web_port, getFecha} = require('./opciones');

// Crear Server
function manejarServerWeb (req,res) {
    const fecha = getFecha();
    console.log(`[WEB] Proxy | ${fecha.dia} | ${fecha.hora} | HTTP/${req.httpVersion} | ${req.method} | '${req.url}' `);
    router(req,res);
};

// Conectar Server y ponerlo a "escuchar"
server_web.listen(server_web_port, server_host, () => {
    const fecha = getFecha();
    console.log(`[WEB] Server Proxy | ${fecha.dia} | ${fecha.hora} | Conectado en http://${server_host}:${server_web_port} *`)
})

// Websockets

io.on('connection', function(socket){
    const fecha = getFecha();
    // Log un cliente entra pero no esta logeado
    console.log(`[WEB] SOCKET | ${fecha.dia} | ${fecha.hora}  | Un cliente entro`);

    // Cuando se logea
    socket.on('entra_usuario', ({status, payload}) => {
        if (status === 200) {
            console.log(`[WEB] SOCKET | ${fecha.dia} | ${fecha.hora}  | Usuario ${payload.id_usuario} se conecto`);
            // aviso a los clientes que refresquen su listado de usuarios
            socket.broadcast.emit('nuevo_usuario',{status: 200, payload: {usuarios: true}});
        }
    })

    // cuando mandan un mensaje
    socket.on('manda_mensaje', ({status, payload}) => {
        if (status === 200) {
            console.log(`[WEB] SOCKET | ${fecha.dia} | ${fecha.hora}  | Usuario ${payload.id_usuario} manda un mensaje`);
            // aviso a los clientes que refresquen los mensajes
            socket.broadcast.emit('nuevo_mensaje',{status: 200, payload: {mensajes: true}});
        }
    })
    // cuando se desconecta alguien
    socket.on('disconnect', function(){
        console.log(`[WEB] SOCKET | ${fecha.dia} | ${fecha.hora}  | Un usuario se desconecto`);
        // aviso a los clientes que refresquen su listado de usuarios
        socket.broadcast.emit('nuevo_usuario',{status: 200, payload: {usuarios: true}});
      });
  });

  
