module.exports = {
  // Server settings
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  
  // JWT settings
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE,
  
  // Database settings
  database: {
    name: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT
  },
  
  // Google OAuth settings
  googleAuth: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  },
  
  // Default admin user settings
  defaultAdmin: {
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: 'admin'
  },
  
  // Email settings
  emailSettings: {
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  
  // Client URL for redirects
  clientUrl: process.env.CLIENT_URL,
  
  // Timezone configuration
  timezone: process.env.TIMEZONE || 'America/New_York'
}; 