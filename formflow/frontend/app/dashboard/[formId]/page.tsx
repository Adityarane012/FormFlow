import { notFound } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import type { FormSchema } from "@shared/schemaTypes";

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

async function fetchResponses(formId: string) {
  const base =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
  const res = await fetch(`${base}/responses/${formId}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json() as Promise<
    {
      id: string;
      submittedAt: string;
      answers: Record<string, unknown>;
    }[]
  >;
}

export default async function DashboardPage({
  params,
}: {
  params: { formId: string };
}) {
  const [form, responses] = await Promise.all([
    fetchForm(params.formId),
    fetchResponses(params.formId),
  ]);
  if (!form) notFound();

  const schema: FormSchema = {
    title: form.title,
    fields: form.fields ?? [],
  };

  return (
    <DashboardClient
      formId={form._id}
      schema={schema}
      initialResponses={responses.map((r) => ({
        id: r.id,
        submittedAt:
          typeof r.submittedAt === "string"
            ? r.submittedAt
            : new Date(r.submittedAt).toISOString(),
        answers: r.answers ?? {},
      }))}
    />
  );
}
