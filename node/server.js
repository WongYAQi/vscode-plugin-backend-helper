"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const os = require("os");
const fs = require("fs");
const http = require("http");
const child_process_1 = require("child_process");
const { Server } = require('socket.io');
const pm2 = require('pm2');
const express = require('express');
var keygen = require('ssh-keygen');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: '*'
});
const port = 3000;
const config = {};
// TODO: node 存一个配置文件，记录当前用户和 ssh key的键值对
// =================路由===================
/**
 * 检查当前是否存在对应用户名的文件夹，ssh key等信息
 */
app.get('/init/:name', (req, res) => {
    const folderPath = os.type() === 'Windows_NT'
        ? path.resolve('D:\\git\\vscode-plugin-backend-helper\\node', req.params.name)
        : '/root/' + req.params.name;
    fs.stat(folderPath, function (err, stats) {
        if (err) {
            // 如果错误说明当前用户还没有创建，那么执行一次创建
            // 创建完成后，返回
            initialUserInfomation(req.params.name).then((ssh) => res.send(ssh)).catch((err) => {
                sendCurrentStatus(req.params.name);
                res.status(500).send(err);
            });
        }
        else {
            sendCurrentStatus(req.params.name);
            res.send();
        }
    });
});
/**
 * 用户上传名称初始化之后，会返回 ssh key, 页面上出现一个弹窗，提示用户将 ssh 录入 gitlab 的 ssh key 中，还具有一个按钮，点击后，告知后端完成了录入，node 开始下载代码
 */
app.get('/gitclone/:name', function (req, res) {
    const username = req.params.name;
    const repo = 'ssh://git@gitlab.logwire.cn:13389/logwire2/logwire-backend.git';
    const folder = getFolderPath(req.params.name);
    let child = (0, child_process_1.exec)('git clone ' + repo, { cwd: folder });
    child.on('exit', () => {
        // 拷贝 demo-v2 的前端资源到每个人的服务上
        fs.cpSync('/usr/logwire2-config-demo', '/root/' + username + '/tenants_config', { recursive: true });
        sendCurrentStatus(req.params.name);
        res.send(folder);
    });
});
app.get('/getFolerPath/:name', function (req, res) {
    res.send(getFolderPath(req.params.name));
});
// 停止某个人的服务, 删除已有的日志
app.post('/stop/:name', function (req, res) {
    (0, child_process_1.exec)('pm2 delete ' + req.params.name + '_backend');
    (0, child_process_1.exec)('pm2 delete ' + req.params.name + '_gateway');
    (0, child_process_1.exec)('pm2 flush ' + req.params.name + '_backend');
    (0, child_process_1.exec)('pm2 flush ' + req.params.name + '_gateway');
    setTimeout(() => {
        sendCurrentStatus(req.params.name);
        res.send();
    }, 3000);
});
// 编译代码，执行 bash build-release.sh 命令，将输出提交到前台, 以 compile 注册的 socket.io 监听
app.post('/compile/:name', function (req, res) {
    let child = (0, child_process_1.exec)('bash build-release.sh --module="logwire"', { cwd: path.join(getFolderPath(req.params.name), 'logwire-backend') });
    child.stdout.on('data', function (data) {
        io.to(req.params.name).emit('compile', data);
    });
    child.stderr.on('data', function (data) {
        io.to(req.params.name).emit('compile', data);
    });
    child.on('exit', function (code, signal) {
        let assemble = (0, child_process_1.exec)('bash build-release.sh --module="assemble"', { cwd: path.join(getFolderPath(req.params.name), 'logwire-backend') });
        assemble.on('exit', function () {
            fs.copyFileSync('./application-server.properties', '/root/' + req.params.name + '/logwire-backend/build-output/backend/config/application-server.properties');
            fs.stat('/root/' + req.params.name + '/application-server.properties', function (err, stat) {
                if (!err) {
                    fs.copyFileSync('/root/' + req.params.name + '/application-server.properties', '/root/' + req.params.name + '/logwire-backend/build-output/backend/config/application-server.properties');
                }
                else {
                    fs.copyFileSync('./application-gateway.properties', '/root/' + req.params.name + '/logwire-backend/build-output/gateway/config/application-gateway.properties');
                }
            });
            io.to(req.params.name).emit('status', { backend: 'stopped', gateway: 'stopped' });
            sendCurrentStatus(req.params.name);
            res.send({ code, signal });
        });
    });
});
// 执行 java 程序，将日志以 execute.backend/execute.gateway 的注册返回
app.post('/execute/:name', function (req, res) {
    // 将配置文件拷贝到特定目录中
    fs.copyFileSync('/root/' + req.params.name + '/logwire-backend/build-output/backend/config/application-server.properties', '/root/' + req.params.name + '/application-server.properties');
    // let child = exec(`pm2 --name ${req.params.name} start test.js`);
    getCurrentStatus().then(res => {
        console.log(res);
        if (res.some(o => o.name === 'gateway' && o.status === 'online')) {
            // 存在gateway，而且正在运行
        }
        else {
            (0, child_process_1.exec)('pm2 delete gateway').on('exit', function () {
                (0, child_process_1.exec)(`pm2 start --name gateway --no-autorestart java -- -jar logwire-gateway-starter.jar`, { cwd: path.join(getFolderPath(req.params.name), 'logwire-backend/build-output/gateway') });
            });
        }
    });
    (0, child_process_1.exec)(`pm2 delete ${req.params.name}_backend`).on('exit', function () {
        (0, child_process_1.exec)(`pm2 start --name ${req.params.name}_backend --no-autorestart java -- -jar logwire-backend-starter.jar`, { cwd: path.join(getFolderPath(req.params.name), 'logwire-backend/build-output/backend') });
    });
    setTimeout(() => {
        (0, child_process_1.exec)(`pm2 log ${req.params.name}_backend`).stdout.on('data', data => {
            io.to(req.params.name).emit('execute.backend', data);
        });
        (0, child_process_1.exec)(`pm2 log gateway`).stdout.on('data', data => {
            io.to(req.params.name).emit('execute.gateway', data);
        });
        setTimeout(() => {
            sendCurrentStatus(req.params.name);
        });
        res.send();
    }, 1000);
});
// ====================Websocket 通信=====================
io.on('connection', (socket) => {
    console.log('socket in connect, ready to join room:   ' + socket['username']);
    socket.join(socket['username']);
});
// 中间件处理用户
io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error('invalid username'));
    }
    socket['username'] = username;
    next();
});
// ============== 启动==============
server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    // 启动成功后，每隔3s执行一次状态的发送
    setInterval(() => {
        getCurrentStatus().then((result) => {
            console.log(result);
            result.forEach(item => {
                if (item.name !== 'gateway') {
                    console.log('ready to send status to: ' + item.name.replace(/_.*/, ''));
                    io.to(item.name.replace(/_.*/, '')).emit('status', {
                        backend: item.status,
                        gateway: result.find(o => o.name === 'gateway')?.status
                    });
                }
            });
        });
    }, 3000);
});
// ====================pm2 监控================
// ====================辅助方法=============
function sendCurrentStatus(username) {
    getCurrentStatus(username).then(result => {
        console.log(result);
        io.to(username).emit('status', {
            backend: result.find(o => o.name !== 'gateway')?.status,
            gateway: result.find(o => o.name === 'gateway')?.status
        });
    });
}
/**
 * 初始化用户信息, 存到一个本地存储中
 * 1. 生成文件夹
 * 2. 生成 ssh key，告知前端 key
 * @param user
 * @returns
 */
