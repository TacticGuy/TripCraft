import express from 'express';
import { createTrip, getUserTrips, getTripById, updateTrip, deleteTrip } from '../controllers/tripController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All trip routes require authentication
router.use(authenticateToken);

// Create a new trip
router.post('/trips', async (req, res) => {
  try {
    const { destination, startDate, endDate, budgetLevel, numTravelers, interests, itinerary } = req.body;

    if (!destination || !startDate || !endDate || !itinerary) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await createTrip(req.user.userId, {
      destination,
      startDate,
      endDate,
      budgetLevel,
      numTravelers,
      interests,
      itinerary,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({ success: true, trip: result.trip });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all user's trips
router.get('/trips', async (req, res) => {
  try {
    const result = await getUserTrips(req.user.userId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, trips: result.trips });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single trip
router.get('/trips/:id', async (req, res) => {
  try {
    const result = await getTripById(req.params.id, req.user.userId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, trip: result.trip });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update trip
router.put('/trips/:id', async (req, res) => {
  try {
    const result = await updateTrip(req.params.id, req.user.userId, req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, trip: result.trip });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete trip
router.delete('/trips/:id', async (req, res) => {
  try {
    const result = await deleteTrip(req.params.id, req.user.userId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, message: 'Trip deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
