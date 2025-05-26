const { validationResult } = require('express-validator');
const { Event } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all events
// @access  Public
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['start_time', 'DESC']]
    });
    
    res.json(events);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get event by ID
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    res.json(event);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get upcoming events
// @access  Public
exports.getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: {
        start_time: { [Op.gt]: new Date() }
      },
      order: [['start_time', 'ASC']]
    });
    
    res.json(events);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Create a new event
// @access  Private (Admin only)
exports.createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, start_time, end_time, location, category, image } = req.body;

  try {
    // Create new event
    const event = await Event.create({
      title,
      description: description || null,
      start_time,
      end_time,
      location: location || null,
      category: category || null,
      image: image || null
    });
    
    res.status(201).json(event);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update an event
// @access  Private (Admin only)
exports.updateEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, start_time, end_time, location, category, image } = req.body;

  try {
    // Find event
    let event = await Event.findByPk(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    // Build update object
    const eventFields = {};
    if (title) eventFields.title = title;
    if (description !== undefined) eventFields.description = description;
    if (start_time) eventFields.start_time = start_time;
    if (end_time) eventFields.end_time = end_time;
    if (location !== undefined) eventFields.location = location;
    if (category !== undefined) eventFields.category = category;
    if (image !== undefined) eventFields.image = image;
    
    // Update the event
    await event.update(eventFields);
    
    // Get updated event
    const updatedEvent = await Event.findByPk(req.params.id);
    
    res.json(updatedEvent);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete an event
// @access  Private (Admin only)
exports.deleteEvent = async (req, res) => {
  try {
    // Find the event
    const event = await Event.findByPk(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    // Delete the event
    await event.destroy();
    
    res.json({ msg: 'Event removed' });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
}; 