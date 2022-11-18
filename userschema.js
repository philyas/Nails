const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    key:String,
    name:String,
    percentage:Number,
    uri: String
})


module.exports = mongoose.model("users",userSchema)
