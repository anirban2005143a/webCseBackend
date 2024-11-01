const express = require('express')
const app = express()
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

//models
const User = require('../../models/auth')

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

const upload = multer({ storage })

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

module.exports = router