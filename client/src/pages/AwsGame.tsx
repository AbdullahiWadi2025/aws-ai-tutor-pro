// @ts-nocheck
import { useState, useEffect, useRef, useMemo } from "react";

// ─── THEME & DATA ──────────────────────────────────────────────────────────────

const COLORS = {
  bg: "#080d14",
  panel: "#0d1520",
  border: "#1a2d45",
  accent: "#f59e0b",
  accentDim: "#92400e",
  green: "#10b981",
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  text: "#e2e8f0",
  muted: "#64748b",
  glow: "rgba(245,158,11,0.15)",
};

// ─── GAME MODES DATA ───────────────────────────────────────────────────────────

// MATCH IT — 31 levels, 6 per topic (basic → advanced) + 1 shared intro
const MATCH_LEVELS = [

  // ── SHARED INTRO (all topics) ──────────────────────────────────────────────
  { level: 1, title: "AWS Basics", badge: "☁️ Cloud Rookie", color: "#10b981",
    topics: ["compute","storage","networking","database","security"],
    pairs: [
      { left: "Amazon S3", right: "Scalable object storage in the cloud" },
      { left: "Amazon EC2", right: "Virtual servers you can rent on demand" },
      { left: "Amazon RDS", right: "Managed relational database service" },
      { left: "AWS Lambda", right: "Run code without managing servers" },
      { left: "Amazon VPC", right: "Your own private network inside AWS" },
      { left: "Amazon CloudFront", right: "Global CDN that caches content at edge" },
    ],
  },

  // ── COMPUTE ────────────────────────────────────────────────────────────────
  { level: 2, title: "Compute — Services 101", badge: "💻 EC2 Starter", color: "#FF9900", topics: ["compute"],
    pairs: [
      { left: "Amazon EC2", right: "Resizable virtual machines in the cloud" },
      { left: "AWS Lambda", right: "Event-driven serverless compute" },
      { left: "Amazon ECS", right: "Run Docker containers on AWS" },
      { left: "AWS Elastic Beanstalk", right: "Deploy web apps without managing infra" },
      { left: "Amazon Lightsail", right: "Simplified VPS for simple workloads" },
      { left: "EC2 Auto Scaling", right: "Automatically adjust number of EC2 instances" },
    ],
  },
  { level: 3, title: "Compute — Instance Types & Pricing", badge: "💡 Cost Aware", color: "#FF9900", topics: ["compute"],
    pairs: [
      { left: "On-Demand Instances", right: "Pay per second, no commitment" },
      { left: "Reserved Instances", right: "1 or 3 year commitment for big discount" },
      { left: "Spot Instances", right: "Bid on unused capacity, up to 90% cheaper" },
      { left: "Savings Plans", right: "Flexible discount in exchange for usage commitment" },
      { left: "Dedicated Hosts", right: "Physical server fully dedicated to you" },
      { left: "EC2 Hibernate", right: "Pause instance and resume from exact state" },
    ],
  },
  { level: 4, title: "Compute — Containers & Serverless", badge: "🐳 Container Pro", color: "#FF9900", topics: ["compute"],
    pairs: [
      { left: "AWS Fargate", right: "Serverless compute engine for containers" },
      { left: "Amazon EKS", right: "Managed Kubernetes control plane on AWS" },
      { left: "AWS Lambda Layers", right: "Share code and dependencies across functions" },
      { left: "Amazon ECR", right: "Private Docker container image registry" },
      { left: "AWS App Runner", right: "Deploy containerized web apps with one click" },
      { left: "Lambda Provisioned Concurrency", right: "Keep functions warm to eliminate cold starts" },
    ],
  },
  { level: 5, title: "Compute — Scaling & HA", badge: "📈 Scale Master", color: "#FF9900", topics: ["compute"],
    pairs: [
      { left: "Launch Template", right: "EC2 configuration blueprint for Auto Scaling" },
      { left: "Target Tracking Policy", right: "Auto Scaling that maintains a metric at a value" },
      { left: "Step Scaling Policy", right: "Add/remove capacity in steps based on alarm" },
      { left: "Warm Pool", right: "Pre-initialized EC2 instances ready to scale fast" },
      { left: "Scheduled Scaling", right: "Scale capacity at a predictable time" },
      { left: "Multi-AZ Deployment", right: "Run instances across availability zones for HA" },
    ],
  },
  { level: 6, title: "Compute — Advanced Patterns", badge: "⚡ Serverless Guru", color: "#FF9900", topics: ["compute"],
    pairs: [
      { left: "AWS Step Functions", right: "Orchestrate Lambda functions as a visual workflow" },
      { left: "EventBridge", right: "Serverless event bus connecting AWS services" },
      { left: "Lambda@Edge", right: "Run Lambda functions at CloudFront edge locations" },
      { left: "AWS Batch", right: "Run large-scale batch computing jobs on managed infra" },
      { left: "Graviton Instances", right: "ARM-based EC2 with better price-performance ratio" },
      { left: "Spot Fleet", right: "Request multiple instance types to meet capacity target" },
    ],
  },
  { level: 7, title: "Compute — Expert Concepts", badge: "🧠 Compute Expert", color: "#FF9900", topics: ["compute"],
    pairs: [
      { left: "EC2 Placement Groups", right: "Control how instances are physically placed" },
      { left: "Cluster Placement Group", right: "Low-latency packing of instances in one AZ" },
      { left: "Spread Placement Group", right: "Instances on separate hardware to reduce failure blast" },
      { left: "Nitro System", right: "AWS hardware and hypervisor behind modern EC2" },
      { left: "AWS Outposts", right: "Run AWS infrastructure on-premises in your data center" },
      { left: "ECS Task Definition", right: "Blueprint describing containers in a workload" },
    ],
  },

  // ── STORAGE ────────────────────────────────────────────────────────────────
  { level: 8, title: "Storage — Services 101", badge: "📦 Storage Starter", color: "#3b82f6", topics: ["storage"],
    pairs: [
      { left: "Amazon S3", right: "Object storage for any type of file" },
      { left: "Amazon EBS", right: "Block storage volumes attached to EC2" },
      { left: "Amazon EFS", right: "Elastic file system shared across EC2 instances" },
      { left: "AWS Glacier", right: "Low-cost long-term archival storage" },
      { left: "AWS Storage Gateway", right: "Hybrid storage bridging on-premises to AWS" },
      { left: "Amazon FSx", right: "Managed file systems (Windows, Lustre, NetApp)" },
    ],
  },
  { level: 9, title: "Storage — S3 Deep Dive", badge: "🪣 S3 Specialist", color: "#3b82f6", topics: ["storage"],
    pairs: [
      { left: "S3 Standard", right: "High durability, frequently accessed data" },
      { left: "S3 Intelligent-Tiering", right: "Automatically moves data between access tiers" },
      { left: "S3 Standard-IA", right: "Cheaper storage for infrequently accessed data" },
      { left: "S3 One Zone-IA", right: "Single AZ infrequent access, lowest IA cost" },
      { left: "S3 Glacier Instant", right: "Archive with millisecond retrieval" },
      { left: "S3 Glacier Deep Archive", right: "Cheapest storage, hours retrieval time" },
    ],
  },
  { level: 10, title: "Storage — S3 Features", badge: "🔧 S3 Power User", color: "#3b82f6", topics: ["storage"],
    pairs: [
      { left: "S3 Versioning", right: "Keep multiple versions of every object" },
      { left: "S3 Lifecycle Policy", right: "Auto-transition or expire objects over time" },
      { left: "S3 Replication", right: "Copy objects to another bucket or region" },
      { left: "S3 Transfer Acceleration", right: "Speed up uploads using CloudFront edge" },
      { left: "S3 Multipart Upload", right: "Upload large objects in parallel parts" },
      { left: "S3 Event Notification", right: "Trigger Lambda or SQS on bucket events" },
    ],
  },
  { level: 11, title: "Storage — Block & File", badge: "💾 Block Expert", color: "#3b82f6", topics: ["storage"],
    pairs: [
      { left: "EBS gp3", right: "General purpose SSD, baseline 3000 IOPS" },
      { left: "EBS io2 Block Express", right: "Highest performance SSD for critical databases" },
      { left: "EBS Snapshot", right: "Point-in-time backup of a volume stored in S3" },
      { left: "EBS Multi-Attach", right: "Attach one io1/io2 volume to multiple EC2s" },
      { left: "EFS Bursting Throughput", right: "EFS throughput scales with storage size" },
      { left: "FSx for Lustre", right: "High-performance parallel file system for HPC/ML" },
    ],
  },
  { level: 12, title: "Storage — Data Migration", badge: "🚚 Migration Pro", color: "#3b82f6", topics: ["storage"],
    pairs: [
      { left: "AWS Snowball Edge", right: "Physical device for petabyte-scale data transfer" },
      { left: "AWS Snowmobile", right: "Truck-sized container for exabyte migration" },
      { left: "AWS DataSync", right: "Automated data transfer from on-premises to AWS" },
      { left: "AWS Transfer Family", right: "SFTP/FTP/FTPS server backed by S3 or EFS" },
      { left: "S3 Batch Operations", right: "Run operations on billions of S3 objects at once" },
      { left: "AWS Backup", right: "Centralized backup across AWS services" },
    ],
  },
  { level: 13, title: "Storage — Advanced & Security", badge: "🛡️ Storage Guardian", color: "#3b82f6", topics: ["storage"],
    pairs: [
      { left: "S3 Object Lock", right: "WORM storage — prevent deletion for set period" },
      { left: "S3 Access Points", right: "Custom endpoints with unique access policies" },
      { left: "S3 Requester Pays", right: "Data transfer cost charged to requester, not owner" },
      { left: "S3 Presigned URL", right: "Temporary URL granting access to private object" },
      { left: "S3 Select", right: "Query subset of data in CSV/JSON with SQL" },
      { left: "Macie", right: "ML service that discovers sensitive data in S3" },
    ],
  },

  // ── NETWORKING ─────────────────────────────────────────────────────────────
  { level: 14, title: "Networking — Services 101", badge: "🌐 Net Starter", color: "#8b5cf6", topics: ["networking"],
    pairs: [
      { left: "Amazon VPC", right: "Private cloud network you define and control" },
      { left: "Subnet", right: "Range of IP addresses within a VPC" },
      { left: "Internet Gateway", right: "Allows public internet traffic into a VPC" },
      { left: "Route Table", right: "Rules that determine where network traffic goes" },
      { left: "Security Group", right: "Stateful firewall for EC2 instances" },
      { left: "Network ACL", right: "Stateless firewall at the subnet level" },
    ],
  },
  { level: 15, title: "Networking — Load Balancing", badge: "⚖️ Load Balancer Pro", color: "#8b5cf6", topics: ["networking"],
    pairs: [
      { left: "Application Load Balancer", right: "Layer 7 balancer with path and host routing" },
      { left: "Network Load Balancer", right: "Layer 4, ultra-low latency, static IP" },
      { left: "Gateway Load Balancer", right: "Deploy and scale third-party network appliances" },
      { left: "Target Group", right: "Group of resources that a load balancer routes to" },
      { left: "ALB Listener Rule", right: "Route requests based on path, header, or host" },
      { left: "Connection Draining", right: "Finish in-flight requests before deregistering" },
    ],
  },
  { level: 16, title: "Networking — DNS & Edge", badge: "🧭 DNS Expert", color: "#8b5cf6", topics: ["networking"],
    pairs: [
      { left: "Route 53 Simple Routing", right: "Single resource, no health checks" },
      { left: "Route 53 Weighted Routing", right: "Split traffic by percentage across resources" },
      { left: "Route 53 Latency Routing", right: "Route to region with lowest latency for user" },
      { left: "Route 53 Failover Routing", right: "Active-passive failover with health checks" },
      { left: "Route 53 Geolocation", right: "Route based on user's geographic location" },
      { left: "CloudFront Origin Group", right: "Primary and fallback origin for HA delivery" },
    ],
  },
  { level: 17, title: "Networking — VPC Advanced", badge: "🔗 VPC Architect", color: "#8b5cf6", topics: ["networking"],
    pairs: [
      { left: "VPC Peering", right: "Private connection between two VPCs" },
      { left: "AWS Transit Gateway", right: "Hub connecting thousands of VPCs and on-premises" },
      { left: "VPC Endpoint (Gateway)", right: "Private S3/DynamoDB access without internet" },
      { left: "VPC Endpoint (Interface)", right: "Private link to AWS services via ENI" },
      { left: "NAT Gateway", right: "Allows private subnet to access internet outbound" },
      { left: "Bastion Host", right: "Jump box for SSH access into private subnets" },
    ],
  },
  { level: 18, title: "Networking — Hybrid & WAN", badge: "🌍 Hybrid Architect", color: "#8b5cf6", topics: ["networking"],
    pairs: [
      { left: "AWS Direct Connect", right: "Dedicated private fiber link from data center to AWS" },
      { left: "AWS Site-to-Site VPN", right: "Encrypted IPSec tunnel over public internet" },
      { left: "AWS Client VPN", right: "Managed VPN for remote users to access VPC" },
      { left: "Direct Connect Gateway", right: "Connect one Direct Connect to multiple VPCs" },
      { left: "AWS Global Accelerator", right: "Route users to nearest AWS endpoint via Anycast" },
      { left: "AWS PrivateLink", right: "Expose services privately across VPCs without peering" },
    ],
  },
  { level: 19, title: "Networking — Expert Patterns", badge: "🧠 Net Expert", color: "#8b5cf6", topics: ["networking"],
    pairs: [
      { left: "Egress-Only Internet Gateway", right: "IPv6 outbound traffic from private subnet" },
      { left: "Flow Logs", right: "Capture IP traffic metadata in VPC, subnet, or ENI" },
      { left: "Reachability Analyzer", right: "Test network path between two AWS resources" },
      { left: "AWS Network Firewall", right: "Managed stateful firewall for VPC perimeter" },
      { left: "Traffic Mirroring", right: "Copy EC2 network traffic to monitoring appliance" },
      { left: "ENI (Elastic Network Interface)", right: "Virtual network card attached to EC2" },
    ],
  },

  // ── DATABASE ───────────────────────────────────────────────────────────────
  { level: 20, title: "Database — Services 101", badge: "🗄️ DB Starter", color: "#10b981", topics: ["database"],
    pairs: [
      { left: "Amazon RDS", right: "Managed relational database (MySQL, Postgres, etc.)" },
      { left: "Amazon DynamoDB", right: "Serverless NoSQL key-value and document store" },
      { left: "Amazon Aurora", right: "MySQL/Postgres compatible, 5x faster managed DB" },
      { left: "Amazon Redshift", right: "Petabyte-scale columnar data warehouse" },
      { left: "Amazon ElastiCache", right: "In-memory cache with Redis or Memcached" },
      { left: "Amazon Neptune", right: "Managed graph database for connected data" },
    ],
  },
  { level: 21, title: "Database — RDS Deep Dive", badge: "📋 RDS Specialist", color: "#10b981", topics: ["database"],
    pairs: [
      { left: "RDS Multi-AZ", right: "Synchronous standby replica for automatic failover" },
      { left: "RDS Read Replica", right: "Async copy of DB for read-heavy workloads" },
      { left: "RDS Proxy", right: "Connection pool between Lambda/apps and RDS" },
      { left: "RDS Automated Backups", right: "Daily snapshot + transaction logs for PITR" },
      { left: "RDS Parameter Group", right: "Configure DB engine settings like max connections" },
      { left: "RDS Performance Insights", right: "Visualize DB load and identify slow queries" },
    ],
  },
  { level: 22, title: "Database — DynamoDB", badge: "⚡ NoSQL Pro", color: "#10b981", topics: ["database"],
    pairs: [
      { left: "DynamoDB Partition Key", right: "Primary attribute that determines data placement" },
      { left: "DynamoDB Sort Key", right: "Secondary attribute enabling range queries" },
      { left: "DynamoDB GSI", right: "Global Secondary Index for alternate query patterns" },
      { left: "DynamoDB LSI", right: "Local Secondary Index on same partition key" },
      { left: "DynamoDB Streams", right: "Ordered log of item-level changes for 24 hours" },
      { left: "DynamoDB DAX", right: "In-memory cache giving microsecond read latency" },
    ],
  },
  { level: 23, title: "Database — Aurora & Caching", badge: "🚀 Aurora Expert", color: "#10b981", topics: ["database"],
    pairs: [
      { left: "Aurora Serverless v2", right: "Auto-scales DB capacity in fine-grained increments" },
      { left: "Aurora Global Database", right: "Single DB spanning multiple regions, <1s replication" },
      { left: "Aurora Parallel Query", right: "Pushes analytical queries to storage layer" },
      { left: "ElastiCache Redis Cluster", right: "Sharded Redis for horizontal scaling" },
      { left: "ElastiCache Memcached", right: "Simple multi-threaded caching, no persistence" },
      { left: "Write-Through Cache", right: "Update cache and DB simultaneously on write" },
    ],
  },
  { level: 24, title: "Database — Analytics Databases", badge: "📊 Analytics DB Pro", color: "#10b981", topics: ["database"],
    pairs: [
      { left: "Redshift Spectrum", right: "Query S3 data directly from Redshift without loading" },
      { left: "Redshift RA3 Nodes", right: "Separate compute and managed storage in Redshift" },
      { left: "Amazon Timestream", right: "Serverless time-series database for IoT/metrics" },
      { left: "Amazon QLDB", right: "Immutable cryptographically verifiable ledger DB" },
      { left: "Amazon Keyspaces", right: "Managed Apache Cassandra-compatible service" },
      { left: "AWS Glue", right: "Serverless ETL service to prepare data for analytics" },
    ],
  },
  { level: 25, title: "Database — Expert Patterns", badge: "🧠 DB Architect", color: "#10b981", topics: ["database"],
    pairs: [
      { left: "CQRS Pattern", right: "Separate read and write models using different DBs" },
      { left: "Event Sourcing", right: "Store state changes as events, not current state" },
      { left: "Database Sharding", right: "Split data across multiple DB instances by key" },
      { left: "Connection Pooling", right: "Reuse connections to avoid DB connection limits" },
      { left: "Blue/Green Deployment (RDS)", right: "Deploy new DB version alongside old for safe cutover" },
      { left: "DynamoDB Conditional Writes", right: "Only write if a condition on existing item is true" },
    ],
  },

  // ── SECURITY ───────────────────────────────────────────────────────────────
  { level: 26, title: "Security — Services 101", badge: "🔐 Sec Starter", color: "#e11d48", topics: ["security"],
    pairs: [
      { left: "AWS IAM", right: "Control who can do what across all AWS services" },
      { left: "AWS WAF", right: "Block malicious web traffic with rules" },
      { left: "AWS Shield", right: "Protect against DDoS attacks automatically" },
      { left: "Amazon GuardDuty", right: "Detect threats using ML and threat intelligence" },
      { left: "AWS KMS", right: "Create and manage encryption keys" },
      { left: "Amazon Cognito", right: "Add sign-up and sign-in to your apps" },
    ],
  },
  { level: 27, title: "Security — IAM Deep Dive", badge: "🪪 IAM Expert", color: "#e11d48", topics: ["security"],
    pairs: [
      { left: "IAM Policy", right: "JSON document defining allowed or denied actions" },
      { left: "IAM Role", right: "Identity with permissions assumed by services or users" },
      { left: "IAM Permission Boundary", right: "Max permissions a role or user can ever have" },
      { left: "Service Control Policy", right: "Org-level policy limiting all accounts in an OU" },
      { left: "Resource-Based Policy", right: "Policy attached to a resource like S3 or Lambda" },
      { left: "IAM Access Analyzer", right: "Find resources shared with external principals" },
    ],
  },
  { level: 28, title: "Security — Encryption & Keys", badge: "🔑 Crypto Pro", color: "#e11d48", topics: ["security"],
    pairs: [
      { left: "AWS KMS CMK", right: "Customer managed key in KMS for encryption" },
      { left: "AWS KMS Data Key", right: "Symmetric key generated by KMS to encrypt data" },
      { left: "Envelope Encryption", right: "Encrypt data key with master key for scale" },
      { left: "AWS CloudHSM", right: "Dedicated hardware security module in the cloud" },
      { left: "AWS Secrets Manager", right: "Store, rotate, and retrieve secrets automatically" },
      { left: "AWS Parameter Store", right: "Lightweight config and secret storage in SSM" },
    ],
  },
  { level: 29, title: "Security — Detection & Response", badge: "🚨 Threat Hunter", color: "#e11d48", topics: ["security"],
    pairs: [
      { left: "Amazon GuardDuty", right: "Analyze VPC Flow Logs, DNS, CloudTrail for threats" },
      { left: "AWS Security Hub", right: "Aggregate security findings across AWS services" },
      { left: "Amazon Inspector", right: "Automated vulnerability scanning for EC2 and ECR" },
      { left: "AWS CloudTrail", right: "Log every API call made in your AWS account" },
      { left: "AWS Config", right: "Track configuration changes and compliance over time" },
      { left: "Amazon Macie", right: "Discover and protect sensitive data in S3 with ML" },
    ],
  },
  { level: 30, title: "Security — Network & App Security", badge: "🛡️ Net Defender", color: "#e11d48", topics: ["security"],
    pairs: [
      { left: "AWS WAF Managed Rules", right: "Pre-built rule groups for OWASP Top 10" },
      { left: "AWS Shield Advanced", right: "24/7 DDoS response team + cost protection" },
      { left: "AWS Firewall Manager", right: "Centrally manage WAF and Shield across accounts" },
      { left: "AWS Network Firewall", right: "Stateful managed firewall inside your VPC" },
      { left: "AWS Certificate Manager", right: "Free SSL/TLS certs for AWS services" },
      { left: "VPC Security Group", right: "Stateful firewall — return traffic allowed automatically" },
    ],
  },
  { level: 31, title: "Security — Expert & Compliance", badge: "🧠 Security Architect", color: "#e11d48", topics: ["security"],
    pairs: [
      { left: "AWS Organizations SCP", right: "Guardrails that restrict what accounts can do" },
      { left: "AWS Control Tower", right: "Set up a secure multi-account environment fast" },
      { left: "ABAC in IAM", right: "Use tags to control access instead of writing policies" },
      { left: "Cross-Account Role", right: "Assume a role in another AWS account securely" },
      { left: "AWS Audit Manager", right: "Continuously collect evidence for compliance audits" },
      { left: "Detective", right: "Investigate security issues with graph-based analysis" },
    ],
  },
];

// ARCHITECTURE BUILDER];

// ARCHITECTURE BUILDER — visual canvas scenarios (no labels on slots)
const ARCH_SCENARIOS = [
  {
    level: 1, title: "Scalable Web Application", badge: "🌐 Web Architect", topics: ["compute","networking","database"],
    description: "A startup needs a globally distributed, highly available web app. Place each service in the correct position.",
    slots: [
      { id: "slot_r53", col: 0, row: 1 },
      { id: "slot_cf",  col: 1, row: 1 },
      { id: "slot_alb", col: 2, row: 1 },
      { id: "slot_ec2", col: 3, row: 1 },
      { id: "slot_rds", col: 4, row: 1 },
    ],
    connections: [["slot_r53","slot_cf"],["slot_cf","slot_alb"],["slot_alb","slot_ec2"],["slot_ec2","slot_rds"]],
    services: [
      { id: "r53",  name: "Route 53",         correctSlot: "slot_r53",  color: "#8C4FFF", abbr: "R53",  category: "Networking" },
      { id: "cf",   name: "CloudFront",        correctSlot: "slot_cf",   color: "#FF9900", abbr: "CF",   category: "CDN" },
      { id: "alb",  name: "Elastic Load Balancing", correctSlot: "slot_alb", color: "#8C4FFF", abbr: "ELB", category: "Networking" },
      { id: "ec2",  name: "EC2 Auto Scaling",  correctSlot: "slot_ec2",  color: "#FF9900", abbr: "EC2",  category: "Compute" },
      { id: "rds",  name: "RDS Multi-AZ",      correctSlot: "slot_rds",  color: "#3B48CC", abbr: "RDS",  category: "Database" },
    ],
  },
  {
    level: 2, title: "Serverless Event Pipeline", badge: "⚡ Serverless Pro", topics: ["compute","storage"],
    description: "A media company uploads 500k videos/day. Wire up the serverless processing pipeline.",
    slots: [
      { id: "slot_s3in",  col: 0, row: 1 },
      { id: "slot_sqs",   col: 1, row: 1 },
      { id: "slot_lam",   col: 2, row: 1 },
      { id: "slot_s3out", col: 3, row: 1 },
      { id: "slot_sns",   col: 4, row: 1 },
    ],
    connections: [["slot_s3in","slot_sqs"],["slot_sqs","slot_lam"],["slot_lam","slot_s3out"],["slot_lam","slot_sns"]],
    services: [
      { id: "s3in",  name: "Amazon S3",   correctSlot: "slot_s3in",  color: "#FF9900", abbr: "S3",   category: "Storage" },
      { id: "sqs",   name: "Amazon SQS",  correctSlot: "slot_sqs",   color: "#FF9900", abbr: "SQS",  category: "Messaging" },
      { id: "lam",   name: "AWS Lambda",  correctSlot: "slot_lam",   color: "#FF9900", abbr: "λ",    category: "Compute" },
      { id: "s3out", name: "Amazon S3",   correctSlot: "slot_s3out", color: "#FF9900", abbr: "S3",   category: "Storage" },
      { id: "sns",   name: "Amazon SNS",  correctSlot: "slot_sns",   color: "#FF9900", abbr: "SNS",  category: "Messaging" },
    ],
  },
  {
    level: 3, title: "Secure Microservices API", badge: "🔐 API Guardian", topics: ["security","networking","compute"],
    description: "Build a secure containerized API with edge firewall, auth, and managed database.",
    slots: [
      { id: "slot_waf",  col: 0, row: 1 },
      { id: "slot_apig", col: 1, row: 1 },
      { id: "slot_cog",  col: 2, row: 0 },
      { id: "slot_far",  col: 2, row: 1 },
      { id: "slot_aur",  col: 3, row: 1 },
    ],
    connections: [["slot_waf","slot_apig"],["slot_apig","slot_cog"],["slot_apig","slot_far"],["slot_far","slot_aur"]],
    services: [
      { id: "waf",  name: "AWS WAF",        correctSlot: "slot_waf",  color: "#DD344C", abbr: "WAF",  category: "Security" },
      { id: "apig", name: "API Gateway",    correctSlot: "slot_apig", color: "#8C4FFF", abbr: "APIG", category: "Networking" },
      { id: "cog",  name: "Amazon Cognito", correctSlot: "slot_cog",  color: "#DD344C", abbr: "COG",  category: "Security" },
      { id: "far",  name: "AWS Fargate",    correctSlot: "slot_far",  color: "#FF9900", abbr: "FG",   category: "Compute" },
      { id: "aur",  name: "Amazon Aurora",  correctSlot: "slot_aur",  color: "#3B48CC", abbr: "AUR",  category: "Database" },
    ],
  },
  {
    level: 4, title: "Real-Time Analytics Platform", badge: "📊 Data Engineer", topics: ["database","storage"],
    description: "A fintech firm ingests millions of transactions/sec. Build the complete streaming analytics pipeline.",
    slots: [
      { id: "slot_iot", col: 0, row: 1 },
      { id: "slot_kin", col: 1, row: 1 },
      { id: "slot_fh",  col: 2, row: 1 },
      { id: "slot_rs",  col: 3, row: 1 },
      { id: "slot_qs",  col: 4, row: 1 },
    ],
    connections: [["slot_iot","slot_kin"],["slot_kin","slot_fh"],["slot_fh","slot_rs"],["slot_rs","slot_qs"]],
    services: [
      { id: "iot", name: "AWS IoT Core",     correctSlot: "slot_iot", color: "#1A9C3E", abbr: "IoT",  category: "IoT" },
      { id: "kin", name: "Kinesis Streams",  correctSlot: "slot_kin", color: "#8C4FFF", abbr: "KDS",  category: "Analytics" },
      { id: "fh",  name: "Kinesis Firehose", correctSlot: "slot_fh",  color: "#8C4FFF", abbr: "KFH",  category: "Analytics" },
      { id: "rs",  name: "Amazon Redshift",  correctSlot: "slot_rs",  color: "#3B48CC", abbr: "RS",   category: "Database" },
      { id: "qs",  name: "QuickSight",       correctSlot: "slot_qs",  color: "#3B48CC", abbr: "QS",   category: "Analytics" },
    ],
  },
  {
    level: 5, title: "Multi-Region Disaster Recovery", badge: "🌍 DR Architect", topics: ["networking","database","compute"],
    description: "A bank requires RPO < 1 min and RTO < 5 min across two regions. Design the active-passive DR setup.",
    slots: [
      { id: "slot_r53b",  col: 0, row: 1 },
      { id: "slot_pri",   col: 1, row: 0 },
      { id: "slot_aurg",  col: 2, row: 0 },
      { id: "slot_sec",   col: 1, row: 2 },
      { id: "slot_rep",   col: 2, row: 2 },
      { id: "slot_cw",    col: 3, row: 1 },
    ],
    connections: [["slot_r53b","slot_pri"],["slot_r53b","slot_sec"],["slot_pri","slot_aurg"],["slot_sec","slot_rep"],["slot_aurg","slot_rep"],["slot_cw","slot_r53b"]],
    services: [
      { id: "r53b",  name: "Route 53 (failover)", correctSlot: "slot_r53b",  color: "#8C4FFF", abbr: "R53",  category: "Networking" },
      { id: "pri",   name: "EC2 (primary)",        correctSlot: "slot_pri",   color: "#FF9900", abbr: "EC2",  category: "Compute" },
      { id: "aurg",  name: "Aurora Global",        correctSlot: "slot_aurg",  color: "#3B48CC", abbr: "AGL",  category: "Database" },
      { id: "sec",   name: "EC2 (secondary)",      correctSlot: "slot_sec",   color: "#FF9900", abbr: "EC2",  category: "Compute" },
      { id: "rep",   name: "Aurora Replica",       correctSlot: "slot_rep",   color: "#3B48CC", abbr: "ARR",  category: "Database" },
      { id: "cw",    name: "CloudWatch Alarms",    correctSlot: "slot_cw",    color: "#FF9900", abbr: "CW",   category: "Monitoring" },
    ],
  },
  {
    level: 6, title: "Zero-Trust Security Architecture", badge: "🛡️ Security Pro", topics: ["security","networking"],
    description: "A regulated enterprise needs zero-trust network access with secrets management, threat detection, and compliance logging.",
    slots: [
      { id: "slot_igw",   col: 0, row: 1 },
      { id: "slot_waf2",  col: 1, row: 1 },
      { id: "slot_vpce",  col: 2, row: 0 },
      { id: "slot_app",   col: 2, row: 1 },
      { id: "slot_sm",    col: 3, row: 0 },
      { id: "slot_gd",    col: 3, row: 1 },
      { id: "slot_ct",    col: 4, row: 1 },
    ],
    connections: [["slot_igw","slot_waf2"],["slot_waf2","slot_vpce"],["slot_waf2","slot_app"],["slot_app","slot_sm"],["slot_app","slot_gd"],["slot_gd","slot_ct"]],
    services: [
      { id: "igw",  name: "Internet Gateway",  correctSlot: "slot_igw",  color: "#8C4FFF", abbr: "IGW",  category: "Networking" },
      { id: "waf2", name: "AWS WAF + Shield",  correctSlot: "slot_waf2", color: "#DD344C", abbr: "WAF",  category: "Security" },
      { id: "vpce", name: "VPC Endpoint",      correctSlot: "slot_vpce", color: "#8C4FFF", abbr: "VPE",  category: "Networking" },
      { id: "app",  name: "App (private VPC)", correctSlot: "slot_app",  color: "#FF9900", abbr: "APP",  category: "Compute" },
      { id: "sm",   name: "Secrets Manager",   correctSlot: "slot_sm",   color: "#DD344C", abbr: "SM",   category: "Security" },
      { id: "gd",   name: "Amazon GuardDuty",  correctSlot: "slot_gd",   color: "#DD344C", abbr: "GD",   category: "Security" },
      { id: "ct",   name: "AWS CloudTrail",    correctSlot: "slot_ct",   color: "#FF9900", abbr: "CT",   category: "Monitoring" },
    ],
  },
];


