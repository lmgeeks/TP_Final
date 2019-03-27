const url = require('url');
const fs = require('fs');
const router_usuario = require('./router_usuario');
const router_mensaje = require('./router_mensaje');

function getContentType (extension) {
    switch (extension) {
        // JSON Archivo
        case '.json' : return ('application/json');
        // Script - Javascript
        case '.js' : return ('application/javascript');
        // CSS Estilo
        case '.css' : return ('text/css');
        // Icono
        case '.ico' : return ('image/x-icon');
        // Imagenes
        case '.jpg' : 
        case '.jpeg' : return ('image/jpeg');
        case '.png' : return ('image/png');
        case '.svg' : return ('image/svg');
        case '.gif' : return ('image/gif');
        // Texto
        case '.txt' : return ('text/plain');
        // HTML 
        case '.htm' : 
        case '.html' : 
        default : return ('text/html'); 
    }
}

module.exports = async (req,res) => {
    const {pathname} = url.parse(req.url,true);
    
    switch(pathname) {
        // Conectar con el Servidor de Usuarios
        case '/usuario':
            router_usuario(req,res);
            break;
        // Conectar con el Servidor de Mensajes
        case '/mensaje':
            router_mensaje(req,res)
            break;
        // Pagina Principal
        case '/':
            res.writeHeader(200, "OK", {"Content-Type":"text/html"} );
            fs.createReadStream(`${__dirname}/public/index.html`).pipe(res);
            break;
        // Cualquier otro tipo de archivo pedido
        default:
            // Me fijo si tiene extensión
            const paths = pathname.split('.');
            let extension = "html";
            let path = "/";
            if (paths.length>1) {
                // si tiene y es "js" JAVASCRIPT
                if (paths[paths.length-1] === 'js')  
                    path= `/src${pathname}`; // busco en el directorio ./api_web/src/
                else 
                    path= `/public${pathname}`; // si es otro busco en el directorio ./api_web/public/
                extension = paths[paths.length-1];
            } else // Si no tiene extensión, presupongo que busca un documento HTML y lo busco en ./api_web/public
                path= `/public${pathname}.html`;
            // Intento conectar con el archivo (o página) solicitada, si existe
            const solicitud = fs.createReadStream(`${__dirname}${path}`);
            // res.writeHeader(200, "OK", {"Content-Type":"text/html"} );
            // Si hay error
            solicitud.on('error', (err) => {
                console.error(err.message);
                res.statusCode= 404;
                res.setHeader("Content-Type","text/plain");
                res.end("NO ENCONTRADO");
            });
            res.statusCode = 200;
            res.statusMessage = "OK"
            res.setHeader("Content-Type",getContentType(extension));
            solicitud.pipe(res);
            
    }

}