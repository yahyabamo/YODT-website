import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // won't work for RPC unless we have a custom RPC. Let's use the DB directly if we have postgres connection string or try creating an RPC.

// But wait, we can just use the supabase CLI to fetch the SQL dump or we can use `psql` if we have the connection string.
// Let's check if .env has DATABASE_URL
console.log("DB URL:", process.env.DATABASE_URL ? "Exists" : "Not found");
