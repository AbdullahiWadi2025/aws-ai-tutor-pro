import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const LETTERS = ['A', 'B', 'C', 'D'];

(async () => {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  const [rows] = await conn.execute('SELECT id, options, correct_answers FROM aws_questions');
  console.log(`Processing ${rows.length} questions...`);
  
  let fixed = 0;
  let alreadyLetter = 0;
  let notFound = 0;
  const dist = { A: 0, B: 0, C: 0, D: 0 };
  
  for (const row of rows) {
    let opts = row.options;
    if (typeof opts === 'string') opts = JSON.parse(opts);
    
    let ca = row.correct_answers;
    if (typeof ca === 'string') ca = JSON.parse(ca);
    const correctText = Array.isArray(ca) ? ca[0] : ca;
    
    // Already a letter code
    if (['A', 'B', 'C', 'D'].includes(correctText)) {
      dist[correctText]++;
      alreadyLetter++;
      continue;
    }
    
    // Find which option index matches the correct answer text
    const idx = opts.findIndex(opt => opt.trim() === correctText.trim());
    
    if (idx === -1) {
      // Try partial match (first 50 chars)
      const shortCorrect = correctText.substring(0, 50).toLowerCase();
      const partialIdx = opts.findIndex(opt => opt.toLowerCase().startsWith(shortCorrect.substring(0, 40)));
      
      if (partialIdx === -1) {
        console.warn(`  NOT FOUND for id=${row.id}: "${correctText.substring(0, 60)}"`);
        notFound++;
        continue;
      }
      
      const letter = LETTERS[partialIdx];
      await conn.execute(
        'UPDATE aws_questions SET correct_answers = ? WHERE id = ?',
        [JSON.stringify([letter]), row.id]
      );
      dist[letter]++;
      fixed++;
    } else {
      const letter = LETTERS[idx];
      await conn.execute(
        'UPDATE aws_questions SET correct_answers = ? WHERE id = ?',
        [JSON.stringify([letter]), row.id]
      );
      dist[letter]++;
      fixed++;
    }
  }
  
  console.log(`\nDone!`);
  console.log(`  Fixed: ${fixed}`);
  console.log(`  Already letter: ${alreadyLetter}`);
  console.log(`  Not found: ${notFound}`);
  console.log(`  Distribution: A=${dist.A} B=${dist.B} C=${dist.C} D=${dist.D}`);
  
  await conn.end();
})().catch(console.error);
