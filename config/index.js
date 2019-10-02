const pack = require('../package.json')

module.exports = {
  name: pack.name,
  version: pack.version,

  port: 12888,

  dbConfig: {
    host: '127.0.0.1', // 数据库IP
    port: 3306, // 数据库端口
    database: 'koa2x_base', // 数据库名称
    user: 'root', // 数据库用户名
    password: '123456789', // 数据库密码
  },

  // baseApi: '/', //可用于区分多项目 暂时用不到

  // 日志存放 logger为false就不会记录任何日志了
  logger: {
    logTo: 'console' // 日志输出到哪，默认是控制台
  }
}
