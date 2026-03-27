import express from 'express';
import { createInquiry, getPropertyInquiries, updateInquiryStatus, replyToInquiry } from '../controllers/inquiryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', createInquiry);
router.get('/mine', protect, getPropertyInquiries);
router.put('/:id/status', protect, updateInquiryStatus);
router.post('/:id/reply', protect, replyToInquiry);

export default router;
