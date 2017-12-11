<template>
    <div class="row">
        <div class="col s6">
            <div class="card">
                <div class="card-content">
                    <span class="card-title">Autenticação</span>
                    <form @submit.prevent="doLogin()">
                        <div class="row">
                            <div class="input-field col s12">
                                <input id="email" type="email" v-model="login.username" class="validate"/>
                                <label for="email">Email</label>
                            </div>
                        </div>
                        <div class="row">
                            <div class="input-field col s12">
                                <input id="password" type="password" v-model="login.password" class="validate"/>
                                <label for="password">Senha</label>
                            </div>
                        </div>
                        <button class="btn">
                        Acessar <i class="material-icons right">send</i>
                        </button>
                    </form>
                    
                </div>
            </div>
        </div>

        <div class="col s6">
            <div class="card">
                <div class="card-content">
                    <span class="card-title">Registro</span>
                    <form @submit.prevent="doRegister()">
                        <div class="row">
                            <div class="input-field col s12">
                                <input id="name" type="text" v-model="register.name" class="validate"/>
                                <label for="name">Nome</label>
                            </div>
                        </div>
                        <div class="row">
                            <div class="input-field col s12">
                                <input id="email" type="email" v-model="register.email" class="validate"/>
                                <label for="email">Email</label>
                            </div>
                        </div>
                        <div class="row">
                            <div class="input-field col s12">
                                <input id="account_name" type="text" v-model="register.account_name" class="validate"/>
                                <label for="account_name">Tipo da conta</label>
                            </div>
                        </div>
                        <div class="row">
                            <div class="input-field col s12">
                                <input id="password_register" type="password" v-model="register.password" class="validate"/>
                                <label for="password_register">Senha</label>
                            </div>
                        </div>
                        <button class="btn">
                             Registrar-se <i class="material-icons right">send</i>
                        </button>
                    </form>
                    
                </div>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    data: function (){
        return {
            login: {},
            register: {}
        }
    },
    methods: {
        doLogin(){
            this.$store.dispatch('authentication', this.login).then(() => {
                this.$router.push({path: '/'})
            })
        },
        doRegister(){
            this.$store.dispatch('register', this.register).then(() => {
                this.$router.push({path: '/'})
            })
        }
    }
}
</script>