"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const docker_1 = require("./docker");
function main() {
    let docker = (0, docker_1.createDockerFactory)();
    docker === null || docker === void 0 ? void 0 : docker.getContainers('').then(res => {
        console.log('list containers: ', res);
    });
}
main();
//# sourceMappingURL=main.js.map