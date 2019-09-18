const Koa = require('koa')
const router = require('koa-router')()

const config = require('./config/index.js')

const app = new Koa()

// koa设置
app.keys = ['Firmiana', 'Firmiana Yang']

app.use(async (ctx, next) => {
  ctx.body = "Hello Koa"
})

//服务启动
app.listen(config.port, () => {
  console.log('\x1B[36m%s\x1B[0m', `✔ [ ${app.env} ] >>> Server Listen At Port ${config.port} ... `);
})
