import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoritesController';

const router = Router();

// Protect all routes
router.use(authMiddleware);

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:cityId', removeFavorite);

export default router;
