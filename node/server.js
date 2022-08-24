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
                res.status(500).send(err);
            });
        }
        else {
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
        fs.copyFileSync('./execute.backend.js', '/root/' + username + '/execute.backend.js');
        fs.copyFileSync('./execute.gateway.js', '/root/' + username + '/execute.gateway.js');
        res.send(path.join(folder, 'logwire-backend'));
    });
});
app.get('/getFolerPath/:name', function (req, res) {
    res.send(getFolderPath(req.params.name));
});
// 如果用户没有初始化，返回 undefined；如果初始化，则返回对应状态
app.get('/status/:name', function (req, res) {
    fs.stat(getFolderPath(req.params.name), function (err, stat) {
        if (err) {
            res.send(undefined);
        }
        else {
            // TODO: 状态需要根据 pm2 框架获取
            sendCurrentStatusBySocekt().then((result) => {
                res.send(result);
            }).catch(err => {
                res.send(err);
            });
        }
    });
});
// 停止某个人的服务, 删除已有的日志
app.post('/stop/:name', function (req, res) {
    pm2.connect((err) => {
        if (err) {
            res.send(err);
            return pm2.disconnect();
        }
        pm2.stop(req.params.name + '_backend', function (err) {
            if (err) {
                io.to(req.params.name).emit('execute.backend', err);
                return;
            }
            io.to(req.params.name).emit('execute.backend', 'Stopped');
        });
        pm2.stop(req.params.name + '_gateway', function (err) {
            if (err) {
                io.to(req.params.name).emit('execute.gateway', err);
                return;
            }
            io.to(req.params.name).emit('execute.gateway', 'Stopped');
        });
        (0, child_process_1.exec)('pm2 flush ' + req.params.name + '_backend');
        (0, child_process_1.exec)('pm2 flush ' + req.params.name + '_gateway');
        pm2.disconnect();
    });
    res.send();
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
            fs.copyFileSync('./application-server.properties', '/root/' + req.params.name + '/logwire-backend/build-output/backend/application-server.properties');
            fs.copyFileSync('./application-gateway.properties', '/root/' + req.params.name + '/logwire-backend/build-output/gateway/application-gateway.properties');
            io.to(req.params.name).emit('status', { backend: '', gateway: '' });
            res.send({ code, signal });
        });
    });
});
// 执行 java 程序，将日志以 execute.backend/execute.gateway 的注册返回
app.post('/execute/:name', function (req, res) {
    // let child = exec(`pm2 --name ${req.params.name} start test.js`);
    (0, child_process_1.exec)(`pm2 start ${req.params.name}/execute.backend.js --name ${req.params.name}_backend --no-autorestart`, { cwd: getFolderPath(req.params.name) }).stderr.on('data', function (data) { console.log(data); });
    (0, child_process_1.exec)(`pm2 start ${req.params.name}/execute.gateway.js --name ${req.params.name}_gateway --no-autorestart`, { cwd: getFolderPath(req.params.name) }).stderr.on('data', function (data) { console.log(data); });
    ['backend', 'gateway'].forEach(element => {
        let child2 = (0, child_process_1.exec)(`pm2 log ${req.params.name}_${element}`);
        // let child2 = exec(`pm2 log ${req.params.name}`);
        child2.stdout.on('data', function (data) {
            // 如何拿到当前用户对应的 socket 对象
            io.to(req.params.name).emit('execute.' + element, data);
        });
    });
    res.send();
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
});
// ====================pm2 监控================
// ====================辅助方法=============
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
function sendCurrentStatusBySocekt() {
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err);
                return;
            }
            pm2.list((err, list) => {
                pm2.disconnect();
                resolve({
                    backend: list.find(o => o.name === 'backend')?.pm2_env?.status,
                    gateway: list.find(o => o.name === 'gateway')?.pm2_env?.status
                });
            });
        });
    });
}
//# sourceMappingURL=server.js.map