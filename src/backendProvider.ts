import * as vscode from 'vscode'
import * as fs from 'fs'
import { getUserName } from './commands/enterUserName'
import axios from 'axios';
/**
 * 向 node 服务发送请求，获取当前用户的信息, 服务运行状态
 * 要注意的是：这里负责获得是服务运行状态，而关于服务是否可以运行，是通过 when 机制完成判断的
 */
export class BackendProvider implements vscode.TreeDataProvider<Backend> {
    private _onDidChangeTreeData: vscode.EventEmitter<Backend | undefined | null | void> = new vscode.EventEmitter<Backend | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Backend | undefined | null | void> = this._onDidChangeTreeData.event;
    getChildren(element?: Backend | undefined): vscode.ProviderResult<Backend[]> {
        if (element) {
        } else {
            // 没有参数时，认为向 node 端发请求，获取当前用户信息,
            const username = getUserName()
            if (username) {
                return axios('http://127.0.0.1:3000/status/' + username).then(res => {
                    console.log(res)
                    const { backend, gateway } = res.data
                    if (res.data.backend === 'online' && res.data.gateway === 'online') {
                        vscode.commands.executeCommand('setContext', 'backendHelper.status', 'running');
                    } else if (!backend && !gateway) {
                        vscode.commands.executeCommand('setContext', 'backendHelper.status', 'stopped');
                    } else if (backend === 'stopped' && gateway === 'stopped') {
                        vscode.commands.executeCommand('setContext', 'backendHelper.status', 'stopped');
                    } else {
                        vscode.commands.executeCommand('setContext', 'backendHelper.status', 'loading');
                    }
                    return [
                        { label: '用户名: ' + username },
                        { label: 'Backend 状态: ' + (res.data.backend === 'online' ? '运行中' : '未运行') },
                        { label: 'Gateway 状态: ' + (res.data.gateway === 'online' ? '运行中' : '未运行') }
                    ]
                })
            }
        }
        return []
    }
    getTreeItem(element: Backend): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element
    }
    refresh () {
        this.getChildren()
        this._onDidChangeTreeData.fire()
    }
}

export class Backend extends vscode.TreeItem {
}