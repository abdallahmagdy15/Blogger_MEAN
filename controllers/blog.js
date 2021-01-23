const blogModel = require('../models/blog')
const userModel = require('../models/user')



const { getUsers } = require('../controllers/user');

const getBlogs = async (query, pagination, author) => {
    if (author == undefined)
        return blogModel.find(query).sort([['updatedAt',-1]]).limit(pagination.limit).skip(pagination.skip).exec();
    else {
        const foundUsers = await getUsers(author)
        let blogsIds = []
        foundUsers.forEach(u => {
            blogsIds.push(...u.blogs)
        })
        console.log(...blogsIds)
        return blogModel.find(query).where('_id').in(blogsIds)
            .limit(pagination.limit).skip(pagination.skip).exec();
    }
}


const getFollowingsBlogs = async (query, pagination, author, followingsIds) => {
    if (author == undefined)
        return blogModel.find(query).sort([['updatedAt',-1]]).limit(pagination.limit).skip(pagination.skip).exec();
    else {
        return blogModel.find(query).where('_id').in(followingsIds)
            .limit(pagination.limit).skip(pagination.skip).exec();
    }
}

const getOneBlog = (id) => blogModel.findById(id).exec();

const createBlog = async (res,blog) => {
    blog.createdAt = new Date()
    blog.updatedAt = new Date()
    const _blog = await blogModel.create(blog)
    await userModel.findByIdAndUpdate(blog.author, { $push: { blogs: _blog.id } }, { new: true }).exec()
    res.send(_blog)
}
//


const updateBlog = (id, blogBody) => {
    blogBody.updatedAt = new Date()
    return blogModel.findByIdAndUpdate(id, blogBody, { new: true }).exec()
}

const removeBlog = async (id) => {
    const blog = await blogModel.findByIdAndDelete(id).exec()
    if (id != blog.author)
        return { "error": "Not Author" }
    await userModel.findByIdAndUpdate(query.author, { $pull: { blogs: blog.id } }, { new: true }).exec()
    return blog
}


module.exports = {
    getBlogs, getOneBlog, createBlog, updateBlog, removeBlog, getFollowingsBlogs 
}