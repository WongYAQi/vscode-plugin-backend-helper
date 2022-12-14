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
                lines_compile = 0;
            }
            data.split('\n').forEach(line => {
                lines_compile++;
                channel.append(line + '\n');
            });
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
                lines_backend = 0;
            }
            data.split('\n').forEach(line => {
                lines_backend++;
                channel.append(line + '\n');
            });
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
                lines_gateway = 0;
            }
            data.split('\n').forEach(line => {
                lines_gateway++;
                channel.append(line + '\n');
            });
        });
        // ?????? status ???data ????????? { backend: '', gateway: '' } ?????????????????????
        socket.on('status', function (data) {
            console.log('data is: ', data);
            const status = Object.assign({ backend: '', gateway: '' }, data);
            const { backend, gateway } = status;
            // ?????????????????????????????????????????? ?????????
            if (backend === 'online') {
                vscode.commands.executeCommand('setContext', 'backendHelper.status', 'running');
            }
            else if (!backend) {
                vscode.commands.executeCommand('setContext', 'backendHelper.status', 'stopped');
            }
            else if (backend === 'stopped') {
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