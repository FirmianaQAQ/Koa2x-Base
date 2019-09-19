/**
 * @Author: Firmiana
 * @Date: 2019-09-19 16:44:08
 * @Desc: sys调用
 */

const { register, getUserList } = require('../controllers/sys')
module.exports = function (app) {
  // 注册
  app.post('/sys/register', register)
  //获取用户列表
  app.get('/sys/getUserList', getUserList)
}