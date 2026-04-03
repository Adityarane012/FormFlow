// lib/mockDatabase.ts
// This file simulates backend storage using localStorage.

const FORMS_KEY = "formflow_forms";
const RESPONSES_KEY = "formflow_responses";

export interface Form {
  id: string;
  title: string;
  schema: any;
  status: "draft" | "published";
  created_at: number;
  updated_at: number;
}

export interface FormResponse {
  id: string;
  form_id: string;
  answers: any;
  submitted_at: number;
}

// Initial storage setup
if (typeof window !== "undefined") {
  if (!localStorage.getItem(FORMS_KEY)) {
    localStorage.setItem(FORMS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(RESPONSES_KEY)) {
    localStorage.setItem(RESPONSES_KEY, JSON.stringify([]));
  }
}

export const getForms = (): Form[] => {
  if (typeof window === "undefined") return [];
  const local = localStorage.getItem(FORMS_KEY);
  return local ? JSON.parse(local) : [];
};

export const getFormById = (id: string): Form | null => {
  const forms = getForms();
  return forms.find((f) => f.id === id) || null;
};

export const createForm = (form: Omit<Form, "id" | "created_at" | "updated_at">): Form => {
  const forms = getForms();
  const now = Date.now();
  const newForm: Form = {
    ...form,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
    created_at: now,
    updated_at: now,
  };
  forms.push(newForm);
  localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
  return newForm;
};

export const updateForm = (id: string, updates: Partial<Form>): Form | null => {
  const forms = getForms();
  const index = forms.findIndex((f) => f.id === id);
  if (index !== -1) {
    forms[index] = { ...forms[index], ...updates, updated_at: Date.now() };
    localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
    return forms[index];
  }
  return null;
};

export const deleteForm = (id: string): boolean => {
    const forms = getForms();
    const newForms = forms.filter((f) => f.id !== id);
    localStorage.setItem(FORMS_KEY, JSON.stringify(newForms));
    return true;
};

export const getResponses = (formId: string): FormResponse[] => {
  if (typeof window === "undefined") return [];
  const local = localStorage.getItem(RESPONSES_KEY);
  const responses = local ? (JSON.parse(local) as FormResponse[]) : [];
  return responses.filter((r) => r.form_id === formId);
};

export const createResponse = (response: Omit<FormResponse, "id" | "submitted_at">): FormResponse => {
  if (typeof window === "undefined") throw new Error("LocalStorage only available in client");
  const local = localStorage.getItem(RESPONSES_KEY);
  const responses = local ? (JSON.parse(local) as FormResponse[]) : [];
  const newResponse: FormResponse = {
    ...response,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
    submitted_at: Date.now(),
  };
  responses.push(newResponse);
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));
  return newResponse;
};
