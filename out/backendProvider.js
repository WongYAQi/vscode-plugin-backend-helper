"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Backend = exports.BackendProvider = void 0;
const vscode = require("vscode");
const enterUserName_1 = require("./commands/enterUserName");
/**
 * 向 node 服务发送请求，获取当前用户的信息
 */
class BackendProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getChildren(element) {
        if (element) {
        }
        else {
            // 没有参数时，认为向 node 端发请求，获取当前用户信息
            const username = (0, enterUserName_1.getUserName)();
            if (username) {
                console.log(username);
                return [
                    { id: 'backend', label: 'backend' },
                    { id: 'gateway', label: 'gateway' }
                ];
            }
        }
        return [];
    }
    getTreeItem(element) {
        return element;
    }
    refresh() {
        this.getChildren();
        this._onDidChangeTreeData.fire();
    }
}
exports.BackendProvider = BackendProvider;
class Backend extends vscode.TreeItem {
}
exports.Backend = Backend;
//# sourceMappingURL=backendProvider.js.map