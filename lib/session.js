/**
 * @Author: Firmiana
 * @Date: 2019-10-01 14:58:27
 * @Desc: session 方法
 */
const { session } = require('../config/index'),
  crypto = require('crypto'),
  newRedis = require('./redis').default()

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

// 获取session
async function get(token, key) {
  const data = await newRedis.hget('session:' + token, key)
  return data ? JSON.parse(data) : null
}

// 删除session
async function del(token, key) {
  return !!(await newRedis.hdel('session:' + token, key))
}

/**
 * 封装好的存储登录信息到session的方法
 * ps. 支持单个用户多端登录，但每一端的token不一样，且有各自的token过期时长，在配置里设置过期时长
 * ps. 因为用户资料的共用同一个，所以如果用户在多个终端登录，会刷新所有终端的数据
 * @param uid
 * @param data
 * @param type 登录类型，用于判断session存多久。可选：miniProgram，iOS，Android。依次为：小程序，iOS，android。不在这里面的，根据配置里多久就多久
 * */
async function login(uid, data, type) {
  type = type.toLowerCase()
  const s = uid + ' ' + Date.now()
  const token = type + '_' + crypto.createHmac('sha256', s.slice(0, 5)).update(s).digest('base64')

  // 把token和uid的对应关系存起来
  if (!await this.set(token, 'uid', uid, session.expireMap[type] || session.expire)) {
    return false
  }

  const userKey = `uid:${uid}`

  // 查老token
  const oldToken = await this.get(userKey, `type:${type}`)
  if (oldToken) {
    this.del(oldToken, 'uid')
  }

  // 因为几种终端登录的用户资料都存在一个哈希里，所以这个哈希要保存最大的时间
  const maxTime = session.expireMap ? Math.max(...Object.values(session.expireMap)) : session.expire
  // 保存本体，并把新token存到本体同一个hash中
  const [res1, res2] = await Promise.all([
    this.set(userKey, 'user', data, maxTime),
    this.set(userKey, `type:${type}`, token, maxTime)
  ])

  if (res1 && res2) {
    return token
  }
  return false
}

// 获取登录时存储的信息
async function getLoginInfo(token) {
  const uid = await this.get(token, 'uid')
  if (!uid) return false
  return this.get(`uid:${uid}`, 'user')
}

async function getLoginInfoByUid(uid) {
  return this.get(`uid:${uid}`, 'user')
}

async function updateLoginInfo(uid, data) {
  const userKey = `uid:${uid}`
  return this.set(userKey, 'user', data)
}

async function loginout(uid, type) {
  const userKey = `uid:${uid}`
  // 查老token
  const oldToken = await this.get(userKey, `type:${type}`)
  if (oldToken) {
    this.del(oldToken, 'uid')
  }
}

module.exports = {
  set,
  get,
  del,
  login,
  getLoginInfo,
  getLoginInfoByUid,
  updateLoginInfo,
  loginout
}
