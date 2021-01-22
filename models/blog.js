const Mongoose = require('mongoose')
const { Schema } = Mongoose

const blogSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    title: { type: String, required: true, maxLength: 60 },
    body: { type: String, required: true, maxLength: 2100 },
    photo: {
        altname:String,
        data: Buffer,
        contentType: String
    },
    tags: [String],
    createdAt: Date,
    updatedAt: Date
})

const blogModel = Mongoose.model('blog', blogSchema)
module.exports = blogModel;