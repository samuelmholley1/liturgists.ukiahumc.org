// Email notification service using Gmail API via Nodemailer
import nodemailer from 'nodemailer'

interface EmailParams {
  to: string
  cc?: string
  subject: string
  html: string
}

export async function sendEmail({ to, cc, subject, html }: EmailParams) {
  // Create transporter using Gmail SMTP with app-specific password
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'samuelholleyai@gmail.com', // Authenticate with Gmail account
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  const mailOptions = {
    from: '"UUMC Liturgist Scheduling" <sam@samuelholley.com>', // Send from verified alias
    to,
    cc,
    subject,
    html,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

export function generateSignupEmail(data: {
  name: string
  email: string
  phone: string
  role: string
  displayDate: string
  notes?: string
  recordId: string
}) {
  const { name, email, phone, role, displayDate, notes, recordId } = data
  
  // Format the display date if it looks like an ISO timestamp
  let formattedDate = displayDate
  if (displayDate && displayDate.includes('T') && displayDate.includes('Z')) {
    try {
      const date = new Date(displayDate)
      formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch (error) {
      // If parsing fails, use the original
      console.warn('Failed to parse displayDate:', displayDate)
    }
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #1a1a1a; 
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .header { 
          background: #2c5282; 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        .logo { 
          margin-bottom: 20px; 
        }
        .logo img { 
          width: 150px; 
          height: 150px; 
          border-radius: 8px; 
          border: 4px solid rgba(255,255,255,0.3);
        }
        .content { 
          padding: 40px 30px;
        }
        .info-box { 
          background: #f8f9fa; 
          padding: 24px; 
          border-radius: 6px; 
          margin: 24px 0; 
          border-left: 4px solid #2c5282;
        }
        .info-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 12px 0; 
          border-bottom: 1px solid #e2e8f0;
          font-size: 15px;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label { 
          font-weight: 600; 
          color: #4a5568;
          min-width: 120px;
        }
        .info-value { 
          color: #1a1a1a;
          text-align: right;
          word-break: break-word;
        }
        .success-icon { 
          font-size: 56px; 
          margin-bottom: 16px; 
        }
        .button-container {
          text-align: center;
          margin: 32px 0;
        }
        .button { 
          display: inline-block; 
          padding: 14px 32px; 
          background: #2c5282; 
          color: white !important; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 8px 4px;
          font-weight: 600;
          font-size: 15px;
        }
        .button:hover {
          background: #2a4365;
        }
        .cancel-button { 
          background: #c53030;
        }
        .cancel-button:hover {
          background: #9b2c2c;
        }
        .footer-text {
          text-align: center;
          color: #718096;
          font-size: 13px;
          padding: 20px 30px;
          border-top: 1px solid #e2e8f0;
        }
        .timestamp {
          font-size: 13px;
          color: #718096;
          text-align: center;
          margin-top: 24px;
        }
        h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .message-text {
          font-size: 17px;
          margin: 0 0 24px 0;
          text-align: center;
          color: #2d3748;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <img src="https://liturgists.ukiahumc.org/logo-for-church-larger.jpg" alt="Ukiah United Methodist Church" />
          </div>
          <div class="success-icon">✅</div>
          <h1>Signup Confirmed</h1>
        </div>
        <div class="content">
          <p class="message-text">You signed up for liturgist service!</p>
          
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Your Name:</span>
              <span class="info-value">${name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Your Email:</span>
              <span class="info-value">${email}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Your Phone:</span>
              <span class="info-value">${phone || 'Not provided'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Your Role:</span>
              <span class="info-value">${role}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Service Date:</span>
              <span class="info-value">${formattedDate}</span>
            </div>
            ${notes ? `
            <div class="info-row">
              <span class="info-label">Your Notes:</span>
              <span class="info-value">${notes}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="button-container">
            <a href="https://liturgists.ukiahumc.org" class="button">View Full Schedule</a>
            <a href="https://liturgists.ukiahumc.org/api/signup?recordId=${recordId}&action=cancel" class="button cancel-button">Cancel This Signup</a>
          </div>
          
          <p class="timestamp">
            Need to cancel? Click the button above or contact the church office.<br/>
            Confirmation sent: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PT
          </p>
        </div>
        <div class="footer-text">
          <strong>Ukiah United Methodist Church</strong><br/>
          Liturgist Signup System
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateCancellationEmail(data: {
  name: string
  role: string
  displayDate: string
}) {
  const { name, role, displayDate } = data
  
  // Format the display date if it looks like an ISO timestamp
  let formattedDate = displayDate
  if (displayDate && displayDate.includes('T') && displayDate.includes('Z')) {
    try {
      const date = new Date(displayDate)
      formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch (error) {
      // If parsing fails, use the original
      console.warn('Failed to parse displayDate:', displayDate)
    }
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #1a1a1a; 
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .header { 
          background: #744210; 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        .logo { 
          margin-bottom: 20px; 
        }
        .logo img { 
          width: 150px; 
          height: 150px; 
          border-radius: 8px; 
          border: 4px solid rgba(255,255,255,0.3);
        }
        .content { 
          padding: 40px 30px;
        }
        .info-box { 
          background: #f8f9fa; 
          padding: 24px; 
          border-radius: 6px; 
          margin: 24px 0; 
          border-left: 4px solid #744210;
        }
        .info-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 12px 0; 
          border-bottom: 1px solid #e2e8f0;
          font-size: 15px;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label { 
          font-weight: 600; 
          color: #4a5568;
          min-width: 120px;
        }
        .info-value { 
          color: #1a1a1a;
          text-align: right;
          word-break: break-word;
        }
        .cancel-icon { 
          font-size: 56px; 
          margin-bottom: 16px; 
        }
        .button-container {
          text-align: center;
          margin: 32px 0;
        }
        .button { 
          display: inline-block; 
          padding: 14px 32px; 
          background: #2c5282; 
          color: white !important; 
          text-decoration: none; 
          border-radius: 6px; 
          font-weight: 600;
          font-size: 15px;
        }
        .button:hover {
          background: #2a4365;
        }
        .footer-text {
          text-align: center;
          color: #718096;
          font-size: 13px;
          padding: 20px 30px;
          border-top: 1px solid #e2e8f0;
        }
        .timestamp {
          font-size: 13px;
          color: #718096;
          text-align: center;
          margin-top: 24px;
        }
        h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .message-text {
          font-size: 17px;
          margin: 0 0 24px 0;
          text-align: center;
          color: #2d3748;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <img src="https://liturgists.ukiahumc.org/logo-for-church-larger.jpg" alt="Ukiah United Methodist Church" />
          </div>
          <div class="cancel-icon">❌</div>
          <h1>Signup Cancelled</h1>
        </div>
        <div class="content">
          <p class="message-text">You cancelled your liturgist signup.</p>
          
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Your Name:</span>
              <span class="info-value">${name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Your Role:</span>
              <span class="info-value">${role}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Service Date:</span>
              <span class="info-value">${formattedDate}</span>
            </div>
          </div>
          
          <div class="button-container">
            <a href="https://liturgists.ukiahumc.org" class="button">Sign Up for Another Service</a>
          </div>
          
          <p class="timestamp">
            Thank you for letting us know. We appreciate your communication.<br/>
            Cancellation confirmed: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PT
          </p>
        </div>
        <div class="footer-text">
          <strong>Ukiah United Methodist Church</strong><br/>
          Liturgist Signup System
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateErrorEmail(data: {
  errorType: string
  errorMessage: string
  userEmail?: string
  userName?: string
  serviceDate?: string
  stackTrace?: string
}) {
  const { errorType, errorMessage, userEmail, userName, serviceDate, stackTrace } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #1a1a1a; 
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .header { 
          background: #c53030; 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        .content { 
          padding: 40px 30px;
        }
        .error-box { 
          background: #fff5f5; 
          padding: 24px; 
          border-radius: 6px; 
          margin: 24px 0; 
          border-left: 4px solid #c53030;
        }
        .info-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 12px 0; 
          border-bottom: 1px solid #fed7d7;
          font-size: 15px;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label { 
          font-weight: 600; 
          color: #4a5568;
          min-width: 140px;
        }
        .info-value { 
          color: #1a1a1a;
          text-align: right;
          word-break: break-all;
        }
        .code-block { 
          background: #2d3748; 
          color: #e2e8f0; 
          padding: 16px; 
          border-radius: 6px; 
          font-family: 'Courier New', monospace; 
          font-size: 13px; 
          overflow-x: auto; 
          margin-top: 16px;
        }
        .footer-text {
          text-align: center;
          color: #718096;
          font-size: 13px;
          padding: 20px 30px;
          border-top: 1px solid #e2e8f0;
        }
        .error-icon { 
          font-size: 56px; 
          margin-bottom: 16px; 
        }
        .alert-badge { 
          background: #c53030; 
          color: white; 
          padding: 6px 14px; 
          border-radius: 4px; 
          font-size: 13px; 
          font-weight: 600;
          display: inline-block;
          margin-bottom: 16px;
        }
        h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .message-text {
          font-size: 15px;
          margin: 0;
          color: #2d3748;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="error-icon">🚨</div>
          <h1>System Error Alert</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 15px;">Liturgist Signup System</p>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <span class="alert-badge">ERROR</span>
          </div>
          <p class="message-text">An error occurred in the liturgist signup system.</p>
          
          <div class="error-box">
            <div class="info-row">
              <span class="info-label">Error Type:</span>
              <span class="info-value">${errorType}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Error Message:</span>
              <span class="info-value">${errorMessage}</span>
            </div>
            ${userName ? `
            <div class="info-row">
              <span class="info-label">User Name:</span>
              <span class="info-value">${userName}</span>
            </div>
            ` : ''}
            ${userEmail ? `
            <div class="info-row">
              <span class="info-label">User Email:</span>
              <span class="info-value">${userEmail}</span>
            </div>
            ` : ''}
            ${serviceDate ? `
            <div class="info-row">
              <span class="info-label">Service Date:</span>
              <span class="info-value">${serviceDate}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">Timestamp:</span>
              <span class="info-value">${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PT</span>
            </div>
          </div>
          
          ${stackTrace ? `
          <div class="code-block">
            <strong style="color: #fc8181;">Stack Trace:</strong><br/><br/>
            ${stackTrace.replace(/\n/g, '<br/>')}
          </div>
          ` : ''}
          
          <p style="font-size: 14px; color: #718096; margin-top: 24px; text-align: center;">
            ⚠️ This error was automatically detected and reported. Please investigate and resolve as soon as possible.
          </p>
        </div>
        <div class="footer-text">
          <strong>Automated Error Notification</strong><br/>
          Liturgist Signup System - Ukiah UMC
        </div>
      </div>
    </body>
    </html>
  `
}
