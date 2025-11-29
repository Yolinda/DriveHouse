# DriveHouse - Productivity OS

DriveHouse is a productivity application with full Google Drive integration, built with Next.js 15, Firebase Authentication, and Convex backend.

## 🚀 Current Status

✅ **Authentication System Implemented**
- Firebase Authentication with anonymous fallback
- Convex backend user synchronization
- Secure user identity management
- ACL foundation for future data features

## 📋 Prerequisites

Before you begin, make sure you have:

- Node.js 18+ installed
- npm package manager
- A Firebase account (free tier is sufficient)
- A Convex account (free tier is sufficient)

## 🛠️ Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Firebase

Follow the detailed instructions in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md):

1. Create a Firebase project
2. Enable Authentication (Anonymous, Email/Password, Google)
3. Get your Firebase config credentials
4. Update `.env.local` with your Firebase keys

### Step 3: Set Up Convex

Follow the detailed instructions in [CONVEX_SETUP.md](./CONVEX_SETUP.md):

1. Run `npx convex dev`
2. Create or select a Convex project
3. Convex will automatically update `.env.local` with the deployment URL

### Step 4: Start Development Servers

You need **two terminal windows**:

**Terminal 1 - Convex Backend:**
```bash
npx convex dev
```

**Terminal 2 - Next.js Frontend:**
```bash
npm run dev
```

### Step 5: Open the App

Navigate to [http://localhost:3000](http://localhost:3000)

You should see:
1. Loading spinner: "Initializing Productivity OS..."
2. Automatic anonymous sign-in
3. Main app with sidebar showing your userId

## 📁 Project Structure

```
DriveHouse/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   ├── components/             # React components
│   ├── contexts/               # React contexts (auth)
│   ├── providers/              # Providers (Convex)
│   └── lib/                    # Utilities (Firebase, utils)
├── convex/                     # Backend (schema, mutations, queries)
├── .env.local                  # Environment variables (gitignored)
└── README.md                   # This file
```

## 🔐 Authentication Flow

```
User opens app
    ↓
Initialize Firebase Auth
    ↓
Check for __initial_auth_token
    ├─ If present → signInWithCustomToken()
    └─ If absent → signInAnonymously()
    ↓
onAuthStateChanged triggered
    ↓
Get Firebase User (userId/UID)
    ↓
Call Convex mutation: createUser()
    ↓
Convex creates/updates user record
    ↓
Hide loading spinner, show main app
```

## 🧪 Testing

### Verification Checklist

- [ ] App shows loading spinner on initial load
- [ ] Anonymous authentication works
- [ ] userId appears in sidebar
- [ ] Convex user record created (check dashboard)
- [ ] Console shows success messages
- [ ] No errors in browser console

### Browser Console Logs

You should see:
```
🔐 No custom token, signing in anonymously...
✅ User authenticated: [firebase-uid]
✅ User synced to Convex: { userId: '...', isNew: true }
```

## 🐛 Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Check `.env.local` has correct Firebase config
- Verify API key in Firebase Console

### "ConvexError: Invalid deployment URL"
- Run `npx convex dev` first
- Check `NEXT_PUBLIC_CONVEX_URL` in `.env.local`
- Restart Next.js dev server

### Loading spinner never disappears
- Check browser console for errors
- Verify both Firebase and Convex are configured
- Check network tab for failed requests

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) and [CONVEX_SETUP.md](./CONVEX_SETUP.md) for detailed troubleshooting.

## 🔜 Next Steps

- [ ] Implement sign-out functionality
- [ ] Add profile editing capabilities
- [ ] Create data models for notes, tasks, and properties
- [ ] Build workspace and sharing features
- [ ] Integrate Google Drive API

## 📖 Additional Documentation

- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Convex Setup Guide](./CONVEX_SETUP.md)
- [Authentication Implementation Plan](./AUTHENTICATION_IMPLEMENTATION_PLAN.md)
- [Convex Backend Documentation](./convex/README.md)

## 🤝 Technologies

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Authentication:** Firebase Auth
- **Database:** Convex
- **UI:** Shadcn/ui + Tailwind CSS
- **Icons:** Lucide React