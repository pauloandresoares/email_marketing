
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