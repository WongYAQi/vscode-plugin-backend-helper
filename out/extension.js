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
    // 激活时，链接 websocket 工作
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map