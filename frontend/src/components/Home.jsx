import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [roomKey, setRoomKey] = useState('');
  const [showJoinField, setShowJoinField] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
    } else {
      setCheckingAuth(false);
    }
  }, [navigate]);

  const handleCreateGame = async () => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post('/api/game/create', { userId });
      navigate(`/game/${response.data.roomKey}`);
    } catch (err) {
      console.error('Error creating game:', err);
    }
  };

  const handleJoinGame = async () => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    if (!roomKey.trim()) {
      alert("Please enter a valid Room Key.");
      return;
    }

    try {
      await axios.post('/api/game/join', { roomKey, userId });
      navigate(`/game/${roomKey}`);
    } catch (err) {
      alert('Invalid room key or failed to join the game.');
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  if (checkingAuth) {
    return <div className="home-container"><p>Checking authentication...</p></div>;
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h2>Welcome to TicTacHub</h2>
        <p>Please choose an option to continue...</p>

        <div className="button-group">
          <button className="home-button primary" onClick={handleCreateGame}>
            ➕ Start a New Game
          </button>

          <button className="home-button secondary" onClick={() => setShowJoinField(!showJoinField)}>
            🔑 Join with Room Key
          </button>
        </div>

        {showJoinField && (
          <div className="join-section">
            <input
              type="text"
              placeholder="Enter Room Key"
              value={roomKey}
              onChange={(e) => setRoomKey(e.target.value)}
              className="home-input"
            />
            <button onClick={handleJoinGame} className="home-button join">Join Game</button>
          </div>
        )}

        <button onClick={handleLogout} className="home-button logout">Logout</button>
      </div>
    </div>
  );
};

export default Home;
