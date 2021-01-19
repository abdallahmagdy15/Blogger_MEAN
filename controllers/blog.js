const blogModel = require('../models/blog')
const userModel = require('../models/user')

const { getUsers } = require('../controllers/user');

const getBlogs = async (query, pagination, author) => {
    if (author == undefined)
        return blogModel.find(query).limit(pagination.limit).skip(pagination.skip).exec();
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

const getOneBlog = (id) => blogModel.findById(id).exec();

const createBlog = async (query) => {
    query.createdAt = new Date()
    query.updatedAt = new Date()
    const blog = await blogModel.create(query)
    await userModel.findByIdAndUpdate(query.author, { $push: { blogs: blog.id } }, { new: true }).exec()
    return blog
}

const updateBlog = (id, blogBody) => {
    blogBody.updatedAt = new Date()
    return blogModel.findByIdAndUpdate(id, blogBody, { new: true }).exec()
}

const removeBlog = async (id) => {
    const blog = await blogModel.findByIdAndDelete(id).exec()
    await userModel.findByIdAndUpdate(query.author, { $pull: { blogs: blog.id } }, { new: true }).exec()
    return blog
}


module.exports = {
    getBlogs, getOneBlog, createBlog, updateBlog, removeBlog
}