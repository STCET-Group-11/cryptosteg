import React, { useState } from 'react';
import axios from 'axios';
import './App.css'

const AuthUser = ({ onAuthentication }) => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');

  const handleSendOTP = async () => {
    try {
      const response = await axios.post('http://localhost:3001/send-otp', { email });
      setMessage(response.data.message);
    } catch (error) {
      console.error(error);
      setMessage("Failed to send OTP");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post('http://localhost:3001/verify-otp', { email, otp });
      if (response.data.success) {
        onAuthentication(true);
      } else {
        setMessage('Invalid OTP');
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to validate OTP");
    }
  };

  return (
    <div>
      <div className="auth-container">  
        <h2 >Email OTP Authentication</h2>
        <div className="input-container">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleSendOTP}>Send OTP</button>
        </div>
        <div className="input-container">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerifyOTP}>Verify OTP</button>
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default AuthUser;
