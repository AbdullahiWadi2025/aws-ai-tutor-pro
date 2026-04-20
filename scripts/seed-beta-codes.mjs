import mysql from 'mysql2/promise';

const codes = [
  {
    code: "LAUNCH2026",
    description: "Launch promo - 30 day premium trial",
    max_uses: 100,
    trial_days: 30,
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
  {
    code: "BETATESTER",
    description: "Beta tester - 60 day premium trial",
    max_uses: 50,
    trial_days: 60,
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
  {
    code: "REDDIT14",
    description: "Reddit community - 14 day trial extension",
    max_uses: 500,
    trial_days: 14,
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
  {
    code: "AWSPREP",
    description: "AWS certification community - 30 day trial",
    max_uses: 200,
    trial_days: 30,
    expires_at: null,
  },
];

const connection = await mysql.createConnection(process.env.DATABASE_URL);

for (const c of codes) {
  try {
    const [existing] = await connection.query(
      "SELECT id FROM beta_codes WHERE code = ?",
      [c.code]
    );
    if (existing.length > 0) {
      console.log(`⊘ Already exists: ${c.code}`);
      continue;
    }
    await connection.query(
      `INSERT INTO beta_codes (code, description, max_uses, trial_days, expires_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [c.code, c.description, c.max_uses, c.trial_days, c.expires_at, true]
    );
    console.log(`✓ Created: ${c.code} (${c.trial_days} days, ${c.max_uses} uses)`);
  } catch (err) {
    console.error(`✗ Error creating ${c.code}:`, err.message);
  }
}

await connection.end();
console.log("\n✅ Beta codes seeded");
