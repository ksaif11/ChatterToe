import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import TicTacToe from './TicTacToe';
import ChatSidebar from './ChatSidebar';
import './GameRoom.css';

const GameRoom = () => {
  const { roomKey } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    board: Array(9).fill(null),
    currentPlayer: 0,
    winner: null,
    players: [],
  });
  const userId = sessionStorage.getItem('userId');
  const username = sessionStorage.getItem('username');
  const [lastTurn, setLastTurn] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io('https://chattertoe.onrender.com',{
      transports: ['websocket'],
    });
    setSocket(newSocket);

    newSocket.emit('join-room', { roomKey, userId });

    newSocket.on('game-update', (updatedGame) => {
      setGameState(updatedGame);

      if (updatedGame.winner) return;

      if (updatedGame.players.length === 2 && updatedGame.currentPlayer !== lastTurn) {
        if (updatedGame.players[updatedGame.currentPlayer] === username) {
          alert(`It's your turn, ${username}! Make a move.`);
        }
        setLastTurn(updatedGame.currentPlayer);
      }
    });

    newSocket.on("receive-message", ({ username, message }) => {
      setMessages((prev) => [...prev, { username, message }]);
      if (!isChatOpen) {
        setHasNewMessage(true);
      }
    });

    return () => newSocket.disconnect();
  }, [roomKey, lastTurn, username, isChatOpen]);

  const handleMove = (index) => {
    if (socket && !gameState.winner && gameState.board[index] === null) {
      socket.emit('make-move', { roomKey, index, playerId: userId });
    }
  };

  const handleRestart = () => {
    if (socket) {
      socket.emit('restart-game', { roomKey });
    }
  };

  const openChat = () => {
    setIsChatOpen(true);
    setHasNewMessage(false);
  };

  const isDraw = !gameState.board.includes(null) && !gameState.winner;

  return (
    <div className={`game-room-container ${isChatOpen ? "game-room-with-chat" : ""}`}>
      <div className="game-header">
        <h2>Room: {roomKey}</h2>
        <p className="status-text">
          {gameState.winner
            ? `🏆 Winner: ${gameState.winner}`
            : isDraw
            ? "🤝 It's a draw!"
            : `Current Turn: ${gameState.players.length === 2 ? gameState.players[gameState.currentPlayer] : "Waiting for an opponent..."}`}
        </p>
      </div>

      <TicTacToe board={gameState.board} onMove={handleMove} />

      <div className="game-buttons">
        <button onClick={() => navigate("/")} className="game-btn home-btn">Go Back</button>

        {(gameState.winner || isDraw) ? (
          <button onClick={handleRestart} className="game-btn restart-btn"> Play Again</button>
        ) : (
          <button onClick={openChat} className="game-btn chat-btn">
            💬 Chat
            {hasNewMessage && <span className="chat-notification animate-ping">*</span>}
          </button>
        )}
      </div>

      {isChatOpen && (
        <ChatSidebar
          socket={socket}
          roomKey={roomKey}
          username={username}
          onClose={() => setIsChatOpen(false)}
          messages={messages}
        />
      )}
    </div>
  );
};

export default GameRoom;
