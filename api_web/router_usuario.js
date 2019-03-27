const url = require('url');
const fetch = require('node-fetch');
const body_parser = require('../body_parser');

const user_url = 'http://localhost:8080';

module.exports = async (req, res) => {
    const {query} = url.parse(req.url,true);
    const {method} = req;

    let response = { error: null, data: null};
    let info_raw;

        switch(method) {
            case 'GET':
                if (query.id) {
                    try {
                        info_raw = await fetch(`${user_url}?id=${query.id}`);
                        response = await info_raw.json();
                    } catch(err) {
                        response.error = err.message;
                    }

                } else if (Object.keys(query).length === 0) {
                    try {
                        info_raw = await fetch(user_url);
                        response = await info_raw.json(); 
                    } catch(err) {
                        response.error = err.message;
                    }

                } else response.error = `Error No existe endpoint`;
                break;
            case 'POST':
                if (Object.keys(query).length === 0) {
                    try {
                        const nuevo_usuario = await body_parser(req);
                        info_raw = await fetch(user_url,{ 
                            method: 'POST', 
                            body: JSON.stringify(nuevo_usuario), 
                            headers:{
                            'Content-Type': 'application/json'
                          }});
                        response = await info_raw.json(); 
                    } catch(err) {
                        response.error = err.message;
                    }
                } else response.error = `Error No existe endpoint`;
                break;
            case 'PUT':
            case 'PATCH':
                if (query.id && query.status) {
                    try {    
                        info_raw = await fetch(`${user_url}?id=${query.id}&status=${query.status}`,{ method: 'PATCH'});
                        response = await info_raw.json(); 
                    } catch(err) {
                        response.error = err.message;
                    }
                } else if (query.id) {
                    try {
                        const nuevo_usuario = await body_parser(req);
                        info_raw = await fetch(`${user_url}?id=${query.id}`,{ 
                            method: 'PATH', 
                            body: JSON.stringify(nuevo_usuario), 
                            headers:{
                            'Content-Type': 'application/json'
                          }});
                        response = await info_raw.json(); 
                    } catch (err) {
                        response.error = `Error al actualizar Usuario de ID ${query.id} : ${err}`;
                    }
                } else response.error = `Error No existe endpoint`;
                break;
            default:
                response.error = `Error No existe endpoint`;
        }

    res.writeHeader(response.error ? 404 : 200, response.error ? "Not Found" : "OK", {"Content-Type":"application/json"} );
    res.end(JSON.stringify(response));
}