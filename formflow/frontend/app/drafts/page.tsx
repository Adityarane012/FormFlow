"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Edit3, Rocket, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getForms, deleteForm, updateForm, Form } from "@/lib/dataService";
import { toast } from "sonner";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadDrafts();
  }, []);

  async function loadDrafts() {
    setIsLoading(true);
    const allForms = await getForms();
    setDrafts(allForms.filter((f) => f.status === "draft"));
    setIsLoading(false);
  }

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
      router.push(`/builder?id=${id}`);
    } else {
      toast.error("Failed to publish");
    }
  }

  return (
    <div className="min-h-screen bg-muted/40 font-sans dark:bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl">
            <Link href="/">
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
          </Button>
          <h1 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Your Drafts
          </h1>
        </div>
        <Button onClick={() => router.push("/builder")} size="sm" className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          New Form
        </Button>
      </header>

      <main className="mx-auto max-w-5xl p-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Loading your drafts...
          </div>
        ) : drafts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center dark:bg-card">
            <div className="mb-4 rounded-full bg-muted p-3">
              <Edit3 className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">No drafts found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You haven't saved any drafts yet. Start building a form and save it to see it here.
            </p>
            <Button onClick={() => router.push("/builder")} className="mt-6 rounded-xl">
              Start building
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {drafts.map((draft) => (
              <div 
                key={draft.id} 
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-muted-foreground/30 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{draft.title || "Untitled Form"}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Created {new Date(draft.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-orange-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                    Draft
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-1.5 rounded-lg text-xs font-medium"
                      onClick={() => router.push(`/builder?id=${draft.id}`)}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-1.5 rounded-lg text-xs font-medium hover:bg-green-50 hover:text-green-700 hover:border-green-200 dark:hover:bg-green-900/20"
                      onClick={() => handlePublish(draft.id)}
                    >
                      <Rocket className="h-3.5 w-3.5" />
                      Publish
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                    onClick={() => handleDelete(draft.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
