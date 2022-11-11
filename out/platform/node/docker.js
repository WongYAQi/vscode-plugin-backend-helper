"use strict";
/**
 * TODOLIST
 * * [ ] 根据操作系统的不同，获取到特定的 Docker 对象
 * * [ ] 查询容器状态
 * * [ ] 安装镜像容器
 * * [ ] 在容器内操作命令， Docker API.exec
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDockerFactory = void 0;
const axios_1 = require("axios");
const os = require('os');
class Docker {
    request(url) {
        throw new Error('request 方法需要被继承重载');
    }
    getContainers(name) {
        return this.request('/v1.41/containers/json');
    }
    createContainer(options) {
    }
    execContainerCommand(container, option) {
    }
}
class WindowDocker extends Docker {
    request(url) {
        return (0, axios_1.default)('http://192.168.0.190:2375' + url);
    }
}
function createDockerFactory() {
    if (os.platform() === 'win32') {
        return new WindowDocker();
    }
    else {
        return undefined;
    }
}
exports.createDockerFactory = createDockerFactory;
//# sourceMappingURL=docker.js.map