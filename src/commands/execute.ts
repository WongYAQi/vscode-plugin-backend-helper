import axios, { AxiosResponse } from 'axios'
import * as vscode from 'vscode'
import { Backend } from '../backendProvider'
import { getUserName } from './enterUserName'
/**
 * 执行方法，命令 node 端发起运行 java 的命令，使用 pm2 执行，获取日志，反馈到面板上
 */
export default function execute (item: Backend) {
    const username = getUserName()
    // 发送请求，后续日志由 websocket 模块负责
    vscode.commands.executeCommand('setContext', 'backendHelper.status', 'loading');
    axios.post('http://127.0.0.1:3000/execute/' + username)
}