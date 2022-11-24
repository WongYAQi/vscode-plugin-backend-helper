"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const session = require("express-session");
const fs_1 = require("fs");
const path = require("path");
const docker_1 = require("./docker");
const postgres_1 = require("./postgres");
const utils_1 = require("./utils");
var app = express();
// middleware to test if authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user)
        next();
    else
        next('route');
}
// API.1 接收用户输入的用户名并存在 session
app.use(session({
    secret: 'vscode-plugin-backend-helper',
    resave: false,
    saveUninitialized: true
}));
app.use(express.json());
app.post('/api/login', function (req, res) {
    req.session.regenerate(function (err) {
        if (err) {
            res.send(500);
            return;
        }
        req.session.user = req.body.username;
        req.session.save(function (err) {
            if (err) {
                res.sendStatus(500);
            }
            else {
                (0, fs_1.writeFileSync)(path.resolve(__dirname, './database/' + req.body.username + '.json'), '');
                res.sendStatus(200);
            }
        });
    });
});
// API.2 获取当前 username 的信息, 包括：服务运行状态
app.get('/api/getProjectInfo', isAuthenticated, function (req, res) {
});
// API.3 初始化项目, 将异常打印到前端
app.post('/api/installProject', /** isAuthenticated,*/ async function (req, res) {
    try {
        let docker = (0, docker_1.createDockerFactory)();
        let username = req.session.user || '1234';
        let host = '192.168.0.190';
        // 创建 node 容器
        let container = await docker.checkAndCreateContainer({ name: username + '.node', img: 'node:16', expose: { '8080/tcp': {} }, port: { '8080/tcp': [{ HostPort: '30000' }] } });
        await docker.startContainer({ container });
        console.log(await container.inspect());
        console.log('创建 node 容器完毕');
        // 检查并创建 postgres 容器
        let postgres = await docker.checkAndCreateContainer({ name: 'postgres', img: 'postgres:12', env: ["POSTGRES_PASSWORD=postgres"], port: { '5432/tcp': [{ HostPort: '30001' }] } });
        let info = await postgres.inspect();
        await docker.startContainer({ container: postgres });
        console.log(info.State.Status);
        if (info?.State.Status === 'created') {
            info = await postgres.inspect();
            console.log(info.State.Status);
            await (0, utils_1.sleep)(3000);
            let client = await (0, postgres_1.createPgClient)({ host: host, port: 30001 });
            await (0, postgres_1.executePgQuery)({ client, query: 'CREATE DATABASE logwirev2' });
            await (0, postgres_1.executePgQuery)({ client, query: 'CREATE SCHEMA library' });
            await client.end();
        }
        console.log('创建 postgres 容器完毕');
        // 检查并创建 redis 容器
        let redis = await docker.checkAndCreateContainer({ name: 'redis', img: 'redis', port: { '6379/tcp': [{ HostPort: '30002' }] } });
        await docker.startContainer({ container: redis });
        console.log('创建 redis 容器完毕');
        // 检查并创建 zookeeper 容器
        let zookeeper = await docker.checkAndCreateContainer({ name: 'zookeeper', img: 'zookeeper', port: { '2181/tcp': [{ HostPort: '30003' }] } });
        await docker.startContainer({ container: zookeeper });
        console.log('创建 zookeeper 容器完毕');
        let rockermqsrv = await docker.checkAndCreateContainer({ name: 'rocketmq.srv', img: 'foxiswho/rocketmq:4.8.0', port: { '9876/tcp': [{ 'HostPort': '9876' }] /** , '10909/tcp': [], '10911/tcp': [], '10912/tcp': []*/ }, env: ['JAVA_OPT_EXT=-Xms512M -Xmx512M -Xmn128m'], cmd: ['bash', '-c', 'mqnamesrv'] });
        await docker.startContainer({ container: rockermqsrv });
        console.log('创建 rocketmq serv 容器完毕');
        let rocketmqbroker = await docker.checkAndCreateContainer({ name: 'rocketmq.broker', img: 'foxiswho/rocketmq:4.8.0', port: { '10909/tcp': [{ 'HostPort': '10909' }], '10911/tcp': [{ 'HostPort': '10911' }] /** , '9876/tcp': [],'10912/tcp': [] */ }, env: ['JAVA_OPT_EXT=-Xms512M -Xmx512M -Xmn128m'] });
        await docker.startContainer({ container: rocketmqbroker });
        rocketmqbroker.inspect(async function (err, info) {
            if (!err && info?.State.Status === 'created') {
                let brokerText = (0, fs_1.readFileSync)(path.resolve(__dirname, './files/broker.conf'), { encoding: 'utf-8' });
                await docker.execContainerCommand({ container: rocketmqbroker, cmd: 'mkdir /home/rocketmq/conf -p' });
                await docker.execContainerCommand({ container: rocketmqbroker, cmd: 'touch /home/rocketmq/conf/broker.conf' });
                await docker.writeFile({ container: rocketmqbroker, path: '/home/rocketmq/conf/broker.conf', text: "'" + brokerText + "'" });
                await docker.execContainerCommand({ container: rocketmqbroker, cmd: 'mqbroker -c /home/rocketmq/conf/broker.conf' });
            }
        });
        console.log('创建 rocketmq broker 容器完毕');
        // 克隆后端仓库
        await docker.execContainerCommand({ container, cmd: ['git', 'config', '--global', 'core.sshCommand', 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no'] });
        await docker.execContainerCommand({ container, cmd: 'git clone ssh://git@gitlab.logwire.cn:13389/logwire2/logwire-backend.git', dir: '/var' });
        console.log('克隆仓库成功');
        // 更改源
        await docker.appendFile({ container, path: '/etc/apt/sources.list', text: '\'deb http://security.debian.org/debian-security stretch/updates main\'' });
        console.log('添加源成功');
        // 更新源
        await docker.execContainerCommand({ container, cmd: 'apt-get update' });
        console.log('更新源成功');
        // 安装 openjdk
        await docker.execContainerCommand({ container, cmd: 'apt-get install -y openjdk-8-jdk' });
        console.log('安装 openjdk 成功');
        // 安装 maven
        await docker.execContainerCommand({ container, cmd: 'apt-get install -y maven' });
        console.log('安装 maven 成功');
        // 移动 maven 的 setting.xml
        let mavenSettingXml = (0, fs_1.readFileSync)(path.resolve(__dirname, './files/settings.xml'), { encoding: 'utf-8' });
        await docker.writeFile({ container, path: '/etc/maven/settings.xml', text: '\'' + mavenSettingXml + '\'' });
        console.log('修改 maven 源成功');
        // 安装 code-server
        await docker.execContainerCommand({ container, cmd: 'apt-get install -y build-essential pkg-config python3' });
        await docker.execContainerCommand({ container, cmd: 'npm config set python python3' });
        await docker.execContainerCommand({ container, cmd: 'npm install --global code-server --unsafe-perm' });
        console.log('安装 code-server 成功');
        // 安装 nginx
        await docker.execContainerCommand({ container, cmd: 'apt-get install -y nginx' });
        console.log('安装 nginx 成功');
        await docker.execContainerCommand({ container, cmd: 'npm install --global pm2' });
        console.log('安装 pm2 成功');
        // 更新 nginx 配置文件信息
        let nginxConfigText = (0, fs_1.readFileSync)(path.resolve(__dirname, './files/nginx.conf'), { encoding: 'utf-8' });
        await docker.writeFile({ container, path: '/etc/nginx/nginx.conf', text: '\'' + nginxConfigText + '\'' });
        console.log('配置 nginx 成功');
        docker.execContainerCommand({ container, cmd: 'code-server --bind-addr 127.0.0.1:8000 --auth none' });
        console.log('启动 code-server 成功');
        await docker.execContainerCommand({ container, cmd: 'nginx' });
        console.log('启动 nginx 成功');
        res.sendStatus(200);
    }
    catch (err) {
        console.error(err);
        if (err.exitcode) {
            if (err.exitcode === 128) {
                res.status(500).send('请生成 SSH key 并放置到 Gitlan 中');
            }
            else {
                res.status(500).send(err);
            }
        }
        else {
            res.status(500).send(err);
        }
    }
});
// API.4 运行项目
app.post('/api/backend/compile', /** isAuthenticated, */ async function (req, res) {
    try {
        let docker = (0, docker_1.createDockerFactory)();
        let username = req.session.user || '1234';
        let container = await docker.checkAndCreateContainer({ name: username + '.node', img: 'node:16', port: { '8080/tcp': [{ HostPost: '30000' }] } });
        await docker.execContainerCommand({ container, cmd: 'bash build-release.sh --module=logwire', dir: '/var/logwire-backend' });
        await docker.execContainerCommand({ container, cmd: 'bash build-release.sh --module=assemble', dir: '/var/logwire-backend' });
        // 打包完成后，移动默认配置文件, 修改配置文件信息
        let gatewayText = (0, fs_1.readFileSync)(path.resolve(__dirname, './files/application-gateway.properties'), { encoding: 'utf-8' });
        await docker.writeFile({ container, path: '/var/logwire-backend/build-output/gateway/config/application-gateway.properties', text: '\'' + gatewayText + '\'' });
        let backendText = (0, fs_1.readFileSync)(path.resolve(__dirname, './files/application-server.properties'), { encoding: 'utf-8' });
        await docker.writeFile({ container, path: '/var/logwire-backend/build-output/backend/config/application-server.properties', text: '\'' + backendText.replace(/'/g, '"') + '\'' });
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
app.post('/api/backend/execute', /** isAuthenticated, */ async function (req, res) {
    try {
        let docker = (0, docker_1.createDockerFactory)();
        let username = req.session.user || '1234';
        let container = await docker.checkAndCreateContainer({ name: username + '.node', img: 'node:16', port: { '8080/tcp': [{ HostPost: '30000' }] } });
        try {
            await docker.execContainerCommand({ container, cmd: 'pm2 delete backend' });
            await docker.execContainerCommand({ container, cmd: 'pm2 delete gateway' });
        }
        catch (err) {
            console.log(err);
        }
        await docker.execContainerCommand({ container, cmd: 'pm2 start --name gateway --no-autorestart java -- -jar logwire-gateway-starter.jar -Xms128m -Xmx128m -XX:+UseG1GC', dir: '/var/logwire-backend/build-output/gateway' });
        await docker.execContainerCommand({ container, cmd: `pm2 start --name backend --no-autorestart java -- -jar logwire-backend-starter.jar -Xms128m -Xmx128m -XX:+UseG1GC`, dir: '/var/logwire-backend/build-output/backend' });
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
// API.5 停止项目
// API.6 生成并获取 Git 的 Ssh key
app.get('/api/git/generateSsh', /** isAuthenticated, */ async function (req, res) {
    try {
        let gitEmail = req.body.email;
        let docker = (0, docker_1.createDockerFactory)();
        let username = req.session.user || '1234';
        // 创建 node 容器
        let container = await docker.checkAndCreateContainer({ name: username + '.node', img: 'node:16' });
        await docker.startContainer({ container });
        await docker.execContainerCommand({ container, cmd: 'rm -rf /root/.ssh' });
        await docker.execContainerCommand({ container, cmd: `ssh-keygen -f /root/.ssh/id_rsa -t ed25519 -C "${gitEmail}"` });
        let sshKey = await docker.getFile({ container, path: '/root/.ssh/id_rsa.pub' });
        res.send(sshKey);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
// API.7 设置 GIT 相关信息
app.post('/api/git/setUserInfo', /** isAuthenticated, */ async function (req, res) {
    try {
        let gitUserEmail = req.body.email;
        let gitUserPass = req.body.password;
        let docker = (0, docker_1.createDockerFactory)();
        let username = req.session.user || '1234';
        // 创建 node 容器
        let container = await docker.checkAndCreateContainer({ name: username + '.node', img: 'node:16' });
        await docker.startContainer({ container });
        await docker.execContainerCommand({ container, cmd: `git config --global user.email "${gitUserEmail}"` });
        (0, utils_1.setUserConfig)(username, 'gitUserEmail', gitUserEmail);
        res.send(200);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
app.listen(3000);
