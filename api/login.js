import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  // 1. Enforce POST requests only
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  const { email, password } = req.body;

  // 2. Validate input
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  try {
    // 3. Connect to Neon Database using your Vercel Environment Variable
    const sql = neon(process.env.DATABASE_URL);

    // 4. Fetch the user safely (parameterized query prevents SQL injection)
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (users.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const user = users[0];

    // 5. Securely verify the password against the stored bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // 6. Strip out the sensitive password hash before sending the user data back
    const { password_hash, ...safeUser } = user;

    // 7. Return the successful session payload
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: safeUser,
    });
  } catch (error) {
    console.error("API Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error: " + (error.message || String(error)) });
  }
}
