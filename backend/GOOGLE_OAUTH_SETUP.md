# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for Rain OS.

## Prerequisites

- A Google Cloud Console account
- Access to your project's `.env` file

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project name/ID

## Step 2: Enable Google+ API

1. In your Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in required fields:
     - App name: "Rain OS"
     - User support email: your email
     - Developer contact email: your email
   - Click **Save and Continue**
   - Skip adding scopes (click **Save and Continue**)
   - Add test users if needed
   - Click **Save and Continue**

4. Back on the Create OAuth Client ID page:
   - Application type: **Web application**
   - Name: "Rain OS Web Client"
   - **Authorized JavaScript origins**:
     - `http://localhost:3001` (for local development)
     - Add your production backend URL when deploying
   - **Authorized redirect URIs**:
     - `http://localhost:3001/api/auth/google/callback` (for local development)
     - Add your production callback URL when deploying (e.g., `https://api.yourdomain.com/api/auth/google/callback`)
   - Click **Create**

5. Copy the **Client ID** and **Client Secret** that appear

## Step 4: Update Your .env File

Add the following to your `.env` file in the backend:

```env
GOOGLE_CLIENT_ID="your_client_id_here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_client_secret_here"
APP_URL="http://localhost:3000"
```

**Important**: Replace the placeholder values with your actual credentials from Step 3.

## Step 5: Rebuild and Restart Backend

```bash
cd /path/to/Rain_OS_Headless_AEO_Analysis_Engine
npm run build
npm start
```

## Step 6: Test the Integration

1. Open your frontend at `http://localhost:3000`
2. Click "Sign in with Google" on the login page
3. You should be redirected to Google's consent screen
4. After authorizing, you should be redirected back and logged in

## Production Deployment

When deploying to production:

1. Add your production URLs to the **Authorized JavaScript origins** and **Authorized redirect URIs** in Google Cloud Console
2. Update `APP_URL` in your production `.env` to your frontend URL
3. Make sure HTTPS is enabled on your production backend

## Troubleshooting

### "redirect_uri_mismatch" Error

This means the callback URL doesn't match what's configured in Google Cloud Console. Make sure:
- The URL in Google Cloud Console exactly matches `http://localhost:3001/api/auth/google/callback` (or your production URL)
- There are no trailing slashes
- The protocol (http vs https) matches

### "Google OAuth not configured" Error

This means either:
- `GOOGLE_CLIENT_ID` is not set in `.env`
- `GOOGLE_CLIENT_SECRET` is not set in `.env`
- You haven't rebuilt the backend after adding credentials

Solution: Check your `.env` file, then run `npm run build && npm start`

### "Invalid Google token" Error

This could mean:
- The token has expired
- The Client ID doesn't match
- Try clearing browser cache and cookies

## Security Notes

- **Never commit** `.env` file to git
- Keep `GOOGLE_CLIENT_SECRET` confidential
- Use environment variables for production deployments
- Enable HTTPS in production for secure token exchange

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
