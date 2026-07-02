// firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot,
  setDoc,
  getDoc,
  enableIndexedDbPersistence,
  deleteDoc
} from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBljA9HXbhAtmqVWJJvJraR_CaeEUibP7w",
  authDomain: "sudokulovegame.firebaseapp.com",
  projectId: "sudokulovegame",
  storageBucket: "sudokulovegame.firebasestorage.app",
  messagingSenderId: "548365960050",
  appId: "1:548365960050:web:c8a35f2360810b45a093eb"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence enabled in first tab only');
    } else if (err.code === 'unimplemented') {
      console.warn('Browser doesn\'t support persistence');
    }
  });
}

// Collection references
const USERS_COLLECTION = 'sudoku_users';
const REWARDS_COLLECTION = 'sudoku_rewards';
const NOTIFICATIONS_COLLECTION = 'sudoku_notifications';
const LEADERBOARD_COLLECTION = 'sudoku_leaderboard';
const GAME_STATS_COLLECTION = 'sudoku_game_stats';

// ==================== USER FUNCTIONS ====================

export const createUserInFirestore = async (userId, userData) => {
  try {
    await setDoc(doc(db, USERS_COLLECTION, userId), {
      ...userData,
      createdAt: serverTimestamp(),
      totalGames: 0,
      totalWins: 0,
      totalPoints: 0,
      perfectGames: 0,
      bestTime: null
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
};

export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error: error.message };
  }
};

export const updateUserStats = async (userId, stats) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...stats,
      lastUpdated: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user stats:', error);
    return { success: false, error: error.message };
  }
};

export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: users };
  } catch (error) {
    console.error('Error getting all users:', error);
    return { success: false, error: error.message };
  }
};

// ==================== REWARD FUNCTIONS ====================

