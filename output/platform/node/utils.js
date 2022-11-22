"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.readFile = void 0;
const fs = require("fs");
/**
 * 读取当前机器上的文件文本信息
 * @param path
 */
function readFile(path) {
    return fs.readFileSync(path, { encoding: 'utf-8' });
}
exports.readFile = readFile;
function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}
exports.sleep = sleep;
