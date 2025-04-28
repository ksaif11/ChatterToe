const express = require('express');
const { createGame, joinGame } = require('../controllers/gameController');

const router = express.Router();

router.post('/create', createGame);
router.post('/join', joinGame);

module.exports = router;