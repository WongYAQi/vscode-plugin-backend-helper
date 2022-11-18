<template>
  <div id="app">
    <logwire-development-login v-if='!username' @login='handleLogin' />
    <logwire-development-home v-else :username='username' />
  </div>
</template>

<script>
import Home from './components/Home.vue'
import Login from './components/Login.vue'
export default {
  name: 'App',
  components: {
    'logwire-development-home': Home,
    'logwire-development-login': Login
  },
  data () {
    return {
      username: ''
    }
  },
  methods: {
    handleLogin (username) {
      this.username = username
    }
  }
}
</script>

<style>
html, body{
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
}
</style>
