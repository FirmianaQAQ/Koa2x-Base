/**
 * @Author: Firmiana
 * @Date: 2019-10-02 14:56:16
 * @Desc: 日志记录
 *        根据配置来决定是否记录日志，以什么方式保存日志
 */

const path = require('path'),
  config = require('../config/index'),
  vStr = require('../utils/validata'),
  fs = require('./fs'),
  logTo = config.logger.logTo,
  moment = require('moment')

// 在这里控制把日志存到哪个地方
const logBase = function (logTo, mark, ...args) {
  const now = moment().format('YYYY-MM-DD HH:mm:ss')
  switch (logTo) {
    case 'console':
      console.log(now, ` [${mark}] `, ...args)
      break
    case 'file':
      const { fileName = 'log', splitByDay = true } = config.logger

      // 按天分隔
      setTimeout(async () => {
        const file = splitByDay ? `${fileName}-${moment().format('YYYYMMDD')}.log` : `${fileName}.log`
        await saveToFile(path.join(__dirname, '../logs', file), now, mark, args)
      })
      break
    default:
      setTimeout(async () => {
        await saveToFile(logTo, now, mark, args)
      })
  }
}

async function saveToFile(filePath, now, mark, args) {
  const res = await fs.mkdir(fs.getPath(filePath))
  if (!res) {
    console.error(`日志存储失败，无法创建文件夹：${fs.getPath(filePath)}`)
    return
  }
  await fs.writeFile(filePath, [now, ` [${mark}] `, ...args.map(a => typeof a === 'string' ? a : vStr.jsonEncode(a)), '\n'].join(' '), {
    flag: 'a'
  })
}

const red = function (s) {
  return '\x1b[1;31m' + s + '\x1b[m'
}

module.exports = class Logger {
  constructor(prefix, file) {
    this.prefix = prefix || ''
    this.logTo = file || logTo
  }

  log(...args) {
    if (!config.logger) return
    logBase(this.logTo, 'log', ` [${this.prefix}] `, ...args)
  }

  error(...args) {
    if (!config.logger) return
    logBase(this.logTo, red('error'), ` [${red(this.prefix)}] `, ...args)
  }

  static log(...args) {
    if (!config.logger) return
    logBase(logTo, 'log', ...args)
  }

  static error(...args) {
    if (!config.logger) return
    logBase(logTo, red('error'), ...args)
  }
}
