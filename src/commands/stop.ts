import axios from "axios";
import { getUserName } from "./enterUserName";
import * as vscode from 'vscode'
import _const from "../const";

export default function stop () {
    // 接口返回时还没有触发 pm2 的回调，所以进入 loading 状态
    vscode.commands.executeCommand('setContext', 'backendHelper.status', 'loading');
    axios.post('http://127.0.0.1:3000/stop/' + getUserName()).then(() => {
        vscode.commands.executeCommand('setContext', 'backendHelper.status', 'stopped');
        vscode.commands.executeCommand(_const.COMMANDS.BACKENDREFRESH)
    })
}