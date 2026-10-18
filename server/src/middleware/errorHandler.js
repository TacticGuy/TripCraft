/**
 * Global Express error handler.
 * Catches API timeouts, parsing errors, and unexpected failures.
 */
function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message);

  // Malformed / oversized request body (from express.json)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large.' });
  }

  // Upstream timeout
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return res.status(504).json({
      error: 'Request timed out. The AI service took too long to respond. Please try again.',
    });
  }

  // AI returned unparseable output
  if (err.message?.includes('invalid JSON') || err.message?.includes('not a JSON array')) {
    return res.status(502).json({
      error: 'Failed to parse AI response. Please try again.',
      detail: err.message,
    });
  }

  // AI provider auth error
  if (err.message?.includes('API key') || err.message?.includes('PERMISSION_DENIED')) {
    return res.status(500).json({
      error: 'AI service authentication failed. Please check your API keys.',
    });
  }

  // Rate limit from upstream
  if (err.response?.status === 429 || err.status === 429) {
    return res.status(429).json({
      error: 'Rate limit reached on upstream API. Please wait a moment and try again.',
    });
  }

  // Generic
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected error occurred.',
  });
}

export default errorHandler;
