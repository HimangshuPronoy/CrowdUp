"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building2, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function CreateCompanyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    website: "",
    email: "",
    color: "#FF6B35",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to create a company");
      router.push("/auth/login");
      return;
    }

    if (!formData.name || !formData.slug) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Create slug from name if not provided
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: formData.name,
          slug: slug,
          description: formData.description,
          website: formData.website,
          email: formData.email,
          color: formData.color,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error("A company with this name or slug already exists");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Company created successfully!");
      router.push(`/company/${data.slug}/manage`);
    } catch (error: any) {
      console.error('Error creating company:', error);
      toast.error(error.message || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, slug });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl px-6 pt-24 pb-8">
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Create Your Company</h1>
              <p className="text-gray-600">Set up your company page and start managing feedback</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <Label htmlFor="name" className="text-base font-semibold mb-2 block">
                Company Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Acme Inc."
                required
                className="h-12"
              />
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug" className="text-base font-semibold mb-2 block">
                URL Slug *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="acme-inc"
                  required
                  className="h-12"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateSlug}
                  className="h-12"
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Your company will be accessible at: /company/{formData.slug || 'your-slug'}
              </p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell us about your company..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Website */}
            <div>
              <Label htmlFor="website" className="text-base font-semibold mb-2 block">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
                className="h-12"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-base font-semibold mb-2 block">
                Contact Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@example.com"
                className="h-12"
              />
            </div>

            {/* Brand Color */}
            <div>
              <Label htmlFor="color" className="text-base font-semibold mb-2 block">
                Brand Color
              </Label>
              <div className="flex gap-4 items-center">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-12 w-24"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#FF6B35"
                  className="h-12"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 gap-2"
                disabled={loading}
              >
                <Send className="h-4 w-4" />
                {loading ? "Creating..." : "Create Company"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/search")}
                className="h-12"
                disabled={loading}
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
