import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const extraSAA = [
  {
    "topic": "Architecture",
    "question": "A company is building a microservices application where Service A needs to call Service B synchronously and Service C asynchronously. Service B must respond within 200ms. Service C processes notifications and can tolerate up to 5 minutes of delay. Service B occasionally becomes unavailable. Which combination of integration patterns handles both requirements correctly?",
    "options": [
      "Use REST API calls for both Service B and Service C",
      "Use synchronous REST/HTTP for Service A to Service B (with circuit breaker pattern to handle Service B unavailability \u2014 fail fast instead of waiting), and Amazon SQS for Service A to Service C (decouples the services, Service C processes at its own pace, messages are retained if Service C is down)",
      "Use Amazon SNS for both integrations \u2014 it supports both synchronous and asynchronous patterns",
      "Use AWS Step Functions to orchestrate all service calls"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Different integration patterns for different requirements: Synchronous REST for Service B (200ms SLA requires immediate response). Circuit breaker pattern (AWS App Mesh or application-level) prevents cascading failures when Service B is unavailable \u2014 fail fast with a fallback response. SQS for Service C (asynchronous, tolerates 5-minute delay, decoupled, messages survive Service C downtime). This is the standard microservices integration pattern.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company's application generates audit logs that must be stored immutably for 10 years. The logs are written by an application running on EC2. The security team wants to ensure that even the EC2 instance's IAM role cannot delete or modify the logs after they are written. Which architecture achieves this?",
    "options": [
      "Write logs to S3 with server-side encryption \u2014 encrypted logs cannot be modified",
      "Write logs to an S3 bucket with S3 Object Lock in Compliance mode (10-year retention). The EC2 IAM role has s3:PutObject permission but NOT s3:DeleteObject or s3:PutObjectRetention. Once written with Object Lock, the logs cannot be deleted or modified by any entity including the IAM role, bucket owner, or AWS",
      "Write logs to CloudWatch Logs with a 10-year retention policy",
      "Write logs to an S3 bucket with MFA Delete enabled"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "S3 Object Lock Compliance mode is the only AWS mechanism that prevents deletion/modification by all entities including the root account. The EC2 role needs only s3:PutObject \u2014 it cannot delete or modify existing objects. Compliance mode retention cannot be shortened. CloudWatch Logs retention policies can be changed by IAM users with appropriate permissions. MFA Delete requires MFA for deletion but can still be bypassed by the root account.",
    "questionType": "single"
  },
  {
    "topic": "Networking",
    "question": "A company uses AWS Direct Connect for their primary connectivity between on-premises and AWS. They want a backup connection for Direct Connect failures. The backup must be cost-effective and automatically take over when Direct Connect fails. Which solution provides the most cost-effective backup?",
    "options": [
      "Order a second Direct Connect connection from a different provider \u2014 provides redundancy but high cost",
      "Configure an AWS Site-to-Site VPN as a backup to Direct Connect. Use BGP routing: Direct Connect advertises routes with a higher BGP local preference (preferred path). VPN advertises the same routes with lower preference. When Direct Connect fails, BGP automatically routes traffic over the VPN",
      "Use AWS Global Accelerator as a backup to Direct Connect",
      "Configure S3 Transfer Acceleration as a backup data transfer mechanism"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "VPN over the internet as a Direct Connect backup is the standard cost-effective pattern. BGP routing handles automatic failover: Direct Connect uses higher BGP local preference (preferred path). VPN uses lower preference (backup path). When Direct Connect fails, BGP reconverges and routes traffic over the VPN automatically. VPN costs are significantly lower than a second Direct Connect connection. Failover time depends on BGP convergence (typically 30-60 seconds).",
    "questionType": "single"
  },
  {
    "topic": "Serverless",
    "question": "A company wants to build a webhook receiver that processes events from a third-party SaaS application. The third-party sends up to 500 events per second. Each event requires 3-5 seconds of processing (calling external APIs, updating a database). The third-party requires the webhook endpoint to respond with HTTP 200 within 3 seconds or it will retry. Which architecture handles this correctly?",
    "options": [
      "Use Lambda directly triggered by API Gateway \u2014 Lambda processes each event synchronously",
      "Use API Gateway to receive webhooks and immediately return HTTP 200. API Gateway sends the event to SQS. A separate Lambda function polls SQS and processes events asynchronously. This decouples receipt from processing \u2014 the third-party gets an immediate 200 response, and events are processed at the Lambda's own pace",
      "Use EC2 instances with a thread pool to process events concurrently",
      "Use Kinesis Data Streams to buffer the webhook events before processing"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "The webhook pattern requires immediate acknowledgment (HTTP 200) separate from processing. API Gateway receives the webhook and immediately returns 200. The event is written to SQS (sub-millisecond). A Lambda function polls SQS and processes events asynchronously (3-5 seconds each). This decouples receipt from processing. If processing is slow, events queue in SQS. If Lambda fails, SQS retries. The third-party never times out waiting for processing to complete.",
    "questionType": "single"
  },
  {
    "topic": "Database",
    "question": "A company stores time-series IoT sensor data in DynamoDB. Each sensor writes one reading per second. There are 10,000 sensors. The data must be queryable by sensor ID and time range. Items older than 90 days should be automatically deleted. The table currently has 500 billion items and costs $50,000 per month in storage. Which DynamoDB feature automatically deletes old items without application code?",
    "options": [
      "Use DynamoDB Streams to trigger a Lambda function that deletes old items",
      "Enable DynamoDB Time to Live (TTL) on the table. Add a ttl attribute to each item set to the Unix timestamp of 90 days from the write time. DynamoDB automatically deletes items when the current time exceeds the TTL value \u2014 no application code needed, no cost for TTL deletions, and deletions happen within 48 hours of expiration",
      "Create a scheduled Lambda function that runs daily and deletes items older than 90 days",
      "Use S3 Lifecycle policies to delete old DynamoDB data"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "DynamoDB TTL is the native feature for automatic item expiration. Set a ttl attribute (Unix timestamp) on each item. DynamoDB scans for expired items in the background and deletes them \u2014 no application code, no additional cost, and no impact on read/write capacity. Items are typically deleted within 48 hours of expiration. TTL deletions appear in DynamoDB Streams if enabled. Scheduled Lambda deletion is complex, costly, and consumes write capacity.",
    "questionType": "single"
  },
  {
    "topic": "High Availability",
    "question": "A company runs a critical application with an SLA of 99.99% uptime (less than 1 hour downtime per year). The application uses EC2 instances, RDS, and S3. A single AZ failure should not cause any downtime. A single region failure should cause less than 15 minutes of downtime. Which architecture meets these requirements?",
    "options": [
      "Deploy in a single region with Multi-AZ for EC2 and RDS \u2014 handles AZ failures",
      "Deploy EC2 in an Auto Scaling group across 3 AZs with an ALB (handles AZ failures with zero downtime). Use RDS Multi-AZ (automatic failover within 1-2 minutes for AZ failure). Deploy a warm standby in a second region with Route 53 health checks and automatic DNS failover. RDS cross-region read replica promotes to primary in the DR region within 5-10 minutes",
      "Deploy in a single AZ with maximum instance sizes for reliability",
      "Use AWS Global Accelerator with active-active deployment in two regions"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Meeting 99.99% SLA with regional DR: Multi-AZ EC2 with ALB handles AZ failures with zero downtime (ALB routes around failed AZ). RDS Multi-AZ handles AZ failures with 1-2 minute automatic failover. Warm standby in DR region handles regional failures: Route 53 health checks detect regional failure within 1-2 minutes, DNS failover takes 1-2 minutes, RDS read replica promotion takes 5-10 minutes. Total regional failover is under 15 minutes.",
    "questionType": "single"
  },
  {
    "topic": "Cost Optimization",
    "question": "A company's AWS bill shows that data transfer costs are $80,000 per month. Investigation reveals: $40,000 from EC2 to internet (serving web content), $30,000 from S3 to CloudFront, and $10,000 from cross-region data replication. Which optimizations reduce data transfer costs?",
    "options": [
      "Move all workloads to a single region to eliminate cross-region transfer costs",
      "For EC2 to internet: serve static content via CloudFront (CloudFront to internet is cheaper than EC2 to internet, and edge caching reduces origin requests). For S3 to CloudFront: S3 to CloudFront transfer is free within the same region \u2014 ensure CloudFront origin is in the same region as S3. For cross-region replication: evaluate if replication is necessary; use S3 Replication Time Control only where SLA requires it",
      "Use AWS Direct Connect for all data transfer \u2014 it has lower per-GB costs",
      "Enable S3 Transfer Acceleration to reduce transfer costs"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Data transfer cost optimization: EC2 to internet: CloudFront caches content at edge locations. Cache hits serve from edge (cheaper per GB than EC2 origin). Origin requests are reduced by the cache hit ratio. S3 to CloudFront: Data transfer from S3 to CloudFront in the same region is FREE. Ensure CloudFront distribution origin points to S3 in the same region. Cross-region replication: Evaluate necessity. S3 Replication Time Control has premium pricing \u2014 use only where required.",
    "questionType": "single"
  }
];

const clfQuestions = [
  {
    "topic": "Cloud Concepts",
    "question": "A small business owner is evaluating whether to move their IT infrastructure to AWS. They currently spend $50,000 per year on servers that they replace every 5 years, plus $15,000 per year on a data center lease, $8,000 per year on a network engineer to maintain the hardware, and $20,000 per year on power and cooling. The servers are used at 15% average CPU utilization. Which statement BEST describes the economic advantage of moving to AWS?",
    "options": [
      "AWS is always more expensive than on-premises because you pay for what you use instead of owning the hardware",
      "AWS converts large upfront capital expenditures (CapEx) into smaller operational expenditures (OpEx). The company eliminates hardware refresh cycles, data center lease, and maintenance costs. They pay only for the 15% of compute they actually use, potentially reducing total IT costs by 60-80%",
      "AWS is only beneficial for large enterprises with hundreds of servers",
      "Moving to AWS eliminates all IT costs because AWS manages everything"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "The AWS value proposition: CapEx to OpEx conversion eliminates the $250,000 server purchase every 5 years ($50,000/year amortized). Data center lease ($15,000/year), maintenance staff ($8,000/year), and power/cooling ($20,000/year) are eliminated. Most importantly, the company currently wastes 85% of their compute capacity (15% utilization) \u2014 AWS allows paying for only what is used. This is the fundamental economic advantage of cloud computing.",
    "questionType": "single"
  },
  {
    "topic": "Cloud Concepts",
    "question": "A company is planning a new product launch and expects a 50x traffic spike for 2 weeks, then normal traffic. They are worried about buying enough servers to handle the spike. Which AWS cloud characteristic directly addresses this concern?",
    "options": [
      "High availability \u2014 AWS keeps services running 99.99% of the time",
      "Elasticity \u2014 AWS allows you to rapidly scale resources up during the spike and scale back down after, paying only for the capacity used during the 2-week period. No need to purchase and maintain servers for peak capacity year-round",
      "Durability \u2014 AWS stores data reliably across multiple facilities",
      "Security \u2014 AWS protects against DDoS attacks during the launch"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Elasticity is the ability to acquire resources as you need them and release them when you do not. For a 2-week traffic spike, elasticity means: scale up EC2 instances, RDS read replicas, and caching capacity before the launch, then scale back down after. You pay only for the extra capacity during those 2 weeks. Without cloud elasticity, the company would need to purchase servers for peak capacity and have them sit idle 50 weeks per year.",
    "questionType": "single"
  },
  {
    "topic": "Cloud Concepts",
    "question": "A startup wants to deploy their application globally to users in North America, Europe, and Asia-Pacific within 1 week. Without AWS, this would require negotiating data center contracts, purchasing hardware, and hiring local IT staff in each region \u2014 a process taking 6-12 months. Which AWS advantage does this scenario demonstrate?",
    "options": [
      "Cost savings \u2014 deploying globally is cheaper on AWS",
      "Go global in minutes \u2014 AWS has infrastructure in Regions worldwide. A startup can deploy to AWS Regions in us-east-1, eu-west-1, and ap-southeast-1 using the same tools and APIs, without physical infrastructure procurement, in hours instead of months",
      "Managed services \u2014 AWS manages all the servers so the startup does not need IT staff",
      "Security \u2014 AWS provides built-in security for global deployments"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AWS's global infrastructure enables rapid geographic expansion. AWS operates 30+ Regions worldwide. Deploying to a new region requires no physical infrastructure procurement \u2014 just configure resources using the AWS console or APIs. A startup can be globally deployed in hours. This is one of the six advantages of cloud computing: trade capital expense for variable expense, benefit from massive economies of scale, stop guessing capacity, increase speed and agility, stop spending money on data center operations, and go global in minutes.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company needs to store 100TB of infrequently accessed archive data (accessed less than once per year) at the lowest possible cost. The data must be retrievable within 12 hours when needed. Which S3 storage class is MOST cost-effective?",
    "options": [
      "S3 Standard \u2014 provides immediate access but highest storage cost",
      "S3 Glacier Flexible Retrieval \u2014 designed for archival data with retrieval times of minutes to 12 hours. Storage cost is approximately $0.004 per GB per month (compared to $0.023 per GB for S3 Standard). Ideal for data accessed once or twice per year",
      "S3 Standard-IA \u2014 lower cost than Standard but still more expensive than Glacier",
      "S3 One Zone-IA \u2014 lower cost but stores data in only one Availability Zone"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "S3 Glacier Flexible Retrieval is designed for archival data accessed 1-2 times per year. At $0.004/GB/month, it is 83% cheaper than S3 Standard. Retrieval options: Expedited (1-5 minutes), Standard (3-5 hours), Bulk (5-12 hours). The 12-hour retrieval requirement is met by Bulk retrieval. S3 Glacier Deep Archive ($0.00099/GB) is cheaper but has 12-48 hour retrieval times. For data accessed less than once per year with a 12-hour retrieval SLA, Glacier Flexible Retrieval is optimal.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A developer needs to run code in response to HTTP requests without managing any servers. The code runs for 100-500ms per request. Traffic is unpredictable \u2014 sometimes 0 requests per hour, sometimes 10,000 per hour. Which AWS service is MOST appropriate?",
    "options": [
      "Amazon EC2 \u2014 launch an instance and install a web server",
      "AWS Lambda \u2014 serverless compute that runs code in response to events (including HTTP requests via API Gateway). Lambda automatically scales from 0 to thousands of concurrent executions. You pay only for the compute time used (per 1ms of execution). No servers to manage, patch, or provision",
      "Amazon ECS \u2014 container service for running Docker containers",
      "Amazon Lightsail \u2014 simplified virtual server service"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Lambda is ideal for this use case: event-driven execution (HTTP requests via API Gateway), automatic scaling from 0 to thousands of concurrent executions, pay-per-use pricing (no cost when there are 0 requests), and no server management. For 100-500ms execution times with unpredictable traffic, Lambda is significantly cheaper than EC2 (which charges for idle time). This is the core serverless computing pattern.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company has 10 developers who need different levels of AWS access. The lead developer needs full EC2 access. Junior developers need read-only access to S3. The DevOps engineer needs access to EC2, RDS, and CloudFormation. Which AWS service manages these different permission levels?",
    "options": [
      "AWS Organizations \u2014 manages multiple AWS accounts",
      "AWS Identity and Access Management (IAM) \u2014 create IAM users for each developer, create IAM policies defining the permissions for each role, and attach the appropriate policies to each user. IAM Groups allow applying the same policy to multiple users",
      "Amazon Cognito \u2014 manages user authentication for web applications",
      "AWS Directory Service \u2014 connects AWS to Microsoft Active Directory"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "IAM is the AWS service for managing access to AWS resources. IAM allows: creating users for each developer, creating policies that define specific permissions (e.g., ec2:* for full EC2 access, s3:GetObject for read-only S3), creating groups (lead-developers, junior-developers, devops) with appropriate policies attached, and assigning users to groups. The principle of least privilege ensures each developer has only the permissions they need.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company's AWS account root user email and password were compromised. The attacker has not yet logged in. What is the FIRST action the company should take to secure the account?",
    "options": [
      "Delete all IAM users to prevent the attacker from using compromised credentials",
      "Log in to the root account immediately, change the root password, enable Multi-Factor Authentication (MFA) on the root account, and review CloudTrail logs for any unauthorized activity. Then rotate all IAM access keys and review IAM user permissions",
      "Contact AWS Support to lock the account",
      "Create a new AWS account and migrate all resources"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Immediate incident response for compromised root credentials: (1) Change root password \u2014 invalidates the compromised password. (2) Enable MFA on root \u2014 even if the attacker has the new password, they cannot log in without the MFA device. (3) Review CloudTrail \u2014 determine if the attacker has already accessed the account. (4) Rotate IAM access keys \u2014 the attacker may have created access keys. AWS best practice: never use the root account for daily tasks, enable MFA on root, and use IAM users/roles instead.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to run a relational database on AWS without managing database software installation, patching, backups, or hardware. They need MySQL compatibility. Which AWS service meets these requirements?",
    "options": [
      "Amazon EC2 with MySQL installed \u2014 full control but requires managing all database operations",
      "Amazon RDS for MySQL \u2014 a managed relational database service that handles hardware provisioning, database setup, patching, automated backups, and failover. The company only manages the database schema and queries",
      "Amazon DynamoDB \u2014 a managed NoSQL database service",
      "Amazon Redshift \u2014 a managed data warehouse service"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon RDS is a managed relational database service. AWS handles: hardware provisioning, database software installation, patching (OS and database engine), automated backups (daily snapshots, transaction logs for point-in-time recovery), Multi-AZ failover, and monitoring. The customer manages: database schema, queries, users, and application-level configuration. RDS for MySQL provides MySQL compatibility. This is the shared responsibility model \u2014 AWS manages the infrastructure, customer manages the data.",
    "questionType": "single"
  },
  {
    "topic": "Cloud Concepts",
    "question": "A company is comparing the total cost of ownership (TCO) between on-premises and AWS. Their on-premises environment has hidden costs they have not considered. Which costs are typically HIDDEN in on-premises TCO calculations?",
    "options": [
      "Server hardware purchase price \u2014 this is always included in TCO calculations",
      "Physical space (data center floor space), power consumption (servers plus cooling), network equipment (switches, routers, cables), hardware refresh cycles (servers depreciate and must be replaced every 3-5 years), IT staff time for hardware maintenance, and the opportunity cost of capital tied up in hardware",
      "Software licensing \u2014 this is always included in TCO calculations",
      "Internet bandwidth costs \u2014 these are the same for on-premises and cloud"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "On-premises TCO hidden costs: Physical space ($500-$1,500 per rack per month in a colocation facility). Power (a server rack uses 5-10 kW \u2014 $500-$1,000 per month in electricity). Cooling (typically 1:1 ratio with power consumption). Network equipment (switches, routers, cables, maintenance). Hardware refresh (servers depreciate over 3-5 years and must be replaced). IT staff time for hardware maintenance, racking, cabling. These costs are often excluded from simple hardware price comparisons, making on-premises appear cheaper than it actually is.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to deliver their website's static files (HTML, CSS, JavaScript, images) to global users with the lowest possible latency. The website is hosted in us-east-1. Users in Tokyo, London, and S\u00e3o Paulo report slow page loads. Which AWS service improves global performance?",
    "options": [
      "Amazon Route 53 \u2014 DNS service that routes users to the nearest server",
      "Amazon CloudFront \u2014 a Content Delivery Network (CDN) that caches content at 400+ edge locations worldwide. Users in Tokyo, London, and S\u00e3o Paulo receive content from the nearest edge location instead of us-east-1, reducing latency from 200-300ms to 5-20ms",
      "AWS Global Accelerator \u2014 routes traffic over the AWS backbone network",
      "Amazon S3 Transfer Acceleration \u2014 speeds up uploads to S3"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "CloudFront is AWS's CDN service. It caches static content (HTML, CSS, JS, images) at 400+ edge locations globally. When a user in Tokyo requests a file, CloudFront serves it from the Tokyo edge location instead of routing all the way to us-east-1. This reduces latency from 200-300ms (cross-Pacific round trip) to 5-20ms (local edge). CloudFront also reduces origin server load by serving cached content. It integrates natively with S3, EC2, and ALB as origins.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company needs to send transactional emails (order confirmations, password resets) and marketing emails (newsletters, promotions) to their customers. They send 5 million emails per month. Which AWS service is designed for high-volume email sending?",
    "options": [
      "Amazon SNS \u2014 Simple Notification Service for push notifications",
      "Amazon SES (Simple Email Service) \u2014 a cloud-based email sending service designed for high-volume transactional and marketing email. SES handles email deliverability, bounce management, complaint handling, and provides sending statistics. Cost is $0.10 per 1,000 emails",
      "Amazon SQS \u2014 Simple Queue Service for message queuing",
      "AWS Lambda \u2014 serverless functions that can send emails via SMTP"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon SES is purpose-built for email sending at scale. Features: high deliverability (SES manages IP reputation), bounce and complaint handling (automatically removes invalid addresses), sending statistics (delivery rates, open rates, click rates), support for both transactional and marketing email, and SMTP and API interfaces. At $0.10 per 1,000 emails, 5 million emails per month costs $500 \u2014 significantly cheaper than third-party email services.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company wants to monitor their AWS account for suspicious activity such as unusual API calls, unauthorized access attempts, and potential data exfiltration. They want automatic threat detection without configuring complex rules. Which AWS service provides this?",
    "options": [
      "AWS CloudTrail \u2014 records all API calls for auditing",
      "Amazon GuardDuty \u2014 a managed threat detection service that uses machine learning to analyze CloudTrail logs, VPC Flow Logs, and DNS logs to identify suspicious activity. GuardDuty detects threats like unusual API calls from unexpected locations, cryptocurrency mining, data exfiltration, and compromised EC2 instances",
      "AWS Config \u2014 monitors configuration compliance",
      "Amazon Inspector \u2014 scans EC2 instances for vulnerabilities"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon GuardDuty provides intelligent threat detection. It continuously analyzes CloudTrail (API activity), VPC Flow Logs (network traffic), and DNS logs using ML models trained on AWS threat intelligence. GuardDuty detects: unusual API calls from unexpected geographies, brute force attacks on EC2 instances, EC2 instances communicating with known malicious IPs, unusual data transfer patterns (potential exfiltration), and cryptocurrency mining. No rules to configure \u2014 GuardDuty is enabled with one click.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company's application needs a database that can store flexible, schema-less data (product catalogs where different products have different attributes), handle millions of requests per second, and automatically scale without downtime. Which AWS database service is MOST appropriate?",
    "options": [
      "Amazon RDS \u2014 relational database with fixed schema",
      "Amazon DynamoDB \u2014 a fully managed NoSQL database that supports flexible schemas (each item can have different attributes), delivers single-digit millisecond performance at any scale, and automatically scales capacity up and down based on traffic with no downtime",
      "Amazon Redshift \u2014 data warehouse for analytical queries",
      "Amazon ElastiCache \u2014 in-memory caching service"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "DynamoDB is designed for the described requirements: Schema-less (flexible) \u2014 items in the same table can have different attributes. Performance \u2014 single-digit millisecond response times at any scale. Scalability \u2014 on-demand capacity mode automatically scales to handle millions of requests per second without capacity planning. Managed \u2014 no servers to manage, patch, or scale. Product catalogs are a classic DynamoDB use case because products have varying attributes.",
    "questionType": "single"
  },
  {
    "topic": "Cloud Concepts",
    "question": "A company is moving to AWS and wants to understand the Shared Responsibility Model. Which of the following is the CUSTOMER's responsibility in the shared responsibility model?",
    "options": [
      "Physical security of AWS data centers",
      "Patching the operating system on EC2 instances, configuring security groups and NACLs, managing IAM users and permissions, encrypting application data, and ensuring application-level security",
      "Maintaining the physical network infrastructure connecting AWS data centers",
      "Replacing failed hardware in AWS data centers"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "The Shared Responsibility Model divides security responsibilities: AWS is responsible for security OF the cloud \u2014 physical data centers, hardware, networking infrastructure, hypervisor, and managed service software. Customer is responsible for security IN the cloud \u2014 OS patching on EC2 instances, network configuration (security groups, NACLs), IAM user management, data encryption, application security, and firewall configuration. The customer controls what they deploy and how it is configured.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to automatically detect and classify sensitive data (credit card numbers, Social Security Numbers, personal health information) stored in their S3 buckets across their AWS account. Which AWS service provides this capability?",
    "options": [
      "Amazon Inspector \u2014 scans EC2 instances for vulnerabilities",
      "Amazon Macie \u2014 a data security service that uses machine learning to automatically discover, classify, and protect sensitive data in S3. Macie identifies PII (names, addresses, SSNs), financial data (credit card numbers, bank account numbers), and healthcare data (PHI) across all S3 buckets",
      "AWS Config \u2014 monitors resource configuration compliance",
      "Amazon GuardDuty \u2014 detects threats and suspicious activity"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon Macie is specifically designed for sensitive data discovery and classification in S3. Macie uses ML to identify: PII (names, addresses, phone numbers, SSNs, passport numbers), financial data (credit card numbers, bank account numbers), healthcare data (PHI, medical record numbers), and credentials (API keys, passwords). Macie provides a dashboard showing which buckets contain sensitive data, the type of sensitive data found, and access patterns.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to create a private network connection between their on-premises data center and AWS that provides consistent network performance, lower latency than internet VPN, and dedicated bandwidth. Which AWS service provides this?",
    "options": [
      "AWS Site-to-Site VPN \u2014 encrypted tunnel over the public internet",
      "AWS Direct Connect \u2014 a dedicated physical network connection from the on-premises data center to AWS. Direct Connect bypasses the public internet, providing consistent network performance (no internet congestion), lower latency, and dedicated bandwidth (1 Gbps to 100 Gbps)",
      "Amazon CloudFront \u2014 CDN for content delivery",
      "AWS Transit Gateway \u2014 connects multiple VPCs and on-premises networks"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AWS Direct Connect provides a dedicated physical network connection. Unlike VPN (which uses the public internet and has variable performance), Direct Connect uses a dedicated fiber connection from the customer's data center to an AWS Direct Connect location. Benefits: consistent network performance (no internet congestion), lower latency (dedicated path), higher bandwidth (1-100 Gbps), and reduced data transfer costs compared to internet transfer. Direct Connect takes weeks to provision (physical infrastructure required).",
    "questionType": "single"
  },
  {
    "topic": "Cloud Concepts",
    "question": "A company is evaluating AWS cloud adoption. The CTO asks about the benefit of AWS's massive scale \u2014 buying hardware for millions of customers. How does AWS's scale benefit individual customers?",
    "options": [
      "AWS provides free hardware to customers who use large amounts of compute",
      "AWS achieves economies of scale by purchasing hardware in massive quantities at lower prices, operating data centers more efficiently, and passing these savings to customers through lower prices over time. AWS has reduced prices over 100 times since 2006",
      "AWS's scale means individual customers get dedicated hardware that is not shared with others",
      "AWS's scale only benefits enterprise customers with large workloads"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Economies of scale is one of the six advantages of cloud computing. AWS purchases hardware in quantities that individual companies cannot match, negotiating lower prices from hardware vendors. AWS operates data centers at maximum efficiency (power, cooling, space utilization). These cost savings are passed to customers through lower per-unit prices. AWS has reduced prices over 100 times since 2006. A startup using AWS benefits from the same purchasing power as the largest enterprises.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to set up a budget alert that notifies the finance team when AWS spending exceeds $10,000 per month. They also want to receive a warning when spending is forecasted to exceed $10,000 before the month ends. Which AWS service provides this?",
    "options": [
      "AWS Cost Explorer \u2014 provides cost visualization and analysis",
      "AWS Budgets \u2014 allows setting custom cost and usage budgets with alerts. Create a monthly cost budget of $10,000. Configure alerts: one alert at 80% of actual spend ($8,000) as a warning, one alert at 100% of actual spend ($10,000) as a threshold breach, and one alert when forecasted spend exceeds $10,000",
      "Amazon CloudWatch \u2014 monitors AWS resource metrics",
      "AWS Trusted Advisor \u2014 provides cost optimization recommendations"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AWS Budgets is the service for cost monitoring and alerting. Budget types: Cost budget (total spend), Usage budget (service-specific usage), Savings Plans budget, Reservation budget. Alert types: Actual spend (triggers when current month spending exceeds threshold), Forecasted spend (triggers when projected end-of-month spend will exceed threshold). Alerts are sent via email or SNS. AWS Budgets can also trigger automated actions (apply IAM policies, stop EC2 instances) when budgets are exceeded.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company uses multiple AWS services. They want to receive a security score and prioritized list of security recommendations to improve their AWS security posture, including checks for MFA on root account, S3 bucket public access, security group configurations, and IAM password policies. Which AWS service provides this?",
    "options": [
      "Amazon Inspector \u2014 scans EC2 instances for vulnerabilities",
      "AWS Trusted Advisor \u2014 provides real-time guidance across five categories: cost optimization, performance, security, fault tolerance, and service limits. The security checks include: MFA on root account, S3 bucket permissions, security group open access, IAM use, and exposed access keys",
      "AWS Security Hub \u2014 aggregates security findings from multiple services",
      "Amazon GuardDuty \u2014 detects threats using machine learning"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AWS Trusted Advisor provides automated best practice checks. Security checks include: MFA on root account, IAM use (are you using IAM instead of root?), S3 bucket permissions (public access), security group open access (0.0.0.0/0 on sensitive ports), exposed access keys (checks GitHub for exposed AWS credentials), and CloudTrail logging. Trusted Advisor provides a green/yellow/red status for each check with specific remediation guidance.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to migrate their on-premises Microsoft SQL Server database to AWS. They want to minimize changes to the application code and keep using SQL Server. They do not want to manage the underlying OS or database software. Which AWS service is MOST appropriate?",
    "options": [
      "Amazon EC2 with SQL Server installed \u2014 full control but requires OS and database management",
      "Amazon RDS for SQL Server \u2014 a managed database service that runs SQL Server. AWS manages OS patching, SQL Server software updates, automated backups, Multi-AZ failover, and monitoring. The application connects using the same SQL Server connection string",
      "Amazon Aurora \u2014 AWS's custom database engine with MySQL/PostgreSQL compatibility",
      "Amazon DynamoDB \u2014 a managed NoSQL database"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "RDS for SQL Server is the lift-and-shift option for SQL Server migrations. AWS manages the infrastructure (hardware, OS, SQL Server software, patching, backups). The application uses the same SQL Server connection string and T-SQL queries \u2014 no code changes needed. Available editions: Express, Web, Standard, Enterprise. Supports SQL Server features: SQL Server Agent, SSRS, linked servers, and more. This is the managed option that eliminates OS and database administration.",
    "questionType": "single"
  },
  {
    "topic": "Cloud Concepts",
    "question": "A company's IT team spends 60% of their time on undifferentiated heavy lifting: patching servers, replacing failed hardware, managing data center cooling, and capacity planning. By moving to AWS, they want to refocus on activities that differentiate their business. Which AWS benefit does this describe?",
    "options": [
      "Cost savings \u2014 AWS is cheaper than on-premises",
      "Stop spending money on undifferentiated heavy lifting \u2014 AWS manages the infrastructure (hardware maintenance, patching, capacity planning, data center operations) so customers can focus on their core business applications and innovation that differentiates them from competitors",
      "Elasticity \u2014 AWS automatically scales resources based on demand",
      "Global reach \u2014 AWS has data centers worldwide"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "One of the six advantages of cloud computing is 'stop spending money running and maintaining data centers.' AWS manages the undifferentiated heavy lifting: hardware procurement and replacement, physical security, power and cooling, OS patching, and network infrastructure. This frees the IT team to focus on business-differentiating work: building features, improving user experience, and driving innovation. The 60% of time spent on infrastructure management can be redirected to value-creating activities.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to build a chatbot for their customer service website. The chatbot should understand natural language, handle multi-turn conversations, and integrate with their existing CRM system. Which AWS service provides natural language understanding for building conversational interfaces?",
    "options": [
      "Amazon Polly \u2014 converts text to speech",
      "Amazon Lex \u2014 a service for building conversational interfaces using voice and text. Lex uses the same deep learning technology as Alexa, providing automatic speech recognition (ASR) and natural language understanding (NLU). Lex handles multi-turn conversations and integrates with Lambda for business logic and CRM integration",
      "Amazon Transcribe \u2014 converts speech to text",
      "Amazon Comprehend \u2014 natural language processing for text analysis"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon Lex is the conversational AI service for building chatbots. It provides: NLU (understands user intent from text or voice), ASR (converts speech to text), dialog management (handles multi-turn conversations), and Lambda integration (for business logic, CRM lookups, order processing). Lex powers Amazon Alexa. The chatbot can be deployed to web, mobile, Slack, Facebook Messenger, and other channels.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company stores all their data in S3. They want to run SQL queries on this data without loading it into a database. The data is in CSV and Parquet formats. Which AWS service allows querying S3 data directly with SQL?",
    "options": [
      "Amazon RDS \u2014 a managed relational database that requires importing data",
      "Amazon Athena \u2014 a serverless interactive query service that allows running SQL queries directly on data in S3. No infrastructure to manage, no data loading required. Pay only for the data scanned per query. Supports CSV, Parquet, JSON, ORC, and other formats",
      "Amazon Redshift \u2014 a data warehouse that requires loading data from S3",
      "Amazon EMR \u2014 a managed Hadoop/Spark cluster for big data processing"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon Athena is serverless SQL on S3. No infrastructure to provision or manage. No data loading \u2014 Athena queries S3 data in place. Supports standard SQL (ANSI SQL). Pricing: $5 per TB of data scanned (using columnar formats like Parquet reduces data scanned and costs). Use cases: ad-hoc analysis, log analysis, cost and usage report analysis, and data lake querying.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company wants to encrypt all data stored in their S3 buckets. They want AWS to manage the encryption keys but want to audit when the keys are used. Which S3 encryption option meets these requirements?",
    "options": [
      "SSE-S3 (Server-Side Encryption with S3-Managed Keys) \u2014 AWS manages keys but no key usage audit",
      "SSE-KMS (Server-Side Encryption with AWS KMS Keys) \u2014 AWS KMS manages the encryption keys. Every time an object is encrypted or decrypted, the key usage is logged in AWS CloudTrail, providing a complete audit trail of who accessed which data and when",
      "SSE-C (Server-Side Encryption with Customer-Provided Keys) \u2014 customer manages keys",
      "Client-Side Encryption \u2014 encrypt data before uploading to S3"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "SSE-KMS uses AWS Key Management Service to manage encryption keys. Benefits: AWS manages key storage and rotation (no key management burden). Every KMS API call (Encrypt, Decrypt, GenerateDataKey) is logged in CloudTrail \u2014 providing a complete audit trail. You can see who accessed which S3 objects, when, and from which IP address. You can also control key access via KMS key policies. SSE-S3 does not provide key usage auditing.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to run Docker containers on AWS without managing the underlying servers or clusters. They want to pay only for the compute resources used by their containers. Which AWS service provides serverless container execution?",
    "options": [
      "Amazon EC2 \u2014 launch instances and install Docker",
      "AWS Fargate \u2014 a serverless compute engine for containers that works with both Amazon ECS and Amazon EKS. Fargate eliminates the need to provision and manage EC2 instances. You define the container CPU and memory requirements, and Fargate runs the containers. Pay only for the vCPU and memory used by running containers",
      "Amazon ECS with EC2 launch type \u2014 managed container orchestration but requires EC2 instances",
      "AWS Lambda \u2014 serverless functions, not containers"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AWS Fargate is serverless compute for containers. No EC2 instances to manage, patch, or scale. Define container resource requirements (CPU: 0.25-16 vCPU, memory: 0.5-120GB). Fargate provisions the right amount of compute. Pay per second for vCPU and memory used while containers are running. Works with ECS (simpler) and EKS (Kubernetes). Ideal for teams that want to run containers without infrastructure management.",
    "questionType": "single"
  },
  {
    "topic": "Cloud Concepts",
    "question": "A company's development team wants to experiment with new technologies and launch new services quickly. In the past, getting new servers took 3-4 weeks (procurement, delivery, installation, configuration). Which AWS benefit enables faster innovation?",
    "options": [
      "Cost savings \u2014 experiments are cheaper on AWS",
      "Increase speed and agility \u2014 AWS allows provisioning new resources in minutes instead of weeks. Developers can experiment with new technologies, launch test environments, and iterate quickly. Failed experiments can be terminated immediately with no sunk cost in hardware",
      "High availability \u2014 AWS keeps services running reliably",
      "Security \u2014 AWS provides secure infrastructure for experiments"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Increase speed and agility is one of the six advantages of cloud computing. AWS reduces the time to provision new resources from weeks to minutes. A developer can launch a new EC2 instance, RDS database, or Kubernetes cluster in minutes using the console or CLI. Experiments that fail can be terminated immediately \u2014 no hardware cost is sunk. This enables a culture of experimentation and rapid iteration that is impossible with physical hardware procurement cycles.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to monitor the performance and health of their AWS resources (EC2 CPU utilization, RDS connections, Lambda errors) and set up automated alerts when metrics exceed thresholds. Which AWS service provides this monitoring capability?",
    "options": [
      "AWS CloudTrail \u2014 records API calls for auditing",
      "Amazon CloudWatch \u2014 a monitoring and observability service that collects metrics from AWS services (EC2, RDS, Lambda, etc.), allows creating alarms that trigger when metrics exceed thresholds (e.g., CPU > 80%), sends notifications via SNS, and can trigger automated actions (Auto Scaling, Lambda functions)",
      "AWS Config \u2014 monitors resource configuration changes",
      "Amazon Inspector \u2014 scans for security vulnerabilities"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon CloudWatch is the AWS monitoring service. It collects metrics from all AWS services automatically (EC2 CPU, RDS connections, Lambda duration and errors, ALB request count). CloudWatch Alarms trigger when metrics breach thresholds. Alarms can: send SNS notifications (email, SMS), trigger Auto Scaling actions, stop/terminate/reboot EC2 instances, and invoke Lambda functions. CloudWatch Logs stores and analyzes log files. CloudWatch Dashboards visualize metrics.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to automate their infrastructure deployment. Instead of manually clicking through the AWS console to create VPCs, subnets, EC2 instances, and RDS databases, they want to define their infrastructure in code and deploy it repeatably. Which AWS service enables Infrastructure as Code?",
    "options": [
      "AWS Systems Manager \u2014 manages EC2 instances at scale",
      "AWS CloudFormation \u2014 allows defining AWS infrastructure in JSON or YAML templates. CloudFormation provisions and manages resources in the correct order, handles dependencies, and enables repeatable deployments. The same template can deploy identical environments in dev, staging, and production",
      "AWS Config \u2014 tracks configuration changes to AWS resources",
      "Amazon EC2 Image Builder \u2014 automates EC2 AMI creation"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AWS CloudFormation is the Infrastructure as Code service. Templates (JSON or YAML) define all AWS resources and their configurations. CloudFormation handles: resource creation order (creates VPC before subnets, subnets before EC2 instances), dependency management, rollback on failure, and stack updates. Benefits: version control infrastructure, repeatable deployments, disaster recovery (redeploy from template), and environment consistency.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company has multiple AWS accounts (development, staging, production). They want to apply consistent security policies across all accounts, prevent any account from disabling CloudTrail, and get a consolidated security view. Which AWS service manages multiple accounts centrally?",
    "options": [
      "AWS IAM \u2014 manages users and permissions within a single account",
      "AWS Organizations \u2014 allows managing multiple AWS accounts centrally. Features: consolidated billing (single bill for all accounts), Service Control Policies (SCPs) to enforce security guardrails across all accounts (e.g., prevent disabling CloudTrail), and organizational units (OUs) to group accounts by environment",
      "AWS Control Tower \u2014 sets up and governs a multi-account AWS environment",
      "AWS Config \u2014 monitors compliance across accounts"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AWS Organizations provides central management for multiple AWS accounts. Key features: Consolidated billing \u2014 single payment for all accounts, volume discounts. SCPs \u2014 policy guardrails applied at the organization or OU level that restrict what actions can be performed in member accounts (even by account administrators). Organizational units \u2014 group accounts (dev, staging, prod) and apply different policies to each group. AWS Control Tower builds on Organizations to provide a pre-configured multi-account environment.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to build a data pipeline that extracts data from RDS, transforms it (cleaning, aggregation, format conversion), and loads it into Redshift for analytics. The pipeline should run daily and handle failures gracefully. Which AWS service is designed for ETL (Extract, Transform, Load) workloads?",
    "options": [
      "AWS Lambda \u2014 serverless functions for event-driven processing",
      "AWS Glue \u2014 a fully managed ETL service. Glue automatically discovers data schemas (Glue Data Catalog), generates ETL code (Python/Scala), runs ETL jobs on a managed Spark environment, and schedules jobs. Glue handles data from RDS, S3, Redshift, and other sources",
      "Amazon Kinesis \u2014 real-time data streaming service",
      "AWS Step Functions \u2014 orchestrates multi-step workflows"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AWS Glue is the managed ETL service. Components: Glue Data Catalog (metadata repository for all data sources), Glue Crawlers (automatically discover and catalog data schemas), Glue ETL Jobs (PySpark or Python scripts that transform data), Glue Triggers (schedule jobs or trigger on events), and Glue Workflows (orchestrate multi-step ETL pipelines). Glue handles the Spark infrastructure \u2014 no cluster management needed.",
    "questionType": "single"
  },
  {
    "topic": "Cloud Concepts",
    "question": "A company is designing their AWS architecture. The architect wants to ensure that a failure in one component does not cause the entire system to fail. Which AWS Well-Architected Framework pillar addresses this design principle?",
    "options": [
      "Cost Optimization \u2014 designing systems to minimize cost",
      "Reliability \u2014 the ability of a system to recover from failures, dynamically acquire computing resources to meet demand, and mitigate disruptions. Reliability design principles include: automatically recovering from failure, testing recovery procedures, scaling horizontally to increase aggregate availability, and stopping guessing capacity",
      "Performance Efficiency \u2014 using computing resources efficiently",
      "Security \u2014 protecting information and systems"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "The Reliability pillar of the AWS Well-Architected Framework focuses on building systems that recover from failures. Design principles: Automatically recover from failure (use health checks and Auto Scaling). Test recovery procedures (use chaos engineering). Scale horizontally (distribute load across multiple instances). Stop guessing capacity (use Auto Scaling). Manage change through automation (use CloudFormation). A failure in one component should not cascade \u2014 use loose coupling, redundancy, and automatic recovery.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to provide their employees with virtual desktops that they can access from any device (laptop, tablet, thin client) without managing physical desktop hardware. Which AWS service provides cloud-based virtual desktops?",
    "options": [
      "Amazon EC2 \u2014 virtual servers in the cloud",
      "Amazon WorkSpaces \u2014 a managed Desktop-as-a-Service (DaaS) solution. WorkSpaces provides persistent Windows or Linux virtual desktops accessible from any device. AWS manages the desktop infrastructure (hardware, OS patching, backups). Employees access their desktop from anywhere using the WorkSpaces client",
      "AWS AppStream 2.0 \u2014 streams individual applications to browsers",
      "Amazon Connect \u2014 cloud contact center service"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon WorkSpaces provides managed virtual desktops. Benefits: No physical desktop hardware to manage. Employees access their desktop from any device (Windows, Mac, iPad, Android, thin client, browser). AWS manages OS patching, backups, and hardware. Data stays in AWS (not on employee devices) \u2014 improves security. Pricing: monthly or hourly billing. WorkSpaces is different from AppStream 2.0 (which streams individual applications, not full desktops).",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company's security team wants to perform automated security assessments of their EC2 instances to identify software vulnerabilities (unpatched CVEs) and unintended network exposure (open ports). Which AWS service automates this vulnerability scanning?",
    "options": [
      "Amazon GuardDuty \u2014 detects threats using machine learning on logs",
      "Amazon Inspector \u2014 an automated vulnerability management service that continuously scans EC2 instances and container images for software vulnerabilities (CVEs in installed packages) and unintended network exposure (open ports accessible from the internet). Inspector integrates with AWS Systems Manager and provides a risk score for each finding",
      "AWS Security Hub \u2014 aggregates security findings from multiple services",
      "AWS Config \u2014 monitors resource configuration compliance"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon Inspector performs automated vulnerability assessments. For EC2 instances: scans for CVEs in installed packages (OS and application packages), checks network reachability (which ports are accessible from the internet), and integrates with AWS Systems Manager SSM Agent (no separate agent needed). For container images: scans ECR images for CVEs before deployment. Inspector provides a risk score (0-10) for each finding and prioritizes critical vulnerabilities.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to decouple their application components so that if the order processing service is slow, it does not block the checkout service. Orders should be queued and processed as capacity allows. Which AWS service provides message queuing for application decoupling?",
    "options": [
      "Amazon SNS \u2014 publish/subscribe notification service",
      "Amazon SQS (Simple Queue Service) \u2014 a fully managed message queuing service that decouples application components. The checkout service sends order messages to SQS. The order processing service reads messages from SQS at its own pace. If order processing is slow, messages queue in SQS (up to 14 days). This prevents the checkout service from being blocked",
      "Amazon Kinesis \u2014 real-time data streaming service",
      "AWS Step Functions \u2014 orchestrates multi-step workflows"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon SQS decouples application components. Producer (checkout service) sends messages to SQS without waiting for the consumer. Consumer (order processing service) reads messages at its own pace. Benefits: If the consumer is slow, messages queue in SQS (up to 14 days retention). If the consumer fails, messages remain in SQS and are retried. The producer is never blocked by consumer performance. SQS handles message durability, delivery, and retry automatically.",
    "questionType": "single"
  },
  {
    "topic": "Cloud Concepts",
    "question": "A company's CTO asks the AWS Solutions Architect to explain the difference between High Availability and Fault Tolerance. The company's application currently has a single EC2 instance. Which statement CORRECTLY distinguishes these concepts?",
    "options": [
      "High Availability and Fault Tolerance are the same concept \u2014 both ensure systems never go down",
      "High Availability means the system is operational for a high percentage of time (e.g., 99.99% uptime) but may have brief interruptions during failures. Fault Tolerance means the system continues operating without interruption even when components fail \u2014 zero downtime. Fault Tolerance is more expensive (requires redundant active components) than High Availability",
      "Fault Tolerance is only relevant for hardware failures, while High Availability covers software failures",
      "High Availability requires multiple AWS Regions, while Fault Tolerance only requires multiple Availability Zones"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "High Availability vs Fault Tolerance: High Availability: system recovers quickly from failures (brief downtime acceptable). Example: Multi-AZ RDS with 1-2 minute failover. Target: 99.9% to 99.99% uptime. Fault Tolerance: system continues operating without any interruption when components fail. Example: RAID storage (continues if one disk fails), active-active multi-region deployment. Target: 100% uptime. Fault tolerance requires more redundancy and is more expensive. For the single EC2 instance, neither is achieved \u2014 a single point of failure.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to implement a publish-subscribe messaging pattern where a single event (new order placed) triggers multiple downstream actions simultaneously: send confirmation email, update inventory, trigger fulfillment, and log to analytics. Which AWS service enables fan-out messaging to multiple subscribers?",
    "options": [
      "Amazon SQS \u2014 message queuing for point-to-point communication",
      "Amazon SNS (Simple Notification Service) \u2014 a pub/sub messaging service. The order service publishes a message to an SNS topic. SNS fans out the message simultaneously to all subscribers: an SQS queue for email service, an SQS queue for inventory service, an SQS queue for fulfillment service, and a Lambda function for analytics",
      "Amazon EventBridge \u2014 event bus for application integration",
      "AWS Step Functions \u2014 orchestrates sequential workflows"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon SNS implements the pub/sub pattern. Publishers send messages to an SNS topic. SNS delivers the message to all subscribers simultaneously (fan-out). Subscribers can be: SQS queues, Lambda functions, HTTP endpoints, email addresses, SMS, and mobile push notifications. The SNS-SQS fan-out pattern is common: SNS fans out to multiple SQS queues, each queue feeds a different microservice. This decouples the publisher from all subscribers.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to migrate their on-premises file server (Windows SMB file shares) to AWS. Employees need to continue accessing files using their existing Windows file share mappings (drive letters). Which AWS service provides managed Windows file shares?",
    "options": [
      "Amazon S3 \u2014 object storage that requires application code changes to access",
      "Amazon FSx for Windows File Server \u2014 a fully managed Windows-native file system that supports the SMB protocol and Windows NTFS. Employees can map drive letters to FSx shares using the same UNC paths as on-premises. FSx integrates with Active Directory for user authentication",
      "Amazon EFS \u2014 managed NFS file system for Linux workloads",
      "AWS Storage Gateway \u2014 hybrid storage service connecting on-premises to AWS"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon FSx for Windows File Server provides managed Windows file shares. It supports: SMB protocol (Windows native file sharing), Windows NTFS file system, Active Directory integration (same user authentication as on-premises), DFS Namespaces (for transparent migration), and Windows ACLs (file permissions). Employees continue using the same drive mappings \u2014 no application changes needed. FSx handles hardware, software, patching, and backups.",
    "questionType": "single"
  },
  {
    "topic": "Cloud Concepts",
    "question": "A company is reviewing their AWS architecture with the Well-Architected Framework. The review reveals that they are running EC2 instances at 5% average CPU utilization and have provisioned 10x more RDS storage than they use. Which Well-Architected pillar should they focus on?",
    "options": [
      "Reliability \u2014 improving system availability and fault tolerance",
      "Cost Optimization \u2014 eliminating waste by right-sizing resources. Use AWS Compute Optimizer to get EC2 right-sizing recommendations. Use RDS storage autoscaling to start with minimum storage and grow as needed. Identify and terminate idle resources. Use Reserved Instances for predictable workloads",
      "Performance Efficiency \u2014 improving system performance",
      "Operational Excellence \u2014 improving operations and processes"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Cost Optimization pillar addresses waste elimination. Design principles: Implement cloud financial management, adopt a consumption model (pay for what you use), measure overall efficiency, stop spending money on undifferentiated heavy lifting, and analyze and attribute expenditure. For this company: EC2 at 5% CPU \u2014 right-size to smaller instances or use Auto Scaling. 10x over-provisioned RDS storage \u2014 enable storage autoscaling. AWS Compute Optimizer analyzes utilization and recommends right-sized instances.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to protect their web application from common web exploits such as SQL injection, cross-site scripting (XSS), and malicious bots. They want to create rules that block specific IP addresses and geographic regions. Which AWS service provides web application firewall capabilities?",
    "options": [
      "AWS Shield \u2014 protects against DDoS attacks",
      "AWS WAF (Web Application Firewall) \u2014 protects web applications from common exploits. WAF rules can: block SQL injection and XSS patterns, allow or block specific IP addresses or CIDR ranges, block traffic from specific countries (geographic match), rate-limit requests from single IPs, and use AWS Managed Rules (pre-built rule groups for OWASP Top 10)",
      "Amazon GuardDuty \u2014 detects threats using machine learning",
      "AWS Network Firewall \u2014 stateful network traffic filtering"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AWS WAF is the web application firewall service. It operates at Layer 7 (HTTP/HTTPS). WAF inspects HTTP requests and applies rules to allow, block, or count matching requests. Rule types: IP set rules (block specific IPs), geographic match rules (block countries), rate-based rules (block IPs exceeding request rate), regex pattern rules (block SQL injection, XSS patterns), and managed rule groups (AWS Managed Rules for OWASP Top 10, Bot Control, Known Bad Inputs). WAF integrates with CloudFront, ALB, API Gateway, and AppSync.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to run their batch processing jobs (video transcoding, report generation) only when EC2 Spot Instances are available at a low price. The jobs can be interrupted and resumed. Which AWS service manages batch job scheduling and execution on Spot Instances?",
    "options": [
      "AWS Lambda \u2014 serverless functions with 15-minute maximum duration",
      "AWS Batch \u2014 a fully managed batch processing service that automatically provisions EC2 or Spot Instances based on job requirements, queues jobs, scales compute resources up and down, and retries failed jobs. AWS Batch handles the infrastructure so you focus on the batch code",
      "Amazon ECS \u2014 container orchestration service",
      "AWS Step Functions \u2014 orchestrates multi-step workflows"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AWS Batch is designed for batch computing workloads. It manages: job queues (jobs wait here until compute is available), compute environments (EC2 On-Demand or Spot Instances, automatically scaled), job definitions (Docker container with resource requirements), and job scheduling (runs jobs when compute is available). For Spot Instances: AWS Batch automatically handles Spot interruptions by retrying jobs on new instances. Ideal for video transcoding, simulation, genomics, and financial modeling.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company wants to ensure that all API calls made to their AWS account are logged, including who made the call, when, from which IP address, and what parameters were used. This log must be stored securely and cannot be deleted by regular users. Which AWS service provides this audit trail?",
    "options": [
      "Amazon CloudWatch Logs \u2014 stores application and system logs",
      "AWS CloudTrail \u2014 records all API calls made to AWS services. CloudTrail logs include: who made the call (IAM user/role ARN), when (timestamp), what API was called (e.g., ec2:RunInstances), parameters (instance type, AMI ID), and source IP. Store CloudTrail logs in an S3 bucket with Object Lock to prevent deletion",
      "AWS Config \u2014 records configuration changes to AWS resources",
      "Amazon VPC Flow Logs \u2014 captures network traffic information"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AWS CloudTrail is the API audit logging service. It records every API call made to AWS services: management events (creating/deleting resources), data events (S3 object reads/writes, Lambda invocations), and Insights events (unusual API activity). CloudTrail logs are delivered to S3. To prevent deletion: enable S3 Object Lock on the CloudTrail bucket (Compliance mode), create a separate account for the CloudTrail bucket, and restrict access to the bucket.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to implement a hybrid storage solution where their on-premises applications can access AWS S3 storage using standard file protocols (NFS, SMB) without changing the application code. Which AWS service enables this?",
    "options": [
      "Amazon EFS \u2014 managed NFS file system only accessible from within AWS",
      "AWS Storage Gateway (File Gateway) \u2014 presents S3 storage as NFS or SMB file shares to on-premises applications. Applications write to the file share using standard protocols. Storage Gateway caches frequently accessed data locally for low-latency access and asynchronously uploads data to S3. Applications see a standard file system but data is stored in S3",
      "AWS Direct Connect \u2014 dedicated network connection to AWS",
      "Amazon FSx \u2014 managed file systems for Windows and Lustre"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AWS Storage Gateway File Gateway bridges on-premises file access with S3 storage. On-premises applications access files via NFS (Linux) or SMB (Windows) protocols \u2014 no application changes needed. The gateway appliance (VM or hardware) caches frequently accessed files locally for low-latency access. Files are stored as S3 objects. Benefits: access S3 from on-premises applications, local cache for performance, S3 durability and scalability, and integration with S3 lifecycle policies for cost optimization.",
    "questionType": "single"
  },
  {
    "topic": "Cloud Concepts",
    "question": "A company is evaluating AWS support plans. Their production application generates revenue 24/7. If the application goes down, they lose $10,000 per hour. They need access to AWS technical support engineers 24/7 for production system failures, with a response time under 1 hour. Which AWS Support plan meets this requirement?",
    "options": [
      "Basic Support \u2014 free, includes documentation and community forums only",
      "Business Support \u2014 includes 24/7 access to Cloud Support Engineers via phone, chat, and email. Response time for production system down: less than 1 hour. Includes AWS Trusted Advisor full checks, AWS Health API access, and Infrastructure Event Management (additional fee)",
      "Developer Support \u2014 business hours access to support engineers, 12-24 hour response time",
      "Enterprise Support \u2014 includes a Technical Account Manager (TAM) and 15-minute response for business-critical system down"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AWS Business Support meets the requirements: 24/7 phone, chat, and email access to Cloud Support Engineers. Response times: General guidance (24 hours), System impaired (12 hours), Production system impaired (4 hours), Production system down (1 hour). For $10,000/hour revenue loss, Business Support ($100/month minimum or 10% of monthly AWS charges) is cost-justified. Enterprise Support has a 15-minute response for business-critical system down but costs significantly more.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to analyze their AWS costs and identify cost-saving opportunities. They want to visualize spending trends over time, filter costs by service, region, and tags, and forecast future costs. Which AWS service provides this cost analysis capability?",
    "options": [
      "AWS Budgets \u2014 sets cost alerts and automated actions",
      "AWS Cost Explorer \u2014 provides interactive visualizations of AWS costs and usage. Cost Explorer shows: cost trends over time (daily, monthly), cost breakdown by service, region, account, and tags, Reserved Instance and Savings Plans utilization, and cost forecasts for the next 12 months. Cost Explorer also provides rightsizing recommendations",
      "AWS Trusted Advisor \u2014 provides cost optimization recommendations",
      "AWS Pricing Calculator \u2014 estimates costs for planned architectures"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AWS Cost Explorer is the cost analysis and visualization service. Features: Interactive graphs showing cost trends (daily/monthly). Filter and group by service (EC2, RDS, S3), region, account, availability zone, and cost allocation tags. Reserved Instance and Savings Plans utilization and coverage reports. Cost forecasting (12-month projection based on historical usage). Rightsizing recommendations (identify over-provisioned EC2 instances). Cost Explorer is free to use.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company wants to store their application's database passwords, API keys, and OAuth tokens securely. The secrets must be automatically rotated every 90 days. Applications should retrieve secrets programmatically without hardcoding them. Which AWS service is designed for secrets management with automatic rotation?",
    "options": [
      "AWS Systems Manager Parameter Store \u2014 stores configuration data and secrets",
      "AWS Secrets Manager \u2014 a secrets management service that stores, retrieves, and automatically rotates secrets. Secrets Manager integrates with RDS, Redshift, and DocumentDB for automatic password rotation. Applications retrieve secrets via API \u2014 no hardcoded credentials. Rotation Lambda functions update the secret and the database password simultaneously",
      "AWS KMS \u2014 manages encryption keys",
      "AWS Certificate Manager \u2014 manages SSL/TLS certificates"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AWS Secrets Manager is purpose-built for secrets management with rotation. Features: Secure storage (secrets encrypted with KMS). Automatic rotation \u2014 built-in rotation for RDS, Redshift, DocumentDB, and custom rotation via Lambda. Programmatic retrieval \u2014 applications call the Secrets Manager API to get the current secret value. Audit trail \u2014 all secret access is logged in CloudTrail. Fine-grained access control via IAM policies. Parameter Store stores secrets but does not have built-in automatic rotation.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to implement a content moderation system that automatically detects inappropriate images (nudity, violence, offensive content) uploaded by users to their platform. They do not have a machine learning team. Which AWS service provides pre-built image moderation capabilities?",
    "options": [
      "Amazon SageMaker \u2014 build and train custom ML models",
      "Amazon Rekognition \u2014 a computer vision service that provides pre-built image and video analysis. Rekognition Content Moderation detects explicit or suggestive adult content, violence, visually disturbing content, and other inappropriate content in images and videos. No ML expertise required \u2014 call the API with an image and receive moderation labels with confidence scores",
      "Amazon Comprehend \u2014 natural language processing for text analysis",
      "Amazon Textract \u2014 extracts text from documents"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon Rekognition provides pre-built computer vision capabilities without ML expertise. Content Moderation API: DetectModerationLabels returns labels (e.g., 'Explicit Nudity', 'Violence', 'Graphic Violence') with confidence scores. Supports images (JPEG, PNG) and video (stored in S3). Other Rekognition capabilities: face detection and analysis, celebrity recognition, text in images, object and scene detection, and custom labels (train on your own images).",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to implement a search feature in their e-commerce application. The search must support full-text search, faceted filtering (filter by category, price range, brand), and return results in under 100ms for millions of products. Which AWS service provides this search capability?",
    "options": [
      "Amazon RDS with LIKE queries \u2014 SQL full-text search",
      "Amazon OpenSearch Service (formerly Elasticsearch Service) \u2014 a managed search and analytics service. OpenSearch supports full-text search with relevance ranking, faceted search (aggregations for filtering), and sub-100ms response times at scale. Ingest product data from DynamoDB or RDS via Lambda or Kinesis",
      "Amazon DynamoDB \u2014 NoSQL database with query capabilities",
      "Amazon CloudSearch \u2014 managed search service (legacy)"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon OpenSearch Service is the managed search platform. Full-text search with relevance scoring (TF-IDF, BM25). Faceted search via aggregations (count products by category, price histogram). Sub-100ms response times with proper index design. Scales to billions of documents. Common architecture: product catalog stored in RDS/DynamoDB (source of truth), synced to OpenSearch for search. OpenSearch handles the search complexity (tokenization, stemming, relevance ranking).",
    "questionType": "single"
  },
  {
    "topic": "Cloud Concepts",
    "question": "A company is designing their AWS architecture. The architect wants to ensure that if one Availability Zone fails, the application continues to function. The application currently runs on a single EC2 instance in one AZ. Which architectural change achieves AZ fault tolerance?",
    "options": [
      "Move the EC2 instance to a larger instance type \u2014 more powerful instances are more reliable",
      "Deploy EC2 instances in at least two Availability Zones behind an Application Load Balancer. The ALB distributes traffic across both AZs. If one AZ fails, the ALB routes all traffic to the healthy AZ. Use an Auto Scaling group spanning multiple AZs to automatically replace failed instances",
      "Enable EC2 detailed monitoring \u2014 faster detection of instance failures",
      "Use an Elastic IP address \u2014 it can be remapped to a new instance if the current one fails"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AZ fault tolerance requires distributing workloads across multiple AZs. ALB with multi-AZ deployment: ALB health checks detect unhealthy instances and stop routing traffic to them. If an entire AZ fails, ALB routes all traffic to instances in healthy AZs. Auto Scaling group spanning multiple AZs: if an instance fails, Auto Scaling launches a replacement. If an AZ fails, Auto Scaling launches replacement instances in the remaining AZs. This is the standard AWS high availability pattern.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to provide their data scientists with a managed environment to build, train, and deploy machine learning models. The environment should include Jupyter notebooks, pre-built ML algorithms, and the ability to train models on GPU instances without managing infrastructure. Which AWS service provides this?",
    "options": [
      "Amazon EC2 with GPU instances \u2014 launch GPU instances and install ML frameworks",
      "Amazon SageMaker \u2014 a fully managed ML platform. SageMaker Studio provides Jupyter notebooks in a managed environment. SageMaker Training runs distributed training jobs on any instance type (including GPU). SageMaker includes built-in algorithms and supports TensorFlow, PyTorch, and scikit-learn. SageMaker Endpoints deploy trained models for inference",
      "AWS Deep Learning AMIs \u2014 EC2 AMIs with ML frameworks pre-installed",
      "Amazon EMR \u2014 managed Hadoop/Spark for big data processing"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon SageMaker is the end-to-end ML platform. SageMaker Studio: web-based IDE with Jupyter notebooks, experiment tracking, and model registry. SageMaker Training: managed training jobs on any EC2 instance type \u2014 specify the instance type and count, SageMaker provisions and terminates instances automatically. Built-in algorithms: XGBoost, Linear Learner, K-Means, and more. SageMaker Endpoints: deploy models for real-time or batch inference. No infrastructure management needed.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company processes sensitive financial transactions. They need a highly available, durable message queue that guarantees messages are processed exactly once and in the exact order they were sent. Standard SQS queues deliver messages at least once and may deliver them out of order. Which SQS queue type meets these requirements?",
    "options": [
      "Standard SQS \u2014 maximum throughput but at-least-once delivery and best-effort ordering",
      "SQS FIFO (First-In-First-Out) Queue \u2014 guarantees that messages are processed exactly once (deduplication) and in the exact order they were sent. FIFO queues support up to 3,000 messages per second with batching. Ideal for financial transactions where order and exactly-once processing are critical",
      "Amazon Kinesis Data Streams \u2014 real-time data streaming with ordering",
      "Amazon MQ \u2014 managed Apache ActiveMQ for legacy messaging protocols"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "SQS FIFO queues provide: Exactly-once processing \u2014 message deduplication using a deduplication ID prevents duplicate processing. Strict ordering \u2014 messages are delivered in the exact order they are sent (First-In-First-Out). Message groups \u2014 multiple ordered streams within a single queue. Throughput: 300 messages/second without batching, 3,000 messages/second with batching. For financial transactions where a payment must be processed before a refund, FIFO ordering is critical.",
    "questionType": "single"
  },
  {
    "topic": "Cloud Concepts",
    "question": "A company is reviewing their AWS architecture for the Performance Efficiency pillar of the Well-Architected Framework. Which of the following is a design principle of the Performance Efficiency pillar?",
    "options": [
      "Implement a strong identity foundation \u2014 use IAM roles and least privilege",
      "Democratize advanced technologies \u2014 use managed services (ML, databases, analytics) instead of building custom solutions. AWS provides managed services for tasks that would require specialized expertise to build and maintain, allowing teams to focus on their core business",
      "Automate security best practices \u2014 use security groups and NACLs",
      "Implement change management \u2014 use CloudFormation for infrastructure changes"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Performance Efficiency pillar design principles: Democratize advanced technologies (use managed services instead of building custom solutions). Go global in minutes (deploy in multiple regions for low latency). Use serverless architectures (eliminate operational burden of managing servers). Experiment more often (use cloud to test different instance types and configurations). Consider mechanical sympathy (understand how cloud services work to use them most efficiently).",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to implement API rate limiting to prevent abuse of their REST API. They want to throttle requests to 1,000 per second per client and cache API responses for 5 minutes to reduce backend load. Which AWS service provides these capabilities?",
    "options": [
      "Amazon CloudFront \u2014 CDN for content caching",
      "Amazon API Gateway \u2014 a fully managed service for creating, deploying, and managing REST, HTTP, and WebSocket APIs. API Gateway provides: throttling (set rate limits per API key or per method), caching (cache responses at the API Gateway layer with configurable TTL), usage plans (define quotas and throttle limits per API key), and request/response transformation",
      "AWS WAF \u2014 web application firewall for blocking malicious traffic",
      "Elastic Load Balancing \u2014 distributes traffic across multiple targets"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon API Gateway provides comprehensive API management. Throttling: set default throttle limits (requests per second and burst) at the stage level, method level, or per API key. Usage Plans: create usage plans with throttle limits and quotas, associate API keys with usage plans for per-client rate limiting. Caching: enable API Gateway cache (0.5GB to 237GB), set TTL per method. Cached responses are served without invoking the backend, reducing Lambda costs and improving latency.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to implement a disaster recovery strategy for their application. They want to maintain a minimal footprint in the DR region (just enough to recover quickly) without running full production capacity. The RTO is 1 hour and RPO is 15 minutes. Which DR strategy matches these requirements?",
    "options": [
      "Backup and Restore \u2014 take snapshots and restore in DR region. Low cost but RTO of 4-8 hours",
      "Warm Standby \u2014 maintain a scaled-down but functional version of the production environment in the DR region. RDS cross-region read replica (promotes in 5-10 minutes), scaled-down EC2 fleet (scale up during failover), and Route 53 health checks for automatic DNS failover. Meets 1-hour RTO and 15-minute RPO",
      "Multi-Site Active-Active \u2014 run full production in two regions simultaneously. Zero RTO but highest cost",
      "Pilot Light \u2014 keep only the core database running in DR region. RTO may exceed 1 hour"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Warm Standby is the middle ground between Pilot Light and Multi-Site: Maintains a scaled-down running environment in the DR region. RDS cross-region read replica has less than 15-minute replication lag (meets RPO). During failover: promote RDS replica to primary (5-10 minutes), scale up EC2 Auto Scaling group (5-10 minutes), Route 53 DNS failover (1-2 minutes). Total failover under 1 hour (meets RTO). More expensive than Pilot Light but cheaper than Multi-Site Active-Active.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to implement a data lake on AWS. They want to store structured, semi-structured, and unstructured data in a central repository, catalog the data for discoverability, and enable analytics using SQL, ML, and custom code. Which combination of AWS services forms the foundation of a data lake?",
    "options": [
      "Amazon RDS and Amazon Redshift \u2014 relational databases for structured data",
      "Amazon S3 (central storage for all data types), AWS Glue Data Catalog (metadata catalog for data discoverability), Amazon Athena (SQL queries on S3 data), Amazon EMR (big data processing with Spark), and Amazon SageMaker (ML on data lake data)",
      "Amazon DynamoDB and Amazon ElastiCache \u2014 NoSQL and caching for high performance",
      "Amazon Kinesis and Amazon SQS \u2014 streaming and queuing for real-time data"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "AWS data lake architecture: S3 as the central storage layer \u2014 stores raw, processed, and curated data in any format (CSV, Parquet, JSON, images, video). Glue Data Catalog \u2014 metadata repository that makes data discoverable (table definitions, schemas, partitions). Athena \u2014 serverless SQL queries on S3 data using Glue catalog. EMR \u2014 large-scale data processing with Spark, Hive, Presto. SageMaker \u2014 ML on data lake data. Lake Formation simplifies data lake setup and manages access control.",
    "questionType": "single"
  },
  {
    "topic": "Cloud Concepts",
    "question": "A company's AWS architect is explaining the benefits of using managed services versus self-managed services on EC2. For example, using Amazon RDS instead of running MySQL on EC2. Which statement BEST describes the trade-off?",
    "options": [
      "Managed services are always more expensive than self-managed EC2 \u2014 you pay a premium for AWS management",
      "Managed services reduce operational overhead (patching, backups, failover, scaling) but provide less control over configuration. Self-managed on EC2 provides full control but requires the customer to handle all operational tasks. For most workloads, managed services reduce total cost of ownership when staff time is factored in",
      "Self-managed EC2 is always better because you have full control over the environment",
      "Managed services are only suitable for small workloads \u2014 large enterprises should self-manage"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "The managed vs self-managed trade-off: Managed services (RDS, ElastiCache, MSK): AWS handles patching, backups, failover, scaling, and monitoring. Less operational overhead. Less configuration control. Typically higher per-unit cost but lower total cost when staff time is included. Self-managed on EC2: Full control over configuration (custom MySQL settings, plugins). Customer responsible for all operations. Lower per-unit cost but higher total cost when staff time is included. For most workloads, managed services are preferred \u2014 staff time is expensive.",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company wants to implement a real-time data streaming pipeline that ingests clickstream data from their website (1 million events per second), processes it in real-time to detect fraud patterns, and stores the raw data for later batch analysis. Which AWS service is designed for real-time data streaming at this scale?",
    "options": [
      "Amazon SQS \u2014 message queuing for application decoupling",
      "Amazon Kinesis Data Streams \u2014 a real-time data streaming service that can ingest millions of events per second. Kinesis Data Streams stores data for up to 365 days. Multiple consumers can read from the same stream simultaneously \u2014 one for real-time fraud detection (Kinesis Data Analytics), one for storage (Kinesis Data Firehose to S3)",
      "Amazon SNS \u2014 pub/sub notification service",
      "AWS Lambda \u2014 serverless functions for event processing"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Amazon Kinesis Data Streams is designed for real-time data streaming at massive scale. Ingests millions of events per second. Data is available for processing within milliseconds. Multiple consumers can read from the same stream simultaneously (fan-out). Data retention: 24 hours to 365 days. Kinesis ecosystem: Kinesis Data Analytics (real-time SQL/Flink processing), Kinesis Data Firehose (load streaming data to S3, Redshift, OpenSearch), Kinesis Video Streams (video streaming).",
    "questionType": "single"
  },
  {
    "topic": "AWS Services",
    "question": "A company's application is deployed in us-east-1. They want to ensure that if the entire us-east-1 region becomes unavailable, their application automatically fails over to eu-west-1 within 5 minutes. Which Route 53 routing policy enables automatic regional failover?",
    "options": [
      "Weighted routing \u2014 distributes traffic between regions based on weights",
      "Failover routing \u2014 configure a primary record pointing to the us-east-1 endpoint and a secondary record pointing to eu-west-1. Route 53 health checks monitor the us-east-1 endpoint. If the health check fails, Route 53 automatically routes all traffic to the eu-west-1 secondary endpoint",
      "Latency routing \u2014 routes users to the region with the lowest latency",
      "Geolocation routing \u2014 routes users based on their geographic location"
    ],
    "correctAnswers": [
      1
    ],
    "explanation": "Route 53 Failover routing implements active-passive failover. Configure: Primary record (us-east-1) with a health check. Secondary record (eu-west-1) \u2014 used when primary is unhealthy. Route 53 health checks monitor the primary endpoint every 10-30 seconds. If the health check fails 3 consecutive times (30-90 seconds), Route 53 marks the primary as unhealthy and routes traffic to the secondary. DNS TTL determines how quickly clients switch (typically 60-300 seconds).",
    "questionType": "single"
  }
];

async function seedQuestions() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL || '');

  // Add remaining SAA questions
  console.log('Adding', extraSAA.length, 'more hard SAA-C03 questions...');
  for (const q of extraSAA) {
    await conn.execute(
      'INSERT INTO aws_questions (certification, topic, question_text, options, correct_answers, explanation, question_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['SAA-C03', q.topic, q.question, JSON.stringify(q.options), JSON.stringify(q.correctAnswers.map(i => q.options[i])), q.explanation, q.questionType]
    );
  }
  const [saaRows] = await conn.execute("SELECT COUNT(*) as count FROM aws_questions WHERE certification = 'SAA-C03'");
  console.log('SAA-C03 total:', saaRows[0].count);

  // Replace CLF questions
  console.log('Deleting ALL existing CLF-C02 questions...');
  const [del] = await conn.execute("DELETE FROM aws_questions WHERE certification = 'CLF-C02'");
  console.log('Deleted CLF rows:', del.affectedRows);

  console.log('Inserting', clfQuestions.length, 'hard CLF-C02 questions...');
  for (const q of clfQuestions) {
    await conn.execute(
      'INSERT INTO aws_questions (certification, topic, question_text, options, correct_answers, explanation, question_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['CLF-C02', q.topic, q.question, JSON.stringify(q.options), JSON.stringify(q.correctAnswers.map(i => q.options[i])), q.explanation, q.questionType]
    );
  }
  const [clfRows] = await conn.execute("SELECT COUNT(*) as count FROM aws_questions WHERE certification = 'CLF-C02'");
  console.log('CLF-C02 total:', clfRows[0].count);

  await conn.end();
  console.log('Done!');
}

seedQuestions().catch(console.error);