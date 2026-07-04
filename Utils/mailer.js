import nodemailer from 'nodemailer';

// 1. Set up the connection to your domain's email server
const transporter = nodemailer.createTransport({
  host: '://diary-app-omega-lime.vercel.app', // Replace with your actual mail server
  port: 465,                      // 465 is the standard secure port
  secure: true,                   // Use true for port 465
  auth: {
    user: 'hello@diary-app-omega-lime.vercel.app', // Your official domain email
    pass: '12340puj735'      // Your email password
  }
});

/**
 * Reusable function to send emails
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} htmlContent - The body of the email (HTML allowed)
 */

export async function sendCustomEmail(to, subject, htmlContent) {
  try {
    const mailOptions = {
      from: '"My Website Team" <hello@diary-app-omega-lime.vercel.app>', 
      to: to,
      subject: subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent! Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message };
  }
      }
                  
