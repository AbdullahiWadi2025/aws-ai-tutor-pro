// @ts-nocheck
import { useState, useMemo } from "react";
import { useLocation } from "wouter";

// ─── DESIGN TOKENS (matches Training Arena) ────────────────────────────────────
const C = {
  bg:      "#080d14",
  panel:   "#0d1520",
  raised:  "#111c2a",
  border:  "#1a2d45",
  accent:  "#f59e0b",
  green:   "#10b981",
  red:     "#ef4444",
  blue:    "#3b82f6",
  purple:  "#8b5cf6",
  indigo:  "#6366f1",
  text:    "#e2e8f0",
  muted:   "#64748b",
  dim:     "#1a2d45",
};
const FONT_CODE = "'Space Mono', 'JetBrains Mono', monospace";
const FONT_BODY = "'DM Sans', system-ui, sans-serif";

// ─── AWS SERVICE DATABASE ──────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "foundations",
    label: "Cloud Foundations",
    icon: "☁️",
    color: "#f59e0b",
    desc: "Core concepts every AWS user must know",
    services: [
      {
        name: "AWS Global Infrastructure",
        icon: "🌍",
        level: "Beginner",
        tagline: "The physical backbone of AWS",
        what: "AWS operates 33 Regions, 105 Availability Zones, and 600+ edge locations worldwide. A Region is a geographic area with multiple isolated data centers (AZs). An AZ is one or more physically separate data centers with redundant power, networking, and connectivity.",
        when: "Choose a Region based on: (1) proximity to your users for latency, (2) data residency requirements, (3) service availability — not all services exist in all regions, (4) cost — prices vary by region.",
        keyFeatures: [
          "Regions: 33 geographic areas, each fully independent",
          "Availability Zones: 2–6 AZs per region, connected by low-latency private fiber",
          "Edge Locations: 600+ points of presence for CloudFront CDN caching",
          "Local Zones: AWS infrastructure closer to large metro areas",
          "Wavelength Zones: AWS compute embedded in telecom 5G networks",
        ],
        pricing: "Infrastructure itself is free — you pay for the services running on it. Data transfer between AZs in the same region costs ~$0.01/GB. Cross-region transfer costs more.",
        examTip: "SAA-C03: Deploying across multiple AZs = High Availability. Deploying across multiple Regions = Disaster Recovery. Know the difference. AZs protect against data center failure; Regions protect against regional disasters.",
      },
      {
        name: "IAM (Identity & Access Management)",
        icon: "🔑",
        level: "Beginner",
        tagline: "Who can do what in your AWS account",
        what: "IAM controls authentication (who you are) and authorization (what you can do) across all AWS services. It is global — not region-specific. Everything in AWS is an API call, and IAM decides which API calls are allowed.",
        when: "Use IAM for: creating users for your team, assigning roles to EC2/Lambda/ECS so they can access other services, federating your corporate identity provider (SSO), and setting up cross-account access.",
        keyFeatures: [
          "Users: Long-lived identities for humans. Use for console access.",
          "Roles: Short-lived credentials assumed by services or federated users. Use for all AWS services — never hardcode access keys.",
          "Policies: JSON documents defining Allow/Deny for specific actions on specific resources.",
          "Groups: Attach policies to groups, add users to groups for bulk permission management.",
          "Permission Boundaries: Cap the maximum permissions a role/user can ever have.",
          "Service Control Policies (SCPs): Org-level guardrails applied to entire AWS accounts.",
        ],
        pricing: "IAM is completely free — no charge for users, roles, or policies.",
        examTip: "SAA-C03: Evaluation order is: Explicit Deny → Explicit Allow → Implicit Deny. An explicit Deny ALWAYS wins — even AdministratorAccess cannot override a Deny. For EC2/Lambda needing S3 access: always use an IAM Role, never hardcode access keys.",
      },
      {
        name: "AWS Organizations",
        icon: "🏢",
        level: "Intermediate",
        tagline: "Manage multiple AWS accounts as one",
        what: "AWS Organizations lets you centrally manage billing, apply governance policies, and group accounts into Organizational Units (OUs). It is the foundation of multi-account AWS architectures.",
        when: "Use Organizations when you have multiple teams, environments (dev/staging/prod), or business units that need separate AWS accounts for billing isolation, security boundaries, or compliance.",
        keyFeatures: [
          "Service Control Policies (SCPs): Restrict what services/actions are allowed in member accounts",
          "Consolidated Billing: Single payment method for all accounts, with volume discounts",
          "Organizational Units (OUs): Group accounts hierarchically (e.g., Prod OU, Dev OU)",
          "AWS Control Tower: Automates setting up a secure multi-account environment",
          "Tag Policies: Enforce consistent tagging across all accounts",
        ],
        pricing: "AWS Organizations is free. You pay for the resources in each member account.",
        examTip: "SAA-C03: SCPs do NOT grant permissions — they only restrict. Even if an IAM policy allows an action, an SCP can block it. The root account of an organization cannot be restricted by SCPs.",
      },
      {
        name: "AWS Pricing & Cost Management",
        icon: "💰",
        level: "Beginner",
        tagline: "Understanding and controlling your AWS bill",
        what: "AWS uses a pay-as-you-go model with no upfront costs for most services. Key tools: AWS Cost Explorer (visualize spending), AWS Budgets (set alerts), Cost and Usage Report (raw billing data), and Trusted Advisor (cost optimization recommendations).",
        when: "Use Cost Explorer to analyze spending trends. Set Budgets to get alerted before costs exceed thresholds. Use Savings Plans or Reserved Instances for predictable workloads to save 30–72%.",
        keyFeatures: [
          "On-Demand: Pay per second/hour, no commitment, highest price",
          "Reserved Instances / Savings Plans: 1 or 3 year commitment, 30–72% discount",
          "Spot Instances: Up to 90% discount on spare EC2 capacity, can be interrupted",
          "Free Tier: 12 months of limited free usage for new accounts",
          "AWS Cost Explorer: Visualize and analyze costs by service, region, tag",
          "AWS Budgets: Set cost/usage thresholds and receive alerts",
        ],
        pricing: "Cost Explorer is free for the first year, then $0.01 per query. Budgets: first 2 budgets free, then $0.02/day per budget.",
        examTip: "CLF-C02: Know the 4 pricing principles: Pay for what you use, Pay less when you reserve, Pay less with volume discounts, Pay even less as AWS grows. TCO Calculator compares on-premises vs. AWS costs.",
      },
    ],
  },
  {
    id: "compute",
    label: "Compute",
    icon: "💻",
    color: "#FF9900",
    desc: "Virtual machines, containers, and serverless",
    services: [
      {
        name: "Amazon EC2",
        icon: "🖥️",
        level: "Beginner",
        tagline: "Resizable virtual machines in the cloud",
        what: "EC2 (Elastic Compute Cloud) provides virtual servers (instances) you can launch in minutes. You choose the OS, CPU, RAM, storage, and networking. Instances run in a VPC and can be placed in specific AZs.",
        when: "Use EC2 for: long-running applications, legacy apps that can't be containerized, workloads needing specific OS configurations, HPC, or when you need full control over the server environment.",
        keyFeatures: [
          "Instance Types: 400+ types across families (General Purpose, Compute, Memory, Storage, GPU)",
          "AMIs: Amazon Machine Images — pre-configured OS + software templates",
          "Security Groups: Stateful firewall at the instance level",
          "Elastic IP: Static public IP address that persists across instance stops",
          "User Data: Bootstrap scripts that run on first launch",
          "Instance Store: Temporary local NVMe storage, lost on stop/terminate",
          "Placement Groups: Control physical placement (cluster/spread/partition)",
        ],
        pricing: "Billed per second (minimum 60 seconds). On-Demand t3.micro: ~$0.0104/hr. Reserved 1yr: up to 40% discount. Spot: up to 90% discount but interruptible.",
        examTip: "SAA-C03: Know all 5 purchasing options: On-Demand, Reserved (Standard/Convertible), Spot, Dedicated Hosts, Dedicated Instances. Spot = cheapest but can be interrupted with 2-min notice. Reserved = cheapest for steady-state. Dedicated Host = compliance/licensing.",
      },
      {
        name: "AWS Lambda",
        icon: "⚡",
        level: "Beginner",
        tagline: "Run code without managing servers",
        what: "Lambda runs your code in response to events (HTTP requests, S3 uploads, DynamoDB changes, scheduled triggers) without you managing any servers. AWS handles provisioning, scaling, patching, and availability.",
        when: "Use Lambda for: event-driven processing, APIs with unpredictable traffic (scales to zero), file processing (resize images on S3 upload), scheduled jobs (cron), microservices backends.",
        keyFeatures: [
          "Triggers: API Gateway, S3, DynamoDB Streams, SQS, SNS, EventBridge, CloudWatch Events",
          "Runtimes: Node.js, Python, Java, Go, Ruby, .NET, custom runtimes",
          "Memory: 128 MB to 10 GB (CPU scales proportionally with memory)",
          "Timeout: Up to 15 minutes per invocation",
          "Concurrency: Up to 1,000 concurrent executions per region (soft limit)",
          "Layers: Share code/dependencies across functions",
          "Lambda@Edge: Run functions at CloudFront edge locations",
          "Provisioned Concurrency: Pre-warm functions to eliminate cold starts",
        ],
        pricing: "First 1M requests/month free. Then $0.20 per 1M requests + $0.0000166667 per GB-second of compute. Very cheap for low-to-medium traffic.",
        examTip: "SAA-C03: Lambda + RDS = connection exhaustion problem at scale → fix with RDS Proxy. Lambda cold starts = use Provisioned Concurrency. Lambda max timeout = 15 minutes — not suitable for long-running jobs (use ECS/Batch instead).",
      },
      {
        name: "Amazon ECS & Fargate",
        icon: "🐳",
        level: "Intermediate",
        tagline: "Run Docker containers on AWS",
        what: "ECS (Elastic Container Service) is AWS's container orchestration service. Fargate is the serverless compute engine for ECS — you define the container, Fargate handles the underlying infrastructure. EKS is for Kubernetes.",
        when: "Use ECS/Fargate for: containerized microservices, batch processing, CI/CD pipelines, migrating Docker-based apps to AWS without managing servers.",
        keyFeatures: [
          "Task Definition: Blueprint for your container (image, CPU, memory, ports, env vars)",
          "Service: Maintains desired number of running tasks, integrates with ALB",
          "Fargate: Serverless — no EC2 instances to manage",
          "EC2 Launch Type: You manage the underlying EC2 instances",
          "ECS Anywhere: Run ECS tasks on your own on-premises servers",
          "Service Auto Scaling: Scale tasks based on CPU, memory, or custom metrics",
          "Exit code 137: OOMKilled — container ran out of memory",
        ],
        pricing: "Fargate: $0.04048/vCPU-hour + $0.004445/GB-hour. EC2 launch type: you pay for EC2 instances. ECS itself is free.",
        examTip: "SAA-C03: Exit code 137 = OOMKilled → increase memory in task definition. ECS Service + ALB = standard web app pattern. Fargate = no server management. EKS = Kubernetes (more complex, more control).",
      },
      {
        name: "EC2 Auto Scaling",
        icon: "📈",
        level: "Intermediate",
        tagline: "Automatically adjust EC2 capacity",
        what: "Auto Scaling Groups (ASGs) automatically launch or terminate EC2 instances based on demand, health checks, or schedules. It ensures you always have the right number of instances running.",
        when: "Use Auto Scaling for any production EC2 workload — it provides both elasticity (scale out for traffic) and resilience (replace unhealthy instances automatically).",
        keyFeatures: [
          "Launch Template: Defines instance config (AMI, type, security groups, user data)",
          "Target Tracking: Maintain a metric at a target value (e.g., CPU at 50%)",
          "Step Scaling: Add/remove capacity in steps based on CloudWatch alarms",
          "Scheduled Scaling: Scale at predictable times (e.g., scale up at 9 AM)",
          "Warm Pools: Pre-initialized instances ready to scale fast",
          "Health Checks: Replace unhealthy instances automatically (EC2 or ELB health checks)",
          "Cooldown Period: Prevent rapid scale-in/out oscillation",
        ],
        pricing: "Auto Scaling itself is free. You pay for the EC2 instances it launches.",
        examTip: "SAA-C03: ASG + ALB = the standard HA web tier pattern. Target Tracking is the simplest scaling policy. Lifecycle Hooks let you run custom scripts before instances enter/leave service. Default cooldown = 300 seconds.",
      },
      {
        name: "AWS Elastic Beanstalk",
        icon: "🌱",
        level: "Beginner",
        tagline: "Deploy web apps without managing infrastructure",
        what: "Elastic Beanstalk is a PaaS that automatically handles deployment, capacity provisioning, load balancing, auto-scaling, and health monitoring. You just upload your code.",
        when: "Use Beanstalk for: quick deployments of standard web apps (Node.js, Python, Java, PHP, Ruby, Go, .NET), teams that want AWS without deep infrastructure knowledge.",
        keyFeatures: [
          "Supported platforms: Node.js, Python, Ruby, PHP, Java, Go, .NET, Docker",
          "Manages: EC2, ALB, Auto Scaling, RDS, CloudWatch — all configured automatically",
          "Blue/Green deployments: Deploy new version alongside old, swap traffic",
          "Rolling updates: Update instances in batches to avoid downtime",
          ".ebextensions: Customize environment with config files",
        ],
        pricing: "Beanstalk itself is free. You pay for the underlying resources (EC2, RDS, etc.).",
        examTip: "SAA-C03: Beanstalk is NOT serverless — it uses EC2 under the hood. For true serverless, use Lambda + API Gateway. Beanstalk is best for teams wanting simplicity without full PaaS lock-in.",
      },
    ],
  },
  {
    id: "storage",
    label: "Storage",
    icon: "📦",
    color: "#3b82f6",
    desc: "Object, block, file, and archival storage",
    services: [
      {
        name: "Amazon S3",
        icon: "🪣",
        level: "Beginner",
        tagline: "Infinitely scalable object storage",
        what: "S3 (Simple Storage Service) stores objects (files) in buckets. It offers 99.999999999% (11 nines) durability, stores data across multiple AZs automatically, and scales to any size without provisioning.",
        when: "Use S3 for: static website hosting, backup and archival, data lakes, storing application assets (images, videos, documents), log storage, and as the source/destination for data pipelines.",
        keyFeatures: [
          "Storage Classes: Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant, Glacier Flexible, Glacier Deep Archive",
          "Versioning: Keep multiple versions of every object",
          "Lifecycle Policies: Auto-transition objects between storage classes or expire them",
          "Replication: Cross-Region Replication (CRR) or Same-Region Replication (SRR)",
          "Event Notifications: Trigger Lambda/SQS/SNS on object events",
          "Presigned URLs: Temporary access URLs for private objects",
          "Object Lock: WORM storage — prevent deletion for a set period",
          "S3 Select: Query CSV/JSON data inside objects with SQL",
          "Transfer Acceleration: Speed up uploads using CloudFront edge",
        ],
        pricing: "S3 Standard: $0.023/GB/month. Glacier Deep Archive: $0.00099/GB/month. Data transfer IN is free. Data transfer OUT: first 100 GB/month free, then $0.09/GB.",
        examTip: "SAA-C03: S3 is NOT a file system — it's object storage. Max object size = 5 TB (use multipart upload for >100 MB). Block Public Access overrides bucket policies. S3 is eventually consistent for overwrites/deletes (now strongly consistent for all operations since Dec 2020).",
      },
      {
        name: "Amazon EBS",
        icon: "💾",
        level: "Intermediate",
        tagline: "Block storage volumes for EC2",
        what: "EBS (Elastic Block Store) provides persistent block storage volumes that attach to EC2 instances like a hard drive. Data persists independently of the EC2 instance lifecycle.",
        when: "Use EBS for: EC2 root volumes, databases running on EC2, applications needing low-latency block storage, any workload requiring persistent storage attached to a single EC2 instance.",
        keyFeatures: [
          "gp3: General purpose SSD, 3,000 IOPS baseline, configurable up to 16,000 IOPS",
          "io2 Block Express: Highest performance, up to 256,000 IOPS, for critical databases",
          "st1: Throughput-optimized HDD, for big data and log processing",
          "sc1: Cold HDD, lowest cost, for infrequently accessed data",
          "Snapshots: Point-in-time backups stored in S3 (incremental)",
          "Multi-Attach: Attach one io1/io2 volume to multiple EC2 instances simultaneously",
          "Encryption: AES-256, managed by KMS, transparent to the application",
        ],
        pricing: "gp3: $0.08/GB/month. io2: $0.125/GB/month + $0.065/provisioned IOPS. Snapshots: $0.05/GB/month.",
        examTip: "SAA-C03: EBS volumes are AZ-specific — you cannot attach an EBS volume to an EC2 in a different AZ. To move: take a snapshot → create volume in new AZ. EBS is NOT shared storage — use EFS for shared file access across multiple EC2s.",
      },
      {
        name: "Amazon EFS",
        icon: "📁",
        level: "Intermediate",
        tagline: "Elastic shared file system for Linux",
        what: "EFS (Elastic File System) is a managed NFS file system that can be mounted on multiple EC2 instances simultaneously across multiple AZs. It scales automatically — no capacity planning needed.",
        when: "Use EFS for: shared content repositories, web serving, home directories, big data analytics, container storage (ECS/EKS), any workload needing shared file access across multiple instances.",
        keyFeatures: [
          "Multi-AZ: Data stored redundantly across multiple AZs",
          "Elastic: Grows and shrinks automatically — no provisioning",
          "Performance Modes: General Purpose (default) or Max I/O (for highly parallel workloads)",
          "Throughput Modes: Bursting (scales with storage size) or Provisioned (fixed throughput)",
          "Storage Classes: Standard and Infrequent Access (IA) with lifecycle management",
          "Access Points: Application-specific entry points with enforced user identity",
        ],
        pricing: "EFS Standard: $0.30/GB/month. EFS IA: $0.025/GB/month. Much more expensive than EBS per GB — use only when you need shared access.",
        examTip: "SAA-C03: EFS = Linux only (NFS protocol). For Windows shared storage, use FSx for Windows File Server. EFS can be mounted across AZs and even across VPCs using VPC peering. EBS = single instance attachment (except Multi-Attach io2).",
      },
      {
        name: "Amazon S3 Glacier",
        icon: "🧊",
        level: "Beginner",
        tagline: "Long-term archival storage at ultra-low cost",
        what: "S3 Glacier is a family of storage classes designed for data archiving where retrieval time is not critical. It offers the lowest storage cost on AWS, trading retrieval speed for price.",
        when: "Use Glacier for: compliance archives (7-year retention), backup copies you rarely access, historical data, medical records, legal documents.",
        keyFeatures: [
          "Glacier Instant Retrieval: Millisecond access, $0.004/GB/month",
          "Glacier Flexible Retrieval: Minutes to hours, $0.0036/GB/month",
          "Glacier Deep Archive: 12-hour retrieval, $0.00099/GB/month (cheapest storage on AWS)",
          "Vault Lock: WORM compliance — lock a vault policy permanently",
          "Lifecycle Policies: Automatically move S3 objects to Glacier after N days",
        ],
        pricing: "Deep Archive: $0.00099/GB/month (~$1/TB/month). Retrieval fees apply: Deep Archive bulk retrieval ~$0.0025/GB.",
        examTip: "SAA-C03: Glacier is accessed via S3 Lifecycle policies or directly via the Glacier API. Vault Lock ≠ S3 Object Lock — they are separate features. For compliance WORM storage in S3, use S3 Object Lock. For Glacier WORM, use Vault Lock.",
      },
      {
        name: "AWS Storage Gateway",
        icon: "🔌",
        level: "Intermediate",
        tagline: "Hybrid storage bridging on-premises to AWS",
        what: "Storage Gateway is a hybrid cloud storage service that gives on-premises applications access to AWS cloud storage. It runs as a VM or hardware appliance in your data center.",
        when: "Use Storage Gateway for: extending on-premises storage to the cloud, backup to S3, disaster recovery, migrating data to AWS while keeping local caching.",
        keyFeatures: [
          "S3 File Gateway: NFS/SMB access to S3 objects from on-premises",
          "FSx File Gateway: Local cache for FSx for Windows File Server",
          "Volume Gateway: iSCSI block storage backed by S3 (Stored or Cached mode)",
          "Tape Gateway: Virtual tape library backed by S3 and Glacier",
        ],
        pricing: "Charged based on data stored, data transferred, and request counts. Varies by gateway type.",
        examTip: "SAA-C03: Storage Gateway is the answer when the question mentions 'on-premises' + 'AWS storage'. S3 File Gateway = NFS/SMB to S3. Tape Gateway = replace physical tape libraries. Volume Gateway = block storage to S3.",
      },
    ],
  },
  {
    id: "databases",
    label: "Databases",
    icon: "🗄️",
    color: "#10b981",
    desc: "Relational, NoSQL, caching, and analytics databases",
    services: [
      {
        name: "Amazon RDS",
        icon: "📋",
        level: "Beginner",
        tagline: "Managed relational database service",
        what: "RDS (Relational Database Service) manages the setup, patching, backups, and replication of relational databases. Supports MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, and Amazon Aurora.",
        when: "Use RDS for: traditional relational workloads, applications using SQL, OLTP systems, any app that needs ACID transactions and complex joins.",
        keyFeatures: [
          "Multi-AZ: Synchronous standby replica in another AZ for automatic failover (~60s)",
          "Read Replicas: Asynchronous copies for read-heavy workloads (up to 15 replicas)",
          "Automated Backups: Daily snapshots + transaction logs for point-in-time recovery (PITR)",
          "RDS Proxy: Connection pooling between Lambda/apps and RDS — essential for serverless",
          "Parameter Groups: Configure DB engine settings",
          "Performance Insights: Visualize DB load and identify slow queries",
          "Encryption: At rest (KMS) and in transit (SSL/TLS)",
        ],
        pricing: "db.t3.micro MySQL: ~$0.017/hr. Multi-AZ doubles the cost. Storage: $0.115/GB/month for gp2.",
        examTip: "SAA-C03: Multi-AZ = High Availability (failover), NOT performance. Read Replicas = performance (read scaling), NOT HA. Lambda + RDS = use RDS Proxy to avoid connection exhaustion. RDS does NOT scale automatically — use Aurora Serverless for auto-scaling.",
      },
      {
        name: "Amazon Aurora",
        icon: "⚡",
        level: "Intermediate",
        tagline: "MySQL/PostgreSQL-compatible, 5x faster",
        what: "Aurora is AWS's cloud-native relational database. It's MySQL and PostgreSQL compatible but uses a distributed storage architecture that separates compute from storage, enabling much higher performance and availability.",
        when: "Use Aurora when you need: higher performance than standard RDS, automatic storage scaling, global database replication, or Aurora Serverless for variable workloads.",
        keyFeatures: [
          "Storage: Automatically grows in 10 GB increments up to 128 TB",
          "6 copies of data: Across 3 AZs, can lose 2 copies without write loss",
          "Aurora Serverless v2: Auto-scales in fine-grained increments (0.5 ACU steps)",
          "Aurora Global Database: Single DB spanning multiple regions, <1s replication lag",
          "Backtrack: Rewind DB to a previous point without restoring from backup",
          "Parallel Query: Push analytical queries to storage layer for faster results",
          "Up to 15 read replicas with <10ms replica lag",
        ],
        pricing: "Aurora MySQL: $0.10/ACU-hr (Serverless v2). Storage: $0.10/GB/month. 5x more expensive than standard MySQL RDS but often worth it for performance.",
        examTip: "SAA-C03: Aurora is the answer when the question asks for 'MySQL/PostgreSQL compatible with higher performance' or 'auto-scaling database'. Aurora Serverless = variable workloads. Aurora Global = multi-region active-active.",
      },
      {
        name: "Amazon DynamoDB",
        icon: "🚀",
        level: "Intermediate",
        tagline: "Serverless NoSQL key-value and document store",
        what: "DynamoDB is a fully managed, serverless NoSQL database that delivers single-digit millisecond performance at any scale. It automatically scales capacity up and down based on traffic.",
        when: "Use DynamoDB for: high-traffic web apps, gaming leaderboards, IoT data, session management, shopping carts, any workload needing consistent low-latency at massive scale.",
        keyFeatures: [
          "Primary Key: Partition Key (required) + Sort Key (optional)",
          "GSI: Global Secondary Index — query on non-primary-key attributes",
          "LSI: Local Secondary Index — alternate sort key on same partition",
          "DynamoDB Streams: Ordered log of item changes, triggers Lambda",
          "DAX: In-memory cache, reduces read latency from ms to microseconds",
          "On-Demand Mode: Pay per request, no capacity planning",
          "Provisioned Mode: Set RCU/WCU, use Auto Scaling",
          "Transactions: ACID transactions across multiple items/tables",
          "TTL: Automatically expire items after a timestamp",
        ],
        pricing: "On-Demand: $1.25 per million write request units, $0.25 per million read request units. Storage: $0.25/GB/month.",
        examTip: "SAA-C03: Hot partition = low-cardinality partition key (e.g., 'country' with 5 values). Fix: use high-cardinality keys (user_id, order_id). DAX = microsecond reads. DynamoDB Streams + Lambda = event-driven architecture. DynamoDB is NOT relational — no joins, no SQL.",
      },
      {
        name: "Amazon ElastiCache",
        icon: "⚡",
        level: "Intermediate",
        tagline: "In-memory caching with Redis or Memcached",
        what: "ElastiCache provides managed in-memory caching. Redis supports persistence, pub/sub, sorted sets, and replication. Memcached is simpler, multi-threaded, no persistence.",
        when: "Use ElastiCache for: reducing database load (cache frequent queries), session storage, real-time leaderboards (Redis sorted sets), pub/sub messaging, rate limiting.",
        keyFeatures: [
          "Redis: Persistence, replication, pub/sub, sorted sets, Lua scripting, cluster mode",
          "Memcached: Simple, multi-threaded, no persistence, no replication",
          "Redis Cluster: Horizontal sharding across multiple nodes",
          "Redis Replication: Primary + up to 5 read replicas",
          "Lazy Loading: Cache on read miss (stale data possible)",
          "Write-Through: Update cache and DB simultaneously (no stale data, more writes)",
        ],
        pricing: "cache.t3.micro Redis: ~$0.017/hr. Cluster mode adds cost per shard.",
        examTip: "SAA-C03: Redis vs Memcached — if the question mentions persistence, pub/sub, sorted sets, or replication → Redis. If it just says 'simple caching, multi-threaded' → Memcached. ElastiCache is the answer for 'reduce database load' or 'session storage'.",
      },
      {
        name: "Amazon Redshift",
        icon: "📊",
        level: "Intermediate",
        tagline: "Petabyte-scale columnar data warehouse",
        what: "Redshift is a fully managed data warehouse optimized for analytical queries (OLAP) on large datasets. It uses columnar storage and massively parallel processing (MPP) to query terabytes to petabytes of data.",
        when: "Use Redshift for: business intelligence, analytics dashboards, historical data analysis, combining data from multiple sources for reporting.",
        keyFeatures: [
          "Columnar Storage: Only reads columns needed for a query — much faster for analytics",
          "Redshift Spectrum: Query S3 data directly without loading into Redshift",
          "RA3 Nodes: Separate compute and managed storage — scale independently",
          "Concurrency Scaling: Automatically add read capacity during peak demand",
          "Materialized Views: Pre-compute and cache complex query results",
          "Data Sharing: Share live data across Redshift clusters without copying",
        ],
        pricing: "dc2.large: $0.25/hr per node. RA3.xlplus: $1.086/hr per node. Spectrum: $5 per TB scanned.",
        examTip: "SAA-C03: Redshift = OLAP (analytics). RDS = OLTP (transactions). Redshift Spectrum = query S3 data lake from Redshift. For real-time analytics, use Kinesis Data Analytics. Redshift is NOT serverless by default (but Redshift Serverless now exists).",
      },
    ],
  },
  {
    id: "networking",
    label: "Networking",
    icon: "🌐",
    color: "#8b5cf6",
    desc: "VPC, load balancing, DNS, and CDN",
    services: [
      {
        name: "Amazon VPC",
        icon: "🏗️",
        level: "Beginner",
        tagline: "Your own private network inside AWS",
        what: "VPC (Virtual Private Cloud) is your isolated section of the AWS cloud where you launch resources. You define the IP address range, create subnets, configure route tables, and control network access.",
        when: "Every AWS resource you launch goes into a VPC. You design VPCs to isolate environments (dev/prod), control traffic flow, and implement security boundaries.",
        keyFeatures: [
          "CIDR Block: Define your IP range (e.g., 10.0.0.0/16)",
          "Subnets: Public (internet-accessible) or Private (no direct internet access)",
          "Internet Gateway: Enables internet access for public subnets",
          "NAT Gateway: Allows private subnets to initiate outbound internet connections",
          "Route Tables: Define where network traffic is directed",
          "Security Groups: Stateful firewall at the instance level (allow rules only)",
          "Network ACLs: Stateless firewall at the subnet level (allow + deny rules)",
          "VPC Peering: Private connection between two VPCs",
          "VPC Endpoints: Private access to AWS services without internet",
        ],
        pricing: "VPC itself is free. NAT Gateway: $0.045/hr + $0.045/GB processed. VPC Endpoints: $0.01/hr per AZ.",
        examTip: "SAA-C03: Security Groups are stateful (return traffic auto-allowed). NACLs are stateless (must explicitly allow return traffic). NAT Gateway = private subnet → internet (outbound only). Internet Gateway = public subnet ↔ internet (bidirectional). Default VPC exists in every region.",
      },
      {
        name: "Elastic Load Balancing",
        icon: "⚖️",
        level: "Beginner",
        tagline: "Distribute traffic across multiple targets",
        what: "ELB automatically distributes incoming traffic across multiple targets (EC2, containers, Lambda, IP addresses) in one or more AZs. It performs health checks and routes traffic only to healthy targets.",
        when: "Use a load balancer whenever you have more than one instance serving traffic — it provides both distribution and high availability.",
        keyFeatures: [
          "ALB (Application): Layer 7, path/host/header routing, WebSocket, HTTP/2, Lambda targets",
          "NLB (Network): Layer 4, ultra-low latency, static IP, TCP/UDP, millions of requests/sec",
          "GLB (Gateway): Layer 3, deploy/scale third-party network appliances (firewalls, IDS)",
          "Target Groups: EC2 instances, ECS tasks, Lambda functions, or IP addresses",
          "Health Checks: Remove unhealthy targets from rotation automatically",
          "Sticky Sessions: Route user to same target using cookies",
          "SSL Termination: Decrypt HTTPS at the load balancer, forward HTTP to targets",
          "Connection Draining: Finish in-flight requests before deregistering a target",
        ],
        pricing: "ALB: $0.008/LCU-hr + $0.018/hr. NLB: $0.006/NLCU-hr + $0.018/hr.",
        examTip: "SAA-C03: ALB = HTTP/HTTPS with path routing (e.g., /api → one target group, /static → another). NLB = TCP/UDP, static IP, extreme performance. GLB = security appliances. Cross-zone load balancing = distribute traffic evenly across all AZs.",
      },
      {
        name: "Amazon Route 53",
        icon: "🧭",
        level: "Beginner",
        tagline: "Scalable DNS and traffic routing",
        what: "Route 53 is AWS's highly available DNS service. It translates domain names to IP addresses and can route traffic based on latency, geography, health, or weighted distribution.",
        when: "Use Route 53 for: registering domain names, DNS for your AWS resources, health-check-based failover, global traffic routing.",
        keyFeatures: [
          "Simple: Single resource, no health checks",
          "Weighted: Split traffic by percentage (e.g., 90% to v1, 10% to v2)",
          "Latency: Route to the region with lowest latency for the user",
          "Failover: Active-passive failover based on health checks",
          "Geolocation: Route based on user's country or continent",
          "Geoproximity: Route based on geographic distance with bias",
          "Multivalue Answer: Return up to 8 healthy records (basic load balancing)",
          "Health Checks: Monitor endpoints, trigger failover",
          "Alias Records: Point to AWS resources (ALB, CloudFront, S3) — free queries",
        ],
        pricing: "Hosted zone: $0.50/month. DNS queries: $0.40 per million. Health checks: $0.50/month each.",
        examTip: "SAA-C03: Alias records are free and preferred over CNAME for AWS resources. Route 53 Latency routing ≠ lowest geographic distance — it's based on actual measured latency. Failover routing requires health checks. Route 53 can route to resources outside AWS.",
      },
      {
        name: "Amazon CloudFront",
        icon: "🚀",
        level: "Beginner",
        tagline: "Global CDN that caches content at the edge",
        what: "CloudFront is AWS's Content Delivery Network (CDN). It caches copies of your content at 600+ edge locations worldwide, reducing latency for users and reducing load on your origin.",
        when: "Use CloudFront for: static website delivery, video streaming, API acceleration, DDoS protection (with AWS Shield), serving private S3 content securely.",
        keyFeatures: [
          "Origins: S3, ALB, EC2, API Gateway, or any HTTP server",
          "Edge Locations: 600+ worldwide — content served from nearest location",
          "Cache Behaviors: Different caching rules for different URL patterns",
          "TTL: Control how long content is cached at the edge",
          "Origin Access Control (OAC): Restrict S3 bucket access to CloudFront only",
          "Lambda@Edge: Run code at edge locations (A/B testing, auth, redirects)",
          "CloudFront Functions: Lightweight JS at edge for simple transformations",
          "Signed URLs/Cookies: Restrict access to private content",
          "Price Classes: Limit edge locations to reduce cost",
        ],
        pricing: "First 1 TB/month free. Then $0.0085/GB for US/EU. Data transfer from origin to CloudFront is free.",
        examTip: "SAA-C03: CloudFront + S3 = serve static content globally. Use OAC (Origin Access Control) to make S3 bucket private and only accessible via CloudFront. CloudFront caches at edge — reduces origin load. For dynamic content, CloudFront still helps by using optimized AWS network paths.",
      },
      {
        name: "AWS Direct Connect",
        icon: "🔗",
        level: "Intermediate",
        tagline: "Dedicated private fiber link to AWS",
        what: "Direct Connect provides a dedicated network connection from your on-premises data center to AWS, bypassing the public internet. It offers consistent bandwidth, lower latency, and reduced data transfer costs.",
        when: "Use Direct Connect for: large data transfers (cheaper than internet egress), latency-sensitive workloads, compliance requirements for private connectivity, hybrid cloud architectures.",
        keyFeatures: [
          "Dedicated Connection: 1 Gbps or 10 Gbps physical fiber",
          "Hosted Connection: 50 Mbps to 10 Gbps via AWS partners",
          "Virtual Interfaces: Public VIF (AWS public services), Private VIF (VPC), Transit VIF",
          "Direct Connect Gateway: Connect one DX connection to multiple VPCs across regions",
          "LAG (Link Aggregation): Bundle multiple connections for redundancy and bandwidth",
          "Failover: Combine with VPN as backup for high availability",
        ],
        pricing: "Port hours: $0.30/hr for 1 Gbps. Data transfer out: $0.02/GB (vs $0.09/GB over internet).",
        examTip: "SAA-C03: Direct Connect = private, consistent, lower cost for large transfers. VPN = encrypted, over internet, quick to set up. For HA: use Direct Connect + VPN as backup. Direct Connect alone is NOT redundant — add a second connection or VPN for failover.",
      },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: "🔐",
    color: "#e11d48",
    desc: "Identity, encryption, threat detection, compliance",
    services: [
      {
        name: "AWS KMS",
        icon: "🔑",
        level: "Intermediate",
        tagline: "Managed encryption key service",
        what: "KMS (Key Management Service) creates and manages cryptographic keys used to encrypt your data across AWS services. Keys never leave KMS unencrypted — all encryption/decryption happens inside KMS.",
        when: "Use KMS whenever you need encryption at rest: S3 objects, EBS volumes, RDS databases, Lambda environment variables, Secrets Manager secrets.",
        keyFeatures: [
          "CMK (Customer Master Key): Your master key — never leaves KMS",
          "Data Keys: Generated by KMS, used to encrypt your actual data (envelope encryption)",
          "Envelope Encryption: Encrypt data with data key → encrypt data key with CMK",
          "Key Rotation: Automatic annual rotation for AWS-managed keys",
          "Key Policies: Control who can use and manage each key",
          "Multi-Region Keys: Replicate keys to multiple regions for global workloads",
          "CloudHSM: Dedicated hardware security module for highest compliance needs",
        ],
        pricing: "AWS-managed keys: free. Customer-managed keys: $1/month per key + $0.03 per 10,000 API calls.",
        examTip: "SAA-C03: KMS is the answer for 'encrypt data at rest'. Envelope encryption = encrypt data with data key, encrypt data key with CMK. CloudHSM = dedicated HSM hardware, you manage the keys (FIPS 140-2 Level 3). KMS = shared infrastructure, AWS manages hardware.",
      },
      {
        name: "AWS WAF & Shield",
        icon: "🛡️",
        level: "Intermediate",
        tagline: "Web application firewall and DDoS protection",
        what: "WAF (Web Application Firewall) filters malicious web traffic based on rules. Shield provides DDoS protection. Shield Standard is automatic and free. Shield Advanced provides 24/7 DDoS response team and cost protection.",
        when: "Use WAF for: blocking SQL injection, XSS, bad bots, rate limiting. Use Shield Advanced for: applications that need guaranteed DDoS protection and financial protection against scaling costs during attacks.",
        keyFeatures: [
          "WAF Rules: IP-based, geo-based, rate-based, string match, regex, managed rule groups",
          "OWASP Top 10: AWS Managed Rules cover common vulnerabilities",
          "Rate-Based Rules: Block IPs making too many requests",
          "Shield Standard: Automatic L3/L4 DDoS protection, free for all customers",
          "Shield Advanced: L7 DDoS protection, 24/7 DRT team, $3,000/month",
          "AWS Firewall Manager: Centrally manage WAF and Shield across accounts",
        ],
        pricing: "WAF: $5/month per WebACL + $1/month per rule + $0.60 per million requests. Shield Advanced: $3,000/month.",
        examTip: "SAA-C03: WAF attaches to ALB, CloudFront, API Gateway, or AppSync. Shield Standard = free, automatic. Shield Advanced = paid, human response team. For SQL injection/XSS protection → WAF. For DDoS → Shield. Both together = comprehensive protection.",
      },
      {
        name: "Amazon GuardDuty",
        icon: "🚨",
        level: "Intermediate",
        tagline: "Intelligent threat detection using ML",
        what: "GuardDuty continuously analyzes CloudTrail, VPC Flow Logs, and DNS logs using machine learning to detect threats like compromised credentials, cryptocurrency mining, unusual API calls, and data exfiltration.",
        when: "Enable GuardDuty in every AWS account and region as a baseline security measure. It requires no agents, no configuration — just enable it.",
        keyFeatures: [
          "Analyzes: CloudTrail events, VPC Flow Logs, DNS query logs, S3 data events",
          "Finding Types: UnauthorizedAccess, CryptoCurrency, Trojan, Backdoor, Recon",
          "ML-Based: Establishes baseline behavior, alerts on anomalies",
          "Threat Intelligence: Uses AWS and third-party threat feeds",
          "Multi-Account: Centralize findings across all accounts via Organizations",
          "Automated Response: Trigger Lambda to isolate compromised instances",
        ],
        pricing: "$4.00 per million CloudTrail events + $1.00 per GB of VPC Flow Logs + $1.00 per GB of DNS logs. 30-day free trial.",
        examTip: "SAA-C03: GuardDuty = threat detection (finds threats). Inspector = vulnerability scanning (finds vulnerabilities). Macie = sensitive data discovery in S3. Security Hub = aggregates findings from all security services. CloudTrail = audit log of API calls.",
      },
      {
        name: "AWS Secrets Manager",
        icon: "🗝️",
        level: "Intermediate",
        tagline: "Store, rotate, and retrieve secrets automatically",
        what: "Secrets Manager stores sensitive credentials (database passwords, API keys, OAuth tokens) and can automatically rotate them without requiring application changes.",
        when: "Use Secrets Manager for: database credentials that need rotation, API keys, OAuth tokens, any secret that should never be hardcoded in code or environment variables.",
        keyFeatures: [
          "Automatic Rotation: Built-in rotation for RDS, Redshift, DocumentDB",
          "Custom Rotation: Lambda function for any secret type",
          "Cross-Account Access: Share secrets across AWS accounts",
          "Versioning: Multiple versions of a secret (AWSCURRENT, AWSPENDING, AWSPREVIOUS)",
          "Integration: Direct integration with RDS, Redshift, DocumentDB",
          "Encryption: All secrets encrypted with KMS",
        ],
        pricing: "$0.40/secret/month + $0.05 per 10,000 API calls.",
        examTip: "SAA-C03: Secrets Manager vs Parameter Store — Secrets Manager = automatic rotation, higher cost. Parameter Store = free tier, no automatic rotation. For database passwords → Secrets Manager. For app config values → Parameter Store. Never store secrets in code or EC2 user data.",
      },
      {
        name: "AWS CloudTrail",
        icon: "📝",
        level: "Beginner",
        tagline: "Audit log of every API call in your account",
        what: "CloudTrail records every API call made in your AWS account — who did what, when, from where, and with what result. It is your primary forensic tool after a security incident.",
        when: "CloudTrail should always be enabled. Use it for: security investigations, compliance audits, debugging permission issues, tracking resource changes.",
        keyFeatures: [
          "Management Events: Control plane actions (create/delete/modify resources)",
          "Data Events: S3 object-level operations, Lambda invocations (high volume, extra cost)",
          "CloudTrail Insights: Detect unusual API activity automatically",
          "Multi-Region Trail: Single trail capturing events from all regions",
          "Log File Integrity: SHA-256 hash validation to detect tampering",
          "Integration: Send logs to S3, CloudWatch Logs, or EventBridge",
        ],
        pricing: "Management events: first copy free per region. Additional trails: $2.00 per 100,000 events. Data events: $0.10 per 100,000 events.",
        examTip: "SAA-C03: CloudTrail = who did what (API audit). CloudWatch = what is happening now (metrics/logs). Config = what changed (configuration history). GuardDuty = is something malicious happening (threat detection). These four services cover the full security monitoring picture.",
      },
    ],
  },
  {
    id: "serverless",
    label: "Serverless",
    icon: "⚡",
    color: "#6366f1",
    desc: "Build without managing servers",
    services: [
      {
        name: "Amazon API Gateway",
        icon: "🚪",
        level: "Beginner",
        tagline: "Create, publish, and manage APIs at any scale",
        what: "API Gateway is a fully managed service for creating RESTful APIs, HTTP APIs, and WebSocket APIs. It handles traffic management, authorization, throttling, monitoring, and version management.",
        when: "Use API Gateway as the front door for Lambda functions, as a proxy to other AWS services, or to build serverless APIs.",
        keyFeatures: [
          "REST API: Full-featured, supports API keys, usage plans, request/response transformation",
          "HTTP API: Simpler, cheaper, lower latency — best for Lambda and HTTP backends",
          "WebSocket API: Bidirectional communication for real-time apps (chat, gaming)",
          "Authorizers: Lambda authorizers, Cognito User Pools, JWT",
          "Throttling: Rate limiting per API key or globally",
          "Caching: Cache responses at the edge for up to 1 hour",
          "Stage Variables: Different configs for dev/staging/prod",
        ],
        pricing: "HTTP API: $1.00 per million requests. REST API: $3.50 per million requests. WebSocket: $1.00 per million messages.",
        examTip: "SAA-C03: API Gateway + Lambda = serverless API pattern. HTTP API is cheaper and simpler than REST API — use HTTP API unless you need advanced features. API Gateway handles SSL, throttling, and auth so Lambda doesn't have to.",
      },
      {
        name: "AWS Step Functions",
        icon: "🔄",
        level: "Intermediate",
        tagline: "Orchestrate Lambda functions as visual workflows",
        what: "Step Functions lets you build serverless workflows by coordinating multiple AWS services. You define states (tasks, choices, parallel, wait) in a visual workflow and Step Functions manages execution, retries, and error handling.",
        when: "Use Step Functions for: multi-step business processes, ETL pipelines, order processing, approval workflows, any workflow that requires coordination between multiple Lambda functions.",
        keyFeatures: [
          "Standard Workflows: Long-running (up to 1 year), exactly-once execution, audit history",
          "Express Workflows: High-volume, short-duration (up to 5 min), at-least-once",
          "States: Task, Choice, Parallel, Map, Wait, Pass, Succeed, Fail",
          "Error Handling: Built-in retry and catch logic",
          "Visual Editor: Drag-and-drop workflow designer in AWS console",
          "Integrations: Lambda, ECS, SQS, SNS, DynamoDB, Glue, SageMaker, and more",
        ],
        pricing: "Standard: $0.025 per 1,000 state transitions. Express: $1.00 per million workflow requests + duration.",
        examTip: "SAA-C03: Step Functions = orchestration (one service calls others). EventBridge = event routing (publish/subscribe). SQS = decoupling (queue between services). Use Step Functions when you need to coordinate multiple Lambda functions with retry logic and error handling.",
      },
      {
        name: "Amazon SQS",
        icon: "📬",
        level: "Beginner",
        tagline: "Fully managed message queue service",
        what: "SQS (Simple Queue Service) is a message queue that decouples application components. Producers send messages to the queue; consumers poll and process them independently.",
        when: "Use SQS for: decoupling microservices, buffering requests during traffic spikes, distributing work across multiple consumers, ensuring no messages are lost if a consumer fails.",
        keyFeatures: [
          "Standard Queue: At-least-once delivery, best-effort ordering, unlimited throughput",
          "FIFO Queue: Exactly-once processing, strict ordering, 3,000 msg/sec with batching",
          "Visibility Timeout: Message hidden from other consumers while being processed",
          "Dead Letter Queue (DLQ): Messages that fail processing N times go here",
          "Long Polling: Reduce empty responses by waiting up to 20s for messages",
          "Message Retention: 1 minute to 14 days (default 4 days)",
          "Max Message Size: 256 KB (use S3 + SQS Extended Client for larger)",
        ],
        pricing: "First 1 million requests/month free. Then $0.40 per million requests (Standard) or $0.50 per million (FIFO).",
        examTip: "SAA-C03: SQS = pull-based (consumers poll). SNS = push-based (subscribers receive). SQS + SNS fan-out = send one message to multiple SQS queues via SNS topic. FIFO = ordered + exactly-once. Standard = higher throughput but possible duplicates.",
      },
      {
        name: "Amazon SNS",
        icon: "📢",
        level: "Beginner",
        tagline: "Pub/sub messaging and mobile notifications",
        what: "SNS (Simple Notification Service) is a pub/sub messaging service. Publishers send messages to topics; SNS delivers them to all subscribers (SQS, Lambda, HTTP, email, SMS, mobile push).",
        when: "Use SNS for: fan-out (send one message to multiple systems), application alerts, mobile push notifications, email/SMS notifications.",
        keyFeatures: [
          "Topics: Named channels that messages are published to",
          "Subscriptions: SQS, Lambda, HTTP/HTTPS, email, SMS, mobile push",
          "Fan-Out Pattern: One SNS topic → multiple SQS queues",
          "Message Filtering: Subscribers receive only messages matching their filter policy",
          "FIFO Topics: Ordered delivery to FIFO SQS queues",
          "Message Attributes: Metadata attached to messages for filtering",
        ],
        pricing: "First 1 million publishes/month free. Then $0.50 per million. SMS: $0.00645 per message (US).",
        examTip: "SAA-C03: SNS Fan-Out = publish once to SNS, deliver to multiple SQS queues simultaneously. This is the standard pattern for decoupled parallel processing. SNS + SQS = reliable fan-out (SQS ensures messages aren't lost if a consumer is down).",
      },
      {
        name: "Amazon EventBridge",
        icon: "🚌",
        level: "Intermediate",
        tagline: "Serverless event bus connecting AWS services",
        what: "EventBridge is a serverless event bus that routes events between AWS services, SaaS applications, and your own applications. It replaces CloudWatch Events and adds SaaS integrations and schema registry.",
        when: "Use EventBridge for: reacting to AWS service events (EC2 state change, S3 upload), scheduled tasks (cron), integrating with SaaS tools (Zendesk, Datadog, Salesforce), building event-driven architectures.",
        keyFeatures: [
          "Default Event Bus: Receives events from AWS services",
          "Custom Event Buses: For your own application events",
          "Partner Event Buses: Receive events from SaaS partners",
          "Rules: Filter events by pattern and route to targets",
          "Targets: Lambda, SQS, SNS, Step Functions, ECS, API Gateway, and more",
          "Scheduler: Cron and rate-based scheduled tasks",
          "Schema Registry: Discover and manage event schemas",
        ],
        pricing: "$1.00 per million custom events. AWS service events are free.",
        examTip: "SAA-C03: EventBridge = event routing and scheduling. For 'trigger Lambda on a schedule' → EventBridge Scheduler (or CloudWatch Events). For 'react to AWS service events' → EventBridge rules. EventBridge is more powerful than SNS for event routing due to content-based filtering.",
      },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "📊",
    color: "#0ea5e9",
    desc: "Data processing, streaming, and visualization",
    services: [
      {
        name: "Amazon Kinesis",
        icon: "🌊",
        level: "Intermediate",
        tagline: "Real-time data streaming and processing",
        what: "Kinesis is a family of services for real-time data streaming. Kinesis Data Streams ingests and stores streaming data. Kinesis Data Firehose delivers streaming data to destinations. Kinesis Data Analytics processes streams with SQL or Apache Flink.",
        when: "Use Kinesis for: real-time analytics, log and event data collection, IoT telemetry, clickstream analysis, fraud detection.",
        keyFeatures: [
          "Data Streams: Ingest and store data in shards (1 MB/s in, 2 MB/s out per shard)",
          "Data Firehose: Fully managed delivery to S3, Redshift, OpenSearch, Splunk",
          "Data Analytics: Real-time SQL queries on streaming data",
          "Video Streams: Ingest and process video streams",
          "Retention: 24 hours default, up to 365 days",
          "Enhanced Fan-Out: 2 MB/s per consumer per shard (dedicated throughput)",
        ],
        pricing: "Data Streams: $0.015/shard-hour + $0.014 per million PUT records. Firehose: $0.029 per GB ingested.",
        examTip: "SAA-C03: Kinesis vs SQS — Kinesis = real-time streaming, ordered, multiple consumers, replay. SQS = queue, at-least-once, one consumer per message. For real-time analytics → Kinesis. For decoupling microservices → SQS. Kinesis Firehose = easiest way to get streaming data into S3.",
      },
      {
        name: "AWS Glue",
        icon: "🔧",
        level: "Intermediate",
        tagline: "Serverless ETL and data catalog",
        what: "Glue is a serverless data integration service for ETL (Extract, Transform, Load) jobs. It includes a Data Catalog (metadata store), ETL job engine (Apache Spark), and DataBrew (visual data preparation).",
        when: "Use Glue for: transforming and loading data into Redshift or S3, cataloging data lake assets, preparing data for analytics, building ETL pipelines without managing servers.",
        keyFeatures: [
          "Data Catalog: Central metadata repository for all your data assets",
          "ETL Jobs: PySpark or Scala scripts, auto-generated from schema",
          "Glue Crawlers: Automatically discover and catalog data in S3, RDS, DynamoDB",
          "Glue Studio: Visual ETL job designer",
          "DataBrew: Visual data preparation for analysts (no code)",
          "Elastic Views: Combine data from multiple sources with SQL",
        ],
        pricing: "ETL jobs: $0.44 per DPU-hour. Crawlers: $0.44 per DPU-hour. Data Catalog: first 1M objects free.",
        examTip: "SAA-C03: Glue = serverless ETL. For the data lake pattern: S3 (raw data) → Glue (transform) → S3 (processed) → Athena (query) or Redshift (warehouse). Glue Data Catalog integrates with Athena, Redshift Spectrum, and EMR.",
      },
      {
        name: "Amazon Athena",
        icon: "🔍",
        level: "Intermediate",
        tagline: "Query S3 data with SQL — no loading required",
        what: "Athena is a serverless interactive query service that lets you analyze data in S3 using standard SQL. No infrastructure to manage — you just point it at your S3 data and run queries.",
        when: "Use Athena for: ad-hoc analysis of S3 data, querying log files, analyzing CloudTrail/ALB/VPC Flow Logs, building a data lake query layer.",
        keyFeatures: [
          "Serverless: No infrastructure, no cluster to manage",
          "Formats: CSV, JSON, Parquet, ORC, Avro, TSV",
          "Partitioning: Reduce data scanned by organizing data into partitions",
          "Columnar Formats: Use Parquet/ORC to reduce cost by 30–90%",
          "Federated Query: Query data in RDS, DynamoDB, Redshift alongside S3",
          "Workgroups: Separate query environments with cost controls",
        ],
        pricing: "$5 per TB of data scanned. Use columnar formats and partitioning to minimize cost.",
        examTip: "SAA-C03: Athena = serverless SQL on S3. To reduce Athena costs: convert to Parquet/ORC (columnar) and partition data by date/region. Athena + Glue Data Catalog = standard data lake query pattern. Athena is NOT for real-time queries — use Kinesis for that.",
      },
      {
        name: "Amazon QuickSight",
        icon: "📈",
        level: "Beginner",
        tagline: "Business intelligence and data visualization",
        what: "QuickSight is AWS's cloud-native BI service for creating interactive dashboards and visualizations. It connects to Redshift, Athena, S3, RDS, and many other sources.",
        when: "Use QuickSight for: business dashboards, self-service analytics for non-technical users, embedding analytics in your applications.",
        keyFeatures: [
          "SPICE: In-memory calculation engine for fast queries",
          "ML Insights: Anomaly detection, forecasting, natural language narratives",
          "Embedded Analytics: Embed dashboards in your applications",
          "Row-Level Security: Control data access per user",
          "Q: Natural language queries ('What were sales last quarter?')",
        ],
        pricing: "Standard: $9/user/month (authors), $18/user/month (enterprise). Reader sessions: $0.30/session (max $5/month).",
        examTip: "SAA-C03: QuickSight = visualization layer. Data pipeline: S3 → Glue → Redshift → QuickSight. Or: S3 → Athena → QuickSight. QuickSight is the answer when the question asks for 'business intelligence dashboards' or 'data visualization'.",
      },
    ],
  },
  {
    id: "mlai",
    label: "ML & AI",
    icon: "🤖",
    color: "#ec4899",
    desc: "Machine learning, AI services, and generative AI",
    services: [
      {
        name: "Amazon SageMaker",
        icon: "🧠",
        level: "Advanced",
        tagline: "Build, train, and deploy ML models at scale",
        what: "SageMaker is a fully managed ML platform covering the entire ML lifecycle: data labeling, feature engineering, model training, hyperparameter tuning, model deployment, and monitoring.",
        when: "Use SageMaker when you need to build custom ML models, train on large datasets, or deploy models at scale with auto-scaling inference endpoints.",
        keyFeatures: [
          "Studio: Integrated IDE for the entire ML workflow",
          "Training Jobs: Managed distributed training on GPU/CPU clusters",
          "Autopilot: AutoML — automatically builds and tunes models",
          "Feature Store: Centralized repository for ML features",
          "Model Registry: Version and deploy models with approval workflows",
          "Endpoints: Real-time inference with auto-scaling",
          "Batch Transform: Offline inference on large datasets",
          "Clarify: Detect bias and explain model predictions",
        ],
        pricing: "Training: ml.p3.2xlarge ~$3.825/hr. Inference endpoints: ml.m5.large ~$0.134/hr. Studio: free (pay for underlying compute).",
        examTip: "SAA-C03: SageMaker = custom ML models. For pre-built AI services (image recognition, NLP, speech) use Rekognition, Comprehend, Polly, Transcribe, Translate. SageMaker is for when you need to train your own model on your own data.",
      },
      {
        name: "AWS AI Services",
        icon: "🎯",
        level: "Beginner",
        tagline: "Pre-built AI capabilities via API",
        what: "AWS offers a suite of pre-trained AI services accessible via API — no ML expertise required. Each service is purpose-built for a specific use case.",
        when: "Use these services when you need AI capabilities without building or training models. They work out of the box with your data.",
        keyFeatures: [
          "Rekognition: Image/video analysis — object detection, facial recognition, content moderation",
          "Comprehend: NLP — sentiment analysis, entity extraction, topic modeling, language detection",
          "Polly: Text-to-speech — 60+ voices, 29 languages, SSML support",
          "Transcribe: Speech-to-text — automatic speech recognition, speaker identification",
          "Translate: Neural machine translation — 75 languages",
          "Textract: Extract text and data from scanned documents",
          "Forecast: Time-series forecasting using ML",
          "Personalize: Real-time personalization and recommendations",
          "Fraud Detector: Detect online fraud using ML",
          "Bedrock: Access foundation models (Claude, Llama, Titan) via API",
        ],
        pricing: "Pay per API call. Rekognition: $0.001 per image. Transcribe: $0.024 per minute. Translate: $15 per million characters.",
        examTip: "SAA-C03: Know which service does what: Rekognition = images/video, Comprehend = text/NLP, Polly = text→speech, Transcribe = speech→text, Translate = language translation, Textract = document extraction. These are all managed services — no ML knowledge needed.",
      },
      {
        name: "Amazon Bedrock",
        icon: "💎",
        level: "Intermediate",
        tagline: "Access foundation models via API",
        what: "Bedrock provides access to leading foundation models (FMs) from AI companies including Anthropic (Claude), Meta (Llama), Mistral, Cohere, and Amazon (Titan) via a single API. No infrastructure to manage.",
        when: "Use Bedrock for: building generative AI applications, chatbots, content generation, summarization, code generation, without managing ML infrastructure.",
        keyFeatures: [
          "Model Choice: Claude, Llama, Mistral, Cohere Command, Amazon Titan",
          "Knowledge Bases: Connect FMs to your private data (RAG)",
          "Agents: Build AI agents that can take actions via APIs",
          "Fine-Tuning: Customize models with your own data",
          "Guardrails: Content filtering and safety controls",
          "Model Evaluation: Compare model performance on your use case",
        ],
        pricing: "Pay per token. Claude 3 Sonnet: $3/million input tokens, $15/million output tokens.",
        examTip: "SAA-C03: Bedrock = generative AI via API. For RAG (Retrieval Augmented Generation) → Bedrock Knowledge Bases. Bedrock is the answer when the question asks for 'generative AI', 'LLM', or 'foundation model' integration.",
      },
    ],
  },
  {
    id: "devops",
    label: "DevOps & CI/CD",
    icon: "🔄",
    color: "#14b8a6",
    desc: "Deployment automation, monitoring, and infrastructure as code",
    services: [
      {
        name: "AWS CloudFormation",
        icon: "📐",
        level: "Intermediate",
        tagline: "Infrastructure as Code for AWS",
        what: "CloudFormation lets you define your AWS infrastructure in JSON or YAML templates. It provisions and manages resources as a stack, enabling repeatable, version-controlled infrastructure deployments.",
        when: "Use CloudFormation for: provisioning consistent environments (dev/staging/prod), disaster recovery (recreate infrastructure from templates), compliance (enforce standard configurations).",
        keyFeatures: [
          "Templates: JSON/YAML describing resources and their configurations",
          "Stacks: A collection of AWS resources managed as a single unit",
          "Change Sets: Preview changes before applying them",
          "Drift Detection: Identify resources that changed outside CloudFormation",
          "StackSets: Deploy stacks across multiple accounts and regions",
          "Nested Stacks: Reuse templates by referencing other stacks",
          "CDK: AWS Cloud Development Kit — define infrastructure in TypeScript, Python, Java",
        ],
        pricing: "CloudFormation is free. You pay for the resources it creates.",
        examTip: "SAA-C03: CloudFormation = IaC for AWS. CDK = higher-level IaC using programming languages (compiles to CloudFormation). Terraform = third-party IaC that also supports AWS. For 'deploy same infrastructure in multiple regions' → CloudFormation StackSets.",
      },
      {
        name: "Amazon CloudWatch",
        icon: "📡",
        level: "Beginner",
        tagline: "Monitoring, logging, and alerting",
        what: "CloudWatch collects metrics, logs, and events from AWS services and your applications. It provides dashboards, alarms, and automated actions based on thresholds.",
        when: "Use CloudWatch for: monitoring EC2 CPU/memory, setting alarms for high error rates, aggregating application logs, creating dashboards, triggering Auto Scaling.",
        keyFeatures: [
          "Metrics: Time-series data from AWS services (CPU, NetworkIn, RequestCount)",
          "Custom Metrics: Push your own application metrics via API",
          "Logs: Collect, store, and analyze log files from EC2, Lambda, containers",
          "Alarms: Trigger actions (SNS, Auto Scaling, EC2 actions) on metric thresholds",
          "Dashboards: Visualize metrics across services and regions",
          "Log Insights: Interactive SQL-like queries on log data",
          "Container Insights: Enhanced monitoring for ECS and EKS",
          "Application Insights: Automated monitoring for .NET and SQL Server apps",
        ],
        pricing: "First 10 custom metrics free. Then $0.30/metric/month. Logs: $0.50/GB ingested. Alarms: $0.10/alarm/month.",
        examTip: "SAA-C03: CloudWatch = monitoring and alerting. CloudTrail = API audit logging. By default, EC2 sends basic metrics every 5 minutes. Enable detailed monitoring for 1-minute granularity ($0.014/metric/month). CloudWatch Agent required for memory and disk metrics (not collected by default).",
      },
      {
        name: "AWS CodePipeline & CodeDeploy",
        icon: "🚀",
        level: "Intermediate",
        tagline: "Automated CI/CD pipelines",
        what: "CodePipeline orchestrates CI/CD workflows. CodeBuild compiles code and runs tests. CodeDeploy automates deployments to EC2, Lambda, and ECS. Together they form a complete DevOps pipeline.",
        when: "Use these services for: automating deployments from code commit to production, implementing blue/green deployments, rolling updates, canary releases.",
        keyFeatures: [
          "CodeCommit: Managed Git repository (similar to GitHub)",
          "CodeBuild: Managed build service — compile, test, package",
          "CodeDeploy: Automated deployment to EC2, Lambda, ECS",
          "CodePipeline: Orchestrate the full pipeline (source → build → test → deploy)",
          "Deployment Strategies: In-place, blue/green, canary, linear",
          "AppSpec: Deployment configuration file for CodeDeploy",
        ],
        pricing: "CodePipeline: $1/active pipeline/month. CodeBuild: $0.005/build minute. CodeDeploy: free for EC2/Lambda, $0.02/on-premises instance update.",
        examTip: "SAA-C03: Blue/Green deployment = deploy new version alongside old, switch traffic instantly, easy rollback. Canary = send small % of traffic to new version first. Rolling = update instances in batches. In-place = update existing instances (downtime possible).",
      },
      {
        name: "AWS X-Ray",
        icon: "🔬",
        level: "Intermediate",
        tagline: "Distributed tracing for microservices",
        what: "X-Ray traces requests as they travel through your distributed application, showing the full path from API Gateway through Lambda, DynamoDB, and other services. It helps identify bottlenecks and errors.",
        when: "Use X-Ray for: debugging latency issues in microservices, finding which service is causing errors, understanding the full request flow in a distributed system.",
        keyFeatures: [
          "Service Map: Visual representation of your application's components",
          "Traces: End-to-end request path with timing for each segment",
          "Subsegments: Break down individual service calls",
          "Annotations: Key-value pairs for filtering and grouping traces",
          "Sampling: Configurable trace sampling to control cost",
          "Integration: Lambda, API Gateway, ECS, EC2, Elastic Beanstalk",
        ],
        pricing: "$5 per million traces recorded. $0.50 per million traces retrieved.",
        examTip: "SAA-C03: X-Ray = distributed tracing. CloudWatch = metrics and logs. For 'identify which Lambda function is slow in a microservices chain' → X-Ray. X-Ray requires the X-Ray SDK in your code and the X-Ray daemon running on your instances.",
      },
    ],
  },
  {
    id: "cost",
    label: "Cost Management",
    icon: "💰",
    color: "#f97316",
    desc: "Optimize and control your AWS spending",
    services: [
      {
        name: "AWS Cost Explorer",
        icon: "📊",
        level: "Beginner",
        tagline: "Visualize and analyze your AWS costs",
        what: "Cost Explorer provides an interactive interface to visualize, understand, and manage your AWS costs and usage over time. It shows spending by service, region, account, or tag.",
        when: "Use Cost Explorer for: understanding what's driving your bill, identifying cost anomalies, forecasting future costs, finding optimization opportunities.",
        keyFeatures: [
          "Cost and Usage Reports: Granular billing data (hourly, resource-level)",
          "Rightsizing Recommendations: Identify over-provisioned EC2 instances",
          "Savings Plans Recommendations: Estimate savings from commitment-based pricing",
          "Cost Anomaly Detection: ML-based alerts for unexpected spending",
          "Forecasting: Predict future costs based on historical trends",
          "Tag-Based Analysis: Break down costs by business unit, project, or environment",
        ],
        pricing: "Cost Explorer: free. Cost and Usage Report: $0.01 per 1,000 report rows.",
        examTip: "CLF-C02: Cost Explorer = analyze past and present costs. AWS Budgets = set alerts for future costs. Trusted Advisor = recommendations for cost, security, performance, fault tolerance. Pricing Calculator = estimate costs before deploying.",
      },
      {
        name: "AWS Trusted Advisor",
        icon: "💡",
        level: "Beginner",
        tagline: "Real-time guidance to optimize your AWS environment",
        what: "Trusted Advisor analyzes your AWS environment and provides recommendations across 5 categories: Cost Optimization, Performance, Security, Fault Tolerance, and Service Limits.",
        when: "Use Trusted Advisor for: identifying unused resources, finding security vulnerabilities, checking service limit utilization, getting optimization recommendations.",
        keyFeatures: [
          "Cost Optimization: Idle EC2, unattached EBS, underutilized RDS",
          "Security: Open security groups, MFA on root, public S3 buckets",
          "Fault Tolerance: Multi-AZ RDS, EBS snapshots, Auto Scaling",
          "Performance: High-utilization EC2, CloudFront optimization",
          "Service Limits: Alert when approaching service quotas",
          "Business/Enterprise Support: Full access to all checks",
        ],
        pricing: "Basic checks: free for all. Full access requires Business ($100/month) or Enterprise ($15,000/month) support.",
        examTip: "CLF-C02: Trusted Advisor = automated best practice recommendations. Basic/Developer support = 7 core checks only. Business/Enterprise = all 115+ checks. For the exam: Trusted Advisor checks for open security groups, MFA on root account, and service limits.",
      },
      {
        name: "AWS Savings Plans & Reserved Instances",
        icon: "🏷️",
        level: "Beginner",
        tagline: "Commit to usage for significant discounts",
        what: "Savings Plans and Reserved Instances offer discounts of 30–72% compared to On-Demand pricing in exchange for a 1 or 3-year usage commitment.",
        when: "Use for any steady-state workload that runs continuously. If you know you'll need EC2/Lambda/Fargate for the next year, commit and save significantly.",
        keyFeatures: [
          "Compute Savings Plans: 66% discount, flexible across EC2, Lambda, Fargate",
          "EC2 Instance Savings Plans: 72% discount, specific instance family in a region",
          "Standard Reserved Instances: 72% discount, specific instance type/AZ",
          "Convertible Reserved Instances: 66% discount, can change instance type",
          "Spot Instances: Up to 90% discount, interruptible with 2-minute warning",
          "Dedicated Hosts: Physical server for licensing compliance",
        ],
        pricing: "Example: m5.large On-Demand = $0.096/hr. 1yr Standard RI = $0.056/hr (42% savings). 3yr Standard RI = $0.038/hr (60% savings).",
        examTip: "SAA-C03: Spot = cheapest, interruptible (use for batch/fault-tolerant). Reserved = cheapest for steady-state. On-Demand = flexibility, no commitment. Dedicated Host = compliance/licensing (bring your own license). Savings Plans are more flexible than RIs.",
      },
    ],
  },
];

// ─── HELPER COMPONENTS ─────────────────────────────────────────────────────────
function LevelBadge({ level }) {
  const colors = { Beginner: C.green, Intermediate: C.accent, Advanced: C.red };
  const color = colors[level] || C.muted;
  return (
    <span style={{
      background: `${color}18`, border: `1px solid ${color}45`, color,
      padding: "2px 8px", borderRadius: 4, fontSize: 10,
      fontFamily: FONT_CODE, letterSpacing: 1,
    }}>{level.toUpperCase()}</span>
  );
}

function ServiceCard({ service, catColor }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: C.panel, border: `1px solid ${expanded ? catColor + "50" : C.border}`,
      borderRadius: 12, overflow: "hidden",
      transition: "all 0.2s",
      boxShadow: expanded ? `0 0 20px ${catColor}15` : "none",
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: "16px 18px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 14,
          background: expanded ? `${catColor}08` : "transparent",
        }}
        onMouseEnter={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = `${catColor}06`; }}
        onMouseLeave={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: `${catColor}18`, border: `1px solid ${catColor}40`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>{service.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ color: C.text, fontFamily: FONT_CODE, fontSize: 13, fontWeight: "bold" }}>{service.name}</span>
            <LevelBadge level={service.level} />
          </div>
          <div style={{ color: C.muted, fontFamily: "monospace", fontSize: 11 }}>{service.tagline}</div>
        </div>
        <div style={{ color: C.muted, fontSize: 16, flexShrink: 0 }}>{expanded ? "▲" : "▼"}</div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${C.border}` }}>
          {/* What is it */}
          <div style={{ marginTop: 16 }}>
            <div style={{ color: catColor, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>WHAT IS IT?</div>
            <p style={{ color: C.text, fontFamily: "monospace", fontSize: 12, lineHeight: 1.8, margin: 0 }}>{service.what}</p>
          </div>

          {/* When to use */}
          <div style={{ marginTop: 16 }}>
            <div style={{ color: C.blue, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>WHEN TO USE IT</div>
            <p style={{ color: C.text, fontFamily: "monospace", fontSize: 12, lineHeight: 1.8, margin: 0 }}>{service.when}</p>
          </div>

          {/* Key features */}
          <div style={{ marginTop: 16 }}>
            <div style={{ color: C.purple, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>KEY FEATURES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {service.keyFeatures.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: catColor, fontFamily: FONT_CODE, fontSize: 10, marginTop: 2, flexShrink: 0 }}>▸</span>
                  <span style={{ color: C.muted, fontFamily: "monospace", fontSize: 11, lineHeight: 1.6 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div style={{ marginTop: 16, background: C.raised, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.border}` }}>
            <div style={{ color: C.green, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>💰 PRICING OVERVIEW</div>
            <p style={{ color: C.muted, fontFamily: "monospace", fontSize: 11, lineHeight: 1.6, margin: 0 }}>{service.pricing}</p>
          </div>

          {/* Exam tip */}
          <div style={{ marginTop: 12, background: `${C.accent}08`, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.accent}30` }}>
            <div style={{ color: C.accent, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>🎯 EXAM TIP</div>
            <p style={{ color: C.text, fontFamily: "monospace", fontSize: 11, lineHeight: 1.7, margin: 0 }}>{service.examTip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function LearningCenter() {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState("foundations");
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");

  const totalServices = CATEGORIES.reduce((sum, c) => sum + c.services.length, 0);

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory);

  const filteredServices = useMemo(() => {
    if (!currentCategory) return [];
    return currentCategory.services.filter(s => {
      const matchSearch = search === "" ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.tagline.toLowerCase().includes(search.toLowerCase()) ||
        s.what.toLowerCase().includes(search.toLowerCase());
      const matchLevel = levelFilter === "All" || s.level === levelFilter;
      return matchSearch && matchLevel;
    });
  }, [currentCategory, search, levelFilter]);

  // Global search across all categories
  const globalSearchResults = useMemo(() => {
    if (search.length < 2) return null;
    const results = [];
    CATEGORIES.forEach(cat => {
      cat.services.forEach(s => {
        if (
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.tagline.toLowerCase().includes(search.toLowerCase()) ||
          s.what.toLowerCase().includes(search.toLowerCase())
        ) {
          results.push({ ...s, catColor: cat.color, catLabel: cat.label });
        }
      });
    });
    return results;
  }, [search]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "20px 16px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap');`}</style>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <button onClick={() => navigate("/dashboard")} style={{
            background: "none", border: "none", color: C.muted, cursor: "pointer",
            fontFamily: FONT_CODE, fontSize: 11, letterSpacing: 1, padding: 0, marginBottom: 14,
          }}>← BACK TO DASHBOARD</button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `linear-gradient(135deg,${C.accent}30,${C.accentDim || "#92400e"}20)`,
                  border: `1px solid ${C.accent}50`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                }}>📚</div>
                <div>
                  <div style={{ color: C.text, fontFamily: FONT_CODE, fontSize: 18, fontWeight: "bold" }}>
                    AWS <span style={{ color: C.accent, textShadow: `0 0 18px ${C.accent}70` }}>Learning Center</span>
                  </div>
                  <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1 }}>
                    {CATEGORIES.length} CATEGORIES · {totalServices} SERVICES · FROM ZERO TO AWS
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => navigate("/game")} style={{
              background: `${C.accent}12`, border: `1px solid ${C.accent}45`, color: C.accent,
              padding: "8px 16px", borderRadius: 8, cursor: "pointer",
              fontFamily: FONT_CODE, fontSize: 11, letterSpacing: 1,
            }}>🎮 TRAINING ARENA →</button>
          </div>
        </div>

        {/* Search + Filter */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <input
              type="text"
              placeholder="Search any AWS service..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px 10px 36px",
                background: C.panel, border: `1px solid ${search ? C.accent : C.border}`,
                borderRadius: 8, color: C.text, fontFamily: "monospace", fontSize: 12,
                outline: "none", boxSizing: "border-box",
                boxShadow: search ? `0 0 12px ${C.accent}20` : "none",
              }}
            />
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 14 }}>🔍</span>
          </div>
          {["All", "Beginner", "Intermediate", "Advanced"].map(lvl => (
            <button key={lvl} onClick={() => setLevelFilter(lvl)} style={{
              padding: "8px 14px", borderRadius: 8, cursor: "pointer",
              fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1,
              border: `1px solid ${levelFilter === lvl ? C.accent : C.border}`,
              background: levelFilter === lvl ? `${C.accent}18` : C.panel,
              color: levelFilter === lvl ? C.accent : C.muted,
            }}>{lvl.toUpperCase()}</button>
          ))}
        </div>

        {/* Global search results */}
        {search.length >= 2 && globalSearchResults && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 12 }}>
              SEARCH RESULTS — {globalSearchResults.length} SERVICES FOUND
            </div>
            {globalSearchResults.length === 0 ? (
              <div style={{ color: C.muted, fontFamily: "monospace", fontSize: 12, textAlign: "center", padding: "32px 0" }}>
                No services found for "{search}"
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {globalSearchResults.map(s => (
                  <ServiceCard key={s.name} service={s} catColor={s.catColor} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category tabs + content (only show when not searching) */}
        {search.length < 2 && (
          <div style={{ display: "flex", gap: 16 }}>
            {/* Sidebar categories */}
            <div style={{ width: 180, flexShrink: 0 }}>
              <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 9, letterSpacing: 2, marginBottom: 10 }}>CATEGORIES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                    padding: "10px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                    border: `1px solid ${activeCategory === cat.id ? cat.color + "50" : "transparent"}`,
                    background: activeCategory === cat.id ? `${cat.color}12` : "transparent",
                    color: activeCategory === cat.id ? cat.color : C.muted,
                    fontFamily: FONT_CODE, fontSize: 11, letterSpacing: 0.5,
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ fontSize: 14 }}>{cat.icon}</span>
                    <span style={{ lineHeight: 1.3 }}>{cat.label}</span>
                    <span style={{ marginLeft: "auto", fontSize: 9, opacity: 0.6 }}>{cat.services.length}</span>
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div style={{ marginTop: 20, padding: "14px", background: C.panel, borderRadius: 10, border: `1px solid ${C.border}` }}>
                <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 9, letterSpacing: 1, marginBottom: 10 }}>COVERAGE</div>
                <div style={{ color: C.accent, fontFamily: FONT_CODE, fontSize: 22, fontWeight: "bold" }}>{totalServices}</div>
                <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 9 }}>AWS SERVICES</div>
                <div style={{ marginTop: 10 }}>
                  {[["Beginner", C.green], ["Intermediate", C.accent], ["Advanced", C.red]].map(([lvl, col]) => {
                    const count = CATEGORIES.flatMap(c => c.services).filter(s => s.level === lvl).length;
                    return (
                      <div key={lvl} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ color: col as string, fontFamily: FONT_CODE, fontSize: 9 }}>{(lvl as string).toUpperCase()}</span>
                        <span style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 9 }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Service cards */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {currentCategory && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 24 }}>{currentCategory.icon}</span>
                      <div>
                        <div style={{ color: currentCategory.color, fontFamily: FONT_CODE, fontSize: 14, fontWeight: "bold" }}>{currentCategory.label}</div>
                        <div style={{ color: C.muted, fontFamily: "monospace", fontSize: 11 }}>{currentCategory.desc}</div>
                      </div>
                    </div>
                    {levelFilter !== "All" && (
                      <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 10, marginTop: 6 }}>
                        Showing {levelFilter} services — {filteredServices.length} of {currentCategory.services.length}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {filteredServices.length === 0 ? (
                      <div style={{ color: C.muted, fontFamily: "monospace", fontSize: 12, textAlign: "center", padding: "32px 0" }}>
                        No {levelFilter} services in this category
                      </div>
                    ) : (
                      filteredServices.map(service => (
                        <ServiceCard key={service.name} service={service} catColor={currentCategory.color} />
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
