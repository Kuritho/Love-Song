// auth.js
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { db } from './firebase';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBljA9HXbhAtmqVWJJvJraR_CaeEUibP7w",
  authDomain: "sudokulovegame.firebaseapp.com",
  projectId: "sudokulovegame",
  storageBucket: "sudokulovegame.firebasestorage.app",
  messagingSenderId: "548365960050",
  appId: "1:548365960050:web:c8a35f2360810b45a093eb"
};

// Initialize Firebase if not already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Set persistence
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Collection reference
const USERS_COLLECTION = 'sudoku_users';

export const createUserInFirestore = async (userId, userData) => {
  try {
    await setDoc(doc(db, USERS_COLLECTION, userId), {
      ...userData,
      createdAt: new Date().toISOString(),
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

export const registerWithFirebase = async (email, password, username) => {
  try {
    if (!email || !password || !username) {
      return { success: false, error: 'All fields are required' };
    }
    
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    if (username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }
    
    // Check if username already exists
    const existingUserQuery = query(
      collection(db, USERS_COLLECTION),
      where('username', '==', username)
    );
    const existingUser = await getDocs(existingUserQuery);
    
    if (!existingUser.empty) {
      return { success: false, error: 'Username already taken' };
    }
    
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
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
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }
    
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
    await signOut(auth);
    console.log('Successfully signed out from Firebase'); // Debug log
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };