const sysServ = require("../service/sys")

let register = async (ctx, next) => {
  const { name, password } = ctx.request.body
  ctx.body = await sysServ.register(name, password) || {}
}
let getUserList = async (ctx, next) => {
  ctx.body = await sysServ.getUserList() || {}
}

module.exports = {
  register,
  getUserList
}
