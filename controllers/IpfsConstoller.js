const ipfsHttpClient = require('ipfs-http-client')
const ipfs = ipfsHttpClient.create({host:'localhost', port: '5001', protocol:'http'})

const fs = require('fs');
const path = require('path');
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)

const UPLOAD_DIR = 'uploads/ipfs/'

const index = async (request, response) => {

    // console.log(request.body)

    try {
        let file_path = request.file.path
        let mimetype = request.file.mimetype
        let file_extension = mimetype.split('/')[1]
        let CID;
        
        // catch error if IPFS produces error
        try {

            CID = await generateCID(file_path)  
        } catch (error) {

            return response.status(400).send(
                {   
                    'developer message' : "something is wrong with IPFS, try starting node or restarting it.",
                    'errors': error.message,
                }
            )
        }

        let ipfs_gateway = `https://ipfs.io/ipfs/${ CID }`
        let CID_file_path = UPLOAD_DIR + CID + '.' + file_extension

        // rename the file inside the disk with the generated CID
        fs.rename(file_path, CID_file_path, function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });

        return response.status(200).send(
            {
                'temp_path': file_path,
                'file_path': CID_file_path,
                'ipfs_gateway': ipfs_gateway, 
                'mimeType': mimetype, 
                'CID': CID + '',
                'ipfs': "ipfs"
            }
        )
        
    } catch (error){
        response.status(400).send(
            {
                'errors': error.message,
            }
        )
    }

}

const image_list = async (request, response) => {

    let user = request.body.user
    console.log(user)

    // check if the folder exist (this means if the user have uploaded a file and the folder with user-id as folder name already exist)
    try {

        // this will cause error if the directory do not exist
        fs.accessSync("uploads/pending/" + user );
        
    } catch (err) {

        // If the directory does not exist, create it
        // fs.mkdirSync( "uploads/pending/" + user, { recursive: true });
        console.log("folder does not exist")

    }

    let image_list = []
    let files = fs.readdirSync("uploads/pending/" + user)

    // create array object that will hold the image links
    files.forEach( (file, index) => {
        // let obj = {}
        // obj[index] = ("http://localhost:5000/uploads/pending/" + user + file)
        image_list.push({
            id: index, 
            link: ("http://localhost:5000/uploads/pending/" + user + "/" + file),
            filename: file
        })
    })

    response.status(200).send(
        {
            'image_list': image_list,
        }
    )
}

const file_upload = async (request, response) => {

    let file_path = request.file.path
    let user = request.body.user
    let mimetype = request.file.mimetype
    let file_extension = mimetype.split('/')[1]

    // folder creation
    // checks if the path exist (folder with user_id as directory name), if does not exist then create it.
    try {

        // this will cause error if the directory do not exist
        fs.accessSync("uploads/pending/" + user );
        
        // rename / move the image to the directory.
        fs.rename(file_path, "uploads/pending/" + user + "/" + Date.now() + "." + file_extension, function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });

        response.status(200).send(
            {
                'status': "success",
            }
        )

    } catch (err) {

        // If the directory does not exist, create it
        fs.mkdirSync( "uploads/pending/" + user, { recursive: true });
        console.log("make")

        // rename / move the image to the directory.
        fs.rename(file_path, "uploads/pending/" + user + "/" + path.basename(file_path), function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });
    }

}

const generateCID = async (path) => {
    const file = fs.readFileSync(path);

    // const file = {path: path, content: Buffer.from(content)}
    const fileAdded = await ipfs.add(file , {
        pin: true
    })
    console.log("ipfs.add() : ", fileAdded)

    // Gateway List
    //  https://skywalker.infura-ipfs.io/ipfs/
    //  https://ipfs.io/ipfs/
    //  https://cloudflare-ipfs.com/ipfs/
    //  https://dweb.link/ipfs/
    //  https://ipfs.eternum.io/ipfs/
    //  https://ipfs.fleek.co/ipfs/
    //  https://ipfs.jes.xxx/ipfs/
    //  https://ipfs.jimpick.com/ipfs/
    //  https://ipfs.kittyhawk.wtf/ipfs/
    //  https://ipfs.moonshard.io/ipfs/
    //  https://ipfs.nft.storage/ipfs/
    //  https://ipfs.runfission.com/ipfs/

    return fileAdded.cid 
}

module.exports = { index, image_list, file_upload }

