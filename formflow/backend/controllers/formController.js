const { supabase } = require("../lib/supabaseClient");

async function createForm(req, res) {
  try {
    const { title = "Untitled form", fields = [] } = req.body;
    const { data: form, error: formError } = await supabase
      .from("forms")
      .insert({ title })
      .select("*")
      .single();

    if (formError) throw formError;

    if (fields.length > 0) {
      const formFields = fields.map((f, i) => ({
        id: f.id,
        form_id: form.id,
        type: f.type,
        label: f.label,
        placeholder: f.placeholder || null,
        required: f.required || false,
        order_index: i,
        options: f.options || null,
        show_if: f.showIf || null
      }));
      const { error: fieldsError } = await supabase.from("form_fields").insert(formFields);
      if (fieldsError) throw fieldsError;
    }

    res.status(201).json({ ...form, fields });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create form" });
  }
}

async function getForm(req, res) {
  try {
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (formError || !form) return res.status(404).json({ error: "Form not found" });

    const { data: fields, error: fieldsError } = await supabase
      .from("form_fields")
      .select("*")
      .eq("form_id", form.id)
      .order("order_index", { ascending: true });

    if (fieldsError) throw fieldsError;

    form.fields = fields.map(f => ({
      id: f.id,
      type: f.type,
      label: f.label,
      placeholder: f.placeholder,
      required: f.required,
      options: f.options,
      showIf: f.show_if
    }));

    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch form" });
  }
}

async function updateForm(req, res) {
  try {
    const { title, fields } = req.body;

    if (title !== undefined) {
      const { error: formError } = await supabase
        .from("forms")
        .update({ title })
        .eq("id", req.params.id);
      if (formError) throw formError;
    }

    if (fields !== undefined) {
      // Using delete -> insert for simplest sync logic
      const { error: delError } = await supabase
        .from("form_fields")
        .delete()
        .eq("form_id", req.params.id);
      
      if (delError) throw delError;

      if (fields.length > 0) {
        const formFields = fields.map((f, i) => ({
          id: f.id,
          form_id: req.params.id,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder || null,
          required: f.required || false,
          order_index: i,
          options: f.options || null,
          show_if: f.showIf || null
        }));
        const { error: insError } = await supabase.from("form_fields").insert(formFields);
        if (insError) throw insError;
      }
    }

    const { data: updatedForm, error: fetchFormError } = await supabase
      .from("forms")
      .select("*")
      .eq("id", req.params.id)
      .single();
      
    if (fetchFormError) throw fetchFormError;

    const { data: updatedFields, error: fetchFieldsError } = await supabase
      .from("form_fields")
      .select("*")
      .eq("form_id", req.params.id)
      .order("order_index", { ascending: true });
      
    if (fetchFieldsError) throw fetchFieldsError;

    if (updatedForm) {
      updatedForm.fields = (updatedFields || []).map(f => ({
        id: f.id,
        type: f.type,
        label: f.label,
        placeholder: f.placeholder,
        required: f.required,
        options: f.options,
        showIf: f.show_if
      }));
    }

    res.json(updatedForm);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update form" });
  }
}

module.exports = { createForm, getForm, updateForm };
