"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function BuilderFormPage({
  params,
}: {
  params: { formId: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    router.replace(`/builder?id=${params.formId}${token ? `&token=${token}` : ""}`);
  }, [params.formId, router, searchParams]);

  return (
    <div className="flex h-screen items-center justify-center bg-muted/40">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-lg shadow-blue-100" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Builder...</p>
      </div>
    </div>
  );
}
