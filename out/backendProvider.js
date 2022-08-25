"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Backend = exports.BackendProvider = void 0;
const vscode = require("vscode");
const enterUserName_1 = require("./commands/enterUserName");
/**
 * 向 node 服务发送请求，获取当前用户的信息, 服务运行状态
 * 要注意的是：这里负责获得是服务运行状态，而关于服务是否可以运行，是通过 when 机制完成判断的
 */
class BackendProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.status = { backend: '', gateway: '' };
    }
    getChildren(element) {
        if (element) {
        }
        else {
            const username = (0, enterUserName_1.getUserName)();
            if (username) {
                return [
                    { label: '用户名: ' + username },
                    { label: 'Backend 状态: ' + (this.status.backend === 'online' ? '运行中' : '未运行') },
                    { label: 'Gateway 状态: ' + (this.status.gateway === 'online' ? '运行中' : '未运行') }
                ];
            }
        }
        return [];
    }
    getTreeItem(element) {
        return element;
    }
    refresh(status) {
        if (status) {
            this.status = status;
        }
        this.getChildren();
        this._onDidChangeTreeData.fire();
    }
}
exports.BackendProvider = BackendProvider;
class Backend extends vscode.TreeItem {
}
exports.Backend = Backend;
//# sourceMappingURL=backendProvider.js.map