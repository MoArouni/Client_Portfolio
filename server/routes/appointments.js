const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const appointmentsController = require('../controllers/appointmentsController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// @route   GET api/appointments
// @desc    Get all appointments
// @access  Private (Admin only)
router.get('/', auth, adminAuth, appointmentsController.getAllAppointments);

// @route   GET api/appointments/me
// @desc    Get user's appointments
// @access  Private
router.get('/me', auth, appointmentsController.getUserAppointments);

// @route   GET api/appointments/availability
// @desc    Get available time slots
// @access  Public
router.get('/availability', appointmentsController.getAvailability);

// @route   POST api/appointments
// @desc    Book a new appointment
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('start_time', 'Start time is required').not().isEmpty(),
      check('end_time', 'End time is required').not().isEmpty()
    ]
  ],
  appointmentsController.bookAppointment
);

// @route   PUT api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('start_time', 'Start time is required').not().isEmpty(),
      check('end_time', 'End time is required').not().isEmpty()
    ]
  ],
  appointmentsController.updateAppointment
);

// @route   DELETE api/appointments/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', auth, appointmentsController.deleteAppointment);

// @route   PUT api/appointments/:id/status
// @desc    Update appointment status (admin)
// @access  Private (Admin only)
router.put(
  '/:id/status',
  [
    auth,
    adminAuth,
    [
      check('status', 'Status is required').isIn(['confirmed', 'cancelled', 'completed'])
    ]
  ],
  appointmentsController.updateAppointmentStatus
);

// @route   GET api/appointments/sync-google-calendar
// @desc    Sync appointments with Google Calendar (admin)
// @access  Private (Admin only)
router.get(
  '/sync-google-calendar',
  auth,
  adminAuth,
  appointmentsController.syncWithGoogleCalendar
);

// @route   GET api/appointments/test-google-calendar
// @desc    Test Google Calendar connection (admin)
// @access  Private (Admin only)
router.get(
  '/test-google-calendar',
  auth,
  adminAuth,
  appointmentsController.testGoogleCalendar
);

// @route   POST api/appointments/create-default-availability
// @desc    Create default availability schedule (admin)
// @access  Private (Admin only)
router.post(
  '/create-default-availability',
  auth,
  adminAuth,
  appointmentsController.createDefaultAvailability
);

// @route   POST api/appointments/send-reminders
// @desc    Send reminder emails for upcoming appointments (admin)
// @access  Private (Admin only)
router.post(
  '/send-reminders',
  auth,
  adminAuth,
  appointmentsController.sendReminders
);

// @route   POST api/appointments/send-attendance-confirmations
// @desc    Send attendance confirmation emails for appointments 24 hours away (admin)
// @access  Private (Admin only)
router.post(
  '/send-attendance-confirmations',
  auth,
  adminAuth,
  appointmentsController.sendAttendanceConfirmations
);

// @route   GET api/appointments/confirm-attendance/:token
// @desc    Confirm attendance for an appointment
// @access  Public (via token)
router.get(
  '/confirm-attendance/:token',
  appointmentsController.confirmAttendance
);

module.exports = router; 