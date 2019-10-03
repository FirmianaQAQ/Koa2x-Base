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
  /**
   * @param redis ioredis 这个如果传null，则会使用global.redis，且允许global.redis在此类实例化以后才存在
   * @param option
   * @param option.prefix 前缀，默认取package.json中的name
   * @param option.canDebug 是否允许本类输出debug信息到控制台
   * @param option.originalKey 默认所有redis操作的key会加上前缀和后缀，把这个设为true则不会加。
   * */
  constructor(redis, option = {}) {
    this._redis = redis

    this.prefix = option.prefix || config.name

    this.canDebug = option.canDebug === false ? false : config.logger

    this.originalKey = !!option.originalKey
  }

  /**
   * 获取一个已有的，默认的实例，适用于想直接使用global.redis
   * @return NewRedis
   * */
  static default() {
    if (!instantiation) {
      instantiation = new NewRedis()
    }
    return instantiation
  }

  /**
   * 给外部使用的常量
   * */
  static get TYPES() {
    return {
      NONE: 'none', // (key不存在)
      STRING: 'string', // (字符串)
      LIST: 'list', // (列表)
      SET: 'set', // (集合)
      ZSET: 'zset', // (有序集)
      HASH: 'hash' // (哈希表)
    }
  }

  /**
   * ***** 专供外部使用的方法 *****
   * */

  set rd(redis) {
    this._redis = redis
  }

  get rd() {
    return this._redis || global.redis || (logger.error('无redis连接，请检查redis是否已启动') && null) || null
  }

  /**
   * 利用string做的缓存
   * @param name
   * @param data 不传，或传 undefined 表示查询模式。传 null 表示删除模式，其他均是存储模式
   * @param expire 过期时间，单位秒。不设，或为0，表示存储的数据无过期时间
   * @return boolean|mixed 查询模式，它是什么就是什么，不存在则是 undefined
   *                       删除模式和存储模式则返回操作成功还是失败，布尔值。
   *                       删除不存在的key会返回fasle
   *                       重复存储已存在的key，也能成功
   * */
  async cache(name, data, expire) {
    const kn = await this.checkKey(name, NewRedis.TYPES.STRING)
    if (data === undefined) { // 查
      data = await this.rd.get(kn)
      try {
        data = JSON.parse(data)
      } catch (e) { }
      return data
    } else if (data === null) { // 删
      return (await this.rd.del(kn)) > 0 // 删除会返回被删除的数量，但指定key的删除，只会删除一个，所以无需关心删除多少个
    } else if (expire && expire > 0) { // 存，有过期时间
      return (await this.rd.setex(kn, expire, JSON.stringify(data))) === 'OK'
    } else { // 存
      return (await this.rd.set(kn, JSON.stringify(data))) === 'OK'
    }
  }

  /**
   * 分页获取库中的key
   * */
  async getKeyByPage(pattern, page, pageNum) {
    // page = !page || page < 1 ? 1 : page
    // pageNum = !pageNum || pageNum < 1 ? 15 : pageNum
    // const data = await this.rd.scan((page - 1) * pageNum, pattern || this.prefix, pageNum)
    return this.rd.keys(pattern || `${this.prefix}:*`)
  }

  /**
   * ***** 扩展redis原生的方法 *****
   * */

  /**
   * [所有类型]
   * 删
   * @param key
   * @param type 要指明该key是什么类型，否则默认是字符串类型 NewRedis.TYPES 内有所有类型可选
   * */
  async del(key, type) {
    const kn = this.getKeyName(key, type || NewRedis.TYPES.STRING)
    return (await this.rd.del(kn)) > 0
  }

  /**
   * [所有类型]
   * 查询一个key的剩余时间，即它还有多久过期。
   * @param key
   * @param type 要指明该key是什么类型，否则默认是字符串类型 NewRedis.TYPES 内有所有类型可选
   * @param msec bool 是否返回毫秒，默认false
   * @return int 这个倒是能返回number类型，外部无需转换。如果key不存在或已过期，会返回 -2
   * */
  async ttl(key, type, msec) {
    const kn = this.getKeyName(key, type || NewRedis.TYPES.STRING)
    return msec ? this.rd.pttl(kn) : this.rd.ttl(kn)
  }

  /**
   * [字符串/整型]
   * set
   * @param key
   * @param value 只能传数字或者字符串
   * @param expire 单位秒
   * */
  async set(key, value, expire) {
    const kn = this.getKeyName(key, NewRedis.TYPES.STRING)
    if ((await this.rd.set(kn, value)) !== 'OK') {
      return false
    }
    if (expire) {
      await this.rd.expire(kn, expire)
    }
    return true
  }

  /**
   * [字符串/整型]
   * get
   * @param key
   * */
  async get(key) {
    const kn = this.getKeyName(key, NewRedis.TYPES.STRING)
    return this.rd.get(kn)
  }

  /**
   * [字符串/整型]
   * 给一个整型加1。
   * 如果 key 不存在，那么 key 的值会先被初始化为 0 ，然后再执行增加
   * ps. 如果该key已存在，并且不能转为数字，会报错。
   * @param key
   * @param increment 默认1
   * */
  async incrby(key, increment = 1) {
    const kn = this.getKeyName(key, NewRedis.TYPES.STRING)
    return (await this.rd.incrby(kn, increment)) > 0
  }

  /**
   * [哈希]
   * 修改/新建指定哈希的指定值，对已存在的哈希的其它值不会被改变
   * @return int 0设置失败。1成功，且field是一个新的字段。2成功，且field原来在map里面已经存在
   * */
  async hset(key, field, value, expire) {
    const kn = await this.checkKey(key, NewRedis.TYPES.HASH)
    const res = await this.rd.hset(kn, field, value)
    if (expire) {
      await this.rd.expire(kn, expire)
    }
    // res === 1 如果field是一个新的字段
    // res === 0 如果field原来在map里面已经存在
    return res === 1 ? 1 : (res === 0 ? 2 : 0)
  }

  /**
   * [哈希]
   * 读取
   * @return
   * */
  async hget(key, field) {
    const kn = await this.checkKey(key, NewRedis.TYPES.HASH, false)
    if (!kn) {
      return null
    }
    return this.rd.hget(kn, field)
  }
}

module.exports = NewRedis

console.log(logger)
