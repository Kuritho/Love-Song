import React, { useState, useRef, useEffect } from 'react';
import './VideosGallery.css';

const VideosGallery = ({ onBack }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoError, setVideoError] = useState({});
  const videoRefs = useRef({});

  // Sample videos data with thumbnails
  const videos = [
    {
      id: 1,
      videoUrl: "/videos/1.mp4",
      thumbnail: "/thumbnails/1.jpg",
      title: "",
      description: ""
    },
    {
      id: 2,
      videoUrl: "/videos/2.mp4",
      thumbnail: "/thumbnails/2.jpg",
      title: "",
      description: ""
    },
    {
      id: 3,
      videoUrl: "/videos/3.mp4",
      thumbnail: "/thumbnails/3.jpg",
      title: "",
      description: ""
    },
    {
      id: 4,
      videoUrl: "/videos/4.mp4",
      thumbnail: "/thumbnails/4.jpg",
      title: "",
      description: ""
    },
    {
      id: 5,
      videoUrl: "/videos/5.mp4",
      thumbnail: "/thumbnails/5.jpg",
      title: "",
      description: ""
    },
    {
      id: 6,
      videoUrl: "/videos/6.mp4",
      thumbnail: "/thumbnails/6.jpg",
      title: "",
      description: ""
    }
  ];

  // Function to generate thumbnails dynamically (fallback)
  const generateThumbnail = (videoId) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    const emojis = ['🎬', '📹', '🎥', '📱', '🌟', '💫', '✨', '🎞️', '🎭', '🎪'];
    
    return (
      <div 
        className="thumbnail-placeholder"
        style={{ backgroundColor: colors[(videoId - 1) % colors.length] }}
      >
        <span className="thumbnail-emoji">{emojis[(videoId - 1) % emojis.length]}</span>
        <span className="thumbnail-text">Video {videoId}</span>
      </div>
    );
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setVideoError(prev => ({ ...prev, [video.id]: false }));
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
    // Pause all videos when closing modal
    Object.values(videoRefs.current).forEach(ref => {
      if (ref && ref.pause) ref.pause();
    });
  };

  const handleVideoError = (videoId) => {
    console.error(`Failed to load video: ${videoId}`);
    setVideoError(prev => ({ ...prev, [videoId]: true }));
  };

  const handleVideoLoad = (videoId) => {
    setVideoError(prev => ({ ...prev, [videoId]: false }));
  };

  return (
    <div className="videos-gallery-container">
      {/* Enhanced Background */}
      <div className="gallery-background">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="floating-film"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              fontSize: `${Math.random() * 20 + 16}px`
            }}
          >{['🎬', '📹', '🎥', '📱', '🌟'][Math.floor(Math.random() * 5)]}</div>
        ))}
      </div>

      <div className="gallery-content">
        <button className="back-btn-gallery" onClick={onBack}>
          ← Back to Our Story
        </button>

        <div className="gallery-header">
          <h1>Our Video Memories 🎥</h1>
          <p className="gallery-subtitle">Relive our special moments together</p>
        </div>

        {/* Videos Grid */}
        <div className="videos-grid">
          {videos.map((video) => (
            <div
              key={video.id}
              className="video-card"
              onClick={() => handleVideoClick(video)}
            >
              <div className="video-thumbnail-container">
                {/* Try to load thumbnail image, fallback to generated thumbnail */}
                {video.thumbnail && !videoError[video.id] ? (
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="video-thumbnail"
                    onError={() => handleVideoError(video.id)}
                    onLoad={() => handleVideoLoad(video.id)}
                  />
                ) : (
                  generateThumbnail(video.id)
                )}
                <div className="video-overlay">
                  <div className="video-play-icon">▶</div>
                  <div className="video-info-overlay">
                    <div className="video-title">{video.title}</div>
                    <div className="video-description">{video.description}</div>
                  </div>
                </div>
                <div className="video-duration">1:23</div>
              </div>
            </div>
          ))}
        </div>

        {/* <div className="gallery-message">
          <div className="message-card">
            <h3>To My Dearest Jasmine, Sweetheart!</h3>
            <p>
              Every video here captures a piece of our beautiful journey together. 
              From our laughter-filled moments to our quiet, intimate conversations, 
              each frame tells a story of our growing love. These videos are my most 
              treasured possessions because they capture the real you - your smile, 
              your laughter, your beautiful soul. I love watching these memories and 
              remembering every precious second we've shared. Can't wait to create 
              many more videos with you! 🎥💖
            </p>
            <div className="message-signature">
              Forever capturing our moments, <span>Daddy Kurt</span>
            </div>
          </div>
        </div> */}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="video-modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={handleCloseModal}>×</button>
            
            <div className="modal-header">
              <h2>{selectedVideo.title}</h2>
              <p className="modal-description">{selectedVideo.description}</p>
            </div>

            <div className="video-player-container">
              <video 
                ref={el => videoRefs.current[selectedVideo.id] = el}
                controls 
                autoPlay
                className="video-player"
                onError={() => handleVideoError(selectedVideo.id)}
                playsInline // Important for mobile
                webkit-playsinline="true" // For iOS
                preload="metadata"
              >
                <source src={selectedVideo.videoUrl} type="video/mp4" />
                <source src={selectedVideo.videoUrl.replace('.mp4', '.webm')} type="video/webm" />
                Your browser does not support the video tag.
              </video>
              
              {videoError[selectedVideo.id] && (
                <div className="video-error">
                  <p>⚠️ Unable to load video</p>
                  <p className="error-help">
                    Make sure your video file exists at: <br />
                    <strong>public{selectedVideo.videoUrl}</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="back-to-gallery-btn" onClick={handleCloseModal}>
                ← Back to Gallery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosGallery;