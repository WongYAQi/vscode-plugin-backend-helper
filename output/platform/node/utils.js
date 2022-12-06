"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserConfig = exports.getUserConfig = exports.sleep = exports.readFile = void 0;
const fs = require("fs");
const path = require("path");
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
function getUserConfig(username, config) {
    let jsonPath = path.resolve(__dirname, './database/' + username + '.json');
    let jsonStr = fs.readFileSync(jsonPath, { encoding: 'utf-8' });
    let json = JSON.parse(jsonStr) || {};
    return json[config];
}
exports.getUserConfig = getUserConfig;
function setUserConfig(username, config, value) {
    let jsonPath = path.resolve(__dirname, './database/' + username + '.json');
    let jsonStr = fs.readFileSync(jsonPath, { encoding: 'utf-8' });
    let json = JSON.parse(jsonStr) || {};
    json[config] = value;
    fs.writeFileSync(jsonPath, JSON.stringify(json), { encoding: 'utf-8' });
}
exports.setUserConfig = setUserConfig;
