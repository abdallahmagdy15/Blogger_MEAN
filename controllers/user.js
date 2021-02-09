const userModel = require('../models/user')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const jwtSignAsync = promisify(jwt.sign)


const getFollowings = async (id, { authorname, username }) => {

    if (authorname == undefined)
        authorname = "";
    if (username == undefined)
        username = "";

    const { followings } = await getUser(id)

    return userModel.find({
        $or: [{ firstName: { $regex: "^" + authorname } }, { lastName: { $regex: "^" + authorname } }],
        username
    }).where('_id').in(followings).exec().then().catch(e => {
        throw new Error("Caught error in getFollowings :", e)
    })
}
const getFollowers = async (id, { authorname, username }) => {
    if (authorname == undefined)
        authorname = "";
    if (username == undefined)
        username = "";
        
    const { followers } = await getUser(id)
    return userModel.find({
        $or: [{ firstName: { $regex: "^" + authorname } }, { lastName: { $regex: "^" + authorname } }],
        username
    }).where('_id').in(followers).exec().then().catch(e => {
        throw new Error("Caught error in getFollowers :", e)
    })
}

const getUser = (id) => {
    return userModel.findById(id).exec().then().catch(e => {
        throw new Error("Caught error in getUser :", e)
    })
}
const getUsers = (author, currUserId) => {
    if (author == undefined)
        author = "";

    return userModel.find({ $or: [{ firstName: { $regex: "^" + author } }, { lastName: { $regex: "^" + author } }] })
        .where("_id").ne(currUserId).exec().then().catch(e => {
            throw new Error("Caught error in getUser :", e)
        })
}

const getSuggestions = (currUser, { authorname, username }) => {
    const excludedUsersIds = [...currUser.followings, currUser.id];
    if (authorname == undefined)
        authorname = "";
    if (username == undefined)
        username = "";
    return userModel.find({
        id: { $nin: excludedUsersIds },
        $or: [{ firstName: { $regex: "^" + authorname } }, { lastName: { $regex: "^" + authorname } }],
        username
    }).exec().then().catch(e => {
        throw new Error("Caught error in getSuggestions :", e)
    })
}

const register = (user) => userModel.create(user).then().catch(e => {
    throw new Error("Caught error in register :", e)
})

const login = async ({ username, password }) => {
    //login
    const user = await userModel.findOne({ username }).exec().then().catch(e => {
        throw new Error("Caught error in login :", e)
    })
    if (!user)
        throw new Error('AUTHENTICATION_REQUIRED')

    const valid = await user.validatePassword(password);

    if (!valid)
        throw new Error('AUTHENTICATION_REQUIRED')

    const token = await jwtSignAsync({
        username: username,
        id: user.id,
    }, process.env.SECRET, { expiresIn: '1d' }).then().catch(e => {
        throw new Error("Caught error in login :", e)
    });

    return { ...user.toJSON(), token } // this will be returned as promise
}

const follow = (userid, followedid) => {
    if (userid == followedid)
        return { "status": "can't follow your self" }
    //update follower's followings
    userModel.findByIdAndUpdate(userid, { $addToSet: { followings: followedid } }, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in follow :", e)
        })

    //update followed one's followers
    userModel.findByIdAndUpdate(followedid, { $addToSet: { followers: userid } }, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in follow :", e)
        })
    return { "status": "followed" }
}
const unfollow = (userid, followedid) => {
    //update follower's followings
    userModel.findByIdAndUpdate(userid, { $pull: { followings: followedid } }, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in unfollow :", e)
        })

    //update followed one's followers
    userModel.findByIdAndUpdate(followedid, { $pull: { followers: userid } }, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in unfollow :", e)
        })
    return { "status": "unfollowed" }

}

const remove = (id) => userModel.findByIdAndDelete(id).exec().then().catch(e => {
    throw new Error("Caught error in remove *user* :", e)
})

const update = (id, userUpdated) => userModel.findByIdAndUpdate(id, userUpdated, { new: true })
    .exec().then().catch(e => {
        throw new Error("Caught error in  update *user* :", e)
    })

module.exports = {
    getUser, getUsers, getFollowers, getFollowings, register, login, update, remove, follow, unfollow, getSuggestions
}