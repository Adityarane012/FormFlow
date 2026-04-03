"use client";

import { CheckCircle2, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SubmissionSuccessProps {
  onReset: () => void;
}

export function SubmissionSuccess({ onReset }: SubmissionSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-md rounded-[2.5rem] border border-gray-100 bg-white p-12 text-center shadow-[0_20px_50px_rgb(0,0,0,0.05)] relative overflow-hidden">
        {/* Top accent bar */}
        <div className="absolute left-0 right-0 top-0 h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
        
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 text-green-600 mb-8 shadow-inner">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
          Response submitted successfully
        </h2>
        
        <p className="text-gray-500 font-medium mb-10">
          Thank you for filling out this form.
        </p>
        
        <div className="flex flex-col gap-3">
          <Button
            className="h-12 rounded-2xl bg-gray-900 text-white hover:bg-gray-800 font-bold shadow-sm transition-all flex items-center justify-center gap-2"
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4" />
            Submit another response
          </Button>
          
          <Button
            variant="outline"
            asChild
            className="h-12 rounded-2xl border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Return to homepage
            </Link>
          </Button>
        </div>
      </div>
      
      <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
        FormFlow · Secure Submission
      </p>
    </div>
  );
}
