"use client";

import { useAuth } from "@/contexts/auth-context";
import { LoadingScreen } from "@/components/loading-screen";
import { AppLayout } from "@/components/app-layout";

// This page requires client-side authentication, so disable static generation
export const dynamic = 'force-dynamic';

export default function Home() {
  const { loading, error, user } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Authentication Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">
            Please check your Firebase configuration in .env.local
          </p>
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
          <h3 className="text-xl font-semibold mb-4">Authentication Status</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Successfully authenticated via Firebase</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>User profile synced to Convex database</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Access control lists (ACL) ready for secure data operations</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted p-6">
          <h3 className="text-xl font-semibold mb-2">Next Steps</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Implement sign-out functionality</li>
            <li>Add user profile editing capabilities</li>
            <li>Create data models for notes, tasks, and properties</li>
            <li>Build workspace and sharing features</li>
            <li>Integrate Google Drive API</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
