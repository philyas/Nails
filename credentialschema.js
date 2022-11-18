const mongoose = require('mongoose')

const credentialSchema = new mongoose.Schema({
    name:String,
    password:String,
    token:String
}) 

module.exports = mongoose.model("credentials", credentialSchema)