import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, CardMedia, CardActionArea, 
  Box, Chip, CircularProgress, Button, Fab, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Pagination, InputAdornment
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CommentIcon from '@mui/icons-material/Comment';

// Attempt to import react-helmet or handle its absence
let Helmet;
try {
  Helmet = require('react-helmet').Helmet;
} catch (e) {
  // Create a dummy Helmet component if the package is not available
  Helmet = ({ children }) => <>{children}</>;
}

const BlogPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, [page, search]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9'
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const res = await axios.get(`/api/blogs?${params}`);
      setBlogs(res.data.blogs);
      setTotalPages(res.data.totalPages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleOpenDialog = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setBlogForm({
        title: blog.title,
        content: blog.content,
        tags: blog.tags || ''
      });
      setImagePreview(blog.image);
      setSelectedImage(null);
    } else {
      setEditingBlog(null);
      setBlogForm({
        title: '',
        content: '',
        tags: ''
      });
      setImagePreview(null);
      setSelectedImage(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBlog(null);
    setBlogForm({
      title: '',
      content: '',
      tags: ''
    });
    setImagePreview(null);
    setSelectedImage(null);
  };

  const handleFormChange = (e) => {
    setBlogForm({
      ...blogForm,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', blogForm.title);
      formData.append('content', blogForm.content);
      formData.append('tags', blogForm.tags);
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      };

      if (editingBlog) {
        await axios.put(`/api/blogs/${editingBlog.id}`, formData, config);
      } else {
        await axios.post('/api/blogs', formData, config);
      }
      
      handleCloseDialog();
      fetchBlogs();
    } catch (err) {
      console.error('Error saving blog:', err);
      setError('Failed to save blog');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const config = {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        };
        
        await axios.delete(`/api/blogs/${blogId}`, config);
        fetchBlogs();
      } catch (err) {
        console.error('Error deleting blog:', err);
        setError('Failed to delete blog');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to extract a snippet from the content
  const getSnippet = (content, maxLength = 150) => {
    if (!content) return '';
    
    // Strip HTML tags if present
    const strippedContent = content.replace(/<[^>]*>/g, '');
    
    if (strippedContent.length <= maxLength) return strippedContent;
    
    return strippedContent.substring(0, maxLength) + '...';
  };

  if (loading && blogs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog | Professional Portfolio</title>
      </Helmet>
      <Container sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold',
          textAlign: 'center',
          color: theme.palette.primary.main,
          mb: 3
        }}>
          Blog
        </Typography>

        {/* Search Bar */}
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <TextField
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 400, width: '100%' }}
          />
          <Button type="submit" variant="contained" sx={{ ml: 1 }}>
            Search
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ textAlign: 'center', my: 3 }}>
            {error}
          </Typography>
        )}

        {blogs.length === 0 && !error && !loading ? (
          <Typography sx={{ textAlign: 'center', my: 5, color: theme.palette.text.secondary }}>
            No blog posts available yet. Check back soon!
          </Typography>
        ) : (
          <>
            <Grid container spacing={4}>
              {blogs.map((blog) => (
                <Grid item xs={12} sm={6} md={4} key={blog.id}>
                  <Card 
                    elevation={3} 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 8,
                      },
                      borderRadius: 2,
                      position: 'relative'
                    }}
                  >
                    {/* Admin Actions */}
                    {user?.role === 'admin' && (
                      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            handleOpenDialog(blog);
                          }}
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.9)', 
                            mr: 1,
                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(blog.id);
                          }}
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.9)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                          }}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Box>
                    )}

                    <CardActionArea component={Link} to={`/blog/${blog.id}`} sx={{ flexGrow: 1 }}>
                      {blog.image && (
                        <CardMedia
                          component="img"
                          height="240"
                          image={blog.image.startsWith('/uploads') ? `http://localhost:5000${blog.image}` : blog.image}
                          alt={blog.title}
                          sx={{
                            objectFit: 'cover',
                            objectPosition: 'center',
                            maxHeight: '240px',
                            width: '100%'
                          }}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" component="h2" gutterBottom sx={{ 
                          fontWeight: 'bold',
                          color: theme.palette.text.primary
                        }}>
                          {blog.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary" sx={{ mr: 2 }}>
                            {blog.author?.name || 'Admin'}
                          </Typography>
                          <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary">
                            {formatDate(blog.created_at)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <CommentIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary">
                            {blog.comments?.length || 0} comments
                          </Typography>
                        </Box>
                        
                        <Typography variant="body1" sx={{ 
                          color: theme.palette.text.secondary,
                          mb: 2
                        }}>
                          {getSnippet(blog.content)}
                        </Typography>
                        
                        {blog.tags && (
                          <Box sx={{ mt: 2 }}>
                            {blog.tags.split(',').map((tag, index) => (
                              <Chip 
                                key={index} 
                                label={tag.trim()} 
                                size="small" 
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
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        {/* Add Blog FAB for Admin */}
        {user?.role === 'admin' && (
          <Fab
            color="primary"
            aria-label="add blog"
            onClick={() => handleOpenDialog()}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
          >
            <AddIcon />
          </Fab>
        )}

        {/* Blog Form Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingBlog ? 'Edit Blog' : 'Create New Blog'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                required
                fullWidth
                name="title"
                label="Title"
                value={blogForm.title}
                onChange={handleFormChange}
                margin="normal"
              />
              <TextField
                required
                fullWidth
                name="content"
                label="Content"
                value={blogForm.content}
                onChange={handleFormChange}
                margin="normal"
                multiline
                rows={8}
              />
              
              {/* Image Upload Section */}
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Blog Image
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Choose Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                
                {/* Image Preview */}
                {imagePreview && (
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <img
                      src={imagePreview.startsWith('/uploads') ? `http://localhost:5000${imagePreview}` : imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        objectFit: 'cover',
                        borderRadius: 8
                      }}
                    />
                  </Box>
                )}
              </Box>
              
              <TextField
                fullWidth
                name="tags"
                label="Tags (comma separated)"
                value={blogForm.tags}
                onChange={handleFormChange}
                margin="normal"
                placeholder="technology, web development, react"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={submitting || !blogForm.title || !blogForm.content}
            >
              {submitting ? <CircularProgress size={24} /> : (editingBlog ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default BlogPage; 