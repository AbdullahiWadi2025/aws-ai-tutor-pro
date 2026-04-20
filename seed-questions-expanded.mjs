import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const questions = [
  // SAA-C03 Questions (Real AWS Exam Style)
  {
    certification: 'SAA-C03',
    topic: 'Networking',
    question_text: 'A company needs to establish a secure, dedicated network connection between their on-premises data center and AWS. Which service should they use?',
    options: ['AWS Direct Connect', 'VPN Connection', 'NAT Gateway', 'Internet Gateway'],
    correct_answers: ['AWS Direct Connect'],
    explanation: 'AWS Direct Connect provides a dedicated network connection from your premises to AWS, offering consistent network performance and lower latency compared to VPN connections.',
    question_type: 'single'
  },
  {
    certification: 'SAA-C03',
    topic: 'Security',
    question_text: 'Which of the following are valid ways to secure data in transit in AWS? (Select TWO)',
    options: ['SSL/TLS encryption', 'VPC encryption', 'AWS KMS', 'S3 encryption'],
    correct_answers: ['SSL/TLS encryption', 'AWS KMS'],
    explanation: 'SSL/TLS encryption and AWS KMS are both valid methods for securing data in transit. VPC encryption and S3 encryption are for data at rest.',
    question_type: 'multiple'
  },
  {
    certification: 'SAA-C03',
    topic: 'Compute',
    question_text: 'A company wants to run a containerized application that requires auto-scaling based on CPU utilization. Which service combination should they use?',
    options: ['EC2 + Auto Scaling Groups', 'ECS + Auto Scaling', 'Lambda + CloudWatch', 'Elastic Beanstalk'],
    correct_answers: ['ECS + Auto Scaling'],
    explanation: 'ECS (Elastic Container Service) combined with Auto Scaling provides the best solution for containerized applications with auto-scaling capabilities based on metrics like CPU utilization.',
    question_type: 'single'
  },
  {
    certification: 'SAA-C03',
    topic: 'Storage',
    question_text: 'Which S3 storage class is best for data that is accessed frequently but requires cost optimization?',
    options: ['S3 Standard', 'S3 Intelligent-Tiering', 'S3 Glacier', 'S3 One Zone-IA'],
    correct_answers: ['S3 Intelligent-Tiering'],
    explanation: 'S3 Intelligent-Tiering automatically moves objects between access tiers based on changing access patterns, optimizing costs for frequently accessed data.',
    question_type: 'single'
  },
  {
    certification: 'SAA-C03',
    topic: 'Database',
    question_text: 'A startup needs a database that can scale horizontally and handle unstructured data. Which AWS service is most suitable?',
    options: ['Amazon RDS', 'Amazon DynamoDB', 'Amazon Redshift', 'Amazon Neptune'],
    correct_answers: ['Amazon DynamoDB'],
    explanation: 'DynamoDB is a NoSQL database that scales horizontally and is designed for unstructured data with flexible schemas.',
    question_type: 'single'
  },
  {
    certification: 'SAA-C03',
    topic: 'Networking',
    question_text: 'Which of the following are benefits of using a VPC? (Select TWO)',
    options: ['Complete control over IP addressing', 'Automatic backup of data', 'Reduced latency', 'Enhanced security through network isolation'],
    correct_answers: ['Complete control over IP addressing', 'Enhanced security through network isolation'],
    explanation: 'VPCs provide complete control over IP addressing and enhanced security through network isolation. Automatic backups and reduced latency are not inherent VPC benefits.',
    question_type: 'multiple'
  },
  {
    certification: 'SAA-C03',
    topic: 'Monitoring',
    question_text: 'A company wants to monitor application performance metrics and set up alarms. Which service should they use?',
    options: ['CloudTrail', 'CloudWatch', 'Config', 'VPC Flow Logs'],
    correct_answers: ['CloudWatch'],
    explanation: 'CloudWatch is used for monitoring metrics and setting up alarms. CloudTrail is for API logging, Config for compliance, and VPC Flow Logs for network traffic.',
    question_type: 'single'
  },
  {
    certification: 'SAA-C03',
    topic: 'High Availability',
    question_text: 'To ensure high availability for an RDS database, which feature should be enabled?',
    options: ['Read Replicas', 'Multi-AZ deployment', 'Automated backups', 'Enhanced monitoring'],
    correct_answers: ['Multi-AZ deployment'],
    explanation: 'Multi-AZ deployment provides high availability by automatically failing over to a standby instance in another AZ if the primary fails.',
    question_type: 'single'
  },
  {
    certification: 'SAA-C03',
    topic: 'Cost Optimization',
    question_text: 'Which of the following can help reduce EC2 costs? (Select TWO)',
    options: ['Reserved Instances', 'Spot Instances', 'Dedicated Hosts', 'Enhanced networking'],
    correct_answers: ['Reserved Instances', 'Spot Instances'],
    explanation: 'Reserved Instances and Spot Instances both offer cost savings. Dedicated Hosts are for licensing compliance, not cost reduction.',
    question_type: 'multiple'
  },
  {
    certification: 'SAA-C03',
    topic: 'Application Integration',
    question_text: 'A company needs to decouple application components. Which service should they use?',
    options: ['SNS', 'SQS', 'EventBridge', 'API Gateway'],
    correct_answers: ['SQS'],
    explanation: 'SQS (Simple Queue Service) is used for decoupling application components by providing message queuing capabilities.',
    question_type: 'single'
  },
  // CLF-C02 Questions (Real AWS Exam Style)
  {
    certification: 'CLF-C02',
    topic: 'AWS Basics',
    question_text: 'What is the AWS Global Infrastructure primarily composed of?',
    options: ['Regions and Availability Zones', 'Data centers only', 'Edge locations only', 'VPCs'],
    correct_answers: ['Regions and Availability Zones'],
    explanation: 'The AWS Global Infrastructure consists of Regions (geographic areas) and Availability Zones (isolated data centers within regions).',
    question_type: 'single'
  },
  {
    certification: 'CLF-C02',
    topic: 'Pricing',
    question_text: 'Which pricing model allows you to pay only for the compute capacity you use?',
    options: ['On-Demand', 'Reserved Instances', 'Savings Plans', 'Dedicated Hosts'],
    correct_answers: ['On-Demand'],
    explanation: 'On-Demand pricing allows you to pay for compute capacity by the hour or second with no long-term commitments.',
    question_type: 'single'
  },
  {
    certification: 'CLF-C02',
    topic: 'Services',
    question_text: 'Which AWS service is used for hosting static websites?',
    options: ['EC2', 'S3', 'Lambda', 'RDS'],
    correct_answers: ['S3'],
    explanation: 'Amazon S3 can host static websites with HTML, CSS, and JavaScript files.',
    question_type: 'single'
  },
  {
    certification: 'CLF-C02',
    topic: 'Security',
    question_text: 'What is IAM used for in AWS?',
    options: ['Managing user access and permissions', 'Storing data', 'Running applications', 'Monitoring performance'],
    correct_answers: ['Managing user access and permissions'],
    explanation: 'IAM (Identity and Access Management) is used to manage user access and permissions to AWS resources.',
    question_type: 'single'
  },
  {
    certification: 'CLF-C02',
    topic: 'Support',
    question_text: 'Which AWS Support plan includes access to all AWS Trusted Advisor checks?',
    options: ['Basic', 'Developer', 'Business', 'Enterprise'],
    correct_answers: ['Business'],
    explanation: 'The Business and Enterprise support plans include access to all AWS Trusted Advisor checks.',
    question_type: 'single'
  },
  {
    certification: 'CLF-C02',
    topic: 'Compliance',
    question_text: 'Which service helps organizations track compliance with AWS best practices?',
    options: ['CloudTrail', 'AWS Config', 'CloudWatch', 'IAM'],
    correct_answers: ['AWS Config'],
    explanation: 'AWS Config helps track resource configurations and compliance with AWS best practices.',
    question_type: 'single'
  },
  {
    certification: 'CLF-C02',
    topic: 'Networking',
    question_text: 'What is the purpose of a VPC?',
    options: ['To provide a virtual private network in the cloud', 'To store data', 'To run applications', 'To monitor resources'],
    correct_answers: ['To provide a virtual private network in the cloud'],
    explanation: 'A VPC (Virtual Private Cloud) provides an isolated virtual network environment in AWS.',
    question_type: 'single'
  },
  {
    certification: 'CLF-C02',
    topic: 'Storage',
    question_text: 'Which AWS storage service is best for archival data?',
    options: ['S3 Standard', 'EBS', 'Glacier', 'EFS'],
    correct_answers: ['Glacier'],
    explanation: 'Amazon Glacier is designed for long-term archival storage with low cost and infrequent access.',
    question_type: 'single'
  },
  {
    certification: 'CLF-C02',
    topic: 'Database',
    question_text: 'What type of database is DynamoDB?',
    options: ['Relational', 'NoSQL', 'Graph', 'Time-series'],
    correct_answers: ['NoSQL'],
    explanation: 'DynamoDB is a fully managed NoSQL database service.',
    question_type: 'single'
  },
  {
    certification: 'CLF-C02',
    topic: 'Compute',
    question_text: 'Which AWS service allows you to run code without provisioning servers?',
    options: ['EC2', 'Lambda', 'RDS', 'S3'],
    correct_answers: ['Lambda'],
    explanation: 'AWS Lambda allows you to run code without provisioning or managing servers.',
    question_type: 'single'
  }
];

async function seedQuestions() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'aws_tutor',
  });

  try {
    for (const question of questions) {
      const query = `
        INSERT INTO aws_questions 
        (certification, topic, question_text, options, correct_answers, explanation, question_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      await connection.execute(query, [
        question.certification,
        question.topic,
        question.question_text,
        JSON.stringify(question.options),
        JSON.stringify(question.correct_answers),
        question.explanation,
        question.question_type
      ]);
    }
    
    console.log(`Successfully seeded ${questions.length} questions!`);
  } catch (error) {
    console.error('Error seeding questions:', error);
  } finally {
    await connection.end();
  }
}

seedQuestions();
