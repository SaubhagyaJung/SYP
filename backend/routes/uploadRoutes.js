import express from 'express';
import { upload, uploadImages } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, upload.array('images', 10), uploadImages);

export default router;
