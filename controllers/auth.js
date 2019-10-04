/**
 * @Author: Firmiana
 * @Date: 2019-10-04 01:56:01
 * @Desc: AuthControlles
 */

const authServ = require("../service/auth"),
  reObj = {
    code: 0,
    data: {},
    message: "",
    t: Number(new Date())
  }

let login = async (ctx, next) => {
  try {
    const { account, pwd } = ctx.request.body
    if (!account) {
      reObj.message = "account必填且不能为空！"
      ctx.body = reObj
      return
    }
    if (!pwd) {
      reObj.message = "pwd必填且不能为空！"
      ctx.body = reObj
      return
    }
    if (!/^[A-Za-z0-9_]{4,20}$/.test(account)) {
      reObj.code = 400
      reObj.message = "account要求为4到20位，大小写字母、数字或下横杠！"
      ctx.body = reObj
      return
    }
    if (!/^[A-Za-z0-9_]{6,20}$/.test(pwd)) {
      reObj.code = 400
      reObj.message = "pwd要求为6到20位，大小写字母、数字或下横杠！"
      ctx.body = reObj
      return
    }
    ctx.body = await authServ.login(
      account, pwd
    ) || {}
  } catch (e) {
    throw (e)
  }
}

module.exports = {
  login
}