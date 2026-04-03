"use client";

import { useMemo, useState } from "react";
import type { FormField, FormSchema } from "@shared/schemaTypes";
import { isFieldVisible } from "@/lib/conditional";
import { FieldRenderer } from "@/components/renderer/FieldRenderer";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api";
import { CheckCircle2, Loader2 } from "lucide-react";

type FormRendererProps = {
  formId: string;
  schema: FormSchema;
};

export function FormRenderer({ formId, schema }: FormRendererProps) {
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
      await apiPost("/responses", {
        formId,
        answers: payload,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white px-8 py-14 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-800">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-gray-900">
          Response recorded
        </h2>
        <p className="mt-2 text-gray-500">
          Thanks for filling out {schema.title || "this form"}.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-xl space-y-8 rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm"
    >
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          {schema.title || "Form"}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Please answer the questions below. Asterisk (*) indicates required.
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
        disabled={submitting}
        className="h-12 w-full rounded-xl text-base shadow-sm sm:w-auto sm:min-w-[160px]"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting
          </span>
        ) : (
          "Submit"
        )}
      </Button>
    </form>
  );
}
