// FirebaseAdminPanel.js
import React, { useState, useEffect } from 'react';
import { 
  getPendingRewards, 
  approveReward, 
  rejectReward,
  getLeaderboard,
  subscribeToRewards
} from './firebase';
import { useAuth } from './FirebaseAuthContext';
import './AdminPanel.css';

function FirebaseAdminPanel({ onBack, onLogout }) {
  const { user } = useAuth();
  const [pendingRewards, setPendingRewards] = useState([]);
  const [approvedRewards, setApprovedRewards] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [leaderboard, setLeaderboard] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingRewards();
    loadLeaderboard();
    
    // Real-time subscription for rewards
    const unsubscribe = subscribeToRewards((allRewards) => {
      const pending = allRewards.filter(r => r.status === 'pending');
      const approved = allRewards.filter(r => r.status === 'approved');
      setPendingRewards(pending);
      setApprovedRewards(approved);
    });
    
    return () => unsubscribe();
  }, []);

  const loadPendingRewards = async () => {
    const result = await getPendingRewards();
    if (result.success) {
      const pending = result.data.filter(r => r.status === 'pending');
      const approved = result.data.filter(r => r.status === 'approved');
      setPendingRewards(pending);
      setApprovedRewards(approved);
    }
    setLoading(false);
  };

  const loadLeaderboard = async () => {
    const result = await getLeaderboard();
    if (result.success) {
      setLeaderboard(result.data);
    }
  };

  const handleApproveReward = async (reward) => {
    const result = await approveReward(reward.id, user?.username || 'admin');
    if (result.success) {
      alert(`Reward "${reward.selection}" approved!`);
    } else {
      alert('Error approving reward: ' + result.error);
    }
  };

  const handleRejectReward = async (reward) => {
    const result = await rejectReward(reward.id, user?.username || 'admin');
    if (result.success) {
      alert(`Reward "${reward.selection}" rejected!`);
    } else {
      alert('Error rejecting reward: ' + result.error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
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

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <button className="admin-back-btn" onClick={onBack}>← Back</button>
        <h1>Admin Panel ☁️</h1>
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
          <span>☁️</span>
          <h3>Cloud</h3>
          <p>Real-time Sync</p>
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
          className={`admin-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Global Leaderboard
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
                    <p>Date: {formatDate(reward.createdAt)}</p>
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

      {activeTab === 'leaderboard' && (
        <div className="admin-leaderboard">
          {['easy', 'medium', 'hard', 'expert'].map(diff => (
            <div key={diff} className="leaderboard-section">
              <h3>{diff.toUpperCase()}</h3>
              <div className="leaderboard-entries">
                {leaderboard[diff]?.slice(0, 10).map((entry, idx) => (
                  <div key={entry.id} className="leaderboard-entry">
                    <span className="rank">{idx + 1}</span>
                    <span className="player-name">{entry.name}</span>
                    <span className="player-time">{formatTime(entry.time)}</span>
                    {entry.perfectGame && <span className="perfect-badge">🎯</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FirebaseAdminPanel;