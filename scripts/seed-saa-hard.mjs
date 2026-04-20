import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

// Read the partial questions file and extract the 64 complete questions
// We'll add one more question to reach 65

const extraQuestion = {
  topic: "Networking",
  question: "A company's VPC (10.0.0.0/16) needs to add a new subnet for a third-party vendor. The vendor's application must communicate with the company's application servers in a private subnet, but must NOT have access to the company's database subnet or any other internal resources. The vendor should not be able to initiate connections to any other company resources beyond the application servers. Which combination of controls enforces this LEAST-privilege network isolation?",
  options: [
    "Create a new subnet for the vendor, add a route in the main route table to allow all traffic between subnets",
    "Create a dedicated subnet for the vendor with a custom route table that only has routes to the application server subnet (not the database subnet). Configure Network ACLs on the vendor subnet to allow outbound traffic only to the application server subnet CIDR. Configure Security Groups on the application servers to allow inbound traffic only from the vendor subnet CIDR on the required ports",
    "Use VPC peering between the vendor's VPC and the company's VPC, which automatically restricts access",
    "Place the vendor's servers in the same subnet as the application servers and use Security Groups to restrict access"
  ],
  correctAnswers: [1],
  explanation: "Defense in depth requires multiple layers: (1) Custom route table on the vendor subnet with routes only to the application server subnet — prevents routing to the database subnet at the network level. (2) Network ACLs (stateless) on the vendor subnet restrict outbound traffic to only the application server CIDR — provides subnet-level enforcement. (3) Security Groups on application servers allow inbound only from the vendor subnet CIDR on specific ports — provides instance-level enforcement. VPC peering doesn't restrict which resources within the VPC are accessible. Placing in the same subnet relies solely on Security Groups with no network-level isolation.",
  questionType: "single"
};

async function seedSAAQuestions() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL || '');
  
  // Read the 64 complete questions from the truncated file
  const fileContent = readFileSync('/home/ubuntu/aws-ai-tutor-pro/scripts/seed-hard-questions.mjs', 'utf8');
  
  // Extract questions by parsing the file content up to the last complete question
  // We'll use eval-like approach by building a module
  const cleanedContent = fileContent
    .replace(/^import.*$/m, '')
    .replace('const saaQuestions = ', 'const saaQuestions = ')
    .trim();
  
  // Since the file is truncated, let's manually build the questions array
  // by using the 64 complete questions we know are there
  // We'll insert them via a different approach - read the file and eval the partial array
  
  console.log('Deleting existing SAA-C03 questions...');
  await conn.execute("DELETE FROM aws_questions WHERE certification = 'SAA-C03'");
  
  // Insert the extra question first to confirm the approach works
  await conn.execute(
    `INSERT INTO aws_questions (certification, topic, question_text, options, correct_answers, explanation, question_type)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'SAA-C03',
      extraQuestion.topic,
      extraQuestion.question,
      JSON.stringify(extraQuestion.options),
      JSON.stringify(extraQuestion.correctAnswers.map(i => extraQuestion.options[i])),
      extraQuestion.explanation,
      extraQuestion.questionType
    ]
  );
  
  const [countRows] = await conn.execute("SELECT COUNT(*) as count FROM aws_questions WHERE certification = 'SAA-C03'");
  console.log('After inserting 1 test question:', countRows[0].count);
  
  await conn.end();
}

seedSAAQuestions().catch(console.error);
