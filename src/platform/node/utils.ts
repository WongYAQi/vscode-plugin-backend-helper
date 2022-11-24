import fs = require('fs')
import path = require('path')
/**
 * 读取当前机器上的文件文本信息
 * @param path 
 */
export function readFile (path: string) {
  return fs.readFileSync(path, { encoding: 'utf-8' })
}

export function sleep (ms: number) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

export function getUserConfig (username: string, config: string) {
  let jsonPath = path.resolve(__dirname, './database/' + username + '.json')
  let jsonStr = fs.readFileSync(jsonPath, { encoding: 'utf-8' })
  let json = JSON.parse(jsonStr) || {}
  return json[config]
}

export function setUserConfig (username: string, config: string, value: string) {
  let jsonPath = path.resolve(__dirname, './database/' + username + '.json')
  let jsonStr = fs.readFileSync(jsonPath, { encoding: 'utf-8' })
  let json = JSON.parse(jsonStr) || {}
  json[config] = value
  fs.writeFileSync(jsonPath, JSON.stringify(json), { encoding: 'utf-8' })
}
