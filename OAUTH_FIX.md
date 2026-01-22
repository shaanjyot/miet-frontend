# Fix: OAuth redirect_uri_mismatch Error

## Error Message
```
Error 400: redirect_uri_mismatch
Access blocked: This app's request is invalid
```

## Root Cause
The redirect URI in Google Cloud Console doesn't match what Supabase is sending to Google.

## Quick Fix Steps

### 1. Verify Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your OAuth 2.0 Client ID (the one you're using for Supabase)
4. Click **Edit** (pencil icon)
5. Under **Authorized redirect URIs**, make sure you have EXACTLY:
   ```
   https://nmnsrofhtwcwkhgoyfcs.supabase.co/auth/v1/callback
   ```
   - Replace `nmnsrofhtwcwkhgoyfcs` with your actual Supabase project reference
   - Must start with `https://`
   - Must end with `/auth/v1/callback`
   - **NO trailing slash**
   - **NO extra paths or parameters**

6. Click **Save**

### 2. Verify Supabase Configuration

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** > **Providers** > **Google**
4. Verify your **Client ID** and **Client Secret** are correct
5. Click **Save** if you made any changes

### 3. Verify Supabase Redirect URLs

1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**
2. Under **Redirect URLs**, add (if not already present):
   ```
   http://localhost:3000/en/auth/callback
   http://localhost:3000/hi/auth/callback
   ```
   Or use wildcard:
   ```
   http://localhost:3000/**
   ```
3. Click **Save**

### 4. Common Mistakes to Avoid

❌ **WRONG - Adding app URLs to Google Cloud Console:**
```
http://localhost:3000/en/auth/callback  ← DON'T ADD THIS TO GOOGLE
```

✅ **CORRECT - Only Supabase URL in Google Cloud Console:**
```
https://nmnsrofhtwcwkhgoyfcs.supabase.co/auth/v1/callback  ← ONLY THIS
```

❌ **WRONG - Missing https or wrong path:**
```
http://nmnsrofhtwcwkhgoyfcs.supabase.co/auth/v1/callback  ← Missing 's' in https
https://nmnsrofhtwcwkhgoyfcs.supabase.co/auth/callback    ← Missing '/v1'
```

✅ **CORRECT - Exact format:**
```
https://nmnsrofhtwcwkhgoyfcs.supabase.co/auth/v1/callback
```

### 5. Test the Fix

1. Clear your browser cache and cookies (or use incognito mode)
2. Restart your Next.js dev server:
   ```bash
   npm run dev
   ```
3. Try logging in with Google again

## Still Not Working?

### Check 1: Verify Your Supabase Project Reference
- Go to Supabase Dashboard > Settings > API
- Your Project URL should be: `https://YOUR-PROJECT-REF.supabase.co`
- Use this exact reference in Google Cloud Console

### Check 2: Wait for Propagation
- Google OAuth changes can take a few minutes to propagate
- Wait 2-5 minutes after saving changes before testing

### Check 3: Check Browser Console
- Open browser DevTools (F12)
- Check the Console tab for any additional error messages
- Check the Network tab to see the exact redirect URI being used

### Check 4: Verify OAuth Client
- Make sure you're using the correct OAuth Client ID in Supabase
- The Client ID in Supabase must match the one in Google Cloud Console

## Flow Diagram

```
User clicks "Login with Google"
    ↓
App calls: supabase.auth.signInWithOAuth()
    ↓
Supabase redirects to: https://accounts.google.com/...
    ↓
User authorizes on Google
    ↓
Google redirects to: https://nmnsrofhtwcwkhgoyfcs.supabase.co/auth/v1/callback
    ↓ (This URL MUST be in Google Cloud Console)
Supabase processes the callback
    ↓
Supabase redirects to: http://localhost:3000/en/auth/callback
    ↓ (This URL MUST be in Supabase Dashboard)
Your app handles the callback
```

## Need More Help?

If the error persists:
1. Double-check all URLs match exactly (case-sensitive, no extra spaces)
2. Verify you're using the correct OAuth Client (not a different project's client)
3. Check Supabase logs: Dashboard > Logs > Auth Logs
4. Try creating a new OAuth Client in Google Cloud Console and updating Supabase
