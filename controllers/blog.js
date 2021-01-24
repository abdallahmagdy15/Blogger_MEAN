const blogModel = require('../models/blog')
const userModel = require('../models/user')



const { getUsers } = require('../controllers/user');

const getBlogs = async (query, pagination, author) => {
    if (author == undefined)
        return blogModel.find(query).sort([['updatedAt',-1]])
        .limit(pagination.limit).skip(pagination.skip).exec().then(function () {
            console.log(`getBlogs works`);
        }).catch(function (err) {
            console.log(`caught the error: ${err}`);
        });
    else {
        const foundUsers = await getUsers(author)
        let blogsIds = []
        foundUsers.forEach(u => {
            blogsIds.push(...u.blogs)
        })
        console.log(...blogsIds)
        return blogModel.find(query).where('_id').in(blogsIds)
            .limit(pagination.limit).skip(pagination.skip).exec().then(function () {
                console.log(`getBlogs works`);
            }).catch(function (err) {
                console.log(`caught the error in getBlogs: ${err}`);
            });
    }
}


const getFollowingsBlogs = async (query, pagination, author, followingsIds) => {
    if (author == undefined)
        return blogModel.find(query).sort([['updatedAt',-1]]).limit(pagination.limit).skip(pagination.skip)
        .exec().then(function () {
            console.log(`getFollowingsBlogs works`);
        }).catch(function (err) {
            console.log(`caught the error in getFollowingsBlogs: ${err}`);
        });
    else {
        return blogModel.find(query).where('_id').in(followingsIds)
            .limit(pagination.limit).skip(pagination.skip).exec().then(function () {
                console.log(`getFollowingsBlogs works`);
            }).catch(function (err) {
                console.log(`caught the error in getFollowingsBlogs: ${err}`);
            });
    }
}

const getOneBlog = (id) => blogModel.findById(id).exec();

const createBlog = async (res,blog) => {
    blog.createdAt = new Date()
    blog.updatedAt = new Date()
    //update user blogs
    await userModel.findByIdAndUpdate(blog.author, { $push: { blogs: _blog.id } }, { new: true })
    .exec().then(function () {
        console.log(`createBlog works`);
    }).catch(function (err) {
        console.log(`caught the error in createBlog: ${err}`);
    });
    
    return blogModel.create(blog).then(function () {
        console.log(`createBlog works`);
    }).catch(function (err) {
        console.log(`caught the error in createBlog: ${err}`);
    });
    
}
//


const updateBlog = (id, blogBody) => {
    blogBody.updatedAt = new Date()
    return blogModel.findByIdAndUpdate(id, blogBody, { new: true })
    .exec().then(function () {
        console.log(`updateBlog works`);
    }).catch(function (err) {
        console.log(`caught the error in updateBlog: ${err}`);
    });
}

const removeBlog = async (id) => {
    const blog = await blogModel.findByIdAndDelete(id)
    .exec().then(function () {
        console.log(`removeBlog works`);
    }).catch(function (err) {
        console.log(`caught the error in removeBlog: ${err}`);
    });

    if (id != blog.author)
        throw new Error( "Denied : Can't delete the blog because you are not the author" )
        
    await userModel.findByIdAndUpdate(query.author, { $pull: { blogs: blog.id } }, { new: true })
    .exec().then(function () {
        console.log(`removeBlog works`);
    }).catch(function (err) {
        console.log(`caught the error in removeBlog: ${err}`);
    });
    return blog
}


module.exports = {
    getBlogs, getOneBlog, createBlog, updateBlog, removeBlog, getFollowingsBlogs 
}