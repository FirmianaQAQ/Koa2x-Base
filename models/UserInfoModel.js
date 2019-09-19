/* global db */

// 注册用户
let insertData = val => {
	let _sql = "insert into user_info(name,password) values(?,?);"
	return db(_sql, val)
}

// 通过用户名查找用户信息 user_info
let findDataByName = val => {
	let _sql = 'SELECT * FROM user_info WHERE d_flag=0 '
	if (val && val.length) _sql += 'AND name= ? '
	return db(_sql, val)
}


module.exports = {
	insertData,
	findDataByName,
}