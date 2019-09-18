const Koa = require('koa')
let Router = require('koa-router');
let cors = require('koa-cors');

const App = new Koa()

App.use(async (ctx, next) => {
  ctx.body = "Hello Koa"
  await next();
})
App.listen(12888, () => {
  console.log('\x1B[36m%s\x1B[0m', 'Server Run At Port:12888 ... ');
})