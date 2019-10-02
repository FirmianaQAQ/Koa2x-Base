/**
 * @Author: Firmiana
 * @Date: 2019-10-02 14:53:36
 * @Desc: redis调用封装
 */

let config = require('../config/index')
const logger = new (require('./log'))('newRedis')

// 缓存一个实例，不用时时实例化
let instantiation

class NewRedis {

}

module.exports = NewRedis

console.log(logger)
