<template>
  <div class='content'>
    <div class='container'>
      <form class='form' ref='form'>
        <div class='form-item'>
          <div class='form-item__label'>
            <label>Postgres</label>
            <p>Postgres 数据库的配置信息</p>
          </div>
          <div class='form-item__body'>
            <button>修改</button>
            <button @click='handleSaveConfig("postgres")'>保存</button>
            <div><span>用户名</span><span><input v-model='form.postgres.username' /></span></div>
            <div><span>密码</span><span><input v-model='form.postgres.password' /></span></div>
            <div><span>服务 IP</span><span><input v-model='form.postgres.ip' /></span></div>
            <div><span>服务 PORT</span><span><input v-model='form.postgres.port' /></span></div>
          </div>
        </div>

        <div class='form-item'>
          <div class='form-item__label'>
            <label>Redis</label>
            <p>Redis 数据库的配置信息</p>
          </div>
          <div class='form-item__body'>
            <button>修改</button>
            <button @click='handleSaveConfig("redis")'>保存</button>
            <div><span>服务 IP</span><span><input v-model='form.redis.ip' /></span></div>
            <div><span>服务 PORT</span><span><input v-model='form.redis.port' /></span></div>
          </div>
        </div>

        <div class='form-item'>
          <div class='form-item__label'>
            <label>Zookeeper</label>
            <p>Zookeeper 的配置信息</p>
          </div>
          <div class='form-item__body'>
            <button>修改</button>
            <button @click='handleSaveConfig("zookeeper")'>保存</button>
            <div><span>服务 IP</span><span><input v-model='form.zookeeper.ip' /></span></div>
            <div><span>服务 PORT</span><span><input v-model='form.zookeeper.port' /></span></div>
          </div>
        </div>

        <div class='form-item'>
          <div class='form-item__label'>
            <label>租户</label>
            <p>租户 的配置信息</p>
          </div>
          <div class='form-item__body'>
            <button>修改</button>
            <button @click='handleSaveConfig("tenants")'>保存</button>
            <div><span>租户ID</span><span><input v-model='form.tenants.id' /></span></div>
            <div><span>租户HOST</span><span><input v-model='form.tenants.host' /></span></div>
            <div><span>租户数据库Schema</span><span><input v-model='form.tenants["database-schema"]' /></span></div>
            <div><span>租户主要Schema</span><span><input v-model='form.tenants["primary-schema"]' /></span></div>
          </div>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
/**
 * v2 的部分配置信息，
 * 1. 初始化之前完成配置，保存后会将配置信息写入到该用户的数据文件内，初始化时检查则不再安装容器
 * 2. 运行时修改配置，保存后会将配置信息写入到该用户的数据文件内，提示用户重启服务，启动服务时，会执行方法，将已有的配置文件和用户配置拼接
 * 3. 停止时修改配置，保存后会将配置信息写入到该用户的数据文件内，启动服务时，会执行方法，将已有的配置文件和用户配置拼接，如果没有已有的配置，则将统一配置拼接
 */
export default {
  name: 'logwire-development-v2',
  data () {
    return {
      form: {
        postgres: {
          visible: false,
          username: 'postgres',
          password: 'postgres',
          ip: '192.168.0.4',
          port: '25556',
          database: 'logwirev2',
          schema: 'library'
        },
        redis: {
          visible: false,
          ip: '192.168.0.4',
          port: '25557'
        },
        zookeeper: {
          visible: false,
          ip: '192.168.0.4',
          port: '2182'
        },
        rocketmq: {
          visible: false,
          ip: '192.168.0.4',
          port: '9876'
        },
        tenants: {
          visible: false,
          id: 'wongyaqi',
          host: 'a.test.com:23333,a.test.com:23334',
          'database-schema': 'library',
          'primary-namespace': 'library'
        }
      }
    }
  },
  created () {
    axios.get('/api/getProjectInfo').then(res => {
      Object.keys(this.form).forEach(key => {
        if (res.data[key]) {
          this.form[key] = res.data[key]
        }
      })
    })
  },
  mounted () {
    this.$refs.form.addEventListener('submit', evt => {
      evt.preventDefault();
    })
  },
  methods: {
    handleSaveConfig (key) {
      let data = this.form[key]
      axios.post('/api/config/setUserSetting', data, { params: { path: key } })
    }
  }
}
</script>

<style scoped>
.content{
  background-color: #EFEFEF;
  overflow: auto;
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
}
</style>