<template>
  <div id="app">
    <div class='sidebar' v-if='username'>
      <div class='logo' />
      <div class='item' @click='tab = "home"'>Home</div>
      <div class='item' @click='tab = "git"'>Git</div>
    </div>
    <div class='maintab'>
      <logwire-development-login v-if='!username' @login='handleLogin' />
      <logwire-development-home v-else-if='tab === "home"' :username='username' />
      <logwire-development-git v-else-if='tab === "git"' />
    </div>
  </div>
</template>

<script>
import Home from './components/Home.vue'
import Login from './components/Login.vue'
import Git from './components/Git.vue'
export default {
  name: 'App',
  components: {
    'logwire-development-home': Home,
    'logwire-development-login': Login,
    'logwire-development-git': Git
  },
  data () {
    return {
      username: '',
      tab: 'home', // home | git
    }
  },
  methods: {
    handleLogin (username) {
      this.username = username
    }
  }
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  display: flex;
}
#app .sidebar{
  width: 300px;
  background-color: #333;
  color: #fff;
}
#app .sidebar .logo{
  height: 150px;
}
#app .sidebar .item {
  height: 32px;
  line-height: 32px;
  font-size: 16px;
  text-align: center;
  cursor: pointer;
}
#app .sidebar .item:hover {
  background-color: #6C6C6C;
}
#app .maintab{
  flex: 1;
}
</style>
