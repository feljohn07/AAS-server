const express = require('express')

// we’ll use Multer to intercept incoming requests on our API
const multer = require("multer")
const fs = require('fs')
const path = require('path')

const UPLOAD_DIR = 'uploads/document ai/'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const _filename =  file.originalname
        cb(null, 'temp-' + Date.now() + '-' + _filename);
    }
});
const upload = multer({
    storage
});

// import controller
const { index } = require('../controllers/documentAiController')

// Routes
const router = express.Router()
router.post('/google-api', upload.single("image"), index);

// testing purpose
router.post('/test-data', (req, res) =>{

    fs.readFile('uploads/temp-1682431315483-invoice-template-us-dexter-750pxs.png.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        // console.log(data);
        res.send(data)
      });
});


module.exports = router