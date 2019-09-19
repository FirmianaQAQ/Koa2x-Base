const router = require('koa-router')()

const { register } = require('../controllers/sys')

router.post('/sys/register', register)

module.exports = router