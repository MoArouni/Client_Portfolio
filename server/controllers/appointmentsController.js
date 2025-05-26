const { validationResult } = require('express-validator');
const { Appointment, User, Availability } = require('../models');
const { Op } = require('sequelize');
const googleCalendar = require('../services/googleCalendar');
const emailService = require('../services/emailService');
const config = require('../config/default');

// @desc    Get all appointments (admin)
// @access  Private (Admin only)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ],
      order: [['start_time', 'DESC']]
    });
    
    res.json(appointments);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get user's appointments
// @access  Private
exports.getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { userId: req.user.id },
      order: [['start_time', 'DESC']]
    });
    
    res.json(appointments);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get available time slots
// @access  Public
exports.getAvailability = async (req, res) => {
  try {
    const { startDate, endDate, timezone } = req.query;
    
    console.log('🔍 getAvailability called with:', { startDate, endDate, timezone });
    
    // Default to next 7 days if no date range specified
    const start = startDate ? new Date(startDate + 'T00:00:00') : new Date();
    const end = endDate ? new Date(endDate + 'T23:59:59') : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Use provided timezone or default to America/New_York
    const userTimezone = timezone || 'America/New_York';
    
    console.log('📅 Processed dates:', {
      start: start.toISOString(),
      end: end.toISOString(),
      timezone: userTimezone,
      startLocal: start.toString(),
      endLocal: end.toString()
    });
    
    // Find admin user to check if Google Calendar is connected
    const adminUser = await User.findOne({ 
      where: { role: 'admin' } 
    });

    console.log('👤 Admin user found:', {
      hasAdmin: !!adminUser,
      hasGoogleToken: !!(adminUser?.googleRefreshToken),
      adminEmail: adminUser?.email
    });

    // If admin has Google Calendar connected, use it for availability
    if (adminUser && adminUser.googleRefreshToken) {
      try {
        console.log('🔗 Using Google Calendar for availability...');
        
        // Get available slots from Google Calendar with timezone
        const availableSlots = await googleCalendar.getAvailableSlots(
          adminUser.googleRefreshToken,
          start,
          end,
          60, // 1-hour slots
          userTimezone
        );
        
        console.log('✅ Google Calendar returned slots:', availableSlots.length);
        return res.json(availableSlots);
      } catch (error) {
        console.error('❌ Error getting Google Calendar availability:', error);
        console.log('🔄 Falling back to standard availability...');
        // Fall back to standard availability if Google Calendar fails
      }
    } else {
      console.log('📋 Using standard availability (no Google Calendar)...');
    }
    
    // Standard availability (fallback if Google Calendar not connected or fails)
    const availableTimes = await Availability.findAll({
      where: { is_available: true },
      order: [
        ['day_of_week', 'ASC'],
        ['start_time', 'ASC']
      ]
    });
    
    console.log('📊 Found availability rules:', availableTimes.length);
    
    // Get booked appointments to exclude
    const bookedSlots = await Appointment.findAll({
      where: {
        start_time: { [Op.gte]: start, [Op.lte]: end },
        status: { [Op.ne]: 'cancelled' }
      }
    });
    
    console.log('📅 Found booked appointments:', bookedSlots.length);
    
    // Generate available slots
    const availableSlots = generateAvailableTimeSlots(availableTimes, bookedSlots, start, end);
    
    console.log('🎯 Generated standard availability slots:', availableSlots.length);
    res.json(availableSlots);
  } catch (err) {
    console.error('âŒ Server error in getAvailability:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Book a new appointment
// @access  Private
exports.bookAppointment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, start_time, end_time, description, timezone } = req.body;
  const user_id = req.user.id;

  try {
    // Check if the time slot is available
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);
    
    if (startTime >= endTime) {
      return res.status(400).json({ msg: 'End time must be after start time' });
    }
    
    // Check if booking is at least 2 days in advance
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)); // 2 days from now
    
    if (startTime < twoDaysFromNow) {
      return res.status(400).json({ 
        msg: 'Appointments must be booked at least 2 days in advance. Please select a date that is at least 48 hours from now.' 
      });
    }
    
    console.log('🔍 Booking request:', {
      title,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      timezone: timezone || 'UTC',
      user_id
    });
    
    // Check if user already has a booking this week
    const weekStart = new Date(startTime);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // End of week (Saturday)
    weekEnd.setHours(23, 59, 59, 999);
    
    console.log('📅 Checking for existing bookings this week:', {
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString()
    });
    
    const existingBooking = await Appointment.findOne({
      where: {
        userId: user_id,
        start_time: {
          [Op.gte]: weekStart,
          [Op.lte]: weekEnd
        },
        status: { [Op.ne]: 'cancelled' }
      }
    });
    
    if (existingBooking) {
      console.log('❌ User already has a booking this week:', existingBooking.id);
      return res.status(400).json({ 
        msg: 'You can only book one appointment per week. Please wait until next week or cancel your existing appointment.' 
      });
    }
    
    // Find the admin user for Google Calendar integration
    const adminUser = await User.findOne({ 
      where: { role: 'admin' } 
    });
    
    // Check availability using the same method as the frontend
    let isAvailable = false;
    
    if (adminUser && adminUser.googleRefreshToken) {
      try {
        console.log('🔗 Checking availability via Google Calendar...');
        
        // Get the date for the appointment
        const appointmentDate = new Date(startTime);
        const startOfDay = new Date(appointmentDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(appointmentDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Use the same timezone as the frontend request, or default to America/New_York
        const requestTimezone = timezone || 'America/New_York';
        
        // Get available slots for this day using the same timezone
        const availableSlots = await googleCalendar.getAvailableSlots(
          adminUser.googleRefreshToken,
          startOfDay,
          endOfDay,
          60, // 1-hour slots
          requestTimezone // Use the same timezone as the frontend
        );
        
        console.log('📅 Available slots from Google Calendar:', availableSlots.length);
        console.log('🔍 Looking for slot matching:', {
          start: startTime.toISOString(),
          end: endTime.toISOString()
        });
        
        // Check if the requested time slot matches any available slot
        isAvailable = availableSlots.some(slot => {
          const slotStart = new Date(slot.start);
          const slotEnd = new Date(slot.end);
          
          // Check if the requested time exactly matches an available slot
          const matches = slotStart.getTime() === startTime.getTime() && 
                         slotEnd.getTime() === endTime.getTime();
          
          if (matches) {
            console.log('✅ Found matching available slot:', {
              requested: `${startTime.toISOString()} - ${endTime.toISOString()}`,
              available: `${slot.start} - ${slot.end}`
            });
          } else {
            console.log('❌ Slot mismatch:', {
              requested: `${startTime.toISOString()} - ${endTime.toISOString()}`,
              available: `${slot.start} - ${slot.end}`,
              timeDiff: slotStart.getTime() - startTime.getTime()
            });
          }
          
          return matches;
        });
        
        console.log('🎯 Slot availability check result:', isAvailable);
        
      } catch (error) {
        console.error('❌ Error checking Google Calendar availability:', error);
        // Fall back to database availability check
        isAvailable = await checkTimeAvailability(startTime, endTime);
        console.log('🔄 Fallback to database availability check:', isAvailable);
      }
    } else {
      console.log('📋 Using database availability check (no Google Calendar)...');
      // Use database availability check if Google Calendar not connected
      isAvailable = await checkTimeAvailability(startTime, endTime);
    }
    
    if (!isAvailable) {
      console.log('❌ Time slot not available for booking');
      return res.status(400).json({ msg: 'Selected time is not available' });
    }
    
    console.log('✅ Time slot is available, creating appointment...');
    
    // Create appointment in the database
    const appointment = await Appointment.create({
      userId: user_id,
      title,
      start_time: startTime,
      end_time: endTime,
      description,
      status: 'confirmed'
    });
    
    console.log('📝 Appointment created in database:', appointment.id);
    
    // If admin has Google Calendar connected, create the event
    if (adminUser && adminUser.googleRefreshToken) {
      try {
        console.log('📅 Creating Google Calendar event...');
        console.log('Admin user found:', { id: adminUser.id, email: adminUser.email });
        console.log('Google refresh token exists:', !!adminUser.googleRefreshToken);
        
        const calendarEvent = await googleCalendar.createEvent(
          adminUser.googleRefreshToken, 
          {
            title,
            description,
            start_time: startTime,
            end_time: endTime,
            attendees: [{ email: req.user.email }]
          }
        );
        
        // Store Google Calendar event ID
        appointment.googleEventId = calendarEvent.id;
        await appointment.save();
        console.log('✅ Google Calendar event created and saved:', calendarEvent.id);
      } catch (error) {
        console.error('❌ Error creating Google Calendar event:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          status: error.status
        });
        // Continue without Google Calendar integration
      }
    } else {
      console.log('⚠️ Google Calendar integration not available:', {
        adminUserExists: !!adminUser,
        hasRefreshToken: adminUser ? !!adminUser.googleRefreshToken : false
      });
    }
    
    // Get user info for the email
    const user = await User.findByPk(user_id);
    
    // Send confirmation email
    if (user) {
      await emailService.sendAppointmentConfirmation(user, appointment);
    }
    
    // Schedule reminder email (1 hour before appointment)
    scheduleReminder(appointment);
    
    console.log('🎉 Appointment booking completed successfully');
    res.status(201).json(appointment);
  } catch (err) {
    console.error('âŒ Server error in bookAppointment:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update appointment
// @access  Private
exports.updateAppointment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, start_time, end_time, description } = req.body;
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    // Check if appointment exists
    let appointment = await Appointment.findByPk(id);
    
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Check if the appointment belongs to the user or user is admin
    const user = await User.findByPk(user_id);
    
    if (appointment.userId !== user_id && (!user || user.role !== 'admin')) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    // Update the appointment fields
    const updatedFields = {
      title,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      description
    };
    
    await appointment.update(updatedFields);
    
    // Update Google Calendar event if it exists
    if (appointment.googleEventId && user.googleRefreshToken) {
      try {
        await googleCalendar.updateEvent(
          user.googleRefreshToken, 
          appointment.googleEventId,
          {
            title,
            description,
            start_time: new Date(start_time),
            end_time: new Date(end_time)
          }
        );
      } catch (error) {
        console.error('Error updating Google Calendar event:', error);
        // Continue without Google Calendar update
      }
    }
    
    // Get updated appointment
    const updatedAppointment = await Appointment.findByPk(id);
    
    res.json(updatedAppointment);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update appointment status
// @access  Private (Admin only)
exports.updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status' });
  }

  try {
    // Check if appointment exists
    let appointment = await Appointment.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });
    
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Update status
    await appointment.update({ status });
    
    // Update Google Calendar event if it exists
    const adminUser = await User.findOne({ 
      where: { role: 'admin' } 
    });
    
    if (appointment.googleEventId && adminUser?.googleRefreshToken) {
      try {
        if (status === 'cancelled') {
          await googleCalendar.deleteEvent(
            adminUser.googleRefreshToken, 
            appointment.googleEventId
          );
        } else {
          // Update event with status in description
          const description = `${appointment.description || ''}\nStatus: ${status}`;
          await googleCalendar.updateEvent(
            adminUser.googleRefreshToken, 
            appointment.googleEventId,
            {
              description
            }
          );
        }
      } catch (error) {
        console.error('Error updating Google Calendar event:', error);
        // Continue without Google Calendar update
      }
    }
    
    // Send status update email
    if (appointment.user) {
      sendStatusUpdateEmail(appointment, status);
    }
    
    // Get updated appointment
    const updatedAppointment = await Appointment.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });
    
    res.json(updatedAppointment);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete appointment
