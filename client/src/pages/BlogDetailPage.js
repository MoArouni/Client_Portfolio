import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Chip, CircularProgress, Button,
  TextField, Card, CardContent, Avatar, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentIcon from '@mui/icons-material/Comment';

// Attempt to import react-helmet or handle its absence
let Helmet;
try {
  Helmet = require('react-helmet').Helmet;
} catch (e) {
  Helmet = ({ children }) => <>{children}</>;
}

const BlogDetailPage = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/blogs/${id}`);
      setBlog(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blog:', err);
      setError('Failed to load blog');
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingComment(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        }
      };

      await axios.post(`/api/blogs/${id}/comments`, { content: comment }, config);
      setComment('');
      fetchBlog(); // Refresh to get updated comments
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditCommentText(comment.content);
    setOpenEditDialog(true);
  };

  const handleUpdateComment = async () => {
    if (!editCommentText.trim()) return;

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        }
      };

      await axios.put(`/api/blogs/comments/${editingComment.id}`, 
        { content: editCommentText }, config);
      
      setOpenEditDialog(false);
      setEditingComment(null);
      setEditCommentText('');
      fetchBlog();
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const config = {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        };

        await axios.delete(`/api/blogs/comments/${commentId}`, config);
        fetchBlog();
      } catch (err) {
        console.error('Error deleting comment:', err);
        setError('Failed to delete comment');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const canEditComment = (comment) => {
    return user && (user.id === comment.userId || user.role === 'admin');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !blog) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error" sx={{ textAlign: 'center' }}>
          {error || 'Blog not found'}
        </Typography>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button onClick={() => navigate('/blog')} startIcon={<ArrowBackIcon />}>
            Back to Blog
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{blog.title} | Blog</title>
        <meta name="description" content={blog.content.substring(0, 160)} />
      </Helmet>
      
      <Container sx={{ mt: 4, mb: 8 }}>
        {/* Back Button */}
        <Button 
          onClick={() => navigate('/blog')} 
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 3 }}
        >
          Back to Blog
        </Button>

        {/* Blog Content */}
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          {/* Blog Image */}
          {blog.image && (
            <Box
              component="img"
              src={blog.image}
              alt={blog.title}
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
                borderRadius: 2,
                mb: 3
              }}
            />
          )}

          {/* Blog Title */}
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 'bold',
            color: theme.palette.text.primary
          }}>
            {blog.title}
          </Typography>

          {/* Blog Meta */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="textSecondary">
                {blog.author?.name || 'Admin'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="textSecondary">
                {formatDate(blog.created_at)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CommentIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="textSecondary">
                {blog.comments?.length || 0} comments
              </Typography>
            </Box>
          </Box>

          {/* Tags */}
          {blog.tags && (
            <Box sx={{ mb: 3 }}>
              {blog.tags.split(',').map((tag, index) => (
                <Chip 
                  key={index} 
                  label={tag.trim()} 
                  sx={{ 
                    mr: 1, 
                    mb: 1,
                    background: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText
                  }} 
                />
              ))}
            </Box>
          )}

          <Divider sx={{ mb: 3 }} />

          {/* Blog Content */}
          <Typography variant="body1" sx={{ 
            lineHeight: 1.8,
            fontSize: '1.1rem',
            color: theme.palette.text.primary,
            whiteSpace: 'pre-wrap'
          }}>
            {blog.content}
          </Typography>
        </Paper>

        {/* Comments Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ 
            fontWeight: 'bold',
            color: theme.palette.primary.main
          }}>
            Comments ({blog.comments?.length || 0})
          </Typography>

          {/* Add Comment Form */}
          {isAuthenticated ? (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Add a Comment
              </Typography>
              <Box component="form" onSubmit={handleAddComment}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Write your comment here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submittingComment || !comment.trim()}
                >
                  {submittingComment ? <CircularProgress size={24} /> : 'Post Comment'}
                </Button>
              </Box>
            </Paper>
          ) : (
            <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                Please log in to leave a comment
              </Typography>
              <Button variant="contained" onClick={() => navigate('/login')}>
                Log In
              </Button>
            </Paper>
          )}

          {/* Comments List */}
          {blog.comments && blog.comments.length > 0 ? (
            <Box>
              {blog.comments.map((comment) => (
                <Card key={comment.id} elevation={1} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                          {comment.user?.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {comment.user?.name || 'User'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {formatDate(comment.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {canEditComment(comment) && (
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleEditComment(comment)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                    
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {comment.content}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
              No comments yet. Be the first to comment!
            </Typography>
          )}
        </Box>

        {/* Edit Comment Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Comment</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={editCommentText}
              onChange={(e) => setEditCommentText(e.target.value)}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateComment} 
              variant="contained"
              disabled={!editCommentText.trim()}
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default BlogDetailPage; 