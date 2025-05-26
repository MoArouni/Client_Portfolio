const { validationResult } = require('express-validator');
const { Blog, User, Comment } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all blogs
// @access  Public
exports.getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { content: { [Op.iLike]: `%${search}%` } },
          { tags: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }
    
    const blogs = await Blog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      blogs: blogs.rows,
      totalPages: Math.ceil(blogs.count / limit),
      currentPage: parseInt(page),
      totalBlogs: blogs.count
    });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get single blog by ID
// @access  Public
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name']
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ]
    });
    
    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Create new blog
// @access  Private (Admin only)
exports.createBlog = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, content, tags } = req.body;
  let image = null;

  // Handle uploaded image
  if (req.file) {
    image = `/uploads/${req.file.filename}`;
  }

  try {
    const blog = await Blog.create({
      title,
      content,
      image,
      tags,
      authorId: req.user.id
    });
    
    // Fetch the created blog with author info
    const createdBlog = await Blog.findByPk(blog.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    res.status(201).json(createdBlog);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update blog
// @access  Private (Admin only)
exports.updateBlog = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { title, content, tags } = req.body;

  try {
    const blog = await Blog.findByPk(id);
    
    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }

    // Prepare update data
    const updateData = {
      title,
      content,
      tags
    };

    // Handle uploaded image
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Update the blog
    await blog.update(updateData);
    
    // Fetch updated blog with author info
    const updatedBlog = await Blog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    res.json(updatedBlog);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete blog
// @access  Private (Admin only)
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findByPk(id);
    
    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }

    // Delete associated comments first
    await Comment.destroy({ where: { blogId: id } });
    
    // Delete the blog
    await blog.destroy();
    
    res.json({ msg: 'Blog removed successfully' });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Add comment to blog
// @access  Private
exports.addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params; // blog id
  const { content } = req.body;

  try {
    // Check if blog exists
    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({ msg: 'Blog not found' });
    }

    // Create comment
    const comment = await Comment.create({
      content,
      blogId: id,
      userId: req.user.id
    });
    
    // Fetch the created comment with user info
    const createdComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.status(201).json(createdComment);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update comment
// @access  Private
exports.updateComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { commentId } = req.params;
  const { content } = req.body;

  try {
    const comment = await Comment.findByPk(commentId);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    const user = await User.findByPk(req.user.id);
    if (comment.userId !== req.user.id && user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    // Update comment
    await comment.update({ content });
    
    // Fetch updated comment with user info
    const updatedComment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.json(updatedComment);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete comment
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findByPk(commentId);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    const user = await User.findByPk(req.user.id);
    if (comment.userId !== req.user.id && user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    // Delete comment
    await comment.destroy();
    
    res.json({ msg: 'Comment removed successfully' });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
}; 