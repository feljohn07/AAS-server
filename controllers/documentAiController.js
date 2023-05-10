// For Google Document AI
'use strict';
const fs = require("fs");

// [START documentai_process_document]
const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;
// Instantiates a client
const client = new DocumentProcessorServiceClient();
const projectId = 'ocr-project-382209';
const location = 'us'; // Format is 'us' or 'eu'
const processorId = 'f23695f51b737173'; // Create processor in Cloud Console

// Document ai POST endpoint
const index = async (request, response) => {

    let file_path = request.file.path
    let mimetype = request.file.mimetype

    // return response.send(file_path);

    // [END documentai_process_document]
    let doc_ai_response = await processDocument(file_path, mimetype);
    // console.log(doc_ai_response)

    fs.writeFile(file_path + ".json", doc_ai_response, (err) => {
        if (err) throw err;
        console.log("Completed!");
    });

    response.send(doc_ai_response);
}

// Process File for document ai
async function processDocument(filePath, mimeType) {

    // The full resource name of the processor, e.g.:
    // projects/project-id/locations/location/processor/processor-id
    // You must create new processors in the Cloud Console first
    const name = `projects/${ projectId }/locations/${ location }/processors/${ processorId }`;

    // Read the file into memory.
    const fs = require('fs').promises;
    const imageFile = await fs.readFile(filePath);

    // Convert the image data to a Buffer and base64 encode it.
    const encodedImage = Buffer.from(imageFile).toString('base64');

    const request = {
        name,
        rawDocument: {
            content: encodedImage,
            mimeType: mimeType,
        },
    };

    // Recognizes text entities in the PDF document
    const [ result ] = await client.processDocument(request);
    const { document } = result;

    console.log(JSON.stringify(result))

    return JSON.stringify(result)


    // PARSING THE RESULT ----------------------------------------------------------------



    // Get all of the document text as one big string
    const {text} = document;

    // Extract shards from the text field
    const getText = textAnchor => {
        if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
        return '';
        }

        // First shard in document doesn't have startIndex property
        const startIndex = textAnchor.textSegments[0].startIndex || 0;
        const endIndex = textAnchor.textSegments[0].endIndex;

        return text.substring(startIndex, endIndex);
    };

    // Read the text recognition output from the processor
    console.log('The document contains the following paragraphs:');
    const [page1] = document.pages;
    const {paragraphs} = page1;

    for (const paragraph of paragraphs) {
        const paragraphText = getText(paragraph.layout.textAnchor);
        console.log(`Paragraph text:\n${paragraphText}`);
    }

    // Form parsing provides additional output about
    // form-formatted PDFs. You  must create a form
    // processor in the Cloud Console to see full field details.
    console.log('\nThe following form key/value pairs were detected:');

    const {formFields} = page1;
    for (const field of formFields) {
        const fieldName = getText(field.fieldName.textAnchor);
        const fieldValue = getText(field.fieldValue.textAnchor);

        console.log('Extracted key value pair:');
        // console.log(`\t(${fieldName}, ${fieldValue})`);
        console.log(field)
    }
}

module.exports = { index }