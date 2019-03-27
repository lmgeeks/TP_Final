// Ejecutar Queries con Promesas
/*
*
*   @conexion   MySQL Instancia
*   @query      String con el Query a ejecutar
*   @params     Array con los valores de los parametors, default vacio
*
*   @return PROMISE con
*       -STATUS (200- Bien, 300- Objeto Repetido, 500- Error) -> RESOLVE Y REJECT
*       -MENSAJE -> RESOLVE Y REJECT
*       -RESULTADOS (el Objeto del resultado del Query, Array en Select, Como afecto a la DB en los otros casos) -> Solo RESOLVE
*/
function ejecutarQuery( conexion, query, params=[] ) {
    return new Promise((res,err)=> {
        
        conexion.query(query,params,(error,resultados) => {
            if (error && error.message.includes('ER_DUP_ENTRY')) {
                res({
                    status: 300,
                    mensaje: "Entrada Existente",
                    conexion
                })
            } else if (error) {
                err({
                    status: 500,
                    mensaje: error.message
                });
            } else {
                res({
                    status: 200,
                    mensaje: `Ejecutado`,
                    conexion,
                    resultados
                })
            }
        })
    })
}

module.exports = ejecutarQuery;