/**
 * Logs 模块
 * 使用 LogsModule 包裹后，为某个安装流程增加日志处理，并且对外还是返回 Promise 对象
 */

import { Socket } from "socket.io/dist/socket";
import { getUserConfig, setUserConfig } from "./utils";

let websocket: Socket
export function setWebsocketIo (io: Socket) {
  websocket = io
}
export function getWebsocketIo () {
  return websocket
}
export default class LogUtil {
  // 根据 log 判断用户是否已经执行过
  static async run (username: string, log: string, cb: () => Promise<void>) {
    let key = 'InstallSteps'
    let steps: string[] = getUserConfig(username, key) || []
    let socket = getWebsocketIo()
    if (steps.includes(log)) {
      socket.emit('Log', log)
      return
    } else {
      socket.emit('Log', '[Progress]' + log + '中...')
      await cb()
      steps.push(log)
      setUserConfig(username, key, steps)
      socket.emit('Log', '[Log]' + log + '完成')
    }
  }
}