const mongoose = require('mongoose')

const Schema = mongoose.Schema

const uploadByWalletSchema = new Schema({
    wallet: {
        type: String,
        required: true,
    },
    filepath: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('UploadByWallet', uploadByWalletSchema)