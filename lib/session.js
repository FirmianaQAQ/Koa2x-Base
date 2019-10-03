/**
 * @Author: Firmiana
 * @Date: 2019-10-01 14:58:27
 * @Desc: session 方法
 */
const packName = require('../config/index').session
const crypto = require('crypto')
const newRedis = require('./redis').default()

/**
 * 基础的把数据存到session的方法
 * ps. 每次调用此方法如果传入expire，都会重新设置过期时间。
 * ps. 过期时间是token的过期时间，不仅仅是这个key的过期时间
 * @param token 该session的token
 * @param key 这次要修改的key，如果是用户的资料，建议这里填'user'
 * @param value 此key的内容，会JSON后保存。如果一个用户对应一个token，建议把用户的资料都一起放这
 * @param expire 过期时长，单位秒，默认不设置。
 * */
async function set(token, key, value, expire) {
  if (!value) {
    return false
  }
  return !!(await newRedis.hset('session:' + token, key, JSON.stringify(value), expire))
}

module.exports = {
  set
}
