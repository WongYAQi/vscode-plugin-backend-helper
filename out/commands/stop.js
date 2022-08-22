"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const enterUserName_1 = require("./enterUserName");
const vscode = require("vscode");
function stop() {
    // 接口返回时还没有触发 pm2 的回调，所以进入 loading 状态
    vscode.commands.executeCommand('setContext', 'backendHelper.status', 'loading');
    axios_1.default.post('/stop/' + (0, enterUserName_1.getUserName)());
}
exports.default = stop;
//# sourceMappingURL=stop.js.map