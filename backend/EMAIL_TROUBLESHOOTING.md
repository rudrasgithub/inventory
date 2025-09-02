# Email Delivery Troubleshooting Guide

## Common Issues and Solutions

### 1. **Gmail App Password Issues**
If emails are delayed or not sent, check your Gmail settings:

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

#### Step 2: Generate App Password
1. Go to Google Account → Security
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" and "Other (Custom name)"
4. Enter "INVENTORY" as the name
5. Copy the 16-character password

#### Step 3: Update .env File
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
```

### 2. **Gmail Security Settings**
- **Less secure app access**: Should be OFF (use App Password instead)
- **2-Factor Authentication**: Should be ON
- **App Passwords**: Use this instead of regular password

### 3. **Network and Firewall Issues**
- Check if your server can access Gmail SMTP (smtp.gmail.com:587)
- Ensure no firewall is blocking outgoing SMTP traffic

### 4. **Rate Limiting**
Gmail has rate limits:
- **Daily limit**: 500 emails per day
- **Per second**: 14 emails per second
- **Per user**: 100 emails per day per user

### 5. **Testing Email Configuration**

#### Test with a simple email:
```javascript
// Add this to your authController for testing
const testEmail = async (req, res) => {
  try {
    const result = await sendOTPEmail('test@example.com', '123456');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 6. **Alternative Email Services**
If Gmail continues to have issues, consider:

#### Option 1: SendGrid
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: 'YOUR_SENDGRID_API_KEY'
  }
});
```

#### Option 2: Mailgun
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: 'postmaster@your-domain.com',
    pass: 'YOUR_MAILGUN_PASSWORD'
  }
});
```

### 7. **Debugging Steps**

#### Check Environment Variables:
```bash
echo $EMAIL_USER
echo $EMAIL_PASSWORD
```

#### Test SMTP Connection:
```javascript
// Add this to test connection
const testConnection = async () => {
  const transporter = createTransporter();
  try {
    await transporter.verify();
    console.log('SMTP connection successful');
  } catch (error) {
    console.error('SMTP connection failed:', error);
  }
};
```

### 8. **Common Error Messages**

#### "Invalid login"
- Wrong email or password
- App password not generated correctly

#### "Authentication failed"
- 2-Factor Authentication not enabled
- Using regular password instead of App Password

#### "Connection timeout"
- Network issues
- Firewall blocking SMTP

### 9. **Performance Optimization**

#### Current Optimizations:
- Connection pooling enabled
- Rate limiting configured
- High priority headers for OTP emails
- Connection verification before sending

#### Additional Optimizations:
- Use a dedicated email service (SendGrid, Mailgun)
- Implement email queuing for high volume
- Add retry logic for failed emails

### 10. **Monitoring and Logging**

The updated email service now includes:
- Delivery time tracking
- Detailed error logging
- Connection verification
- Performance metrics

Check the console logs for:
- `Attempting to send OTP email to: email@example.com`
- `Email transporter verified successfully`
- `Email sent successfully to email@example.com`
- Delivery time in milliseconds

## Quick Fix Checklist

1. ✅ Enable 2-Factor Authentication on Gmail
2. ✅ Generate App Password (not regular password)
3. ✅ Update .env with correct credentials
4. ✅ Restart the server after .env changes
5. ✅ Check console logs for detailed error messages
6. ✅ Test with a simple email first
7. ✅ Verify SMTP connection before sending

## Still Having Issues?

If emails are still delayed after these optimizations:

1. **Check Gmail's "Sent" folder** - emails might be sent but delayed
2. **Check Spam folder** - emails might be marked as spam
3. **Try a different email service** - SendGrid or Mailgun
4. **Contact Gmail support** - if using Gmail for business
5. **Check server logs** - for detailed error messages 