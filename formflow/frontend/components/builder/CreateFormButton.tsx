"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function CreateFormButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    try {
      const created = await apiPost<{ _id: string }>("/forms", {
        title: "Untitled form",
        fields: [],
      });
      router.push(`/builder/${created._id}`);
    } catch (e) {
      console.error(e);
      const msg =
        e instanceof Error ? e.message : "Could not create form.";
      alert(
        `${msg}\n\nStart the backend (npm run dev from the formflow folder) and ensure Supabase is connected.`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={create}
      disabled={loading}
      className="h-12 rounded-xl px-8 text-base shadow-sm"
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating…
        </span>
      ) : (
        "Create form"
      )}
    </Button>
  );
}
