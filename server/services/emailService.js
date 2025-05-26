const nodemailer = require('nodemailer');
const crypto = require('crypto');
const config = require('../config/default');

// Create email transporter with robust configuration
const createEmailTransporter = () => {
  const baseConfig = {
    ...config.emailSettings,
    port: parseInt(config.emailSettings.port) || 587,
    secure: config.emailSettings.secure === 'true' || config.emailSettings.port == 465,
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000
  };

  // For Gmail and common providers, use specific configurations
  if (config.emailSettings.service === 'gmail' || config.emailSettings.host?.includes('gmail')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: config.emailSettings.auth,
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // For other providers, use the general configuration with SSL options
  return nodemailer.createTransport({
    ...baseConfig,
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
      ciphers: 'SSLv3',
      secureProtocol: 'TLSv1_2_method'
    },
    // Additional options for problematic servers
    ignoreTLS: false,
    requireTLS: false
  });
};

// Configure email transporter
const transporter = createEmailTransporter();

// Test email connection
const testEmailConnection = async () => {
  try {
    console.log('🔍 Testing email connection...');
    console.log('📧 Email config:', {
      service: config.emailSettings.service,
      host: config.emailSettings.host,
      port: config.emailSettings.port,
      secure: config.emailSettings.secure,
      user: config.emailSettings.auth.user
    });
    
    await transporter.verify();
    console.log('✅ Email service is ready and verified');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    console.error('📋 Error details:', {
      code: error.code,
      command: error.command,
      errno: error.errno,
      syscall: error.syscall
    });
    
    // Provide specific error guidance
    if (error.code === 'ESOCKET' || error.message.includes('certificate')) {
      console.log('💡 SSL Certificate issue detected. This is common with some email providers.');
      console.log('💡 The service will attempt to send emails with relaxed SSL settings.');
    }
    
    return false;
  }
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send email verification
const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${config.clientUrl}/verify-email?token=${verificationToken}`;
  
  const emailOptions = {
    from: config.emailSettings.auth.user,
    to: user.email,
    subject: '✅ Verify Your Email Address - Portfolio',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .verification-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; text-align: center; }
          .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Portfolio!</h1>
            <p>Please verify your email address to complete your registration</p>
          </div>
          
          <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            
            <p>Thank you for registering with Portfolio! To complete your account setup and start booking appointments, please verify your email address.</p>
            
            <div class="verification-box">
              <h3>📧 Email Verification Required</h3>
              <p>Click the button below to verify your email address:</p>
              
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Or copy and paste this link into your browser:<br>
                <span style="word-break: break-all;">${verificationUrl}</span>
              </p>
            </div>
            
            <div class="warning">
              <h4>⏰ Important Information:</h4>
              <ul>
                <li><strong>Time Limit:</strong> This verification link will expire in 24 hours</li>
                <li><strong>One-Time Use:</strong> This link can only be used once</li>
                <li><strong>Account Access:</strong> You must verify your email to book appointments</li>
                <li><strong>Didn't Register?</strong> If you didn't create this account, please ignore this email</li>
              </ul>
            </div>
            
            <p>Once verified, you'll be able to:</p>
            <ul>
              <li>✅ Book appointments with our team</li>
              <li>✅ Manage your appointment schedule</li>
              <li>✅ Receive appointment reminders</li>
              <li>✅ Access your profile dashboard</li>
            </ul>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
            
            <p>Welcome aboard!</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Portfolio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  try {
    console.log('📤 Attempting to send verification email to:', user.email);
    await transporter.sendMail(emailOptions);
    console.log('✅ Verification email sent successfully to:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error.message);
    console.error('📋 Email error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    
    // Log the email configuration for debugging
    console.log('🔧 Current email configuration:', {
      service: config.emailSettings.service,
      host: config.emailSettings.host,
      port: config.emailSettings.port,
      secure: config.emailSettings.secure,
      from: config.emailSettings.auth.user,
      to: user.email
    });
    
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

// Development mode: Log verification details instead of sending email
const logVerificationDetails = (user, verificationToken) => {
  const verificationUrl = `${config.clientUrl}/verify-email?token=${verificationToken}`;
  
  console.log('\n' + '='.repeat(80));
  console.log('📧 EMAIL VERIFICATION (Development Mode)');
  console.log('='.repeat(80));
  console.log(`👤 User: ${user.name} (${user.email})`);
  console.log(`🔗 Verification URL: ${verificationUrl}`);
  console.log(`⏰ Token expires in: 24 hours`);
  console.log('='.repeat(80) + '\n');
  
  return true;
};

// Enhanced email sending with fallback to development mode
const sendVerificationEmailSafe = async (user, verificationToken) => {
  try {
    return await sendVerificationEmail(user, verificationToken);
  } catch (error) {
    console.log('⚠️  Email sending failed, falling back to development mode...');
    return logVerificationDetails(user, verificationToken);
  }
};

// Send appointment confirmation email
const sendAppointmentConfirmation = async (user, appointment) => {
  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);
  
  const emailOptions = {
    from: config.emailSettings.auth.user,
    to: user.email,
    subject: '✅ Appointment Confirmation - Your Meeting is Scheduled',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .important-note { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Appointment Confirmed!</h1>
            <p>Your meeting has been successfully scheduled</p>
          </div>
          
          <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            
            <p>Great news! Your appointment has been confirmed and scheduled. Here are the details:</p>
            
            <div class="appointment-details">
              <h3>📅 Appointment Details</h3>
              <div class="detail-row">
                <span class="detail-label">Title:</span>
                <span class="detail-value">${appointment.title}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${startTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${startTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })} - ${endTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
              </div>
            </div>
            
            <div class="important-note">
              <h4>📋 Important Information:</h4>
              <ul>
                <li><strong>Reminder:</strong> You'll receive an email reminder 1 hour before your appointment</li>
                <li><strong>Cancellation Policy:</strong> You can cancel up to 24 hours before the appointment</li>
                <li><strong>Rescheduling:</strong> Contact us if you need to reschedule</li>
                <li><strong>Preparation:</strong> Please have any relevant documents or questions ready</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.clientUrl}/profile" class="button">View My Appointments</a>
              <a href="${config.clientUrl}/booking" class="button">Book Another Meeting</a>
            </div>
            
            <p>If you have any questions or need to make changes, please don't hesitate to contact us.</p>
            
            <p>We look forward to meeting with you!</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Portfolio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  try {
    await transporter.sendMail(emailOptions);
    console.log('✅ Appointment confirmation email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Error sending appointment confirmation email:', error);
    throw error;
  }
};

// Send appointment cancellation email
const sendAppointmentCancellation = async (user, appointment, cancellationReason = null) => {
  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);
  
  const emailOptions = {
    from: config.emailSettings.auth.user,
    to: user.email,
    subject: '❌ Appointment Cancelled - Confirmation',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .cancellation-note { background: #ffebee; border: 1px solid #ffcdd2; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Appointment Cancelled</h1>
            <p>Your appointment has been successfully cancelled</p>
          </div>
          
          <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            
            <p>This email confirms that your appointment has been cancelled as requested.</p>
            
            <div class="appointment-details">
              <h3>📅 Cancelled Appointment Details</h3>
              <div class="detail-row">
                <span class="detail-label">Title:</span>
                <span class="detail-value">${appointment.title}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${startTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${startTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })} - ${endTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}</span>
              </div>
              ${cancellationReason ? `
              <div class="detail-row">
                <span class="detail-label">Cancellation Reason:</span>
                <span class="detail-value">${cancellationReason}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Cancelled On:</span>
                <span class="detail-value">${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}</span>
              </div>
            </div>
            
            <div class="cancellation-note">
              <h4>📋 What's Next?</h4>
              <ul>
                <li>Your appointment slot is now available for others to book</li>
                <li>No further action is required from you</li>
                <li>You can book a new appointment anytime that suits your schedule</li>
                <li>If you cancelled by mistake, please book a new appointment</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.clientUrl}/booking" class="button">Book New Appointment</a>
              <a href="${config.clientUrl}/profile" class="button">View My Profile</a>
            </div>
            
            <p>We're sorry to see this appointment cancelled, but we understand that schedules can change. We hope to meet with you soon!</p>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Portfolio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  try {
    await transporter.sendMail(emailOptions);
    console.log('✅ Appointment cancellation email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Error sending appointment cancellation email:', error);
    throw error;
  }
};

// Send appointment reminder email (1 hour before)
const sendAppointmentReminder = async (user, appointment) => {
  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);
  
  const emailOptions = {
    from: config.emailSettings.auth.user,
    to: user.email,
    subject: '⏰ Appointment Reminder - Your Meeting is in 1 Hour',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ffa726 0%, #ff7043 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffa726; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          .reminder-note { background: #fff3e0; border: 1px solid #ffcc02; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .urgent { background: #ffebee; border: 1px solid #f44336; padding: 15px; border-radius: 5px; margin: 15px 0; color: #d32f2f; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Appointment Reminder</h1>
            <p>Your meeting is starting in 1 hour!</p>
          </div>
          
          <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            
            <div class="urgent">
              <h3>🚨 Your appointment is starting soon!</h3>
              <p>This is a friendly reminder that your scheduled appointment is starting in approximately <strong>1 hour</strong>.</p>
            </div>
            
            <div class="appointment-details">
              <h3>📅 Appointment Details</h3>
              <div class="detail-row">
                <span class="detail-label">Title:</span>
                <span class="detail-value">${appointment.title}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${startTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${startTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })} - ${endTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}</span>
              </div>
            </div>
            
            <div class="reminder-note">
              <h4>📋 Preparation Checklist:</h4>
              <ul>
                <li>✅ Review the meeting agenda and your questions</li>
                <li>✅ Gather any documents or materials you need</li>
                <li>✅ Test your internet connection if it's a video call</li>
                <li>✅ Find a quiet, professional space for the meeting</li>
                <li>✅ Have a pen and paper ready for notes</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.clientUrl}/profile" class="button">View Appointment Details</a>
            </div>
            
            <p><strong>Need to cancel or reschedule?</strong> Please note that cancellations must be made at least 24 hours in advance. If you have an emergency, please contact us immediately.</p>
            
            <p>We look forward to meeting with you!</p>
          </div>
          
          <div class="footer">
            <p>This is an automated reminder. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Portfolio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  try {
    await transporter.sendMail(emailOptions);
    console.log('✅ Appointment reminder email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Error sending appointment reminder email:', error);
    throw error;
  }
};

// Send attendance confirmation email (24 hours before)
const sendAttendanceConfirmation = async (user, appointment, confirmationToken) => {
  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);
  const confirmationUrl = `${config.clientUrl}/confirm-attendance/${confirmationToken}`;
  
  const emailOptions = {
    from: config.emailSettings.auth.user,
    to: user.email,
    subject: '📋 Please Confirm Your Attendance - Appointment Tomorrow',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
          .button { display: inline-block; padding: 15px 30px; background: #4caf50; color: white; text-decoration: none; border-radius: 8px; margin: 15px 5px; font-weight: bold; font-size: 16px; }
          .button:hover { background: #45a049; }
          .confirmation-note { background: #e8f5e8; border: 1px solid #4caf50; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .important { background: #fff3e0; border: 1px solid #ff9800; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Attendance Confirmation Required</h1>
            <p>Your appointment is tomorrow - please confirm your attendance</p>
          </div>
          
          <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            
            <p>This is a friendly reminder that you have an appointment scheduled for <strong>tomorrow</strong>. To help us prepare and ensure the best service, please confirm that you will be attending.</p>
            
            <div class="appointment-details">
              <h3>📅 Appointment Details</h3>
              <div class="detail-row">
                <span class="detail-label">Title:</span>
                <span class="detail-value">${appointment.title}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${startTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${startTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })} - ${endTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}</span>
              </div>
            </div>
            
            <div class="confirmation-note">
              <h3>✅ Confirm Your Attendance</h3>
              <p>Please click the button below to confirm that you will attend this appointment:</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${confirmationUrl}" class="button">✅ Yes, I Will Attend</a>
              </div>
              
              <p style="font-size: 14px; color: #666; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <span style="word-break: break-all;">${confirmationUrl}</span>
              </p>
            </div>
            
            <div class="important">
              <h4>📋 Important Information:</h4>
              <ul>
                <li><strong>Confirmation Deadline:</strong> Please confirm by the end of today</li>
                <li><strong>Cancellation Policy:</strong> If you need to cancel, please do so at least 24 hours in advance</li>
                <li><strong>No Response:</strong> If we don't receive confirmation, we may need to reschedule</li>
                <li><strong>Questions?</strong> Contact us if you have any concerns or need to make changes</li>
              </ul>
            </div>
            
            <p>We look forward to meeting with you tomorrow!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${config.clientUrl}/profile" class="button" style="background: #667eea;">View My Appointments</a>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Portfolio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  try {
    await transporter.sendMail(emailOptions);
    console.log('✅ Attendance confirmation email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Error sending attendance confirmation email:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
  
  const emailOptions = {
    from: config.emailSettings.auth.user,
    to: user.email,
    subject: '🔐 Password Reset Request - Portfolio',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reset-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b; text-align: center; }
          .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .security-note { background: #e3f2fd; border: 1px solid #2196f3; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>We received a request to reset your password</p>
          </div>
          
          <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            
            <p>We received a request to reset the password for your Portfolio account. If you made this request, please click the button below to reset your password.</p>
            
            <div class="reset-box">
              <h3>🔑 Reset Your Password</h3>
              <p>Click the button below to create a new password:</p>
              
              <a href="${resetUrl}" class="button">Reset Password</a>
              
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Or copy and paste this link into your browser:<br>
                <span style="word-break: break-all;">${resetUrl}</span>
              </p>
            </div>
            
            <div class="warning">
              <h4>⏰ Important Information:</h4>
              <ul>
                <li><strong>Time Limit:</strong> This password reset link will expire in 15 minutes</li>
                <li><strong>One-Time Use:</strong> This link can only be used once</li>
                <li><strong>Security:</strong> If you didn't request this reset, please ignore this email</li>
                <li><strong>Account Safety:</strong> Your current password remains unchanged until you complete the reset</li>
              </ul>
            </div>
            
            <div class="security-note">
              <h4>🛡️ Security Tips:</h4>
              <ul>
                <li>Choose a strong password with at least 8 characters</li>
                <li>Include uppercase and lowercase letters, numbers, and symbols</li>
                <li>Don't reuse passwords from other accounts</li>
                <li>Consider using a password manager</li>
              </ul>
            </div>
            
            <p><strong>Didn't request this reset?</strong> If you didn't request a password reset, please ignore this email. Your account is secure and no changes have been made.</p>
            
            <p>If you continue to receive these emails or have concerns about your account security, please contact our support team immediately.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Portfolio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  try {
    await transporter.sendMail(emailOptions);
    console.log('✅ Password reset email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
};

module.exports = {
  testEmailConnection,
  generateVerificationToken,
  sendVerificationEmail,
  sendVerificationEmailSafe,
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
  sendAppointmentReminder,
  logVerificationDetails,
  sendAttendanceConfirmation,
  sendPasswordResetEmail
}; 