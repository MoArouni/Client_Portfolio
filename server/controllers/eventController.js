const { validationResult } = require('express-validator');
const { Event, EventRegistration, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all events
// @access  Public
exports.getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, upcoming = false } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    if (upcoming === 'true') {
      whereClause.start_time = { [Op.gte]: new Date() };
    }
    
    const events = await Event.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: EventRegistration,
          as: 'registrations',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      order: [['start_time', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Add registration count to each event
    const eventsWithCount = events.rows.map(event => {
      const eventData = event.toJSON();
      eventData.registrationCount = eventData.registrations ? eventData.registrations.length : 0;
      return eventData;
    });
    
    res.json({
      events: eventsWithCount,
      totalPages: Math.ceil(events.count / limit),
      currentPage: parseInt(page),
      totalEvents: events.count
    });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get single event by ID
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByPk(id, {
      include: [
        {
          model: EventRegistration,
          as: 'registrations',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    // Add registration count
    const eventData = event.toJSON();
    eventData.registrationCount = eventData.registrations ? eventData.registrations.length : 0;
    
    res.json(eventData);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Create new event
// @access  Private (Admin only)
exports.createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, location, start_time, end_time } = req.body;
  let image = null;

  // Handle uploaded image
  if (req.file) {
    image = `/uploads/${req.file.filename}`;
  }

  try {
    // Validate dates
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);
    
    if (startTime >= endTime) {
      return res.status(400).json({ msg: 'End time must be after start time' });
    }
    
    if (startTime < new Date()) {
      return res.status(400).json({ msg: 'Event cannot be scheduled in the past' });
    }

    const event = await Event.create({
      title,
      description,
      location,
      start_time: startTime,
      end_time: endTime,
      image
    });
    
    res.status(201).json(event);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update event
// @access  Private (Admin only)
exports.updateEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { title, description, location, start_time, end_time } = req.body;

  try {
    const event = await Event.findByPk(id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Validate dates if provided
    if (start_time && end_time) {
      const startTime = new Date(start_time);
      const endTime = new Date(end_time);
      
      if (startTime >= endTime) {
        return res.status(400).json({ msg: 'End time must be after start time' });
      }
    }

    // Prepare update data
    const updateData = {
      title,
      description,
      location,
      start_time: start_time ? new Date(start_time) : event.start_time,
      end_time: end_time ? new Date(end_time) : event.end_time
    };

    // Handle uploaded image
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Update the event
    await event.update(updateData);
    
    res.json(event);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete event
// @access  Private (Admin only)
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByPk(id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Delete the event
    await event.destroy();
    
    res.json({ msg: 'Event removed successfully' });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Register for an event
// @access  Private
exports.registerForEvent = async (req, res) => {
  try {
    const { id } = req.params; // event id
    const userId = req.user.id;
    
    // Check if event exists
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    // Check if event is in the future
    if (new Date(event.end_time) < new Date()) {
      return res.status(400).json({ msg: 'Cannot register for past events' });
    }
    
    // Check if user is already registered
    const existingRegistration = await EventRegistration.findOne({
      where: { eventId: id, userId: userId }
    });
    
    if (existingRegistration) {
      return res.status(400).json({ msg: 'You are already registered for this event' });
    }
    
    // Create registration
    const registration = await EventRegistration.create({
      eventId: id,
      userId: userId
    });
    
    // Fetch the registration with user info
    const registrationWithUser = await EventRegistration.findByPk(registration.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    res.status(201).json({
      msg: 'Successfully registered for event',
      registration: registrationWithUser
    });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Unregister from an event
// @access  Private
exports.unregisterFromEvent = async (req, res) => {
  try {
    const { id } = req.params; // event id
    const userId = req.user.id;
    
    // Find the registration
    const registration = await EventRegistration.findOne({
      where: { eventId: id, userId: userId }
    });
    
    if (!registration) {
      return res.status(404).json({ msg: 'Registration not found' });
    }
    
    // Delete the registration
    await registration.destroy();
    
    res.json({ msg: 'Successfully unregistered from event' });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get user's event registrations
// @access  Private
exports.getUserRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const registrations = await EventRegistration.findAll({
      where: { userId: userId },
      include: [
        {
          model: Event,
          as: 'event'
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(registrations);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
}; 