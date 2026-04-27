// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type QuestionType = "mcq" | "truefalse" | "fillin" | "match";
interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correct: string | string[];
  explanation: string;
  pairs?: { left: string; right: string }[];
}
interface Lesson {
  id: string;
  title: string;
  concept: { title: string; body: string; analogy: string; keywords: string[] };
  questions: Question[];
}
interface Path {
  id: string;
  title: string;
  icon: string;
  color: string;
  gradient: string;
  lessons: Lesson[];
}

// ─── CONTENT ──────────────────────────────────────────────────────────────────
const PATHS: Path[] = [
  {
    id: "cloud-basics",
    title: "Cloud Basics",
    icon: "☁️",
    color: "#4FC3F7",
    gradient: "from-sky-500 to-blue-600",
    lessons: [
      {
        id: "cb-1",
        title: "What is the Cloud?",
        concept: {
          title: "The Cloud is Just Someone Else's Computer",
          body: "AWS (Amazon Web Services) is a platform that lets you rent computing resources — servers, storage, databases — over the internet instead of buying physical hardware. You pay only for what you use, like a utility bill.",
          analogy: "Think of it like electricity: you don't build your own power plant — you just plug in and pay for what you use.",
          keywords: ["On-demand", "Pay-as-you-go", "Scalability", "Global infrastructure"],
        },
        questions: [
          { id: "cb1q1", type: "mcq", text: "What does 'pay-as-you-go' mean in AWS?", options: ["Pay a fixed monthly fee regardless of usage", "Pay only for the resources you actually consume", "Pay upfront for a full year of service", "Pay based on the number of users"], correct: "Pay only for the resources you actually consume", explanation: "AWS charges you only for what you use — no idle costs." },
          { id: "cb1q2", type: "truefalse", text: "AWS requires you to purchase physical servers before using their services.", correct: "False", explanation: "AWS is entirely virtual — you never touch physical hardware." },
          { id: "cb1q3", type: "fillin", text: "AWS allows you to ___ your resources up or down based on demand.", options: ["scale", "delete", "migrate", "encrypt"], correct: "scale", explanation: "Scalability is a core benefit — add or remove capacity as needed." },
          { id: "cb1q4", type: "mcq", text: "Which of the following is a key benefit of cloud computing?", options: ["You must manage all hardware yourself", "Resources are only available in one location", "You can access resources from anywhere with internet", "Costs are always higher than on-premises"], correct: "You can access resources from anywhere with internet", explanation: "Cloud resources are globally accessible over the internet." },
        ],
      },
      {
        id: "cb-2",
        title: "AWS Global Infrastructure",
        concept: {
          title: "Regions, Availability Zones & Edge Locations",
          body: "AWS operates in Regions (geographic areas like us-east-1), each containing multiple Availability Zones (AZs) — isolated data centers. Edge Locations are smaller sites used by CloudFront to cache content closer to users.",
          analogy: "A Region is a city. AZs are separate buildings in that city. Edge Locations are local post offices that deliver packages faster.",
          keywords: ["Region", "Availability Zone", "Edge Location", "CloudFront"],
        },
        questions: [
          { id: "cb2q1", type: "mcq", text: "What is an AWS Availability Zone?", options: ["A geographic area containing multiple data centers", "An isolated data center within a Region", "A content delivery network endpoint", "A billing category for AWS services"], correct: "An isolated data center within a Region", explanation: "AZs are isolated facilities within a Region, providing fault tolerance." },
          { id: "cb2q2", type: "truefalse", text: "A single AWS Region contains only one Availability Zone.", correct: "False", explanation: "Each Region has at least 2-3 AZs for redundancy." },
          { id: "cb2q3", type: "fillin", text: "AWS ___ Locations are used by CloudFront to cache content near users.", options: ["Edge", "Core", "Hub", "Relay"], correct: "Edge", explanation: "Edge Locations reduce latency by serving cached content from nearby points." },
          { id: "cb2q4", type: "match", text: "Match each AWS infrastructure term to its definition.", pairs: [{ left: "Region", right: "Geographic area (e.g. us-east-1)" }, { left: "Availability Zone", right: "Isolated data center in a Region" }, { left: "Edge Location", right: "CloudFront cache site" }], correct: ["Region→Geographic area (e.g. us-east-1)", "Availability Zone→Isolated data center in a Region", "Edge Location→CloudFront cache site"], explanation: "These three layers form AWS's global infrastructure." },
        ],
      },
      {
        id: "cb-3",
        title: "Cloud Service Models",
        concept: {
          title: "IaaS, PaaS, and SaaS",
          body: "IaaS (Infrastructure as a Service) gives you raw compute/storage — you manage the OS and apps. PaaS (Platform as a Service) manages the runtime for you — you just deploy code. SaaS (Software as a Service) is a fully managed app you just use.",
          analogy: "IaaS = renting a kitchen. PaaS = renting a restaurant with staff. SaaS = ordering takeout.",
          keywords: ["IaaS", "PaaS", "SaaS", "Shared Responsibility"],
        },
        questions: [
          { id: "cb3q1", type: "mcq", text: "Which service model gives you the most control over the underlying infrastructure?", options: ["SaaS", "PaaS", "IaaS", "FaaS"], correct: "IaaS", explanation: "IaaS provides raw infrastructure — you control the OS, runtime, and apps." },
          { id: "cb3q2", type: "mcq", text: "AWS Elastic Beanstalk is an example of which service model?", options: ["IaaS", "PaaS", "SaaS", "DaaS"], correct: "PaaS", explanation: "Elastic Beanstalk manages the platform — you just upload your code." },
          { id: "cb3q3", type: "truefalse", text: "With SaaS, the customer is responsible for managing the underlying servers.", correct: "False", explanation: "With SaaS, the provider manages everything — servers, OS, runtime, and app." },
          { id: "cb3q4", type: "fillin", text: "In the ___ model, AWS manages everything and you simply use the application.", options: ["SaaS", "IaaS", "PaaS", "CaaS"], correct: "SaaS", explanation: "SaaS = fully managed software delivered over the internet." },
        ],
      },
    ],
  },
  {
    id: "compute",
    title: "Compute",
    icon: "⚡",
    color: "#FF9800",
    gradient: "from-orange-500 to-amber-600",
    lessons: [
      {
        id: "comp-1",
        title: "Amazon EC2",
        concept: {
          title: "Virtual Servers in the Cloud",
          body: "Amazon EC2 (Elastic Compute Cloud) provides resizable virtual machines called instances. You choose the instance type (CPU/RAM), operating system, and storage. EC2 is the backbone of most AWS architectures.",
          analogy: "EC2 is like renting a laptop in the cloud — you choose the specs, install what you need, and pay by the hour.",
          keywords: ["Instance", "AMI", "Instance Type", "Security Group", "Key Pair"],
        },
        questions: [
          { id: "c1q1", type: "mcq", text: "What does AMI stand for in EC2?", options: ["Amazon Machine Image", "Automated Management Interface", "Application Migration Index", "AWS Memory Instance"], correct: "Amazon Machine Image", explanation: "An AMI is a template containing the OS and software configuration for an EC2 instance." },
          { id: "c1q2", type: "truefalse", text: "EC2 instances can only run Linux operating systems.", correct: "False", explanation: "EC2 supports Linux, Windows, and other operating systems." },
          { id: "c1q3", type: "mcq", text: "Which EC2 pricing model offers the biggest discount for committing to 1-3 years?", options: ["On-Demand", "Spot Instances", "Reserved Instances", "Dedicated Hosts"], correct: "Reserved Instances", explanation: "Reserved Instances save up to 72% compared to On-Demand when you commit to 1 or 3 years." },
          { id: "c1q4", type: "fillin", text: "EC2 ___ Instances use spare AWS capacity and can be interrupted, offering up to 90% discount.", options: ["Spot", "Reserved", "Dedicated", "Savings"], correct: "Spot", explanation: "Spot Instances are ideal for fault-tolerant workloads like batch processing." },
        ],
      },
      {
        id: "comp-2",
        title: "AWS Lambda",
        concept: {
          title: "Run Code Without Servers",
          body: "AWS Lambda is a serverless compute service. You upload your function code, define a trigger (API call, S3 event, schedule), and Lambda runs it automatically. You pay only for the milliseconds your code executes.",
          analogy: "Lambda is like a vending machine — you press a button (trigger), it does the work, and you pay per use. No machine maintenance required.",
          keywords: ["Serverless", "Function", "Trigger", "Event-driven", "Cold Start"],
        },
        questions: [
          { id: "c2q1", type: "mcq", text: "What is the maximum execution timeout for an AWS Lambda function?", options: ["1 minute", "5 minutes", "15 minutes", "60 minutes"], correct: "15 minutes", explanation: "Lambda functions can run for a maximum of 15 minutes per invocation." },
          { id: "c2q2", type: "truefalse", text: "With AWS Lambda, you are responsible for managing the underlying server infrastructure.", correct: "False", explanation: "Lambda is serverless — AWS manages all infrastructure. You only write code." },
          { id: "c2q3", type: "mcq", text: "Which of the following can trigger an AWS Lambda function?", options: ["Only HTTP requests", "Only scheduled events", "S3 events, API Gateway, DynamoDB streams, and more", "Only manual invocations"], correct: "S3 events, API Gateway, DynamoDB streams, and more", explanation: "Lambda integrates with dozens of AWS services as event sources." },
          { id: "c2q4", type: "fillin", text: "Lambda's ___ start refers to the delay when a function is invoked after being idle.", options: ["Cold", "Warm", "Hot", "Slow"], correct: "Cold", explanation: "Cold starts occur when Lambda initializes a new execution environment — typically adds 100ms-1s." },
        ],
      },
      {
        id: "comp-3",
        title: "Auto Scaling & Load Balancing",
        concept: {
          title: "Handle Any Traffic Level Automatically",
          body: "Auto Scaling automatically adjusts the number of EC2 instances based on demand. Elastic Load Balancing (ELB) distributes incoming traffic across multiple instances. Together, they ensure high availability and cost efficiency.",
          analogy: "Auto Scaling is like a restaurant that opens more checkout lanes when it gets busy and closes them when it's quiet. ELB is the host who directs customers to open lanes.",
          keywords: ["Auto Scaling Group", "ELB", "ALB", "NLB", "Target Group", "Health Check"],
        },
        questions: [
          { id: "c3q1", type: "mcq", text: "What does an Auto Scaling Group do when CPU utilization exceeds a threshold?", options: ["Terminates all instances", "Launches additional EC2 instances", "Reduces instance size", "Migrates to Lambda"], correct: "Launches additional EC2 instances", explanation: "Auto Scaling adds capacity when demand increases and removes it when demand drops." },
          { id: "c3q2", type: "mcq", text: "Which type of load balancer operates at Layer 7 (HTTP/HTTPS) and supports path-based routing?", options: ["Network Load Balancer", "Classic Load Balancer", "Application Load Balancer", "Gateway Load Balancer"], correct: "Application Load Balancer", explanation: "ALB operates at Layer 7 and supports host-based and path-based routing rules." },
          { id: "c3q3", type: "truefalse", text: "Elastic Load Balancing can distribute traffic across instances in multiple Availability Zones.", correct: "True", explanation: "ELB is designed to span multiple AZs for high availability." },
          { id: "c3q4", type: "fillin", text: "Auto Scaling uses ___ checks to determine if an instance is healthy and should receive traffic.", options: ["Health", "Status", "Ping", "Pulse"], correct: "Health", explanation: "Health checks ensure traffic is only sent to healthy, functioning instances." },
        ],
      },
    ],
  },
  {
    id: "storage",
    title: "Storage",
    icon: "🗄️",
    color: "#66BB6A",
    gradient: "from-green-500 to-emerald-600",
    lessons: [
      {
        id: "stor-1",
        title: "Amazon S3",
        concept: {
          title: "Unlimited Object Storage",
          body: "Amazon S3 (Simple Storage Service) stores objects (files) in buckets. It's infinitely scalable, highly durable (99.999999999% — 11 nines), and accessible from anywhere. S3 is used for backups, static websites, data lakes, and more.",
          analogy: "S3 is like Google Drive for your applications — unlimited space, organized in folders (buckets), accessible via URL.",
          keywords: ["Bucket", "Object", "Key", "Versioning", "Storage Class", "Lifecycle Policy"],
        },
        questions: [
          { id: "s1q1", type: "mcq", text: "What is the maximum size of a single object in Amazon S3?", options: ["5 GB", "50 GB", "5 TB", "Unlimited"], correct: "5 TB", explanation: "Individual S3 objects can be up to 5 TB. Use multipart upload for objects over 100 MB." },
          { id: "s1q2", type: "truefalse", text: "Amazon S3 is a block storage service like a hard drive.", correct: "False", explanation: "S3 is object storage — it stores files as objects with metadata, not as blocks on a disk." },
          { id: "s1q3", type: "mcq", text: "Which S3 storage class is most cost-effective for data accessed less than once a month?", options: ["S3 Standard", "S3 Intelligent-Tiering", "S3 Glacier", "S3 Standard-IA"], correct: "S3 Glacier", explanation: "S3 Glacier is designed for archival data with retrieval times of minutes to hours at very low cost." },
          { id: "s1q4", type: "fillin", text: "S3 ___ automatically moves objects between storage classes based on access patterns.", options: ["Lifecycle", "Replication", "Transfer", "Migration"], correct: "Lifecycle", explanation: "Lifecycle policies automate transitions (e.g., move to Glacier after 90 days)." },
        ],
      },
      {
        id: "stor-2",
        title: "EBS & EFS",
        concept: {
          title: "Block and File Storage for EC2",
          body: "EBS (Elastic Block Store) is a persistent block storage volume attached to a single EC2 instance — like a hard drive. EFS (Elastic File System) is a managed NFS file system that can be mounted by multiple EC2 instances simultaneously.",
          analogy: "EBS is like a USB drive plugged into one computer. EFS is like a shared network drive that multiple computers can access at the same time.",
          keywords: ["EBS Volume", "Snapshot", "EFS Mount Target", "IOPS", "Throughput"],
        },
        questions: [
          { id: "s2q1", type: "mcq", text: "How many EC2 instances can attach to a single EBS volume by default?", options: ["Unlimited", "Up to 16 (with Multi-Attach)", "Only 1", "Up to 5"], correct: "Only 1", explanation: "By default, an EBS volume attaches to one EC2 instance. Multi-Attach is a special feature for specific volume types." },
          { id: "s2q2", type: "truefalse", text: "Amazon EFS can be mounted by multiple EC2 instances at the same time.", correct: "True", explanation: "EFS is a shared file system — multiple instances across multiple AZs can mount it simultaneously." },
          { id: "s2q3", type: "mcq", text: "What is an EBS Snapshot?", options: ["A real-time backup of an EC2 instance", "A point-in-time backup of an EBS volume stored in S3", "A copy of an AMI", "A monitoring metric for disk I/O"], correct: "A point-in-time backup of an EBS volume stored in S3", explanation: "Snapshots are incremental backups stored in S3 that can restore volumes or create AMIs." },
          { id: "s2q4", type: "fillin", text: "EBS ___ measures how many read/write operations per second a volume can handle.", options: ["IOPS", "Throughput", "Latency", "Bandwidth"], correct: "IOPS", explanation: "IOPS (Input/Output Operations Per Second) is the key performance metric for EBS volumes." },
        ],
      },
      {
        id: "stor-3",
        title: "Storage Gateway & Snow Family",
        concept: {
          title: "Hybrid and Physical Data Transfer",
          body: "Storage Gateway connects on-premises environments to AWS storage. The Snow Family (Snowball, Snowmobile) are physical devices for migrating large amounts of data to AWS when internet transfer would take too long.",
          analogy: "Storage Gateway is a bridge between your office and AWS. Snowball is a rugged suitcase you fill with data and mail to Amazon.",
          keywords: ["Storage Gateway", "Snowball", "Snowmobile", "DataSync", "Hybrid Cloud"],
        },
        questions: [
          { id: "s3q1", type: "mcq", text: "A company needs to migrate 80 PB of data to AWS. Internet transfer would take years. What should they use?", options: ["AWS Direct Connect", "AWS DataSync", "AWS Snowmobile", "S3 Transfer Acceleration"], correct: "AWS Snowmobile", explanation: "Snowmobile is a 45-foot shipping container that can transfer up to 100 PB — ideal for massive migrations." },
          { id: "s3q2", type: "truefalse", text: "AWS Snowball Edge can run EC2 instances and Lambda functions locally.", correct: "True", explanation: "Snowball Edge has compute capabilities for edge processing before data is shipped to AWS." },
          { id: "s3q3", type: "mcq", text: "Which service provides a hybrid cloud storage gateway that caches frequently accessed data on-premises?", options: ["AWS DataSync", "AWS Storage Gateway", "AWS Transfer Family", "Amazon FSx"], correct: "AWS Storage Gateway", explanation: "Storage Gateway bridges on-premises storage with AWS, with local caching for low-latency access." },
          { id: "s3q4", type: "fillin", text: "AWS ___ is used to automate data transfers between on-premises storage and AWS storage services.", options: ["DataSync", "Snowball", "Transfer", "Sync"], correct: "DataSync", explanation: "DataSync automates and accelerates online data transfers, handling scheduling and monitoring." },
        ],
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    icon: "🔐",
    color: "#AB47BC",
    gradient: "from-purple-500 to-violet-600",
    lessons: [
      {
        id: "sec-1",
        title: "IAM — Identity & Access Management",
        concept: {
          title: "Who Can Do What in AWS",
          body: "IAM controls who (users, groups, roles) can access which AWS resources and what actions they can perform. The principle of least privilege means granting only the minimum permissions needed.",
          analogy: "IAM is like a keycard system in an office — different employees have access to different rooms based on their role.",
          keywords: ["User", "Group", "Role", "Policy", "Least Privilege", "MFA"],
        },
        questions: [
          { id: "sec1q1", type: "mcq", text: "What is the best practice for the AWS root account?", options: ["Use it for all daily tasks", "Share it with the team", "Enable MFA and avoid using it for daily tasks", "Delete it after creating an admin user"], correct: "Enable MFA and avoid using it for daily tasks", explanation: "The root account has unrestricted access — protect it with MFA and use IAM users for daily work." },
          { id: "sec1q2", type: "truefalse", text: "An IAM Role can be assumed by an EC2 instance to access other AWS services.", correct: "True", explanation: "IAM Roles are the correct way to grant EC2 instances (and other services) access to AWS resources." },
          { id: "sec1q3", type: "mcq", text: "Which IAM concept groups multiple permissions together into a reusable document?", options: ["Role", "Group", "Policy", "Permission Boundary"], correct: "Policy", explanation: "IAM Policies are JSON documents that define allowed/denied actions on specific resources." },
          { id: "sec1q4", type: "fillin", text: "The principle of ___ privilege means granting only the minimum permissions required.", options: ["Least", "Most", "Zero", "Maximum"], correct: "Least", explanation: "Least privilege reduces the blast radius if credentials are compromised." },
        ],
      },
      {
        id: "sec-2",
        title: "Encryption & Key Management",
        concept: {
          title: "Protecting Data at Rest and in Transit",
          body: "AWS KMS (Key Management Service) creates and manages encryption keys. Data at rest (stored data) and data in transit (moving data) should both be encrypted. SSL/TLS encrypts data in transit; KMS encrypts data at rest.",
          analogy: "Encryption is like a lockbox — KMS holds the keys, and only authorized parties can open it.",
          keywords: ["KMS", "CMK", "Envelope Encryption", "SSL/TLS", "At Rest", "In Transit"],
        },
        questions: [
          { id: "sec2q1", type: "mcq", text: "Which AWS service manages encryption keys for services like S3, EBS, and RDS?", options: ["AWS Secrets Manager", "AWS Certificate Manager", "AWS KMS", "AWS CloudHSM"], correct: "AWS KMS", explanation: "KMS is the central key management service integrated with most AWS storage and database services." },
          { id: "sec2q2", type: "truefalse", text: "Data 'in transit' refers to data stored on an EBS volume.", correct: "False", explanation: "Data in transit is data moving over a network. Data at rest is stored data (EBS, S3, RDS, etc.)." },
          { id: "sec2q3", type: "mcq", text: "Which service stores and rotates database passwords, API keys, and other secrets automatically?", options: ["AWS KMS", "AWS IAM", "AWS Secrets Manager", "AWS Parameter Store"], correct: "AWS Secrets Manager", explanation: "Secrets Manager stores secrets and can automatically rotate them on a schedule." },
          { id: "sec2q4", type: "fillin", text: "AWS ___ Manager provisions and manages SSL/TLS certificates for use with AWS services.", options: ["Certificate", "Key", "Secret", "Token"], correct: "Certificate", explanation: "AWS Certificate Manager (ACM) provides free SSL/TLS certificates for use with CloudFront, ALB, and API Gateway." },
        ],
      },
      {
        id: "sec-3",
        title: "Network Security",
        concept: {
          title: "Firewalls, DDoS Protection & Monitoring",
          body: "Security Groups act as virtual firewalls for EC2 instances (stateful). NACLs (Network ACLs) control traffic at the subnet level (stateless). AWS Shield protects against DDoS attacks. AWS WAF filters malicious web traffic.",
          analogy: "Security Groups are like a bouncer at the door of each instance. NACLs are like a checkpoint at the entrance to the neighborhood. Shield is like a riot shield against large-scale attacks.",
          keywords: ["Security Group", "NACL", "WAF", "Shield", "GuardDuty", "Stateful vs Stateless"],
        },
        questions: [
          { id: "sec3q1", type: "mcq", text: "What is the key difference between Security Groups and Network ACLs?", options: ["Security Groups are stateless; NACLs are stateful", "Security Groups are stateful; NACLs are stateless", "Security Groups apply to subnets; NACLs apply to instances", "They are identical in functionality"], correct: "Security Groups are stateful; NACLs are stateless", explanation: "Stateful (SG) means return traffic is automatically allowed. Stateless (NACL) means you must explicitly allow both directions." },
          { id: "sec3q2", type: "truefalse", text: "AWS Shield Standard is automatically enabled for all AWS customers at no extra cost.", correct: "True", explanation: "Shield Standard provides basic DDoS protection for all AWS customers automatically." },
          { id: "sec3q3", type: "mcq", text: "Which service uses machine learning to detect threats and suspicious activity in your AWS account?", options: ["AWS WAF", "AWS Inspector", "Amazon GuardDuty", "AWS Config"], correct: "Amazon GuardDuty", explanation: "GuardDuty analyzes CloudTrail, VPC Flow Logs, and DNS logs to detect threats using ML." },
          { id: "sec3q4", type: "fillin", text: "AWS ___ filters malicious web requests like SQL injection and cross-site scripting.", options: ["WAF", "Shield", "Firewall", "Guard"], correct: "WAF", explanation: "WAF (Web Application Firewall) sits in front of your web apps and blocks common attack patterns." },
        ],
      },
    ],
  },
  {
    id: "networking",
    title: "Networking",
    icon: "🌐",
    color: "#EF5350",
    gradient: "from-red-500 to-rose-600",
    lessons: [
      {
        id: "net-1",
        title: "Amazon VPC",
        concept: {
          title: "Your Private Network in AWS",
          body: "A VPC (Virtual Private Cloud) is an isolated network you define in AWS. Inside a VPC, you create subnets (public or private), route tables, and internet gateways. Public subnets can reach the internet; private subnets cannot (without NAT).",
          analogy: "A VPC is like your company's private office building. Public subnets face the street (internet). Private subnets are internal rooms with no windows.",
          keywords: ["VPC", "Subnet", "Route Table", "Internet Gateway", "NAT Gateway", "CIDR"],
        },
        questions: [
          { id: "n1q1", type: "mcq", text: "What allows instances in a private subnet to initiate outbound internet connections without being directly reachable from the internet?", options: ["Internet Gateway", "VPC Peering", "NAT Gateway", "Direct Connect"], correct: "NAT Gateway", explanation: "NAT Gateway allows private subnet instances to reach the internet for updates/patches while blocking inbound connections." },
          { id: "n1q2", type: "truefalse", text: "A public subnet in a VPC is directly connected to the internet by default.", correct: "False", explanation: "A subnet is public only when it has a route to an Internet Gateway in its route table." },
          { id: "n1q3", type: "mcq", text: "Which component connects a VPC to the public internet?", options: ["NAT Gateway", "VPN Gateway", "Internet Gateway", "Transit Gateway"], correct: "Internet Gateway", explanation: "An Internet Gateway is the VPC component that enables communication between the VPC and the internet." },
          { id: "n1q4", type: "fillin", text: "VPC ___ connects two VPCs privately without using the internet.", options: ["Peering", "Tunneling", "Linking", "Bridging"], correct: "Peering", explanation: "VPC Peering creates a private connection between two VPCs using AWS's internal network." },
        ],
      },
      {
        id: "net-2",
        title: "Route 53 & CloudFront",
        concept: {
          title: "DNS and Content Delivery",
          body: "Amazon Route 53 is a highly available DNS service that routes users to your application. Amazon CloudFront is a CDN (Content Delivery Network) that caches content at Edge Locations worldwide, reducing latency for global users.",
          analogy: "Route 53 is like a phone book — it translates domain names to IP addresses. CloudFront is like having local warehouses worldwide so packages arrive faster.",
          keywords: ["DNS", "Hosted Zone", "Record Set", "CDN", "Edge Location", "Origin", "Distribution"],
        },
        questions: [
          { id: "n2q1", type: "mcq", text: "Which Route 53 routing policy sends traffic to the endpoint with the lowest latency for the user?", options: ["Simple routing", "Weighted routing", "Latency-based routing", "Geolocation routing"], correct: "Latency-based routing", explanation: "Latency-based routing measures actual network latency and routes to the fastest endpoint." },
          { id: "n2q2", type: "truefalse", text: "Amazon CloudFront can only cache static content like images and videos.", correct: "False", explanation: "CloudFront can cache both static and dynamic content, and also supports Lambda@Edge for custom logic." },
          { id: "n2q3", type: "mcq", text: "What is the 'origin' in a CloudFront distribution?", options: ["The Edge Location closest to the user", "The source server where CloudFront fetches content", "The DNS record for the domain", "The SSL certificate for the distribution"], correct: "The source server where CloudFront fetches content", explanation: "The origin is the backend — an S3 bucket, ALB, EC2 instance, or custom HTTP server." },
          { id: "n2q4", type: "fillin", text: "Route 53 ___ routing sends a percentage of traffic to different endpoints for A/B testing.", options: ["Weighted", "Latency", "Failover", "Simple"], correct: "Weighted", explanation: "Weighted routing lets you split traffic (e.g., 90% to v1, 10% to v2) for gradual rollouts." },
        ],
      },
      {
        id: "net-3",
        title: "Direct Connect & VPN",
        concept: {
          title: "Connecting Your Data Center to AWS",
          body: "AWS Direct Connect provides a dedicated private network connection from your data center to AWS — bypassing the public internet for consistent performance. AWS Site-to-Site VPN creates an encrypted tunnel over the internet.",
          analogy: "Direct Connect is a private highway between your office and AWS. VPN is a secure tunnel through the public highway system.",
          keywords: ["Direct Connect", "Site-to-Site VPN", "Virtual Private Gateway", "BGP", "Bandwidth"],
        },
        questions: [
          { id: "n3q1", type: "mcq", text: "A company needs a consistent, low-latency connection to AWS that doesn't use the public internet. What should they use?", options: ["AWS Site-to-Site VPN", "AWS Direct Connect", "AWS Transit Gateway", "VPC Peering"], correct: "AWS Direct Connect", explanation: "Direct Connect provides a dedicated physical connection with consistent performance and lower latency than VPN." },
          { id: "n3q2", type: "truefalse", text: "AWS Site-to-Site VPN traffic travels over the public internet but is encrypted.", correct: "True", explanation: "VPN uses IPSec encryption over the public internet — it's secure but subject to internet variability." },
          { id: "n3q3", type: "mcq", text: "Which service acts as a central hub to connect multiple VPCs and on-premises networks?", options: ["VPC Peering", "AWS Direct Connect", "AWS Transit Gateway", "Internet Gateway"], correct: "AWS Transit Gateway", explanation: "Transit Gateway simplifies network architecture by acting as a hub for VPC-to-VPC and VPC-to-on-premises connectivity." },
          { id: "n3q4", type: "fillin", text: "Direct Connect provides a ___ connection, meaning it doesn't share bandwidth with other internet users.", options: ["Dedicated", "Shared", "Virtual", "Encrypted"], correct: "Dedicated", explanation: "Dedicated connections provide consistent bandwidth without the variability of shared internet." },
        ],
      },
    ],
  },
];

// ─── ESCAPE ROOM CHALLENGES ───────────────────────────────────────────────────
const ESCAPE_CHALLENGES = [
  {
    id: "esc-1",
    title: "The Overloaded Server",
    scenario: "🚨 Your EC2 instance CPU is at 100% and users are getting timeouts. You have 60 seconds to fix it.",
    options: ["Add more RAM to the existing instance", "Enable Auto Scaling with a target tracking policy", "Restart the EC2 instance", "Move the app to S3"],
    correct: "Enable Auto Scaling with a target tracking policy",
    explanation: "Auto Scaling automatically adds instances when CPU is high, distributing load without downtime.",
  },
  {
    id: "esc-2",
    title: "The Data Breach Alert",
    scenario: "🔐 GuardDuty detected unusual API calls from an IAM user. The account may be compromised. Act fast!",
    options: ["Delete the IAM user immediately", "Disable the IAM user's access keys and investigate CloudTrail logs", "Change the root password", "Enable S3 versioning"],
    correct: "Disable the IAM user's access keys and investigate CloudTrail logs",
    explanation: "Disabling keys stops the attack immediately. CloudTrail logs reveal what was accessed so you can assess damage.",
  },
  {
    id: "esc-3",
    title: "The Missing Backup",
    scenario: "💾 Your RDS database crashed and you need to restore it. The last backup was 6 hours ago. What do you do?",
    options: ["Restore from the automated backup snapshot", "Use Point-in-Time Recovery to restore to 5 minutes before the crash", "Create a new RDS instance from scratch", "Import data from S3"],
    correct: "Use Point-in-Time Recovery to restore to 5 minutes before the crash",
    explanation: "RDS Point-in-Time Recovery lets you restore to any second within your backup retention period — minimizing data loss.",
  },
  {
    id: "esc-4",
    title: "The DDoS Attack",
    scenario: "⚠️ Your website is under a massive DDoS attack. Traffic has spiked 1000x. What's your first move?",
    options: ["Shut down the website temporarily", "Enable AWS Shield Advanced and AWS WAF rules", "Increase EC2 instance size", "Move to a different region"],
    correct: "Enable AWS Shield Advanced and AWS WAF rules",
    explanation: "Shield Advanced provides DDoS protection with 24/7 support. WAF blocks malicious traffic patterns at the edge.",
  },
  {
    id: "esc-5",
    title: "The Runaway Bill",
    scenario: "💸 Your AWS bill jumped from $200 to $5,000 this month. You need to find the cause immediately.",
    options: ["Call AWS support and ask them to fix it", "Check AWS Cost Explorer and set up billing alerts", "Delete all resources and start over", "Switch to a different cloud provider"],
    correct: "Check AWS Cost Explorer and set up billing alerts",
    explanation: "Cost Explorer shows a breakdown by service and time. Billing alerts (via Budgets) prevent future surprises.",
  },
  {
    id: "esc-6",
    title: "The Slow Database",
    scenario: "🐌 Your RDS MySQL database is responding slowly. Read queries are taking 10+ seconds. Fix it!",
    options: ["Upgrade to a larger RDS instance", "Add an ElastiCache layer to cache frequent read queries", "Move the database to EC2", "Enable Multi-AZ"],
    correct: "Add an ElastiCache layer to cache frequent read queries",
    explanation: "ElastiCache (Redis/Memcached) caches frequent queries in memory, reducing database load and response times dramatically.",
  },
];

// ─── LEARNING CENTER CARDS ────────────────────────────────────────────────────
const LEARN_CARDS = [
  { service: "Amazon EC2", icon: "⚡", category: "Compute", tagline: "Virtual servers in the cloud", detail: "Resizable compute capacity. Choose instance type, OS, storage. Pay per hour or second." },
  { service: "Amazon S3", icon: "🪣", category: "Storage", tagline: "Infinitely scalable object storage", detail: "Store any amount of data. 99.999999999% durability. Used for backups, static sites, data lakes." },
  { service: "Amazon RDS", icon: "🗃️", category: "Database", tagline: "Managed relational databases", detail: "Supports MySQL, PostgreSQL, Oracle, SQL Server. Automated backups, Multi-AZ, read replicas." },
  { service: "AWS Lambda", icon: "λ", category: "Compute", tagline: "Run code without servers", detail: "Event-driven. Pay per millisecond. 15-minute max timeout. Integrates with 200+ AWS services." },
  { service: "Amazon VPC", icon: "🔒", category: "Networking", tagline: "Your private network in AWS", detail: "Isolated virtual network. Define subnets, route tables, security groups, NACLs." },
  { service: "Amazon CloudFront", icon: "🌍", category: "Networking", tagline: "Global content delivery network", detail: "Caches content at 400+ Edge Locations. Reduces latency. Integrates with S3, ALB, custom origins." },
  { service: "AWS IAM", icon: "🔑", category: "Security", tagline: "Identity and access management", detail: "Users, groups, roles, policies. Principle of least privilege. MFA support. Free service." },
  { service: "Amazon DynamoDB", icon: "⚡🗃️", category: "Database", tagline: "Serverless NoSQL database", detail: "Single-digit millisecond performance. Scales to millions of requests/second. Key-value and document model." },
  { service: "Amazon Route 53", icon: "📡", category: "Networking", tagline: "Scalable DNS and routing", detail: "Domain registration, DNS routing, health checks. Multiple routing policies (latency, weighted, geo)." },
  { service: "AWS KMS", icon: "🔐", category: "Security", tagline: "Managed encryption key service", detail: "Create and control encryption keys. Integrates with S3, EBS, RDS, Lambda. FIPS 140-2 compliant." },
  { service: "Amazon EKS", icon: "🐳", category: "Compute", tagline: "Managed Kubernetes service", detail: "Run containerized workloads. AWS manages the control plane. Integrates with IAM, VPC, ALB." },
  { service: "AWS CloudFormation", icon: "📋", category: "Management", tagline: "Infrastructure as Code", detail: "Define AWS resources in JSON/YAML templates. Automate provisioning. Drift detection. Free service." },
  { service: "Amazon SQS", icon: "📬", category: "Messaging", tagline: "Managed message queue", detail: "Decouple microservices. Standard (at-least-once) and FIFO (exactly-once) queues. Up to 14-day retention." },
  { service: "Amazon SNS", icon: "📢", category: "Messaging", tagline: "Pub/sub notification service", detail: "Fan-out messages to SQS, Lambda, email, SMS, HTTP. Topics and subscriptions model." },
  { service: "AWS Direct Connect", icon: "🔌", category: "Networking", tagline: "Dedicated network to AWS", detail: "Bypass the public internet. Consistent bandwidth and latency. 1 Gbps to 100 Gbps connections." },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
type Screen = "hub" | "path-detail" | "lesson-concept" | "lesson-question" | "lesson-complete" | "escape-room" | "escape-question" | "escape-complete" | "learn-center";

export default function AwsGame() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Navigation
  const [screen, setScreen] = useState<Screen>("hub");
  const [activeTab, setActiveTab] = useState<"learn" | "escape" | "reference">("learn");
  const [selectedPath, setSelectedPath] = useState<Path | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonIndex, setLessonIndex] = useState(0);

  // Game state
  const [hearts, setHearts] = useState(3);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [matchLeft, setMatchLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [lessonXp, setLessonXp] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Escape Room
  const [escapeIndex, setEscapeIndex] = useState(0);
  const [escapeTimer, setEscapeTimer] = useState(60);
  const [escapeSelected, setEscapeSelected] = useState<string | null>(null);
  const [escapeShowFeedback, setEscapeShowFeedback] = useState(false);
  const [escapeCorrect, setEscapeCorrect] = useState(false);
  const [escapeSolved, setEscapeSolved] = useState(0);
  const [escapeTimerActive, setEscapeTimerActive] = useState(false);

  // Leaderboard
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const submitScore = trpc.game?.submitScore?.useMutation?.();
  const { data: leaderboard } = trpc.game?.getLeaderboard?.useQuery?.() ?? { data: null };

  // Escape timer
  useEffect(() => {
    if (!escapeTimerActive) return;
    if (escapeTimer <= 0) {
      setEscapeTimerActive(false);
      setEscapeShowFeedback(true);
      setEscapeCorrect(false);
      return;
    }
    const t = setTimeout(() => setEscapeTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [escapeTimer, escapeTimerActive]);

  // Submit score on lesson complete
  useEffect(() => {
    if (screen === "lesson-complete" && !scoreSubmitted && user && submitScore) {
      submitScore.mutate({ xpEarned: lessonXp, lessonsCompleted: 1, streak: streak });
      setScoreSubmitted(true);
    }
  }, [screen]);

  const startLesson = (path: Path, idx: number) => {
    const lesson = path.lessons[idx];
    setSelectedPath(path);
    setSelectedLesson(lesson);
    setLessonIndex(idx);
    setHearts(3);
    setCurrentQ(0);
    setLessonXp(0);
    setStreak(0);
    setSelected(null);
    setMatchLeft(null);
    setMatchedPairs([]);
    setShowFeedback(false);
    setScoreSubmitted(false);
    setScreen("lesson-concept");
  };

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;
    setSelected(answer);
    const q = selectedLesson!.questions[currentQ];
    const correct = Array.isArray(q.correct) ? q.correct.includes(answer) : q.correct === answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) {
      const gained = 10 + streak * 2;
      setLessonXp((p) => p + gained);
      setXp((p) => p + gained);
      setStreak((p) => p + 1);
    } else {
      setHearts((p) => Math.max(0, p - 1));
      setStreak(0);
    }
  };

  const handleMatchSelect = (side: "left" | "right", value: string) => {
    if (showFeedback) return;
    const q = selectedLesson!.questions[currentQ];
    if (side === "left") {
      setMatchLeft(value);
    } else if (matchLeft) {
      const pair = `${matchLeft}→${value}`;
      const correctPairs = q.correct as string[];
      if (correctPairs.includes(pair)) {
        const newMatched = [...matchedPairs, matchLeft, value];
        setMatchedPairs(newMatched);
        if (newMatched.length / 2 === q.pairs!.length) {
          setIsCorrect(true);
          setShowFeedback(true);
          const gained = 15 + streak * 2;
          setLessonXp((p) => p + gained);
          setXp((p) => p + gained);
          setStreak((p) => p + 1);
        }
      } else {
        setHearts((p) => Math.max(0, p - 1));
        setStreak(0);
      }
      setMatchLeft(null);
    }
  };

  const nextQuestion = () => {
    if (!selectedLesson) return;
    if (hearts === 0) {
      setScreen("hub");
      return;
    }
    if (currentQ + 1 >= selectedLesson.questions.length) {
      setCompletedLessons((p) => new Set([...p, selectedLesson.id]));
      setScreen("lesson-complete");
    } else {
      setCurrentQ((p) => p + 1);
      setSelected(null);
      setMatchLeft(null);
      setMatchedPairs([]);
      setShowFeedback(false);
    }
  };

  const startEscape = () => {
    setEscapeIndex(0);
    setEscapeSolved(0);
    setEscapeTimer(60);
    setEscapeSelected(null);
    setEscapeShowFeedback(false);
    setEscapeTimerActive(true);
    setScreen("escape-question");
  };

  const handleEscapeAnswer = (answer: string) => {
    if (escapeShowFeedback) return;
    setEscapeTimerActive(false);
    setEscapeSelected(answer);
    const correct = answer === ESCAPE_CHALLENGES[escapeIndex].correct;
    setEscapeCorrect(correct);
    setEscapeShowFeedback(true);
    if (correct) setEscapeSolved((p) => p + 1);
  };

  const nextEscape = () => {
    if (escapeIndex + 1 >= ESCAPE_CHALLENGES.length) {
      setScreen("escape-complete");
    } else {
      setEscapeIndex((p) => p + 1);
      setEscapeTimer(60);
      setEscapeSelected(null);
      setEscapeShowFeedback(false);
      setEscapeTimerActive(true);
    }
  };

  // ── SCREENS ────────────────────────────────────────────────────────────────

  // HUB
  if (screen === "hub") {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Back</button>
            <span className="font-bold text-lg text-foreground">AWS Learning Game</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-amber-500">⚡ {xp} XP</span>
            <span className="text-sm font-semibold text-rose-500">{"❤️".repeat(hearts)}{"🖤".repeat(3 - hearts)}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-card">
          {(["learn", "escape", "reference"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab === "learn" ? "📚 Learn" : tab === "escape" ? "🚨 Escape Room" : "📖 Reference"}
            </button>
          ))}
        </div>

        {/* Learn Tab */}
        {activeTab === "learn" && (
          <div className="p-4 max-w-2xl mx-auto">
            <p className="text-muted-foreground text-sm mb-4">Complete lessons in order to unlock new topics. Each lesson teaches a concept then tests your knowledge.</p>
            <div className="space-y-3">
              {PATHS.map((path, pi) => {
                const completedCount = path.lessons.filter((l) => completedLessons.has(l.id)).length;
                const isUnlocked = pi === 0 || PATHS[pi - 1].lessons.every((l) => completedLessons.has(l.id));
                return (
                  <div
                    key={path.id}
                    onClick={() => { if (isUnlocked) { setSelectedPath(path); setScreen("path-detail"); } }}
                    className={`rounded-xl border p-4 transition-all ${isUnlocked ? "border-border bg-card hover:border-primary cursor-pointer" : "border-border bg-muted opacity-50 cursor-not-allowed"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${path.gradient} flex items-center justify-center text-2xl shadow-sm`}>
                        {path.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{path.title}</span>
                          {!isUnlocked && <span className="text-xs text-muted-foreground">🔒 Locked</span>}
                          {completedCount === path.lessons.length && completedCount > 0 && <Badge className="text-xs bg-green-500 text-white">Complete ✓</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{path.lessons.length} lessons · {completedCount}/{path.lessons.length} done</div>
                        <Progress value={(completedCount / path.lessons.length) * 100} className="h-1.5 mt-2" />
                      </div>
                      {isUnlocked && <span className="text-muted-foreground">›</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Escape Room Tab */}
        {activeTab === "escape" && (
          <div className="p-4 max-w-2xl mx-auto">
            <div className="rounded-xl border border-border bg-card p-6 text-center mb-4">
              <div className="text-5xl mb-3">🚨</div>
              <h2 className="text-xl font-bold text-foreground mb-2">AWS Escape Room</h2>
              <p className="text-muted-foreground text-sm mb-4">6 real AWS incidents. 60 seconds each. Can you solve them all before time runs out?</p>
              <Button onClick={startEscape} className="bg-red-600 hover:bg-red-700 text-white px-8">Start Escape Room</Button>
            </div>
            <div className="space-y-2">
              {ESCAPE_CHALLENGES.map((c, i) => (
                <div key={c.id} className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
                  <span className="text-2xl">{["🖥️", "🔐", "💾", "⚠️", "💸", "🐌"][i]}</span>
                  <div>
                    <div className="font-medium text-sm text-foreground">{c.title}</div>
                    <div className="text-xs text-muted-foreground">60 second challenge</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reference Tab */}
        {activeTab === "reference" && (
          <div className="p-4 max-w-2xl mx-auto">
            <p className="text-muted-foreground text-sm mb-4">Quick reference cards for all major AWS services. Tap any card to see details.</p>
            <div className="grid grid-cols-2 gap-3">
              {LEARN_CARDS.map((card) => (
                <div key={card.service} className="rounded-xl border border-border bg-card p-3 hover:border-primary transition-colors cursor-pointer">
                  <div className="text-2xl mb-1">{card.icon}</div>
                  <div className="font-semibold text-sm text-foreground">{card.service}</div>
                  <Badge variant="outline" className="text-xs mt-1">{card.category}</Badge>
                  <p className="text-xs text-muted-foreground mt-2">{card.tagline}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // PATH DETAIL
  if (screen === "path-detail" && selectedPath) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
          <button onClick={() => setScreen("hub")} className="text-muted-foreground hover:text-foreground text-sm">← Back</button>
          <span className="text-2xl">{selectedPath.icon}</span>
          <span className="font-bold text-lg text-foreground">{selectedPath.title}</span>
        </div>
        <div className="p-4 max-w-2xl mx-auto space-y-3">
          {selectedPath.lessons.map((lesson, idx) => {
            const done = completedLessons.has(lesson.id);
            const isUnlocked = idx === 0 || completedLessons.has(selectedPath.lessons[idx - 1].id);
            return (
              <div
                key={lesson.id}
                onClick={() => isUnlocked && startLesson(selectedPath, idx)}
                className={`rounded-xl border p-4 flex items-center gap-4 transition-all ${isUnlocked ? "border-border bg-card hover:border-primary cursor-pointer" : "border-border bg-muted opacity-50 cursor-not-allowed"}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${done ? "bg-green-500 text-white" : isUnlocked ? `bg-gradient-to-br ${selectedPath.gradient} text-white` : "bg-muted-foreground/20 text-muted-foreground"}`}>
                  {done ? "✓" : isUnlocked ? idx + 1 : "🔒"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground text-sm">{lesson.title}</div>
                  <div className="text-xs text-muted-foreground">{lesson.questions.length} questions · {done ? "Completed" : isUnlocked ? "Ready" : "Locked"}</div>
                </div>
                {isUnlocked && !done && <span className="text-primary text-sm font-semibold">Start →</span>}
                {done && <span className="text-green-500 text-sm">✓ Done</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // LESSON CONCEPT
  if (screen === "lesson-concept" && selectedLesson) {
    const c = selectedLesson.concept;
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
          <button onClick={() => setScreen("path-detail")} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
          <span className="font-semibold text-foreground flex-1">{selectedLesson.title}</span>
          <span className="text-amber-500 text-sm font-semibold">⚡ {xp} XP</span>
        </div>
        <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
          <div className="rounded-2xl border border-border bg-card p-6 mb-4">
            <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Concept</div>
            <h2 className="text-xl font-bold text-foreground mb-3">{c.title}</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">{c.body}</p>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 mb-4">
              <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">💡 Analogy</div>
              <p className="text-sm text-amber-800 dark:text-amber-300">{c.analogy}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {c.keywords.map((kw) => (
                <span key={kw} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{kw}</span>
              ))}
            </div>
          </div>
          <Button onClick={() => setScreen("lesson-question")} className="w-full h-12 text-base font-semibold">
            Start Questions →
          </Button>
        </div>
      </div>
    );
  }

  // LESSON QUESTION
  if (screen === "lesson-question" && selectedLesson) {
    const q = selectedLesson.questions[currentQ];
    const progress = ((currentQ) / selectedLesson.questions.length) * 100;

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setScreen("hub")} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-rose-500 text-sm font-semibold">{"❤️".repeat(hearts)}{"🖤".repeat(3 - hearts)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{currentQ + 1} / {selectedLesson.questions.length}</span>
            <span className="text-amber-500 font-semibold">⚡ +{10 + streak * 2} XP {streak >= 2 ? `🔥×${streak}` : ""}</span>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 p-4 max-w-2xl mx-auto w-full flex flex-col">
          <div className="mb-6">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {q.type === "mcq" ? "Multiple Choice" : q.type === "truefalse" ? "True or False" : q.type === "fillin" ? "Fill in the Blank" : "Match the Pairs"}
            </div>
            <p className="text-lg font-semibold text-foreground leading-snug">{q.text}</p>
          </div>

          {/* MCQ */}
          {(q.type === "mcq" || q.type === "fillin") && (
            <div className="space-y-3 flex-1">
              {q.options!.map((opt) => {
                let cls = "w-full text-left rounded-xl border p-4 text-sm font-medium transition-all ";
                if (!showFeedback) {
                  cls += selected === opt ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary hover:bg-primary/5";
                } else {
                  if (opt === q.correct) cls += "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300";
                  else if (opt === selected && opt !== q.correct) cls += "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300";
                  else cls += "border-border bg-card text-muted-foreground opacity-60";
                }
                return (
                  <button key={opt} onClick={() => handleAnswer(opt)} className={cls}>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* True/False */}
          {q.type === "truefalse" && (
            <div className="flex gap-4 flex-1">
              {["True", "False"].map((opt) => {
                let cls = "flex-1 h-24 rounded-2xl border-2 text-xl font-bold transition-all ";
                if (!showFeedback) {
                  cls += selected === opt ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary";
                } else {
                  if (opt === q.correct) cls += "border-green-500 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300";
                  else if (opt === selected) cls += "border-red-500 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300";
                  else cls += "border-border bg-card text-muted-foreground opacity-50";
                }
                return (
                  <button key={opt} onClick={() => handleAnswer(opt)} className={cls}>
                    {opt === "True" ? "✅ True" : "❌ False"}
                  </button>
                );
              })}
            </div>
          )}

          {/* Match */}
          {q.type === "match" && q.pairs && (
            <div className="flex gap-3 flex-1">
              <div className="flex-1 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Term</div>
                {q.pairs.map((p) => {
                  const isMatched = matchedPairs.includes(p.left);
                  const isSelected = matchLeft === p.left;
                  return (
                    <button
                      key={p.left}
                      onClick={() => !isMatched && handleMatchSelect("left", p.left)}
                      className={`w-full text-left rounded-xl border p-3 text-sm font-medium transition-all ${isMatched ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300" : isSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary"}`}
                    >
                      {p.left}
                    </button>
                  );
                })}
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Definition</div>
                {q.pairs.map((p) => {
                  const isMatched = matchedPairs.includes(p.right);
                  return (
                    <button
                      key={p.right}
                      onClick={() => !isMatched && handleMatchSelect("right", p.right)}
                      className={`w-full text-left rounded-xl border p-3 text-sm transition-all ${isMatched ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300" : "border-border bg-card text-foreground hover:border-primary"}`}
                    >
                      {p.right}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className={`mt-4 rounded-xl p-4 border ${isCorrect ? "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700" : "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700"}`}>
              <div className={`font-bold mb-1 ${isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                {isCorrect ? `✓ Correct! +${10 + (streak - 1) * 2} XP` : "✗ Incorrect"}
              </div>
              <p className="text-sm text-foreground/80">{q.explanation}</p>
              <Button onClick={nextQuestion} className={`w-full mt-3 ${isCorrect ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white`}>
                {hearts === 0 ? "Game Over" : currentQ + 1 >= selectedLesson.questions.length ? "Complete Lesson" : "Next Question →"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LESSON COMPLETE
  if (screen === "lesson-complete") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Lesson Complete!</h2>
          <p className="text-muted-foreground mb-6">{selectedLesson?.title}</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl bg-card border border-border p-3">
              <div className="text-2xl font-bold text-amber-500">+{lessonXp}</div>
              <div className="text-xs text-muted-foreground">XP Earned</div>
            </div>
            <div className="rounded-xl bg-card border border-border p-3">
              <div className="text-2xl font-bold text-rose-500">{"❤️".repeat(hearts)}</div>
              <div className="text-xs text-muted-foreground">Hearts Left</div>
            </div>
            <div className="rounded-xl bg-card border border-border p-3">
              <div className="text-2xl font-bold text-orange-500">{streak}🔥</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
          </div>

          {!showLeaderboard ? (
            <div className="space-y-3">
              <Button onClick={() => {
                const nextIdx = lessonIndex + 1;
                if (selectedPath && nextIdx < selectedPath.lessons.length) {
                  startLesson(selectedPath, nextIdx);
                } else {
                  setScreen("path-detail");
                }
              }} className="w-full h-12 font-semibold">
                {selectedPath && lessonIndex + 1 < selectedPath.lessons.length ? "Next Lesson →" : "Back to Path"}
              </Button>
              <Button variant="outline" onClick={() => setShowLeaderboard(true)} className="w-full">
                🏆 View Leaderboard
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-4 text-left mb-4">
              <div className="font-bold text-foreground mb-3 text-center">🏆 Top 10 Players</div>
              {leaderboard?.length ? leaderboard.map((entry: any, i: number) => (
                <div key={entry.userId} className={`flex items-center gap-3 py-2 px-2 rounded-lg mb-1 ${entry.userId === user?.id ? "bg-green-50 dark:bg-green-950/30" : ""}`}>
                  <span className="w-6 text-center text-sm">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
                  <span className="flex-1 text-sm font-medium text-foreground truncate">{entry.name}{entry.userId === user?.id ? " (You)" : ""}</span>
                  <span className="text-amber-500 text-sm font-bold">{entry.totalXp} XP</span>
                </div>
              )) : <p className="text-muted-foreground text-sm text-center">No scores yet — you're first!</p>}
              <Button variant="outline" onClick={() => setShowLeaderboard(false)} className="w-full mt-3 text-sm">Back</Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ESCAPE ROOM QUESTION
  if (screen === "escape-question") {
    const challenge = ESCAPE_CHALLENGES[escapeIndex];
    const timerPct = (escapeTimer / 60) * 100;
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => { setEscapeTimerActive(false); setScreen("hub"); setActiveTab("escape"); }} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
            <span className="font-semibold text-foreground flex-1">🚨 Escape Room</span>
            <span className="text-sm text-muted-foreground">{escapeIndex + 1}/{ESCAPE_CHALLENGES.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={timerPct} className={`flex-1 h-2 ${escapeTimer <= 10 ? "[&>div]:bg-red-500" : "[&>div]:bg-amber-500"}`} />
            <span className={`text-sm font-bold w-8 text-right ${escapeTimer <= 10 ? "text-red-500" : "text-amber-500"}`}>{escapeTimer}s</span>
          </div>
        </div>
        <div className="flex-1 p-4 max-w-2xl mx-auto w-full flex flex-col">
          <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-5 mb-6">
            <p className="text-foreground font-semibold leading-relaxed">{challenge.scenario}</p>
          </div>
          <div className="space-y-3 flex-1">
            {challenge.options.map((opt) => {
              let cls = "w-full text-left rounded-xl border p-4 text-sm font-medium transition-all ";
              if (!escapeShowFeedback) {
                cls += escapeSelected === opt ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary";
              } else {
                if (opt === challenge.correct) cls += "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300";
                else if (opt === escapeSelected && opt !== challenge.correct) cls += "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300";
                else cls += "border-border bg-card text-muted-foreground opacity-60";
              }
              return <button key={opt} onClick={() => handleEscapeAnswer(opt)} className={cls}>{opt}</button>;
            })}
          </div>
          {escapeShowFeedback && (
            <div className={`mt-4 rounded-xl p-4 border ${escapeCorrect ? "bg-green-50 dark:bg-green-950/30 border-green-300" : "bg-red-50 dark:bg-red-950/30 border-red-300"}`}>
              <div className={`font-bold mb-1 ${escapeCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                {escapeTimer <= 0 ? "⏰ Time's up!" : escapeCorrect ? "✓ Incident Resolved!" : "✗ Wrong approach"}
              </div>
              <p className="text-sm text-foreground/80">{challenge.explanation}</p>
              <Button onClick={nextEscape} className="w-full mt-3">
                {escapeIndex + 1 >= ESCAPE_CHALLENGES.length ? "See Results" : "Next Challenge →"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ESCAPE COMPLETE
  if (screen === "escape-complete") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="text-6xl mb-4">{escapeSolved >= 5 ? "🏆" : escapeSolved >= 3 ? "🎯" : "💪"}</div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Escape Room Complete!</h2>
          <p className="text-muted-foreground mb-6">You solved {escapeSolved} out of {ESCAPE_CHALLENGES.length} incidents</p>
          <div className="rounded-xl bg-card border border-border p-4 mb-6">
            <div className="text-3xl font-bold text-foreground">{escapeSolved}/{ESCAPE_CHALLENGES.length}</div>
            <div className="text-muted-foreground text-sm">Incidents Resolved</div>
            <div className="mt-2 text-sm text-foreground/80">
              {escapeSolved === 6 ? "Perfect score! You're an AWS incident responder! 🌟" : escapeSolved >= 4 ? "Great job! Keep studying to master all scenarios." : "Keep practicing — these scenarios get easier with experience."}
            </div>
          </div>
          <div className="space-y-3">
            <Button onClick={startEscape} className="w-full h-12 font-semibold">Try Again</Button>
            <Button variant="outline" onClick={() => { setScreen("hub"); setActiveTab("escape"); }} className="w-full">Back to Hub</Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
