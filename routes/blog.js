const { query } = require('express');
const express = require('express');
const router = express.Router();
const multer = require('multer')
const fs = require('fs')
const path = require('path')


const { getBlogs, getFollowingsBlogs, getOneBlog, createBlog, updateBlog, removeBlog } = require('../controllers/blog');

// get all blogs **searching by author needs to be handeled in different way
router.get('/', async (req, res, next) => {
  let { query: { author, body, title, tag, limit, skip } } = req;
  let _query = {}
  if (title != undefined)
    _query.title = { $regex: "^" + title }
  if (tag != undefined)
    _query.tags = tag
  if (body != undefined)
    _query.body = { $regex: ".*" + body + ".*" }
  if (limit == undefined || limit == '')
    limit = 10
  if (skip == undefined)
    skip = 0
  let _pagination = { limit: Number(limit), skip: Number(skip) }
  try {
    const blogs = await getBlogs(_query, _pagination, author) //check in controller if author undefined
    res.json(blogs);
  } catch (e) {
    next(e);
  }
});

//get followings' blogs
router.get('/followings', async (req, res, next) => {
  let { query: { author, title, tag, limit, skip } } = req;
  let _query = {}
  if (title != undefined)
    _query.title = { $regex: "^" + title }
  if (tag != undefined)
    _query.tags = tag
  if (body != undefined)
    _query.body = { $regex: ".*" + body + ".*" }
  if (limit == undefined || limit == '')
    limit = 10
  if (skip == undefined)
    skip = 0
  let _pagination = { limit: Number(limit), skip: Number(skip) }
  try {
    const blogs = await getFollowingsBlogs(_query, _pagination, author, req.user.followings) //check in controller if author undefined
    res.json(blogs);
  } catch (e) {
    next(e);
  }
});

// get user blogs
router.get('/user/:userid', async (req, res, next) => {
  let { params: { userid }, query: { title, tag, limit, skip } } = req;
  let _query = { author: userid }
  if (title != undefined && title != '')
    _query.title = { $regex: "^" + title }
  if (tag != undefined && tag != '')
    _query.tags = tag
  if (body != undefined)
    _query.body = { $regex: ".*" + body + ".*" }
  if (limit == undefined || limit == '')
    limit = 10
  if (skip == undefined)
    skip = 0
  let _pagination = { limit: Number(limit), skip: Number(skip) }
  try {
    const blogs = await getBlogs(_query, _pagination, undefined)
    res.json(blogs);
  } catch (e) {
    next(e);
  }
});

// get one blog by id
router.get('/:blogid', async (req, res, next) => {
  try {
    const blog = await getOneBlog(req.params.blogid)
    res.json(blog);
  } catch (e) {
    next(e);
  }
});

//for uploading image of new blog
var storage = multer.diskStorage({
  destination:(req,file,cb)=>{
      cb(null,'uploads')
  },
  filename:(req,file,cb){
      cb(null,file.fieldname+'-'+Date.now())
  }
})
const upload = multer({storage:storage})

// create new blog
router.post('/',upload.single('image'), async (req, res, next) => {
  const { body, user: { id } } = req;
  body.photo = {
    altname:req.body.photo,
    data:fs.readFileSync(path.join(__dirname+'../uploads'+req.body.photo.filename)),
    contentType:'image/png'
  }
  try {
    const blog = await createBlog({ ...body, author: id })
    res.json(blog);
  } catch (e) {
    next(e);
  }
});

// update one blog *** needs auth middlware to check id of token == id of todo owner
router.patch('/:blogid', async (req, res, next) => {
  const { body, params: { blogid } } = req;
  try {
    const blog = await updateBlog(blogid, body)
    res.json(blog);
  } catch (e) {
    next(e);
  }
});

// delete blog  *** needs auth middlware to check id of token == id of todo owner
router.delete('/:blogid', async (req, res, next) => {
  const { user: { id }, params: { blogid } } = req;
  try {
    const blog = await removeBlog(blogid)
    res.json(blog);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
