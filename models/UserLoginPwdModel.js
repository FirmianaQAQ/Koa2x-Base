/* global db */

// 登录
let getUserInfoByAccount = val => {
  let _sql = "SELECT uid FROM admin_user_login WHERE d_flag = 0 AND account = ? AND pwd = ? LIMIT 1 ;"
  return db(_sql, val)
}

// 获取登录的用户信息
let getById = val => {
  let _sql = "SELECT * FROM admin_user WHERE d_flag = 0 AND id = ? LIMIT 1 ;"
  return db(_sql, val)
}

module.exports = {
  getUserInfoByAccount,
  getById
}