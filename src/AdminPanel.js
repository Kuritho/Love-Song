// AdminPanel.js
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import './AdminPanel.css';

function AdminPanel({ onBack, onLogout }) {
  const { user, getAllUsers, deleteUser } = useAuth();
  const [pendingRewards, setPendingRewards] = useState([]);
  const [approvedRewards, setApprovedRewards] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedReward, setSelectedReward] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadRewards();
    loadUsers();
  }, []);

  const loadRewards = () => {
    const allRewards = JSON.parse(localStorage.getItem('sudoku_all_rewards') || '[]');
    const pending = allRewards.filter(r => r.status === 'pending');
    const approved = allRewards.filter(r => r.status === 'approved');
    setPendingRewards(pending);
    setApprovedRewards(approved);
  };

  const loadUsers = () => {
    setUsersList(getAllUsers());
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApproveReward = (reward) => {
    const allRewards = JSON.parse(localStorage.getItem('sudoku_all_rewards') || '[]');
    const updatedRewards = allRewards.map(r => 
      r.id === reward.id ? { ...r, status: 'approved', approvedBy: user.username, approvedAt: new Date().toISOString() } : r
    );
    localStorage.setItem('sudoku_all_rewards', JSON.stringify(updatedRewards));
    
    // Add to user's approved rewards
    const userRewards = JSON.parse(localStorage.getItem(`sudoku_food_rewards_${reward.playerName}`) || '[]');
    const updatedUserRewards = userRewards.map(r => 
      r.id === reward.id ? { ...r, status: 'approved', approvedBy: user.username } : r
    );
    localStorage.setItem(`sudoku_food_rewards_${reward.playerName}`, JSON.stringify(updatedUserRewards));
    
    // Create notification for user
    const notifications = JSON.parse(localStorage.getItem('sudoku_notifications') || '[]');
    notifications.unshift({
      id: Date.now(),
      userId: reward.playerName,
      rewardId: reward.id,
      message: `🎉 Your reward "${reward.selection}" has been approved by Admin! 🎉`,
      type: 'reward_approved',
      read: false,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('sudoku_notifications', JSON.stringify(notifications));
    
    loadRewards();
    showNotification(`Reward "${reward.selection}" approved!`);
  };

  const handleRejectReward = (reward) => {
    const allRewards = JSON.parse(localStorage.getItem('sudoku_all_rewards') || '[]');
    const updatedRewards = allRewards.map(r => 
      r.id === reward.id ? { ...r, status: 'rejected', rejectedBy: user.username, rejectedAt: new Date().toISOString() } : r
    );
    localStorage.setItem('sudoku_all_rewards', JSON.stringify(updatedRewards));
    
    // Create notification for user
    const notifications = JSON.parse(localStorage.getItem('sudoku_notifications') || '[]');
    notifications.unshift({
      id: Date.now(),
      userId: reward.playerName,
      rewardId: reward.id,
      message: `❌ Your reward "${reward.selection}" was rejected. Please try again! ❌`,
      type: 'reward_rejected',
      read: false,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('sudoku_notifications', JSON.stringify(notifications));
    
    loadRewards();
    showNotification(`Reward "${reward.selection}" rejected!`, 'error');
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
      loadUsers();
      showNotification('User deleted successfully');
    }
  };

  const getRewardIcon = (type) => {
    switch(type) {
      case 'junkfood': return '🍟';
      case 'drinks': return '🥤';
      case 'sweets': return '🍰';
      case 'fastfood': return '🍔';
      default: return '🎁';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="admin-container">
      {notification && (
        <div className={`admin-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="admin-header">
        <button className="admin-back-btn" onClick={onBack}>← Back</button>
        <h1>Admin Panel</h1>
        <button className="admin-logout-btn" onClick={onLogout}>Logout</button>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <span>⏳</span>
          <h3>{pendingRewards.length}</h3>
          <p>Pending Rewards</p>
        </div>
        <div className="admin-stat-card">
          <span>✅</span>
          <h3>{approvedRewards.length}</h3>
          <p>Approved Rewards</p>
        </div>
        <div className="admin-stat-card">
          <span>👥</span>
          <h3>{usersList.length}</h3>
          <p>Total Users</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Rewards ({pendingRewards.length})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved Rewards
        </button>
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="admin-rewards-list">
          {pendingRewards.length === 0 ? (
            <div className="empty-state">
              <span>🎉</span>
              <p>No pending rewards! All caught up!</p>
            </div>
          ) : (
            pendingRewards.map(reward => (
              <div key={reward.id} className="reward-request-card">
                <div className="reward-header">
                  <span className="reward-icon">{getRewardIcon(reward.type)}</span>
                  <div className="reward-info">
                    <h3>{reward.selection}</h3>
                    <p>Player: <strong>{reward.playerName}</strong></p>
                    <p>Difficulty: {reward.difficulty?.toUpperCase()}</p>
                    <p>Time: {formatTime(reward.time)}</p>
                    <p>Date: {formatDate(reward.date)}</p>
                  </div>
                </div>
                <div className="reward-actions">
                  <button 
                    className="approve-btn"
                    onClick={() => handleApproveReward(reward)}
                  >
                    ✅ Approve
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleRejectReward(reward)}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'approved' && (
        <div className="admin-rewards-list">
          {approvedRewards.length === 0 ? (
            <div className="empty-state">
              <span>📋</span>
              <p>No approved rewards yet</p>
            </div>
          ) : (
            approvedRewards.map(reward => (
              <div key={reward.id} className="reward-request-card approved">
                <div className="reward-header">
                  <span className="reward-icon">{getRewardIcon(reward.type)}</span>
                  <div className="reward-info">
                    <h3>{reward.selection}</h3>
                    <p>Player: <strong>{reward.playerName}</strong></p>
                    <p>Approved by: {reward.approvedBy}</p>
                    <p>Approved at: {formatDate(reward.approvedAt)}</p>
                  </div>
                </div>
                <div className="approved-badge">
                  ✅ Approved
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-users-list">
          <div className="users-header">
            <h3>Registered Users</h3>
          </div>
          <div className="users-table">
            {usersList.map(userItem => (
              <div key={userItem.id} className="user-row">
                <div className="user-info">
                  <span className="user-avatar">👤</span>
                  <div>
                    <div className="user-name">{userItem.username}</div>
                    <div className="user-meta">
                      Joined: {formatDate(userItem.createdAt)}
                    </div>
                  </div>
                </div>
                <button 
                  className="delete-user-btn"
                  onClick={() => handleDeleteUser(userItem.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default AdminPanel;