import { io } from 'socket.io-client'
import * as vscode from 'vscode'

const storedChannel: Map<string, vscode.OutputChannel> = new Map()

export default function initialWebsocketConnection (username: string) {
    const socket = io('http://127.0.0.1:3000', { auth: { username }, secure: true, reconnection: true, rejectUnauthorized: false })
    socket.on('connect', () => {
        console.log(username + ' connect !')
    })
    socket.on("connect_error", (err) => {
        console.log(err)
    });

    socket.on('compile', function (data) {
        let channel = storedChannel.get(username + '_compile') as vscode.OutputChannel
        if (!channel) {
            channel = vscode.window.createOutputChannel(username + '_compile')
        }
        channel.show()
        channel.append(data + '\n')
    })
}