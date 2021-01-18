const express = require('express')
const logoRouter = require('./blog')
const userRouter = require('./user')
const router = express.Router()
const authMiddleware = require('../middleware/authorization')


router.use('/blogs', authMiddleware, logoRouter )
router.use('/users', userRouter)

module.exports = router

