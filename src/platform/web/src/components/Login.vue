<template>
  <div class='login'>
    <div class='logo'>
      Welcome to Logwire Development
    </div>
    <div class='input'>
      <input v-model='username' placeholder="请输入用户名" />
    </div>
    <div class='button' @click='handleLogin'>
      登录
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'logwire-development-login',
  data () {
    return {
      username: ''
    }
  },
  methods: {
    handleLogin () {
      axios.post('/api/login', { username: this.username }).then(() => {
        this.$emit('login', this.username)
      })
    }
  }
}
</script>

<style scoped>
.login{
  height: 100%;
  background-color: #101010;
}
.logo{
  color: #ccc;
  font-size: 36px;
  padding-top: 30vh;
  margin-bottom: 50px;
}
.input{
  width: 363px;
  height: 32px;
  margin: 0 auto;
  margin-bottom: 68px;
}
.input input{
  background-color: #333333;
  border: 1xp solid #bbb;
  color: #fff;
  width: 100%;
  outline: none;
}
.button{
  width: 363px;
  height: 32px;
  line-height: 32px;
  font-size: 16px;
  color: #fff;
  background-color: #6C6C6C;
  border: 1px solid #BBBBBB;
  margin: 0 auto;
}
</style>