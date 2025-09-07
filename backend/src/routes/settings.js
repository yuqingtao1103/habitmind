// backend/src/routes/settings.js
const express = require('express');
const { authRequired } = require('../middleware/auth');
const { validate, z } = require('../middleware/validate');
const { getNotifications, updateNotifications } = require('../controllers/settingsController');

const router = express.Router();

const putSchema = z.object({
  body: z.object({ emailOptIn: z.boolean() }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

router.get('/notifications', authRequired, getNotifications);
router.put('/notifications', authRequired, validate(putSchema), updateNotifications);

module.exports = router;
