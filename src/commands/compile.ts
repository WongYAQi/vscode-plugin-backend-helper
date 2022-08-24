import { Backend } from "../backendProvider"
import { getUserName } from "./enterUserName"
import * as vscode from 'vscode'
import axios, { AxiosResponse } from "axios"
import { storedChannel } from "./websocket"
const path = require('path')

/**
 * 向 node 端发送服务，要求执行编译过程，并在编译成功后，唤醒一个编辑页面，内容是对应 backend/ gateway 的配置信息
 * 打开的文件可以是实际的文件, 只是 uri 是特定的，
 */
export default function compile(item: Backend) {
    const username = getUserName()
    vscode.commands.executeCommand('setContext', 'backendHelper.status', 'loading');
    // 发送请求，后续日志由 websocket 模块负责
    axios.post('http://127.0.0.1:3000/compile/' + username).then((res: AxiosResponse<{ code: any, signal: any }>) => {
        // 如果成功，则直接打开配置文件
        if (true) {
            axios('http://127.0.0.1:3000/getFolerPath/' + username).then(res => {
                ;['backend', 'gateway'].forEach(target => {
                    const properties = target === 'backend' ? 'application-server.properties' : 'application-gateway.properties'
                    const path2 = path.join(res.data, 'logwire-backend', 'build-output', target, 'config', properties)
                    vscode.window.showTextDocument(vscode.Uri.file(path2))
                    vscode.commands.executeCommand('setContext', 'backendHelper.status', 'stopped');
                })
            })
        }
    })
    // 删除以前的看板
    let channel = storedChannel.get('execute.gateway') as vscode.OutputChannel
    if (channel) { channel.hide() }
    channel = storedChannel.get('execute.backend') as vscode.OutputChannel
    if (channel) { channel.hide() }
    channel = storedChannel.get('compile') as vscode.OutputChannel
    if (channel) { channel.hide() }
}