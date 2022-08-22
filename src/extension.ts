// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { BackendProvider } from './backendProvider';
import compile from './commands/compile';
import copySshKey from './commands/copySsh';
import enterUserName from './commands/enterUserName';
import execute from './commands/execute';
import _const from './const';
import websocket from './commands/websocket'
import stop from './commands/stop';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const backendProvider = new BackendProvider()
    vscode.window.registerTreeDataProvider(_const.VIEW.ID, backendProvider)
    vscode.commands.registerCommand('enterUserName', enterUserName)
    vscode.commands.registerCommand(_const.COMMANDS.BACKENDREFRESH, () => backendProvider.refresh())
    vscode.commands.registerCommand(_const.COMMANDS.COMPILE, compile)
    vscode.commands.registerCommand(_const.COMMANDS.EXECUTE, execute)
    vscode.commands.registerCommand(_const.COMMANDS.CONFIRMSSH, copySshKey)
    vscode.commands.registerCommand(_const.COMMANDS.INITWEBSOCKET, websocket)
    vscode.commands.registerCommand(_const.COMMANDS.STOP, stop)

    vscode.commands.executeCommand('setContext', 'backendHelper.status', '');

    // 激活时，链接 websocket 工作
}

// this method is called when your extension is deactivated
export function deactivate() {}
