const blogModel = require('../models/blog')
const userModel = require('../models/user')

const { getUsers } = require('../controllers/user');

const getBlogs = async (query, pagination, author) => {
    if (author == undefined)
        return blogModel.find(query).sort([['updatedAt', -1]])
            .limit(pagination.limit).skip(pagination.skip).exec().then().catch(e => {
                throw new Error("Caught error in getBlogs :", e)
            })
    else {
        const foundUsers = await getUsers(author).then().catch(e => {
            throw new Error("Caught error in getBlogs :", e)
        })
        let blogsIds = []
        foundUsers.forEach(u => {
            blogsIds.push(...u.blogs)
        })
        console.log(...blogsIds)
        return blogModel.find(query).where('_id').in(blogsIds)
            .limit(pagination.limit).skip(pagination.skip).exec().then().catch(e => {
                throw new Error("Caught error in getBlogs :", e)
            })
    }
}


const getFollowingsBlogs = async (query, pagination, author, followingsIds) => {
    if (author == undefined)
        return blogModel.find(query).sort([['updatedAt', -1]]).limit(pagination.limit).skip(pagination.skip).exec().then().catch(e => {
                throw new Error("Caught error in getFollowingsBlogs :", e)
            })
    else {
        return blogModel.find(query).where('_id').in(followingsIds)
            .limit(pagination.limit).skip(pagination.skip).exec().then().catch(e => {
                throw new Error("Caught error in getFollowingsBlogs :", e)
            })
    }
}

const getOneBlog = (id) => blogModel.findById(id).exec().then().catch(e => {
    throw new Error("Caught error in getOneBlog :", e)
})

const createBlog = async (blog) => {
    blog.createdAt = new Date()
    blog.updatedAt = new Date()

    const _blog = await blogModel.create(blog).then().catch(e => {
        throw new Error("Caught error in createBlog :", e)
    })
    //update user blogs
    userModel.findByIdAndUpdate(blog.author, { $push: { blogs: _blog.id } }, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in createBlog :", e)
        })

    return _blog;
}
//


const updateBlog = (id, blogid, blogBody) => {
    if (id != blogid)
        return { "status": "Denied , not authorized to update this blog!" }
    blogBody.updatedAt = new Date()
    return blogModel.findByIdAndUpdate(blogid, blogBody, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in updateBlog :", e)
        })
}
// remove also the blog from blogModel *-*********
const removeBlog = async (id, blogid) => {
    const blog = await blogModel.findByIdAndDelete(blogid)
        .exec().then().catch(e => {
            throw new Error("Caught error in removeBlog :", e)
        })

    if (id != blogid)
        return { "status": "Denied , not authorized to delete this blog!" }

    await userModel.findByIdAndUpdate(query.author, { $pull: { blogs: blog.id } }, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in removeBlog :", e)
        })
    return blog
}

const createComment = (comment)=>{
    return blogModel.findByIdAndUpdate(comment.blogId, { $push: { comments: comment } }, { new: true })
        .exec().then().catch(e => {
            throw new Error("Caught error in createComment :", e)
        })
}

// //*/********** */
// const updateComment = (loggedinId, commentId, commentBody) => {
//     if (loggedinId != commentBody.userId)
//         return { "status": "Denied , not authorized to update this comment!" }
//     commentBody.updatedAt = new Date()
//     return blogModel.findByIdAndUpdate(commentBody.blogId, commentBody, { new: true })
//         .exec().then().catch(e => {
//             throw new Error("Caught error in updateBlog :", e)
//         })
// }

// const removeComment = async (id, commentId) => {
//     const blog = await blogModel.findByIdAndDelete(blogid)
//         .exec().then().catch(e => {
//             throw new Error("Caught error in removeBlog :", e)
//         })

//     if (id != blogid)
//         return { "status": "Denied , not authorized to delete this blog!" }

//     await userModel.findByIdAndUpdate(query.author, { $pull: { blogs: blog.id } }, { new: true })
//         .exec().then().catch(e => {
//             throw new Error("Caught error in removeBlog :", e)
//         })
//     return blog
// }

// verification that user who update or deletes his own blog/comment needs to be modified in more secure way

module.exports = {
    getBlogs, getOneBlog, createBlog, updateBlog, removeBlog, getFollowingsBlogs , createComment 
}