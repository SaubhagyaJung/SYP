import express from 'express';
import { getProperties, getFeaturedProperties, getPropertyById, createProperty, updateProperty, deleteProperty, getUserProperties } from '../controllers/propertyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/mine', protect, getUserProperties);
router.get('/:id', getPropertyById);
router.post('/', protect, createProperty);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);

export default router;
