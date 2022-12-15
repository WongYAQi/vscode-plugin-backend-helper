"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const fs_1 = require("fs");
const http_1 = require("http");
const path = require("path");
const socket_io_1 = require("socket.io");
const docker_1 = require("./docker");
const log_1 = __importStar(require("./log"));
const postgres_1 = require("./postgres");
const utils_1 = require("./utils");
var app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    path: '/api/socket'
});
io.on("connection", (socket) => {
    (0, log_1.setWebsocketIo)(socket);
    console.log('Websocket Server started');
});
// middleware to test if authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user)
        next();
    else
        next('route');
}
// API.1 接收用户输入的用户名并存在 session
app.use((0, express_session_1.default)({
    secret: 'vscode-plugin-backend-helper',
    resave: false,
    saveUninitialized: true
}));
app.use(express_1.default.json());
app.post('/api/login', function (req, res) {
    req.session.regenerate(function (err) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        req.session.user = req.body.username;
        req.session.save(function (err) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                // 当用户数据文件没有 node-port 时，认为该用户还没有注册过
                if ((0, utils_1.getUserConfig)(req.body.username, 'node-port') === undefined) {
                    let host = process.env['DOCKER_ENV']?.trim() === 'prod' ? '192.168.0.4' : 'localhost';
                    (0, utils_1.getAvailableNodePort)(host).then(port => {
                        const userDefaultSetting = require(path.resolve(__dirname, './files/default-user-setting.json'));
                        (0, fs_1.writeFileSync)(path.resolve(__dirname, './database/' + req.body.username + '.json'), JSON.stringify(Object.assign({}, userDefaultSetting, { "node-port": port }), null, 2));
                        return port;
                    }).then((port) => {
                        res.sendStatus(200);
                    }).catch(err => {
                        res.status(500).send(err);
                    });
                }
                else {
                    res.sendStatus(200);
                }
            }
        });
    });
});
// API.2 获取当前 username 的信息, 包括：服务运行状态
app.get('/api/getProjectInfo', isAuthenticated, function (req, res) {
    let username = req.session.user || '1234';
    let configs = (0, utils_1.getUserAllConfigs)(username);
    res.send(configs);
});
// API.3 初始化项目, 将异常打印到前端
app.post('/api/installProject', isAuthenticated, async function (req, res) {
    try {
        let docker = (0, docker_1.createDockerFactory)();
        let username = req.session.user || '1234';
        let host = process.env['DOCKER_ENV']?.trim() === 'prod' ? '192.168.0.4' : 'localhost';
        let port = (0, utils_1.getUserConfig)(username, 'node-port').toString();
        let container = {};
        await log_1.default.run(username, '创建 node 容器', async () => {
            container = await docker.checkAndCreateContainer({ name: username + '.node', img: 'node:16', expose: { '8080/tcp': {} }, port: { '8080/tcp': [{ HostPort: port }] } });
            console.log(container);
            await docker.startContainer({ container });
        });
        await log_1.default.run(username, '创建 postgres 容器', async () => {
            if ((0, utils_1.getUserConfig)(username, 'postgres.ip') !== '192.168.0.4') {
                let postgres = await docker.checkAndCreateContainer({ name: 'postgres', img: 'postgres:12', env: ["POSTGRES_PASSWORD=postgres"], port: { '5432/tcp': [{ HostPort: '30001' }] } });
                let info = await postgres.inspect();
                await docker.startContainer({ container: postgres });
                if (info?.State.Status === 'created') {
                    info = await postgres.inspect();
                    await (0, utils_1.sleep)(3000);
                    let client = await (0, postgres_1.createPgClient)({ host: host, port: 30001 });
                    await (0, postgres_1.executePgQuery)({ client, query: 'CREATE DATABASE logwirev2' });
                    await (0, postgres_1.executePgQuery)({ client, query: 'CREATE SCHEMA library' });
                    await client.end();
                }
            }
        });
        await log_1.default.run(username, '创建 redis 容器', async () => {
            if ((0, utils_1.getUserConfig)(username, 'redis.ip') !== '192.168.0.4') {
                let redis = await docker.checkAndCreateContainer({ name: 'redis', img: 'redis', port: { '6379/tcp': [{ HostPort: '30002' }] } });
                await docker.startContainer({ container: redis });
            }
        });
        await log_1.default.run(username, '创建 zookeeper 容器', async () => {
            if ((0, utils_1.getUserConfig)(username, 'zookeeper.ip') !== '192.168.0.4') {
                let zookeeper = await docker.checkAndCreateContainer({ name: 'zookeeper', img: 'zookeeper', port: { '2181/tcp': [{ HostPort: '30003' }] } });
                await docker.startContainer({ container: zookeeper });
            }
        });
        // 检查本机 rocketmq 端口是否被占用，被占用说明已经有 rockqtmq 服务启动，这时候就不安装容器了
        await log_1.default.run(username, '创建 rocketmq serv 容器', async () => {
            if ((0, utils_1.getUserConfig)(username, 'rocketmq.ip') !== '192.168.0.4') {
                let rockermqsrv = await docker.checkAndCreateContainer({ name: 'rocketmq.srv', img: 'foxiswho/rocketmq:4.8.0', port: { '9876/tcp': [{ 'HostPort': '9876' }] /** , '10909/tcp': [], '10911/tcp': [], '10912/tcp': []*/ }, env: ['JAVA_OPT_EXT=-Xms512M -Xmx512M -Xmn128m'], cmd: ['bash', '-c', 'mqnamesrv'] });
                await docker.startContainer({ container: rockermqsrv });
            }
        });
        await log_1.default.run(username, '创建 rocketmq broker 容器', async () => {
            if ((0, utils_1.getUserConfig)(username, 'rocketmq.ip') !== '192.168.0.4') {
                let rocketmqbroker = await docker.checkAndCreateContainer({ name: 'rocketmq.broker', img: 'foxiswho/rocketmq:4.8.0', port: { '10909/tcp': [{ 'HostPort': '10909' }], '10911/tcp': [{ 'HostPort': '10911' }] /** , '9876/tcp': [],'10912/tcp': [] */ }, env: ['JAVA_OPT_EXT=-Xms512M -Xmx512M -Xmn128m'] });
                await docker.startContainer({ container: rocketmqbroker });
                let info = await rocketmqbroker.inspect();
                if (info?.State.Status === 'created') {
                    let brokerText = (0, fs_1.readFileSync)(path.resolve(__dirname, './files/broker.conf'), { encoding: 'utf-8' });
                    await docker.execContainerCommand({ container: rocketmqbroker, cmd: 'mkdir /home/rocketmq/conf -p' });
                    await docker.execContainerCommand({ container: rocketmqbroker, cmd: 'touch /home/rocketmq/conf/broker.conf' });
                    await docker.writeFile({ container: rocketmqbroker, path: '/home/rocketmq/conf/broker.conf', text: "'" + brokerText + "'" });
                    await docker.execContainerCommand({ container: rocketmqbroker, cmd: 'mqbroker -c /home/rocketmq/conf/broker.conf' });
                }
            }
        });
        await log_1.default.run(username, '克隆仓库', async () => {
            await docker.execContainerCommand({ container, cmd: ['git', 'config', '--global', 'core.sshCommand', 'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no'] });
            await docker.execContainerCommand({ container, cmd: 'rm -rf /var/logwire-backend' });
            await docker.execContainerCommand({ container, cmd: 'git clone ssh://git@gitlab.logwire.cn:13389/logwire2/logwire-backend.git', dir: '/var' });
        });
        await log_1.default.run(username, '添加源', async () => {
            let txt = await docker.getFile({ container, path: '/etc/apt/sources.list' });
            if (txt && !txt.includes('deb http://security.debian.org/debian-security stretch/updates main')) {
                await docker.appendFile({ container, path: '/etc/apt/sources.list', text: '\'deb http://security.debian.org/debian-security stretch/updates main\'' });
            }
        });
        await log_1.default.run(username, '更新源', async () => {
            await docker.execContainerCommand({ container, cmd: 'apt-get update' });
        });
        await log_1.default.run(username, '安装 openjdk ', async () => {
            await docker.execContainerCommand({ container, cmd: 'apt-get install -y openjdk-8-jdk' });
        });
        await log_1.default.run(username, '安装 maven ', async () => {
            await docker.execContainerCommand({ container, cmd: 'apt-get install -y maven' });
        });
        await log_1.default.run(username, '修改 maven 源', async () => {
            let mavenSettingXml = (0, fs_1.readFileSync)(path.resolve(__dirname, './files/settings.xml'), { encoding: 'utf-8' });
            await docker.writeFile({ container, path: '/etc/maven/settings.xml', text: '\'' + mavenSettingXml + '\'' });
        });
        await log_1.default.run(username, '安装 Wetty', async () => {
            try {
                await docker.execContainerCommand({ container, cmd: 'which wetty' });
            }
            catch (err) {
                await docker.execContainerCommand({ container, cmd: 'yarn global add wetty' });
                await docker.execContainerCommand({ container, cmd: 'useradd console' });
                await docker.execContainerCommand({ container, cmd: 'echo -e "console\nconsole" | passwd console' });
            }
        });
        await log_1.default.run(username, '安装 code-server ', async () => {
            try {
                let result = await docker.execContainerCommand({ container, cmd: 'which code-server' });
            }
            catch (err) {
                await docker.execContainerCommand({ container, cmd: 'apt-get install -y build-essential pkg-config python3' });
                await docker.execContainerCommand({ container, cmd: 'npm config set python python3' });
                await docker.execContainerCommand({ container, cmd: 'yarn global add code-server@4.6.0' });
            }
        });
        await log_1.default.run(username, '安装 nginx ', async () => {
            await docker.execContainerCommand({ container, cmd: 'apt-get install -y nginx' });
        });
        await log_1.default.run(username, '安装 pm2 ', async () => {
            await docker.execContainerCommand({ container, cmd: 'npm install --global pm2' });
        });
        await log_1.default.run(username, '配置 nginx ', async () => {
            let nginxConfigText = (0, fs_1.readFileSync)(path.resolve(__dirname, './files/nginx.conf'), { encoding: 'utf-8' });
            await docker.writeFile({ container, path: '/etc/nginx/nginx.conf', text: '\'' + nginxConfigText + '\'' });
        });
        await log_1.default.run(username, '启动 wetty', async () => {
            try {
                let result = await docker.execContainerCommand({ container, cmd: 'lsof -i:3001' });
            }
            catch (err) {
                console.log(err);
            }
            docker.execContainerCommand({ container, cmd: 'wetty --port 3001' });
        });
        await log_1.default.run(username, '启动 code-server ', async () => {
            try {
                let result = await docker.execContainerCommand({ container, cmd: 'lsof -i:8000' });
            }
            catch (err) {
                console.log(err);
            }
            docker.execContainerCommand({ container, cmd: 'code-server --bind-addr 127.0.0.1:8000 --auth none' });
        });
        await log_1.default.run(username, '启动 nginx ', async () => {
            await docker.execContainerCommand({ container, cmd: 'nginx' });
        });
        (0, utils_1.setUserConfig)(username, 'status', 'created');
        res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        let socket = (0, log_1.getWebsocketIo)();
        socket.emit('Log', '[error]' + JSON.stringify(err));
        res.sendStatus(500);
    }
});
// API.4 运行项目
app.post('/api/backend/compile', isAuthenticated, async function (req, res) {
    try {
        let docker = (0, docker_1.createDockerFactory)();
        let username = req.session.user || '1234';
        let port = (0, utils_1.getUserConfig)(username, 'node-port');
        // 每次编译前把已有的 tenants_config 文件夹拷贝到一个地方，编译完成后，再拷贝回来
        let container = await docker.checkAndCreateContainer({ name: username + '.node', img: 'node:16', port: { '8080/tcp': [{ HostPost: port }] } });
        await docker.startContainer({ container });
        try {
            await docker.execContainerCommand({ container, cmd: 'mv -f build-output/backend/tenants_config/ ../tenants_config', dir: '/var/logwire-backend' });
        }
        catch (err) {
        }
        await docker.execContainerCommand({ container, cmd: 'bash build-release.sh --module=logwire', dir: '/var/logwire-backend' });
        await docker.execContainerCommand({ container, cmd: 'bash build-release.sh --module=assemble', dir: '/var/logwire-backend' });
        try {
            // 打包完成后，移动默认配置文件, 修改配置文件信息
            await docker.execContainerCommand({ container, cmd: 'mv -f ../tenants_config build-output/backend/', dir: '/var/logwire-backend' });
        }
        catch (err) {
        }
        (0, utils_1.copyAndCreateServerPropertiesV2InDocker)(username);
        (0, utils_1.copyAndCreateGatewayPropertiesV2InDocker)(username);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
app.post('/api/backend/execute', isAuthenticated, async function (req, res) {
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
        (0, utils_1.setUserConfig)(username, 'status', 'running');
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
app.post('/api/backend/stop', isAuthenticated, async function (req, res) {
    try {
        let docker = (0, docker_1.createDockerFactory)();
        let username = req.session.user || '1234';
        let container = await docker.checkAndCreateContainer({ name: username + '.node', img: 'node:16', port: { '8080/tcp': [{ HostPost: '30000' }] } });
        await docker.execContainerCommand({ container, cmd: 'pm2 delete backend' });
        await docker.execContainerCommand({ container, cmd: 'pm2 delete gateway' });
        (0, utils_1.setUserConfig)(username, 'status', 'stopped');
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send(err);
    }
});
// API.5 停止项目
// API.6 生成并获取 Git 的 Ssh key
app.get('/api/git/generateSsh', isAuthenticated, async function (req, res) {
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
app.post('/api/git/setUserInfo', isAuthenticated, async function (req, res) {
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
/**
 * query: 'postgres.xxx.yyy' 表示对象的字符串
 * body: JSON对象
 */
app.post('/api/config/setUserSetting', isAuthenticated, async function (req, res) {
    try {
        let data = req.body;
        let query = req.query;
        let path = query.path;
        let username = req.session.user || '1234';
        if (typeof path === 'string') {
            (0, utils_1.setUserConfig)(username, path, data);
        }
        res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});
httpServer.listen(3000);
