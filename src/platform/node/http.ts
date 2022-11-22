import express = require("express");
import session = require('express-session')
import { readFile, readFileSync } from "fs";
import path = require("path");
import { createDockerFactory } from "./docker";
import { sleep } from "./utils";
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
app.post('/api/installProject', /** isAuthenticated,*/ async function (req, res) {
  try {
    let docker = createDockerFactory()
    let username = req.session.user as string || '1234'
    // 创建 node 容器
    let container = await docker.checkAndCreateContainer({name: username + '.node', img: 'node:16'})
    await docker.startContainer({ container })
    console.log('创建 node 容器完毕')
    // 检查并创建 postgres 容器
    let postgres = await docker.checkAndCreateContainer({ name: 'postgres', img: 'postgres:12', env: ["POSTGRES_PASSWORD=postgres"] })
    await docker.startContainer({ container: postgres })
    console.log('创建 postgres 容器完毕')
    // 检查并创建 redis 容器
    let redis = await docker.checkAndCreateContainer({ name: 'redis', img: 'redis' })
    await docker.startContainer({ container: redis })
    console.log('创建 redis 容器完毕')
    // 检查并创建 zookeeper 容器
    let zookeeper = await docker.checkAndCreateContainer({ name: 'zookeeper', img: 'zookeeper' })
    await docker.startContainer({ container: zookeeper })
    console.log('创建 zookeeper 容器完毕')

    // 克隆后端仓库
    await docker.execContainerCommand({ container, cmd: 'git clone https://github.com/WongYAQi/vscode-plugin-backend-helper.git', dir: '/var' })
    console.log('克隆仓库成功')
    // // 更改源
    await docker.appendFile({ container, path: '/etc/apt/sources.list', text: '\'deb http://security.debian.org/debian-security stretch/updates main\'' })
    console.log('添加源成功')
    // // 更新源
    await docker.execContainerCommand({ container, cmd: 'apt-get update' })
    console.log('更新源成功')
    // // 安装 openjdk
    await docker.execContainerCommand({ container, cmd: 'apt-get install -y openjdk-8-jdk' })
    console.log('安装 openjdk 成功')
    // // 安装 maven
    await docker.execContainerCommand({ container, cmd: 'apt-get install -y maven' })
    console.log('安装 maven 成功')
    // 移动 maven 的 setting.xml
    let mavenSettingXml = readFileSync(path.resolve(__dirname, './files/settings.xml'), { encoding: 'utf-8' })
    await docker.writeFile({ container, path: '/etc/maven/settings.xml', text: '\'' + mavenSettingXml + '\'' })
    console.log('修改 maven 源成功')
    // 安装 code-server
    await docker.execContainerCommand({ container, cmd: 'apt-get install -y build-essential pkg-config python3' })
    await docker.execContainerCommand({ container, cmd: 'npm config set python python3' })
    await docker.execContainerCommand({ container, cmd: 'npm install --global code-server --unsafe-perm' })
    console.log('安装 code-server 成功')
    // // 安装 nginx
    await docker.execContainerCommand({ container, cmd: 'apt-get install -y nginx'})
    console.log('安装 nginx 成功')
    // 更新 nginx 配置文件信息
    let nginxConfigText = readFileSync(path.resolve(__dirname, './files/nginx.conf'), { encoding: 'utf-8' })
    await docker.writeFile({ container, path: '/etc/nginx/nginx.conf', text: '\'' + nginxConfigText + '\'' })
    console.log('配置 nginx 成功')

    res.sendStatus(200)
  } catch (err: any) {
    console.error(err)
    res.status(500).send(err)
  }
})
// API.4 运行项目
app.post('/api/start', /** isAuthenticated, */ async function (req, res) {
  // 进入相应用户的容器内部，编译 java 代码，检测配置文件存在，运行java命令
  try {
    let docker = createDockerFactory()
    let username = req.session.user as string || '1234'
    let container = await docker.checkAndCreateContainer({name: username + '.node', img: 'node:16'})
    // await docker.execContainerCommand({ container, cmd: 'bash build-release.sh --module="logwire"', dir: '/var/vscode-plugin-backend-helper/logwire-backend' })
    // 使用 getArchive 和 putArchive 来修改配置文件信息
    // let readstream = await container.getArchive({ path: '/var/vscode-plugin-backend-helper/package.json' })
    // let text = ''
    // readstream.on('data', chunk => text = chunk.toString())
    // readstream.on('end', () => {
    //   res.send(text)
    // })
  } catch (err) {
    res.status(500).send(err)
  }
})
// API.5 停止项目
// API.6 生成并获取 Git 的 Ssh key

app.listen(3000)