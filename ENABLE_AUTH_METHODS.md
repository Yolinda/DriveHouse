# Enabling Additional Authentication Methods

Your DriveHouse app now supports Email/Password and Google authentication! Follow these steps to enable them in Firebase.

## Current Status

✅ **Already Implemented:**
- Anonymous authentication (working)
- Email/Password sign-in UI
- Google sign-in UI
- Sign-out functionality

⚠️ **Needs Configuration:**
- Enable Email/Password in Firebase Console
- Enable Google Sign-In in Firebase Console

## Step 1: Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your DriveHouse project
3. Click **Authentication** in the left sidebar
4. Go to the **Sign-in method** tab
5. Find **Email/Password** in the list
6. Click on it to expand
7. Toggle **Enable** to ON
8. Click **Save**

**That's it!** Email/Password authentication is now enabled.

## Step 2: Enable Google Sign-In

1. Still in **Authentication** → **Sign-in method**
2. Find **Google** in the provider list
3. Click on it to expand
4. Toggle **Enable** to ON
5. **Select a support email** from the dropdown (your email or project email)
6. Click **Save**

### Optional: Configure OAuth Consent Screen

If you want to customize the Google sign-in screen:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **OAuth consent screen**
4. Configure your app name, logo, and privacy policy links
5. Save changes

## Step 3: Test the Authentication

### Test Email/Password

1. Open your app at [http://localhost:3001](http://localhost:3001)
2. Click **"Sign In / Create Account"** in the sidebar
3. Fill in:
   - Email: `test@example.com`
   - Password: `password123` (minimum 6 characters)
4. Click **"Create Account"**
5. ✅ You should be signed in!

**Verify:**
- Sidebar should show your email
- Auth Type should change from "Anonymous" to "Authenticated"
- Firebase Console → Authentication → Users should show your email

### Test Google Sign-In

1. Click **"Sign Out"** in the sidebar (signs you out and back in anonymously)
2. Click **"Sign In / Create Account"** again
3. Click **"Sign in with Google"**
4. Select your Google account
5. ✅ You should be signed in with Google!

**Verify:**
- Sidebar shows your Google email
- Your Google profile photo appears (if available)
- Firebase Console shows Google provider

### Test Sign-Out

1. Click **"Sign Out"** in the sidebar
2. ✅ You should be signed out and automatically signed back in anonymously
3. Sidebar shows "Anonymous" again

## Features Overview

### What's Working

**Sign In / Create Account Dialog:**
- ✅ Email/Password sign-up (creates new account)
- ✅ Email/Password sign-in (existing account)
- ✅ Google Sign-In (one-click authentication)
- ✅ Toggle between sign-up and sign-in modes
- ✅ Error handling with user-friendly messages
- ✅ Loading states during authentication

**Sign Out:**
- ✅ Signs out from current account
- ✅ Automatically signs in anonymously
- ✅ Data is preserved in Convex

**User Identity:**
- ✅ Shows Firebase UID
- ✅ Shows email for authenticated users
- ✅ Shows auth type (Anonymous vs Authenticated)
- ✅ Syncs to Convex on every sign-in

## Security Notes

### Password Requirements
- Minimum 6 characters (Firebase default)
- Consider enforcing stronger passwords in production

### Anonymous to Authenticated Upgrade
When a user creates an account:
- A new user record is created in Firebase
- The anonymous user data is NOT automatically transferred
- Consider implementing account linking if you want to preserve anonymous user data

### Data Privacy
- User emails are stored in Firebase Authentication (secure)
- User profiles are synced to Convex (check your Convex dashboard)
- Ensure you have a privacy policy before going to production

## Common Errors & Solutions

### "Firebase: Error (auth/email-already-in-use)"
**Solution:** The email is already registered. Use "Sign In" instead of "Create Account"

### "Firebase: Error (auth/wrong-password)"
**Solution:** Incorrect password. Double-check your password or use password reset (not yet implemented)

### "Firebase: Error (auth/user-not-found)"
**Solution:** No account exists with this email. Use "Create Account" to register

### "Firebase: Error (auth/weak-password)"
**Solution:** Password must be at least 6 characters

### "Firebase: Error (auth/operation-not-allowed)"
**Solution:** Enable Email/Password or Google authentication in Firebase Console (see steps above)

### Google Sign-In Popup Blocked
**Solution:** Allow popups for localhost in your browser settings

## Optional: Add Password Reset

To add password reset functionality (future enhancement):

1. In Firebase Console → Authentication → Templates
2. Customize the "Password reset" email template
3. Implement a "Forgot Password?" link in the auth dialog
4. Use `sendPasswordResetEmail(auth, email)` from Firebase

## Next Steps

Now that you have authentication working:

1. ✅ Users can create accounts
2. ✅ Users can sign in/out
3. ✅ Data syncs to Convex
4. 📋 **Next:** Implement profile editing (update displayName, photo)
5. 📋 **Next:** Add password reset functionality
6. 📋 **Next:** Implement account linking (upgrade from anonymous)
7. 📋 **Next:** Add email verification

## Verification Checklist

- [ ] Email/Password enabled in Firebase Console
- [ ] Google Sign-In enabled in Firebase Console
- [ ] Tested creating an account with email/password
- [ ] Tested signing in with email/password
- [ ] Tested Google Sign-In
- [ ] Tested Sign Out
- [ ] Verified user appears in Firebase Console
- [ ] Verified user syncs to Convex dashboard
- [ ] Sidebar correctly shows email and auth type

Once all items are checked, your authentication system is fully configured! 🎉

## Support

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firebase Auth Errors](https://firebase.google.com/docs/reference/js/auth#autherrorcodes)
- [Google Sign-In Guide](https://firebase.google.com/docs/auth/web/google-signin)
