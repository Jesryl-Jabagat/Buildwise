import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    if (req.method === "GET") {
      // Fetch all reviews
      const reviews = await sql`SELECT * FROM reviews ORDER BY created_at DESC`;
      return res.status(200).json({ success: true, reviews });
    } else if (req.method === "POST") {
      // Insert a new review
      const { user_name, user_email, rating, review_text, template_name } =
        req.body;

      if (!user_name || !rating) {
        return res
          .status(400)
          .json({ success: false, message: "Name and rating are required" });
      }

      // Validate rating here so bad input returns a clean 400
      // instead of a database CHECK constraint error (500)
      const ratingNum = Number(rating);
      if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Rating must be a whole number from 1 to 5",
          });
      }

      // Link the review to a registered user if the email matches one
      let userId = null;
      if (user_email) {
        const users = await sql`
          SELECT id FROM users WHERE email = ${user_email} LIMIT 1

        `;
        if (users.length > 0) {
          userId = users[0].id;
        }
      }

      await sql`
        INSERT INTO reviews (user_id, user_name, user_email, rating, review_text, template_name)
        VALUES (${userId}, ${user_name}, ${user_email || null}, ${ratingNum}, ${review_text || null}, ${template_name || null})
      `;

      return res
        .status(201)
        .json({ success: true, message: "Review submitted successfully" });
    } else {
      return res
        .status(405)
        .json({ success: false, message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("API Error (Reviews):", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error: " + (error.message || String(error)),
      });
  }
}
