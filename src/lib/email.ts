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
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  const mailOptions = {
    from: `"UUMC Liturgist Scheduling" <${process.env.GMAIL_USER}>`,
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
}) {
  const { name, email, phone, role, displayDate, notes } = data
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .info-label { font-weight: bold; color: #495057; }
        .info-value { color: #212529; }
        .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; }
        .success-icon { font-size: 48px; margin-bottom: 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">✅</div>
          <h1 style="margin: 0;">Liturgist Signup Confirmed</h1>
        </div>
        <div class="content">
          <p style="font-size: 16px; margin-top: 0;">A new liturgist has signed up for service!</p>
          
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${email}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${phone || 'Not provided'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Role:</span>
              <span class="info-value">${role}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Service Date:</span>
              <span class="info-value">${displayDate}</span>
            </div>
            ${notes ? `
            <div class="info-row" style="border-bottom: none;">
              <span class="info-label">Notes:</span>
              <span class="info-value">${notes}</span>
            </div>
            ` : ''}
          </div>
          
          <p style="font-size: 14px; color: #6c757d; margin-bottom: 0;">
            Timestamp: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PT
          </p>
          
          <a href="https://liturgists.ukiahumc.org" class="button">View Full Schedule</a>
        </div>
        <div class="footer">
          <p>This is an automated notification from the Liturgist Signup System<br/>
          Ukiah United Methodist Church</p>
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
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .info-label { font-weight: bold; color: #495057; }
        .info-value { color: #212529; }
        .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; }
        .cancel-icon { font-size: 48px; margin-bottom: 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="cancel-icon">❌</div>
          <h1 style="margin: 0;">Liturgist Signup Cancelled</h1>
        </div>
        <div class="content">
          <p style="font-size: 16px; margin-top: 0;">A liturgist signup has been cancelled.</p>
          
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value">${name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Role:</span>
              <span class="info-value">${role}</span>
            </div>
            <div class="info-row" style="border-bottom: none;">
              <span class="info-label">Service Date:</span>
              <span class="info-value">${displayDate}</span>
            </div>
          </div>
          
          <p style="font-size: 14px; color: #6c757d; margin-bottom: 0;">
            Timestamp: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PT
          </p>
          
          <a href="https://liturgists.ukiahumc.org" class="button">View Full Schedule</a>
        </div>
        <div class="footer">
          <p>This is an automated notification from the Liturgist Signup System<br/>
          Ukiah United Methodist Church</p>
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
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .error-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c92a2a; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .info-label { font-weight: bold; color: #495057; }
        .info-value { color: #212529; word-break: break-all; }
        .code-block { background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 12px; overflow-x: auto; margin-top: 15px; }
        .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; }
        .error-icon { font-size: 48px; margin-bottom: 10px; }
        .alert-badge { background: #ff6b6b; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="error-icon">🚨</div>
          <h1 style="margin: 0;">System Error Alert</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Liturgist Signup System</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; margin-top: 0;">
            <span class="alert-badge">ERROR</span>
            An error occurred in the liturgist signup system.
          </p>
          
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
            <div class="info-row" style="border-bottom: none;">
              <span class="info-label">Timestamp:</span>
              <span class="info-value">${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PT</span>
            </div>
          </div>
          
          ${stackTrace ? `
          <div class="code-block">
            <strong style="color: #ff6b6b;">Stack Trace:</strong><br/><br/>
            ${stackTrace.replace(/\n/g, '<br/>')}
          </div>
          ` : ''}
          
          <p style="font-size: 14px; color: #6c757d; margin-top: 20px;">
            ⚠️ This error was automatically detected and reported. Please investigate and resolve as soon as possible.
          </p>
        </div>
        <div class="footer">
          <p>Automated Error Notification<br/>
          Liturgist Signup System - Ukiah UMC</p>
        </div>
      </div>
    </body>
    </html>
  `
}
