const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const blogController = require('../controllers/blogController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

// @route   GET api/blogs
// @desc    Get all blogs
// @access  Public
router.get('/', blogController.getAllBlogs);

// @route   GET api/blogs/:id
// @desc    Get single blog by ID
// @access  Public
router.get('/:id', blogController.getBlogById);

// @route   POST api/blogs
// @desc    Create new blog
// @access  Private (Admin only)
router.post(
  '/',
  [
    auth,
    adminAuth,
    upload.single('image'),
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty()
    ]
  ],
  blogController.createBlog
);

// @route   PUT api/blogs/:id
// @desc    Update blog
// @access  Private (Admin only)
router.put(
  '/:id',
  [
    auth,
    adminAuth,
    upload.single('image'),
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty()
    ]
  ],
  blogController.updateBlog
);

// @route   DELETE api/blogs/:id
// @desc    Delete blog
// @access  Private (Admin only)
router.delete('/:id', auth, adminAuth, blogController.deleteBlog);

// @route   POST api/blogs/:id/comments
// @desc    Add comment to blog
// @access  Private
router.post(
  '/:id/comments',
  [
    auth,
    [
      check('content', 'Comment content is required').not().isEmpty()
    ]
  ],
  blogController.addComment
);

// @route   PUT api/blogs/comments/:commentId
// @desc    Update comment
// @access  Private
router.put(
  '/comments/:commentId',
  [
    auth,
    [
      check('content', 'Comment content is required').not().isEmpty()
    ]
  ],
  blogController.updateComment
);

// @route   DELETE api/blogs/comments/:commentId
// @desc    Delete comment
// @access  Private
router.delete('/comments/:commentId', auth, blogController.deleteComment);

module.exports = router; 