import { generateItineraryFromGroq } from '../services/groqService.js';

/**
 * POST /api/generate
 * Body: { destination, startDate, endDate, budget, travelers, interests }
 */
async function generateItinerary(req, res, next) {
  try {
    const {
      destination,
      startDate,
      endDate,
      budget = 'moderate',
      travelers = 1,
      interests = '',
    } = req.body;

    if (!destination || !startDate || !endDate) {
      return res.status(400).json({ error: 'destination, startDate, and endDate are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (days < 1 || days > 21) {
      return res.status(400).json({ error: 'Trip must be between 1 and 21 days.' });
    }

    console.log(`[Generate] ${destination} | ${days} days | Budget: ${budget} | Travelers: ${travelers}`);

    const itinerary = await generateItineraryFromGroq({
      destination, startDate, endDate, days, budget, travelers, interests,
    });

    const totalBudget = itinerary.reduce((sum, d) => sum + (d.daily_budget_estimate || 0), 0);

    res.json({
      meta: {
        destination, startDate, endDate, days, budget, travelers,
        generatedAt: new Date().toISOString(),
        totalEstimatedBudget: totalBudget * travelers,
      },
      itinerary,
    });

    console.log(`[Generate] Success — ${days} days generated for ${destination}`);
  } catch (err) {
    next(err);
  }
}

export { generateItinerary };
