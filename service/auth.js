/**
 * @Author: Firmiana
 * @Date: 2019-10-04 01:52:31
 * @Desc: authServ
 */

const UserLoginPwdModel = require("../models/UserLoginPwdModel"),
  RoleModel = require('../models/RoleModel'),
  session = require('../lib/session'),
  md5 = require("md5"),
  reObj = require("../lib/reObj")

let login = async (account, pwd) => {
  let loginType = 'web'
  const r = await accountLogin(account, pwd)
  let res = {}

  if (r && r.length) {
    const uid = r[0].uid

    let uInfo = await getUserInfoById(uid)
    uInfo = uInfo[0]

    if (!uInfo) {
      reObj.code = 401
      reObj.msg = "用户不存在！"
      return reObj
    }
    // 处理超级管理员
    if (uInfo.id === 1) {
      uInfo.roles = []
      // permissions为1时为全部权限
      uInfo.permissions = [1]
    } else {
      uInfo.permissions = uInfo.permissions.split(',')
      uInfo.roles = uInfo.roles ? await RoleModel.getByIds(uInfo.roles.split(',')) : []
      uInfo.roles.forEach(i => {
        if (i.permissions) {
          uInfo.permissions.push(...i.permissions.split(','))
        }
      })
      uInfo.permissions = [...new Set(uInfo.permissions.map(i => parseInt(i)))]
      uInfo.projects = uInfo.projects.split(',').map(i => parseInt(i))
    }

    res = uInfo
    res.uid = uid
    // 把用户信息存到session中
    const token = await session.login(uid, res, loginType)
    if (!token) {
      return [0, '无法使用redis，登录失败']
    }
    res.token = token

    reObj.code = 200
    reObj.msg = "登录成功！"
    // login只返回token
    reObj.data = res.token
  } else {
    reObj.code = 401
    reObj.msg = "账号或密码不正确，登录失败！"
  }
  return reObj
}

let getUserInfoById = async uid => {
  const res = await UserLoginPwdModel.getById(uid)
  return res
}

let accountLogin = async (account, pwd) => {
  const res = await UserLoginPwdModel.getUserInfoByAccount([
    account,
    md5(pwd)
  ])
  return res
}

let getUidByToken = async (token) => {
  const uInfo = await session.getLoginInfo(token)
  return uInfo
}

let logout = async (uid, type) => {
  // 登录类型 web|miniprogram|app|app
  await session.loginout(uid, type)
  reObj.code = 200
  reObj.msg = "登出成功！"
  return reObj
}

module.exports = {
  login,
  logout,
  getUidByToken
}
