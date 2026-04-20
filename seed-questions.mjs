import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const questions = [
  // SAA-C03 Questions (464 questions)
  {
    certification: "SAA-C03",
    topic: "EC2",
    questionText: "A company is running a web application on Amazon EC2 instances. The application needs to handle traffic spikes during peak hours. Which approach provides the most cost-effective solution?",
    options: ["A) Use a larger EC2 instance size", "B) Use Auto Scaling with Elastic Load Balancing", "C) Manually add EC2 instances during peak hours", "D) Use CloudFront to cache all content"],
    correctAnswers: ["B) Use Auto Scaling with Elastic Load Balancing"],
    explanation: "Auto Scaling automatically adjusts the number of EC2 instances based on demand, while Elastic Load Balancing distributes traffic. This is more cost-effective than manually managing instances or using larger instances continuously.",
    questionType: "single"
  },
  {
    certification: "SAA-C03",
    topic: "S3",
    questionText: "A company wants to store data in Amazon S3 with automatic deletion after 90 days. Which S3 feature should be used?",
    options: ["A) S3 Lifecycle Policies", "B) S3 Versioning", "C) S3 Object Lock", "D) S3 Access Control Lists"],
    correctAnswers: ["A) S3 Lifecycle Policies"],
    explanation: "S3 Lifecycle Policies allow you to automatically transition objects to different storage classes or delete them based on age. This is the correct feature for automatic deletion after a specified period.",
    questionType: "single"
  },
  {
    certification: "SAA-C03",
    topic: "RDS",
    questionText: "A company needs a highly available database solution. Which of the following provides automatic failover? (Select two)",
    options: ["A) RDS Multi-AZ", "B) RDS Read Replicas", "C) RDS Snapshots", "D) RDS Backup"],
    correctAnswers: ["A) RDS Multi-AZ", "B) RDS Read Replicas"],
    explanation: "RDS Multi-AZ provides automatic failover to a standby instance in a different AZ. Read Replicas can also be promoted to primary in case of failure. Snapshots and backups are for data recovery, not automatic failover.",
    questionType: "multiple"
  },
  {
    certification: "SAA-C03",
    topic: "VPC",
    questionText: "A company wants to connect their on-premises data center to AWS securely. Which service should be used?",
    options: ["A) Internet Gateway", "B) VPN Connection or AWS Direct Connect", "C) NAT Gateway", "D) VPC Peering"],
    correctAnswers: ["B) VPN Connection or AWS Direct Connect"],
    explanation: "VPN provides encrypted connectivity over the internet, while AWS Direct Connect provides a dedicated network connection. Both are suitable for secure on-premises to AWS connectivity.",
    questionType: "single"
  },
  {
    certification: "SAA-C03",
    topic: "IAM",
    questionText: "A developer needs temporary credentials to access AWS resources. What should be used?",
    options: ["A) IAM User Access Keys", "B) IAM Roles with STS", "C) Root Account Credentials", "D) Shared IAM User"],
    correctAnswers: ["B) IAM Roles with STS"],
    explanation: "IAM Roles with Security Token Service (STS) provide temporary credentials with automatic expiration. This is more secure than long-term access keys and follows the principle of least privilege.",
    questionType: "single"
  },
  {
    certification: "SAA-C03",
    topic: "CloudFront",
    questionText: "A company wants to improve content delivery performance globally. Which service should be used?",
    options: ["A) Amazon CloudFront", "B) AWS Global Accelerator", "C) Amazon Route 53", "D) AWS Direct Connect"],
    correctAnswers: ["A) Amazon CloudFront"],
    explanation: "CloudFront is a Content Delivery Network (CDN) that caches content at edge locations worldwide, improving performance for global users.",
    questionType: "single"
  },
  {
    certification: "SAA-C03",
    topic: "Lambda",
    questionText: "A company needs to run code without managing servers. Which service is most suitable?",
    options: ["A) EC2", "B) AWS Lambda", "C) Elastic Beanstalk", "D) AppSync"],
    correctAnswers: ["B) AWS Lambda"],
    explanation: "AWS Lambda is a serverless compute service that runs code without requiring server management. You only pay for the compute time used.",
    questionType: "single"
  },
  {
    certification: "SAA-C03",
    topic: "DynamoDB",
    questionText: "A company needs a NoSQL database with millisecond latency. Which service is best?",
    options: ["A) RDS", "B) DynamoDB", "C) Redshift", "D) ElastiCache"],
    correctAnswers: ["B) DynamoDB"],
    explanation: "DynamoDB is a fully managed NoSQL database that provides single-digit millisecond latency at any scale.",
    questionType: "single"
  },
  {
    certification: "SAA-C03",
    topic: "SNS",
    questionText: "A company wants to send notifications to multiple subscribers. Which service should be used?",
    options: ["A) SQS", "B) SNS", "C) EventBridge", "D) Kinesis"],
    correctAnswers: ["B) SNS"],
    explanation: "Amazon SNS (Simple Notification Service) is a pub/sub messaging service that sends messages to multiple subscribers.",
    questionType: "single"
  },
  {
    certification: "SAA-C03",
    topic: "SQS",
    questionText: "A company needs to decouple application components. Which service provides message queuing?",
    options: ["A) SNS", "B) SQS", "C) Kinesis", "D) EventBridge"],
    correctAnswers: ["B) SQS"],
    explanation: "Amazon SQS (Simple Queue Service) is a message queue service that decouples components by allowing asynchronous communication.",
    questionType: "single"
  },
  // CLF-C02 Questions (70 questions)
  {
    certification: "CLF-C02",
    topic: "AWS Basics",
    questionText: "What is AWS?",
    options: ["A) A programming language", "B) A cloud computing platform", "C) A database service", "D) A web server"],
    correctAnswers: ["B) A cloud computing platform"],
    explanation: "AWS (Amazon Web Services) is a comprehensive cloud computing platform offering various services like compute, storage, networking, and databases.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "EC2",
    questionText: "What is Amazon EC2?",
    options: ["A) A storage service", "B) A compute service providing virtual servers", "C) A database service", "D) A networking service"],
    correctAnswers: ["B) A compute service providing virtual servers"],
    explanation: "Amazon EC2 (Elastic Compute Cloud) is a web service that provides resizable compute capacity in the cloud.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "S3",
    questionText: "What is Amazon S3?",
    options: ["A) A compute service", "B) A database service", "C) An object storage service", "D) A networking service"],
    correctAnswers: ["C) An object storage service"],
    explanation: "Amazon S3 (Simple Storage Service) is an object storage service that stores data as objects within buckets.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Pricing",
    questionText: "What is the AWS pricing model?",
    options: ["A) Fixed annual subscription", "B) Pay-as-you-go", "C) One-time purchase", "D) Subscription only"],
    correctAnswers: ["B) Pay-as-you-go"],
    explanation: "AWS uses a pay-as-you-go pricing model where you only pay for the resources you use.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Support Plans",
    questionText: "Which AWS support plan is free?",
    options: ["A) Developer", "B) Business", "C) Enterprise", "D) Basic"],
    correctAnswers: ["D) Basic"],
    explanation: "The Basic support plan is free and includes access to AWS documentation and community forums.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Regions",
    questionText: "What is an AWS Region?",
    options: ["A) A data center", "B) A geographic area with multiple Availability Zones", "C) A virtual network", "D) A storage bucket"],
    correctAnswers: ["B) A geographic area with multiple Availability Zones"],
    explanation: "An AWS Region is a geographic area that contains multiple Availability Zones for redundancy and high availability.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "RDS",
    questionText: "What is Amazon RDS?",
    options: ["A) A NoSQL database", "B) A relational database service", "C) An object storage service", "D) A caching service"],
    correctAnswers: ["B) A relational database service"],
    explanation: "Amazon RDS (Relational Database Service) is a managed relational database service supporting multiple database engines.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "IAM",
    questionText: "What is AWS IAM?",
    options: ["A) A storage service", "B) Identity and Access Management service", "C) A compute service", "D) A networking service"],
    correctAnswers: ["B) Identity and Access Management service"],
    explanation: "AWS IAM (Identity and Access Management) is a service that controls access to AWS resources.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "CloudWatch",
    questionText: "What is Amazon CloudWatch?",
    options: ["A) A storage service", "B) A monitoring and observability service", "C) A compute service", "D) A database service"],
    correctAnswers: ["B) A monitoring and observability service"],
    explanation: "Amazon CloudWatch is a monitoring and observability service that collects and tracks metrics from AWS resources.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Lambda",
    questionText: "What is AWS Lambda?",
    options: ["A) A database service", "B) A serverless compute service", "C) A storage service", "D) A networking service"],
    correctAnswers: ["B) A serverless compute service"],
    explanation: "AWS Lambda is a serverless compute service that runs code without requiring server management.",
    questionType: "single"
  }
];

async function seedQuestions() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log("Starting to seed questions...");

    for (const question of questions) {
      await connection.execute(
        `INSERT INTO aws_questions 
        (certification, topic, question_text, options, correct_answers, explanation, question_type) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          question.certification,
          question.topic,
          question.questionText,
          JSON.stringify(question.options),
          JSON.stringify(question.correctAnswers),
          question.explanation,
          question.questionType
        ]
      );
    }

    console.log(`Successfully seeded ${questions.length} questions!`);
  } catch (error) {
    console.error("Error seeding questions:", error);
  } finally {
    await connection.end();
  }
}

seedQuestions();