function initialUserInfomation(user) {
    const folderPath = getFolderPath(user);
    // 1.
    fs.mkdirSync(folderPath);
    fs.mkdirSync(path.join(folderPath, 'products'));
    fs.mkdirSync(path.join(folderPath, 'tenants_config'));
    // 2.
    return new Promise((resolve, reject) => {
        let child = (0, child_process_1.exec)(`ssh-keygen -t rsa -b 2048 -C "${user}@greaconsulting.com" -N ""  -f ${path.join(folderPath, 'rsa')}`);
        child.on('exit', function () {
            fs.readFile(path.join(folderPath, 'rsa.pub'), { encoding: 'utf-8' }, function (err, data) {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    });
}
function getFolderPath(name) {
    return os.type() === 'Windows_NT'
        ? path.resolve('D:\\git\\vscode-plugin-backend-helper\\node', name)
        : '/root/' + name;
}
// 获取状态时，gateway 永远只有一个
function getCurrentStatus(username) {
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err);
                return;
            }
            pm2.list((err, list) => {
                pm2.disconnect();
                if (username) {
                    resolve([
                        { name: username + '_backend', status: list.find(o => o.name === username + '_backend')?.pm2_env?.status },
                        { name: 'gateway', status: list.find(o => o.name === 'gateway')?.pm2_env?.status }
                    ]);
                }
                else {
                    resolve(list.map(o => {
                        return { name: o.name, status: o.pm2_env.status };
                    }));
                }
            });
        });
    });
}
//# sourceMappingURL=server.js.map