/**
 * TODOLIST
 * * [ ] 根据操作系统的不同，获取到特定的 Docker 对象
 * * [ ] 查询容器状态
 * * [ ] 安装镜像容器
 * * [ ] 在容器内操作命令， Docker API.exec
 */

import axios, { AxiosResponse } from 'axios'
import Dockerode from 'dockerode'
const os = require('os')
class Docker {
  request<T = any>(url: string): Promise<AxiosResponse<T>> {
    throw new Error('request 方法需要被继承重载')
  }
  getContainers () {
    let docker1 = new Dockerode({ host: 'host.docker.internal', port: 2375 })
    return docker1.listContainers()
  }
  createContainer () {

  }
  execContainerCommand () {

  }
}

class WindowDocker extends Docker {
  override request<T = any>(url: string): Promise<AxiosResponse<T>> {
    return axios('http://192.168.0.190:2375' + url)
  }
  override getContainers() {
    let docker1 = new Dockerode({ host: '192.168.0.190', port: 2375 })
    return docker1.listContainers()
  }
}

class LinuxDocker extends Docker {
  override request<T = any>(url: string): Promise<AxiosResponse<T>> {
    return axios('http://192.168.0.190:2375' + url)
  }
}
class ProductionDocker extends Docker {

}

export function createDockerFactory () {
  if (os.platform() === 'win32') {
    return new WindowDocker()
  } else if (process.env['DOCKER_ENV'] === 'production') {
    return new ProductionDocker()
  } else {
    return new LinuxDocker()
  }
}
