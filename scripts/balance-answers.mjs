import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const LETTERS = ['A', 'B', 'C', 'D'];

(async () => {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  const [rows] = await conn.execute('SELECT id, options, correct_answers FROM aws_questions ORDER BY id');
  console.log(`Balancing ${rows.length} questions...`);
  
  const dist = { A: 0, B: 0, C: 0, D: 0 };
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let opts = row.options;
    if (typeof opts === 'string') opts = JSON.parse(opts);
    
    let ca = row.correct_answers;
    if (typeof ca === 'string') ca = JSON.parse(ca);
    const currentLetter = Array.isArray(ca) ? ca[0] : ca;
    const currentIdx = LETTERS.indexOf(currentLetter);
    
    if (currentIdx === -1) continue;
    
    // Target position using round-robin: 0,1,2,3,0,1,2,3...
    const targetIdx = i % 4;
    const targetLetter = LETTERS[targetIdx];
    
    if (targetIdx === currentIdx) {
      // Already in the right position
      dist[targetLetter]++;
      continue;
    }
    
    // Swap the correct answer to the target position
    const newOpts = [...opts];
    // Swap current correct position with target position
    [newOpts[currentIdx], newOpts[targetIdx]] = [newOpts[targetIdx], newOpts[currentIdx]];
    
    dist[targetLetter]++;
    
    await conn.execute(
      'UPDATE aws_questions SET options = ?, correct_answers = ? WHERE id = ?',
      [JSON.stringify(newOpts), JSON.stringify([targetLetter]), row.id]
    );
  }
  
  console.log(`\nDone! Final distribution:`);
  console.log(`  A=${dist.A} B=${dist.B} C=${dist.C} D=${dist.D}`);
  const total = dist.A + dist.B + dist.C + dist.D;
  console.log(`  A=${(dist.A/total*100).toFixed(1)}% B=${(dist.B/total*100).toFixed(1)}% C=${(dist.C/total*100).toFixed(1)}% D=${(dist.D/total*100).toFixed(1)}%`);
  
  await conn.end();
})().catch(console.error);
