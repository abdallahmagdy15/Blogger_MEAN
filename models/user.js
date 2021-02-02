const Mongoose = require('mongoose')
let bcrypt = require('bcryptjs');
const { Schema } = Mongoose;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true, maxLength: 140 },
    password: { type: String, required: true },
    firstName: { type: String, required: true, maxLength: 140 },
    lastName: { type: String, required: true, maxLength: 140 },
    diplayPicture:String,
    email: { type: String, required: true, unique: true },
    dob: Date,
    bio:String,
    blogs: [{ type: Schema.Types.ObjectId, ref: 'blog' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    followings: [{ type: Schema.Types.ObjectId, ref: 'user' }]
}, {
    //not to return password
    toJSON: {
        transform: (doc, ret, options) => {
            delete ret.password;
            return ret;
        }
    }
})

userSchema.pre('save', function (next) {
    if (this.password)
        this.password = bcrypt.hashSync(this.password, 8)
    next()
})
userSchema.pre('findByIdAndUpdate', function (next) {
    if (this._update.password)
        this._update.password = bcrypt.hashSync(this._update.password, 8)
    next()
})
userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}
//u can check username and email availibility when registering
const userModel = Mongoose.model('user', userSchema)
module.exports = userModel;