// @access  Private
exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const { cancellationReason, reasonLabel } = req.body;

  try {
    // Check if appointment exists
    const appointment = await Appointment.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });
    
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Check if the appointment belongs to the user or user is admin
    const user = await User.findByPk(user_id);
    
    if (appointment.userId !== user_id && (!user || user.role !== 'admin')) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    // Delete Google Calendar event if it exists
    const adminUser = await User.findOne({ 
      where: { role: 'admin' } 
    });
    
    if (appointment.googleEventId && adminUser?.googleRefreshToken) {
      try {
        await googleCalendar.deleteEvent(
          adminUser.googleRefreshToken, 
          appointment.googleEventId
        );
        console.log('✅ Google Calendar event deleted:', appointment.googleEventId);
      } catch (error) {
        console.error('❌ Error deleting Google Calendar event:', error);
        // Continue without Google Calendar update
      }
    }
    
    // Send cancellation email to the user
    if (appointment.user) {
      await emailService.sendAppointmentCancellation(appointment.user, appointment, reasonLabel || cancellationReason);
    }
    
    // Delete the appointment
    await appointment.destroy();
    
    console.log('✅ Appointment cancelled and deleted:', {
      id: appointment.id,
      title: appointment.title,
      reason: reasonLabel || cancellationReason || 'No reason provided'
    });
    
    res.json({ 
      msg: 'Appointment cancelled successfully',
      cancellationReason: reasonLabel || cancellationReason
    });
  } catch (err) {
    console.error('❌ Server error in deleteAppointment:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Sync with Google Calendar (for admin)
// @access  Private (Admin only)
exports.syncWithGoogleCalendar = async (req, res) => {
  try {
    // Get the admin user
    const adminUser = await User.findOne({ 
      where: { role: 'admin' } 
    });
    
    // Check if Google Calendar is connected
    if (!adminUser || !adminUser.googleRefreshToken) {
      return res.status(400).json({ msg: 'Google Calendar not connected' });
    }
    
    // Get events from Google Calendar
    const events = await googleCalendar.listEvents(adminUser.googleRefreshToken, 100);
    
    // Get all appointments from database
    const appointments = await Appointment.findAll({
      where: { status: { [Op.ne]: 'cancelled' } }
    });
    
    // Track processed appointments
    const processedAppointments = new Set();
    let updatedCount = 0;
    let createdCount = 0;
    
    // Process Google Calendar events
    for (const event of events) {
      // Skip events without start/end time
      if (!event.start?.dateTime || !event.end?.dateTime) continue;
      
      // Look for matching appointment in database
      const existingAppointment = appointments.find(app => app.googleEventId === event.id);
      
      if (existingAppointment) {
        // Update existing appointment from Google Calendar
        await existingAppointment.update({
          title: event.summary,
          description: event.description || '',
          start_time: new Date(event.start.dateTime),
          end_time: new Date(event.end.dateTime),
          status: 'confirmed'
        });
        processedAppointments.add(existingAppointment.id);
        updatedCount++;
      } else {
        // Create new appointment from Google Calendar
        // We only create if it looks like a consultation appointment (checking summary)
        if (event.summary?.toLowerCase().includes('consultation') || 
            event.summary?.toLowerCase().includes('appointment') ||
            event.summary?.toLowerCase().includes('booking') ||
            event.description?.toLowerCase().includes('consultation')) {
          
          // Find user from attendees, if possible
          let userId = adminUser.id; // Default to admin
          if (event.attendees && event.attendees.length > 0) {
            for (const attendee of event.attendees) {
              const user = await User.findOne({ where: { email: attendee.email } });
              if (user && user.id !== adminUser.id) {
                userId = user.id;
                break;
              }
            }
          }
          
          // Create appointment
          await Appointment.create({
            userId: userId,
            title: event.summary,
            description: event.description || '',
            start_time: new Date(event.start.dateTime),
            end_time: new Date(event.end.dateTime),
            status: 'confirmed',
            googleEventId: event.id
          });
          createdCount++;
        }
      }
    }
    
    // Check for appointments that are in database but not in Google Calendar
    // We don't delete them, just update their status if needed
    for (const appointment of appointments) {
      if (!processedAppointments.has(appointment.id) && appointment.googleEventId) {
        // Appointment was in Google Calendar but not found in recent events
        // This might be because it was deleted or it's too far in the past/future
        // We'll leave it as is to avoid data loss
      }
    }
    
    res.json({ 
      success: true, 
      updatedCount, 
      createdCount,
      totalSynced: updatedCount + createdCount
    });
  } catch (err) {
    console.error('Error syncing with Google Calendar:', err);
    res.status(500).send('Server error');
  }
};

// @desc    Test Google Calendar connection
// @access  Private (Admin only)
exports.testGoogleCalendar = async (req, res) => {
  try {
    // Find admin user
    const adminUser = await User.findOne({ 
      where: { role: 'admin' } 
    });

    if (!adminUser) {
      return res.status(404).json({ msg: 'Admin user not found' });
    }

    if (!adminUser.googleRefreshToken) {
      return res.status(400).json({ msg: 'Google Calendar not connected' });
    }

    // Test the connection by trying to list events
    const events = await googleCalendar.listEvents(adminUser.googleRefreshToken, 5);
    
    // Test getting available slots for today and tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const availableSlots = await googleCalendar.getAvailableSlots(
      adminUser.googleRefreshToken,
      today,
      tomorrow,
      60, // 1-hour slots
      'America/New_York' // Test timezone
    );

    res.json({
      success: true,
      message: 'Google Calendar connection working',
      adminEmail: adminUser.email,
      eventsCount: events.length,
      availableSlotsCount: availableSlots.length,
      testTimezone: 'America/New_York',
      events: events.slice(0, 3).map(event => ({
        summary: event.summary,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date
      })),
      availableSlots: availableSlots.slice(0, 5) // Show first 5 slots
    });
  } catch (err) {
    console.error('Google Calendar test error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Google Calendar connection failed',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// @desc    Create default availability schedule
// @access  Private (Admin only)
exports.createDefaultAvailability = async (req, res) => {
  try {
    // Check if availability already exists
    const existingAvailability = await Availability.findAll();
    
    if (existingAvailability.length > 0) {
      return res.status(400).json({ msg: 'Availability schedule already exists' });
    }

    // Create default availability (Monday to Friday, 9 AM to 5 PM)
    const defaultSchedule = [];
    
    // Monday (1) to Friday (5)
    for (let day = 1; day <= 5; day++) {
      defaultSchedule.push({
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true
      });
    }

    // Create the availability records
    await Availability.bulkCreate(defaultSchedule);

    res.json({
      success: true,
      message: 'Default availability schedule created',
      schedule: defaultSchedule
    });
  } catch (err) {
    console.error('Error creating default availability:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create default availability',
      error: err.message 
    });
  }
};

// @desc    Send reminder emails for upcoming appointments
// @access  Private (Admin only) - typically called by a cron job
exports.sendReminders = async (req, res) => {
  try {
    // Find appointments that start in 1 hour (with a 5-minute window)
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const reminderWindow = new Date(now.getTime() + 65 * 60 * 1000); // 1 hour 5 minutes from now
    
    console.log('🔍 Checking for appointments needing reminders:', {
      now: now.toISOString(),
      oneHourFromNow: oneHourFromNow.toISOString(),
      reminderWindow: reminderWindow.toISOString()
    });
    
    const upcomingAppointments = await Appointment.findAll({
      where: {
        start_time: {
          [Op.gte]: oneHourFromNow,
          [Op.lte]: reminderWindow
        },
        status: { [Op.ne]: 'cancelled' },
        reminderSent: { [Op.ne]: true } // Only send if reminder hasn't been sent
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ]
    });
    
    console.log(`🎯 Found ${upcomingAppointments.length} appointments needing reminders`);
    
    let sentCount = 0;
    
    for (const appointment of upcomingAppointments) {
      try {
        // Send reminder email
        await emailService.sendAppointmentReminder(appointment.user, appointment);
        
        // Mark reminder as sent
        await appointment.update({ reminderSent: true });
        
        sentCount++;
        console.log(`✅ Reminder sent for appointment #${appointment.id}`);
      } catch (error) {
        console.error(`❌ Failed to send reminder for appointment #${appointment.id}:`, error);
      }
    }
    
    const result = {
      success: true,
      message: `Processed ${upcomingAppointments.length} appointments, sent ${sentCount} reminders`,
      appointmentsChecked: upcomingAppointments.length,
      remindersSent: sentCount
    };
    
    console.log('🎉 Reminder batch completed:', result);
    
    if (res) {
      res.json(result);
    }
    
    return result;
  } catch (err) {
    console.error('❌ Error sending reminders:', err.message);
    const errorResult = {
      success: false,
      message: 'Failed to send reminders',
      error: err.message
    };
    
    if (res) {
      res.status(500).json(errorResult);
    }
    
    return errorResult;
  }
};

// @desc    Send attendance confirmation emails for appointments 24 hours away
// @access  Private (Admin only) - typically called by a cron job
exports.sendAttendanceConfirmations = async (req, res) => {
  try {
    // Find appointments that start in 24 hours (with a 1-hour window)
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    const confirmationWindow = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours from now
    
    console.log('🔍 Checking for appointments needing attendance confirmation:', {
      now: now.toISOString(),
      twentyFourHoursFromNow: twentyFourHoursFromNow.toISOString(),
      confirmationWindow: confirmationWindow.toISOString()
    });
    
    const upcomingAppointments = await Appointment.findAll({
      where: {
        start_time: {
          [Op.gte]: twentyFourHoursFromNow,
          [Op.lte]: confirmationWindow
        },
        status: { [Op.ne]: 'cancelled' },
        confirmationSent: { [Op.ne]: true } // Only send if confirmation hasn't been sent
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        }
      ]
    });
    
    console.log(`🎯 Found ${upcomingAppointments.length} appointments needing attendance confirmation`);
    
    let sentCount = 0;
    
    for (const appointment of upcomingAppointments) {
      try {
        // Generate confirmation token
        const confirmationToken = require('crypto').randomBytes(32).toString('hex');
        
        // Update appointment with confirmation token
        await appointment.update({ 
          confirmationToken,
          confirmationSent: true 
        });
        
        // Send attendance confirmation email
        await emailService.sendAttendanceConfirmation(appointment.user, appointment, confirmationToken);
        
        sentCount++;
        console.log(`✅ Attendance confirmation sent for appointment #${appointment.id}`);
      } catch (error) {
        console.error(`❌ Failed to send attendance confirmation for appointment #${appointment.id}:`, error);
      }
    }
    
    const result = {
      success: true,
      message: `Processed ${upcomingAppointments.length} appointments, sent ${sentCount} attendance confirmations`,
      appointmentsChecked: upcomingAppointments.length,
      confirmationsSent: sentCount
    };
    
    console.log('🎉 Attendance confirmation batch completed:', result);
    
    if (res) {
      res.json(result);
    }
    
    return result;
  } catch (err) {
    console.error('❌ Error sending attendance confirmations:', err.message);
    const errorResult = {
      success: false,
      message: 'Failed to send attendance confirmations',
      error: err.message
    };
    
    if (res) {
      res.status(500).json(errorResult);
    }
    
    return errorResult;
  }
};

// @desc    Confirm attendance for an appointment
// @access  Public (via token)
exports.confirmAttendance = async (req, res) => {
  const { token } = req.params;

  try {
    // Find appointment with valid confirmation token
    const appointment = await Appointment.findOne({
      where: {
        confirmationToken: token,
        status: 'confirmed'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ 
        msg: 'Invalid confirmation link or appointment not found.' 
      });
    }

    // Check if already confirmed
    if (appointment.attendanceConfirmed) {
      return res.json({ 
        msg: 'Attendance already confirmed. Thank you!',
        appointment: {
          title: appointment.title,
          date: appointment.start_time,
          confirmed: true
        }
      });
    }

    // Confirm attendance
    appointment.attendanceConfirmed = true;
    await appointment.save();

    console.log(`✅ Attendance confirmed for appointment: ${appointment.title} by ${appointment.user.name}`);

    res.json({ 
      msg: 'Thank you for confirming your attendance! We look forward to meeting with you.',
      appointment: {
        title: appointment.title,
        date: appointment.start_time,
        confirmed: true
      }
    });
  } catch (err) {
    console.error('❌ Server error in confirmAttendance:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Schedule reminder for a specific appointment (helper function)
const scheduleReminder = (appointment) => {
  const appointmentTime = new Date(appointment.start_time);
  const reminderTime = new Date(appointmentTime.getTime() - 60 * 60 * 1000); // 1 hour before
  const now = new Date();
  
  // Only schedule if the reminder time is in the future
  if (reminderTime > now) {
    const delay = reminderTime.getTime() - now.getTime();
    
    console.log(`🕒 Scheduling reminder for appointment #${appointment.id}:`, {
      appointmentTime: appointmentTime.toISOString(),
      reminderTime: reminderTime.toISOString(),
      delayMinutes: Math.round(delay / (1000 * 60))
    });
    
    // Schedule the reminder
    setTimeout(async () => {
      try {
        // Double-check the appointment still exists and hasn't been cancelled
        const currentAppointment = await Appointment.findByPk(appointment.id, {
          include: [{ model: User, as: 'user' }]
        });
        
        if (currentAppointment && currentAppointment.status !== 'cancelled' && !currentAppointment.reminderSent) {
          await emailService.sendAppointmentReminder(currentAppointment.user, currentAppointment);
          await currentAppointment.update({ reminderSent: true });
          console.log(`✅ Scheduled reminder sent for appointment #${appointment.id}`);
        } else {
          console.log(`🙅 Skipping reminder for appointment #${appointment.id} (cancelled or already sent)`);
        }
      } catch (error) {
        console.error(`❌ Error sending scheduled reminder for appointment #${appointment.id}:`, error);
      }
    }, delay);
  } else {
    console.log(`🙅 Reminder time has passed for appointment #${appointment.id}, skipping schedule`);
  }
};

// Helper functions

// Generate available time slots based on availability and booked appointments
function generateAvailableTimeSlots(availableTimes, bookedSlots, startDate, endDate) {
  const availableSlots = [];
  const currentDate = new Date(startDate);
  
  // Loop through each day in the date range
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Find availability rules for this day of week
    const dayAvailability = availableTimes.filter(time => time.day_of_week === dayOfWeek);
    
    if (dayAvailability.length > 0) {
      dayAvailability.forEach(availability => {
        // Convert availability times to Date objects for this specific date
        const [startHour, startMinute] = availability.start_time.split(':').map(Number);
        const [endHour, endMinute] = availability.end_time.split(':').map(Number);
        
        const startDateTime = new Date(currentDate);
        startDateTime.setHours(startHour, startMinute, 0, 0);
        
        const endDateTime = new Date(currentDate);
        endDateTime.setHours(endHour, endMinute, 0, 0);
        
        // Generate 30-minute slots within this availability block
        const slotDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
        let slotStart = new Date(startDateTime);
        
        while (slotStart < endDateTime) {
          const slotEnd = new Date(slotStart.getTime() + slotDuration);
          
          if (slotEnd <= endDateTime) {
            // Check if this slot overlaps with any booked appointments
            const isBooked = bookedSlots.some(booking => {
              const bookingStart = new Date(booking.start_time);
              const bookingEnd = new Date(booking.end_time);
              
              return (
                (slotStart >= bookingStart && slotStart < bookingEnd) ||
                (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                (slotStart <= bookingStart && slotEnd >= bookingEnd)
              );
            });
            
            if (!isBooked) {
              availableSlots.push({
                start: slotStart.toISOString(),
                end: slotEnd.toISOString()
              });
            }
          }
          
          // Move to next slot
          slotStart = new Date(slotStart.getTime() + slotDuration);
        }
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0);
  }
  
  return availableSlots;
}

// Check if a time slot is available
async function checkTimeAvailability(startTime, endTime) {
  // Format times for DB comparison
  const dayOfWeek = startTime.getDay();
  const startTimeStr = formatTimeString(startTime);
  const endTimeStr = formatTimeString(endTime);
  
  // Check if this time is within available hours for this day of week
  const availableBlock = await Availability.findOne({
    where: {
      day_of_week: dayOfWeek,
      start_time: { [Op.lte]: startTimeStr },
      end_time: { [Op.gte]: endTimeStr },
      is_available: true
    }
  });
  
  if (!availableBlock) {
    return false;
  }
  
  // Check if this slot overlaps with any existing appointments
  const overlappingAppointment = await Appointment.findOne({
    where: {
      [Op.or]: [
        { start_time: { [Op.lte]: startTime }, end_time: { [Op.gt]: startTime } },
        { start_time: { [Op.lt]: endTime }, end_time: { [Op.gte]: endTime } },
        { start_time: { [Op.gte]: startTime }, end_time: { [Op.lte]: endTime } }
      ],
      status: { [Op.ne]: 'cancelled' }
    }
  });
  
  return !overlappingAppointment;
}

// Format time as HH:MM
const formatTimeString = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

module.exports = {
  getAllAppointments: exports.getAllAppointments,
  getUserAppointments: exports.getUserAppointments,
  getAvailability: exports.getAvailability,
  bookAppointment: exports.bookAppointment,
  updateAppointment: exports.updateAppointment,
  updateAppointmentStatus: exports.updateAppointmentStatus,
  deleteAppointment: exports.deleteAppointment,
  syncWithGoogleCalendar: exports.syncWithGoogleCalendar,
  testGoogleCalendar: exports.testGoogleCalendar,
  createDefaultAvailability: exports.createDefaultAvailability,
  sendReminders: exports.sendReminders,
  sendAttendanceConfirmations: exports.sendAttendanceConfirmations,
  confirmAttendance: exports.confirmAttendance
};
