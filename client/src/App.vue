<template>
  <div>
    <menu type="contex" id="menu">
      <ul class="side-nav">
        <li>
          <div class="user-view">
            <img src="http://www.motsandco.com/wp-content/uploads/avatar-1-300x300.png"/>
            <span>User</span>
          </div>
        </li>
      </ul>
    </menu>
    <section id="page">
        <header id="header">
          <ul id="dropdown1" class="dropdown-content">
            <li><a href="">Opção 1</a></li>
            <li><a href="">Opção 1</a></li>
          </ul>
          <nav class="row light-blue">
            <div class="nav-wrapper col s12">
              <a href="" class="brand-logo hide-on-med-and-down">FireLabs Email Marketing</a>
              <a href="" class="brand-logo hide-on-large-only">FEM</a>
              <ul id="nav-mobile" class="right">
                <li>
                  <a href="" class="dropdown-button" data-activates="dropdown1">
                    <i class="material-icons black-text">notications_active</i>
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </header>
        <main id="content">
          <section class="row">
            <div class="col s12">
              <router-view></router-view>
            </div>
          </section>
        </main>
        <footer id="footer" class="row grey lighten-3">
          <div class="col s12">
            <small>By Firelabs</small>
          </div>
        </footer>
    </section>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
@import 'https://fonts.googleapis.com/icon?family=material+icons';

body {
  background-color: #fafafa !important;
}  

#page {
  display: flex;
  min-height: 100%;
  flex-direction: column;
}

#footer{
  width: 100%;
  margin-bottom:0!important;
  position:fixed;
  bottom: 0;
}

main{
  flex: 1 0 auto;
}

#menu {
  text-align: center;
  padding: 0;
  margin: 0;
}

#menu .user-view .material-icons {
  display: block;
  font-size: 60px;
}

#menu .side-nav, #menu .side-nav li>a>i.material-icons {
  text-align: center;
  color: inherit;
}

</style>