const UserInfoModel = require("../models/UserInfoModel"),
  md5 = require("md5"),
  reObj = {
    code: 0,
    data: {},
    message: "",
    t: Number(new Date())
  }

let register = async (name, password) => {
  let res = await UserInfoModel.findDataByName(name)

  if (res && res.length) {
    reObj.code = 400
    reObj.message = "用户名已存在！"
  } else {
    try {
      UserInfoModel.insertData([
        name,
        md5(password)
      ])
      reObj.code = 200
      reObj.message = "注册成功！"
    } catch (error) {
      reObj.code = 400
      reObj.message = "注册失败，请检查必填项！"
    }
  }

  return reObj
}

let getUserList = async () => {
  let res = await UserInfoModel.findDataByName()

  reObj.code = 200
  reObj.message = "成功！"
  reObj.data = res

  return reObj
}

module.exports = {
  register,
  getUserList
}