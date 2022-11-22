import fs = require('fs')
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
