/* global db */

// 注册用户
let insertData = function (value) {
	let _sql = "insert into user_info(name,password) values(?,?);"
	return db(_sql, value)
}

// 通过用户名查找用户信息 user_info
let findDataByName = function (name) {
	let _sql = 'SELECT * FROM user_info WHERE name= ? '
	return db(_sql, name)
}

module.exports = {
	insertData,
	findDataByName,
}