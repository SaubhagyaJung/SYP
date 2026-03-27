import express from 'express';
import pool from '../config/db.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public: Get all active reviews
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, author, role, text, rating, created_at FROM reviews WHERE is_active = TRUE ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected: Submit a review
router.post('/', protect, async (req, res) => {
  try {
    const { role, text, rating } = req.body;
    const author = req.user.name;
    
    const [result] = await pool.query(
      'INSERT INTO reviews (author, role, text, rating, is_active) VALUES (?, ?, ?, ?, TRUE)',
      [author, role || 'Registered User', text, rating || 5]
    );
    
    const [newReview] = await pool.query('SELECT id, author, role, text, rating, created_at FROM reviews WHERE id = ?', [result.insertId]);
    res.status(201).json(newReview[0]);
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
