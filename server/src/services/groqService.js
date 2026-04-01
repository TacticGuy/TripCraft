import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Calls Groq (llama-3.3-70b) to generate a structured travel itinerary.
 * @param {Object} params - { destination, startDate, endDate, days, budget, travelers, interests }
 * @returns {Array} Parsed JSON array of day objects
 */
async function generateItineraryFromGroq(params) {
  const { destination, startDate, endDate, days, budget, travelers, interests } = params;

  const systemPrompt = `You are an expert travel planner. Generate a detailed, realistic, and exciting travel itinerary.
You MUST respond with ONLY a valid JSON array — no markdown, no explanation, no code fences.

The JSON array must have exactly ${days} objects, one per day. Each object must follow this exact schema:
{
  "day": <number>,
  "date": "<YYYY-MM-DD>",
  "title": "<catchy theme for the day>",
  "summary": "<2-3 sentence overview of the day>",
  "activities": [
    {
      "id": "<unique string, e.g. day1_act1>",
      "time": "<HH:MM>",
      "name": "<activity or place name>",
      "description": "<1-2 sentences>",
      "category": "<one of: attraction|food|transport|accommodation|shopping|entertainment>",
      "location": {
        "name": "<place name>",
        "address": "<full address if known>",
        "lat": <approximate latitude as number>,
        "lng": <approximate longitude as number>
      },
      "duration_minutes": <number>,
      "estimated_cost": {
        "amount": <number in USD>,
        "currency": "USD",
        "per": "<person|group>"
      },
      "tips": "<insider tip or practical advice>"
    }
  ],
  "accommodation": {
    "name": "<hotel or accommodation name>",
    "address": "<address>",
    "lat": <latitude>,
    "lng": <longitude>,
    "estimated_cost_per_night": <number in USD>
  },
  "daily_budget_estimate": <total estimated USD spend for the day per person>
}`;

  const userPrompt = `Plan a ${days}-day trip to ${destination}.
- Travel dates: ${startDate} to ${endDate}
- Budget level: ${budget} (budget=<$100/day, moderate=$100-250/day, luxury=$250+/day)
- Number of travelers: ${travelers}
- Interests: ${interests || 'general sightseeing, local food, culture'}

Generate realistic coordinates for all locations. Include 4-6 activities per day. Make it genuinely exciting and locally authentic.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 8192,
  });

  const text = completion.choices[0].message.content.trim();

  // Strip any accidental markdown fences
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Groq returned invalid JSON: ${e.message}\nRaw: ${cleaned.slice(0, 300)}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Groq response was not a JSON array');
  }

  return parsed;
}

export { generateItineraryFromGroq };
