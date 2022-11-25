"use strict";
/**
 * Logs 模块
 * 使用 LogsModule 包裹后，为某个安装流程增加日志处理，并且对外还是返回 Promise 对象
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebsocketIo = exports.setWebsocketIo = void 0;
const utils_1 = require("./utils");
let websocket;
function setWebsocketIo(io) {
    websocket = io;
}
exports.setWebsocketIo = setWebsocketIo;
function getWebsocketIo() {
    return websocket;
}
exports.getWebsocketIo = getWebsocketIo;
class LogUtil {
    // 根据 log 判断用户是否已经执行过
    static async run(username, log, cb) {
        let key = 'InstallSteps';
        let steps = (0, utils_1.getUserConfig)(username, key) || [];
        let socket = getWebsocketIo();
        if (steps.includes(log)) {
            socket.emit('Log', log);
            return;
        }
        else {
            socket.emit('Log', '[Progress]' + log + '中...');
            await cb();
            steps.push(log);
            (0, utils_1.setUserConfig)(username, key, steps);
            socket.emit('Log', '[Log]' + log + '完成');
        }
    }
}
exports.default = LogUtil;
