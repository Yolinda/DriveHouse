# DriveHouse Authentication Implementation Plan

## Overview
This plan outlines the implementation of a secure authentication system for DriveHouse using Firebase Authentication and Convex backend, built with Next.js 15 (App Router), TypeScript, and Shadcn/ui.

## Technology Stack
- **Frontend Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Authentication:** Firebase Authentication
- **Backend/Database:** Convex
- **UI Components:** Shadcn/ui
- **Styling:** Tailwind CSS

## Architecture Overview

```
User Opens App
    ↓
Initialize Firebase Auth
    ↓
Check for __initial_auth_token (global variable)
    ├─ If present → signInWithCustomToken()
    └─ If absent → signInAnonymously()
    ↓
onAuthStateChanged triggered
    ↓
Get Firebase User (userId/UID)
    ↓
Call Convex mutation: createUser(userId, email, displayName)
    ↓
Convex creates/updates user record
    ↓
Hide loading spinner, show main app
```

## Implementation Steps

### Phase 1: Project Scaffolding (30 min)

#### 1.1 Initialize Next.js Project
```bash
npx create-next-app@latest drivehouse-app --typescript --tailwind --app --use-npm
cd drivehouse-app
```

Configuration options:
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ App Router
- ✅ `src/` directory
- ❌ Turbopack (optional)
- ✅ Import alias (@/*)

#### 1.2 Install Core Dependencies
```bash
npm install firebase
npm install convex
npm install -D @types/node
```

#### 1.3 Set up Shadcn/ui
```bash
npx shadcn@latest init
```

Install required components:
```bash
npx shadcn@latest add card
npx shadcn@latest add button
npx shadcn@latest add spinner
```

Note: If spinner is not available, we'll use a custom loading component with Tailwind.

---

### Phase 2: Firebase Setup (15 min)

#### 2.1 Create Firebase Project
**Manual Steps (documented for user):**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Project name: `drivehouse-prod`
4. Disable Google Analytics (optional)
5. Click "Create project"

#### 2.2 Enable Authentication
1. In Firebase Console → Build → Authentication
2. Click "Get Started"
3. Enable sign-in methods:
   - **Anonymous** (required for fallback)
   - **Email/Password** (recommended)
   - **Google** (optional but recommended)
4. Save configuration

#### 2.3 Get Firebase Config
1. Project Settings → General
2. Under "Your apps" → Click Web icon (</>)
3. Register app: `drivehouse-web`
4. Copy the config object:

```typescript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

#### 2.4 Create Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Create `.env.example`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

#### 2.5 Initialize Firebase in App
Create `src/lib/firebase.ts`:
```typescript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
```

---

### Phase 3: Convex Setup (20 min)

#### 3.1 Initialize Convex Project
```bash
npx convex dev
```

This will:
- Create `convex/` directory
- Generate `convex.json`
- Prompt to create Convex account/project
- Add deployment URL to `.env.local`

#### 3.2 Define Users Schema
Create `convex/schema.ts`:
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(), // Firebase UID
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    photoURL: v.optional(v.string()),
    totalPoints: v.number(),
    premiumStatus: v.boolean(),
    createdAt: v.number(),
    lastLoginAt: v.number(),
  })
    .index("by_userId", ["userId"]), // Unique index for fast lookups
});
```

#### 3.3 Create User Mutations
Create `convex/users.ts`:
```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update user
export const createUser = mutation({
  args: {
    userId: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    photoURL: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing user
      await ctx.db.patch(existing._id, {
        email: args.email,
        displayName: args.displayName,
        photoURL: args.photoURL,
        lastLoginAt: now,
      });
      return { userId: args.userId, isNew: false };
    } else {
      // Create new user
      await ctx.db.insert("users", {
        userId: args.userId,
        email: args.email,
        displayName: args.displayName,
        photoURL: args.photoURL,
        totalPoints: 0,
        premiumStatus: false,
        createdAt: now,
        lastLoginAt: now,
      });
      return { userId: args.userId, isNew: true };
    }
  },
});

// Get user by Firebase UID
export const getUserByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});
```

#### 3.4 Set up Convex Provider
Create `src/providers/convex-provider.tsx`:
```typescript
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

---

### Phase 4: Authentication Flow Implementation (45 min)

#### 4.1 Create Auth Context
Create `src/contexts/auth-context.tsx`:
```typescript
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

// Extend Window interface for custom token
declare global {
  interface Window {
    __initial_auth_token?: string;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check for custom token from Canvas environment
        const customToken = window.__initial_auth_token;

        if (customToken) {
          console.log("🔐 Custom token found, signing in...");
          await signInWithCustomToken(auth, customToken);
        } else {
          console.log("🔐 No custom token, signing in anonymously...");
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("❌ Auth initialization error:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Authentication failed");
        }
      }
    };

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      if (firebaseUser) {
        console.log("✅ User authenticated:", firebaseUser.uid);

        // Sync user to Convex
        try {
          const result = await createUser({
            userId: firebaseUser.uid,
            email: firebaseUser.email ?? undefined,
            displayName: firebaseUser.displayName ?? undefined,
            photoURL: firebaseUser.photoURL ?? undefined,
          });

          console.log("✅ User synced to Convex:", result);
          setUser(firebaseUser);
        } catch (err) {
          console.error("❌ Failed to sync user to Convex:", err);
          setError("Failed to sync user data");
        }
      } else {
        console.log("⚠️ No user authenticated");
        setUser(null);
      }

      setLoading(false);
    });

    // Initialize authentication
    initializeAuth();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [createUser]);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### 4.2 Create Loading Screen Component
Create `src/components/loading-screen.tsx`:
```typescript
import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-muted-foreground">
          Initializing Productivity OS...
        </p>
      </div>
    </div>
  );
}
```

---

### Phase 5: UI Implementation (30 min)

#### 5.1 Create App Layout with Sidebar
Create `src/components/app-layout.tsx`:
```typescript
"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-80 border-r bg-muted/40 p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">DriveHouse</h1>
            <p className="text-sm text-muted-foreground">Productivity OS</p>
          </div>

          {/* User ID Verification Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                User Identity
              </CardTitle>
              <CardDescription>Current authenticated user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">User ID</p>
                  <p className="font-mono text-xs break-all">{user?.uid}</p>
                </div>
                {user?.email && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Email</p>
                    <p className="text-xs">{user.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Auth Type</p>
                  <p className="text-xs">
                    {user?.isAnonymous ? "Anonymous" : "Authenticated"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auth Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" disabled>
              <User className="mr-2 h-4 w-4" />
              Sign In
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

#### 5.2 Update Root Layout
Modify `src/app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { AuthProvider } from "@/contexts/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DriveHouse - Productivity OS",
  description: "Manage your life with Google Drive integration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

#### 5.3 Update Home Page
Modify `src/app/page.tsx`:
```typescript
"use client";

import { useAuth } from "@/contexts/auth-context";
import { LoadingScreen } from "@/components/loading-screen";
import { AppLayout } from "@/components/app-layout";

export default function Home() {
  const { loading, error, user } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Authentication Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Welcome to DriveHouse</h2>
          <p className="text-muted-foreground">
            Your productivity OS is ready to use.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-xl font-semibold mb-2">Authentication Status</h3>
          <p className="text-sm text-muted-foreground">
            ✅ Successfully authenticated and synced to Convex
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
```

---

### Phase 6: Security & ACL Foundation (15 min)

#### 6.1 Create ACL Helper Functions
Create `convex/lib/acl.ts`:
```typescript
import { QueryCtx, MutationCtx } from "../_generated/server";

/**
 * Get the current authenticated user ID from the request
 * In a real implementation, this would extract from JWT or session
 */
export async function getCurrentUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  // TODO: Implement proper auth token validation
  // For now, this is a placeholder
  // In production, you would:
  // 1. Get auth token from request headers
  // 2. Validate Firebase token
  // 3. Extract and return userId
  return null;
}

