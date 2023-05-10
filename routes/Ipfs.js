const express = require('express')

// we’ll use Multer to intercept incoming requests on our API
const multer = require("multer")
const fs = require('fs')
const path = require('path')

const UPLOAD_DIR = 'uploads/'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const _filename =  file.originalname
        cb(null, 'temp-' + Date.now());
    }
});
const upload = multer({
    storage
});


// import controller
const { index, image_list, file_upload } = require('../controllers/IpfsConstoller')

// const ipfsHttpClient = require('ipfs-http-client')
// const ipfs = ipfsHttpClient.create({host:'localhost', port: '5001', protocol:'http'})

// Routes
const router = express.Router()

router.post('/ipfs-api', upload.single("image"), index)

// router.post('/images', image_list)
// router.post('/upload', upload.single("image"), file_upload)


// router.get('/check-cid', async (req, res) =>{
//     const exists = (await ipfs.get('QmNi7YC7YnXc2NsdwHbSh5wecZpmMDLxEDCwMJXPx6zrXr')).next() !== null
//     res.send(exists)
// })

module.exports = router