// FirebaseLoginPage.js - Updated with no hearts
import React, { useState, useEffect } from 'react';
import { useAuth } from './FirebaseAuthContext';
import './LoginPage.css';

function FirebaseLoginPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, register } = useAuth();

  // Check for saved credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedSudokuEmail');
    const savedRemember = localStorage.getItem('rememberSudoku');
    if (savedRemember === 'true' && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    if (isLogin) {
      const result = await login(email, password);
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('savedSudokuEmail', email);
          localStorage.setItem('rememberSudoku', 'true');
        } else {
          localStorage.removeItem('savedSudokuEmail');
          localStorage.removeItem('rememberSudoku');
        }
        onLoginSuccess(result.user);
      } else {
        setError(result.error);
      }
    } else {
      // Validation
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }
      if (username.length < 3) {
        setError('Username must be at least 3 characters');
        setIsLoading(false);
        return;
      }
      if (!email.includes('@')) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }
      
      const result = await register(email, password, username);
      if (result.success) {
        setSuccessMessage('Registration successful! Please login with your credentials.');
        setIsLogin(true);
        setEmail('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setError('');
      } else {
        if (result.error === 'Email already registered. Please login instead.') {
          setError('This email is already registered. Please login instead.');
          setTimeout(() => {
            setIsLogin(true);
            setError('');
          }, 3000);
        } else {
          setError(result.error);
        }
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon">🎮</div>
          <h1>Our Love Story</h1>
          <p>Sign in to continue your journey</p>
          <div className="sync-badge">
            <span>☁️</span>
            <span>Cross-Device Sync Enabled</span>
          </div>
        </div>

        <div className="login-tabs">
          <button 
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }}
          >
            Sign In
          </button>
          <button 
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <span className="input-icon">📧</span>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {!isLogin && (
            <div className="input-group">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder="Username (unique)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          )}

          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
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

          {isLogin && (
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me on this device</span>
              </label>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="login-footer">
          <div className="romantic-quote">
            <span>✨ Play Games, Track Scores, Compete Globally ✨</span>
          </div>
        </div>

        <div className="cloud-features">
          <div className="feature">
            <span>☁️</span>
            <span>Cross-device sync</span>
          </div>
          <div className="feature">
            <span>🏆</span>
            <span>Global leaderboard</span>
          </div>
          <div className="feature">
            <span>📬</span>
            <span>Real-time notifications</span>
          </div>
          <div className="feature">
            <span>🔄</span>
            <span>Auto-save progress</span>
          </div>
        </div>

        <div className="cross-device-info">
          <div className="info-icon">📱💻🖥️</div>
          <p>Play on any device! Your progress syncs automatically.</p>
        </div>

        {!isLogin && (
          <div className="demo-account">
            <p>💡 Demo Account (for testing):</p>
            <p>Email: demo@example.com</p>
            <p>Password: demo123</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FirebaseLoginPage;