const ESCAPE_ROOMS = [

  // ── COMPUTE (5) ─────────────────────────────────────────────────────────────
  { id: 1, topic: "compute", title: "The Overloaded Server",
    story: "🚨 ALERT: Your EC2 instance is at 100% CPU. Thousands of users are being dropped. You have 60 seconds to diagnose and fix.",
    clues: [
      { text: "CloudWatch: CPU at 100% sustained since 3:47 PM" },
      { text: "Auto Scaling group: min=max=1, policy set to Manual" },
      { text: "No Load Balancer attached — all traffic hits one instance" },
    ],
    choices: [
      { text: "Reboot the EC2 instance", correct: false, feedback: "Rebooting causes downtime and changes nothing — you'd hit 100% again in minutes." },
      { text: "Enable Auto Scaling + attach an ALB", correct: true, feedback: "✅ Auto Scaling adds horizontal capacity and ALB distributes traffic. Root cause fixed." },
      { text: "Upgrade to a larger instance type", correct: false, feedback: "Vertical scaling has a ceiling and requires downtime — not a scalable fix." },
      { text: "Move everything to Lambda immediately", correct: false, feedback: "A migration is not a 60-second fix. You need scale now." },
    ],
  },
  { id: 2, topic: "compute", title: "The Silent Lambda",
    story: "💀 DEAD QUEUE: Lambda should process SQS messages every second. The queue has 85,000 unprocessed messages. The function hasn't fired in 2 hours.",
    clues: [
      { text: "Lambda reserved concurrency set to 5 (account default: 1,000)" },
      { text: "SQS visibility timeout: 30s — Lambda avg execution time: 45s" },
      { text: "DLQ has 0 messages — nothing failing, just stuck" },
    ],
    choices: [
      { text: "Delete and recreate the Lambda function", correct: false, feedback: "The code is fine. Configuration is the problem — recreating changes nothing." },
      { text: "Raise concurrency limit + set visibility timeout > Lambda timeout", correct: true, feedback: "✅ Low concurrency throttled execution. Short visibility timeout caused a deadlock. Both must be fixed together." },
      { text: "Switch from SQS to SNS", correct: false, feedback: "SNS is push-based — you'd lose 85k queued messages and the problem would remain." },
      { text: "Add more RAM to Lambda", correct: false, feedback: "RAM affects speed, not concurrency or visibility timeouts. Deadlock persists." },
    ],
  },
  { id: 3, topic: "compute", title: "The Frozen Container",
    story: "🐳 ECS CRASH LOOP: Your Fargate tasks keep stopping every 3 minutes with exit code 137. The service is stuck at 0 running tasks.",
    clues: [
      { text: "ECS stopped task reason: 'Essential container exited with code 137'" },
      { text: "Container Insights: MemoryUtilization hits 100% then drops to 0 before each exit" },
      { text: "Task definition memory limit: 512 MB — app was recently updated with new ML model (800 MB)" },
    ],
    choices: [
      { text: "Force a new deployment to restart the tasks", correct: false, feedback: "Fresh tasks run the same image with the same memory limit — they'll OOMKill again within minutes." },
      { text: "Increase memory in the task definition and redeploy", correct: true, feedback: "✅ Exit code 137 = OOMKilled. The new ML model needs more RAM than the task limit allows. Raise the limit and redeploy." },
      { text: "Switch from Fargate to EC2 launch type", correct: false, feedback: "Same container, same memory limit — the crash would move to EC2, not go away." },
      { text: "Add an EFS volume to offload memory", correct: false, feedback: "EFS is file storage, not RAM. Memory pressure causes OOMKill — disk space doesn't help." },
    ],
  },
  { id: 4, topic: "compute", title: "The Cold Start Storm",
    story: "🥶 LATENCY SPIKE: Your Lambda-backed API is averaging 8 seconds response time. Monitoring shows thousands of cold starts happening simultaneously.",
    clues: [
      { text: "X-Ray: 'Init duration' averaging 6.2s per trace during spike" },
      { text: "Traffic pattern: near-zero at night, spike to 10k req/min at 9 AM daily" },
      { text: "Lambda: no provisioned concurrency configured, runtime is Java 11" },
    ],
    choices: [
      { text: "Increase Lambda timeout to 30 seconds", correct: false, feedback: "Timeout doesn't reduce cold start duration — it just lets slow requests run longer." },
      { text: "Enable Provisioned Concurrency + consider switching runtime to Python/Node", correct: true, feedback: "✅ Provisioned Concurrency keeps instances warm, eliminating cold starts. Java has heavy init time — lighter runtimes cold-start faster." },
      { text: "Put a CloudFront cache in front of the API", correct: false, feedback: "Caching helps repeated identical requests, but cold starts happen on first invocations — cache misses won't help." },
      { text: "Increase Lambda memory to 10 GB", correct: false, feedback: "More RAM speeds up execution after init, but doesn't prevent the cold start itself." },
    ],
  },
  { id: 5, topic: "compute", title: "The Spot Massacre",
    story: "⚡ MASS INTERRUPTION: 80% of your EC2 Spot Fleet was terminated simultaneously. Your batch processing job is dead. Data processing has been offline for 45 minutes.",
    clues: [
      { text: "AWS Health Dashboard: Spot capacity reclaimed in us-east-1a for m5.xlarge — 9:14 AM" },
      { text: "Spot Fleet: single instance type (m5.xlarge), single AZ (us-east-1a), no checkpointing" },
      { text: "Job processing: stateless — each task starts from scratch if interrupted" },
    ],
    choices: [
      { text: "Switch entirely to On-Demand instances", correct: false, feedback: "On-Demand costs 3-5x more than Spot. The solution is resilient Spot architecture, not abandoning it." },
      { text: "Diversify across instance types and AZs + implement checkpointing", correct: true, feedback: "✅ Capacity interruptions are AZ and instance-type specific. Diversification means a single interruption event never kills your entire fleet. Checkpointing lets jobs resume mid-task." },
      { text: "Reserve the instances to prevent interruption", correct: false, feedback: "Reserved Instances are for On-Demand pricing commitment — they have nothing to do with Spot availability." },
      { text: "Increase the Spot bid price to maximum", correct: false, feedback: "Spot interruptions happen due to capacity shortage, not price. You cannot bid your way out of a capacity reclamation." },
    ],
  },

  // ── STORAGE (5) ─────────────────────────────────────────────────────────────
  { id: 6, topic: "storage", title: "The Disappearing Files",
    story: "🗑️ DATA LOSS: Users are reporting that files uploaded yesterday are gone. S3 bucket shows the objects don't exist. No one admits to deleting anything.",
    clues: [
      { text: "S3 bucket has versioning DISABLED" },
      { text: "CloudTrail: DeleteObject API calls at 2:13 AM from an automated deploy script" },
      { text: "Deploy script uses 'aws s3 sync --delete' to sync build artifacts" },
    ],
    choices: [
      { text: "Restore from the previous day's S3 backup", correct: false, feedback: "Backups help but don't fix the root cause — the deploy script will delete files again on the next deploy." },
      { text: "Enable S3 Versioning + add MFA Delete + fix the deploy script sync path", correct: true, feedback: "✅ Versioning preserves deleted objects. MFA Delete prevents accidental bulk deletions. The sync path was too broad — it deleted user uploads, not just build artifacts." },
      { text: "Make the S3 bucket public read-only", correct: false, feedback: "Read-only doesn't protect against deletion by the authenticated deploy role. IAM permissions are the real control." },
      { text: "Move user uploads to the same prefix as build artifacts", correct: false, feedback: "That would make it worse — the sync --delete would also delete uploads even faster." },
    ],
  },
  { id: 7, topic: "storage", title: "The Exploding S3 Bill",
    story: "💸 STORAGE BILL SHOCK: S3 costs jumped from $400 to $8,900 this month. No new data was uploaded. Storage size is unchanged.",
    clues: [
      { text: "Cost Explorer: S3 Requests cost = $7,200 (was $30 last month)" },
      { text: "S3 access logs: 2.4 billion GET requests from a single IP range over 3 days" },
      { text: "No CloudFront distribution in front of S3 — bucket is public with direct S3 URLs" },
    ],
    choices: [
      { text: "Delete the S3 bucket and re-create it with a new name", correct: false, feedback: "New bucket, same architecture — direct public URLs will get hammered again immediately." },
      { text: "Put CloudFront in front of S3 + block public S3 access + set Origin Access Control", correct: true, feedback: "✅ CloudFront caches responses at edge so repeated requests don't hit S3. OAC ensures only CloudFront can access S3. Billions of S3 API calls collapse to a fraction." },
      { text: "Enable S3 Transfer Acceleration", correct: false, feedback: "Transfer Acceleration speeds up uploads — it adds cost, not reduces it, and doesn't cache responses." },
      { text: "Switch to S3 Intelligent-Tiering", correct: false, feedback: "Intelligent-Tiering reduces storage cost, not API request cost. The bill is from GET requests, not storage." },
    ],
  },
  { id: 8, topic: "storage", title: "The EBS Cliff",
    story: "🔴 IO THROTTLE: Your database EC2 instance suddenly becomes unresponsive at 9 AM every business day. App shows timeout errors for exactly 4 minutes.",
    clues: [
      { text: "CloudWatch: VolumeQueueLength spikes to 400+ at 9:00 AM, then drops — daily" },
      { text: "EBS volume: gp2, 100 GB — baseline 300 IOPS, burst bucket depletes overnight" },
      { text: "Batch job runs at 8:50 AM daily, doing a full-table scan on the DB" },
    ],
    choices: [
      { text: "Stop the batch job to prevent the spike", correct: false, feedback: "The business needs that report. Disabling the job doesn't fix the underlying storage throughput problem." },
      { text: "Migrate EBS volume from gp2 to gp3 and provision 6,000 IOPS", correct: true, feedback: "✅ gp2 has burst-based IOPS that deplete when sustained — gp3 gives consistent IOPS regardless of burst credits. 6,000 IOPS handles the batch scan without throttling." },
      { text: "Increase EC2 instance size", correct: false, feedback: "Larger EC2 won't help — the bottleneck is EBS IOPS, not CPU or RAM on the instance." },
      { text: "Add a read replica and run the batch job against it", correct: false, feedback: "Good long-term idea, but the read replica has the same gp2 volume — same throttle problem on the replica." },
    ],
  },
  { id: 9, topic: "storage", title: "The Glacier Trap",
    story: "🧊 RESTORE FAIL: A compliance audit requires retrieval of archived logs from 3 years ago — now. Legal team needs them in 2 hours. The files are in S3 Glacier Deep Archive.",
    clues: [
      { text: "S3 Glacier Deep Archive retrieval time: Standard = 12 hours, Bulk = 48 hours" },
      { text: "Expedited retrieval not available for Deep Archive tier" },
      { text: "Files were moved by a lifecycle policy — no copies exist anywhere else" },
    ],
    choices: [
      { text: "Start a Standard retrieval and tell legal to wait 12 hours", correct: false, feedback: "Standard retrieval is 12 hours minimum for Deep Archive — the 2-hour deadline will be missed." },
      { text: "Start the fastest available retrieval (Standard) + escalate timeline to legal + implement Glacier Instant Retrieval for future compliance data", correct: true, feedback: "✅ Deep Archive has no expedited option — Standard at 12 hours is the fastest. The real fix for future compliance is storing audit-critical data in Glacier Instant Retrieval or Standard-IA where millisecond access is available." },
      { text: "Restore using AWS Support emergency escalation", correct: false, feedback: "AWS Support cannot override Glacier retrieval times — it's a physical tape retrieval process, not a software delay." },
      { text: "Export the files directly from the AWS Console", correct: false, feedback: "Glacier Deep Archive requires a restore request to temporary S3 storage first — no direct download is possible." },
    ],
  },
  { id: 10, topic: "storage", title: "The Runaway EFS",
    story: "📁 STORAGE RUNAWAY: Your EFS file system has grown from 500 GB to 47 TB in 6 days, costing $14,100 extra. No one knows what's filling it.",
    clues: [
      { text: "EFS CloudWatch: StorageBytes increased 94x in 6 days" },
      { text: "EFS Access Logs: single EC2 instance writing 100,000+ files/minute to /tmp/cache" },
      { text: "Application config: cache directory set to EFS mount path instead of local /tmp" },
    ],
    choices: [
      { text: "Delete the entire EFS file system to stop the cost", correct: false, feedback: "The EFS may contain legitimate data used by other services. Deleting without auditing could take down production." },
      { text: "Fix app config to write cache to local /tmp + delete the /tmp/cache prefix in EFS + add EFS lifecycle policy", correct: true, feedback: "✅ Root cause is a misconfigured cache path — temp files were filling shared persistent storage. Fix the config, clean the old data, and add lifecycle policies to auto-expire old files." },
      { text: "Increase EFS storage quota", correct: false, feedback: "EFS scales automatically — there's no quota to increase. This just lets the runaway continue." },
      { text: "Migrate to S3 for caching", correct: false, feedback: "S3 isn't a good cache layer for high-frequency small writes. Local instance storage is the right fix here." },
    ],
  },

  // ── NETWORKING (5) ──────────────────────────────────────────────────────────
  { id: 11, topic: "networking", title: "The $47,000 Bill",
    story: "💸 COST EXPLOSION: Your AWS bill jumped from $3,200 to $47,000 in one month. Finance is calling.",
    clues: [
      { text: "Cost Explorer: NAT Gateway data processing = $38,400 this month" },
      { text: "EC2s in private subnets pull Docker images from ECR on every deploy (50 deploys/day)" },
      { text: "No VPC Endpoints configured — all traffic routes through NAT Gateway" },
    ],
    choices: [
      { text: "Delete the NAT Gateway to stop charges", correct: false, feedback: "Deleting NAT breaks all outbound internet access from private subnets — you'd take down production." },
      { text: "Create VPC Endpoints for ECR and S3 — route traffic inside AWS network", correct: true, feedback: "✅ VPC Endpoints route ECR/S3 traffic through the AWS network — free. Eliminates $38k in NAT data processing charges." },
      { text: "Move all EC2 instances to public subnets", correct: false, feedback: "Exposing production servers to the internet is a catastrophic security regression." },
      { text: "Switch to Spot Instances", correct: false, feedback: "Spot affects compute cost, not data transfer. The bill is from NAT data processing." },
    ],
  },
  { id: 12, topic: "networking", title: "The Cascading Timeout",
    story: "🌊 CASCADE: Payment service times out → order service queues up → API pods OOM crash. It's spreading across the stack.",
    clues: [
      { text: "Payment service p99 latency: 28 seconds (SLA: 200ms)" },
      { text: "Downstream credit bureau API returning 503 — their status page confirms outage" },
      { text: "No circuit breaker or timeout configured on payment→credit bureau calls" },
    ],
    choices: [
      { text: "Scale up all microservices horizontally", correct: false, feedback: "More pods all blocking on the same unavailable API. More cost, same failure." },
      { text: "Implement circuit breaker + fallback response + aggressive timeouts", correct: true, feedback: "✅ Circuit breaker opens after repeated failures, returning a fallback instantly. Stops cascade propagation immediately." },
      { text: "Restart all payment service pods", correct: false, feedback: "Fresh pods hit the same downstream outage and timeout identically within seconds." },
      { text: "Switch credit bureau vendors", correct: false, feedback: "Vendor migration takes days. Isolate the failure now — vendor is a post-incident decision." },
    ],
  },
  { id: 13, topic: "networking", title: "The Blind Spot",
    story: "🕵️ NO VISIBILITY: Security team reports suspicious traffic patterns but can't trace them. VPC has been running 2 years with zero network monitoring.",
    clues: [
      { text: "GuardDuty finding: 'UnauthorizedAccess:EC2/TorIPCaller' on 3 instances" },
      { text: "VPC Flow Logs: NOT ENABLED on any subnet or ENI" },
      { text: "Security group: port 22 open to 0.0.0.0/0 on all production instances" },
    ],
    choices: [
      { text: "Terminate the 3 flagged EC2 instances immediately", correct: false, feedback: "Terminating without forensics destroys evidence. You won't know what was accessed or exfiltrated." },
      { text: "Enable VPC Flow Logs + restrict SSH to bastion only + isolate flagged instances for forensics", correct: true, feedback: "✅ Flow Logs give retroactive and ongoing network visibility. Restricting SSH eliminates the attack vector. Isolation preserves forensic evidence without destroying it." },
      { text: "Disable the internet gateway to block all traffic", correct: false, feedback: "This takes down all production services. Security incidents don't justify full outages." },
      { text: "Change all EC2 key pairs", correct: false, feedback: "Rotating key pairs doesn't revoke active sessions and doesn't address the open security group." },
    ],
  },
  { id: 14, topic: "networking", title: "The Route 53 Roulette",
    story: "🎲 DNS CHAOS: After a region migration, 40% of users can't reach the app. The other 60% are fine. Support tickets are flooding in from specific cities.",
    clues: [
      { text: "Route 53 health check: primary region (us-east-1) showing HEALTHY" },
      { text: "Complaints coming exclusively from Europe and Asia-Pacific users" },
      { text: "Route 53 routing policy: Simple — single record pointing to us-east-1 ALB" },
    ],
    choices: [
      { text: "Restart the us-east-1 ALB to fix the health check", correct: false, feedback: "The ALB is healthy — restarting it doesn't address the latency problem affecting international users." },
      { text: "Switch to Latency-Based Routing + add ALBs in eu-west-1 and ap-southeast-1", correct: true, feedback: "✅ Simple routing sends everyone to us-east-1 regardless of geography. Latency-based routing automatically directs users to the nearest healthy region — eliminating the high-latency experience." },
      { text: "Enable Route 53 DNSSEC", correct: false, feedback: "DNSSEC adds security validation to DNS — it doesn't affect routing logic or latency." },
      { text: "Increase the TTL on the DNS record to 86400 seconds", correct: false, feedback: "Higher TTL caches the wrong endpoint longer — this makes the problem worse, not better." },
    ],
  },
  { id: 15, topic: "networking", title: "The Peering Black Hole",
    story: "🕳️ LOST PACKETS: Two VPCs are peered but EC2 instances in VPC-B can't reach the database in VPC-A. Peering connection shows Active.",
    clues: [
      { text: "VPC Peering connection status: Active — established 30 minutes ago" },
      { text: "VPC-B route table: no route entry for VPC-A CIDR (10.0.0.0/16)" },
      { text: "VPC-A security group on RDS: inbound allows 0.0.0.0/0 on port 5432" },
    ],
    choices: [
      { text: "Delete and recreate the peering connection", correct: false, feedback: "The peering connection is Active and working — the issue is the route table, not the peering itself." },
      { text: "Add routes for VPC-A CIDR in VPC-B route tables + tighten VPC-A security group to VPC-B CIDR only", correct: true, feedback: "✅ VPC Peering only creates the link — you must manually add routes in both VPCs' route tables for traffic to flow. Tightening the security group is the right security improvement to make while you're in there." },
      { text: "Enable VPC Flow Logs to diagnose the issue", correct: false, feedback: "Flow Logs are for monitoring and forensics — they don't fix the missing route that's causing the drop." },
      { text: "Use AWS Transit Gateway instead", correct: false, feedback: "Transit Gateway is overkill for two VPCs and takes time to set up. The fix here is a 30-second route table change." },
    ],
  },

  // ── DATABASE (5) ──────────────────────────────────────────────────────────
  { id: 16, topic: "database", title: "The Vanishing Database",
    story: "💣 FAILOVER LOOP: Your RDS Multi-AZ keeps failing over every 8 minutes. Users get 90s of downtime each time. It's been 3 hours.",
    clues: [
      { text: "RDS event log: 'Multi-AZ failover completed' — 22 times in 3 hours" },
      { text: "CloudWatch FreeStorageSpace: 0 bytes since 3 hours ago" },
      { text: "App logs: 'disk full' errors in MySQL before each failover" },
    ],
    choices: [
      { text: "Reboot the RDS instance", correct: false, feedback: "Rebooting doesn't free disk space. The failover loop restarts within minutes." },
      { text: "Enable RDS storage autoscaling + reclaim space by truncating large tables", correct: true, feedback: "✅ Disk exhaustion triggers failover. Autoscaling prevents recurrence. Truncating large temp tables reclaims space immediately to break the loop." },
      { text: "Promote the read replica to primary", correct: false, feedback: "The replica has the same disk-full condition. You'd move the problem, not fix it." },
      { text: "Migrate to DynamoDB", correct: false, feedback: "A database migration mid-incident takes days. This is a 5-minute storage fix." },
    ],
  },
  { id: 17, topic: "database", title: "The Connection Flood",
    story: "🌊 CONNECTION STORM: RDS Postgres is rejecting connections with 'too many clients already'. App is down. There are 10,000 Lambda functions deployed.",
    clues: [
      { text: "RDS max_connections: 100 (db.t3.micro instance class)" },
      { text: "Lambda concurrency: 10,000 — each function opens its own DB connection on init" },
      { text: "RDS Performance Insights: DatabaseConnections flatlined at 100, then new requests rejected" },
    ],
    choices: [
      { text: "Increase Lambda memory to reduce concurrency", correct: false, feedback: "Memory doesn't control concurrency. You'd still have 10,000 concurrent functions each opening connections." },
      { text: "Add RDS Proxy between Lambda and RDS to pool and reuse connections", correct: true, feedback: "✅ RDS Proxy maintains a warm pool of DB connections and multiplexes thousands of Lambda requests through a small number of real connections — exactly solving Lambda + RDS connection exhaustion." },
      { text: "Upgrade to a larger RDS instance", correct: false, feedback: "Larger instance supports more connections, but 10,000 Lambda functions will still exhaust any RDS instance. Proxy is the right architectural fix." },
      { text: "Set Lambda reserved concurrency to 100", correct: false, feedback: "Throttling Lambda to 100 breaks the application. The fix is connection pooling, not abandoning concurrency." },
    ],
  },
  { id: 18, topic: "database", title: "The DynamoDB Hot Partition",
    story: "🔥 THROTTLED: DynamoDB is throttling 60% of write requests during business hours. The table has 50 GB of data and 10,000 WCU provisioned.",
    clues: [
      { text: "CloudWatch: ConsumedWriteCapacityUnits spiking but ProvisionedWriteCapacityUnits shows headroom" },
      { text: "DynamoDB table partition key: user_region (only 3 distinct values: US, EU, APAC)" },
      { text: "80% of writes are for region=US during US business hours" },
    ],
    choices: [
      { text: "Increase provisioned WCU to 100,000", correct: false, feedback: "More capacity doesn't fix a hot partition — all the capacity is assigned per partition, and 80% of writes still hit the same 1/3 of partitions." },
      { text: "Switch partition key to a high-cardinality attribute like user_id or add a random suffix", correct: true, feedback: "✅ Hot partition = bad partition key design. Low-cardinality keys concentrate traffic. A high-cardinality key distributes writes evenly across all partitions, eliminating throttling." },
      { text: "Enable DynamoDB Auto Scaling", correct: false, feedback: "Auto Scaling reacts to throttling after the fact and still can't fix a hot partition — it can't scale one partition independently." },
      { text: "Add a GSI on the region attribute", correct: false, feedback: "GSIs help with read query patterns — they don't redistribute write load off a hot partition." },
    ],
  },
  { id: 19, topic: "database", title: "The Slow Query Spiral",
    story: "🐢 QUERY DEATH: Your Aurora MySQL cluster response time went from 50ms to 45 seconds over the past week. No schema changes were made.",
    clues: [
      { text: "Aurora Performance Insights: 'orders' table full table scan — top DB load contributor" },
      { text: "SHOW INDEX FROM orders: no index on 'created_at' column used in all reporting queries" },
      { text: "Table row count grew from 1M to 180M rows over the past 6 months" },
    ],
    choices: [
      { text: "Upgrade Aurora to a larger instance class", correct: false, feedback: "Larger instance won't fix a missing index — you'd be doing a faster full table scan of 180M rows." },
      { text: "Add a composite index on (created_at, status) + consider archiving rows older than 1 year", correct: true, feedback: "✅ The table grew 180x and queries scan every row because there's no index on the filter column. Index creation reduces scan from 180M to thousands of rows. Archiving old data keeps the table lean long-term." },
      { text: "Enable Aurora Auto Scaling to add read replicas", correct: false, feedback: "Read replicas distribute read load but all replicas still do a full table scan — same slow query, more instances." },
      { text: "Clear the Aurora buffer pool cache", correct: false, feedback: "Clearing cache would make things temporarily worse, not better. The buffer pool is helping cache frequently-accessed rows." },
    ],
  },
  { id: 20, topic: "database", title: "The Backup Illusion",
    story: "😱 RECOVERY FAIL: A developer accidentally dropped the production table. You go to restore from backup. Automated backups are enabled. The restore fails.",
    clues: [
      { text: "RDS automated backups: ENABLED — 7-day retention" },
      { text: "Restore attempt fails: 'Cannot restore to this point in time — no transaction logs available'" },
      { text: "Investigation: RDS instance was stopped for 10 days last month for cost saving — automated backups do not run on stopped instances" },
    ],
    choices: [
      { text: "Contact AWS Support for emergency data recovery", correct: false, feedback: "AWS Support cannot recover data from inside your database — they don't have access to your data. You must use your own backups." },
      { text: "Restore from the last available snapshot + use binlog replication to recover data up to the gap + implement never-stop policy or manual snapshots before stopping", correct: true, feedback: "✅ Backups pause when RDS is stopped. The last snapshot before stopping is the furthest back you can go. Binlog replication can partially bridge the gap. The real fix: never stop production RDS, or take a manual snapshot first." },
      { text: "Enable Multi-AZ to recover the data", correct: false, feedback: "Multi-AZ provides failover, not data recovery. The standby replica also lost the dropped table — it replicates all changes including DROP TABLE." },
      { text: "Re-enable automated backups and wait", correct: false, feedback: "Re-enabling backups starts new backups going forward — it cannot recover data that was never backed up." },
    ],
  },

  // ── SECURITY (5) ──────────────────────────────────────────────────────────
  { id: 21, topic: "security", title: "The Data Leak",
    story: "🔓 BREACH: An unknown IP is mass-downloading files from your S3 bucket. Public access was never supposed to be on.",
    clues: [
      { text: "Bucket policy: s3:GetObject for Principal: '*'" },
      { text: "CloudTrail: 4,200 GetObject calls in 10 minutes from foreign IP" },
      { text: "Block Public Access settings: all OFF" },
    ],
    choices: [
      { text: "Delete the S3 bucket immediately", correct: false, feedback: "You'd destroy production data before stopping the attacker. Never delete during an active breach." },
      { text: "Block public access + restrict bucket policy + enable CloudTrail logging", correct: true, feedback: "✅ Stop the breach, lock down access, preserve forensic logs. Textbook incident response." },
      { text: "Rename the bucket to a random string", correct: false, feedback: "Existing policy and data remain. An attacker who cached the policy can still exploit it." },
      { text: "Enable S3 Transfer Acceleration", correct: false, feedback: "Transfer Acceleration speeds up uploads — irrelevant to a read-access breach." },
    ],
  },
  { id: 22, topic: "security", title: "The IAM Time Bomb",
    story: "💣 PRIVILEGE ESCALATION: GuardDuty fires: a Lambda function's IAM role just called iam:CreateUser and iam:AttachUserPolicy. Neither of those actions is in its policy.",
    clues: [
      { text: "GuardDuty: 'PrivilegeEscalation:IAMUser/AnomalousBehavior' finding" },
      { text: "Lambda IAM role policy: allows iam:PassRole on all resources (*)" },
      { text: "CloudTrail: Lambda invoked iam:CreateUser using a chained role created via PassRole" },
    ],
    choices: [
      { text: "Delete the Lambda function immediately", correct: false, feedback: "Deleting Lambda doesn't revoke the IAM role or the user that was already created. The attacker may already have persistent access." },
      { text: "Revoke the IAM role + delete rogue IAM user + restrict PassRole to specific roles only", correct: true, feedback: "✅ iam:PassRole on * is a critical misconfiguration — it lets an attacker chain roles to escalate privileges. Revoke the role, delete the rogue user, and scope PassRole to only the exact roles that need it." },
      { text: "Enable MFA for all IAM users", correct: false, feedback: "MFA protects console login — it doesn't prevent programmatic API abuse via stolen role credentials." },
      { text: "Enable S3 Block Public Access", correct: false, feedback: "This is an IAM privilege escalation incident — S3 settings are irrelevant." },
    ],
  },
  { id: 23, topic: "security", title: "The Cryptominer",
    story: "⛏️ CRYPTOMINING ALERT: GuardDuty detects your EC2 instances are communicating with known cryptocurrency mining pools. Your compute bill tripled.",
    clues: [
      { text: "GuardDuty: 'CryptoCurrency:EC2/BitcoinTool.B!DNS' on 12 instances" },
      { text: "CloudTrail: new EC2 key pair created 4 days ago from an unfamiliar IP address" },
      { text: "Security group: SSH port 22 open to 0.0.0.0/0, password authentication enabled on instances" },
    ],
    choices: [
      { text: "Terminate the infected instances and ignore the rest", correct: false, feedback: "The attacker still has the key pair and the security group is still wide open — new instances will be compromised again immediately." },
      { text: "Isolate infected instances + restrict SSH to bastion/SSM only + rotate all credentials + forensic investigation", correct: true, feedback: "✅ Isolate to stop active mining, close the attack vector (open SSH), rotate all compromised credentials, and investigate what else the attacker accessed before you remediate." },
      { text: "Increase EC2 instance sizes to reduce mining impact on workloads", correct: false, feedback: "Larger instances just give the attacker more compute to mine with at your expense." },
      { text: "Enable AWS Shield to block mining traffic", correct: false, feedback: "Shield protects against DDoS — it doesn't block outbound connections to mining pools." },
    ],
  },
  { id: 24, topic: "security", title: "The Credential Leak",
    story: "🔑 KEYS EXPOSED: A developer accidentally committed AWS access keys to a public GitHub repo. The keys were live for 6 hours before anyone noticed.",
    clues: [
      { text: "CloudTrail: 847 API calls from the exposed access key over 6 hours from 12 different IPs" },
      { text: "Actions include: s3:ListBuckets, ec2:DescribeInstances, iam:ListUsers, iam:CreateAccessKey" },
      { text: "The IAM user has AdministratorAccess policy attached" },
    ],
    choices: [
      { text: "Rotate the access key and alert the developer", correct: false, feedback: "The attacker already called iam:CreateAccessKey — rotating the original key doesn't revoke credentials the attacker already created for themselves." },
      { text: "Disable the IAM user immediately + delete all access keys on that user + audit CloudTrail for all actions taken + revoke any resources created by the attacker", correct: true, feedback: "✅ Disabling the user revokes all sessions. Deleting all keys removes attacker's own keys. Full CloudTrail audit determines the blast radius. AdministratorAccess means the attacker could have done anything — you must assume full compromise." },
      { text: "Enable MFA on the IAM user", correct: false, feedback: "MFA applies to console login — programmatic access via access keys bypasses MFA entirely." },
      { text: "Delete the GitHub repository", correct: false, feedback: "GitHub caches and forks mean the keys are already out in the world. Deleting the repo doesn't help and may destroy useful forensic evidence." },
    ],
  },
  { id: 25, topic: "security", title: "The SCP Lockout",
    story: "🔒 ORG LOCKOUT: A new Service Control Policy was deployed to all accounts in the organization. Now no one — including admins — can create EC2 instances anywhere.",
    clues: [
      { text: "All ec2:RunInstances calls failing: 'Access Denied' across all accounts" },
      { text: "SCP recently applied to Root OU: Deny ec2:RunInstances on all resources for all principals" },
      { text: "Management account (org root) is NOT affected — EC2 still works there" },
    ],
    choices: [
      { text: "Add AdministratorAccess IAM policy to all affected users", correct: false, feedback: "SCPs override IAM policies — an explicit Deny in an SCP cannot be overridden by any IAM allow, no matter how broad." },
      { text: "Log into the management account + edit the SCP to remove the Deny or scope it correctly", correct: true, feedback: "✅ SCPs are managed from the management account (or delegated admin). The management account itself is exempt from SCPs — use it to fix the policy. An explicit Deny in an SCP overrides all IAM allows in member accounts." },
      { text: "Create new IAM roles with ec2:RunInstances allow in the member accounts", correct: false, feedback: "SCPs are account-level guardrails — new roles in member accounts are still subject to the SCP Deny." },
      { text: "Contact AWS Support to remove the SCP", correct: false, feedback: "SCPs are customer-managed — AWS Support cannot modify your organization's policies. Only your management account admins can." },
    ],
  },
];

