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
  getContainers () {
    return this.docker.listContainers()
  }
  createContainer (username: string) {
    return this.docker.createContainer({
      name: 'logwire_backend_helper_node_' + username,
      "Tty": true,
      Image: 'node:16',
    })
  }
  execContainerCommand () {

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
