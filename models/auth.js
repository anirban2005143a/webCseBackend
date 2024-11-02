const mongose = require('mongoose')

const userscheme = new mongose.Schema({
    firstname : {
        type:String,
        required : true,
    },
    lastname : {
        type:String,
        required : true,
    },
    email : {
        type:String,
        required : true,
        unique:true
    },
    tags : {
        type:String,
        required : true,
    },
    about : {
        type:String,
        required : true,
    },
    location : {
        type:String,
        required : true,
    },
    password : {
        type:String,
        required : true,
    },
    profileImg : {
        type : String,
        default : ""
    },
    backgroundImg : {
        type : String,
        default : ""
    }
})

const User = mongose.model('user' , userscheme)
module.exports = User