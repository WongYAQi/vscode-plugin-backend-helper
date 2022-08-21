node 服务端

### 初始化用户信息
method: GET
url: /init/:name

初始化用户信息，当用户第一次执行这个操作时，返回 ssh key,提醒用户完成导入

### 编译
### 运行
### 获取仓库地址
method: GET
url: /getFolderPath

获取当前用户的仓库地址

### 获取当前服务运行状态
method: GET
url: /status/:name
response: { backend: 'running' | 'stop', gateway: 'running' | 'stop' } | undefined

获取某用户当前的后端服务运行状态，是否正在运行;在用户没有初始化之前，返回 undefined
这一步决定了用户是否需要克隆仓库

### 克隆仓库
method: GET
url: /gitclone/:name

在用户文件夹下克隆 logwire-backend 仓库