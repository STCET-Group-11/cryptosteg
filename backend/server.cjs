const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto-js');
const Message = require('./models/Message.cjs');
const Query = require('./models/Query.cjs');
const app = express();
const PORT = process.env.PORT || 3001;
const stegajs = require('stega.js')
const Jimp = require('jimp');

const inputImagePath = 'input.png'; // Replace 'input.png' with your input image file path
const outputImagePath = 'output.png'; // Replace 'output.png' with your output image file path

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const connectionString = 'mongodb+srv://grp11:dbgrp11@cluster0.whralck.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once('open', () => {
  console.log('Connected to MongoDB');
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

app.get('/queries/:_id', async (req, res) => {
  try {
    const messageId = req.params._id; // Get the ID parameter from the URL
    const message = await Query.findById(messageId);
    if (message) {
      res.json(message);
    } else {
      res.status(404).json({ error: 'Message not found' });
    }
  } catch (error) {
    console.error('Error fetching message by ID:', error);
    res.status(500).json({ error: 'Error fetching message by ID' });
  }
});

app.put('/queries/:_id', async (req, res) => {
  try {
    const messageId = req.params._id;
    const { flag } = req.body; // Assuming you'll send the new flag value in the request body
    // Find the message by ID and update the 'flag' field
    const updatedMessage = await Query.findByIdAndUpdate(
      messageId,
      { content: flag },
    );
    console.log(updatedMessage);

    if (updatedMessage) {
      res.json(updatedMessage);
    } else {
      res.status(404).json({ error: 'Message not found' });
    }
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Error updating message' });
  }
});

app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find();

  //ambiguity
    const message1 = extractTextFromImage(outputImagePath);
    console.log(message1);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

app.post('/messages', async (req, res) => {
  const { content } = req.body;
  embedTextIntoImage(inputImagePath, content, outputImagePath);
  //console.log(content);
  try {
    const newMessage = await Message.create({ content: content });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Error saving message' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


//Stego functions
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
      return text;
  } catch (error) {
      console.error('Error:', error.message);
  }
}