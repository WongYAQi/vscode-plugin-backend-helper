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


## TODO list

1. 主页显示
2. 登录页显示
3. 数据库服务(优先级较低)
> 人员表
> 配置文件（backend, gateway）
> 配置表，每个人独有的 rsa key、GIT 用户名 邮箱等，根据个人区分的配置文件
> 日志文件（启动时对各个镜像的检查，安装流程的日志）（希望下一次打开系统时显示上一次完成的日志）

4. 常用工具跳转： vscode web (code-server), console web (wetty)

5. 初始化功能，生成用户的镜像容器，并检测是否存在 postgresql, redis, zookeeper, rookitmq; 在容器内安装软件 code-server, nginx, maven, openjdk-1.8

> 需要加入中断方式，避免在 .4 服务器上重复安装容器；启动中断后，将之前的操作还原到之前的样子 => 事务

6. 启动服务时发现不存在配置文件，提醒用户，拷贝默认配置文件后跳转到 vscode web 页面，内容则是刚才打开的页面
7. 启动服务时发现配置文件存在，则进行启动前的检测，每次检查都会在首页的日志区提示出来
	7.1 搜索配置文件中的 postgresql 的用户名和密码，发现和默认不同则报错
	7.2 检查 redis 的端口地址和容器地址是否相同，不相同则报错
	7.3 检查 server-port 端口号，然后编写相应的 nginx 的代码转发的配置，因为外部是访问的容器端口，所以只能在容器内转发
	7.4 缺少 tenants.host 配置则中断运行，提醒用户
	7.5 根据 tenants.database-schema 创建 postgresql 中的 schema ,已存在则忽略
	7.6 检查 MQ 地址，不相同则报错
	7.7 检查服务打包，如果没有打包则进行打包过程
	
8. 启动服务，链接对应的容器，向容器发送请求 /api/execute ，此时提醒用户打开 Console 窗口观察日志
9. 启动服务成功后，需要将上一次编写的配置文件，保存到平台端目录下

10.pre. 切换分支预备，分支仓库默认
10. 切换分支，进入 Git 页面，点击按钮显示切换分支页面，选择分支号
11. 切换分支，点击按钮提交后，会默认停止服务，删除文件 ，并且不会默认基于新分支进行打包，只有等到下一次点击运行按钮后，发现目录不存在，才会重新打包
12. 拉取分支，拉取远程分支，停止服务，拉取后重新打包，打包后重新运行

12. 查看日志，点击后，会调用 Console Web ,打开新的弹窗页，页面中已经显示了 pm2 log 的内容

