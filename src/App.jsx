import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Gift, Map, Heart, Coffee } from 'lucide-react';
import './App.css';

// 3 Main Views: 'home', 'gacha', 'reveal'

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [selectedGift, setSelectedGift] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (currentView !== 'home') return;
    
    let animationFrameId;
    let targetX = noButtonPosition.x;
    let targetY = noButtonPosition.y;
    let currentX = noButtonPosition.x;
    let currentY = noButtonPosition.y;

    const handleMouseMove = (e) => {
      const btnElement = document.getElementById('no-btn');
      if (!btnElement) return;
      
      const rect = btnElement.getBoundingClientRect();
      const btnX = rect.left + rect.width / 2;
      const btnY = rect.top + rect.height / 2;
      
      const distance = Math.hypot(e.clientX - btnX, e.clientY - btnY);
      const safeDistance = 120; // Distance at which it starts running
      
      if (distance < safeDistance) {
        // Calculate the vector pointing AWAY from the cursor
        const angle = Math.atan2(btnY - e.clientY, btnX - e.clientX);
        // Push it just far enough outside the safe radius
        const pushDistance = safeDistance - distance + 20; 
        
        targetX = currentX + Math.cos(angle) * pushDistance;
        targetY = currentY + Math.sin(angle) * pushDistance;
        
        // Gentle clamping to keep it on screen, but relatively close to center
        const maxX = window.innerWidth / 2 - 100;
        const maxY = window.innerHeight / 2 - 100;
        const clamp = (val, max) => Math.max(-max, Math.min(max, val));
        
        targetX = clamp(targetX, maxX);
        targetY = clamp(targetY, maxY);
      } else {
        // Slowly drift back towards its original position if the mouse is far away
        targetX = currentX * 0.95;
        targetY = currentY * 0.95;
      }
    };

    const updatePosition = () => {
      // Lerp (Linear Interpolation) for smooth, fluid movement
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      
      // Only update React state if there's a meaningful change to avoid infinite tiny re-renders
      if (Math.abs(currentX - noButtonPosition.x) > 0.5 || Math.abs(currentY - noButtonPosition.y) > 0.5) {
        setNoButtonPosition({ x: currentX, y: currentY });
      }
      
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', (e) => handleMouseMove(e.touches[0]));
    
    // Start the physics loop
    updatePosition();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentView]); // Removed noButtonPosition from dependency to prevent extreme re-renders in the loop

  const gifts = [
    {
      id: 'adventurous',
      title: 'Adventurous Gift',
      icon: <Map className="option-icon" color="#fa748d" />,
      desc: 'For when she is feeling adventurous!',
      revealText: 'A surprise weekend getaway!',
    },
    {
      id: 'romantic',
      title: 'Romantic Gift',
      icon: <Heart className="option-icon" color="#e11d48" />,
      desc: 'For when she is feeling romantic!',
      revealText: 'A fancy candle-lit dinner date!',
    },
    {
      id: 'comfy',
      title: 'Comfy Gift',
      icon: <Coffee className="option-icon" color="#f87171" />,
      desc: 'For maximum comfort!',
      revealText: 'A cozy movie night with infinite snacks!',
    }
  ];

  const handleNoButtonDirectInteraction = () => {
    // Fallback dodge if they somehow click or hover directly without mousemove triggering
    const maxX = 300;
    const maxY = 250;
    const randomX = Math.floor(Math.random() * maxX * 2) - maxX;
    const randomY = Math.floor(Math.random() * maxY * 2) - maxY;
    setNoButtonPosition({ x: randomX, y: randomY });
  };

  const fireConfetti = () => {
    const duration = 2000; // slightly shorter, more explosive
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 15,
        angle: 90, // launch straight up
        spread: 120, // very wide spread like an explosion from the box
        startVelocity: 45, // slightly faster initial pop
        origin: { x: 0.5, y: 0.5 }, // exactly in the center where the box is
        colors: ['#f43f5e', '#fca5b5', '#ffffff'], // Pink and white
        shapes: ['star', 'circle']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const openGiftBox = () => {
    fireConfetti();
    setTimeout(() => {
      // Logic handled via state below, but this is the trigger point
    }, 500);
  };

  const handleOptionSelect = (gift) => {
    setSelectedGift(gift);
    setCurrentView('reveal');
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fecdd6', '#fff']
    });
  };

  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <AnimatePresence mode="wait">
        
        {/* HOMEPAGE VIEW */}
        {currentView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <motion.h1 
              className="romantic-title"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              Hi Wife, Will You accept my love?
            </motion.h1>

            <div className="buttons-container">
              <button 
                className="btn btn-yes"
                onClick={() => setCurrentView('gacha')}
              >
                Yes
              </button>
              
              <motion.button
                id="no-btn"
                className="btn btn-no"
                onMouseEnter={handleNoButtonDirectInteraction}
                onMouseOver={handleNoButtonDirectInteraction}
                onTouchStart={handleNoButtonDirectInteraction}
                style={{
                  transform: `translate(${noButtonPosition.x}px, ${noButtonPosition.y}px)`,
                  zIndex: 50 
                }}
              >
                No
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* GACHA VIEW */}
        {currentView === 'gacha' && (
          <GachaView 
            gifts={gifts} 
            onOpen={openGiftBox} 
            onSelect={handleOptionSelect} 
          />
        )}

        {/* REVEAL VIEW */}
        {currentView === 'reveal' && selectedGift && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="reveal-container"
          >
            <h2 className="reveal-title">You got...</h2>
            <div className="reveal-gift">{selectedGift.revealText}</div>
            <p className="option-desc" style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
              I love you so much! Happy White Day! ❤️
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// Sub-component for the Gacha View because it has complex internal state (closed vs opened)
function GachaView({ gifts, onOpen, onSelect }) {
  const [opened, setOpened] = useState(false);
  const [isBoiling, setIsBoiling] = useState(false);

  const handleOpen = () => {
    if (opened || isBoiling) return;
    setIsBoiling(true);
    
    // Boil for 1.5 seconds, then open!
    setTimeout(() => {
      setIsBoiling(false);
      setOpened(true);
      onOpen();
    }, 1500);
  };

  return (
    <motion.div
      key="gacha"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="gacha-container"
    >
      {/* Background dark overlay for drama */}
      <motion.div 
        className="dark-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: opened ? 0.8 : 0 }}
        transition={{ duration: 0.5 }}
      />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="closed-box"
            initial={{ scale: 1 }}
            animate={
              isBoiling 
                ? { 
                    scale: [1, 1.2, 1.1, 1.3, 1.1, 1.25], 
                    rotate: [-10, 10, -15, 15, -5, 5],
                    filter: ['drop-shadow(0 0 20px rgba(250,204,21,0.6))', 'drop-shadow(0 0 60px rgba(250,204,21,1))']
                  }
                : { scale: [1, 1.05, 1], rotate: [0, -2, 2, -2, 2, 0] }
            }
            transition={
              isBoiling
                ? { duration: 0.3, repeat: Infinity, type: "tween" }
                : { scale: { repeat: Infinity, duration: 2 }, rotate: { repeat: Infinity, duration: 4 } }
            }
            onClick={handleOpen}
            className="gift-box"
            style={{ zIndex: 10 }}
          >
            🎁
            <motion.div
              style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '150%', height: '150%', background: 'radial-gradient(circle, var(--gold-glow) 0%, transparent 70%)',
                zIndex: -1, pointerEvents: 'none'
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </motion.div>
        ) : (
          <motion.div 
            key="options"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="options-container"
          >
            {gifts.map((gift, i) => (
              <motion.div
                key={gift.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + (i * 0.2) }}
                className="option-card"
                onClick={() => onSelect(gift)}
              >
                {gift.icon}
                <h3 className="option-title">{gift.title}</h3>
                <p className="option-desc">{gift.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
