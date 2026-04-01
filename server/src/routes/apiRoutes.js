import express from 'express';
import { generateItinerary } from '../controllers/generateController.js';

const router = express.Router();

// POST /api/generate — Main itinerary generation endpoint
router.post('/generate', generateItinerary);

export default router;
