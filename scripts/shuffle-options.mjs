import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const LETTERS = ['A', 'B', 'C', 'D'];

// Deterministic shuffle using question ID as seed so results are reproducible
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

(async () => {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  const [rows] = await conn.execute('SELECT id, options, correct_answers FROM aws_questions');
  console.log(`Shuffling options for ${rows.length} questions...`);
  
  const dist = { A: 0, B: 0, C: 0, D: 0 };
  
  for (const row of rows) {
    let opts = row.options;
    if (typeof opts === 'string') opts = JSON.parse(opts);
    
    let ca = row.correct_answers;
    if (typeof ca === 'string') ca = JSON.parse(ca);
    const correctLetter = Array.isArray(ca) ? ca[0] : ca;
    const correctIdx = LETTERS.indexOf(correctLetter);
    
    if (correctIdx === -1) {
      console.warn(`Skipping id=${row.id}, unexpected correct_answers: ${correctLetter}`);
      continue;
    }
    
    // Get the actual correct answer text
    const correctText = opts[correctIdx];
    
    // Shuffle the options using question ID as seed
    const shuffled = seededShuffle(opts, row.id);
    
    // Find where the correct answer ended up after shuffle
    const newCorrectIdx = shuffled.indexOf(correctText);
    const newCorrectLetter = LETTERS[newCorrectIdx];
    
    dist[newCorrectLetter]++;
    
    await conn.execute(
      'UPDATE aws_questions SET options = ?, correct_answers = ? WHERE id = ?',
      [JSON.stringify(shuffled), JSON.stringify([newCorrectLetter]), row.id]
    );
  }
  
  console.log(`\nDone! New distribution:`);
  console.log(`  A=${dist.A} B=${dist.B} C=${dist.C} D=${dist.D}`);
  
  const total = dist.A + dist.B + dist.C + dist.D;
  console.log(`  A=${(dist.A/total*100).toFixed(1)}% B=${(dist.B/total*100).toFixed(1)}% C=${(dist.C/total*100).toFixed(1)}% D=${(dist.D/total*100).toFixed(1)}%`);
  
  await conn.end();
})().catch(console.error);
