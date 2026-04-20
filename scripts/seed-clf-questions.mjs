import mysql from 'mysql2/promise';

const clfQuestions = [
  {
    topic: "Cloud Concepts",
    question: "A startup is evaluating whether to host their new web application on-premises or on AWS. The CTO is concerned about unpredictable growth — if the application becomes popular, they may need to handle 100x the initial traffic within days. If it does not grow, they do not want to pay for unused capacity. Which AWS cloud characteristic BEST addresses this concern?",
    options: [
      "High availability — on-premises data centers cannot achieve 99.99% uptime without AWS",
      "Elasticity — on-premises infrastructure requires purchasing hardware upfront for peak capacity, which sits idle during low-traffic periods and cannot scale quickly enough during sudden demand spikes",
      "Security — AWS provides better security than on-premises data centers through shared responsibility",
      "Global reach — on-premises infrastructure cannot serve users in multiple geographic regions"
    ],
    correctAnswers: [1],
    explanation: "Elasticity is the ability to scale resources up or down automatically based on demand. On-premises infrastructure requires purchasing hardware for peak capacity (capital expense), which sits idle during low-traffic periods and cannot be provisioned quickly enough during sudden demand spikes. AWS elasticity allows the startup to start small, scale instantly to 100x traffic if needed, and pay only for what they use.",
    questionType: "single"
  },
  {
    topic: "Cloud Concepts",
    question: "A company is migrating to AWS and their CFO wants to understand the financial benefits. Currently, the company spends $2M/year on data center hardware replaced every 5 years, $500K/year on facilities (power, cooling, space), and $300K/year on IT staff for hardware maintenance. Hardware is typically utilized at 20% capacity on average. Which statement BEST describes the economic advantage of moving to AWS?",
    options: [
      "AWS eliminates all IT costs — the company will no longer need any IT staff after migrating",
      "AWS converts capital expenditure (CapEx) to operational expenditure (OpEx), eliminates idle capacity costs by charging only for resources used, and removes facilities and hardware maintenance costs — the company pays only for the 20% capacity actually used rather than 100% of the hardware",
      "AWS is always cheaper than on-premises — every company saves money by migrating to the cloud",
      "AWS provides a fixed monthly cost that is easier to budget than variable on-premises costs"
    ],
    correctAnswers: [1],
    explanation: "The core economic benefit is converting CapEx (large upfront hardware purchases) to OpEx (pay-as-you-go). The company currently pays for 100% of hardware capacity but uses only 20% — 80% is wasted. AWS charges only for resources consumed. Facilities costs and hardware maintenance staff costs are eliminated. Note: AWS is not always cheaper, and some IT staff are still needed for cloud management.",
    questionType: "single"
  },
  {
    topic: "Security",
    question: "A company is deploying a web application on AWS. The security team wants to understand who is responsible for patching the operating system on EC2 instances, encrypting data stored in S3, and maintaining the physical security of the AWS data centers. According to the AWS Shared Responsibility Model, which answer correctly assigns responsibilities?",
    options: [
      "AWS is responsible for all three: OS patching, S3 encryption, and physical security",
      "The customer is responsible for all three: OS patching, S3 encryption, and physical security",
      "AWS is responsible for physical data center security; the customer is responsible for patching the OS on EC2 instances and choosing to enable S3 encryption",
      "AWS is responsible for physical security and S3 encryption; the customer is responsible only for OS patching"
    ],
    correctAnswers: [2],
    explanation: "The Shared Responsibility Model divides security into 'security OF the cloud' (AWS) and 'security IN the cloud' (customer). AWS is responsible for the physical infrastructure, including data center physical security, hardware, and the hypervisor. The customer is responsible for the guest OS on EC2 instances (including patching) and for enabling and configuring encryption for their data in S3. AWS provides the encryption capability, but the customer must choose to use it.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A small business owner wants to run a simple WordPress website on AWS. They have no technical staff and want to spend minimal time managing servers, databases, or infrastructure. They want the website to be available 24/7 and scale automatically if traffic increases. Which AWS service combination is MOST appropriate?",
    options: [
      "EC2 with a manually configured LAMP stack, RDS MySQL, and a custom Auto Scaling group",
      "Amazon Lightsail, which provides pre-configured WordPress instances with a simple management console, fixed monthly pricing, and built-in load balancing",
      "AWS Elastic Beanstalk with a PHP environment, RDS MySQL, and Application Load Balancer",
      "Amazon ECS with a WordPress Docker container, Aurora Serverless, and an Application Load Balancer"
    ],
    correctAnswers: [1],
    explanation: "Amazon Lightsail is specifically designed for small businesses and individuals who want simple, predictable pricing and minimal infrastructure management. It provides pre-configured WordPress blueprints, a simplified management console, and fixed monthly pricing. The other options require significant technical knowledge to configure and maintain, which contradicts the requirement for minimal management time.",
    questionType: "single"
  },
  {
    topic: "Storage",
    question: "A company stores employee documents (contracts, performance reviews) in an on-premises file server. They want to migrate to AWS and need a solution that: allows employees to access files using familiar Windows file sharing (SMB protocol), integrates with their existing Active Directory for authentication, and provides automatic backups. Which AWS service BEST meets these requirements?",
    options: [
      "Amazon S3 with a custom IAM policy for each employee",
      "Amazon EFS (Elastic File System) with NFS protocol",
      "Amazon FSx for Windows File Server, which provides fully managed Windows-native file storage with SMB support and Active Directory integration",
      "AWS Storage Gateway File Gateway, which caches frequently accessed files locally"
    ],
    correctAnswers: [2],
    explanation: "Amazon FSx for Windows File Server is a fully managed Windows file system that supports SMB protocol (the native Windows file sharing protocol), integrates directly with Active Directory for authentication, and provides automated backups. It is purpose-built to replace Windows file servers. EFS uses NFS protocol (not SMB/Windows-native). S3 doesn't support SMB. Storage Gateway is for hybrid scenarios where you need local caching.",
    questionType: "single"
  },
  {
    topic: "Networking",
    question: "A company has a 3-tier web application on AWS with web servers, application servers, and a database. A security audit finds that the database is directly accessible from the internet. The security team wants to ensure the database can only be accessed by the application servers, not from the internet. Which AWS feature should be used to enforce this?",
    options: [
      "Enable Multi-AZ on the RDS database, which prevents direct internet access",
      "Place the database in a private subnet with no route to an Internet Gateway, and configure a Security Group that only allows inbound traffic from the application server Security Group",
      "Enable RDS encryption at rest, which prevents unauthorized access from the internet",
      "Use AWS Shield to protect the database from DDoS attacks"
    ],
    correctAnswers: [1],
    explanation: "A private subnet (no route to an Internet Gateway) prevents the database from being directly reachable from the internet at the network level. Security Groups act as virtual firewalls — by allowing inbound traffic only from the application server Security Group (not from 0.0.0.0/0), only the application servers can connect to the database. Multi-AZ provides high availability, not access control. Encryption protects data at rest, not network access. Shield protects against DDoS, not unauthorized access.",
    questionType: "single"
  },
  {
    topic: "Pricing",
    question: "A company runs a batch processing job every night from 11pm to 3am that analyzes the previous day's sales data. The job runs on a single EC2 instance. The job has been running reliably for 2 years. The company wants to reduce the cost of this EC2 instance as much as possible. Which purchasing option provides the GREATEST discount while being appropriate for this workload?",
    options: [
      "On-Demand Instances — pay for exactly 4 hours per night with no commitment",
      "Spot Instances — up to 90% discount, and since the job runs at night when demand is low, interruptions are unlikely",
      "Reserved Instances (1-year, All Upfront) — approximately 40% discount for a predictable, consistent workload",
      "Dedicated Hosts — provides the most cost-effective option for compliance-sensitive workloads"
    ],
    correctAnswers: [2],
    explanation: "The batch job runs every night at the same time for 2 years — this is a perfectly predictable workload. Reserved Instances (1-year, All Upfront) provide approximately 40% discount for this commitment. Spot Instances provide a larger discount (up to 90%) but can be interrupted — for a critical nightly batch job that must complete, interruption risk is unacceptable. On-Demand provides no discount. Dedicated Hosts are for compliance/licensing requirements and are more expensive.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A retail company wants to send promotional emails to 5 million customers when new products launch. They currently use an on-premises mail server that frequently gets blacklisted due to spam complaints. They want a managed service that handles email deliverability, bounce management, and complaint handling automatically. Which AWS service should they use?",
    options: [
      "Amazon SNS (Simple Notification Service) — for sending notifications to millions of users",
      "Amazon SES (Simple Email Service) — a cloud-based email sending service with built-in deliverability management, bounce handling, and complaint processing",
      "Amazon SQS (Simple Queue Service) — for queuing email messages for delivery",
      "AWS Lambda with a custom SMTP server — for full control over email delivery"
    ],
    correctAnswers: [1],
    explanation: "Amazon SES is specifically designed for high-volume email sending. It manages email deliverability (maintaining sender reputation), automatically handles bounces (invalid email addresses) and complaints (spam reports), and provides sending statistics. SNS is for push notifications (SMS, mobile push, HTTP) — not bulk email marketing. SQS is a message queue, not an email service. A custom Lambda SMTP server would recreate the same deliverability problems they currently have.",
    questionType: "single"
  },
  {
    topic: "Cloud Concepts",
    question: "A company's development team wants to experiment with new AWS services and run proof-of-concept projects. They are worried about accidentally incurring large costs if a developer forgets to shut down resources. Which combination of AWS features helps manage and control costs for experimental workloads?",
    options: [
      "Use AWS Cost Explorer to review costs after they occur and identify expensive resources",
      "Create a separate AWS account for development with AWS Budgets alerts set to notify when spending exceeds a threshold, use AWS Cost Allocation Tags to track costs by project, and set up AWS Budget Actions to automatically stop EC2 instances if the budget is exceeded",
      "Use Reserved Instances for all development resources to get the lowest possible cost",
      "Enable AWS Trusted Advisor, which automatically shuts down unused resources to prevent cost overruns"
    ],
    correctAnswers: [1],
    explanation: "A separate account isolates development costs from production. AWS Budgets alerts notify the team before costs become excessive. Cost Allocation Tags allow tracking costs by project or developer. AWS Budget Actions can automatically apply IAM policies or stop EC2 instances when a budget threshold is breached — providing automated cost control. Cost Explorer is retrospective (after costs occur). Reserved Instances require commitment and are inappropriate for experimental workloads. Trusted Advisor provides recommendations but does not automatically shut down resources.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to run a containerized application without managing any servers or clusters. They want to simply provide a Docker container image and have AWS handle all the infrastructure, scaling, and availability. Which AWS service BEST meets this requirement?",
    options: [
      "Amazon EC2 with Docker installed manually",
      "Amazon ECS on EC2 launch type, which manages container orchestration on EC2 instances",
      "AWS Fargate, which runs containers without requiring you to provision or manage servers",
      "Amazon EKS (Elastic Kubernetes Service), which provides managed Kubernetes clusters"
    ],
    correctAnswers: [2],
    explanation: "AWS Fargate is a serverless compute engine for containers. You provide the container image and resource requirements (CPU, memory), and Fargate handles all server provisioning, patching, scaling, and availability. You never see or manage EC2 instances. EC2 with Docker requires managing servers. ECS on EC2 launch type still requires managing EC2 instances. EKS provides managed Kubernetes but still requires managing node groups (unless using Fargate with EKS).",
    questionType: "single"
  },
  {
    topic: "Global Infrastructure",
    question: "A gaming company is launching a multiplayer game for players in North America, Europe, and Asia. Players complain about high latency when connecting to game servers. The company wants to reduce latency for all players globally. Which combination of AWS infrastructure concepts and services addresses this?",
    options: [
      "Deploy all game servers in a single AWS Region (us-east-1) with the highest number of Availability Zones",
      "Deploy game servers in multiple AWS Regions (us-east-1, eu-west-1, ap-northeast-1), use Amazon Route 53 latency-based routing to direct players to the nearest region, and use AWS Global Accelerator to route traffic over the AWS global network instead of the public internet",
      "Use Amazon CloudFront to cache game server responses globally",
      "Deploy game servers in a single region but use multiple Availability Zones to reduce latency"
    ],
    correctAnswers: [1],
    explanation: "Latency is primarily determined by physical distance between the player and the server. Deploying in multiple regions places servers geographically closer to players. Route 53 latency-based routing directs each player to the lowest-latency region. Global Accelerator routes traffic over AWS's private global network (which has lower latency and more consistent performance than the public internet) from the player's nearest AWS edge location to the game server. Multiple AZs in one region doesn't reduce latency for geographically distant players.",
    questionType: "single"
  },
  {
    topic: "Security",
    question: "A company's AWS account has been compromised. The attacker created several IAM users and launched expensive GPU instances for cryptocurrency mining. The company wants to prevent this from happening again. Which combination of security controls would MOST effectively prevent unauthorized resource creation?",
    options: [
      "Enable AWS CloudTrail to log all API calls so the company can detect future attacks",
      "Enable MFA (Multi-Factor Authentication) on the root account and all IAM users with console access, use IAM roles instead of long-term access keys, enable AWS GuardDuty for threat detection, and set up AWS Config rules to detect unusual resource creation",
      "Change all IAM user passwords to complex passwords and rotate them every 30 days",
      "Enable AWS Shield Advanced to protect against attacks"
    ],
    correctAnswers: [1],
    explanation: "MFA prevents attackers from using stolen credentials alone — they would also need the physical MFA device. IAM roles with temporary credentials reduce the risk of long-term credential theft. GuardDuty uses ML to detect unusual behavior (like cryptocurrency mining) and alerts the security team. Config rules can detect non-compliant resources (like GPU instances in regions where they shouldn't exist). CloudTrail alone is detective, not preventive. Password complexity helps but doesn't prevent credential theft. Shield protects against network-level DDoS, not account compromise.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A data analyst needs to run SQL queries against 10TB of log data stored in S3 without setting up any database servers or loading data into a database. They want to pay only for the queries they run. Which AWS service enables this?",
    options: [
      "Amazon RDS — load the data into a managed relational database and run SQL queries",
      "Amazon Athena — a serverless interactive query service that allows running SQL queries directly on data in S3, charging per query based on data scanned",
      "Amazon Redshift — a data warehouse service optimized for analytical queries",
      "AWS Glue — an ETL service that transforms data before querying"
    ],
    correctAnswers: [1],
    explanation: "Amazon Athena is serverless — no infrastructure to set up or manage. It queries data directly in S3 using standard SQL (Presto/Trino engine). You pay $5 per TB of data scanned. There's no need to load data into a database. RDS requires loading data and managing a database server. Redshift requires a cluster (ongoing costs even when not querying). Glue is for ETL transformations, not interactive querying.",
    questionType: "single"
  },
  {
    topic: "Compute",
    question: "A company runs a web application that experiences predictable traffic spikes every weekday from 9am to 5pm and very low traffic overnight and on weekends. The application currently runs on 10 EC2 instances 24/7. Which approach MOST effectively reduces costs while maintaining performance during peak hours?",
    options: [
      "Purchase 10 Reserved Instances for 1 year to get a discount on the always-on instances",
      "Use Auto Scaling with scheduled scaling actions to increase capacity before 9am and decrease it after 5pm, combined with a mix of Reserved Instances for baseline capacity and On-Demand for peak scaling",
      "Use Spot Instances for all 10 instances, which provides the lowest cost",
      "Move the application to AWS Lambda, which automatically scales and charges only for execution time"
    ],
    correctAnswers: [1],
    explanation: "Scheduled scaling pre-scales capacity before peak hours (avoiding cold start delays) and scales down after hours (reducing costs). Reserved Instances for the minimum baseline capacity (e.g., 2 instances always needed) provide 40% savings. On-Demand instances handle the peak scaling. This combination optimizes cost for a predictable traffic pattern. Spot Instances risk interruption during peak business hours. Pure Reserved Instances for all 10 don't reduce the cost of overnight/weekend idle capacity. Lambda may require significant application refactoring.",
    questionType: "single"
  },
  {
    topic: "Database",
    question: "A mobile app stores user profiles, friend relationships, and activity feeds. The data is highly interconnected — a single user query might need to traverse multiple relationships (friends of friends, mutual connections). The development team is struggling with complex SQL JOIN queries that are slow and hard to maintain. Which AWS database service is MOST appropriate for this use case?",
    options: [
      "Amazon RDS PostgreSQL — a relational database with good support for complex JOINs",
      "Amazon DynamoDB — a NoSQL key-value database optimized for simple lookups",
      "Amazon Neptune — a fully managed graph database service designed for highly connected data with relationship traversal queries",
      "Amazon Redshift — a data warehouse optimized for analytical queries on large datasets"
    ],
    correctAnswers: [2],
    explanation: "Amazon Neptune is a graph database service purpose-built for highly connected data. Social networks (friends, followers, connections) are a classic graph database use case. Neptune supports Gremlin and SPARQL query languages that make relationship traversal queries simple and fast — queries that would require multiple expensive JOINs in SQL become natural graph traversals. DynamoDB is optimized for simple key-value lookups, not relationship traversal. Redshift is for analytics, not transactional social network data.",
    questionType: "single"
  },
  {
    topic: "Compliance",
    question: "A healthcare company is moving patient records to AWS and must comply with HIPAA regulations. Their compliance officer asks: 'Does AWS comply with HIPAA, and what does that mean for our responsibility?' Which answer is MOST accurate?",
    options: [
      "AWS is HIPAA certified, which means any application running on AWS is automatically HIPAA compliant",
      "AWS is not HIPAA compliant and cannot be used for healthcare data",
      "AWS offers HIPAA-eligible services and signs a Business Associate Agreement (BAA) with customers, but the customer is responsible for configuring those services correctly, implementing access controls, encrypting PHI, and ensuring their application meets HIPAA requirements",
      "AWS handles all HIPAA compliance requirements, so the healthcare company has no additional compliance obligations"
    ],
    correctAnswers: [2],
    explanation: "AWS offers HIPAA-eligible services (a specific list of services that meet the technical safeguards required by HIPAA) and will sign a BAA (Business Associate Agreement) with covered entities. However, HIPAA compliance is a shared responsibility: AWS secures the underlying infrastructure, but the customer must correctly configure services, implement access controls, encrypt PHI (Protected Health Information), maintain audit logs, and ensure their application architecture meets all HIPAA requirements. Using AWS doesn't automatically make an application HIPAA compliant.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to set up a continuous integration/continuous deployment (CI/CD) pipeline entirely on AWS. They need: source code repository, automated build and test, and automated deployment to EC2. Which combination of AWS services provides a fully managed CI/CD pipeline?",
    options: [
      "GitHub + Jenkins on EC2 + custom deployment scripts",
      "AWS CodeCommit (source repository) + AWS CodeBuild (build and test) + AWS CodeDeploy (deployment) + AWS CodePipeline (orchestration)",
      "Amazon S3 (source storage) + AWS Lambda (build) + AWS CloudFormation (deployment)",
      "AWS Cloud9 (IDE) + Amazon ECR (container registry) + Amazon ECS (deployment)"
    ],
    correctAnswers: [1],
    explanation: "AWS provides a complete, integrated CI/CD toolchain: CodeCommit is a managed Git repository. CodeBuild is a fully managed build service that compiles code and runs tests. CodeDeploy automates deployments to EC2, Lambda, or ECS. CodePipeline orchestrates the entire pipeline, triggering each stage automatically. All services are fully managed with no servers to maintain. The other options mix third-party tools or use services not designed for CI/CD.",
    questionType: "single"
  },
  {
    topic: "Support",
    question: "A company is running a production e-commerce website on AWS. During the holiday shopping season, they experience a critical issue that is causing the website to be unavailable. They need to speak with an AWS engineer immediately. They currently have the AWS Basic Support plan. What should they do?",
    options: [
      "Submit a support ticket through the AWS console — Basic Support includes 24/7 technical support",
      "Post in the AWS Developer Forums and wait for a community response",
      "Upgrade to AWS Business Support or Enterprise Support, which provides 24/7 phone and chat access to AWS Support engineers for production system issues, then contact support",
      "Contact their AWS account manager for immediate technical assistance"
    ],
    correctAnswers: [2],
    explanation: "AWS Basic Support only includes access to documentation, whitepapers, and AWS Trusted Advisor (limited checks) — it does not include technical support from AWS engineers. Developer Support provides email support during business hours. Business Support provides 24/7 phone/chat/email access to Cloud Support Engineers for production system issues. Enterprise Support provides a Technical Account Manager and faster response times. For a critical production outage, Business or Enterprise Support is required.",
    questionType: "single"
  },
  {
    topic: "Monitoring",
    question: "A company wants to monitor their AWS infrastructure and receive alerts when problems occur. They want to know when an EC2 instance's CPU exceeds 80%, when an RDS database runs out of storage space, and when their application returns more than 10 errors per minute. Which AWS service provides these monitoring and alerting capabilities?",
    options: [
      "AWS CloudTrail — records all API calls and can alert on suspicious activity",
      "Amazon CloudWatch — collects metrics from AWS services, allows creating alarms based on thresholds, and sends notifications via SNS when alarms trigger",
      "AWS Config — tracks configuration changes to AWS resources and can alert on non-compliant configurations",
      "Amazon Inspector — scans EC2 instances for security vulnerabilities and sends alerts"
    ],
    correctAnswers: [1],
    explanation: "Amazon CloudWatch is the AWS monitoring service. It automatically collects metrics from EC2 (CPU utilization), RDS (storage space), and other services. You can create CloudWatch Alarms that trigger when metrics cross thresholds (e.g., CPU > 80%) and send notifications via SNS (email, SMS, Lambda). Custom metrics (like application error rates) can be published to CloudWatch via the API. CloudTrail is for API auditing. Config is for configuration compliance. Inspector is for security vulnerability scanning.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company needs to transfer 80TB of data from their on-premises data center to Amazon S3. Their internet connection is 100 Mbps and is shared with business operations. Transferring 80TB over 100 Mbps would take approximately 74 days. They need to complete the transfer within 2 weeks. Which AWS service solves this problem?",
    options: [
      "AWS DataSync — accelerates data transfer by optimizing network usage",
      "Amazon S3 Transfer Acceleration — uses CloudFront edge locations to speed up uploads",
      "AWS Snowball — a physical device that AWS ships to the customer, they load data onto it, ship it back, and AWS imports the data into S3",
      "AWS Direct Connect — a dedicated network connection that provides higher bandwidth"
    ],
    correctAnswers: [2],
    explanation: "AWS Snowball is the correct solution when the data volume is too large to transfer over the internet within the required timeframe. AWS ships a physical Snowball device (80TB capacity) to the customer. The customer copies data to the device locally (much faster than internet transfer), ships it back to AWS, and AWS imports the data into S3. The entire process typically takes 1-2 weeks. DataSync and Transfer Acceleration still use the internet connection and would not meet the 2-week deadline. Direct Connect takes weeks to provision and would still be too slow for 80TB.",
    questionType: "single"
  },
  {
    topic: "Architecture",
    question: "A company's application writes data to a database and then sends an email notification to the customer. Currently, if the email service is down, the entire transaction fails and the database write is rolled back. The company wants to ensure that database writes always succeed, even if the email service is temporarily unavailable, and that emails are eventually sent once the service recovers. Which AWS service should be added to decouple the database write from the email sending?",
    options: [
      "Amazon RDS Multi-AZ — provides database high availability to prevent transaction failures",
      "Amazon SQS (Simple Queue Service) — the application writes to the database and puts a message in an SQS queue; a separate process reads from the queue and sends emails, retrying if the email service is down",
      "Amazon SNS (Simple Notification Service) — sends notifications directly without queuing",
      "AWS Step Functions — orchestrates the database write and email sending as a workflow"
    ],
    correctAnswers: [1],
    explanation: "SQS decouples the database write from the email sending. The application writes to the database (which succeeds independently) and places a message in an SQS queue. A separate consumer reads from the queue and sends emails. If the email service is down, the message stays in the queue and is retried automatically. Once the email service recovers, the message is processed. This is the classic decoupling pattern. SNS delivers immediately and doesn't retry if the destination is unavailable. Step Functions orchestrates workflows but doesn't provide the durable queuing needed.",
    questionType: "single"
  },
  {
    topic: "Cloud Concepts",
    question: "A company is deciding between building their own data center and using AWS. The CTO lists several advantages of AWS. Which of the following is NOT a genuine advantage of cloud computing over traditional on-premises infrastructure?",
    options: [
      "Trade capital expense for operational expense — pay monthly for what you use instead of large upfront hardware purchases",
      "Benefit from massive economies of scale — AWS's purchasing power means lower per-unit costs than individual companies can achieve",
      "Stop guessing capacity — scale up or down based on actual demand rather than forecasting",
      "Cloud computing eliminates all security risks — AWS manages all security so customers have no security responsibilities"
    ],
    correctAnswers: [3],
    explanation: "Cloud computing does NOT eliminate security risks or remove customer security responsibilities. The AWS Shared Responsibility Model clearly defines that customers are responsible for security IN the cloud (data encryption, access management, application security, OS patching on EC2, etc.). AWS is responsible for security OF the cloud (physical infrastructure, hypervisor, etc.). The other three options are genuine advantages of cloud computing listed in AWS's own documentation on cloud benefits.",
    questionType: "single"
  },
  {
    topic: "Storage",
    question: "A company stores product images for their e-commerce website in Amazon S3. The website serves millions of users globally. Currently, users in Asia experience slow image loading because the S3 bucket is in us-east-1. The company wants to improve image loading speed for all global users without changing the S3 bucket location. Which AWS service should they use?",
    options: [
      "Amazon S3 Cross-Region Replication — copy images to S3 buckets in multiple regions",
      "Amazon CloudFront — a content delivery network (CDN) that caches images at edge locations worldwide, serving users from the nearest edge location",
      "AWS Global Accelerator — routes traffic over the AWS global network for better performance",
      "Amazon Route 53 latency-based routing — directs users to the nearest AWS region"
    ],
    correctAnswers: [1],
    explanation: "Amazon CloudFront is a CDN with 400+ edge locations worldwide. When a user in Asia requests an image, CloudFront checks if it's cached at the nearest edge location. If yes, it serves it from there (low latency). If not, it fetches from S3 (us-east-1), caches it at the edge, and serves it. Subsequent requests from Asia are served from the edge cache. This dramatically reduces latency for global users without moving the S3 bucket. Cross-Region Replication copies data but doesn't cache at edge locations. Global Accelerator optimizes routing but doesn't cache content.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to run machine learning models to analyze customer sentiment from product reviews. Their data science team wants to use pre-trained models without building ML infrastructure. Which AWS service allows them to add sentiment analysis to their application with a simple API call, without any ML expertise or infrastructure management?",
    options: [
      "Amazon SageMaker — for building, training, and deploying custom ML models",
      "Amazon Comprehend — a natural language processing service that provides pre-trained models for sentiment analysis, entity recognition, and key phrase extraction via API",
      "Amazon Rekognition — an image and video analysis service",
      "AWS Deep Learning AMIs — pre-configured EC2 instances with ML frameworks installed"
    ],
    correctAnswers: [1],
    explanation: "Amazon Comprehend is an NLP service with pre-trained models for text analysis including sentiment analysis (positive, negative, neutral, mixed). It's accessible via a simple API call — no ML expertise, model training, or infrastructure management required. SageMaker is for building and training custom models (requires ML expertise). Rekognition analyzes images and videos, not text. Deep Learning AMIs still require managing EC2 instances and ML frameworks.",
    questionType: "single"
  },
  {
    topic: "Pricing",
    question: "A company is reviewing their AWS bill and notices they are being charged for data transfer. Their architect explains the AWS data transfer pricing model. Which statement about AWS data transfer costs is CORRECT?",
    options: [
      "All data transfer on AWS is free, including data transferred between regions and to the internet",
      "Data transferred INTO AWS (ingress) from the internet is free; data transferred OUT of AWS (egress) to the internet is charged per GB; data transferred between AWS services in the same region is generally free or very low cost",
      "Data transfer between Availability Zones within the same region is always free",
      "Data transferred between AWS regions is free if using AWS backbone network"
    ],
    correctAnswers: [1],
    explanation: "AWS data transfer pricing: Ingress (data coming into AWS from the internet) is free. Egress (data going out to the internet) is charged per GB (varies by region, approximately $0.09/GB for the first 10TB from us-east-1). Data transfer between services in the same region is generally free (e.g., EC2 to S3 in the same region). Data transfer between AZs within the same region has a small charge ($0.01/GB each way). Data transfer between regions is charged. This pricing model incentivizes keeping data within AWS.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A startup wants to build a mobile app that requires user authentication (sign up, sign in, password reset), social login (Google, Facebook), and the ability to sync user data across devices. They want a fully managed service that handles all authentication infrastructure. Which AWS service provides these capabilities?",
    options: [
      "AWS IAM — Identity and Access Management for controlling access to AWS resources",
      "Amazon Cognito — provides user pools for authentication (sign up/in, MFA, social login) and identity pools for granting access to AWS resources, with built-in device sync",
      "AWS Directory Service — for connecting to Microsoft Active Directory",
      "AWS Single Sign-On (SSO) — for enterprise federated identity management"
    ],
    correctAnswers: [1],
    explanation: "Amazon Cognito is specifically designed for mobile and web application authentication. User Pools handle user registration, authentication, password management, MFA, and social identity provider federation (Google, Facebook, Apple). Identity Pools grant authenticated users temporary AWS credentials. Cognito Sync (or AppSync) enables data synchronization across devices. IAM is for AWS resource access control, not end-user authentication. Directory Service is for enterprise Active Directory. AWS SSO is for workforce identity management.",
    questionType: "single"
  },
  {
    topic: "Architecture",
    question: "A company's application processes orders. When an order is placed, the system must: (1) save the order to a database, (2) charge the customer's credit card, (3) send a confirmation email, and (4) notify the warehouse to pick and pack the order. Currently, all four steps happen synchronously in one transaction. If the warehouse notification system is down, the entire order fails. Which architecture pattern improves resilience?",
    options: [
      "Use a larger EC2 instance to handle all four steps faster, reducing the chance of timeout",
      "Use Amazon SQS to decouple the steps: save the order and charge the card synchronously (critical path), then publish an event to SNS which fans out to SQS queues for the email service and warehouse system — each processes independently and retries on failure",
      "Use Amazon RDS Multi-AZ to ensure the database never fails, which prevents order failures",
      "Use AWS Lambda for all four steps, which automatically retries failed executions"
    ],
    correctAnswers: [1],
    explanation: "The event-driven pattern with SNS/SQS decouples non-critical steps from the critical path. The order save and payment (critical, must be synchronous) complete first. Then an SNS event triggers SQS queues for email and warehouse notification. Each downstream system processes independently — if the warehouse system is down, the message waits in the SQS queue and is retried automatically. The order is not affected. This is the standard pattern for resilient order processing. Multi-AZ only addresses database availability. Lambda retries don't help if the downstream system is unavailable.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to analyze their AWS costs and usage to understand which services, accounts, and teams are spending the most. They want to visualize spending trends over time, forecast future costs, and identify cost-saving opportunities like unused Reserved Instances. Which AWS service provides these capabilities?",
    options: [
      "AWS Billing Dashboard — shows the current month's bill",
      "AWS Cost Explorer — provides interactive graphs and reports for analyzing historical costs, usage trends, and forecasts, with recommendations for Reserved Instance purchases",
      "AWS Budgets — sets spending limits and sends alerts when thresholds are exceeded",
      "AWS Trusted Advisor — provides recommendations for cost optimization"
    ],
    correctAnswers: [1],
    explanation: "AWS Cost Explorer is the primary tool for cost analysis and visualization. It provides: interactive charts showing cost and usage by service, account, region, or tag; 12 months of historical data; 12-month forecasts; Reserved Instance and Savings Plans utilization reports; and RI purchase recommendations. The Billing Dashboard shows current charges. Budgets sets alerts for thresholds. Trusted Advisor provides high-level recommendations but not detailed cost analysis.",
    questionType: "single"
  },
  {
    topic: "Security",
    question: "A company has multiple developers who need access to AWS. The security team wants to ensure that each developer can only access the resources they need for their specific role (principle of least privilege). A developer who works on the web tier should not be able to access the database or billing information. Which AWS feature is used to implement this?",
    options: [
      "Create one IAM user for all developers and share the credentials — this is simpler to manage",
      "Create individual IAM users for each developer, create IAM groups for each role (WebDeveloper, DatabaseAdmin, etc.), attach policies to groups that define the allowed actions and resources, and add developers to the appropriate groups",
      "Give all developers the AdministratorAccess policy and trust them to only access what they need",
      "Use the root account credentials for all developers, which provides full access"
    ],
    correctAnswers: [1],
    explanation: "IAM best practices: Create individual IAM users (never share credentials — this enables auditing of who did what). Use IAM groups to manage permissions at scale (assign permissions to groups, not individual users). Attach least-privilege policies to groups (WebDeveloper group gets only web tier permissions). Add developers to appropriate groups. This implements the principle of least privilege. Sharing credentials prevents auditing. AdministratorAccess violates least privilege. Root account should never be used for day-to-day operations.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company runs a popular API that receives 100,000 requests per second during peak hours. The API backend is a Lambda function. They want to protect the backend from being overwhelmed, monetize the API by charging developers per request, and provide different service tiers (free tier: 1,000 requests/day, paid tier: unlimited). Which AWS service manages these requirements?",
    options: [
      "Amazon CloudFront — a CDN that can cache API responses and reduce backend load",
      "Amazon API Gateway — provides throttling (rate limiting), usage plans with API keys for different tiers, and quota management for controlling request rates per customer",
      "AWS WAF — a web application firewall that can block excessive requests",
      "Elastic Load Balancing — distributes traffic across multiple Lambda functions"
    ],
    correctAnswers: [1],
    explanation: "API Gateway is purpose-built for API management. Usage Plans allow defining different tiers (free vs. paid) with different quotas (requests per day) and throttling rates. API keys identify each developer/customer and are associated with a usage plan. Throttling prevents the backend from being overwhelmed. API Gateway also provides request/response transformation, caching, and authentication. CloudFront caches content but doesn't manage API keys or usage plans. WAF blocks malicious traffic but doesn't manage API tiers. ELB distributes traffic but doesn't manage API monetization.",
    questionType: "single"
  },
  {
    topic: "Cloud Concepts",
    question: "A company is planning their AWS deployment and wants to ensure their application remains available even if an entire AWS data center fails. The solutions architect explains the concept of Availability Zones. Which statement BEST describes AWS Availability Zones and how they should be used?",
    options: [
      "Availability Zones are separate AWS accounts that provide billing isolation",
      "Availability Zones are physically separate data centers within a region, each with independent power, cooling, and networking. Deploying resources across multiple AZs ensures that a failure in one data center does not affect the application",
      "Availability Zones are different AWS regions that provide geographic redundancy",
      "Availability Zones are virtual partitions within a single data center that provide logical separation"
    ],
    correctAnswers: [1],
    explanation: "AWS Availability Zones are physically separate data centers within an AWS Region, connected by high-bandwidth, low-latency networking. Each AZ has independent power, cooling, and physical security — a failure in one AZ (fire, flood, power outage) does not affect other AZs. By deploying resources across multiple AZs (e.g., EC2 instances in AZ-a and AZ-b behind a load balancer), applications remain available even if one AZ fails. This is the foundation of high availability on AWS.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company's application generates large amounts of log data that needs to be analyzed in real-time to detect fraud. The logs arrive as a continuous stream of events at 50,000 events per second. The fraud detection algorithm needs to analyze the last 5 minutes of events for each user. Which AWS service is MOST appropriate for ingesting and processing this real-time streaming data?",
    options: [
      "Amazon S3 — store all logs and run batch analysis every hour",
      "Amazon Kinesis Data Streams — ingest the high-volume real-time data stream, with Kinesis Data Analytics (or Lambda) processing the stream to detect fraud patterns within the 5-minute window",
      "Amazon SQS — queue all events for processing by Lambda functions",
      "Amazon RDS — store events in a relational database and run SQL queries for fraud detection"
    ],
    correctAnswers: [1],
    explanation: "Amazon Kinesis Data Streams is designed for real-time, high-volume data streaming. It can ingest 50,000 events/second and retain data for up to 365 days. Kinesis Data Analytics (or Lambda consumers) can process the stream in real-time, maintaining sliding windows (last 5 minutes per user) for fraud detection. S3 + batch analysis has too much latency for real-time fraud detection. SQS doesn't support windowed stream processing natively. RDS would be overwhelmed by 50,000 writes/second and doesn't support streaming analytics.",
    questionType: "single"
  },
  {
    topic: "Pricing",
    question: "A company is running a development environment that is only used Monday through Friday, 9am to 6pm (45 hours per week). The environment uses 5 EC2 instances. They are currently paying for 24/7 On-Demand usage. Which approach MOST effectively reduces costs for this predictable schedule?",
    options: [
      "Purchase 5 Reserved Instances for 1 year — the commitment discount offsets the idle time costs",
      "Use Instance Scheduler (AWS solution) or scripts to automatically start instances at 9am Monday and stop them at 6pm Friday, reducing running time from 168 hours/week to 45 hours/week — a 73% reduction in compute hours",
      "Use Spot Instances for all 5 instances, accepting the risk of interruption during business hours",
      "Move the development environment to Lambda functions, which only charge when code is running"
    ],
    correctAnswers: [1],
    explanation: "The development environment only needs to run 45 hours/week out of 168 hours/week (27% of the time). Stopping instances when not needed reduces compute costs by 73%. AWS Instance Scheduler automates this. Reserved Instances still charge for 168 hours/week regardless of usage — you'd be paying for 123 hours/week of idle time. Spot Instances risk interruption during business hours. Lambda requires application refactoring.",
    questionType: "single"
  },
  {
    topic: "Security",
    question: "A company's security audit finds that their S3 buckets containing customer data are publicly accessible. The data has been exposed for 3 months. Which combination of actions should they take IMMEDIATELY and then PREVENTIVELY?",
    options: [
      "Immediately: Enable S3 versioning on all buckets. Preventively: Enable CloudTrail",
      "Immediately: Enable S3 Block Public Access at the account level to block all public access to all buckets. Preventively: Use AWS Config rule 's3-bucket-public-read-prohibited' to continuously monitor for public buckets and alert/remediate, and enable Amazon Macie to detect sensitive data in S3",
      "Immediately: Delete all S3 buckets and recreate them with private settings. Preventively: Use IAM policies to restrict S3 access",
      "Immediately: Contact AWS Support to block public access. Preventively: Purchase AWS Shield Advanced"
    ],
    correctAnswers: [1],
    explanation: "S3 Block Public Access at the account level immediately prevents any bucket from being made public, overriding any bucket-level or object-level public access settings. This is the fastest way to stop the exposure. AWS Config rule continuously monitors bucket permissions and can auto-remediate. Amazon Macie uses ML to discover and classify sensitive data (PII, financial data) in S3, helping assess the impact of the breach. Deleting buckets would cause data loss. AWS Support cannot block public access on your behalf.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to migrate their on-premises Microsoft SQL Server database to AWS with minimal changes to their application. The database uses SQL Server-specific features including stored procedures written in T-SQL and SQL Server Agent jobs. They want a fully managed service with automatic backups and patching. Which AWS service BEST meets these requirements?",
    options: [
      "Amazon Aurora PostgreSQL — a cloud-native database with better performance than SQL Server",
      "Amazon RDS for SQL Server — a fully managed SQL Server service that supports T-SQL, stored procedures, SQL Server Agent, and other SQL Server-specific features, with automatic backups and patching",
      "Amazon DynamoDB — a NoSQL database that provides better scalability than SQL Server",
      "Amazon Redshift — a data warehouse optimized for analytical SQL queries"
    ],
    correctAnswers: [1],
    explanation: "Amazon RDS for SQL Server is a fully managed service running actual Microsoft SQL Server. It supports all SQL Server-specific features including T-SQL, stored procedures, SQL Server Agent jobs, linked servers, and other native SQL Server capabilities. The application requires minimal or no changes. RDS handles backups, patching, and Multi-AZ failover. Aurora PostgreSQL would require rewriting T-SQL stored procedures. DynamoDB is a NoSQL database — completely different paradigm. Redshift is for analytics, not transactional workloads.",
    questionType: "single"
  },
  {
    topic: "Architecture",
    question: "A company is designing a new application on AWS. The lead architect says they should design for failure. Which design principle does this represent, and which AWS features implement it?",
    options: [
      "Design for failure means assuming AWS infrastructure will fail and is not reliable — this is why on-premises is better",
      "Design for failure means building systems that assume individual components will fail and continue operating despite those failures — implemented using Multi-AZ deployments, Auto Scaling groups, health checks, and stateless application design so any instance can handle any request",
      "Design for failure means having a backup data center ready to take over if AWS fails entirely",
      "Design for failure means testing the application by intentionally breaking it before launch"
    ],
    correctAnswers: [1],
    explanation: "Design for failure is a core AWS Well-Architected Framework principle. It means assuming that any individual component (server, network link, AZ) can fail at any time and designing the system to continue operating. Implementation: Multi-AZ deployments ensure AZ failure doesn't cause downtime. Auto Scaling groups replace failed instances automatically. Health checks detect and route around failed instances. Stateless application design means any instance can handle any request (no session state on individual servers). This results in highly resilient systems.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to use AI to automatically answer customer support questions by searching through their product documentation and knowledge base. The solution should provide accurate answers with citations to the source documents. Which AWS service is MOST appropriate?",
    options: [
      "Amazon Lex — for building conversational chatbots with predefined intents",
      "Amazon Kendra — an intelligent enterprise search service powered by ML that indexes documents and provides accurate answers with citations from the source documents",
      "Amazon Comprehend — for text analysis and entity extraction",
      "Amazon Polly — for converting text to speech"
    ],
    correctAnswers: [1],
    explanation: "Amazon Kendra is an intelligent search service that uses ML to understand natural language questions and find accurate answers within enterprise documents. It indexes the knowledge base and product documentation, understands the semantic meaning of questions (not just keyword matching), and returns answers with citations to the source documents. Amazon Lex builds conversational bots with predefined flows but doesn't search unstructured documents. Comprehend analyzes text but doesn't answer questions. Polly converts text to speech.",
    questionType: "single"
  },
  {
    topic: "Global Infrastructure",
    question: "A company is choosing an AWS Region for their new application. They have three requirements: (1) data must remain within the European Union for GDPR compliance, (2) the application must have the lowest possible latency for users in Germany, (3) the region must support all the AWS services they need. Which factor should be the PRIMARY consideration when selecting the region?",
    options: [
      "Cost — choose the cheapest region regardless of location",
      "Data residency and compliance — GDPR requires data to remain in the EU, which eliminates all non-EU regions. Then choose the EU region closest to Germany (eu-central-1 Frankfurt) for lowest latency, and verify all required services are available",
      "Number of Availability Zones — choose the region with the most AZs for highest availability",
      "AWS service availability — choose the region with the most services, which is always us-east-1"
    ],
    correctAnswers: [1],
    explanation: "When compliance requirements exist, they are non-negotiable and must be the primary consideration. GDPR requires EU data residency, eliminating all non-EU regions. Among EU regions, eu-central-1 (Frankfurt) is closest to Germany, providing the lowest latency for German users. Finally, verify the required services are available in that region. Cost and number of AZs are secondary considerations when compliance and latency requirements exist. Always check service availability as not all services are available in all regions.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to protect their web application from common web exploits like SQL injection, cross-site scripting (XSS), and malicious bots. They want to be able to create custom rules to block specific IP addresses and geographic regions. Which AWS service provides these capabilities?",
    options: [
      "AWS Shield — protects against DDoS attacks",
      "Amazon Inspector — scans applications for security vulnerabilities",
      "AWS WAF (Web Application Firewall) — inspects HTTP/HTTPS requests and blocks traffic based on rules for SQL injection, XSS, IP addresses, geographic location, and custom patterns",
      "Amazon GuardDuty — detects threats using ML and threat intelligence"
    ],
    correctAnswers: [2],
    explanation: "AWS WAF is a web application firewall that operates at the HTTP/HTTPS layer (Layer 7). It inspects incoming requests and can block based on: SQL injection patterns, XSS patterns, IP addresses (allow/block lists), geographic location (country-based rules), rate limiting (block IPs exceeding request thresholds), and custom regex patterns. AWS Shield protects against network-level DDoS (Layer 3/4). Inspector scans for vulnerabilities in EC2 instances. GuardDuty analyzes CloudTrail/VPC Flow Logs for threats but doesn't block web requests.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company has a 3-tier application (web, application, database) deployed on EC2 instances. They want to migrate to a serverless architecture to eliminate server management. Which combination of AWS services replaces each tier?",
    options: [
      "Web tier: S3 static website + CloudFront; Application tier: API Gateway + Lambda; Database tier: DynamoDB or Aurora Serverless — all fully managed with no servers to provision",
      "Web tier: EC2 with Nginx; Application tier: ECS Fargate; Database tier: RDS — Fargate is serverless for containers",
      "Web tier: CloudFront; Application tier: Elastic Beanstalk; Database tier: ElastiCache",
      "Web tier: Route 53; Application tier: SQS; Database tier: S3"
    ],
    correctAnswers: [0],
    explanation: "True serverless architecture: S3 hosts static web assets (HTML, CSS, JS) with CloudFront as CDN — no web servers needed. API Gateway handles HTTP requests and routes to Lambda functions — no application servers needed. Lambda executes business logic on-demand, scaling automatically. DynamoDB (serverless NoSQL) or Aurora Serverless (serverless relational) handles data storage with automatic scaling. No EC2 instances to manage, patch, or scale. Fargate is serverless for containers but still requires container management. Elastic Beanstalk manages EC2 instances. ElastiCache is a caching layer, not a database replacement.",
    questionType: "single"
  },
  {
    topic: "Pricing",
    question: "A company is evaluating AWS pricing and wants to understand the Total Cost of Ownership (TCO) compared to their on-premises data center. Which costs should be included in the on-premises TCO calculation but are NOT directly charged by AWS?",
    options: [
      "Compute costs — AWS charges for EC2 instances just like on-premises charges for servers",
      "Physical server hardware, data center facility costs (rent, power, cooling), hardware maintenance staff, hardware refresh cycles every 3-5 years, and the opportunity cost of capital tied up in hardware",
      "Software licensing — both on-premises and AWS charge for software licenses",
      "Network bandwidth — both on-premises and AWS charge for network usage"
    ],
    correctAnswers: [1],
    explanation: "On-premises TCO includes many hidden costs that AWS eliminates: Physical server hardware (large CapEx every 3-5 years). Data center facility costs: rent/mortgage, power (servers + cooling), cooling systems, physical security. Hardware maintenance staff (systems administrators for hardware). Hardware refresh cycles (servers become obsolete). Opportunity cost of capital tied up in hardware. AWS converts these to OpEx — you pay for compute time, not hardware ownership. AWS does charge for compute, storage, and bandwidth, but these are usage-based with no upfront capital commitment.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to automate the process of checking whether their AWS resources comply with security best practices. They want to know if any S3 buckets are publicly accessible, if MFA is enabled for all IAM users, if EC2 security groups have overly permissive rules, and if CloudTrail is enabled. Which AWS service provides automated security best practice checks?",
    options: [
      "Amazon Inspector — scans EC2 instances for software vulnerabilities",
      "AWS Trusted Advisor — provides automated checks across five categories including security, with recommendations for S3 bucket permissions, IAM usage, security group rules, and CloudTrail status",
      "AWS Config — tracks configuration changes to resources",
      "Amazon GuardDuty — detects threats and suspicious activity"
    ],
    correctAnswers: [1],
    explanation: "AWS Trusted Advisor provides automated best practice checks across five categories: Cost Optimization, Performance, Security, Fault Tolerance, and Service Limits. Security checks include: S3 bucket permissions (public access), IAM use (root account usage, MFA), security group rules (unrestricted access), CloudTrail logging, and more. Inspector scans for software vulnerabilities (CVEs) in EC2 instances. Config tracks configuration changes but requires creating custom rules for compliance checks. GuardDuty detects active threats, not configuration compliance.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to run a relational database on AWS for their e-commerce application. The database needs to handle 10,000 transactions per second, provide automatic failover if the primary database fails, and have automated daily backups. The team wants AWS to handle all database administration tasks (patching, backups, failover). Which AWS service BEST meets these requirements?",
    options: [
      "Amazon EC2 with MySQL installed — provides full control over the database",
      "Amazon RDS (Relational Database Service) — a fully managed relational database service that handles patching, backups, Multi-AZ failover, and scaling, supporting MySQL, PostgreSQL, Oracle, SQL Server, and MariaDB",
      "Amazon DynamoDB — a NoSQL database that scales to any throughput",
      "Amazon Redshift — a data warehouse for analytical queries"
    ],
    correctAnswers: [1],
    explanation: "Amazon RDS is a fully managed relational database service. It handles all DBA tasks: automated backups (daily snapshots + transaction logs for point-in-time recovery), software patching, Multi-AZ deployment for automatic failover (standby replica in another AZ, automatic promotion within 60-120 seconds), and monitoring. The customer manages the schema, queries, and application. EC2 with MySQL requires managing all DBA tasks manually. DynamoDB is NoSQL (different data model). Redshift is for analytics, not transactional e-commerce.",
    questionType: "single"
  },
  {
    topic: "Architecture",
    question: "A company's application stores user session data in memory on each EC2 instance. When the Auto Scaling group adds a new instance, users whose sessions are on other instances must log in again. When an instance is terminated during scale-in, those users lose their sessions. The architect wants to fix this. Which approach correctly solves the session management problem?",
    options: [
      "Use EC2 instances with more memory so sessions are less likely to be lost",
      "Store session data in Amazon ElastiCache (Redis or Memcached) — a shared, external session store that all EC2 instances can access, making the application stateless so any instance can serve any user",
      "Use sticky sessions on the load balancer so each user always goes to the same instance",
      "Increase the minimum instance count in the Auto Scaling group so instances are rarely terminated"
    ],
    correctAnswers: [1],
    explanation: "The correct solution is to externalize session state to a shared store like ElastiCache. All EC2 instances read and write session data to ElastiCache, making the application stateless — any instance can serve any user because they all access the same session data. When instances are added or removed, no sessions are lost. Sticky sessions (Option C) are a workaround that doesn't solve the problem — if the sticky instance is terminated, the session is still lost. More memory doesn't prevent the architectural problem. Higher minimum count reduces scale-in frequency but doesn't eliminate the problem.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to set up a private network connection between their on-premises data center and their AWS VPC. They need consistent network performance with guaranteed bandwidth (not subject to internet congestion) and the connection must not traverse the public internet. Which AWS service provides this?",
    options: [
      "AWS VPN (Virtual Private Network) — creates an encrypted tunnel over the public internet",
      "AWS Direct Connect — provides a dedicated private network connection from the on-premises data center to AWS, bypassing the public internet with consistent performance and bandwidth",
      "Amazon VPC Peering — connects two VPCs privately",
      "AWS Transit Gateway — connects multiple VPCs and on-premises networks"
    ],
    correctAnswers: [1],
    explanation: "AWS Direct Connect provides a dedicated physical network connection from the customer's data center to an AWS Direct Connect location, then to AWS. Traffic never traverses the public internet, providing consistent performance, lower latency, and guaranteed bandwidth. It's ideal for workloads requiring consistent network performance (real-time data feeds, large data transfers). AWS VPN uses the public internet (encrypted but subject to congestion). VPC Peering connects VPCs, not on-premises networks. Transit Gateway is a hub for connecting multiple networks but requires either VPN or Direct Connect for on-premises connectivity.",
    questionType: "single"
  },
  {
    topic: "Cloud Concepts",
    question: "A company is adopting AWS and wants to follow the AWS Well-Architected Framework. Their architect mentions the 'Operational Excellence' pillar. A developer asks what this means in practice. Which answer BEST describes the Operational Excellence pillar?",
    options: [
      "Operational Excellence means using the most expensive AWS services to ensure the best performance",
      "Operational Excellence focuses on running and monitoring systems to deliver business value and continually improving processes — including automating changes, responding to events, and defining standards to manage daily operations",
      "Operational Excellence means having 100% uptime with no planned maintenance windows",
      "Operational Excellence is about reducing costs by using Spot Instances and Reserved Instances"
    ],
    correctAnswers: [1],
    explanation: "The AWS Well-Architected Framework has six pillars. Operational Excellence focuses on: running and monitoring systems to deliver business value, automating changes (infrastructure as code, CI/CD pipelines), responding to events (runbooks, playbooks), and continually improving processes. Key practices include: performing operations as code, making frequent small reversible changes, anticipating failure, and learning from operational events. It's about how you operate your systems, not just whether they work.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to implement Infrastructure as Code (IaC) to provision and manage their AWS resources. They want to define their entire infrastructure in template files that can be version-controlled, reviewed, and deployed consistently across development, staging, and production environments. Which AWS service enables this?",
    options: [
      "AWS Management Console — provides a graphical interface for creating resources",
      "AWS CloudFormation — allows defining AWS infrastructure as JSON or YAML templates, which are version-controlled and deployed consistently, with CloudFormation managing resource creation, updates, and deletion",
      "AWS CLI (Command Line Interface) — allows creating resources via command-line scripts",
      "AWS Systems Manager — manages and configures existing EC2 instances"
    ],
    correctAnswers: [1],
    explanation: "AWS CloudFormation is the native AWS IaC service. You define resources in JSON or YAML templates, store them in version control (Git), and deploy them to create identical environments. CloudFormation manages dependencies (creates resources in the correct order), handles updates (change sets show what will change before applying), and can roll back failed deployments. The same template deploys consistently to dev, staging, and production. The Console and CLI create resources imperatively (one at a time) without the declarative, version-controlled approach of IaC.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company's application needs to send push notifications to mobile devices (iOS and Android) and SMS messages to phone numbers. They want a single service that handles both channels and scales to millions of recipients. Which AWS service provides this capability?",
    options: [
      "Amazon SES (Simple Email Service) — for sending email notifications",
      "Amazon SNS (Simple Notification Service) — supports push notifications to iOS (APNs), Android (FCM/GCM), and SMS, with a publish-once, deliver-to-many model that scales to millions of endpoints",
      "Amazon SQS (Simple Queue Service) — for queuing messages for processing",
      "Amazon Pinpoint — for targeted marketing campaigns"
    ],
    correctAnswers: [1],
    explanation: "Amazon SNS supports multiple notification channels from a single service: Mobile push notifications (iOS via APNs, Android via FCM), SMS text messages, Email, HTTP/HTTPS endpoints, Lambda functions, and SQS queues. The publish-subscribe model allows publishing one message that is delivered to all subscribed endpoints. It scales automatically to millions of recipients. SES is for email only. SQS is a message queue, not a notification service. Pinpoint is for targeted marketing campaigns with analytics.",
    questionType: "single"
  },
  {
    topic: "Security",
    question: "A company is setting up a new AWS account. The security team provides a list of best practices for securing the root account. Which combination of actions correctly secures the AWS root account?",
    options: [
      "Use the root account for all daily operations but change the password every 30 days",
      "Enable MFA on the root account, do not create access keys for the root account, use the root account only for tasks that specifically require root (e.g., changing account settings, closing the account), and create IAM users with appropriate permissions for all daily operations",
      "Share the root account credentials with all administrators so they can perform any action needed",
      "Delete the root account and use only IAM users — the root account is not needed after initial setup"
    ],
    correctAnswers: [1],
    explanation: "AWS root account best practices: Enable MFA (hardware MFA device recommended) — even if credentials are stolen, the attacker needs the physical MFA device. Never create root access keys — if compromised, they provide unlimited access with no way to restrict. Use root only for tasks requiring root (billing settings, account closure, IAM identity provider management). Create IAM users/roles for all daily operations. The root account cannot be deleted — it's the account owner. Sharing root credentials violates security principles and prevents auditing.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to run a Kubernetes cluster on AWS without managing the control plane (API server, etcd, scheduler). They want AWS to handle control plane availability, patching, and upgrades. They will manage the worker nodes themselves. Which AWS service provides this?",
    options: [
      "Amazon EC2 with kubeadm — manually install and manage Kubernetes on EC2 instances",
      "Amazon EKS (Elastic Kubernetes Service) — a managed Kubernetes service where AWS runs and maintains the Kubernetes control plane across multiple AZs, while the customer manages worker nodes",
      "AWS Fargate — runs containers without managing servers, but doesn't support Kubernetes",
      "Amazon ECS (Elastic Container Service) — AWS's native container orchestration service"
    ],
    correctAnswers: [1],
    explanation: "Amazon EKS is a managed Kubernetes service. AWS manages the Kubernetes control plane (API server, etcd, scheduler, controller manager) across multiple AZs with automatic scaling and patching. The customer manages worker nodes (EC2 node groups or Fargate for serverless nodes). EKS is fully compatible with standard Kubernetes tooling (kubectl, Helm). EC2 with kubeadm requires managing everything including the control plane. Fargate is a serverless compute engine that can run EKS pods but is not a Kubernetes service itself. ECS is a different (non-Kubernetes) container orchestration service.",
    questionType: "single"
  },
  {
    topic: "Pricing",
    question: "A company is reviewing their AWS bill and notices they are paying for 50 Elastic IP addresses that are not associated with any running instances. Their AWS architect explains the Elastic IP pricing model. Which statement is CORRECT?",
    options: [
      "Elastic IP addresses are always free — AWS does not charge for IP addresses",
      "Elastic IP addresses are free when associated with a running EC2 instance, but AWS charges an hourly fee for Elastic IPs that are allocated but not associated with a running instance — this encourages efficient use of the limited IPv4 address space",
      "Elastic IP addresses cost $0.01 per hour regardless of whether they are associated with an instance",
      "Elastic IP addresses are charged based on the amount of traffic that flows through them"
    ],
    correctAnswers: [1],
    explanation: "AWS charges for Elastic IPs that are not in use (not associated with a running instance) to encourage efficient use of the limited public IPv4 address space. When an EIP is associated with a running EC2 instance, it is free (one EIP per instance). When an EIP is allocated but not associated, or associated with a stopped instance, AWS charges approximately $0.005/hour. The company should release the 50 unused EIPs to stop incurring charges.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to implement a disaster recovery strategy for their application. They want to maintain a minimal version of their infrastructure in a second region that can be scaled up quickly if the primary region fails. The secondary environment should have the database replicating continuously from the primary. Which disaster recovery strategy does this describe?",
    options: [
      "Backup and Restore — take periodic backups and restore in the DR region when needed (highest RTO/RPO)",
      "Pilot Light — keep only the core components (like the database) running in the DR region, with everything else ready to be launched from pre-configured templates",
      "Warm Standby — run a scaled-down but fully functional version of the production environment in the DR region, ready to scale up quickly",
      "Multi-Site Active-Active — run full production capacity in both regions simultaneously (lowest RTO/RPO, highest cost)"
    ],
    correctAnswers: [2],
    explanation: "Warm Standby describes a scaled-down but fully functional environment in the DR region with continuous database replication. It can be scaled up quickly (minutes to hours) during a DR event. Pilot Light keeps only the database running (not a fully functional environment). Backup and Restore has no running infrastructure in the DR region. Multi-Site Active-Active runs full capacity in both regions. The scenario describes a 'minimal version that can be scaled up quickly with continuous replication' — this is Warm Standby.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to use machine learning to automatically categorize and route incoming customer support tickets. They want to detect the topic (billing, technical, account) and urgency (high, medium, low) from the ticket text. They do not have ML expertise and want a managed service. Which AWS service is MOST appropriate?",
    options: [
      "Amazon SageMaker — for building custom ML models with full control",
      "Amazon Comprehend — provides pre-trained NLP models for text classification, entity recognition, and sentiment analysis that can categorize support tickets without ML expertise",
      "Amazon Rekognition — for image and video analysis",
      "Amazon Forecast — for time-series forecasting"
    ],
    correctAnswers: [1],
    explanation: "Amazon Comprehend provides NLP capabilities including custom text classification. You can train a custom classifier using labeled examples of support tickets (topic: billing/technical/account, urgency: high/medium/low) without writing ML code. Comprehend handles the model training and hosting. For routing tickets, Comprehend's classification API returns the predicted category. SageMaker provides more control but requires ML expertise. Rekognition is for images/video. Forecast is for time-series prediction.",
    questionType: "single"
  },
  {
    topic: "Cloud Concepts",
    question: "A company is evaluating cloud providers. Their CTO asks about the concept of 'economies of scale' in cloud computing. Which statement BEST explains how AWS benefits from economies of scale and how this benefits customers?",
    options: [
      "Economies of scale means AWS is so large that it never experiences outages",
      "AWS serves hundreds of thousands of customers, allowing it to purchase hardware, power, and bandwidth in massive quantities at lower per-unit costs than any individual company could achieve. AWS passes these savings to customers through lower prices over time",
      "Economies of scale means AWS can offer unlimited storage and compute to all customers at no cost",
      "Economies of scale only benefits large enterprise customers — small businesses pay the same rates as individual users"
    ],
    correctAnswers: [1],
    explanation: "Economies of scale is a fundamental cloud computing benefit. AWS purchases hardware, data center space, power, and bandwidth in quantities that no individual company can match, achieving dramatically lower per-unit costs. AWS passes these savings to customers through price reductions (AWS has reduced prices over 100 times since 2006). All customers benefit from these lower prices regardless of their size. This is why AWS can offer lower costs than building and operating your own data center.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to migrate their on-premises VMware virtual machines to AWS. They want to minimize downtime during migration and continue using their existing VM images without converting them. Which AWS service is designed for this use case?",
    options: [
      "AWS DataSync — for migrating file data to AWS storage services",
      "AWS Application Migration Service (MGN) — replicates on-premises servers to AWS continuously, allowing cutover with minimal downtime, and supports migrating VMware VMs to EC2",
      "AWS Snowball — for physically shipping large amounts of data to AWS",
      "AWS Database Migration Service — for migrating databases to AWS"
    ],
    correctAnswers: [1],
    explanation: "AWS Application Migration Service (formerly CloudEndure Migration) is designed for lift-and-shift server migration. It installs a lightweight agent on the source server (VMware VM), continuously replicates the server to AWS in the background, and allows testing the migrated server before cutover. Cutover involves a brief window (minutes) of downtime. It supports migrating VMware VMs, physical servers, and other cloud VMs to EC2. DataSync is for file storage migration. Snowball is for large data transfers. DMS is specifically for database migration.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company stores sensitive customer data in Amazon S3. They need to automatically discover which S3 buckets contain personally identifiable information (PII) such as names, credit card numbers, and social security numbers. They want to be alerted when sensitive data is found in unexpected locations. Which AWS service provides this capability?",
    options: [
      "Amazon Inspector — scans EC2 instances for security vulnerabilities",
      "Amazon Macie — uses ML to automatically discover, classify, and protect sensitive data in S3, identifying PII and other sensitive data types and generating findings when sensitive data is found",
      "AWS Config — tracks configuration changes to S3 buckets",
      "Amazon GuardDuty — detects threats and suspicious access patterns"
    ],
    correctAnswers: [1],
    explanation: "Amazon Macie is a data security service that uses ML to automatically discover and classify sensitive data in S3. It identifies PII (names, addresses, SSNs, credit card numbers, passport numbers), financial data, and other sensitive information. Macie generates findings when sensitive data is found in unexpected locations or when bucket permissions change to allow public access. Inspector scans for software vulnerabilities. Config tracks configuration changes. GuardDuty detects threats based on behavior patterns, not data content.",
    questionType: "single"
  },
  {
    topic: "Architecture",
    question: "A company wants to build a data lake on AWS to store and analyze all their business data. They need to store structured data (sales transactions), semi-structured data (JSON logs), and unstructured data (images, PDFs). They want to run analytics queries on all data types. Which AWS architecture is MOST appropriate for a data lake?",
    options: [
      "Store all data in Amazon RDS — a relational database can handle all data types",
      "Amazon S3 as the central data lake storage (stores all data types at any scale), AWS Glue for data cataloging and ETL (discovers schema, transforms data), and Amazon Athena for SQL queries directly on S3 data without loading into a database",
      "Store all data in Amazon DynamoDB — a NoSQL database that handles all data types",
      "Use Amazon Redshift for all data — it provides the best query performance for analytics"
    ],
    correctAnswers: [1],
    explanation: "S3-based data lakes are the AWS standard architecture. S3 stores any data type (structured CSV/Parquet, semi-structured JSON, unstructured images/PDFs) at exabyte scale with low cost. AWS Glue Data Catalog automatically discovers and catalogs schemas (making data queryable). Glue ETL transforms and prepares data. Athena runs SQL queries directly on S3 data using the Glue catalog — no data loading required. RDS and DynamoDB are transactional databases, not designed for data lakes. Redshift is excellent for structured analytics but doesn't handle unstructured data natively.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to provide their developers with a cloud-based integrated development environment (IDE) that they can access from any browser without installing software locally. The IDE should have pre-configured development tools and allow collaboration. Which AWS service provides this?",
    options: [
      "AWS CodeCommit — a managed source code repository",
      "AWS Cloud9 — a cloud-based IDE accessible via browser that includes a code editor, debugger, and terminal, with pre-installed development tools and real-time collaboration features",
      "AWS CodeBuild — a managed build service for compiling and testing code",
      "Amazon WorkSpaces — a managed virtual desktop service"
    ],
    correctAnswers: [1],
    explanation: "AWS Cloud9 is a cloud-based IDE that runs in a browser. It provides a code editor with syntax highlighting, a debugger, and a terminal with direct access to AWS CLI and services. It comes pre-configured with common runtimes (Node.js, Python, PHP, etc.). Multiple developers can collaborate in real-time (like Google Docs for code). It runs on an EC2 instance, so no local installation is needed. CodeCommit is a Git repository. CodeBuild is for CI/CD builds. WorkSpaces provides full Windows/Linux virtual desktops.",
    questionType: "single"
  },
  {
    topic: "Pricing",
    question: "A company is planning to run a large-scale data processing job that will require 1,000 EC2 instances for approximately 6 hours. The job can be interrupted and restarted if needed. After the job completes, they won't need the instances anymore. Which EC2 purchasing option provides the LOWEST cost for this workload?",
    options: [
      "On-Demand Instances — pay for exactly 6 hours with no commitment",
      "Reserved Instances (1-year) — provides 40% discount but requires 1-year commitment",
      "Spot Instances — up to 90% discount for spare EC2 capacity, appropriate for interruptible workloads",
      "Dedicated Instances — provides dedicated hardware for compliance requirements"
    ],
    correctAnswers: [2],
    explanation: "Spot Instances provide up to 90% discount by using AWS's spare EC2 capacity. They can be interrupted with a 2-minute warning when AWS needs the capacity back. The workload explicitly allows interruption and restart, making Spot Instances ideal. For a 6-hour job with 1,000 instances, Spot Instances could reduce costs from ~$50,000 (On-Demand) to ~$5,000. Reserved Instances require 1-year commitment — inappropriate for a one-time 6-hour job. Dedicated Instances are for compliance/licensing requirements and are more expensive than On-Demand.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to implement a serverless data processing pipeline. Raw data arrives in S3 every hour. The pipeline must: validate the data, transform it, and load it into a data warehouse. The pipeline should be visual (no code), managed, and automatically scale. Which AWS service orchestrates this ETL pipeline?",
    options: [
      "AWS Lambda — write custom code for each transformation step",
      "AWS Glue — a fully managed ETL service with a visual job editor (Glue Studio) that creates, runs, and monitors ETL pipelines, automatically generating PySpark code from visual transformations",
      "Amazon EMR — a managed Hadoop/Spark cluster for big data processing",
      "AWS Step Functions — orchestrates Lambda functions for workflow automation"
    ],
    correctAnswers: [1],
    explanation: "AWS Glue is a fully managed ETL service. Glue Studio provides a visual drag-and-drop interface for building ETL pipelines without writing code — it generates PySpark code automatically. Glue crawlers automatically discover data schemas in S3. Glue jobs run on a serverless Spark environment (no cluster management). Glue workflows orchestrate multiple jobs. It integrates natively with S3, Redshift, RDS, and other AWS services. Lambda requires writing custom code. EMR requires managing clusters. Step Functions orchestrates Lambda functions but doesn't provide built-in ETL transformations.",
    questionType: "single"
  },
  {
    topic: "Cloud Concepts",
    question: "A company's IT manager is concerned about moving to AWS because they will lose control over their infrastructure. The solutions architect explains the concept of 'agility' in cloud computing. Which statement BEST describes cloud agility and how it benefits the company?",
    options: [
      "Agility means AWS makes all infrastructure decisions for the company, reducing the need for IT staff",
      "Agility means the company can provision new resources in minutes (instead of weeks for on-premises hardware procurement), experiment with new technologies at low cost, and quickly respond to changing business requirements without long procurement cycles",
      "Agility means the company must constantly change their infrastructure to keep up with AWS updates",
      "Agility only applies to startups — large enterprises cannot benefit from cloud agility"
    ],
    correctAnswers: [1],
    explanation: "Cloud agility refers to the ability to rapidly provision and de-provision resources. On-premises: hardware procurement takes weeks to months (purchase order, delivery, rack, configure). AWS: provision a new server in seconds via console or API. This enables: faster experimentation (try new services at low cost, delete if not useful), faster time-to-market (developers can get resources immediately), and rapid response to business changes (scale up for a product launch, scale down afterward). The IT manager retains control — they decide what to build, AWS provides the infrastructure.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to implement a chatbot for their customer service website that can understand natural language questions and provide answers. The chatbot should handle multiple conversation turns and maintain context. Which AWS service is MOST appropriate for building this conversational interface?",
    options: [
      "Amazon Polly — converts text to speech for voice responses",
      "Amazon Lex — a service for building conversational interfaces using voice and text, with natural language understanding (NLU) and automatic speech recognition (ASR), the same technology that powers Alexa",
      "Amazon Transcribe — converts speech to text",
      "Amazon Translate — translates text between languages"
    ],
    correctAnswers: [1],
    explanation: "Amazon Lex is specifically designed for building conversational chatbots. It uses the same deep learning technology as Alexa. Lex provides: Natural Language Understanding (NLU) to understand user intent from text, slot filling to collect required information, multi-turn conversation management, and integration with Lambda for business logic. It can be deployed on websites, mobile apps, and messaging platforms. Polly converts text to speech (output only). Transcribe converts speech to text (input only). Translate converts between languages.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to run Windows-based virtual desktops for their remote employees. Employees need access to Windows applications and a Windows desktop environment from any device (Mac, iPad, thin client). The company wants AWS to manage the underlying infrastructure. Which AWS service provides this?",
    options: [
      "Amazon EC2 with Windows Server — employees RDP into individual EC2 instances",
      "Amazon WorkSpaces — a fully managed virtual desktop service that provides Windows or Linux desktops accessible from any device, with AWS managing the underlying infrastructure",
      "AWS AppStream 2.0 — streams individual applications (not full desktops) to any device",
      "Amazon EC2 Image Builder — creates custom Windows AMIs"
    ],
    correctAnswers: [1],
    explanation: "Amazon WorkSpaces is a fully managed Desktop-as-a-Service (DaaS) solution. It provides persistent Windows or Linux virtual desktops that employees access via a WorkSpaces client on any device (Windows, Mac, iPad, Android, thin clients, web browser). AWS manages the underlying EC2 infrastructure, patching, and availability. Employees get a full Windows desktop experience. EC2 with RDP requires managing individual instances. AppStream 2.0 streams individual applications, not full desktops. EC2 Image Builder creates AMIs but doesn't provide managed desktops.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company's development team wants to receive automated security findings about their EC2 instances, container images in ECR, and Lambda functions. They want AWS to continuously scan for software vulnerabilities (CVEs) and unintended network exposure. Which AWS service provides this automated vulnerability scanning?",
    options: [
      "AWS Config — tracks configuration changes to resources",
      "Amazon Inspector — continuously scans EC2 instances, container images in ECR, and Lambda functions for software vulnerabilities (CVEs) and network reachability issues, providing prioritized findings",
      "Amazon GuardDuty — detects threats based on behavioral analysis",
      "AWS Security Hub — aggregates security findings from multiple services"
    ],
    correctAnswers: [1],
    explanation: "Amazon Inspector is a vulnerability management service that automatically scans: EC2 instances for OS and application vulnerabilities (CVEs), container images in ECR for package vulnerabilities before deployment, and Lambda functions for vulnerable dependencies. It provides a risk score for each finding based on severity and exploitability. Inspector integrates with Security Hub to centralize findings. Config tracks configuration changes. GuardDuty detects threats based on behavior (API calls, network traffic). Security Hub aggregates findings but doesn't perform the scanning itself.",
    questionType: "single"
  },
  {
    topic: "Architecture",
    question: "A company is designing a microservices application where 10 services need to communicate with each other. If they use direct service-to-service communication, each service needs to know the addresses of all other services, creating tight coupling. The team wants to decouple the services so that a service publishing an event doesn't need to know which services consume it. Which AWS architecture pattern achieves this?",
    options: [
      "Use Amazon VPC peering to connect all services directly",
      "Use Amazon EventBridge or SNS for event-driven architecture — services publish events to a central event bus or topic, and interested services subscribe to receive relevant events, with no direct coupling between publisher and subscriber",
      "Use Amazon API Gateway to route all inter-service communication through a central API",
      "Use AWS Direct Connect to create a dedicated network for inter-service communication"
    ],
    correctAnswers: [1],
    explanation: "Event-driven architecture with EventBridge or SNS decouples services. A service publishes an event (e.g., 'OrderPlaced') to EventBridge without knowing who consumes it. Other services subscribe to relevant events (Inventory Service subscribes to 'OrderPlaced', Notification Service subscribes to 'OrderPlaced'). Adding a new consumer doesn't require changing the publisher. This is the publish-subscribe pattern. VPC peering is network connectivity, not decoupling. API Gateway creates a central dependency. Direct Connect is for on-premises connectivity.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company wants to implement a recommendation engine for their e-commerce website that provides personalized product recommendations based on each user's browsing and purchase history. They want to use ML without building the model from scratch. Which AWS service provides pre-built recommendation capabilities?",
    options: [
      "Amazon SageMaker — for building custom ML models from scratch",
      "Amazon Personalize — a fully managed ML service that provides real-time personalization and recommendations using the same technology as Amazon.com, without requiring ML expertise",
      "Amazon Comprehend — for natural language processing and text analysis",
      "Amazon Forecast — for time-series demand forecasting"
    ],
    correctAnswers: [1],
    explanation: "Amazon Personalize is a fully managed ML service for personalization and recommendations. It uses the same technology that powers Amazon.com's recommendation engine. You provide user interaction data (clicks, purchases, ratings), and Personalize trains a recommendation model automatically. No ML expertise required. It provides real-time recommendations via API. Use cases: product recommendations, content personalization, search ranking. SageMaker requires building models from scratch. Comprehend is for NLP. Forecast is for demand prediction.",
    questionType: "single"
  },
  {
    topic: "Services",
    question: "A company needs to run a high-performance computing (HPC) workload that requires processing 10TB of genomics data. The job needs to run for 8 hours using 500 compute nodes that communicate with each other via MPI (Message Passing Interface). After the job completes, the cluster should be automatically terminated. Which AWS service is designed for this use case?",
    options: [
      "Amazon ECS — for running containerized applications",
      "AWS ParallelCluster — an open-source cluster management tool that automatically deploys HPC clusters on AWS, supports MPI workloads, and can automatically terminate the cluster after job completion",
      "Amazon EMR — for running Hadoop and Spark big data workloads",
      "AWS Batch — for running batch computing workloads"
    ],
    correctAnswers: [1],
    explanation: "AWS ParallelCluster is specifically designed for HPC workloads. It automatically provisions EC2 instances with EFA (Elastic Fabric Adapter) for low-latency MPI communication, configures shared storage (FSx for Lustre), sets up job schedulers (Slurm, SGE), and can automatically terminate the cluster after jobs complete. EMR is for Hadoop/Spark (different paradigm). AWS Batch is for batch jobs but doesn't natively support MPI communication between nodes. ECS is for containerized applications.",
    questionType: "single"
  }
];

async function seedCLFQuestions() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL || '');
  
  console.log('Deleting existing CLF-C02 questions...');
  await conn.execute("DELETE FROM aws_questions WHERE certification = 'CLF-C02'");
  
  console.log(`Inserting ${clfQuestions.length} CLF-C02 questions...`);
  for (const q of clfQuestions) {
    await conn.execute(
      `INSERT INTO aws_questions (certification, topic, question_text, options, correct_answers, explanation, question_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'CLF-C02',
        q.topic,
        q.question,
        JSON.stringify(q.options),
        JSON.stringify(q.correctAnswers.map(i => q.options[i])),
        q.explanation,
        q.questionType
      ]
    );
  }
  
  const [rows] = await conn.execute("SELECT COUNT(*) as count FROM aws_questions WHERE certification = 'CLF-C02'");
  console.log(`CLF-C02 questions in DB: ${rows[0].count}`);
  await conn.end();
}

seedCLFQuestions().catch(console.error);
