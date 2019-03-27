# PROYECTO FIZZMOD 

<img src="https://cdn.glitch.com/30785e1c-ac70-40b7-bcb2-f16d91310f8d%2FFizzmod-full.png?1551191713510">

<img src="https://cdn.glitch.com/30785e1c-ac70-40b7-bcb2-f16d91310f8d%2FEducaci%C3%B3nIT.png?1551191713104">

Vamos a crear una aplicación de chat en tiempo real a través del protocolo **WebSocket** con acceso a base de datos *MySQL* utilizando dos servidores como **microservicios** y uno adicional como acceso a cada servicio por solicitud HTTP todos escritos en *Node.js*. Para ello vamos a necesitar :

* Un servidor en *Node.js* que se conecte a una base de datos *mysql* la cual tendrá como entidades :
  * usuarios
  * status_usuarios    

* Un servidor en *Node.js* que se conecte a una base de datos *mysql* la cual tendrá como entidades :
  * mensajes
  * status_mensajes

* Un servidor en *Node.js* que use **Requests de HTTP** para conectarse con los servicios de **API REST** de los dos servidores anteriores y genere dos servidores :
  * **HTTP** : Para servir archivos estáticos por HTTP como servidor web
  * **WebSocket** : Para establecer conexiones con clientes que hayan entrado al servicio de mensajería de chat instantáneo 
  
- - - -

## DESCRIPCIÓN DE LAS TABLAS

Cada tabla tiene que contar con como mínimo las siguientes columnas : 

1. **Usuarios**

  
  | Id_usuario | Nombre | Apellido | Nombre_de_usuario | Email | Creado_en | Actualizado_en | Id_status |
  | -- | -- | -- | -- | -- | -- | -- | -- |

> Id_status:  (Se tiene que poder guardar el id de un status de usuario válido de la tabla status_usuarios)

2. **Status_usuarios**

| Id_status | Descripcion |
| -- | -- |

3. **Mensajes**

| Id_mensaje | Cuerpo | Creado_en | Actualizado_en | Id_usuario | Id_status |
| -- | -- | -- | -- | -- | -- |

> Id_usuario (Se tiene que poder guardar el id de un usuario válido de la tabla usuarios)

> Id_status (Se tiene que poder guardar el id de un status de mensaje válido de la tabla status_mensajes)

4. **Status_mensajes**

| Id_status | Descripcion |
| -- | -- |

- - - -

## DESCRIPCIÓN DEL SERVIDOR WEB

* El servidor web servirá entonces como proxy de entrada de cada usuario a nuestra aplicación. Cuando un cliente ingrese a nuestro dominio, el mismo tendrá que servir un archivo HTML que contenga como mínimo un formulario para completar los datos de ingreso de dicho usuario. 

* El formulario tendrá que ser capaz de capturar los datos de ingreso del usuario y transmitirlos al servidor web por medio de AJAX , WebSocket o solicitud normal de HTTP (a elección) 

* El servidor web se encargará de recuperar los datos de ingreso del formulario y hacer la solicitud HTTP correspondiente al servidor que esté actualmente alojando la API REST de la tabla de Usuarios para poder guardar la información en base de datos

* El servidor web tendrá que ser capaz de saber si la solicitud fue exitosa o no, para poder responderle al cliente con el código correcto de status HTTP

* El cliente tendrá que poder (A elección) : 
  * mostrar un mensaje de acuerdo a la respuesta recibida por el servidor 
  * redireccionar al usuario a la nueva URL donde se encuentre el servicio de chat instantáneo 
  * realizar un pedido por AJAX para recuperar el nuevo HTML del servicio de chat instantáneo

* El HTML que contenga el servicio de chat deberá mostrar un formulario con un input o textarea para ingresar los mensajes junto con un botón para dar la instrucción de envío, una lista ordenada o desordenada para mostrar los mensajes a medida que se van enviando al servidor web y una lista ordenada o desordenada para mostrar el listado de usuarios registrados en la base de datos junto con un indicador de su estado actual en el servicio, es decir “conectados” o “desconectados”

* El formulario que se encargue del sistema de chat deberá poder capturar la información de su control (input o textarea) y transmitirla a través de WebSocket al servidor web. 

* El servidor de WebSocket deberá contener un evento responsable de la recepción de información enviada por el cliente y poder transmitir esta información al servidor encargado de la API REST que contenga la base de datos de Mensajes para poder almacenar cada mensaje y poder recuperarlos todos en caso de reconexión al sistema 

* El servidor de WebSocket deberá ser capaz de validar si el mensaje fue exitosamente guardado y transmitir a todos los demás sockets conectados al servidor dicho mensaje 

* El cliente conectado por WebSocket deberá contener un evento responsable de la recepción de información enviada por el servidor y poder escribir dicho mensaje en la lista de mensajes

* El servidor de WebSocket deberá ser capaz de detectar cuando un socket se desconecta, para así notificarle al cliente su estado actual y reflejar esta información en. Navegador 

* El formulario de registro deberá poder, además de registrar un usuario nuevo, editar el usuario registrado, es decir el que se encuentra conectado en ese momento a la aplicación, capturar los datos y enviarlos al servidor Web para posterior proceso en la base de datos correspondiente 

- - - -