"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storedChannel = void 0;
const { io } = require('socket.io-client');
const vscode = require("vscode");
const const_1 = require("../const");
exports.storedChannel = new Map();
function initialWebsocketConnection(username) {
    return new Promise((resolve, reject) => {
        const socket = io('http://127.0.0.1:3000', { auth: { username }, secure: true, reconnection: true, rejectUnauthorized: false });
        socket.on('connect', () => {
            resolve();
        });
        socket.onAny((data) => {
            console.log(data);
        });
        let lines_compile = 0;
        socket.on('compile', function (data) {
            let channel = exports.storedChannel.get('compile');
            if (!channel) {
                channel = vscode.window.createOutputChannel('compile');
                channel.show();
                exports.storedChannel.set('compile', channel);
            }
            if (lines_compile > 200) {
                channel.clear();
            }
            lines_compile++;
            channel.append(data + '\n');
        });
        let lines_backend = 0;
        socket.on('execute.backend', function (data) {
            let channel = exports.storedChannel.get('execute.backend');
            if (!channel) {
                channel = vscode.window.createOutputChannel('execute.backend');
                channel.show();
                exports.storedChannel.set('execute.backend', channel);
            }
            if (lines_backend > 200) {
                channel.clear();
            }
            lines_backend++;
            channel.append(data + '\n');
        });
        let lines_gateway = 0;
        socket.on('execute.gateway', function (data) {
            let channel = exports.storedChannel.get('execute.gateway');
            if (!channel) {
                channel = vscode.window.createOutputChannel('execute.gateway');
                channel.show();
                exports.storedChannel.set('execute.gateway', channel);
            }
            if (lines_gateway > 200) {
                channel.clear();
            }
            lines_gateway++;
            channel.append(data + '\n');
        });
        // 关于 status ，data 表现为 { backend: '', gateway: '' } 的序列化字符串
        socket.on('status', function (data) {
            const status = JSON.parse(data);
            const { backend, gateway } = status;
            // 有任何一个运行中，则整体处于 运行中
            if (backend === 'online' && gateway === 'online') {
                vscode.commands.executeCommand('setContext', 'backendHelper.status', 'running');
            }
            else if (!backend && !gateway) {
                vscode.commands.executeCommand('setContext', 'backendHelper.status', 'stopped');
            }
            else if (backend === 'stopped' && gateway === 'stopped') {
                vscode.commands.executeCommand('setContext', 'backendHelper.status', 'stopped');
            }
            else {
                vscode.commands.executeCommand('setContext', 'backendHelper.status', 'loading');
            }
            vscode.commands.executeCommand(const_1.default.COMMANDS.BACKENDREFRESH, status);
        });
    });
}
exports.default = initialWebsocketConnection;
//# sourceMappingURL=websocket.js.map