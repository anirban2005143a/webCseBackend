const path = require('path')

const serverImg = async(req,res , filename , type)=>{
    const img = path.join(__dirname , `../assets/${type}` , filename + ".jpg")

    return res.sendFile(img)
}

module.exports = serverImg