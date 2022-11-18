"use strict";
/**
 * TODOLIST
 * * [ ] 根据操作系统的不同，获取到特定的 Docker 对象
 * * [ ] 查询容器状态
 * * [ ] 安装镜像容器
 * * [ ] 在容器内操作命令， Docker API.exec
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDockerFactory = void 0;
const dockerode_1 = __importDefault(require("dockerode"));
const os = require('os');
class Docker {
    constructor() {
        this.host = 'host.docker.internal';
        this.docker = new dockerode_1.default({ host: this.host, port: 2375 });
    }
    getContainers() {
        return this.docker.listContainers();
    }
    createContainer() {
        this.docker.createContainer({
            name: 'logwire_backend_helper_node:' + 'username',
            Image: 'node:16',
        });
    }
    execContainerCommand() {
    }
}
class DevDocker extends Docker {
}
class ProductionDocker extends Docker {
    constructor() {
        super();
        this.host = '192.168.0.4';
    }
}
function createDockerFactory() {
    if (process.env['DOCKER_ENV'] === 'production') {
        return new ProductionDocker();
    }
    else {
        return new DevDocker();
    }
}
exports.createDockerFactory = createDockerFactory;