export const addReward = async (rewardData) => {
  try {
    const docRef = await addDoc(collection(db, REWARDS_COLLECTION), {
      ...rewardData,
      status: 'pending',
      createdAt: serverTimestamp(),
      approvedAt: null,
      approvedBy: null
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding reward:', error);
    return { success: false, error: error.message };
  }
};

export const getPendingRewards = async () => {
  try {
    const q = query(
      collection(db, REWARDS_COLLECTION),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const rewards = [];
    querySnapshot.forEach((doc) => {
      rewards.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: rewards };
  } catch (error) {
    console.error('Error getting pending rewards:', error);
    return { success: false, error: error.message };
  }
};

export const getRewardsByUser = async (username) => {
  try {
    const q = query(
      collection(db, REWARDS_COLLECTION),
      where('playerName', '==', username),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const rewards = [];
    querySnapshot.forEach((doc) => {
      rewards.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: rewards };
  } catch (error) {
    console.error('Error getting user rewards:', error);
    return { success: false, error: error.message };
  }
};

export const approveReward = async (rewardId, approvedBy) => {
  try {
    const rewardRef = doc(db, REWARDS_COLLECTION, rewardId);
    await updateDoc(rewardRef, {
      status: 'approved',
      approvedBy: approvedBy,
      approvedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error approving reward:', error);
    return { success: false, error: error.message };
  }
};

export const rejectReward = async (rewardId, rejectedBy) => {
  try {
    const rewardRef = doc(db, REWARDS_COLLECTION, rewardId);
    await updateDoc(rewardRef, {
      status: 'rejected',
      rejectedBy: rejectedBy,
      rejectedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error rejecting reward:', error);
    return { success: false, error: error.message };
  }
};

export const getAllRewards = async () => {
  try {
    const q = query(collection(db, REWARDS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const rewards = [];
    querySnapshot.forEach((doc) => {
      rewards.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: rewards };
  } catch (error) {
    console.error('Error getting all rewards:', error);
    return { success: false, error: error.message };
  }
};

// ==================== NOTIFICATION FUNCTIONS ====================

export const addNotification = async (notificationData) => {
  try {
    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding notification:', error);
    return { success: false, error: error.message };
  }
};

export const getUserNotifications = async (username) => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', username),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { success: false, error: error.message };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notifRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notifRef, { read: true });
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

export const markAllNotificationsAsRead = async (username) => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', username),
      where('read', '==', false)
    );
    const querySnapshot = await getDocs(q);
    const batch = [];
    querySnapshot.forEach((doc) => {
      batch.push(updateDoc(doc.ref, { read: true }));
    });
    await Promise.all(batch);
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }
};

// ==================== LEADERBOARD FUNCTIONS ====================

export const addLeaderboardEntry = async (entryData) => {
  try {
    // Check if user already has an entry for this difficulty
    const existingQuery = query(
      collection(db, LEADERBOARD_COLLECTION),
      where('name', '==', entryData.name),
      where('difficulty', '==', entryData.difficulty)
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      // Update existing entry if time is better
      const existingDoc = existingSnapshot.docs[0];
      const existingData = existingDoc.data();
      
      if (entryData.time < existingData.time) {
        await updateDoc(doc(db, LEADERBOARD_COLLECTION, existingDoc.id), {
          time: entryData.time,
          mistakes: entryData.mistakes,
          perfectGame: entryData.perfectGame,
          totalPoints: entryData.totalPoints,
          updatedAt: serverTimestamp()
        });
        return { success: true, updated: true };
      }
      return { success: true, updated: false };
    } else {
      // Add new entry
      await addDoc(collection(db, LEADERBOARD_COLLECTION), {
        ...entryData,
        createdAt: serverTimestamp()
      });
      return { success: true, updated: true };
    }
  } catch (error) {
    console.error('Error adding leaderboard entry:', error);
    return { success: false, error: error.message };
  }
};

// Update leaderboard with prize when user wins a reward
export const updateLeaderboardWithPrize = async (playerName, difficulty, prize) => {
  try {
    const q = query(
      collection(db, LEADERBOARD_COLLECTION),
      where('name', '==', playerName),
      where('difficulty', '==', difficulty)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, LEADERBOARD_COLLECTION, querySnapshot.docs[0].id);
      await updateDoc(docRef, {
        prize: prize,
        prizeType: prize.includes('🍟') || prize.includes('🍿') || prize.includes('🥨') ? 'junkfood' :
                   prize.includes('🥤') || prize.includes('🧋') || prize.includes('☕') ? 'drinks' :
                   prize.includes('🍰') || prize.includes('🍪') || prize.includes('🍩') ? 'sweets' : 'fastfood',
        updatedAt: serverTimestamp()
      });
      return { success: true };
    }
    return { success: false, error: 'Leaderboard entry not found' };
  } catch (error) {
    console.error('Error updating leaderboard with prize:', error);
    return { success: false, error: error.message };
  }
};

export const getLeaderboard = async () => {
  try {
    const q = query(
      collection(db, LEADERBOARD_COLLECTION),
      orderBy('time', 'asc'),
      limit(100)
    );
    const querySnapshot = await getDocs(q);
    const entries = [];
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    
    // Group by difficulty
    const grouped = {
      easy: [],
      medium: [],
      hard: [],
      expert: []
    };
    
    entries.forEach(entry => {
      if (grouped[entry.difficulty]) {
        grouped[entry.difficulty].push(entry);
      }
    });
    
    // Sort each difficulty by time
    Object.keys(grouped).forEach(diff => {
      grouped[diff].sort((a, b) => a.time - b.time);
    });
    
    return { success: true, data: grouped };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return { success: false, error: error.message };
  }
};

// ==================== GLOBAL LEADERBOARD FUNCTIONS ====================

export const getGlobalLeaderboard = async () => {
  try {
    const q = query(
      collection(db, LEADERBOARD_COLLECTION),
      orderBy('time', 'asc'),
      limit(100)
    );
    const querySnapshot = await getDocs(q);
    const entries = [];
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    
    // Group by difficulty
    const grouped = {
      easy: [],
      medium: [],
      hard: [],
      expert: []
    };
    
    entries.forEach(entry => {
      if (grouped[entry.difficulty]) {
        grouped[entry.difficulty].push(entry);
      }
    });
    
    // Sort each difficulty by time
    Object.keys(grouped).forEach(diff => {
      grouped[diff].sort((a, b) => a.time - b.time);
    });
    
    return { success: true, data: grouped };
  } catch (error) {
    console.error('Error getting global leaderboard:', error);
    return { success: false, error: error.message };
  }
};

export const getTopPlayers = async (difficulty, limitCount = 10) => {
  try {
    const q = query(
      collection(db, LEADERBOARD_COLLECTION),
      where('difficulty', '==', difficulty),
      orderBy('time', 'asc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const entries = [];
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: entries };
  } catch (error) {
    console.error('Error getting top players:', error);
    return { success: false, error: error.message };
  }
};

export const getPlayerBest = async (playerName) => {
  try {
    const q = query(
      collection(db, LEADERBOARD_COLLECTION),
      where('name', '==', playerName)
    );
    const querySnapshot = await getDocs(q);
    const bestScores = {
      easy: null,
      medium: null,
      hard: null,
      expert: null
    };
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!bestScores[data.difficulty] || data.time < bestScores[data.difficulty].time) {
        bestScores[data.difficulty] = data;
      }
    });
    
    return { success: true, data: bestScores };
  } catch (error) {
    console.error('Error getting player best:', error);
    return { success: false, error: error.message };
  }
};

export const getPlayerRank = async (playerName, difficulty) => {
  try {
    const q = query(
      collection(db, LEADERBOARD_COLLECTION),
      where('difficulty', '==', difficulty),
      orderBy('time', 'asc')
    );
    const querySnapshot = await getDocs(q);
    let rank = 1;
    let playerTime = null;
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if (data.name === playerName) {
        playerTime = data.time;
        break;
      }
      rank++;
    }
    
    if (playerTime) {
      return { success: true, data: { rank, time: playerTime } };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Error getting player rank:', error);
    return { success: false, error: error.message };
  }
};

// ==================== GAME STATS FUNCTIONS ====================

export const saveGameStats = async (statsData) => {
  try {
    await addDoc(collection(db, GAME_STATS_COLLECTION), {
      ...statsData,
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving game stats:', error);
    return { success: false, error: error.message };
  }
};

export const getUserGameStats = async (playerName) => {
  try {
    const q = query(
      collection(db, GAME_STATS_COLLECTION),
      where('playerName', '==', playerName),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const querySnapshot = await getDocs(q);
    const stats = [];
    querySnapshot.forEach((doc) => {
      stats.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error getting user game stats:', error);
    return { success: false, error: error.message };
  }
};

// ==================== GLOBAL STATISTICS FUNCTIONS ====================

export const getGlobalStatistics = async () => {
  try {
    const gamesQuery = query(collection(db, GAME_STATS_COLLECTION), limit(1000));
    const gamesSnapshot = await getDocs(gamesQuery);
    
    const playersQuery = query(collection(db, USERS_COLLECTION));
    const playersSnapshot = await getDocs(playersQuery);
    
    const leaderboardQuery = query(collection(db, LEADERBOARD_COLLECTION));
    const leaderboardSnapshot = await getDocs(leaderboardQuery);
    
    let totalGames = 0;
    let totalPerfectGames = 0;
    let totalPoints = 0;
    let totalPrizesWon = 0;
    let fastestTimeEasy = Infinity;
    let fastestTimeMedium = Infinity;
    let fastestTimeHard = Infinity;
    let fastestTimeExpert = Infinity;
    let fastestPlayerEasy = null;
    let fastestPlayerMedium = null;
    let fastestPlayerHard = null;
    let fastestPlayerExpert = null;
    
    gamesSnapshot.forEach((doc) => {
      const data = doc.data();
      totalGames++;
      if (data.mistakes === 0) totalPerfectGames++;
      totalPoints += data.pointsEarned || 0;
      
      switch(data.difficulty) {
        case 'easy':
          if (data.time && data.time < fastestTimeEasy) {
            fastestTimeEasy = data.time;
            fastestPlayerEasy = data.playerName;
          }
          break;
        case 'medium':
          if (data.time && data.time < fastestTimeMedium) {
            fastestTimeMedium = data.time;
            fastestPlayerMedium = data.playerName;
          }
          break;
        case 'hard':
          if (data.time && data.time < fastestTimeHard) {
            fastestTimeHard = data.time;
            fastestPlayerHard = data.playerName;
          }
          break;
        case 'expert':
          if (data.time && data.time < fastestTimeExpert) {
            fastestTimeExpert = data.time;
            fastestPlayerExpert = data.playerName;
          }
          break;
      }
    });
    
    leaderboardSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.prize) {
        totalPrizesWon++;
      }
    });
    
    return {
      success: true,
      data: {
        totalGames,
        totalPerfectGames,
        totalPoints,
        totalPlayers: playersSnapshot.size,
        totalPrizesWon,
        records: {
          easy: { time: fastestTimeEasy === Infinity ? null : fastestTimeEasy, player: fastestPlayerEasy },
          medium: { time: fastestTimeMedium === Infinity ? null : fastestTimeMedium, player: fastestPlayerMedium },
          hard: { time: fastestTimeHard === Infinity ? null : fastestTimeHard, player: fastestPlayerHard },
          expert: { time: fastestTimeExpert === Infinity ? null : fastestTimeExpert, player: fastestPlayerExpert }
        }
      }
    };
  } catch (error) {
    console.error('Error getting global statistics:', error);
    return { success: false, error: error.message };
  }
};

export const getAllTimeBest = async () => {
  try {
    const q = query(
      collection(db, LEADERBOARD_COLLECTION),
      orderBy('time', 'asc'),
      limit(20)
    );
    const querySnapshot = await getDocs(q);
    const entries = [];
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: entries };
  } catch (error) {
    console.error('Error getting all-time best:', error);
    return { success: false, error: error.message };
  }
};

// ==================== REAL-TIME SUBSCRIPTIONS ====================

export const subscribeToGlobalLeaderboard = (callback) => {
  const q = query(collection(db, LEADERBOARD_COLLECTION), orderBy('time', 'asc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const entries = [];
    snapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    
    // Group by difficulty
    const grouped = {
      easy: [],
      medium: [],
      hard: [],
      expert: []
    };
    
    entries.forEach(entry => {
      if (grouped[entry.difficulty]) {
        grouped[entry.difficulty].push(entry);
      }
    });
    
    Object.keys(grouped).forEach(diff => {
      grouped[diff].sort((a, b) => a.time - b.time);
    });
    
    callback(grouped);
  });
};

export const subscribeToRewards = (callback) => {
  const q = query(collection(db, REWARDS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const rewards = [];
    snapshot.forEach((doc) => {
      rewards.push({ id: doc.id, ...doc.data() });
    });
    callback(rewards);
  });
};

export const subscribeToNotifications = (username, callback) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', username),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    callback(notifications);
  });
};

export const subscribeToUserStats = (userId, callback) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

// ==================== AUTHENTICATION FUNCTIONS ====================

export const registerWithFirebase = async (email, password, username) => {
  try {
    // Import auth dynamically to avoid circular dependencies
    const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
    const auth = getAuth(app);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if username already exists
    const existingUserQuery = query(
      collection(db, USERS_COLLECTION),
      where('username', '==', username)
    );
    const existingUser = await getDocs(existingUserQuery);
    
    if (!existingUser.empty) {
      await user.delete();
      return { success: false, error: 'Username already taken' };
    }
    
    // Create user document in Firestore
    await createUserInFirestore(user.uid, {
      uid: user.uid,
      username: username,
      email: email,
      role: 'user',
      createdAt: new Date().toISOString()
    });
    
    return { success: true, user: { uid: user.uid, username, email, role: 'user' } };
  } catch (error) {
    console.error('Registration error:', error);
    
    let errorMessage = 'Registration failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email already registered. Please login instead.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Use at least 6 characters.';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const loginWithFirebase = async (email, password) => {
  try {
    const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
    const auth = getAuth(app);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userData = await getUserData(user.uid);
    if (userData.success) {
      return { 
        success: true, 
        user: {
          uid: user.uid,
          username: userData.data.username,
          email: user.email,
          role: userData.data.role || 'user'
        }
      };
    }
    return { success: false, error: 'User data not found' };
  } catch (error) {
    console.error('Login error:', error);
    
    let errorMessage = 'Login failed. Please try again.';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const logoutFromFirebase = async () => {
  try {
    const { getAuth, signOut } = await import('firebase/auth');
    const auth = getAuth(app);
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

export const onAuthChange = (callback) => {
  const { getAuth, onAuthStateChanged } = require('firebase/auth');
  const auth = getAuth(app);
  return onAuthStateChanged(auth, callback);
};

// ==================== ADMIN FUNCTIONS ====================

export const getAllPlayers = async () => {
  try {
    const q = query(collection(db, LEADERBOARD_COLLECTION));
    const querySnapshot = await getDocs(q);
    const players = new Map();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!players.has(data.name)) {
        players.set(data.name, {
          name: data.name,
          bestTimes: {},
          totalGames: 0,
          perfectGames: 0,
          prizes: []
        });
      }
      const player = players.get(data.name);
      player.bestTimes[data.difficulty] = data.time;
      if (data.perfectGame) player.perfectGames++;
      player.totalGames++;
      if (data.prize) {
        player.prizes.push(data.prize);
      }
    });
    
    return { success: true, data: Array.from(players.values()) };
  } catch (error) {
    console.error('Error getting all players:', error);
    return { success: false, error: error.message };
  }
};

export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
};

// Export database instance
export { db };