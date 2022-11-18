/**
 * Logs 模块
 * 使用 LogsModule 包裹后，为某个安装流程增加日志处理，并且对外还是返回 Promise 对象
 */

/**
 * LogUtil.start('title', this.docker.createContainer({}))
 * 就会往页面发送日志 “开始安装 title 模块”
 * 
 * promise 完毕后，会给页面发送 "安装 title 模块成功" 替换之前的日志
 */
class LogUtil {
  
}