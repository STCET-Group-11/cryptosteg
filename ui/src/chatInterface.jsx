import React, { useState, useEffect, useRef } from 'react';
import crypto from 'crypto-js';
import Spacecrypt from 'spacecrypt';
import axios from 'axios';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import './App.css'
import { Paper } from '@mui/material';
import Container from '@mui/material/Container';
 
const updatedDataFalse = {
  flag: 'false',
};

const updatedDataTrue = {
  flag: 'true',
};

const secretKey = 'qwerty';
const messageId = '64f240fb921a7b9b2ba8d197'; // Replace with the actual ID

// Define the URL with the query parameter
const getUrl = `http://localhost:3001/queries/${messageId}`;
const Url= 'http://localhost:3001/messages';

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const pollInterval = setInterval(getMessageById, 5000); 
    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const updateFlagFalse = async () => {
    axios.put(getUrl, updatedDataFalse)
    .then((response) => {
      console.log('Message updated False:', response.data);
      // Handle the updated message data as needed
    })
    .catch((error) => {
      console.error('Error updating message:', error);
      // Handle the error
    });
  };

  const updateFlagTrue = async () => {
    axios.put(getUrl, updatedDataTrue)
    .then((response) => {
      console.log('Message updated True:', response.data);
      // Handle the updated message data as needed
    })
    .catch((error) => {
      console.error('Error updating message:', error);
      // Handle the error
    });
  };


  const getMessageById = async () => {
    axios
    .get(getUrl)
    .then((response) => {
      const message = response.data;
      if (message.content=='true') {
        fetchMessages();
      }
    })
    .catch((error) => {
      console.error('Error retrieving message by ID:', error.message);
    });
  };

  const fetchMessages = async () => {
    updateFlagFalse();
    try {
      const response = await axios.get(Url);
      const fetchedMessages = response.data.map((message) => {
        if(message._id!= messageId)
        try {

          //steganalysis
          const decodedMessage = Spacecrypt.decrypt(message.content);
          //steganalysis ends

          const bytes1 = crypto.RabbitLegacy.decrypt(decodedMessage, secretKey);
          const decryptedMessage1 = bytes1.toString(crypto.enc.Utf8);
          const bytes = crypto.AES.decrypt(decryptedMessage1, secretKey);
          const decryptedMessage = bytes.toString(crypto.enc.Utf8);



          if (decryptedMessage) {
            return decryptedMessage;
          }
          return null;
        } catch (error) {
          console.error('Error decrypting message:', error);
          return null;
        }
      });setMessages(fetchedMessages.filter(Boolean));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  

  const sendMessage = async () => {
    if (inputMessage.trim() !== '') {
      console.log('Input message:', inputMessage); 
      


      const encryptedMessage = crypto.AES.encrypt(inputMessage, secretKey).toString();
      const encryptedMessage1 = crypto.RabbitLegacy.encrypt(encryptedMessage, secretKey).toString();
       console.log(encryptedMessage1);

      // stego
      const publicMessage = 'world'
      const encodedMessage = Spacecrypt.encrypt(publicMessage, encryptedMessage1);
      //stego end

      try {
        console.log('Sending data:', { content: encodedMessage}); 
        await axios.post(Url, { content: encodedMessage});
        setInputMessage('');
        updateFlagTrue();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className="prime">
      <div className="chat-interface">
        <div className="message-container">
          <Container maxWidth="sm">
            <Paper elevation={3} style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 10}}>
                {messages.map((message, index) => (
                  <div key={index} className="message">
                    <span>{index}: </span>
                    {message}
                  </div>
                ))}
                <div ref={messagesEndRef}>&nbsp;</div>
              
              <div className="input-container">
                <Box
                  component="form"
                  sx={{
                    '& > :not(style)': { m: 1, width: '50ch' },
                  }}
                  noValidate
                  autoComplete="off">
                  <TextField id="standard-basic" label="Type Message" variant="standard" sx={{
                  "& fieldset": { paddingBottom:10 ,border: 'none' },}}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)} />
                </Box>
              </div>
                <div className="Buuton">
                  <Box textAlign={'center'}>
                  <Button variant="contained" sx={{paddingBlock:1.2 ,fontSize: 15}} endIcon={<SendIcon />} onClick={sendMessage}>Send</Button>
                  </Box>
                </div>
            </Paper>
          </Container>
        </div>
      </div>
    </div>
  );
}
// m:4, p:1
export default ChatInterface;