"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const backendProvider_1 = require("./backendProvider");
const compile_1 = require("./commands/compile");
const copySsh_1 = require("./commands/copySsh");
const enterUserName_1 = require("./commands/enterUserName");
const execute_1 = require("./commands/execute");
const const_1 = require("./const");
const websocket_1 = require("./commands/websocket");
const stop_1 = require("./commands/stop");
const axios_1 = require("axios");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const backendProvider = new backendProvider_1.BackendProvider();
    vscode.window.registerTreeDataProvider(const_1.default.VIEW.ID, backendProvider);
    vscode.commands.registerCommand('enterUserName', enterUserName_1.default);
    vscode.commands.registerCommand(const_1.default.COMMANDS.BACKENDREFRESH, () => backendProvider.refresh());
    vscode.commands.registerCommand(const_1.default.COMMANDS.COMPILE, compile_1.default);
    vscode.commands.registerCommand(const_1.default.COMMANDS.EXECUTE, execute_1.default);
    vscode.commands.registerCommand(const_1.default.COMMANDS.CONFIRMSSH, copySsh_1.default);
    vscode.commands.registerCommand(const_1.default.COMMANDS.INITWEBSOCKET, websocket_1.default);
    vscode.commands.registerCommand(const_1.default.COMMANDS.STOP, stop_1.default);
    vscode.commands.executeCommand('setContext', 'backendHelper.status', '');
    if (vscode.workspace.workspaceFolders.length) {
        var exec = /\/root\/(.*?)\/logwire-backend/.exec(vscode.workspace.workspaceFolders[0].uri.path);
        if (exec) {
            var username = exec[1];
            (0, enterUserName_1.setUserName)(username);
            vscode.commands.executeCommand(const_1.default.COMMANDS.INITWEBSOCKET, username).then(() => {
                axios_1.default.get('http://127.0.0.1:3000/init/' + username).then((res) => {
                    const data = res.data;
                    if (data) {
                        // 存在 value 说明是新创建的，提示用户拷贝 ssh
                        vscode.commands.executeCommand(const_1.default.COMMANDS.CONFIRMSSH, data);
                    }
                    else {
                        // 再次触发 backendProvider.refresh
                        vscode.commands.executeCommand(const_1.default.COMMANDS.BACKENDREFRESH);
                    }
                });
            });
        }
    }
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map