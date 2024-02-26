const db = require('../db')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const { secret } = require('../config')

const generateAccessToken = (id, role) => {
    const payload = {
        id,
        role
    }
    return jwt.sign(payload, secret, {expiresIn: '24h'})
}

class AuthController {
    async registration(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                res.status(400).json({message: 'Registration error', errors})
                return
            }
            const {username, password} = req.body
            const candidate = await db.query('SELECT * FROM person WHERE username = $1', [username])
            if (candidate.rows.length) {
                res.status(400).json({message: 'User with this username already exists'})
                return
            }
            const hashPassword = bcrypt.hashSync(password, 7)
            const userRole = 'USER'
            await db.query('INSERT INTO person (username, password, role) values ($1, $2, $3) RETURNING *', [username, hashPassword, userRole])
            res.status(200).json({message: 'User created'})
            return
        } catch(e) {
            console.log(e)
            res.status(400).json({message: `Registration error: ${e}`})
            return
        }
    }
    async login(req, res) {
        try {
            const { username, password } = req.body
            const user = await db.query('SELECT * FROM person WHERE username = $1', [username])
            if (!user.rows.length) {
                res.status(400).json({message: `User with this username ${username} does not exist`})
                return
            }
            const validPassword = bcrypt.compareSync(password, user.rows[0].password)
            if (!validPassword) {
                res.status(400).json({message: 'Invalid password'})
                return
            }
            const token = generateAccessToken(user.rows[0].id, user.rows[0].role)
            return res.json({token})
            
        } catch(e) {
            console.log(e)
            res.status(400).json({message: `Login error: ${e}`})
            return
        }
    }
    async getUsers(req, res) {
        try {
            const users = await db.query('SELECT * FROM person')
            res.json(users.rows)
        } catch(e) {

        }
    }
}

module.exports = new AuthController();