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
const fs_1 = require("fs");
const tar = require('tar-fs');
const os = require('os');
class Docker {
    constructor(host = 'host.docker.internal') {
        this.docker = new dockerode_1.default({ host: host, port: 2375 });
    }
    async checkAndCreateContainer({ name, img, env, port, cmd, expose }) {
        let targetContainerName = 'logwire_backend_helper.' + name;
        let containers = await this.docker.listContainers({ filters: JSON.stringify({ status: ['created', 'restarting', 'running', 'removing', 'paused', 'exited', 'dead'], name: [targetContainerName] }) });
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
                Env: env,
                Cmd: cmd,
                ExposedPorts: expose,
                HostConfig: {
                    PortBindings: port || {}
                }
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
    async execContainerCommand({ container, cmd, dir, quiet }) {
        let exec = await container.exec({
            Cmd: cmd instanceof Array ? cmd : cmd.split(' '),
            AttachStdout: true,
            AttachStderr: true,
            WorkingDir: dir
        });
        let result = await exec?.start({});
        return new Promise((resolve, reject) => {
            result?.on('data', chunk => !quiet && console.log(chunk.toString()));
            result?.on('error', error => console.log('[' + cmd + '] [error] ' + error));
            result?.on('end', async () => {
                let info = await exec.inspect();
                if (info?.ExitCode) {
                    reject({ command: cmd, message: 'ExitCode: ' + info.ExitCode, exitcode: info.ExitCode });
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
    async getFile({ container, path }) {
        return new Promise(async (resolve, reject) => {
            try {
                let readstream = await container.getArchive({ path });
                let tempFilePath = './temp_' + Math.random() + '.tar';
                let tempUnpackFolder = tempFilePath.replace('.tar', '');
                let tempUnpackFile = tempUnpackFolder + '/' + path.replace(/.*\//, '');
                (0, fs_1.mkdirSync)(tempUnpackFolder);
                let writestream = (0, fs_1.createWriteStream)(tempFilePath);
                readstream.pipe(writestream).on('finish', () => {
                    (0, fs_1.createReadStream)(tempFilePath).pipe(tar.extract(tempUnpackFolder)).on('finish', () => {
                        let content = (0, fs_1.readFileSync)(tempUnpackFile, { encoding: 'utf-8' });
                        (0, fs_1.rmSync)(tempFilePath);
                        (0, fs_1.rmSync)(tempUnpackFolder, { recursive: true, force: true });
                        resolve(content);
                    });
                });
            }
            catch (err) {
                reject(err);
            }
        });
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
