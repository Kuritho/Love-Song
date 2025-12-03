import React, { useState } from 'react';
import './PhotosGallery.css';

const PhotosGallery = ({ onBack }) => {
  const [selectedAdventure, setSelectedAdventure] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState({});

  // Sample adventures with actual picture placeholders
  const adventures = [
    {
      id: 1,
      title: "Our First Date 💖",
      description: "The magical beginning of our beautiful journey",
      photos: [
        { 
          id: 1, 
          image: "/images/first-date/1.jpg", 
          placeholder: "📸",
          color: "linear-gradient(45deg, #ff6b6b, #ff8e8e)", 
        //   caption: "Coffee shop where it all began" 
        },
        { 
          id: 2, 
          image: "/images/first-date/2.jpg", 
          placeholder: "😊",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "First smiles and nervous laughter" 
        },
        { 
          id: 3, 
          image: "/images/first-date/3.jpg", 
          placeholder: "🌟",
          color: "linear-gradient(45deg, #ffd93d, #ff9a3d)", 
        //   caption: "Walking under the stars" 
        },
        { 
          id: 4, 
          image: "/images/first-date/4.jpg", 
          placeholder: "💕",
          color: "linear-gradient(45deg, #a166ab, #5073b8)", 
        //   caption: "That unforgettable goodnight" 
        },
        { 
          id: 5, 
          image: "/images/first-date/5.jpg", 
          placeholder: "📱",
          color: "linear-gradient(45deg, #6bcf7f, #4ca1af)", 
        //   caption: "First text after the date" 
        },
        { 
          id: 6, 
          image: "/images/first-date/6.jpg", 
          placeholder: "🎉",
          color: "linear-gradient(45deg, #ff9a9e, #fad0c4)", 
        //   caption: "Celebrating our first moments" 
        }
      ]
    },
    {
      id: 2,
      title: "Cafe Moments ☕",
      description: "Warm conversations over steaming cups of coffee",
      photos: [
        { 
          id: 1, 
          image: "/images/cafe-moments/1.jpg", 
          placeholder: "🏙️",
          color: "linear-gradient(45deg, #667eea, #764ba2)", 
        //   caption: "Morning coffee downtown" 
        },
        { 
          id: 2, 
          image: "/images/cafe-moments/2.jpg", 
          placeholder: "📚",
          color: "linear-gradient(45deg, #f093fb, #f5576c)", 
        //   caption: "Studying together at our spot" 
        },
        { 
          id: 3, 
          image: "/images/cafe-moments/3.jpg", 
          placeholder: "🌧️",
          color: "linear-gradient(45deg, #4facfe, #00f2fe)", 
        //   caption: "Rainy day coffee dates" 
        },
        { 
          id: 4, 
          image: "/images/cafe-moments/4.jpg", 
          placeholder: "🎨",
          color: "linear-gradient(45deg, #43e97b, #38f9d7)", 
        //   caption: "Creative conversations" 
        },
        { 
          id: 5, 
          image: "/images/cafe-moments/5.jpg", 
          placeholder: "🌅",
          color: "linear-gradient(45deg, #fa709a, #fee140)", 
        //   caption: "Sunrise coffee sessions" 
        },
        { 
          id: 6, 
          image: "/images/cafe-moments/6.jpg", 
          placeholder: "💭",
          color: "linear-gradient(45deg, #a8edea, #fed6e3)", 
        //   caption: "Deep thoughts and dreams" 
        },
        { 
          id: 7, 
          image: "/images/cafe-moments/7.jpg", 
          placeholder: "🤣",
          color: "linear-gradient(45deg, #ffecd2, #fcb69f)", 
        //   caption: "Laughter that fills the cafe" 
        }
      ]
    },
    {
      id: 3,
      title: "Rides Adventures 🌅",
      description: "Chasing sunsets and creating golden memories",
      photos: [
        { 
          id: 1, 
          image: "/images/rides-adventures/1.jpg", 
          placeholder: "🏖️",
          color: "linear-gradient(45deg, #ff6b6b, #ff8e8e)", 
        //   caption: "Beach sunset hand in hand" 
        },
        { 
          id: 2, 
          image: "/images/rides-adventures/2.jpg", 
          placeholder: "🌄",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Mountain view sunset" 
        },
        { 
          id: 3, 
          image: "/images/rides-adventures/3.jpg", 
          placeholder: "🚗",
          color: "linear-gradient(45deg, #ffd93d, #ff9a3d)", 
        //   caption: "Road trip sunset chasing" 
        },
        { 
          id: 4, 
          image: "/images/rides-adventures/4.jpg", 
          placeholder: "🏞️",
          color: "linear-gradient(45deg, #a166ab, #5073b8)", 
        //   caption: "Park bench sunset moments" 
        },
        { 
          id: 5, 
          image: "/images/rides-adventures/5.jpg", 
          placeholder: "📸",
          color: "linear-gradient(45deg, #6bcf7f, #4ca1af)", 
        //   caption: "Golden hour photoshoot" 
        },
        { 
          id: 6, 
          image: "/images/rides-adventures/6.jpg", 
          placeholder: "🌇",
          color: "linear-gradient(45deg, #ff9a9e, #fad0c4)", 
        //   caption: "City skyline at dusk" 
        },
        { 
          id: 7, 
          image: "/images/rides-adventures/7.jpg", 
          placeholder: "🔥",
          color: "linear-gradient(45deg, #667eea, #764ba2)", 
        //   caption: "Bonfire sunset stories" 
        },
        { 
          id: 8, 
          image: "/images/rides-adventures/8.jpg", 
          placeholder: "💫",
          color: "linear-gradient(45deg, #f093fb, #f5576c)", 
        //   caption: "First stars appearing" 
        },
        { 
          id: 9, 
          image: "/images/rides-adventures/9.jpg", 
          placeholder: "💫",
          color: "linear-gradient(45deg, #f093fb, #f5576c)", 
        //   caption: "First stars appearing" 
        }
      ]
    },
    {
      id: 4,
      title: "Duo Moments",
      description: "When we can't stop laughing together",
      photos: [
        { 
          id: 1, 
          image: "/images/laughter-times/1.jpg", 
          placeholder: "🎭",
          color: "linear-gradient(45deg, #4facfe, #00f2fe)", 
        //   caption: "Funny faces and silly moments" 
        },
        { 
          id: 2, 
          image: "/images/laughter-times/2.jpg", 
          placeholder: "🍦",
          color: "linear-gradient(45deg, #43e97b, #38f9d7)", 
        //   caption: "Ice cream mishaps and giggles" 
        },
        { 
          id: 3, 
          image: "/images/laughter-times/3.jpg", 
          placeholder: "🎮",
          color: "linear-gradient(45deg, #fa709a, #fee140)", 
        //   caption: "Gaming nights full of laughter" 
        },
        { 
          id: 4, 
          image: "/images/laughter-times/4.jpg", 
          placeholder: "📽️",
          color: "linear-gradient(45deg, #a8edea, #fed6e3)", 
        //   caption: "Movie nights with endless jokes" 
        },
        { 
          id: 5, 
          image: "/images/laughter-times/5.jpg", 
          placeholder: "🃏",
          color: "linear-gradient(45deg, #ffecd2, #fcb69f)", 
        //   caption: "Card games and funny bets" 
        },
        { 
          id: 6, 
          image: "/images/laughter-times/6.jpg", 
          placeholder: "🤪",
          color: "linear-gradient(45deg, #ff6b6b, #ff8e8e)", 
        //   caption: "Goofy dance parties" 
        },
        { 
          id: 7, 
          image: "/images/laughter-times/7.jpg", 
          placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 8, 
          image: "/images/laughter-times/8.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 9, 
          image: "/images/laughter-times/9.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 10, 
          image: "/images/laughter-times/10.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 11, 
          image: "/images/laughter-times/11.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 12, 
          image: "/images/laughter-times/12.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 13, 
          image: "/images/laughter-times/13.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 14, 
          image: "/images/laughter-times/14.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 15, 
          image: "/images/laughter-times/15.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 16, 
          image: "/images/laughter-times/16.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 17, 
          image: "/images/laughter-times/17.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 18, 
          image: "/images/laughter-times/18.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 19, 
          image: "/images/laughter-times/19.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 20, 
          image: "/images/laughter-times/20.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 21, 
          image: "/images/laughter-times/21.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 22, 
          image: "/images/laughter-times/22.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 23, 
          image: "/images/laughter-times/23.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 24, 
          image: "/images/laughter-times/24.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 25, 
          image: "/images/laughter-times/25.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 26, 
          image: "/images/laughter-times/26.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 27, 
          image: "/images/laughter-times/27.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 28, 
          image: "/images/laughter-times/28.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 29, 
          image: "/images/laughter-times/29.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 30, 
          image: "/images/laughter-times/30.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        },
        { 
          id: 31, 
          image: "/images/laughter-times/31.jpg", 
        //   placeholder: "🎤",
          color: "linear-gradient(45deg, #4ecdc4, #44a08d)", 
        //   caption: "Karaoke fails and fun" 
        }
      ]
    }
  ];

  const handleAdventureClick = (adventure) => {
    setSelectedAdventure(adventure);
    setCurrentPhotoIndex(0);
    setImageLoaded({});
  };

  const nextPhoto = () => {
    if (selectedAdventure) {
      setCurrentPhotoIndex(prev => 
        prev === selectedAdventure.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPhoto = () => {
    if (selectedAdventure) {
      setCurrentPhotoIndex(prev => 
        prev === 0 ? selectedAdventure.photos.length - 1 : prev - 1
      );
    }
  };

  const handleImageLoad = (adventureId, photoId) => {
    setImageLoaded(prev => ({
      ...prev,
      [`${adventureId}-${photoId}`]: true
    }));
  };

  const handleImageError = (adventureId, photoId) => {
    setImageLoaded(prev => ({
      ...prev,
      [`${adventureId}-${photoId}`]: false
    }));
  };

  const isImageLoaded = (adventureId, photoId) => {
    return imageLoaded[`${adventureId}-${photoId}`];
  };

  const handleThumbnailClick = (index) => {
    setCurrentPhotoIndex(index);
  };

  return (
    <div className="photos-gallery-container">
      {/* Animated Background */}
      <div className="gallery-background">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="floating-heart-gallery"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              fontSize: `${Math.random() * 20 + 16}px`
            }}
          >💖</div>
        ))}
      </div>

      <div className="gallery-content">
        <button className="back-btn-gallery" onClick={onBack}>
          ← Back to Our Story
        </button>

        <div className="gallery-header">
          <h1>Our Beautiful Adventures 📸</h1>
          <p className="gallery-subtitle">A collection of our precious moments together</p>
        </div>

        {/* Adventures Grid */}
        <div className="adventures-grid">
          {adventures.map((adventure) => (
            <div
              key={adventure.id}
              className="adventure-card"
              onClick={() => handleAdventureClick(adventure)}
            >
              <div className="adventure-preview">
                <div className="preview-photos">
                  {adventure.photos.slice(0, 4).map((photo, index) => {
                    const isLoaded = isImageLoaded(adventure.id, photo.id);
                    return (
                      <div
                        key={photo.id}
                        className="preview-photo"
                        style={{ 
                          background: photo.color,
                          transform: `rotate(${index % 2 === 0 ? -3 : 3}deg)`,
                          zIndex: 4 - index
                        }}
                      >
                        {isLoaded === true ? (
                          <img 
                            src={photo.image} 
                            alt={photo.caption}
                            className="preview-image"
                          />
                        ) : (
                          <div className="preview-placeholder">
                            {photo.placeholder}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="photo-count">
                  +{adventure.photos.length} photos
                </div>
              </div>
              
              <div className="adventure-info">
                <h3>{adventure.title}</h3>
                <p>{adventure.description}</p>
                <div className="adventure-stats">
                  <span className="stat">
                    📸 {adventure.photos.length} moments
                  </span>
                </div>
              </div>
              
              <div className="adventure-overlay">
                <span>View Adventure</span>
              </div>
            </div>
          ))}
        </div>

        <div className="gallery-message">
          <div className="message-card">
            <h3>To My Dearest Jasmine, Sweetheart!</h3>
            <p>
              Every adventure with you becomes a chapter in our beautiful love story. 
              From our first nervous date to dreaming about our future together, 
              each moment captured here represents the incredible journey we're on. 
              These photos are more than just images - they're memories of laughter, 
              love, and the special bond we share. I cherish every single moment with you 
              and can't wait to fill many more albums with our adventures! 📷💖
            </p>
            <div className="message-signature">
              Forever yours, <span>Daddy Kurt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Adventure Modal */}
      {selectedAdventure && (
        <div className="adventure-modal" onClick={() => setSelectedAdventure(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedAdventure(null)}>×</button>
            
            <div className="modal-header">
              <h2>{selectedAdventure.title}</h2>
              <p className="modal-description">{selectedAdventure.description}</p>
              <div className="photo-counter">
                Photo {currentPhotoIndex + 1} of {selectedAdventure.photos.length}
              </div>
            </div>

            <div className="photo-viewer">
              <button className="nav-btn prev-btn" onClick={prevPhoto}>‹</button>
              
              <div className="current-photo-container">
                <div className="current-photo">
                  <img 
                    src={selectedAdventure.photos[currentPhotoIndex].image}
                    alt={selectedAdventure.photos[currentPhotoIndex].caption}
                    className="main-photo-image"
                    onLoad={() => handleImageLoad(selectedAdventure.id, selectedAdventure.photos[currentPhotoIndex].id)}
                    onError={() => handleImageError(selectedAdventure.id, selectedAdventure.photos[currentPhotoIndex].id)}
                  />
                  {!isImageLoaded(selectedAdventure.id, selectedAdventure.photos[currentPhotoIndex].id) && (
                    <div 
                      className="image-placeholder-main"
                      style={{ background: selectedAdventure.photos[currentPhotoIndex].color }}
                    >
                      <div className="placeholder-emoji-large">
                        {selectedAdventure.photos[currentPhotoIndex].placeholder}
                      </div>
                    </div>
                  )}
                  <div className="photo-caption">
                    {selectedAdventure.photos[currentPhotoIndex].caption}
                  </div>
                </div>
              </div>
              
              <button className="nav-btn next-btn" onClick={nextPhoto}>›</button>
            </div>

            <div className="photo-thumbnails">
              {selectedAdventure.photos.map((photo, index) => {
                const isLoaded = isImageLoaded(selectedAdventure.id, photo.id);
                return (
                  <div
                    key={photo.id}
                    className={`thumbnail ${index === currentPhotoIndex ? 'active' : ''}`}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    {isLoaded === true ? (
                      <img 
                        src={photo.image}
                        alt={photo.caption}
                        className="thumbnail-image"
                      />
                    ) : (
                      <div 
                        className="thumbnail-placeholder"
                        style={{ background: photo.color }}
                      >
                        <div className="thumbnail-emoji">{photo.placeholder}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="modal-message">
              "Every moment with you is a precious memory I'll cherish forever 💕"
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotosGallery;