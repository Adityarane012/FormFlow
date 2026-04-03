import type { FormSchema } from "@shared/schemaTypes";
import { apiGet, apiPatch, apiPost } from "@/lib/api";

/** API form row + normalized fields from Express → Supabase */
type ApiFormResponse = {
  id: string;
  title: string;
  fields: FormSchema["fields"];
  theme?: FormSchema["theme"];
  mode?: FormSchema["mode"];
};

/**
 * Create a form via the backend (service role → Supabase).
 * Do not call Supabase from the browser for forms — avoids RLS/schema drift.
 */
export async function createForm(schema: FormSchema): Promise<string> {
  const created = await apiPost<ApiFormResponse>("/forms", {
    title: schema.title,
    fields: schema.fields,
    theme: schema.theme,
    mode: schema.mode,
  });
  return created.id;
}

export async function updateForm(formId: string, schema: FormSchema): Promise<void> {
  await apiPatch(`/forms/${formId}`, {
    title: schema.title,
    fields: schema.fields,
    theme: schema.theme,
    mode: schema.mode,
  });
}

/** Load form for server or client; shape matches public form page expectations */
export async function getForm(formId: string): Promise<{
  id: string;
  title: string;
  schema: FormSchema;
}> {
  const data = await apiGet<ApiFormResponse>(`/forms/${formId}`);
  return {
    id: data.id,
    title: data.title,
    schema: {
      title: data.title,
      fields: data.fields ?? [],
      theme: data.theme,
      mode: data.mode,
    },
  };
}
