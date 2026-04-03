const { supabase } = require("../lib/supabaseClient");

async function createResponse(req, res) {
  try {
    const { formId, answers } = req.body;
    if (!formId || !answers || typeof answers !== "object") {
      return res.status(400).json({ error: "formId and answers required" });
    }

    // Fetch form schema for validation
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("schema")
      .eq("id", formId)
      .single();

    if (formError || !form) {
      return res.status(404).json({ error: "Form not found" });
    }

    const schema = form.schema;
    if (schema?.fields) {
      for (const field of schema.fields) {
        const value = answers[field.id];
        const valText = value === undefined || value === null ? "" : String(value).trim();
        const validation = field.validation || (field.required ? { required: true } : {});

        // Default validations
        if (field.type === "email" && !validation.regex && valText !== "") {
          validation.regex = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
        }

        // Required check
        if (validation.required) {
          const isEmpty = field.type === "checkbox" 
            ? (!Array.isArray(value) || value.length === 0) 
            : valText === "";
          if (isEmpty) {
            return res.status(400).json({ 
              error: validation.message || `${field.label} is required.` 
            });
          }
        }

        if (valText !== "") {
          if (validation.minLength && valText.length < validation.minLength) {
            return res.status(400).json({ 
              error: validation.message || `${field.label} must be at least ${validation.minLength} characters.` 
            });
          }
          if (validation.maxLength && valText.length > validation.maxLength) {
            return res.status(400).json({ 
              error: validation.message || `${field.label} cannot exceed ${validation.maxLength} characters.` 
            });
          }
          if (validation.regex) {
            try {
              const re = new RegExp(validation.regex);
              if (!re.test(valText)) {
                return res.status(400).json({ 
                  error: validation.message || `${field.label} format is invalid.` 
                });
              }
            } catch (e) {}
          }
        }
      }
    }

    // Insert into responses table
    const { data: response, error: responseError } = await supabase
      .from("responses")
      .insert({ form_id: formId })
      .select("*")
      .single();

    if (responseError || !response) {
      return res.status(404).json({ error: "Failed to create response" });
    }

    // Insert answers
    const entries = Object.entries(answers);
    if (entries.length > 0) {
      const responseAnswers = entries.map(([fieldId, value]) => ({
        response_id: response.id,
        field_id: fieldId,
        value: typeof value === "string" ? value : JSON.stringify(value),
      }));

      const { error: answersError } = await supabase
        .from("response_answers")
        .insert(responseAnswers);
        
      if (answersError) {
        console.error("Error inserting answers:", answersError);
      }
    }

    res.status(201).json({
      id: response.id,
      formId: response.form_id,
      answers,
      submittedAt: response.submitted_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save response" });
  }
}

async function listResponses(req, res) {
  try {
    const { formId } = req.params;
    
    const { data: responses, error: responseError } = await supabase
      .from("responses")
      .select("*, response_answers(field_id, value)")
      .eq("form_id", formId)
      .order("submitted_at", { ascending: false });

    if (responseError) throw responseError;

    const normalized = responses.map((r) => {
      const answersAcc = {};
      if (r.response_answers) {
         r.response_answers.forEach(a => {
           let val = a.value;
           try {
             if (val && (val.startsWith("[") || val.startsWith("{") || val === "true" || val === "false")) {
                val = JSON.parse(val);
             }
           } catch(e) {}
           answersAcc[a.field_id] = val;
         });
      }

      return {
        id: r.id,
        formId: r.form_id,
        answers: answersAcc,
        submittedAt: r.submitted_at,
      };
    });

    res.json(normalized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list responses" });
  }
}

module.exports = { createResponse, listResponses };
