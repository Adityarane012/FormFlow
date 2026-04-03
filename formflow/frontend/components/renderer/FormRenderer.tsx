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
      <div className="relative mx-auto max-w-xl rounded-[2rem] border border-gray-200/60 bg-white/90 px-8 py-14 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
        <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-b from-gray-100 to-white -z-10 blur-[2px]" />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-green-400 to-green-500 text-white shadow-lg ring-4 ring-green-50">
          <CheckCircle2 className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <h2 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">
          Response recorded
        </h2>
        <p className="mt-2 text-gray-500 font-medium">
          Thanks for filling out <span className="text-gray-900 font-semibold">{schema.title || "this form"}</span>.
        </p>
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
    </div>
  );
}