/**
 * Check if user has access to a resource
 */
export async function canAccessResource(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  resourceUserId: string,
  workspaceId?: string
): Promise<boolean> {
  // Private resource: must match userId
  if (resourceUserId === userId) {
    return true;
  }

  // Shared resource: check workspace membership
  if (workspaceId) {
    // TODO: Implement workspace membership check
    // const workspace = await ctx.db.get(workspaceId);
    // return workspace?.members.includes(userId) ?? false;
  }

  return false;
}
```

#### 6.2 Add Security Documentation
Create `convex/README.md`:
```markdown
# Convex Backend - DriveHouse

## Security Model

All data access is secured using Access Control Lists (ACLs) based on the authenticated user's Firebase UID.

### Data Ownership Patterns

1. **Private Data**: Resources owned by a single user
   - Queries/mutations MUST verify `resource.userId === currentUserId`
   - Example: Personal notes, tasks

2. **Shared Data**: Resources in a workspace
   - Queries/mutations MUST verify `currentUserId in workspace.members`
   - Example: Team projects, shared documents

### Implementation Checklist

- [ ] Extract userId from Firebase JWT in HTTP middleware
- [ ] Pass authenticated userId to all queries/mutations via context
- [ ] Add ACL checks to all data access functions
- [ ] Implement workspace membership validation
- [ ] Add audit logging for sensitive operations
- [ ] Set up Convex HTTP endpoints for Firebase token validation

### Future Enhancements

