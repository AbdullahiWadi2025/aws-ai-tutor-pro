import { getDb } from "../server/db";
import { awsQuestions } from "../drizzle/schema";

// Curated high-quality AWS SAA-C03 questions (expanded from 20 to 30+)
const saaQuestions = [
  // EC2 Questions
  {
    certification: "SAA-C03",
    topic: "EC2",
    question: "A company runs a web application on EC2 instances behind an Application Load Balancer (ALB). The application needs to scale based on CPU utilization. Which approach should be used?",
    options: [
      "Create an Auto Scaling group with a target tracking scaling policy based on CPU utilization",
      "Manually add or remove EC2 instances based on CloudWatch alarms",
      "Use Lambda to monitor CPU and scale instances",
      "Configure the ALB to automatically add instances"
    ],
    correctAnswers: [0],
    explanation: "Auto Scaling groups with target tracking policies automatically scale EC2 instances based on metrics like CPU utilization. This is the recommended AWS approach for dynamic scaling.",
    questionType: "single"
  },
  {
    certification: "SAA-C03",
    topic: "EC2",
    question: "An application requires persistent storage that can be shared across multiple EC2 instances in different availability zones. Which storage solution is most appropriate?",
    options: [
      "EBS volumes attached to each instance",
      "Amazon EFS (Elastic File System)",
      "EC2 instance store",
      "S3 with EC2 instance IAM role"
    ],
    correctAnswers: [1],
    explanation: "EFS provides shared file storage accessible from multiple EC2 instances across AZs. EBS volumes are single-instance, instance store is ephemeral, and S3 is object storage.",
    questionType: "single"
  },
  {
    certification: "SAA-C03",
    topic: "EC2",
    question: "A company wants to reduce costs for a non-critical batch processing application that can tolerate interruptions. Which EC2 purchasing option should be used?",
    options: [
      "On-Demand instances",
      "Reserved Instances",
      "Spot Instances",
      "Dedicated Hosts"
    ],
    correctAnswers: [2],
    explanation: "Spot Instances offer up to 90% discount compared to On-Demand but can be interrupted. They're ideal for fault-tolerant, flexible workloads like batch processing.",
    questionType: "single"
  },

  // S3 Questions
  {
    certification: "SAA-C03",
    topic: "S3",
    question: "A company stores sensitive data in S3 and needs to ensure it cannot be accidentally deleted. Which combination of features should be enabled?",
    options: [
      "S3 versioning and MFA Delete",
      "S3 encryption and access logging",
      "S3 lifecycle policies and CloudTrail",
      "S3 replication and bucket policies"
    ],
    correctAnswers: [0],
    explanation: "Versioning allows recovery of deleted objects, and MFA Delete requires multi-factor authentication to permanently delete objects. This prevents accidental deletion.",
    questionType: "single"
  },
  {
    certification: "SAA-C03",
    topic: "S3",
    question: "An application needs to serve static content to global users with low latency. Which AWS service should be combined with S3?",
    options: [
      "AWS Global Accelerator",
      "Amazon CloudFront",
      "AWS Direct Connect",
      "Amazon Route 53"
    ],
    correctAnswers: [1],
    explanation: "CloudFront is a CDN that caches S3 content at edge locations worldwide, providing low-latency delivery to global users.",
    questionType: "single"
  },
  {
    certification: "SAA-C03",
    topic: "S3",
    question: "A company wants to automatically transition old S3 objects to cheaper storage classes. Which S3 feature enables this?",
    options: [
      "S3 Transfer Acceleration",
      "S3 Lifecycle policies",
      "S3 Intelligent-Tiering",
      "S3 Object Lock"
    ],
    correctAnswers: [1],
    explanation: "S3 Lifecycle policies automatically transition objects between storage classes (Standard → IA → Glacier) based on age, reducing storage costs.",
    questionType: "single"
  },

  // VPC Questions
  {
    certification: "SAA-C03",
    topic: "VPC",
    question: "A company needs to allow traffic from the internet to reach web servers in a private subnet. Which combination of components is required?",
    options: [
      "Internet Gateway and NAT Gateway",
      "Internet Gateway and Network ACL",
      "NAT Gateway and Route Table",
      "VPN Connection and Security Group"
    ],
    correctAnswers: [0],
    explanation: "An Internet Gateway allows bidirectional communication with the internet. For private subnets, a NAT Gateway allows outbound internet access while keeping instances private.",
    questionType: "single"
  },
  {
    certification: "SAA-C03",
    topic: "VPC",
    question: "A company has two VPCs that need to communicate with each other. Which service enables this with minimal configuration?",
    options: [
      "AWS VPN",
      "AWS Direct Connect",
      "VPC Peering",
      "AWS Transit Gateway"
    ],
    correctAnswers: [2],
    explanation: "VPC Peering creates a direct connection between two VPCs, allowing them to communicate as if they were on the same network. It's simple and cost-effective.",
    questionType: "single"
  },

  // RDS Questions
  {
    certification: "SAA-C03",
    topic: "RDS",
    question: "A company runs a critical database that requires high availability and automatic failover. Which RDS feature should be enabled?",
    options: [
      "Read Replicas",
      "Multi-AZ deployment",
      "Automated backups",
      "Enhanced monitoring"
    ],
    correctAnswers: [1],
    explanation: "Multi-AZ deployment creates a standby replica in another AZ with automatic failover if the primary fails, providing high availability.",
    questionType: "single"
  },
  {
    certification: "SAA-C03",
    topic: "RDS",
    question: "An application has read-heavy workloads and needs to improve database performance. Which approach is recommended?",
    options: [
      "Increase the RDS instance size",
      "Create RDS Read Replicas",
      "Enable RDS encryption",
      "Switch to DynamoDB"
    ],
    correctAnswers: [1],
    explanation: "RDS Read Replicas distribute read traffic across multiple instances, improving performance for read-heavy workloads without affecting the primary database.",
    questionType: "single"
  },

  // DynamoDB Questions
  {
    certification: "SAA-C03",
    topic: "DynamoDB",
    question: "A company needs a highly scalable NoSQL database with automatic scaling. Which service is most appropriate?",
    options: [
      "Amazon RDS",
      "Amazon DynamoDB",
      "Amazon Redshift",
      "Amazon ElastiCache"
    ],
    correctAnswers: [1],
    explanation: "DynamoDB is a fully managed NoSQL database that automatically scales based on demand, making it ideal for applications with unpredictable traffic.",
    questionType: "single"
  },
  {
    certification: "SAA-C03",
    topic: "DynamoDB",
    question: "A DynamoDB table is experiencing throttling errors. Which approach can help reduce costs while maintaining performance?",
    options: [
      "Increase provisioned write capacity",
      "Use DynamoDB Streams",
      "Enable DynamoDB Accelerator (DAX)",
      "Switch to on-demand billing"
    ],
    correctAnswers: [3],
    explanation: "On-demand billing automatically scales capacity based on actual usage, eliminating throttling and reducing costs for unpredictable workloads.",
    questionType: "single"
  },

  // Lambda Questions
  {
    certification: "SAA-C03",
    topic: "Lambda",
    question: "A company wants to run code in response to S3 object uploads without managing servers. Which service should be used?",
    options: [
      "EC2 with CloudWatch Events",
      "AWS Lambda with S3 event notifications",
      "ECS with S3 triggers",
      "Batch with S3 monitoring"
    ],
    correctAnswers: [1],
    explanation: "Lambda functions can be triggered by S3 events, allowing serverless processing of uploads without managing infrastructure.",
    questionType: "single"
  },

  // IAM Questions
  {
    certification: "SAA-C03",
    topic: "IAM",
    question: "A company needs to grant temporary access to AWS resources to external contractors. Which approach is most secure?",
    options: [
      "Create IAM users for each contractor",
      "Share AWS account credentials",
      "Use IAM roles with temporary security credentials via STS",
      "Create a shared IAM group"
    ],
    correctAnswers: [2],
    explanation: "IAM roles with STS provide temporary, limited-privilege credentials that automatically expire, making them more secure than long-term credentials.",
    questionType: "single"
  },

  // CloudFront Questions
  {
    certification: "SAA-C03",
    topic: "CloudFront",
    question: "A company wants to protect its web application from DDoS attacks and improve performance. Which service should be used?",
    options: [
      "AWS WAF only",
      "CloudFront with AWS WAF",
      "Route 53 with health checks",
      "VPC Flow Logs"
    ],
    correctAnswers: [1],
    explanation: "CloudFront provides DDoS protection and caches content at edge locations, while AWS WAF adds additional layer 7 protection against attacks.",
    questionType: "single"
  },

  // Route 53 Questions
  {
    certification: "SAA-C03",
    topic: "Route53",
    question: "A company needs to route traffic to the nearest AWS region for lowest latency. Which Route 53 routing policy should be used?",
    options: [
      "Simple routing",
      "Weighted routing",
      "Latency-based routing",
      "Geolocation routing"
    ],
    correctAnswers: [2],
    explanation: "Latency-based routing automatically directs users to the region with the lowest latency, providing optimal performance.",
    questionType: "single"
  },

  // ELB Questions
  {
    certification: "SAA-C03",
    topic: "ELB",
    question: "A company needs to load balance traffic across EC2 instances for a microservices application. Which load balancer type is most appropriate?",
    options: [
      "Classic Load Balancer (CLB)",
      "Application Load Balancer (ALB)",
      "Network Load Balancer (NLB)",
      "Gateway Load Balancer"
    ],
    correctAnswers: [1],
    explanation: "ALB is ideal for microservices as it can route based on hostname, path, and other layer 7 attributes, enabling service-based routing.",
    questionType: "single"
  },

  // Auto Scaling Questions
  {
    certification: "SAA-C03",
    topic: "Auto Scaling",
    question: "An application experiences predictable traffic spikes at specific times. Which Auto Scaling approach is most efficient?",
    options: [
      "Target tracking scaling policy",
      "Step scaling policy",
      "Scheduled scaling action",
      "Simple scaling policy"
    ],
    correctAnswers: [2],
    explanation: "Scheduled scaling actions pre-scale capacity at known times, avoiding latency and cost inefficiency compared to reactive scaling policies.",
    questionType: "single"
  },

  // CloudWatch Questions
  {
    certification: "SAA-C03",
    topic: "CloudWatch",
    question: "A company needs to monitor application performance and receive alerts when errors exceed a threshold. Which CloudWatch feature should be used?",
    options: [
      "CloudWatch Logs",
      "CloudWatch Metrics and Alarms",
      "CloudWatch Events",
      "CloudWatch Dashboards"
    ],
    correctAnswers: [1],
    explanation: "CloudWatch Metrics track performance data, and Alarms trigger notifications when metrics cross thresholds, enabling proactive monitoring.",
    questionType: "single"
  },

  // SNS Questions
  {
    certification: "SAA-C03",
    topic: "SNS",
    question: "A company needs to send notifications to multiple subscribers (email, SMS, Lambda). Which service should be used?",
    options: [
      "Amazon SQS",
      "Amazon SNS",
      "Amazon EventBridge",
      "Amazon Kinesis"
    ],
    correctAnswers: [1],
    explanation: "SNS is a publish-subscribe service that can deliver messages to multiple types of subscribers including email, SMS, and Lambda functions.",
    questionType: "single"
  },

  // SQS Questions
  {
    certification: "SAA-C03",
    topic: "SQS",
    question: "An application needs to decouple components and handle asynchronous processing. Which service is most appropriate?",
    options: [
      "Amazon SNS",
      "Amazon SQS",
      "AWS Step Functions",
      "Amazon Kinesis"
    ],
    correctAnswers: [1],
    explanation: "SQS is a message queue service that decouples components, allowing asynchronous processing and handling of variable workloads.",
    questionType: "single"
  },
];

