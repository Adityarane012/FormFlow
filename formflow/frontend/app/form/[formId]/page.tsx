"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getFormById, Form } from "@/lib/dataService";
import { FormRenderer } from "@/components/renderer/FormRenderer";
import { Loader2, AlertCircle } from "lucide-react";
import { SubmissionSuccess } from "@/components/forms/SubmissionSuccess";

export default function PublicFormPage() {
  const { formId } = useParams() as { formId: string };
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Submission state
  const [submitted, setSubmitted] = useState(false);
  const [formKey, setFormKey] = useState(0); // Used to force reset the FormRenderer

  useEffect(() => {
    async function loadForm() {
      try {
        const data = await getFormById(formId);
        if (!data) {
          setError("Form not found.");
        } else if (data.status !== "published") {
          setError("This form has not been published yet.");
        } else {
          setForm(data);
        }
      } catch (err) {
        setError("Failed to load form.");
      } finally {
        setIsLoading(false);
      }
    }
    loadForm();
  }, [formId]);

  const handleSuccess = () => {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 dark:bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm font-medium text-gray-500">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 p-6 dark:bg-background">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm dark:bg-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-900/20">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-foreground">{error}</h2>
          <p className="mt-2 text-sm text-gray-500 underline decoration-red-200 underline-offset-4">
            Please contact the form owner or check the URL.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 sm:py-20 dark:bg-background">
      <div className="mx-auto max-w-2xl px-6">
        {submitted ? (
          <SubmissionSuccess onReset={handleReset} />
        ) : (
          <FormRenderer 
            key={formKey}
            formId={form.id} 
            schema={form.schema} 
            onSuccess={handleSuccess}
          />
        )}
        
        <footer className="mt-12 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
            Powered by FormFlow
          </p>
        </footer>
      </div>
    </div>
  );
}
