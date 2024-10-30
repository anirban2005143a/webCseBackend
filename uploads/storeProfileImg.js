const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')


// Storage configuration for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const pathname = path.join(__dirname, '..', 'assets', 'profileImg');
        cb(null, pathname);
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        // Log the request body to check if userId is present
        console.log(req.body);
        cb(null, `${req.body.userId}${extension}`); // Ensure userId is accessed here
    }
});

const upload = multer({ storage });

// Route for uploading images
router.post('/profileImg',
    upload.fields([{ name: 'profileImg' }, { name: 'backgroundImg' }]), // Note: userId should not be included here
    async (req, res) => {
        console.log(req.body.userId); // Log the userId to see if it's being passed correctly
        // Your logic here (e.g., save user details to the database)
        return res.json({ message: "Files uploaded successfully", userId: req.body.userId });
    }
);

module.exports = router;

