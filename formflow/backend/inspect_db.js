const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { supabase } = require("./lib/supabaseClient");

async function main() {
  // Test 1: simple select
  const { data, error } = await supabase.from("forms").select("*").limit(2);
  console.log("COLUMNS:", data && data[0] ? Object.keys(data[0]) : "no rows, check table");
  console.log("ERROR:", error ? JSON.stringify(error) : "none");
  
  // Test 2: contains on collaborators
  if (data && data[0]) {
    const { data: d2, error: e2 } = await supabase.from("forms").select("*").contains("collaborators", ["test-id"]).limit(1);
    console.log("CONTAINS TEST:", d2 ? "ok" : "failed", e2 ? JSON.stringify(e2) : "");
  }
}
main();
