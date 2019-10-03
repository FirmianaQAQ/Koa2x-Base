const Koa = require('koa'),
  koaBody = require('koa-body'),
  cors = require('@koa/cors'),
  path = require('path'),
  router = require('koa-router')(),
  { port, redis } = require('../config/index'),
  pack = require('../package.json'),
  { db, pool } = require('./db'),
  Redis = require('koa-redis'),
  app = new Koa(),
  redisStore = Redis(redis)

async function init() {
  // 欢迎页
  app.use(async (ctx, next) => {
    ctx.body = `Hello ${pack.name || 'koa2x_base'}@${pack.version || '0.0.1'} ， Server Listen At Port ${port || 12888} ... `
    await next()
  })
  try {
    app.keys = ['Firmiana', 'Firmiana Yang']

    app.use(cors())

    const server = require('http').createServer(app.callback())

    // mysql
    global.db = db
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err)
        console.log('\x1B[31m%s\x1B[0m', `✗ [ ${app.env} ] >>> 数据库连接失败 ... `)
      } else {
        console.log('\x1B[32m%s\x1B[0m', `✔ [ ${app.env} ] >>> 数据库连接成功 ... `)
      }
    })

    // redis
    global.redis = redisStore
    redisStore.client.condition.select = 13
    redisStore.on('connect', function () {
      console.log('\x1B[32m%s\x1B[0m', `✔ [ ${app.env} ] >>> Redis连接成功 ... `)
    })
    redisStore.on('error', function () {
      // 若连接异常 则会不断报错
      console.log('\x1B[31m%s\x1B[0m', `✗ [ ${app.env} ] >>> Redis连接失败 ... `)
    })

    app.use(koaBody({
      multipart: true, // 支持文件上传
      // encoding: 'gzip',
      formidable: {
        uploadDir: path.join(__dirname, 'www/upload/'), // 设置文件上传目录
        keepExtensions: true,    // 保持文件的后缀
        maxFieldsSize: 2 * 1024 * 1024, // 文件上传大小
        onFileBegin: (name, file) => { // 文件上传前的设置
          // console.log(`name: ${name}`);
          // console.log(file);
        },
      }
    }))

    require(path.join(__dirname, '../router'))(router)
    app.use(router.routes()).use(router.allowedMethods())

    // 服务启动
    server.listen(port || 12888, () => {
      console.log('\x1B[32m%s\x1B[0m', `✔ [ ${app.env} ] >>> Server Listen At Port ${port || 12888} ... `)
    })
  } catch (e) {
    console.log(e)
    console.log('\x1B[31m%s\x1B[0m', `✗ [ ${app.env} ] >>> 服务启动失败 ... `)
  }
}

module.exports = {
  init
}