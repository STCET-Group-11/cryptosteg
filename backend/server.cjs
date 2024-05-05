const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto-js');
const Message = require('./models/Message.cjs');
const Query = require('./models/Query.cjs');
const AuthUser = require('./models/AuthUser.cjs');
const app = express();
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 3001;


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
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

app.post('/messages', async (req, res) => {
  const { content } = req.body;


  try {
    const newMessage = await Message.create({ content: content });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Error saving message' });
  }
});

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email is already authenticated
    const existingUser = await AuthUser.findOne({ email });
    if (existingUser) {
      // Generate OTP
      const otp = generateOTP();

      // Store OTP in the database
      existingUser.otp = otp;
      existingUser.otpExpiry = new Date(Date.now() + 360000);
      await existingUser.save();

      // Send OTP to the email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'grp11.majorproject@gmail.com',
          pass: 'qdukxefjvrndwkhs'
        }
      });

      const mailOptions = {
        from: 'grp11.majorproject@gmail.com',
        to: email,
        subject: 'OTP for authentication',
        text: `Your OTP is: ${otp}`
      };

      await transporter.sendMail(mailOptions);

      res.json({ success: true, message: 'OTP sent successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Email not authorized' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint for verifying OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await AuthUser.findOne({ email, otp, otpExpiry: { $gt: new Date() } });
    if (user) {
      // Clear OTP and OTP expiry in the database
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();

      res.json({ success: true, message: 'OTP verified successfully' });
    } else {
      res.json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Generate a random alphanumeric OTP
function generateOTP() {
  const length = 6;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let OTP = '';
  for (let i = 0; i < length; i++) {
    OTP += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return OTP;
}



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
