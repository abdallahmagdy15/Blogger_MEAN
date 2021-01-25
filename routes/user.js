const express = require('express');
const router = express.Router();
const { getUser, getUsers, getFollowers, getFollowings,
  register, login, update, remove, follow, unfollow } = require('../controllers/user');
const userModel = require('../models/user');
const authMiddleware = require('../middleware/authorization')

// get users * search by name
//users?author="aaa"
router.get('/', authMiddleware, async (req, res, next) => {
  let { query: { author } } = req
  try {
    const allUsers = await getUsers(author);
    res.json(allUsers);
  } catch (e) {
    next(e);
  }
});

//get user profile
//users/123456
router.get('/:userid', authMiddleware, async (req, res, next) => {
  let { params: { userid } } = req
  try {
    const user = await getUser(userid);
    res.json(user);
  } catch (e) {
    next(e);
  }
})

//get followers
//users/123456/followers
router.get('/:userid/followers', authMiddleware, async (req, res, next) => {
  let { params: { userid } } = req
  try {
    const followers = await getFollowers(userid);
    res.json(followers);
  } catch (e) {
    next(e);
  }
})

//get followings
//users/123456/followings
router.get('/:userid/followings', authMiddleware, async (req, res, next) => {
  let { params: { userid } } = req
  try {
    const followings = await getFollowings(userid);
    res.json(followings);
  } catch (e) {
    next(e);
  }
})

//follow user
router.post('/follow/:userid', authMiddleware, async (req, res, next) => {
  let { user: { id }, params: { userid } } = req
  try {
    const user = await follow(id, userid)
    res.json(user);
  } catch (e) {
    next(e);
  }
})

//unfollow user
router.post('/unfollow/:userid', authMiddleware, async (req, res, next) => {
  let { user: { id }, params: { userid } } = req
  try {
    const user = await unfollow(id, userid)
    res.json(user);
  } catch (e) {
    next(e);
  }
})

// login user
router.post('/login', async (req, res, next) => {
  const { body } = req;
  try {
    const user = await login(body)
    res.json(user);
  } catch (e) {
    next(e);
  }
});

// register new user**
router.post('/register', async (req, res, next) => {
  const { body: newUser } = req;
  try {
    const user = await register(newUser)
    res.json(user);
  } catch (e) {
    next(e);
  }
});


//_______unrequired

// update one user data
router.patch('/', authMiddleware, async (req, res, next) => {
  const { user: { id }, body: userUpdated } = req;
  try {
    const user = await update(id, userUpdated)
    res.json(user);
  } catch (e) {
    next(e);
  }
});

// delete user
router.delete('/', authMiddleware, async (req, res, next) => {
  try {
    const user = await remove(req.user.id)
    res.json(user);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
