const Mongoose = require('mongoose')
const { Schema } = Mongoose

const blogSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    title: { type: String, required: true, maxLength: 60 },
    body: { type: String, required: true, maxLength: 2100 },
    authorDp: String,
    authorName: {type:String ,required:true},
    photo: String,
    tags: [String],
    createdAt: {Date,required:true},
    updatedAt: {Date,required:true},
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        userDp: String,
        userName: {type:String,required: true},
        body: {
            type: String,
            maxlength: 1024,
            required: true
        },
        photo: String,
        likesCount: Number
    }],
    likesCount: Number
})

const blogModel = Mongoose.model('blog', blogSchema)
module.exports = blogModel;