# Google Maps InvalidKeyMapError Fix Guide

## Issue
Google Maps loads initially but then shows `InvalidKeyMapError`. This typically happens when domain restrictions in Google Cloud Console don't match all variations of your domain.

## Solution: Add ALL Domain Variations

When configuring API key restrictions in Google Cloud Console, you must add **ALL** possible domain variations:

### For miet.life:

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your API key
3. Under **Application restrictions**, select **HTTP referrers (websites)**
4. Add **ALL** of these patterns:

```
https://miet.life/*
https://www.miet.life/*
http://miet.life/*
http://www.miet.life/*
https://*.miet.life/*
http://*.miet.life/*
```

**Important Notes:**
- Include both `www` and non-`www` versions
- Include both `http://` and `https://` (even if you only use HTTPS)
- Include wildcard subdomains (`*.miet.life/*`) for any subdomains
- Each pattern must end with `/*` to match all paths

### If Using Railway Domains:

Also add Railway domains if your app is deployed there:

```
https://*.railway.app/*
https://miet-frontend-production.up.railway.app/*
```

### After Adding Domains:

1. Click **Save** in Google Cloud Console
2. **Wait 5-10 minutes** for changes to propagate
3. Clear browser cache or use incognito mode
4. Test again

## Verify API Key Settings

1. **API Restrictions**: Make sure these APIs are enabled:
   - ✅ Maps JavaScript API (REQUIRED)
   - ✅ Places API (if using Places features)
   - ✅ Geocoding API (if using geocoding)

2. **Billing**: Must be enabled (even for free tier - you get $200/month free credit)

3. **API Key Format**: Verify your API key in Railway environment variables matches exactly what's in Google Cloud Console

## Testing

After making changes:

1. Open browser console (F12)
2. Look for error messages that show the exact referrer URL being blocked
3. Check if the referrer matches any of your added patterns
4. If still blocked, add the exact referrer pattern shown in the error

## Common Mistakes

❌ **Wrong**: `https://miet.life` (missing `/*` at the end)
✅ **Correct**: `https://miet.life/*`

❌ **Wrong**: Only adding `https://miet.life/*` (missing www version)
✅ **Correct**: Add both `https://miet.life/*` AND `https://www.miet.life/*`

❌ **Wrong**: Adding domain without protocol
✅ **Correct**: Always include `http://` or `https://`

## Debug Info

The code now logs detailed error information to the browser console:
- Current URL
- Hostname
- API key prefix (first 10 characters)
- Full error message

Check the browser console for exact details about what's being blocked.
