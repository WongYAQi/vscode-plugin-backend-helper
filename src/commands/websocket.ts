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

        let lines_compile = 0
        socket.on('compile', function (data) {
            let channel = storedChannel.get('compile') as vscode.OutputChannel
            if (!channel) {
                channel = vscode.window.createOutputChannel('compile')
                channel.show()
                storedChannel.set('compile', channel)
            }
            if (lines_compile > 200) {
                channel.clear()
                lines_compile = 0
            }
            data.split('\n').forEach(line => {
                lines_compile++
                channel.append(line + '\n')
            })
        })

        let lines_backend = 0
        socket.on('execute.backend', function (data) {
            let channel = storedChannel.get('execute.backend') as vscode.OutputChannel
            if (!channel) {
                channel = vscode.window.createOutputChannel('execute.backend')
                channel.show()
                storedChannel.set('execute.backend', channel)
            }
            if (lines_backend > 200) {
                channel.clear()
                lines_backend = 0
            }
            data.split('\n').forEach(line => {
                lines_backend++
                channel.append(line + '\n')
            })
        })


        let lines_gateway = 0
        socket.on('execute.gateway', function (data) {
            let channel = storedChannel.get('execute.gateway') as vscode.OutputChannel
            if (!channel) {
                channel = vscode.window.createOutputChannel('execute.gateway')
                channel.show()
                storedChannel.set('execute.gateway', channel)
            }
            if (lines_gateway > 200) {
                channel.clear()
                lines_gateway = 0
            }
            data.split('\n').forEach(line => {
                lines_gateway++
                channel.append(line + '\n')
            })
        })


        // ?????? status ???data ????????? { backend: '', gateway: '' } ?????????????????????
        socket.on('status', function (data) {
            console.log('data is: ', data)
            const status = Object.assign({ backend: '', gateway: '' }, data)
            const { backend, gateway } = status
            // ?????????????????????????????????????????? ?????????
            if (backend === 'online') {
                vscode.commands.executeCommand('setContext', 'backendHelper.status', 'running');
            } else if (!backend) {
                vscode.commands.executeCommand('setContext', 'backendHelper.status', 'stopped');
            } else if (backend === 'stopped') {
                vscode.commands.executeCommand('setContext', 'backendHelper.status', 'stopped');
            } else {
                vscode.commands.executeCommand('setContext', 'backendHelper.status', 'loading');
            }
            vscode.commands.executeCommand(_const.COMMANDS.BACKENDREFRESH, status)
        })
    })
}