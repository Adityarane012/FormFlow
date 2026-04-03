/**
 * Shared form schema types for FormFlow (builder, renderer, API).
 */

export type FieldType =
  | "text"
  | "email"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "file";

export interface ShowIf {
  field: string;
  equals: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  showIf?: ShowIf;
  step?: number;
}

export interface FormTheme {
  primaryColor: string;
  font: string;
  logoUrl?: string;
}

export interface FormSchema {
  title: string;
  fields: FormField[];
  mode?: "standard" | "one-question";
  theme?: FormTheme;
}

export interface FormResponsePayload {
  formId: string;
  answers: Record<string, string | string[]>;
  submittedAt: string;
}

export function generateFieldId(): string {
  return `f_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}
