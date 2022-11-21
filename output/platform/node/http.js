"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const session = require("express-session");
const docker_1 = require("./docker");
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
                res.sendStatus(200);
            }
        });
    });
});
// API.2 获取当前 username 的信息, 包括：服务运行状态
app.get('/api/getProjectInfo', isAuthenticated, function (req, res) {
});
// API.3 初始化项目, 将异常打印到前端
app.post('/api/installProject', isAuthenticated, function (req, res) {
    let docker = (0, docker_1.createDockerFactory)();
    docker.createContainer(req.session.user).then(container => {
        container.start(function (err, data) {
            container.exec({
                Cmd: ['adsasd', 'clone', 'https://github.com/WongYAQi/vscode-plugin-backend-helper.git'],
                AttachStdout: true,
                AttachStderr: true,
                WorkingDir: '/var'
            }, function (err, exec) {
                if (!err) {
                    exec?.start({ Tty: true }, function (err, result) {
                        result?.on('data', data => console.log('data is', data.toString()));
                        result?.on('error', err => console.log('err is', err.message));
                        result?.on('end', () => {
                            exec.inspect(function (err, info) {
                                console.log(info);
                            });
                        });
                    });
                }
            });
            if (err) {
                res.sendStatus(500);
            }
            else {
                res.sendStatus(200);
            }
        });
    });
});
// API.4 运行项目
// API.5 停止项目
// API.6 生成并获取 Git 的 Ssh key
app.listen(3000);
