import axios, { AxiosResponse } from 'axios'
import path = require('path')
import * as vscode from 'vscode'
import _const from '../const'
import { getUserName } from './enterUserName'
/**
 * 当用户第一次使用系统时，会在初始化时返回 ssh key，提醒用户记得拷贝 ssh 刀 gitlab 中，然后放一个确认按钮
 */
export default function copySshKey (ssh: string) {
    vscode.window.showInformationMessage(`请拷贝 ssh key 到您的 gitlab 账户中, 完成后请点击确认\n` + ssh, '确认').then((value) => {
        if (value === '确认') {
            vscode.window.showInformationMessage('克隆仓库中...')
            axios.get('http://127.0.0.1:3000/gitclone/' + getUserName()).then((res: AxiosResponse<string>) => {
                const folder = res.data
                vscode.window.showInformationMessage('仓库克隆完毕')
                // TODO: 应该让 code-server 显示这个仓库中的内容
                vscode.commands.executeCommand(_const.COMMANDS.BACKENDREFRESH)
                vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(folder))
            })
        }
    })
}