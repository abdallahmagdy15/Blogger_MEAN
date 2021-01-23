const express = require('express');
const router = express.Router();
const multer = require('multer')
const helpers = require('../helpers/helpers');
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
    const blogs = await getFollowingsBlogs(_query, _pagination, author, req.user.followings) //check in controller if author undefined
    res.json(blogs);
  } catch (e) {
    next(e);
  }
});

// get user blogs
router.get('/user/:userid', async (req, res, next) => {
  let { params: { userid }, query: { title, body, tag, limit, skip } } = req;
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


//define the storage location for images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },

  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});


// create new blog
router.post('/', async (req, res, next) => {
  // 'photo' is the name of our file input field in the HTML form
  let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('photo');

  upload(req, res, function (err) {
    const { body, user: { id } } = req;
    // req.file contains information of uploaded file
    // req.body contains information of text fields, if there were any
    if (req.fileValidationError) {
      return res.send(req.fileValidationError);
    }
    else if (err instanceof multer.MulterError) {
      return res.send(err);
    }
    else if (err) {
      return res.send(err);
    }
    if (req.file != undefined)
      body.photo = req.file.path
    try {
      createBlog(res, { ...body, author: id })
    } catch (e) {
      next(e);
    }
    // Display uploaded image for user validation
    //res.send(`You have uploaded this image: <hr/><img src="${req.file.path}" width="500"><hr /><a href="./">Upload another image</a>`);
  })
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
