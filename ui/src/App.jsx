import React, { useState } from 'react';
import './App.css';
import OTPAuth from './OTPAuth';
import ChatInterface from './chatInterface'; 

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  // Function to handle authentication status change
  const handleAuthentication = (isAuthenticated) => {
    setAuthenticated(isAuthenticated);
  };

  return (
    <div className="app-container">
      <h1>Chat App</h1>
      {authenticated ? <ChatInterface /> : <OTPAuth onAuthentication={handleAuthentication} />}
    </div>
  );
}

export default App;

