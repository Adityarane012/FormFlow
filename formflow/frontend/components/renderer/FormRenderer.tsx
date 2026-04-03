"use client";

import { useMemo, useState } from "react";
import type { FormField, FormSchema } from "@shared/schemaTypes";
import { isFieldVisible } from "@/lib/conditional";
import { FieldRenderer } from "@/components/renderer/FieldRenderer";
import { Button } from "@/components/ui/button";
import { createResponse } from "@/lib/dataService";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";

import { OneQuestionMode } from "@/components/forms/OneQuestionMode";

type FormRendererProps = {
  formId: string;
  schema: FormSchema;
  previewMode?: boolean;
  onSuccess?: () => void;
};

export function FormRenderer({ formId, schema, previewMode, onSuccess }: FormRendererProps) {
  const [answers, setAnswers] = useState<
    Record<string, string | string[] | undefined>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Expose reset logic to parent if needed, but for now we follow the user's logic in the parent page.
  
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
    if (e && e.preventDefault) e.preventDefault();
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
      await createResponse({
        form_id: formId,
        answers: payload,
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (schema.mode === "one-question") {
    return (
      <OneQuestionMode
        fields={visibleFields}
        answers={answers}
        setAnswer={setAnswer}
        onSubmit={onSubmit}
        submitting={submitting}
        error={error}
        title={schema.title}
      />
    );
  }

  return (
    <div className="relative mx-auto max-w-xl">
      <div className="absolute -inset-1 -z-10 rounded-[2.5rem] bg-gradient-to-b from-gray-200/50 to-transparent opacity-50 blur-xl" />
      <form
        onSubmit={onSubmit}
        className="relative space-y-10 overflow-hidden rounded-[2rem] border border-gray-100 bg-white px-8 py-12 object-cover shadow-[0_20px_40px_rgb(0,0,0,0.04)] sm:px-12 dark:bg-card dark:border-border"
      >
        <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="border-b border-gray-100 pb-4 dark:border-border">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-foreground">
            {schema.title || "Untitled Form"}
          </h1>
          <p className="mt-3 text-sm font-medium text-gray-500">
            Please fill out the details below. Required fields are marked with an
            asterisk (*).
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
          className="h-12 w-full rounded-xl text-base shadow-sm sm:w-auto sm:min-w-[160px] font-bold"
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
