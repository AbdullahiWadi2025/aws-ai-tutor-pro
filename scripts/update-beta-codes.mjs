import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Update LAUNCH2026: reduce to 25 uses, 30-day trial (unchanged)
await connection.query(
  "UPDATE beta_codes SET max_uses = 25, description = ? WHERE code = 'LAUNCH2026'",
  ["Founding members - 30 day premium trial (limited to 25)"]
);
console.log("✓ LAUNCH2026: 25 uses, 30-day extension");

// Update BETATESTER: reduce to 10 uses, keep 60-day trial
await connection.query(
  "UPDATE beta_codes SET max_uses = 10, description = ? WHERE code = 'BETATESTER'",
  ["VIP testers - 60 day premium trial (only 10 spots)"]
);
console.log("✓ BETATESTER: 10 uses, 60-day extension");

// Deactivate REDDIT14 and AWSPREP (keep for later if needed)
await connection.query(
  "UPDATE beta_codes SET is_active = false WHERE code IN ('REDDIT14', 'AWSPREP')"
);
console.log("✓ REDDIT14 and AWSPREP deactivated");

// Show current state
const [rows] = await connection.query(
  "SELECT code, description, max_uses, used_count, trial_days, is_active FROM beta_codes ORDER BY id"
);
console.log("\n📋 Current beta codes:");
console.table(rows);

await connection.end();
console.log("\n✅ Beta codes reconfigured for small launch");
