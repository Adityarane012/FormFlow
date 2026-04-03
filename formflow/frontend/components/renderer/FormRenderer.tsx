"use client";

import { useMemo, useState } from "react";
import type { FormField, FormSchema } from "@shared/schemaTypes";
import { isFieldVisible } from "@/lib/conditional";
import { FieldRenderer } from "@/components/renderer/FieldRenderer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";

type FormRendererProps = {
  formId: string;
  schema: FormSchema;
  previewMode?: boolean;
};

export function FormRenderer({ formId, schema, previewMode }: FormRendererProps) {
  const [answers, setAnswers] = useState<
    Record<string, string | string[] | undefined>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleFields = useMemo(() => {
    return schema.fields.filter((f) => isFieldVisible(f, answers));
  }, [schema.fields, answers]);

  function setAnswer(fieldId: string, value: string | string[]) {
    setAnswers((a) => ({ ...a, [fieldId]: value }));
  }

  function validate(): string | null {
    for (const f of visibleFields) {
      if (!f.required) continue;
      const v = answers[f.id];
      if (f.type === "checkbox") {
        if (!Array.isArray(v) || v.length === 0)
          return `Please complete: ${f.label}`;
      } else if (f.type === "file") {
        if (!v || String(v).trim() === "")
          return `Please complete: ${f.label}`;
      } else {
        if (v === undefined || v === null || String(v).trim() === "")
          return `Please complete: ${f.label}`;
      }
    }
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (previewMode) return;
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    const payload: Record<string, string | string[]> = {};
    for (const f of visibleFields) {
      const val = answers[f.id];
      if (val === undefined) continue;
      if (Array.isArray(val)) payload[f.id] = val;
      else payload[f.id] = val;
    }
    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from("responses").insert({
        form_id: formId,
        answers: payload,
      });
      if (insertError) throw insertError;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setAnswers({});
    setDone(false);
    setError(null);
  }

  if (done) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Thank you for submitting the form.
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Your response has been recorded successfully.
          </p>
          <Button
            variant="outline"
            className="mt-6 h-10 rounded-lg border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            onClick={handleReset}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Submit another response
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-xl">
      <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-b from-gray-200/50 to-transparent -z-10 blur-xl opacity-50" />
      <form
        onSubmit={onSubmit}
        className="space-y-10 rounded-[2rem] border border-gray-100 bg-white px-8 py-12 shadow-[0_20px_40px_rgb(0,0,0,0.04)] sm:px-12 object-cover relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <div className="pb-4 border-b border-gray-100">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">
            {schema.title || "Untitled Form"}
          </h1>
          <p className="mt-3 text-sm font-medium text-gray-500">
            Please fill out the details below. Required fields are marked with an asterisk (*).
          </p>
        </div>

      <div className="space-y-8">
        {visibleFields.map((field) => (
          <FieldRenderer
            key={field.id}
            field={field}
            value={answers[field.id]}
            onChange={(id, val) => setAnswer(id, val)}
            disabled={submitting}
          />
        ))}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={submitting || previewMode}
        className="h-12 w-full rounded-xl text-base shadow-sm sm:w-auto sm:min-w-[160px]"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting
          </span>
        ) : previewMode ? (
          "Submit (Preview)"
        ) : (
          "Submit"
        )}
      </Button>
      </form>
    </div>
  );
}
