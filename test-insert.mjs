import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
const DATABASE_URL = "postgresql://neondb_owner:npg_JRzHIXytvC02@ep-crimson-bird-av0nrde5-pooler.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);

async function test() {
  try {
    const passwordHash = await bcrypt.hash("password123", 10);
    const existing = await sql`SELECT id FROM users WHERE email = 'test2@example.com'`;
    console.log("Existing:", existing);
    const result = await sql`INSERT INTO users (name, email, password_hash, initials, role, projects) VALUES ('Test User', 'test2@example.com', ${passwordHash}, 'TU', 'User', 0) RETURNING *`;
    console.log(result);
  } catch (e) {
    console.error("DB Error:", e);
  }
}
test();
