/**
 * @Author: Firmiana
 * @Date: 2019-09-19 16:44:08
 * @Desc: user调用
 */

const { register, getUserList } = require('../controllers/user')
module.exports = function (app) {
  // 注册
  app.post('/user/register', register)
  //获取用户列表
  app.get('/user/getUserList', getUserList)
}