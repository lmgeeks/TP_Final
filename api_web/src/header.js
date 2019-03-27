const header = new Vue({
    el: "#Header",
    data: {
      id_usuario: null,
      nombre_usuario: "",
      menu: false,
      fizzmodLogo: "https://cdn.glitch.com/a519acdb-09ec-474c-8f97-89d4340a2a8d%2FFizzmod-full.png?1552071599393",
      educacionItLogo: "https://cdn.glitch.com/a519acdb-09ec-474c-8f97-89d4340a2a8d%2FEducaci%C3%B3nIT.png?1552071175645",
    },
    methods: {
      toggleMenu: function () {
        this.menu= !this.menu;
      },
      isLogin : function () {
        this.id_usuario= localStorage.getItem('id_usuario');
        this.nombre_usuario= localStorage.getItem('usuario');
      }
    },
    mounted: function (){
      this.isLogin();
    },
    beforeUpdate: function (){
      this.isLogin();
    },
    template: `
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <a href="http://fizzmod.com/" class="navbar-item" target="_blank">
            <img :src="fizzmodLogo" alt="Logo de Fizzmod">
          </a>
          <a class="navbar-item" href="https://www.educacionit.com/" target="_blank">
            <img :src="educacionItLogo" alt="Logo de EducaciónIT">
          </a>
          
          <!-- Boton para desplegar u ocultar en la versiones touch -->
          <span class="navbar-burger burger" @click="toggleMenu">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </div>
        <!-- Navegador -->
        <div class="navbar-menu" :class="{'is-active':menu}" >
          <div class="navbar-start">
            <a href="/" class="navbar-item">
              Inicio
            </a>
          </div>
          <div class="navbar-end">
            <span class="navbar-item" v-show="id_usuario">
              <span class="icon">
                <i class="fas fa-user"></i>
              </span>
              <span>{{ !id_usuario ? "Anonimo" : nombre_usuario }}</span>
            </span>
            <span class="navbar-item" v-if="!id_usuario">
              <a class="button is-success" href="/registro">
                <span class="icon">
                    <i class="fas fa-user-edit"></i>
                </span>
                <span>Registarse</span>
              </a>
            </span>
            <span class="navbar-item" v-if="id_usuario">
              <a class="button is-primary" href="/registro">
                <span class="icon">
                    <i class="fas fa-user-cog"></i>
                </span>
                <span>Perfil</span>
              </a>
            </span>
          </div>
        </div>
      </div>
    </nav>
    `
  });