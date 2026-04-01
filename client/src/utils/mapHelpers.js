/**
 * Extracts all map-plottable locations from the itinerary.
 * Returns a flat array of marker objects for Google Maps.
 */
export function extractMapMarkers(itinerary) {
  const markers = [];

  itinerary.forEach((day) => {
    (day.activities || []).forEach((act) => {
      const loc = act.location;
      if (loc && 
          isValidCoord(loc.lat, loc.lng) && 
          act.name && 
          act.name.toLowerCase() !== 'none' &&
          act.name.trim() !== '') {
        markers.push({
          id: act.id,
          day: day.day,
          date: day.date,
          name: act.name,
          category: act.category,
          lat: loc.lat,
          lng: loc.lng,
          placeId: loc.placeId || null,
          photoUrl: loc.photoUrl || null,
          rating: loc.rating || null,
          address: loc.address || loc.name,
          description: act.description,
          time: act.time,
          cost: act.estimated_cost,
        });
      }
    });

    // Add accommodation marker
    const acc = day.accommodation;
    if (acc && 
        isValidCoord(acc.lat, acc.lng) && 
        acc.name && 
        acc.name.toLowerCase() !== 'none' &&
        acc.name.trim() !== '') {
      markers.push({
        id: `acc_day${day.day}`,
        day: day.day,
        date: day.date,
        name: acc.name,
        category: 'accommodation',
        lat: acc.lat,
        lng: acc.lng,
        placeId: acc.placeId || null,
        address: acc.address,
        isAccommodation: true,
      });
    }
  });

  return markers;
}

/**
 * Computes the center point for all markers.
 */
export function computeMapCenter(markers) {
  if (!markers.length) return { lat: 20, lng: 0 };
  const lat = markers.reduce((s, m) => s + m.lat, 0) / markers.length;
  const lng = markers.reduce((s, m) => s + m.lng, 0) / markers.length;
  return { lat, lng };
}

/**
 * Returns a color hex for each activity category.
 */
export function categoryColor(category) {
  const map = {
    attraction: '#c9a96e',
    food: '#e05c5c',
    transport: '#64748b',
    accommodation: '#4caf7d',
    shopping: '#e8834a',
    entertainment: '#8b5cf6',
  };
  return map[category] || '#94a3b8';
}

/**
 * Returns an emoji icon for each category.
 */
export function categoryIcon(category) {
  const map = {
    attraction: '🏛️',
    food: '🍽️',
    transport: '🚆',
    accommodation: '🏨',
    shopping: '🛍️',
    entertainment: '🎭',
  };
  return map[category] || '📍';
}

function isValidCoord(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
