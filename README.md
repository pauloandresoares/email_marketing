# Sistema de email marketing da FireLabs.
## Projeto utilizado para teste das tecnologias Node.js, MongoDB e Vue.js

**1 - instalar o express, e criar o projeto**

Verificar versão
```sh
node --v
npm --v
```

```sh
npm install -g express-generator
express --version
```

Criar diretorio e projeto
```sh
mkdir email_marketing_node
cd email_marketing_node
express --ejs .
```

Instalar as dependencias

```sh
npm install
```
Testar se o site está funcionando
```sh
npm start
```
Acessar http://localhost:3000/

**2 - configurar o docker**

Criar o arquivo .dockerignore na raiz do projeto com a linha:
```
node_modules
```

Criar o arquivo docker-compose.yml com o seguinte código:
```yaml
version: "3"
services:
  node:
    image: "node:8.6.0"
    user: "node"
    working_dir: "/home/node/app"
    environment:
      - NODE_ENV=development
    volumes:
      -  ./:/home/node/app
    ports:
      - "3000:3000"
    command: "npm start"    
```	
Rodar o comando:
```sh
docker-compose up
```	

**3 - configurar o banco de dados**

Criar o arquivo /src/db/connection.js, e colocar o conteudo:

OBS: está mongo ao invês de localhost pq será o nome do serviço no docker, e ele reponderar por 'mongo'
```javascript
let mongoose = require('mongoose');
mongoose.connect('mongodb://mongo:27017/email_marketing',{ useMongoClient: true}, function(err){
    if(err){
        console.log('Mongoose error =>', err);
    }
    console.log('Mongoose ');
});

module.exports = mongoose;
```
Editar o arquivo app.js, acrescentando:
```javascript
let mongoose = require('./src/db/connection'); 
```

Instalar o mongoose
```sh
npm install --save mongoose
```

**4 - Configurar o mongodb no docker**

Adicionar no docker-compose o serviço:

```yaml
  mongo:
    image: "mongo:3.4.9"
    volumes:
      - /data/mongodb/db:/data/db
    ports:
      - "27017:27017"        
```


**5 - Criar o model**

Criar o seguinte o arquivo '/src/model/user.js' e colocar o conteúdo: 
```javascript
let mongoose = require('mongoose');

let User = mongoose.Schema({
    name: String,
    email: { type: String, unique: true},
    password: String,
    accounts:[{
        name: String,
        role: String,
        enabled: Boolean    
    }]
});

module.exports = mongoose.model('User', User);
```
Editar o arquivo routes/user.js colocando o seguinte conteudo
```javascript
let express = require('express');
let router = express.Router();
let User = require('../src/models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', function(req, res, next) {
  let data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    accounts:[{
      name: req.body.account_name,
      role: 'owner',
      ennabled: true,
    }]
  };

  let callback = function(err, user){
    if(err){
      return res.status(422).json({err: err});
    }
    return res.status(200).json({user: user});
  };

  User.create(data, callback);

});


module.exports = router;
```

Testar metodo de pesquisa, adicionar o arquivo /routes/user.js o seguinte código no lugar da rota '/'
```javascript
/* GET users listing. */
router.get('/me', function(req, res, next) {
  
  let callback = function(err, user){
    if(err){
      return res.status(500).json({err: err});
    }

    if(!user){
      return res.status(404).json({user: null});
    }

    return res.status(200).json({user: user});
  };

  // pegar o id antes do usuário para testar aqui
  User.findById('5a21f51e0f2b53000f30fca8', callback);

});
```


**6 - Instalar o nodemon, para que o processo do node se autorestart**

Instalar o nodemon

```sh
npm install --save nodemon@1.12.1
```

Editar o docker-compose.yml e substituir a linha command do node por:
```yaml
    command: "node_modules/.bin/nodemon -L --exec npm start"
```	
	
**7 - Instalar e configurar  o JWT e  passaport**

Instalar os pacotes
```sh
npm install --save passport passport-jwt jwt-simple
```
Criar os arquivos
```
src
 |_auth
	|_strategies
		|_jwt.js
	|_auth.js
```

