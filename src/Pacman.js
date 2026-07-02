import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Pacman.css';

function Pacman({ onBack, currentPlayer }) {
  // Game dimensions - responsive
  const getCellSize = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 400) return 20;
    if (screenWidth < 500) return 25;
    return 30;
  };
  
  const GRID_SIZE = 19;
  const [CELL_SIZE, setCellSize] = useState(getCellSize());
  const [GAME_WIDTH, setGameWidth] = useState(GRID_SIZE * getCellSize());
  const [GAME_HEIGHT, setGameHeight] = useState(GRID_SIZE * getCellSize());

  // Game states
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWin, setGameWin] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  
  // Pacman position and direction
  const [pacmanPos, setPacmanPos] = useState({ x: 14, y: 15 });
  const [pacmanDir, setPacmanDir] = useState('right');
  const [nextDir, setNextDir] = useState('right');
  const [pacmanMouth, setPacmanMouth] = useState(0);
  
  // Touch controls
  const [showTouchControls, setShowTouchControls] = useState(true);
  
  // Ghosts
  const [ghosts, setGhosts] = useState([
    { id: 'blinky', x: 13, y: 11, color: '#ff0000', direction: 'left', scared: false, scaredTimer: 0 },
    { id: 'pinky', x: 13, y: 12, color: '#ffb8ff', direction: 'right', scared: false, scaredTimer: 0 },
    { id: 'inky', x: 11, y: 11, color: '#00ffff', direction: 'up', scared: false, scaredTimer: 0 },
    { id: 'clyde', x: 12, y: 11, color: '#ffb852', direction: 'down', scared: false, scaredTimer: 0 }
  ]);
  
  // Game board
  const [dots, setDots] = useState([]);
  const [powerPellets, setPowerPellets] = useState([]);
  
  // Game loop refs
  const gameLoopRef = useRef(null);
  const mouthAnimationRef = useRef(null);
  const ghostAIref = useRef(null);
  
  // Classic Pacman maze layout
  const mazeLayout = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1],
    [0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0],
    [1,1,1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,1,1],
    [0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0],
    [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
    [0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0],
    [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newCellSize = getCellSize();
      setCellSize(newCellSize);
      setGameWidth(GRID_SIZE * newCellSize);
      setGameHeight(GRID_SIZE * newCellSize);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize game
  const initGame = () => {
    const newDots = [];
    const newPowerPellets = [];
    
    for (let y = 0; y < mazeLayout.length; y++) {
      for (let x = 0; x < mazeLayout[y].length; x++) {
        if (mazeLayout[y][x] === 0) {
          if ((x === 1 && y === 1) || (x === 17 && y === 1) || 
              (x === 1 && y === 20) || (x === 17 && y === 20)) {
            newPowerPellets.push({ x, y, eaten: false });
          } else {
            newDots.push({ x, y, eaten: false });
          }
        }
      }
    }
    
    setDots(newDots);
    setPowerPellets(newPowerPellets);
    setPacmanPos({ x: 14, y: 15 });
    setPacmanDir('right');
    setNextDir('right');
    setScore(0);
    setGameOver(false);
    setGameWin(false);
    setGameStarted(true);
    setLives(3);
    
    setGhosts([
      { id: 'blinky', x: 13, y: 11, color: '#ff0000', direction: 'left', scared: false, scaredTimer: 0 },
      { id: 'pinky', x: 13, y: 12, color: '#ffb8ff', direction: 'right', scared: false, scaredTimer: 0 },
      { id: 'inky', x: 11, y: 11, color: '#00ffff', direction: 'up', scared: false, scaredTimer: 0 },
      { id: 'clyde', x: 12, y: 11, color: '#ffb852', direction: 'down', scared: false, scaredTimer: 0 }
    ]);
  };

  // Load player data
  useEffect(() => {
    const savedName = localStorage.getItem('pacmanPlayerName');
    const savedHighScore = localStorage.getItem('pacmanHighScore');
    
    if (savedName) {
      setPlayerName(savedName);
    } else {
      const name = currentPlayer || localStorage.getItem('flappyLovePlayerName') || 'Player';
      setPlayerName(name);
      localStorage.setItem('pacmanPlayerName', name);
    }
    
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('pacmanHighScore', score.toString());
      // Haptic feedback for high score
      if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
    }
  }, [score, highScore]);

  // Check win condition
  useEffect(() => {
    const remainingDots = dots.filter(dot => !dot.eaten).length;
    const remainingPowerPellets = powerPellets.filter(p => !p.eaten).length;
    
    if (remainingDots === 0 && remainingPowerPellets === 0 && gameStarted && !gameOver) {
      setGameWin(true);
      setGameStarted(false);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (ghostAIref.current) clearInterval(ghostAIref.current);
      if (window.navigator.vibrate) window.navigator.vibrate([300, 200, 300]);
    }
  }, [dots, powerPellets, gameStarted, gameOver]);

  // Pacman mouth animation
  useEffect(() => {
    if (gameStarted && !gameOver && !gameWin) {
      mouthAnimationRef.current = setInterval(() => {
        setPacmanMouth(prev => (prev + 1) % 4);
      }, 100);
    }
    return () => clearInterval(mouthAnimationRef.current);
  }, [gameStarted, gameOver, gameWin]);

  // Game loop
  useEffect(() => {
    if (gameStarted && !gameOver && !gameWin) {
      gameLoopRef.current = setInterval(() => {
        movePacman();
      }, 150);
      
      ghostAIref.current = setInterval(() => {
        moveGhosts();
      }, 200);
    }
    return () => {
      clearInterval(gameLoopRef.current);
      clearInterval(ghostAIref.current);
    };
  }, [gameStarted, gameOver, gameWin, pacmanPos]);

  // Move Pacman
  const movePacman = () => {
    let newPos = { ...pacmanPos };
    let currentDir = pacmanDir;
    
    if (canMove(nextDir, pacmanPos.x, pacmanPos.y)) {
      currentDir = nextDir;
      setPacmanDir(nextDir);
    }
    
    if (canMove(currentDir, pacmanPos.x, pacmanPos.y)) {
      switch (currentDir) {
        case 'up': newPos.y--; break;
        case 'down': newPos.y++; break;
        case 'left': newPos.x--; break;
        case 'right': newPos.x++; break;
        default: break;
      }
      
      if (newPos.x < 0) newPos.x = GRID_SIZE - 1;
      if (newPos.x >= GRID_SIZE) newPos.x = 0;
      
      setPacmanPos(newPos);
      
      // Eat dots
      const dotIndex = dots.findIndex(d => d.x === newPos.x && d.y === newPos.y && !d.eaten);
      if (dotIndex !== -1) {
        const newDots = [...dots];
        newDots[dotIndex].eaten = true;
        setDots(newDots);
        setScore(prev => prev + 10);
        if (window.navigator.vibrate) window.navigator.vibrate(10);
      }
      
      // Eat power pellets
      const pelletIndex = powerPellets.findIndex(p => p.x === newPos.x && p.y === newPos.y && !p.eaten);
      if (pelletIndex !== -1) {
        const newPellets = [...powerPellets];
        newPellets[pelletIndex].eaten = true;
        setPowerPellets(newPellets);
        setScore(prev => prev + 50);
        
        setGhosts(prevGhosts => prevGhosts.map(ghost => ({
          ...ghost,
          scared: true,
          scaredTimer: 300
        })));
        
        if (window.navigator.vibrate) window.navigator.vibrate(50);
      }
    }
  };

  const canMove = (direction, x, y) => {
    let newX = x;
    let newY = y;
    
    switch (direction) {
      case 'up': newY--; break;
      case 'down': newY++; break;
      case 'left': newX--; break;
      case 'right': newX++; break;
      default: break;
    }
    
    if (newX < 0) newX = GRID_SIZE - 1;
    if (newX >= GRID_SIZE) newX = 0;
    if (newY < 0 || newY >= mazeLayout.length) return false;
    
    return mazeLayout[newY] && mazeLayout[newY][newX] !== 1;
  };

  const moveGhosts = () => {
    setGhosts(prevGhosts => {
      return prevGhosts.map(ghost => {
        let newGhost = { ...ghost };
        
        if (newGhost.scared) {
          newGhost.scaredTimer--;
          if (newGhost.scaredTimer <= 0) {
            newGhost.scared = false;
          }
        }
        
        const directions = [];
        const possibleDirs = ['up', 'down', 'left', 'right'];
        
        for (const dir of possibleDirs) {
          let newX = newGhost.x;
          let newY = newGhost.y;
          switch (dir) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
          }
          
          if (canMove(dir, newGhost.x, newGhost.y) && 
              !(newX === pacmanPos.x && newY === pacmanPos.y && newGhost.scared)) {
            directions.push(dir);
          }
        }
        
        if (directions.length > 0) {
          let newDirection;
          
          if (newGhost.scared) {
            newDirection = directions[Math.floor(Math.random() * directions.length)];
          } else {
            switch (newGhost.id) {
              case 'blinky':
                newDirection = getChaseDirection(newGhost.x, newGhost.y, directions, pacmanPos.x, pacmanPos.y);
                break;
              case 'pinky':
                let targetX = pacmanPos.x;
                let targetY = pacmanPos.y;
                switch (pacmanDir) {
                  case 'up': targetY -= 4; break;
                  case 'down': targetY += 4; break;
                  case 'left': targetX -= 4; break;
                  case 'right': targetX += 4; break;
                }
                newDirection = getChaseDirection(newGhost.x, newGhost.y, directions, targetX, targetY);
                break;
              case 'inky':
                newDirection = directions[Math.floor(Math.random() * directions.length)];
                break;
              case 'clyde':
                const distance = Math.abs(newGhost.x - pacmanPos.x) + Math.abs(newGhost.y - pacmanPos.y);
                if (distance > 8) {
                  newDirection = getChaseDirection(newGhost.x, newGhost.y, directions, pacmanPos.x, pacmanPos.y);
                } else {
                  newDirection = directions[Math.floor(Math.random() * directions.length)];
                }
                break;
              default:
                newDirection = directions[0];
            }
          }
          
          switch (newDirection) {
            case 'up': newGhost.y--; break;
            case 'down': newGhost.y++; break;
            case 'left': newGhost.x--; break;
            case 'right': newGhost.x++; break;
          }
          newGhost.direction = newDirection;
          
          if (newGhost.x < 0) newGhost.x = GRID_SIZE - 1;
          if (newGhost.x >= GRID_SIZE) newGhost.x = 0;
        }
        
        return newGhost;
      });
    });
  };

  const getChaseDirection = (ghostX, ghostY, directions, targetX, targetY) => {
    let bestDir = directions[0];
    let bestDist = Infinity;
    
    for (const dir of directions) {
      let newX = ghostX;
      let newY = ghostY;
      switch (dir) {
        case 'up': newY--; break;
        case 'down': newY++; break;
        case 'left': newX--; break;
        case 'right': newX++; break;
      }
      
      const dist = Math.abs(newX - targetX) + Math.abs(newY - targetY);
      if (dist < bestDist) {
        bestDist = dist;
        bestDir = dir;
      }
    }
    
    return bestDir;
  };

  // Check collision with ghosts
  useEffect(() => {
    const collision = ghosts.some(ghost => ghost.x === pacmanPos.x && ghost.y === pacmanPos.y);
    
    if (collision && gameStarted && !gameOver && !gameWin) {
      const collidedGhost = ghosts.find(ghost => ghost.x === pacmanPos.x && ghost.y === pacmanPos.y);
      
      if (collidedGhost?.scared) {
        setScore(prev => prev + 200);
        setGhosts(prevGhosts => prevGhosts.map(ghost => {
          if (ghost.id === collidedGhost.id) {
            return { ...ghost, x: 13, y: 11, scared: false, scaredTimer: 0 };
          }
          return ghost;
        }));
        if (window.navigator.vibrate) window.navigator.vibrate(100);
      } else {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
            setGameStarted(false);
            clearInterval(gameLoopRef.current);
            clearInterval(ghostAIref.current);
          } else {
            setPacmanPos({ x: 14, y: 15 });
            setGhosts(prevGhosts => prevGhosts.map(ghost => {
              const resetPos = {
                blinky: { x: 13, y: 11 },
                pinky: { x: 13, y: 12 },
                inky: { x: 11, y: 11 },
                clyde: { x: 12, y: 11 }
              };
              return { ...ghost, ...resetPos[ghost.id], scared: false, scaredTimer: 0 };
            }));
          }
          return newLives;
        });
        if (window.navigator.vibrate) window.navigator.vibrate(200);
      }
    }
  }, [pacmanPos, ghosts, gameStarted, gameOver, gameWin]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted || gameOver || gameWin) {
        if (e.code === 'Space' && (gameOver || gameWin)) {
          initGame();
        }
        return;
      }
      
      switch (e.key) {
        case 'ArrowUp': setNextDir('up'); break;
        case 'ArrowDown': setNextDir('down'); break;
        case 'ArrowLeft': setNextDir('left'); break;
        case 'ArrowRight': setNextDir('right'); break;
        default: break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver, gameWin]);

  // Touch control handlers
  const handleTouchDirection = (direction) => {
    if (gameStarted && !gameOver && !gameWin) {
      setNextDir(direction);
      if (window.navigator.vibrate) window.navigator.vibrate(10);
    }
  };

  const renderBoard = () => {
    const elements = [];
    
    for (let y = 0; y < mazeLayout.length; y++) {
      for (let x = 0; x < mazeLayout[y].length; x++) {
        if (mazeLayout[y][x] === 1) {
          elements.push(
            <div
              key={`wall-${x}-${y}`}
              className="wall"
              style={{
                position: 'absolute',
                left: x * CELL_SIZE,
                top: y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: '#2121de'
              }}
            />
          );
        }
      }
    }
    
    dots.forEach(dot => {
      if (!dot.eaten) {
        elements.push(
          <div
            key={`dot-${dot.x}-${dot.y}`}
            className="dot"
            style={{
              position: 'absolute',
              left: dot.x * CELL_SIZE + CELL_SIZE / 2 - 3,
              top: dot.y * CELL_SIZE + CELL_SIZE / 2 - 3,
              width: Math.max(4, CELL_SIZE * 0.2),
              height: Math.max(4, CELL_SIZE * 0.2),
              borderRadius: '50%',
              backgroundColor: '#fff'
            }}
          />
        );
      }
    });
    
    powerPellets.forEach(pellet => {
      if (!pellet.eaten) {
        elements.push(
          <div
            key={`pellet-${pellet.x}-${pellet.y}`}
            className="power-pellet"
            style={{
              position: 'absolute',
              left: pellet.x * CELL_SIZE + CELL_SIZE / 2 - (CELL_SIZE * 0.33),
              top: pellet.y * CELL_SIZE + CELL_SIZE / 2 - (CELL_SIZE * 0.33),
              width: CELL_SIZE * 0.66,
              height: CELL_SIZE * 0.66,
              borderRadius: '50%',
              backgroundColor: '#fff',
              animation: 'pulse 0.5s infinite'
            }}
          />
        );
      }
    });
    
    ghosts.forEach(ghost => {
      const isScared = ghost.scared && ghost.scaredTimer > 0;
      elements.push(
        <div
          key={`ghost-${ghost.id}`}
          className="ghost"
          style={{
            position: 'absolute',
            left: ghost.x * CELL_SIZE,
            top: ghost.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            transition: 'all 0.15s linear'
          }}
        >
          <svg width={CELL_SIZE} height={CELL_SIZE} viewBox="0 0 30 30">
            <path
              d="M5,15 Q5,5 15,5 Q25,5 25,15 L25,25 Q22,22 19,25 Q16,28 13,25 Q10,22 7,25 L5,25 Z"
              fill={isScared ? '#0000ff' : ghost.color}
            />
            <circle cx="11" cy="12" r="2" fill="white" />
            <circle cx="19" cy="12" r="2" fill="white" />
            <circle cx="11" cy="12" r="1" fill="black" />
            <circle cx="19" cy="12" r="1" fill="black" />
          </svg>
        </div>
      );
    });
    
    elements.push(
      <div
        key="pacman"
        className="pacman"
        style={{
          position: 'absolute',
          left: pacmanPos.x * CELL_SIZE,
          top: pacmanPos.y * CELL_SIZE,
          width: CELL_SIZE,
          height: CELL_SIZE,
          transition: 'all 0.15s linear',
          zIndex: 10
        }}
      >
        <svg width={CELL_SIZE} height={CELL_SIZE} viewBox="0 0 30 30">
          <circle
            cx="15"
            cy="15"
            r="12"
            fill="#ffff00"
            stroke="#ffaa00"
            strokeWidth="1"
          />
          <path
            d={`M15,15 L${15 + 12 * Math.cos(pacmanMouth * Math.PI / 8)},${15 + 12 * Math.sin(pacmanMouth * Math.PI / 8)} A12,12 0 0,0 ${15 + 12 * Math.cos(-pacmanMouth * Math.PI / 8)},${15 + 12 * Math.sin(-pacmanMouth * Math.PI / 8)} Z`}
            fill="#000"
          />
        </svg>
      </div>
    );
    
    return elements;
  };

  return (
    <div className="pacman-container">
      <div className="pacman-header">
        <button className="back-button" onClick={onBack}>←</button>
        <h1 className="pacman-title">PACMAN</h1>
        <button 
          className="touch-toggle" 
          onClick={() => setShowTouchControls(!showTouchControls)}
        >
          {showTouchControls ? '🎮' : '👆'}
        </button>
      </div>

      <div className="stats-container">
        <div className="stat-item">
          <span className="stat-icon">⭐</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">❤️</span>
          <span className="stat-value">{lives}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🏆</span>
          <span className="stat-value">{highScore}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">👤</span>
          <span className="stat-value">{playerName}</span>
        </div>
      </div>

      <div 
        className="game-board"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          position: 'relative',
          backgroundColor: '#000',
          margin: '0 auto',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      >
        {renderBoard()}
        
        {!gameStarted && !gameOver && !gameWin && (
          <div className="start-screen">
            <div className="start-card">
              <div className="pacman-icon">🟡</div>
              <h2>PACMAN</h2>
              <p>Welcome, {playerName}!</p>
              <div className="controls-info">
                <p>Touch the screen or use arrows</p>
                <div className="arrow-keys">
                  <span>←</span>
                  <span>↑</span>
                  <span>↓</span>
                  <span>→</span>
                </div>
              </div>
              <button className="start-button" onClick={initGame}>
                START GAME
              </button>
            </div>
          </div>
        )}
        
        {gameWin && (
          <div className="gameover-screen">
            <div className="gameover-card victory">
              <div className="victory-icon">🏆</div>
              <h2>YOU WIN!</h2>
              <p>Perfect score! You cleared the maze!</p>
              <div className="final-score">
                <div>Final Score</div>
                <div className="final-number">{score}</div>
              </div>
              {score === highScore && score > 0 && (
                <div className="new-record">🎉 NEW HIGH SCORE! 🎉</div>
              )}
              <button className="play-again" onClick={initGame}>
                Play Again
              </button>
            </div>
          </div>
        )}
        
        {gameOver && (
          <div className="gameover-screen">
            <div className="gameover-card">
              <div className="gameover-icon">💀</div>
              <h2>GAME OVER</h2>
              <div className="final-score">
                <div>Your Score</div>
                <div className="final-number">{score}</div>
              </div>
              {score === highScore && score > 0 && (
                <div className="new-record">🏆 NEW HIGH SCORE! 🏆</div>
              )}
              <button className="play-again" onClick={initGame}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Touch Controls */}
      {showTouchControls && gameStarted && !gameOver && !gameWin && (
        <div className="touch-controls">
          <div className="touch-row">
            <button 
              className="touch-btn"
              onClick={() => handleTouchDirection('up')}
            >
              ↑
            </button>
          </div>
          <div className="touch-row">
            <button 
              className="touch-btn"
              onClick={() => handleTouchDirection('left')}
            >
              ←
            </button>
            <button 
              className="touch-btn"
              onClick={() => handleTouchDirection('down')}
            >
              ↓
            </button>
            <button 
              className="touch-btn"
              onClick={() => handleTouchDirection('right')}
            >
              →
            </button>
          </div>
        </div>
      )}

      <div className="instructions-mobile">
        <span>⬅️ Eat dots for points</span>
        <span>⚪ Power pellets make ghosts scared!</span>
        <span>👻 Avoid ghosts or eat them when blue!</span>
      </div>
    </div>
  );
}

export default Pacman;