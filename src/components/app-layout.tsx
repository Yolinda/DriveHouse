"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings } from "lucide-react";
import { AuthDialog } from "@/components/auth-dialog";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

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
                  <p className="font-mono text-xs break-all select-all">{user?.uid}</p>
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
            {user?.isAnonymous ? (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setAuthDialogOpen(true)}
              >
                <User className="mr-2 h-4 w-4" />
                Sign In / Create Account
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            )}
            <Button variant="outline" className="w-full justify-start" disabled>
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>

          {/* Info */}
          {user?.isAnonymous && (
            <div className="rounded-lg border bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                Sign in to save your data across devices and enable sync.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>

      {/* Auth Dialog */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
}
