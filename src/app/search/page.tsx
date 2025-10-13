"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Search, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";

export default function SearchPage() {
  const router = useRouter();

  const [companies, setCompanies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Search Everything</h1>
          <p className="text-gray-600">Discover apps, connect with users, and explore posts</p>
          <Button
            onClick={() => router.push("/company/create")}
            className="mt-4 bg-orange-500 hover:bg-orange-600"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Create Your Company
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search for companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>

        {/* Company Results */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border bg-white p-6 animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-600">No companies found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                onClick={() => router.push(`/company/${company.slug}`)}
                className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:scale-[1.01]"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="h-16 w-16 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                    style={{ backgroundColor: company.color }}
                  >
                    {company.name[0]}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">{company.name}</h3>
                    {company.description && (
                      <p className="text-sm text-gray-600 mb-4">{company.description}</p>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/company/${company.slug}`);
                      }}
                      className="bg-orange-500 hover:bg-orange-600"
                      size="sm"
                    >
                      View Feedback
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}