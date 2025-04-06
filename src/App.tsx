import React, { useState } from 'react';
import ScreenRecorder from './components/screenrecoder/ScreenRecoder';
import GoogleLoginButton from './components/auth/GoogleLoginButton';
import { googleLogout } from '@react-oauth/google';
import backgroundimg from './components/images/bgimg.png'; 
export default function App() {
  const [user, setUser] = useState<any>(null);

  const handleLogout = () => {
    googleLogout();
    setUser(null);
  };

  return (
    <div>
      {user ? (
        <div>
          <div className="header-note">
            Love this app? DM me on{' '}
            <a
              href="https://www.linkedin.com/in/hari-mohan-prajapat-47299b54/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>{' '}
            💜
          </div>
          <div className="userinfo">
            <p>You are a happy user here!</p>
            <img src={user.picture} alt="User" width={40} height={40} />
            <span>{user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <ScreenRecorder />
        </div>
      ) : (
        <div className="login-container">
          <div className="login-image">
            <img src={backgroundimg} alt="Background" />
          </div>
          <div className="login-content">
            <h2>Welcome to Screen Recording App</h2>
            <p>Happy Login to start recording</p>
            <GoogleLoginButton onLogin={setUser} />
          </div>
        </div>
      )}
    </div>
  );
}
