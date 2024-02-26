const Router = require('express')
const router = new Router()
const authController = require('../controller/auth.controller.js')
const { check } = require('express-validator')
const authMiddleware = require('../middleware/auth.middleware')
const roleMiddleware = require('../middleware/role.middleware')

router.post('/registration', [
    check('username', 'User name cannot be empty').notEmpty(),
    check('password', 'Password cannot be empty').notEmpty(),
    check('password', 'Password must be longer than 4 characters').isLength({ min: 4, max: 10 })
], authController.registration)
router.post('/login', authController.login)
router.get('/users', authMiddleware, roleMiddleware('ADMIN'), authController.getUsers)

module.exports = router