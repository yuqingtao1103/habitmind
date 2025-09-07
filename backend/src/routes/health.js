const express = require('express');
const { getDbState } = require('../config/db');
const router = express.Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'habitmind-backend',
    db: getDbState(),
    time: new Date().toISOString()
  });
});

module.exports = router;

