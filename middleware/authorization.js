const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const userModel = require('../models/user');
const verifyJWT = promisify(jwt.verify);

const auth = async (req, res, next) => {
    const { headers: { authorization } } = req
    if (!authorization)
        next(new Error('NOT_AUTHORIZED'))
    try {
        ////verify token
        const { id } = await verifyJWT(authorization, proccess.env.SECRET)
        const user = await userModel.findById(id).exec()
        req.user = user
        next()        
    } catch (e) {
        next((new Error('NOT_AUTHORIZED')));
    }
}

module.exports = auth