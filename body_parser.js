// Función para parsear objetos tipo JSON entrantes

module.exports = (req) => {
    return new Promise(function(res,err) {
        let buffer = [];
        req.on('data', data => {
            buffer.push(data);
        })
        req.on('end', () => {
            if (!buffer.length)
                res(null);
            else if (req.headers['content-type']==='application/json') {
                res(JSON.parse(Buffer.concat(buffer)));
                buffer = [];
            } else {
                res(Buffer.concat(buffer));
                buffer = [];
            }
            err('Error')
        })
    });
};