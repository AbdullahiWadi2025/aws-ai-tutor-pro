import mysql from 'mysql2/promise';

// Deterministic target positions: assign each question a target slot (A=0,B=1,C=2,D=3)
// cycling through so the distribution is perfectly even
function getTargetSlot(index, total) {
  // Spread evenly: question 0 → A, 1 → B, 2 → C, 3 → D, 4 → A, ...
  return index % 4;
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  for (const cert of ['CLF-C02', 'SAA-C03']) {
    const [rows] = await conn.execute(
      'SELECT id, options, correct_answers FROM aws_questions WHERE certification = ? ORDER BY id',
      [cert]
    );

    console.log(`\nProcessing ${cert} — ${rows.length} questions`);

    // Shuffle rows randomly first so the A/B/C/D assignment isn't predictable by question order
    const shuffledRows = [...rows].sort(() => Math.random() - 0.5);

    let updated = 0;
    for (let i = 0; i < shuffledRows.length; i++) {
      const r = shuffledRows[i];
      const options = Array.isArray(r.options) ? r.options : JSON.parse(r.options);
      const correctAnswers = Array.isArray(r.correct_answers) ? r.correct_answers : JSON.parse(r.correct_answers);

      // Find the index of the current correct answer (0-based)
      const letters = ['A', 'B', 'C', 'D'];
      const currentCorrectLetter = correctAnswers[0]; // e.g. "B"
      const currentCorrectIdx = letters.indexOf(currentCorrectLetter); // e.g. 1

      // Target slot for this question
      const targetIdx = getTargetSlot(i, shuffledRows.length); // 0,1,2,3 cycling

      if (currentCorrectIdx === targetIdx) {
        // Already in the right slot, no change needed
        continue;
      }

      // Swap the current correct option with the option at the target slot
      const newOptions = [...options];
      const temp = newOptions[targetIdx];
      newOptions[targetIdx] = newOptions[currentCorrectIdx];
      newOptions[currentCorrectIdx] = temp;

      const newCorrectLetter = letters[targetIdx];
      const newCorrectAnswers = JSON.stringify([newCorrectLetter]);
      const newOptionsJson = JSON.stringify(newOptions);

      await conn.execute(
        'UPDATE aws_questions SET options = ?, correct_answers = ? WHERE id = ?',
        [newOptionsJson, newCorrectAnswers, r.id]
      );
      updated++;
    }

    console.log(`Updated ${updated} questions for ${cert}`);

    // Verify distribution
    const [updated_rows] = await conn.execute(
      'SELECT correct_answers FROM aws_questions WHERE certification = ?',
      [cert]
    );
    const dist = { A: 0, B: 0, C: 0, D: 0 };
    for (const r of updated_rows) {
      const ans = Array.isArray(r.correct_answers) ? r.correct_answers[0] : JSON.parse(r.correct_answers)[0];
      if (dist[ans] !== undefined) dist[ans]++;
    }
    console.log(`${cert} distribution after fix:`, dist);
  }

  await conn.end();
  console.log('\nDone!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
