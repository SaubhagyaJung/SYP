import express from 'express';
import { getStats, getAllUsers, updateUserRole, deleteUser, getAllProperties, updatePropertyStatus, toggleFeatured, getAllInquiries, adminDeleteProperty, updateInquiryStatus, getAllReviews, createReview, updateReview, deleteReview, toggleReviewActive } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/properties', getAllProperties);
router.put('/properties/:id/status', updatePropertyStatus);
router.put('/properties/:id/featured', toggleFeatured);
router.delete('/properties/:id', adminDeleteProperty);
router.get('/inquiries', getAllInquiries);
router.put('/inquiries/:id/status', updateInquiryStatus);

// Review management
router.get('/reviews', getAllReviews);
router.post('/reviews', createReview);
router.put('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);
router.put('/reviews/:id/toggle', toggleReviewActive);

export default router;
