## 说明
在 `192.168.0.4` 服务器内，部署了一个 node_16 的镜像容器，内部安装了 `code-server` 部署云IDE

### code-server
code-server 是一个开源的 vscode 的部署框架， 运行后会启动一个 web 服务，可以访问网页进入 vscode 的编辑页面，文件存储路径位于 `/home` 下

## 插件目标功能

1. 一个占据 Activity Bar 的图标
2. Sidebar 的 Welcome 页面，正体内容。当发现可以加载到 logwire-backend 文件夹时切换为正体内容
3. Welcome 内拷贝当前 SSH key 按钮
4. 正体内，编译按钮，运行按钮
5. 编译后会打开两个页面，分别是配置文件。配置文件会存储在 node 环境内，第二次启动编译后，会优先打开 node 环境内的配置文件，避免重复修改
6. 运行按钮，与 node 交互，拿到 websocket 返回的日志信息，打印在 panel 面板内