const QUIZ_QUESTIONS = [
  {
    q: "Your app needs to process 1 million image uploads per day asynchronously. What's the best architecture?",
    options: [
      "EC2 instance that polls a database every second",
      "S3 + SQS + Lambda triggered by queue messages",
      "One large EC2 instance with a cron job",
      "RDS with a stored procedure",
    ],
    correct: 1,
    explanation: "S3 stores uploads, SQS decouples the workload, and Lambda scales automatically per message — this is the serverless event-driven pattern.",
  },
  {
    q: "Which service would you use to cache database query results and reduce RDS load?",
    options: ["Amazon S3", "Amazon ElastiCache (Redis)", "Amazon Glacier", "AWS Glue"],
    correct: 1,
    explanation: "ElastiCache with Redis provides in-memory caching, dramatically reducing latency and database load for repeated queries.",
  },
  {
    q: "You need to deploy a containerized app with automatic scaling. Which is the most managed option?",
    options: ["EC2 with manual Docker", "ECS on EC2", "AWS Fargate", "EC2 with a shell script"],
    correct: 2,
    explanation: "Fargate is serverless container compute — no EC2 management, scales automatically, you just define CPU/memory.",
  },
  {
    q: "Your app in us-east-1 needs <50ms latency for users in Asia. What do you add?",
    options: ["Another EC2 in us-east-1", "CloudFront CDN", "Larger EC2 instance", "S3 in the same region"],
    correct: 1,
    explanation: "CloudFront has 400+ edge locations globally, caching content close to users for ultra-low latency delivery.",
  },
];

const RPG_MISSIONS = [
  {
    level: 1,
    title: "The Static Site Quest",
    xp: 100,
    badge: "☁️ Cloud Initiate",
    description: "Deploy a static website for a local bakery. They need it cheap, fast, and globally accessible.",
    services: ["S3", "CloudFront", "Route 53"],
    quiz: {
      q: "Where should the HTML/CSS/JS files live?",
      options: ["EC2 instance", "S3 bucket with static hosting", "RDS database", "Lambda function"],
      correct: 1,
    },
  },
  {
    level: 2,
    title: "The Database Dungeon",
    xp: 200,
    badge: "🗄️ Data Warden",
    description: "A fintech startup needs a highly available database that survives AZ failures.",
    services: ["RDS", "Multi-AZ", "Read Replicas"],
    quiz: {
      q: "Which RDS feature provides automatic failover to a standby in another AZ?",
      options: ["Read Replicas", "Multi-AZ Deployment", "RDS Proxy", "Aurora Serverless"],
      correct: 1,
    },
  },
  {
    level: 3,
    title: "The Serverless Summit",
    xp: 300,
    badge: "⚡ Lambda Legend",
    description: "Build an API that handles spiky traffic — 0 requests at night, 100k/min during flash sales.",
    services: ["Lambda", "API Gateway", "DynamoDB"],
    quiz: {
      q: "What triggers a Lambda function from an HTTP request?",
      options: ["EC2", "API Gateway", "CloudWatch", "S3 alone"],
      correct: 1,
    },
  },
];

// ─── COMPONENTS ────────────────────────────────────────────────────────────────

const GlowText = ({ children, color = COLORS.accent }) => (
  <span style={{ color, textShadow: `0 0 20px ${color}80` }}>{children}</span>
);

const Badge = ({ children, color = COLORS.accent }) => (
  <span style={{
    background: `${color}20`,
    border: `1px solid ${color}50`,
    color,
    padding: "2px 10px",
    borderRadius: 4,
    fontSize: 11,
    fontFamily: "'Space Mono', monospace",
    letterSpacing: 1,
  }}>{children}</span>
);

const Btn = ({ children, onClick, color = COLORS.accent, disabled, small }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: disabled ? "#1a2d45" : `linear-gradient(135deg, ${color}22, ${color}11)`,
    border: `1px solid ${disabled ? "#1a2d45" : color}`,
    color: disabled ? COLORS.muted : color,
    padding: small ? "6px 14px" : "10px 22px",
    borderRadius: 6,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'Space Mono', monospace",
    fontSize: small ? 11 : 13,
    letterSpacing: 1,
    transition: "all 0.2s",
    boxShadow: disabled ? "none" : `0 0 12px ${color}30`,
  }}
    onMouseEnter={e => { if (!disabled) e.target.style.boxShadow = `0 0 20px ${color}60`; }}
    onMouseLeave={e => { if (!disabled) e.target.style.boxShadow = `0 0 12px ${color}30`; }}
  >{children}</button>
);

const Panel = ({ children, style }) => (
  <div style={{
    background: COLORS.panel,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: 24,
    ...style,
  }}>{children}</div>
);

