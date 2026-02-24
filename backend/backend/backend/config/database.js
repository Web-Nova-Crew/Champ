const { supabase, supabaseAdmin } = require('./supabase');

/**
 * Database helper functions
 */

// Get all properties
async function getAllProperties(filters = {}) {
  try {
    let query = supabase.from('properties').select('*');

    if (filters.propertyType) {
      query = query.eq('property_type', filters.propertyType);
    }

    if (filters.transactionType) {
      query = query.eq('transaction_type', filters.transactionType);
    }

    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters.area) {
      query = query.eq('area', filters.area);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting properties:', error);
    return { success: false, error: error.message };
  }
}

// Get property by ID
async function getPropertyById(id) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting property:', error);
    return { success: false, error: error.message };
  }
}

// Create property - Use admin client to bypass RLS
async function createProperty(propertyData) {
  try {
    // Use admin client to bypass RLS policies
    const dbClient = supabaseAdmin || supabase;
    const { data, error } = await dbClient
      .from('properties')
      .insert([propertyData])
      .select()
      .single();

    if (error) {
      console.error('Property creation error details:', error);
      throw error;
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error creating property:', error);
    return { success: false, error: error.message };
  }
}

// Update property - Use admin client to bypass RLS
async function updateProperty(id, updates) {
  try {
    const dbClient = supabaseAdmin || supabase;
    const { data, error } = await dbClient
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating property:', error);
    return { success: false, error: error.message };
  }
}

// Delete property - Use admin client to bypass RLS
async function deleteProperty(id) {
  try {
    const dbClient = supabaseAdmin || supabase;
    const { error } = await dbClient
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting property:', error);
    return { success: false, error: error.message };
  }
}

// Get user profile
async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
}

// Update user profile
async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
}

// Get user favorites
async function getUserFavorites(userId) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('property_id, properties(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting favorites:', error);
    return { success: false, error: error.message };
  }
}

// Add favorite
async function addFavorite(userId, propertyId) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, property_id: propertyId }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding favorite:', error);
    return { success: false, error: error.message };
  }
}

// Remove favorite
async function removeFavorite(userId, propertyId) {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error removing favorite:', error);
    return { success: false, error: error.message };
  }
}

// Get chats for user
async function getUserChats(userId) {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting chats:', error);
    return { success: false, error: error.message };
  }
}

// Get chat messages
async function getChatMessages(chatId) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting messages:', error);
    return { success: false, error: error.message };
  }
}

// Create chat
async function createChat(chatData) {
  try {
    const { data, error } = await supabase
      .from('chats')
      .insert([chatData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating chat:', error);
    return { success: false, error: error.message };
  }
}

// Send message
async function sendMessage(messageData) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (error) throw error;

    // Update chat updated_at
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', messageData.chat_id);

    return { success: true, data };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }
}

// Get bookings for user
async function getUserBookings(userId) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, properties(*)')
      .or(`booker_id.eq.${userId},property_owner_id.eq.${userId}`)
      .order('scheduled_date', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting bookings:', error);
    return { success: false, error: error.message };
  }
}

// Create booking
async function createBooking(bookingData) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: error.message };
  }
}

// Update booking
async function updateBooking(id, updates) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating booking:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getUserProfile,
  updateUserProfile,
  getUserFavorites,
  addFavorite,
  removeFavorite,
  getUserChats,
  getChatMessages,
  createChat,
  sendMessage,
  getUserBookings,
  createBooking,
  updateBooking,
};

