import { notFound } from "next/navigation";
import Link from "next/link";
import { FormRenderer } from "@/components/renderer/FormRenderer";
import type { FormSchema } from "@shared/schemaTypes";
import { Button } from "@/components/ui/button";

async function fetchForm(id: string) {
  const base =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
  const res = await fetch(`${base}/forms/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json() as Promise<{
    _id: string;
    title: string;
    fields: FormSchema["fields"];
  }>;
}

export default async function PublicFormPage({
  params,
}: {
  params: { formId: string };
}) {
  const data = await fetchForm(params.formId);
  if (!data) notFound();

  const schema: FormSchema = {
    title: data.title,
    fields: data.fields ?? [],
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="border-b border-gray-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold text-gray-900">FormFlow</span>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <FormRenderer formId={data._id} schema={schema} />
      </main>
    </div>
  );
}
