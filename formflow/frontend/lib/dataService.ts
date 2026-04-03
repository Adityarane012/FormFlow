import * as mockDb from "./mockDatabase";
export type { Form, FormResponse } from "./mockDatabase";

// lib/dataService.ts
// This file acts as a drop-in replacement for Supabase.

export const fetchForms = async () => {
  return mockDb.getForms();
};

export const fetchFormById = async (id: string) => {
  return mockDb.getFormById(id);
};

export const saveForm = async (form: any) => {
  return mockDb.createForm(form);
};

export const updateFormData = async (id: string, updates: any) => {
  return mockDb.updateForm(id, updates);
};

export const fetchResponses = async (formId: string) => {
  return mockDb.getResponses(formId);
};

export const saveResponse = async (response: any) => {
  return mockDb.createResponse(response);
};

// Compatibility aliases for the existing UI (to avoid touching app/ or components/)
// These match the previous internal dataService names
export const getForms = fetchForms;
export const getFormById = fetchFormById;
export const createForm = saveForm;
export const updateForm = updateFormData;
export const getResponses = fetchResponses;
export const createResponse = saveResponse;
export const deleteForm = async (id: string) => {
    const forms = mockDb.getForms();
    const newForms = forms.filter((f) => f.id !== id);
    localStorage.setItem("formflow_forms", JSON.stringify(newForms));
    return true;
};
