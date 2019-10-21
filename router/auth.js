/**
 * @Author: Firmiana
 * @Date: 2019-10-04 01:55:46
 * @Desc: authRouter
 */
const { login, loginOut, info } = require('../controllers/auth')

module.exports = function (app) {
  // 登录
  app.post('/auth/login', login)
  // 登出
  app.post('/auth/loginOut', loginOut)
  // 用户信息
  app.get('/auth/info', info)
}