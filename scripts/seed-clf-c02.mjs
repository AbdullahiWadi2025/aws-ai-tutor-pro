import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const questions = JSON.parse(readFileSync(join(__dirname, 'clf-c02-questions.json'), 'utf8'));

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    // Get current CLF-C02 question IDs
    const [existing] = await conn.execute(
      'SELECT id FROM aws_questions WHERE certification = ? ORDER BY id',
      ['CLF-C02']
    );
    console.log(`Found ${existing.length} existing CLF-C02 questions`);
    console.log(`Loading ${questions.length} new questions`);

    // Delete all existing CLF-C02 questions
    await conn.execute('DELETE FROM aws_questions WHERE certification = ?', ['CLF-C02']);
    console.log('Deleted existing CLF-C02 questions');

    // Insert new questions
    let inserted = 0;
    for (const q of questions) {
      const optionsJson = JSON.stringify(q.options);
      const correctJson = JSON.stringify(q.correctAnswers);
      await conn.execute(
        `INSERT INTO aws_questions (certification, topic, question_text, options, correct_answers, explanation, question_type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['CLF-C02', q.topic, q.questionText, optionsJson, correctJson, q.explanation, q.questionType]
      );
      inserted++;
    }

    console.log(`Inserted ${inserted} new CLF-C02 questions`);

    // Verify
    const [count] = await conn.execute(
      'SELECT topic, COUNT(*) as cnt FROM aws_questions WHERE certification = ? GROUP BY topic ORDER BY cnt DESC',
      ['CLF-C02']
    );
    console.log('Topic distribution:', JSON.stringify(count));

  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
