"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { User, Bell, Shield, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    bio: "",
  });

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to access settings");
      router.push("/auth/login");
      return;
    }

    if (profile) {
      setFormData({
        username: profile.username || "",
        fullName: profile.full_name || "",
        bio: profile.bio || "",
      });
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    // Timeout to prevent infinite loading
    const timer = setTimeout(() => {
      if (!profile && user) {
        setLoading(false);
        toast.error("Profile not found. Please try refreshing.");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.fullName,
          bio: formData.bio,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-bold">Profile Settings</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-6 mb-6">
                <Avatar className="h-20 w-20 bg-orange-500">
                  <AvatarFallback className="bg-orange-500 text-white text-2xl">
                    {profile.full_name?.[0] || profile.username[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Profile Picture</p>
                  <Button variant="outline" size="sm" disabled>
                    Change Photo (Coming Soon)
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="username"
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="mt-2"
                />
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-bold">Notifications</h2>
            </div>
            <p className="text-gray-600">Notification settings coming soon...</p>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-bold">Privacy & Security</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  value={user.email || ""}
                  disabled
                  className="mt-2 bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <Button variant="outline" disabled>
                Change Password (Coming Soon)
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg border border-red-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="h-5 w-5 text-red-500" />
              <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button variant="destructive" disabled>
              Delete Account (Coming Soon)
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
