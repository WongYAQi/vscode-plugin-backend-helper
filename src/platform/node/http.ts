import express = require("express");
import session = require('express-session')
var app = express();


// middleware to test if authenticated
function isAuthenticated (req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.session.user) next()
  else next('route')
}

// API.1 接收用户输入的用户名并存在 session
app.use(session({
  secret: 'vscode-plugin-backend-helper',
  resave: false,
  saveUninitialized: true
}))
app.use(express.json())

app.post('/api/login', function (req, res) {
  req.session.regenerate(function (err) {
    if (err) {
      res.send(500)
      return
    }
    req.session.user = req.body.username
    req.session.save(function (err) {
      if (err) {
        res.send(500)
      } else {
        res.send(200)
      }
    })
  })
})

// API.2 获取当前 username 的信息, 包括：服务运行状态
app.get('/api/getProjectInfo', isAuthenticated, function (req, res) {

})
// API.3 初始化项目
app.post('/api/installProject', isAuthenticated, function (req, res) {

})
// API.4 运行项目
// API.5 停止项目


app.listen(3000)