# Portfolio Website with Google Calendar Integration

This portfolio website includes booking functionality with Google Calendar integration.

## Technologies Used
- **Frontend**: React, Material-UI
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT, Google OAuth2
- **Calendar Integration**: Google Calendar API

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Google Cloud Console project with Calendar API enabled

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Client_Portfolio
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up MongoDB**
   - Install MongoDB locally or create a MongoDB Atlas account
   - Create a database named "portfolio"

4. **Set up Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Google Calendar API
   - Configure OAuth consent screen
   - Create OAuth credentials (Web application)
   - Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`

5. **Environment variables**
   - Create a `.env` file in the `server` directory using the provided `.env.example` as a template
   - Update the following values:
     - `MONGO_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure random string for JWT signing
     - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
     - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret

### Running the Application

1. **Start the server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the client**
   ```bash
   cd client
   npm start
   ```

3. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## Features
- User authentication (register/login)
- Appointment booking system
- Google Calendar integration
- Responsive design for mobile and desktop

## Setting up Google Calendar Integration

To connect Google Calendar:

1. Log in to your account
2. Navigate to Settings
3. Click on "Connect Google Calendar"
4. Authorize the application to access your Google Calendar
5. Once connected, all appointments will automatically sync with your Google Calendar 