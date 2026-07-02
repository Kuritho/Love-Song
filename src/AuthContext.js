// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('sudoku_users');
    return saved ? JSON.parse(saved) : [
      { 
        id: 'admin_1', 
        username: 'admin', 
        password: 'admin123', 
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ];
  });

  useEffect(() => {
    const token = localStorage.getItem('sudoku_auth_token');
    const savedUser = localStorage.getItem('sudoku_current_user');
    
    if (token && savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem('sudoku_users', JSON.stringify(updatedUsers));
  };

  const login = (username, password) => {
    const foundUser = users.find(
      u => u.username === username && u.password === password
    );
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('sudoku_auth_token', 'authenticated');
      localStorage.setItem('sudoku_current_user', JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }
    return { success: false, error: 'Invalid username or password' };
  };

  const register = (username, password) => {
    if (users.find(u => u.username === username)) {
      return { success: false, error: 'Username already exists' };
    }
    
    const newUser = {
      id: Date.now().toString(),
      username,
      password,
      role: 'user',
      createdAt: new Date().toISOString(),
      totalGames: 0,
      totalWins: 0,
      totalPoints: 0
    };
    
    saveUsers([...users, newUser]);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('sudoku_auth_token');
    localStorage.removeItem('sudoku_current_user');
  };

  const getAllUsers = () => {
    return users.filter(u => u.role !== 'admin');
  };

  const deleteUser = (userId) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    saveUsers(updatedUsers);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      getAllUsers,
      deleteUser,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};