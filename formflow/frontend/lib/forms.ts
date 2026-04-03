import { supabase } from "@/lib/supabaseClient";
import type { FormSchema } from "@shared/schemaTypes";

export async function createForm(schema: FormSchema) {
  const { data, error } = await supabase
    .from("forms")
    .insert([
      { 
        title: schema.title, 
        schema: schema 
      }
    ])
    .select("id")
    .single();

  if (error) {
    throw error;
  }
  return data.id as string;
}

export async function updateForm(formId: string, schema: FormSchema) {
  const { error } = await supabase
    .from("forms")
    .update({ 
      title: schema.title, 
      schema: schema 
    })
    .eq("id", formId);

  if (error) {
    throw error;
  }
}

export async function getForm(formId: string) {
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .single();

  if (error) {
    throw error;
  }
  return data;
}
