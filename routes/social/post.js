const express = require('express')
const router = express.Router()
const mongose = require('mongoose')
const { body, validationResult } = require('express-validator')
const multer = require('multer')
require('dotenv').config()

//models
const Post = require('../../models/post')
const User = require('../../models/auth')
//functions and middlewire
const checkUser = require('../../middlewire/checkUser')
const upload = multer()

const connectToMongo = async () => {
    mongose.connect(`${process.env.MONGODB_URL}`)
}

// api end point to create a post 
router.post('/create',
    checkUser,
    upload.none(),
    body('text').isLength({ min: 20 }),
    async (req, res) => {

        if (req.userId !== req.body.userId) {
            return res.status(401).json({ error: true, messgae: "Authentication denied" })
        }

        try {
            await connectToMongo()
            const post = new Post({
                text: req.body.text,
                userId: req.userId,
            })
            post.save()
            return res.status(200).json({ error: false, postId: post._id, message: "Posted successfully" })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: true, message: error.message })
        }
    }
)

//api endpoint to fetch all posts
router.get('/fetch', async (req, res) => {

    try {
        await connectToMongo()

        const posts = await Post.find()
        
        return res.status(200).json({ error: false, messgae: "all posts fetched successfully", posts })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: true, message: error.message })
    }

})

module.exports = router