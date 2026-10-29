import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    // ==========================================
    // GET: Fetch all active tool items
    // ==========================================
    if (req.method === "GET") {
      const items = await sql`
        SELECT 
          id,
          tool_key,
          category,
          unit_price::numeric,
          is_active,
          updated_at
        FROM tool_items
        WHERE is_active = TRUE
        ORDER BY category ASC, tool_key ASC
      `;

      return res.status(200).json({ success: true, tools: items });
    }

    // ==========================================
    // POST: Create a new tool item
    // ==========================================
    if (req.method === "POST") {
      const { tool_key, category, unit_price } = req.body || {};

      if (!tool_key) {
        return res.status(400).json({
          success: false,
          message: "tool_key is required."
        });
      }

      const parsedPrice = parseFloat(unit_price) || 0;
      const cat = category ? category.trim() : "General";

      const inserted = await sql`
        INSERT INTO tool_items (
          tool_key,
          category,
          unit_price
        ) VALUES (
          ${tool_key.trim()},
          ${cat},
          ${parsedPrice}
        )
        ON CONFLICT (tool_key) DO UPDATE
        SET unit_price = EXCLUDED.unit_price,
            category = EXCLUDED.category,
            is_active = TRUE,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      return res.status(201).json({
        success: true,
        message: "Tool created/updated successfully.",
        tool: inserted[0]
      });
    }

    // ==========================================
    // PUT: Update tool price or details
    // ==========================================
    if (req.method === "PUT") {
      const { id, tool_key, category, unit_price } = req.body || {};

      if (!id && !tool_key) {
        return res.status(400).json({
          success: false,
          message: "Either id or tool_key is required to update."
        });
      }

      const parsedPrice = unit_price !== undefined ? parseFloat(unit_price) : null;

      let updated;
      if (id) {
        updated = await sql`
          UPDATE tool_items SET
            category = COALESCE(${category ? category.trim() : null}, category),
            unit_price = COALESCE(${parsedPrice}, unit_price),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `;
      } else {
        updated = await sql`
          UPDATE tool_items SET
            category = COALESCE(${category ? category.trim() : null}, category),
            unit_price = COALESCE(${parsedPrice}, unit_price),
            updated_at = CURRENT_TIMESTAMP
          WHERE tool_key = ${tool_key.trim()}
          RETURNING *
        `;
      }

      if (!updated || updated.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Tool not found."
        });
      }

      return res.status(200).json({
        success: true,
        message: "Tool updated successfully.",
        tool: updated[0]
      });
    }

    // ==========================================
    // DELETE: Soft delete (is_active = FALSE)
    // ==========================================
    if (req.method === "DELETE") {
      const { id, tool_key } = req.query || {};

      if (!id && !tool_key) {
        return res.status(400).json({
          success: false,
          message: "id or tool_key query parameter required."
        });
      }

      let deleted;
      if (id) {
        deleted = await sql`
          UPDATE tool_items 
          SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `;
      } else {
        deleted = await sql`
          UPDATE tool_items 
          SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
          WHERE tool_key = ${tool_key}
          RETURNING *
        `;
      }

      return res.status(200).json({
        success: true,
        message: "Tool deleted successfully.",
        tool: deleted ? deleted[0] : null
      });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("Tools API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
}
