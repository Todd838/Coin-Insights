import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AvatarCreator.css';

const AvatarCreator = ({ onSave, initialAvatar }) => {
  const [avatarConfig, setAvatarConfig] = useState({
    topType: 'ShortHairShortFlat',
    accessoriesType: 'Blank',
    hairColor: 'BrownDark',
    facialHairType: 'Blank',
    clotheType: 'Hoodie',
    clotheColor: 'Blue03',
    eyeType: 'Default',
    eyebrowType: 'Default',
    mouthType: 'Smile',
    skinColor: 'Light',
    pose: 'front'
  });

  const [isBlinking, setIsBlinking] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [cryptoFact, setCryptoFact] = useState('');

  const cryptoFacts = [
    "Bitcoin's max supply is 21 million!",
    "Ethereum enables smart contracts! 🚀",
    "DeFi is revolutionizing finance! 💎",
    "HODL = Hold On for Dear Life!",
    "To the moon! 🌙",
    "Blockchain is immutable! 🔒",
    "Gas fees can be expensive! ⛽",
    "NFTs are unique digital assets!",
    "Satoshi Nakamoto is still anonymous! 🕵️",
    "Proof of Stake uses less energy! ♻️"
  ];

  // Hair options
  const hairTypes = [
    { value: 'ShortHairShortFlat', label: 'Short Flat' },
    { value: 'ShortHairShortCurly', label: 'Short Curly' },
    { value: 'LongHairStraight', label: 'Long Straight' },
    { value: 'LongHairCurly', label: 'Long Curly' },
    { value: 'NoHair', label: 'Bald' },
    { value: 'LongHairDreads', label: 'Dreads' }
  ];

  const hairColors = [
    { value: 'Black', label: 'Black', color: '#2C1B18' },
    { value: 'Brown', label: 'Brown', color: '#A55728' },
    { value: 'BrownDark', label: 'Dark Brown', color: '#724133' },
    { value: 'Blonde', label: 'Blonde', color: '#E6C45E' },
    { value: 'Red', label: 'Red', color: '#C93305' },
    { value: 'PastelPink', label: 'Pink', color: '#F59797' },
    { value: 'Blue', label: 'Blue', color: '#4A90E2' }
  ];

  // Outfit options
  const clotheTypes = [
    { value: 'Hoodie', label: 'Hoodie' },
    { value: 'ShirtCrewNeck', label: 'Crew Neck' },
    { value: 'BlazerShirt', label: 'Blazer' },
    { value: 'CollarSweater', label: 'Sweater' },
    { value: 'GraphicShirt', label: 'Graphic Tee' },
    { value: 'Overall', label: 'Overall' }
  ];

  const clotheColors = [
    { value: 'Black', label: 'Black', color: '#262E33' },
    { value: 'Blue03', label: 'Blue', color: '#2F95DC' },
    { value: 'Red', label: 'Red', color: '#D93B3B' },
    { value: 'Gray01', label: 'Gray', color: '#929598' },
    { value: 'PastelGreen', label: 'Green', color: '#B1E2A8' },
    { value: 'PastelYellow', label: 'Yellow', color: '#FFEAA7' }
  ];

  // Skin color options
  const skinColors = [
    { value: 'Tanned', label: 'Tanned', color: '#D08B5B' },
    { value: 'Light', label: 'Light', color: '#FBD1B7' },
    { value: 'Pale', label: 'Pale', color: '#FFDBB4' },
    { value: 'Brown', label: 'Brown', color: '#AE5D29' },
    { value: 'DarkBrown', label: 'Dark Brown', color: '#8D5524' },
    { value: 'Black', label: 'Deep', color: '#614335' }
  ];

  // Pose options - simulate direction by adjusting eye/mouth position
  const poses = [
    { 
      value: 'front', 
      label: '👤 Front', 
      transform: 'none',
      eyeType: 'Default',
      mouthType: 'Smile'
    },
    { 
      value: 'left', 
      label: '👈 Left', 
      transform: 'scaleX(-1)',
      eyeType: 'Default',
      mouthType: 'Smile'
    },
    { 
      value: 'right', 
      label: '👉 Right', 
      transform: 'none',
      eyeType: 'Default',
      mouthType: 'Smile'
    },
    { 
      value: 'up', 
      label: '👆 Looking Up', 
      transform: 'perspective(600px) rotateX(8deg)',
      eyeType: 'Happy',
      mouthType: 'Smile'
    },
    { 
      value: 'down', 
      label: '👇 Looking Down', 
      transform: 'perspective(600px) rotateX(-8deg)',
      eyeType: 'Squint',
      mouthType: 'Serious'
    }
  ];

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000); // Random blink every 3-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  // Speech bubble animation
  useEffect(() => {
    const speechInterval = setInterval(() => {
      const randomFact = cryptoFacts[Math.floor(Math.random() * cryptoFacts.length)];
      setCryptoFact(randomFact);
      setShowSpeechBubble(true);
      
      setTimeout(() => {
        setShowSpeechBubble(false);
      }, 4000); // Show for 4 seconds
    }, 10000); // Every 10 seconds

    return () => clearInterval(speechInterval);
  }, []);

  // Generate avatar SVG URL
  const getAvatarUrl = () => {
    const selectedPose = poses.find(p => p.value === avatarConfig.pose) || poses[0];
    const blinkEye = isBlinking ? 'Close' : selectedPose.eyeType;
    const currentMouth = selectedPose.mouthType;
    
    return `https://avataaars.io/?avatarStyle=Circle&topType=${avatarConfig.topType}&accessoriesType=${avatarConfig.accessoriesType}&hairColor=${avatarConfig.hairColor}&facialHairType=${avatarConfig.facialHairType}&clotheType=${avatarConfig.clotheType}&clotheColor=${avatarConfig.clotheColor}&eyeType=${blinkEye}&eyebrowType=${avatarConfig.eyebrowType}&mouthType=${currentMouth}&skinColor=${avatarConfig.skinColor}`;
  };

  const updateConfig = (key, value) => {
    if (key === 'pose') {
      const selectedPose = poses.find(p => p.value === value);
      if (selectedPose) {
        setAvatarConfig(prev => ({
          ...prev,
          pose: value,
          eyeType: selectedPose.eyeType,
          mouthType: selectedPose.mouthType
        }));
      }
    } else {
      setAvatarConfig(prev => ({ ...prev, [key]: value }));
    }
  };

  // Helper function to determine if text should be light or dark
  const getTextColor = (bgColor) => {
    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#0a0e27' : '#ffffff';
  };

  const handleSave = () => {
    if (onSave) {
      onSave(avatarConfig);
    }
  };

  const selectedPose = poses.find(p => p.value === avatarConfig.pose);

  return (
    <div className="avatar-creator">
      <div className="avatar-preview-section">
        <motion.div 
          className="avatar-display"
          style={{ transform: selectedPose.transform }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <img 
            src={getAvatarUrl()} 
            alt="Avatar Preview" 
            className="avatar-image"
          />
          
          <AnimatePresence>
            {showSpeechBubble && (
              <motion.div 
                className="speech-bubble"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                {cryptoFact}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="pose-selector">
          <h3>Select Pose</h3>
          <div className="pose-options">
            {poses.map(pose => (
              <button
                key={pose.value}
                className={`pose-btn ${avatarConfig.pose === pose.value ? 'active' : ''}`}
                onClick={() => updateConfig('pose', pose.value)}
              >
                {pose.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="avatar-customization">
        <div className="customization-section">
          <h3>Hair Style</h3>
          <div className="option-grid">
            {hairTypes.map(hair => (
              <button
                key={hair.value}
                className={`option-btn ${avatarConfig.topType === hair.value ? 'selected' : ''}`}
                onClick={() => updateConfig('topType', hair.value)}
              >
                {hair.label}
              </button>
            ))}
          </div>
        </div>

        <div className="customization-section">
          <h3>Hair Color</h3>
          <div className="color-grid">
            {hairColors.map(color => (
              <button
                key={color.value}
                className={`color-btn ${avatarConfig.hairColor === color.value ? 'selected' : ''}`}
                onClick={() => updateConfig('hairColor', color.value)}
                style={{ 
                  background: color.color,
                  color: getTextColor(color.color)
                }}
              >
                {color.label}
              </button>
            ))}
          </div>
        </div>

        <div className="customization-section">
          <h3>Outfit</h3>
          <div className="option-grid">
            {clotheTypes.map(clothe => (
              <button
                key={clothe.value}
                className={`option-btn ${avatarConfig.clotheType === clothe.value ? 'selected' : ''}`}
                onClick={() => updateConfig('clotheType', clothe.value)}
              >
                {clothe.label}
              </button>
            ))}
          </div>
        </div>

        <div className="customization-section">
          <h3>Outfit Color</h3>
          <div className="color-grid">
            {clotheColors.map(color => (
              <button
                key={color.value}
                className={`color-btn ${avatarConfig.clotheColor === color.value ? 'selected' : ''}`}
                onClick={() => updateConfig('clotheColor', color.value)}
                style={{ 
                  background: color.color,
                  color: getTextColor(color.color)
                }}
              >
                {color.label}
              </button>
            ))}
          </div>
        </div>

        <div className="customization-section">
          <h3>Skin Tone</h3>
          <div className="color-grid">
            {skinColors.map(color => (
              <button
                key={color.value}
                className={`color-btn ${avatarConfig.skinColor === color.value ? 'selected' : ''}`}
                onClick={() => updateConfig('skinColor', color.value)}
                style={{ 
                  background: color.color,
                  color: getTextColor(color.color)
                }}
              >
                {color.label}
              </button>
            ))}
          </div>
        </div>

        <button className="save-avatar-btn" onClick={handleSave}>
          Save Avatar
        </button>
      </div>
    </div>
  );
};

export default AvatarCreator;
