import json

questions = [
  {
    "topic": "High Availability",
    "question": "A financial services company runs a critical trading application on EC2 instances behind an Application Load Balancer across two Availability Zones. During peak trading hours, one AZ experiences a partial network disruption causing 40% packet loss. The ALB health checks are still passing because the instances respond slowly. Users report intermittent 5xx errors. The on-call engineer needs to immediately route all traffic away from the degraded AZ without terminating instances or modifying the Auto Scaling group. What is the FASTEST solution?",
    "options": [
      "Modify the ALB listener rules to add a condition that blocks traffic from the affected AZ subnet CIDR",
      "Use the ALB Availability Zone setting to disable the affected AZ, which stops the ALB from routing new requests to targets in that AZ",
      "Update the security group on the affected AZ instances to block port 80 and 443 inbound traffic",
      "Create a CloudWatch alarm that triggers a Lambda function to deregister targets in the affected AZ from the target group"
    ],
    "correctAnswers": [1],
    "explanation": "ALB supports disabling an Availability Zone directly from the load balancer configuration. When an AZ is disabled, the ALB stops routing new requests to targets in that AZ while existing connections drain gracefully. This is faster than modifying security groups (which would cause connection resets) or using Lambda automation.",
    "questionType": "single"
  },
  {
    "topic": "Database",
    "question": "A company operates a multi-tenant SaaS platform using Amazon Aurora MySQL. Each tenant's data is stored in separate schemas within the same Aurora cluster. The largest tenant generates 70% of the total read traffic. The DBA notices that this tenant's queries are causing lock contention that affects other tenants. The company wants to isolate this tenant's read traffic without changing the application connection strings or the database schema structure. Which solution achieves this with the LEAST operational overhead?",
    "options": [
      "Create a separate Aurora cluster for the large tenant and use Route 53 weighted routing to split traffic",
      "Add Aurora Read Replicas and configure the application to use the reader endpoint for the large tenant's read queries",
      "Use Aurora Custom Endpoints to create a dedicated reader endpoint for the large tenant, then update only that tenant's connection configuration",
      "Migrate the large tenant to a dedicated RDS instance and use AWS Database Migration Service for ongoing replication"
    ],
    "correctAnswers": [2],
    "explanation": "Aurora Custom Endpoints allow you to create named endpoints that route to specific subsets of DB instances in the cluster. By creating a custom reader endpoint for the large tenant and pointing only their connection to it, you isolate their read traffic to dedicated replicas without changing the shared cluster architecture or other tenants' connection strings.",
    "questionType": "single"
  },
  {
    "topic": "Cost Optimization",
    "question": "A company runs a data analytics platform with 50 EC2 instances. Usage patterns show: 10 instances run 24/7 for baseline processing, 20 instances run Monday-Friday 8am-6pm for business analytics, and 20 instances handle unpredictable burst workloads. The company wants to minimize costs while maintaining performance. Which combination of purchasing options is MOST cost-effective?",
    "options": [
      "Purchase 50 Reserved Instances (1-year, All Upfront) for maximum discount across all instances",
      "Use 10 Reserved Instances (1-year) for baseline, 20 Scheduled Reserved Instances for business hours, and 20 Spot Instances with Spot Fleet and diversified allocation for burst workloads",
      "Use On-Demand Instances for all 50 instances to maintain flexibility",
      "Use 10 Reserved Instances for baseline, 20 On-Demand for business hours, and 20 Spot Instances for burst"
    ],
    "correctAnswers": [1],
    "explanation": "Matching purchasing options to usage patterns: Reserved Instances (1-year) for the 10 baseline instances that run 24/7 provides ~40% savings. Scheduled Reserved Instances for the 20 business-hours instances provides discounts for predictable, recurring schedules. Spot Fleet with diversified allocation for the 20 burst instances provides up to 90% savings with automatic replacement if Spot capacity is reclaimed.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company stores sensitive customer PII data in S3. A security audit reveals that an IAM role used by a Lambda function has s3:* permissions on all S3 buckets. The Lambda function only needs to read objects from one specific bucket (arn:aws:s3:::customer-data-prod) and write to a specific prefix in another bucket (arn:aws:s3:::processed-data/output/). Which IAM policy correctly implements least privilege?",
    "options": [
      "Allow s3:GetObject on arn:aws:s3:::customer-data-prod and s3:PutObject on arn:aws:s3:::processed-data",
      "Allow s3:GetObject on arn:aws:s3:::customer-data-prod/* and s3:PutObject on arn:aws:s3:::processed-data/output/*",
      "Allow s3:* on arn:aws:s3:::customer-data-prod/* and arn:aws:s3:::processed-data/output/*",
      "Allow s3:GetObject and s3:PutObject on arn:aws:s3:::* with a condition limiting to specific buckets"
    ],
    "correctAnswers": [1],
    "explanation": "Least privilege requires specifying exact actions and resources. s3:GetObject on arn:aws:s3:::customer-data-prod/* allows reading any object in the bucket (the /* is required for object-level operations). s3:PutObject on arn:aws:s3:::processed-data/output/* restricts writes to only the output/ prefix. Option A is missing the /* suffix — bucket ARNs without /* apply to bucket-level operations, not object operations.",
    "questionType": "single"
  },
  {
    "topic": "Networking",
    "question": "A company has a three-tier application in a VPC. The web tier is in public subnets, the application tier is in private subnets, and the database tier is in isolated subnets. The application tier needs to download software updates from the internet but must not be directly accessible from the internet. The isolated database tier must never have internet access. Which architecture correctly implements these requirements?",
    "options": [
      "Place a NAT Gateway in the public subnet, add a route in the private subnet route table to 0.0.0.0/0 via the NAT Gateway, and add no internet route to the isolated subnet route table",
      "Place an Internet Gateway in the private subnet to allow outbound-only internet access for the application tier",
      "Use a Bastion host in the public subnet that the application tier connects through for internet access",
      "Assign Elastic IP addresses to the application tier instances for outbound internet access"
    ],
    "correctAnswers": [0],
    "explanation": "NAT Gateway enables outbound internet access for private subnet resources without allowing inbound connections from the internet. The NAT Gateway resides in the public subnet (with an EIP and route to the Internet Gateway). The private subnet route table has a route for 0.0.0.0/0 pointing to the NAT Gateway. The isolated subnet has no 0.0.0.0/0 route, so database instances have no internet access.",
    "questionType": "single"
  },
  {
    "topic": "Storage",
    "question": "A media company stores 500TB of video files in S3. Videos are accessed frequently for the first 30 days after upload, occasionally between 30-90 days, rarely between 90-180 days, and almost never after 180 days. The company wants to minimize storage costs while maintaining instant access to all videos. Which S3 lifecycle configuration is MOST cost-effective?",
    "options": [
      "Transition to S3 Glacier after 30 days — Glacier provides the lowest cost",
      "Transition to S3 Standard-IA after 30 days, S3 Glacier Instant Retrieval after 90 days, and S3 Glacier Flexible Retrieval after 180 days",
      "Keep all objects in S3 Standard — lifecycle policies add complexity without significant savings",
      "Transition to S3 Intelligent-Tiering immediately — it automatically moves objects between tiers"
    ],
    "correctAnswers": [1],
    "explanation": "Matching storage classes to access patterns: S3 Standard for 0-30 days (frequent access). S3 Standard-IA for 30-90 days — lower storage cost with retrieval fee. S3 Glacier Instant Retrieval for 90-180 days — millisecond retrieval (maintains instant access requirement). S3 Glacier Flexible Retrieval after 180 days — lowest cost for rarely accessed data. Option A fails the instant access requirement. S3 Intelligent-Tiering has monitoring fees per object which can exceed savings for large objects.",
    "questionType": "single"
  },
  {
    "topic": "Serverless",
    "question": "A company has a Lambda function that processes images uploaded to S3. The function is triggered by S3 events and takes 3-5 minutes to process each image. During a marketing campaign, 10,000 images are uploaded simultaneously. The Lambda function starts failing with TooManyRequestsException errors. What is the root cause and the correct solution?",
    "options": [
      "The Lambda function timeout is too short — increase the timeout to 15 minutes",
      "Lambda has a default concurrency limit of 1,000 per region. With 10,000 simultaneous S3 events, Lambda is throttled. Solution: Request a concurrency limit increase, implement SQS as a buffer between S3 and Lambda, and configure Lambda reserved concurrency to process at a sustainable rate",
      "S3 cannot trigger Lambda for more than 1,000 simultaneous events — use EventBridge instead",
      "DynamoDB is throttling writes — increase the DynamoDB write capacity units"
    ],
    "correctAnswers": [1],
    "explanation": "Lambda has a default regional concurrency limit of 1,000. With 10,000 simultaneous S3 events, Lambda attempts to run 10,000 concurrent executions and throttles. The solution is to decouple with SQS: S3 events go to SQS, Lambda polls SQS with a controlled batch size and concurrency. This smooths the burst into a sustainable processing rate. SQS retains messages if Lambda is throttled and retries automatically.",
    "questionType": "single"
  },
  {
    "topic": "Disaster Recovery",
    "question": "A company has an RTO of 1 hour and RPO of 15 minutes for their production application. The application uses EC2 instances, RDS MySQL, and S3. They currently have no DR strategy. Which DR approach meets these requirements at the LOWEST cost?",
    "options": [
      "Multi-Site Active-Active: Run full production in two regions simultaneously — meets RTO/RPO but highest cost",
      "Warm Standby: Maintain a scaled-down running environment in a DR region with RDS cross-region read replica (promotes in ~5 minutes), EC2 AMIs replicated via AWS Backup, and Route 53 health checks for automatic failover — meets 1-hour RTO and 15-minute RPO",
      "Backup and Restore: Take hourly RDS snapshots and copy to DR region — meets RPO but RTO could be 4-8 hours",
      "Pilot Light: Keep only the RDS replica running in DR region, launch EC2 from AMIs on failover — RTO may exceed 1 hour due to instance launch time"
    ],
    "correctAnswers": [1],
    "explanation": "Warm Standby meets both requirements at lower cost than Multi-Site: RDS cross-region read replica has less than 15-minute replication lag (meets RPO) and promotes to primary in ~5 minutes. A scaled-down EC2 fleet is already running and can be scaled up quickly. Route 53 health checks detect failures and update DNS within minutes. Total failover time is well under 1 hour (meets RTO). Backup and Restore fails the RTO requirement.",
    "questionType": "single"
  },
  {
    "topic": "Monitoring",
    "question": "A company's microservices application has intermittent latency spikes that are hard to diagnose. The application has 15 services communicating via REST APIs. When a user reports slow response times, engineers cannot determine which service is causing the bottleneck. Which AWS service provides end-to-end request tracing across all 15 services to identify the slow component?",
    "options": [
      "Amazon CloudWatch Metrics — collects performance metrics from each service",
      "AWS X-Ray — provides distributed tracing that follows a request through all services, creating a service map and identifying latency bottlenecks at each hop",
      "AWS CloudTrail — records all API calls made to AWS services",
      "Amazon CloudWatch Logs Insights — queries log data across all services"
    ],
    "correctAnswers": [1],
    "explanation": "AWS X-Ray provides distributed tracing for microservices. The X-Ray SDK instruments each service to send trace data. X-Ray correlates traces across service boundaries using a trace ID header. The Service Map visualizes all services and their connections, showing average latency and error rates. Trace details show the exact time spent in each service for a specific request. CloudWatch Metrics shows aggregate metrics but not per-request traces.",
    "questionType": "single"
  },
  {
    "topic": "Caching",
    "question": "A company's e-commerce application uses RDS PostgreSQL as the primary database. During flash sales, the database CPU reaches 100% and response times exceed 10 seconds. Analysis shows 80% of queries are identical product catalog reads that rarely change. The company wants to reduce database load by 80% without changing the application database connection code. Which solution achieves this?",
    "options": [
      "Add RDS Read Replicas and update the application to use the read replica endpoint for catalog queries",
      "Implement Amazon ElastiCache for Redis as a write-through cache in front of RDS. The application continues connecting to the same database endpoint, but a caching layer checks Redis first before querying RDS",
      "Upgrade the RDS instance to a larger instance type with more CPU and memory",
      "Enable RDS Performance Insights to identify and optimize the slow queries"
    ],
    "correctAnswers": [1],
    "explanation": "ElastiCache for Redis as a cache-aside or write-through cache reduces database load by serving repeated queries from in-memory cache. For product catalog data that rarely changes, cache hit rates of 80%+ are achievable. The application data access layer checks Redis first; on cache miss, it queries RDS and populates the cache. This reduces RDS load by ~80%. Read Replicas require application code changes to use a different endpoint.",
    "questionType": "single"
  },
  {
    "topic": "Migration",
    "question": "A company wants to migrate a 10TB Oracle database to AWS. The database is actively used 24/7 with zero downtime tolerance. The target is Amazon Aurora PostgreSQL. The migration must minimize downtime (less than 5 minutes) and handle schema conversion from Oracle to PostgreSQL. Which combination of AWS services achieves this?",
    "options": [
      "Use AWS Snowball to export the Oracle database, convert the schema manually, and import into Aurora",
      "Use AWS Schema Conversion Tool (SCT) to convert the Oracle schema to PostgreSQL, then use AWS Database Migration Service (DMS) with ongoing replication to keep Aurora in sync with Oracle during migration, and cut over when the databases are in sync",
      "Use RDS Oracle as an intermediate step, then use native Oracle tools to migrate to Aurora PostgreSQL",
      "Use AWS DataSync to replicate the Oracle data files to Aurora"
    ],
    "correctAnswers": [1],
    "explanation": "AWS SCT converts Oracle schema objects to PostgreSQL equivalents, flagging objects that require manual conversion. AWS DMS performs the initial full load and then maintains ongoing replication (CDC) to keep Aurora synchronized with the Oracle source. The application continues running on Oracle during migration. When Aurora is fully caught up, the cutover involves stopping writes to Oracle, waiting for final replication, and updating connection strings to Aurora — total downtime less than 5 minutes.",
    "questionType": "single"
  },
  {
    "topic": "Containers",
    "question": "A company runs 50 microservices on Amazon ECS with EC2 launch type. Managing the EC2 instances (patching, scaling, capacity planning) consumes significant engineering time. Some services need 0.25 vCPU and 512MB RAM, others need 4 vCPU and 16GB RAM. The company wants to eliminate EC2 management overhead while supporting this wide range of resource requirements. What is the BEST solution?",
    "options": [
      "Migrate to Amazon EKS with EC2 node groups — Kubernetes provides better resource management",
      "Migrate to AWS Fargate launch type for ECS — Fargate is serverless for containers, eliminating EC2 management while supporting any combination of CPU (0.25-16 vCPU) and memory (0.5GB-120GB) per task",
      "Use AWS Lambda instead of ECS — Lambda is truly serverless and eliminates all infrastructure management",
      "Use EC2 Auto Scaling with mixed instance types to better match the varying resource requirements"
    ],
    "correctAnswers": [1],
    "explanation": "AWS Fargate eliminates EC2 management for ECS workloads. Each ECS task gets exactly the CPU and memory specified (0.25-16 vCPU, 0.5-120GB RAM), so the wide range of resource requirements is handled natively. AWS manages the underlying infrastructure, patching, and capacity. The migration from ECS EC2 to ECS Fargate is straightforward — change the launch type in the task definition. Lambda requires significant application refactoring. EKS still requires managing node groups.",
    "questionType": "single"
  },
  {
    "topic": "Event-Driven",
    "question": "A company processes orders through a series of steps: payment processing, inventory check, shipping label generation, and customer notification. Each step is performed by a separate Lambda function. Currently, Lambda functions call each other synchronously. If the shipping label service is down, the entire order fails. The company wants to make the pipeline resilient and ensure every order eventually completes. Which architecture achieves this?",
    "options": [
      "Use Lambda Destinations to chain functions together with error handling",
      "Use AWS Step Functions to orchestrate the Lambda functions with retry logic, error handling, and state management — if a step fails, Step Functions retries automatically and maintains the order state",
      "Use Amazon SQS between each Lambda function — each function reads from a queue, processes, and writes to the next queue",
      "Use Amazon EventBridge to trigger each Lambda function in sequence"
    ],
    "correctAnswers": [1],
    "explanation": "AWS Step Functions is designed for orchestrating multi-step workflows. It provides: visual workflow definition, automatic retries with configurable backoff, error handling and fallback states, execution history for debugging, and state persistence between steps. If the shipping label service is down, Step Functions retries the step according to the retry policy and continues once the service recovers.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company application on EC2 needs to access S3, DynamoDB, and Secrets Manager. A developer hardcoded AWS access keys in the application configuration file. A security scan found these credentials in the Git repository. What is the correct long-term solution to prevent credential exposure?",
    "options": [
      "Rotate the exposed access keys immediately and store them in environment variables instead of config files",
      "Assign an IAM role to the EC2 instance with permissions for S3, DynamoDB, and Secrets Manager. The application uses the EC2 instance metadata service (IMDS) to obtain temporary credentials automatically — no long-term credentials needed",
      "Store the access keys in AWS Systems Manager Parameter Store and retrieve them at application startup",
      "Encrypt the access keys using AWS KMS before storing them in the config file"
    ],
    "correctAnswers": [1],
    "explanation": "IAM roles for EC2 instances eliminate the need for long-term access keys entirely. The EC2 instance metadata service provides temporary, automatically-rotated credentials to the application. AWS SDKs check the instance metadata automatically — no code changes needed to retrieve credentials. The credentials are temporary (expire after 1 hour, auto-renewed) and never appear in code, config files, or environment variables.",
    "questionType": "single"
  },
  {
    "topic": "Auto Scaling",
    "question": "A company's application experiences traffic spikes that are 10x the baseline load. The spikes last 5-10 minutes and occur unpredictably. The current Auto Scaling group takes 8 minutes to launch and configure new EC2 instances (AMI launch plus bootstrap script). By the time new instances are ready, the spike has passed. Which combination of strategies reduces the time to scale?",
    "options": [
      "Increase the Auto Scaling maximum capacity — more instances will be available faster",
      "Use predictive scaling to pre-scale before expected spikes, create a golden AMI with all software pre-installed (eliminating bootstrap time), and configure a warm pool to keep pre-initialized instances ready to launch instantly",
      "Switch to larger instance types so fewer instances are needed during spikes",
      "Use scheduled scaling to add instances every hour in anticipation of spikes"
    ],
    "correctAnswers": [1],
    "explanation": "Three complementary strategies: (1) Golden AMI — bake all software into the AMI during build time. Launch time drops from 8 minutes to ~2 minutes. (2) Warm Pool — maintain a pool of stopped/running pre-initialized instances. When scaling out, instances from the warm pool launch in seconds. (3) Predictive Scaling — uses ML to analyze historical patterns and pre-scale before predicted load increases. Together, these reduce effective scale-out time to under 1 minute.",
    "questionType": "single"
  },
  {
    "topic": "Database",
    "question": "A company's DynamoDB table stores IoT sensor readings with a partition key of deviceId and sort key of timestamp. A query pattern requires finding all devices that reported a temperature above 100 degrees Celsius in the last hour across all devices. This query is currently performing a full table scan. How should this query pattern be optimized?",
    "options": [
      "Add a Global Secondary Index (GSI) with temperature as the partition key — this allows querying by temperature directly",
      "Create a GSI with a partition key of a date-hour bucket and sort key of temperature. Use sparse indexing — only items with temperature above 100 are written to a separate alerts table via DynamoDB Streams and Lambda, enabling efficient queries on high-temperature readings",
      "Use DynamoDB DAX to cache the full table scan results",
      "Switch to Amazon RDS which supports SQL WHERE clauses for range queries across all items"
    ],
    "correctAnswers": [1],
    "explanation": "DynamoDB requires careful data modeling for access patterns. A GSI with temperature as partition key would create hot partitions. The correct approach uses a date-hour bucket as the GSI partition key — this distributes data evenly and allows querying all devices in a specific hour. DynamoDB Streams plus Lambda for sparse indexing is a common pattern: only high-temperature readings are written to an alerts table, making queries efficient.",
    "questionType": "single"
  },
  {
    "topic": "Networking",
    "question": "A company has VPCs in three AWS regions (us-east-1, eu-west-1, ap-southeast-1) and an on-premises data center. All locations need full mesh connectivity. Currently, they have 6 VPC peering connections and 3 VPN connections to the data center. Adding a new region would require 3 more peering connections and 1 more VPN. The network team wants to simplify this architecture. Which AWS service reduces operational complexity?",
    "options": [
      "Add more VPC peering connections — peering is the most direct and lowest latency option",
      "AWS Transit Gateway — acts as a hub that all VPCs and VPN connections connect to, replacing the full mesh with a hub-and-spoke model. Adding a new region requires only one attachment to the Transit Gateway",
      "Use AWS PrivateLink for all inter-VPC communication",
      "Use VPC sharing to share subnets across all regions"
    ],
    "correctAnswers": [1],
    "explanation": "AWS Transit Gateway solves the full-mesh scaling problem. Instead of N*(N-1)/2 peering connections, each VPC connects once to the Transit Gateway. The TGW routes traffic between all connected VPCs and VPN/Direct Connect connections. Adding a new region requires one TGW attachment and one inter-region peering. The current 6 peering plus 3 VPN connections are replaced by a single hub. VPC peering does not scale. PrivateLink is for service endpoints, not general VPC connectivity.",
    "questionType": "single"
  },
  {
    "topic": "Serverless",
    "question": "A company builds a REST API using API Gateway and Lambda. The API receives 100 requests per second normally but spikes to 5,000 requests per second during business hours. Lambda cold starts are causing 2-3 second latency for the first request after idle periods. Users report inconsistent response times. Which feature reduces cold start latency?",
    "options": [
      "Increase Lambda memory allocation — more memory reduces cold start time",
      "Enable Lambda Provisioned Concurrency for the functions behind the API Gateway — pre-initializes execution environments so they are ready to respond immediately, eliminating cold starts for the provisioned capacity",
      "Use API Gateway caching to cache Lambda responses for 5 minutes",
      "Switch from Lambda to EC2 instances behind the API Gateway to eliminate cold starts entirely"
    ],
    "correctAnswers": [1],
    "explanation": "Lambda Provisioned Concurrency pre-initializes a specified number of execution environments, keeping them warm and ready to respond. Requests handled by provisioned concurrency have no cold start latency. Configure provisioned concurrency based on the baseline load. This can be combined with Application Auto Scaling to adjust provisioned concurrency based on time of day. More memory reduces cold start duration but does not eliminate it.",
    "questionType": "single"
  },
  {
    "topic": "Storage",
    "question": "A company runs a high-performance computing workload that requires shared storage accessible by 1,000 EC2 instances simultaneously. The workload reads and writes small files at high throughput (50 GB/s aggregate). The storage must support POSIX file system semantics. Which AWS storage service meets these requirements?",
    "options": [
      "Amazon EFS (Elastic File System) — supports thousands of concurrent connections and POSIX semantics",
      "Amazon FSx for Lustre — a high-performance parallel file system designed for HPC workloads, supporting hundreds of GB/s throughput and millions of IOPS with POSIX semantics",
      "Amazon S3 — provides virtually unlimited storage and high aggregate throughput",
      "Amazon EBS with Multi-Attach — allows multiple EC2 instances to access the same EBS volume"
    ],
    "correctAnswers": [1],
    "explanation": "Amazon FSx for Lustre is purpose-built for HPC workloads. It provides sub-millisecond latencies, hundreds of GB/s throughput, millions of IOPS, POSIX-compliant file system semantics, and native integration with S3 for data repository. Lustre is the industry-standard HPC file system. EFS supports thousands of connections but maxes out at ~10 GB/s throughput — insufficient for 50 GB/s. S3 does not support POSIX semantics. EBS Multi-Attach is limited to 16 instances.",
    "questionType": "single"
  },
  {
    "topic": "Cost Optimization",
    "question": "A company receives an unexpected large AWS bill. Investigation reveals that a developer accidentally created 100 EC2 p3.16xlarge GPU instances in a test account and forgot to terminate them. They ran for 2 weeks. Which combination of preventive controls would have prevented this?",
    "options": [
      "Enable AWS Cost Explorer to monitor spending — it would have detected the spike",
      "Implement AWS Service Control Policies (SCPs) in AWS Organizations to deny launching GPU instance types in non-production accounts. Set AWS Budgets with budget actions to automatically stop EC2 instances when spending exceeds a threshold. Use AWS Config rules to detect and alert on expensive instance types",
      "Require all EC2 launches to go through a change management process",
      "Enable AWS Trusted Advisor to check for underutilized instances"
    ],
    "correctAnswers": [1],
    "explanation": "Multiple layers of prevention: SCPs are guardrails applied at the AWS Organization level — they can deny launching specific instance types in non-production accounts entirely, preventing the mistake before it happens. AWS Budgets with budget actions can automatically apply IAM policies or stop instances when spending exceeds a threshold. Config rules detect non-compliant resources and alert immediately. Cost Explorer is retrospective.",
    "questionType": "single"
  },
  {
    "topic": "Analytics",
    "question": "A company wants to build a real-time dashboard showing sales metrics updated every 30 seconds. The data comes from 1,000 point-of-sale terminals sending transactions to Kinesis Data Streams. The dashboard needs to show total sales by region, top 10 products in the last 5 minutes, and anomaly detection for unusual sales patterns. Which architecture processes this in real-time?",
    "options": [
      "Kinesis Data Streams to S3 to Athena to QuickSight: batch queries every 30 seconds",
      "Kinesis Data Streams to Kinesis Data Analytics (Apache Flink) for real-time aggregations and anomaly detection, then to Amazon OpenSearch Service for the dashboard with 30-second refresh",
      "Kinesis Data Streams to Lambda to RDS to custom dashboard: Lambda processes each transaction and updates RDS",
      "Kinesis Data Streams to SQS to EC2 processing cluster to DynamoDB to dashboard"
    ],
    "correctAnswers": [1],
    "explanation": "Kinesis Data Analytics (Apache Flink) enables real-time stream processing with SQL or Java/Python. It supports tumbling/sliding window aggregations (top 10 products in last 5 minutes), real-time anomaly detection using ML algorithms (Random Cut Forest), and sub-second processing latency. OpenSearch Service provides a real-time search and visualization layer that can refresh every 30 seconds. Athena has query startup latency making true 30-second refresh difficult.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company uses AWS Organizations with 50 accounts. The security team wants to ensure that all accounts cannot disable CloudTrail, cannot create IAM users with console access (only roles), and cannot launch EC2 instances in regions outside us-east-1 and us-west-2. These controls must apply to all accounts including the root user of each account. Which AWS feature enforces these controls?",
    "options": [
      "IAM policies in each account — create policies that deny these actions and attach to all IAM users and roles",
      "AWS Config rules in each account — detect and remediate non-compliant configurations",
      "AWS Service Control Policies (SCPs) applied at the Organization root or OU level — SCPs restrict what actions can be performed in member accounts, overriding even account-level administrator permissions",
      "AWS Security Hub with automated remediation — detects and fixes security issues across all accounts"
    ],
    "correctAnswers": [2],
    "explanation": "SCPs are the only AWS feature that can restrict actions for ALL principals in member accounts, including account-level administrators. SCPs define the maximum permissions available — even if an account administrator grants full permissions, the SCP restricts what can actually be done. Applying SCPs at the Organization root affects all accounts. IAM policies in each account can be overridden by account admins. Config is detective, not preventive.",
    "questionType": "single"
  },
  {
    "topic": "Database",
    "question": "A company's application writes 10,000 items per second to a DynamoDB table. The table uses a partition key of userId. Analysis shows that 90% of writes go to 100 userId values (hot partitions). DynamoDB is throttling writes on those partitions. The application cannot change the userId partition key. Which technique distributes writes more evenly?",
    "options": [
      "Enable DynamoDB Auto Scaling — it automatically increases capacity for hot partitions",
      "Use write sharding: append a random suffix (1-10) to the userId partition key when writing (e.g., userId#1, userId#3). When reading, query all 10 shards and aggregate results. This distributes the hot partition writes across 10 partitions",
      "Switch to a composite partition key using userId plus timestamp to distribute writes",
      "Enable DynamoDB DAX to cache the hot partition reads, reducing write pressure"
    ],
    "correctAnswers": [1],
    "explanation": "Write sharding distributes hot partition traffic across multiple physical partitions. By appending a random suffix (1-10) to the partition key, writes for a hot userId are distributed across 10 partitions instead of 1, reducing per-partition throughput by 10x. Reads require querying all shards and aggregating — this is a known tradeoff. Auto Scaling increases capacity but cannot solve hot partition issues because DynamoDB partitions have a maximum throughput limit regardless of provisioned capacity.",
    "questionType": "single"
  },
  {
    "topic": "Networking",
    "question": "A company runs an application that makes API calls to a third-party service. The third-party requires the company to whitelist specific IP addresses. The application runs on an Auto Scaling group of EC2 instances with dynamic IPs. The company needs stable, predictable outbound IP addresses. Which solution provides stable outbound IPs without requiring manual updates to the third-party whitelist?",
    "options": [
      "Assign Elastic IPs to all EC2 instances in the Auto Scaling group",
      "Route all outbound traffic through a NAT Gateway with an Elastic IP. The NAT Gateway provides a stable, predictable outbound IP address regardless of how many EC2 instances are in the Auto Scaling group",
      "Use AWS Global Accelerator to provide static IP addresses for the application",
      "Use a Network Load Balancer with Elastic IPs for outbound traffic"
    ],
    "correctAnswers": [1],
    "explanation": "NAT Gateway has a fixed Elastic IP address. All outbound internet traffic from EC2 instances in private subnets routes through the NAT Gateway, appearing to originate from the NAT Gateway EIP. The third-party only needs to whitelist one IP regardless of how many EC2 instances exist or how often they change. Assigning EIPs to Auto Scaling instances is impractical — you would need to whitelist all possible IPs and update the whitelist as instances launch and terminate.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company's web application is experiencing a DDoS attack including volumetric UDP floods (100 Gbps), HTTP floods (1 million requests per second from legitimate-looking IPs), and slowloris attacks (keeping connections open). Which combination of AWS services mitigates all three attack vectors?",
    "options": [
      "AWS WAF alone — it can block all types of DDoS attacks at the application layer",
      "AWS Shield Advanced (mitigates volumetric network attacks plus provides DDoS Response Team access) plus AWS WAF with rate-based rules (blocks HTTP floods from single IPs) plus Application Load Balancer (handles connection management, mitigating slowloris by enforcing connection timeouts)",
      "Amazon CloudFront alone — it absorbs DDoS traffic at edge locations",
      "Amazon Route 53 with health checks — it routes traffic away from attacked endpoints"
    ],
    "correctAnswers": [1],
    "explanation": "Each attack vector requires a different mitigation: Volumetric UDP floods (Layer 3/4): AWS Shield Advanced provides automatic DDoS protection and absorbs large volumetric attacks. HTTP floods (Layer 7): AWS WAF rate-based rules automatically block IPs exceeding request thresholds. Slowloris (Layer 7 connection exhaustion): ALB enforces idle connection timeouts and limits concurrent connections per client, preventing connection exhaustion.",
    "questionType": "single"
  },
  {
    "topic": "Serverless",
    "question": "A company wants to build a data processing pipeline that ingests CSV files uploaded to S3, validates and transforms the data, loads results into Redshift, and sends a notification on completion or failure. The pipeline must handle files up to 10GB and complete within 30 minutes. Lambda has a 15-minute timeout and 10GB memory limit. Which serverless architecture handles files exceeding Lambda limits?",
    "options": [
      "Increase Lambda memory to 10GB — this allows processing larger files",
      "Use AWS Glue for the ETL processing (no timeout limit, scales automatically for large files), orchestrated by AWS Step Functions (manages the workflow, handles errors, sends SNS notifications on completion or failure)",
      "Split the 10GB file into smaller chunks using Lambda and process each chunk in parallel",
      "Use Amazon EMR Serverless for the ETL processing"
    ],
    "correctAnswers": [1],
    "explanation": "AWS Glue is a fully managed ETL service with no timeout limit and automatic scaling for large files. Glue natively reads from S3, transforms data using PySpark or Python, and loads into Redshift. Step Functions orchestrates the pipeline: trigger Glue job, wait for completion, handle success/failure paths, send SNS notifications. This is fully serverless with no infrastructure to manage. Lambda 15-minute timeout makes it unsuitable for 10GB files.",
    "questionType": "single"
  },
  {
    "topic": "Storage",
    "question": "A company stores 1 petabyte of data in S3. A compliance requirement mandates that all objects must be retained for 7 years and cannot be deleted or modified during that period, even by the bucket owner or AWS. Which S3 feature enforces this requirement?",
    "options": [
      "S3 Versioning — prevents objects from being permanently deleted",
      "S3 Object Lock in Compliance mode with a 7-year retention period — once set, the retention period cannot be shortened and the object cannot be deleted or overwritten by any user, including the root account",
      "S3 Lifecycle policies — automatically retain objects for 7 years before deletion",
      "S3 Replication — copies objects to another bucket for redundancy"
    ],
    "correctAnswers": [1],
    "explanation": "S3 Object Lock provides WORM (Write Once Read Many) protection. Compliance mode is the strictest setting: the retention period cannot be shortened, the lock mode cannot be changed, and the object cannot be deleted by any user — including the root account and AWS. This meets regulatory requirements (SEC Rule 17a-4, FINRA, HIPAA) that mandate immutable records. Governance mode allows users with special permissions to modify settings. S3 Versioning prevents accidental deletion but objects can still be permanently deleted by deleting all versions.",
    "questionType": "single"
  },
  {
    "topic": "Networking",
    "question": "A company has a VPC with EC2 instances that need to access AWS services (S3, DynamoDB, SQS) without traffic leaving the AWS network. Currently, traffic routes through a NAT Gateway (incurring data transfer charges). The security team also wants to ensure that S3 bucket access is restricted to only requests originating from within the VPC. Which solution achieves both goals?",
    "options": [
      "Use AWS PrivateLink for all services — it provides private connectivity without internet routing",
      "Create VPC Endpoints: Gateway Endpoint for S3 and DynamoDB (free, routes traffic within AWS network via route table), Interface Endpoints for SQS (uses PrivateLink, private IP in VPC). Add a bucket policy on S3 restricting access to requests from the VPC endpoint using the aws:sourceVpce condition",
      "Use Direct Connect to route all traffic through the on-premises network to AWS services",
      "Enable VPC Flow Logs to monitor traffic and block traffic leaving the VPC"
    ],
    "correctAnswers": [1],
    "explanation": "VPC Endpoints keep traffic within the AWS network without NAT Gateway. Gateway Endpoints (S3, DynamoDB) are free and work by adding entries to the VPC route table. Interface Endpoints (SQS, most other services) create ENIs in the VPC with private IPs. S3 bucket policies with aws:sourceVpce condition restrict access to requests originating from the specific VPC endpoint — any request from outside the VPC is denied. This eliminates NAT Gateway data transfer charges for S3/DynamoDB traffic.",
    "questionType": "single"
  },
  {
    "topic": "Machine Learning",
    "question": "A company wants to add real-time product recommendations to their e-commerce website. When a user views a product, the system should recommend similar products within 100ms. The recommendation model needs to be retrained weekly with new purchase data. The data science team has built a custom TensorFlow model. Which AWS architecture meets the latency and retraining requirements?",
    "options": [
      "Run the TensorFlow model on EC2 instances behind an ALB — simple deployment with full control",
      "Deploy the model to Amazon SageMaker Real-Time Inference endpoint (sub-100ms latency, auto-scaling). Use SageMaker Pipelines to automate weekly retraining: pull new data from S3, retrain the model, evaluate, and deploy the new model to the endpoint with zero-downtime blue/green deployment",
      "Use AWS Lambda to run the TensorFlow model — serverless with automatic scaling",
      "Use Amazon Personalize — it provides recommendations without custom model deployment"
    ],
    "correctAnswers": [1],
    "explanation": "SageMaker Real-Time Inference endpoints provide sub-100ms latency for synchronous predictions, auto-scaling based on traffic, and support for TensorFlow models. SageMaker Pipelines automates the MLOps workflow: data preprocessing, model training, evaluation, and blue/green deployment to the endpoint with zero downtime. EC2 requires managing infrastructure and deployment pipelines manually. Lambda has cold start latency that may exceed 100ms. Amazon Personalize does not support custom TensorFlow models.",
    "questionType": "single"
  },
  {
    "topic": "Compliance",
    "question": "A financial services company must demonstrate to auditors that all changes to their AWS infrastructure are tracked, who made the changes, and what the previous configuration was. They also need to prove that no security groups allow unrestricted inbound access (0.0.0.0/0) on port 22. Which combination of AWS services provides this audit evidence?",
    "options": [
      "Enable CloudWatch Logs — it captures all application logs for auditing",
      "Enable AWS CloudTrail (records all API calls with user identity, timestamp, and request parameters), enable AWS Config (records configuration history of resources and evaluates compliance rules like restricted-ssh which flags security groups allowing 0.0.0.0/0 on port 22)",
      "Use AWS Inspector to scan for security group misconfigurations",
      "Enable VPC Flow Logs to capture all network traffic for compliance"
    ],
    "correctAnswers": [1],
    "explanation": "CloudTrail records every API call: who made it (IAM user/role ARN), when (timestamp), what (API action and parameters), and from where (IP address). This provides the change audit trail. Config records the configuration state of resources at each point in time, allowing you to see what a security group looked like at any date. Config Rules (like restricted-ssh) continuously evaluate compliance and flag non-compliant resources. CloudWatch Logs captures application logs, not infrastructure changes.",
    "questionType": "single"
  },
  {
    "topic": "Database",
    "question": "A company's application uses Amazon RDS MySQL with Multi-AZ. During a planned maintenance window, the RDS instance undergoes a failover. The application experiences 30-60 seconds of database connection errors. The development team wants to reduce this downtime. Which approach minimizes application-visible downtime during RDS failover?",
    "options": [
      "Increase the Multi-AZ standby instance size — larger instances fail over faster",
      "Use Amazon RDS Proxy in front of the RDS instance. RDS Proxy maintains a connection pool to the database and handles failover transparently — it waits for the new primary to be ready and routes connections to it, reducing application-visible downtime from 30-60 seconds to under 30 seconds. The application connects to the RDS Proxy endpoint (which never changes)",
      "Implement retry logic in the application to reconnect after connection failures",
      "Switch to Aurora Multi-AZ which has faster failover than RDS Multi-AZ"
    ],
    "correctAnswers": [1],
    "explanation": "RDS Proxy maintains a persistent connection pool to the database and handles failover transparently. During a Multi-AZ failover, RDS Proxy automatically routes connections to the new primary without the application needing to reconnect. The application connects to the RDS Proxy endpoint (which never changes), and the proxy handles the database-level failover. This reduces application-visible downtime to near-zero.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company uses AWS KMS to encrypt sensitive data in S3, RDS, and EBS. A key administrator accidentally scheduled a KMS key for deletion with a 7-day waiting period. The key encrypts 50TB of S3 data, 3 RDS databases, and 20 EBS volumes. The team realizes the mistake 2 days after scheduling deletion. What actions should be taken IMMEDIATELY?",
    "options": [
      "Wait for the 7-day period to expire, then restore from backups using a new KMS key",
      "Cancel the key deletion immediately using the KMS console or API (CancelKeyDeletion), then implement preventive controls: add a key policy condition requiring MFA for kms:ScheduleKeyDeletion, and create a CloudWatch alarm for KMS key deletion events",
      "Create a new KMS key and re-encrypt all 50TB of S3 data, RDS databases, and EBS volumes before the 7-day period expires",
      "Enable AWS Backup to create encrypted backups of all resources using a different KMS key before the deletion takes effect"
    ],
    "correctAnswers": [1],
    "explanation": "KMS key deletion has a mandatory waiting period (7-30 days) specifically to allow recovery from mistakes. CancelKeyDeletion immediately stops the deletion process and re-enables the key. This is the correct first action — it takes seconds and prevents any data loss. After canceling, implement preventive controls: MFA requirement for deletion operations, CloudWatch/EventBridge alarms for KMS deletion events, and key deletion approval workflows.",
    "questionType": "single"
  },
  {
    "topic": "Networking",
    "question": "A company VPC (10.0.0.0/16) needs to add a new subnet for a third-party vendor. The vendor application must communicate with the company application servers in a private subnet, but must NOT have access to the company database subnet or any other internal resources. Which combination of controls enforces this least-privilege network isolation?",
    "options": [
      "Create a new subnet for the vendor, add a route in the main route table to allow all traffic between subnets",
      "Create a dedicated subnet for the vendor with a custom route table that only has routes to the application server subnet. Configure Network ACLs on the vendor subnet to allow outbound traffic only to the application server subnet CIDR. Configure Security Groups on the application servers to allow inbound traffic only from the vendor subnet CIDR on the required ports",
      "Use VPC peering between the vendor VPC and the company VPC, which automatically restricts access",
      "Place the vendor servers in the same subnet as the application servers and use Security Groups to restrict access"
    ],
    "correctAnswers": [1],
    "explanation": "Defense in depth requires multiple layers: (1) Custom route table on the vendor subnet with routes only to the application server subnet — prevents routing to the database subnet at the network level. (2) Network ACLs (stateless) on the vendor subnet restrict outbound traffic to only the application server CIDR — provides subnet-level enforcement. (3) Security Groups on application servers allow inbound only from the vendor subnet CIDR on specific ports — provides instance-level enforcement.",
    "questionType": "single"
  },
  {
    "topic": "Cost Optimization",
    "question": "A company runs a data warehouse on Amazon Redshift. The cluster is used heavily from 8am to 6pm on weekdays and is idle overnight and on weekends. The cluster costs $15,000 per month. The data warehouse uses RA3 nodes with managed storage. Which approach reduces costs for the idle periods?",
    "options": [
      "Purchase Reserved Nodes for 1 year — provides 40% discount regardless of usage",
      "Use Redshift pause and resume feature to automatically pause the cluster outside business hours (6pm to 8am weekdays, all weekend). Paused clusters do not incur compute charges. Managed storage charges continue. This reduces compute costs by approximately 65%",
      "Switch to Redshift Serverless which automatically scales to zero when not in use",
      "Delete and recreate the cluster each day — snapshots preserve the data"
    ],
    "correctAnswers": [1],
    "explanation": "Redshift pause and resume allows stopping compute while preserving data in managed storage. Paused clusters do not incur compute charges. The cluster runs 45 hours per week (8am-6pm Mon-Fri) out of 168 hours per week — 73% idle time. Pausing during idle periods reduces compute costs by ~73%. Managed storage charges continue. Reserved Nodes provide 40% discount but still charge for 168 hours per week.",
    "questionType": "single"
  },
  {
    "topic": "Architecture",
    "question": "A company's application uses S3 to store user-uploaded files. The files must be scanned for malware before being accessible to other users. Currently, files are immediately accessible after upload. The scanning process takes 30-60 seconds. Which architecture correctly implements the scan-before-access requirement?",
    "options": [
      "Scan files synchronously during the upload API call — block the response until scanning completes",
      "Use two S3 buckets: a quarantine bucket for initial uploads and a clean bucket for approved files. S3 event triggers Lambda on upload to quarantine bucket. Lambda runs the malware scan. If clean, Lambda copies the file to the clean bucket and deletes from quarantine. Users can only access the clean bucket. Bucket policies deny access to the quarantine bucket",
      "Use S3 Object Lock to prevent access to files until scanning completes",
      "Add a CloudFront distribution in front of S3 that runs the malware scan at the edge"
    ],
    "correctAnswers": [1],
    "explanation": "The two-bucket pattern is the standard architecture for scan-before-access: Quarantine bucket receives initial uploads with no public access. Lambda triggered by S3 events runs the malware scan. If clean: copy to clean bucket, delete from quarantine. If infected: move to a separate infected bucket, notify security team. Clean bucket only contains scanned files that users can access. This ensures files are never accessible before scanning.",
    "questionType": "single"
  },
  {
    "topic": "Database",
    "question": "A company's application uses Amazon Aurora PostgreSQL. The database has grown to 5TB. Queries that previously ran in 2 seconds now take 45 seconds. EXPLAIN ANALYZE shows the queries are performing sequential scans on a 500GB table. The table has a created_at timestamp column that is used in most WHERE clauses. The DBA wants to improve query performance without changing the application code. Which action provides the MOST immediate improvement?",
    "options": [
      "Upgrade to a larger Aurora instance type with more CPU and memory",
      "Create a B-tree index on the created_at column. For range queries (WHERE created_at BETWEEN x AND y), this converts sequential scans to index range scans, reducing query time from 45 seconds to milliseconds",
      "Enable Aurora Parallel Query to distribute query processing across multiple nodes",
      "Migrate to Amazon Redshift which is optimized for large analytical queries"
    ],
    "correctAnswers": [1],
    "explanation": "A B-tree index on created_at is the most targeted fix. Sequential scans on a 500GB table read every row — O(n) complexity. An index on created_at allows the query planner to use an index range scan — O(log n plus result set size). For queries filtering by date range, this typically reduces query time by 100-1000x. The fix requires no application code changes. Aurora Parallel Query helps with full-table analytical queries but does not eliminate the sequential scan.",
    "questionType": "single"
  },
  {
    "topic": "Serverless",
    "question": "A company has a Lambda function that processes messages from an SQS queue. The Lambda function calls a downstream API that can handle a maximum of 100 requests per second. The SQS queue receives 1,000 messages per second during peak hours. Lambda is scaling to 500 concurrent executions, each making API calls, overwhelming the downstream API. How should the Lambda concurrency be controlled to stay within the downstream API limit?",
    "options": [
      "Increase the SQS visibility timeout to slow down message processing",
      "Set Lambda reserved concurrency to 10 (assuming each execution processes 10 messages per second, 10 concurrent times 10 messages per second equals 100 requests per second to the downstream API). Use SQS as the buffer — messages accumulate during peak hours and are processed at a controlled rate",
      "Reduce the SQS batch size to 1 message per Lambda invocation",
      "Add an API Gateway rate limiter in front of the downstream API"
    ],
    "correctAnswers": [1],
    "explanation": "Lambda reserved concurrency limits the maximum number of concurrent executions. If each Lambda execution makes 1 API call per message and processes 10 messages per second, then 10 concurrent executions equals 100 API calls per second (matching the downstream limit). SQS acts as the buffer — messages accumulate during peak hours and are processed at the controlled rate. This is the standard pattern for rate-limiting Lambda against downstream services.",
    "questionType": "single"
  },
  {
    "topic": "Monitoring",
    "question": "A company's application is experiencing intermittent errors that only occur in production, not in staging. The errors happen 3-4 times per day and last 30-60 seconds. CloudWatch metrics show brief CPU spikes on the database. The team suspects a specific database query is causing the issue but cannot identify it. Which combination of tools helps identify the problematic query?",
    "options": [
      "Enable CloudWatch detailed monitoring on EC2 instances — 1-minute granularity metrics",
      "Enable RDS Performance Insights (identifies top SQL queries by load, wait events, and execution time), enable Enhanced Monitoring (OS-level metrics at 1-second granularity), and create CloudWatch Alarms on DatabaseConnections and CPUUtilization to capture the exact time of incidents for correlation with Performance Insights data",
      "Enable AWS X-Ray on the application to trace all database calls",
      "Use AWS CloudTrail to log all database API calls"
    ],
    "correctAnswers": [1],
    "explanation": "RDS Performance Insights is purpose-built for database performance troubleshooting. It shows top SQL queries by DB load (time spent waiting), wait events (what the database is waiting for — CPU, I/O, locks), active sessions over time, and query execution plans. When a CPU spike occurs, Performance Insights shows exactly which queries were running at that moment and their resource consumption. Enhanced Monitoring provides OS-level metrics at 1-second granularity.",
    "questionType": "single"
  },
  {
    "topic": "Migration",
    "question": "A company has 200 on-premises servers they want to migrate to AWS. Before migrating, they need to understand current CPU/memory/disk utilization of each server, network dependencies between servers (which servers communicate with each other), and recommended EC2 instance types for each server. Which AWS service provides this discovery and assessment capability?",
    "options": [
      "AWS CloudTrail — records API calls and can be used to discover server dependencies",
      "AWS Application Discovery Service — installs lightweight agents on on-premises servers to collect utilization data, network connections, and process information. The data is analyzed to provide EC2 sizing recommendations and dependency maps",
      "Amazon Inspector — scans servers for security vulnerabilities and configuration issues",
      "AWS Config — tracks configuration changes to AWS resources"
    ],
    "correctAnswers": [1],
    "explanation": "AWS Application Discovery Service is specifically designed for migration planning. The Discovery Agent collects CPU, memory, disk, and network utilization data; running processes; and network connections (which servers communicate with each other). This data is uploaded to AWS Migration Hub, which provides EC2 instance type recommendations based on actual utilization, dependency maps showing server communication patterns, and utilization reports.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company's S3 bucket contains sensitive financial reports. The bucket is private, but the security team wants to share specific reports with external auditors for 48 hours without creating IAM users for the auditors or making the bucket public. Which S3 feature enables this?",
    "options": [
      "Make the specific objects public temporarily, then make them private again after 48 hours",
      "Generate pre-signed URLs with a 48-hour expiration. Pre-signed URLs grant temporary access to a specific S3 object using the credentials of the IAM user/role that generated the URL. Anyone with the URL can access the object until the URL expires",
      "Create a temporary S3 bucket policy that allows the auditor IP address for 48 hours",
      "Use S3 Access Points to create a named endpoint for the auditors"
    ],
    "correctAnswers": [1],
    "explanation": "Pre-signed URLs provide temporary, time-limited access to private S3 objects without requiring AWS credentials or making objects public. The URL includes authentication information and an expiration time. Anyone with the URL can access the specific object until expiration. After 48 hours, the URL is invalid. Making objects public is a security risk. Bucket policies based on IP are complex and auditors may have dynamic IPs.",
    "questionType": "single"
  },
  {
    "topic": "Containers",
    "question": "A company runs a containerized application on Amazon EKS. The application has a frontend service and a backend API service. The frontend must be accessible from the internet, but the backend API must only be accessible from within the cluster (not from the internet). How should the Kubernetes services be configured?",
    "options": [
      "Create both services as LoadBalancer type — Kubernetes will manage access control",
      "Create the frontend service as type LoadBalancer (creates an AWS NLB/ALB with a public IP), and create the backend service as type ClusterIP (only accessible within the cluster via the cluster internal DNS). Add NetworkPolicies to restrict backend access to only the frontend pods",
      "Create both services as NodePort type and use security groups to restrict access",
      "Use a single service for both frontend and backend with path-based routing"
    ],
    "correctAnswers": [1],
    "explanation": "Kubernetes service types control network exposure: LoadBalancer creates an AWS load balancer with a public IP/DNS — appropriate for the internet-facing frontend. ClusterIP assigns an internal cluster IP only accessible within the cluster — appropriate for the backend API. NetworkPolicies add a layer of defense by restricting which pods can communicate with the backend (only frontend pods). NodePort exposes services on each node IP — still potentially accessible from outside the cluster.",
    "questionType": "single"
  },
  {
    "topic": "Analytics",
    "question": "A company wants to analyze 5 years of historical sales data (50TB) stored in S3 as Parquet files. They need to run ad-hoc SQL queries and create dashboards. The queries are complex with multiple JOINs across large tables. Response time should be under 30 seconds for most queries. Which AWS service is MOST appropriate?",
    "options": [
      "Amazon Athena — serverless SQL queries directly on S3 Parquet files",
      "Amazon Redshift — a columnar data warehouse optimized for complex analytical queries on large datasets, with Redshift Spectrum allowing queries on S3 data without loading into Redshift",
      "Amazon RDS PostgreSQL — a relational database that supports complex SQL queries",
      "Amazon EMR with Spark SQL — distributed processing for large datasets"
    ],
    "correctAnswers": [1],
    "explanation": "Amazon Redshift is purpose-built for complex analytical queries on large datasets. Columnar storage, data compression, and massively parallel processing (MPP) enable sub-30-second response times for complex multi-table JOINs on 50TB datasets. Redshift Spectrum allows querying S3 data directly without loading it into Redshift tables. Athena is excellent for ad-hoc queries but complex multi-table JOINs on 50TB can take minutes, not seconds. RDS is optimized for transactional workloads.",
    "questionType": "single"
  },
  {
    "topic": "High Availability",
    "question": "A company runs a stateful application where each EC2 instance maintains in-memory session state. The Auto Scaling group has a minimum of 2 and maximum of 10 instances. During a scale-in event, the Auto Scaling group terminates an instance that has 500 active user sessions. Users with sessions on the terminated instance are disconnected. How should the architecture be modified to prevent session loss during scale-in?",
    "options": [
      "Increase the minimum instance count to prevent scale-in events",
      "Externalize session state to Amazon ElastiCache for Redis. All instances read/write sessions to Redis. Enable Auto Scaling lifecycle hooks to delay instance termination — the hook triggers a Lambda function that migrates active sessions to Redis before the instance is terminated, then completes the lifecycle action",
      "Use sticky sessions on the load balancer to keep users on the same instance",
      "Disable scale-in to prevent instance termination"
    ],
    "correctAnswers": [1],
    "explanation": "The correct solution has two components: (1) Externalize session state to ElastiCache — sessions are stored in Redis, not in instance memory. Any instance can serve any user. (2) Lifecycle hooks — when Auto Scaling decides to terminate an instance, the hook pauses termination and triggers a Lambda function. Lambda can notify the application to drain connections gracefully. Since sessions are already in Redis, users are seamlessly served by other instances.",
    "questionType": "single"
  },
  {
    "topic": "Cost Optimization",
    "question": "A company runs 100 Lambda functions. A cost analysis shows Lambda is their second-largest AWS expense at $50,000 per month. Most functions are triggered by API Gateway and run for 500ms-2 seconds. Memory allocation ranges from 128MB to 3GB. Which optimization strategy reduces Lambda costs MOST effectively?",
    "options": [
      "Reduce all Lambda function timeouts to the minimum possible value",
      "Use AWS Lambda Power Tuning (open-source tool) to find the optimal memory configuration for each function. Lambda pricing is based on GB-seconds (memory times duration). Higher memory often reduces duration enough to lower total cost. Also implement Lambda Compute Savings Plans for a 17% discount on predictable invocations",
      "Consolidate all 100 functions into fewer, larger functions to reduce per-invocation overhead",
      "Switch all Lambda functions to ARM/Graviton2 architecture for 20% better price-performance"
    ],
    "correctAnswers": [1],
    "explanation": "Lambda Power Tuning runs each function at different memory settings and measures duration and cost (GB-seconds). Often, doubling memory reduces duration by more than 50%, resulting in lower total cost. Lambda Compute Savings Plans provide 17% discount for committed usage. Graviton2 provides 20% better price-performance and is a valid optimization, but Power Tuning typically finds larger savings.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company's application receives file uploads from users. The files are stored in S3 and processed by Lambda. A security researcher reports that an attacker could upload a malicious file that, when processed by Lambda, could execute arbitrary code (zip bomb, XML billion laughs attack, malicious PDF). Which security controls mitigate these risks?",
    "options": [
      "Enable S3 server-side encryption — it protects files from unauthorized access",
      "Implement file type validation (check magic bytes, not just extension), set Lambda memory and timeout limits to prevent resource exhaustion from zip bombs, run Lambda in a VPC with no internet access to prevent exfiltration, use AWS Lambda layers with security libraries (ClamAV for malware scanning), and process files in a separate AWS account (blast radius containment)",
      "Use AWS WAF to block malicious file uploads at the API layer",
      "Enable Amazon GuardDuty to detect malicious activity from the Lambda function"
    ],
    "correctAnswers": [1],
    "explanation": "Defense in depth for file processing: Magic byte validation prevents MIME type spoofing. Lambda timeout and memory limits prevent zip bomb resource exhaustion. VPC with no internet access prevents data exfiltration if code execution occurs. ClamAV (via Lambda Layer) scans for known malware. Separate AWS account for processing limits blast radius — if Lambda is compromised, the attacker cannot access production resources.",
    "questionType": "single"
  },
  {
    "topic": "Database",
    "question": "A company's application uses DynamoDB with on-demand capacity. The table has 10 billion items and 5TB of data. A new feature requires querying items by a secondary attribute (email address) that is not the partition key. Currently, this requires a full table scan. The email attribute is present on only 5% of items (500 million items). Which DynamoDB feature efficiently supports this query pattern?",
    "options": [
      "Add a Global Secondary Index (GSI) with email as the partition key. DynamoDB automatically maintains the GSI. Queries on the GSI return only items with the email attribute (sparse index — items without email are not included in the GSI), making queries efficient",
      "Use DynamoDB Streams to maintain a separate lookup table indexed by email",
      "Use Amazon Athena to query the DynamoDB table directly using SQL",
      "Export the DynamoDB table to S3 and use Athena for email-based queries"
    ],
    "correctAnswers": [0],
    "explanation": "A GSI with email as the partition key creates a sparse index — DynamoDB only includes items in the GSI if the indexed attribute (email) exists. Since only 5% of items have email, the GSI contains only 500 million items (not 10 billion). Queries on the GSI are efficient O(log n) lookups. DynamoDB automatically maintains the GSI as items are written.",
    "questionType": "single"
  },
  {
    "topic": "Networking",
    "question": "A company wants to allow their on-premises users to access internal AWS resources (EC2 instances in private subnets, RDS databases) using private IP addresses, as if they were on the same network. The connection must be encrypted and must not require the on-premises users to know the public IP addresses of AWS resources. Which AWS service provides this connectivity?",
    "options": [
      "AWS Direct Connect — provides a dedicated private connection but requires physical infrastructure",
      "AWS Site-to-Site VPN — creates an encrypted IPsec tunnel between the on-premises network and the AWS VPC. On-premises users can access AWS resources using private IP addresses. The VPN terminates on a Virtual Private Gateway in the VPC",
      "AWS Client VPN — allows individual users to connect to AWS from any location using OpenVPN",
      "Amazon WorkLink — provides secure access to internal web applications"
    ],
    "correctAnswers": [1],
    "explanation": "AWS Site-to-Site VPN creates an encrypted IPsec tunnel between the on-premises network (via a customer gateway device) and the AWS VPC (via a Virtual Private Gateway). Once established, on-premises users can access AWS resources using private IP addresses — the VPN makes the AWS VPC appear as an extension of the on-premises network. Traffic is encrypted in transit. No public IPs needed for AWS resources. Direct Connect is a physical dedicated connection (takes weeks to provision).",
    "questionType": "single"
  },
  {
    "topic": "Serverless",
    "question": "A company builds a REST API using API Gateway and Lambda. The API has 50 endpoints. During load testing, they discover that 3 endpoints (product search, user recommendations, pricing calculator) account for 95% of all traffic. These 3 endpoints are also the most compute-intensive. The other 47 endpoints have minimal traffic. How should the API be optimized for cost and performance?",
    "options": [
      "Increase memory allocation for all 50 Lambda functions uniformly",
      "Apply Lambda Provisioned Concurrency only to the 3 high-traffic functions (eliminates cold starts for these critical endpoints). Configure API Gateway caching for product search and pricing calculator results (these are likely cacheable). Keep the 47 low-traffic functions as on-demand Lambda (cold starts acceptable for infrequent requests)",
      "Migrate all 50 endpoints to EC2 instances for consistent performance",
      "Combine all 50 endpoints into a single Lambda function to reduce cold starts"
    ],
    "correctAnswers": [1],
    "explanation": "Targeted optimization: Provisioned Concurrency for the 3 high-traffic, compute-intensive functions eliminates cold starts where it matters most. API Gateway caching (TTL 60-300 seconds) for product search and pricing calculator reduces Lambda invocations for repeated identical requests — significant cost and latency reduction. The 47 low-traffic functions do not justify Provisioned Concurrency costs (you pay for provisioned capacity even when idle).",
    "questionType": "single"
  },
  {
    "topic": "Storage",
    "question": "A company runs a database on EC2 with high I/O requirements: 50,000 IOPS, sub-millisecond latency, and 1TB storage. The database performs random 4KB reads and writes. Which EBS volume type meets these requirements?",
    "options": [
      "gp3 (General Purpose SSD) — up to 16,000 IOPS, suitable for most workloads",
      "io2 Block Express — up to 256,000 IOPS, sub-millisecond latency, designed for I/O-intensive databases like Oracle, SAP HANA, and Microsoft SQL Server requiring high IOPS",
      "st1 (Throughput Optimized HDD) — high throughput for sequential workloads",
      "sc1 (Cold HDD) — lowest cost for infrequently accessed data"
    ],
    "correctAnswers": [1],
    "explanation": "io2 Block Express is the highest-performance EBS volume type: up to 256,000 IOPS, sub-millisecond latency, 4,000 MB/s throughput, and 64TB maximum size. It is designed for I/O-intensive databases requiring consistent high performance. For 50,000 IOPS with sub-millisecond latency, io2 Block Express is the appropriate choice. gp3 maxes out at 16,000 IOPS — insufficient for 50,000 IOPS requirement.",
    "questionType": "single"
  },
  {
    "topic": "Architecture",
    "question": "A company is designing a global e-commerce platform. Users in Asia, Europe, and North America all need fast page loads. Product images (average 2MB each, 100,000 images) are stored in S3 in us-east-1. The checkout process requires real-time inventory checks against a central database. Which architecture provides the best global user experience?",
    "options": [
      "Deploy all resources in us-east-1 with the highest number of EC2 instances for capacity",
      "Use CloudFront to cache product images at edge locations globally (eliminates S3 latency for images). Deploy the application in multiple regions (us-east-1, eu-west-1, ap-southeast-1) with Route 53 latency-based routing. Use Aurora Global Database for the inventory database — primary in us-east-1, read replicas in eu-west-1 and ap-southeast-1 with less than 1 second replication lag",
      "Use S3 Cross-Region Replication to copy images to buckets in each region",
      "Use AWS Global Accelerator to route all traffic to us-east-1 over the AWS backbone"
    ],
    "correctAnswers": [1],
    "explanation": "Multi-layer global optimization: CloudFront caches the 100,000 product images at 400+ edge locations — users get images from the nearest edge (milliseconds) instead of S3 in us-east-1 (hundreds of milliseconds). Multi-region deployment with Route 53 latency routing directs users to the nearest application region. Aurora Global Database provides a single logical database with a primary in us-east-1 for writes and read replicas in eu-west-1 and ap-southeast-1 with less than 1 second lag.",
    "questionType": "single"
  },
  {
    "topic": "Security",
    "question": "A company uses AWS Secrets Manager to store database credentials. A Lambda function retrieves the credentials on every invocation (10,000 invocations per day). The Secrets Manager API costs are becoming significant. The Lambda function is also experiencing occasional throttling from Secrets Manager. Which optimization reduces both cost and throttling?",
    "options": [
      "Store the credentials in environment variables — faster retrieval with no API calls",
      "Use the AWS Secrets Manager cache client library in Lambda. The library caches the secret in memory for the duration of the Lambda execution environment (typically several minutes to hours). Secrets are only fetched from Secrets Manager when the cache expires or the secret rotates, reducing API calls by 99%+",
      "Increase the Lambda timeout to reduce the number of invocations",
      "Store credentials in AWS Systems Manager Parameter Store which has higher API limits"
    ],
    "correctAnswers": [1],
    "explanation": "The Secrets Manager cache client caches secrets in the Lambda execution environment memory. Since Lambda execution environments are reused for multiple invocations (warm starts), the cache persists across invocations. A secret fetched once may serve thousands of invocations before the cache expires. This reduces Secrets Manager API calls by 99%+, eliminating throttling and reducing costs. Environment variables store credentials in plaintext and do not support automatic rotation.",
    "questionType": "single"
  },
  {
    "topic": "Monitoring",
    "question": "A company wants to implement a centralized security monitoring solution across 50 AWS accounts. They want to aggregate security findings from GuardDuty, Inspector, Macie, and IAM Access Analyzer into a single dashboard. They also want to automatically remediate common findings (e.g., automatically isolate an EC2 instance when GuardDuty detects cryptocurrency mining). Which AWS service provides this centralized security management?",
    "options": [
      "Amazon CloudWatch — aggregate metrics and logs from all accounts",
      "AWS Security Hub — aggregates security findings from multiple AWS security services and third-party tools across accounts. Security Hub normalizes findings into a standard format, provides a consolidated dashboard, calculates a security score, and integrates with EventBridge for automated remediation workflows",
      "AWS Config — tracks configuration compliance across accounts",
      "Amazon Detective — investigates security incidents using ML"
    ],
    "correctAnswers": [1],
    "explanation": "AWS Security Hub is the central security management service: It aggregates findings from GuardDuty, Inspector, Macie, IAM Access Analyzer, Firewall Manager, and third-party tools. Findings are normalized to the AWS Security Finding Format (ASFF). EventBridge rules trigger automated remediation — when GuardDuty detects cryptocurrency mining, EventBridge triggers a Lambda function that isolates the EC2 instance. Security Hub supports cross-account aggregation via AWS Organizations.",
    "questionType": "single"
  },
  {
    "topic": "Database",
    "question": "A company's application uses Amazon ElastiCache for Redis as a session store. The Redis cluster has 3 nodes. During a node failure, 33% of users are logged out because their sessions were only stored on the failed node. The company wants to ensure session data survives individual node failures. Which ElastiCache feature provides this?",
    "options": [
      "Enable ElastiCache Multi-AZ — it automatically fails over to a standby node",
      "Enable Redis Cluster Mode with replication groups. Each shard has a primary node and one or more replica nodes. If a primary node fails, ElastiCache automatically promotes a replica to primary. Session data is replicated to replicas before acknowledging writes, ensuring no session loss during node failures",
      "Increase the number of nodes from 3 to 6 — more nodes reduce the impact of individual failures",
      "Use ElastiCache for Memcached instead of Redis — Memcached has better fault tolerance"
    ],
    "correctAnswers": [1],
    "explanation": "Redis replication groups provide high availability: each shard has a primary and one or more replicas. Writes are replicated to replicas. If a primary fails, ElastiCache automatically promotes a replica to primary within seconds. Sessions stored on the failed primary are available on the replica. Multi-AZ ensures the replica is in a different AZ from the primary. Increasing node count without replication does not protect against node failures. Memcached does not support replication.",
    "questionType": "single"
  },
  {
    "topic": "Migration",
    "question": "A company wants to migrate their on-premises VMware environment to AWS. They have 500 VMs running Windows and Linux workloads. They want to minimize downtime (target less than 1 hour per application) and need the ability to test the migrated workloads in AWS before cutting over. Which AWS service provides this capability?",
    "options": [
      "AWS Snowball — physically ship the VM disk images to AWS",
      "AWS Application Migration Service (MGN) — installs a lightweight replication agent on each VM, continuously replicates the server to AWS in the background (block-level replication), allows launching test instances in AWS at any time to validate the migration, and performs cutover with less than 1 hour downtime when ready",
      "AWS Server Migration Service (SMS) — creates incremental AMIs from on-premises VMs",
      "AWS DataSync — transfers VM disk images to S3 for conversion to AMIs"
    ],
    "correctAnswers": [1],
    "explanation": "AWS Application Migration Service (MGN) is the recommended service for lift-and-shift migrations. It installs a lightweight agent that performs continuous block-level replication to AWS (keeping the AWS copy in sync with the source). At any time, you can launch a test instance in AWS to validate the application works correctly — without affecting the source server. When ready for cutover, you stop the source server, wait for final sync (minutes), and launch the production instance. Total downtime is typically less than 1 hour.",
    "questionType": "single"
  },
  {
    "topic": "Networking",
    "question": "A company's application in a VPC needs to call an external payment API over the internet. The security team requires that all outbound traffic be inspected for data exfiltration (DLP). They want to block outbound connections to all domains except the payment API domain (api.payment-provider.com). Which architecture implements domain-based outbound filtering?",
    "options": [
      "Use a NAT Gateway with security groups to restrict outbound traffic by IP address",
      "Deploy AWS Network Firewall in the VPC with a stateful rule group that allows outbound traffic only to api.payment-provider.com (domain-based filtering) and blocks all other outbound traffic. Route outbound traffic through the Network Firewall before the NAT Gateway",
      "Use VPC Security Groups with outbound rules allowing only the payment API IP addresses",
      "Use AWS WAF to inspect and filter outbound traffic"
    ],
    "correctAnswers": [1],
    "explanation": "AWS Network Firewall supports stateful domain-based filtering — you can create rules that allow/deny traffic based on domain names (SNI for TLS, HTTP Host header). This is critical because payment API IPs can change (CDNs, load balancers). Security Groups only support IP-based rules, not domain names. The architecture: EC2 to Network Firewall (inspects and filters by domain) to NAT Gateway to Internet. WAF inspects inbound HTTP/HTTPS traffic, not outbound traffic from EC2 instances.",
    "questionType": "single"
  },
  {
    "topic": "Serverless",
    "question": "A company has a Lambda function that processes financial transactions. The function must process each transaction exactly once — duplicate processing would result in double charges. The function is triggered by an SQS queue. If the function fails, the message is retried. How should the architecture be designed to ensure exactly-once processing?",
    "options": [
      "Set the SQS visibility timeout to 0 — messages are immediately visible after failure for fast retry",
      "Implement idempotency using a DynamoDB table to track processed transaction IDs. Before processing, check if the transaction ID exists in DynamoDB (conditional write). If it exists, skip processing and return success. If it does not exist, process the transaction and write the ID to DynamoDB atomically. Set SQS visibility timeout greater than Lambda timeout to prevent concurrent processing of the same message",
      "Use FIFO SQS queues — they guarantee exactly-once delivery",
      "Set Lambda reserved concurrency to 1 — only one transaction is processed at a time"
    ],
    "correctAnswers": [1],
    "explanation": "SQS provides at-least-once delivery (messages may be delivered multiple times). True exactly-once processing requires idempotency: Before processing, check DynamoDB for the transaction ID (conditional expression: attribute_not_exists(transactionId)). If the condition fails (ID exists), the transaction was already processed — return success without processing. If the condition succeeds, process the transaction and write the ID atomically. SQS visibility timeout greater than Lambda timeout prevents another Lambda from picking up the same message while it is being processed.",
    "questionType": "single"
  },
  {
    "topic": "Database",
    "question": "A company's application has a read-heavy workload: 95% reads, 5% writes. The application uses Amazon Aurora PostgreSQL. Read queries are slow because the primary instance is handling all reads. The company wants to scale read capacity. Which Aurora feature distributes read traffic across multiple instances?",
    "options": [
      "Enable Aurora Multi-AZ — the standby instance handles read traffic",
      "Add Aurora Read Replicas and configure the application to use the Aurora Reader Endpoint. The reader endpoint load-balances read connections across all available Aurora Replicas. Aurora Replicas have sub-10ms replication lag from the primary, providing near-real-time read consistency",
      "Enable Aurora Parallel Query — it distributes query processing across storage nodes",
      "Use Aurora Global Database — the secondary region handles read traffic"
    ],
    "correctAnswers": [1],
    "explanation": "Aurora Read Replicas scale read capacity horizontally. The Aurora Reader Endpoint automatically load-balances read connections across all replicas (up to 15 replicas). Aurora Replicas share the same underlying storage as the primary — replication lag is typically less than 10ms. The application connects to the reader endpoint for reads and the writer endpoint for writes — no complex routing logic needed. Aurora Multi-AZ standby is for failover only (not for read scaling).",
    "questionType": "single"
  },
  {
    "topic": "Cost Optimization",
    "question": "A company runs a machine learning training workload on EC2 P3 instances (GPU). Training jobs run for 4-8 hours and can be checkpointed and resumed if interrupted. The jobs run 3-4 times per week. The company is paying $30,000 per month for On-Demand P3 instances. Which purchasing strategy reduces costs while meeting the workload requirements?",
    "options": [
      "Purchase Reserved P3 Instances for 1 year — provides 40% discount for predictable workloads",
      "Use EC2 Spot Instances for P3 instances — up to 70-90% discount. Implement checkpointing to S3 every 30 minutes so interrupted jobs can resume from the last checkpoint. Use Spot Instance interruption notices (2-minute warning) to trigger checkpoint saves before termination",
      "Use AWS Savings Plans — provides flexibility across instance types",
      "Use On-Demand Capacity Reservations to guarantee P3 capacity"
    ],
    "correctAnswers": [1],
    "explanation": "ML training jobs are the ideal Spot Instance workload: they are long-running (can save significant money), can be checkpointed and resumed (interruption-tolerant), and run on GPU instances which have high Spot discounts (70-90%). Implementation: checkpoint model weights to S3 every 30 minutes. When a Spot interruption notice arrives (2-minute warning), save the current checkpoint and terminate gracefully. When a new Spot instance starts, resume from the latest checkpoint. This reduces costs from $30,000 per month to $3,000-$9,000 per month.",
    "questionType": "single"
  }
]

