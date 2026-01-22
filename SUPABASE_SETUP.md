# Supabase OAuth Setup Guide

This guide will help you set up Supabase OAuth authentication for Google login in the Miet frontend.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Step 1: Install Dependencies

The Supabase client library has been added to `package.json`. Install it by running:

```bash
npm install
```

## Step 2: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Create a new project or use an existing one
3. Wait for the project to be fully initialized

## Step 3: Configure Google OAuth Provider

1. In your Supabase project dashboard, go to **Authentication** > **Providers**
2. Find **Google** in the list of providers
3. Enable Google OAuth
4. You'll need to:
   - Create a Google OAuth Client ID and Secret in [Google Cloud Console](https://console.cloud.google.com/)
   - Add the OAuth credentials to Supabase
   - Configure the authorized redirect URIs

### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or **Google Identity Services API**)
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID**
5. Choose **Web application**
6. **IMPORTANT - Add authorized redirect URIs:**
   - You MUST add the Supabase callback URL exactly as shown:
   - `https://nmnsrofhtwcwkhgoyfcs.supabase.co/auth/v1/callback`
   - Replace `nmnsrofhtwcwkhgoyfcs` with your actual Supabase project reference
   - **CRITICAL:** This URL must match EXACTLY (including https, no trailing slash)
   - **DO NOT** add your app's callback URLs here - only the Supabase callback URL
7. Copy the **Client ID** and **Client Secret**
8. **Save the OAuth client configuration**

### Supabase Configuration

1. In Supabase dashboard, go to **Authentication** > **Providers** > **Google**
2. Paste your Google **Client ID** and **Client Secret**
3. Save the configuration

## Step 4: Configure Environment Variables

Create a `.env.local` file in the root of your project (if it doesn't exist) and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

**Example (replace with your actual values):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://nmnsrofhtwcwkhgoyfcs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

To find these values:
1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon) > **API**
3. Copy the **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
4. Copy the **anon/public** key (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

**⚠️ Important:** After creating or updating `.env.local`:
1. **Restart your Next.js development server** (stop with Ctrl+C and run `npm run dev` again)
2. Environment variables are only loaded when the server starts
3. Make sure there are no extra spaces or quotes around the values

## Step 5: Configure Redirect URLs in Supabase

In your Supabase project dashboard:
1. Go to **Authentication** > **URL Configuration**
2. Set the **Site URL** to your base domain:
   - For local development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
3. **Add Redirect URLs** (one per line, click "Add URL" for each):
   - For local development (English): `http://localhost:3000/en/auth/callback`
   - For local development (Hindi): `http://localhost:3000/hi/auth/callback`
   - For production (English): `https://yourdomain.com/en/auth/callback`
   - For production (Hindi): `https://yourdomain.com/hi/auth/callback`
   - **OR** use wildcard pattern: `http://localhost:3000/**` (covers all paths)
   - **OR** use wildcard pattern: `https://yourdomain.com/**` (covers all paths)

**Important Notes:**
- The Supabase callback URL (`https://nmnsrofhtwcwkhgoyfcs.supabase.co/auth/v1/callback`) is handled automatically - **DO NOT** add it here
- Google OAuth flow: User → Google → Supabase callback → Your app callback
- Make sure URLs match exactly (including http vs https, ports, paths)
- After adding URLs, click **Save** at the bottom

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to a page with the Google login button
3. Click "Login with Google"
4. You should be redirected to Google's consent page
5. After authorizing, you'll be redirected back to your app

## How It Works

1. **GoogleAuth Component**: Uses Supabase's `signInWithOAuth()` method to initiate Google OAuth
2. **Callback Handler**: The `/auth/callback` page handles the OAuth redirect and verifies the session
3. **Session Management**: Supabase automatically manages the session and stores it securely
4. **Authentication Check**: Components can check authentication using `supabase.auth.getSession()`

## Backend Integration

If your backend API still expects JWT tokens, you can:

1. Use the Supabase access token directly (if your backend validates Supabase tokens)
2. Create a bridge endpoint that exchanges Supabase tokens for your backend JWT tokens
3. Update your backend to validate Supabase access tokens

To get the Supabase access token for API calls:

```typescript
import { getSupabaseAccessToken } from '@/utils/supabase';

const token = await getSupabaseAccessToken();
// Use token in Authorization header: `Bearer ${token}`
```

## Troubleshooting

### "supabaseUrl is required" or "Supabase credentials are missing" error
- **Most common cause:** Environment variables not loaded - **restart your dev server** after adding/updating `.env.local`
- Check that `.env.local` exists in the project root (same directory as `package.json`)
- Verify the variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (case-sensitive)
- Make sure there are no spaces or quotes around the values:
  ```env
  # ✅ Correct
  NEXT_PUBLIC_SUPABASE_URL=https://nmnsrofhtwcwkhgoyfcs.supabase.co
  
  # ❌ Wrong (has quotes)
  NEXT_PUBLIC_SUPABASE_URL="https://nmnsrofhtwcwkhgoyfcs.supabase.co"
  
  # ❌ Wrong (has trailing space)
  NEXT_PUBLIC_SUPABASE_URL=https://nmnsrofhtwcwkhgoyfcs.supabase.co 
  ```
- Check the browser console for the debug info showing what values were found
- If using Vercel or other hosting, make sure to add the env vars in the platform's dashboard too

### OAuth redirect not working
- Check that your redirect URLs are correctly configured in both Google Cloud Console and Supabase
- Ensure the redirect URL in the code matches your actual domain/locale structure

### Session not persisting
- Check browser console for errors
- Verify that cookies are enabled in your browser
- Check Supabase project settings for session configuration

## Security Notes

- Never commit your `.env.local` file to version control
- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose in the frontend (it's designed for client-side use)
- Always use Row Level Security (RLS) policies in Supabase for database access control
