const { supabase } = require("../lib/supabaseClient");

async function getForms(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    // Get forms where user is owner
    const { data: ownedForms, error: ownedError } = await supabase
      .from("forms")
      .select("*")
      .eq("owner_id", userId)
      .order("updated_at", { ascending: false });

    if (ownedError) throw ownedError;

    // Get forms where user is a collaborator
    const { data: collabForms, error: collabError } = await supabase
      .from("forms")
      .select("*")
      .contains("collaborators", [userId])
      .order("updated_at", { ascending: false });

    if (collabError) throw collabError;

    // Merge and deduplicate
    const allForms = [...(ownedForms || []), ...(collabForms || [])];
    const seen = new Set();
    const unique = allForms.filter(f => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });

    res.json(unique);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch forms" });
  }
}

async function createForm(req, res) {
  try {
    const { title = "Untitled form", fields = [] } = req.body;
    const { data: form, error: formError } = await supabase
      .from("forms")
      .insert({ 
        title, 
        status: req.body.status || "draft",
        owner_id: req.body.ownerId || null,
        collaborators: [],
        is_public_edit: false
      })
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

    // Step 4: Permission Check
    const userId = req.query.userId;
    const isOwner = form.owner_id === userId;
    const isCollaborator = form.collaborators && form.collaborators.includes(userId);
    const isPublic = form.is_public_edit;

    if (!isOwner && !isCollaborator && !isPublic && userId !== "system") {
      return res.status(403).json({ error: "Access Denied: You do not have permission to edit this form." });
    }

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
    const { title, fields, status, collaborators, isPublicEdit, userId } = req.body;

    // Fetch form to check permissions
    const { data: form, error: findError } = await supabase
      .from("forms")
      .select("*")
      .eq("id", req.params.id)
      .single();
    
    if (findError || !form) return res.status(404).json({ error: "Form not found" });

    const isOwner = form.owner_id === userId;
    const isCollaborator = form.collaborators && form.collaborators.includes(userId);
    
    if (!isOwner && !isCollaborator && userId !== "system") {
      return res.status(403).json({ error: "Permission Denied" });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (status !== undefined) updates.status = status;
    if (collaborators !== undefined) updates.collaborators = collaborators;
    if (isPublicEdit !== undefined) updates.is_public_edit = isPublicEdit;

    if (Object.keys(updates).length > 0) {
      const { error: formError } = await supabase
        .from("forms")
        .update(updates)
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

module.exports = { getForms, createForm, getForm, updateForm };
