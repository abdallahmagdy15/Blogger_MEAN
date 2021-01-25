const userModel = require('../models/user')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const auth = require('../middleware/authorization')
const jwtSignAsync = promisify(jwt.sign)


const getFollowings = async (id) => {
    const { followings } = await getUser(id)
    return userModel.find().where('_id').in(followings).exec()
}
const getFollowers = async (id) => {
    const { followers } = await getUser(id)
    return userModel.find().where('_id').in(followers).exec()
}
const getUser = (id) => {
    return userModel.findById(id).exec()
}
const getUsers = (author) => {
    if (author == undefined)
        return userModel.find({}).exec()

    return userModel.find({ $or: [{ firstName: { $regex: "^" + author } }, { lastName: { $regex: "^" + author } }] }).exec()
}
const register = (user) => userModel.create(user)

const login = async ({ username, password }) => {
    //login
    const user = await userModel.findOne({ username }).exec()
    if (!user)
        throw new Error('AUTHENTICATION_REQUIRED')

    const valid = user.validatePassword(password);

    if (!valid)
        throw new Error('AUTHENTICATION_REQUIRED')

    const token = await jwtSignAsync({
        username: username,
        id: user.id,
    }, proccess.env.SECRET, { expiresIn: '1d' });

    return { ...user.toJSON(), token } // this will be returned as promise
}

const follow = (userid, followedid) => {
    if (userid == followedid)
        return { "status": "can't follow your self" }   
    //update follower's followings
    userModel.findByIdAndUpdate(userid, { $push: { followings: followedid } }, { new: true }).exec()

    //update followed one's followers
    userModel.findByIdAndUpdate(followedid, { $push: { followers: userid } }, { new: true }).exec()
    return { "status": "followed" }
}
const unfollow = (userid, followedid) => {
    //update follower's followings
    userModel.findByIdAndUpdate(userid, { $pull: { followings: followedid } }, { new: true }).exec()

    //update followed one's followers
    userModel.findByIdAndUpdate(followedid, { $pull: { followers: userid } }, { new: true }).exec()
    return { "status": "unfollowed" }

}

//arent required
const remove = (id) => userModel.findByIdAndDelete(id).exec()
const update = (id, userUpdated) => userModel.findByIdAndUpdate(id, userUpdated, { new: true }).exec()

module.exports = {
    getUser, getUsers, getFollowers, getFollowings, register, login, update, remove, follow, unfollow
}