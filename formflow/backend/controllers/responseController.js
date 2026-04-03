const { supabase } = require("../lib/supabaseClient");

async function createResponse(req, res) {
  try {
    const { formId, answers } = req.body;
    if (!formId || !answers || typeof answers !== "object") {
      return res.status(400).json({ error: "formId and answers required" });
    }

    // Insert into responses table
    const { data: response, error: responseError } = await supabase
      .from("responses")
      .insert({ form_id: formId })
      .select("*")
      .single();

    if (responseError || !response) {
      return res.status(404).json({ error: "Failed to create response or Form not found" });
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
