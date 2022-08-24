import axios, { AxiosResponse } from 'axios'
import * as vscode from 'vscode'
import _const from '../const'

/**
 * 提供一个输入框，
 */
let username = ''
export default function enterUserName () {
    vscode.window.showInputBox({
        placeHolder: '请输入使用者名称'
    }).then(value => {
        if (value) {
            username = value
            vscode.commands.executeCommand(_const.COMMANDS.INITWEBSOCKET, username).then(() => {
                // TODO: 用该名称向 node 发请求，获取该用户信息
                setTimeout(() => {
                    axios.get('http://127.0.0.1:3000/init/' + value).then((res: AxiosResponse<string>) => {
                        const data = res.data
                        if (data) {
                            // 存在 value 说明是新创建的，提示用户拷贝 ssh
                            vscode.commands.executeCommand(_const.COMMANDS.CONFIRMSSH, data)
                        } else {
                            // 再次触发 backendProvider.refresh
                            vscode.commands.executeCommand(_const.COMMANDS.BACKENDREFRESH)
                            // 直接进入用户文件夹
                            vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file('/root/' + username + '/logwire-backend'))
                        }
                    })
                })
            })
        }
    })
}

export function getUserName () { return username }