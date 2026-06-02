import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Sudoku.css';

function Sudoku({ onBack, currentPlayer }) {
  const [board, setBoard] = useState(null);
  const [originalBoard, setOriginalBoard] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [gameStatus, setGameStatus] = useState('playing');
  const [notes, setNotes] = useState({});
  const [notesMode, setNotesMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [showVictory, setShowVictory] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Menu state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // Refs to prevent multiple triggers
  const menuButtonRef = useRef(null);
  const menuOverlayRef = useRef(null);
  const isMenuOpeningRef = useRef(false);
  
  // Challenge & Rewards States
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [showRewards, setShowRewards] = useState(false);
  const [showChallengePopup, setShowChallengePopup] = useState(false);
  const [currentReward, setCurrentReward] = useState(null);
  const [streak, setStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  
  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerStats, setPlayerStats] = useState({
    name: '',
    totalGames: 0,
    wins: 0,
    bestTime: null,
    perfectGames: 0,
    totalPoints: 0
  });
  
  const maxMistakes = 3;

  // Static Brian records
  const brianRecords = {
    easy: { time: 145, perfectGames: 15, wins: 25, totalPoints: 2500 },
    medium: { time: 235, perfectGames: 8, wins: 18, totalPoints: 3600 },
    hard: { time: 420, perfectGames: 5, wins: 12, totalPoints: 3600 },
    expert: { time: 680, perfectGames: 2, wins: 5, totalPoints: 2500 }
  };

  // Challenge Definitions
  const challenges = {
    perfectGame: {
      id: 'perfectGame',
      name: 'Perfect Game',
      description: 'Complete with 0 mistakes',
      requirement: { type: 'mistakes', value: 0 },
      points: 500,
      reward: 'Perfect Player Badge',
      icon: '🎯'
    },
    speedDemon: {
      id: 'speedDemon',
      name: 'Speed Demon',
      description: 'Complete under 5 minutes',
      requirement: { type: 'time', value: 300 },
      points: 300,
      reward: 'Speedster Medal',
      icon: '⚡'
    },
    quickLearner: {
      id: 'quickLearner',
      name: 'Quick Learner',
      description: 'Complete without hints',
      requirement: { type: 'hints', value: 0 },
      points: 200,
      reward: 'Smart Cookie Badge',
      icon: '📚'
    },
    expertMode: {
      id: 'expertMode',
      name: 'Expert Mode',
      description: 'Complete Expert puzzle',
      requirement: { type: 'difficulty', value: 'expert' },
      points: 400,
      reward: 'Sudoku Master Crown',
      icon: '👑'
    },
    hardWorker: {
      id: 'hardWorker',
      name: 'Hard Worker',
      description: 'Complete Hard puzzle',
      requirement: { type: 'difficulty', value: 'hard' },
      points: 200,
      reward: 'Bronze Trophy',
      icon: '💪'
    },
    noNotes: {
      id: 'noNotes',
      name: 'Memory Master',
      description: 'Complete without notes',
      requirement: { type: 'notes', value: false },
      points: 250,
      reward: 'Memory Champion Badge',
      icon: '🧠'
    },
    threeStreak: {
      id: 'threeStreak',
      name: 'Triple Threat',
      description: 'Win 3 games in a row',
      requirement: { type: 'streak', value: 3 },
      points: 350,
      reward: 'Flaming Streak Trophy',
      icon: '🔥'
    },
    fiveStreak: {
      id: 'fiveStreak',
      name: 'Legendary Streak',
      description: 'Win 5 games in a row',
      requirement: { type: 'streak', value: 5 },
      points: 600,
      reward: 'Legendary Star Badge',
      icon: '🌟'
    }
  };

  // Initialize leaderboard with Brian's static records
  const initializeLeaderboard = () => {
    const savedLeaderboard = localStorage.getItem('sudokuLeaderboard');
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard));
    } else {
      const initialLeaderboard = [];
      const difficulties = ['easy', 'medium', 'hard', 'expert'];
      
      difficulties.forEach(diff => {
        initialLeaderboard.push({
          id: `brian-${diff}`,
          name: 'Brian',
          difficulty: diff,
          time: brianRecords[diff].time,
          perfectGames: brianRecords[diff].perfectGames,
          wins: brianRecords[diff].wins,
          totalPoints: brianRecords[diff].totalPoints,
          isBrian: true,
          date: new Date().toISOString()
        });
      });
      
      setLeaderboard(initialLeaderboard);
      localStorage.setItem('sudokuLeaderboard', JSON.stringify(initialLeaderboard));
    }
  };

  // Load player stats
  const loadPlayerStats = () => {
    const playerName = currentPlayer || localStorage.getItem('flappyLovePlayerName') || 'Player';
    const savedStats = localStorage.getItem(`sudokuPlayerStats_${playerName}`);
    
    if (savedStats) {
      setPlayerStats(JSON.parse(savedStats));
    } else {
      setPlayerStats({
        name: playerName,
        totalGames: 0,
        wins: 0,
        bestTime: null,
        perfectGames: 0,
        totalPoints: 0
      });
    }
  };

  // Save player stats
  const savePlayerStats = (newStats) => {
    const playerName = currentPlayer || localStorage.getItem('flappyLovePlayerName') || 'Player';
    localStorage.setItem(`sudokuPlayerStats_${playerName}`, JSON.stringify(newStats));
    setPlayerStats(newStats);
  };

  // Update leaderboard with new score
  const updateLeaderboard = (gameData) => {
    const playerName = currentPlayer || localStorage.getItem('flappyLovePlayerName') || 'Player';
    
    const newEntry = {
      id: `${playerName}-${difficulty}-${Date.now()}`,
      name: playerName,
      difficulty: difficulty,
      time: timer,
      mistakes: mistakes,
      hintsUsed: 3 - hintsLeft,
      perfectGame: mistakes === 0,
      totalPoints: gameData.pointsEarned,
      date: new Date().toISOString(),
      isBrian: false
    };
    
    const existingIndex = leaderboard.findIndex(
      entry => entry.name === playerName && entry.difficulty === difficulty && !entry.isBrian
    );
    
    let newLeaderboard;
    if (existingIndex !== -1) {
      if (timer < leaderboard[existingIndex].time) {
        newLeaderboard = [...leaderboard];
        newLeaderboard[existingIndex] = newEntry;
      } else {
        newLeaderboard = [...leaderboard];
      }
    } else {
      newLeaderboard = [...leaderboard, newEntry];
    }
    
    newLeaderboard.sort((a, b) => {
      if (a.difficulty !== b.difficulty) {
        const diffOrder = { easy: 1, medium: 2, hard: 3, expert: 4 };
        return diffOrder[a.difficulty] - diffOrder[b.difficulty];
      }
      return a.time - b.time;
    });
    
    const filteredLeaderboard = [];
    const difficulties = ['easy', 'medium', 'hard', 'expert'];
    difficulties.forEach(diff => {
      const diffEntries = newLeaderboard.filter(entry => entry.difficulty === diff);
      filteredLeaderboard.push(...diffEntries.slice(0, 10));
    });
    
    setLeaderboard(filteredLeaderboard);
    localStorage.setItem('sudokuLeaderboard', JSON.stringify(filteredLeaderboard));
  };

  // Load saved data on mount
  useEffect(() => {
    const savedPoints = localStorage.getItem('sudokuTotalPoints');
    const savedRewards = localStorage.getItem('sudokuRewards');
    const savedCompletedChallenges = localStorage.getItem('sudokuCompletedChallenges');
    const savedStreak = localStorage.getItem('sudokuStreak');
    
    if (savedPoints) setTotalPoints(parseInt(savedPoints));
    if (savedRewards) setRewards(JSON.parse(savedRewards));
    if (savedCompletedChallenges) setCompletedChallenges(JSON.parse(savedCompletedChallenges));
    if (savedStreak) setStreak(parseInt(savedStreak));
    
    initializeLeaderboard();
    loadPlayerStats();
    generateDailyChallenges();
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('sudokuTotalPoints', totalPoints);
    localStorage.setItem('sudokuRewards', JSON.stringify(rewards));
    localStorage.setItem('sudokuCompletedChallenges', JSON.stringify(completedChallenges));
    localStorage.setItem('sudokuStreak', streak);
  }, [totalPoints, rewards, completedChallenges, streak]);

  const generateDailyChallenges = () => {
    const challengeList = Object.values(challenges);
    const shuffled = [...challengeList].sort(() => 0.5 - Math.random());
    const daily = shuffled.slice(0, 3);
    setActiveChallenges(daily);
  };

  const checkChallenges = (gameStats) => {
    const newlyCompleted = [];
    
    for (const challenge of activeChallenges) {
      if (completedChallenges.includes(challenge.id)) continue;
      
      let isCompleted = false;
      
      switch (challenge.requirement.type) {
        case 'mistakes':
          if (gameStats.mistakes <= challenge.requirement.value) isCompleted = true;
          break;
        case 'time':
          if (gameStats.time <= challenge.requirement.value) isCompleted = true;
          break;
        case 'hints':
          if (gameStats.hintsUsed <= challenge.requirement.value) isCompleted = true;
          break;
        case 'difficulty':
          if (gameStats.difficulty === challenge.requirement.value) isCompleted = true;
          break;
        case 'notes':
          if (gameStats.notesUsed === challenge.requirement.value) isCompleted = true;
          break;
        case 'streak':
          if (gameStats.streak >= challenge.requirement.value) isCompleted = true;
          break;
        default:
          break;
      }
      
      if (isCompleted) {
        newlyCompleted.push(challenge);
        setCompletedChallenges(prev => [...prev, challenge.id]);
        setTotalPoints(prev => prev + challenge.points);
        setRewards(prev => [...prev, {
          id: challenge.id,
          name: challenge.reward,
          points: challenge.points,
          date: new Date().toISOString(),
          icon: challenge.icon
        }]);
        
        setCurrentReward({
          name: challenge.reward,
          points: challenge.points,
          icon: challenge.icon,
          challengeName: challenge.name
        });
        setShowRewards(true);
        setTimeout(() => setShowRewards(false), 3000);
      }
    }
    
    if (newlyCompleted.length > 0) {
      setShowChallengePopup(true);
      setTimeout(() => setShowChallengePopup(false), 3000);
    }
  };

  // Generate a complete valid Sudoku solution
  const generateCompleteBoard = () => {
    const board = Array(9).fill().map(() => Array(9).fill(0));
    
    for (let box = 0; box < 9; box += 3) {
      fillBox(board, box, box);
    }
    
    solveSudoku(board);
    return board;
  };

  const fillBox = (board, row, col) => {
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let index = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        board[row + i][col + j] = numbers[index++];
      }
    }
  };

  const solveSudoku = (board) => {
    const empty = findEmptyCell(board);
    if (!empty) return true;
    
    const [row, col] = empty;
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    
    for (let num of numbers) {
      if (isValidMove(board, row, col, num)) {
        board[row][col] = num;
        if (solveSudoku(board)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  };

  const findEmptyCell = (board) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) return [i, j];
      }
    }
    return null;
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const isValidMove = (board, row, col, num) => {
    if (!board) return false;
    
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) return false;
    }
    
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) return false;
    }
    
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false;
      }
    }
    
    return true;
  };

  const removeCells = (completeBoard, difficulty) => {
    const puzzles = {
      easy: 45,
      medium: 35,
      hard: 28,
      expert: 22
    };
    
    const cellsToRemove = 81 - puzzles[difficulty];
    const newBoard = completeBoard.map(row => [...row]);
    let removed = 0;
    
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (newBoard[row][col] !== 0) {
        newBoard[row][col] = 0;
        removed++;
      }
    }
    
    return newBoard;
  };

  const initializeGame = () => {
    const complete = generateCompleteBoard();
    const puzzle = removeCells(complete, difficulty);
    setBoard(puzzle.map(row => [...row]));
    setOriginalBoard(puzzle.map(row => [...row]));
    setNotes({});
    setTimer(0);
    setMistakes(0);
    setGameStatus('playing');
    setSelectedCell(null);
    setSelectedNumber(null);
    setShowVictory(false);
    setIsInitialized(true);
  };

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  useEffect(() => {
    let interval;
    if (gameStatus === 'playing' && !showVictory && isInitialized) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStatus, showVictory, isInitialized]);

  useEffect(() => {
    if (board && gameStatus === 'playing' && isBoardComplete()) {
      const basePoints = {
        easy: 100,
        medium: 200,
        hard: 300,
        expert: 500
      };
      
      const pointsEarned = basePoints[difficulty];
      const bonusPoints = (mistakes === 0 ? 100 : 0) + (timer < 300 ? 50 : 0);
      const totalEarned = pointsEarned + bonusPoints;
      
      const newStats = {
        ...playerStats,
        totalGames: playerStats.totalGames + 1,
        wins: playerStats.wins + 1,
        totalPoints: playerStats.totalPoints + totalEarned,
        perfectGames: mistakes === 0 ? playerStats.perfectGames + 1 : playerStats.perfectGames,
        bestTime: playerStats.bestTime === null || timer < playerStats.bestTime ? timer : playerStats.bestTime
      };
      savePlayerStats(newStats);
      
      updateLeaderboard({ pointsEarned: totalEarned });
      
      const gameStats = {
        mistakes: mistakes,
        time: timer,
        hintsUsed: 3 - hintsLeft,
        difficulty: difficulty,
        notesUsed: notesMode,
        streak: streak + 1
      };
      
      setStreak(prev => prev + 1);
      checkChallenges(gameStats);
      setTotalPoints(prev => prev + totalEarned);
      
      setGameStatus('won');
      setShowVictory(true);
    }
  }, [board, gameStatus]);

  const isBoardComplete = () => {
    if (!board) return false;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) return false;
      }
    }
    return true;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCellClick = (row, col) => {
    if (gameStatus !== 'playing' || !board) return;
    if (originalBoard && originalBoard[row] && originalBoard[row][col] !== 0) return;
    
    setSelectedCell({ row, col });
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  const handleNumberInput = (num) => {
    if (!selectedCell || gameStatus !== 'playing' || !board) return;
    
    const { row, col } = selectedCell;
    
    if (notesMode) {
      const cellKey = `${row},${col}`;
      const currentNotes = notes[cellKey] || [];
      if (currentNotes.includes(num)) {
        const newNotes = { ...notes };
        newNotes[cellKey] = currentNotes.filter(n => n !== num);
        if (newNotes[cellKey].length === 0) delete newNotes[cellKey];
        setNotes(newNotes);
      } else {
        setNotes({
          ...notes,
          [cellKey]: [...currentNotes, num].sort()
        });
      }
      if (window.navigator.vibrate) window.navigator.vibrate(10);
    } else {
      if (num === 0) {
        const newBoard = [...board];
        newBoard[row][col] = 0;
        setBoard(newBoard);
        
        const cellKey = `${row},${col}`;
        const newNotes = { ...notes };
        delete newNotes[cellKey];
        setNotes(newNotes);
        if (window.navigator.vibrate) window.navigator.vibrate(10);
      } else {
        const isValid = isValidMove(board, row, col, num);
        
        if (isValid) {
          const newBoard = [...board];
          newBoard[row][col] = num;
          setBoard(newBoard);
          
          const cellKey = `${row},${col}`;
          const newNotes = { ...notes };
          delete newNotes[cellKey];
          setNotes(newNotes);
          if (window.navigator.vibrate) window.navigator.vibrate(20);
        } else {
          setMistakes(prev => {
            const newMistakes = prev + 1;
            if (newMistakes >= maxMistakes) {
              setGameStatus('lost');
              setStreak(0);
              
              const newStats = {
                ...playerStats,
                totalGames: playerStats.totalGames + 1
              };
              savePlayerStats(newStats);
            }
            return newMistakes;
          });
          
          if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
          
          const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
          if (cell) {
            cell.classList.add('shake');
            setTimeout(() => cell.classList.remove('shake'), 500);
          }
        }
      }
    }
    
    setSelectedNumber(num);
  };

  const getHint = () => {
    if (hintsLeft <= 0 || gameStatus !== 'playing' || !board) return;
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) {
          const possibleNumbers = [];
          for (let num = 1; num <= 9; num++) {
            if (isValidMove(board, i, j, num)) possibleNumbers.push(num);
          }
          if (possibleNumbers.length === 1) {
            const newBoard = [...board];
            newBoard[i][j] = possibleNumbers[0];
            setBoard(newBoard);
            setHintsLeft(prev => prev - 1);
            
            const cell = document.querySelector(`.cell[data-row='${i}'][data-col='${j}']`);
            if (cell) {
              cell.classList.add('hint');
              setTimeout(() => cell.classList.remove('hint'), 2000);
            }
            if (window.navigator.vibrate) window.navigator.vibrate(50);
            return;
          }
        }
      }
    }
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) {
          const cell = document.querySelector(`.cell[data-row='${i}'][data-col='${j}']`);
          if (cell) {
            cell.classList.add('hint');
            setTimeout(() => cell.classList.remove('hint'), 2000);
          }
          setHintsLeft(prev => prev - 1);
          if (window.navigator.vibrate) window.navigator.vibrate(50);
          return;
        }
      }
    }
  };

  // Simple menu toggle without any delays or complex logic
  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMobileMenu(!showMobileMenu);
  };

  const handleMenuClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowMobileMenu(false);
  };

  const handleLeaderboardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLeaderboard(!showLeaderboard);
    setShowMobileMenu(false);
  };

  const handleLeaderboardClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowLeaderboard(false);
  };

  const newGameHandler = () => {
    initializeGame();
    generateDailyChallenges();
    setShowMobileMenu(false);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  const resetGameHandler = () => {
    if (originalBoard) {
      setBoard(originalBoard.map(row => [...row]));
      setNotes({});
      setTimer(0);
      setMistakes(0);
      setGameStatus('playing');
      setSelectedCell(null);
      setShowVictory(false);
      setShowMobileMenu(false);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }
  };

  const refreshChallengesHandler = () => {
    generateDailyChallenges();
    setShowMobileMenu(false);
  };

  const backHandler = () => {
    setShowMobileMenu(false);
    onBack();
  };

  const isCellOriginal = (row, col) => {
    return originalBoard && originalBoard[row] && originalBoard[row][col] !== 0;
  };

  const getCellClass = (row, col) => {
    let classes = 'cell';
    
    if (isCellOriginal(row, col)) {
      classes += ' original';
    }
    
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      classes += ' selected';
    }
    
    if (selectedCell && (selectedCell.row === row || selectedCell.col === col)) {
      classes += ' highlighted';
    }
    
    if (selectedCell && 
        Math.floor(selectedCell.row / 3) === Math.floor(row / 3) && 
        Math.floor(selectedCell.col / 3) === Math.floor(col / 3)) {
      classes += ' box-highlight';
    }
    
    if (board && board[row] && board[row][col] !== 0 && board[row][col] === selectedNumber && !isCellOriginal(row, col)) {
      classes += ' same-number';
    }
    
    return classes;
  };

  // Don't render menu as separate component - render inline to prevent re-renders
  if (!board) {
    return (
      <div className="sudoku-container">
        <div className="sudoku-header">
          <button className="back-button" onClick={onBack}>←</button>
          <h1 className="sudoku-title">Sudoku</h1>
          <div className="sudoku-stats">
            <div className="stat">⭐{totalPoints}</div>
            <div className="stat">🔥{streak}</div>
          </div>
        </div>
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sudoku-container">
      <div className="sudoku-header">
        <button className="back-button" onClick={onBack}>←</button>
        <h1 className="sudoku-title">Sudoku</h1>
        <button className="menu-button" onClick={handleMenuClick}>
          ☰
        </button>
      </div>

      <div className="stats-bar-mobile">
        <div className="stat-mobile">
          <span>⭐</span>
          <span>{totalPoints}</span>
        </div>
        <div className="stat-mobile">
          <span>🔥</span>
          <span>{streak}</span>
        </div>
        <div className="stat-mobile">
          <span>⏱️</span>
          <span>{formatTime(timer)}</span>
        </div>
        <div className="stat-mobile">
          <span>❌</span>
          <span>{mistakes}/{maxMistakes}</span>
        </div>
        <div className="stat-mobile">
          <span>💡</span>
          <span>{hintsLeft}</span>
        </div>
      </div>

      <div className="difficulty-row">
        {['easy', 'medium', 'hard', 'expert'].map(level => (
          <button
            key={level}
            className={`difficulty-chip ${difficulty === level ? 'active' : ''}`}
            onClick={() => setDifficulty(level)}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      <div className="notes-toggle">
        <button
          className={`notes-chip ${notesMode ? 'active' : ''}`}
          onClick={() => setNotesMode(!notesMode)}
        >
          📝 Notes {notesMode ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="sudoku-board-mobile">
        {board.map((row, i) => (
          <div key={i} className="sudoku-row-mobile">
            {row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className={getCellClass(i, j)}
                data-row={i}
                data-col={j}
                onClick={() => handleCellClick(i, j)}
              >
                {cell !== 0 ? (
                  <span className="cell-value-mobile">{cell}</span>
                ) : (
                  <div className="notes-container-mobile">
                    {notes[`${i},${j}`]?.map(num => (
                      <span key={num} className="note-number-mobile">{num}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="number-pad-mobile">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            className={`number-btn-mobile ${selectedNumber === num ? 'active' : ''}`}
            onClick={() => handleNumberInput(num)}
          >
            {num}
          </button>
        ))}
        <button
          className="number-btn-mobile clear-btn"
          onClick={() => handleNumberInput(0)}
        >
          🗑️
        </button>
      </div>

      <div className="action-row">
        <button className="action-chip" onClick={getHint} disabled={hintsLeft === 0}>
          💡 {hintsLeft}
        </button>
        <button className="action-chip" onClick={handleLeaderboardClick}>
          🏆
        </button>
        <button className="action-chip" onClick={newGameHandler}>
          🎮
        </button>
      </div>

      {/* Mobile Menu Overlay - Inline rendering */}
      {showMobileMenu && (
        <div className="mobile-menu-overlay" onClick={handleMenuClose}>
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>Menu</h3>
              <button className="close-menu" onClick={handleMenuClose}>✕</button>
            </div>
            <div className="mobile-menu-items">
              <button className="mobile-menu-item" onClick={newGameHandler}>
                <span>🎮</span> New Game
              </button>
              <button className="mobile-menu-item" onClick={resetGameHandler}>
                <span>🔄</span> Reset Game
              </button>
              <button className="mobile-menu-item" onClick={handleLeaderboardClick}>
                <span>🏆</span> Leaderboard
              </button>
              <button className="mobile-menu-item" onClick={refreshChallengesHandler}>
                <span>🎯</span> Refresh Challenges
              </button>
              <button className="mobile-menu-item" onClick={backHandler}>
                <span>←</span> Back to Love Letter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Modal - Inline rendering */}
      {showLeaderboard && (
        <div className="leaderboard-overlay" onClick={handleLeaderboardClose}>
          <div className="leaderboard-card" onClick={(e) => e.stopPropagation()}>
            <div className="leaderboard-header">
              <h2>🏆 Champions 🏆</h2>
              <button className="close-leaderboard" onClick={handleLeaderboardClose}>✕</button>
            </div>
            
            <div className="player-stats-summary">
              <div className="stat-card">
                <div className="stat-icon">👤</div>
                <div className="stat-info">
                  <div className="stat-label">Player</div>
                  <div className="stat-value">{playerStats.name}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-info">
                  <div className="stat-label">Wins</div>
                  <div className="stat-value">{playerStats.wins}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <div className="stat-label">Points</div>
                  <div className="stat-value">{playerStats.totalPoints}</div>
                </div>
              </div>
            </div>
            
            <div className="difficulty-selector-compact">
              {['easy', 'medium', 'hard', 'expert'].map(diff => (
                <div key={diff} className="compact-difficulty">
                  <div className="compact-title">{diff.charAt(0).toUpperCase() + diff.slice(1)}</div>
                  {leaderboard.filter(entry => entry.difficulty === diff).slice(0, 3).map((entry, idx) => (
                    <div key={entry.id} className={`compact-entry ${entry.isBrian ? 'brian-entry' : ''}`}>
                      <div className="compact-rank">{idx + 1}</div>
                      <div className="compact-name">{entry.name}</div>
                      <div className="compact-time">{formatTime(entry.time)}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            <div className="brian-info">
              <div className="brian-badge">
                <span>⭐</span>
                <span>Beat Brian: {formatTime(brianRecords[difficulty].time)}</span>
                <span>🎯</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVictory && gameStatus === 'won' && (
        <div className="victory-overlay" onClick={() => setShowVictory(false)}>
          <div className="victory-card" onClick={(e) => e.stopPropagation()}>
            <div className="victory-icon">🎉</div>
            <h2>Congratulations!</h2>
            <p>You solved the puzzle!</p>
            
            <div className="victory-stats">
              <div>⏱️ {formatTime(timer)}</div>
              <div>❌ {mistakes}/{maxMistakes}</div>
              <div>🎯 {difficulty}</div>
              
              {timer < brianRecords[difficulty].time && (
                <div className="beat-brian-alert">
                  🎉 Beat Brian's record! +200 🎉
                </div>
              )}
            </div>
            
            <div className="victory-buttons">
              <button className="victory-btn" onClick={newGameHandler}>New Game</button>
              <button className="victory-btn secondary" onClick={() => setShowVictory(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="victory-overlay" onClick={() => setGameStatus('playing')}>
          <div className="victory-card gameover-card" onClick={(e) => e.stopPropagation()}>
            <div className="victory-icon">💀</div>
            <h2>Game Over!</h2>
            <p>{maxMistakes} mistakes made</p>
            <div className="victory-stats">
              <div>⏱️ {formatTime(timer)}</div>
              <div>🎯 {difficulty}</div>
              <div>🔥 Streak ended at {streak}</div>
            </div>
            <div className="victory-buttons">
              <button className="victory-btn" onClick={newGameHandler}>Try Again</button>
              <button className="victory-btn secondary" onClick={resetGameHandler}>Reset</button>
            </div>
          </div>
        </div>
      )}

      {showRewards && currentReward && (
        <div className="reward-popup">
          <div className="reward-content">
            <div className="reward-icon">{currentReward?.icon}</div>
            <h3>Challenge Complete!</h3>
            <p className="reward-name">{currentReward?.name}</p>
            <p className="reward-points">+{currentReward?.points} pts</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sudoku;