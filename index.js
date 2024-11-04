const express = require('express')
const app = express()
const port = 3000
const cors = require('cors');  
const cookieParse = require('cookie-parser')
require('dotenv').config(); 

const Auth = require('./routes/auth')
const Upload = require('./routes/uploads/storeProfileImg')
const Post = require('./routes/social/post')

app.use(cors());
app.use(express.json());
app.use(cookieParse())

app.use("/api/auth", Auth)
app.use("/api/upload", Upload)
app.use("/api/post", Post)

app.get('/', (req, res) => {
  console.log("frg")
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})