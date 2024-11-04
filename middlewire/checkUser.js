const express = require('express')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const jwtString = process.env.JWT_MESSAGE

const checkUser = (req,res,next)=>{
    const userToken =  req.header("token")
    if(!userToken){
        return res.status(401).json({error:true , message : "Invalid token"})
    }

    try {
        const token = jwt.verify(userToken , jwtString)
        req.userId = token.id
        console.log(token.id)
        next()
    } catch (error) {
        return res.status(500).json({error : true , message : error.message})
    }
}

module.exports = checkUser