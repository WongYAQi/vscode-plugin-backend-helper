"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserName = exports.getUserName = void 0;
const axios_1 = require("axios");
const vscode = require("vscode");
const const_1 = require("../const");
/**
 * 提供一个输入框，
 */
let username = '';
function enterUserName() {
    vscode.window.showInputBox({
        placeHolder: '请输入使用者名称'
    }).then(value => {
        if (value) {
            username = value;
            vscode.commands.executeCommand(const_1.default.COMMANDS.INITWEBSOCKET, username).then(() => {
                // TODO: 用该名称向 node 发请求，获取该用户信息
                setTimeout(() => {
                    axios_1.default.get('http://127.0.0.1:3000/init/' + value).then((res) => {
                        const data = res.data;
                        if (data) {
                            // 存在 value 说明是新创建的，提示用户拷贝 ssh
                            vscode.commands.executeCommand(const_1.default.COMMANDS.CONFIRMSSH, data);
                        }
                        else {
                            // 直接进入用户文件夹
                            vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file('/root/' + username + '/logwire-backend'));
                        }
                    });
                });
            });
        }
    });
}
exports.default = enterUserName;
function getUserName() { return username; }
exports.getUserName = getUserName;
function setUserName(val) { username = val; }
exports.setUserName = setUserName;
//# sourceMappingURL=enterUserName.js.map