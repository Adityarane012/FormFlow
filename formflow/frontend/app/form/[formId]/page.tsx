import { notFound } from "next/navigation";
import Link from "next/link";
import { FormRenderer } from "@/components/renderer/FormRenderer";
import type { FormSchema } from "@shared/schemaTypes";
import { Button } from "@/components/ui/button";

import { getForm } from "@/lib/forms";

export default async function PublicFormPage({
  params,
}: {
  params: { formId: string };
}) {
  let data;
  try {
    data = await getForm(params.formId);
  } catch (err) {
    notFound();
  }
  if (!data) notFound();

  const schema: FormSchema = data.schema as FormSchema;
  if (!schema.title) schema.title = data.title;

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
        <FormRenderer formId={data.id} schema={schema} />
      </main>
    </div>
  );
}
