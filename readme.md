# Logwire Development 开发工具

## 平台部署
在 `192.168.0.4` 服务器上，创建 `node` 容器，并暴露主机端口 `-p 25555:25555`，并在容器中执行

> cd /var
> git clone https://github.com/WongYAQi/vscode-plugin-backend-helper.git
> cd vscode-plugin-backend-helper

然后切换 `dev` 分支，执行

```bash
npm install
npm run build
```

执行完成后，进入 `src/platform/node` 目录，执行 node 服务

```bash
cd src/platform/node
node main.js
```

启动后，可以在个人电脑上访问 `http://192.168.0.4:25555` 打开网页，根据网页指示操作