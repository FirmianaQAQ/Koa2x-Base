/**
 * @Author: Firmiana
 * @Date: 2019-10-02 14:53:36
 * @Desc: redis调用封装
 */

/* global redis */

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

  /**
   * [哈希]
   * 把哈希集的所有数据都取出来
   * field越多 取的速度越慢
   * */
  async hgetall(key) {
    const kn = await this.getKeyName(key, NewRedis.TYPES.HASH)
    return this.rd.hgetall(kn)
  }

  /**
   * [哈希]
   * 删
   * @return int 返回从哈希集中成功移除的域的数量，不包括指出但不存在的那些域
   * */
  async hdel(key, field) {
    const kn = await this.checkKey(key, NewRedis.TYPES.HASH, false)
    if (!kn) { return null }
    field = field instanceof Array ? field : [field]
    return this.rd.hdel(kn, ...field)
  }

  /**
   * 哈希
   * 给hash内的某个member数量+1，但是要注意，如果这个member的值本身不能被转为数字，则会报错
   * @param key
   * @param field
   * @param increment
   * @param expire 单位秒。这个时间设置的是整个哈希的时间，不仅仅是这个field的时间，慎用
   * @return int 返回该member的最新值，注意，这里返回的是int，用hget返回的是string，虽然数值没错，但类型不一样。
   * */
  async hIncrby(key, field, increment, expire) {
    const kn = this.getKeyName(key, NewRedis.TYPES.HASH)
    const res = await this.rd.hincrby(kn, field, increment)
    if (expire) {
      await this.rd.expire(kn, expire)
    }
    return res
  }

  /**
   * [无序集合]
   * 添加/创建某无序集合
   * @param key
   * @param member 支持多个，数组或者字符串均可
   * @return int 返回新成功添加到集合里元素的数量，不包括已经存在于集合中的元素.
   * */
  async sadd(key, member, expire) {
    const kn = this.getKeyName(key, NewRedis.TYPES.SET)
    const res = await this.rd.sadd(kn, member)
    if (res && expire) {
      await this.rd.expire(kn, expire)
    }
    return res
  }

  /**
   * [无序集合]
   * 查询某无序集合的所有成员数
   * @param key
   * @return int 返回元素的数量，如果key不存在,则返回 0
   * */
  async scard(key) {
    const kn = this.getKeyName(key, NewRedis.TYPES.SET)
    return this.rd.scard(kn)
  }

  /**
   * [无序集合]
   * 从无序集合中移除某成员
   * @param key
   * @param member 支持多个，数组或者字符串均可
   * @return int 返回从集合中移除元素的个数，不包括不存在的成员
   * */
  async srem(key, member) {
    const kn = this.getKeyName(key, NewRedis.TYPES.SET)
    return this.rd.srem(kn, member)
  }

  /**
   * [无序集合]
   * 无序集合中是否有某成员
   * @param key
   * @param member 支持多个，数组或者字符串均可
   * @return boolean
   * */
  async sismember(key, member) {
    const kn = this.getKeyName(key, NewRedis.TYPES.SET)
    return !!(await this.rd.sismember(kn, member))
  }

  /**
   * [无序集合]
   * 查询集合的所有元素
   * @param key
   * @return int 返回从集合中移除元素的个数，不包括不存在的成员
   * */
  async smembers(key) {
    const kn = this.getKeyName(key, NewRedis.TYPES.SET)
    return this.rd.smembers(kn)
  }

  /**
   * [有序集合]
   * 插入
   * @param key
   * @param member string|object 正常是字符串，表示成员名。如果为对象，则表示本次是批量增加，对象的key是member，value是score
   * @param score int 该成员的分数，如果 member 是对象，这个一定要随便设置一个值，否则无法设置后续的参数
   * @param expire int 过期秒
   * @param option 设置
   * @param option.CH 默认true，这个设为true，表示返回值是成功修改的member数
   * @param option.INCR 默认false，这个设为true，表示score是在原来的基础上增加，而不是修改
   * @param option.update 默认false，这个设为true，表示如果member在本集合中已存在才更新，否则忽略
   * @param option.add 默认false，这个设为true，表示如果member在本集合中不存在才增加，否则忽略，如果与上面的都为true，或者都为false，则又可以更新又可以增加
   * @return int 成功增加的member数。如果option.CH==true，则是成功修改的个数
   * */
  async zAdd(key, member, score, expire, { CH, INCR, update, add } = {}) {
    const kn = this.getKeyName(key, NewRedis.TYPES.ZSET)
    const params = [kn]
    if (update && !add) {
      params.push('XX')
    } else if (!update && add) {
      params.push('NX')
    }
    if (CH !== false) {
      params.push('CH')
    }
    if (INCR) {
      params.push('INCR')
    }
    if (typeof member !== 'object') {
      member = { [member]: score }
    }
    for (const [k, v] of Object.entries(member)) {
      const vv = +v
      if (isNaN(vv)) {
        logger.error(`"${k}"的score不能是非数字："${v.toString()}"`)
        return 0
      }
      params.push(vv, k)
    }
    const res = await this.rd.zadd(...params)
    if (expire) {
      await this.rd.expire(kn, expire)
    }
    return res
  }

  /**
   * [有序集合]
   * 根据返回指定区间内的值，指定区间的同时还能指定从这个区间内返回第几个值后的多少个
   * @param key
   * @param min int|string '-' 表示不限小，数字前加 ( 表示 > 否则默认是 >=
   * @param max int|string '+' 表示不限大，数字前加 ( 表示 < 否则默认是 <=
   * @param withScores 可以是bool，也可以是对象，对象里可以有： returnObj: true ，此时会返回对象
   * @param offset 返回结果向后偏移多少个位置，默认为0
   * @param count 返回结果数量，默认0，表示全部返回
   * @return array 符合需求的member按照score顺序的数组。如需倒序，用 ZREVRANGEBYSCORE。
   * 如果用了 withScores，返回的数组是按顺序一个member、一个score循环出现。并且score是string型
   * */
  async zRangeByScore(key, min, max, withScores, offset, count) {
    const kn = this.getKeyName(key, NewRedis.TYPES.ZSET)
    const params = []
    if (withScores) {
      params.push('WITHSCORES')
    }
    if (count) {
      params.push('LIMIT', offset, count)
    }

    if (typeof min === 'string') {
      if (['-', '-inf'].includes(min)) {
        min = '-inf'
      } else if (!/^[[(]?\d+$/.test(min)) {
        logger.error(`[zRangeByScore]min的值无法识别：${min}`)
        return []
      }
    }

    if (typeof max === 'string') {
      if (['+', '+inf'].includes(max)) {
        max = '+inf'
      } else if (!/^[[(]?\d+$/.test(max)) {
        logger.error(`[zRangeByScore]max的值无法识别：${max}`)
        return []
      }
    }

    let datas = await this.rd.zrangebyscore(kn, min, max, ...params)

    if (withScores && withScores.returnObj) {
      const d = {}
      for (let i = 0; i < datas.length; i += 2) {
        d[datas[i]] = datas[i + 1] || 0
      }
      datas = d
    }

    return datas
  }

  /**
   * [有序集合]
   * 删除指定分数区间内的成员
   * @param key
   * @param min int|string '-' 表示不限小，数字前加 ( 表示 > 否则默认是 >=
   * @param max int|string '+' 表示不限大，数字前加 ( 表示 < 否则默认是 <=
   * @return int 删除的元素的个数
   * */
  async zRemRangeByScore(key, min, max) {
    const kn = this.getKeyName(key, NewRedis.TYPES.ZSET)

    if (typeof min === 'string') {
      if (['-', '-inf'].includes(min)) {
        min = '-inf'
      } else if (!/^[[(]?\d+$/.test(min)) {
        logger.error(`[zRemRangeByScore]min的值无法识别：${min}`)
        return 0
      }
    }

    if (typeof max === 'string') {
      if (['+', '+inf'].includes(max)) {
        max = '+inf'
      } else if (!/^[[(]?\d+$/.test(max)) {
        logger.error(`[zRemRangeByScore]max的值无法识别：${max}`)
        return 0
      }
    }

    return this.rd.zremrangebyscore(kn, min, max)
  }

  /**
   * [有序集合]
   * 查询某成员的分数
   * 时间复杂度：O(1)
   * @param key
   * @param member int|string|array 成员名。支持数组，表示同时查多个，返回值也会变成数组哦，而且如果其中某个member不存在，返回值里对应的index就是null。
   * @return string|array 它的分数，如果不存在则返回 null 。虽然是string，但内容是纯数字，可以是小数。
   * */
  async zScore(key, member) {
    const kn = this.getKeyName(key, NewRedis.TYPES.ZSET)
    if (member instanceof Array) {
      const mult = this.rd.multi()
      member.forEach(item => {
        mult.zscore(kn, item)
      })
      const res = await mult.exec()
      return res.map(item => item[1])
    }
    return this.rd.zscore(kn, member)
  }

  /**
   * [有序集合]
   * 删除指定成员
   * @param key
   * @param members array | string
   * */
  async zRem(key, members) {
    const kn = this.getKeyName(key, NewRedis.TYPES.ZSET)
    if (!(members instanceof Array)) {
      members = [members]
    }
    return this.rd.zrem(kn, ...members)
  }

  /**
   * [有序集合]
   * 删除指定成员，以及分数小于它的成员。
   * ps 在不想删掉其它与该成员分数相同的成员时用
   * 时间复杂度：集合中成员数量越多，越慢
   *
   * TODO 改成批量执行
   *
   * @param key
   * @param member int|string 成员名
   * @return string 它的分数，如果不存在则返回 null 。虽然是string，但内容是纯数字，可以是小数。
   * */
  async zRemAndMin(key, member) {
    const kn = this.getKeyName(key, NewRedis.TYPES.ZSET)
    const score = await this.rd.zscore(kn, member)
    const num1 = await this.rd.zrem(kn, member)
    const num2 = await this.rd.zremrangebyscore(kn, '-inf', `(${score}`)
    return num1 + num2
  }

  /**
   * ***** 设计给内部使用，但外部也可以使用 *****
   * */

  /**
 * 给key加前缀，为避免不同项目使用相同redis库时出问题
 * @param name
 * @param type string 类型，最好还给key加上它的类型
 * */
  getKeyName(name, type) {
    if (this.originalKey) {
      return name
    }
    return `${this.prefix}:${name}` + (type ? `:${type}` : '')
  }

  /**
   * 检查一下key是否存在，类型对不对，不对的删掉
   * @param key
   * @param type string 具体选项请查看 TYPES 常量
   * @param isDel
   * @return boolean | string 类型对，或者不存在，返回在redis中的key名（已经包含前缀，不可能为空字符串），否则返回false
   * */
  async checkKey(key, type, isDel = true) {
    const kn = this.getKeyName(key, type)
    const itType = await this.rd.type(kn)

    if (itType === type || itType === 'none') {
      return kn
    } else if (isDel) {
      await this.rd.del(kn)
      return kn
    } else {
      return false
    }
  }

  async debug(text) {
    if (this.canDebug) {
      console.log('【newRedis】：', ...arguments)
    }
  }

}

module.exports = NewRedis
