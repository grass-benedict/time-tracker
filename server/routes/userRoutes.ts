import express from 'express';
import User from '../models/user.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  const user = await User.create({ name });
  res.status(201).json(user);
});

export default router;
