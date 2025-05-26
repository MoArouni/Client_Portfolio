const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const config = require('../config/default');

// Initialize Google OAuth client from config
const oAuth2Client = new OAuth2(
  config.googleAuth.clientId,
  config.googleAuth.clientSecret,
  config.googleAuth.redirectUri
);

// Set calendar API version
const calendar = google.calendar({ version: 'v3' });

/**
 * Get Google authorization URL
 * @param {String} state - JWT encoded state for security
 * @returns {String} Google auth URL
 */
const getAuthUrl = (state) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force getting refresh token
    state: state // Pass the state parameter for security
  });
};

/**
 * Exchange authorization code for tokens
 * @param {String} code - Authorization code from Google
 * @returns {Object} Token information
 */
const getTokens = async (code) => {
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw error;
  }
};

/**
 * Set credentials for the OAuth client
 * @param {String} refreshToken - User's refresh token
 */
const setCredentials = (refreshToken) => {
  oAuth2Client.setCredentials({
    refresh_token: refreshToken
  });
};

/**
 * Create a calendar event
 * @param {String} refreshToken - User's refresh token
 * @param {Object} eventData - Event details
 * @returns {Object} Created event
 */
const createEvent = async (refreshToken, eventData) => {
  try {
    console.log('📅 Creating Google Calendar event:', {
      title: eventData.title,
      start: eventData.start_time,
      end: eventData.end_time,
      attendees: eventData.attendees?.length || 0
    });

    // Set credentials with refresh token
    oAuth2Client.setCredentials({
      refresh_token: refreshToken
    });

    // Get timezone from config or use UTC
    const timeZone = config.timezone || 'America/New_York';

    // Create event object
    const event = {
      summary: eventData.title,
      description: eventData.description || 'Appointment booking',
      start: {
        dateTime: new Date(eventData.start_time).toISOString(),
        timeZone
      },
      end: {
        dateTime: new Date(eventData.end_time).toISOString(),
        timeZone
      },
      attendees: eventData.attendees || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 }, // 1 hour before
          { method: 'popup', minutes: 15 }  // 15 minutes before
        ]
      },
      // Send notifications to attendees
      sendNotifications: true,
      // Use default reminders
      sendUpdates: 'all'
    };

    console.log('📝 Event object to create:', JSON.stringify(event, null, 2));

    // Insert event to calendar
    const response = await calendar.events.insert({
      auth: oAuth2Client,
      calendarId: 'primary',
      resource: event,
      sendNotifications: true,
      sendUpdates: 'all'
    });
    
    console.log('✅ Google Calendar event created successfully:', {
      id: response.data.id,
      htmlLink: response.data.htmlLink,
      status: response.data.status
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creating Google Calendar event:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      response: error.response?.data
    });
    throw error;
  }
};

/**
 * Update a calendar event
 * @param {String} refreshToken - User's refresh token
 * @param {String} eventId - Google Calendar event ID
 * @param {Object} eventData - Updated event details
 * @returns {Object} Updated event
 */
