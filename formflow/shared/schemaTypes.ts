/**
 * Shared form schema types for FormFlow (builder, renderer, API).
 */

export type FieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "file";

export interface ShowIf {
  field: string;
  equals: string;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  regex?: string;
  message?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean; // legacy, but mapping to validation.required is better
  options?: string[];
  showIf?: ShowIf;
  step?: number;
  validation?: FieldValidation;
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
