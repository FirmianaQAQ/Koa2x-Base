/* global db */

// 登陆
let getUserInfoByAccount = val => {
  let _sql = "SELECT uid FROM admin_user_login WHERE d_flag = 0 AND account = ? AND pwd = ? LIMIT 1 ;"
  return db(_sql, val)
}

// 获取登陆的用户信息
let getById = val => {
  let _sql = "SELECT * FROM admin_user WHERE d_flag = 0 AND id = ? LIMIT 1 ;"
  return db(_sql, val)
}

module.exports = {
  getUserInfoByAccount,
  getById
}