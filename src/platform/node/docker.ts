/**
 * TODOLIST
 * * [ ] 根据操作系统的不同，获取到特定的 Docker 对象
 * * [ ] 查询容器状态
 * * [ ] 安装镜像容器
 * * [ ] 在容器内操作命令， Docker API.exec
 */

import Dockerode from 'dockerode'
const os = require('os')
class Docker {
  docker: Dockerode
  constructor (host = 'host.docker.internal') {
    this.docker = new Dockerode({ host: host, port: 2375 })
  }
  getContainers (filter: {}) {
    return this.docker.listContainers(filter)
  }
  async checkAndCreateContainer ({ name, img }: { name: string, img: string }) {
    let targetContainerName = 'logwire_backend_helper.' + name
    let containers = await this.getContainers({ filter: `{"name": ["${targetContainerName}"]}`})
    if (containers.length > 0) return containers[0]
    return this.docker.createContainer({
      name: targetContainerName,
      "Tty": true,
      Image: img,
    })
  }
  async execContainerCommand ({ container, cmd, dir }: {container: Dockerode.Container, cmd: string | string[], dir: string }) {
    let exec = await container.exec({
      Cmd: cmd instanceof Array ? cmd : cmd.split(' '),
      AttachStdout: true,
      AttachStderr: true,
      WorkingDir: dir
    })
    let result = await exec?.start({ Tty: true })
    return new Promise<void>((resolve, reject) => {
      result?.on('end', async () => {
        let info = await exec.inspect()
        if (info?.ExitCode) {
          reject(info.ExitCode.toString())
        } else {
          resolve()
        }
      })
    })
  }

  async writeFile ({ container, path, text }: { container: Dockerode.Container, path: string, text: string }) {
    await this.execContainerCommand({ container, cmd: ['echo', text, '>', path], dir: '' })
  }
  async appendFile({ container, path, text }: { container: Dockerode.Container, path: string, text: string }) {
    await this.execContainerCommand({ container, cmd: ['echo', text, '>>', path], dir: '' })
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
