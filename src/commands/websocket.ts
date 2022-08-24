const { io } = require('socket.io-client')
import * as vscode from 'vscode'
import _const from '../const'

export const storedChannel: Map<string, vscode.OutputChannel> = new Map()

export default function initialWebsocketConnection (username: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const socket = io('http://127.0.0.1:3000', { auth: { username }, secure: true, reconnection: true, rejectUnauthorized: false })
        socket.on('connect', () => {
            resolve()
        })
        socket.onAny((data) => {
            console.log(data)
        });

        socket.on('compile', function (data) {
            let channel = storedChannel.get('compile') as vscode.OutputChannel
            if (!channel) {
                channel = vscode.window.createOutputChannel('compile')
            }
            channel.show()
            channel.append(data + '\n')
        })

        socket.on('execute.backend', function (data) {
            let channel = storedChannel.get('execute.backend') as vscode.OutputChannel
            if (!channel) {
                channel = vscode.window.createOutputChannel('execute.backend')
            }
            channel.show()
            channel.append(data + '\n')
        })
        socket.on('execute.gateway', function (data) {
            let channel = storedChannel.get('execute.gateway') as vscode.OutputChannel
            if (!channel) {
                channel = vscode.window.createOutputChannel('execute.gateway')
            }
            channel.show()
            channel.append(data + '\n')
        })


        // 关于 status ，data 表现为 { backend: '', gateway: '' } 的序列化字符串
        socket.on('status', function (data) {
            const status = JSON.parse(data)
            // 有任何一个运行中，则整体处于 运行中
            if (status.backend === 'online' && status.gateway === 'online') {
                vscode.commands.executeCommand('setContext', 'backendHelper.status', 'running');
            } else if (status.backend === 'stopped' && status.gateway === 'stopped') {
                vscode.commands.executeCommand('setContext', 'backendHelper.status', 'stopped');
            }
            vscode.commands.executeCommand(_const.COMMANDS.BACKENDREFRESH)
        })
    })
}