import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Sudoku.css';
import GlobalLeaderboard from './GlobalLeaderboard';
// Import Firebase functions directly - they will be available after initialization
import { 
  addReward, 
  getUserNotifications, 
  addLeaderboardEntry,
  saveGameStats,
  subscribeToNotifications,
  getRewardsByUser,
  getGlobalLeaderboard,
  getGlobalStatistics,
  subscribeToGlobalLeaderboard,
  getPlayerBest,
  getPlayerRank,
  updateLeaderboardWithPrize
} from './firebase';

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
  const [showMenu, setShowMenu] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGlobalLeaderboard, setShowGlobalLeaderboard] = useState(false);
  
  // Romantic Food Rewards
  const [showRewardSelection, setShowRewardSelection] = useState(false);
  const [rewardType, setRewardType] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [allRewards, setAllRewards] = useState([]);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingRewardStatus, setPendingRewardStatus] = useState(null);
  
  // Global stats state
  const [globalStats, setGlobalStats] = useState(null);
  const [playerRank, setPlayerRank] = useState(null);
  const [playerBest, setPlayerBest] = useState(null);
  
  // Sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [showSyncNotification, setShowSyncNotification] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [showSyncError, setShowSyncError] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);
  
  // Food options
  const foodOptions = {
    junkfood: ['🍟 Patatas', '🍿 Sweet Popcorn', '🥨 Nova', '🌮 Martis chicharon', 'Cracklings', '🧀 Piatos', '🍗 Chippy', '🌭 Clover'],
    drinks: ['🥤 Coke', '🧋 Bubble Tea', '☕ Iced Coffee', '🍵 Milk Tea', '🧃 Soda Juice', '🥛 Milkshake', '🍹 Lemonade', '🥤 Sprite'],
    sweets: ['🍰 Cake Slice', '🍪 Cookies', '🍩 Donut', '🍦 Ice Cream', '🧁 Cupcake', '🍫 Chocolate Bar', '🍬 Candy', '🍮 Pudding'],
    fastfood: [
      { name: '🍔 Jollibee', value: 'jollibee' },
      { name: '🍟 McDonald\'s', value: 'mcdonalds' },
      { name: '🍗 Mang Inasal', value: 'manginasal' },
      { name: '🥟 Chowking', value: 'chowking' },
      { name: '🍗 MadChick', value: 'madchick' }
    ]
  };
  
  const timeLimits = {
    easy: 240,
    medium: 480,
    hard: null,
    expert: null
  };
  
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

  // Load synced cloud data on mount
  useEffect(() => {
    const loadCloudData = async () => {
      try {
        const playerName = currentPlayer || localStorage.getItem('flappyLovePlayerName') || 'Player';
        
        const bestResult = await getPlayerBest(playerName);
        if (bestResult.success && bestResult.data) {
          const hasCloudData = Object.values(bestResult.data).some(v => v !== null);
          if (hasCloudData) {
            setPlayerBest(bestResult.data);
            setShowSyncNotification(true);
            setTimeout(() => setShowSyncNotification(false), 3000);
          }
        }
      } catch (error) {
        console.error('Error loading cloud data:', error);
      }
    };
    
    loadCloudData();
  }, [currentPlayer]);

  // Load global stats and player ranking
  useEffect(() => {
    const loadGlobalData = async () => {
      try {
        const playerName = currentPlayer || localStorage.getItem('flappyLovePlayerName') || 'Player';
        
        const statsResult = await getGlobalStatistics();
        if (statsResult.success) {
          setGlobalStats(statsResult.data);
        }
        
        const bestResult = await getPlayerBest(playerName);
        if (bestResult.success) {
          setPlayerBest(bestResult.data);
        }
        
        const rankResult = await getPlayerRank(playerName, difficulty);
        if (rankResult.success && rankResult.data) {
          setPlayerRank(rankResult.data);
        }
      } catch (error) {
        console.error('Error loading global data:', error);
      }
    };
    
    loadGlobalData();
  }, [currentPlayer, difficulty]);

  // Load notifications from Firebase
  useEffect(() => {
    const playerName = currentPlayer || localStorage.getItem('flappyLovePlayerName') || 'Player';
    
    const loadNotifications = async () => {
      try {
        const result = await getUserNotifications(playerName);
        if (result.success) {
          setNotifications(result.data);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };
    
    loadNotifications();
    
    let unsubscribe;
    try {
      unsubscribe = subscribeToNotifications(playerName, (newNotifications) => {
        setNotifications(newNotifications);
      });
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentPlayer]);

  // Load user rewards from Firebase
  useEffect(() => {
    const loadUserRewards = async () => {
      try {
        const playerName = currentPlayer || localStorage.getItem('flappyLovePlayerName') || 'Player';
        const result = await getRewardsByUser(playerName);
        if (result.success) {
          setAllRewards(result.data);
        }
      } catch (error) {
        console.error('Error loading user rewards:', error);
      }
    };
    loadUserRewards();
  }, [currentPlayer]);

  // Initialize leaderboard and load data
  useEffect(() => {
    const savedPoints = localStorage.getItem('sudokuTotalPoints');
    const savedRewards = localStorage.getItem('sudokuRewards');
    const savedCompletedChallenges = localStorage.getItem('sudokuCompletedChallenges');
    const savedStreak = localStorage.getItem('sudokuStreak');
    
    if (savedPoints) setTotalPoints(parseInt(savedPoints));
    if (savedRewards) setRewards(JSON.parse(savedRewards));
    if (savedCompletedChallenges) setCompletedChallenges(JSON.parse(savedCompletedChallenges));
    if (savedStreak) setStreak(parseInt(savedStreak));
    
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

  // Manual sync function
  const manualSync = async () => {
    setIsSyncing(true);
    try {
      const playerName = currentPlayer || localStorage.getItem('flappyLovePlayerName') || 'Player';
      
      await addLeaderboardEntry({
        name: playerName,
        difficulty: difficulty,
        time: playerStats.bestTime || 999,
        mistakes: 0,
        perfectGame: true,
        totalPoints: playerStats.totalPoints
      });
      
      setLastSyncTime(new Date());
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 3000);
    } catch (error) {
      console.error('Sync error:', error);
      setShowSyncError(true);
      setTimeout(() => setShowSyncError(false), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Save rewards with Firebase
  const saveReward = async (reward) => {
    try {
      const playerName = currentPlayer || localStorage.getItem('flappyLovePlayerName') || 'Player';
      const rewardWithStatus = {
        ...reward,
        status: 'pending',
        playerName: playerName,
      };
      
      const result = await addReward(rewardWithStatus);
      if (result.success) {
        setPendingRewardStatus('pending');
        setTimeout(() => setPendingRewardStatus(null), 3000);
        
        const newRewards = [...allRewards, { ...rewardWithStatus, id: result.id }];
        setAllRewards(newRewards);
        localStorage.setItem(`sudokuFoodRewards_${playerName}`, JSON.stringify(newRewards));
      }
    } catch (error) {
      console.error('Error saving reward:', error);
    }
  };

  // Update leaderboard with Firebase
  const updateLeaderboard = async (gameData) => {
    try {
      const playerName = currentPlayer || localStorage.getItem('flappyLovePlayerName') || 'Player';
      
      const entry = {
        name: playerName,
        difficulty: difficulty,
        time: timer,
        mistakes: mistakes,
        perfectGame: mistakes === 0,
        totalPoints: gameData.pointsEarned
      };
      
      const result = await addLeaderboardEntry(entry);
      
      if (result.success && result.updated) {
        const rankResult = await getPlayerRank(playerName, difficulty);
        if (rankResult.success && rankResult.data) {
          setPlayerRank(rankResult.data);
        }
        
        const statsResult = await getGlobalStatistics();
        if (statsResult.success) {
          setGlobalStats(statsResult.data);
        }
      }
      
      await saveGameStats({
        playerName: playerName,
        difficulty: difficulty,
        time: timer,
        mistakes: mistakes,
        pointsEarned: gameData.pointsEarned,
        perfectGame: mistakes === 0
      });
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  };

  // Update leaderboard with prize
  const updateLeaderboardWithPrizeFunc = async (playerName, gameDifficulty, prize) => {
    try {
      await updateLeaderboardWithPrize(playerName, gameDifficulty, prize);
    } catch (error) {
      console.error('Error updating leaderboard with prize:', error);
    }
  };

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

  // Game generation functions
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
    setShowReceipt(false);
    setShowRewardSelection(false);
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
      
      checkRomanticReward(difficulty, timer);
      
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

  // Check and handle romantic food rewards
  const checkRomanticReward = (difficulty, completionTime) => {
    switch (difficulty) {
      case 'easy':
        if (completionTime <= timeLimits.easy) {
          setRewardType('junkfood');
          setShowRewardSelection(true);
        }
        break;
      case 'medium':
        if (completionTime <= timeLimits.medium) {
          setRewardType('drinks');
          setShowRewardSelection(true);
        }
        break;
      case 'hard':
        setRewardType('sweets');
        setShowRewardSelection(true);
        break;
      case 'expert':
        setRewardType('fastfood');
        setShowRewardSelection(true);
        break;
      default:
        break;
    }
  };

  // Handle reward selection
  const handleRewardSelection = async (selected) => {
    const playerName = currentPlayer || localStorage.getItem('flappyLovePlayerName') || 'Player';
    const reward = {
      date: new Date().toISOString(),
      difficulty: difficulty,
      time: timer,
      type: rewardType,
      selection: selected,
      playerName: playerName
    };
    
    await saveReward(reward);
    
    // Update leaderboard with the chosen prize
    await updateLeaderboardWithPrizeFunc(playerName, difficulty, selected);
    
    setSelectedReward(selected);
    setReceiptData(reward);
    setShowRewardSelection(false);
    setShowReceipt(true);
    
    if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
  };

  // Print receipt
  const printReceipt = () => {
    const printContent = document.getElementById('receipt-content');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Love Date Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; background: #fff; }
            .receipt { max-width: 300px; margin: 0 auto; border: 2px dashed #ff6b9d; padding: 20px; border-radius: 10px; }
            .header { text-align: center; border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 15px; }
            .header h1 { color: #ff3366; margin: 0; font-size: 20px; }
            .header p { color: #666; margin: 5px 0; }
            .content { margin: 15px 0; }
            .reward-item { background: #f9f9f9; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .footer { text-align: center; border-top: 1px dashed #ccc; padding-top: 10px; margin-top: 15px; font-size: 12px; color: #666; }
            .thankyou { text-align: center; color: #ff3366; font-weight: bold; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${document.getElementById('receipt-content').innerHTML}
          </div>
          <script>
            window.onload = function() { window.print(); setTimeout(() => window.close(), 500); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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

  // Menu functions
  const openMenu = () => {
    setShowMenu(true);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  const handleLeaderboardClick = () => {
    setShowLeaderboard(true);
    closeMenu();
  };

  const handleLeaderboardClose = () => {
    setShowLeaderboard(false);
  };

  const newGameHandler = () => {
    initializeGame();
    generateDailyChallenges();
    closeMenu();
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
      closeMenu();
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }
  };

  const refreshChallengesHandler = () => {
    generateDailyChallenges();
    closeMenu();
  };

  const backHandler = () => {
    closeMenu();
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

  // Simple Menu Modal
  const SimpleMenu = () => {
    if (!showMenu) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-end',
      }} onClick={closeMenu}>
        <div style={{
          backgroundColor: 'white',
          width: '100%',
          borderRadius: '25px 25px 0 0',
          padding: '20px',
          maxHeight: '80vh',
          overflowY: 'auto',
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '10px',
            borderBottom: '2px solid #ff6b9d',
          }}>
            <h3 style={{ margin: 0, color: '#ff3366' }}>Menu ☁️</h3>
            <button onClick={closeMenu} style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999',
            }}>✕</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={newGameHandler} style={{
              padding: '14px 16px',
              border: 'none',
              borderRadius: '15px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              background: '#f5f5f5',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span>🎮</span> New Game
            </button>
            
            <button onClick={resetGameHandler} style={{
              padding: '14px 16px',
              border: 'none',
              borderRadius: '15px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              background: '#f5f5f5',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span>🔄</span> Reset Game
            </button>
            
            <button onClick={handleLeaderboardClick} style={{
              padding: '14px 16px',
              border: 'none',
              borderRadius: '15px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              background: '#f5f5f5',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span>🏆</span> My Stats
            </button>
            
            <button onClick={() => { setShowGlobalLeaderboard(true); closeMenu(); }} style={{
              padding: '14px 16px',
              border: 'none',
              borderRadius: '15px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              background: '#f5f5f5',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span>🌍</span> Global Leaderboard
            </button>
            
            <button onClick={() => { manualSync(); closeMenu(); }} style={{
              padding: '14px 16px',
              border: 'none',
              borderRadius: '15px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              background: '#f5f5f5',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span>☁️</span> Sync to Cloud
            </button>
            
            <button onClick={refreshChallengesHandler} style={{
              padding: '14px 16px',
              border: 'none',
              borderRadius: '15px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              background: '#f5f5f5',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span>🎯</span> Refresh Challenges
            </button>
            
            <button onClick={backHandler} style={{
              padding: '14px 16px',
              border: 'none',
              borderRadius: '15px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              background: '#f5f5f5',
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span>←</span> Back to Love Letter
            </button>
          </div>
          
          <div style={{
            marginTop: '20px',
            paddingTop: '15px',
            textAlign: 'center',
            borderTop: '1px solid #eee',
          }}>
            <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>Brian & Jasmine ❤️</p>
          </div>
        </div>
      </div>
    );
  };

  // Notification Panel Component
  const NotificationPanel = () => {
    if (!showNotifications) return null;
    
    return (
      <>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
        }} onClick={() => setShowNotifications(false)} />
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '350px',
          background: 'white',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-5px 0 20px rgba(0,0,0,0.2)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            background: 'linear-gradient(135deg, #ff6b9d, #ff3366)',
            color: 'white',
          }}>
            <h3 style={{ margin: 0 }}>📬 Notifications ☁️</h3>
            <button onClick={() => setShowNotifications(false)} style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: 'white',
              cursor: 'pointer',
            }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                <span style={{ fontSize: '50px', display: 'block', marginBottom: '15px' }}>📭</span>
                <p style={{ color: '#999' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} style={{
                  padding: '15px',
                  borderRadius: '15px',
                  marginBottom: '10px',
                  background: notif.read ? '#f5f5f5' : '#fff3e0',
                  borderLeft: notif.read ? 'none' : '4px solid #ff9800',
                }}>
                  <div style={{ fontSize: '14px', color: '#333', marginBottom: '5px' }}>{notif.message}</div>
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleString() : new Date(notif.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </>
    );
  };

  // Reward Selection Modal
  const RewardSelectionModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #fff5f5, #ffe4ea)',
        borderRadius: '30px',
        padding: '30px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
      }}>
        <div>
          <span style={{ fontSize: '60px', display: 'block', marginBottom: '10px' }}>
            {rewardType === 'junkfood' && '🍟'}
            {rewardType === 'drinks' && '🥤'}
            {rewardType === 'sweets' && '🍰'}
            {rewardType === 'fastfood' && '🍔'}
          </span>
          <h2 style={{ color: '#ff3366', fontSize: '24px', margin: '10px 0' }}>Congratulations, {playerStats.name}! 💕</h2>
        </div>
        <div style={{ margin: '20px 0' }}>
          <p style={{ color: '#666', fontSize: '16px', margin: '10px 0' }}>
            {rewardType === 'junkfood' && 'You completed Easy mode under 4 minutes! 🎉'}
            {rewardType === 'drinks' && 'You completed Medium mode under 8 minutes! 🎉'}
            {rewardType === 'sweets' && 'You completed Hard mode! 🎉'}
            {rewardType === 'fastfood' && 'AMAZING! You completed EXPERT mode! 🎉🎉🎉'}
          </p>
          <p style={{ fontWeight: 'bold', color: '#ff3366', fontSize: '18px' }}>Choose your reward:</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', margin: '20px 0' }}>
          {(rewardType === 'junkfood' || rewardType === 'drinks' || rewardType === 'sweets') && 
            foodOptions[rewardType].map((option, index) => (
              <button
                key={index}
                onClick={() => handleRewardSelection(option)}
                style={{
                  padding: '12px',
                  border: 'none',
                  borderRadius: '15px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: 'white',
                  color: '#764ba2',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {option}
              </button>
            ))
          }
          {rewardType === 'fastfood' && 
            foodOptions.fastfood.map((option, index) => (
              <button
                key={index}
                onClick={() => handleRewardSelection(option.name)}
                style={{
                  padding: '12px',
                  border: 'none',
                  borderRadius: '15px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #ff6b9d, #ff3366)',
                  color: 'white',
                }}
              >
                {option.name}
              </button>
            ))
          }
        </div>
      </div>
    </div>
  );

  // Receipt Modal
  const ReceiptModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '25px',
        maxWidth: '350px',
        width: '90%',
        fontFamily: "'Courier New', monospace",
      }} id="receipt-content">
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #ff6b9d', paddingBottom: '15px', marginBottom: '15px' }}>
          <div style={{ fontSize: '40px' }}>💝</div>
          <h2 style={{ color: '#ff3366', margin: '10px 0 5px', fontSize: '20px' }}>Love Date Receipt</h2>
          <p style={{ color: '#999', fontSize: '11px', margin: 0 }}>{new Date(receiptData?.date).toLocaleString()}</p>
        </div>
        
        <div style={{ margin: '20px 0' }}>
          <div>
            <p style={{ margin: '8px 0', fontSize: '13px', color: '#333' }}><strong>💕 For:</strong> {receiptData?.playerName}</p>
            <p style={{ margin: '8px 0', fontSize: '13px', color: '#333' }}><strong>🎮 Game Mode:</strong> {receiptData?.difficulty?.toUpperCase()}</p>
            <p style={{ margin: '8px 0', fontSize: '13px', color: '#333' }}><strong>⏱️ Completion Time:</strong> {formatTime(receiptData?.time)}</p>
          </div>
          
          <div style={{ textAlign: 'center', color: '#ccc', margin: '15px 0', fontSize: '12px' }}>━━━━━━━━━━━━━━━━</div>
          
          <div style={{ textAlign: 'center', margin: '15px 0' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}><strong>🎁 Your Reward:</strong></p>
            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <span style={{ fontSize: '40px' }}>
                {receiptData?.type === 'junkfood' && '🍟'}
                {receiptData?.type === 'drinks' && '🥤'}
                {receiptData?.type === 'sweets' && '🍰'}
                {receiptData?.type === 'fastfood' && '🍔'}
              </span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff3366' }}>{receiptData?.selection}</span>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', color: '#ccc', margin: '15px 0', fontSize: '12px' }}>━━━━━━━━━━━━━━━━</div>
          
          <div style={{ textAlign: 'center', margin: '15px 0' }}>
            <p style={{ margin: '5px 0', fontStyle: 'italic', color: '#666' }}>✨ Your reward request has been sent to admin for approval! ✨</p>
            <p style={{ margin: '5px 0', fontStyle: 'italic', color: '#666' }}>☁️ Data saved to cloud ☁️</p>
            <p style={{ margin: '5px 0', fontStyle: 'italic', color: '#666' }}>💖 Love, Brian 💖</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={printReceipt} style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #4caf50, #45a049)',
            color: 'white',
          }}>🖨️ Print Receipt</button>
          <button onClick={() => setShowReceipt(false)} style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            background: '#f0f0f0',
            color: '#666',
          }}>Close</button>
        </div>
      </div>
    </div>
  );

  // Victory Modal
  const VictoryModal = () => {
    const beatBrian = timer < brianRecords[difficulty].time;
    const earnedReward = (difficulty === 'easy' && timer <= 240) ||
                         (difficulty === 'medium' && timer <= 480) ||
                         difficulty === 'hard' ||
                         difficulty === 'expert';
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.95)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }} onClick={() => setShowVictory(false)}>
        <div style={{
          background: 'linear-gradient(135deg, #fff, #ffe4ea)',
          borderRadius: '25px',
          padding: '25px',
          textAlign: 'center',
          width: '100%',
          maxWidth: '300px',
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: '60px' }}>🎉</div>
          <h2 style={{ color: '#ff3366', fontSize: '22px', margin: '10px 0' }}>Congratulations, {playerStats.name}! 💕</h2>
          <p>You solved the puzzle!</p>
          
          <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '15px', margin: '15px 0', fontSize: '14px' }}>
            <div>⏱️ {formatTime(timer)}</div>
            <div>❌ {mistakes}/{maxMistakes}</div>
            <div>🎯 {difficulty}</div>
            
            {beatBrian && (
              <div style={{ background: 'linear-gradient(135deg, #ffd700, #ffb347)', padding: '8px', borderRadius: '10px', fontWeight: 'bold', marginTop: '8px', color: 'white' }}>
                🎉 Beat Brian's record! +200 🎉
              </div>
            )}
            
            {earnedReward && (
              <div style={{ background: 'linear-gradient(135deg, #4caf50, #45a049)', padding: '8px', borderRadius: '10px', fontWeight: 'bold', marginTop: '10px', color: 'white' }}>
                🎁 You earned a special reward! 🎁
              </div>
            )}
            
            {playerRank && playerRank.rank && (
              <div style={{ background: 'linear-gradient(135deg, #ffd700, #ffb347)', padding: '8px', borderRadius: '10px', fontWeight: 'bold', marginTop: '10px', color: '#333' }}>
                🌍 Global Rank #{playerRank.rank} for {difficulty}!
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={newGameHandler} style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '25px',
              fontWeight: 'bold',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #ff6b9d, #ff3366)',
              color: 'white',
            }}>New Game</button>
            <button onClick={() => setShowVictory(false)} style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '25px',
              fontWeight: 'bold',
              cursor: 'pointer',
              background: '#f0f0f0',
              color: '#666',
            }}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  const GameOverModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }} onClick={() => setGameStatus('playing')}>
      <div style={{
        background: 'linear-gradient(135deg, #fff, #ffe0e0)',
        borderRadius: '25px',
        padding: '25px',
        textAlign: 'center',
        width: '100%',
        maxWidth: '300px',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: '60px' }}>💀</div>
        <h2 style={{ color: '#ff3366', fontSize: '22px', margin: '10px 0' }}>Game Over!</h2>
        <p>{maxMistakes} mistakes made</p>
        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '15px', margin: '15px 0', fontSize: '14px' }}>
          <div>⏱️ {formatTime(timer)}</div>
          <div>🎯 {difficulty}</div>
          <div>🔥 Streak ended at {streak}</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={newGameHandler} style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '25px',
            fontWeight: 'bold',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #ff6b9d, #ff3366)',
            color: 'white',
          }}>Try Again</button>
          <button onClick={resetGameHandler} style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '25px',
            fontWeight: 'bold',
            cursor: 'pointer',
            background: '#f0f0f0',
            color: '#666',
          }}>Reset</button>
        </div>
      </div>
    </div>
  );

  // Reward Popup Component
  const RewardPopup = () => (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10001,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #ffd700, #ffb347)',
        borderRadius: '15px',
        padding: '15px 25px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '40px' }}>{currentReward?.icon}</div>
        <h3 style={{ color: 'white', margin: '8px 0', fontSize: '16px' }}>Challenge Complete!</h3>
        <p style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>{currentReward?.name}</p>
        <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px', marginTop: '5px' }}>+{currentReward?.points} pts</p>
      </div>
    </div>
  );

  // Leaderboard Modal
  const LeaderboardModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }} onClick={handleLeaderboardClose}>
      <div style={{
        background: 'white',
        borderRadius: '25px',
        padding: '20px',
        width: '100%',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid #ff6b9d' }}>
          <h2 style={{ color: '#ff3366', fontSize: '20px', margin: 0 }}>🏆 My Stats ☁️</h2>
          <button onClick={handleLeaderboardClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>✕</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', display: 'block', marginBottom: '5px' }}>👤</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>Player</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>{playerStats.name}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', display: 'block', marginBottom: '5px' }}>🏆</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>Wins</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>{playerStats.wins}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', display: 'block', marginBottom: '5px' }}>⭐</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>Points</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>{playerStats.totalPoints}</div>
          </div>
        </div>

        {playerBest && (
          <div style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '15px', padding: '15px', margin: '15px 0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#ff3366' }}>🏅 Personal Bests</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'white', borderRadius: '10px', fontSize: '12px' }}>
                <span style={{ fontWeight: 'bold', color: '#666' }}>🌟 Easy</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#ff3366' }}>{playerBest.easy ? formatTime(playerBest.easy.time) : '--:--'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'white', borderRadius: '10px', fontSize: '12px' }}>
                <span style={{ fontWeight: 'bold', color: '#666' }}>⭐ Medium</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#ff3366' }}>{playerBest.medium ? formatTime(playerBest.medium.time) : '--:--'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'white', borderRadius: '10px', fontSize: '12px' }}>
                <span style={{ fontWeight: 'bold', color: '#666' }}>💪 Hard</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#ff3366' }}>{playerBest.hard ? formatTime(playerBest.hard.time) : '--:--'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'white', borderRadius: '10px', fontSize: '12px' }}>
                <span style={{ fontWeight: 'bold', color: '#666' }}>👑 Expert</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#ff3366' }}>{playerBest.expert ? formatTime(playerBest.expert.time) : '--:--'}</span>
              </div>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '15px' }}>
          {['easy', 'medium', 'hard', 'expert'].map(diff => (
            <div key={diff} style={{ background: '#f5f5f5', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontWeight: 'bold', color: '#ff3366', marginBottom: '8px', fontSize: '14px' }}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</div>
              <div style={{ fontSize: '10px', color: '#999', marginBottom: '8px' }}>🌍 Global Rankings</div>
              <div style={{ background: '#fff9c4', margin: '4px -5px', padding: '6px 5px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                <div style={{ width: '25px', fontWeight: 'bold', color: '#ff9800' }}>👑</div>
                <div style={{ flex: 1 }}>Brian (Record)</div>
                <div style={{ fontFamily: 'monospace' }}>{formatTime(brianRecords[diff].time)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', fontSize: '12px' }}>
                <div style={{ width: '25px', fontWeight: 'bold', color: '#ff9800' }}>🎯</div>
                <div style={{ flex: 1 }}>Beat: {formatTime(brianRecords[diff].time - 10)}</div>
                <div style={{ fontFamily: 'monospace' }}>+200 pts</div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #fff9c4, #ffe082)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px', color: '#e65100' }}>
            <span>⭐</span>
            <span>Beat Brian: {formatTime(brianRecords[difficulty].time)}</span>
            <span>☁️</span>
          </div>
        </div>

        <button onClick={() => { setShowLeaderboard(false); setShowGlobalLeaderboard(true); }} style={{
          width: '100%',
          marginTop: '15px',
          padding: '12px',
          background: 'linear-gradient(135deg, #2196f3, #1976d2)',
          border: 'none',
          borderRadius: '25px',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}>
          🌍 View Global Leaderboard
        </button>
      </div>
    </div>
  );

  if (!board) {
    return (
      <div className="sudoku-container">
        <div className="sudoku-header">
          <button className="back-button" onClick={onBack}>←</button>
          <h1 className="sudoku-title">Sudoku ☁️</h1>
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
        <h1 className="sudoku-title">Sudoku 💕☁️</h1>
        <button 
          className="menu-button" 
          onClick={openMenu}
          aria-label="Menu"
        >
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
        <div className="stat-mobile">
          <span>☁️</span>
          <span>Cloud</span>
        </div>
      </div>

      {/* Global Stats Bar */}
      {globalStats && (
        <div className="global-stats-bar">
          <div className="global-stat">
            <span>🌍</span>
            <span>{globalStats.totalPlayers} Players</span>
          </div>
          <div className="global-stat">
            <span>🎮</span>
            <span>{globalStats.totalGames} Games</span>
          </div>
          <div className="global-stat">
            <span>🏆</span>
            <span>World: {globalStats.records[difficulty]?.time ? formatTime(globalStats.records[difficulty].time) : '--:--'}</span>
          </div>
          {playerRank && playerRank.rank && (
            <div className="global-stat rank-stat">
              <span>📊</span>
              <span>Rank #{playerRank.rank}</span>
            </div>
          )}
          {globalStats?.totalPrizesWon > 0 && (
            <div className="global-stat prize-stat">
              <span>🎁</span>
              <span>{globalStats.totalPrizesWon} Prizes</span>
            </div>
          )}
        </div>
      )}

      <div className="difficulty-row">
        {['easy', 'medium', 'hard', 'expert'].map(level => (
          <button
            key={level}
            className={`difficulty-chip ${difficulty === level ? 'active' : ''}`}
            onClick={() => setDifficulty(level)}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
            {level === 'easy' && ' 🍟'}
            {level === 'medium' && ' 🥤'}
            {level === 'hard' && ' 🍰'}
            {level === 'expert' && ' 🍔'}
          </button>
        ))}
      </div>

      <div className="rewards-info">
        <div className="reward-badge easy-reward">🍟 Easy &lt;4min</div>
        <div className="reward-badge medium-reward">🥤 Medium &lt;8min</div>
        <div className="reward-badge hard-reward">🍰 Hard Complete</div>
        <div className="reward-badge expert-reward">🍔 Expert Complete</div>
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

      {/* Action Row with Hint Button */}
      <div className="action-row">
        <button className="action-chip" onClick={getHint} disabled={hintsLeft === 0}>
          💡 {hintsLeft}
        </button>
      </div>
      
      {/* Modals */}
      <SimpleMenu />
      {showVictory && gameStatus === 'won' && <VictoryModal />}
      {gameStatus === 'lost' && <GameOverModal />}
      {showRewards && currentReward && <RewardPopup />}
      {showLeaderboard && <LeaderboardModal />}
      {showRewardSelection && <RewardSelectionModal />}
      {showReceipt && <ReceiptModal />}
      <NotificationPanel />
      {showGlobalLeaderboard && (
        <GlobalLeaderboard onClose={() => setShowGlobalLeaderboard(false)} />
      )}
      {pendingRewardStatus === 'pending' && (
        <div className="pending-reward-popup">
          <div className="pending-reward-content">
            <span>⏳</span>
            <p>Reward sent for admin approval! ☁️</p>
          </div>
        </div>
      )}
      
      {/* Sync Notifications */}
      {showSyncNotification && (
        <div className="sync-notification">
          <div className="sync-content cloud">
            <span>☁️</span>
            <p>Cloud data loaded! Your progress is synced across devices.</p>
          </div>
        </div>
      )}
      
      {showSyncSuccess && (
        <div className="sync-notification">
          <div className="sync-content success">
            <span>✅</span>
            <p>Successfully synced to cloud! ☁️</p>
          </div>
        </div>
      )}
      
      {showSyncError && (
        <div className="sync-notification">
          <div className="sync-content error">
            <span>❌</span>
            <p>Sync failed. Check your connection.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sudoku;