Conteudo do 'jwt.js':
```javascript
let passport = require('passport');
let passportJwtStrategy = require('passport-jwt').Strategy;
let passportExtractJwt = require('passport-jwt').ExtractJwt;

let User = require('../../models/user');
let cfg = require('../../../config');

let params = {
    secretOrKey: cfg.jwrSecret,
    jwtFromRequest: passportExtractJwt.fromAuthHeaderAsBearerToken()
};

let strategy = new passportJwtStrategy(params, function(jwt_payload, done){
    let id = jwt_payload.id;
    let callback =  function(err, user){
        if(err){
            return done(err);
        }
        return done(null, user);
    };
    console.log('jwt');
    console.log(id);
    User.findById(id, callback);

});
passport.use(strategy);
module.exports = passport;
```


Conteudo do 'auth.js':
```javascript
let passport = require('passport');

require('./strategies/jwt');

module.exports = passport;
```


Criar na raiz do projeto /server o arquivo config.js, com o conteudo:
```javascript
module.exports = {
    jwrSecret: 'sdfsdvdew32432g!@3$55gs'
};
```

Rejustar o arquivo routes para ficar dessa forma:
```javascript
let express = require('express');
let router = express.Router();
let User = require('../src/models/user');
let cfg = require('./../config');
let jwt = require('jwt-simple');
let passport = require('../src/auth/auth');

router.post('/token', function(req, res, next){
  let user = req.body;
  if(!user.username || !user.password){
      return res.status(401).send('Unauthorized');
  }

  let query = {email: user.username, password: user.password};
  
  let callback = function(err, user){
    if(err){
      return res.status(500).json({err: err});
    }
    if(!user){
      return res.status(401).send('Unauthorized');
    }
    let payload = {id: user.id};
    let token = jwt.encode(payload, cfg.jwrSecret);
    return res.json({token: token});
  };
  user = User.findOne(query, callback);


});

/* GET users listing. */
router.get('/me', passport.authenticate('jwt', { session: false }), function(req, res, next) {
  ////5a21f51e0f2b53000f30fca8
  return res.status(200).json({
    user: req.user
  });
});

router.post('/register', function(req, res, next) {
  let data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    accounts:[{
      name: req.body.account_name,
      role: 'owner',
      enabled: true,
    }]
  };

  let callback = function(err, user){
    if(err){
      return res.status(422).json({err: err});
    }
    return res.status(200).json({user: user});
  };

  User.create(data, callback);

});

module.exports = router;
```


**8 - Aplicativo client**

Instalar o vue.js
```sh
npm install -g vue-cli
```
Criar o projeto client
```sh
vue init pwa client	
```
Acessa o diretório
```sh
cd client
```
Instala as dependencias e executar para ver se funcionou
```sh
npm install
npm run dev
```

**9 - Configurando Materialize CSS e JQuery**

Dentro do diretorio 'client' executar o seguinte comando para instalar as dependencias:
```sh
npm install --save materialize-css jquery
```
Abrir o arquivo build/webpack.base.conf e fazer as seguintes modificações:

***9.1 - adicionar*** 
```javascript
const webpack = require('webpack')
```
***9.2 - modificar a linha do arquivo build/webpack.base.conf  resolve da seguinte forma:***
```javascript
   resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      'jquery': resolve('node_modules/jquery/dist/jquery')
    }
  },
```  
***9.3 adicionar logo abaixo do resolve do arquivo build/webpack.base.conf  a seguinte linha:***
```javascript
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.$': 'jquery',
      'window.jQuery': 'jquery'
    })
  ],
```   
No arquivo src/main.js adicionar as linhas:
```javascript
require('materialize-css')
import 'materialize-css/dist/css/materialize.min.css'
``` 


**10 - Estilização**

