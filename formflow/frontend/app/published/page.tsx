"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  BarChart3, 
  ExternalLink, 
  Copy, 
  Archive, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  getForms, 
  updateForm, 
  Form 
} from "@/lib/dataService";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";

function PublishedPageContent() {
  const { user, logout } = useAuth();
  const [publishedForms, setPublishedForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "alpha">("updated");
  
  const router = useRouter();

  useEffect(() => {
    loadPublishedForms();
  }, [user]);

  async function loadPublishedForms() {
    if (!user) return;
    setIsLoading(true);
    const allForms = await getForms();
    setPublishedForms(allForms.filter((f) => f.status === "published" && f.created_by === user.id));
    setIsLoading(false);
  }

  const filteredAndSortedForms = useMemo(() => {
    let result = publishedForms.filter(f => 
      f.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortBy === "updated") return b.updated_at - a.updated_at;
      if (sortBy === "created") return b.created_at - a.created_at;
      if (sortBy === "alpha") return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [publishedForms, searchQuery, sortBy]);

  async function handleUnpublish(id: string) {
    if (confirm("Are you sure you want to unpublish this form? It will be moved back to drafts.")) {
      const ok = await updateForm(id, { status: "draft" });
      if (ok) {
        toast.success("Form unpublished and moved to drafts");
        router.push("/drafts");
      } else {
        toast.error("Failed to unpublish form");
      }
    }
  }

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/form/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Form link copied");
  };

  return (
    <div className="min-h-screen bg-muted/40 font-sans dark:bg-background">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl">
            <Link href="/">
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
          </Button>
          <h1 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Live Forms
          </h1>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => logout()} className="h-9 w-9 rounded-xl text-muted-foreground hover:text-red-500">
                <LogOut className="h-4 w-4" />
            </Button>
            <Button onClick={() => router.push("/templates")} size="sm" className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Create Form
            </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search published forms..." 
              className="pl-10 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Sort by:</span>
            <select 
              className="h-9 rounded-xl border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="updated">Last updated</option>
              <option value="created">Created date</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground animate-pulse">
            Loading published forms...
          </div>
        ) : filteredAndSortedForms.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
            <div className="mb-4 rounded-full bg-green-50 p-4 dark:bg-green-900/10">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {searchQuery ? "No matching forms" : "No live forms yet"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
              {searchQuery ? "Try refining your search query." : "Publish a draft to see it live here."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedForms.map((form) => (
              <div 
                key={form.id} 
                className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:border-green-500/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-green-500 opacity-30" />
                
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-foreground truncate">{form.title || "Untitled Form"}</h3>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Updated {formatRelativeTime(form.updated_at)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-green-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:bg-green-950/40 dark:text-green-400">
                    Live
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-2 border-t border-border pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
                    onClick={() => router.push(`/dashboard/${form.id}`)}
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
                    asChild
                  >
                    <a href={`/form/${form.id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open Form
                    </a>
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-9 gap-1.5 rounded-xl text-xs font-bold"
                    onClick={() => handleCopyLink(form.id)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Link
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 gap-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-red-500"
                    onClick={() => handleUnpublish(form.id)}
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Unpublish
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function PublishedPage() {
    return (
        <AuthGuard>
            <PublishedPageContent />
        </AuthGuard>
    );
}
