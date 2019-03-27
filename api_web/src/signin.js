const Notificacion = {
    props: ['isActive','cerrar','message', 'isError'],
    template: `
    <div class="modal" :class="{'is-active':isActive}">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="notification content has-text-centered" :class="{'is-danger':isError, 'is-primary':!isError}">
          <button class="delete" @click="cerrar"></button>
          <span class="is-size-3">{{ isError ? "Ups.. Hubo un Error" : "Exito!!" }}</span>
          <p class="is-size-5">{{message}}</p>
          <span class="buttons is-centered">
              <a href="/" class="button is-light is-large">Ir a Inicio</a>
              <button @click="cerrar" class="button is-warning is-large">Quedarse</button>
          </span>
        </div>
      </div>
    </div>
    `
};

const SignInCard= new Vue({
    el: "#SignInCard",
    components : {
        Notificacion
    },
    data: {
      url : 'http://localhost:8000/usuario',
      cardImage: "https://cdn.glitch.com/a519acdb-09ec-474c-8f97-89d4340a2a8d%2FdesafioFizzmod.jpg?1552268149070",
      id_usuario: null,
      nombre: "",
      apellido: "",
      nombre_usuario: "",
      email: "",
      check_nombre: false,
      check_apellido: false,
      check_nombre_usuario: false,
      check_email: false,
      notificacion_activa: false,
      isError: false,
      notificacion_mensaje: ""
    },
    methods: {
      isNombre: function() {
        this.check_nombre= (0<this.nombre.length && this.nombre.length<51);
      },
      isApellido: function() {
        this.check_apellido= (0<this.apellido.length && this.apellido.length<51);
      },
      isEmail: function() {
        const reg_email = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
        this.check_email= (0<this.email.length && this.email.length<61) && reg_email.test(this.email);
      },
      isNombre_Usuario: function() {
        this.check_nombre_usuario= (0<this.nombre_usuario.length && this.nombre_usuario.length<51);
      },
      ingresar: async function (e) {
        e.preventDefault();
        const url = this.id_usuario ? `${this.url}?id=${this.id_usuario}` : `${this.url}`
        const nuevo_usuario={
            nombre: this.nombre,
            apellido: this.apellido,
            nombre_usuario: this.nombre_usuario,
            email: this.email
        }
        if (this.check_nombre && this.check_apellido && this.check_nombre_usuario && this.check_email) {
            const response = await fetch(`${url}`, {
                method: this.id_usuario ? 'PUT' : 'POST', 
                body: JSON.stringify(nuevo_usuario),
                headers: {
                    "Content-Type": "application/json",
                }});
            const {error, data} = await response.json();
            if (error) {
                this.isError = true;
                this.notificacion_mensaje = `Se intento ingresar al sistema pero hubo el siguiente error: ${error}`;
                this.activarNotificacion();
            } else {
                localStorage.setItem('id_usuario',data.usuario.id_usuario);
                localStorage.setItem('usuario',data.usuario.nombre_usuario);
                this.isError= false;
                this.notificacion_mensaje = `Bienvenido ${data.usuario.nombre} ${data.usuario.apellido}!!`;
                this.activarNotificacion();
            }
        } else {
            this.isError = true;
            this.notificacion_mensaje = "Tiene que Completar el Formulario";
            this.activarNotificacion();
        }
      },
      cancelar: function () {
        window.location.href = '/';
      },
      activarNotificacion: function () {
        this.notificacion_activa = !this.notificacion_activa;

      }
    },
    mounted: async function () {
        const id = localStorage.getItem('id_usuario');
        if (id) {
            const response = await fetch(`${this.url}?id=${id}`)
            const {error, data} = await response.json();
            if (error)
                alert(error)
            else {
                this.id_usuario = id;
                this.nombre = data.usuario.nombre;
                this.isNombre();
                this.apellido = data.usuario.apellido;
                this.isApellido();
                this.email = data.usuario.email;
                this.isEmail();
                this.nombre_usuario = data.usuario.nombre_usuario;
                this.isNombre_Usuario();
            }
        }
    },
    template : `
      <div class="columns is-centered">
        <div class="column is-half">
          <div class="card">
            <div class="card-image">
              <figure class="image is-4by3">
                <img :src="cardImage" alt="Card Image">
              </figure>
            </div>
            <div class="card-content">
              <div class="content">
                <form @submit="ingresar">
                  <div class="field">
                    <label class="label">Nombre de Usuario</label>
                    <div class="control has-icons-left">
                      <input class="input" :class='{"is-success":check_nombre_usuario, "is-danger":!check_nombre_usuario}' 
                             type="text" placeholder="Ingrese el Nombre de Usuario" 
                             v-model="nombre_usuario" 
                             @blur="isNombre_Usuario">
                      <span class="icon is-small is-left">
                        <i class="fas fa-users"></i>
                      </span>
                    </div>
                    <p class="help" :class='{"is-success":check_nombre_usuario, "is-danger":!check_nombre_usuario}'>
                        {{check_nombre_usuario ? "Correcto" : "Incorrecto"}}
                    </p>
                  </div>
                  <div class="field">
                    <label class="label">Nombre</label>
                    <div class="control has-icons-left">
                    <input class="input" :class='{"is-success":check_nombre, "is-danger":!check_nombre}' 
                            type="text" placeholder="Ingrese su Nombre" 
                            v-model="nombre" 
                            @blur="isNombre">
                      <span class="icon is-small is-left">
                        <i class="fas fa-user"></i>
                      </span>
                    </div>
                    <p class="help" :class='{"is-success":check_nombre, "is-danger":!check_nombre}'>
                        {{check_nombre ? "Correcto" : "Incorrecto"}}
                    </p>
                  </div>
                  <div class="field">
                    <label class="label">Apellido</label>
                    <div class="control has-icons-left">
                    <input class="input" :class='{"is-success":check_apellido, "is-danger":!check_apellido}' 
                            type="text" placeholder="Ingrese su Apellido" 
                            v-model="apellido" 
                            @blur="isApellido">
                      <span class="icon is-small is-left">
                        <i class="fas fa-user-tie"></i>
                      </span>
                    </div>
                    <p class="help" :class='{"is-success":check_apellido, "is-danger":!check_apellido}'>
                        {{check_apellido ? "Correcto" : "Incorrecto"}}
                    </p>
                  </div>
                  <div class="field">
                    <label class="label">Email</label>
                    <div class="control has-icons-left">
                    <input class="input" :class='{"is-success":check_email, "is-danger":!check_email}' 
                            type="text" placeholder="Ingrese su email" 
                            v-model="email" 
                            @blur="isEmail">
                      <span class="icon is-small is-left">
                        <i class="fas fa-at"></i>
                      </span>
                    </div>
                    <p class="help" :class='{"is-success":check_email, "is-danger":!check_email}'>
                        {{check_email ? "Correcto" : "Incorrecto"}}
                    </p>
                  </div>
                  <div class="field is-grouped">
                    <div class="control">
                      <button class="button is-success" type="submit">{{ id_usuario ? "Actualizar" : "Registrarse"}}</button>
                    </div>
                    <div class="control">
                      <button class="button is-text" @click="cancelar">Cancelar</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <Notificacion :isActive="notificacion_activa" :message="notificacion_mensaje" :isError="isError" :cerrar="activarNotificacion"/>
        </div>
      </div>
    `
  });