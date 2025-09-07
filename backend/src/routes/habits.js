const express = require('express');
const { authRequired } = require('../middleware/auth');
const { validate, z } = require('../middleware/validate');
const { listHabits, createHabit, updateHabit, deleteHabit } = require('../controllers/habitController');

const router = express.Router();

// 校验 schema
const createSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(1000).optional().default(''),
    frequency: z.enum(['daily', 'weekly', 'custom']).optional().default('daily')
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

const updateSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(1000).optional(),
    frequency: z.enum(['daily', 'weekly', 'custom']).optional()
  }),
  params: z.object({
    id: z.string().length(24) // 简单校验 ObjectId 长度
  }),
  query: z.object({}).optional()
});

const listSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional()
  }),
  body: z.object({}).optional(),
  params: z.object({}).optional()
});

const idSchema = z.object({
  params: z.object({
    id: z.string().length(24)
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});

// 路由（均需登录）
router.get('/', authRequired, validate(listSchema), listHabits);
router.post('/', authRequired, validate(createSchema), createHabit);
router.put('/:id', authRequired, validate(updateSchema), updateHabit);
router.delete('/:id', authRequired, validate(idSchema), deleteHabit);

module.exports = router;
