// GlobalLeaderboard.js
import React, { useState, useEffect } from 'react';
import { getGlobalLeaderboard, getGlobalStatistics, subscribeToGlobalLeaderboard } from './firebase';
import './GlobalLeaderboard.css';

function GlobalLeaderboard({ onClose }) {
  const [leaderboard, setLeaderboard] = useState({
    easy: [],
    medium: [],
    hard: [],
    expert: []
  });
  const [globalStats, setGlobalStats] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadLeaderboard();
    loadGlobalStats();
    
    const unsubscribe = subscribeToGlobalLeaderboard((updatedLeaderboard) => {
      setLeaderboard(updatedLeaderboard);
      setLastUpdate(new Date());
    });
    
    return () => unsubscribe();
  }, []);

  const loadLeaderboard = async () => {
    const result = await getGlobalLeaderboard();
    if (result.success) {
      setLeaderboard(result.data);
    }
    setLoading(false);
  };

  const loadGlobalStats = async () => {
    const result = await getGlobalStatistics();
    if (result.success) {
      setGlobalStats(result.data);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMedalIcon = (rank) => {
    switch(rank) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${rank + 1}`;
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch(difficulty) {
      case 'easy': return '🌟';
      case 'medium': return '⭐';
      case 'hard': return '💪';
      case 'expert': return '👑';
      default: return '🎯';
    }
  };

  const getPrizeEmoji = (prize) => {
    if (!prize) return '🎁';
    if (prize.includes('🍟')) return '🍟';
    if (prize.includes('🍿')) return '🍿';
    if (prize.includes('🥨')) return '🥨';
    if (prize.includes('🥤')) return '🥤';
    if (prize.includes('🧋')) return '🧋';
    if (prize.includes('☕')) return '☕';
    if (prize.includes('🍰')) return '🍰';
    if (prize.includes('🍪')) return '🍪';
    if (prize.includes('🍩')) return '🍩';
    if (prize.includes('🍦')) return '🍦';
    if (prize.includes('🍔')) return '🍔';
    if (prize.includes('Jollibee')) return '🍗';
    if (prize.includes('McDonald')) return '🍟';
    if (prize.includes('Mang Inasal')) return '🍗';
    if (prize.includes('Chowking')) return '🥟';
    if (prize.includes('MadChick')) return '🍗';
    return '🎁';
  };

  const renderLeaderboardTable = (difficulty) => {
    const scores = leaderboard[difficulty] || [];
    
    if (scores.length === 0) {
      return (
        <div className="empty-leaderboard">
          <span>🏆</span>
          <p>No scores yet for {difficulty} mode</p>
          <p className="sub-text">Be the first to set a record!</p>
        </div>
      );
    }

    return (
      <div className="leaderboard-table">
        <div className="table-header">
          <div className="rank-col">Rank</div>
          <div className="player-col">Player</div>
          <div className="time-col">Time</div>
          <div className="prize-col">Prize Won</div>
          <div className="perfect-col">Perfect</div>
        </div>
        {scores.map((entry, index) => (
          <div key={entry.id} className={`table-row ${entry.perfectGame ? 'perfect-row' : ''}`}>
            <div className="rank-col">
              {index < 3 ? getMedalIcon(index) : `${index + 1}`}
            </div>
            <div className="player-col">
              <span className="player-name">{entry.name}</span>
              {entry.perfectGame && <span className="perfect-badge">🎯</span>}
            </div>
            <div className="time-col">
              <span className="time-value">{formatTime(entry.time)}</span>
            </div>
            <div className="prize-col">
              {entry.prize ? (
                <span className="prize-badge" title={entry.prize}>
                  {getPrizeEmoji(entry.prize)} {entry.prize.length > 20 ? entry.prize.substring(0, 15) + '...' : entry.prize}
                </span>
              ) : (
                <span className="no-prize">—</span>
              )}
            </div>
            <div className="perfect-col">
              {entry.perfectGame ? '✅' : '❌'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAllDifficulties = () => {
    const difficulties = ['easy', 'medium', 'hard', 'expert'];
    return (
      <div className="all-difficulties">
        {difficulties.map(diff => (
          <div key={diff} className="difficulty-section">
            <div className="difficulty-header">
              <span className="difficulty-icon">{getDifficultyIcon(diff)}</span>
              <h3>{diff.toUpperCase()}</h3>
              <span className="difficulty-record">
                Record: {leaderboard[diff]?.[0] ? formatTime(leaderboard[diff][0].time) : '--:--'}
              </span>
            </div>
            {renderLeaderboardTable(diff)}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="global-leaderboard-overlay">
        <div className="global-leaderboard-card">
          <div className="loading-spinner"></div>
          <p>Loading global leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="global-leaderboard-overlay" onClick={onClose}>
      <div className="global-leaderboard-card" onClick={(e) => e.stopPropagation()}>
        <div className="leaderboard-header-global">
          <div className="header-left">
            <span className="globe-icon">🌍</span>
            <h2>Global Leaderboard</h2>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {globalStats && (
          <div className="global-stats">
            <div className="stat-item">
              <span className="stat-icon">👥</span>
              <div>
                <div className="stat-value">{globalStats.totalPlayers}</div>
                <div className="stat-label">Total Players</div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎮</span>
              <div>
                <div className="stat-value">{globalStats.totalGames}</div>
                <div className="stat-label">Games Played</div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎯</span>
              <div>
                <div className="stat-value">{globalStats.totalPerfectGames}</div>
                <div className="stat-label">Perfect Games</div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <div>
                <div className="stat-value">{globalStats.totalPoints.toLocaleString()}</div>
                <div className="stat-label">Total Points</div>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎁</span>
              <div>
                <div className="stat-value">
                  {Object.values(leaderboard).flat().filter(e => e.prize).length}
                </div>
                <div className="stat-label">Prizes Won</div>
              </div>
            </div>
          </div>
        )}

        <div className="world-records">
          <h3>🌍 World Records 🌍</h3>
          <div className="records-grid">
            <div className="record-card easy-record">
              <span>🌟 EASY</span>
              <span className="record-time">{globalStats?.records?.easy?.time ? formatTime(globalStats.records.easy.time) : '--:--'}</span>
              <span className="record-player">by {globalStats?.records?.easy?.player || 'No one yet'}</span>
            </div>
            <div className="record-card medium-record">
              <span>⭐ MEDIUM</span>
              <span className="record-time">{globalStats?.records?.medium?.time ? formatTime(globalStats.records.medium.time) : '--:--'}</span>
              <span className="record-player">by {globalStats?.records?.medium?.player || 'No one yet'}</span>
            </div>
            <div className="record-card hard-record">
              <span>💪 HARD</span>
              <span className="record-time">{globalStats?.records?.hard?.time ? formatTime(globalStats.records.hard.time) : '--:--'}</span>
              <span className="record-player">by {globalStats?.records?.hard?.player || 'No one yet'}</span>
            </div>
            <div className="record-card expert-record">
              <span>👑 EXPERT</span>
              <span className="record-time">{globalStats?.records?.expert?.time ? formatTime(globalStats.records.expert.time) : '--:--'}</span>
              <span className="record-player">by {globalStats?.records?.expert?.player || 'No one yet'}</span>
            </div>
          </div>
        </div>

        <div className="difficulty-selector">
          <button 
            className={`diff-btn ${selectedDifficulty === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty('all')}
          >
            All Difficulties
          </button>
          <button 
            className={`diff-btn ${selectedDifficulty === 'easy' ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty('easy')}
          >
            🌟 Easy
          </button>
          <button 
            className={`diff-btn ${selectedDifficulty === 'medium' ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty('medium')}
          >
            ⭐ Medium
          </button>
          <button 
            className={`diff-btn ${selectedDifficulty === 'hard' ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty('hard')}
          >
            💪 Hard
          </button>
          <button 
            className={`diff-btn ${selectedDifficulty === 'expert' ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty('expert')}
          >
            👑 Expert
          </button>
        </div>

        <div className="leaderboard-content">
          {selectedDifficulty === 'all' ? (
            renderAllDifficulties()
          ) : (
            <div className="single-difficulty">
              <div className="difficulty-header">
                <span className="difficulty-icon">{getDifficultyIcon(selectedDifficulty)}</span>
                <h3>{selectedDifficulty.toUpperCase()} MODE</h3>
                <span className="total-players">{leaderboard[selectedDifficulty]?.length || 0} players</span>
              </div>
              {renderLeaderboardTable(selectedDifficulty)}
            </div>
          )}
        </div>

        <div className="leaderboard-footer">
          <div className="update-time">
            <span>🔄 Last update: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <div className="live-badge">
            <span className="live-dot"></span>
            Live Updates
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlobalLeaderboard;