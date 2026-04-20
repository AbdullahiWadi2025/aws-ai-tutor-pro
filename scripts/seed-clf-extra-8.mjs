import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const questions = [
  {
    "certification": "CLF-C02",
    "topic": "Cloud Concepts",
    "question_text": "A startup is evaluating whether to move their on-premises data center to AWS. Their CTO wants to understand the economic model differences. Which statement BEST describes the difference between capital expenditure (CapEx) and operational expenditure (OpEx) in the context of cloud computing?\n\nA) CapEx involves paying for resources as you use them; OpEx involves large upfront investments in hardware\nB) CapEx involves large upfront investments in physical infrastructure; OpEx involves paying for resources as you consume them on a recurring basis\nC) CapEx and OpEx are identical in cloud computing because AWS charges monthly\nD) OpEx is always more expensive than CapEx over a 5-year period",
    "options": [
      "CapEx involves paying for resources as you use them; OpEx involves large upfront investments in hardware",
      "CapEx involves large upfront investments in physical infrastructure; OpEx involves paying for resources as you consume them on a recurring basis",
      "CapEx and OpEx are identical in cloud computing because AWS charges monthly",
      "OpEx is always more expensive than CapEx over a 5-year period"
    ],
    "correct_answers": [
      "CapEx involves large upfront investments in physical infrastructure; OpEx involves paying for resources as you consume them on a recurring basis"
    ],
    "explanation": "Traditional on-premises IT requires large capital expenditures (CapEx) \u2014 upfront purchases of servers, networking equipment, and data center space. Cloud computing shifts this to operational expenditure (OpEx) \u2014 you pay only for what you consume on a recurring basis (monthly/hourly), with no upfront hardware costs. This shift improves cash flow and allows organizations to scale costs with business needs.",
    "question_type": "single"
  },
  {
    "certification": "CLF-C02",
    "topic": "Security and Compliance",
    "question_text": "A financial services company is migrating to AWS and their compliance team needs to understand data residency requirements. They must ensure customer data never leaves the European Union. Which AWS feature DIRECTLY addresses this requirement?\n\nA) AWS CloudTrail logs all API calls globally\nB) AWS Regions allow you to choose specific geographic locations where your data is stored and processed\nC) AWS Edge Locations cache data closer to users worldwide\nD) AWS Availability Zones automatically replicate data across continents",
    "options": [
      "AWS CloudTrail logs all API calls globally",
      "AWS Regions allow you to choose specific geographic locations where your data is stored and processed",
      "AWS Edge Locations cache data closer to users worldwide",
      "AWS Availability Zones automatically replicate data across continents"
    ],
    "correct_answers": [
      "AWS Regions allow you to choose specific geographic locations where your data is stored and processed"
    ],
    "explanation": "AWS Regions are distinct geographic areas (e.g., eu-west-1 in Ireland, eu-central-1 in Frankfurt). When you deploy resources to an EU Region, your data stays within that Region unless you explicitly choose to move it. This directly satisfies data residency and sovereignty requirements. AWS does NOT automatically replicate data across Regions \u2014 you control where your data lives.",
    "question_type": "single"
  },
  {
    "certification": "CLF-C02",
    "topic": "AWS Services",
    "question_text": "A retail company wants to send promotional emails to 2 million customers when a new product launches. They need a reliable, cost-effective service that handles email delivery, bounce management, and unsubscribe tracking. Which AWS service is MOST appropriate?\n\nA) Amazon SNS (Simple Notification Service)\nB) Amazon SQS (Simple Queue Service)\nC) Amazon SES (Simple Email Service)\nD) Amazon Pinpoint",
    "options": [
      "Amazon SNS (Simple Notification Service)",
      "Amazon SQS (Simple Queue Service)",
      "Amazon SES (Simple Email Service)",
      "Amazon Pinpoint"
    ],
    "correct_answers": [
      "Amazon SES (Simple Email Service)"
    ],
    "explanation": "Amazon SES (Simple Email Service) is specifically designed for high-volume transactional and marketing email sending. It handles bounce management, complaint tracking, and unsubscribe processing. SES is extremely cost-effective at scale ($0.10 per 1,000 emails). SNS is for push notifications and pub/sub messaging (not email marketing). SQS is a message queue. Amazon Pinpoint is a broader multi-channel marketing platform but SES is the most direct and cost-effective choice for bulk email.",
    "question_type": "single"
  },
  {
    "certification": "CLF-C02",
    "topic": "Billing and Pricing",
    "question_text": "A company's AWS bill increased significantly last month. The cloud administrator suspects unused resources are running in multiple regions. Which AWS tool provides the MOST comprehensive view of cost and usage data, allowing them to filter by service, region, and time period to identify cost drivers?\n\nA) AWS Trusted Advisor\nB) AWS Cost Explorer\nC) AWS Budgets\nD) AWS Pricing Calculator",
    "options": [
      "AWS Trusted Advisor",
      "AWS Cost Explorer",
      "AWS Budgets",
      "AWS Pricing Calculator"
    ],
    "correct_answers": [
      "AWS Cost Explorer"
    ],
    "explanation": "AWS Cost Explorer provides rich visualizations and filtering of historical cost and usage data. You can filter by service, region, account, tag, and time period to identify exactly what is driving costs. AWS Trusted Advisor provides recommendations but not detailed cost breakdowns. AWS Budgets sets alerts for future spending thresholds. AWS Pricing Calculator estimates future costs for planned architectures \u2014 it does not show historical actual costs.",
    "question_type": "single"
  },
  {
    "certification": "CLF-C02",
    "topic": "Cloud Concepts",
    "question_text": "A company is designing a new application on AWS and wants to ensure it remains available even if an entire data center loses power. The solutions architect recommends deploying across multiple Availability Zones. Which statement BEST describes AWS Availability Zones?\n\nA) Availability Zones are separate AWS accounts used for disaster recovery\nB) Availability Zones are geographically distant regions like US-East and EU-West\nC) Availability Zones are one or more discrete data centers within a Region, each with redundant power, networking, and connectivity, physically separated from each other\nD) Availability Zones are edge locations used by CloudFront for content delivery",
    "options": [
      "Availability Zones are separate AWS accounts used for disaster recovery",
      "Availability Zones are geographically distant regions like US-East and EU-West",
      "Availability Zones are one or more discrete data centers within a Region, each with redundant power, networking, and connectivity, physically separated from each other",
      "Availability Zones are edge locations used by CloudFront for content delivery"
    ],
    "correct_answers": [
      "Availability Zones are one or more discrete data centers within a Region, each with redundant power, networking, and connectivity, physically separated from each other"
    ],
    "explanation": "Availability Zones (AZs) are physically separate data centers within a single AWS Region. They have independent power, cooling, and networking, and are connected via low-latency, high-bandwidth links. Deploying across multiple AZs protects against data center-level failures. Each Region has at least 3 AZs. They are NOT separate accounts, not separate Regions, and not CloudFront edge locations.",
    "question_type": "single"
  },
  {
    "certification": "CLF-C02",
    "topic": "Security and Compliance",
    "question_text": "A company's security team is reviewing their AWS environment and wants to ensure that all S3 buckets are private, no security groups allow unrestricted SSH access (port 22 open to 0.0.0.0/0), and MFA is enabled for root accounts. Which AWS service can automatically check for these security best practices and provide recommendations?\n\nA) Amazon Inspector\nB) AWS Config\nC) AWS Trusted Advisor\nD) Amazon GuardDuty",
    "options": [
      "Amazon Inspector",
      "AWS Config",
      "AWS Trusted Advisor",
      "Amazon GuardDuty"
    ],
    "correct_answers": [
      "AWS Trusted Advisor"
    ],
    "explanation": "AWS Trusted Advisor automatically inspects your AWS environment and provides recommendations across five categories: Cost Optimization, Performance, Security, Fault Tolerance, and Service Limits. It specifically checks for open security groups (port 22/3389 to 0.0.0.0/0), public S3 buckets, and missing MFA on root accounts. Amazon Inspector scans EC2 instances and container images for vulnerabilities. AWS Config tracks resource configuration changes over time. Amazon GuardDuty detects threats and malicious activity through log analysis.",
    "question_type": "single"
  },
  {
    "certification": "CLF-C02",
    "topic": "AWS Services",
    "question_text": "A development team is building a serverless web application. They need a fully managed NoSQL database that can handle millions of requests per second with single-digit millisecond latency, automatically scales capacity, and requires no database administration. Which AWS service BEST meets these requirements?\n\nA) Amazon RDS (Relational Database Service)\nB) Amazon Redshift\nC) Amazon DynamoDB\nD) Amazon ElastiCache",
    "options": [
      "Amazon RDS (Relational Database Service)",
      "Amazon Redshift",
      "Amazon DynamoDB",
      "Amazon ElastiCache"
    ],
    "correct_answers": [
      "Amazon DynamoDB"
    ],
    "explanation": "Amazon DynamoDB is a fully managed, serverless NoSQL key-value and document database designed for high-performance applications. It automatically scales to handle any amount of traffic, delivers single-digit millisecond performance, and requires zero database administration (no patching, backups, or capacity planning). Amazon RDS is a managed relational (SQL) database \u2014 it requires instance sizing and management. Amazon Redshift is a data warehouse for analytics. Amazon ElastiCache is an in-memory caching layer, not a primary database.",
    "question_type": "single"
  },
  {
    "certification": "CLF-C02",
    "topic": "Shared Responsibility Model",
    "question_text": "A company is running a web application on Amazon EC2 instances. A security audit reveals that the operating system on the EC2 instances has not been patched in 8 months and has known vulnerabilities. Under the AWS Shared Responsibility Model, who is responsible for patching the EC2 operating system?\n\nA) AWS is responsible because they manage the EC2 service\nB) The customer is responsible because patching the guest OS on EC2 instances is a customer responsibility\nC) Both AWS and the customer share equal responsibility for OS patching\nD) AWS patches the OS automatically through AWS Systems Manager",
    "options": [
      "AWS is responsible because they manage the EC2 service",
      "The customer is responsible because patching the guest OS on EC2 instances is a customer responsibility",
      "Both AWS and the customer share equal responsibility for OS patching",
      "AWS patches the OS automatically through AWS Systems Manager"
    ],
    "correct_answers": [
      "The customer is responsible because patching the guest OS on EC2 instances is a customer responsibility"
    ],
    "explanation": "Under the AWS Shared Responsibility Model, AWS is responsible for 'security OF the cloud' \u2014 the physical infrastructure, hypervisor, and underlying hardware. The customer is responsible for 'security IN the cloud' \u2014 including the guest operating system, application software, and data on EC2 instances. This means customers must apply OS patches, configure firewalls, and manage their applications. AWS Systems Manager Patch Manager can automate patching, but it is a tool the customer must configure and use \u2014 AWS does not automatically patch customer EC2 instances.",
    "question_type": "single"
  }
];

(async () => {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  console.log('Adding 8 more hard CLF-C02 questions...');
  for (const q of questions) {
    await conn.execute(
      `INSERT INTO aws_questions (certification, topic, question_text, options, correct_answers, explanation, question_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [q.certification, q.topic, q.question_text, JSON.stringify(q.options), JSON.stringify(q.correct_answers), q.explanation, q.question_type]
    );
  }
  const [[{ count }]] = await conn.execute("SELECT COUNT(*) as count FROM aws_questions WHERE certification = 'CLF-C02'");
  console.log('CLF-C02 total:', count);
  await conn.end();
  console.log('Done!');
})().catch(console.error);
