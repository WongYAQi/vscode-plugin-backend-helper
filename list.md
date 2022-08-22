插件的 Sidebar 中显示的内容，应该是当前用户的服务运行状态，以及其他信息。用 title 区域表现用户

可以使用自定义的 when 关键字，注册后可以判断
`vscode.commands.executeCommand('setContext', 'backendHelper.status', 'running' | 'stopped' | 'loading');`  
三种状态分别代表 `运行中` `已停止` `处理中`  
处于 `运行中` 时显示 `停止` 按钮
处于 `stopped` 时显示 `编译` `运行` 按钮  
处于 `处理中` 时不显示按钮

TreeView 的每一个节点显示纯文本信息，用JSON来举例  
```json
[
    { "label": "用户名: xxxx" },
    { "label": "Backend 服务: xxxx" },
    { "label": "Gateway 服务: xxxx" }
]
```

