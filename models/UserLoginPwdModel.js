/* global db */

// 登陆
let getUserInfoByAccount = val => {
  let _sql = "SELECT id FROM user_info WHERE d_flag=0 AND name = ? AND password = ? LIMIT 1"
  return db(_sql, val)
}


module.exports = {
  getUserInfoByAccount
}