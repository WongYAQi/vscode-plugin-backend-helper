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
    constructor(host = 'host.docker.internal') {
        this.docker = new dockerode_1.default({ host: host, port: 2375 });
    }
    async checkAndCreateContainer({ name, img, env }) {
        let targetContainerName = 'logwire_backend_helper.' + name;
        let containers = await this.docker.listContainers({ filters: `{ "name": ["${targetContainerName}"] }` });
        if (containers.length) {
            let container = await this.docker.getContainer(containers[0].Id);
            return container;
        }
        else {
            let images = await this.docker.listImages({ filters: `{ "reference": ["${img}"] }` });
            if (images.length === 0) {
                await new Promise((resolve, reject) => {
                    this.docker.pull(img, (err, stream) => {
                        this.docker.modem.followProgress(stream, onFinished, onProgress);
                        function onFinished(err, output) {
                            if (!err) {
                                resolve();
                            }
                            else {
                                console.log(err);
                                reject(err);
                            }
                        }
                        function onProgress(event) {
                        }
                    });
                });
            }
            return this.docker.createContainer({
                name: targetContainerName,
                "Tty": true,
                Image: img,
                Env: env
            });
        }
    }
    async startContainer({ container }) {
        let info = await container.inspect();
        if (info.State.Running) {
        }
        else {
            await container.start();
        }
        return container;
    }
    async execContainerCommand({ container, cmd, dir }) {
        let exec = await container.exec({
            Cmd: cmd instanceof Array ? cmd : cmd.split(' '),
            AttachStdout: true,
            AttachStderr: true,
            WorkingDir: dir
        });
        let result = await exec?.start({});
        return new Promise((resolve, reject) => {
            result?.on('data', chunk => console.log('command is', cmd, ' and log is', chunk.toString()));
            result?.on('error', error => console.log('command is', cmd, ' and error is', error));
            result?.on('end', async () => {
                let info = await exec.inspect();
                if (info?.ExitCode) {
                    reject({ command: cmd, message: 'ExitCode: ' + info.ExitCode });
                }
                else {
                    resolve();
                }
            });
        });
    }
    async writeFile({ container, path, text }) {
        await this.execContainerCommand({ container, cmd: ['bash', '-c', 'echo ' + text + ' > ' + path] });
    }
    async appendFile({ container, path, text }) {
        await this.execContainerCommand({ container, cmd: ['bash', '-c', 'echo ' + text + ' >> ' + path] });
    }
}
class DevDocker extends Docker {
    constructor() {
        super('localhost');
    }
}
class ProductionDocker extends Docker {
    constructor() {
        super('192.168.0.4');
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
