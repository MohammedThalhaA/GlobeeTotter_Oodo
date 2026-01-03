import { Router } from 'express';
import { getAnalytics } from '../controllers/adminController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Admin routes (protected)
router.get('/analytics', authMiddleware, getAnalytics);

export default router;