- Rate limiting per user
- Permission levels (view/edit/admin)
- Data encryption at rest
- Audit trail for compliance
```

---

## Testing Checklist

### Manual Testing Steps

1. **Initial Load**
   - [ ] App shows loading spinner with "Initializing Productivity OS..."
   - [ ] Loading time is reasonable (<3 seconds)

2. **Anonymous Authentication**
   - [ ] App successfully signs in anonymously (no custom token)
   - [ ] User ID appears in sidebar card
   - [ ] Console shows "🔐 No custom token, signing in anonymously..."
   - [ ] Console shows "✅ User authenticated: [UID]"

3. **Convex Sync**
   - [ ] Console shows "✅ User synced to Convex"
   - [ ] Check Convex Dashboard → Data → users table has new entry
   - [ ] Verify `totalPoints: 0` and `premiumStatus: false`

4. **UI Display**
   - [ ] Sidebar shows complete userId (Firebase UID)
   - [ ] Email field shows "—" or actual email if available
   - [ ] Auth type shows "Anonymous" or "Authenticated"
   - [ ] Placeholder buttons are disabled
   - [ ] Main content area shows welcome message

5. **Custom Token Flow** (if testing Canvas integration)
   - [ ] Set `window.__initial_auth_token` in browser console before load
   - [ ] App uses `signInWithCustomToken` instead of anonymous
   - [ ] Console shows "🔐 Custom token found, signing in..."

6. **Error Handling**
   - [ ] Invalid Firebase config shows error screen
   - [ ] Network errors display appropriate message
   - [ ] Convex sync failures are logged

### Development Tools

- **Firebase Console**: Monitor auth users
- **Convex Dashboard**: View user records in real-time
- **Browser DevTools**: Check console logs and network requests
- **React DevTools**: Inspect auth context state

---

## Environment Variables Summary

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Convex Configuration (auto-generated by `npx convex dev`)
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
```

---

## File Structure

```
drivehouse-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Home page with auth check
│   │   └── globals.css         # Tailwind imports
│   ├── components/
│   │   ├── ui/                 # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── loading-screen.tsx  # Loading spinner
│   │   └── app-layout.tsx      # Sidebar + main layout
│   ├── contexts/
│   │   └── auth-context.tsx    # Firebase auth + Convex sync
│   ├── providers/
│   │   └── convex-provider.tsx # Convex client provider
│   └── lib/
│       └── firebase.ts         # Firebase initialization
├── convex/
│   ├── schema.ts               # Users table schema
│   ├── users.ts                # User mutations/queries
│   ├── lib/
│   │   └── acl.ts              # ACL helper functions
│   └── README.md               # Security documentation
├── .env.local                  # Environment variables (gitignored)
├── .env.example                # Template for env vars
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Next Steps After Implementation

1. **Test the authentication flow end-to-end**
2. **Verify Firebase and Convex dashboards** show correct data
3. **Implement actual sign-out functionality** (currently placeholder)
4. **Add proper error boundaries** for production
5. **Set up CI/CD** with environment variables
6. **Prepare for first data feature** (notes, tasks, or properties)

---

## Estimated Time: ~2 hours

- Phase 1: 30 min (scaffolding)
- Phase 2: 15 min (Firebase setup)
- Phase 3: 20 min (Convex setup)
- Phase 4: 45 min (auth implementation)
- Phase 5: 30 min (UI components)
- Phase 6: 15 min (ACL foundation)
- Testing: 15 min

**Total: ~2 hours 30 minutes** (including testing and debugging)

---

## Notes & Decisions

### Why Anonymous Sign-In as Fallback?
- Ensures app always works, even without Canvas integration
- Allows testing without setting up custom tokens
- Users can later upgrade to authenticated accounts

### Why Convex Instead of Firebase Firestore?
- Better TypeScript support
- Real-time subscriptions out of the box
- Simpler query API
- Better performance for complex queries

### Why Not Implement Sign-Out Yet?
- Focusing on authentication initialization first
- Sign-out requires additional UI flow (confirmation dialog)
- Can be added later without affecting core auth flow

### Custom Token Support
- Architecture supports future Canvas SSO integration
- Simply set `window.__initial_auth_token` before app loads
- Token must be a valid Firebase Custom Token (generated server-side)

---

## Support & Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/invalid-api-key)"**
   - Check `.env.local` has correct Firebase config
   - Verify API key is enabled in Firebase Console

2. **"ConvexError: Invalid deployment URL"**
   - Run `npx convex dev` to generate deployment URL
   - Check `NEXT_PUBLIC_CONVEX_URL` in `.env.local`

3. **Loading spinner never goes away**
   - Check browser console for errors
   - Verify Firebase and Convex are properly initialized
   - Check network tab for failed requests

4. **User not appearing in Convex dashboard**
   - Verify `npx convex dev` is running
   - Check Convex deployment is active
   - Look for "✅ User synced to Convex" in console

### Getting Help

- Firebase docs: https://firebase.google.com/docs/auth
- Convex docs: https://docs.convex.dev
- Next.js docs: https://nextjs.org/docs
- Shadcn/ui docs: https://ui.shadcn.com
