import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import SendingOTPModal from './SendingOTPModal';


const AuthUser = ({ onAuthentication }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false); // State to track if OTP is sent
  const [sendingOTP, setSendingOTP] = useState(false); // State to track sending OTP state

  const handleSendOTP = async () => {
    setSendingOTP(true); // Set sendingOTP to true when sending OTP
    try {
      await axios.post('http://localhost:3001/send-otp', { email });
      setOtpSent(true);
      setMessage('OTP sent. Please enter OTP to verify.');
    } catch (error) {
      console.error(error);
      setMessage('Failed to send OTP');
    } finally {
      setSendingOTP(false); // Reset sendingOTP to false
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
      setMessage('Failed to validate OTP');
    }
  };

  return (
    <div>
      <div className="auth-container">
        <h2>Email OTP Authentication</h2>
        {!otpSent && (
          <div className="input-container">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleSendOTP} style={{ marginBottom: 10.5 }}>Send OTP</button>
          </div>
        )}
        {otpSent && (
          <div className="input-container">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={handleVerifyOTP} style={{ marginBottom: 10.5 }}>Verify OTP</button>
          </div>
        )}
        <p>{message}</p>
        {sendingOTP && <SendingOTPModal />} {/* Show SendingOTPModal if sendingOTP is true */}
      </div>
    </div>
  );
};

export default AuthUser;
