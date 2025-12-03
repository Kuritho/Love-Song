import React, { useState, useRef, useEffect } from 'react';
import './LoveSong.css';

const LoveSong = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visualizer, setVisualizer] = useState([]);
  const audioRef = useRef(null);

  // Your custom song data
  const ourSong = {
    id: 1,
    title: "My Last Girl",
    file: "/music/my-last-girl.mp3", // Path to your song file
    artist: "Composed by Kurt",
    dedication: "For My Beautiful Jasmine"
  };

  useEffect(() => {
    // Generate visualizer bars
    setVisualizer(Array.from({ length: 30 }, () => 
      Math.floor(Math.random() * 60) + 20
    ));

    // Set up audio event listeners
    const audio = audioRef.current;
    
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = (e) => {
      setIsLoading(false);
      setError('Failed to load the song. Please check if the file exists in the public/music folder.');
      console.error('Audio error:', e);
    };

    if (audio) {
      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('error', handleError);
    }

    return () => {
      if (audio) {
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error('Play failed:', error);
          setError('Failed to play the song. Please check your audio file.');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      
      // Animate visualizer when playing
      if (isPlaying) {
        setVisualizer(prev => prev.map(() => 
          Math.floor(Math.random() * 60) + 20
        ));
      }
    }
  };

  const handleProgressClick = (e) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * duration;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const restartSong = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (!isPlaying) {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="enhanced-song-container">
      {/* Animated Visualizer Background */}
      <div className="visualizer-bg">
        {visualizer.map((height, index) => (
          <div 
            key={index}
            className="visualizer-bar"
            style={{ 
              height: `${isPlaying ? height : 10}%`,
              animationDelay: `${index * 0.1}s`
            }}
          ></div>
        ))}
      </div>

      <div className="enhanced-song-content">
        <button className="back-btn" onClick={onBack}>
          ← Back to Our Story
        </button>

        <div className="song-header">
          <h1>Our Special Song 🎵</h1>
          <p className="song-subtitle">A melody created just for us</p>
        </div>

        <div className="song-info">
          <h2 className="song-title-main">{ourSong.title}</h2>
          <p className="song-artist-main">{ourSong.artist}</p>
        </div>

        <div className="music-player">
          <div className="album-art-container">
            <div className={`rotating-album ${isPlaying ? 'playing' : ''}`}>
              <div className="album-cover">
                <span>For My Jasmine</span>
                <div className="heart-icon">💕</div>
              </div>
              <div className="vinyl-disc"></div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
              <p className="error-help">
                Make sure your song file is located at: <strong>public/music/our-song.mp3</strong>
              </p>
            </div>
          )}

          {isLoading && (
            <div className="loading-message">
              ⏳ Loading your special song...
            </div>
          )}

          <div className="player-controls">
            <div className="progress-bar" onClick={handleProgressClick}>
              <div 
                className="progress-fill"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              ></div>
            </div>
            <div className="time-display">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="control-buttons">
              <button className="control-btn" onClick={skipBackward} title="Skip Back 10s">
                ⏪
              </button>
              <button className="control-btn" onClick={restartSong} title="Restart">
                🔄
              </button>
              <button 
                className="play-pause-btn" 
                onClick={handlePlayPause} 
                disabled={isLoading}
              >
                {isLoading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
              </button>
              <button className="control-btn" onClick={skipForward} title="Skip Forward 10s">
                ⏩
              </button>
            </div>

            <div className="volume-control">
              <span className="volume-icon">🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
              <span className="volume-percent">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="song-dedication">
          <div className="dedication-card">
            <h3>My Last Girl - Lyics</h3>
            <p>
You’re lost in your thoughts again, Sweetheart, I can see,
Those little storms inside your head, they’re tearing at your peace.
You talk about your past, and yeah, it cuts me deep,
But I bite my tongue, I hold you close, 'cause your heart’s what I want to keep. </p>

<p>Even when time pulls us apart 
You in your books, me chasing stars 
I’ll find a way to reach your heart,
To let you know who you are...</p>

<p>Jasmine, you’re my reason, you’re my calm and my world,
Even when the nights get heavy, you’re still my only girl.
I’ll take the pain, I’ll take the fight,
Just to see you sleep in peace tonight.
Someday I’ll treat you like a princess in my world
You’re my forever, my last girl. </p>

<p>You call me “Dy,” and I smile through the ache,
Hiding the pieces that your memories break.
But love’s not easy, it’s patient, it’s real,
I’ll wait for the moment your scars start to heal.</p>

<p>Even if the clocks don’t sync,
We’ll meet between the time we blink,
You study dreams, I chase the bills,
But our hearts, they know the deal.</p>

<p>Jasmine, you’re my reason, you’re my calm and my world,
Even when the nights get heavy, you’re still my only girl.
I’ll take the pain, I’ll take the fight,
Just to see you sleep in peace tonight.
Someday I’ll treat you like a princess in my world
You’re my forever, my last girl.</p>

<p>When your mind starts to run away,
Baby, I’ll be the place you stay.
You don’t have to face those fears alone
I’ll be your safe, your steady home.</p>

<p>Jasmine, my Sweetheart, you’re the dream I hold,
Through every story we’ve yet to be told.
From the sleepless nights to the wedding bells,
I’ll love you deeper than words can tell.
Someday I’ll treat you like a princess in my world
You’re my forever, my last girl.</p>

<p>Yeah, my Jasmine Roque, my heart’s own pearl,
You’re my forever...
my last girl.
            </p>
            <div className="composer-note">
              <strong>Personal Note:</strong> This song was specially composed and created just for you.
            </div>
          </div>
        </div>

        {/* Audio Element with Mobile Support */}
        <audio 
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          preload="metadata"
          // Mobile-specific attributes
          playsInline
          webkit-playsinline="true"
          crossOrigin="anonymous"
        >
          <source src={ourSong.file} type="audio/mpeg" />
          <source src={ourSong.file.replace('.mp3', '.wav')} type="audio/wav" />
          Your browser does not support the audio element.
        </audio>

        {/* <div className="mobile-note">
          <p>💡 <strong>Mobile Tip:</strong> Make sure your device isn't on silent mode for the best audio experience.</p>
        </div> */}
      </div>
    </div>
  );
};

export default LoveSong;