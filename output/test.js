const child_process = require('child_process')

child_process.exec('useradd helper', function (err, stdout, stdin) {
  if (!err) {
    console.log('创建成功')
  } else {
    console.error(err)
  }
})