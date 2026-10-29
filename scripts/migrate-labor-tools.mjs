// migrate-labor-tools.mjs — run with: node scripts/migrate-labor-tools.mjs
// from inside: C:\Users\jayve\Desktop\backup - Copy

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function migrate() {
  console.log("\uD83D\uDE80 Starting migration...\n");

  // ─── Step 1: Create tables ───────────────────
  console.log("\uD83D\uDCCB Creating tables...");

  await sql`
    CREATE TABLE IF NOT EXISTS tool_items (
      id           SERIAL PRIMARY KEY,
      tool_key     VARCHAR(255) NOT NULL UNIQUE,
      category     VARCHAR(100) NOT NULL DEFAULT 'General',
      unit_price   NUMERIC(12, 2) NOT NULL DEFAULT 0,
      is_active    BOOLEAN NOT NULL DEFAULT TRUE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log("  \u2705 tool_items");

  await sql`
    CREATE TABLE IF NOT EXISTS labor_rates (
      id           SERIAL PRIMARY KEY,
      role_key     VARCHAR(255) NOT NULL UNIQUE,
      daily_wage   NUMERIC(10, 2) NOT NULL DEFAULT 0,
      is_active    BOOLEAN NOT NULL DEFAULT TRUE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log("  \u2705 labor_rates");

  await sql`
    CREATE TABLE IF NOT EXISTS labor_multipliers (
      id            SERIAL PRIMARY KEY,
      type_key      VARCHAR(100) NOT NULL UNIQUE,
      multiplier    NUMERIC(5, 4) NOT NULL DEFAULT 0.30,
      is_active     BOOLEAN NOT NULL DEFAULT TRUE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log("  \u2705 labor_multipliers\n");

  // ─── Step 2A: Seed tool_items ─────────────────
  console.log("\uD83D\uDD27 Seeding tool_items...");
  const tools = [
    ["Shovel (Pala)",               "Earthworks", 350],
    ["Pickaxe (Piko)",              "Earthworks", 450],
    ["Wheelbarrow (Kariton)",       "Earthworks", 2500],
    ["Claw Hammer",                 "Carpentry",  250],
    ["Tape Measure (5m)",           "Carpentry",  150],
    ["Circular Saw",                "Carpentry",  3500],
    ["Hand Saw",                    "Carpentry",  350],
    ["Carpenter Square (L-Square)", "Carpentry",  180],
    ["Spirit Level (Leveler)",      "Masonry",    350],
    ["Trowel (Paleta)",             "Masonry",    120],
    ["Plastering Trowel",           "Masonry",    150],
    ["Mason Line & Chalk",          "Masonry",    80],
    ["Plumb Bob (Tuldok)",          "Masonry",    120],
    ["Concrete Mixer (1 bagger)",   "Equipment",  85000],
    ["Welding Machine (Portable)",  "Equipment",  8500],
    ["Angle Grinder (Grinder)",     "Equipment",  2500],
    ["Electric Drill",              "Equipment",  2800],
    ['Pipe Wrench (12")',           "Plumbing",   450],
    ["PVC Cutter",                  "Plumbing",   350],
    ["Wire Stripper",               "Electrical", 280],
    ["Lineman Pliers",              "Electrical", 350],
    ["Voltage Tester",              "Electrical", 250],
    ["Scaffolding Set (2-bay)",     "Safety",     12000],
    ["Hard Hat",                    "Safety",     250],
    ["Safety Harness",              "Safety",     1500],
  ];

  let toolsInserted = 0;
  for (const [tool_key, category, unit_price] of tools) {
    const result = await sql`
      INSERT INTO tool_items (tool_key, category, unit_price)
      VALUES (${tool_key}, ${category}, ${unit_price})
      ON CONFLICT (tool_key) DO NOTHING
    `;
    toolsInserted++;
  }
  console.log(`  \u2705 ${toolsInserted} tools processed\n`);

  // ─── Step 2B: Seed labor_rates ───────────────
  console.log("\uD83D\uDC77 Seeding labor_rates...");
  const laborRates = [
    ["Lead Carpenter / Master Builder", 550],
    ["Mason",                           550],
    ["Helper / Ordinary Laborer",       400],
    ["Electrician",                     600],
    ["Plumber",                         600],
    ["Tile Setter",                     600],
    ["Painter",                         550],
  ];
  for (const [role_key, daily_wage] of laborRates) {
    await sql`
      INSERT INTO labor_rates (role_key, daily_wage)
      VALUES (${role_key}, ${daily_wage})
      ON CONFLICT (role_key) DO NOTHING
    `;
  }
  console.log(`  \u2705 ${laborRates.length} labor rates processed\n`);

  // ─── Step 2C: Seed labor_multipliers ──────────
  console.log("\uD83D\uDCCA Seeding labor_multipliers...");
  const multipliers = [
    ["half-amakan", 0.20],
    ["half-metal",  0.20],
    ["chb",         0.25],
    ["loft",        0.35],
    ["two-storey",  0.35],
    ["default",     0.30],
  ];
  for (const [type_key, multiplier] of multipliers) {
    await sql`
      INSERT INTO labor_multipliers (type_key, multiplier)
      VALUES (${type_key}, ${multiplier})
      ON CONFLICT (type_key) DO NOTHING
    `;
  }
  console.log(`  \u2705 ${multipliers.length} multipliers processed\n`);

  // ─── Verify ───────────────────────────────────
  console.log("\uD83D\uDD0D Verifying...");
  const [tc]  = await sql`SELECT count(*) FROM tool_items`;
  const [lrc] = await sql`SELECT count(*) FROM labor_rates`;
  const [lmc] = await sql`SELECT count(*) FROM labor_multipliers`;
  console.log(`  tool_items:        ${tc.count} rows`);
  console.log(`  labor_rates:       ${lrc.count} rows`);
  console.log(`  labor_multipliers: ${lmc.count} rows`);
  console.log("\n\u2705 Migration complete!");
}

migrate().catch(err => {
  console.error("\u274C Migration failed:", err.message);
  process.exit(1);
});