const updateEvent = async (refreshToken, eventId, eventData) => {
  try {
    // Set credentials
    setCredentials(refreshToken);

    // Get timezone from config or use UTC
    const timeZone = config.timezone || 'UTC';

    // Create event object with updates
    const event = {
      summary: eventData.title,
      description: eventData.description || 'Appointment booking',
      start: {
        dateTime: new Date(eventData.start_time).toISOString(),
        timeZone
      },
      end: {
        dateTime: new Date(eventData.end_time).toISOString(),
        timeZone
      }
    };

    // Update event in calendar
    const response = await calendar.events.update({
      auth: oAuth2Client,
      calendarId: 'primary',
      eventId: eventId,
      resource: event
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    throw error;
  }
};

/**
 * Delete a calendar event
 * @param {String} refreshToken - User's refresh token
 * @param {String} eventId - Google Calendar event ID
 * @returns {Boolean} Success status
 */
const deleteEvent = async (refreshToken, eventId) => {
  try {
    // Set credentials
    setCredentials(refreshToken);

    // Delete event from calendar
    await calendar.events.delete({
      auth: oAuth2Client,
      calendarId: 'primary',
      eventId: eventId
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    throw error;
  }
};

/**
 * List upcoming events
 * @param {String} refreshToken - User's refresh token
 * @param {Number} maxResults - Maximum number of events to return
 * @returns {Array} List of events
 */
const listEvents = async (refreshToken, maxResults = 10) => {
  try {
    // Set credentials
    setCredentials(refreshToken);

    const response = await calendar.events.list({
      auth: oAuth2Client,
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    return response.data.items;
  } catch (error) {
    console.error('Error listing Google Calendar events:', error);
    throw error;
  }
};

/**
 * Get available time slots from Google Calendar
 * @param {String} refreshToken - User's refresh token
 * @param {Date} startDate - Start date to check availability
 * @param {Date} endDate - End date to check availability
 * @param {Number} duration - Duration of each slot in minutes (default 60)
 * @param {String} timezone - Timezone for the slots (default: America/New_York)
 * @returns {Array} Available time slots
 */
const getAvailableSlots = async (refreshToken, startDate, endDate, duration = 60, timezone = 'America/New_York') => {
  try {
    console.log('🔍 Getting available slots for:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration,
      timezone,
      hasRefreshToken: !!refreshToken
    });

    // Set credentials
    setCredentials(refreshToken);
    
    // Step 1: Extract all existing events for the selected day
    const events = await calendar.events.list({
      auth: oAuth2Client,
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      timeZone: timezone,
      singleEvents: true,
      orderBy: 'startTime'
    });

    const existingEvents = events.data.items || [];
    console.log('📋 Found existing events:', existingEvents.length);
    
    // Log existing events for debugging
    existingEvents.forEach((event, index) => {
      const start = event.start?.dateTime || event.start?.date;
      const end = event.end?.dateTime || event.end?.date;
      console.log(`📅 Event ${index + 1}: ${event.summary} (${start} - ${end})`);
    });

    // Step 2: Create array of all possible hourly slots (09:00 to 17:00)
    const available_slots_array = [];
    const slotDurationMs = duration * 60 * 1000; // Convert to milliseconds
    
    // Loop through each day in the date range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Skip weekends (0 = Sunday, 6 = Saturday) - optional, remove if you want weekends
      const dayOfWeek = currentDate.getDay();
      console.log(`📆 Processing day: ${currentDate.toDateString()}, dayOfWeek: ${dayOfWeek}`);
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Create all possible hourly slots from 9 AM to 5 PM
        for (let hour = 9; hour < 17; hour++) {
          const slotStart = new Date(currentDate);
          slotStart.setHours(hour, 0, 0, 0);
          
          const slotEnd = new Date(slotStart.getTime() + slotDurationMs);
          
          available_slots_array.push({
            start: slotStart,
            end: slotEnd,
            startISO: slotStart.toISOString(),
            endISO: slotEnd.toISOString()
          });
        }
      } else {
        console.log(`🚫 Skipping weekend: ${currentDate.toDateString()}`);
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }

    console.log(`📊 Created ${available_slots_array.length} possible slots`);

    // Step 3: Filter out slots that overlap with existing calendar events
    const availableSlots = available_slots_array.filter(slot => {
      const isAvailable = !existingEvents.some(event => {
        // Handle both all-day events and timed events
        const eventStart = event.start?.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
        const eventEnd = event.end?.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date);
        
        // Check for overlap
        const overlap = (
          (slot.start >= eventStart && slot.start < eventEnd) || // Slot start within event
          (slot.end > eventStart && slot.end <= eventEnd) || // Slot end within event
          (slot.start <= eventStart && slot.end >= eventEnd) // Slot covers entire event
        );
        
        if (overlap) {
          console.log(`❌ Slot ${slot.startISO} - ${slot.endISO} conflicts with event: ${event.summary} (${eventStart.toISOString()} - ${eventEnd.toISOString()})`);
        }
        
        return overlap;
      });
      
      if (isAvailable) {
        console.log(`✅ Available slot: ${slot.startISO} - ${slot.endISO}`);
      }
      
      return isAvailable;
    });

    // Step 4: Format the response
    const formattedSlots = availableSlots.map(slot => ({
      start: slot.startISO,
      end: slot.endISO,
      timezone: timezone
    }));

    console.log(`🎯 Total available slots after filtering: ${formattedSlots.length}`);
    return formattedSlots;
    
  } catch (error) {
    console.error('❌ Error getting available slots from Google Calendar:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    throw error;
  }
};

module.exports = {
  getAuthUrl,
  getTokens,
  createEvent,
  updateEvent,
  deleteEvent,
  listEvents,
  getAvailableSlots
}; 