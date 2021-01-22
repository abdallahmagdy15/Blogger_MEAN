const express = require('express')
const logoRouter = require('./blog')
const userRouter = require('./user')
const router = express.Router()

const authMiddleware = require('../middleware/authorization')

// get all blogs **searching by author needs to be handeled in different way
router.get('/', async (req, res, next) => {
    let { query: { limit, skip } } = req;
    let _query = {}
    if (limit == undefined || limit == '')
        limit = 10
    if (skip == undefined)
        skip = 0
    let _pagination = { limit: Number(limit), skip: Number(skip) }
    try {
        const blogs = await getBlogs(_query, _pagination,undefined) //check in controller if author undefined
        res.json(blogs);
    } catch (e) {
        next(e);
    }
});
router.use('/blogs', authMiddleware, logoRouter)

router.use('/users', userRouter)

module.exports = router

