const express = require('express')
const router = express.Router()
const mongose = require('mongoose')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const multer = require('multer')
require('dotenv').config()


//models
const User = require('../models/auth')


const jwtString = process.env.JWT_MESSAGE
const  upload = multer()

const connectToMongo = async () => {
    mongose.connect(`${process.env.MONGODB_URL}`)
}

router.post('/create',
    upload.none(),
    //express validation check
    [
        body('firstname').isLength({ min: 3 }),
        body('lastname').isLength({ min: 3 }),
        body('email').isEmail(),
        body('password').isLength({ min: 3 }),
    ],
    async (req, res) => {

        const result = validationResult(req)

        if (!result.isEmpty()) {
            return res.status(401).json({ error: result.array() })
        }

        try { 
            //connect mongodb 
            await connectToMongo();

            //generate hash password
            const salt = await bcrypt.genSalt(10)
            const encodedPassword = bcrypt.hashSync(req.body.password, salt)

            //create new user
            const user = new User({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                location: req.body.location, 
                password: encodedPassword,
                tags: req.body.tags,
                about: req.body.about 
            })
            user.save()

            //create json web token
            const token = jwt.sign({ id: user._id }, jwtString)
            return res.status(200).json({ error: false, message: "Account created successfully ", token , userId : user._id })
        } catch (error) {
            return res.json({ error: true, message: error.message })
        }


    })

module.exports = router