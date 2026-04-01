import axios from 'axios';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_API_URL = 'https://api.resend.com';
// For development: Using verified email. For production, verify a domain at resend.com/domains
const FROM_EMAIL = 'sparexyz2021@gmail.com';

/**
 * Send verification email using Resend
 * @param {string} email - User's email
 * @param {string} verificationLink - Full verification URL
 * @param {string} userName - User's full name
 * @returns {Promise<boolean>} Success or failure
 */
export async function sendVerificationEmail(email, verificationLink, userName) {
  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured in .env');
    }

    console.log(`📧 Sending verification email to ${email} from ${FROM_EMAIL}`);

    const response = await axios.post(
      `${RESEND_API_URL}/emails`,
      {
        from: FROM_EMAIL,
        to: email,
        subject: '✈️ Verify Your TripCraft Account',
        html: getVerificationEmailHTML(verificationLink, userName),
      },
      {
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Verification email sent successfully. ID: ${response.data.id}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}`);
    console.error('Error details:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Generate HTML for verification email
 */
function getVerificationEmailHTML(verificationLink, userName) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 500px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✈️ TripCraft</h1>
            <p style="margin: 10px 0 0 0;">Plan Amazing Trips</p>
          </div>
          
          <div class="content">
            <h2 style="color: #2d2d2d;">Welcome${userName ? ', ' + userName.split(' ')[0] : ''}!</h2>
            
            <p>Thank you for signing up for TripCraft. To complete your account setup, please verify your email address by clicking the button below.</p>
            
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify Email Address →</a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="color: #0066cc; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
              ${verificationLink}
            </p>
            
            <div style="background: #f0f7ff; padding: 15px; border-left: 4px solid #667eea; border-radius: 4px; margin: 20px 0;">
              <p style="color: #0066cc; margin: 0;">
                <strong>🔒 Security:</strong> This verification link is unique to your account and expires in 24 hours.
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
            
            <div class="footer">
              © 2024 TripCraft. All rights reserved.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send welcome email after verification
 */
export async function sendWelcomeEmail(email, userName) {
  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured in .env');
    }

    console.log(`📧 Sending welcome email to ${email} from ${FROM_EMAIL}`);

    const response = await axios.post(
      `${RESEND_API_URL}/emails`,
      {
        from: FROM_EMAIL,
        to: email,
        subject: '🎉 Welcome to TripCraft!',
        html: getWelcomeEmailHTML(userName),
      },
      {
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Welcome email sent successfully. ID: ${response.data.id}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${email}`);
    console.error('Error details:', error.response?.data || error.message);
    return false;
  }
}

function getWelcomeEmailHTML(userName) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 500px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
          .footer { color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✈️ Welcome to TripCraft!</h1>
          </div>
          
          <div class="content">
            <h2 style="color: #2d2d2d;">You're all set, ${userName.split(' ')[0]}!</h2>
            
            <p>Your email has been verified and your account is ready to use.</p>
            
            <p>You can now:</p>
            <ul>
              <li>Plan your next amazing trip</li>
              <li>Create and share itineraries</li>
              <li>Collaborate with other travelers</li>
              <li>Save your favorite destinations</li>
            </ul>
            
            <p>Get started now and begin planning your adventure!</p>
            
            <div class="footer">
              © 2024 TripCraft. All rights reserved.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
