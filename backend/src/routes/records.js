const express = require('express');
const { authRequired } = require('../middleware/auth');
const { validate, z } = require('../middleware/validate');
const { upsertRecord, getRange } = require('../controllers/recordController');

const router = express.Router();

const upsertSchema = z.object({
  params: z.object({
    habitId: z.string().length(24)
  }),
  body: z.object({
    date: z.string().datetime().optional(),   // ISO 字符串，如 "2025-09-04T00:00:00.000Z"
    status: z.boolean().optional()
  }),
  query: z.object({}).optional()
});

const getSchema = z.object({
  query: z.object({
    habitId: z.string().length(24),
    range: z.enum(['week']).default('week')
  }),
  body: z.object({}).optional(),
  params: z.object({}).optional()
});

router.post('/:habitId', authRequired, validate(upsertSchema), upsertRecord);
router.get('/', authRequired, validate(getSchema), getRange);

module.exports = router;
