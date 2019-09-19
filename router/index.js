/**
 * @Author: Firmiana
 * @Date: 2019-09-19 16:04:01
 * @Desc: 统一输出Router
 */

module.exports = function (router) {
  const allRoutes = require('requireindex')(__dirname)
  for (const key in allRoutes) {
    allRoutes[key](router)
  }
}
