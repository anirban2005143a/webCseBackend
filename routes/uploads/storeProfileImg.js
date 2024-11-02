const express = require('express')
const app = express()
const router = express.Router()
const multer = require('multer')
const path = require('path')
const mongoose = require('mongoose')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

//models
const User = require('../../models/auth')
const checkUser = require('../../middlewire/checkUser')


const connectToMongo = async () => {
    mongoose.connect(`${process.env.MONGODB_URL}`)
}

router.use((req, res, next) => {
    req.id = uuidv4() + Date.now()
    next();
})

//storage for files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const destPath = file.fieldname === "profileImg" ?
            path.join(__dirname, '../../assets/profileImg') :
            path.join(__dirname, '../../assets/backgroundImg')

        cb(null, destPath)
    },
    filename: (req, file, cb) => {
        cb(null, req.id + ".jpg")
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 }
})

//save profile image
router.post('/profileImg',
    upload.fields([{ name: "profileImg" }, { name: "backgroundImg" }]),
    async (req, res) => {
        try {
            return res.status(200).json({
                error: false,
                message: "image uploaded successfully",
                pathId: req.id,
            })
        } catch (error) {
            return res.status(500).json({ error: true, message: error.message })
        }
    }
)

//edit images of a existing location
router.post('/edit/img',
    checkUser,
    upload.single('profileImg'),
     async (req, res) => {
        if (req.userId !== req.body.userId) {
            return res.status(401).json({ error: true, message: "Authentication denied" })
        }

        try {
            await connectToMongo()

            let user = await User.findById(req.userId)

            if (!user) {
                return res.status(401).json({ error: true, message: "user not found" })
            }
            //delete old img
            const filePath = path.join(__dirname, '../../assets/profileImg', user.fileName + ".jpg")
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
                console.log("img deleted")
            }

            return res.status(200).json({
                error: false,
                message: "image uploaded successfully",
                pathId: req.id,
            })

        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: true, message: error.message })
        }
})


module.exports = router