[link de exemplos de icones!](https://material.io/icons/)

Utilizar o seguinte template padrão no arquivo App.vue:

```html
<template>
  <div>
    <menu type="contex" id="menu">
      <ul class="side-nav">
        <li>
          <div class="user-view">
            <img src="http://www.motsandco.com/wp-content/uploads/avatar-1-300x300.png"  class="circle"/>
            <span>User</span>
          </div>
        </li>
        <li><a href=""><i class="material-icons">home</i></a></li>
        <li><a href=""><i class="material-icons">email</i></a></li>
        <li><a href=""><i class="material-icons">supervisor_account</i></a></li>
        <li><a href=""><i class="material-icons">lock</i></a></li>
        <li><a href=""><i class="material-icons">exit_to_app</i></a></li>
      </ul>
    </menu>
    <section id="page">
      <header id="header">
        <ul id="dropdown1" class="dropdown-content">
          <li><a href="">temos 2 novos leads</a></li>
          <li><a href="">sua companha teve novos clicks</a></li>
        </ul>
        <nav class="row light-blue">
          <div class="nav-wrapper col s12">
            <a href="" class="brand-logo hide-on-med-and-down">Digital Marketing</a>
            <a href="" class="brand-logo hide-on-large-only">DM</a>
            <ul id="nav-mobile" class="right" >
              <li><a href="" class="dropdown-button" data-activates="dropdown1">
                <i class="material-icons black-text">notifications_active</i>
              </a></li>
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
import $ from 'jquery'
export default {
  name: 'app',
  mounted () {
    if($('.dropdown-button')){
      console.log($('.dropdown-button').dropdown({
      belowOrigin: true
    } ))
    }
      

    $('.dropdown-button').dropdown({
      belowOrigin: true
    })
  }
}
</script>

<style>
@import 'https://fonts.googleapis.com/icon?family=Material+Icons';
body {
  background-color: #fafafa !important;
}
#page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}
#footer {
  width: 100%;
  margin-bottom: 0;
}
main {
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
#menu .side-nav li>a>i.material-icons {
  float: none;
  display: inline-block;
  margin: 0;
  font-size: 30px;
}
#menu .side-nav li>a {
  border: 1px solid #424242;
  margin-right: 4px;
  margin-bottom: 4px;
  color: #9e9e9e;
}
#menu .side-nav li>a:hover {
  color: #757575;
  background-color: #000
}
#menu .side-nav {
  transform: translateX(0);
  width: 150px;
  background-color: #212121;
  color: #9e9e9e;
}
#menu + #page {
  margin-left: 150px;
}
#dropdown1 {
  width: 200px !important;
}
</style>
```


**11 - instalar e configurar o Axios**

Instalar 
```sh
npm install --save axios vuex
```
Criar o diretorio src/states
Criar o arquivo "index.js" dentro do diretorio src/states, com o seguinte conteúdo:
```javascript
import user from './modules/user'

window.axios = require('axios')
window.axios.defaults.baseURL = process.env.SERVER   
window.axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

let config = {
    modules: {
        user: user
    }
}

Vue.use(Vuex)
export default new Vuex.Store(config)
```
Criar o diretório src/states/modules com o arquivo user.js com o seguinte conteúdo:
```javascript
let qs = require('qs') //query build, faz interpretar como uma string de um header post vai converter {name: teste} para name=teste
export default {
    state: {
        token: window.localStorage.getItem('token')
    },
    mutations: {
        updateToken (state, data) {
            state.token = data
        }
    },
    actions: {
        authentication (context, user) {
            return window.axios.post('/users/token', qs.stringify(user)).then((response) => {
                context.commit('updateToken', response.data.token)
                window.localStorage.setItem('token',response.data.token)
                return response
            })
        },
        register (context, user) {
            return window.axios.post('/users/register', qs.stringify(user)).then((response) => {
                let authData = {
                    username: user.email,
                    password: user.password
                }
                return context.dispatch('authentication', authData)               
            })
        }
    }
}
```

Editar o arquivo config/dev.env.js para ficar da seguinte forma:
```javascript
'use strict'

const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  SERVER: '"http://localhost:3000"'

})
```

Editar o arquivo config/prod.env.js para ficar da seguinte forma:
```javascript
module.exports = {
  NODE_ENV: '"production"',
  SERVER: '"http://localhost:3000"'
}
```
Reconfigurar o src/main.js com o seguinte conteudo:
```javascript
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './states'

require('materialize-css')
import 'materialize-css/dist/css/materialize.min.css'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
  store
})
```

No arquivo /src/router/index.js, adicionar a linha:
```javascript
import store from '@/states'
```
**12 - Instalando o cors**

Voltar para o diretorio /server do projeto
Executar o compando npm
```sh
npm install --save cors
```
Abrir o arquivo app.js na raiz do diretório /server e adicionar a seguitne linha:
```sh
let cors = require('cors');
```
No mesmo arquivo app.js, abaixo da linha de código "var app = express();", adicionar a linha:
```javascript
app.use(cors());
```

**13 - Atualizar a estrutura de auteticação da aplciação server:**

No diretório src, criar os seguintes diretórios
```
src -
	|- controllers
	|- routers
	|- services
```  
	
No dirtório 'controllers', criar o arquivo 'auth.js':

```javascript
module.exports = function(app){
    return {
        token: (req, res) => {
            return res.json({page: 'auth@token'});
        },
        me: (req, res) => {
            return res.json({page: 'auth@me'});
        },
        register: (req, res) => {
            return res.json({page: 'auth@register'});
        }
    }
}
```
No diretório 'routers' criar os arquivos

***[auth.js]***
```javascript
module.exports = function(app){
    const controller = require('../controllers/auth')(app);

    app.get('/oauth/token', controller.token);
    app.get('/oauth/me', controller.me);
    app.get('/oauth/register', controller.register);
}
```
	
***[index.js]***
```javascript
const passport = require('../auth/auth');

let auth = require('./auth');
let lists = require('./lists');
let campaigns = require('./campaigns');
let leads = require('./leads');

module.exports = (app) => {

    /* GET home page. */
    app.get('/', function(req, res) {
        res.render('index', { title: 'Express' });
    });
    
    app.use('/api', passport.authenticate('jwt', {session: false}));

    auth(app);
    lists(app);
    campaigns(app);
    leads(app);
}
```


Modificar o arquivo 'app.js'
Primeiro removendo as linhas: 
```javascript
let index = require('./routes/index');
let users = require('./routes/users');
```
Segundo removendo as linhas:
```javascript
app.use('/', index);
app.use('/users', users);
```

Terceiro adicionar as linhas
```javascript
const routers = require('./src/routers')
```

```javascript
routers(app);
```

**14 - Estrutura de CRUD generico**

Criar o arquivo server/src/service/crud.js: 

```javascript
function CrudService (model){
    this.model = model;
}

CrudService.prototype.list = function () {
    return new Promise((resolve, reject) => {
        this.model.find(null, (err, result) => {
            return resolve({data: result});
        })
    })
}


CrudService.prototype.insert = function (data) {
    return new Promise((resolve, reject) => {
        this.model.create(data, (err, result)=> {
            if (err) {
                return reject({err: err});
            }     
            return resolve({data: result});
         });
    })
}

CrudService.prototype.get = function (id) {
    return new Promise((resolve, reject) => {
        this.model.findById(id, (err, result)=> {
            if (err) {
                return reject({err: err});
            }     
            return resolve({data: result});
         });
    })
}

CrudService.prototype.update = function (data) {
    return new Promise((resolve, reject) => {
        this.model.findByIdAndUpdate(id, {$set: data}, (err, result)=> {
            if (err) {
                return reject({err: err});
            }     
            return resolve({data: result});
         });
    })
}
CrudService.prototype.delete = function (id) {
    return new Promise((resolve, reject) => {
        this.model.findByIdAndRemove(id, (err, result)=> {
            if (err) {
                return reject({err: err});
            }     
            return resolve({data: result});
         });
    })
}

module.exports = CrudService;
```

Criar o arquivo server/src/controller/generic.js:
```javascript
function CrudService (model){
    this.model = model;
}

CrudService.prototype.list = function () {
    return new Promise((resolve, reject) => {
        this.model.find(null, (err, result) => {
            return resolve({data: result});
        })
    })
}


CrudService.prototype.insert = function (data) {
    return new Promise((resolve, reject) => {
        this.model.create(data, (err, result)=> {
            if (err) {
                return reject({err: err});
            }     
            return resolve({data: result});
         });
    })
}

CrudService.prototype.get = function (id) {
    return new Promise((resolve, reject) => {
        this.model.findById(id, (err, result)=> {
            if (err) {
                return reject({err: err});
            }     
            return resolve({data: result});
         });
    })
}

CrudService.prototype.update = function (data) {
    return new Promise((resolve, reject) => {
        this.model.findByIdAndUpdate(id, {$set: data}, (err, result)=> {
            if (err) {
                return reject({err: err});
            }     
            return resolve({data: result});
         });
    })
}
CrudService.prototype.delete = function (id) {
    return new Promise((resolve, reject) => {
        this.model.findByIdAndRemove(id, (err, result)=> {
            if (err) {
                return reject({err: err});
            }     
            return resolve({data: result});
         });
    })
}

module.exports = CrudService;
```


# ESTRUTURA PRONTA  - CRIAR UM CRUD BASICO
## SERVER
**1 - Criar modelo:**
Criar arquivo no diretório server/src/models, como o exemplo do user.js 
```javascript
let mongoose = require('mongoose');

let User = mongoose.Schema({
    name: String,
    email: { type: String, unique: true},
    password: String,
    accounts:[{
        name: String,
        role: String,
        enabled: Boolean    
    }]
});
module.exports = mongoose.model('User', User);
```
**2 - Criar controller:**
Criar controller no diretório server/src/controller, seguinto o exemplo do list.js, substituindo as referencias do 'list' para o objeto desejado
```javascript
const model = require('../models/list');
const CrudService  = require('../services/crud');
const GenericController  = require('./generic');
const service = new CrudService(model);

module.exports = function (app) {
    const controller = new GenericController(model);
    return controller;
}
```
**3 - Criar rotas:**

Criar rotas no diretório server/src/routers, seguinto o exemplo do lists.js, substituindo as referencias do 'list' para o objeto 
```javascript
let auth = require('./auth');

module.exports = function (app) {
    const controller = require('../controllers/lists')(app);
    
    app.get('/api/lists', controller.index);
    app.post('/api/lists', controller.add);
    app.get('/api/lists/:id', controller.view);
    app.put('/api/lists/:id', controller.edit);
    app.delete('/api/lists/:id', controller.delete);

}
```
## CLIENT

**1 - Criar modulo do VUE.JS**

Criar o arquivo do modulo no diretório: 'client/src/states/modules' ,como o exemplo do list: 
```javascript
export default {
    state: {
      lists: [],
      list: {}
    },
    mutations: {
      updateLists (state, data) {
        state.lists = data
      },
      updateList (state, data) {
        state.list = data
      }
    },
    actions: {
      getAllList (context) {
        return window.axios.get('/api/lists').then((response) => {
          context.commit('updateLists', response.data.data)
          return response
        })
      }
    }
  }
```
**2 - adicionar módulo no arquivo client/src/states/index.js, seguindo os exemplos**
```javascript
import Vue from 'vue'
import Vuex from 'vuex'

import user from './modules/user'
import email from './modules/email'
import list from './modules/list'
import lead from './modules/lead'

window.axios = require('axios')
window.axios.defaults.baseURL = process.env.SERVER
window.axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

let config = {
  modules: {
    user: user,
    email: email,
    list: list,
    lead: lead
  }
}

Vue.use(Vuex)
export default new Vuex.Store(config)
```
**3 - Criar componente no diretório: 'client/src/components/', seguindo os exemplo encontrados no diretório desse projeto**

**4 - Criar rota no arquivo client/src/router/index.js, e importar o componente criado seguindo os exemplos a seguir:**
```javascript
//----
import EmailList from '@/components/email/email-list'
import EmailNew from '@/components/email/email-new'
import EmailView from '@/components/email/email-view'
import EmailEdit from '@/components/email/email-edit'
import EmailRemove from '@/components/email/email-remove'

import ListsList from '@/components/lists/lists-list'
import ListsView from '@/components/lists/lists-view'
import Lead from '@/components/lists/lead'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello,
      meta: { requiresAuth: true }
    },
    {
      path: '/email',
      name: 'EmailList',
      component: EmailList,
      meta: { requiresAuth: true }
    },
//--
```

# DICAS VUE E EXPRESS

## Instalar o truncate no vue
```sh
npm install vue-truncate-filter --save
```
Adicionar o código no aruivo /client/src/main.js
```javascript
var VueTruncate = require('vue-truncate-filter')
Vue.use(VueTruncate)
```
Como usar o trucate
```vue
 {{ text | truncate(100) }}
```

## Instalar e utilizar o express validator 
Instalar:
```sh
npm install express-validator --save
```
Habilitar o componente, editando o arquivo server/app.js:
```javascript
const validator = require('express-validator')
app.use(validator)
```
Como utilizar:
```javascript
//...
module.exports = function (app) {
    const controller = new GenericController(model);

    controller.subscribe = async function (req, res) {
        req.checkBody('email', 'Enter a valid email').isEmail(); //faz a validação se é email valido
        req.checkBody('list', 'List is required').exists(); //faz a validação se está preenchido

        let errors = req.validationErrors();
        if (errors) {
            return res.status(422).json(errors); //lança o erro
        }

//...
```

