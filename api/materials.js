import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    // ==========================================
    // GET: Fetch all active material items
    // ==========================================
    if (req.method === "GET") {
      const items = await sql`
        SELECT 
          id,
          material_key,
          category,
          unit,
          basic_brand,
          basic_price::numeric,
          standard_brand,
          standard_price::numeric,
          premium_brand,
          premium_price::numeric,
          is_active,
          updated_at
        FROM material_items
        WHERE is_active = TRUE
        ORDER BY category ASC, material_key ASC
      `;

      return res.status(200).json({ success: true, materials: items });
    }

    // ==========================================
    // POST: Create a new material item
    // ==========================================
    if (req.method === "POST") {
      const {
        material_key,
        category,
        unit,
        basic_brand,
        basic_price,
        standard_brand,
        standard_price,
        premium_brand,
        premium_price
      } = req.body || {};

      if (!material_key || !category || !unit) {
        return res.status(400).json({
          success: false,
          message: "material_key, category, and unit are required fields."
        });
      }

      const parsedBasicPrice = parseFloat(basic_price) || 0;
      const parsedStandardPrice = parseFloat(standard_price) || 0;
      const parsedPremiumPrice = parseFloat(premium_price) || 0;

      const inserted = await sql`
        INSERT INTO material_items (
          material_key,
          category,
          unit,
          basic_brand,
          basic_price,
          standard_brand,
          standard_price,
          premium_brand,
          premium_price
        ) VALUES (
          ${material_key.trim()},
          ${category.trim()},
          ${unit.trim()},
          ${(basic_brand || "").trim()},
          ${parsedBasicPrice},
          ${(standard_brand || "").trim()},
          ${parsedStandardPrice},
          ${(premium_brand || "").trim()},
          ${parsedPremiumPrice}
        )
        RETURNING *
      `;

      return res.status(201).json({
        success: true,
        message: "Material created successfully.",
        material: inserted[0]
      });
    }

    // ==========================================
    // PUT: Update material tier prices and brands
    // ==========================================
    if (req.method === "PUT") {
      const {
        id,
        material_key,
        category,
        unit,
        basic_brand,
        basic_price,
        standard_brand,
        standard_price,
        premium_brand,
        premium_price
      } = req.body || {};

      if (!id && !material_key) {
        return res.status(400).json({
          success: false,
          message: "Either id or material_key is required to update."
        });
      }

      let updated;
      if (id) {
        updated = await sql`
          UPDATE material_items SET
            category = COALESCE(${category ? category.trim() : null}, category),
            unit = COALESCE(${unit ? unit.trim() : null}, unit),
            basic_brand = COALESCE(${basic_brand !== undefined ? basic_brand.trim() : null}, basic_brand),
            basic_price = COALESCE(${basic_price !== undefined ? parseFloat(basic_price) : null}, basic_price),
            standard_brand = COALESCE(${standard_brand !== undefined ? standard_brand.trim() : null}, standard_brand),
            standard_price = COALESCE(${standard_price !== undefined ? parseFloat(standard_price) : null}, standard_price),
            premium_brand = COALESCE(${premium_brand !== undefined ? premium_brand.trim() : null}, premium_brand),
            premium_price = COALESCE(${premium_price !== undefined ? parseFloat(premium_price) : null}, premium_price),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `;
      } else {
        updated = await sql`
          UPDATE material_items SET
            category = COALESCE(${category ? category.trim() : null}, category),
            unit = COALESCE(${unit ? unit.trim() : null}, unit),
            basic_brand = COALESCE(${basic_brand !== undefined ? basic_brand.trim() : null}, basic_brand),
            basic_price = COALESCE(${basic_price !== undefined ? parseFloat(basic_price) : null}, basic_price),
            standard_brand = COALESCE(${standard_brand !== undefined ? standard_brand.trim() : null}, standard_brand),
            standard_price = COALESCE(${standard_price !== undefined ? parseFloat(standard_price) : null}, standard_price),
            premium_brand = COALESCE(${premium_brand !== undefined ? premium_brand.trim() : null}, premium_brand),
            premium_price = COALESCE(${premium_price !== undefined ? parseFloat(premium_price) : null}, premium_price),
            updated_at = CURRENT_TIMESTAMP
          WHERE material_key = ${material_key.trim()}
          RETURNING *
        `;
      }

      if (!updated || updated.length === 0) {
        return res.status(440).json({
          success: false,
          message: "Material not found."
        });
      }

      return res.status(200).json({
        success: true,
        message: "Material updated successfully.",
        material: updated[0]
      });
    }

    // ==========================================
    // DELETE: Soft delete (or archive) an item
    // ==========================================
    if (req.method === "DELETE") {
      const { id, material_key } = req.query;

      if (!id && !material_key) {
        return res.status(400).json({
          success: false,
          message: "id or material_key query parameter required."
        });
      }

      let deleted;
      if (id) {
        deleted = await sql`
          UPDATE material_items 
          SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `;
      } else {
        deleted = await sql`
          UPDATE material_items 
          SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
          WHERE material_key = ${material_key}
          RETURNING *
        `;
      }

      return res.status(200).json({
        success: true,
        message: "Material deleted successfully.",
        material: deleted[0]
      });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("Materials API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message
    });
  }
}
