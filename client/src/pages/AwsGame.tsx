// @ts-nocheck
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// ─── DATA ──────────────────────────────────────────────────────────────────────

const TOPICS = [
  {
    id: "cloud-basics",
    title: "Cloud Basics",
    emoji: "☁️",
    color: "bg-blue-500",
    lightColor: "bg-blue-50 dark:bg-blue-950",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    description: "What is the cloud and why does it matter?",
    lessons: [
      {
        id: "cb-1",
        title: "What is Cloud Computing?",
        xp: 10,
        concept: {
          title: "Cloud Computing = Renting Computers Over the Internet",
          body: "Instead of buying your own servers, you rent computing power from AWS. Think of it like electricity — you don't build a power plant, you just plug in and pay for what you use.",
          analogy: "💡 Analogy: Cloud = Netflix for computers. You stream what you need, when you need it.",
          keywords: ["On-demand", "Pay-as-you-go", "No upfront cost"],
        },
        questions: [
          {
            type: "mcq",
            question: "What is the main benefit of cloud computing?",
            options: ["You own the hardware", "You pay only for what you use", "You need a large IT team", "You must sign a 10-year contract"],
            answer: 1,
            explanation: "Cloud computing uses a pay-as-you-go model — you only pay for the resources you actually consume.",
          },
          {
            type: "tf",
            question: "With cloud computing, you must buy physical servers before you can start.",
            answer: false,
            explanation: "Cloud computing eliminates the need to buy hardware upfront. You provision resources instantly online.",
          },
          {
            type: "mcq",
            question: "Which word best describes cloud computing pricing?",
            options: ["Fixed annual fee", "Pay-as-you-go", "Free forever", "One-time purchase"],
            answer: 1,
            explanation: "Cloud services are billed based on actual usage — compute time, storage used, data transferred, etc.",
          },
          {
            type: "fitb",
            question: "Cloud computing lets you access computing resources ___ the internet.",
            blanks: ["over"],
            options: ["over", "under", "without", "beside"],
            explanation: "Cloud resources are accessed over the internet, from anywhere in the world.",
          },
        ],
      },
      {
        id: "cb-2",
        title: "AWS Global Infrastructure",
        xp: 15,
        concept: {
          title: "AWS Has Data Centers All Over the World",
          body: "AWS runs in Regions (geographic areas like US-East, EU-West). Each Region has multiple Availability Zones (AZs) — separate data centers that protect against failures. Edge Locations cache content close to users.",
          analogy: "🌍 Analogy: Regions = cities. AZs = different buildings in that city. Edge Locations = local delivery hubs.",
          keywords: ["Region", "Availability Zone", "Edge Location"],
        },
        questions: [
          {
            type: "mcq",
            question: "What is an AWS Region?",
            options: ["A single data center", "A geographic area with multiple data centers", "A type of EC2 instance", "A billing category"],
            answer: 1,
            explanation: "An AWS Region is a geographic area (e.g., us-east-1) that contains multiple Availability Zones.",
          },
          {
            type: "tf",
            question: "An Availability Zone is the same as an AWS Region.",
            answer: false,
            explanation: "A Region contains multiple Availability Zones. AZs are separate physical data centers within a Region.",
          },
          {
            type: "mcq",
            question: "What are Edge Locations used for?",
            options: ["Running EC2 instances", "Caching content closer to users", "Storing database backups", "Managing IAM users"],
            answer: 1,
            explanation: "Edge Locations are used by CloudFront to cache content near end users, reducing latency.",
          },
          {
            type: "mcq",
            question: "Why does AWS have multiple Availability Zones in each Region?",
            options: ["To increase pricing", "To provide fault tolerance and high availability", "To limit who can access the cloud", "To reduce the number of services"],
            answer: 1,
            explanation: "Multiple AZs protect against single data center failures — if one AZ goes down, others keep running.",
          },
        ],
      },
      {
        id: "cb-3",
        title: "Cloud Service Models",
        xp: 15,
        concept: {
          title: "IaaS, PaaS, and SaaS — Three Ways to Use the Cloud",
          body: "IaaS (Infrastructure as a Service): You get raw compute, storage, networking — you manage the OS and apps. PaaS (Platform as a Service): AWS manages the infrastructure, you just deploy your code. SaaS (Software as a Service): Fully managed apps you just use (like Gmail).",
          analogy: "🍕 Analogy: IaaS = buy ingredients and cook. PaaS = order a meal kit. SaaS = order pizza delivery.",
          keywords: ["IaaS", "PaaS", "SaaS", "Shared Responsibility"],
        },
        questions: [
          {
            type: "mcq",
            question: "Which service model gives you the most control over the infrastructure?",
            options: ["SaaS", "PaaS", "IaaS", "FaaS"],
            answer: 2,
            explanation: "IaaS gives you raw infrastructure (VMs, storage, networking). You manage the OS, middleware, and apps.",
          },
          {
            type: "mcq",
            question: "Amazon EC2 is an example of which service model?",
            options: ["SaaS", "PaaS", "IaaS", "DBaaS"],
            answer: 2,
            explanation: "EC2 provides virtual machines — raw compute infrastructure. You manage the OS and everything above it.",
          },
          {
            type: "tf",
            question: "With SaaS, the customer manages the underlying servers and operating system.",
            answer: false,
            explanation: "With SaaS, the provider manages everything. The customer only uses the application (e.g., Salesforce, Gmail).",
          },
          {
            type: "fitb",
            question: "AWS Elastic Beanstalk is an example of ___ because it manages the infrastructure for you.",
            blanks: ["PaaS"],
            options: ["PaaS", "IaaS", "SaaS", "BaaS"],
            explanation: "Elastic Beanstalk is PaaS — you upload your code and AWS handles deployment, scaling, and monitoring.",
          },
        ],
      },
    ],
  },
  {
    id: "compute",
    title: "Compute",
    emoji: "💻",
    color: "bg-orange-500",
    lightColor: "bg-orange-50 dark:bg-orange-950",
    textColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800",
    description: "Virtual machines, serverless, and containers.",
    lessons: [
      {
        id: "comp-1",
        title: "Amazon EC2 Basics",
        xp: 10,
        concept: {
          title: "EC2 = Virtual Machines You Rent in the Cloud",
          body: "Amazon EC2 (Elastic Compute Cloud) lets you launch virtual servers called instances. You choose the size (CPU, RAM), the operating system, and pay by the second. When you don't need it, you stop it and stop paying.",
          analogy: "🖥️ Analogy: EC2 is like renting a laptop from AWS. You pick the specs, use it, and return it when done.",
          keywords: ["Instance", "AMI", "Instance Type", "Key Pair"],
        },
        questions: [
          {
            type: "mcq",
            question: "What does EC2 stand for?",
            options: ["Elastic Container Cloud", "Elastic Compute Cloud", "Extended Cloud Compute", "Enterprise Cloud Controller"],
            answer: 1,
            explanation: "EC2 stands for Elastic Compute Cloud — it provides resizable virtual servers in the cloud.",
          },
          {
            type: "tf",
            question: "You continue to pay for an EC2 instance even after you stop it.",
            answer: false,
            explanation: "When you stop an EC2 instance, you stop paying for compute. You only pay for storage (EBS) while stopped.",
          },
          {
            type: "mcq",
            question: "What is an AMI in EC2?",
            options: ["A type of network interface", "A template used to launch EC2 instances", "A billing report", "A storage volume"],
            answer: 1,
            explanation: "An AMI (Amazon Machine Image) is a pre-configured template containing the OS and software used to launch instances.",
          },
          {
            type: "fitb",
            question: "EC2 instances are billed by the ___, making it very cost-efficient for short workloads.",
            blanks: ["second"],
            options: ["second", "hour", "day", "month"],
            explanation: "EC2 charges per second (minimum 60 seconds), so short-lived workloads are very cost-efficient.",
          },
        ],
      },
      {
        id: "comp-2",
        title: "AWS Lambda — Serverless",
        xp: 15,
        concept: {
          title: "Lambda = Run Code Without Managing Servers",
          body: "AWS Lambda lets you run code in response to events — an HTTP request, a file upload, a database change. You don't provision or manage any servers. You only pay when your code actually runs.",
          analogy: "⚡ Analogy: Lambda is like a vending machine. You press a button (event), it runs, you get a result. No one manages the machine between uses.",
          keywords: ["Serverless", "Event-driven", "Function", "Trigger"],
        },
        questions: [
          {
            type: "mcq",
            question: "What triggers an AWS Lambda function?",
            options: ["A scheduled monthly report", "An event such as an API call or file upload", "A manual SSH connection", "A database migration"],
            answer: 1,
            explanation: "Lambda functions are triggered by events — API Gateway calls, S3 uploads, DynamoDB changes, scheduled events, etc.",
          },
          {
            type: "tf",
            question: "With AWS Lambda, you are responsible for managing the underlying server.",
            answer: false,
            explanation: "Lambda is serverless — AWS manages all the infrastructure. You only write and deploy your code.",
          },
          {
            type: "mcq",
            question: "What is the maximum execution time for a single Lambda function invocation?",
            options: ["5 minutes", "10 minutes", "15 minutes", "60 minutes"],
            answer: 2,
            explanation: "Lambda functions can run for a maximum of 15 minutes per invocation. For longer tasks, use EC2 or Step Functions.",
          },
          {
            type: "mcq",
            question: "When do you pay for AWS Lambda?",
            options: ["Every hour, regardless of usage", "Only when your code is executing", "Once per month as a flat fee", "When you deploy the function"],
            answer: 1,
            explanation: "Lambda charges based on the number of requests and the duration your code runs. There is no charge when idle.",
          },
        ],
      },
      {
        id: "comp-3",
        title: "EC2 Pricing Models",
        xp: 20,
        concept: {
          title: "Four Ways to Pay for EC2",
          body: "On-Demand: Pay per second, no commitment — best for unpredictable workloads. Reserved: 1 or 3 year commitment, up to 72% discount — best for steady workloads. Spot: Bid on unused capacity, up to 90% cheaper — best for flexible, fault-tolerant jobs. Savings Plans: Flexible discount in exchange for a usage commitment.",
          analogy: "✈️ Analogy: On-Demand = full-price ticket. Reserved = advance booking discount. Spot = last-minute standby.",
          keywords: ["On-Demand", "Reserved", "Spot", "Savings Plans"],
        },
        questions: [
          {
            type: "mcq",
            question: "Which EC2 pricing model offers the highest discount (up to 90%)?",
            options: ["On-Demand", "Reserved Instances", "Spot Instances", "Dedicated Hosts"],
            answer: 2,
            explanation: "Spot Instances use unused EC2 capacity and can be up to 90% cheaper than On-Demand, but can be interrupted.",
          },
          {
            type: "mcq",
            question: "A company runs a web server 24/7 for 3 years. Which pricing model saves the most?",
            options: ["On-Demand", "Spot Instances", "Reserved Instances", "Free Tier"],
            answer: 2,
            explanation: "Reserved Instances offer up to 72% discount for 1 or 3 year commitments — ideal for steady, predictable workloads.",
          },
          {
            type: "tf",
            question: "Spot Instances can be interrupted by AWS with little notice.",
            answer: true,
            explanation: "AWS can reclaim Spot Instances when capacity is needed elsewhere, giving you a 2-minute warning.",
          },
          {
            type: "fitb",
            question: "On-Demand instances are best for ___ workloads where you can't predict usage.",
            blanks: ["unpredictable"],
            options: ["unpredictable", "steady", "batch", "archived"],
            explanation: "On-Demand is perfect when you can't commit to a usage pattern — you pay only for what you use with no upfront cost.",
          },
        ],
      },
    ],
  },
  {
    id: "storage",
    title: "Storage",
    emoji: "📦",
    color: "bg-green-500",
    lightColor: "bg-green-50 dark:bg-green-950",
    textColor: "text-green-600 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-800",
    description: "S3, EBS, EFS and how to store data on AWS.",
    lessons: [
      {
        id: "stor-1",
        title: "Amazon S3 Basics",
        xp: 10,
        concept: {
          title: "S3 = Unlimited File Storage in the Cloud",
          body: "Amazon S3 (Simple Storage Service) stores files as objects in buckets. A bucket is like a folder, and an object is any file (image, video, document, backup). S3 is highly durable — it stores 11 nines of durability (99.999999999%).",
          analogy: "🗂️ Analogy: S3 is like Google Drive for your applications — unlimited storage, accessible from anywhere.",
          keywords: ["Bucket", "Object", "Key", "Durability"],
        },
        questions: [
          {
            type: "mcq",
            question: "What is an S3 bucket?",
            options: ["A virtual machine", "A container for storing objects (files)", "A database table", "A network firewall"],
            answer: 1,
            explanation: "An S3 bucket is a container that holds objects (files). Bucket names must be globally unique across all AWS accounts.",
          },
          {
            type: "tf",
            question: "S3 bucket names must be globally unique across all AWS accounts.",
            answer: true,
            explanation: "S3 bucket names are part of a global namespace — no two buckets anywhere in AWS can have the same name.",
          },
          {
            type: "mcq",
            question: "What type of storage is Amazon S3?",
            options: ["Block storage", "File storage", "Object storage", "Database storage"],
            answer: 2,
            explanation: "S3 is object storage — each file is stored as an object with metadata and a unique key, not as a file in a directory tree.",
          },
          {
            type: "fitb",
            question: "S3 provides ___ nines of durability, meaning data is extremely unlikely to be lost.",
            blanks: ["11"],
            options: ["11", "9", "5", "3"],
            explanation: "S3 is designed for 99.999999999% (11 nines) durability by storing data redundantly across multiple facilities.",
          },
        ],
      },
      {
        id: "stor-2",
        title: "S3 Storage Classes",
        xp: 15,
        concept: {
          title: "Different Storage Classes = Different Costs",
          body: "S3 Standard: Frequently accessed data, highest cost. S3 Intelligent-Tiering: Automatically moves data between tiers based on access patterns. S3 Standard-IA: Infrequently accessed, cheaper but retrieval fee. S3 Glacier: Long-term archive, very cheap, retrieval takes minutes to hours.",
          analogy: "📚 Analogy: Standard = books on your desk. Standard-IA = books on a shelf. Glacier = books in a warehouse.",
          keywords: ["Standard", "Intelligent-Tiering", "Standard-IA", "Glacier"],
        },
        questions: [
          {
            type: "mcq",
            question: "Which S3 storage class is best for data you access every day?",
            options: ["S3 Glacier", "S3 Standard-IA", "S3 Standard", "S3 One Zone-IA"],
            answer: 2,
            explanation: "S3 Standard is designed for frequently accessed data with low latency and high throughput.",
          },
          {
            type: "mcq",
            question: "Which S3 class automatically moves data between tiers based on access patterns?",
            options: ["S3 Standard", "S3 Intelligent-Tiering", "S3 Glacier", "S3 Standard-IA"],
            answer: 1,
            explanation: "S3 Intelligent-Tiering monitors access patterns and automatically moves objects to the most cost-effective tier.",
          },
          {
            type: "tf",
            question: "S3 Glacier is designed for data you need to access within milliseconds.",
            answer: false,
            explanation: "S3 Glacier is for archival storage. Retrieval can take minutes to hours depending on the retrieval option chosen.",
          },
          {
            type: "mcq",
            question: "A company stores old compliance reports accessed once a year. Which class is most cost-effective?",
            options: ["S3 Standard", "S3 Standard-IA", "S3 Glacier Deep Archive", "S3 Intelligent-Tiering"],
            answer: 2,
            explanation: "S3 Glacier Deep Archive is the cheapest storage class, ideal for data retained for regulatory compliance and rarely accessed.",
          },
        ],
      },
      {
        id: "stor-3",
        title: "EBS and EFS",
        xp: 15,
        concept: {
          title: "EBS = Hard Drive for EC2. EFS = Shared Network Drive.",
          body: "EBS (Elastic Block Store) is like a hard drive attached to one EC2 instance — fast, persistent storage for your OS and databases. EFS (Elastic File System) is a shared file system that multiple EC2 instances can access simultaneously.",
          analogy: "💾 EBS = USB drive plugged into one computer. EFS = shared network folder everyone in the office can access.",
          keywords: ["EBS", "EFS", "Block Storage", "File System"],
        },
        questions: [
          {
            type: "mcq",
            question: "How many EC2 instances can an EBS volume be attached to at a time (standard)?",
            options: ["Unlimited", "Up to 10", "One", "Up to 5"],
            answer: 2,
            explanation: "A standard EBS volume can only be attached to one EC2 instance at a time (EBS Multi-Attach is an exception for io1/io2).",
          },
          {
            type: "tf",
            question: "EFS can be accessed by multiple EC2 instances simultaneously.",
            answer: true,
            explanation: "EFS is a managed NFS file system that can be mounted on thousands of EC2 instances at the same time.",
          },
          {
            type: "mcq",
            question: "Which storage type would you use for an EC2 instance's operating system?",
            options: ["S3", "EFS", "EBS", "Glacier"],
            answer: 2,
            explanation: "EBS is block storage — it's used as the root volume (hard drive) for EC2 instances, storing the OS and application data.",
          },
          {
            type: "fitb",
            question: "EBS stands for Elastic ___ Store.",
            blanks: ["Block"],
            options: ["Block", "Bucket", "Binary", "Backup"],
            explanation: "EBS = Elastic Block Store. It provides persistent block-level storage volumes for use with EC2 instances.",
          },
        ],
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    emoji: "🔒",
    color: "bg-red-500",
    lightColor: "bg-red-50 dark:bg-red-950",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    description: "IAM, encryption, and the Shared Responsibility Model.",
    lessons: [
      {
        id: "sec-1",
        title: "IAM — Identity & Access Management",
        xp: 10,
        concept: {
          title: "IAM Controls Who Can Do What in AWS",
          body: "IAM (Identity and Access Management) manages users, groups, roles, and policies. A policy is a JSON document that defines permissions. The root account has full access — never use it for daily tasks. Always follow the principle of least privilege: give only the permissions needed.",
          analogy: "🏢 Analogy: IAM is like a building's access card system. Each person gets a card with specific door access — not everyone gets the master key.",
          keywords: ["User", "Group", "Role", "Policy", "Least Privilege"],
        },
        questions: [
          {
            type: "mcq",
            question: "What does IAM stand for?",
            options: ["Internet Access Manager", "Identity and Access Management", "Internal AWS Module", "Integrated Account Manager"],
            answer: 1,
            explanation: "IAM = Identity and Access Management. It controls authentication (who you are) and authorization (what you can do) in AWS.",
          },
          {
            type: "tf",
            question: "You should use the AWS root account for everyday administrative tasks.",
            answer: false,
            explanation: "The root account has unrestricted access to everything. Best practice is to create IAM users and use the root account only for initial setup.",
          },
          {
            type: "mcq",
            question: "What is the principle of least privilege?",
            options: ["Give all users admin access", "Give users only the permissions they need", "Never create IAM users", "Use one shared account for everyone"],
            answer: 1,
            explanation: "Least privilege means granting only the minimum permissions required to perform a task — reducing the risk of accidental or malicious actions.",
          },
          {
            type: "fitb",
            question: "An IAM ___ is a JSON document that defines what actions are allowed or denied.",
            blanks: ["policy"],
            options: ["policy", "bucket", "instance", "snapshot"],
            explanation: "IAM policies are JSON documents attached to users, groups, or roles that define allowed/denied AWS actions.",
          },
        ],
      },
      {
        id: "sec-2",
        title: "Shared Responsibility Model",
        xp: 15,
        concept: {
          title: "AWS Secures the Cloud. You Secure What's IN the Cloud.",
          body: "AWS is responsible for the security OF the cloud — the physical hardware, data centers, networking, and hypervisor. You are responsible for security IN the cloud — your data, OS patches, firewall rules, IAM permissions, and encryption.",
          analogy: "🏠 Analogy: AWS builds and secures the apartment building. You are responsible for locking your own door and keeping your apartment safe.",
          keywords: ["Shared Responsibility", "Security of the Cloud", "Security in the Cloud"],
        },
        questions: [
          {
            type: "mcq",
            question: "Who is responsible for patching the operating system on an EC2 instance?",
            options: ["AWS", "The customer", "Amazon Support", "The hardware vendor"],
            answer: 1,
            explanation: "The customer is responsible for patching the OS on EC2 instances. AWS manages the underlying hardware and hypervisor.",
          },
          {
            type: "mcq",
            question: "Which of these is AWS's responsibility under the Shared Responsibility Model?",
            options: ["Encrypting your S3 data", "Managing IAM user permissions", "Physical security of data centers", "Configuring security groups"],
            answer: 2,
            explanation: "AWS is responsible for the physical security of its data centers, hardware, and global infrastructure.",
          },
          {
            type: "tf",
            question: "The customer is responsible for the physical security of AWS data centers.",
            answer: false,
            explanation: "Physical security of data centers is AWS's responsibility. Customers are responsible for their data and configurations.",
          },
          {
            type: "mcq",
            question: "For Amazon RDS, who is responsible for patching the database engine?",
            options: ["The customer", "AWS", "A third-party vendor", "The database administrator"],
            answer: 1,
            explanation: "For managed services like RDS, AWS handles database engine patching. The customer manages data, access, and backups.",
          },
        ],
      },
      {
        id: "sec-3",
        title: "Encryption & Key Management",
        xp: 20,
        concept: {
          title: "Encryption Protects Your Data at Rest and in Transit",
          body: "At rest encryption: Data stored on disk is scrambled so only authorized parties can read it. In transit encryption: Data moving over the network is protected using TLS/HTTPS. AWS KMS (Key Management Service) manages the encryption keys used to protect your data.",
          analogy: "🔐 Analogy: Encryption at rest = locking your diary. Encryption in transit = sending a letter in a sealed envelope.",
          keywords: ["Encryption at Rest", "Encryption in Transit", "KMS", "TLS"],
        },
        questions: [
          {
            type: "mcq",
            question: "What does 'encryption at rest' protect?",
            options: ["Data being sent over the internet", "Data stored on disk or in a database", "Data in CPU memory", "Data in transit between regions"],
            answer: 1,
            explanation: "Encryption at rest protects data stored on physical media — S3 objects, EBS volumes, RDS databases, etc.",
          },
          {
            type: "mcq",
            question: "Which AWS service manages encryption keys?",
            options: ["IAM", "CloudTrail", "KMS", "Shield"],
            answer: 2,
            explanation: "AWS KMS (Key Management Service) creates and manages cryptographic keys used to encrypt your data across AWS services.",
          },
          {
            type: "tf",
            question: "HTTPS uses TLS to encrypt data in transit between a browser and a server.",
            answer: true,
            explanation: "HTTPS = HTTP + TLS encryption. It protects data in transit from eavesdropping and tampering.",
          },
          {
            type: "fitb",
            question: "AWS ___ (KMS) is the service used to create and manage encryption keys.",
            blanks: ["Key Management Service"],
            options: ["Key Management Service", "Kinesis Management System", "Kubernetes Management Service", "Key Monitoring Service"],
            explanation: "AWS KMS = Key Management Service. It integrates with S3, EBS, RDS, and other services for seamless encryption.",
          },
        ],
      },
    ],
  },
  {
    id: "networking",
    title: "Networking",
    emoji: "🌐",
    color: "bg-purple-500",
    lightColor: "bg-purple-50 dark:bg-purple-950",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    description: "VPC, subnets, load balancers and DNS.",
    lessons: [
      {
        id: "net-1",
        title: "Amazon VPC Basics",
        xp: 10,
        concept: {
          title: "VPC = Your Own Private Network Inside AWS",
          body: "A VPC (Virtual Private Cloud) is an isolated network you define in AWS. Inside a VPC you create subnets — public subnets connect to the internet, private subnets don't. Security Groups act as firewalls for your EC2 instances.",
          analogy: "🏘️ Analogy: VPC = your neighborhood. Public subnet = houses with street access. Private subnet = gated community inside.",
          keywords: ["VPC", "Subnet", "Internet Gateway", "Security Group"],
        },
        questions: [
          {
            type: "mcq",
            question: "What is an Amazon VPC?",
            options: ["A type of EC2 instance", "An isolated virtual network in AWS", "A storage service", "A DNS service"],
            answer: 1,
            explanation: "A VPC (Virtual Private Cloud) is a logically isolated network in AWS where you launch resources like EC2 instances.",
          },
          {
            type: "tf",
            question: "Resources in a private subnet can directly access the internet without any additional configuration.",
            answer: false,
            explanation: "Private subnets have no direct internet access. They need a NAT Gateway to initiate outbound internet connections.",
          },
          {
            type: "mcq",
            question: "What allows resources in a public subnet to connect to the internet?",
            options: ["NAT Gateway", "Internet Gateway", "VPN Gateway", "Security Group"],
            answer: 1,
            explanation: "An Internet Gateway is attached to a VPC and allows resources in public subnets to send and receive traffic from the internet.",
          },
          {
            type: "fitb",
            question: "A Security Group acts as a ___ firewall for EC2 instances.",
            blanks: ["stateful"],
            options: ["stateful", "stateless", "physical", "hardware"],
            explanation: "Security Groups are stateful — if you allow inbound traffic, the response is automatically allowed outbound.",
          },
        ],
      },
      {
        id: "net-2",
        title: "Load Balancing & Auto Scaling",
        xp: 15,
        concept: {
          title: "Load Balancers Spread Traffic. Auto Scaling Adjusts Capacity.",
          body: "An Elastic Load Balancer (ELB) distributes incoming traffic across multiple EC2 instances so no single server gets overwhelmed. Auto Scaling automatically adds or removes EC2 instances based on demand — scale out when busy, scale in when quiet.",
          analogy: "🚦 Load Balancer = traffic cop directing cars to open lanes. Auto Scaling = opening more lanes when traffic increases.",
          keywords: ["ELB", "ALB", "Auto Scaling", "Scale Out", "Scale In"],
        },
        questions: [
          {
            type: "mcq",
            question: "What is the main purpose of an Elastic Load Balancer?",
            options: ["Store application data", "Distribute traffic across multiple servers", "Encrypt data at rest", "Monitor application logs"],
            answer: 1,
            explanation: "ELB distributes incoming requests across multiple EC2 instances, improving availability and fault tolerance.",
          },
          {
            type: "mcq",
            question: "What does 'scaling out' mean in Auto Scaling?",
            options: ["Increasing the size of one instance", "Adding more instances to handle load", "Removing all instances", "Decreasing storage capacity"],
            answer: 1,
            explanation: "Scaling out (horizontal scaling) means adding more instances. Scaling up (vertical scaling) means increasing instance size.",
          },
          {
            type: "tf",
            question: "Auto Scaling can automatically remove EC2 instances when demand decreases.",
            answer: true,
            explanation: "Auto Scaling scales in (removes instances) when demand drops, saving costs by not running unnecessary servers.",
          },
          {
            type: "mcq",
            question: "Which load balancer type operates at Layer 7 (HTTP/HTTPS) and supports path-based routing?",
            options: ["Network Load Balancer", "Classic Load Balancer", "Application Load Balancer", "Gateway Load Balancer"],
            answer: 2,
            explanation: "The Application Load Balancer (ALB) operates at Layer 7 and can route traffic based on URL path, host headers, and more.",
          },
        ],
      },
      {
        id: "net-3",
        title: "Route 53 & CloudFront",
        xp: 15,
        concept: {
          title: "Route 53 = DNS. CloudFront = Global Content Delivery.",
          body: "Route 53 is AWS's DNS service — it translates domain names (like example.com) into IP addresses. CloudFront is a CDN (Content Delivery Network) that caches your content at edge locations around the world, making it load faster for users everywhere.",
          analogy: "📮 Route 53 = phone book (name → number). CloudFront = local post office (content cached near you).",
          keywords: ["Route 53", "DNS", "CloudFront", "CDN", "Edge Location"],
        },
        questions: [
          {
            type: "mcq",
            question: "What is Amazon Route 53 used for?",
            options: ["Running virtual machines", "Domain name resolution (DNS)", "Storing files", "Managing encryption keys"],
            answer: 1,
            explanation: "Route 53 is AWS's scalable DNS service that routes users to applications by translating domain names to IP addresses.",
          },
          {
            type: "mcq",
            question: "What is the main benefit of Amazon CloudFront?",
            options: ["Lower EC2 costs", "Faster content delivery by caching at edge locations", "Automatic database backups", "Simplified IAM management"],
            answer: 1,
            explanation: "CloudFront caches content at 400+ edge locations globally, reducing latency by serving users from the nearest location.",
          },
          {
            type: "tf",
            question: "CloudFront can only serve static content like images and videos.",
            answer: false,
            explanation: "CloudFront can serve both static content (images, CSS, JS) and dynamic content (API responses) with low latency.",
          },
          {
            type: "fitb",
            question: "Route 53 translates human-readable domain names into ___ addresses.",
            blanks: ["IP"],
            options: ["IP", "MAC", "URL", "DNS"],
            explanation: "DNS (Domain Name System) translates domain names like 'example.com' into IP addresses like '192.0.2.1'.",
          },
        ],
      },
    ],
  },
];

// ─── COMPONENT ─────────────────────────────────────────────────────────────────

type Screen = "map" | "concept" | "question" | "feedback" | "complete" | "gameover";

export default function AwsGame() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Navigation state
  const [screen, setScreen] = useState<Screen>("map");
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  // Game state
  const [hearts, setHearts] = useState(3);
  const [xp, setXp] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // Leaderboard
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const submitScore = trpc.game.submitScore.useMutation();
  const { data: leaderboard } = trpc.game.getLeaderboard.useQuery(undefined, {
    enabled: showLeaderboard,
  });

  const topic = selectedTopic !== null ? TOPICS[selectedTopic] : null;
  const lesson = topic && selectedLesson !== null ? topic.lessons[selectedLesson] : null;
  const question = lesson ? lesson.questions[currentQ] : null;
  const totalQ = lesson ? lesson.questions.length : 0;

  // Submit score when lesson complete
  useEffect(() => {
    if (screen === "complete" && !scoreSubmitted && user) {
      setScoreSubmitted(true);
      submitScore.mutate({ xpEarned: sessionXp, lessonsCompleted: 1, bestStreak: correctCount });
    }
  }, [screen, scoreSubmitted, user, sessionXp, correctCount]);

  function startLesson(topicIdx: number, lessonIdx: number) {
    setSelectedTopic(topicIdx);
    setSelectedLesson(lessonIdx);
    setHearts(3);
    setCurrentQ(0);
    setSelected(null);
    setSubmitted(false);
    setSessionXp(0);
    setCorrectCount(0);
    setScoreSubmitted(false);
    setShowLeaderboard(false);
    setScreen("concept");
  }

  function handleSubmit() {
    if (selected === null || !question) return;
    let correct = false;
    if (question.type === "mcq") correct = selected === question.answer;
    else if (question.type === "tf") correct = selected === question.answer;
    else if (question.type === "fitb") correct = selected === question.options[question.blanks ? question.options.indexOf(question.blanks[0]) : 0];

    // For fitb, check if selected matches the correct blank
    if (question.type === "fitb") {
      correct = selected === question.blanks[0];
    }

    setIsCorrect(correct);
    setSubmitted(true);
    if (correct) {
      const earned = Math.round(lesson!.xp / totalQ);
      setSessionXp(prev => prev + earned);
      setXp(prev => prev + earned);
      setCorrectCount(prev => prev + 1);
    } else {
      setHearts(prev => prev - 1);
    }
  }

  function handleNext() {
    if (!lesson) return;
    if (hearts <= 0 && !isCorrect) {
      setScreen("gameover");
      return;
    }
    if (currentQ + 1 >= totalQ) {
      setScreen("complete");
    } else {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setSubmitted(false);
      setScreen("question");
    }
  }

  function resetToMap() {
    setScreen("map");
    setSelectedTopic(null);
    setSelectedLesson(null);
  }

  // ─── SCREENS ───────────────────────────────────────────────────────────────

  // MAP SCREEN
  if (screen === "map") {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1">
              ← Back
            </button>
            <h1 className="font-bold text-foreground">AWS Learning Path</h1>
            <div className="flex items-center gap-1 text-sm font-semibold text-yellow-500">
              ⚡ {xp} XP
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <p className="text-muted-foreground text-sm">Learn AWS from scratch — one lesson at a time</p>
          </div>

          {/* Topic path */}
          <div className="space-y-4">
            {TOPICS.map((topic, topicIdx) => (
              <div key={topic.id} className={`rounded-2xl border-2 ${topic.borderColor} ${topic.lightColor} p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${topic.color} flex items-center justify-center text-2xl shadow-sm`}>
                    {topic.emoji}
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground text-lg">{topic.title}</h2>
                    <p className="text-muted-foreground text-sm">{topic.description}</p>
                  </div>
                </div>

                {/* Lessons row */}
                <div className="flex gap-3 flex-wrap">
                  {topic.lessons.map((lesson, lessonIdx) => (
                    <button
                      key={lesson.id}
                      onClick={() => startLesson(topicIdx, lessonIdx)}
                      className={`flex-1 min-w-[140px] rounded-xl border-2 border-border bg-background hover:bg-accent transition-all p-3 text-left group`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-muted-foreground">Lesson {lessonIdx + 1}</span>
                        <span className="text-xs font-bold text-yellow-500">+{lesson.xp} XP</span>
                      </div>
                      <p className="text-sm font-medium text-foreground leading-tight">{lesson.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // CONCEPT SCREEN
  if (screen === "concept" && lesson) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="border-b border-border bg-card sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={resetToMap} className="text-muted-foreground hover:text-foreground text-sm">← Topics</button>
            <span className="text-sm font-medium text-muted-foreground">{topic?.title} · Lesson {(selectedLesson ?? 0) + 1}</span>
            <div className="text-sm font-semibold text-yellow-500">⚡ {xp} XP</div>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
          {/* Concept card */}
          <div className={`rounded-2xl border-2 ${topic?.borderColor} ${topic?.lightColor} p-6 mb-6`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{topic?.emoji}</span>
              <Badge variant="secondary" className="text-xs">New Concept</Badge>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">{lesson.concept.title}</h2>
            <p className="text-foreground leading-relaxed mb-4">{lesson.concept.body}</p>
            <div className="bg-background rounded-xl p-4 border border-border mb-4">
              <p className="text-sm text-muted-foreground">{lesson.concept.analogy}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {lesson.concept.keywords.map(kw => (
                <span key={kw} className={`text-xs font-semibold px-2 py-1 rounded-full ${topic?.lightColor} ${topic?.textColor} border ${topic?.borderColor}`}>{kw}</span>
              ))}
            </div>
          </div>

          <Button
            className="w-full py-6 text-base font-bold rounded-2xl"
            onClick={() => setScreen("question")}
          >
            Start Questions ({lesson.questions.length} questions) →
          </Button>
        </div>
      </div>
    );
  }

  // QUESTION SCREEN
  if ((screen === "question" || screen === "feedback") && lesson && question) {
    const progress = ((currentQ + (submitted ? 1 : 0)) / totalQ) * 100;

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <button onClick={resetToMap} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
              {/* Hearts */}
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className={`text-xl ${i < hearts ? "opacity-100" : "opacity-20"}`}>❤️</span>
                ))}
              </div>
              <div className="text-sm font-semibold text-yellow-500">⚡ {xp} XP</div>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">{currentQ + 1} / {totalQ}</p>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full flex flex-col">
          {/* Question */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              {question.type === "mcq" ? "Multiple Choice" : question.type === "tf" ? "True or False" : "Fill in the Blank"}
            </p>
            <h2 className="text-xl font-bold text-foreground leading-snug">{question.question}</h2>
          </div>

          {/* Options */}
          <div className="space-y-3 flex-1">
            {question.type === "mcq" && question.options.map((opt, idx) => {
              let cls = "border-2 border-border bg-card hover:bg-accent hover:border-primary";
              if (submitted) {
                if (idx === question.answer) cls = "border-2 border-green-500 bg-green-50 dark:bg-green-950";
                else if (idx === selected && idx !== question.answer) cls = "border-2 border-red-500 bg-red-50 dark:bg-red-950";
                else cls = "border-2 border-border bg-card opacity-50";
              } else if (selected === idx) {
                cls = "border-2 border-primary bg-primary/10";
              }
              return (
                <button
                  key={idx}
                  disabled={submitted}
                  onClick={() => setSelected(idx)}
                  className={`w-full text-left px-5 py-4 rounded-2xl transition-all font-medium text-foreground ${cls}`}
                >
                  <span className="inline-block w-7 h-7 rounded-full border-2 border-current text-center text-sm leading-6 mr-3 font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              );
            })}

            {question.type === "tf" && (
              <div className="grid grid-cols-2 gap-4">
                {[true, false].map((val) => {
                  let cls = "border-2 border-border bg-card hover:bg-accent hover:border-primary";
                  if (submitted) {
                    if (val === question.answer) cls = "border-2 border-green-500 bg-green-50 dark:bg-green-950";
                    else if (val === selected && val !== question.answer) cls = "border-2 border-red-500 bg-red-50 dark:bg-red-950";
                    else cls = "border-2 border-border bg-card opacity-50";
                  } else if (selected === val) {
                    cls = "border-2 border-primary bg-primary/10";
                  }
                  return (
                    <button
                      key={String(val)}
                      disabled={submitted}
                      onClick={() => setSelected(val)}
                      className={`py-8 rounded-2xl text-2xl font-bold transition-all ${cls}`}
                    >
                      {val ? "✓ True" : "✗ False"}
                    </button>
                  );
                })}
              </div>
            )}

            {question.type === "fitb" && (
              <div className="grid grid-cols-2 gap-3">
                {question.options.map((opt, idx) => {
                  const isCorrectOpt = opt === question.blanks[0];
                  let cls = "border-2 border-border bg-card hover:bg-accent hover:border-primary";
                  if (submitted) {
                    if (isCorrectOpt) cls = "border-2 border-green-500 bg-green-50 dark:bg-green-950";
                    else if (opt === selected && !isCorrectOpt) cls = "border-2 border-red-500 bg-red-50 dark:bg-red-950";
                    else cls = "border-2 border-border bg-card opacity-50";
                  } else if (selected === opt) {
                    cls = "border-2 border-primary bg-primary/10";
                  }
                  return (
                    <button
                      key={idx}
                      disabled={submitted}
                      onClick={() => setSelected(opt)}
                      className={`py-4 px-3 rounded-2xl text-sm font-semibold transition-all text-foreground ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Feedback bar */}
          {submitted && (
            <div className={`mt-6 rounded-2xl p-4 border-2 ${isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950"}`}>
              <p className={`font-bold mb-1 ${isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                {isCorrect ? "✓ Correct!" : "✗ Not quite"}
              </p>
              <p className="text-sm text-foreground">{question.explanation}</p>
            </div>
          )}

          {/* Action button */}
          <div className="mt-6">
            {!submitted ? (
              <Button
                className="w-full py-6 text-base font-bold rounded-2xl"
                disabled={selected === null}
                onClick={handleSubmit}
              >
                Check Answer
              </Button>
            ) : (
              <Button
                className="w-full py-6 text-base font-bold rounded-2xl"
                onClick={handleNext}
              >
                {currentQ + 1 >= totalQ ? "Finish Lesson" : "Continue →"}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // COMPLETE SCREEN
  if (screen === "complete" && lesson) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Lesson Complete!</h2>
          <p className="text-muted-foreground mb-8">{lesson.title}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="text-2xl font-bold text-yellow-500">+{sessionXp}</div>
              <div className="text-xs text-muted-foreground mt-1">XP Earned</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="text-2xl font-bold text-green-500">{correctCount}/{totalQ}</div>
              <div className="text-xs text-muted-foreground mt-1">Correct</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="text-2xl font-bold text-red-500">
                {"❤️".repeat(hearts)}{"🖤".repeat(3 - hearts)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Hearts Left</div>
            </div>
          </div>

          {/* Leaderboard toggle */}
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="text-sm text-primary font-semibold mb-4 underline underline-offset-2"
          >
            {showLeaderboard ? "Hide Leaderboard" : "🏆 View Leaderboard"}
          </button>

          {showLeaderboard && (
            <div className="bg-card border border-border rounded-2xl p-4 mb-6 text-left">
              <h3 className="font-bold text-foreground mb-3 text-sm">Top 10 Players</h3>
              {leaderboard?.length === 0 && <p className="text-muted-foreground text-sm">No scores yet. You're first!</p>}
              {leaderboard?.map((entry, idx) => (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between py-2 border-b border-border last:border-0 ${entry.userId === user?.id ? "text-green-600 dark:text-green-400 font-semibold" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center text-sm">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`}</span>
                    <span className="text-sm">{entry.name || "Anonymous"}{entry.userId === user?.id ? " (You)" : ""}</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-500">⚡ {entry.totalXp}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <Button className="w-full py-5 font-bold rounded-2xl" onClick={resetToMap}>
              Continue Learning →
            </Button>
            <Button variant="outline" className="w-full py-5 font-bold rounded-2xl" onClick={() => startLesson(selectedTopic!, selectedLesson!)}>
              Replay Lesson
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // GAME OVER SCREEN
  if (screen === "gameover") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Out of Hearts</h2>
          <p className="text-muted-foreground mb-8">Don't worry — review the concept and try again!</p>

          <div className="space-y-3">
            <Button className="w-full py-5 font-bold rounded-2xl" onClick={() => startLesson(selectedTopic!, selectedLesson!)}>
              Try Again
            </Button>
            <Button variant="outline" className="w-full py-5 font-bold rounded-2xl" onClick={() => { setScreen("concept"); setCurrentQ(0); setSelected(null); setSubmitted(false); setHearts(3); setSessionXp(0); setCorrectCount(0); }}>
              Review Concept First
            </Button>
            <Button variant="ghost" className="w-full py-5 font-bold rounded-2xl" onClick={() => navigate("/ai-tutor")}>
              Ask AI Tutor for Help
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
