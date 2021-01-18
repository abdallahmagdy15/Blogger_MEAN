const { query } = require('express');
const express = require('express');
const router = express.Router();

const { getBlogs, getOneBlog, createBlog, updateBlog, removeBlog } = require('../controllers/blog');

// get all blogs **searching by author needs to be handeled in different way
router.get('/', async (req, res, next) => {
  let { query: { author, title, tag, limit, skip } } = req;
  let _pagination = { limit, skip }
  let _query = { title, tag }
  try {
    const blogs = await getBlogs(_query, _pagination, author) //check in controller if author undefined
    res.json(blogs);
  } catch (e) {
    next(e);
  }
});

// get user blogs
router.get('/user/:userid', async (req, res, next) => {
  let { params: { userid }, query: { author, title, tag, limit, skip } } = req;
  let _pagination = { limit, skip }
  let _query = { userid, title, tag }
  try {
    const blogs = await getBlogs(_query, _pagination, author)
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


// create new blog
router.post('/', async (req, res, next) => {
  const { body, user: { id } } = req;
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
  const { params: { blogid } } = req;
  try {
    const blog = await removeBlog(blogid)
    res.json(blog);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
