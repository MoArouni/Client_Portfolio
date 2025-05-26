import React, { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import * as THREE from 'three';

// MUI components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Slide from '@mui/material/Slide';
import Fade from '@mui/material/Fade';

// Icons
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PsychologyIcon from '@mui/icons-material/Psychology';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

const HeroSection = () => {
  const { darkMode } = useTheme();
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);
  
  // Function to detect WebGL support
  const detectWebGL = () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  };
  
  // Initialize and animate the 3D background
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Check WebGL support first
    if (!detectWebGL()) {
      console.warn('WebGL not supported, falling back to CSS background');
      setWebglSupported(false);
      return;
    }
    
    const initThree = () => {
      try {
        const width = canvasRef.current.clientWidth;
        const height = canvasRef.current.clientHeight;
        
        // Setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 20;
        
        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: true
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        
        // Add particles (reduced count for mobile)
        const particlesGeometry = new THREE.BufferGeometry();
        const isMobile = window.innerWidth < 768;
        const particlesCount = isMobile ? 500 : 1500; // Reduce particles on mobile
        
        const posArray = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i++) {
          posArray[i] = (Math.random() - 0.5) * 50;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        // Materials
        const particlesMaterial = new THREE.PointsMaterial({
          size: 0.05,
          color: darkMode ? 0x7c4dff : 0x5e35b1,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending
        });
        
        // Mesh
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);
        
        // Animation
        const animate = () => {
          requestAnimationFrame(animate);
          
          particlesMesh.rotation.x += 0.0003;
          particlesMesh.rotation.y += 0.0005;
          
          renderer.render(scene, camera);
        };
        
        animate();
        
        // Handle resize
        const handleResize = () => {
          if (!canvasRef.current) return;
          const width = canvasRef.current.clientWidth;
          const height = canvasRef.current.clientHeight;
          
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          
          renderer.setSize(width, height);
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
          window.removeEventListener('resize', handleResize);
          // Cleanup resources
          particlesGeometry.dispose();
          particlesMaterial.dispose();
          renderer.dispose();
          scene.clear();
        };
      } catch (error) {
        console.warn('WebGL initialization failed, falling back to CSS background:', error);
        setWebglSupported(false);
        return null;
      }
    };
    
    const cleanup = initThree();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [darkMode]);
  
  // Update particles color when theme changes
  useEffect(() => {
    if (!sceneRef.current) return;
    
    sceneRef.current.traverse(object => {
      if (object instanceof THREE.Points) {
        object.material.color.set(darkMode ? 0x7c4dff : 0x5e35b1);
      }
    });
  }, [darkMode]);
  
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        bgcolor: 'background.default',
        pt: { xs: 4, md: 0 }, // Padding top on small screens
        mb: { xs: 8, md: 12 }
      }}
    >
      {/* 3D Background Canvas or Fallback */}
      {webglSupported ? (
        <Box
          component="canvas"
          ref={canvasRef}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: darkMode 
              ? `radial-gradient(circle at 20% 30%, rgba(124, 77, 255, 0.3) 0%, transparent 50%),
                 radial-gradient(circle at 80% 70%, rgba(83, 109, 254, 0.3) 0%, transparent 50%),
                 linear-gradient(135deg, #121220 0%, #303050 100%)`
              : `radial-gradient(circle at 20% 30%, rgba(124, 77, 255, 0.2) 0%, transparent 50%),
                 radial-gradient(circle at 80% 70%, rgba(83, 109, 254, 0.2) 0%, transparent 50%),
                 linear-gradient(135deg, #f5faff 0%, #e3f2fd 100%)`,
            pointerEvents: 'none',
            zIndex: 0,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: darkMode
                ? 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(124, 77, 255, 0.03) 2px, rgba(124, 77, 255, 0.03) 4px)'
                : 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(124, 77, 255, 0.02) 2px, rgba(124, 77, 255, 0.02) 4px)',
              animation: 'float 20s ease-in-out infinite',
            },
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' }
            }
          }}
        />
      )}
      
      {/* Gradient Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(18,18,32,0.9) 0%, rgba(48,48,75,0.6) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,250,255,0.6) 100%)',
          zIndex: 1
        }}
      />
      
      {/* Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Text Content */}
          <Grid item xs={12} md={6}>
            <Fade in={true} timeout={1000}>
              <Box>
                <Typography 
                  variant="overline"
                  sx={{ 
                    mb: 1, 
                    display: 'block',
                    color: 'primary.main',
                    fontWeight: 500,
                    letterSpacing: 1.5
                  }}
                >
                  Khalil Arouni
                </Typography>
                
                <Typography 
                  variant="h2" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #7c4dff 30%, #00e5ff 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3,
                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                  }}
                >
                  Resilience Coach & Author
                </Typography>
                
                <Typography 
                  variant="h5" 
                  color="text.secondary" 
                  sx={{ mb: 4, fontWeight: 400, lineHeight: 1.5 }}
                >
                  Guiding individuals and organizations through transformation with the TRIUMPH model
                </Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    component={RouterLink}
                    to="/booking"
                    variant="contained"
                    size="large"
                    color="primary"
                    endIcon={<CalendarTodayIcon />}
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #7c4dff 30%, #536dfe 90%)',
                      boxShadow: '0 5px 15px rgba(124, 77, 255, 0.3)',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #6a3ff3 30%, #4252e0 90%)',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 20px rgba(124, 77, 255, 0.4)',
                      },
                    }}
                  >
                    Book a Session
                  </Button>
                  
                  <Button
                    onClick={() => {
                      const testimonialsSection = document.getElementById('testimonials');
                      if (testimonialsSection) {
                        testimonialsSection.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }
                    }}
                    variant="outlined"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      borderWidth: 2,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    View Testimonials
                  </Button>
                </Stack>
              </Box>
            </Fade>
          </Grid>
          
          {/* Feature Cards */}
          <Grid item xs={12} md={6} container spacing={2}>
            {[
              {
                icon: <AutoStoriesIcon fontSize="large" />,
                title: 'Published Author',
                desc: '"My Best Friend" - Seven steps to repossess your inner life riches',
                delay: 300,
                color: '#5e35b1'
              },
              {
                icon: <RecordVoiceOverIcon fontSize="large" />,
                title: 'Keynote Speaker',
                desc: 'Inspiring talks on resilience and post-traumatic growth',
                delay: 500,
                color: '#3949ab'
              },
              {
                icon: <PsychologyIcon fontSize="large" />,
                title: 'Resilience Coach',
                desc: 'Personal and organizational transformation through the TRIUMPH model',
                delay: 700,
                color: '#1e88e5'
              }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Slide direction="left" in={true} timeout={item.delay}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      background: darkMode 
                        ? 'linear-gradient(135deg, rgba(40,40,60,0.8) 0%, rgba(60,60,85,0.8) 100%)'
                        : 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(10px)',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: `${item.color}22`,
                        color: item.color,
                        width: 56,
                        height: 56,
                        mb: 2,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {item.icon}
                    </Avatar>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.desc}
                    </Typography>
                  </Paper>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Container>
      
      {/* Bottom Wave */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '12vw',
          minHeight: 100,
          maxHeight: 200,
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='${darkMode ? '%23121220' : '%23f5faff'}' fill-opacity='1' d='M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,213.3C840,224,960,224,1080,208C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          zIndex: 1
        }}
      />
    </Box>
  );
};

export default HeroSection; 