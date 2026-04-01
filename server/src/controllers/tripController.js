import { supabase } from '../services/supabaseService.js';

// Save a new trip
export async function createTrip(userId, tripData) {
  try {
    const { destination, startDate, endDate, budgetLevel, numTravelers, interests, itinerary } = tripData;

    const { data, error } = await supabase
      .from('trips')
      .insert([
        {
          user_id: userId,
          destination,
          start_date: startDate,
          end_date: endDate,
          budget_level: budgetLevel,
          num_travelers: numTravelers,
          interests,
          itinerary: itinerary,
          status: 'draft',
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, trip: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get all user's trips
export async function getUserTrips(userId) {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return { success: true, trips: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get single trip
export async function getTripById(tripId, userId) {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .eq('user_id', userId)
      .single();

    if (error) throw new Error(error.message);
    return { success: true, trip: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update trip
export async function updateTrip(tripId, userId, updates) {
  try {
    const { data, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', tripId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, trip: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delete trip
export async function deleteTrip(tripId, userId) {
  try {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
