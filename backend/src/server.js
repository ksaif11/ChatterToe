const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const connectDB = require('./config/db');
const Game = require('./models/Game');
const User = require('./models/User');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

io.on('connection', async (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', async ({ roomKey, userId }) => {
    socket.join(roomKey);
    
    const game = await Game.findOne({ roomKey }).populate("players", "username");
    if (!game) {
      console.error('Game not found for roomKey:', roomKey);
      return;
    }

    console.log(`User joined room: ${roomKey}`);
    game.players.forEach(player => {
      console.log(` - ${player.username} (ID: ${player._id})`);
    });

    io.to(roomKey).emit('game-update', {
      board: game.board,
      currentPlayer: game.currentPlayer,
      winner: game.winner,
      players: game.players.map(p => p.username),
    });
  });

  socket.on('make-move', async ({ roomKey, index, playerId }) => {
    try {
      const game = await Game.findOne({ roomKey }).populate("players", "username");
      if (!game) {
        console.error('Game not found for roomKey:', roomKey);
        return;
      }

      if (game.winner) {
        console.log(`Game already won by: ${game.winner}`);
        return;
      }

      if (game.players[game.currentPlayer]._id.toString() !== playerId) {
        console.error(`Invalid move: Not ${game.players[game.currentPlayer].username}'s turn.`);
        return;
      }

      if (game.board[index] !== null) {
        console.error("Cell already occupied.");
        return;
      }

      game.board[index] = game.currentPlayer;

      const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
      ];

      let winnerUsername = null;
      for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (
          game.board[a] !== null &&
          game.board[a] === game.board[b] &&
          game.board[a] === game.board[c]
        ) {
          winnerUsername = game.players[game.board[a]].username;
          game.winner = winnerUsername;
          console.log(`🏆 Game won by ${winnerUsername}`);
          break;
        }
      }

      if (!game.winner) {
        game.currentPlayer = game.currentPlayer === 0 ? 1 : 0;
        console.log(`Next turn: ${game.players[game.currentPlayer].username}`);
      }

      await game.save();

      io.to(roomKey).emit('game-update', {
        board: game.board,
        currentPlayer: game.winner ? null : game.currentPlayer,
        winner: game.winner,
        players: game.players.map(p => p.username),
      });

    } catch (err) {
      console.error('Error handling move:', err);
    }
  });

  socket.on('restart-game', async ({ roomKey }) => {
    try {
      const game = await Game.findOne({ roomKey });
      if (!game) {
        console.error("Game not found for restart.");
        return;
      }

      game.board = Array(9).fill(null);
      game.currentPlayer = 0;
      game.winner = null;

      await game.save();

      io.to(roomKey).emit('game-update', {
        board: game.board,
        currentPlayer: game.currentPlayer,
        winner: null,
        players: game.players.map(p => p.username),
      });

      console.log(`Game restarted in room: ${roomKey}`);
    } catch (err) {
      console.error("Error restarting game:", err);
    }
  });

  socket.on('send-message', ({ roomKey, username, message }) => {
    console.log(`Chat Message from ${username}: ${message}`);

    io.to(roomKey).emit('receive-message', { username, message });

    io.to(roomKey).emit('chat-notification');
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
