import * as vscode from 'vscode'
import * as fs from 'fs'
import { getUserName } from './commands/enterUserName'
/**
 * 向 node 服务发送请求，获取当前用户的信息
 */
export class BackendProvider implements vscode.TreeDataProvider<Backend> {
    private _onDidChangeTreeData: vscode.EventEmitter<Backend | undefined | null | void> = new vscode.EventEmitter<Backend | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Backend | undefined | null | void> = this._onDidChangeTreeData.event;
    getChildren(element?: Backend | undefined): vscode.ProviderResult<Backend[]> {
        if (element) {

        } else {
            // 没有参数时，认为向 node 端发请求，获取当前用户信息
            const username = getUserName()
            if (username) {
                console.log(username)
                return [
                    { id: 'backend', label: 'backend' },
                    { id: 'gateway', label: 'gateway' }
                ]
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