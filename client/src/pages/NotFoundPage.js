import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Attempt to import react-helmet or handle its absence
let Helmet;
try {
  Helmet = require('react-helmet').Helmet;
} catch (e) {
  // Create a dummy Helmet component if the package is not available
  Helmet = ({ children }) => <>{children}</>;
}

const NotFoundPage = () => {
  const theme = useTheme();

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Professional Portfolio</title>
      </Helmet>
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100vh - 200px)',
            textAlign: 'center',
            p: 4
          }}
        >
          <ErrorOutlineIcon
            sx={{
              fontSize: 100,
              color: theme.palette.primary.main,
              mb: 2
            }}
          />
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: 80, sm: 120 },
              fontWeight: 700,
              color: theme.palette.primary.main,
              lineHeight: 1
            }}
          >
            404
          </Typography>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              mb: 3,
              color: theme.palette.text.primary,
              fontWeight: 600
            }}
          >
            Page Not Found
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              maxWidth: 500,
              color: theme.palette.text.secondary
            }}
          >
            The page you're looking for doesn't exist or has been moved.
            Please check the URL or go back to the homepage.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              to="/"
              sx={{
                px: 4,
                py: 1,
                borderRadius: 2,
                fontSize: 16
              }}
            >
              Go Home
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => window.history.back()}
              sx={{
                px: 4,
                py: 1,
                borderRadius: 2,
                fontSize: 16
              }}
            >
              Go Back
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default NotFoundPage; 