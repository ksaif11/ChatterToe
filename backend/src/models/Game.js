const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  roomKey: { type: String, required: true, unique: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  board: { type: Array, default: Array(9).fill(null) },
  currentPlayer: { type: Number, default: 0 }, // 0 or 1
  winner: { type: String, default: null },
});

module.exports = mongoose.model('Game', gameSchema);