script_lines = [
    "import mysql from 'mysql2/promise';",
    "import dotenv from 'dotenv';",
    "dotenv.config();",
    "",
    "const saaQuestions = " + json.dumps(questions, indent=2) + ";",
    "",
    "async function seedSAAQuestions() {",
    "  const conn = await mysql.createConnection(process.env.DATABASE_URL || '');",
    "  console.log('Deleting ALL existing SAA-C03 questions...');",
    "  const [del] = await conn.execute(\"DELETE FROM aws_questions WHERE certification = 'SAA-C03'\");",
    "  console.log('Deleted rows:', del.affectedRows);",
    "  console.log('Inserting', saaQuestions.length, 'hard SAA-C03 questions...');",
    "  for (const q of saaQuestions) {",
    "    await conn.execute(",
    "      'INSERT INTO aws_questions (certification, topic, question_text, options, correct_answers, explanation, question_type) VALUES (?, ?, ?, ?, ?, ?, ?)',",
    "      [",
    "        'SAA-C03',",
    "        q.topic,",
    "        q.question,",
    "        JSON.stringify(q.options),",
    "        JSON.stringify(q.correctAnswers.map(i => q.options[i])),",
    "        q.explanation,",
    "        q.questionType",
    "      ]",
    "    );",
    "  }",
    "  const [rows] = await conn.execute(\"SELECT COUNT(*) as count FROM aws_questions WHERE certification = 'SAA-C03'\");",
    "  console.log('SAA-C03 questions in DB:', rows[0].count);",
    "  await conn.end();",
    "  console.log('Done!');",
    "}",
    "",
    "seedSAAQuestions().catch(console.error);",
]

with open('/home/ubuntu/aws-ai-tutor-pro/scripts/seed-saa-questions.mjs', 'w') as f:
    f.write('\n'.join(script_lines))

print(f'Written {len(questions)} SAA questions to seed-saa-questions.mjs')
