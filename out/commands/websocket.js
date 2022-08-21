"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const vscode = require("vscode");
const storedChannel = new Map();
function initialWebsocketConnection(username) {
    const socket = (0, socket_io_client_1.io)('http://127.0.0.1:3000', { auth: { username }, secure: true, reconnection: true, rejectUnauthorized: false });
    socket.on('connect', () => {
        console.log(username + ' connect !');
    });
    socket.on("connect_error", (err) => {
        console.log(err);
    });
    socket.on('compile', function (data) {
        let channel = storedChannel.get(username + '_compile');
        if (!channel) {
            channel = vscode.window.createOutputChannel(username + '_compile');
        }
        channel.show();
        channel.append(data + '\n');
    });
}
exports.default = initialWebsocketConnection;
//# sourceMappingURL=websocket.js.map