"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/auth";
import { Building2, Send } from "lucide-react";

export default function CreateCompanyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    display_name: "",
    description: "",
    website: "",
    logo_url: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    if (!formData.name || !formData.display_name || !formData.description) {
      setError("Please fill in all required fields");
      return;
    }

    // Generate URL-friendly name from display name if not provided
    const urlName = formData.name || formData.display_name.toLowerCase().replace(/\s+/g, '-');

    setLoading(true);

    // Check if company name already exists
    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id")
      .eq("name", urlName)
      .single();

    if (existingCompany) {
      setError("A company with this name already exists");
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("companies")
      .insert({
        name: urlName,
        display_name: formData.display_name,
        description: formData.description,
        website: formData.website || null,
        logo_url: formData.logo_url || null,
        category: formData.category || null,
      })
      .select()
      .single();

    if (insertError) {
      setError("Failed to create company. Please try again.");
      setLoading(false);
      return;
    }

    if (data) {
      // Add creator as company member
      await supabase
        .from("company_members")
        .insert({
          company_id: data.id,
          user_id: userId,
          role: "owner",
        });

      router.push(`/company/${data.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl px-6 pt-24 pb-8">
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Create Company Page</h1>
          </div>
          <p className="text-gray-600 mb-8">
            Create a company page to showcase your brand and collect feedback
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Display Name */}
            <div>
              <Label htmlFor="display_name" className="text-base font-semibold mb-2 block">
                Company Name *
              </Label>
              <Input
                id="display_name"
                placeholder="Acme Corporation"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="h-12"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                The official name of your company
              </p>
            </div>

            {/* URL Name */}
            <div>
              <Label htmlFor="name" className="text-base font-semibold mb-2 block">
                URL Name (Optional)
              </Label>
              <Input
                id="name"
                placeholder="acme-corporation"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="h-12"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL-friendly name (e.g., "acme-corp"). Leave blank to auto-generate from company name
              </p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold mb-2 block">
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Tell us about your company, what you do, and your mission..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="resize-none"
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-base font-semibold mb-2 block">
                Industry (Optional)
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select industry..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">💻 Technology</SelectItem>
                  <SelectItem value="Social Media">👥 Social Media</SelectItem>
                  <SelectItem value="Entertainment">🎮 Entertainment</SelectItem>
                  <SelectItem value="E-commerce">🛍️ E-commerce</SelectItem>
                  <SelectItem value="Finance">💰 Finance</SelectItem>
                  <SelectItem value="Healthcare">❤️ Healthcare</SelectItem>
                  <SelectItem value="Education">📚 Education</SelectItem>
                  <SelectItem value="Transportation">🚗 Transportation</SelectItem>
                  <SelectItem value="Food & Beverage">🍔 Food & Beverage</SelectItem>
                  <SelectItem value="Travel">✈️ Travel</SelectItem>
                  <SelectItem value="Gaming">🎯 Gaming</SelectItem>
                  <SelectItem value="Other">📦 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Website */}
            <div>
              <Label htmlFor="website" className="text-base font-semibold mb-2 block">
                Website (Optional)
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="https://www.yourcompany.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="h-12"
              />
            </div>

            {/* Logo URL */}
            <div>
              <Label htmlFor="logo_url" className="text-base font-semibold mb-2 block">
                Logo URL (Optional)
              </Label>
              <Input
                id="logo_url"
                type="url"
                placeholder="https://example.com/logo.png"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="h-12"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a direct link to your company logo (recommended: 200x200px)
              </p>
            </div>

            {/* Preview */}
            {formData.logo_url && (
              <div className="border rounded-xl p-4 bg-gray-50">
                <p className="text-sm font-medium mb-2">Logo Preview:</p>
                <img 
                  src={formData.logo_url} 
                  alt="Logo preview" 
                  className="h-16 w-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white gap-2 shadow-lg shadow-orange-500/30"
              >
                <Send className="h-4 w-4" />
                {loading ? "Creating..." : "Create Company Page"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="h-12"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
