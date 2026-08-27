import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    if (req.method === "GET") {
      // Fetch all reviews
      const reviews = await sql`SELECT * FROM reviews ORDER BY created_at DESC`;
      return res.status(200).json({ success: true, reviews });
    } 
    
    else if (req.method === "POST") {
      // Insert a new review
      const { user_name, user_email, rating, review_text, template_name } = req.body;

      if (!user_name || !rating) {
        return res.status(400).json({ success: false, message: "Name and rating are required" });
      }

      await sql`
        INSERT INTO reviews (user_name, user_email, rating, review_text, template_name)
        VALUES (${user_name}, ${user_email || null}, ${rating}, ${review_text || null}, ${template_name || null})
      `;

      return res.status(201).json({ success: true, message: "Review submitted successfully" });
    } 
    
    else {
      return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("API Error (Reviews):", error);
    return res.status(500).json({ success: false, message: "Server error: " + (error.message || String(error)) });
  }
}
