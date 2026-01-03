import { Router } from 'express';
import { getTripBudget } from '../controllers/budgetController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Budget routes - supports public trips
router.get('/trips/:tripId', optionalAuth, getTripBudget);

export default router;
