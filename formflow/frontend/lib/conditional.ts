import type { FormField } from "@shared/schemaTypes";

export function isFieldVisible(
  field: FormField,
  answers: Record<string, string | string[] | undefined>
): boolean {
  if (!field.showIf) return true;
  const raw = answers[field.showIf.field];
  const val = Array.isArray(raw) ? raw.join(",") : raw ?? "";
  return String(val) === field.showIf.equals;
}
