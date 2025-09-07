const express = require('express');
const { authRequired } = require('../middleware/auth');
const { weeklyStats, streakStats } = require('../controllers/statsController');

const router = express.Router();

router.get('/weekly', authRequired, weeklyStats);
router.get('/streak', authRequired, streakStats);

module.exports = router;
