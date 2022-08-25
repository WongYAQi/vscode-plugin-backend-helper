import * as vscode from 'vscode'
import * as fs from 'fs'
import { getUserName } from './commands/enterUserName'
import axios from 'axios';
/**
 * 向 node 服务发送请求，获取当前用户的信息, 服务运行状态
 * 要注意的是：这里负责获得是服务运行状态，而关于服务是否可以运行，是通过 when 机制完成判断的
 */
export class BackendProvider implements vscode.TreeDataProvider<Backend> {
    private status: { backend: string, gateway: string }
    constructor() {
        this.status = { backend: '', gateway: '' }
    }
    private _onDidChangeTreeData: vscode.EventEmitter<Backend | undefined | null | void> = new vscode.EventEmitter<Backend | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Backend | undefined | null | void> = this._onDidChangeTreeData.event;
    getChildren(element?: Backend | undefined): vscode.ProviderResult<Backend[]> {
        if (element) {
        } else {
            const username = getUserName()
            if (username) {
                return [
                    { label: '用户名: ' + username },
                    { label: 'Backend 状态: ' + (this.status.backend === 'online' ? '运行中' : '未运行') },
                    { label: 'Gateway 状态: ' + (this.status.gateway === 'online' ? '运行中' : '未运行') }
                ]
            }
        }
        return []
    }
    getTreeItem(element: Backend): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element
    }
    refresh (status?: { backend, gateway }) {
        if (status) {
            this.status = status
        }
        this.getChildren()
        this._onDidChangeTreeData.fire()
    }
}

export class Backend extends vscode.TreeItem {
}