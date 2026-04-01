import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 min for AI generation
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Generate a full trip itinerary via Claude AI.
 * @param {Object} params - TripForm payload
 * @param {String} token - JWT auth token
 */
export async function generateItinerary(params, token) {
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  const res = await client.post('/generate', params, { headers });
  return res.data;
}
