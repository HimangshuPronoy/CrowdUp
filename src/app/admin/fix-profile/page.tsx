"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Header from "@/components/Header";

export default function FixProfilePage() {
  const { user, profile } = useAuth();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFix = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    if (!username || !fullName) {
      toast.error("Please fill in both fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.toLowerCase().replace(/\s+/g, ''),
          full_name: fullName,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Profile updated! Refreshing...");
      setTimeout(() => window.location.href = '/', 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-2xl px-6 pt-24 pb-8">
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-2">Fix Your Profile</h1>
          <p className="text-gray-600 mb-6">
            Update your username and full name
          </p>

          {profile && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Current Profile:</p>
              <p className="font-semibold">Username: {profile.username}</p>
              <p className="font-semibold">Full Name: {profile.full_name || 'Not set'}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="username">New Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lowercase, no spaces
              </p>
            </div>

            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleFix}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
