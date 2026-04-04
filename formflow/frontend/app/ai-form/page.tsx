"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  ArrowRight, 
  ChevronLeft, 
  Loader2, 
  MessageSquarePlus, 
  Zap, 
  ShieldCheck,
  Globe
} from "lucide-react";
import Link from "next/link";
import { generateSchemaFromPrompt } from "@/lib/aiFormGenerator";
import { toast } from "sonner";

export default function AIFormPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please describe the form you want to generate");
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate artificial delay for "AI magic" effect
      await new Promise(r => setTimeout(r, 1500));
      
      const schema = await generateSchemaFromPrompt(prompt);
      
      // Store in local storage for the builder to pick up
      localStorage.setItem("formflow_preview_schema", JSON.stringify(schema));
      
      toast.success("Form generated successfully!");
      router.push("/builder");
    } catch (err) {
      toast.error("Failed to generate form. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-zinc-950 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 px-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" asChild className="rounded-xl">
             <Link href="/">
               <ChevronLeft className="h-5 w-5 text-gray-400" />
             </Link>
           </Button>
           <div className="h-4 w-px bg-gray-100 dark:bg-zinc-800" />
           <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                 <Sparkles className="h-4 w-4 fill-current" />
              </div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight uppercase tracking-widest">AI Generator</h1>
           </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 -mt-16">
        <div className="w-full max-w-2xl space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
           
           {/* Hero Section */}
           <div className="text-center space-y-6">
              <div className="mx-auto h-20 w-20 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-blue-200 dark:shadow-none animate-pulse">
                <Zap className="h-10 w-10 fill-current" />
              </div>
              <div className="space-y-3">
                 <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    Build your form with <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Pure Intelligence.</span>
                 </h2>
                 <p className="text-base font-medium text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Describe your form in plain English and let FormFlow's AI handle the schema generation instantly.
                 </p>
              </div>
           </div>

           {/* Input Section */}
           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              <form onSubmit={handleGenerate} className="relative bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] p-4 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden space-y-4">
                 <div className="flex items-start gap-4">
                    <div className="mt-4 ml-4">
                       <MessageSquarePlus className="h-6 w-6 text-blue-600" />
                    </div>
                    <textarea
                       className="flex-1 min-h-[120px] w-full border-none bg-transparent p-4 text-lg font-semibold text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-zinc-700 focus:ring-0 resize-none"
                       placeholder="e.g. Create a job application form for a software engineer role with resume upload..."
                       value={prompt}
                       onChange={(e) => setPrompt(e.target.value)}
                       disabled={isGenerating}
                    />
                 </div>
                 
                 <div className="flex items-center justify-between border-t border-gray-50 dark:border-zinc-800 pt-4 px-4 pb-2">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                           <ShieldCheck className="h-3 w-3" />
                           Secure AI
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                           <Globe className="h-3 w-3" />
                           Global Logic
                        </div>
                    </div>
                    <Button 
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      className="h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate Form
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                 </div>
              </form>
           </div>

           {/* Suggestions */}
           <div className="flex flex-wrap items-center justify-center gap-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 w-full text-center">Quick Suggestions</p>
              {[
                "Customer satisfaction survey",
                "Job application for designer",
                "Event RSVP form",
                "Product feedback collection",
                "Simple contact form"
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-blue-200 transition-all hover:scale-105 active:scale-95"
                >
                  {s}
                </button>
              ))}
           </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 px-6 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-center bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            Built with FormFlow Intelligence
         </p>
      </footer>
    </div>
  );
}
