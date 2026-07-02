import React, { useState, useEffect } from 'react';
import './App.css';
import LoveSong from './LoveSong';
import PhotosGallery from './PhotosGallery';
import VideosGallery from './VideosGallery';
import FlappyLoveBird from './FlappyLoveBird';
import Sudoku from './Sudoku';
import Pacman from './Pacman';
import FirebaseLoginPage from './FirebaseLoginPage';
import FirebaseAdminPanel from './FirebaseAdminPanel';
import { AuthProvider, useAuth } from './FirebaseAuthContext';

// My Profile Component
function MyProfile({ onBack, user }) {
  const [userProfile, setUserProfile] = useState({
    name: user?.username || 'Player',
    email: user?.email || 'No email',
    age: '',
    birthday: '',
    relationshipStatus: 'In a relationship',
    monthsaryCount: 8,
    relationshipGoal: 'Going stronger every day!',
    joinDate: new Date().toISOString().split('T')[0]
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(userProfile);

  const handleSave = () => {
    setUserProfile(tempProfile);
    setIsEditing(false);
    localStorage.setItem(`userProfile_${user?.username}`, JSON.stringify(tempProfile));
  };

  const handleCancel = () => {
    setTempProfile(userProfile);
    setIsEditing(false);
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem(`userProfile_${user?.username}`);
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setUserProfile(parsed);
      setTempProfile(parsed);
    }
  }, [user]);

  const calculateAge = (birthday) => {
    if (!birthday) return '';
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="profile-back-btn" onClick={onBack}>← Back</button>
        <h1>My Profile</h1>
        {!isEditing && (
          <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
            ✏️ Edit
          </button>
        )}
      </div>

      <div className="profile-card">
        <div className="profile-avatar">💕</div>
        
        {isEditing ? (
          <div className="profile-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={tempProfile.name}
                onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={tempProfile.email}
                onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Birthday</label>
              <input
                type="date"
                value={tempProfile.birthday}
                onChange={(e) => setTempProfile({...tempProfile, birthday: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                placeholder="Age"
                value={tempProfile.age}
                onChange={(e) => setTempProfile({...tempProfile, age: e.target.value})}
              />
            </div>
            <div className="form-actions">
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{userProfile.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{userProfile.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Age:</span>
              <span className="info-value">
                {userProfile.age || (userProfile.birthday ? calculateAge(userProfile.birthday) : 'Not set')}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Birthday:</span>
              <span className="info-value">
                {userProfile.birthday ? new Date(userProfile.birthday).toLocaleDateString() : 'Not set'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Relationship:</span>
              <span className="info-value relationship-value">💕 In Love</span>
            </div>
            <div className="info-row">
              <span className="info-label">Monthsary:</span>
              <span className="info-value monthsary-value">🎉 8 Months and Going Stronger! 🎉</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className="info-value status-value">💪 Growing stronger every day</span>
            </div>
            <div className="info-row">
              <span className="info-label">Member since:</span>
              <span className="info-value">{new Date(userProfile.joinDate).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      <div className="relationship-quote">
        <p>✨ "Every day with you is a new chapter of our beautiful love story" ✨</p>
        <p className="quote-heart">💕 Brian & Jasmine 💕</p>
      </div>
    </div>
  );
}

// Main App Content Component
function AppContent({ onAppLogout }) {
  const { user, logout, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('main');
  const [showHearts, setShowHearts] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(8);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [showGame, setShowGame] = useState(false);
  const [showSudoku, setShowSudoku] = useState(false);
  const [showPacman, setShowPacman] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const monthContent = {
    1: {
      title: "1st Monthsary",
      subtitle: "The Beginning of Forever",
      emoji: "🌅",
      letter: {
        greeting: "My Dearest Jasmine 💕",
        paragraphs: [
          "Since that moment I first saw you on Tinder, I never expected nga ikaw diay ang babae who would change everything for me. Sa imong cute nga smile sa picture, I didn't know you would become the person I'd think about every day.",
          "When we moved to Instagram on October 13, every story you shared… even the ones that hurt… I listened because I wanted to understand you, not to judge you. Sometimes it cut me deep, pero kabalo ka? I still chose to stay. I stayed because somehow, even with the pain, my heart kept telling me, 'She's worth it.'",
          "Sa mga remaining days sa October, katong nag–love ta without label, I didn't expect nga mo-grow diay ni into something real. You became my peace and my chaos at the same time, but I still wanted more of you every day."
        ],
        specialNote: "✨ This is just the beginning of our beautiful journey together. ✨"
      }
    },
    2: {
      title: "2nd Monthsary",
      subtitle: "Growing Deeper",
      emoji: "🌱",
      letter: {
        greeting: "My Love Jasmine 💝",
        paragraphs: [
          "Happy 2nd monthsary, Sweetheart. 🥺❤️ Honestly, grabe kaayo akong smile while reading your message. I really, really appreciate it so much. Kabalo ko nga dili ka sanay mag express ug feelings in words, pero the fact nga you did this for me means more than you know.",
          "Isa jud ni sa mga moments nga maingon ko nga I'm so lucky to have you. Thank you for taking the time and effort to put your feelings into words, especially knowing nga one of my love languages is words of affirmation. It truly means a lot to me sweetheart. Every word you said touched my heart deeply, and it reminded me why I choose you every single day. Being with you makes me grateful in so many ways. Thank you sa pagtiwala sa akoa, sa pag love sa akoa, and for making me feel appreciated.",
          "Thankful ko for your love, your patience, and even for the way na gina try nimo imong sarili for us. Ayaw jud kabalaka, wala jud koy plano nga ilisan ka or mangita ug lain, ikaw ra jud akong pilion magpakailanman and I am so so so happy ma ikaw akong nakaila bilang mga last girl and hoping will be. I'm so proud of you, and I'm thankful for how we've grown together in these past two months. I promise to keep choosing you, to love you better each day, and to appreciate you the same way you appreciate me. I love you so much sweetheart, always. ❤️ I love love love you so badd."
        ],
        specialNote: "🌿 Two months of growing together, and I'm excited for many more. 🌿"
      }
    },
    3: {
      title: "3rd Monthsary",
      subtitle: "Building Memories",
      emoji: "📸",
      letter: {
        greeting: "My Sweetheart 💖",
        paragraphs: [
          "Happy 3rd monthsary, my sweetheart 💚 3 months na jud ta hehe. Murag dali ra kaayo ang time basta ikaw akong kauban permi. Thank you sa tanan, sa constant love, and sa mga pasensya na gina pakita nmo, especially sa pag sabot sa akoa even when I'm not easy to handle.",
          "Swerte kaayo ko nga naa ka sa akong life, ako imong napili. Ikaw akong pahulay everyday, ginasabayan mo gihapon ko bisag lisod sa imoha 💚 dira pa lng daan, ikaw na akong kalipay. I love you always, ha. Ingat pud ka sa mga adlaw na di tika makauban. Happy 3rd monthsary usab. More monthsary to come, and can't wait na mag celebrate ta og Anniversaries together. I love youuuu sobra 💚",
          "See you later for more love 💚"
        ],
        specialNote: "🎨 Three months of memories I'll treasure forever. 🎨"
      }
    },
    4: {
      title: "4th Monthsary",
      subtitle: "Stronger Together",
      emoji: "💪",
      letter: {
        greeting: "My Everything 💗",
        paragraphs: [
          "Happy 4th monthsary, sweetheart 💚💚. Four months na ta, and until now I still can't believe nga ako ang imong gipili. I know dili ako ang standard nimo, dili ko perfect, and I have so many flaws, inarte, inOA, og makalagot para sa imoha nga nag sige ko'g overthink. Pero bisan ana, ako gihapon ang imong gipili para higugmaon, and hoping nga dili ka easily mu give up sa akoa, although kapoyon ka pero never mag cross sa imong mind to give up because you love me. And that alone makes me feel like the luckiest person alive. Maybe I'm not the best on your list, maybe I don't have everything you once imagined. But the fact nga you chose me, stayed with me, and continue loving me, that means everything. Reverse man siya kay dapat siguro ikaw ang lucky hahahaha charlang, but honestly ako jud ang mas lucky to have you.",
          "Thank you for loving someone like me. Because of you, I want to be better every single day. I'll give you my time, my effort, my loyalty, ihatag nako tanan in exchange for the love you gave me. Not because I have to, but because you deserve it.",
          "Salamat sa pagpili sa ako every day. I promise to love you sincerely and consistently. Here's to more months, more memories, and more love together. 💕💚"
        ],
        specialNote: "🌟 Four months of choosing each other, every single day. 🌟"
      }
    },
    5: {
      title: "5th Monthsary",
      subtitle: "Falling More Each Day",
      emoji: "💫",
      letter: {
        greeting: "My Darling 💕",
        paragraphs: [
          "Happy monthsary, Sweetheart💚Another month with you, and I still find myself smiling even tho gina adjust na nako akong sarili for not overthinking too much, gaya ng mga gusto mo and at the little things you do. Thank you for staying, for understanding me even na lisod kaayo ko ideal with, and for loving me in ways na never nako gina expect. Every day with you feels like a blessing I don't want to take for granted. Kabalo ko na daghan ta og misunderstandings usahay. Pero I hope masabtan nimo nga normal ra jud na sa usa ka relationship. Dili man gyud permi perfect, pero ang importante kay willing ta mag fix sa atong problems, hoping ma fix dayon, mag sinabtanay, ug mag stay gihapon para sa isa't isa.",
          "I know we're not perfect, and we've had our ups and downs, pero thankful kaayo ko kay bisan ana, we still choose each other every single day. Ga learn ko, ga grow ko, and trying to be better for you, and for us. I love you.and I'll keep choosing you everyday no matter what.",
          "I love you always 💚"
        ],
        specialNote: "🌈 Five months of loving you, and I want a lifetime more. 🌈"
      }
    },
    6: {
      title: "6th Monthsary",
      subtitle: "Half a Year of Happiness",
      emoji: "🎉",
      letter: {
        greeting: "My Forever 💝",
        paragraphs: [
          "Happy 6th monthsary, Sweetheart! 💚. murag dali ra kaayo ang panahon pero kung hunahunaon, daghan na kaayo tag naagian together. From the happy moments, mga katawa, mga memories na dili gyud nako malimtan, up to the times na naglisod ta, nag away, ug naka feel ta ug kapoy emotionally. Pero despite everything, we still choosing each other, and that's something I'm really thankful for. 💚.",
          "Gusto lang nako magpasalamat sa imo, sa imong pag stay, sa imong patience, ug sa love na sige nimo gihatag bisan usahay lisod na kaayo. Kabalo ko na dili ko perfect, daghan ko ug kulang, ug naa koy moments na makasakit ko nimo without even realizing it. Pero I want you to know na I'm trying, and I will keep trying to be better for you, for us. Kabalo ko na naa kay mga times na kapoy naka, kanang murag di naka kabalo unsa gyud nga rest ang kailangan nimo. Kanang feeling na bisan unsaon nimo, murag bugat gihapon tanan. Ug kabalo ko usahay ako pud ang reason ana. Dili nako gusto na ingana imong ma feel because of me. I just want you to know na I see it, I understand it, and I care about it. Dili man permi dali ang atong relationship, pero para nako, worth it gihapon kaayo. Worth it ka. Ikaw. Bisan unsa pa ka complicated ang tanan, I still choose you. Every single day, even on the days na lisod kaayo. Kay for me, dili lang ni about sa kilig or sa happy moments, kundi about sa pag stay, pag sabot, ug pag laban bisag kapoy na. I want to be your pahinga, imong safe place, ug imong kakampi sa tanan. Dili lang sa maayo, pero lalo na sa mga panahong murag wala nakay energy magpatuloy. I may not always say the right words, pero tinuod akong feelings para nimo. I love you so much, more than I can explain.",
          "Happy 6th monthsary again, sweetheart 💚 Here's to more months, more memories, and more chances to grow together.💚"
        ],
        specialNote: "🎊 Six months down, forever to go! 🎊"
      }
    },
    7: {
      title: "7th Monthsary",
      subtitle: "My One & Only",
      emoji: "👑",
      letter: {
        greeting: "My One and Only 💖👑",
        paragraphs: [
          "It's been seven months already, and honestly, every day with you has been one of the greatest blessings in my life. Looking back, daghan na kaayo ta'g naagian together... mga happy moments, challenges, mga misunderstandings, mga kalipay , og mga countless memories nga akong gina cherish hangtod karon. Through all those moments, one thing has never changed: my love for you.",
          "Thank you for staying with me, for loving me despite my flaws, and for always being patient with me. Thank you sa imong understanding, sa imong care, ug sa imong support bisan usahay lisod ko sabton. You have always been there for me, and I appreciate every little thing that you do. Usahay dili man nako ma express tanan akong gibati, pero kabalo ka nga dako kaayo kag lugar sa akong heart.",
          "As we celebrate our 7th monthsary, gusto lang nako nga makahibalo ka kung unsa ka ka special sa akoa. Gitagaan ko nimog kahayag everyday, and my future more exciting. Every conversation, every call, and even every small argument reminds me that what we have is real and worth fighting for.",
          "Naa pud koy gusto i-share nimo nga dugay na nako gihuna hunaan. Although dili pa man ko ready modawat nga mag join sa BCC karon, dili tungod kay wala koy interest or dili nako gusto. Sa tinuod lang, dili pa lang gyud ko comfortable sa karon. Naa pa koy mga butang nga akong gina process ug mga hunahuna nga gusto sa nako masabtan ug ma settle.",
          "Pero gusto nako nga makabalo ka nga I know someday ma-win ra jud nako ni puhon. I believe nga maabot ra ang panahon nga ready na ko. Hatagi lang ko og gamay nga time para makahunahuna ug tarong hangtod mawala na ang mga confused ug mga butang nga naga stop sa akong mind. I will join, but not now. Gusto nako nga mo-join ko nga whole-heartedly, kanang wala nay doubts ug wala nay naga pugong sa akong hunahuna. Thank you kaayo, sweetheart, sa pagsabot sa akoa ug sa dili pagpugos nako. I really appreciate it.",
          "I also want to say sorry kung simple ra kaayo akong effort ani nga app. Hahahaha. Kabalo ko usahay kulang ra kaayo ni compared sa tanan nga imong deserve. Pero bisan simple ra ni, every word diri comes from my heart. This is one of the ways nga akong mapakita nimo kung unsa ka nako ka love ug ka appreciate. And honestly, I will keep doing this. I will keep making efforts, keep loving you, keep choosing you, and keep reminding you how important you are to me until the day we finally get married and even beyond that. ❤️",
          "And before I end this message, gusto pud nako iingon nga proud kaayo ko nimo sa imong OJT. ❤️ Kabalo ko nga dili lalim ang imong journey karon. Daghan kag malearn, daghan kag mameet nga mga tao, ug daghan pud kag experiences nga magain. Bisan mag layo ta usahay tungod sa imong mga responsibilities, happy kaayo ko kay makita nako nga nagapaningkamot ka para sa imong future. Always remember nga naa ra ko diri, supporting you in every step nga imong himuon.",
          "Honestly, naa koy usa ka simple nga prayer ug wish para sa atoa. I hope nga after sa imong OJT, pagbalik nimo, ako lang gihapon. Walay lain, ikaw ug ako lang gihapon, mas strong ug mas in love kaysa sauna. I know daghan kag maencounter nga mga tawo along the way, pero salig ko nimo ug sa atong relasyon.",
          "Thank you kaayo kay faithful ug loyal ka sa akoa. Dili nako na gina take for granted. Sa panahon karon nga dali ra kaayo mausab ang mga butang ug mga tao, thankful kaayo ko nga nagpabilin kang tinuod sa atong relasyon. Thank you for always choosing me, for respecting what we have, and for giving me peace of mind pinaagi sa imong honesty, loyalty, ug genuine nga love. One of the reasons nga mas love pa jud nimo ko every day is because of the trust nga imong gihatag sa akoa.",
          "No matter where your OJT takes you, always remember nga ikaw ra gihapon ang akong pilion every day. And I hope nga when this chapter of your life ends, we'll still be here together, hand in hand, continuing the future that we've been dreaming about. ❤️",
          "Happy 7th Monthsary, my love. Here's to more months, more years, more memories, and a lifetime together. I love you always, sweetheart. Today, tomorrow, and every day after that. ❤️🥰"
        ],
        specialNote: "💍 I love you in a way I've never loved anyone before. You are my forever. 💍"
      }
    },
    8: {
      title: "8th Monthsary",
      subtitle: "Deeper Love, Stronger Bond",
      emoji: "💎",
      letter: {
        greeting: "My Precious Jasmine 💎💕",
        paragraphs: [
          "Happy 8th Monthsary, sweetheart! 💚",
          "Grabe, 8 months na diay ta. Thank you so much for choosing to stay with me and for being the best girlfriend I could ever ask for. Thank you sa imong love, pasensya, understanding, ug sa tanan nimo nga efforts bisan usahay dili ko perfect. You make my days brighter, and I'm really grateful nga naa ka sa akong life.",
          "I'm so proud of you, especially karon nga 3rd week na nimo sa OJT. I know dili sayon ang imong giagian, but I also know kaya kaayo na nimo. Keep doing your best, learn as much as you can, and always believe in yourself. Good luck, love! I'm always here cheering for you every step of the way.",
          "Usa pud sa akong gihangyo kay unta, bisan daghan kag ma-meet nga new people during your OJT, ako lang gihapon ang lalaki nga imong pilion every day. I hope dili ka ma-fall o mo-entertain ug lain, just like how I'll continue choosing you. Salig ko sa imo, and I pray nga our love stays strong despite everything.",
          "Thank you again for loving me. I'm looking forward to more months and years with you, more memories, more laughter, and more dreams that we'll achieve together.",
          "I love you so much, always and forever. Happy 8th Monthsary, my sweetheart. ❤️💚"
        ],
        specialNote: "💎 Eight months of precious love, and I'm looking forward to a lifetime more. You are my greatest treasure. 💎"
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 3000);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      setCurrentView('main');
      setShowGame(false);
      setShowSudoku(false);
      setShowPacman(false);
      setShowAdminPanel(false);
      setShowProfile(false);
      setIsMenuOpen(false);
      onAppLogout();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navigateTo = (view) => {
    setCurrentView(view);
    setShowGame(false);
    setShowSudoku(false);
    setShowPacman(false);
    setShowProfile(false);
    setIsMenuOpen(false);
  };

  const openGame = (game) => {
    setShowGame(game === 'flappy');
    setShowSudoku(game === 'sudoku');
    setShowPacman(game === 'pacman');
    setCurrentView('main');
    setIsMenuOpen(false);
  };

  if (showAdminPanel && isAdmin) {
    return (
      <FirebaseAdminPanel 
        onBack={() => setShowAdminPanel(false)} 
        onLogout={handleLogout}
      />
    );
  }

  if (showProfile) {
    return <MyProfile onBack={() => setShowProfile(false)} user={user} />;
  }

  if (showGame) {
    return <FlappyLoveBird onBack={() => setShowGame(false)} />;
  }
  
  if (showSudoku) {
    return <Sudoku onBack={() => setShowSudoku(false)} currentPlayer={user?.username} />;
  }
  
  if (showPacman) {
    return <Pacman onBack={() => setShowPacman(false)} />;
  }

  const getMonthContent = (month) => {
    return monthContent[month] || monthContent[8];
  };

  const renderMainView = () => {
    if (currentView === 'photos') {
      return <PhotosGallery onBack={() => setCurrentView('main')} />;
    }
    if (currentView === 'song') {
      return <LoveSong onBack={() => setCurrentView('main')} />;
    }
    if (currentView === 'videos') {
      return <VideosGallery onBack={() => setCurrentView('main')} />;
    }
    
    const currentMonthData = getMonthContent(selectedMonth);
    return (
      <div className="container-redesign">
        {/* Animated Background */}
        <div className="romantic-bg">
          <div className="gradient-bg"></div>
          <div className="floating-circles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="circle" style={{
                '--i': i,
                '--size': Math.random() * 100 + 50,
                '--left': Math.random() * 100,
                '--delay': Math.random() * 10
              }}></div>
            ))}
          </div>
        </div>

        {/* Top Banner Decoration */}
        <div className="top-banner">
          <div className="banner-content">
            <div className="banner-hearts left">
              {['💖', '💕', '💝', '💗', '💓'].map((heart, i) => (
                <span key={i} className="banner-heart" style={{ animationDelay: `${i * 0.3}s` }}>{heart}</span>
              ))}
            </div>
            <div className="banner-text">
              <span className="banner-couple-name">Brian ✨ Jasmine</span>
              <span className="banner-tagline">Forever in Love</span>
            </div>
            <div className="banner-hearts right">
              {['💖', '💕', '💝', '💗', '💓'].map((heart, i) => (
                <span key={i} className="banner-heart" style={{ animationDelay: `${i * 0.3}s` }}>{heart}</span>
              ))}
            </div>
          </div>
          <div className="banner-ribbon"></div>
        </div>

        {/* Top Floating Hearts Row */}
        <div className="top-floating-hearts">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="top-heart"
              style={{
                left: `${(i * 8.33)}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {['💖', '💕', '💝', '💗', '💓', '❤️', '💘'][Math.floor(Math.random() * 7)]}
            </div>
          ))}
        </div>

        {/* Heart Burst Effect */}
        {showHearts && (
          <div className="heart-explosion">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="exploding-heart" style={{
                '--angle': Math.random() * 360,
                '--distance': Math.random() * 200 + 100,
                '--delay': Math.random() * 0.5,
                animationDelay: `${Math.random() * 0.5}s`
              }}>
                {['💖', '💕', '💝', '💗', '💓', '❤️', '💘'][Math.floor(Math.random() * 7)]}
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="content-wrapper-redesign">
          {/* Romantic Divider Top */}
          <div className="romantic-divider">
            <span className="divider-star">✨</span>
            <span className="divider-line"></span>
            <span className="divider-heart">💖</span>
            <span className="divider-line"></span>
            <span className="divider-star">✨</span>
          </div>

          {/* Header Section */}
          <div className="hero-section">
            {selectedMonth === 8 && (
              <div className="crown-decoration">
                <div className="crown">💎</div>
                <div className="crown-sparkles">✨💫✨</div>
              </div>
            )}

            <div className="month-badge-large">
              <span className="month-emoji">{currentMonthData.emoji}</span>
              <span className="month-text">Month {selectedMonth}</span>
            </div>
            
            <h1 className="romantic-title">
              <span className="title-line">Happy</span>
              <span className="title-line gradient-text">{currentMonthData.title}</span>
              <span className="title-line">My Love!</span>
            </h1>
            
            <p className="subtitle-text">{currentMonthData.subtitle}</p>

            <div className="title-underline">
              <div className="underline-heart">💝</div>
            </div>

            {/* Month Selector */}
            <div className="month-selector-redesign">
              <button 
                className="selector-trigger"
                onClick={() => setShowMonthSelector(!showMonthSelector)}
              >
                <span>📅</span>
                <span>View Other Months</span>
                <span className={`arrow ${showMonthSelector ? 'rotate' : ''}`}>▼</span>
              </button>
              
              {showMonthSelector && (
                <div className="selector-dropdown">
                  <div className="dropdown-header">
                    <span>💖 Our Journey 💖</span>
                  </div>
                  <div className="month-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(month => (
                      <div
                        key={month}
                        className={`month-card ${selectedMonth === month ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedMonth(month);
                          setShowMonthSelector(false);
                        }}
                      >
                        <span className="month-num">{month}</span>
                        <span className="month-suffix">
                          {month === 1 ? 'st' : month === 2 ? 'nd' : month === 3 ? 'rd' : 'th'}
                        </span>
                        <span className="month-title">Monthsary</span>
                        {selectedMonth === month && <span className="active-mark">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Love Letter Card */}
          <div className="letter-card">
            <div className="card-inner">
              <div className="letter-decoration">
                <div className="decoration-left">🌸</div>
                <div className="decoration-right">🌺</div>
              </div>
              
              <div className="letter-header-redesign">
                <div className="date-badge">
                  <span>📖</span>
                  <span>{selectedMonth} {selectedMonth === 1 ? 'Month' : 'Months'} of Love</span>
                </div>
              </div>

              <div className="letter-body">
                <div className="greeting">
                  <span className="greeting-icon">💌</span>
                  <h3>{currentMonthData.letter.greeting}</h3>
                </div>

                <div className="letter-paragraphs">
                  {currentMonthData.letter.paragraphs.map((paragraph, idx) => (
                    <p key={idx} className="love-paragraph" style={{ animationDelay: `${idx * 0.1}s` }}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="special-note-redesign">
                  <div className="note-border">
                    <p className="note-text-redesign">
                      <span className="note-quote">"</span>
                      {currentMonthData.letter.specialNote}
                      <span className="note-quote">"</span>
                    </p>
                  </div>
                </div>

                <div className="signature-redesign">
                  <div className="signature-line"></div>
                  <div className="signature-content">
                    <span className="signature-text">Forever Yours,</span>
                    <span className="signature-name">Brian 💝</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="nav-footer">
            <button 
              className="nav-arrow prev"
              onClick={() => selectedMonth > 1 && setSelectedMonth(selectedMonth - 1)}
              disabled={selectedMonth === 1}
            >
              <span>◀</span>
              <span>Previous Month</span>
            </button>
            
            <div className="progress-indicator">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(selectedMonth / 8) * 100}%` }}>
                  <div className="progress-glow"></div>
                </div>
              </div>
              <div className="progress-text">
                {selectedMonth} of 8 Months
              </div>
            </div>
            
            <button 
              className="nav-arrow next"
              onClick={() => selectedMonth < 8 && setSelectedMonth(selectedMonth + 1)}
              disabled={selectedMonth === 8}
            >
              <span>Next Month</span>
              <span>▶</span>
            </button>
          </div>

          {/* Floating Elements */}
          <div className="floating-elements">
            <div className="float-element">💕</div>
            <div className="float-element">💖</div>
            <div className="float-element">💗</div>
            <div className="float-element">✨</div>
            <div className="float-element">🌸</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App-redesign">
      {/* Hamburger Menu Button */}
      <div className={`hamburger-menu ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Sidebar Menu */}
      <div className={`sidebar-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-user-info">
            <div className="sidebar-avatar">💕</div>
            <div className="sidebar-user-details">
              <h3>{user?.username || user?.email?.split('@')[0] || 'Player'}</h3>
              <p>{user?.email || 'No email'}</p>
            </div>
          </div>
        </div>
        
        <div className="sidebar-menu-items">
          {/* My Profile Button */}
          <button 
            className="sidebar-item profile-btn"
            onClick={() => {
              setShowProfile(true);
              setIsMenuOpen(false);
            }}
          >
            <span className="sidebar-icon">👤</span>
            <span className="sidebar-text">My Profile</span>
          </button>

          {/* Gallery Section */}
          <div className="sidebar-section">
            <div className="section-title">📸 Gallery</div>
            <button 
              className="sidebar-item sub-item"
              onClick={() => navigateTo('photos')}
            >
              <span className="sidebar-icon">🖼️</span>
              <span className="sidebar-text">Photos Gallery</span>
            </button>
            <button 
              className="sidebar-item sub-item"
              onClick={() => navigateTo('videos')}
            >
              <span className="sidebar-icon">🎬</span>
              <span className="sidebar-text">Videos Gallery</span>
            </button>
          </div>

          {/* Music Section */}
          <div className="sidebar-section">
            <div className="section-title">🎵 Music</div>
            <button 
              className="sidebar-item sub-item"
              onClick={() => navigateTo('song')}
            >
              <span className="sidebar-icon">🎤</span>
              <span className="sidebar-text">Love Song</span>
            </button>
          </div>

          {/* Games Section */}
          <div className="sidebar-section">
            <div className="section-title">🎮 Games</div>
            <button 
              className="sidebar-item sub-item"
              onClick={() => openGame('flappy')}
            >
              <span className="sidebar-icon">🐦</span>
              <span className="sidebar-text">Flappy Love Bird</span>
            </button>
            <button 
              className="sidebar-item sub-item"
              onClick={() => openGame('sudoku')}
            >
              <span className="sidebar-icon">🔢</span>
              <span className="sidebar-text">Sudoku Puzzle</span>
            </button>
            <button 
              className="sidebar-item sub-item"
              onClick={() => openGame('pacman')}
            >
              <span className="sidebar-icon">🟡</span>
              <span className="sidebar-text">Pacman</span>
            </button>
          </div>

          {/* Admin Panel - Only for admin users */}
          {isAdmin && (
            <button 
              className="sidebar-item admin-btn"
              onClick={() => {
                setShowAdminPanel(true);
                setIsMenuOpen(false);
              }}
            >
              <span className="sidebar-icon">👑</span>
              <span className="sidebar-text">Admin Panel</span>
            </button>
          )}
          
          {/* Logout Button */}
          <button 
            className="sidebar-item logout-btn"
            onClick={handleLogout}
          >
            <span className="sidebar-icon">💔</span>
            <span className="sidebar-text">Logout</span>
          </button>
        </div>
        
        <div className="sidebar-footer">
          <p>Brian & Jasmine ❤️</p>
          <p className="sidebar-version">8 Months and Going Stronger!</p>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
      
      {renderMainView()}
    </div>
  );
}

// Main App with Auth Provider
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogoutFromApp = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <AuthProvider>
        <FirebaseLoginPage onLoginSuccess={handleLoginSuccess} />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <AppContent onAppLogout={handleLogoutFromApp} />
    </AuthProvider>
  );
}

export default App;