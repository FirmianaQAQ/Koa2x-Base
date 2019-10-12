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

  redis: {
    host: 'localhost',
    port: 6379,
    db: 7,
    auth: ''
  },

  // baseApi: '/', //可用于区分多项目 暂时用不到

  // 日志存放 logger为false就不会记录任何日志了
  logger: {
    logTo: 'console' // 日志输出到哪，默认是控制台
  },

  // session
  session: {
    allowMultyLogin: false, // true则允许多点登录（一个账号多处登录）
    expire: 2 * 60 * 60, // 默认过期时间，单位秒
    prefix: pack.name,

    // 多终端时配置过期时间，用了这个，上面那个就是当终端不是下面这些时的值，里面的key要小写
    expireMap: {
      'thirdtoken': 24 * 60 * 60, // 第三方token登录的，让他们的session久一点
      'web': 2 * 60 * 60, // 网页
      'miniprogram': 24 * 60 * 60, // 小程序
      'mobile': 30 * 24 * 60 * 60, // 手机号登录，因为app有手机号登录，所以设长一点吧
      'app': 30 * 24 * 60 * 60, // ios和安卓统一使用这个（此时他们会共用一个token，如果不想共用，就用下面两个）
      'ios': 30 * 24 * 60 * 60, // ios
      'android': 30 * 24 * 60 * 60 // Android
    }
  },

}