const XPBar = ({ xp, maxXp }) => (
  <div style={{ marginTop: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ color: COLORS.muted, fontSize: 11, fontFamily: "monospace" }}>XP</span>
      <span style={{ color: COLORS.accent, fontSize: 11, fontFamily: "monospace" }}>{xp}/{maxXp}</span>
    </div>
    <div style={{ background: "#1a2d45", borderRadius: 4, height: 6, overflow: "hidden" }}>
      <div style={{
        width: `${(xp / maxXp) * 100}%`,
        height: "100%",
        background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.green})`,
        borderRadius: 4,
        transition: "width 0.6s ease",
        boxShadow: `0 0 8px ${COLORS.accent}80`,
      }} />
    </div>
  </div>
);

// ─── GAME MODES ────────────────────────────────────────────────────────────────

// 1. MATCHING MODE — multi-level, stable shuffle
function MatchLevelRound({ levelData, onLevelComplete }) {
  const pairs = levelData.pairs;
  const shuffledRight = useMemo(() => {
    const arr = pairs.map((p, i) => ({ ...p, originalIdx: i }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [levelData.level]);

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matched, setMatched] = useState(new Set());
  const [wrongFlash, setWrongFlash] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const handleLeft = (origIdx) => {
    if (matched.has(origIdx) || done) return;
    setSelectedLeft(origIdx);
    setWrongFlash(false);
    setSelectedRight(null);
  };

  const handleRight = (pos) => {
    if (done) return;
    const item = shuffledRight[pos];
    if (matched.has(item.originalIdx)) return;
    if (selectedLeft === null) { setSelectedRight(pos); return; }
    if (selectedLeft === item.originalIdx) {
      const newMatched = new Set([...matched, selectedLeft]);
      const pts = score + 50;
      setMatched(newMatched);
      setScore(pts);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (newMatched.size === pairs.length) {
        setDone(true);
        setTimeout(() => onLevelComplete(pts), 900);
      }
    } else {
      setWrongFlash(true);
      setSelectedRight(pos);
      setTimeout(() => { setWrongFlash(false); setSelectedLeft(null); setSelectedRight(null); }, 700);
    }
  };

  return (
    <div>
      <p style={{ color: COLORS.muted, fontSize: 12, fontFamily: "monospace", margin: "0 0 14px" }}>
        Click a service on the left, then its definition on the right.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {pairs.map((pair, origIdx) => {
            const isM = matched.has(origIdx), isSel = selectedLeft === origIdx;
            return (
              <div key={origIdx} onClick={() => handleLeft(origIdx)} style={{
                padding: "11px 13px", borderRadius: 8,
                border: `2px solid ${isM ? COLORS.green : isSel ? levelData.color : COLORS.border}`,
                background: isM ? `${COLORS.green}18` : isSel ? `${levelData.color}18` : COLORS.bg,
                color: isM ? COLORS.green : isSel ? levelData.color : COLORS.text,
                cursor: isM ? "default" : "pointer",
                fontFamily: "'Space Mono', monospace", fontSize: 12,
                transition: "all 0.15s", userSelect: "none",
                boxShadow: isSel ? `0 0 10px ${levelData.color}40` : "none",
              }}>
                {isM ? "✅ " : isSel ? "▶ " : ""}{pair.left}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {shuffledRight.map((item, pos) => {
            const isM = matched.has(item.originalIdx), isSel = selectedRight === pos, isWrong = wrongFlash && isSel;
            return (
              <div key={item.originalIdx} onClick={() => handleRight(pos)} style={{
                padding: "11px 13px", borderRadius: 8,
                border: `2px solid ${isM ? COLORS.green : isWrong ? COLORS.red : isSel ? COLORS.purple : COLORS.border}`,
                background: isM ? `${COLORS.green}18` : isWrong ? `${COLORS.red}18` : isSel ? `${COLORS.purple}18` : COLORS.bg,
                color: isM ? COLORS.green : isWrong ? COLORS.red : COLORS.text,
                cursor: isM ? "default" : "pointer",
                fontFamily: "monospace", fontSize: 11, lineHeight: 1.4,
                transition: "all 0.15s", userSelect: "none",
              }}>
                {isM ? "✅ " : ""}{item.right}
              </div>
            );
          })}
        </div>
      </div>
      {wrongFlash && <div style={{ textAlign: "center", color: COLORS.red, marginTop: 10, fontFamily: "monospace", fontSize: 12 }}>❌ Not a match — try again!</div>}
      {done && <div style={{ textAlign: "center", color: COLORS.green, marginTop: 10, fontFamily: "monospace", fontSize: 13 }}>🎉 Level complete! +{score} pts</div>}
      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
        <Badge color={levelData.color}>{matched.size}/{pairs.length} matched</Badge>
        <Badge color={COLORS.green}>Score: {score}</Badge>
      </div>
    </div>
  );
}

function MatchingGame({ onComplete, levelsOverride }) {
  const levels = levelsOverride || MATCH_LEVELS;
  const [levelIdx, setLevelIdx] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [phase, setPhase] = useState("play"); // play | levelup | done

  const level = levels[levelIdx];

  const handleLevelComplete = (pts) => {
    const newTotal = totalScore + pts;
    setTotalScore(newTotal);
    if (levelIdx + 1 >= levels.length) {
      setPhase("done");
      setTimeout(() => onComplete(newTotal), 400);
    } else {
      setPhase("levelup");
    }
  };

  const nextLevel = () => { setLevelIdx(i => i + 1); setPhase("play"); };

  return (
    <div>
      {/* Level Progress Bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {levels.map((l, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < levelIdx ? COLORS.green : i === levelIdx ? l.color : COLORS.border, transition: "background 0.4s" }} />
        ))}
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ color: level.color, fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 1, marginBottom: 3 }}>
            LEVEL {level.level} / {levels.length}
          </div>
          <h3 style={{ color: COLORS.text, margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 15 }}>{level.title}</h3>
        </div>
        <div style={{ textAlign: "right" }}>
          <Badge color={COLORS.accent}>Total: {totalScore}</Badge>
        </div>
      </div>

      {phase === "play" && (
        <MatchLevelRound key={levelIdx} levelData={level} onLevelComplete={handleLevelComplete} />
      )}

      {phase === "levelup" && (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏅</div>
          <div style={{ color: level.color, fontFamily: "'Space Mono', monospace", fontSize: 20, marginBottom: 6 }}>
            {level.badge}
          </div>
          <div style={{ color: COLORS.muted, fontFamily: "monospace", fontSize: 13, marginBottom: 24 }}>
            Level {level.level} cleared! Next: {levels[levelIdx + 1]?.title}
          </div>
          <Btn onClick={nextLevel} color={levels[levelIdx + 1]?.color || COLORS.accent}>
            Next Level →
          </Btn>
        </div>
      )}
    </div>
  );
}

// ── AWS SERVICE ICON (SVG-based, brand-accurate colors) ──────────────────────
function AwsIcon({ abbr, color, size = 40, dim = false }) {
  const bg = dim ? "#1a2535" : color;
  const textColor = "#fff";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block", flexShrink: 0 }}>
      <rect x="1" y="1" width="38" height="38" rx="8" fill={bg} opacity={dim ? 0.35 : 1} />
      <rect x="1" y="1" width="38" height="38" rx="8" fill="none" stroke={dim ? "#2a3a4a" : color} strokeWidth="1.5" opacity={dim ? 0.3 : 0.6} />
      {/* AWS smile arc */}
      <path d="M10 28 Q20 33 30 28" stroke={dim ? "#3a4a5a" : "rgba(255,255,255,0.5)"} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <text x="20" y="22" textAnchor="middle" dominantBaseline="middle" fill={dim ? "#3a5a6a" : textColor}
        fontSize={abbr.length > 3 ? "8" : abbr.length > 2 ? "9" : "11"}
        fontFamily="'Space Mono', monospace" fontWeight="bold">
        {abbr}
      </text>
    </svg>
  );
}

// ── CANVAS NODE (slot on the diagram) ────────────────────────────────────────
function CanvasNode({ slot, placed, checked, isCorrect, isWrong, isHovered, onDrop, onRemove, dragging }) {
  const svc = placed;
  return (
    <div
      onMouseUp={() => dragging && onDrop(slot.id)}
      onTouchEnd={() => dragging && onDrop(slot.id)}
      style={{
        width: 110, height: 90,
        borderRadius: 12,
        border: `2px solid ${isCorrect ? "#10b981" : isWrong ? "#ef4444" : isHovered ? "#f59e0b" : svc ? svc.color + "80" : "#1e3a5a"}`,
        background: isCorrect ? "rgba(16,185,129,0.08)" : isWrong ? "rgba(239,68,68,0.08)" : isHovered ? "rgba(245,158,11,0.1)" : svc ? `${svc.color}10` : "rgba(13,21,32,0.8)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 6, position: "relative", cursor: dragging ? "copy" : "default",
        transition: "border-color 0.15s, background 0.15s",
        backdropFilter: "blur(4px)",
      }}>


      {svc ? (
        <>
          <AwsIcon abbr={svc.abbr} color={svc.color} size={38} />
          <div style={{ color: svc.color, fontSize: 9, fontFamily: "'Space Mono', monospace", textAlign: "center", lineHeight: 1.3, padding: "0 4px" }}>
            {svc.name}
          </div>
          {isCorrect && <div style={{ position: "absolute", top: -8, right: -8, fontSize: 14 }}>✅</div>}
          {isWrong && <div style={{ position: "absolute", top: -8, right: -8, fontSize: 14 }}>❌</div>}
          {!checked && (
            <button onClick={onRemove} style={{
              position: "absolute", top: 4, right: 4,
              background: "rgba(0,0,0,0.5)", border: "none", color: "#64748b",
              borderRadius: "50%", width: 16, height: 16, fontSize: 10,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              lineHeight: 1,
            }}>×</button>
          )}
        </>
      ) : (
        <div style={{ color: isHovered ? "#f59e0b" : "#1e3a5a", fontSize: 11, fontFamily: "monospace", textAlign: "center" }}>
          {isHovered ? "DROP" : "+"}
        </div>
      )}
    </div>
  );
}

// ── SVG ARROWS between nodes ──────────────────────────────────────────────────
function ArchArrows({ scenario, slotPositions, placements, checked }) {
  if (!slotPositions || Object.keys(slotPositions).length === 0) return null;
  return (
    <svg style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#1e3a5a" />
        </marker>
        <marker id="arrowhead-ok" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
        </marker>
      </defs>
      {scenario.connections.map(([fromId, toId], i) => {
        const from = slotPositions[fromId];
        const to = slotPositions[toId];
        if (!from || !to) return null;
        const fromConnected = placements[fromId] && placements[toId];
        const color = checked && fromConnected ? "#10b981" : "#1e3a5a";
        const marker = checked && fromConnected ? "url(#arrowhead-ok)" : "url(#arrowhead)";
        // cubic bezier
        const mx = (from.x + to.x) / 2;
        return (
          <path key={i}
            d={`M ${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x} ${to.y}`}
            stroke={color} strokeWidth={checked && fromConnected ? 2 : 1.5}
            fill="none" strokeDasharray={checked && fromConnected ? "none" : "5,4"}
            markerEnd={marker}
            style={{ transition: "stroke 0.4s, stroke-width 0.4s" }}
          />
        );
      })}
    </svg>
  );
}

// ── MAIN ARCH ROUND ───────────────────────────────────────────────────────────
function ArchRound({ scenario, onLevelComplete }) {
  const [placements, setPlacements] = useState({});   // slotId -> serviceId
  const [selected, setSelected] = useState(null);     // serviceId currently selected from palette
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [slotPositions, setSlotPositions] = useState({});
  const canvasRef = useRef(null);
  const slotRefs = useRef({});

  const CELL_W = 140, CELL_H = 130, NODE_W = 110;

  const placedServiceIds = Object.values(placements);
  const getSvc = (id) => scenario.services.find(s => s.id === id);
  const getSlotSvc = (slotId) => { const id = placements[slotId]; return id ? getSvc(id) : null; };

  // Recompute arrow positions
  useEffect(() => {
    const positions = {};
    scenario.slots.forEach(slot => {
      const el = slotRefs.current[slot.id];
      const canvas = canvasRef.current;
      if (el && canvas) {
        const er = el.getBoundingClientRect();
        const cr = canvas.getBoundingClientRect();
        positions[slot.id] = { x: er.left - cr.left + er.width / 2, y: er.top - cr.top + er.height / 2 };
      }
    });
    setSlotPositions(positions);
  }, [scenario, placements]);

  const handlePaletteClick = (svcId) => {
    if (placedServiceIds.includes(svcId)) return;
    setSelected(prev => prev === svcId ? null : svcId);
  };

  const handleSlotClick = (slotId) => {
    if (!selected) return;
    setPlacements(prev => {
      const next = { ...prev };
      // Remove selected svc from any old slot
      Object.keys(next).forEach(k => { if (next[k] === selected) delete next[k]; });
      next[slotId] = selected;
      return next;
    });
    setSelected(null);
    setChecked(false);
  };

  const removeFromSlot = (slotId, e) => {
    e.stopPropagation();
    setPlacements(prev => { const n = { ...prev }; delete n[slotId]; return n; });
    setChecked(false);
  };

  const checkAnswers = () => {
    let s = 0;
    scenario.services.forEach(svc => { if (placements[svc.correctSlot] === svc.id) s += 100; });
    setScore(s);
    setChecked(true);
    if (s === scenario.services.length * 100) setTimeout(() => onLevelComplete(s), 1400);
  };

  const reset = () => { setPlacements({}); setChecked(false); setScore(0); setSelected(null); };
  const allPlaced = Object.keys(placements).length >= scenario.slots.length;
  const max = scenario.services.length * 100;
  const usedCols = Math.max(...scenario.slots.map(s => s.col)) + 1;
  const usedRows = Math.max(...scenario.slots.map(s => s.row)) + 1;
  const canvasW = usedCols * CELL_W + 60;
  const canvasH = usedRows * CELL_H + 100;

  return (
    <div style={{ userSelect: "none" }}>
      <p style={{ color: "#64748b", fontSize: 12, fontFamily: "monospace", margin: "0 0 16px", lineHeight: 1.6 }}>
        {scenario.description}
      </p>

      {/* Palette — click to select */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: "#475569", fontSize: 10, fontFamily: "monospace", letterSpacing: 2, marginBottom: 10 }}>
          {selected ? `SELECTED: ${getSvc(selected)?.name} — now click a node on the canvas` : "CLICK A SERVICE TO SELECT, THEN CLICK ITS NODE"}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {scenario.services.map(svc => {
            const isPlaced = placedServiceIds.includes(svc.id);
            const isSel = selected === svc.id;
            return (
              <div key={svc.id}
                onClick={() => handlePaletteClick(svc.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                  padding: "10px 14px", borderRadius: 10,
                  border: `2px solid ${isPlaced ? "#1a2535" : isSel ? "#f59e0b" : svc.color + "60"}`,
                  background: isPlaced ? "rgba(13,21,32,0.5)" : isSel ? "rgba(245,158,11,0.15)" : `${svc.color}12`,
                  cursor: isPlaced ? "default" : "pointer",
                  opacity: isPlaced ? 0.3 : 1,
                  transition: "all 0.15s", minWidth: 72,
                  boxShadow: isSel ? "0 0 16px rgba(245,158,11,0.4)" : "none",
                  transform: isSel ? "scale(1.06)" : "scale(1)",
                }}>
                <AwsIcon abbr={svc.abbr} color={svc.color} size={36} dim={isPlaced} />
                <div style={{ color: isPlaced ? "#2a3a4a" : isSel ? "#f59e0b" : svc.color, fontSize: 9, fontFamily: "'Space Mono', monospace", textAlign: "center", lineHeight: 1.3 }}>{svc.name}</div>
                <div style={{ color: "#334155", fontSize: 8, fontFamily: "monospace", letterSpacing: 1 }}>{svc.category.toUpperCase()}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable canvas */}
      <div style={{ overflowX: "auto", borderRadius: 16, border: "1px solid #1a2d45", marginBottom: 16 }}>
        <div style={{
          position: "relative",
          background: "radial-gradient(ellipse at 50% 50%, #0d1a2e 0%, #080d14 100%)",
          borderRadius: 16, padding: "48px 28px 28px",
          minWidth: canvasW, minHeight: canvasH,
        }}>
          <svg style={{ position: "absolute", inset: 0, pointerEvents: "none", borderRadius: 16 }} width="100%" height="100%">
            <defs>
              <pattern id={`dots-${scenario.level}`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="1" fill="#1a2d45" opacity="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#dots-${scenario.level})`} />
          </svg>
          <div style={{ position: "absolute", top: 10, left: 16, color: "#1a2d45", fontSize: 10, fontFamily: "monospace", letterSpacing: 2 }}>
            AWS ARCHITECTURE CANVAS
          </div>
          <div ref={canvasRef} style={{ position: "relative", height: canvasH - 76, width: canvasW - 56 }}>
            <ArchArrows scenario={scenario} slotPositions={slotPositions} placements={placements} checked={checked} />
            {scenario.slots.map(slot => {
              const placedSvc = getSlotSvc(slot.id);
              const isCorrect = checked && placedSvc?.correctSlot === slot.id;
              const isWrong = checked && placedSvc && placedSvc.correctSlot !== slot.id;
              const isTarget = !!selected && !placedSvc;
              const x = slot.col * CELL_W + (CELL_W - NODE_W) / 2;
              const y = slot.row * CELL_H + 30;
              return (
                <div key={slot.id} ref={el => slotRefs.current[slot.id] = el}
                  style={{ position: "absolute", left: x, top: y }}
                  onClick={() => handleSlotClick(slot.id)}>
                  <div style={{
                    width: NODE_W, height: 90, borderRadius: 12,
                    border: `2px solid ${isCorrect ? "#10b981" : isWrong ? "#ef4444" : isTarget ? "#f59e0b" : placedSvc ? placedSvc.color + "70" : "#1e3a5a"}`,
                    background: isCorrect ? "rgba(16,185,129,0.08)" : isWrong ? "rgba(239,68,68,0.08)" : isTarget ? "rgba(245,158,11,0.08)" : placedSvc ? `${placedSvc.color}10` : "rgba(13,21,32,0.8)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 6, position: "relative", cursor: selected && !placedSvc ? "crosshair" : placedSvc && !checked ? "pointer" : "default",
                    transition: "all 0.15s",
                    boxShadow: isTarget ? "0 0 14px rgba(245,158,11,0.3)" : "none",
                    animation: isTarget ? "pulse 1.2s ease-in-out infinite" : "none",
                  }}>
                    {placedSvc ? (
                      <>
                        <AwsIcon abbr={placedSvc.abbr} color={placedSvc.color} size={38} />
                        <div style={{ color: placedSvc.color, fontSize: 9, fontFamily: "'Space Mono', monospace", textAlign: "center", lineHeight: 1.3, padding: "0 4px" }}>{placedSvc.name}</div>
                        {isCorrect && <div style={{ position: "absolute", top: -8, right: -8, fontSize: 14 }}>✅</div>}
                        {isWrong && <div style={{ position: "absolute", top: -8, right: -8, fontSize: 14 }}>❌</div>}
                        {!checked && <button onClick={e => removeFromSlot(slot.id, e)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.5)", border: "none", color: "#64748b", borderRadius: "50%", width: 16, height: 16, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>}
                      </>
                    ) : (
                      <div style={{ color: isTarget ? "#f59e0b" : "#1e3a5a", fontSize: isTarget ? 18 : 20 }}>{isTarget ? "⊕" : "+"}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100% { box-shadow: 0 0 14px rgba(245,158,11,0.3); } 50% { box-shadow: 0 0 22px rgba(245,158,11,0.6); } }`}</style>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <Btn onClick={checkAnswers} disabled={!allPlaced}>Check Architecture</Btn>
        <Btn onClick={reset} color={COLORS.muted} small>Reset</Btn>
        {checked && <Badge color={score === max ? COLORS.green : COLORS.accent}>{score}/{max} pts</Badge>}
        {checked && score < max && <span style={{ color: COLORS.muted, fontSize: 12, fontFamily: "monospace" }}>Some services misplaced — try again!</span>}
        {checked && score === max && <span style={{ color: COLORS.green, fontSize: 12, fontFamily: "monospace" }}>🎉 Perfect architecture!</span>}
      </div>
    </div>
  );
}


function ArchitectureGame({ onComplete, scenariosOverride }) {
  const scenarios = scenariosOverride || ARCH_SCENARIOS;
  const [levelIdx, setLevelIdx] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [phase, setPhase] = useState("play");
  const scenario = scenarios[levelIdx];

  const handleLevelComplete = (pts) => {
    const next = totalScore + pts;
    setTotalScore(next);
    if (levelIdx + 1 >= scenarios.length) setTimeout(() => onComplete(next), 500);
    else setPhase("levelup");
  };

  const nextLevel = () => { setLevelIdx(i => i + 1); setPhase("play"); };

  return (
    <div>
      {/* Progress bar */}
      <div style={{ display: "flex", gap: 5, marginBottom: 16 }}>
        {scenarios.map((s, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: i < levelIdx ? COLORS.green : i === levelIdx ? "#f59e0b" : COLORS.border,
            transition: "background 0.4s",
          }} />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ color: "#f59e0b", fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 2, marginBottom: 3 }}>
            SCENARIO {scenario.level} / {scenarios.length}
          </div>
          <h3 style={{ color: COLORS.text, margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 15 }}>{scenario.title}</h3>
        </div>
        <Badge color={COLORS.accent}>Total: {totalScore}</Badge>
      </div>

      {phase === "play" && <ArchRound key={levelIdx} scenario={scenario} onLevelComplete={handleLevelComplete} />}

      {phase === "levelup" && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🏗️</div>
          <div style={{ color: "#f59e0b", fontFamily: "'Space Mono', monospace", fontSize: 18, marginBottom: 6 }}>
            {scenario.badge} Unlocked!
          </div>
          <div style={{ color: COLORS.muted, fontFamily: "monospace", fontSize: 13, marginBottom: 6 }}>
            Architecture verified! Next: <span style={{ color: COLORS.text }}>{scenarios[levelIdx + 1]?.title}</span>
          </div>
          <div style={{ color: COLORS.accent, fontFamily: "monospace", fontSize: 13, marginBottom: 28 }}>
            Running total: {totalScore} pts
          </div>
          <Btn onClick={nextLevel} color="#f59e0b">Next Scenario →</Btn>
        </div>
      )}
    </div>
  );
}
// 3. ESCAPE ROOM MODE
function EscapeRoom({ onComplete, roomsOverride }) {
  const rooms = roomsOverride || ESCAPE_ROOMS;
  const [roomIdx, setRoomIdx] = useState(0);
  const [cluesFound, setCluesFound] = useState(() => (roomsOverride || ESCAPE_ROOMS)[0].clues.map(() => false));
  const [chosen, setChosen] = useState(null);
  const [phase, setPhase] = useState("investigate"); // investigate | solve | result
  const [timer, setTimer] = useState(60);
  const [score, setScore] = useState(0);

  const room = rooms[roomIdx];

  useEffect(() => {
    if (phase !== "investigate") return;
    const t = setInterval(() => setTimer(t => {
      if (t <= 1) { clearInterval(t); setPhase("solve"); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [phase, roomIdx]);

  const findClue = (i) => {
    if (cluesFound[i]) return; // already revealed
    const next = [...cluesFound];
    next[i] = true;
    setCluesFound(next);
    // Delay so the last clue is visible before advancing to solve phase
    if (next.every(Boolean)) setTimeout(() => setPhase("solve"), 1800);
  };

  const choose = (i) => {
    setChosen(i);
    setPhase("result");
    if (room.choices[i].correct) {
      const bonus = timer * 5;
      setScore(s => s + 300 + bonus);
    }
  };

  const nextRoom = () => {
    if (roomIdx + 1 < rooms.length) {
      const nextIdx = roomIdx + 1;
      setRoomIdx(nextIdx);
      setCluesFound(rooms[nextIdx].clues.map(() => false));
      setChosen(null);
      setPhase("investigate");
      setTimer(60);
    } else {
      onComplete(score);
    }
  };

  const timerColor = timer > 30 ? COLORS.green : timer > 15 ? COLORS.accent : COLORS.red;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Badge color={COLORS.purple}>Room {roomIdx + 1}/{rooms.length}</Badge>
        <div style={{ fontFamily: "'Space Mono', monospace", color: timerColor, fontSize: 20, fontWeight: "bold" }}>
          ⏱ {timer}s
        </div>
        <Badge color={COLORS.green}>Score: {score}</Badge>
      </div>

      <Panel style={{ marginBottom: 16, borderColor: COLORS.red + "50", background: `${COLORS.red}08` }}>
        <h3 style={{ color: COLORS.red, margin: "0 0 8px", fontFamily: "'Space Mono', monospace" }}>{room.title}</h3>
        <p style={{ color: COLORS.text, margin: 0, fontSize: 14, lineHeight: 1.6 }}>{room.story}</p>
      </Panel>

      {phase === "investigate" && (
        <div>
          <div style={{ color: COLORS.muted, fontSize: 11, fontFamily: "monospace", marginBottom: 10 }}>
            🔍 INVESTIGATE: Click each clue to reveal it. Find all {room.clues.length} before choosing your fix.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {room.clues.map((clue, i) => (
              <div key={i} onClick={() => findClue(i)} style={{
                padding: "12px 16px",
                borderRadius: 8,
                border: `1px solid ${cluesFound[i] ? COLORS.purple : COLORS.border}`,
                background: cluesFound[i] ? `${COLORS.purple}15` : COLORS.bg,
                color: cluesFound[i] ? COLORS.text : COLORS.muted,
                cursor: cluesFound[i] ? "default" : "pointer",
                fontFamily: "monospace",
                fontSize: 13,
                transition: "all 0.2s",
              }}>
                {cluesFound[i] ? `🔓 ${clue.text}` : "🔒 Click to investigate..."}
              </div>
            ))}
          </div>
          {cluesFound.every(Boolean) && (
            <div style={{
              marginTop: 12, padding: "10px 14px", borderRadius: 8,
              background: `${COLORS.accent}15`, border: `1px solid ${COLORS.accent}40`,
              color: COLORS.accent, fontFamily: "monospace", fontSize: 12,
            }}>
              ✅ All clues found — advancing to solution in a moment...
            </div>
          )}
          {!cluesFound.every(Boolean) && (
            <div style={{ marginTop: 12 }}>
              <Btn small onClick={() => setPhase("solve")} color={COLORS.muted}>Skip Investigation →</Btn>
            </div>
          )}
        </div>
      )}

      {phase === "solve" && (
        <div>
          <div style={{ color: COLORS.accent, fontFamily: "monospace", fontSize: 12, marginBottom: 12 }}>
            ⚡ Choose the correct fix:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {room.choices.map((c, i) => (
              <div key={i} onClick={() => choose(i)} style={{
                padding: "14px 16px",
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.bg,
                color: COLORS.text,
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: 13,
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.background = `${COLORS.accent}10`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = COLORS.bg; }}
              >
                → {c.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "result" && chosen !== null && (
        <div>
          <Panel style={{
            borderColor: room.choices[chosen].correct ? COLORS.green : COLORS.red,
            background: room.choices[chosen].correct ? `${COLORS.green}10` : `${COLORS.red}10`,
          }}>
            <div style={{ fontSize: 18, marginBottom: 8 }}>{room.choices[chosen].correct ? "🎉 INCIDENT RESOLVED!" : "💥 WRONG CALL!"}</div>
            <p style={{ color: COLORS.text, margin: 0, fontFamily: "monospace", fontSize: 13 }}>{room.choices[chosen].feedback}</p>
          </Panel>
          <div style={{ marginTop: 16 }}>
            <Btn onClick={nextRoom} color={COLORS.green}>
              {roomIdx + 1 < rooms.length ? "Next Room →" : "Complete Escape! 🏆"}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// 4. SCENARIO QUIZ MODE
function ScenarioQuiz({ onComplete }) {
  const [qIdx, setQIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState(0);
  const [showExp, setShowExp] = useState(false);

  const q = QUIZ_QUESTIONS[qIdx];

  const pick = (i) => {
    if (chosen !== null) return;
    setChosen(i);
    if (i === q.correct) setScore(s => s + 150);
    setShowExp(true);
  };

  const next = () => {
    if (qIdx + 1 >= QUIZ_QUESTIONS.length) { onComplete(score); return; }
    setQIdx(q => q + 1);
    setChosen(null);
    setShowExp(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Badge>Q{qIdx + 1}/{QUIZ_QUESTIONS.length}</Badge>
        <Badge color={COLORS.green}>Score: {score}</Badge>
      </div>
      <Panel style={{ marginBottom: 16, borderColor: `${COLORS.blue}40` }}>
        <p style={{ color: COLORS.text, margin: 0, fontSize: 14, lineHeight: 1.7, fontFamily: "monospace" }}>
          💼 <strong style={{ color: COLORS.blue }}>Scenario:</strong> {q.q}
        </p>
      </Panel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {q.options.map((opt, i) => {
          let bc = COLORS.border, bg = COLORS.bg, col = COLORS.text;
          if (chosen !== null) {
            if (i === q.correct) { bc = COLORS.green; bg = `${COLORS.green}15`; col = COLORS.green; }
            else if (i === chosen) { bc = COLORS.red; bg = `${COLORS.red}15`; col = COLORS.red; }
          }
          return (
            <div key={i} onClick={() => pick(i)} style={{
              padding: "12px 16px", borderRadius: 8,
              border: `1px solid ${bc}`, background: bg, color: col,
              cursor: chosen !== null ? "default" : "pointer",
              fontFamily: "monospace", fontSize: 13, transition: "all 0.2s",
            }}>
              {String.fromCharCode(65 + i)}. {opt}
            </div>
          );
        })}
      </div>
      {showExp && (
        <Panel style={{ marginBottom: 16, borderColor: `${COLORS.blue}40`, background: `${COLORS.blue}08` }}>
          <div style={{ color: COLORS.blue, fontFamily: "monospace", fontSize: 11, marginBottom: 6 }}>💡 EXPLANATION</div>
          <p style={{ color: COLORS.text, margin: 0, fontSize: 13, fontFamily: "monospace" }}>{q.explanation}</p>
        </Panel>
      )}
      {chosen !== null && <Btn onClick={next} color={COLORS.blue}>{qIdx + 1 >= QUIZ_QUESTIONS.length ? "Finish Quiz 🏁" : "Next Question →"}</Btn>}
    </div>
  );
}

// 5. RPG MISSION MODE
function RPGMode({ onComplete }) {
  const [missionIdx, setMissionIdx] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [phase, setPhase] = useState("briefing"); // briefing | quiz | reward
  const [chosen, setChosen] = useState(null);
  const [badges, setBadges] = useState([]);

  const mission = RPG_MISSIONS[missionIdx];

  const pick = (i) => {
    if (chosen !== null) return;
    setChosen(i);
    if (i === mission.quiz.correct) {
      setTotalXP(x => x + mission.xp);
      setBadges(b => [...b, mission.badge]);
    }
    setPhase("reward");
  };

  const next = () => {
    if (missionIdx + 1 >= RPG_MISSIONS.length) { onComplete(totalXP); return; }
    setMissionIdx(m => m + 1);
    setChosen(null);
    setPhase("briefing");
  };

  return (
    <div>
      {/* Player Stats */}
      <Panel style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: COLORS.accent, fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: "bold" }}>
              🧙 AWS Architect
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              {badges.map((b, i) => <Badge key={i} color={COLORS.purple}>{b}</Badge>)}
              {badges.length === 0 && <span style={{ color: COLORS.muted, fontSize: 12, fontFamily: "monospace" }}>No badges yet...</span>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: COLORS.green, fontFamily: "monospace", fontSize: 20, fontWeight: "bold" }}>{totalXP} XP</div>
          </div>
        </div>
        <XPBar xp={totalXP} maxXp={600} />
      </Panel>

      {/* Mission Card */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {RPG_MISSIONS.map((m, i) => (
          <div key={i} style={{
            flex: 1, padding: "8px 12px", borderRadius: 8,
            border: `1px solid ${i === missionIdx ? COLORS.accent : i < missionIdx ? COLORS.green : COLORS.border}`,
            background: i === missionIdx ? `${COLORS.accent}15` : "transparent",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 18 }}>{i < missionIdx ? "✅" : i === missionIdx ? "⚔️" : "🔒"}</div>
            <div style={{ color: COLORS.muted, fontFamily: "monospace", fontSize: 10, marginTop: 4 }}>LVL {m.level}</div>
          </div>
        ))}
      </div>

      {phase === "briefing" && (
        <Panel style={{ borderColor: `${COLORS.accent}40` }}>
          <div style={{ color: COLORS.accent, fontFamily: "'Space Mono', monospace", fontSize: 11, marginBottom: 8 }}>
            ⚔️ MISSION {mission.level}: {mission.title.toUpperCase()}
          </div>
          <p style={{ color: COLORS.text, margin: "0 0 16px", fontSize: 13, lineHeight: 1.6, fontFamily: "monospace" }}>
            {mission.description}
          </p>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: COLORS.muted, fontFamily: "monospace", fontSize: 11, marginBottom: 8 }}>REQUIRED SERVICES:</div>
            <div style={{ display: "flex", gap: 8 }}>
              {mission.services.map(s => <Badge key={s} color={COLORS.blue}>{s}</Badge>)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Btn onClick={() => setPhase("quiz")}>Accept Mission ⚔️</Btn>
            <Badge color={COLORS.green}>+{mission.xp} XP reward</Badge>
          </div>
        </Panel>
      )}

      {phase === "quiz" && (
        <div>
          <Panel style={{ marginBottom: 16, borderColor: `${COLORS.purple}40` }}>
            <p style={{ color: COLORS.text, margin: 0, fontSize: 14, fontFamily: "monospace", lineHeight: 1.6 }}>
              🧠 {mission.quiz.q}
            </p>
          </Panel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {mission.quiz.options.map((opt, i) => {
              let bc = COLORS.border, bg = COLORS.bg, col = COLORS.text;
              if (chosen !== null) {
                if (i === mission.quiz.correct) { bc = COLORS.green; bg = `${COLORS.green}15`; col = COLORS.green; }
                else if (i === chosen) { bc = COLORS.red; bg = `${COLORS.red}15`; col = COLORS.red; }
              }
              return (
                <div key={i} onClick={() => pick(i)} style={{
                  padding: "12px 16px", borderRadius: 8,
                  border: `1px solid ${bc}`, background: bg, color: col,
                  cursor: "pointer", fontFamily: "monospace", fontSize: 13, transition: "all 0.2s",
                }}>
                  {String.fromCharCode(65 + i)}. {opt}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase === "reward" && (
        <div>
          <Panel style={{
            marginBottom: 16,
            borderColor: chosen === mission.quiz.correct ? `${COLORS.green}60` : `${COLORS.red}60`,
            background: chosen === mission.quiz.correct ? `${COLORS.green}08` : `${COLORS.red}08`,
          }}>
            {chosen === mission.quiz.correct ? (
              <>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🏆 Mission Complete!</div>
                <div style={{ color: COLORS.green, fontFamily: "monospace", fontSize: 13 }}>
                  +{mission.xp} XP earned! Badge unlocked: {mission.badge}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 24, marginBottom: 8 }}>💀 Mission Failed</div>
                <div style={{ color: COLORS.red, fontFamily: "monospace", fontSize: 13 }}>
                  No XP earned. The correct answer was: <strong>{mission.quiz.options[mission.quiz.correct]}</strong>
                </div>
              </>
            )}
          </Panel>
          <Btn onClick={next} color={COLORS.accent}>
            {missionIdx + 1 >= RPG_MISSIONS.length ? "Complete Campaign! 🎖️" : "Next Mission →"}
          </Btn>
        </div>
      )}
    </div>
  );
}

// ─── RESULT SCREEN ─────────────────────────────────────────────────────────────

function ResultScreen({ mode, score, onBack }) {
  const tier = score >= 400 ? "🥇 Gold" : score >= 200 ? "🥈 Silver" : "🥉 Bronze";
  const tierColor = score >= 400 ? COLORS.accent : score >= 200 ? "#94a3b8" : "#cd7f32";
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🏁</div>
      <h2 style={{ color: COLORS.text, fontFamily: "'Space Mono', monospace", margin: "0 0 8px" }}>Mode Complete!</h2>
      <div style={{ color: COLORS.muted, fontFamily: "monospace", marginBottom: 24 }}>{mode.toUpperCase()}</div>
      <div style={{
        fontSize: 48, fontWeight: "bold", color: tierColor,
        fontFamily: "'Space Mono', monospace",
        textShadow: `0 0 30px ${tierColor}80`,
        marginBottom: 8,
      }}>{score}</div>
      <div style={{ color: tierColor, fontFamily: "monospace", fontSize: 18, marginBottom: 32 }}>{tier}</div>
      <Btn onClick={onBack} color={COLORS.accent}>← Back to Hub</Btn>
    </div>
  );
}


// ─── TROUBLESHOOT MODE DATA ────────────────────────────────────────────────────
const TROUBLESHOOT_CASES = [

  // ── COMPUTE (5) ─────────────────────────────────────────────────────────────
  { id: 1, topic: "compute", title: "Users can't reach the website",
    symptoms: ["HTTP 504 Gateway Timeout from ALB", "EC2 instances show healthy in ALB target group", "Security group on EC2 allows port 80 inbound from ALB"],
    logs: ["ALB access log: 504 errors on all requests", "EC2 syslog: 'Address already in use: 8080'", "Netstat: port 8080 not listening on EC2"],
    rootCause: "The application process crashed and is no longer listening on port 8080, but the ALB health check uses port 80 — a different port — so targets still appear healthy.",
    steps: [
      { id: "a", text: "Check ALB health check port vs. actual app listening port", correct: true },
      { id: "b", text: "Terminate and replace all EC2 instances", correct: false },
      { id: "c", text: "Verify the app process is running via SSM Session Manager", correct: true },
      { id: "d", text: "Delete and recreate the ALB", correct: false },
      { id: "e", text: "Fix health check port to match app port and restart the app process", correct: true },
    ],
    explanation: "Always verify health check port matches the app's actual listening port. A misconfigured health check masks crashes — instances appear healthy while serving no traffic.",
  },
  { id: 2, topic: "compute", title: "Lambda function timing out randomly",
    symptoms: ["Lambda p50 duration: 200ms (normal)", "Lambda p99 duration: 30,000ms (timeout)", "Only happens during peak traffic hours"],
    logs: ["CloudWatch: 'Task timed out after 30.00 seconds'", "X-Ray trace: 28s spent waiting on RDS connection", "RDS CloudWatch: DatabaseConnections maxed at 100"],
    rootCause: "Each Lambda invocation opens a new DB connection. Under high concurrency all 100 RDS connections are exhausted, causing new invocations to wait indefinitely for a slot.",
    steps: [
      { id: "a", text: "Increase Lambda timeout to 5 minutes", correct: false },
      { id: "b", text: "Check RDS DatabaseConnections CloudWatch metric", correct: true },
      { id: "c", text: "Add RDS Proxy between Lambda and RDS to pool connections", correct: true },
      { id: "d", text: "Switch Lambda to DynamoDB", correct: false },
      { id: "e", text: "Set Lambda reserved concurrency to prevent connection exhaustion until Proxy is live", correct: true },
    ],
    explanation: "Lambda + RDS connection exhaustion is a classic scaling trap. RDS Proxy pools and reuses connections across thousands of concurrent functions, eliminating the bottleneck.",
  },
  { id: 3, topic: "compute", title: "ECS containers keep restarting",
    symptoms: ["ECS service tasks in RUNNING → STOPPED loop every 2 minutes", "Desired count: 3, Running count oscillates 0–3", "Happens even with zero incoming traffic"],
    logs: ["ECS task stopped reason: 'Essential container exited with code 137'", "Container logs: 'Killed'", "Container Insights: MemoryUtilization hits 100% before each exit"],
    rootCause: "Exit code 137 = OOMKilled. The container's memory limit in the task definition is too low for the application's actual memory usage.",
    steps: [
      { id: "a", text: "Force a new deployment with force-new-deployment flag", correct: false },
      { id: "b", text: "Check Container Insights for memory utilization trends", correct: true },
      { id: "c", text: "Identify exit code 137 = OOMKilled in stopped task reason", correct: true },
      { id: "d", text: "Switch to EC2 launch type", correct: false },
      { id: "e", text: "Increase memory limit in ECS task definition and redeploy", correct: true },
    ],
    explanation: "Exit code 137 is the universal OOMKill signal. Always check memory limits in task definitions when containers restart with no application errors logged.",
  },
  { id: 4, topic: "compute", title: "EC2 Auto Scaling not scaling up",
    symptoms: ["CPU at 95% on all instances for 20 minutes", "Auto Scaling group not launching new instances", "Application response time degrading under load"],
    logs: ["Auto Scaling activity log: 'Launch failed — no more capacity available in us-east-1a'", "Auto Scaling policy: Target Tracking on CPU > 70%", "All subnets configured are in us-east-1a only"],
    rootCause: "Auto Scaling is trying to launch in a single AZ that has no available capacity for the requested instance type. Configuring multiple AZs allows it to launch in a zone with capacity.",
    steps: [
      { id: "a", text: "Increase the desired capacity manually", correct: false },
      { id: "b", text: "Check Auto Scaling activity history for failure reason", correct: true },
      { id: "c", text: "Add subnets from multiple AZs to the Auto Scaling group", correct: true },
      { id: "d", text: "Change instance type to one with available capacity", correct: true },
      { id: "e", text: "Delete and recreate the Auto Scaling group", correct: false },
    ],
    explanation: "Always configure Auto Scaling groups across multiple AZs. AZ capacity for a specific instance type can be temporarily exhausted — multi-AZ diversification ensures scale-out can always succeed.",
  },
  { id: 5, topic: "compute", title: "Fargate tasks failing to start",
    symptoms: ["ECS service stuck at 0/3 running tasks", "Tasks enter PENDING then immediately go to STOPPED", "No application logs visible in CloudWatch"],
    logs: ["ECS task stopped reason: 'ResourceInitializationError: unable to pull secrets'", "Task definition: uses Secrets Manager ARN for DB_PASSWORD env var", "Task execution role: has AmazonECSTaskExecutionRolePolicy but no Secrets Manager permissions"],
    rootCause: "The task cannot start because the execution role lacks permission to retrieve the secret from Secrets Manager. The container never starts so no app logs are generated.",
    steps: [
      { id: "a", text: "Check task stopped reason in ECS console", correct: true },
      { id: "b", text: "Increase task CPU and memory", correct: false },
      { id: "c", text: "Add secretsmanager:GetSecretValue permission to the task execution role", correct: true },
      { id: "d", text: "Verify the Secrets Manager ARN in the task definition is correct", correct: true },
      { id: "e", text: "Move DB credentials to a hardcoded environment variable as a workaround", correct: false },
    ],
    explanation: "ECS separates the task execution role (used during startup to pull images and secrets) from the task role (used by running application code). Both need the right permissions for their specific actions.",
  },

  // ── STORAGE (5) ─────────────────────────────────────────────────────────────
  { id: 6, topic: "storage", title: "S3 PUT requests failing with 403",
    symptoms: ["Application returns 403 Forbidden when uploading to S3", "Read (GET) requests work fine", "Only affects production — staging works"],
    logs: ["CloudTrail: s3:PutObject denied for role arn:aws:iam::123:role/prod-app-role", "IAM policy allows s3:GetObject and s3:PutObject on arn:aws:s3:::prod-bucket/*", "S3 bucket policy has explicit Deny for s3:PutObject except for 'backup-role'"],
    rootCause: "An explicit Deny in the S3 bucket policy overrides the IAM allow. The backup team restricted writes but accidentally denied the application role.",
    steps: [
      { id: "a", text: "Check the IAM role policy for missing PutObject permission", correct: false },
      { id: "b", text: "Inspect the S3 bucket policy for explicit Deny statements", correct: true },
      { id: "c", text: "Use IAM Policy Simulator to trace the deny decision", correct: true },
      { id: "d", text: "Re-create the IAM role from scratch", correct: false },
      { id: "e", text: "Update bucket policy to exclude the app role from the Deny", correct: true },
    ],
    explanation: "In AWS, an explicit Deny always wins over any Allow — regardless of whether it's in IAM or a resource policy. Always check both layers when diagnosing access denied errors.",
  },
  { id: 7, topic: "storage", title: "CloudFront returning stale content",
    symptoms: ["Users see old website version after deployment", "Some users see new version, some see old", "Cache-Control headers set to max-age=86400 on S3 objects"],
    logs: ["CloudFront x-cache header: 'Hit from cloudfront' on old content requests", "S3 shows new files uploaded 30 minutes ago", "CloudFront default TTL: 24 hours"],
    rootCause: "CloudFront is serving cached old content because the TTL hasn't expired. New files were uploaded to S3 but edge caches still hold the old versions.",
    steps: [
      { id: "a", text: "Delete the S3 bucket and re-upload files", correct: false },
      { id: "b", text: "Check x-cache response header to confirm cache hit", correct: true },
      { id: "c", text: "Create a CloudFront invalidation for /* to purge the cache", correct: true },
      { id: "d", text: "Disable CloudFront entirely", correct: false },
      { id: "e", text: "Set Cache-Control: no-cache on HTML files; keep long TTL on content-hashed assets", correct: true },
    ],
    explanation: "Cache invalidations clear stale content immediately. Long-term, use content hashing for assets (long TTL) and short TTLs for HTML — this pattern avoids needing invalidations after each deploy.",
  },
  { id: 8, topic: "storage", title: "EBS volume performance degrading",
    symptoms: ["Database queries slowing down over 2 weeks", "No change in query volume or data size", "EC2 CPU is low — not a compute problem"],
    logs: ["CloudWatch VolumeQueueLength: climbing from 0 to 50+ over 2 weeks", "CloudWatch BurstBalance: dropped from 100% to 3%", "EBS volume type: gp2, 200 GB"],
    rootCause: "gp2 volumes use a burst credit model. Sustained moderate IOPS over weeks drained the burst bucket. The volume now operates only at its baseline 3 IOPS/GB = 600 IOPS instead of burst 3,000 IOPS.",
    steps: [
      { id: "a", text: "Reboot the EC2 instance to reset performance", correct: false },
      { id: "b", text: "Check CloudWatch BurstBalance metric on the EBS volume", correct: true },
      { id: "c", text: "Migrate the volume from gp2 to gp3 with provisioned IOPS", correct: true },
      { id: "d", text: "Add more RAM to the EC2 instance", correct: false },
      { id: "e", text: "Enable EBS-optimized flag on the EC2 instance", correct: true },
    ],
    explanation: "gp2 burst credits deplete silently under sustained load. gp3 delivers consistent IOPS (3,000 baseline, up to 16,000 provisioned) without any burst credit concept — it's the right choice for sustained database workloads.",
  },
  { id: 9, topic: "storage", title: "S3 replication not working",
    symptoms: ["S3 Cross-Region Replication configured but destination bucket stays empty", "New objects uploaded to source but none appear in destination after 2 hours", "No error messages visible in source bucket"],
    logs: ["S3 Replication status on objects: 'FAILED'", "S3 Replication metrics: ReplicationLatency = N/A, BytesPendingReplication climbing", "IAM role on replication rule missing s3:ReplicateObject permission on destination"],
    rootCause: "The IAM role used by S3 replication lacks the s3:ReplicateObject permission on the destination bucket, causing all replication attempts to silently fail.",
    steps: [
      { id: "a", text: "Disable and re-enable S3 versioning", correct: false },
      { id: "b", text: "Check replication status on individual objects in the source bucket", correct: true },
      { id: "c", text: "Review the IAM role permissions for the replication rule", correct: true },
      { id: "d", text: "Enable S3 Replication Time Control (RTC) to fix the issue", correct: false },
      { id: "e", text: "Add s3:ReplicateObject permission to the replication IAM role on destination", correct: true },
    ],
    explanation: "S3 replication requires versioning on both buckets AND an IAM role with exact permissions on both source and destination. Missing destination permissions cause silent replication failures.",
  },
  { id: 10, topic: "storage", title: "EFS mount failing on new EC2 instances",
    symptoms: ["Existing EC2 instances can access EFS fine", "New EC2 instances launched in a new subnet cannot mount EFS", "Mount command hangs then times out"],
    logs: ["Mount error: 'Connection timed out — server refused connection'", "New instances are in subnet 10.0.3.0/24 (new AZ)", "EFS mount targets: only configured for 10.0.1.0/24 and 10.0.2.0/24"],
    rootCause: "EFS requires a mount target in each AZ where you want to mount it. The new subnet is in a different AZ that has no EFS mount target.",
    steps: [
      { id: "a", text: "Reinstall the EFS mount helper on the new instances", correct: false },
      { id: "b", text: "Check which AZ the new instances are in vs. existing EFS mount targets", correct: true },
      { id: "c", text: "Create an EFS mount target in the new AZ's subnet", correct: true },
      { id: "d", text: "Migrate instances back to the original subnets", correct: false },
      { id: "e", text: "Update the EFS security group to allow NFS traffic from the new subnet", correct: true },
    ],
    explanation: "EFS is regional but requires a mount target (ENI) in each AZ you want to access it from. Always create mount targets in every AZ where EC2 instances will run, and ensure security groups permit NFS (port 2049) from those subnets.",
  },

  // ── NETWORKING (5) ──────────────────────────────────────────────────────────
  { id: 11, topic: "networking", title: "Cannot connect to EC2 via SSH",
    symptoms: ["SSH connection times out — no error, just hangs", "EC2 instance is running and shows 2/2 status checks passed", "Was working yesterday, stopped working after a team member 'cleaned up' security groups"],
    logs: ["Security group inbound rules: only port 443 from 0.0.0.0/0", "NACL inbound: allows all traffic", "VPC Flow Logs: SSH packets arrive but no response — rejected at security group"],
    rootCause: "The security group inbound rule for SSH (port 22) was deleted during the cleanup. Packets arrive at the instance but are silently dropped by the security group.",
    steps: [
      { id: "a", text: "Reboot the EC2 instance", correct: false },
      { id: "b", text: "Check VPC Flow Logs for ACCEPT vs REJECT on port 22", correct: true },
      { id: "c", text: "Review security group inbound rules for port 22", correct: true },
      { id: "d", text: "Terminate and replace the instance", correct: false },
      { id: "e", text: "Add inbound SSH rule to security group from your IP or bastion CIDR", correct: true },
    ],
    explanation: "Security groups are stateful — return traffic is allowed automatically. But inbound rules must explicitly permit the initial connection. Flow Logs showing REJECT is the fastest way to confirm a security group is blocking traffic.",
  },
  { id: 12, topic: "networking", title: "Private EC2 instances have no internet access",
    symptoms: ["EC2 instances in private subnets can't reach the internet", "Instances in public subnets work fine", "Private instances can communicate with each other inside the VPC"],
    logs: ["Private subnet route table: 0.0.0.0/0 route missing", "NAT Gateway exists and is available in public subnet", "Public subnet route table has 0.0.0.0/0 → igw-xxxxx"],
    rootCause: "The private subnet's route table is missing the default route pointing to the NAT Gateway. Without it, outbound internet traffic has no path to exit the VPC.",
    steps: [
      { id: "a", text: "Delete and recreate the NAT Gateway", correct: false },
      { id: "b", text: "Check the route table associated with the private subnets", correct: true },
      { id: "c", text: "Add 0.0.0.0/0 → NAT Gateway route to the private subnet route table", correct: true },
      { id: "d", text: "Attach an internet gateway directly to the private subnet", correct: false },
      { id: "e", text: "Verify NAT Gateway is in a public subnet with an Elastic IP", correct: true },
    ],
    explanation: "NAT Gateway only works if the private subnet's route table explicitly routes 0.0.0.0/0 to it. The NAT Gateway itself must be in a public subnet (with a route to the IGW) — this is a very common misconfiguration.",
  },
  { id: 13, topic: "networking", title: "ALB returning 502 Bad Gateway",
    symptoms: ["ALB health checks showing targets as healthy", "End users get 502 errors intermittently", "Error rate is 15% — not all requests fail"],
    logs: ["ALB access log: 502 errors with target processing time of 0.000", "EC2 app logs: no errors during the 502 windows", "ALB listener: HTTPS on 443, forwards to target group on port 8080"],
    rootCause: "The ALB is receiving responses from targets, but they're malformed HTTP responses — the application is closing connections prematurely before sending a complete response, causing 502s.",
    steps: [
      { id: "a", text: "Replace the ALB with a Network Load Balancer", correct: false },
      { id: "b", text: "Check ALB access logs for target_processing_time = 0.000 pattern", correct: true },
      { id: "c", text: "Inspect application keep-alive and connection timeout settings", correct: true },
      { id: "d", text: "Increase ALB idle timeout beyond the application's connection timeout", correct: true },
      { id: "e", text: "Increase target group health check interval", correct: false },
    ],
    explanation: "ALB 502 with target_processing_time of 0 means the target closed the connection before sending a valid response. This usually means the app's keep-alive timeout is shorter than ALB's idle timeout — ALB sends a request on a connection the app already closed.",
  },
  { id: 14, topic: "networking", title: "Cross-account VPC traffic not working",
    symptoms: ["Two accounts have VPC peering — connection shows Active", "Account A can reach Account B resources", "Account B cannot reach Account A resources — traffic times out"],
    logs: ["Account B VPC Flow Logs: traffic to Account A CIDR shows no entries — never leaves VPC B", "Account B route table: missing route for Account A VPC CIDR (172.16.0.0/16)", "Account A route table: has route for Account B CIDR (10.0.0.0/16) → pcx-xxxxx"],
    rootCause: "VPC peering is bidirectional but routes are not automatic — Account B's route table is missing the entry to route traffic toward Account A through the peering connection.",
    steps: [
      { id: "a", text: "Delete and re-accept the peering connection", correct: false },
      { id: "b", text: "Check Account B's route table for a route to Account A's CIDR", correct: true },
      { id: "c", text: "Add route 172.16.0.0/16 → peering connection in Account B's route table", correct: true },
      { id: "d", text: "Enable VPC Flow Logs in Account B to confirm traffic never leaves", correct: true },
      { id: "e", text: "Convert to Transit Gateway for better management", correct: false },
    ],
    explanation: "VPC Peering creates a link but requires manual route table entries in both VPCs. Asymmetric connectivity (one side works, other doesn't) almost always means one side's route table is missing the peering route.",
  },
  { id: 15, topic: "networking", title: "CloudFront distribution not serving traffic",
    symptoms: ["CloudFront distribution created but all requests return 403 Forbidden", "S3 origin bucket exists and contains files", "Direct S3 URL access works fine"],
    logs: ["CloudFront error: 403 from origin", "S3 bucket: Block Public Access = ON", "CloudFront distribution: Origin Access set to 'Legacy (origin access identity)' but no bucket policy grants OAI access"],
    rootCause: "Block Public Access is correctly enabled on S3, but the S3 bucket policy doesn't grant the CloudFront Origin Access Identity (OAI) permission to read objects. CloudFront gets 403 when it tries to fetch from S3.",
    steps: [
      { id: "a", text: "Disable Block Public Access on the S3 bucket", correct: false },
      { id: "b", text: "Check the S3 bucket policy for an OAI or OAC grant", correct: true },
      { id: "c", text: "Add a bucket policy granting CloudFront OAI s3:GetObject access", correct: true },
      { id: "d", text: "Switch to Origin Access Control (OAC) — newer and preferred over OAI", correct: true },
      { id: "e", text: "Make the S3 objects public individually", correct: false },
    ],
    explanation: "CloudFront + private S3 requires either OAI (legacy) or OAC (recommended) — and a matching bucket policy that explicitly grants that principal read access. Block Public Access should stay ON; the OAI/OAC is the controlled access path.",
  },

  // ── DATABASE (5) ──────────────────────────────────────────────────────────
  { id: 16, topic: "database", title: "RDS connections failing intermittently",
    symptoms: ["App throws 'connection refused' errors randomly, not consistently", "RDS instance status: Available", "Only happens during deployments — normal traffic is fine"],
    logs: ["App logs: 'FATAL: remaining connection slots reserved for replication'", "RDS CloudWatch: DatabaseConnections at max_connections (100) during deployment", "Deployment script: runs database migrations that open 50 concurrent connections"],
    rootCause: "During deployments, migration scripts open 50 additional connections simultaneously, pushing total connections past max_connections. RDS reserves the last few slots for replication — everything else gets refused.",
    steps: [
      { id: "a", text: "Increase the EC2 instance size running the migrations", correct: false },
      { id: "b", text: "Check RDS DatabaseConnections metric during deployment window", correct: true },
      { id: "c", text: "Add RDS Proxy to pool connections across migrations and app traffic", correct: true },
      { id: "d", text: "Run migrations sequentially instead of in parallel", correct: true },
      { id: "e", text: "Upgrade RDS to a larger instance class for more connections", correct: false },
    ],
    explanation: "RDS connection limits are per instance class. Deployments that open many concurrent connections spike past the limit. RDS Proxy is the architectural fix — it pools connections so migrations and app traffic share a managed pool rather than each opening raw DB connections.",
  },
  { id: 17, topic: "database", title: "DynamoDB read latency suddenly high",
    symptoms: ["DynamoDB GetItem p99 latency: 800ms (was 5ms yesterday)", "No schema changes or new deployments", "Only specific items are slow — most requests are still fast"],
    logs: ["X-Ray: slow requests all fetching items with partition key = 'CONFIG'", "DynamoDB CloudWatch: ConsumedReadCapacityUnits normal overall, but SystemErrors = 0", "Application: config values cached with 0-second TTL — every request re-reads from DynamoDB"],
    rootCause: "A single hot partition key ('CONFIG') is receiving all read traffic because the application's caching TTL was accidentally set to 0, causing every request to hit DynamoDB. The partition is throttled even though overall table capacity looks fine.",
    steps: [
      { id: "a", text: "Increase RCU provisioning on the DynamoDB table", correct: false },
      { id: "b", text: "Use X-Ray to identify which partition key is causing slowness", correct: true },
      { id: "c", text: "Fix the caching TTL to a non-zero value (e.g., 60 seconds)", correct: true },
      { id: "d", text: "Enable DynamoDB DAX for microsecond read caching", correct: true },
      { id: "e", text: "Delete and recreate the DynamoDB table", correct: false },
    ],
    explanation: "Hot partition + broken cache = latency spike that looks like a DynamoDB problem but is an application problem. Fixing the cache TTL removes the hot read pattern. DAX adds a caching layer as defense-in-depth.",
  },
  { id: 18, topic: "database", title: "Aurora failover taking too long",
    symptoms: ["Aurora Multi-AZ failover completes but apps are down for 4 minutes", "AWS documentation says failover should take ~30 seconds", "Application cannot reconnect until manually restarted"],
    logs: ["Aurora event log: failover completed in 28 seconds", "App logs: 'Unable to resolve endpoint: myapp.cluster-xxx.us-east-1.rds.amazonaws.com' for 4 minutes", "Application: DB connection string uses reader endpoint, not cluster endpoint"],
    rootCause: "Aurora failover itself completed in 28 seconds (as expected), but the application is caching the old DNS resolution. The app is using the reader endpoint (which doesn't change role) but the connection pool isn't re-resolving DNS after failover.",
    steps: [
      { id: "a", text: "Increase the Aurora failover priority", correct: false },
      { id: "b", text: "Check application connection string — cluster vs reader endpoint", correct: true },
      { id: "c", text: "Reduce DNS TTL for Aurora endpoint in application connection pool config", correct: true },
      { id: "d", text: "Implement connection retry logic with exponential backoff", correct: true },
      { id: "e", text: "Switch Aurora to Single-AZ to prevent failovers", correct: false },
    ],
    explanation: "Aurora failover is fast — the application reconnection is the bottleneck. Use the cluster endpoint (not reader endpoint) for writes, set DNS TTL to 0 in the connection pool, and always implement retry logic. The cluster endpoint automatically points to the new primary after failover.",
  },
  { id: 19, topic: "database", title: "Redshift queries suddenly slow",
    symptoms: ["Redshift query runtime increased from 30 seconds to 45 minutes overnight", "No new data loads or schema changes", "Only analytical queries are affected — simple selects are fine"],
    logs: ["Redshift STL_EXPLAIN: queries performing 'DS_DIST_ALL' — full data redistribution across nodes", "SVV_TABLE_INFO: 'orders' table has distribution style KEY on 'user_id', skew ratio = 98%", "Top 1% of user_ids account for 85% of all orders"],
    rootCause: "The distribution key (user_id) is highly skewed — a small number of popular users have most of the data. One compute node holds 98% of the data while others sit idle, causing massive redistribution during joins.",
    steps: [
      { id: "a", text: "Add more nodes to the Redshift cluster", correct: false },
      { id: "b", text: "Check SVV_TABLE_INFO for skew ratio on join tables", correct: true },
      { id: "c", text: "Change distribution style to EVEN or use a less skewed distribution key", correct: true },
      { id: "d", text: "Run VACUUM and ANALYZE on affected tables", correct: true },
      { id: "e", text: "Switch to Aurora for better query performance", correct: false },
    ],
    explanation: "Redshift distribution key skew is a silent killer — data piles up on one node while others idle. Use EVEN distribution for large fact tables with skewed keys, or choose a distribution key with high cardinality and uniform distribution.",
  },
  { id: 20, topic: "database", title: "ElastiCache hit rate dropped to 10%",
    symptoms: ["Application response time doubled in the past 2 days", "ElastiCache cluster is up and healthy", "RDS CPU jumped from 20% to 85% in the same timeframe"],
    logs: ["ElastiCache CloudWatch: CacheHitRate dropped from 85% to 10%", "Application deploy 2 days ago: changed cache key format from 'user:{id}' to '{id}:user'", "ElastiCache: millions of new keys created, old 'user:{id}' keys still consuming memory"],
    rootCause: "The cache key format changed in the new deploy. All existing cached items use the old key format and are never hit. Every request misses the cache, hammers RDS, and creates a new key in the new format — while old keys waste memory.",
    steps: [
      { id: "a", text: "Restart the ElastiCache cluster to clear all keys", correct: false },
      { id: "b", text: "Check CacheHitRate CloudWatch metric trend vs. deployment timeline", correct: true },
      { id: "c", text: "Identify the cache key format change in the deployment diff", correct: true },
      { id: "d", text: "Flush old keys with the old format or roll back the key format change", correct: true },
      { id: "e", text: "Upgrade to a larger ElastiCache node type", correct: false },
    ],
    explanation: "Cache key format changes are a common silent cache invalidation — old keys are never hit again but occupy memory until they expire. Always coordinate cache key changes with a cache flush, or use versioned key prefixes so both old and new keys are valid during rollout.",
  },

  // ── SECURITY (5) ──────────────────────────────────────────────────────────
  { id: 21, topic: "security", title: "S3 PUT requests failing with 403",
    symptoms: ["Application returns 403 Forbidden when uploading to S3", "Read (GET) requests work fine", "Only affects production — staging works"],
    logs: ["CloudTrail: s3:PutObject denied for role arn:aws:iam::123:role/prod-app-role", "IAM policy allows s3:GetObject and s3:PutObject on arn:aws:s3:::prod-bucket/*", "S3 bucket policy has explicit Deny for s3:PutObject except for 'backup-role'"],
    rootCause: "An explicit Deny in the S3 bucket policy overrides the IAM allow. The backup team restricted writes, accidentally denying the application role.",
    steps: [
      { id: "a", text: "Check IAM role policy for missing PutObject permission", correct: false },
      { id: "b", text: "Inspect S3 bucket policy for explicit Deny statements", correct: true },
      { id: "c", text: "Use IAM Policy Simulator to trace the deny decision", correct: true },
      { id: "d", text: "Re-create the IAM role", correct: false },
      { id: "e", text: "Update bucket policy to exclude the app role from the Deny", correct: true },
    ],
    explanation: "An explicit Deny in AWS always wins over any Allow — in IAM or a resource policy. Always check both layers. IAM Policy Simulator is the fastest tool to pinpoint exactly which policy is causing the denial.",
  },
  { id: 22, topic: "security", title: "GuardDuty finding — compromised credentials",
    symptoms: ["GuardDuty alert: API calls from unusual geography", "CloudTrail shows API calls from IP in Eastern Europe at 3 AM", "Developer on vacation — their IAM user was the source"],
    logs: ["GuardDuty: 'UnauthorizedAccess:IAMUser/TorIPCaller'", "CloudTrail: DescribeInstances, ListBuckets, GetSecretValue from eu-east IP", "IAM user: no MFA enabled, AdministratorAccess policy"],
    rootCause: "Developer's long-lived access keys were stolen (likely from a local machine or repo). No MFA and AdministratorAccess meant full account access with no friction.",
    steps: [
      { id: "a", text: "Email the developer to rotate their keys when they're back", correct: false },
      { id: "b", text: "Immediately disable the compromised IAM user", correct: true },
      { id: "c", text: "Review CloudTrail for all actions taken with the compromised credentials", correct: true },
      { id: "d", text: "Enforce MFA for all IAM users going forward", correct: true },
      { id: "e", text: "Enable S3 Block Public Access", correct: false },
    ],
    explanation: "Compromised credentials require immediate disablement — not rotation. Determine blast radius via CloudTrail. The systemic fix is enforcing MFA and least-privilege: AdministratorAccess on a developer account is an organizational risk.",
  },
  { id: 23, topic: "security", title: "WAF blocking legitimate traffic",
    symptoms: ["15% of API requests returning 403 from WAF", "Affected users all from corporate offices", "No attack traffic visible — WAF is blocking real users"],
    logs: ["WAF logs: requests blocked by 'AWSManagedRulesCommonRuleSet' — SizeRestrictions rule", "Blocked requests: all have large JSON payloads (avg 8 MB) from corporate app", "WAF rule: blocks request body > 8 KB (default)"],
    rootCause: "The corporate application sends large JSON payloads (8 MB) that exceed the WAF managed rule's default body size limit of 8 KB. The WAF is working correctly — it's the rule configuration that needs tuning.",
    steps: [
      { id: "a", text: "Disable WAF entirely to restore traffic", correct: false },
      { id: "b", text: "Check WAF logs for the specific rule triggering the block", correct: true },
      { id: "c", text: "Create a WAF rule exception for the corporate IP range or specific URI path", correct: true },
      { id: "d", text: "Override the SizeRestrictions rule to allow larger bodies for the specific endpoint", correct: true },
      { id: "e", text: "Switch from managed rules to custom rules only", correct: false },
    ],
    explanation: "WAF managed rules have fixed defaults that may not match every application. Always tune managed rules with exceptions for known-legitimate traffic patterns rather than disabling rules entirely — this maintains protection while allowing valid business traffic.",
  },
  { id: 24, topic: "security", title: "KMS key rotation breaking encryption",
    symptoms: ["Application can't decrypt data after KMS key rotation", "Error: 'InvalidKeyId — key not found'", "Data was encrypted 3 months ago; rotation happened last week"],
    logs: ["Application error: using hardcoded KMS key ARN from 3 months ago", "KMS: automatic key rotation enabled — new key material generated last week", "Data: encrypted with old key material, but KMS key ARN is unchanged"],
    rootCause: "The developer misunderstands how KMS key rotation works. KMS automatic rotation keeps the same key ID/ARN but rotates the underlying key material. Old ciphertexts are still decryptable — the bug is that the application is using a hardcoded ARN to a different, deleted CMK.",
    steps: [
      { id: "a", text: "Disable KMS automatic rotation to prevent further breakage", correct: false },
      { id: "b", text: "Check if the application is using the correct KMS key ARN", correct: true },
      { id: "c", text: "Verify the KMS key referenced in code matches the key that encrypted the data", correct: true },
      { id: "d", text: "Re-encrypt all data with the current key", correct: false },
      { id: "e", text: "Use KMS aliases instead of ARNs to decouple from specific key versions", correct: true },
    ],
    explanation: "KMS automatic rotation keeps the same key ID — old ciphertexts are always decryptable with the same key ARN. The real bug here is a hardcoded ARN pointing to a different deleted key. Use KMS aliases (e.g., alias/myapp-key) so your application references a stable name, not a specific key ARN.",
  },
  { id: 25, topic: "security", title: "Cross-account access not working",
    symptoms: ["Lambda in Account A cannot access DynamoDB in Account B", "Both accounts are in the same AWS Organization", "Developer says the IAM role in Account A has DynamoDB full access"],
    logs: ["Error: 'User arn:aws:sts::AccountA:assumed-role/lambda-role/func is not authorized to perform dynamodb:PutItem on resource in Account B'", "Account A Lambda execution role: has AmazonDynamoDBFullAccess policy", "DynamoDB in Account B: no resource-based policy, no cross-account role trust relationship"],
    rootCause: "Cross-account AWS resource access requires two things: (1) Account A's IAM role must trust Account B AND have permission to assume a role there, OR (2) Account B's resource must have a resource policy granting Account A access. Neither is configured.",
    steps: [
      { id: "a", text: "Add AmazonDynamoDBFullAccess to the Lambda role in Account A", correct: false },
      { id: "b", text: "Create a cross-account IAM role in Account B with DynamoDB permissions, trusted by Account A's Lambda role", correct: true },
      { id: "c", text: "Add sts:AssumeRole permission on Account A's Lambda role for the Account B role", correct: true },
      { id: "d", text: "Add a resource policy on the DynamoDB table in Account B granting Account A's role access", correct: true },
      { id: "e", text: "Move the DynamoDB table to Account A", correct: false },
    ],
    explanation: "Cross-account access in AWS requires explicit trust on both sides. The cleanest pattern is: Account B creates a role with the needed permissions and trusts Account A's Lambda role. Account A's Lambda assumes that role. DynamoDB resource policies can also grant cross-account access directly without role assumption.",
  },
];

// ─── TROUBLESHOOT GAME ─────────────────────────────────────────────────────────
function TroubleshootGame({ onComplete, casesOverride }) {
  const cases = casesOverride || TROUBLESHOOT_CASES;
  const [caseIdx, setCaseIdx] = useState(0);
  const [selectedSteps, setSelectedSteps] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showRoot, setShowRoot] = useState(false);

  const tc = cases[caseIdx];
  const correctSteps = tc.steps.filter(s => s.correct).map(s => s.id);
  const totalCorrect = correctSteps.length;

  const toggleStep = (id) => {
    if (submitted) return;
    setSelectedSteps(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const submit = () => {
    let hits = 0, falsePositives = 0;
    selectedSteps.forEach(id => {
      const step = tc.steps.find(s => s.id === id);
      if (step.correct) hits++;
      else falsePositives++;
    });
    const pts = Math.max(0, hits * 60 - falsePositives * 30);
    setScore(s => s + pts);
    setSubmitted(true);
  };

  const next = () => {
    if (caseIdx + 1 >= cases.length) {
      onComplete(score);
    } else {
      setCaseIdx(i => i + 1);
      setSelectedSteps(new Set());
      setSubmitted(false);
      setShowRoot(false);
    }
  };

  const correct = tc.steps.filter(s => s.correct);
  const wrong = tc.steps.filter(s => !s.correct);

  return (
    <div>
      {/* Progress */}
      <div style={{ display: "flex", gap: 5, marginBottom: 16 }}>
        {cases.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < caseIdx ? COLORS.green : i === caseIdx ? "#e11d48" : COLORS.border, transition: "background 0.4s" }} />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ color: "#e11d48", fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 2, marginBottom: 3 }}>CASE {caseIdx + 1} / {cases.length}</div>
          <h3 style={{ color: COLORS.text, margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 15 }}>🔧 {tc.title}</h3>
        </div>
        <Badge color={COLORS.green}>Score: {score}</Badge>
      </div>

      {/* Symptoms */}
      <div style={{ background: "rgba(225,29,72,0.06)", border: "1px solid rgba(225,29,72,0.25)", borderRadius: 10, padding: 16, marginBottom: 12 }}>
        <div style={{ color: "#e11d48", fontFamily: "monospace", fontSize: 10, letterSpacing: 2, marginBottom: 10 }}>🚨 SYMPTOMS</div>
        {tc.symptoms.map((s, i) => <div key={i} style={{ color: COLORS.text, fontFamily: "monospace", fontSize: 12, marginBottom: 4 }}>• {s}</div>)}
      </div>

      {/* Logs */}
      <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid #1e3a5a", borderRadius: 10, padding: 14, marginBottom: 16, fontFamily: "monospace" }}>
        <div style={{ color: "#475569", fontSize: 10, letterSpacing: 2, marginBottom: 10 }}>📋 LOG EVIDENCE</div>
        {tc.logs.map((l, i) => <div key={i} style={{ color: "#94a3b8", fontSize: 11, marginBottom: 5, lineHeight: 1.5 }}><span style={{ color: "#334155" }}>$</span> {l}</div>)}
      </div>

      {/* Step selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: "#64748b", fontFamily: "monospace", fontSize: 11, marginBottom: 10 }}>
          🛠 SELECT ALL CORRECT TROUBLESHOOTING STEPS (choose carefully — wrong steps lose points):
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tc.steps.map(step => {
            const isSel = selectedSteps.has(step.id);
            const isRight = submitted && step.correct;
            const isWrong = submitted && !step.correct && isSel;
            const isMissed = submitted && step.correct && !isSel;
            return (
              <div key={step.id} onClick={() => toggleStep(step.id)} style={{
                padding: "12px 16px", borderRadius: 8, cursor: submitted ? "default" : "pointer",
                border: `2px solid ${isRight && isSel ? COLORS.green : isMissed ? "#f59e0b" : isWrong ? COLORS.red : isSel ? COLORS.blue : COLORS.border}`,
                background: isRight && isSel ? `${COLORS.green}10` : isMissed ? "rgba(245,158,11,0.08)" : isWrong ? `${COLORS.red}10` : isSel ? `${COLORS.blue}12` : COLORS.bg,
                color: COLORS.text, fontFamily: "monospace", fontSize: 13, lineHeight: 1.5,
                transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                  border: `2px solid ${isSel ? COLORS.blue : COLORS.border}`,
                  background: isSel ? COLORS.blue : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isSel && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                </div>
                <span>{step.text}</span>
                {isRight && isSel && <span style={{ marginLeft: "auto", color: COLORS.green }}>✅</span>}
                {isWrong && <span style={{ marginLeft: "auto", color: COLORS.red }}>❌</span>}
                {isMissed && <span style={{ marginLeft: "auto", color: "#f59e0b" }}>⚠️ missed</span>}
              </div>
            );
          })}
        </div>
      </div>

      {!submitted && (
        <Btn onClick={submit} disabled={selectedSteps.size === 0} color="#e11d48">Submit Diagnosis</Btn>
      )}

      {submitted && (
        <div>
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <div style={{ color: COLORS.green, fontFamily: "monospace", fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>🔍 ROOT CAUSE</div>
            <p style={{ color: COLORS.text, margin: 0, fontFamily: "monospace", fontSize: 12, lineHeight: 1.6 }}>{tc.rootCause}</p>
          </div>
          <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ color: COLORS.blue, fontFamily: "monospace", fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>💡 KEY LESSON</div>
            <p style={{ color: COLORS.text, margin: 0, fontFamily: "monospace", fontSize: 12, lineHeight: 1.6 }}>{tc.explanation}</p>
          </div>
          <Btn onClick={next} color={COLORS.green}>{caseIdx + 1 >= cases.length ? "Complete Cases 🏆" : "Next Case →"}</Btn>
        </div>
      )}
    </div>
  );
}

// ─── TOPIC FILTERED GAME WRAPPERS ─────────────────────────────────────────────

function TopicMatchingGame({ topic, onComplete }) {
  const levels = topic === "all"
    ? MATCH_LEVELS
    : MATCH_LEVELS.filter(l => l.topics.includes(topic));
  return <MatchingGame onComplete={onComplete} levelsOverride={levels} />;
}

function TopicArchGame({ topic, onComplete }) {
  const scenarios = topic === "all"
    ? ARCH_SCENARIOS
    : ARCH_SCENARIOS.filter(s => s.topics.includes(topic));
  return <ArchitectureGame onComplete={onComplete} scenariosOverride={scenarios} />;
}

function TopicEscapeGame({ topic, onComplete }) {
  const rooms = topic === "all"
    ? ESCAPE_ROOMS
    : ESCAPE_ROOMS.filter(r => r.topic === topic);
  return <EscapeRoom onComplete={onComplete} roomsOverride={rooms} />;
}

function TopicTroubleshootGame({ topic, onComplete }) {
  const cases = topic === "all"
    ? TROUBLESHOOT_CASES
    : TROUBLESHOOT_CASES.filter(c => c.topic === topic);
  return <TroubleshootGame onComplete={onComplete} casesOverride={cases} />;
}

// ─── TOPIC HUB ────────────────────────────────────────────────────────────────

const TOPICS = [
  { id: "compute",    label: "Compute",    icon: "💻", color: "#FF9900",
    desc: "EC2, Lambda, ECS, Fargate, EKS, Auto Scaling",
    games: ["matching","architecture","escape","troubleshoot"] },
  { id: "storage",    label: "Storage",    icon: "📦", color: "#3b82f6",
    desc: "S3, EFS, Glacier, EBS, Storage Gateway",
    games: ["matching","architecture"] },
  { id: "networking", label: "Networking", icon: "🌐", color: "#8b5cf6",
    desc: "VPC, Route 53, CloudFront, ALB, Direct Connect",
    games: ["matching","architecture","escape","troubleshoot"] },
  { id: "database",   label: "Database",   icon: "🗄️", color: "#10b981",
    desc: "RDS, DynamoDB, Aurora, ElastiCache, Redshift",
    games: ["matching","architecture","escape"] },
  { id: "security",   label: "Security",   icon: "🔐", color: "#e11d48",
    desc: "IAM, WAF, Shield, GuardDuty, Cognito, Secrets Manager",
    games: ["matching","architecture","escape","troubleshoot"] },
];

const TOPIC_MODES = [
  { id: "matching",     label: "Match It",     icon: "🔗", color: COLORS.purple },
  { id: "architecture", label: "Build It",     icon: "🏗️", color: COLORS.blue },
  { id: "escape",       label: "Escape Room",  icon: "🚨", color: COLORS.red },
  { id: "troubleshoot", label: "Troubleshoot", icon: "🔧", color: "#e11d48" },
];

function TopicHub({ topic, allScores, onSelectGame, onBack }) {
  const t = TOPICS.find(t => t.id === topic);
  const availableModes = TOPIC_MODES.filter(m => t.games.includes(m.id));
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "24px 16px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button onClick={onBack} style={{ background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.muted, padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>← Hub</button>
          <span style={{ fontSize: 24 }}>{t.icon}</span>
          <div>
            <h2 style={{ margin: 0, color: t.color, fontFamily: "'Space Mono', monospace", fontSize: 18 }}>{t.label}</h2>
            <div style={{ color: COLORS.muted, fontFamily: "monospace", fontSize: 11, marginTop: 2 }}>{t.desc}</div>
          </div>
        </div>

        <div style={{ background: `${t.color}10`, border: `1px solid ${t.color}30`, borderRadius: 12, padding: "16px 20px", marginBottom: 28 }}>
          <div style={{ color: t.color, fontFamily: "monospace", fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>TOPIC PATH</div>
          <p style={{ color: COLORS.muted, margin: 0, fontSize: 13, fontFamily: "monospace", lineHeight: 1.6 }}>
            All games below are filtered to <span style={{ color: t.color }}>{t.label}</span> content only.
            Complete all modes to master this topic.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {availableModes.map(mode => {
            const scoreKey = `topic_${topic}_${mode.id}`;
            const played = allScores[scoreKey];
            return (
              <div key={mode.id} onClick={() => onSelectGame(mode.id)}
                style={{ background: COLORS.panel, border: `1px solid ${played ? mode.color + "60" : COLORS.border}`, borderRadius: 12, padding: "18px 20px", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 16, position: "relative", overflow: "hidden" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = mode.color; e.currentTarget.style.transform = "translateX(4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = played ? mode.color + "60" : COLORS.border; e.currentTarget.style.transform = "translateX(0)"; }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${mode.color}20`, border: `1px solid ${mode.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{mode.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: mode.color, fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: "bold", marginBottom: 3 }}>{mode.label}</div>
                  <div style={{ color: COLORS.muted, fontFamily: "monospace", fontSize: 11 }}>
                    {mode.id === "matching" && `${MATCH_LEVELS.filter(l => l.topics.includes(topic)).length} level(s) focused on ${t.label}`}
                    {mode.id === "architecture" && `${ARCH_SCENARIOS.filter(s => s.topics.includes(topic)).length} scenario(s) featuring ${t.label} services`}
                    {mode.id === "escape" && `${ESCAPE_ROOMS.filter(r => r.topic === topic).length} incident(s) in ${t.label}`}
                    {mode.id === "troubleshoot" && `${TROUBLESHOOT_CASES.filter(c => c.topic === topic).length} case(s) in ${t.label}`}
                  </div>
                </div>
                {played ? <Badge color={COLORS.green}>✓ {played} pts</Badge> : <div style={{ color: COLORS.border, fontSize: 18 }}>→</div>}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: mode.color, borderRadius: "12px 0 0 12px" }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── LEARN TAB: CURRICULUM & XP SYSTEM ───────────────────────────────────────

const FONT_LEARN = "'DM Sans', system-ui, sans-serif";
const FONT_CODE  = "'JetBrains Mono', monospace";

const LT = {  // Learn Tab tokens (prefixed to avoid collision with COLORS)
  bg:     "#07090f",
  card:   "#0e1520",
  raised: "#131c2e",
  border: "#1c2d47",
  indigo: "#6366f1",
  indigoL:"#818cf8",
  gold:   "#f59e0b",
  green:  "#22c55e",
  red:    "#ef4444",
  sky:    "#38bdf8",
  text:   "#e2e8f0",
  muted:  "#64748b",
  dim:    "#1a2a3a",
};

const LEVELS_XP = [
  { level:1,  title:"Cloud Curious",       minXP:0,    icon:"🌱" },
  { level:2,  title:"AWS Initiate",        minXP:100,  icon:"☁️" },
  { level:3,  title:"Builder",             minXP:300,  icon:"🔧" },
  { level:4,  title:"Cloud Practitioner",  minXP:600,  icon:"📋" },
  { level:5,  title:"Solutions Architect", minXP:1000, icon:"🏗️" },
  { level:6,  title:"DevOps Engineer",     minXP:1500, icon:"⚙️" },
  { level:7,  title:"Security Specialist", minXP:2200, icon:"🔐" },
  { level:8,  title:"Data Engineer",       minXP:3000, icon:"📊" },
  { level:9,  title:"Cloud Architect",     minXP:4000, icon:"🌐" },
  { level:10, title:"AWS Expert",          minXP:5500, icon:"⭐" },
];

function getLvl(xp) {
  let cur = LEVELS_XP[0], next = LEVELS_XP[1];
  for (let i = 0; i < LEVELS_XP.length; i++) {
    if (xp >= LEVELS_XP[i].minXP) { cur = LEVELS_XP[i]; next = LEVELS_XP[i+1]||null; }
  }
  const pct = next ? (xp - cur.minXP)/(next.minXP - cur.minXP) : 1;
  return { cur, next, pct };
}

const CURRICULUM = [
  {
    id:"cloud101", title:"Cloud Fundamentals", icon:"☁️", color:"#6366f1",
    description:"Zero to cloud — understand what AWS is and why it exists. Perfect starting point for absolute beginners.",
    units:[
      { id:"u_cf1", title:"What is Cloud Computing?", xp:50, lessons:[
        { id:"lc1", type:"concept", title:"Before the Cloud", visual:"🏭",
          content:"Before cloud computing, companies had to buy physical servers, store them in data centers, hire staff to manage them, and guess how much capacity they'd need years in advance.\n\nIf they guessed too low — the site went down. If they guessed too high — they wasted millions on idle hardware.\n\nThis was the reality for every company before 2006." },
        { id:"lc2", type:"concept", title:"The Cloud Changes Everything", visual:"⚡",
          content:"Cloud computing lets you rent computing power, storage, and services from a provider like AWS — paying only for what you use, scaling up or down in minutes.\n\nNo upfront hardware. No guessing. No data center staff.\n\n**AWS** (Amazon Web Services) launched in 2006 and is now the world's largest cloud provider, used by Netflix, NASA, Airbnb, and millions of others." },
        { id:"lc3", type:"quiz", title:"Quick Check",
          question:"What is the main advantage of cloud computing over on-premises servers?",
          options:["Faster processors","Pay only for what you use, scale on demand","Free storage forever","No internet connection required"],
          correct:1, explanation:"Cloud computing's core value is elasticity — scale resources up or down instantly, paying only for what you consume. No over-provisioning, no under-provisioning." },
        { id:"lc4", type:"concept", title:"Cloud Service Models", visual:"🏗️",
          content:"Cloud services come in three layers:\n\n**IaaS** (Infrastructure as a Service) — raw compute, storage, networking. You manage the OS and everything above. Example: EC2.\n\n**PaaS** (Platform as a Service) — the provider manages the runtime. You deploy code. Example: Elastic Beanstalk.\n\n**SaaS** (Software as a Service) — fully managed app. You just use it. Example: Gmail, Salesforce." },
        { id:"lc5", type:"fillblank", title:"Complete the Statement",
          before:"When you use Amazon EC2, you are using ", blank:"IaaS", after:" because you manage the operating system yourself.",
          options:["IaaS","PaaS","SaaS","FaaS"], correct:0,
          explanation:"EC2 gives you virtual machines — raw infrastructure. You install the OS, runtime, and app yourself. That's the definition of IaaS." },
      ]},
      { id:"u_cf2", title:"AWS Global Infrastructure", xp:60, lessons:[
        { id:"lc6", type:"concept", title:"Regions", visual:"🌍",
          content:"AWS operates in **Regions** — geographic areas around the world (US, Europe, Asia, etc.).\n\nEach Region is completely independent with its own power, cooling, and networking.\n\nWhen you deploy to us-east-1 (N. Virginia), your data stays in the US unless you explicitly move it. This matters for compliance." },
        { id:"lc7", type:"concept", title:"Availability Zones", visual:"🏢",
          content:"Each Region contains 2–6 **Availability Zones (AZs)** — isolated data centers within ~60 miles of each other.\n\nThey're close enough for low-latency replication but far enough apart that a fire, flood, or power outage in one AZ doesn't affect another.\n\n**Key rule**: Always deploy across 2+ AZs for high availability." },
        { id:"lc8", type:"quiz", title:"AZ Check",
          question:"Why should you deploy your app across multiple Availability Zones?",
          options:["It's cheaper","If one AZ has an outage, others continue serving traffic","AWS requires it","It makes deployments faster"],
          correct:1, explanation:"AZs are isolated from each other's failures. Deploying across 2+ AZs means one data center outage doesn't take down your entire app — the others pick up the traffic." },
        { id:"lc9", type:"concept", title:"Edge Locations", visual:"📡",
          content:"Beyond Regions and AZs, AWS has **400+ Edge Locations** in cities worldwide.\n\nEdge Locations are used by CloudFront (CDN) to cache your content close to users.\n\nInstead of a Tokyo user's request traveling to Virginia (200ms), it hits Tokyo's edge location (5ms). That's a 40x latency improvement." },
        { id:"lc10", type:"fillblank", title:"Complete the Statement",
          before:"AWS Edge Locations are used by ", blank:"CloudFront", after:" to cache content close to users and reduce latency.",
          options:["EC2","CloudFront","RDS","Lambda"], correct:1,
          explanation:"CloudFront is AWS's CDN. It caches copies of your content at 400+ edge locations worldwide so users get fast responses from nearby servers rather than your origin region." },
      ]},
    ],
  },
  {
    id:"compute_learn", title:"Compute", icon:"💻", color:"#FF9900",
    description:"EC2, Lambda, containers — how to run your code in the cloud at any scale.",
    units:[
      { id:"u_cm1", title:"Amazon EC2 Basics", xp:70, lessons:[
        { id:"cm1", type:"concept", title:"What is EC2?", visual:"💻",
          content:"**Amazon EC2** (Elastic Compute Cloud) gives you virtual machines in the cloud.\n\nYou pick a CPU/RAM combination called an **instance type**, choose an OS, and AWS provisions a server you control completely — SSH access, install anything, run anything.\n\nEC2 is billed per second. You start it, use it, stop it. No hardware to buy." },
        { id:"cm2", type:"concept", title:"Choosing an Instance Type", visual:"⚙️",
          content:"Instance types are grouped by workload:\n\n**t3** — General purpose, burstable. Good for dev/test and low-traffic apps.\n**m5** — Balanced CPU + RAM. Most production web apps.\n**c5** — Compute optimized. Video encoding, scientific computing.\n**r5** — Memory optimized. Databases, in-memory caches.\n**p3** — GPU instances. Machine learning training." },
        { id:"cm3", type:"quiz", title:"Right-Size the Instance",
          question:"You're training a neural network that requires parallel matrix operations across millions of parameters. Which EC2 family?",
          options:["t3 — General purpose","c5 — Compute optimized","p3 — GPU instances","r5 — Memory optimized"],
          correct:2, explanation:"ML training is massively parallelizable — GPUs do it orders of magnitude faster than CPUs. P-family instances have NVIDIA GPUs designed exactly for this workload." },
        { id:"cm4", type:"concept", title:"EC2 Pricing Models", visual:"💰",
          content:"Four ways to pay for EC2:\n\n**On-Demand** — Pay per second. Most expensive, most flexible. Good for unpredictable workloads.\n\n**Reserved** — 1 or 3 year commitment. Save up to 72%. Good for steady-state production.\n\n**Spot** — Bid on spare capacity. Save up to 90%. AWS can reclaim with 2-min notice. Perfect for fault-tolerant batch jobs.\n\n**Savings Plans** — Flexible commitment discount across instance families." },
        { id:"cm5", type:"fillblank", title:"Complete the Statement",
          before:"For a batch job that can handle interruptions, ", blank:"Spot", after:" instances offer up to 90% savings vs On-Demand.",
          options:["Reserved","On-Demand","Spot","Dedicated"], correct:2,
          explanation:"Spot instances use AWS's spare capacity at massive discounts. The tradeoff: AWS can reclaim them with 2 minutes notice. Fault-tolerant batch processing is the ideal use case." },
      ]},
      { id:"u_cm2", title:"Auto Scaling & Load Balancing", xp:80, lessons:[
        { id:"cm6", type:"concept", title:"Why One Server Isn't Enough", visual:"💥",
          content:"A single EC2 instance has three fatal problems:\n\n📈 **Traffic spikes** — One server has a ceiling. Black Friday kills it.\n🔥 **Single point of failure** — Power outage, disk failure, bad deploy = total downtime.\n🐛 **Deployments are risky** — One server means everyone sees the broken version immediately.\n\nThe cloud solves all three with Auto Scaling + Load Balancing." },
        { id:"cm7", type:"concept", title:"Auto Scaling Groups", visual:"📈",
          content:"An **Auto Scaling Group (ASG)** manages a fleet of EC2 instances automatically:\n\n- **Min**: Always keep at least N running\n- **Max**: Never exceed N instances  \n- **Desired**: Target count right now\n- **Policy**: Scale out when CPU > 70%, scale in when CPU < 30%\n\nAWS launches and terminates instances for you — zero manual work." },
        { id:"cm8", type:"concept", title:"Application Load Balancer", visual:"⚖️",
          content:"The **ALB** (Application Load Balancer) sits in front of your Auto Scaling Group and:\n\n✅ Distributes requests across all healthy instances\n✅ Performs health checks — if an instance fails, stops sending it traffic\n✅ Supports path-based routing (/api → service A, /web → service B)\n✅ Handles SSL termination\n\nUsers hit one DNS name. The ALB handles everything behind it." },
        { id:"cm9", type:"quiz", title:"HA Architecture",
          question:"Your ALB + ASG spans us-east-1a and us-east-1b. us-east-1a loses power. What happens to users?",
          options:["50% of users experience errors","ALB routes all traffic to us-east-1b automatically — zero downtime","The app goes offline","Users must refresh their browser"],
          correct:1, explanation:"This is exactly the value of multi-AZ deployment. ALB health checks detect the failed AZ within seconds and route 100% of traffic to the healthy AZ. Users experience no downtime." },
        { id:"cm10", type:"fillblank", title:"Complete the Statement",
          before:"An Application Load Balancer performs ", blank:"health checks", after:" on targets and automatically stops routing traffic to unhealthy instances.",
          options:["cost checks","health checks","speed tests","log checks"], correct:1,
          explanation:"ALB health checks regularly ping each target (e.g., GET /health). If a target fails N consecutive checks, the ALB stops sending it traffic — no manual intervention needed." },
      ]},
      { id:"u_cm3", title:"Serverless with Lambda", xp:90, lessons:[
        { id:"cm11", type:"concept", title:"What is Serverless?", visual:"⚡",
          content:"**Serverless** means you write functions, not servers.\n\nWith **AWS Lambda**:\n- You upload a function (Python, Node, Java, Go...)\n- AWS handles provisioning, scaling, patching, HA\n- It runs in response to events\n- You pay only for the milliseconds it actually runs\n\nIf no one uses your app at 3 AM, you pay $0. If 100,000 users hit it simultaneously, Lambda scales automatically." },
        { id:"cm12", type:"concept", title:"Lambda Triggers", visual:"🔄",
          content:"Lambda functions are triggered by **events** from other AWS services:\n\n📥 **API Gateway** → HTTP requests become Lambda invocations\n📦 **S3 Events** → File uploaded, call Lambda to process it\n📬 **SQS** → Messages in queue, Lambda processes them\n⏰ **EventBridge** → Scheduled rules (like a cron job)\n🔔 **SNS** → Notification published, fan out to Lambda\n\nLambda is the glue that connects AWS services together." },
        { id:"cm13", type:"quiz", title:"Pick the Pattern",
          question:"Users upload profile photos to S3. You need to auto-generate thumbnails. Best architecture?",
          options:["EC2 polling S3 every 5 seconds","S3 Event → Lambda that generates the thumbnail","Scheduled Lambda every hour","Manual admin task"],
          correct:1, explanation:"S3 Events trigger Lambda instantly on upload. Lambda scales to handle any upload volume simultaneously. No idle EC2, no polling delay — event-driven is the right pattern here." },
        { id:"cm14", type:"concept", title:"Cold Starts & Limits", visual:"🧊",
          content:"Lambda has key constraints to know:\n\n⏱ **Max duration**: 15 minutes per invocation\n💾 **Max memory**: 10 GB\n🥶 **Cold starts**: First run after idle = extra 100ms–2s while AWS initializes\n🔄 **Concurrency**: Runs 10,000 functions simultaneously by default\n\n**Fix cold starts**: Use **Provisioned Concurrency** to keep environments pre-initialized — critical for latency-sensitive APIs." },
        { id:"cm15", type:"fillblank", title:"Complete the Statement",
          before:"Lambda's maximum execution duration per invocation is ", blank:"15 minutes", after:", making it unsuitable for jobs that run longer than that.",
          options:["5 minutes","15 minutes","1 hour","unlimited"], correct:1,
          explanation:"Lambda has a hard 15-minute timeout. For longer jobs, use ECS/Fargate, AWS Batch, or break the work into smaller Lambda invocations orchestrated by Step Functions." },
      ]},
    ],
  },
  {
    id:"storage_learn", title:"Storage", icon:"📦", color:"#3b82f6",
    description:"S3, EBS, EFS — the right storage for every type of data.",
    units:[
      { id:"u_st1", title:"Amazon S3 Fundamentals", xp:70, lessons:[
        { id:"st1", type:"concept", title:"What is Object Storage?", visual:"🪣",
          content:"**Amazon S3** stores files as **objects** in **buckets**.\n\nUnlike a file system, S3 is a flat key-value store. There are no real folders — just keys that look like paths (photos/2024/vacation.jpg).\n\nWhat makes S3 remarkable:\n- **11 nines durability** (99.999999999%) — store 10M files, lose one every 10,000 years\n- Virtually unlimited storage capacity\n- Accessible from anywhere via HTTPS" },
        { id:"st2", type:"concept", title:"S3 Storage Classes", visual:"📊",
          content:"Different data has different access patterns. S3 has classes for each:\n\n**Standard** — Frequent access, millisecond retrieval. Most expensive.\n**Intelligent-Tiering** — Auto-moves data between tiers based on access patterns.\n**Standard-IA** — Infrequent access, instant retrieval, cheaper storage cost.\n**Glacier Instant** — Archive, millisecond retrieval.\n**Glacier Deep Archive** — Cheapest (pennies/TB). 12–48 hour retrieval." },
        { id:"st3", type:"quiz", title:"Pick the Right Class",
          question:"Compliance logs accessed twice a year, must be retrievable within minutes. Which class?",
          options:["S3 Standard","Glacier Deep Archive","Glacier Instant Retrieval","Standard-IA"],
          correct:3, explanation:"Standard-IA is cheaper than Standard for storage but retrieves instantly. Deep Archive is cheapest but takes 12+ hours — too slow for an audit that needs files 'within minutes'." },
        { id:"st4", type:"concept", title:"S3 Key Features", visual:"🔧",
          content:"S3 goes way beyond file storage:\n\n🔒 **Versioning** — Keep every version of every object. Recover from accidental deletes.\n♻️ **Lifecycle Policies** — Auto-transition to cheaper classes or expire objects.\n🌍 **Cross-Region Replication** — Copy objects to another region for DR.\n⚡ **Static Website Hosting** — Serve HTML/CSS/JS directly from a bucket.\n🔐 **Encryption at rest** — Every object encrypted by default with AWS KMS." },
        { id:"st5", type:"fillblank", title:"Complete the Statement",
          before:"To protect against accidental file deletion in S3, enable ", blank:"Versioning", after:" — deleted objects become delete markers and previous versions remain recoverable.",
          options:["Encryption","Replication","Versioning","MFA Delete"], correct:2,
          explanation:"S3 Versioning retains all versions of every object. A 'delete' just adds a delete marker — the actual data still exists as a previous version and can be fully restored." },
      ]},
      { id:"u_st2", title:"Block & File Storage", xp:75, lessons:[
        { id:"st6", type:"concept", title:"Amazon EBS — Block Storage", visual:"💾",
          content:"**EBS (Elastic Block Store)** is a network-attached disk for EC2 — like a hard drive in the cloud.\n\nKey facts:\n- Attached to a **single EC2 instance** at a time (usually)\n- Persists independently — survives instance reboots and terminations\n- Performance types: **gp3** (general purpose), **io2** (high IOPS for databases)\n- **Snapshots** back up your volume to S3" },
        { id:"st7", type:"concept", title:"gp2 vs gp3 — The Burst Trap", visual:"⚠️",
          content:"**gp2** volumes use burst credits:\n- Baseline: 3 IOPS per GB\n- Burst: Up to 3,000 IOPS from a credit bucket\n- Problem: Sustained workloads drain the bucket and performance collapses silently\n\n**gp3** is better in every way:\n- Consistent 3,000 IOPS baseline (no burst bucket)\n- Provision up to 16,000 IOPS independently of size\n- 20% cheaper than gp2\n\n**Always use gp3 for new volumes.**" },
        { id:"st8", type:"quiz", title:"Storage Scenario",
          question:"Your database EC2 instance randomly slows down for ~4 minutes each morning. CloudWatch shows VolumeQueueLength spikes. What's likely wrong?",
          options:["EC2 instance is too small","gp2 burst credits exhausted — throttling to baseline 300 IOPS","Database has too many queries","Network connectivity issue"],
          correct:1, explanation:"Classic gp2 burst exhaustion pattern. A morning batch job drains the burst bucket overnight. Fix: migrate to gp3 with provisioned IOPS — consistent performance, no burst credits." },
        { id:"st9", type:"concept", title:"Amazon EFS — Shared File Storage", visual:"📁",
          content:"**EFS (Elastic File System)** is a managed NFS file system that multiple EC2 instances can mount simultaneously.\n\nUse EFS when:\n- Multiple instances need to read/write the same files\n- You need a shared /home directory or shared content\n- You want storage that scales automatically without provisioning\n\nUnlike EBS (1 instance), EFS can be mounted by thousands of instances across multiple AZs." },
        { id:"st10", type:"fillblank", title:"Complete the Statement",
          before:"Unlike EBS which attaches to one instance, ", blank:"EFS", after:" can be mounted simultaneously by thousands of EC2 instances across multiple AZs.",
          options:["S3","EBS","EFS","FSx"], correct:2,
          explanation:"EFS is a managed NFS (Network File System). It's the right choice when multiple instances need shared access to the same files. EBS is attached to one instance at a time." },
      ]},
    ],
  },
  {
    id:"networking_learn", title:"Networking", icon:"🌐", color:"#8b5cf6",
    description:"VPCs, subnets, load balancers, DNS — connecting everything securely.",
    units:[
      { id:"u_nw1", title:"VPC Fundamentals", xp:80, lessons:[
        { id:"nw1", type:"concept", title:"Your Private Cloud Network", visual:"🏘️",
          content:"A **VPC (Virtual Private Cloud)** is your own private network inside AWS.\n\nThink of AWS as a massive city. A VPC is your private gated community inside it.\n\nYou control:\n- **Address space** (CIDR block, e.g. 10.0.0.0/16 = 65,536 addresses)\n- **Subnets** — subdivisions of your address space\n- **Route tables** — which traffic goes where\n- **Firewalls** — what's allowed in and out" },
        { id:"nw2", type:"concept", title:"Public vs Private Subnets", visual:"🔓🔒",
          content:"**Public subnet** — has a route to the Internet Gateway. Resources get public IPs and are reachable from the internet. Use for: load balancers, NAT gateways, bastion hosts.\n\n**Private subnet** — no direct internet route. Isolated from outside world. Use for: EC2 app servers, databases, anything that shouldn't be publicly accessible.\n\nPrivate resources can still access the internet *outbound* through a NAT Gateway in the public subnet." },
        { id:"nw3", type:"quiz", title:"Where Should It Live?",
          question:"You're deploying a PostgreSQL database. Which subnet?",
          options:["Public — so users can query it directly","Private — databases must never be directly internet-accessible","Either is fine","Databases don't need subnets"],
          correct:1, explanation:"Databases always go in private subnets. They should only be reachable from your app tier, never from the public internet. This is foundational cloud security architecture." },
        { id:"nw4", type:"concept", title:"Security Groups vs NACLs", visual:"🛡️",
          content:"Two layers of network security:\n\n**Security Groups** — Virtual firewall for individual resources (EC2, RDS, Lambda). *Stateful*: allow inbound, return traffic is automatically allowed.\n\n**Network ACLs** — Subnet-level firewall. *Stateless*: must explicitly allow both inbound AND outbound for each rule. Applied to all resources in the subnet.\n\nSecurity Groups are your primary control. NACLs add a second line of defense at the subnet boundary." },
        { id:"nw5", type:"fillblank", title:"Complete the Statement",
          before:"Security groups are ", blank:"stateful", after:" — if you allow an inbound connection, the response traffic is automatically permitted without an explicit outbound rule.",
          options:["stateless","stateful","persistent","dynamic"], correct:1,
          explanation:"Stateful firewalls track connection state. Once an inbound connection is permitted, the OS/firewall remembers the session and automatically allows the response. NACLs are stateless — you must add rules for both directions." },
      ]},
      { id:"u_nw2", title:"Load Balancing & DNS", xp:85, lessons:[
        { id:"nw6", type:"concept", title:"Types of Load Balancers", visual:"⚖️",
          content:"AWS has three load balancers for different needs:\n\n**ALB** (Application LB) — Layer 7, understands HTTP. Routes by path (/api vs /web), headers, or hostname. Best for web apps and microservices.\n\n**NLB** (Network LB) — Layer 4, ultra-low latency, static IPs. Best for TCP/UDP at extreme throughput.\n\n**GLB** (Gateway LB) — Deploys third-party network appliances (firewalls, IDS). Transparent traffic inspection." },
        { id:"nw7", type:"concept", title:"Route 53 Routing Policies", visual:"🧭",
          content:"Route 53 is AWS's DNS + traffic management service. It goes beyond basic DNS:\n\n**Simple** — One record, one target. Basic DNS.\n**Weighted** — Split traffic: 80% to v2, 20% to v1. Great for canary deployments.\n**Latency** — Route users to the region with lowest latency automatically.\n**Failover** — Active/passive. If primary fails health check, Route 53 switches to standby.\n**Geolocation** — Route EU users to EU region, US users to US region." },
        { id:"nw8", type:"quiz", title:"Route 53 Scenario",
          question:"You want to gradually migrate users from your old API (v1) to new API (v2) — start with 10% of traffic to v2, increase weekly. Which routing policy?",
          options:["Simple routing","Failover routing","Weighted routing","Latency routing"],
          correct:2, explanation:"Weighted routing lets you assign percentages of traffic to different targets. Start at 10% v2, monitor, increase to 25%, then 50%, then 100%. This is the classic canary/blue-green deployment pattern." },
        { id:"nw9", type:"concept", title:"NAT Gateway", visual:"🔄",
          content:"Private subnet instances can't reach the internet directly — but they need to for things like:\n- Downloading OS updates\n- Calling external APIs\n- Pulling Docker images\n\nA **NAT Gateway** in the public subnet gives private instances outbound-only internet access.\n\nTraffic flow: Private EC2 → NAT Gateway → Internet Gateway → Internet\n\n⚠️ Common cost trap: NAT Gateway charges per GB processed. Use VPC Endpoints for S3/ECR traffic to eliminate NAT costs." },
        { id:"nw10", type:"fillblank", title:"Complete the Statement",
          before:"Private subnet instances reach the internet outbound through a ", blank:"NAT Gateway", after:", which must be placed in a public subnet with an Elastic IP.",
          options:["Internet Gateway","NAT Gateway","VPC Endpoint","Direct Connect"], correct:1,
          explanation:"NAT Gateway translates private IP addresses to its public Elastic IP for outbound traffic. The Internet Gateway then routes it to the internet. Private instances are never directly exposed — only the NAT Gateway's Elastic IP is visible." },
      ]},
    ],
  },
  {
    id:"database_learn", title:"Database", icon:"🗄️", color:"#10b981",
    description:"RDS, DynamoDB, Aurora — choosing and using the right database.",
    units:[
      { id:"u_db1", title:"Relational Databases — RDS", xp:80, lessons:[
        { id:"db1", type:"concept", title:"Why Managed Databases?", visual:"🔧",
          content:"Running your own database server means managing:\n- OS patching and security updates\n- Database engine upgrades\n- Backup scheduling and testing\n- Replication configuration\n- Failover setup\n- Storage management\n\n**Amazon RDS** handles all of that for you. You focus on your schema and queries. AWS handles everything below." },
        { id:"db2", type:"concept", title:"RDS Multi-AZ", visual:"🏢",
          content:"**RDS Multi-AZ** keeps a **synchronous standby replica** in a different AZ.\n\nHow it works:\n1. Every write to primary is synchronously replicated to standby\n2. If primary fails (hardware, software, network), AWS detects it\n3. DNS automatically points to the standby in ~60 seconds\n4. No data loss (synchronous = writes confirmed on both before acknowledged)\n\nThis is for **High Availability**, not read scaling." },
        { id:"db3", type:"quiz", title:"Multi-AZ vs Read Replica",
          question:"Your RDS instance handles heavy read traffic from reporting queries. You need to reduce load on the primary. What do you add?",
          options:["Multi-AZ deployment","Read Replica","Larger instance size","More storage"],
          correct:1, explanation:"Read Replicas handle read traffic by maintaining async copies of the primary. Direct your reporting queries to the replica — primary handles only writes. Multi-AZ is for HA/failover, not read scaling." },
        { id:"db4", type:"concept", title:"RDS Proxy", visual:"🔄",
          content:"**RDS Proxy** sits between your application and RDS database, pooling and sharing database connections.\n\nWhy you need it with Lambda:\n- Each Lambda invocation opens its own DB connection\n- 10,000 concurrent Lambda = 10,000 connections to RDS\n- RDS has connection limits (e.g., 100 for db.t3.micro)\n- Result: connection exhaustion, timeouts, outages\n\nRDS Proxy maintains a warm pool and multiplexes thousands of Lambda requests through a small number of real DB connections." },
        { id:"db5", type:"fillblank", title:"Complete the Statement",
          before:"RDS Multi-AZ provides automatic ", blank:"failover", after:" to a standby replica in another AZ, typically completing in under 60 seconds.",
          options:["scaling","failover","backup","replication"], correct:1,
          explanation:"Multi-AZ failover is automatic — when RDS detects primary failure, it promotes the standby and updates the DNS endpoint. Your app reconnects to the same endpoint and is back online in ~60 seconds." },
      ]},
      { id:"u_db2", title:"NoSQL — DynamoDB", xp:85, lessons:[
        { id:"db6", type:"concept", title:"When to Use DynamoDB", visual:"⚡",
          content:"**DynamoDB** is AWS's serverless NoSQL database.\n\nChoose DynamoDB when you need:\n- Single-digit millisecond latency at any scale\n- Automatic scaling from 0 to millions of requests/second\n- No schema management overhead\n- Simple access patterns (get by ID, query by key)\n\nDon't use DynamoDB when you need complex joins, ad-hoc queries, or strong relational consistency." },
        { id:"db7", type:"concept", title:"Partition Keys & Sort Keys", visual:"🔑",
          content:"DynamoDB tables have:\n\n**Partition Key** — Required. Determines which physical partition stores the item. Must be high-cardinality for even data distribution.\n\n**Sort Key** — Optional. Enables range queries within a partition.\n\nExample — User messages table:\n- Partition key: user_id\n- Sort key: timestamp\n- Queries: 'get all messages for user_123 between dates X and Y'\n\nYour data model must match your access patterns." },
        { id:"db8", type:"quiz", title:"DynamoDB Design",
          question:"Your DynamoDB table's partition key is 'country' (only 5 values: US, UK, CA, AU, DE). You're seeing throttling on the US partition only. Root cause?",
          options:["Table needs more RCU/WCU","Hot partition — low-cardinality key concentrates traffic","DynamoDB is down","US data is corrupt"],
          correct:1, explanation:"Low-cardinality partition keys create hot partitions. 80%+ of traffic goes to 'US' while other partitions sit idle. Fix: use a higher-cardinality key (user_id, order_id) to distribute load evenly across partitions." },
        { id:"db9", type:"concept", title:"DynamoDB GSI & DAX", visual:"🚀",
          content:"**Global Secondary Index (GSI)** — Query on non-primary-key attributes. Like adding a second access pattern.\n\nExample: Main table by user_id. GSI on email — look up user by email address.\n\n**DynamoDB Accelerator (DAX)** — In-memory cache in front of DynamoDB. Reduces read latency from milliseconds to **microseconds**. Fully managed, API-compatible — your app doesn't know it's hitting a cache." },
        { id:"db10", type:"fillblank", title:"Complete the Statement",
          before:"DynamoDB DAX reduces read latency from milliseconds to ", blank:"microseconds", after:" by providing an in-memory cache that sits transparently in front of DynamoDB.",
          options:["nanoseconds","microseconds","seconds","milliseconds"], correct:1,
          explanation:"DAX (DynamoDB Accelerator) is a fully managed in-memory cache. Reads that hit DAX return in microseconds (~400x faster than going to DynamoDB). It's API-compatible — no code changes needed." },
      ]},
    ],
  },
  {
    id:"security_learn", title:"Security", icon:"🔐", color:"#e11d48",
    description:"IAM, KMS, WAF, GuardDuty — securing everything you build from day one.",
    units:[
      { id:"u_sc1", title:"IAM — Identity & Access", xp:90, lessons:[
        { id:"sc1", type:"concept", title:"The Principle of Least Privilege", visual:"🔑",
          content:"The single most important security principle in AWS:\n\n**Grant only the permissions needed for the task — nothing more.**\n\nIf a Lambda reads from one S3 bucket, give it exactly s3:GetObject on that one bucket. Not S3FullAccess. Not AdministratorAccess.\n\nEvery extra permission is an attack surface. When credentials are compromised, least privilege limits the blast radius." },
        { id:"sc2", type:"concept", title:"Users, Roles, and Policies", visual:"👤",
          content:"**IAM Users** — Human identities with long-lived credentials. Use for people who need console access.\n\n**IAM Roles** — Temporary credentials assumed by services or federated users. **Use roles for all AWS services** — EC2, Lambda, ECS. Never hardcode access keys in code.\n\n**IAM Policies** — JSON documents defining allowed/denied actions. Attached to users, roles, or resources.\n\n🚨 **Root account**: Only for billing. Enable MFA. Never use for daily tasks." },
        { id:"sc3", type:"quiz", title:"Credential Best Practice",
          question:"Your EC2 app needs to write to S3. How do you grant access?",
          options:["Create IAM user, put access key in environment variables","Attach an IAM Role to the EC2 instance with specific S3 write permissions","Make the S3 bucket public","Use root account credentials"],
          correct:1, explanation:"IAM Roles attached to EC2 provide auto-rotating temporary credentials via the instance metadata service. No hardcoded keys, no manual rotation, no accidental exposure in code repos." },
        { id:"sc4", type:"concept", title:"How IAM Evaluates Requests", visual:"⚖️",
          content:"AWS evaluates permissions in this strict order:\n\n1. **Explicit Deny** anywhere → DENIED. Full stop. No exceptions.\n2. **Explicit Allow** and no Deny → ALLOWED.\n3. **No statement** → DENIED (implicit deny).\n\n🚨 **The gotcha everyone hits**: An explicit Deny in an S3 bucket policy OVERRIDES an IAM Allow — even if the IAM policy is AdministratorAccess.\n\nAlways check both IAM policies AND resource policies (bucket policies, KMS key policies) when diagnosing access denied errors." },
        { id:"sc5", type:"fillblank", title:"Complete the Statement",
          before:"In IAM evaluation, an explicit ", blank:"Deny", after:" always wins over any Allow — even AdministratorAccess cannot override it.",
          options:["Allow","Reject","Deny","Block"], correct:2,
          explanation:"This is the most misunderstood IAM rule. Explicit Deny is final — it cannot be overridden by any Allow policy. This is why bucket policies with Deny statements catch people off guard even when their IAM policy allows the action." },
      ]},
      { id:"u_sc2", title:"Encryption & Threat Detection", xp:95, lessons:[
        { id:"sc6", type:"concept", title:"AWS KMS", visual:"🔐",
          content:"**AWS KMS** (Key Management Service) is AWS's managed encryption key service.\n\n**CMK** (Customer Master Key) — Your master key. Never leaves KMS. You use it to encrypt/decrypt data keys.\n\n**Data Key** — Generated by KMS, encrypted under your CMK. Used to encrypt your actual data.\n\n**Envelope Encryption**: Encrypt data with data key → encrypt data key with CMK. This pattern scales because KMS never sees your data — only the small data key." },
        { id:"sc7", type:"concept", title:"Secrets Manager vs Parameter Store", visual:"🗝️",
          content:"**Secrets Manager** — For sensitive credentials that need rotation:\n- Automatic rotation for RDS, Redshift, DocumentDB passwords\n- Built-in rotation Lambda functions\n- Costs ~$0.40/secret/month\n\n**Parameter Store** — For configuration and non-critical secrets:\n- Free tier for standard parameters\n- Integration with Systems Manager\n- No automatic rotation\n\nRule: DB passwords and API keys → Secrets Manager. App config → Parameter Store." },
        { id:"sc8", type:"quiz", title:"Security Service Match",
          question:"Your EC2 instances are communicating with known cryptocurrency mining pools at 3 AM. Which service detects this?",
          options:["AWS Config","Amazon Inspector","Amazon GuardDuty","AWS CloudTrail"],
          correct:2, explanation:"GuardDuty analyzes VPC Flow Logs, DNS logs, and CloudTrail to detect threats using ML. It specifically has a finding type for cryptocurrency mining (CryptoCurrency:EC2/BitcoinTool) that catches exactly this pattern." },
        { id:"sc9", type:"concept", title:"Security Services Overview", visual:"🛡️",
          content:"Core AWS security services:\n\n**GuardDuty** — Threat detection, ML-based. Analyzes Flow Logs, DNS, CloudTrail.\n**Security Hub** — Aggregates findings from GuardDuty, Inspector, Macie into one dashboard.\n**Inspector** — Vulnerability scanning for EC2 and container images.\n**CloudTrail** — Log every API call in your account. Your forensic record.\n**Config** — Track configuration changes and compliance over time.\n**Macie** — Find sensitive data (PII, credit cards) in S3 buckets." },
        { id:"sc10", type:"fillblank", title:"Complete the Statement",
          before:"AWS ", blank:"CloudTrail", after:" logs every API call made in your account — who did what, when, from where — making it your primary forensic tool after a security incident.",
          options:["Config","GuardDuty","CloudTrail","Inspector"], correct:2,
          explanation:"CloudTrail is the audit log of your AWS account. Every console click, CLI command, and SDK call creates a CloudTrail event. It's indispensable for incident response, compliance, and debugging permission issues." },
      ]},
    ],
  },
];

// ─── LEARN TAB UI COMPONENTS ──────────────────────────────────────────────────

function LXPBar({ cur, max, color, height=6, label }) {
  return (
    <div>
      {label && <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ color:LT.muted, fontSize:10, fontFamily:FONT_CODE }}>{label}</span>
        <span style={{ color, fontSize:10, fontFamily:FONT_CODE }}>{cur}/{max}</span>
      </div>}
      <div style={{ background:LT.dim, borderRadius:99, height, overflow:"hidden" }}>
        <div style={{ width:`${Math.min(100,(cur/max)*100)}%`, height:"100%", background:color, borderRadius:99, transition:"width 0.6s cubic-bezier(0.34,1.56,0.64,1)", boxShadow:`0 0 8px ${color}60` }} />
      </div>
    </div>
  );
}

function LBtn({ children, onClick, color=LT.indigo, disabled, full, size="md" }) {
  const p = size==="sm"?"7px 14px":size==="lg"?"13px 26px":"10px 20px";
  const fs = size==="sm"?11:size==="lg"?15:13;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? LT.dim : color,
      border:"none", color: disabled ? LT.muted : "#fff",
      padding:p, borderRadius:10, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily:FONT_LEARN, fontSize:fs, fontWeight:700,
      width: full ? "100%" : "auto",
      transition:"all 0.15s", boxShadow: disabled ? "none" : `0 4px 14px ${color}50`,
    }} onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.filter="brightness(1.1)"; }}
       onMouseLeave={e=>{ e.currentTarget.style.filter="brightness(1)"; }}
    >{children}</button>
  );
}

// ─── LESSON SCREENS ───────────────────────────────────────────────────────────

function LearnConceptCard({ lesson, onNext }) {
  const fmt = t => t.replace(/\*\*(.*?)\*\*/g, (_,m) => `<span style="color:${LT.indigoL};font-weight:700">${m}</span>`);
  return (
    <div style={{ display:"flex", flexDirection:"column", flex:1 }}>
      <div style={{ textAlign:"center", padding:"24px 0 16px", fontSize:60 }}>{lesson.visual}</div>
      <div style={{ flex:1, overflow:"auto" }}>
        {lesson.content.split('\n').filter(Boolean).map((line,i) => (
          <p key={i} style={{ color: line.startsWith('**') ? LT.text : LT.muted, fontSize:14, lineHeight:1.8, margin:"0 0 10px", fontFamily:FONT_LEARN }}
             dangerouslySetInnerHTML={{ __html:fmt(line) }} />
        ))}
      </div>
      <LBtn onClick={onNext} full size="lg" color={LT.indigo}>Got it →</LBtn>
    </div>
  );
}

function LearnQuizCard({ lesson, onNext, onXP }) {
  const [chosen, setChosen] = useState(null);
  const pick = i => { if(chosen!==null) return; setChosen(i); if(i===lesson.correct) onXP(15); };
  return (
    <div style={{ display:"flex", flexDirection:"column", flex:1, gap:12 }}>
      <div style={{ background:LT.raised, borderRadius:12, padding:"16px", border:`1px solid ${LT.border}` }}>
        <div style={{ color:LT.indigoL, fontFamily:FONT_CODE, fontSize:9, letterSpacing:2, marginBottom:8 }}>QUESTION</div>
        <p style={{ color:LT.text, fontSize:14, lineHeight:1.6, margin:0, fontFamily:FONT_LEARN }}>{lesson.question}</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1 }}>
        {lesson.options.map((opt,i) => {
          const isC = i===lesson.correct, isCh = i===chosen;
          let bg=LT.raised, border=LT.border, col=LT.text;
          if(chosen!==null){ if(isC){bg=`${LT.green}15`;border=LT.green;col=LT.green;} else if(isCh){bg=`${LT.red}15`;border=LT.red;col=LT.red;} }
          return (
            <div key={i} onClick={()=>pick(i)} style={{ padding:"12px 14px", borderRadius:10, border:`2px solid ${border}`, background:bg, color:col, cursor:chosen!==null?"default":"pointer", fontFamily:FONT_LEARN, fontSize:13, transition:"all 0.15s", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:24, height:24, borderRadius:"50%", background: chosen!==null&&isC?LT.green:chosen!==null&&isCh?LT.red:LT.dim, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color: chosen!==null?"#fff":LT.muted, flexShrink:0 }}>
                {chosen!==null&&isC?"✓":chosen!==null&&isCh?"✗":String.fromCharCode(65+i)}
              </div>
              {opt}
            </div>
          );
        })}
      </div>
      {chosen!==null && <>
        <div style={{ background:`${chosen===lesson.correct?LT.green:LT.red}12`, border:`1px solid ${chosen===lesson.correct?LT.green:LT.red}40`, borderRadius:10, padding:"10px 14px" }}>
          <p style={{ color:LT.text, fontSize:12, margin:0, fontFamily:FONT_LEARN, lineHeight:1.5 }}>{lesson.explanation}</p>
        </div>
        <LBtn onClick={onNext} full color={chosen===lesson.correct?LT.green:LT.indigo}>Continue →</LBtn>
      </>}
    </div>
  );
}

function LearnFillCard({ lesson, onNext, onXP }) {
  const [chosen, setChosen] = useState(null);
  const pick = i => { if(chosen!==null) return; setChosen(i); if(i===lesson.correct) onXP(15); };
  return (
    <div style={{ display:"flex", flexDirection:"column", flex:1, gap:12 }}>
      <div style={{ color:LT.muted, fontFamily:FONT_CODE, fontSize:9, letterSpacing:2 }}>FILL IN THE BLANK</div>
      <div style={{ background:LT.raised, borderRadius:12, padding:"16px", border:`1px solid ${LT.border}` }}>
        <p style={{ color:LT.text, fontSize:14, lineHeight:1.8, margin:0, fontFamily:FONT_LEARN }}>
          {lesson.before}
          <span style={{ display:"inline-block", minWidth:100, padding:"1px 10px", background: chosen===null?LT.dim:chosen===lesson.correct?`${LT.green}20`:`${LT.red}20`, borderRadius:6, border:`2px solid ${chosen===null?LT.indigo:chosen===lesson.correct?LT.green:LT.red}`, color: chosen===null?LT.indigoL:chosen===lesson.correct?LT.green:LT.red, fontFamily:FONT_CODE, fontSize:13, fontWeight:700, textAlign:"center", margin:"0 3px", verticalAlign:"middle" }}>
            {chosen===null?"______":lesson.options[chosen]}
          </span>
          {lesson.after}
        </p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {lesson.options.map((opt,i) => {
          const isC=i===lesson.correct, isCh=i===chosen;
          let bg=LT.raised, border=LT.border, col=LT.text;
          if(chosen!==null){ if(isC){bg=`${LT.green}15`;border=LT.green;col=LT.green;} else if(isCh){bg=`${LT.red}15`;border=LT.red;col=LT.red;} }
          return <div key={i} onClick={()=>pick(i)} style={{ padding:"10px 12px", borderRadius:10, border:`2px solid ${border}`, background:bg, color:col, cursor:chosen!==null?"default":"pointer", fontFamily:FONT_CODE, fontSize:12, fontWeight:700, textAlign:"center", transition:"all 0.15s" }}>{opt}</div>;
        })}
      </div>
      {chosen!==null && <>
        <div style={{ background:`${chosen===lesson.correct?LT.green:LT.red}12`, border:`1px solid ${chosen===lesson.correct?LT.green:LT.red}40`, borderRadius:10, padding:"10px 14px" }}>
          <p style={{ color:LT.text, fontSize:12, margin:0, fontFamily:FONT_LEARN, lineHeight:1.5 }}>{lesson.explanation}</p>
        </div>
        <LBtn onClick={onNext} full color={chosen===lesson.correct?LT.green:LT.indigo}>Continue →</LBtn>
      </>}
    </div>
  );
}

// ─── AI TUTOR MODAL ───────────────────────────────────────────────────────────

function LearnAITutor({ context, onClose }) {
  const [msgs, setMsgs] = useState([{ role:"assistant", content:`Hi! I'm your AWS tutor. You're studying **${context}**. Ask me anything — no question is too basic! 🎓` }]);
  const [inp, setInp] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const send = async () => {
    if(!inp.trim()||busy) return;
    const q = inp.trim(); setInp(""); setBusy(true);
    setMsgs(m=>[...m,{ role:"user", content:q }]);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:800,
          system:`You are an expert, encouraging AWS learning tutor in a gamified app called CloudPath. The student is studying: "${context}". Keep answers concise (2-3 short paragraphs max), use **bold** for key terms, give real-world analogies. Be warm and encouraging.`,
          messages:[...msgs.filter(m=>m.role!=="system"), { role:"user", content:q }],
        }),
      });
      const d = await res.json();
      const reply = d.content?.map(b=>b.text||"").join("")||"Try again!";
      setMsgs(m=>[...m,{ role:"assistant", content:reply }]);
    } catch { setMsgs(m=>[...m,{ role:"assistant", content:"Connection error — try again." }]); }
    setBusy(false);
  };

  const fmt = t => t.replace(/\*\*(.*?)\*\*/g, (_,m)=>`<strong style="color:${LT.indigoL}">${m}</strong>`);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:2000, display:"flex", alignItems:"flex-end", backdropFilter:"blur(4px)" }}>
      <div style={{ width:"100%", maxWidth:520, margin:"0 auto", height:"68vh", background:LT.card, borderRadius:"20px 20px 0 0", border:`1px solid ${LT.border}`, borderBottom:"none", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"14px 18px", borderBottom:`1px solid ${LT.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:`${LT.indigo}20`, border:`1px solid ${LT.indigo}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🤖</div>
            <div>
              <div style={{ color:LT.text, fontFamily:FONT_LEARN, fontWeight:700, fontSize:13 }}>AI Tutor</div>
              <div style={{ color:LT.muted, fontFamily:FONT_CODE, fontSize:9 }}>Powered by Claude</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:LT.dim, border:"none", color:LT.muted, borderRadius:"50%", width:28, height:28, cursor:"pointer", fontSize:14 }}>×</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"14px 18px", display:"flex", flexDirection:"column", gap:10 }}>
          {msgs.map((m,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
              <div style={{ maxWidth:"85%", padding:"9px 13px", borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px", background:m.role==="user"?LT.indigo:LT.raised, border:m.role==="user"?"none":`1px solid ${LT.border}`, color:LT.text, fontSize:13, fontFamily:FONT_LEARN, lineHeight:1.6 }} dangerouslySetInnerHTML={{ __html:fmt(m.content) }} />
            </div>
          ))}
          {busy && <div style={{ display:"flex", gap:4, padding:"8px 12px" }}>{[0,1,2].map(i=><div key={i} style={{ width:5, height:5, borderRadius:"50%", background:LT.indigo, animation:`lpulse 1s ${i*0.15}s ease-in-out infinite` }}/>)}</div>}
          <div ref={endRef}/>
        </div>
        <div style={{ padding:"10px 14px", borderTop:`1px solid ${LT.border}`, display:"flex", gap:8 }}>
          <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about this topic..." style={{ flex:1, background:LT.raised, border:`1px solid ${LT.border}`, borderRadius:9, padding:"9px 13px", color:LT.text, fontFamily:FONT_LEARN, fontSize:13, outline:"none" }}/>
          <button onClick={send} disabled={!inp.trim()||busy} style={{ background:inp.trim()?LT.indigo:LT.dim, border:"none", borderRadius:9, padding:"9px 13px", color:"#fff", cursor:inp.trim()?"pointer":"not-allowed", fontSize:15 }}>→</button>
        </div>
      </div>
      <style>{`@keyframes lpulse{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}`}</style>
    </div>
  );
}

// ─── LESSON FLOW ──────────────────────────────────────────────────────────────

function LearnLessonFlow({ topic, unit, completedLessons, onComplete, onXP }) {
  const [idx, setIdx] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [showTutor, setShowTutor] = useState(false);

  const lessons = unit.lessons;
  const lesson = lessons[idx];
  const pct = (idx / lessons.length) * 100;

  const handleXP = amt => { onXP(amt); setXpEarned(e=>e+amt); };
  const next = () => { if(idx+1>=lessons.length) onComplete(unit.xp); else setIdx(i=>i+1); };

  return (
    <div style={{ position:"fixed", inset:0, background:LT.bg, zIndex:500, display:"flex", flexDirection:"column", maxWidth:520, margin:"0 auto" }}>
      {/* Progress bar */}
      <div style={{ padding:"14px 18px 0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <button onClick={()=>onComplete(0)} style={{ background:"none", border:"none", color:LT.muted, cursor:"pointer", fontSize:16, padding:4, lineHeight:1 }}>✕</button>
          <div style={{ flex:1, background:LT.dim, borderRadius:99, height:6, overflow:"hidden" }}>
            <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,${topic.color},${topic.color}bb)`, borderRadius:99, transition:"width 0.4s ease", boxShadow:`0 0 8px ${topic.color}60` }}/>
          </div>
          <button onClick={()=>setShowTutor(true)} style={{ background:`${LT.indigo}18`, border:`1px solid ${LT.indigo}30`, color:LT.indigoL, borderRadius:8, padding:"4px 9px", cursor:"pointer", fontFamily:FONT_CODE, fontSize:10 }}>🤖</button>
          {xpEarned>0 && <span style={{ color:LT.gold, fontFamily:FONT_CODE, fontSize:10, fontWeight:700 }}>+{xpEarned}xp</span>}
        </div>
        <div style={{ color:topic.color, fontFamily:FONT_CODE, fontSize:9, letterSpacing:2, marginBottom:2 }}>{topic.title.toUpperCase()} · {unit.title.toUpperCase()}</div>
        <h3 style={{ color:LT.text, fontFamily:FONT_LEARN, fontSize:18, fontWeight:800, margin:"0 0 14px" }}>{lesson.title}</h3>
      </div>

      {/* Lesson body */}
      <div style={{ flex:1, padding:"0 18px 18px", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {lesson.type==="concept"   && <LearnConceptCard lesson={lesson} onNext={next}/>}
        {lesson.type==="quiz"      && <LearnQuizCard    lesson={lesson} onNext={next} onXP={handleXP}/>}
        {lesson.type==="fillblank" && <LearnFillCard    lesson={lesson} onNext={next} onXP={handleXP}/>}
      </div>

      {showTutor && <LearnAITutor context={`${topic.title} — ${lesson.title}`} onClose={()=>setShowTutor(false)}/>}
    </div>
  );
}

// ─── UNIT COMPLETE ────────────────────────────────────────────────────────────

function LearnUnitComplete({ unit, xpEarned, topic, onContinue }) {
  return (
    <div style={{ position:"fixed", inset:0, background:LT.bg, zIndex:500, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center", maxWidth:520, margin:"0 auto" }}>
      <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
      <h2 style={{ color:LT.text, fontFamily:FONT_LEARN, fontSize:24, fontWeight:800, margin:"0 0 6px" }}>Unit Complete!</h2>
      <p style={{ color:LT.muted, fontFamily:FONT_LEARN, fontSize:14, margin:"0 0 28px" }}>{unit.title}</p>
      <div style={{ display:"flex", gap:16, marginBottom:28 }}>
        <div style={{ background:LT.raised, borderRadius:14, padding:"16px 24px", border:`1px solid ${LT.border}` }}>
          <div style={{ color:LT.gold, fontSize:24, fontWeight:800, fontFamily:FONT_CODE }}>+{xpEarned}</div>
          <div style={{ color:LT.muted, fontSize:10, fontFamily:FONT_CODE }}>XP EARNED</div>
        </div>
        <div style={{ background:LT.raised, borderRadius:14, padding:"16px 24px", border:`1px solid ${LT.border}` }}>
          <div style={{ color:LT.green, fontSize:24, fontWeight:800, fontFamily:FONT_CODE }}>🔥</div>
          <div style={{ color:LT.muted, fontSize:10, fontFamily:FONT_CODE }}>STREAK</div>
        </div>
      </div>
      <LBtn onClick={onContinue} full size="lg">Continue →</LBtn>
    </div>
  );
}

// ─── TOPIC PATH SCREEN ────────────────────────────────────────────────────────

function LearnTopicPath({ topic, completedUnits, onStartUnit, onBack }) {
  return (
    <div style={{ position:"fixed", inset:0, background:LT.bg, zIndex:400, overflowY:"auto", maxWidth:520, margin:"0 auto" }}>
      <div style={{ padding:"20px 18px 0", background:`linear-gradient(180deg,${topic.color}18 0%,transparent 100%)` }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:LT.muted, cursor:"pointer", fontSize:13, padding:0, marginBottom:16, display:"flex", alignItems:"center", gap:6, fontFamily:FONT_LEARN }}>← Back</button>
        <div style={{ fontSize:44, marginBottom:10 }}>{topic.icon}</div>
        <h2 style={{ color:LT.text, fontFamily:FONT_LEARN, fontSize:22, fontWeight:800, margin:"0 0 6px" }}>{topic.title}</h2>
        <p style={{ color:LT.muted, fontSize:13, fontFamily:FONT_LEARN, margin:"0 0 18px", lineHeight:1.6 }}>{topic.description}</p>
        <LXPBar cur={topic.units.filter(u=>completedUnits[u.id]).length} max={topic.units.length} color={topic.color} height={8} label={`${topic.units.filter(u=>completedUnits[u.id]).length}/${topic.units.length} units`}/>
        <div style={{ height:20 }}/>
      </div>
      <div style={{ padding:"0 18px 40px" }}>
        {topic.units.map((unit,idx)=>{
          const done = completedUnits[unit.id];
          const locked = idx>0 && !completedUnits[topic.units[idx-1].id];
          return (
            <div key={unit.id} style={{ marginBottom:10 }}>
              {idx>0 && <div style={{ width:2, height:14, background:done?topic.color:LT.dim, marginLeft:21, marginBottom:0 }}/>}
              <div onClick={()=>!locked&&onStartUnit(unit)} style={{ background:done?`${topic.color}10`:LT.raised, border:`1px solid ${done?topic.color+"50":locked?LT.dim:LT.border}`, borderRadius:14, padding:"14px 16px", cursor:locked?"not-allowed":"pointer", opacity:locked?0.5:1, transition:"all 0.2s", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:done?topic.color:locked?LT.dim:`${topic.color}20`, border:`1px solid ${done?topic.color:locked?LT.dim:topic.color+"40"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, color:done?"#fff":LT.text }}>
                  {done?"✓":locked?"🔒":idx+1}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ color:done?topic.color:locked?LT.muted:LT.text, fontFamily:FONT_LEARN, fontWeight:700, fontSize:13, marginBottom:2 }}>{unit.title}</div>
                  <div style={{ color:LT.muted, fontFamily:FONT_CODE, fontSize:10 }}>{unit.lessons.length} lessons · +{unit.xp} XP</div>
                </div>
                {done && <span style={{ color:topic.color, fontFamily:FONT_CODE, fontSize:10 }}>✓</span>}
                {!done && !locked && <span style={{ color:LT.muted, fontSize:14 }}>→</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── LEARN HOME SCREEN ────────────────────────────────────────────────────────

function LearnHomeScreen({ learnXP, completedUnits, onSelectTopic, onContinue }) {
  const lvl = getLvl(learnXP);
  const allUnits = CURRICULUM.flatMap(t=>t.units.map(u=>({...u,topic:t})));
  const continueUnit = allUnits.find(u=>!completedUnits[u.id]);

  return (
    <div style={{ fontFamily:FONT_LEARN }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=JetBrains+Mono:wght@400;600;700&display=swap');`}</style>

      {/* Level card */}
      <div style={{ background:`linear-gradient(135deg,${LT.card},#0d1825)`, border:`1px solid ${LT.indigo}30`, borderRadius:16, padding:"18px", marginBottom:14, boxShadow:`0 0 28px ${LT.indigo}10` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:28 }}>{lvl.cur.icon}</span>
            <div>
              <div style={{ color:LT.text, fontFamily:FONT_LEARN, fontWeight:800, fontSize:15 }}>Level {lvl.cur.level}</div>
              <div style={{ color:LT.indigoL, fontFamily:FONT_CODE, fontSize:10 }}>{lvl.cur.title}</div>
            </div>
          </div>
          <div style={{ background:`${LT.gold}20`, border:`1px solid ${LT.gold}40`, borderRadius:10, padding:"6px 12px", textAlign:"center" }}>
            <div style={{ color:LT.gold, fontFamily:FONT_CODE, fontSize:14, fontWeight:700 }}>{learnXP}</div>
            <div style={{ color:LT.muted, fontSize:9, fontFamily:FONT_CODE }}>XP</div>
          </div>
        </div>
        {lvl.next && <LXPBar cur={learnXP-lvl.cur.minXP} max={lvl.next.minXP-lvl.cur.minXP} color={LT.indigo} height={7} label={`${lvl.next.minXP-learnXP} XP to ${lvl.next.title}`}/>}
      </div>

      {/* Continue */}
      {continueUnit && (
        <div onClick={()=>onContinue(continueUnit.topic,continueUnit)} style={{ background:`${continueUnit.topic.color}14`, border:`1px solid ${continueUnit.topic.color}40`, borderRadius:14, padding:"16px", marginBottom:14, cursor:"pointer", display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ fontSize:30 }}>{continueUnit.topic.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ color:LT.muted, fontFamily:FONT_CODE, fontSize:9, letterSpacing:1, marginBottom:3 }}>CONTINUE</div>
            <div style={{ color:LT.text, fontFamily:FONT_LEARN, fontWeight:700, fontSize:14 }}>{continueUnit.title}</div>
            <div style={{ color:continueUnit.topic.color, fontFamily:FONT_CODE, fontSize:10, marginTop:2 }}>{continueUnit.topic.title}</div>
          </div>
          <LBtn size="sm" color={continueUnit.topic.color}>Start →</LBtn>
        </div>
      )}

      {/* Learning paths */}
      <div style={{ color:LT.text, fontFamily:FONT_LEARN, fontWeight:700, fontSize:15, marginBottom:12 }}>Learning Paths</div>
      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
        {CURRICULUM.map(topic=>{
          const done = topic.units.filter(u=>completedUnits[u.id]).length;
          const pct = done/topic.units.length;
          return (
            <div key={topic.id} onClick={()=>onSelectTopic(topic)} style={{ background:LT.raised, border:`1px solid ${done?topic.color+"40":LT.border}`, borderRadius:13, padding:"14px 16px", cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", gap:12 }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=topic.color;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=done?topic.color+"40":LT.border;}}>
              <div style={{ width:40, height:40, borderRadius:10, background:`${topic.color}20`, border:`1px solid ${topic.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{topic.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <div style={{ color:LT.text, fontFamily:FONT_LEARN, fontWeight:700, fontSize:13 }}>{topic.title}</div>
                  <div style={{ color:LT.muted, fontFamily:FONT_CODE, fontSize:9 }}>{done}/{topic.units.length}</div>
                </div>
                <div style={{ background:LT.dim, borderRadius:99, height:4, overflow:"hidden" }}>
                  <div style={{ width:`${pct*100}%`, height:"100%", background:topic.color, borderRadius:99, transition:"width 0.4s" }}/>
                </div>
              </div>
              <div style={{ color:LT.muted, fontSize:14 }}>→</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── LEARN TAB WRAPPER (state manager) ────────────────────────────────────────

function LearnTab() {
  const [learnXP, setLearnXP] = useState(0);
  const [completedUnits, setCompletedUnits] = useState({});
  const [screen, setScreen] = useState("home");   // home | path | lesson | complete
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeUnit, setActiveUnit] = useState(null);
  const [completionXP, setCompletionXP] = useState(0);

  const handleComplete = xp => { if(xp>0){setCompletedUnits(u=>({...u,[activeUnit.id]:true}));setLearnXP(x=>x+xp);} setCompletionXP(xp); if(xp>0) setScreen("complete"); else setScreen("path"); };
  const handleXP = amt => setLearnXP(x=>x+amt);

  return (
    <div style={{ background:LT.bg, borderRadius:12, padding:"20px 16px", minHeight:400 }}>
      {screen==="home" && <LearnHomeScreen learnXP={learnXP} completedUnits={completedUnits} onSelectTopic={t=>{setActiveTopic(t);setScreen("path");}} onContinue={(t,u)=>{setActiveTopic(t);setActiveUnit(u);setScreen("lesson");}}/>}
      {screen==="path" && activeTopic && <LearnTopicPath topic={activeTopic} completedUnits={completedUnits} onStartUnit={u=>{setActiveUnit(u);setScreen("lesson");}} onBack={()=>setScreen("home")}/>}
      {screen==="lesson" && activeTopic && activeUnit && <LearnLessonFlow topic={activeTopic} unit={activeUnit} completedLessons={{}} onComplete={handleComplete} onXP={handleXP}/>}
      {screen==="complete" && activeUnit && <LearnUnitComplete unit={activeUnit} xpEarned={completionXP} topic={activeTopic} onContinue={()=>setScreen("path")}/>}
    </div>
  );
}


// ─── MAIN APP ──────────────────────────────────────────────────────────────────

const MODES = [
  { id: "matching",     label: "Match It",     icon: "🔗", color: COLORS.purple, desc: "Match AWS services to their definitions across 6 levels", difficulty: "Beginner" },
  { id: "architecture", label: "Build It",     icon: "🏗️", color: COLORS.blue,   desc: "Click to place services into real AWS architecture diagrams", difficulty: "Intermediate" },
  { id: "escape",       label: "Escape Room",  icon: "🚨", color: COLORS.red,    desc: "Solve 6 real AWS incidents under the clock", difficulty: "Advanced" },
  { id: "troubleshoot", label: "Troubleshoot", icon: "🔧", color: "#e11d48",     desc: "Diagnose real AWS issues from symptoms and logs", difficulty: "Advanced" },
  { id: "scenario",     label: "Scenario Quiz",icon: "💼", color: COLORS.accent, desc: "Answer real-world architecture scenario questions", difficulty: "Intermediate" },
  { id: "rpg",          label: "RPG Campaign", icon: "⚔️", color: COLORS.green,  desc: "Complete missions, earn XP, unlock badges", difficulty: "All Levels" },
];

export default function AwsGame() {
  const [view, setView] = useState("hub");          // hub | topic | game
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeMode, setActiveMode] = useState(null);
  const [result, setResult] = useState(null);
  const [allScores, setAllScores] = useState({});
  const [hubTab, setHubTab] = useState("modes");   // modes | topics

  const scoreKey = activeTopic ? `topic_${activeTopic}_${activeMode}` : activeMode;

  const handleComplete = (score) => {
    setAllScores(s => ({ ...s, [scoreKey]: (s[scoreKey] || 0) + score }));
    setResult({ mode: activeMode, score, topic: activeTopic });
  };

  const totalScore = Object.values(allScores).reduce((a, b) => a + b, 0);

  // ── Result screen ────────────────────────────────────────────────────────
  if (result) return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 600 }}>
        <ResultScreen mode={result.mode} score={result.score}
          onBack={() => {
            setResult(null);
            if (result.topic) { setView("topic"); setActiveMode(null); }
            else { setView("hub"); setActiveMode(null); }
          }} />
      </div>
    </div>
  );

  // ── Active game ──────────────────────────────────────────────────────────
  if (view === "game" && activeMode) {
    const mode = MODES.find(m => m.id === activeMode);
    const topic = activeTopic;
    const backLabel = topic ? `← ${TOPICS.find(t=>t.id===topic)?.label}` : "← Hub";
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "24px 16px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <button onClick={() => { topic ? setView("topic") : setView("hub"); setActiveMode(null); }} style={{ background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.muted, padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>{backLabel}</button>
            <span style={{ fontSize: 20 }}>{mode.icon}</span>
            <h2 style={{ margin: 0, color: mode.color, fontFamily: "'Space Mono', monospace", fontSize: 16 }}>{mode.label}</h2>
            {topic && <Badge color={TOPICS.find(t=>t.id===topic)?.color}>{TOPICS.find(t=>t.id===topic)?.label}</Badge>}
            <div style={{ marginLeft: "auto" }}><Badge color={mode.color}>{mode.difficulty}</Badge></div>
          </div>
          <Panel>
            {activeMode === "matching"     && (topic ? <TopicMatchingGame     topic={topic} onComplete={handleComplete} /> : <MatchingGame     onComplete={handleComplete} />)}
            {activeMode === "architecture" && (topic ? <TopicArchGame         topic={topic} onComplete={handleComplete} /> : <ArchitectureGame  onComplete={handleComplete} />)}
            {activeMode === "escape"       && (topic ? <TopicEscapeGame       topic={topic} onComplete={handleComplete} /> : <EscapeRoom        onComplete={handleComplete} />)}
            {activeMode === "troubleshoot" && (topic ? <TopicTroubleshootGame topic={topic} onComplete={handleComplete} /> : <TroubleshootGame  onComplete={handleComplete} />)}
            {activeMode === "scenario"     && <ScenarioQuiz onComplete={handleComplete} />}
            {activeMode === "rpg"          && <RPGMode      onComplete={handleComplete} />}
          </Panel>
        </div>
      </div>
    );
  }

  // ── Topic hub ────────────────────────────────────────────────────────────
  if (view === "topic" && activeTopic) return (
    <TopicHub topic={activeTopic} allScores={allScores}
      onSelectGame={(modeId) => { setActiveMode(modeId); setView("game"); }}
      onBack={() => { setView("hub"); setActiveTopic(null); }} />
  );

  // ── Main hub ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "32px 16px", fontFamily: "'Space Mono', monospace" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-block", background: `${COLORS.accent}15`, border: `1px solid ${COLORS.accent}40`, borderRadius: 8, padding: "4px 14px", color: COLORS.accent, fontSize: 11, marginBottom: 18, letterSpacing: 2 }}>
            BETA · AWS LEARNING GAME
          </div>
          <h1 style={{ color: COLORS.text, margin: "0 0 10px", fontSize: "clamp(26px, 5vw, 40px)", lineHeight: 1.2, letterSpacing: -1 }}>
            Learn AWS by <GlowText>Playing</GlowText>
          </h1>
          <p style={{ color: COLORS.muted, margin: "0 0 20px", fontSize: 13, maxWidth: 500, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7, fontFamily: "monospace" }}>
            6 game modes · 5 topic paths · structured lessons · AI tutor · no boring videos
          </p>
          {totalScore > 0 && (
            <div style={{ display: "inline-flex", gap: 20, background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 22px", marginBottom: 4 }}>
              <div><div style={{ color: COLORS.muted, fontSize: 10, marginBottom: 3 }}>TOTAL SCORE</div><div style={{ color: COLORS.accent, fontSize: 20, fontWeight: "bold" }}>{totalScore}</div></div>
              <div><div style={{ color: COLORS.muted, fontSize: 10, marginBottom: 3 }}>SESSIONS</div><div style={{ color: COLORS.green, fontSize: 20, fontWeight: "bold" }}>{Object.keys(allScores).length}</div></div>
            </div>
          )}
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: COLORS.panel, borderRadius: 10, padding: 4, border: `1px solid ${COLORS.border}` }}>
          {[{id:"modes",label:"🎮 Game Modes"},{id:"topics",label:"📚 By Topic"},{id:"learn",label:"🎓 Learn"}].map(tab => (
            <button key={tab.id} onClick={() => setHubTab(tab.id)} style={{
              flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer",
              background: hubTab === tab.id ? `${COLORS.accent}20` : "transparent",
              color: hubTab === tab.id ? COLORS.accent : COLORS.muted,
              fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: hubTab === tab.id ? "bold" : "normal",
              borderBottom: hubTab === tab.id ? `2px solid ${COLORS.accent}` : "2px solid transparent",
              transition: "all 0.2s",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Game Modes tab */}
        {hubTab === "modes" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
            {MODES.map(mode => {
              const played = allScores[mode.id];
              return (
                <div key={mode.id} onClick={() => { setActiveMode(mode.id); setActiveTopic(null); setView("game"); }}
                  style={{ background: COLORS.panel, border: `1px solid ${played ? mode.color+"60" : COLORS.border}`, borderRadius: 12, padding: 18, cursor: "pointer", transition: "all 0.22s", position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = mode.color; e.currentTarget.style.boxShadow = `0 0 20px ${mode.color}28`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = played ? mode.color+"60" : COLORS.border; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 26 }}>{mode.icon}</span>
                      <div>
                        <div style={{ color: mode.color, fontWeight: "bold", fontSize: 14 }}>{mode.label}</div>
                        <Badge color={mode.color}>{mode.difficulty}</Badge>
                      </div>
                    </div>
                    {played && <Badge color={COLORS.green}>✓ {played} pts</Badge>}
                  </div>
                  <p style={{ color: COLORS.muted, margin: 0, fontSize: 12, lineHeight: 1.6, fontFamily: "monospace" }}>{mode.desc}</p>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${mode.color}00, ${mode.color}, ${mode.color}00)`, opacity: 0.4 }} />
                </div>
              );
            })}
          </div>
        )}

        {/* Topics tab */}
        {hubTab === "topics" && (
          <div>
            <div style={{ color: COLORS.muted, fontFamily: "monospace", fontSize: 12, marginBottom: 18, textAlign: "center" }}>
              Pick a topic to get a curated set of games focused on that AWS domain.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
              {TOPICS.map(topic => {
                const topicScores = Object.entries(allScores).filter(([k]) => k.startsWith(`topic_${topic.id}_`));
                const topicTotal = topicScores.reduce((a,[,v]) => a+v, 0);
                const modesPlayed = topicScores.length;
                return (
                  <div key={topic.id} onClick={() => { setActiveTopic(topic.id); setView("topic"); }}
                    style={{ background: COLORS.panel, border: `1px solid ${modesPlayed ? topic.color+"60" : COLORS.border}`, borderRadius: 12, padding: 18, cursor: "pointer", transition: "all 0.22s", position: "relative", overflow: "hidden" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = topic.color; e.currentTarget.style.boxShadow = `0 0 20px ${topic.color}28`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = modesPlayed ? topic.color+"60" : COLORS.border; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${topic.color}18`, border: `1px solid ${topic.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{topic.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: topic.color, fontFamily: "'Space Mono', monospace", fontWeight: "bold", fontSize: 14 }}>{topic.label}</div>
                        <div style={{ color: COLORS.muted, fontFamily: "monospace", fontSize: 10, marginTop: 2 }}>{topic.games.length} game modes</div>
                      </div>
                      {modesPlayed > 0 && <Badge color={COLORS.green}>{modesPlayed} done</Badge>}
                    </div>
                    <p style={{ color: COLORS.muted, margin: "0 0 10px", fontSize: 11, fontFamily: "monospace", lineHeight: 1.5 }}>{topic.desc}</p>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {topic.games.map(g => {
                        const gMode = TOPIC_MODES.find(m => m.id === g);
                        const done = allScores[`topic_${topic.id}_${g}`];
                        return <span key={g} style={{ fontSize: 10, fontFamily: "monospace", background: done ? `${gMode.color}25` : COLORS.bg, border: `1px solid ${done ? gMode.color+"60" : COLORS.border}`, color: done ? gMode.color : COLORS.muted, borderRadius: 4, padding: "2px 7px" }}>{done ? "✓ " : ""}{gMode.icon} {gMode.label}</span>;
                      })}
                    </div>
                    {topicTotal > 0 && <div style={{ marginTop: 10, color: topic.color, fontFamily: "monospace", fontSize: 11 }}>Total: {topicTotal} pts</div>}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${topic.color}00, ${topic.color}, ${topic.color}00)`, opacity: 0.4 }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Learn tab */}
        {hubTab === "learn" && <LearnTab />}

        <div style={{ textAlign: "center", marginTop: 44, color: COLORS.muted, fontSize: 11, fontFamily: "monospace" }}>
          Built on top of <span style={{ color: COLORS.accent }}>AWS AI Tutor Pro</span> · Powered by Claude AI
        </div>
      </div>
    </div>
  );
}
