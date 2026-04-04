"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ChevronLeft, 
  Table as TableIcon, 
  Users, 
  Clock, 
  LogOut, 
  FileJson, 
  FileSpreadsheet, 
  Search, 
  Filter,
  Calendar,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getFormById, getResponses, Form, FormResponse } from "@/lib/dataService";
import { cn } from "@/lib/utils";
import { ResponseCharts } from "@/components/dashboard/ResponseCharts";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";

function DashboardPageContent() {
  const { user, logout } = useAuth();
  const { formId } = useParams() as { formId: string };
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [fieldFilter, setFieldFilter] = useState({ fieldId: "", value: "" });

  useEffect(() => {
    async function loadData() {
      const [formData, responseData] = await Promise.all([
        getFormById(formId),
        getResponses(formId)
      ]);
      
      if (formData && user && formData.owner_id && formData.owner_id !== user.id) {
          // Check collaboration access
          const collabs = formData.collaborators || [];
          const hasAccess = collabs.some((c: any) => typeof c === 'string' ? c === user.id : c.userId === user.id);
          if (!hasAccess) {
              setForm(null);
              setIsLoading(false);
              return;
          }
      }

      setForm(formData);
      setResponses(responseData);
      setIsLoading(false);
    }
    loadData();
  }, [formId, user]);

  const filteredResponses = useMemo(() => {
    let result = [...responses];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        Object.values(r.answers).some(v => 
          String(v).toLowerCase().includes(query)
        )
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (dateFilter === "today") {
        result = result.filter(r => now - r.submitted_at < oneDay);
      } else if (dateFilter === "week") {
        result = result.filter(r => now - r.submitted_at < oneDay * 7);
      } else if (dateFilter === "month") {
        result = result.filter(r => now - r.submitted_at < oneDay * 30);
      }
    }

    // Field filter
    if (fieldFilter.fieldId && fieldFilter.value) {
      result = result.filter(r => {
        const val = r.answers[fieldFilter.fieldId];
        if (Array.isArray(val)) return val.includes(fieldFilter.value);
        return val === fieldFilter.value;
      });
    }

    return result;
  }, [responses, searchQuery, dateFilter, fieldFilter]);

  const stats = useMemo(() => {
    if (responses.length === 0) return { count: 0, last: "No responses yet" };
    const latest = Math.max(...responses.map(r => r.submitted_at));
    return {
      count: responses.length,
      last: new Date(latest).toLocaleString()
    };
  }, [responses]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading dashboard...</div>;
  if (!form) return <div className="flex min-h-screen items-center justify-center text-muted-foreground font-medium">Form not found or access denied.</div>;

  return (
    <div className="min-h-screen bg-muted/30 font-sans pb-12 dark:bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-sm font-sans sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl">
            <Link href="/published">
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
          </Button>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Dashboard / {form.title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => logout()} className="h-9 w-9 rounded-xl text-muted-foreground hover:text-red-500">
                <LogOut className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-gray-200 dark:border-border font-bold" onClick={() => {
                const csv = [
                    form.fields.map((f: any) => f.label).join(","),
                    ...filteredResponses.map((r: any) => 
                        form.fields.map((f: any) => {
                            const v = r.answers[f.id];
                            return Array.isArray(v) ? `"${v.join("; ")}"` : `"${v || ""}"`;
                        }).join(",")
                    )
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${form.title}-responses.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
            }}>
                <FileSpreadsheet className="h-4 w-4" />
                Export CSV
            </Button>

            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-gray-200 dark:border-border font-bold" onClick={() => {
                const blob = new Blob([JSON.stringify(filteredResponses, null, 2)], { type: "application/json" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `responses-${formId}.json`;
                a.click();
                window.URL.revokeObjectURL(url);
            }}>
                <FileJson className="h-4 w-4" />
                Export JSON
            </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Responses" 
            value={stats.count.toString()} 
            icon={Users} 
            color="text-blue-500" 
            bgColor="bg-blue-50 dark:bg-blue-900/20"
          />
          <StatCard 
            title="Latest Submission" 
            value={stats.last} 
            icon={Clock} 
            color="text-emerald-500" 
            bgColor="bg-emerald-50 dark:bg-emerald-900/20"
            className="sm:col-span-1 lg:col-span-2"
          />
        </div>

        {/* Analytics Charts */}
        <ResponseCharts schema={{ fields: form.fields }} responses={filteredResponses} />

        {/* Responses Table Section */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex flex-col border-b border-border bg-muted/20 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <TableIcon className="h-4 w-4" />
                Responses Table
                </h2>
                <div className="text-xs font-bold text-muted-foreground bg-muted p-1 px-3 rounded-full">
                    Showing {filteredResponses.length} of {responses.length} responses
                </div>
            </div>
            
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                        placeholder="Search answers, names, emails..." 
                        className="pl-10 rounded-xl bg-background border-border"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-red-500">
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <select 
                        className="h-10 rounded-xl border border-border bg-background px-3 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select 
                        className="h-10 rounded-xl border border-border bg-background px-3 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-ring max-w-[150px]"
                        value={fieldFilter.fieldId}
                        onChange={(e) => setFieldFilter({ ...fieldFilter, fieldId: e.target.value, value: "" })}
                    >
                        <option value="">Filter by question...</option>
                        {form.fields.filter((f: any) => ["select", "radio", "checkbox"].includes(f.type)).map((f: any) => (
                            <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                    </select>
                    {fieldFilter.fieldId && (
                        <select 
                            className="h-10 rounded-xl border border-border bg-background px-3 text-sm font-medium shadow-sm animate-in fade-in slide-in-from-left-2"
                            value={fieldFilter.value}
                            onChange={(e) => setFieldFilter({ ...fieldFilter, value: e.target.value })}
                        >
                            <option value="">Select value...</option>
                            {form.fields.find((f: any) => f.id === fieldFilter.fieldId)?.options?.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    )}
                    {(searchQuery || dateFilter !== "all" || fieldFilter.fieldId) && (
                        <Button variant="ghost" size="sm" className="h-10 rounded-xl text-red-500 hover:bg-red-50" onClick={() => {
                            setSearchQuery("");
                            setDateFilter("all");
                            setFieldFilter({ fieldId: "", value: "" });
                        }}>
                            Clear
                        </Button>
                    )}
                </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-6 py-4 font-semibold text-foreground">Submitted</th>
                  {form.fields.map((field: any) => (
                    <th key={field.id} className="px-6 py-4 font-semibold text-foreground">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredResponses.map((res) => (
                  <tr key={res.id} className="transition-colors hover:bg-muted/10">
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-muted-foreground font-medium">
                      {new Date(res.submitted_at).toLocaleString()}
                    </td>
                    {form.fields.map((field: any) => {
                      const val = res.answers[field.id];
                      return (
                        <td key={field.id} className="max-w-xs truncate px-6 py-4 text-foreground/80">
                          {Array.isArray(val) ? val.join(", ") : val || "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredResponses.length === 0 && (
              <div className="p-16 text-center text-muted-foreground font-medium flex flex-col items-center gap-2">
                <Search className="h-8 w-8 opacity-20 mb-2" />
                No responses match your current filters.
                <Button variant="ghost" onClick={() => {
                    setSearchQuery("");
                    setDateFilter("all");
                    setFieldFilter({ fieldId: "", value: "" });
                }}>Clear all filters</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bgColor, className }: any) {
  return (
    <div className={cn("flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-foreground/10", className)}>
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", bgColor)}>
        <Icon className={cn("h-6 w-6", color)} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
        <p className="text-xl font-bold text-foreground leading-none mt-1">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
    return (
        <AuthGuard>
            <DashboardPageContent />
        </AuthGuard>
    );
}
