import { Router } from 'express';
import {
    addStop,
    updateStop,
    deleteStop,
    reorderStops,
    getStops,
} from '../controllers/stopController';
import { authMiddleware } from '../middleware/auth';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authMiddleware);

// Trip stops routes - nested under /api/trips/:tripId/stops
router.get('/', getStops);
router.post('/', addStop);
router.put('/reorder', reorderStops);
router.put('/:stopId', updateStop);
router.delete('/:stopId', deleteStop);

export default router;
