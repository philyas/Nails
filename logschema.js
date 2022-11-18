const mongoose = require('mongoose')

const logSchema = new mongoose.Schema({
            key: String,
            product:String,
            name: String,
            date: Date,
            price: Number,  
            percentage:Number
})

module.exports = mongoose.model('logs', logSchema)