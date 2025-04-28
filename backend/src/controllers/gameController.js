const Game = require('../models/Game');
const { generateRoomKey } = require('../utils/generateKey');
const mongoose = require('mongoose');

const createGame = async (req, res) => {
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.error('Invalid user ID:', userId);
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const roomKey = generateRoomKey();
  console.log('Generated roomKey:', roomKey);

  try {
    const game = new Game({ roomKey, players: [userId] });
    await game.save();
    console.log('Game created successfully:', game);
    res.json({ roomKey });
  } catch (err) {
    console.error('Error creating game:', err);
    res.status(500).json({ error: 'Error creating game', details: err.message });
  }
};

const joinGame = async (req, res) => {
  const { roomKey, userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.error('Invalid user ID:', userId);
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const game = await Game.findOne({ roomKey });
    if (!game) {
      console.error('Game not found for roomKey:', roomKey);
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.players.length >= 2) {
      console.error('Room is full for roomKey:', roomKey);
      return res.status(400).json({ error: 'Room is full' });
    }

    game.players.push(userId);
    await game.save();
    console.log('Player joined successfully:', game); 
    res.json({ message: 'Joined game successfully' });
  } catch (err) {
    console.error('Error joining game:', err);
    res.status(500).json({ error: 'Error joining game', details: err.message });
  }
};

module.exports = { createGame, joinGame };