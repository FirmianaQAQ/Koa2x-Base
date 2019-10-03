/**
 * @Author: Firmiana
 * @Date: 2019-10-04 01:56:01
 * @Desc: AuthControlles
 */

const authServ = require("../service/auth")

let login = async (ctx, next) => {
  // const { name, password } = ctx.request.body
  // ctx.body = await authServ.login(name, password) || {}
  ctx.body = 'this is a users/login response'
}

module.exports = {
  login
}