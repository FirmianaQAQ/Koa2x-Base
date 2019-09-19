const config = {
  name: 'Koa2x-Base',
  version: '0.0.1',

  port: 12888,

  dbConfig: {
    host: '127.0.0.1', // 数据库IP
    port: 3306, // 数据库端口
    database: 'koa2x_base', // 数据库名称
    user: 'root', // 数据库用户名
    password: '123456789', // 数据库密码
  }

  // baseApi: '/', //可用于区分多项目 暂时用不到
}

module.exports = config