import express from 'express';
import { toggleFavorite, getFavorites, checkFavorite } from '../controllers/favoriteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getFavorites);
router.post('/:propertyId', protect, toggleFavorite);
router.get('/:propertyId/check', protect, checkFavorite);

export default router;
