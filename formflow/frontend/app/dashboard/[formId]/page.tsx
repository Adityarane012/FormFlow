"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Table as TableIcon, Users, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFormById, getResponses, Form, FormResponse } from "@/lib/dataService";
import { cn } from "@/lib/utils";
import { ResponseCharts } from "@/components/dashboard/ResponseCharts";

export default function DashboardPage() {
  const { formId } = useParams() as { formId: string };
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [formData, responseData] = await Promise.all([
        getFormById(formId),
        getResponses(formId)
      ]);
      setForm(formData);
      setResponses(responseData);
      setIsLoading(false);
    }
    loadData();
  }, [formId]);

  const stats = useMemo(() => {
    if (responses.length === 0) return { count: 0, last: "No responses yet" };
    const latest = Math.max(...responses.map(r => r.submitted_at));
    return {
      count: responses.length,
      last: new Date(latest).toLocaleString()
    };
  }, [responses]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading dashboard...</div>;
  if (!form) return <div className="flex min-h-screen items-center justify-center text-muted-foreground font-medium">Form not found.</div>;

  return (
    <div className="min-h-screen bg-muted/30 font-sans pb-12 dark:bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl">
            <Link href="/builder">
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
            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-gray-200 dark:border-border font-medium" onClick={() => {
                const csv = [
                    form.schema.fields.map((f: any) => f.label).join(","),
                    ...responses.map((r: any) => 
                        form.schema.fields.map((f: any) => {
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
            }}>
                <Download className="h-4 w-4" />
                Export CSV
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
            bgColor="bg-blue-50"
          />
          <StatCard 
            title="Latest Submission" 
            value={stats.last} 
            icon={Clock} 
            color="text-emerald-500" 
            bgColor="bg-emerald-50"
            className="sm:col-span-1 lg:col-span-2"
          />
        </div>

        {/* Analytics Charts */}
        <ResponseCharts schema={form.schema} responses={responses} />

        {/* Responses Table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-muted/20 px-6 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Responses Table
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-6 py-4 font-semibold text-foreground">Submitted</th>
                  {form.schema.fields.map((field: any) => (
                    <th key={field.id} className="px-6 py-4 font-semibold text-foreground">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {responses.map((res) => (
                  <tr key={res.id} className="transition-colors hover:bg-muted/10">
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-muted-foreground font-medium">
                      {new Date(res.submitted_at).toLocaleString()}
                    </td>
                    {form.schema.fields.map((field: any) => {
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
            {responses.length === 0 && (
              <div className="p-16 text-center text-muted-foreground font-medium">
                No responses recorded yet.
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
