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
import axios, { AxiosResponse } from 'axios';

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

    if (window.location.search) {
        var exec = /folder=\/root\/(.*?)\/logwire-backend/.exec(window.location.search)
        if (exec) {
            var username = exec[1]
            axios.get('http://127.0.0.1:3000/init/' + username).then((res: AxiosResponse<string>) => {
                const data = res.data
                if (data) {
                    // 存在 value 说明是新创建的，提示用户拷贝 ssh
                    vscode.commands.executeCommand(_const.COMMANDS.CONFIRMSSH, data)
                } else {
                    // 再次触发 backendProvider.refresh
                    vscode.commands.executeCommand(_const.COMMANDS.BACKENDREFRESH)
                }
            })
        }
    }
}

// this method is called when your extension is deactivated
export function deactivate() {}
