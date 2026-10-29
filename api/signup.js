import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

function getInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required" });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // 1. Check if user already exists
    const existingUsers = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: "Email is already registered" });
    }

    // 2. Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Compute initials
    const initials = getInitials(name);

    // 4. Insert the new user
    const insertedUsers = await sql`
      INSERT INTO users (name, email, password_hash, initials, role, projects)
      VALUES (${name}, ${email}, ${passwordHash}, ${initials}, 'User', 0)
      RETURNING id, name, email, initials, role, projects, created_at;
    `;

    const newUser = insertedUsers[0];

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Signup API Error:", error);
    return res.status(500).json({ success: false, message: "Server error: " + (error.message || String(error)) });
  }
}
