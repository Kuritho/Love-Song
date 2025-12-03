import React, { useState, useEffect } from 'react';
import './App.css';
import LoveSong from './LoveSong';
import PhotosGallery from './PhotosGallery';
import VideosGallery from './VideosGallery'; // We'll create this component

function App() {
  const [currentView, setCurrentView] = useState('main');
  const [showHearts, setShowHearts] = useState(false);
  const [girlfriendName] = useState('Kurt Bryy');
  const [yourName] = useState('[Your Name]');

  useEffect(() => {
    // Trigger heart animation periodically
    const interval = setInterval(() => {
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 3000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'photos':
        return <PhotosGallery onBack={() => setCurrentView('main')} />;
      case 'song':
        return <LoveSong onBack={() => setCurrentView('main')} />;
      case 'videos':
        return <VideosGallery onBack={() => setCurrentView('main')} />;
      default:
        return (
          <div className="container">
            {/* Enhanced Animated Background */}
            <div className="enhanced-background">
              <div className="floating-hearts">
                {[...Array(15)].map((_, i) => (
                  <div 
                    key={i} 
                    className="floating-heart"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 8}s`,
                      fontSize: `${Math.random() * 20 + 20}px`
                    }}
                  >💖</div>
                ))}
              </div>
              <div className="sparkles">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i} 
                    className="sparkle"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Burst Hearts Effect */}
            {showHearts && (
              <div className="heart-burst">
                {[...Array(30)].map((_, i) => (
                  <div 
                    key={i} 
                    className="burst-heart"
                    style={{
                      animationDelay: `${Math.random() * 2}s`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`
                    }}
                  >{['💖', '💕', '💝', '💗', '💓'][Math.floor(Math.random() * 5)]}</div>
                ))}
              </div>
            )}

            {/* Main Content */}
            <div className="content-wrapper">
              <div className="romantic-header">
                <div className="title-container">
                  <h1 className="main-title">
                    <span className="title-word">Happy</span>
                    <span className="title-word">1st</span>
                    <span className="title-word">Monthsary,</span>
                    <span className="title-word">My</span>
                    <span className="title-word">Sweetheart</span>
                  </h1>
                  <div className="title-emoji">💖✨</div>
                </div>
              </div>

              {/* Love Letter Container */}
              <div className="love-letter-container">
                <div className="envelope">
                  <div className="envelope-flap"></div>
                  <div className="envelope-body">
                    <div className="letter">
                      <div className="letter-content">
                        <div className="letter-header">
                          <span className="date">One Month of Pure Happiness</span>
                        </div>
                        
                        <div className="message-scroll">
                          <p className="message-paragraph animated">
                            My Dearest <span className="highlight">Jasmine,</span>,
                          </p>
                          
                          <p className="message-paragraph animated">
                            Since that moment I first saw you on Tinder, I never expected nga ikaw diay ang babae who would change everything for me. Sa imong cute nga smile sa picture, I didn't know you would become the person I'd think about every day.
                          </p>

                          <p className="message-paragraph animated">
                            When we moved to Instagram on October 13, every story you shared… even the ones that hurt… I listened because I wanted to understand you, not to judge you. Sometimes it cut me deep, pero kabalo ka? I still chose to stay. I stayed because somehow, even with the pain, my heart kept telling me, "She's worth it."
                          </p>

                          <p className="message-paragraph animated">
                            Sa mga remaining days sa October, katong nag–love ta without label, I didn't expect nga mo-grow diay ni into something real. You became my peace and my chaos at the same time, but I still wanted more of you every day.
                          </p>

                          <p className="message-paragraph animated">
                            Then came November 2, the day I tried to surprise you with flowers and a mountain view. Nagsalig ko nga smooth kaayo akong plan pero sayop kay nakita nimo accidentally ang flowers sulod sa akong motor hahahahaha. Pagka-failed jud nako. But when you laughed, when you looked at me with that smile I can never forget that I realized something: I don't need to be perfect for you to love me. I just needed to be real.
                          </p>

                          <p className="message-paragraph animated">
                            And I know I'm not the most gentleman guy in this world. I know daghan ko'g mga flaws and Imperfections, I overthink, I get jealous easily, I misunderstand things, and sometimes I get scared of losing you. Pero tungod nimo, nag experience ko'g adjust, nag experience ko'g grow kay ikaw ra akong gusto mapalipay sa tanan.
                          </p>

                          <p className="message-paragraph animated">
                            Jasmine, Sweetheart, thank you for choosing me. Thank you for loving me even when my mind gets noisy. Even when my heart still gets hurt by things in the past. You still stayed. And that's something I won't ever forget.
                          </p>

                          <p className="message-paragraph animated">
                            I may not say this all the time pero… ikaw akong last. The woman I want to build a future with. The woman I want to marry someday. The mother of the child we will raise together. I want to reach that "last" with you hand in hand, bisan pa ug naay kasakit, kalibog, ug mga away bisan asa.
                          </p>

                          <p className="message-paragraph animated">
                            I love you in a way I've never loved anyone before. A kind of love that scares me, hurts me, heals me, and makes me hope for forever. All at the same time. Ikaw ra. Ug ikaw gihapon sa ugma. Ug ikaw gihapon sa last.
                          </p>

                          <p className="message-paragraph animated">
                            And before I end this message, there's something I want you to know: I made a song for you. I poured every piece of my heart into it, our story, my love, my pain, my hope, everything nga wa nako masulti nimo personally. I hope you'll listen. I hope ma-feel nimo unsa ka ka–special sa akong kinabuhi.
                          </p>

                          <p className="message-paragraph animated">
                            Click the button below. Sweetheart, this song is for you. ❤️🎧
                          </p>

                          <div className="letter-footer">
                            <p className="signature">
                              Forever and Always,<br />
                              <span className="signature-name">Kurt Bryy</span>
                            </p>
                            <div className="seal">💝</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Elements */}
              <div className="interactive-section">
                <div className="surprise-buttons">
                  {/* Our Pictures Button */}
                  <div 
                    className="photos-btn romantic-btn"
                    onClick={() => setCurrentView('photos')}
                  >
                    <div className="photo-collage">
                      <div className="photo-frame main-photo">
                        <div className="photo-placeholder">📸</div>
                        <div className="photo-overlay">Our Memories</div>
                      </div>
                      <div className="photo-frame small-photo-1">
                        <div className="photo-placeholder">❤️</div>
                      </div>
                      <div className="photo-frame small-photo-2">
                        <div className="photo-placeholder">✨</div>
                      </div>
                      <div className="photo-frame small-photo-3">
                        <div className="photo-placeholder">💕</div>
                      </div>
                    </div>
                    <span className="btn-text">Our Beautiful Memories</span>
                    <div className="btn-glow"></div>
                    <div className="canva-sticker">🎨</div>
                  </div>
                  
                  {/* Our Videos Button */}
                  <div 
                    className="videos-btn romantic-btn"
                    onClick={() => setCurrentView('videos')}
                  >
                    <div className="video-player-preview">
                      <div className="video-screen">
                        <div className="play-button">▶️</div>
                        <div className="video-time">01:23</div>
                      </div>
                      <div className="video-thumbnails">
                        <div className="video-thumbnail thumb-1">🎬</div>
                        <div className="video-thumbnail thumb-2">📹</div>
                        <div className="video-thumbnail thumb-3">🎥</div>
                      </div>
                    </div>
                    <span className="btn-text">Our Video Moments</span>
                    <div className="btn-glow"></div>
                    <div className="video-sticker">🎞️</div>
                  </div>
                  
                  <button 
                    className="song-btn romantic-btn"
                    onClick={() => setCurrentView('song')}
                  >
                    <span className="btn-icon">🎵</span>
                    <span className="btn-text">Listen to my Song</span>
                    <div className="btn-glow"></div>
                  </button>
                </div>

                {/* Love Meter */}
                <div className="love-meter">
                  <div className="meter-label">Our Love Meter</div>
                  <div className="meter-bar">
                    <div className="meter-fill" style={{width: '100%'}}>
                      <span className="meter-text">Infinite Love 💖</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;