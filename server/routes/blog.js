const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const blogController = require('../controllers/blogController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// @route   GET api/blog
// @desc    Get all blog posts
// @access  Public
router.get('/', blogController.getAllPosts);

// @route   GET api/blog/:id
// @desc    Get blog post by ID
// @access  Public
router.get('/:id', blogController.getPostById);

// @route   POST api/blog
// @desc    Create a new blog post
// @access  Private (Admin only)
router.post(
  '/',
  [
    auth,
    adminAuth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty()
    ]
  ],
  blogController.createPost
);

// @route   PUT api/blog/:id
// @desc    Update a blog post
// @access  Private (Admin only)
router.put(
  '/:id',
  [
    auth,
    adminAuth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty()
    ]
  ],
  blogController.updatePost
);

// @route   DELETE api/blog/:id
// @desc    Delete a blog post
// @access  Private (Admin only)
router.delete('/:id', auth, adminAuth, blogController.deletePost);

module.exports = router; 