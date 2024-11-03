const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Types.ObjectId,
        required : true
    },
    text : {
        type : String,
        default : ""
    },
    image:{
        type: String,
        default : ""
    },
    video : {
        type : String,
        default : ""
    }
})

const Post = mongoose.model('post' , postSchema)
module.exports = Post