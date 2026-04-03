"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldRenderer } from "@/components/renderer/FieldRenderer";
import { cn } from "@/lib/utils";

interface OneQuestionModeProps {
  fields: any[];
  answers: any;
  setAnswer: (id: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string | null;
  title: string;
  theme: {
    primaryColor: string;
    font: string;
    logoUrl?: string;
  };
}

export function OneQuestionMode({ 
  fields, 
  answers, 
  setAnswer, 
  onSubmit, 
  submitting, 
  error,
  title,
  theme
}: OneQuestionModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentField = fields[currentIndex];
  
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === fields.length - 1;
  const progress = Math.round(((currentIndex + 1) / fields.length) * 100);

  const handleNext = () => {
    if (isLast) return;
    
    // Check if current field is required and filled
    if (currentField.required) {
      const val = answers[currentField.id];
      if (val === undefined || val === null || String(val).trim() === "") {
        // We can use the error prop if we want to show it here
        return;
      }
    }
    
    setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (isFirst) return;
    setCurrentIndex(prev => prev - 1);
  };

  if (!currentField) return null;

  return (
    <div 
      className="relative mx-auto max-w-2xl px-6 min-h-[500px] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans"
      style={{ fontFamily: theme.font }}
    >
      <div className="mb-12">
        <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Question {currentIndex + 1} of {fields.length}
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-foreground">
                {progress}% Complete
            </span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden dark:bg-muted/30 font-sans">
          <div 
            className="h-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%`, backgroundColor: theme.primaryColor }} 
          />
        </div>
      </div>

      <div className="space-y-10">
        <div key={currentField.id} className="animate-in fade-in slide-in-from-right-4 duration-300">
            <FieldRenderer
                field={currentField}
                value={answers[currentField.id]}
                onChange={setAnswer}
                disabled={submitting}
                primaryColor={theme.primaryColor}
            />
        </div>

        {error && currentIndex === fields.length - 1 && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="flex items-center gap-4 pt-8">
          {!isFirst && (
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-2xl border-gray-200"
              onClick={handlePrev}
              disabled={submitting}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          
          {!isLast ? (
             <Button
                className="h-12 px-8 rounded-2xl text-white shadow-sm font-bold gap-2 flex-1 sm:flex-none"
                onClick={handleNext}
                disabled={submitting}
                style={{ backgroundColor: theme.primaryColor, color: '#fff' }}
             >
                Next
                <ChevronRight className="h-4 w-4" />
             </Button>
          ) : (
            <Button
              className="h-12 px-10 rounded-2xl text-white shadow-xl font-bold gap-2 flex-1 sm:flex-none"
              onClick={onSubmit}
              disabled={submitting}
              style={{ backgroundColor: theme.primaryColor, color: '#fff' }}
            >
              {submitting ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting
                </>
              ) : (
                <>
                   Finish & Submit
                   <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      <div className="mt-20 flex items-center gap-4 border-t border-border/50 pt-8 opacity-40 font-sans">
         {theme.logoUrl ? (
           <img src={theme.logoUrl} alt="Logo" className="h-6 w-auto object-contain grayscale opacity-60" onError={(e) => (e.currentTarget.style.display = 'none')} />
         ) : (
           <div className="h-6 w-6 rounded-lg bg-gray-900 text-[10px] font-bold text-white flex items-center justify-center dark:bg-foreground dark:text-background">
             F
           </div>
         )}
         <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {title} · Immersive Mode
         </span>
      </div>
    </div>
  );
}
