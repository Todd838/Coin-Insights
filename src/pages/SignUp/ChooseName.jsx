import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const ChooseName = ({ setUserName }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name.');
      return;
    }
    setUserName(name);
    navigate('/');
  };

  return (
    <div className="signup-container">
      <h2>Choose Your Display Name</h2>
      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Display Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <button type="submit">Continue</button>
      </form>
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
};

export default ChooseName;
