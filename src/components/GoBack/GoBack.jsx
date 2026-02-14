import React from 'react';
import './GoBack.css';
import { useNavigate } from 'react-router-dom';

const GoBack = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <button className="go-back-btn" onClick={handleGoBack}>
      <span className="arrow">&gt;&gt;</span> Go back
    </button>
  );
};

export default GoBack;
