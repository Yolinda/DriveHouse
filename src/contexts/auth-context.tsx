"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  signInAnonymously,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth";
import { auth, uploadProfilePhoto } from "@/lib/firebase";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (displayName?: string, photoFile?: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Extend Window interface for custom token support
declare global {
  interface Window {
    __initial_auth_token?: string;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Always call the hook (Rules of Hooks), but check if Convex is ready before using it
  const createUser = useMutation(api.users.createUser);
  const updateUserProfile = useMutation(api.users.updateUserProfile);

  const isConvexReady = typeof window !== 'undefined' &&
                        process.env.NEXT_PUBLIC_CONVEX_URL &&
                        !process.env.NEXT_PUBLIC_CONVEX_URL.includes('placeholder');

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in";
      setError(errorMessage);
      throw err;
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account";
      setError(errorMessage);
      throw err;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in with Google";
      setError(errorMessage);
      throw err;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      // After sign out, sign in anonymously again
      await signInAnonymously(auth);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign out";
      setError(errorMessage);
      throw err;
    }
  };

  // Update user profile (displayName and photo)
  const updateProfile = async (displayName?: string, photoFile?: File) => {
    if (!user) {
      throw new Error("No user signed in");
    }

    if (user.isAnonymous) {
      throw new Error("Anonymous users cannot update their profile");
    }

    try {
      setError(null);

      // Upload photo to Firebase Storage if provided
      let photoURL = user.photoURL;
      if (photoFile) {
        photoURL = await uploadProfilePhoto(user.uid, photoFile);
      }

      // Update Firebase Auth profile
      await firebaseUpdateProfile(user, {
        displayName: displayName ?? user.displayName,
        photoURL: photoURL,
      });

      // Sync to Convex
      if (isConvexReady && updateUserProfile) {
        await updateUserProfile({
          userId: user.uid,
          displayName: displayName,
          photoURL: photoURL ?? undefined,
        });
      }

      // Force a refresh of the user object
      await user.reload();
      setUser({ ...auth.currentUser } as User);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check for custom token from Canvas environment or SSO integration
        const customToken = typeof window !== 'undefined' ? window.__initial_auth_token : undefined;

        if (customToken) {
          console.log("🔐 Custom token found, signing in with custom token...");
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
        console.log("   Anonymous:", firebaseUser.isAnonymous);
        console.log("   Email:", firebaseUser.email || "N/A");

        // Sync user to Convex (only if Convex is initialized)
        if (isConvexReady && createUser) {
          try {
            const result = await createUser({
              userId: firebaseUser.uid,
              email: firebaseUser.email ?? undefined,
              displayName: firebaseUser.displayName ?? undefined,
              photoURL: firebaseUser.photoURL ?? undefined,
            });

            console.log("✅ User synced to Convex:", result);
            setUser(firebaseUser);
            setLoading(false);
          } catch (err) {
            console.error("❌ Failed to sync user to Convex:", err);
            setError("Failed to sync user data. Make sure Convex is running (`npx convex dev`)");
            setLoading(false);
          }
        } else {
          console.warn("⚠️ Convex not initialized. Run `npx convex dev` to enable user sync.");
          setUser(firebaseUser);
          setLoading(false);
        }
      } else {
        console.log("⚠️ No user authenticated");
        setUser(null);
        setLoading(false);
      }
    });

    // Initialize authentication
    initializeAuth();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [createUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
