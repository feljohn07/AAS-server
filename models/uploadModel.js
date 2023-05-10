const mongoose = require('mongoose')

const Schema = mongoose.Schema

const uploadSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        // required: true
    },
    email: {
        type: String,
        required: true,
    },
    filepath: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Upload', uploadSchema)