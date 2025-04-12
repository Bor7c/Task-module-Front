import React from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ fullScreen = false }) => {
  return (
    <div className={`loading-screen ${fullScreen ? 'full-screen' : ''}`}>
      <div className="spinner"></div>
      <p>Загрузка...</p>
    </div>
  );
};

export default LoadingScreen;