
const fs = require("fs");
const path = require('path');

const Upload = require('../models/uploadModel')
const Wallet = require('../models/walletModel')
const UploadByWallet = require('../models/uploadByWallet')

const { default: mongoose } = require("mongoose")

const upload = async (request, response) => {

    try{
        let file_path = request.file.path
    }catch{
        return response.status(200).send(
            {
                'status': "failed",
                'message': "File not uploaded successfully",
            }
        )
    }

    let mimetype = request.file.mimetype
    let file_extension = mimetype.split('/')[1]
    let file_location = "uploads/pending" + "/" + Date.now() + "." + file_extension

    // folder creation
    // checks if the path exist (folder with user_id as directory name), if does not exist then create it.
    try {

        // this will cause error if the directory do not exist
        fs.accessSync("uploads/pending/");
        
        // rename / move the image to the directory.
        fs.rename(file_path, file_location, function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });

        // save to database here
        const upload = await Upload.create({
            email: request.body.email,
            filepath: file_location
        })

        response.status(200).send(
            {
                'status': "success",
                'message': "File uploaded successfully",
                'data': upload,
                'file_link': "http://localhost:5000/" + file_location
            }
        )

    } catch (err) {

        // If the directory does not exist, create it
        fs.mkdirSync( "uploads/pending/", { recursive: true });
        console.log("make")

        // rename / move the image to the directory.
        fs.rename(file_path, "uploads/pending/" + path.basename(file_path), function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });
    }

}

const images = async (request, response) => {

    let email = request.body.email
    console.log(email)

    const upload = await Upload.find({email: email})

    return response.status(200).send(
        {
            'images': upload,
        }
    )
}

// ----------------------------------------------------------------------------------------------------------------------------

const authWallet = async (request, response) => {

    let user_wallet = request.query['wallet']

    let wallet_exist = await Wallet.exists({wallet: user_wallet})
    console.log(wallet_exist)
    // checks if the wallet exist in the database
    if(wallet_exist){

        return response.status(200).send({
            'message': "Wallet connected.",
            "status": true,
            "wallet": user_wallet
        })

    }else{

        return response.status(200).send({
            'message': "Not authorize wallet to perform actions.",
            "status": false,
            "wallet": user_wallet
        })

    }

}


const uploadByWallet = async (request, response) => {

    console.log(request.file)

    let file_path = request.file.path
    console.log(request.file.mimetype)
    let mimetype = request.file.mimetype == "application/octet-stream" ? "image/jpg" : request.file.mimetype
    let file_extension = mimetype.split('/')[1]
    let file_location = "uploads/pending" + "/" + Date.now() + "." + file_extension

    // folder creation
    // checks if the path exist (folder with user_id as directory name), if does not exist then create it.
    try {

        // this will cause error if the directory do not exist
        fs.accessSync("uploads/pending/");
        
        // rename / move the image to the directory.
        fs.rename(file_path, file_location, function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });


    } catch (err) {

        // If the directory does not exist, create it
        fs.mkdirSync( "uploads/pending/", { recursive: true });

        // rename / move the image to the directory.
        fs.rename(file_path, "uploads/pending/" + path.basename(file_path), function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });

    }finally {
        try{

            // checks if the wallet is authorized to upload pending files

            let wallet_exist = await Wallet.exists({wallet: request.body.wallet})

            if(wallet_exist){
                
                // save to database here
                const upload = await UploadByWallet.create({
                    wallet: request.body.wallet,
                    filepath: file_location
                })

                
                response.status(200).send(
                    {
                        'status': "success",
                        'message': "File uploaded successfully",
                        'data': upload,
                        'file_link': "http://localhost:5000/" + file_location
                    }
                )

            }else{  
                response.status(200).send(
                    {
                        'status': "failed",
                        'message': "Wallet is not authorized to use upload feature.",
                    }
                )
            }

        }catch (err){
            console.log('ERROR: ' + err);
        }
    }

}

const imagesByWallet = async (request, response) => {

    let wallet = request.query['wallet']
    console.log(wallet)

    const upload = await UploadByWallet.find({wallet: request.query['wallet']})

    return response.status(200).send(
        {
            'images': upload,
        }
    )
}

const deleteImageByWallet = async (request, response) => {

    const { id } = request.params
  
    // validate ID first before using it to find a record
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "Invalid ID"})
    }
    

    // Delete the file in storage
    try {

        // Checks if image exist in database.
        const exist = await UploadByWallet.find({_id: id})
        
        let filepath = exist[0].filepath

        // this will cause error if the directory do not exist
        fs.accessSync(filepath)
        fs.unlinkSync(filepath)

    } catch (err) {
        console.log(err)
        return response.status(404).send(
            {
                'error': "an error occured while deleting the file, the file might not exist anymore.",
            }
        )
    }

    // Then delete the row with the filepath from the database
    const image = await UploadByWallet.findOneAndDelete({_id: id})


    return response.status(200).send(
        {
            'image': image,
        }
    )
}

module.exports = { upload, images, authWallet, uploadByWallet, imagesByWallet, deleteImageByWallet }
