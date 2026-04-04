"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { FormSchema } from "@shared/schemaTypes";
import { BuilderClient } from "@/components/builder/BuilderClient";
import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";

type ApiForm = {
  id: string;
  title: string;
  fields: FormSchema["fields"];
};

export function BuilderFormLoader({ formId }: { formId: string }) {
  const [status, setStatus] = useState<"loading" | "error" | "ready">(
    "loading"
  );
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [fullForm, setFullForm] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setError(null);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get("token");
        
        // Use dataService instead of apiGet to leverage mock logic and permissions
        const { getFormById } = await import("@/lib/dataService");
        const { getCurrentUser } = await import("@/lib/authService");
        
        const form = await getFormById(formId);
        const user = getCurrentUser();

        if (cancelled) return;
        if (!form) {
            setError("Form not found.");
            setStatus("error");
            return;
        }

        // Access Control Logic
        const isOwner = user && (form.owner_id === user.id || form.created_by === user.id);
        const isCollaborator = user && form.collaborators?.some((c: any) => c.userId === user.id);
        const isTokenMatch = urlToken && form.shareToken === urlToken;
        const canEdit = isOwner || isCollaborator || isTokenMatch || form.is_public_edit;

        if (!canEdit) {
            setError("Access Denied. You do not have permission to edit this form.");
            setStatus("error");
            return;
        }

        setSchema({
          title: form.title,
          fields: form.fields ?? [],
        });
        setResolvedId(form.id);
        setFullForm(form);
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        const msg =
          e instanceof Error ? e.message : "Could not load form.";
        setError(msg);
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [formId]);

  if (status === "loading") {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-3 bg-white text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="text-sm">Loading builder…</p>
      </div>
    );
  }

  if (status === "error" || !schema || !resolvedId) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-white px-6 text-center">
        <p className="text-lg font-semibold text-gray-900">
          Can&apos;t open the builder
        </p>
        <p className="mt-2 max-w-lg text-sm text-gray-500">
          {error ?? "Unknown error"}
        </p>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-500">
          The browser can create a form, but loading it failed. Start the API on
          port 4000, confirm <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">NEXT_PUBLIC_API_URL</code> in{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">frontend/.env</code> matches, and ensure Supabase is reachable.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/builder">New form</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <BuilderClient formId={resolvedId} initialSchema={schema} />;
}
