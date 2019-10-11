/**
 * @Author: Firmiana
 * @Date: 2019-10-04 01:52:31
 * @Desc: authServ
 */
const UserLoginPwdModel = require("../models/UserLoginPwdModel"),
  session = require('../lib/session'),
  md5 = require("md5"),
  reObj = {
    code: 0,
    data: {},
    message: "",
    t: Number(new Date())
  }

let login = async (account, pwd) => {
  let loginType = 'web'
  const r = await accountLogin(account, pwd)
  const res = {}
  if (r && r.length) {
    const uid = r[0].id

    res.uid = uid
    // 把用户信息存到session中
    const token = await session.login(uid, {
      uid
    }, loginType)
    if (!token) {
      return [0, '无法使用redis，登录失败']
    }
    res.token = token

    reObj.code = 200
    reObj.message = "登陆成功！"
    reObj.data = res
  } else {
    reObj.code = 401
    reObj.message = "账号或密码不正确，登录失败！"
  }
  return reObj
}

let accountLogin = async (account, pwd) => {
  // console.log(account, pwd)
  const res = await UserLoginPwdModel.getUserInfoByAccount([
    account,
    md5(pwd)
  ])
  return res
}

module.exports = {
  login
}
