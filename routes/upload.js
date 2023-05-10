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
        cb(null, _filename );
    }
});
const image = multer({
    storage
});


// controller functions
const { authWallet, uploadByWallet, imagesByWallet, deleteImageByWallet } = require('../controllers/uploadController')

const router = express.Router()

router.get('/test-auth-wallet', authWallet)
router.post('/test-upload', image.single("image"), uploadByWallet) 
router.get('/test-images', imagesByWallet)
router.route("/delete/:id").delete(deleteImageByWallet);



// Imports the Google Cloud client library
const {ImageAnnotatorClient} = require('@google-cloud/vision').v1;

// Creates a client
const client = new ImageAnnotatorClient();

// Performs label detection on the image file
router.post('/crop', image.single("image"), async (req, res) => {

    // console.log(req.body.image)
    const canvasDataUrl = await req.body.image;

    // Extract the Base64 encoded data from the URL
    const base64Data = canvasDataUrl.replace(/^data:image\/\w+;base64,/, '');

    // Create a Buffer from the Base64 data
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate a unique filename or use a predefined one
    const filename = 'uploads/temp-crop-' + Date.now() + '.png';

    try {

        // Write the file to disk
        fs.writeFile(filename, buffer, async (error) => {
            if (error) {
                console.error('Error writing file', error);
                return res.status(500).send('Error writing file');
            } else {

                console.log(filename , ' File stored temporarily.');

                try{

                    /**
                     * TODO(developer): Uncomment the following line before running the sample.
                     */
                    
                    console.log("Send OCR request to Visual Api")

                    // Read a local image as a text document
                    const [ result ] = await client.documentTextDetection(filename)
                    
                    console.log("Loading...")
                    console.log("Success: " + result)
        
                    const fullTextAnnotation = result.fullTextAnnotation;
        
                    console.log(`Full text: ${fullTextAnnotation.text}`);
        
                    return res.send({ "text" : fullTextAnnotation.text, "Data" : fullTextAnnotation })
        
        
                    // fullTextAnnotation.pages.forEach(page => {
                    //     page.blocks.forEach(block => {
                    //         console.log(`Block confidence: ${block.confidence}`);
                    //         block.paragraphs.forEach(paragraph => {
                    //             console.log(`Paragraph confidence: ${paragraph.confidence}`);
                    //             paragraph.words.forEach(word => {
                    //                 const wordText = word.symbols.map(s => s.text).join('');
                    //                 console.log(`Word text: ${wordText}`);
                    //                 console.log(`Word confidence: ${word.confidence}`);
                    //                 word.symbols.forEach(symbol => {
                    //                 console.log(`Symbol text: ${symbol.text}`);
                    //                 console.log(`Symbol confidence: ${symbol.confidence}`);
                    //                 });
                    //             });
                    //             });
                    //     });
                    // });
                } catch (error) {
                    return res.status(500).send("visual ai error : " + error.message)
                }
                // return res.send('Canvas data received and file saved successfully.');
            }
        })

    } catch (error) {

        return res.status(500).send('Error writing file');

    } finally {
        

    }

}) 

module.exports = router