/* global db */

// 登陆
//TODO:要改数据库
let getUserInfoByAccount = val => {
  let _sql = "SELECT id FROM admin_user_login WHERE d_flag=0 AND account = ? AND pwd = ? LIMIT 1"
  return db(_sql, val)
}


module.exports = {
  getUserInfoByAccount
}