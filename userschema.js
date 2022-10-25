const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name:String,
    time: Date,
    online: Boolean
})

module.exports = mongoose.model("user",schema)
