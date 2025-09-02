import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for sending emails with optimized settings
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // Optimize for faster delivery
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14, // Gmail limit
    rateDelta: 1000, // 1 second
    // Timeout settings
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000, // 5 seconds
    socketTimeout: 10000, // 10 seconds
    // Debug for troubleshooting
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  });
};

// Send OTP email with optimized delivery
export const sendOTPEmail = async (email, otp) => {
  console.log(`Attempting to send OTP email to: ${email}`);
  const startTime = Date.now();
  
  try {
    const transporter = createTransporter();
    
    // Verify connection before sending
    await transporter.verify();
    console.log('Email transporter verified successfully');
    
    const mailOptions = {
      from: `"Inventory" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Inventory - Password Reset OTP',
      priority: 'high',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0b1420; margin: 0; font-size: 28px; font-weight: 600;">INVENTORY</h1>
            <p style="color: #313957; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
          </div>
          
          <div style="background: #f6faff; border: 1px solid #d3d7e3; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #0b1420; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Enter Your OTP</h2>
            <p style="color: #313957; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
              We've sent a 6-digit OTP to your registered email. Please enter it below to reset your password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #69b5f8; color: white; padding: 15px 30px; border-radius: 8px; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
              </div>
            </div>
            
            <p style="color: #313957; margin: 20px 0 0 0; font-size: 14px; line-height: 1.5;">
              This OTP is valid for 10 minutes. If you didn't request this password reset, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #8796ad; margin: 0; font-size: 12px;">
              © 2024 INVENTORY. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    const deliveryTime = Date.now() - startTime;
    
    console.log(`Email sent successfully to ${email}:`, {
      messageId: info.messageId,
      deliveryTime: `${deliveryTime}ms`,
      timestamp: new Date().toISOString()
    });
    
    return { success: true, messageId: info.messageId, deliveryTime };
  } catch (error) {
    const deliveryTime = Date.now() - startTime;
    console.error(`Email sending failed to ${email}:`, {
      error: error.message,
      deliveryTime: `${deliveryTime}ms`,
      timestamp: new Date().toISOString()
    });
    return { success: false, error: error.message, deliveryTime };
  }
};

// Send password reset success email
export const sendPasswordResetSuccessEmail = async (email) => {
  console.log(`Attempting to send success email to: ${email}`);
  const startTime = Date.now();
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; // Define FRONTEND_URL
  
  try {
    const transporter = createTransporter();
    
    // Verify connection before sending
    await transporter.verify();
    
    const mailOptions = {
      from: `"INVENTORY" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'INVENTORY - Password Reset Successful',
      priority: 'normal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0b1420; margin: 0; font-size: 28px; font-weight: 600;">INVENTORY</h1>
            <p style="color: #313957; margin: 10px 0 0 0; font-size: 16px;">Password Reset Complete</p>
          </div>
          <div style="background: #f6faff; border: 1px solid #d3d7e3; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #0b1420; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Password Reset Successful</h2>
            <p style="color: #313957; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6;">
              Your password has been successfully reset. You can now log in to your account with your new password.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${FRONTEND_URL}/login" 
                 style="background: #69b5f8; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Login to Your Account
              </a>
            </div>
            <p style="color: #313957; margin: 20px 0 0 0; font-size: 14px; line-height: 1.5;">
              If you didn't perform this password reset, please contact our support team immediately.
            </p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #8796ad; margin: 0; font-size: 12px;">
              © 2024 INVENTORY. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    const deliveryTime = Date.now() - startTime;
    
    console.log(`Success email sent to ${email}:`, {
      messageId: info.messageId,
      deliveryTime: `${deliveryTime}ms`,
      timestamp: new Date().toISOString()
    });
    
    return { success: true, messageId: info.messageId, deliveryTime };
  } catch (error) {
    const deliveryTime = Date.now() - startTime;
    console.error(`Success email sending failed to ${email}:`, {
      error: error.message,
      deliveryTime: `${deliveryTime}ms`,
      timestamp: new Date().toISOString()
    });
    return { success: false, error: error.message, deliveryTime };
  }
};