<template>
  <div class='content'>
    <div class='container'>
      <form ref='form' class='form'>
        <div class='form-item'>
          <div class='form-item__label'>
            <label>Email</label>
            <p>用户的 Gitlab 邮箱账号</p>
          </div>
          <div class='form-item__body'>
            <input v-model='form.email' />
          </div>
        </div>
        <div class='form-item'>
          <div class='form-item__label'>
            <label>SSH Key</label>
            <p>生成 Ssh key，用于 Gitlab 中用户认证</p>
          </div>
          <div class='form-item__body'>
            <button @click='handleGenerate'>生成 ssh key</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'logwire-development-git',
  data () {
    return {
      form: {
        email: 'wongyaqi@greaconsulting.com'
      }
    }
  },
  mounted () {
    this.$refs.form.addEventListener('submit', evt => {
      evt.preventDefault();
    })
  },
  methods: {
    handleGenerate () {
      axios.get('/api/git/generateSsh', { email: this.gitEmail })
    }
  }
}
</script>

<style scoped>
.content{
  background-color: #EFEFEF;
  overflow: hidden;
  height: 100%;
  padding: 24px;
}
</style>