import { Router } from 'express';
import {
    searchActivities,
    getCategories,
    addActivityToStop,
    updateTripActivity,
    removeTripActivity,
} from '../controllers/activityController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', searchActivities);
router.get('/categories', getCategories);

// Protected routes
router.post('/stops/:stopId', authMiddleware, addActivityToStop);
router.put('/trip-activities/:id', authMiddleware, updateTripActivity);
router.delete('/trip-activities/:id', authMiddleware, removeTripActivity);

export default router;
