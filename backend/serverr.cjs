const Jimp = require('jimp');

// Function to convert text to binary
function textToBinary(text) {
    return text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
}

// Function to embed text into LSB of an image
async function embedTextIntoImage(inputImagePath, text, outputImagePath) {
    try {
        const image = await Jimp.read(inputImagePath);
        const binaryText = textToBinary(text);
        const textLength = binaryText.length;

        // Check if text can fit into the image
        if (textLength > image.bitmap.width * image.bitmap.height * 3) {
            throw new Error('Text is too long to embed into the image.');
        }

        // Embed text into LSB of each pixel
        let binaryIndex = 0;
        let viewIndex = 0;
        let imageData = image.bitmap.data;

        // Embed text length first
        const textLengthBinary = textLength.toString(2).padStart(32, '0');
        for (let i = 0; i < 32; i++) {
            imageData[i] = (imageData[i] & 0xFE) | parseInt(textLengthBinary[i], 10);
        }
        viewIndex = 32;

        for (let i = viewIndex; i < imageData.length; i++) {
            if (binaryIndex < textLength) {
                const bit = binaryText.charAt(binaryIndex);
                imageData[i] = (imageData[i] & 0xFE) | parseInt(bit, 10);
                binaryIndex++;
            } else {
                break;
            }
        }

        // Write the modified image
        await image.writeAsync(outputImagePath);
        console.log('Text embedded successfully.');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Function to extract text from LSB of an image
async function extractTextFromImage(imagePath) {
    try {
        const image = await Jimp.read(imagePath);
        let binaryText = '';

        // Extract text length from LSB of the first 32 pixels
        let textLengthBinary = '';
        let imageData = image.bitmap.data;
        for (let i = 0; i < 32; i++) {
            textLengthBinary += (imageData[i] & 1).toString();
        }
        const textLength = parseInt(textLengthBinary, 2);

        // Extract text from LSB of the rest of the pixels
        let binaryIndex = 0;
        for (let i = 32; i < imageData.length; i++) {
            if (binaryIndex < textLength) {
                binaryText += (imageData[i] & 1).toString();
                binaryIndex++;
            } else {
                break;
            }
        }

        // Convert binary text to ASCII
        let text = '';
        for (let i = 0; i < binaryText.length; i += 8) {
            text += String.fromCharCode(parseInt(binaryText.substr(i, 8), 2));
        }

        console.log('Extracted text:', text);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Example usage
const inputImagePath = 'input.png'; // Replace 'input.png' with your input image file path
const outputImagePath = 'output.png'; // Replace 'output.png' with your output image file path
const secretText = 'The quick brown fox jumps over the lazy dog!@#$%^&*()?><:";';
embedTextIntoImage(inputImagePath, secretText, outputImagePath);

extractTextFromImage(outputImagePath);
