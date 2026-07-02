// LoginPage.js
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './LoginPage.css';

function LoginPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const result = login(username, password);
      if (result.success) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error);
      }
    } else {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 4) {
        setError('Password must be at least 4 characters');
        return;
      }
      const result = register(username, password);
      if (result.success) {
        setIsLogin(true);
        setError('Registration successful! Please login.');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(result.error);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg">
        <div className="login-hearts">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="floating-heart" 
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 3}s`
              }}
            >
              
            </div>
          ))}
        </div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="love-icon">💕</div>
          <h1>Brian & Jasmine</h1>
          <p>Welcome to Our Love Story</p>
        </div>

        <div className="login-tabs">
          <button 
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Login
          </button>
          <button 
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <span className="input-icon">👤</span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {!isLogin && (
            <div className="input-group">
              <span className="input-icon">✓</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn">
            {isLogin ? '💖 Login 💖' : '💝 Register 💝'}
          </button>
        </form>

        <div className="login-footer">
          <div className="romantic-quote">
            <span>✨ Every love story is beautiful, but ours is my favorite ✨</span>
          </div>
        </div>

        {!isLogin && (
          <div className="demo-note">
            <p>💡 Create an account to start playing and earn rewards!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;