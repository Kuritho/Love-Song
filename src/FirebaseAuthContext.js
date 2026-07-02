// FirebaseAuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  loginWithFirebase, 
  registerWithFirebase, 
  logoutFromFirebase,
  onAuthChange
} from './auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser); // Debug log
      if (firebaseUser) {
        // User is signed in
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.email?.split('@')[0] || 'Player'
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    console.log('Login called'); // Debug log
    const result = await loginWithFirebase(email, password);
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const register = async (email, password, username) => {
    console.log('Register called'); // Debug log
    const result = await registerWithFirebase(email, password, username);
    return result;
  };

  const logout = async () => {
    console.log('Logout called'); // Debug log
    const result = await logoutFromFirebase();
    if (result.success) {
      setUser(null);
      setIsAuthenticated(false);
      // Clear any local storage data
      localStorage.removeItem('sudoku_auth_token');
      localStorage.removeItem('sudoku_current_user');
      localStorage.removeItem('savedSudokuEmail');
      localStorage.removeItem('rememberSudoku');
    }
    return result;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      isAdmin: user?.email === 'admin@example.com' // Set your admin email here
    }}>
      {children}
    </AuthContext.Provider>
  );
};