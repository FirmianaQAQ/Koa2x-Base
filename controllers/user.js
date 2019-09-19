const userServ = require("../service/user")

let register = async (ctx, next) => {
  const { name, password } = ctx.request.body
  ctx.body = await userServ.register(name, password) || {}
}
let getUserList = async (ctx, next) => {
  ctx.body = await userServ.getUserList() || {}
}

module.exports = {
  register,
  getUserList
}
