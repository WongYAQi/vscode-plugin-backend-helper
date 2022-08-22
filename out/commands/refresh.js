"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const enterUserName_1 = require("./enterUserName");
/**
 * 更新插件状态，主要内容有：当前用户的两个服务的运行状态
 * @returns
 */
function refresh() {
    const username = (0, enterUserName_1.getUserName)();
    return (0, axios_1.default)('http://127.0.0.1:3000/status/' + username).then(res => {
        return [
            { id: 'backend', label: 'backend', status: res.data.backend },
            { id: 'gateway', label: 'gateway', status: res.data.gateway }
        ];
    });
}
exports.default = refresh;
//# sourceMappingURL=refresh.js.map