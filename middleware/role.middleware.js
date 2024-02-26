const jwt = require('jsonwebtoken')
const { secret } = require('../config')


module.exports = function (role) {
    return function (req, res, next) {
        if(req.method === 'OPTIONS') {
            next()
        }
    
        try {
            const token = req.headers.authorization.split(' ')[1]
            if(!token) {
                return res.status(403).json({message: 'User not authorised'})
            }
            const { role: userRole } = jwt.verify(token, secret)
            if(userRole !== role) {
                return res.status(403).json({message: 'No access'})
            }
            next()
        } catch (e) {
            res.status(403).json({message: 'User not authorised'})
        }
    }

}