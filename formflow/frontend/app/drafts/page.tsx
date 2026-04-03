"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Edit3, 
  Rocket, 
  Trash2, 
  Plus, 
  Search, 
  SortAsc, 
  Clock, 
  ArrowUpDown,
  Copy,
  ExternalLink,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  getForms, 
  deleteForm, 
  updateForm, 
  Form 
} from "@/lib/dataService";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

function DraftsPageContent() {
  const { user, logout } = useAuth();
  const [drafts, setDrafts] = useState<Form[]>([]);
  // ...
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "alpha">("updated");
  
  // Publish Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishedId, setPublishedId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    loadDrafts();
  }, [user]);

  async function loadDrafts() {
    if (!user) return;
    setIsLoading(true);
    const allForms = await getForms();
    setDrafts(allForms.filter((f) => f.status === "draft" && f.created_by === user.id));
    setIsLoading(false);
  }

  const filteredAndSortedDrafts = useMemo(() => {
    let result = drafts.filter(d => 
      d.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      if (sortBy === "updated") return b.updated_at - a.updated_at;
      if (sortBy === "created") return b.created_at - a.created_at;
      if (sortBy === "alpha") return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [drafts, searchQuery, sortBy]);

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this draft?")) {
      const ok = await deleteForm(id);
      if (ok) {
        toast.success("Draft deleted");
        setDrafts((prev) => prev.filter((d) => d.id !== id));
      } else {
        toast.error("Failed to delete draft");
      }
    }
  }

  async function handlePublish(id: string) {
    const ok = await updateForm(id, { status: "published" });
    if (ok) {
      toast.success("Form published!");
      setPublishedId(id);
      setShowPublishModal(true);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } else {
      toast.error("Failed to publish");
    }
  }

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
            My Drafts
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
        {/* Search and Sort Toolbar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search drafts..." 
              className="pl-10 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Sort by:</span>
            <select 
              className="h-9 rounded-xl border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="updated">Last edited</option>
              <option value="created">Created date</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground animate-pulse">
            Loading your drafts...
          </div>
        ) : filteredAndSortedDrafts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {searchQuery ? "No matching drafts" : "No drafts yet"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
              {searchQuery ? "Try refining your search query." : "Start building a form and save it to see it here."}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push("/builder")} className="mt-6 rounded-xl">
                Create Form
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedDrafts.map((draft) => (
              <div 
                key={draft.id} 
                className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:border-foreground/10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-foreground truncate">{draft.title || "Untitled Form"}</h3>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                      <Clock className="h-3 w-3" />
                      Edited {formatRelativeTime(draft.updated_at)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-orange-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                    Draft
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between gap-2 border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 gap-1.5 rounded-xl text-xs font-semibold px-4 border-gray-200 dark:border-border"
                      onClick={() => router.push(`/builder?formId=${draft.id}`)}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-9 gap-1.5 rounded-xl text-xs font-bold px-4 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                      onClick={() => handlePublish(draft.id)}
                    >
                      <Rocket className="h-3.5 w-3.5" />
                      Publish
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                    onClick={() => handleDelete(draft.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Publish Modal */}
      {showPublishModal && publishedId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
              <Rocket className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Form Published</h3>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">Your form is now live. Share the link below to start gathering responses.</p>
            
            <div className="flex items-center gap-2 bg-muted/50 border border-border p-2 rounded-2xl mb-8">
              <Input 
                readOnly 
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/form/${publishedId}`}
                className="border-none bg-transparent shadow-none focus-visible:ring-0 text-foreground font-medium text-xs h-8"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="gap-2 rounded-2xl h-12 border-border font-bold shadow-sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/form/${publishedId}`);
                  toast.success("Link copied!");
                }}
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
              <Button 
                 className="gap-2 rounded-2xl bg-foreground text-background hover:opacity-90 shadow-sm h-12 font-bold"
                 asChild
              >
                <a href={`/form/${publishedId}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open Form
                </a>
              </Button>
              <Button 
                variant="secondary" 
                className="col-span-2 gap-2 rounded-2xl h-12 font-bold shadow-sm mt-1"
                onClick={() => router.push(`/dashboard/${publishedId}`)}
              >
                <MousePointer2 className="h-4 w-4" />
                View Dashboard
              </Button>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-6 top-6 text-muted-foreground hover:text-foreground h-8 w-8 rounded-full hover:bg-muted"
              onClick={() => setShowPublishModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MousePointer2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.037 4.437l14.413 7.227c.707.355.694 1.36-.023 1.693l-4.524 2.102-2.102 4.524c-.333.717-1.338.73-1.693.023L2.88 5.593a.81.81 0 0 1 1.157-1.156z" />
      <path d="M13 13l4 4" />
    </svg>
  );
}
export default function DraftsPage() {
  return (
    <AuthGuard>
       <DraftsPageContent />
    </AuthGuard>
  );
}
