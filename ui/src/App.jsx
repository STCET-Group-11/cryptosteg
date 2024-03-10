import React from 'react';
import './App.css';
import ChatInterface from './chatInterface'; // Correct the import path

function App() {
  return (
    <div className="app-container">
      <h1>Chat App</h1>
      <ChatInterface />
    </div>
  );
}

export default App;
