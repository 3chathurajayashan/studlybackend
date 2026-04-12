import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,      // your project URL
  process.env.SUPABASE_SERVICE_ROLE_KEY // your service key
);
async function test() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) console.error("Error:", error);
  else console.log("Buckets:", data);
}

test();
export default supabase;