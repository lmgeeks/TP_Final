const url = require('url');
const fetch = require('node-fetch');
const body_parser = require('../body_parser');

const user_url = 'http://localhost:8080';
const mess_url = 'http://localhost:9090';

module.exports = async (req,res) => {
    const {query} = url.parse(req.url,true);
    const {method} = req;

    let response = { error: null, data: null};
    let info_raw;

        switch(method) {
            case 'GET':
                if (query.id) {
                    try {
                        info_raw = await fetch(`${mess_url}?id=${query.id}`);
                        response = await info_raw.json();
                    } catch(err) {
                        response.error = err.message;
                    }
                } else if (query.dia && query.hora) {
                    try {
                        info_raw = await fetch(`${mess_url}?dia=${query.dia}&hora=${query.hora}`);
                        response = await info_raw.json(); 
                    } catch(err) {
                        response.error = err.message;
                    }
                } else if (Object.keys(query).length === 0) {
                    try {
                        info_raw = await fetch(mess_url);
                        response = await info_raw.json();
                    } catch(err) {
                        response.error = err.message;
                    }
                } else response.error = `Error No existe endpoint`;
                break;
            case 'POST':
                if (Object.keys(query).length === 0) {
                    try {
                        const nuevo_mensaje = await body_parser(req);
                        info_raw = await fetch(mess_url,{ 
                            method: 'POST', 
                            body: JSON.stringify(nuevo_mensaje), 
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
                if (query.id) {
                    try {
                        info_raw = await fetch(`${mess_url}?id=${query.id}`,{ method: 'PATCH'});
                        response = await info_raw.json(); 
                    } catch(err) {
                        response.error = err.message;
                    }   
                } else response.error = `Error No existe endpoint`;
                break;
            default:
                response.error = `Error No existe endpoint`;
        }
    res.writeHeader(response.error ? 404 : 200, response.error ? "Not Found" : "OK", {"Content-Type":"application/json"} );
    res.end(JSON.stringify(response));
}