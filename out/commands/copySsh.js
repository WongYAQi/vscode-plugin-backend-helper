"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const vscode = require("vscode");
const const_1 = require("../const");
const enterUserName_1 = require("./enterUserName");
/**
 * 当用户第一次使用系统时，会在初始化时返回 ssh key，提醒用户记得拷贝 ssh 刀 gitlab 中，然后放一个确认按钮
 */
function copySshKey(ssh) {
    vscode.window.showInformationMessage(`请拷贝 ssh key 到您的 gitlab 账户中, 完成后请点击确认\n` + ssh, '确认').then((value) => {
        if (value === '确认') {
            vscode.window.showInformationMessage('克隆仓库中...');
            axios_1.default.get('http://127.0.0.1:3000/gitclone/' + (0, enterUserName_1.getUserName)()).then((res) => {
                const folder = res.data;
                vscode.window.showInformationMessage('仓库克隆完毕');
                // TODO: 应该让 code-server 显示这个仓库中的内容
                vscode.commands.executeCommand(const_1.default.COMMANDS.BACKENDREFRESH);
                vscode.commands.executeCommand('vscode.openFolder', folder);
            });
        }
    });
}
exports.default = copySshKey;
//# sourceMappingURL=copySsh.js.map