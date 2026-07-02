import React, { useState, useEffect, useRef } from 'react';
import './FlappyLoveBird.css';

function FlappyLoveBird({ onBack }) {
  const [birdY, setBirdY] = useState(250);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [userHighScore, setUserHighScore] = useState(0);
  const [brianRecord] = useState(278); // Brian's fixed record
  const [pipes, setPipes] = useState([]);
  const [showProposal, setShowProposal] = useState(false);
  const [proposalAccepted, setProposalAccepted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const gameLoopRef = useRef();
  const gameAreaRef = useRef();
  
  // Game dimensions - now full screen
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight - 120); // Account for header/footer
  
  // FASTER GAME CONSTANTS - scaled based on screen size
  const [GRAVITY, setGravity] = useState(0.35);
  const [JUMP_POWER, setJumpPower] = useState(-5.5);
  const [PIPE_SPEED, setPipeSpeed] = useState(2.8);
  const [PIPE_WIDTH, setPipeWidth] = useState(45);
  const [PIPE_GAP, setPipeGap] = useState(125);
  const [PIPE_SPACING, setPipeSpacing] = useState(200);
  const GROUND_HEIGHT = 55;
  
  // Scale game constants based on screen size
  useEffect(() => {
    const scale = Math.min(screenWidth / 380, screenHeight / 600);
    setPipeWidth(Math.max(35, 45 * scale));
    setPipeGap(Math.max(100, 125 * scale));
    setPipeSpacing(Math.max(160, 200 * scale));
    setPipeSpeed(Math.max(2, 2.8 * scale));
    setGravity(0.35 * scale);
    setJumpPower(Math.max(-7, -5.5 * scale));
  }, [screenWidth, screenHeight]);
  
  // Load user data on mount
  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight - 120);
      setBirdY(window.innerHeight / 2);
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Load user data from localStorage
    const savedName = localStorage.getItem('flappyLovePlayerName');
    const savedHighScore = localStorage.getItem('flappyLoveUserHighScore');
    
    if (savedName) {
      setPlayerName(savedName);
      setShowNameInput(false);
    }
    
    if (savedHighScore) {
      setUserHighScore(parseInt(savedHighScore));
    }
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Fullscreen handling
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.log(`Error attempting to enable full-screen mode: ${err.message}`);
    }
  };
  
  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Update dimensions when fullscreen changes
      setTimeout(() => {
        setScreenWidth(window.innerWidth);
        setScreenHeight(window.innerHeight - 120);
      }, 100);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Check for 1000 points to trigger proposal
  useEffect(() => {
    if (score >= 1000 && !proposalAccepted && !showProposal && gameStarted) {
      setShowProposal(true);
      setGameStarted(false);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }
  }, [score, gameStarted, proposalAccepted, showProposal]);
  
  // Save user high score whenever it updates
  useEffect(() => {
    if (userHighScore > 0) {
      localStorage.setItem('flappyLoveUserHighScore', userHighScore.toString());
    }
  }, [userHighScore]);
  
  // Save player name
  const savePlayerName = () => {
    if (playerName.trim()) {
      localStorage.setItem('flappyLovePlayerName', playerName);
      setShowNameInput(false);
    }
  };
  
  // Game loop
  useEffect(() => {
    if (gameStarted && !gameOver && !showProposal) {
      gameLoopRef.current = setInterval(() => updateGame(), 1000 / 60);
    }
    return () => clearInterval(gameLoopRef.current);
  }, [gameStarted, gameOver, birdY, birdVelocity, pipes, screenHeight, showProposal]);
  
  const generatePipe = (xPosition) => {
    const minHeight = 55;
    const maxHeight = screenHeight - PIPE_GAP - GROUND_HEIGHT - 75;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    return {
      x: xPosition,
      topHeight: topHeight,
      bottomY: topHeight + PIPE_GAP,
      passed: false,
      id: Date.now() + Math.random()
    };
  };
  
  const updateGame = () => {
    // Bird physics
    const newVelocity = birdVelocity + GRAVITY;
    const newBirdY = birdY + newVelocity;
    const groundY = screenHeight - GROUND_HEIGHT - 15;
    
    setBirdVelocity(newVelocity);
    setBirdY(newBirdY);
    
    // Ground & ceiling collision
    if (newBirdY <= 0 || newBirdY + 28 >= groundY) {
      endGame();
      return;
    }
    
    // Pipe movement
    setPipes(prevPipes => {
      let updatedPipes = prevPipes.map(pipe => ({
        ...pipe,
        x: pipe.x - PIPE_SPEED
      })).filter(pipe => pipe.x > -PIPE_WIDTH);
      
      // Generate new pipes
      if (updatedPipes.length === 0 || 
          (updatedPipes[updatedPipes.length - 1].x <= screenWidth - PIPE_SPACING)) {
        const lastPipeX = updatedPipes.length > 0 
          ? updatedPipes[updatedPipes.length - 1].x 
          : screenWidth;
        const newPipeX = Math.max(lastPipeX + PIPE_SPACING, screenWidth);
        updatedPipes.push(generatePipe(newPipeX));
      }
      
      return updatedPipes;
    });
    
    // Collision detection and scoring
    setPipes(prevPipes => {
      const birdRect = { x: 75, y: newBirdY, width: 28, height: 24 };
      let newScore = score;
      let shouldEnd = false;
      
      for (let pipe of prevPipes) {
        // Top pipe collision
        if (birdRect.x < pipe.x + PIPE_WIDTH &&
            birdRect.x + birdRect.width > pipe.x &&
            birdRect.y < pipe.topHeight) {
          shouldEnd = true;
          break;
        }
        
        // Bottom pipe collision
        if (birdRect.x < pipe.x + PIPE_WIDTH &&
            birdRect.x + birdRect.width > pipe.x &&
            birdRect.y + birdRect.height > pipe.bottomY) {
          shouldEnd = true;
          break;
        }
        
        // Scoring
        if (!pipe.passed && pipe.x + PIPE_WIDTH < birdRect.x) {
          pipe.passed = true;
          newScore++;
        }
      }
      
      if (shouldEnd) {
        endGame();
        return prevPipes;
      }
      
      if (newScore > score) {
        setScore(newScore);
        // Update user's personal high score
        if (newScore > userHighScore) {
          setUserHighScore(newScore);
        }
      }
      
      return prevPipes;
    });
  };
  
  const startGame = () => {
    setBirdY(screenHeight / 2);
    setBirdVelocity(0);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setShowProposal(false);
    
    // Generate initial pipes
    const initialPipes = [];
    const minHeight = 55;
    const maxHeight = screenHeight - PIPE_GAP - GROUND_HEIGHT - 75;
    
    for (let i = 1; i <= 5; i++) {
      const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
      initialPipes.push({
        x: screenWidth + (i * PIPE_SPACING),
        topHeight: topHeight,
        bottomY: topHeight + PIPE_GAP,
        passed: false,
        id: Date.now() + i
      });
    }
    setPipes(initialPipes);
  };
  
  const endGame = () => {
    setGameOver(true);
    setGameStarted(false);
    if (window.navigator.vibrate) window.navigator.vibrate(100);
  };
  
  const handleTap = () => {
    if (!gameStarted && !gameOver && !showProposal && !showNameInput) {
      startGame();
    } else if (gameStarted && !gameOver && !showProposal) {
      setBirdVelocity(JUMP_POWER);
      if (window.navigator.vibrate) window.navigator.vibrate(20);
    }
  };
  
  const acceptProposal = () => {
    setProposalAccepted(true);
    setShowProposal(false);
    if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
  };
  
  const declineProposal = () => {
    setShowProposal(false);
    setGameOver(true);
  };
  
  const resetGame = () => {
    setGameOver(false);
    setGameStarted(false);
    setScore(0);
    setBirdY(screenHeight / 2);
    setBirdVelocity(0);
    setPipes([]);
  };
  
  // Keyboard support
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleTap();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameStarted, gameOver, showProposal, showNameInput]);
  
  const birdRotation = gameStarted ? Math.min(Math.max(birdVelocity * 2.5, -35), 35) : 0;
  const groundY = screenHeight - GROUND_HEIGHT;
  
  return (
    <div className={`mobile-game-container ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Name Input Modal */}
      {showNameInput && (
        <div className="name-input-overlay">
          <div className="name-input-card">
            <div className="name-icon">💖</div>
            <h2>Welcome to Flappy Love Bird!</h2>
            <p>Enter your name to start playing</p>
            <input 
              type="text" 
              className="name-input"
              placeholder="Your name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <button className="name-submit" onClick={savePlayerName}>
              Start Flying 🚀
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="game-header">
        <button className="back-button" onClick={onBack}>←</button>
        <div className="game-title">Flappy Love Bird</div>
        <button className="fullscreen-button" onClick={toggleFullscreen}>
          {isFullscreen ? '🗗' : '🗖'}
        </button>
        <div className="player-badge">
          {playerName} 💕
        </div>
      </div>
      
      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Your Best:</span>
          <span className="stat-value">{userHighScore}</span>
        </div>
        <div className="stat-divider">|</div>
        <div className="stat-item">
          <span className="stat-label">Brian's Record:</span>
          <span className="stat-value brian-stat">{brianRecord}</span>
        </div>
        <div className="stat-divider">|</div>
        <div className="stat-item">
          <span className="stat-label">💡 F Key</span>
          <span className="stat-value">Fullscreen</span>
        </div>
      </div>
      
      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        className="game-area" 
        onClick={handleTap}
        style={{ width: screenWidth, height: screenHeight }}
      >
        <svg width={screenWidth} height={screenHeight} viewBox={`0 0 ${screenWidth} ${screenHeight}`}>
          {/* Sky Background */}
          <rect width={screenWidth} height={screenHeight} fill="#87CEEB"/>
          
          {/* Clouds */}
          <circle cx={screenWidth * 0.2 + (Date.now() * 0.05) % screenWidth} cy={screenHeight * 0.15} r={screenWidth * 0.08} fill="white" opacity="0.6"/>
          <circle cx={screenWidth * 0.7 + (Date.now() * 0.03) % screenWidth} cy={screenHeight * 0.25} r={screenWidth * 0.09} fill="white" opacity="0.5"/>
          
          {/* Green Pillars */}
          {pipes.map((pipe, i) => (
            <g key={pipe.id || i}>
              {/* Top Pillar */}
              <rect 
                x={pipe.x} 
                y={0} 
                width={PIPE_WIDTH} 
                height={pipe.topHeight} 
                fill="#2d6a4f"
              />
              <rect 
                x={pipe.x - 5} 
                y={pipe.topHeight - 30} 
                width={PIPE_WIDTH + 10} 
                height={30} 
                fill="#1b4332"
                rx="3"
              />
              <rect 
                x={pipe.x - 5} 
                y={pipe.topHeight - 30} 
                width={PIPE_WIDTH + 10} 
                height={6} 
                fill="#081c15"
              />
              
              {/* Bottom Pillar */}
              <rect 
                x={pipe.x} 
                y={pipe.bottomY} 
                width={PIPE_WIDTH} 
                height={screenHeight - pipe.bottomY - GROUND_HEIGHT} 
                fill="#2d6a4f"
              />
              <rect 
                x={pipe.x - 5} 
                y={pipe.bottomY} 
                width={PIPE_WIDTH + 10} 
                height={30} 
                fill="#1b4332"
                rx="3"
              />
              <rect 
                x={pipe.x - 5} 
                y={pipe.bottomY + 24} 
                width={PIPE_WIDTH + 10} 
                height={6} 
                fill="#081c15"
              />
            </g>
          ))}
          
          {/* Bird */}
          <g transform={`translate(75, ${birdY}) rotate(${birdRotation})`}>
            <ellipse cx="15" cy="12" rx="15" ry="12" fill="#FFD93D"/>
            <ellipse cx="8" cy="12" rx="10" ry="7" fill="#FFC107"/>
            <circle cx="21" cy="8" r="3.5" fill="white"/>
            <circle cx="22" cy="8" r="1.8" fill="black"/>
            <polygon points="28,9 35,11 28,13" fill="#FF8C00"/>
            <text x="4" y="-4" fontSize={Math.max(12, screenWidth * 0.03)} fill="#FF6B9D">👑</text>
          </g>
          
          {/* Ground */}
          <rect x="0" y={groundY} width={screenWidth} height={GROUND_HEIGHT} fill="#8B4513"/>
          <rect x="0" y={groundY - 4} width={screenWidth} height="4" fill="#228B22"/>
          
          {[...Array(Math.floor(screenWidth / 45))].map((_, i) => (
            <rect 
              key={i} 
              x={i * 45 + (Date.now() * 0.1) % 45} 
              y={groundY + 12} 
              width="10" 
              height="10" 
              fill="#6B3410" 
              rx="2"
            />
          ))}
          
          <text x={screenWidth / 2} y={groundY + GROUND_HEIGHT / 2 + 4} fontSize={Math.max(10, screenWidth * 0.025)} fill="white" textAnchor="middle">💖 Love Ground 💖</text>
        </svg>
        
        {/* Score Display */}
        {(gameStarted || gameOver) && !showProposal && (
          <div className="score-badge">
            <span className="score-heart">💖</span>
            <span className="score-value">{score}</span>
          </div>
        )}
        
        {/* Record Beat Alert */}
        {gameStarted && score > 0 && score === userHighScore && score > 278 && (
          <div className="record-beat">
            🎉 NEW PERSONAL RECORD! You're on fire! 🎉
          </div>
        )}
        
        {/* Proposal Screen */}
        {showProposal && (
          <div className="proposal-overlay">
            <div className="proposal-card">
              <div className="engagement-ring">💍</div>
              <h2>🎉 1000 Points! 🎉</h2>
              <div className="proposal-message">
                <p>You've flown through 1000 hearts FAST! 💖</p>
                <div className="proposal-text">
                  <p>💕 Will you accept this engagement ring? 💕</p>
                  <p className="romantic-line">"Fast or slow, my love for you only grows."</p>
                  <p className="romantic-line">Will you marry me?" 💍</p>
                </div>
              </div>
              <div className="proposal-buttons">
                <button className="accept-btn" onClick={acceptProposal}>
                  Yes! I do! 💖
                </button>
                <button className="decline-btn" onClick={declineProposal}>
                  Not yet 💔
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Start Screen */}
        {!gameStarted && !gameOver && !showProposal && !showNameInput && (
          <div className="start-screen">
            <div className="start-card">
              <div className="big-heart">💖</div>
              <h2>Flappy Love Bird</h2>
              <p>Welcome, {playerName}! 👋</p>
              <div className="stats-preview">
                <div className="preview-item">
                  🏆 Your Best: <strong>{userHighScore}</strong>
                </div>
                <div className="preview-item">
                  🎯 Brian's Record: <strong>{brianRecord}</strong>
                </div>
              </div>
              <div className="special-goal">🎯 Reach 1000 points = Special Gift 🏆</div>
              <button className="tap-button" onClick={startGame}>
                START GAME
              </button>
              <div className="tap-hint">
                👆 Tap anywhere to fly FASTER
              </div>
            </div>
          </div>
        )}
        
        {/* Game Over Screen */}
        {gameOver && !showProposal && (
          <div className="gameover-screen">
            <div className="gameover-card">
              <div className="broken-heart">💔</div>
              <h2>Game Over, {playerName}!</h2>
              <div className="final-score">
                <div>Your Score</div>
                <div className="final-number">{score}</div>
              </div>
              
              {/* Record Display Section */}
              <div className="records-display">
                <div className="record-row">
                  <span>🏆 Your Highest Record:</span>
                  <strong className={score >= userHighScore ? 'new-record' : ''}>
                    {userHighScore}
                  </strong>
                </div>
                <div className="record-row">
                  <span>🎯 Brian's Record:</span>
                  <strong>{brianRecord}</strong>
                </div>
              </div>
              
              {/* Comparison Message */}
              <div className="record-comparison">
                {score > brianRecord && score > userHighScore ? (
                  <div className="beat-both">
                    🎉🏆 INCREDIBLE! You beat BOTH records! 🏆🎉
                    <div className="legend-status">You are the Flappy Love Legend! 👑</div>
                  </div>
                ) : score > brianRecord ? (
                  <div className="beat-brian">
                    🎉 AMAZING! You beat Brian's record of {brianRecord}! 🎉
                    <div className="new-champion">🏆 New Champion! 🏆</div>
                  </div>
                ) : score > userHighScore && score > 0 ? (
                  <div className="beat-personal">
                    🎉 NEW PERSONAL BEST! You beat your old record! 🎉
                  </div>
                ) : score === brianRecord ? (
                  <div className="tied-record">
                    🤝 TIED! You matched Brian's record of {brianRecord}! 🤝
                  </div>
                ) : score === userHighScore && score > 0 ? (
                  <div className="tied-personal">
                    ✨ Matched your personal best! ✨
                  </div>
                ) : (
                  <div className="try-harder">
                    💪 Brian's record: {brianRecord} | Your best: {userHighScore}
                    {userHighScore < brianRecord && (
                      <div className="need-more">You need {brianRecord - userHighScore} more to beat Brian!</div>
                    )}
                  </div>
                )}
              </div>
              
              <button className="play-again" onClick={resetGame}>
                Play Again
              </button>
              <button className="home-button" onClick={onBack}>
                Back to Love Letter
              </button>
            </div>
          </div>
        )}
        
        {/* Proposal Accepted Screen */}
        {proposalAccepted && (
          <div className="proposal-accepted-overlay">
            <div className="accepted-card">
              <div className="confetti">🎉💖🎊💍🎉</div>
              <div className="engaged-ring">💍💖</div>
              <h2>She Said Yes! 🥰</h2>
              <div className="engaged-message">
                <p>Congratulations, {playerName}! You're engaged!</p>
                <p>Your record: {userHighScore} points!</p>
                <p className="signature">Forever and always ❤️</p>
              </div>
              <button className="continue-btn" onClick={() => {
                setProposalAccepted(false);
                onBack();
              }}>
                Return to Love Letter 💌
              </button>
            </div>
          </div>
        )}
        
        {/* Tap Instruction */}
        {gameStarted && !gameOver && !showProposal && (
          <div className="tap-instruction">
            👆 QUICK TAP TO FLY | Press F for Fullscreen
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="game-footer">
        <span>⚡ 🏆 Your best: {userHighScore} | 🎯 Beat Brian's {brianRecord}! | 👆 Tap faster! | Press F for Fullscreen</span>
      </div>
    </div>
  );
}

export default FlappyLoveBird;