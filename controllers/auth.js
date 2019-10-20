/**
 * @Author: Firmiana
 * @Date: 2019-10-04 01:56:01
 * @Desc: AuthControlles
 */

const authServ = require("../service/auth"),
  reObj = require("../lib/reObj")

let login = async (ctx, next) => {
  try {
    const { account, pwd } = ctx.request.body
    if (!account) {
      reObj.code = 400
      reObj.msg = "账号必填且不能为空！"
      ctx.body = reObj
      return
    }
    if (!pwd) {
      reObj.code = 400
      reObj.msg = "密码必填且不能为空！"
      ctx.body = reObj
      return
    }
    if (!/^[A-Za-z0-9_]{4,20}$/.test(account)) {
      reObj.code = 400
      reObj.msg = "账号要求为4到20位，大小写字母、数字或下横杠！"
      ctx.body = reObj
      return
    }
    if (!/^[A-Za-z0-9_]{6,20}$/.test(pwd)) {
      reObj.code = 400
      reObj.msg = "密码要求为6到20位，大小写字母、数字或下横杠！"
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

let loginOut = async (ctx, next) => {
  try {
    const uInfo = await authServ.getUidByToken(ctx.request.header.token)
    // 0会员管理系统，1小程序，2iOS，3Android
    const clientMap = {
      0: 'web',
      1: 'miniprogram',
      2: 'app',
      3: 'app'
    }
    ctx.body = await authServ.logout(uInfo.uid, clientMap[0]) || {}
  } catch (e) {
    throw (e)
  }
}
let info = async (ctx, next) => {
  try {
    const uInfo = await authServ.getUidByToken(ctx.request.header.token)

    if (!uInfo) {
      reObj.code = 401
      reObj.msg = "获取用户信息失败！"
      ctx.body = reObj
      return
    }
    reObj.data = { ...uInfo }
    reObj.code = 200
    reObj.msg = "获取用户信息成功！"
    ctx.body = reObj
  } catch (e) {
    throw (e)
  }
}

module.exports = {
  login,
  loginOut,
  info
}