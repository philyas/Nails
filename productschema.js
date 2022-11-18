const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    key:String,
    name:String,
    price:Number,
    colorStart:String,
    colorEnd: String
})

module.exports = mongoose.model('products', productSchema)