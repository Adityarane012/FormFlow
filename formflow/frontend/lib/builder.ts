import type { FieldType, FormField } from "@shared/schemaTypes";
import { generateFieldId } from "@shared/schemaTypes";

const defaultLabels: Record<FieldType, string> = {
  text: "Short answer",
  email: "Email",
  textarea: "Long answer",
  select: "Choose one",
  checkbox: "Select all that apply",
  radio: "Pick one",
  file: "File upload",
};

export function makeField(type: FieldType): FormField {
  const id = generateFieldId();
  const base: FormField = {
    id,
    type,
    label: defaultLabels[type],
    required: false,
  };
  if (type === "select" || type === "radio" || type === "checkbox") {
    return { ...base, options: ["Option 1", "Option 2", "Option 3"] };
  }
  return base;
}
