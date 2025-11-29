# Getting Started with DriveHouse

This guide will walk you through getting DriveHouse up and running on your local machine.

## ✅ What's Already Done

The authentication system has been fully implemented:

- ✅ Next.js 15 project initialized with TypeScript and Tailwind CSS
- ✅ Firebase Authentication configured with anonymous fallback
- ✅ Convex backend with users table and mutations
- ✅ Authentication context that syncs Firebase → Convex
- ✅ UI components with loading screen and sidebar
- ✅ User identity display in sidebar
- ✅ ACL foundation for future features

## 🎯 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

This installs Next.js, Firebase, Convex, Shadcn/ui, and all other dependencies.

### 2. Set Up Firebase

**Option A: Use Placeholder Values (Test Mode)**

The `.env.local` file already has placeholder values. You can skip Firebase setup for now, but the app won't work until you add real credentials.

**Option B: Complete Firebase Setup (Recommended)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (name it anything you like)
3. Go to Authentication → Get Started
4. Enable "Anonymous" sign-in method
5. Go to Project Settings → General
6. Under "Your apps", add a Web app
7. Copy the config values and update `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions with screenshots.

### 3. Set Up Convex

Open a terminal and run:

```bash
npx convex dev
```

**First Time:**
- You'll be prompted to authenticate via browser
- Choose "Create a new project"
- Name it `drivehouse` or anything you prefer
- Convex will automatically update `.env.local` with the deployment URL

**Existing Convex User:**
- Select an existing project or create a new one
- Press Enter to confirm

Keep this terminal window open! Convex needs to run continuously.

### 4. Start Next.js

Open a **second terminal** and run:

```bash
npm run dev
```

### 5. Open the App

Navigate to [http://localhost:3000](http://localhost:3000)

**What You Should See:**

1. **Loading Screen** (2-3 seconds)
   - Spinner animation
   - "Initializing Productivity OS..." message

2. **Main App**
   - Sidebar on the left with:
     - DriveHouse branding
     - User Identity card showing your Firebase UID
     - Placeholder auth buttons (disabled)
   - Main content area with:
     - Welcome message
     - Authentication status checklist
     - Next steps

## 🔍 Verification

### Browser Console

Open DevTools (F12) and check the Console tab. You should see:

```
🔐 No custom token, signing in anonymously...
✅ User authenticated: abc123xyz...
   Anonymous: true
   Email: N/A
✅ User synced to Convex: { userId: 'abc123xyz...', isNew: true }
```

### Convex Dashboard

1. In the terminal running `npx convex dev`, you'll see a dashboard URL
2. Click it to open the Convex dashboard
3. Go to **Data** → **users** table
4. You should see one user record with:
   - `userId`: Your Firebase UID
   - `totalPoints`: 0
   - `premiumStatus`: false
   - `createdAt`: Current timestamp

### Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Users**
4. You should see one anonymous user

## ✅ Success Checklist

- [ ] `npm install` completed without errors
- [ ] Firebase config added to `.env.local`
- [ ] `npx convex dev` is running in one terminal
- [ ] `npm run dev` is running in another terminal
- [ ] App loads at http://localhost:3000
- [ ] Loading spinner appears briefly
- [ ] Sidebar shows userId
- [ ] No errors in browser console
- [ ] User record exists in Convex dashboard
- [ ] User appears in Firebase Authentication

## 🐛 Common Issues

### Issue: "Firebase: Error (auth/invalid-api-key)"

**Solution:**
1. Check that you replaced ALL placeholder values in `.env.local`
2. Make sure there are no extra spaces or quotes
3. Verify the API key is correct in Firebase Console

### Issue: "ConvexError: No deployment URL"

**Solution:**
1. Make sure `npx convex dev` is running
2. Check that `.env.local` has `NEXT_PUBLIC_CONVEX_URL` (should be auto-added)
3. Restart `npm run dev` after Convex is initialized

### Issue: Loading spinner never goes away

**Solution:**
1. Open browser console and check for error messages
2. Verify Firebase config is correct
3. Verify Convex is running
4. Check Network tab for failed requests
5. Try clearing browser cache and reloading

### Issue: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill the process on port 3000 (Windows)
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

## 📝 Understanding the Code

### Key Files to Know

- **[src/app/layout.tsx](./src/app/layout.tsx)** - Wraps app with Convex and Auth providers
- **[src/app/page.tsx](./src/app/page.tsx)** - Main home page with loading state logic
- **[src/contexts/auth-context.tsx](./src/contexts/auth-context.tsx)** - Authentication logic
- **[src/lib/firebase.ts](./src/lib/firebase.ts)** - Firebase initialization
- **[convex/schema.ts](./convex/schema.ts)** - Database schema
- **[convex/users.ts](./convex/users.ts)** - User mutations and queries

### Authentication Flow Explained

1. **App Loads** → `layout.tsx` renders `AuthProvider`
2. **AuthProvider Initializes** → Checks for `window.__initial_auth_token`
3. **No Custom Token** → Falls back to `signInAnonymously()`
4. **Firebase Signs In** → `onAuthStateChanged` fires with Firebase User
5. **Sync to Convex** → `createUser` mutation called with Firebase UID
6. **Convex Creates User** → User record inserted in database
7. **Loading Complete** → `loading` state set to `false`
8. **App Renders** → `page.tsx` shows `AppLayout` instead of `LoadingScreen`

### Custom Token Support

If you want to integrate with an SSO system:

1. Set `window.__initial_auth_token` before the app loads
2. Token must be a valid Firebase Custom Token
3. Generate custom tokens server-side using Firebase Admin SDK

Example:
```html
<script>
  window.__initial_auth_token = "your-custom-firebase-token";
</script>
```

## 🎓 Next Steps

Now that authentication is working, you can:

1. **Explore the Codebase**
   - Read through the main files
   - Understand the authentication flow
   - Check out the Convex schema

2. **Customize the UI**
   - Modify `src/components/app-layout.tsx`
   - Add more Shadcn/ui components
   - Customize colors in `tailwind.config.ts`

3. **Implement Sign-Out**
   - Enable the "Sign Out" button
   - Add sign-out logic to auth context
   - Handle user state clearing

4. **Add New Features**
   - Create notes/tasks/properties tables in Convex
   - Build CRUD operations
   - Implement ACL security checks
   - Add workspaces and sharing

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Auth Guide](https://firebase.google.com/docs/auth)
- [Convex Docs](https://docs.convex.dev)
- [Shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 💬 Getting Help

If you run into issues:

1. Check the [README.md](./README.md) troubleshooting section
2. Review [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase issues
3. Review [CONVEX_SETUP.md](./CONVEX_SETUP.md) for Convex issues
4. Check browser console for error messages
5. Check Convex dashboard logs for backend errors

## 🎉 You're Ready!

Once you see the app running with your userId displayed in the sidebar, you're all set! The authentication foundation is complete and ready for building data features.

Happy coding! 🚀
