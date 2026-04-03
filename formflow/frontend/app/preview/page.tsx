"use client";

import { useEffect, useState } from "react";
import { FormRenderer } from "@/components/renderer/FormRenderer";
import type { FormSchema } from "@shared/schemaTypes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PreviewPage() {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("formflow_preview_schema");
    if (saved) {
      try {
        setSchema(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  if (!schema) {
    return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-6 text-center">
             <p className="text-gray-500 mb-4">No schema found. Please return to builder.</p>
             <Button onClick={() => router.back()}>Go Back</Button>
          </div>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-[640px] mb-6 flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 text-gray-500 hover:text-gray-900">
           <ArrowLeft className="w-4 h-4" /> Back to Builder
        </Button>
        <div className="bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
           Preview Mode
        </div>
      </div>
      
      <div className="w-full max-w-[640px]">
         <FormRenderer schema={schema} formId="preview" previewMode />
      </div>
    </div>
  );
}
