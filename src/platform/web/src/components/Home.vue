<template>
  <div class='content'>
    <div class='header container'>
      <div class='row'>
        <div class='avatar' />
        <p>{{ username }}</p>
        <p>{{ statusLabel }}</p>
      </div>
      <div class='row'>
        <button v-if='status === "null"' :disabled='loading' @click='handleInstall'>初始化</button>
        <button v-if='status !== "null"' :disabled='loading' @click='handleCompile'>编译</button>
        <button v-if='status === "created"' :disabled='loading' @click='handleExecute'>运行</button>
        <button v-else-if='status === "running"' :disabled='loading' @click='handleStop'>停止</button>
      </div>
    </div>
    <div class='main'>
      <div class='tools container'>
        <div class='row'>
          常用工具
        </div>
        <div class='row'>
          <div class='' @click='handleOpenVscode'>
            Vscode Web
          </div>
          <div class='' @click='handleOpenConsole'>
            Console Web
          </div>
        </div>
      </div>
      <div class='logs container'>
        <div class='row'>
          日志
        </div>
        <div class='row'>
          <div v-for='item in logs' :key='item'>
            {{ item }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { io } from 'socket.io-client'
export default {
  name: 'logwire-development-home',
  props: {
    username: String
  },
  data () {
    return {
      status: 'null', // null | created | stoped | running | 
      loading: false,
      logs: []
    }
  },
  computed: {
    statusLabel () {
      return this.status === 'null' ? "未初始化"
        : this.status === 'created' ? "已创建"
        : this.status === 'running' ? '运行中'
        : this.status === 'stopped' ? '已停止'
        : ''
    }
  },
  created () {
    this.socket = io({
      path: '/api/socket'
    });
    const removeLogPrefix = (log) => log.replace(/^\[.*?\]/, '')
    this.socket.on('Log', (log) => {
      if (log.startsWith('[Progress]')) {
        this.logs.unshift(removeLogPrefix(log))
      } else {
        this.logs.shift()
      }
      if (log.startsWith('[Log]')) {
        this.logs.unshift(removeLogPrefix(log))
      } else if (log.startsWith('[Error]')) {
        let err = removeLogPrefix(log)
        let errObj = JSON.parse(err)
        console.log(err)
        this.logs.unshift(errObj.logs)
      }
    })

    this.handleGetStatus()
  },
  methods: {
    handleGetStatus () {
      axios.get('/api/getProjectInfo').then(res => {
        this.status = res.data.status || 'null'
      })
    },
    handleInstall () {
      this.logs = []
      this.loading = true
      axios.post('/api/installProject').then(() => {
        this.handleGetStatus()
      }).then(() => {
        this.loading = false
      })
    },
    handleCompile () {
      this.loading = true
      axios.post('/api/backend/compile').then(() => {
        this.loading = false
      })
    },
    handleExecute () {
      this.loading = true
      axios.post('/api/backend/execute').then(() => {
        this.loading = false
      })
    },
    handleStop () {

    },
    handleOpenConsole () {
      window.open(window.location.protocol + '//' + window.location.hostname + ':30000/wetty', '_blank')
    },
    handleOpenVscode () {
      window.open(window.location.protocol + '//' + window.location.hostname + ':30000/?folder=/var', '_blank')
    }
  }
}
</script>

<style scoped>

.content .container .row {
  border-bottom: 1px solid #BBB;
  overflow: hidden;
}
.content .header.container .avatar {
  float: left;
  width: 56px;
  height: 56px;
  background-color: #ccc;
  border-radius: 50%;
}
.content > .main{
  display: flex;
}
.content > .main > .tools.container{
  width: 372px;
}
.content > .main > .logs{
  flex: 1;
}

</style>