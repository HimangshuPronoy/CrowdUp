"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getCurrentUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    bio: "",
    email: "",
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    setFormData({
      display_name: user.display_name,
      username: user.username,
      bio: user.bio || "",
      email: user.email,
    });
  }, [router]);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        display_name: formData.display_name,
        bio: formData.bio,
      })
      .eq("id", userId);

    if (updateError) {
      setError("Failed to update profile. Please try again.");
      setLoading(false);
      return;
    }

    // Update local storage
    const updatedUser = {
      ...getCurrentUser()!,
      display_name: formData.display_name,
      bio: formData.bio,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setSuccess("Profile updated successfully!");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 mb-8">Manage your account settings and preferences</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm mb-6">
            {success}
          </div>
        )}

        {/* Profile Settings */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
          
          {/* Avatar */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24 bg-gradient-to-br from-yellow-400 to-orange-500 ring-4 ring-orange-200">
                <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-3xl">
                  {formData.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <p className="font-semibold mb-1">Profile Picture</p>
              <p className="text-sm text-gray-600 mb-2">Avatar based on your display name</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) =>
                    setFormData({ ...formData, display_name: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={`@${formData.username}`}
                  disabled
                  className="mt-2 bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="mt-2 bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about yourself..."
                className="mt-2 resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/")}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30 transition-all hover:scale-105"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </main>
    </div>
  );
}