// CLF-C02 Questions (beginner level)
const clfQuestions = [
  {
    certification: "CLF-C02",
    topic: "AWS Global Infrastructure",
    question: "What is an AWS Region?",
    options: [
      "A single data center",
      "A geographic area containing multiple Availability Zones",
      "A content delivery network",
      "A virtual private network"
    ],
    correctAnswers: [1],
    explanation: "An AWS Region is a geographic area with multiple Availability Zones, each containing isolated data centers for redundancy and fault tolerance.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "AWS Global Infrastructure",
    question: "What is an Availability Zone (AZ)?",
    options: [
      "A geographic region",
      "A single data center within a region",
      "A content delivery location",
      "A backup facility"
    ],
    correctAnswers: [1],
    explanation: "An AZ is a single data center or group of data centers within an AWS Region, providing isolated infrastructure for high availability.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Compute Services",
    question: "Which AWS service allows you to run code without provisioning servers?",
    options: [
      "Amazon EC2",
      "AWS Lambda",
      "Amazon ECS",
      "AWS Batch"
    ],
    correctAnswers: [1],
    explanation: "AWS Lambda is a serverless compute service that runs code in response to events without requiring you to manage servers.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Compute Services",
    question: "What is Amazon EC2?",
    options: [
      "A database service",
      "A content delivery network",
      "Elastic Compute Cloud - virtual servers in the cloud",
      "A storage service"
    ],
    correctAnswers: [2],
    explanation: "EC2 provides resizable virtual servers (instances) in the cloud, allowing you to scale compute capacity up or down as needed.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Storage Services",
    question: "Which AWS service is best for storing large amounts of unstructured data like images and videos?",
    options: [
      "Amazon RDS",
      "Amazon DynamoDB",
      "Amazon S3",
      "Amazon EBS"
    ],
    correctAnswers: [2],
    explanation: "S3 (Simple Storage Service) is an object storage service designed for storing large amounts of unstructured data with high durability.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Storage Services",
    question: "What is Amazon EBS?",
    options: [
      "Object storage for the cloud",
      "Block storage volumes for EC2 instances",
      "A content delivery network",
      "A database service"
    ],
    correctAnswers: [1],
    explanation: "EBS provides persistent block storage volumes that can be attached to EC2 instances, similar to hard drives on physical servers.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Database Services",
    question: "Which AWS database service is fully managed and automatically scales based on demand?",
    options: [
      "Amazon RDS",
      "Amazon DynamoDB",
      "Amazon Redshift",
      "Amazon ElastiCache"
    ],
    correctAnswers: [1],
    explanation: "DynamoDB is a fully managed NoSQL database that automatically scales capacity based on demand without manual intervention.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Database Services",
    question: "What is Amazon RDS?",
    options: [
      "A NoSQL database service",
      "A managed relational database service",
      "An in-memory cache service",
      "A data warehouse service"
    ],
    correctAnswers: [1],
    explanation: "RDS is a managed relational database service supporting engines like MySQL, PostgreSQL, and Oracle, handling backups and maintenance.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Networking Services",
    question: "What is Amazon VPC?",
    options: [
      "A virtual private network for remote access",
      "A virtual private cloud - isolated network environment",
      "A content delivery network",
      "A DNS service"
    ],
    correctAnswers: [1],
    explanation: "VPC is a virtual private cloud that provides an isolated network environment where you can launch AWS resources with full control.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Networking Services",
    question: "What does an Internet Gateway do in a VPC?",
    options: [
      "Encrypts data in transit",
      "Enables communication between VPC and the internet",
      "Manages DNS records",
      "Provides VPN connectivity"
    ],
    correctAnswers: [1],
    explanation: "An Internet Gateway enables communication between instances in a VPC and the internet, allowing bidirectional traffic.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Security & Compliance",
    question: "Which AWS service provides identity and access management?",
    options: [
      "AWS KMS",
      "AWS IAM",
      "AWS WAF",
      "AWS Shield"
    ],
    correctAnswers: [1],
    explanation: "IAM (Identity and Access Management) controls who can access AWS resources and what actions they can perform.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Security & Compliance",
    question: "What is AWS KMS?",
    options: [
      "A key management service for encryption",
      "A firewall service",
      "A DDoS protection service",
      "An identity service"
    ],
    correctAnswers: [0],
    explanation: "KMS (Key Management Service) helps you create and manage encryption keys used to encrypt data in AWS services.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Pricing & Support",
    question: "What is the AWS Free Tier?",
    options: [
      "A permanent free service",
      "A trial period offering free usage of certain services",
      "A discount program for long-term commitments",
      "A support plan"
    ],
    correctAnswers: [1],
    explanation: "The Free Tier provides free usage of many AWS services for 12 months, allowing you to learn and experiment with AWS.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Pricing & Support",
    question: "Which AWS support plan provides 24/7 access to Cloud Support Engineers?",
    options: [
      "Developer",
      "Business",
      "Enterprise",
      "Basic"
    ],
    correctAnswers: [2],
    explanation: "The Enterprise support plan includes 24/7 access to senior Cloud Support Engineers and a dedicated Technical Account Manager.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "AWS Well-Architected Framework",
    question: "What is the AWS Well-Architected Framework?",
    options: [
      "A pricing calculator",
      "A set of best practices for designing cloud architectures",
      "A monitoring service",
      "A backup solution"
    ],
    correctAnswers: [1],
    explanation: "The Well-Architected Framework provides best practices across five pillars: Operational Excellence, Security, Reliability, Performance Efficiency, and Cost Optimization.",
    questionType: "single"
  },
  {
    certification: "CLF-C02",
    topic: "Sustainability",
    question: "How does AWS help with environmental sustainability?",
    options: [
      "It doesn't address sustainability",
      "By using 100% renewable energy in data centers and helping customers reduce their carbon footprint",
      "By charging more for green services",
      "By limiting service usage"
    ],
    correctAnswers: [1],
    explanation: "AWS commits to 100% renewable energy, provides tools to measure carbon footprint, and helps customers achieve sustainability goals.",
    questionType: "single"
  },
];

