import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const questions = JSON.parse(readFileSync(join(__dirname, 'saa-c03-expansion.json'), 'utf8'));

// Shuffle options so correct answers are distributed across A/B/C/D
function shuffleOptions(question) {
  const letters = ['A', 'B', 'C', 'D'];
  const correctIndex = letters.indexOf(question.correctAnswer);
  const correctText = question.options[correctIndex];

  // Fisher-Yates shuffle
  const shuffled = [...question.options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const newCorrectIndex = shuffled.indexOf(correctText);
  return {
    options: shuffled,
    correctAnswer: letters[newCorrectIndex]
  };
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  let inserted = 0;
  const distribution = { A: 0, B: 0, C: 0, D: 0 };

  for (const q of questions) {
    const { options, correctAnswer } = shuffleOptions(q);
    distribution[correctAnswer]++;

    await conn.execute(
      `INSERT INTO aws_questions (certification, topic, question_text, options, correct_answers, explanation)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'SAA-C03',
        q.topic,
        q.questionText,
        JSON.stringify(options),
        JSON.stringify([correctAnswer]),
        q.explanation
      ]
    );
    inserted++;
  }

  console.log(`Inserted ${inserted} new SAA-C03 questions`);
  console.log('Answer distribution:', distribution);

  // Show final topic distribution
  const [rows] = await conn.execute(
    "SELECT topic, COUNT(*) as cnt FROM aws_questions WHERE certification = 'SAA-C03' GROUP BY topic ORDER BY topic"
  );
  console.log('\nFinal SAA-C03 topic distribution:');
  console.table(rows);

  const [total] = await conn.execute("SELECT COUNT(*) as total FROM aws_questions WHERE certification = 'SAA-C03'");
  console.log('Total SAA-C03 questions:', total[0].total);

  await conn.end();
}

main().catch(console.error);
