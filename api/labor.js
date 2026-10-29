import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    // ==========================================
    // GET: Fetch all active labor rates + multipliers
    // ==========================================
    if (req.method === "GET") {
      const rates = await sql`
        SELECT id, role_key, daily_wage::numeric, is_active, updated_at
        FROM labor_rates
        WHERE is_active = TRUE
        ORDER BY role_key ASC
      `;

      const multipliers = await sql`
        SELECT id, type_key, multiplier::numeric, is_active, updated_at
        FROM labor_multipliers
        WHERE is_active = TRUE
        ORDER BY type_key ASC
      `;

      return res.status(200).json({ success: true, rates, multipliers });
    }

    // ==========================================
    // PUT: Update a labor_rate OR labor_multiplier
    //   ?type=multiplier  → updates labor_multipliers
    //   (default)         → updates labor_rates
    // ==========================================
    if (req.method === "PUT") {
      const isMultiplier = req.query && req.query.type === "multiplier";

      if (isMultiplier) {
        // ── Update labor_multipliers ──
        const { id, type_key, multiplier } = req.body || {};

        if (!id && !type_key) {
          return res.status(400).json({
            success: false,
            message: "Either id or type_key is required to update a multiplier."
          });
        }

        const parsedMultiplier = multiplier !== undefined ? parseFloat(multiplier) : null;

        let updated;
        if (id) {
          updated = await sql`
            UPDATE labor_multipliers SET
              multiplier = COALESCE(${parsedMultiplier}, multiplier),
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
            RETURNING *
          `;
        } else {
          updated = await sql`
            UPDATE labor_multipliers SET
              multiplier = COALESCE(${parsedMultiplier}, multiplier),
              updated_at = CURRENT_TIMESTAMP
            WHERE type_key = ${type_key.trim()}
            RETURNING *
          `;
        }

        if (!updated || updated.length === 0) {
          return res.status(404).json({ success: false, message: "Multiplier not found." });
        }

        return res.status(200).json({
          success: true,
          message: "Labor multiplier updated successfully.",
          multiplier: updated[0]
        });

      } else {
        // ── Update labor_rates ──
        const { id, role_key, daily_wage } = req.body || {};

        if (!id && !role_key) {
          return res.status(400).json({
            success: false,
            message: "Either id or role_key is required to update a labor rate."
          });
        }

        const parsedWage = daily_wage !== undefined ? parseFloat(daily_wage) : null;

        let updated;
        if (id) {
          updated = await sql`
            UPDATE labor_rates SET
              daily_wage = COALESCE(${parsedWage}, daily_wage),
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
            RETURNING *
          `;
        } else {
          updated = await sql`
            UPDATE labor_rates SET
              daily_wage = COALESCE(${parsedWage}, daily_wage),
              updated_at = CURRENT_TIMESTAMP
            WHERE role_key = ${role_key.trim()}
            RETURNING *
          `;
        }

        if (!updated || updated.length === 0) {
          return res.status(404).json({ success: false, message: "Labor rate not found." });
        }

        return res.status(200).json({
          success: true,
          message: "Labor rate updated successfully.",
          rate: updated[0]
        });
      }
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });

  } catch (error) {
    console.error("Labor API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
}
