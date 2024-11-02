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
//functions and middlewire
const checkUser = require('../middlewire/checkUser')
const serverImg = require('../functions/serverImg')

const jwtString = process.env.JWT_MESSAGE
const upload = multer()

const connectToMongo = async () => {
    mongose.connect(`${process.env.MONGODB_URL}`)
}

//api endpopint to is token and userid belongs to same user
router.post('/checkUser', checkUser, async (req, res) => {
    try {
        if (req.userId !== req.body.userId) {
            return res.status(401).json({ error: true, message: "Authentication denied" })
        }
        return res.status(200).json({ error: false, message: "Authorized" })
    } catch (error) {
        return res.status(500).json({ error: true, message: error.message })
    }
})

//api end point to create account
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
                about: req.body.about,
                profileImg: req.body.fileName,
                backgroundImg: req.body.fileName
            })
            user.save()

            //create json web token
            const token = jwt.sign({ id: user._id }, jwtString)

            return res.status(200).json({
                error: false,
                message: "Account created successfully ",
                token,
                userId: user._id
            })
        } catch (error) {
            return res.json({ error: true, message: error.message })
        }


    })

//api endpoint to login 
router.post('/login', async (req, res) => {

    try {
        //connect to mongodb
        await connectToMongo()

        const user = await User.findOne({email : req.body.email})
        console.log(user)
        if (!user) {
            return res.status(400).json({ error: true, message: "user not found" })
        }
        const checkPassword = await bcrypt.compare(`${req.body.password}`, `${user.password}`)
        console.log(checkPassword)
        if (!checkPassword) {
            return res.status(401).json({ error: true, message: "Authentication denied" })
        }
        const token = jwt.sign({ id: user._id }, jwtString)

        return res.status(200).json({
            error: false,
            message: "User log-in successfully",
            userId: user._id,
            token
        })
    } catch (error) {
        return res.status(500).json({ error: true, message: error.message })
    }
})

//api end point to edit profile
router.post('/edit', checkUser, async (req, res) => {
    if (req.userId !== req.body.userId) {
        return res.status(401).json({ error: true, message: "Authentication denied" })
    }
    try {
        await connectToMongo()
        let user = await User.findById(req.userId)
        if (!user) {
            return res.status(401).json({ error: true, message: "user not found" })
        }
        //edit profile info
        const editObj = {
            location: req.body.location,
            tags: req.body.tags,
            about: req.body.about,
        }
        req.body.profileImg ? editObj.profileImg = req.body.profileImg : ""
        const editUser = await User.findByIdAndUpdate(req.userId, editObj ).select('-password')

        user = await User.findById(req.userId)
        return res.status(200).json({ error: false, message: "User updated successfully", user })
    } catch (error) {
        return res.status(500).json({ error: true, message: error.message })
    }
})

//api endpoint for fetch user data  
router.post('/fetch', checkUser, async (req, res) => {
    if (req.userId !== req.body.userId) {
        return res.status(401).json({ error: true, message: "Authentication denied" })
    }

    try {
        //connect to mongodb
        await connectToMongo()

        const user = await User.findById(req.userId).select('-password')
        // console.log(user)
        if (!user) {
            return res.status(400).json({ error: true, message: "user not found" })
        }

        return res.status(200).json({ error: false, user })

    } catch (error) {
        return res.status(500).json({ error: true, message: error.message })
    }
})
  
//api endpoint for serve static images
router.get('/profileImg', async (req, res) => {

    const filename = req.query.filename
    const userId = req.query.userId
    const token = req.query.token

    // console.log(filename)

    if (!userId || !token || !filename) {
        return res.status(401).json({ error: true, message: "Unauthorized access" })
    }

    try {
        await connectToMongo()

        const user = await User.findOne({ _id: new mongose.Types.ObjectId(userId) })
        // console.log(user)
        if (!user) {
            return res.status(401).json({ error: true, message: "User not found" })
        }
        serverImg(req, res, filename, "profileImg")

    } catch (error) {
        return res.status(500).json({ error: true, message: error.message })
    }
})

//api endpoint for serve static images
router.get('/backgroundImg', async (req, res) => {

    const filename = req.query.filename
    const userId = req.query.userId
    const token = req.query.token

    if (!userId || !token || !filename) {
        return res.status(401).json({ error: true, message: "Unauthorized access" })
    }

    try {
        await connectToMongo()

        const user = await User.findOne({ _id: new mongose.Types.ObjectId(userId), backgroundImg: filename })

        if (!user) {
            return res.status(401).json({ error: true, message: "User not found" })
        }
        serverImg(req, res, filename, "backgroundImg")

    } catch (error) {
        return res.status(500).json({ error: true, message: error.message })
    }
})

module.exports = router 