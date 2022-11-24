<template>
  <div class='content'>
    <div class='header container'>
      <div class='row'>
        <div class='avator' />
        <p>{{ username }}</p>
        <p>{{ status }}</p>
      </div>
      <div class='row'>
        <button v-if='status === "null"' @click='handleInstall'>初始化</button>
        <button v-else-if='status === "created"' @click='handleExecute'>运行</button>
        <button v-else-if='status === "running"' @click='handleStop'>停止</button>
      </div>
    </div>
    <div class='main'>
      <div class='tools container'>
        
      </div>
      <div class='logs container'>
      </div>
    </div>
    <input v-model='gitEmail' placeholder="git email" />
    <div>
      <button @click='handleSetGit'>提交Git Email</button>
    </div>
    <div>
      <button @click='handleGenerate'>生成 ssh key</button>
    </div>
    <div>
      <button @click='handleCompile'>编译</button>
      <button @click='handleExecute'>运行</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'logwire-development-home',
  props: {
    username: String
  },
  data () {
    return {
      status: 'null', // null | created | stoped | running | 
      gitEmail: 'wongyaqi@greaconsulting.com'
    }
  },
  methods: {
    handleInstall () {
      axios.post('/api/installProject')
    },
    handleCompile () {
      axios.post('/api/backend/compile')
    },
    handleSetGit () {
      axios.post('/api/git/setUserInfo', { email: this.gitEmail })
    },
    handleGenerate () {
      axios.get('/api/git/generateSsh', { email: this.gitEmail })
    },
    handleExecute () {
      axios.post('/api/backend/execute')
    }
  }
}
</script>

<style>

</style>