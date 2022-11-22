/**
 * TODOLIST
 * * [ ] 根据操作系统的不同，获取到特定的 Docker 对象
 * * [ ] 查询容器状态
 * * [ ] 安装镜像容器
 * * [ ] 在容器内操作命令， Docker API.exec
 */

import Dockerode from 'dockerode'
import { resolve } from 'path'
const os = require('os')
class Docker {
  docker: Dockerode
  constructor (host = 'host.docker.internal') {
    this.docker = new Dockerode({ host: host, port: 2375 })
  }
  async checkAndCreateContainer ({ name, img, env }: { name: string, img: string, env?: string[] }) {
    let targetContainerName = 'logwire_backend_helper.' + name
      let containers = await this.docker.listContainers({ filters: `{ "name": ["${targetContainerName}"] }` })
      if (containers.length) {
        let container = await this.docker.getContainer(containers[0].Id)
        return container
      } else {
        let images = await this.docker.listImages({ filters: `{ "reference": ["${img}"] }` })
        if (images.length === 0) {
          await new Promise<void>((resolve, reject) => {
            this.docker.pull(img, (err: any, stream: any) => {
              this.docker.modem.followProgress(stream, onFinished, onProgress);
              function onFinished(err: any, output: any) {
                  if (!err) {
                    resolve()
                  } else {
                    console.log(err);
                    reject(err)
                  }
              }
              function onProgress(event: any) {
              }
            })
          })
        } 
        return this.docker.createContainer({
          name: targetContainerName,
          "Tty": true,
          Image: img,
          Env: env
        })
      }
  }
  async startContainer({ container }: { container: Dockerode.Container }) {
    let info = await container.inspect()
    if (info.State.Running) {
    } else {
      await container.start()
    }
    return container
  }
  async execContainerCommand ({ container, cmd, dir }: {container: Dockerode.Container, cmd: string | string[], dir?: string }) {
    let exec = await container.exec({
      Cmd: cmd instanceof Array ? cmd : cmd.split(' '),
      AttachStdout: true,
      AttachStderr: true,
      WorkingDir: dir
    })
    let result = await exec?.start({})
    return new Promise<void>((resolve, reject) => {
      result?.on('data', chunk => console.log('command is', cmd, ' and log is', chunk.toString()))
      result?.on('error', error => console.log('command is', cmd, ' and error is', error))
      result?.on('end', async () => {
        let info = await exec.inspect()
        if (info?.ExitCode) {
          reject({ command: cmd, message: 'ExitCode: ' + info.ExitCode })
        } else {
          resolve()
        }
      })
    })
  }

  async writeFile ({ container, path, text }: { container: Dockerode.Container, path: string, text: string }) {
    await this.execContainerCommand({ container, cmd: ['bash', '-c', 'echo ' + text + ' > ' + path] })
  }
  async appendFile({ container, path, text }: { container: Dockerode.Container, path: string, text: string }) {
    await this.execContainerCommand({ container, cmd: ['bash', '-c', 'echo ' + text + ' >> ' + path] })
  }
}

class DevDocker extends Docker {
  constructor () {
    super('localhost')
  }
}

class ProductionDocker extends Docker {
  constructor () {
    super('192.168.0.4')
  }
}

export function createDockerFactory () {
  if (process.env['DOCKER_ENV'] === 'production') {
    return new ProductionDocker()
  } else {
    return new DevDocker()
  }
}
