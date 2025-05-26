const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

// @route   GET api/events
// @desc    Get all events
// @access  Public
router.get('/', eventController.getAllEvents);

// @route   GET api/events/user/registrations
// @desc    Get user's event registrations
// @access  Private
router.get('/user/registrations', auth, eventController.getUserRegistrations);

// @route   GET api/events/:id
// @desc    Get single event by ID
// @access  Public
router.get('/:id', eventController.getEventById);

// @route   POST api/events/:id/register
// @desc    Register for an event
// @access  Private
router.post('/:id/register', auth, eventController.registerForEvent);

// @route   DELETE api/events/:id/register
// @desc    Unregister from an event
// @access  Private
router.delete('/:id/register', auth, eventController.unregisterFromEvent);

// @route   POST api/events
// @desc    Create new event
// @access  Private (Admin only)
router.post(
  '/',
  [
    auth,
    adminAuth,
    upload.single('image'),
    [
      check('title', 'Title is required').not().isEmpty(),
      check('start_time', 'Start time is required').not().isEmpty(),
      check('end_time', 'End time is required').not().isEmpty()
    ]
  ],
  eventController.createEvent
);

// @route   PUT api/events/:id
// @desc    Update event
// @access  Private (Admin only)
router.put(
  '/:id',
  [
    auth,
    adminAuth,
    upload.single('image'),
    [
      check('title', 'Title is required').not().isEmpty(),
      check('start_time', 'Start time is required').not().isEmpty(),
      check('end_time', 'End time is required').not().isEmpty()
    ]
  ],
  eventController.updateEvent
);

// @route   DELETE api/events/:id
// @desc    Delete event
// @access  Private (Admin only)
router.delete('/:id', auth, adminAuth, eventController.deleteEvent);

module.exports = router; 