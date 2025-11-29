# Firebase Setup Instructions

Follow these steps to set up Firebase Authentication for DriveHouse:

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" (or select existing project)
3. Enter project name: `drivehouse-prod` (or your preferred name)
4. (Optional) Disable Google Analytics if not needed
5. Click "Create project"

## 2. Enable Authentication Methods

1. In the Firebase Console, click on your project
2. In the left sidebar, click **Build** → **Authentication**
3. Click "Get Started"
4. Enable the following sign-in methods:

   ### Anonymous (Required)
   - Click on "Anonymous"
   - Toggle "Enable"
   - Click "Save"

   ### Email/Password (Recommended)
   - Click on "Email/Password"
   - Toggle "Enable" for Email/Password
   - Click "Save"

   ### Google (Optional but Recommended)
   - Click on "Google"
   - Toggle "Enable"
   - Select a support email
   - Click "Save"

## 3. Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps"
4. If you don't have a web app yet:
   - Click the web icon `</>`
   - Register app with nickname: `drivehouse-web`
   - **Do NOT** check "Also set up Firebase Hosting"
   - Click "Register app"
5. You'll see a `firebaseConfig` object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 4. Update Environment Variables

1. Open `.env.local` in the DriveHouse project root
2. Replace the placeholder values with your actual Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

3. Save the file

## 5. Verify Setup

Once you've updated `.env.local`, you can start the development server:

```bash
npm run dev
```

The app will:
1. Show a loading spinner "Initializing Productivity OS..."
2. Automatically sign in anonymously (since no custom token is present)
3. Display the main app with your userId in the sidebar

Check the browser console for logs:
- ✅ `"🔐 No custom token, signing in anonymously..."`
- ✅ `"✅ User authenticated: [your-user-id]"`
- ✅ `"✅ User synced to Convex"`

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
- Double-check that you copied the API key correctly
- Make sure there are no extra spaces or quotes
- Verify the API key is enabled in Firebase Console

### Error: "Firebase: Error (auth/operation-not-allowed)"
- Go to Authentication → Sign-in method
- Make sure "Anonymous" is enabled
- Click Save and try again

### App shows loading spinner forever
- Check browser console for error messages
- Verify all environment variables are set correctly
- Make sure you restarted the dev server after updating `.env.local`

## Next Steps

After Firebase is set up, proceed to [Convex Setup](./CONVEX_SETUP.md) to complete the backend integration.
