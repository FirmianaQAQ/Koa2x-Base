/* global db */

// 获取非管理员登录的用户角色
let getByIds = val => {
  if (!val || !val.length) {
    return []
  }
  let _sql = "SELECT * FROM admin_role WHERE id in ( ? ) order by id ;"
  return db(_sql, [val])
}

module.exports = {
  getByIds
}