import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Initialize Supabase client ONLY if credentials exist
const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// LocalStorage keys
const FORMS_KEY = "formflow_forms";
const RESPONSES_KEY = "formflow_responses";

export interface Form {
  id: string;
  title: string;
  schema: any;
  status: "draft" | "published";
  created_at: number;
}

export interface FormResponse {
  id: string;
  form_id: string;
  answers: any;
  submitted_at: number;
}

// ───── Form Operations ─────

export async function getForms(): Promise<Form[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        return data as Form[];
      }
    } catch (e) {
      console.warn("Supabase query failed, falling back to localStorage", e);
    }
  }

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    const local = localStorage.getItem(FORMS_KEY);
    return local ? JSON.parse(local) : [];
  }
  return [];
}

export async function getFormById(id: string): Promise<Form | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("id", id)
        .single();
      
      if (!error && data) {
        return data as Form;
      }
    } catch (e) {
      console.warn("Supabase query failed, falling back to localStorage", e);
    }
  }

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    const local = localStorage.getItem(FORMS_KEY);
    if (local) {
      const forms = JSON.parse(local) as Form[];
      return forms.find((f) => f.id === id) || null;
    }
  }
  return null;
}

export async function createForm(form: Omit<Form, "id" | "created_at">): Promise<Form> {
  const newForm: Form = {
    ...form,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
    created_at: Date.now(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("forms")
        .insert([newForm])
        .select()
        .single();
      
      if (!error && data) {
        return data as Form;
      }
    } catch (e) {
      console.warn("Supabase creation failed, falling back to localStorage", e);
    }
  }

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    const local = localStorage.getItem(FORMS_KEY);
    const forms = local ? (JSON.parse(local) as Form[]) : [];
    forms.push(newForm);
    localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
  }
  return newForm;
}

export async function updateForm(id: string, updates: Partial<Form>): Promise<Form | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("forms")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (!error && data) {
        return data as Form;
      }
    } catch (e) {
      console.warn("Supabase update failed, falling back to localStorage", e);
    }
  }

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    const local = localStorage.getItem(FORMS_KEY);
    if (local) {
      const forms = JSON.parse(local) as Form[];
      const idx = forms.findIndex((f) => f.id === id);
      if (idx !== -1) {
        forms[idx] = { ...forms[idx], ...updates };
        localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
        return forms[idx];
      }
    }
  }
  return null;
}

export async function deleteForm(id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from("forms")
        .delete()
        .eq("id", id);
      
      if (!error) return true;
    } catch (e) {
      console.warn("Supabase delete failed, falling back to localStorage", e);
    }
  }

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    const local = localStorage.getItem(FORMS_KEY);
    if (local) {
      const forms = JSON.parse(local) as Form[];
      const newForms = forms.filter((f) => f.id !== id);
      localStorage.setItem(FORMS_KEY, JSON.stringify(newForms));
      return true;
    }
  }
  return false;
}

// ───── Response Operations ─────

export async function getResponses(formId: string): Promise<FormResponse[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("responses")
        .select("*")
        .eq("form_id", formId)
        .order("submitted_at", { ascending: false });
      
      if (!error && data) {
        return data as FormResponse[];
      }
    } catch (e) {
      console.warn("Supabase query failed, falling back to localStorage", e);
    }
  }

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    const local = localStorage.getItem(RESPONSES_KEY);
    if (local) {
      const responses = JSON.parse(local) as FormResponse[];
      return responses.filter((r) => r.form_id === formId);
    }
  }
  return [];
}

export async function createResponse(response: Omit<FormResponse, "id" | "submitted_at">): Promise<FormResponse> {
  const newResponse: FormResponse = {
    ...response,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
    submitted_at: Date.now(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("responses")
        .insert([newResponse])
        .select()
        .single();
      
      if (!error && data) {
        return data as FormResponse;
      }
    } catch (e) {
      console.warn("Supabase creation failed, falling back to localStorage", e);
    }
  }

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    const local = localStorage.getItem(RESPONSES_KEY);
    const responses = local ? (JSON.parse(local) as FormResponse[]) : [];
    responses.push(newResponse);
    localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));
  }
  return newResponse;
}
