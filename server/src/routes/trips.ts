import { Router } from 'express';
import {
    createTrip,
    getTrips,
    getTrip,
    updateTrip,
    deleteTrip,
    getRecentTrips,
    getTripStats,
    cloneTrip,
} from '../controllers/tripController';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = Router();

// Dashboard routes (authenticated)
router.get('/recent', authMiddleware, getRecentTrips);
router.get('/stats', authMiddleware, getTripStats);

// CRUD routes
router.post('/', authMiddleware, createTrip);
router.get('/', authMiddleware, getTrips);
router.get('/:id', optionalAuth, getTrip);  // Optional auth for public trips
router.put('/:id', authMiddleware, updateTrip);
router.delete('/:id', authMiddleware, deleteTrip);

// Clone a trip
router.post('/:id/clone', authMiddleware, cloneTrip);

export default router;
