import express = require("express");
import session = require('express-session')
import { createDockerFactory } from "./docker";
var app = express();


// middleware to test if authenticated
function isAuthenticated (req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.session.user) next()
  else next('route')
}

// API.1 接收用户输入的用户名并存在 session
app.use(session({
  secret: 'vscode-plugin-backend-helper',
  resave: false,
  saveUninitialized: true
}))
app.use(express.json())

app.post('/api/login', function (req, res) {
  req.session.regenerate(function (err) {
    if (err) {
      res.send(500)
      return
    }
    req.session.user = req.body.username
    req.session.save(function (err) {
      if (err) {
        res.sendStatus(500)
      } else {
        res.sendStatus(200)
      }
    })
  })
})

// API.2 获取当前 username 的信息, 包括：服务运行状态
app.get('/api/getProjectInfo', isAuthenticated, function (req, res) {

})
// API.3 初始化项目, 将异常打印到前端
app.post('/api/installProject', isAuthenticated, async function (req, res) {
  try {
    let docker = createDockerFactory()
    // 创建 node 容器
    let container = await docker.checkAndCreateContainer({name: req.session.user as string + '.node', img: 'node:16'})
    let data = await container.start()
    // 克隆后端仓库
    await docker.execContainerCommand({ container, cmd: 'git clone https://github.com/WongYAQi/vscode-plugin-backend-helper.git', dir: '/var' })
    // 更改源
    await docker.appendFile({ container, path: '/etc/apt/sources.list', text: 'deb http://security.debian.org/debian-security stretch/updates main' })
    // 安装 openjdk
    await docker.execContainerCommand({ container, cmd: 'apt-get install openjdk-8-jdk', dir: '' })
    // 安装 maven
    await docker.execContainerCommand({ container, cmd: 'apt-get install maven', dir: '' })
    // 移动 maven 的 setting.xml
    // 安装 code-server
    // 安装 nginx
    // 更新 nginx 配置文件信息

    // 检查并创建 postgress 容器
    // 检查并创建 redis 容器
    // 检查并创建 zookeeper 容器

    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
  }
})
// API.4 运行项目
// API.5 停止项目
// API.6 生成并获取 Git 的 Ssh key

app.listen(3000)