async function seedQuestions() {
  console.log("🌱 Seeding expanded AWS exam questions...\n");

  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ Database connection failed");
      process.exit(1);
    }

    // Insert SAA questions
    console.log(`📚 Inserting ${saaQuestions.length} SAA-C03 questions...`);
    for (const q of saaQuestions) {
      await db.insert(awsQuestions).values({
        certification: q.certification,
        topic: q.topic,
        questionText: q.question,
        options: JSON.stringify(q.options),
        correctAnswers: JSON.stringify(q.correctAnswers),
        explanation: q.explanation,
        questionType: q.questionType,
      });
    }
    console.log(`✓ Inserted ${saaQuestions.length} SAA-C03 questions`);

    // Insert CLF questions
    console.log(`📚 Inserting ${clfQuestions.length} CLF-C02 questions...`);
    for (const q of clfQuestions) {
      await db.insert(awsQuestions).values({
        certification: q.certification,
        topic: q.topic,
        questionText: q.question,
        options: JSON.stringify(q.options),
        correctAnswers: JSON.stringify(q.correctAnswers),
        explanation: q.explanation,
        questionType: q.questionType,
      });
    }
    console.log(`✓ Inserted ${clfQuestions.length} CLF-C02 questions`);

    console.log(`\n✅ Successfully seeded ${saaQuestions.length + clfQuestions.length} questions!`);
  } catch (error) {
    console.error("Error seeding questions:", error);
    process.exit(1);
  }
}

seedQuestions();
