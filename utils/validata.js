/**
 * @Author: Firmiana
 * @Date: 2019-10-02 15:09:14
 * @Desc: string正则校验/处理
 */

module.exports = {
  leng,
  hasCH,
  jsonDecode,
  jsonEncode,
  unMobile
}

// 获得汉字长度
function leng(str) {
  let strArr = str.match(/[^\x00-\xff]/ig)
  return str.length + (strArr == null ? 0 : strArr.length)
}

// 判断字符串里是否有中文
function hasCH(str) {
  return /[^\x00-\xff]/.test(str)
}

/**
 * 解析 JSON
 * @param string
 * @param bigIntToStr 是否处理bigInt
 * */
function jsonDecode(string, { bigIntToStr = false } = {}) {
  if (!string) {
    return string
  }
  try {
    if (bigIntToStr) {
      string = string.replace(/([{[,\n\s]"[^"]*"[\n\s]*:[\n\s]*)(\d{15,})/g, '$1"$2"')
    }
    return JSON.parse(string)
  } catch (e) {
    console.error(e)
    return false
  }
}

// 转为 JSON
function jsonEncode(obj) {
  return JSON.stringify(obj)
}

// 脱敏手机号
function unMobile(mobile) {
  return mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}
