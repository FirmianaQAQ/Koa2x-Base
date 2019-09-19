const UserInfoModel = require("../models/UserInfoModel"),
  md5 = require("md5");

async function register(ctx, next) {
  const { name, password } = ctx.request.body

  await UserInfoModel.findDataByName(name).then(result => {
    if (result.length) {
      ctx.body = {
        code: 400,
        data: {},
        message: "用户名已存在",
        t: Number(new Date())
      }
    } else {
      ctx.body = {
        code: 200,
        data: {},
        message: "注册成功！",
        t: Number(new Date())
      }
      UserInfoModel.insertData([
        name,
        md5(password)
      ])
    }
  })
}

module.exports = {
  register
}
