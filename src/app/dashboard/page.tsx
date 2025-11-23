"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Smartphone, 
  Users, 
  Settings,
  Plus,
  ExternalLink,
  BarChart3
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, getCurrentUserId } from "@/lib/auth";

interface Company {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  logo_url: string | null;
  category: string | null;
  role: string;
}

interface App {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  category: string;
  average_rating: number;
  total_reviews: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      router.push("/auth/signin");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    // Fetch companies where user is owner or admin
    const { data: companyMembers } = await supabase
      .from("company_members")
      .select(`
        role,
        companies (
          id,
          name,
          display_name,
          description,
          logo_url,
          category
        )
      `)
      .eq("user_id", userId);

    if (companyMembers) {
      const companiesData = companyMembers.map((cm: any) => ({
        ...cm.companies,
        role: cm.role
      }));
      setCompanies(companiesData);
    }

    // Fetch apps created by user
    const { data: appsData } = await supabase
      .from("apps")
      .select("*")
      .eq("created_by", userId);

    if (appsData) {
      setApps(appsData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-7xl px-6 pt-24 pb-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pt-24 pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your companies and apps</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Companies Section */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-gray-700" />
                  <h2 className="text-2xl font-bold">My Companies</h2>
                  <Badge variant="secondary">{companies.length}</Badge>
                </div>
                <Button
                  onClick={() => router.push("/company/create")}
                  className="gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                >
                  <Plus className="h-4 w-4" />
                  Create Company
                </Button>
              </div>

              {companies.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">You don't have any companies yet</p>
                  <Button
                    onClick={() => router.push("/company/create")}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                  >
                    Create Your First Company
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="border rounded-xl p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        {company.logo_url ? (
                          <img
                            src={company.logo_url}
                            alt={company.display_name}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                            {company.display_name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg mb-1 truncate">{company.display_name}</h3>
                          <Badge className="mb-2">
                            {company.role === "owner" ? "👑 Owner" : company.role === "admin" ? "🛡️ Admin" : "👤 Member"}
                          </Badge>
                          {company.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{company.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/company/${company.name}`)}
                          className="flex-1 gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </Button>
                        {(company.role === "owner" || company.role === "admin") && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/company/${company.name}/manage`)}
                              className="flex-1 gap-1"
                            >
                              <Settings className="h-3 w-3" />
                              Manage
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/company/${company.name}/analytics`)}
                              className="gap-1"
                            >
                              <BarChart3 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Apps Section */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-6 w-6 text-gray-700" />
                  <h2 className="text-2xl font-bold">My Apps</h2>
                  <Badge variant="secondary">{apps.length}</Badge>
                </div>
                <Button
                  onClick={() => router.push("/apps/create")}
                  className="gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                >
                  <Plus className="h-4 w-4" />
                  Create App
                </Button>
              </div>

              {apps.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">You haven't created any apps yet</p>
                  <Button
                    onClick={() => router.push("/apps/create")}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                  >
                    Create Your First App
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apps.map((app) => (
                    <div
                      key={app.id}
                      className="border rounded-xl p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        {app.logo_url ? (
                          <img
                            src={app.logo_url}
                            alt={app.name}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                            {app.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg mb-1 truncate">{app.name}</h3>
                          <Badge variant="secondary" className="mb-2">{app.category}</Badge>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>⭐ {app.average_rating.toFixed(1)}</span>
                            <span>•</span>
                            <span>{app.total_reviews} reviews</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/apps/${app.id}`)}
                          className="flex-1 gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/apps/${app.id}/analytics`)}
                          className="gap-1"
                        >
                          <BarChart3 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Companies</span>
                  <span className="font-bold text-2xl">{companies.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Apps</span>
                  <span className="font-bold text-2xl">{apps.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Owner</span>
                  <span className="font-bold text-2xl">
                    {companies.filter(c => c.role === "owner").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Admin</span>
                  <span className="font-bold text-2xl">
                    {companies.filter(c => c.role === "admin").length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => router.push("/company/create")}
                >
                  <Building2 className="h-4 w-4" />
                  Create Company
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => router.push("/apps/create")}
                >
                  <Smartphone className="h-4 w-4" />
                  Create App
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => router.push("/create")}
                >
                  <Plus className="h-4 w-4" />
                  Create Post
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => router.push(`/profile/${currentUser?.username}`)}
                >
                  <Users className="h-4 w-4" />
                  View Profile
                </Button>
              </div>
            </div>

            {/* Help */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-orange-200 p-6">
              <h3 className="font-bold mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-gray-700">
                Add team members to your companies to collaborate and manage together!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
