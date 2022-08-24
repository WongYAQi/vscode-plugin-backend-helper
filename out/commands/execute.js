"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const vscode = require("vscode");
const enterUserName_1 = require("./enterUserName");
const websocket_1 = require("./websocket");
/**
 * 执行方法，命令 node 端发起运行 java 的命令，使用 pm2 执行，获取日志，反馈到面板上
 */
function execute(item) {
    const username = (0, enterUserName_1.getUserName)();
    let channel = websocket_1.storedChannel.get('execute.backend');
    if (channel) {
        channel.clear();
    }
    channel = websocket_1.storedChannel.get('execute.gateway');
    if (channel) {
        channel.clear();
    }
    // 发送请求，后续日志由 websocket 模块负责
    vscode.commands.executeCommand('setContext', 'backendHelper.status', 'loading');
    axios_1.default.post('http://127.0.0.1:3000/execute/' + username);
}
exports.default = execute;
//# sourceMappingURL=execute.js.map