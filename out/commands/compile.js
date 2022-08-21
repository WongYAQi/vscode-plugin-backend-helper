"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enterUserName_1 = require("./enterUserName");
const vscode = require("vscode");
const axios_1 = require("axios");
const path = require('path');
/**
 * 向 node 端发送服务，要求执行编译过程，并在编译成功后，唤醒一个编辑页面，内容是对应 backend/ gateway 的配置信息
 * 打开的文件可以是实际的文件, 只是 uri 是特定的，
 */
function compile(item) {
    const target = item.id;
    const username = (0, enterUserName_1.getUserName)();
    // 发送请求，后续日志由 websocket 模块负责
    axios_1.default.post('http://127.0.0.1:3000/compile/' + username).then((res) => {
        console.log(res.data);
        // 如果成功，则直接打开配置文件
        if (true) {
            (0, axios_1.default)('http://127.0.0.1:3000/getFolerPath/' + username).then(res => {
                const properties = item.id === 'backend' ? 'application-server.properties' : 'application-gateway.properties';
                const path2 = path.join(res.data, 'logwire-backend', 'build-output', item.id, 'config', properties);
                console.log(path2);
                vscode.window.showTextDocument(vscode.Uri.file(path2));
            });
        }
    });
}
exports.default = compile;
//# sourceMappingURL=compile.js.map