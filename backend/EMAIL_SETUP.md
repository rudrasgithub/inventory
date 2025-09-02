# Email Setup Instructions

## Prerequisites

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Gmail App Password Setup**
   - Go to your Google Account settings
   - Enable 2-Factor Authentication
   - Generate an App Password for "Mail"
   - Use this app password instead of your regular Gmail password

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://rudra:rudra@cluster0.khbcykf.mongodb.net/inventory

# JWT Secret (Use a more complex secret)
JWT_SECRET=inventory_super_secret_jwt_key_2024_rudra

# Email Configuration (Gmail)
EMAIL_USER=rudramanaidu99@gmail.com
EMAIL_PASSWORD=your_16_character_app_password_here

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Server Configuration
PORT=5000
```

## Gmail App Password Steps

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" from the dropdown
   - Click "Generate"
   - Copy the 16-character password (looks like: xxxx xxxx xxxx xxxx)

3. **Use App Password**
   - Replace `your_16_character_app_password_here` with the generated app password
   - Never use your regular Gmail password

## Testing Email Functionality

1. **Start the server**
   ```bash
   npm run dev
   ```

2. **Test forgot password flow**
   - Go to `/forgot-password`
   - Enter a valid email address
   - Check the email for OTP

3. **Check server logs**
   - Look for "Email sent successfully" messages
   - Check for any error messages

## Troubleshooting

### Common Issues

1. **"Invalid login" error**
   - Make sure you're using an App Password, not your regular password
   - Verify 2-Factor Authentication is enabled

2. **"Connection timeout" error**
   - Check your internet connection
   - Verify Gmail settings allow less secure apps (if not using App Password)

3. **"Authentication failed" error**
   - Double-check your email and app password
   - Make sure the email address is correct

### Security Notes

- Never commit your `.env` file to version control
- Use App Passwords instead of regular passwords
- Keep your JWT_SECRET secure and unique
- Consider using environment-specific configurations for production

## Production Considerations

1. **Use a dedicated email service** (SendGrid, Mailgun, etc.)
2. **Implement rate limiting** for OTP requests
3. **Add email templates** for different scenarios
4. **Set up monitoring** for email delivery
5. **Use environment-specific configurations** 