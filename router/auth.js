/**
 * @Author: Firmiana
 * @Date: 2019-10-04 01:55:46
 * @Desc: authRouter
 */
const { login } = require('../controllers/auth')

module.exports = function (app) {
  // 登陆
  app.post('/auth/login', login)
}