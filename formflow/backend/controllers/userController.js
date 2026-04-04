const { supabase } = require("../lib/supabaseClient");

async function findUserByEmail(req, res) {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // In a real app, you might search Supabase Auth or a users table
    // For this implementation, we assume a 'profiles' table exists
    const { data: user, error } = await supabase
      .from("profiles")
      .select("id, name, email")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
}

module.exports = { findUserByEmail };
