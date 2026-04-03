"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, LayoutGrid, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formTemplates } from "@/lib/formTemplates";

export default function TemplatesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-muted/40 font-sans dark:bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl">
            <Link href="/">
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
          </Button>
          <h1 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-sans">
            Starter Templates
          </h1>
        </div>
        <Button onClick={() => router.push("/builder")} variant="outline" size="sm" className="gap-2 rounded-xl border-gray-200 dark:border-border font-medium">
          Skip and start blank
        </Button>
      </header>

      <main className="mx-auto max-w-5xl p-6 py-12">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">What are you building?</h2>
            <p className="mt-3 text-muted-foreground">Select a template to jumpstart your form creation process.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Blank Slate Card */}
            <div 
                className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white p-8 text-center transition-all hover:border-gray-900 hover:bg-gray-50 dark:bg-card dark:border-border dark:hover:border-foreground"
                onClick={() => router.push("/builder")}
            >
                <div className="mb-4 rounded-full bg-muted p-4">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Blank Form</h3>
                <p className="mt-2 text-sm text-muted-foreground">Start from scratch with a clean canvas.</p>
                <Button variant="ghost" className="mt-6 rounded-xl group-hover:bg-gray-900 group-hover:text-white dark:group-hover:bg-foreground dark:group-hover:text-background font-bold transition-all">
                    Start blank
                </Button>
            </div>

            {formTemplates.map((template) => (
                <div 
                    key={template.id} 
                    className="flex flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] transition-all hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] dark:bg-card dark:border-border hover:border-foreground/20"
                >
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <LayoutGrid className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{template.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {template.description}
                    </p>
                    <div className="mt-8 flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {template.schema.fields.length} fields
                        </span>
                        <Button 
                            className="rounded-xl px-4 py-2 font-bold gap-2 bg-gray-900 text-white hover:bg-gray-800 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90 transition-all shadow-md group"
                            onClick={() => router.push(`/builder?template=${template.id}`)}
                        >
                            Use template
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
}
