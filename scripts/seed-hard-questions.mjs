import mysql from 'mysql2/promise';

// Hard, scenario-based SAA-C03 questions (65 total)
const saaQuestions = [
  {
    topic: "High Availability",
    question: "A financial services company runs a critical trading application on EC2 instances behind an Application Load Balancer across two Availability Zones. During peak trading hours, one AZ experiences a partial network disruption causing 40% packet loss. The ALB health checks are still passing because the instances respond slowly. Users report intermittent 5xx errors and slow response times. The on-call engineer needs to immediately route all traffic away from the degraded AZ without terminating instances or modifying the Auto Scaling group. What is the FASTEST solution?",
    options: [
      "Modify the ALB listener rules to add a condition that blocks traffic from the affected AZ's subnet CIDR",
      "Use the ALB's 'Availability Zone' setting to disable the affected AZ, which stops the ALB from routing new requests to targets in that AZ",
      "Update the security group on the affected AZ's instances to block port 80 and 443 inbound traffic",
      "Create a CloudWatch alarm that triggers a Lambda function to deregister targets in the affected AZ from the target group"
    ],
    correctAnswers: [1],
    explanation: "ALB supports disabling an Availability Zone directly from the load balancer configuration. When an AZ is disabled, the ALB stops routing new requests to targets in that AZ while existing connections drain gracefully. This is faster than modifying security groups (which would cause connection resets) or using Lambda automation. The ALB continues to serve traffic from the healthy AZ immediately.",
    questionType: "single"
  },
  {
    topic: "Database",
    question: "A company operates a multi-tenant SaaS platform using Amazon Aurora MySQL. Each tenant's data is stored in separate schemas within the same Aurora cluster. The largest tenant generates 70% of the total read traffic. The DBA notices that this tenant's queries are causing lock contention that affects other tenants. The company wants to isolate this tenant's read traffic without changing the application connection strings or the database schema structure. Which solution achieves this with the LEAST operational overhead?",
    options: [
      "Create a separate Aurora cluster for the large tenant and use Route 53 weighted routing to split traffic",
      "Add Aurora Read Replicas and configure the application to use the reader endpoint for the large tenant's read queries",
      "Use Aurora Custom Endpoints to create a dedicated reader endpoint for the large tenant, then update only that tenant's connection configuration",
      "Migrate the large tenant to a dedicated RDS instance and use AWS Database Migration Service for ongoing replication"
    ],
    correctAnswers: [2],
    explanation: "Aurora Custom Endpoints allow you to create named endpoints that route to specific subsets of DB instances in the cluster. By creating a custom reader endpoint for the large tenant and pointing only their connection to it, you isolate their read traffic to dedicated replicas without changing the shared cluster architecture or other tenants' connection strings. This requires minimal operational overhead compared to creating a separate cluster or migrating to RDS.",
    questionType: "single"
  },
  {
    topic: "Security",
    question: "A healthcare company stores PHI (Protected Health Information) in S3. A security audit reveals that an IAM role used by a Lambda function has s3:* permissions on all buckets. The security team wants to implement least privilege but is concerned about breaking the Lambda function, which reads from one specific bucket and writes processed results to another bucket. Additionally, the function must be prevented from ever deleting objects. Which IAM policy configuration correctly implements least privilege?",
    options: [
      "Attach a policy allowing s3:GetObject on the source bucket ARN, s3:PutObject on the destination bucket ARN, and a separate Deny policy for s3:DeleteObject on all resources",
      "Attach a policy allowing s3:GetObject and s3:PutObject on both bucket ARNs with a condition key aws:RequestedRegion matching the deployment region",
      "Replace the s3:* with s3:GetObject on the source bucket ARN and s3:PutObject on the destination bucket ARN — the absence of s3:DeleteObject in the Allow policy is sufficient",
      "Use a Service Control Policy (SCP) to deny s3:DeleteObject for the Lambda execution role across the entire organization"
    ],
    correctAnswers: [2],
    explanation: "In IAM, if an action is not explicitly allowed, it is implicitly denied. You only need to allow s3:GetObject on the source bucket ARN and s3:PutObject on the destination bucket ARN. Since s3:DeleteObject is never granted, the Lambda function cannot delete objects — no explicit Deny is needed. Option A is redundant (the Deny is unnecessary). Option B adds unnecessary conditions. Option D uses SCPs which apply to the whole OU/account, not just one role.",
    questionType: "single"
  },
  {
    topic: "Networking",
    question: "A company has a hub-and-spoke network topology with a Transit Gateway connecting 12 VPCs across 3 AWS accounts. A new compliance requirement mandates that all inter-VPC traffic must be inspected by a centralized firewall appliance running in a dedicated 'security VPC'. The firewall appliance uses a third-party solution that requires traffic to be sent to it via its private IP. The solution must support asymmetric routing inspection and must not require changes to the spoke VPCs' route tables for each new spoke added. Which architecture satisfies ALL requirements?",
    options: [
      "Deploy the firewall in the security VPC, create a Transit Gateway attachment for the security VPC, and configure Transit Gateway route tables to send all inter-VPC traffic through the security VPC attachment using blackhole routes for direct spoke-to-spoke communication",
      "Use AWS Network Firewall in the security VPC with Transit Gateway routing, configuring the firewall endpoint as the next hop in Transit Gateway route tables for all spoke-to-spoke traffic",
      "Deploy the firewall appliance behind a Gateway Load Balancer in the security VPC, use a Gateway Load Balancer Endpoint in each spoke VPC, and configure Transit Gateway to route traffic through the security VPC",
      "Use VPC peering between each spoke VPC and the security VPC, configure spoke VPC route tables to send all traffic to the security VPC peering connection, and use the firewall's ENI as the next hop"
    ],
    correctAnswers: [2],
    explanation: "Gateway Load Balancer (GWLB) is specifically designed for third-party network appliances requiring transparent inspection. GWLB endpoints in spoke VPCs intercept traffic and forward it to the GWLB in the security VPC, which distributes it to firewall appliances using GENEVE encapsulation. This handles asymmetric routing natively. Transit Gateway with GWLB endpoints means new spokes only need a GWLB endpoint — spoke route tables don't need per-spoke changes. Option B (AWS Network Firewall) doesn't support third-party appliances. Option A doesn't handle asymmetric routing. Option D requires peering changes for every new spoke.",
    questionType: "single"
  },
  {
    topic: "Compute",
    question: "A machine learning company runs GPU-intensive training jobs that take 6-8 hours to complete. Jobs are submitted through an SQS queue and processed by EC2 P3 instances. The company has been experiencing significant cost overruns because Spot Instance interruptions mid-training require restarting jobs from scratch, wasting 4-6 hours of compute. The company wants to reduce costs by at least 60% compared to On-Demand while making interrupted jobs resume from checkpoints rather than restart. Which combination of changes achieves this?",
    options: [
      "Switch to EC2 Spot Instances with Spot Instance interruption notices, implement checkpoint saving to S3 every 30 minutes in the training code, and configure the SQS message visibility timeout to match the checkpoint interval",
      "Use EC2 Spot Instances with a Spot Fleet using 'capacity-optimized' allocation strategy, implement checkpoint saving to EFS every 30 minutes, configure the training job to load the latest checkpoint on startup, and use SQS message visibility timeout to prevent duplicate processing",
      "Use Reserved Instances for 1 year with a 'no upfront' payment option, which provides ~40% savings, and implement checkpointing to avoid the restart problem",
      "Use EC2 Auto Scaling with mixed instances policy (20% On-Demand, 80% Spot), implement checkpoint saving to S3, and use AWS Batch with retry strategies to automatically resubmit interrupted jobs"
    ],
    correctAnswers: [1],
    explanation: "Spot Instances provide 60-90% savings over On-Demand. The 'capacity-optimized' allocation strategy picks the Spot pool with the most available capacity, reducing interruption probability for long-running jobs. Checkpointing to EFS (shared, persistent) every 30 minutes means at most 30 minutes of work is lost on interruption. Loading the latest checkpoint on startup resumes training. Proper SQS visibility timeout management prevents duplicate job processing. Option A uses S3 (slower for frequent checkpoints) and doesn't address the allocation strategy. Option C only provides ~40% savings, not 60%. Option D with AWS Batch is viable but more complex and the 20% On-Demand floor may not achieve 60% savings.",
    questionType: "single"
  },
  {
    topic: "Storage",
    question: "A media company ingests 50TB of raw video footage daily to S3. The footage is processed within 24 hours of upload, then accessed infrequently for 30 days (for re-processing requests), then rarely accessed for 1 year (for compliance), then must be retained for 7 years but is almost never accessed. The company wants to minimize storage costs while ensuring objects are available within 12 hours when needed during the compliance period, and within 48 hours during the 7-year archive period. Which S3 lifecycle configuration is MOST cost-effective?",
    options: [
      "Transition to S3 Standard-IA after 30 days, S3 Glacier Flexible Retrieval after 1 year, S3 Glacier Deep Archive after 7 years",
      "Transition to S3 Intelligent-Tiering after 1 day, which automatically manages all transitions",
      "Transition to S3 Standard-IA after 30 days, S3 Glacier Instant Retrieval after 1 year (for 12-hour SLA), S3 Glacier Deep Archive after 2 years (for 48-hour SLA)",
      "Transition to S3 One Zone-IA after 30 days, S3 Glacier Flexible Retrieval after 1 year, S3 Glacier Deep Archive after 2 years"
    ],
    correctAnswers: [2],
    explanation: "S3 Standard for the first 30 days (active processing). S3 Standard-IA after 30 days (infrequent access, lower cost). S3 Glacier Instant Retrieval after 1 year provides millisecond retrieval — well within the 12-hour SLA — at lower cost than Standard-IA. S3 Glacier Deep Archive after 2 years provides the lowest storage cost with 12-48 hour retrieval, meeting the 48-hour SLA for the 7-year archive period. Option A uses Glacier Flexible Retrieval (1-12 hours) which meets the SLA but Glacier Instant Retrieval is cheaper for the compliance period. Option B (Intelligent-Tiering) has monitoring fees that make it expensive for predictable access patterns. Option D uses One Zone-IA which lacks the redundancy required for compliance data.",
    questionType: "single"
  },
  {
    topic: "Serverless",
    question: "A company has a serverless API built with API Gateway and Lambda. During a flash sale, the API receives 50,000 requests per second for 10 minutes. Lambda functions are timing out and API Gateway returns 429 errors. Investigation reveals Lambda concurrency is hitting the account-level limit of 1,000. The company cannot increase the account limit in time. The Lambda function calls a downstream RDS database. Which combination of changes provides the MOST immediate relief without changing the core architecture?",
    options: [
      "Enable API Gateway caching for GET endpoints, configure Lambda reserved concurrency to 900 (leaving 100 for other functions), and add an SQS queue between API Gateway and Lambda to buffer requests",
      "Enable API Gateway caching for GET endpoints with a 60-second TTL, configure Lambda Provisioned Concurrency to 1,000, and use RDS Proxy to pool database connections",
      "Add an SQS queue between API Gateway and Lambda using API Gateway's SQS integration, set Lambda reserved concurrency to 500, and implement exponential backoff in the client",
      "Enable API Gateway throttling at 10,000 RPS with burst limit 5,000, enable Lambda SnapStart, and use ElastiCache to cache database query results"
    ],
    correctAnswers: [0],
    explanation: "API Gateway caching immediately reduces Lambda invocations for repeated GET requests during the flash sale. Reserving 900 concurrency for this function (leaving 100 for other critical functions) prevents starvation. Adding SQS between API Gateway and Lambda converts synchronous requests to asynchronous, allowing the queue to absorb the burst while Lambda processes at its maximum concurrency rate — requests are queued rather than rejected. Option B's Provisioned Concurrency doesn't increase the account limit. Option C's reserved concurrency of 500 is too low. Option D's SnapStart reduces cold start latency but doesn't address concurrency limits.",
    questionType: "single"
  },
  {
    topic: "Migration",
    question: "A company is migrating a monolithic Java application from on-premises to AWS. The application has a 2TB Oracle database with 500GB of active data, 200 stored procedures, and uses Oracle-specific features including partitioning, advanced queuing, and materialized views. The migration must complete within a 4-hour maintenance window with no more than 15 minutes of actual downtime. The company wants to move to Aurora PostgreSQL to reduce licensing costs. Which migration strategy is MOST appropriate?",
    options: [
      "Use AWS Schema Conversion Tool (SCT) to convert the schema and stored procedures, AWS DMS with full-load plus CDC replication to Aurora PostgreSQL, test thoroughly, then cut over during the maintenance window by stopping the application, letting CDC catch up, and switching the connection string",
      "Use AWS DMS full-load only migration during the maintenance window, accepting that some stored procedures must be manually rewritten after migration",
      "Use AWS Snowball to transfer the 2TB database to S3, then use AWS DMS to load from S3 to Aurora PostgreSQL during the maintenance window",
      "Use Oracle Data Guard to replicate to an EC2-hosted Oracle instance, then use pg_dump to export and import to Aurora PostgreSQL during the maintenance window"
    ],
    correctAnswers: [0],
    explanation: "SCT + DMS with CDC is the standard approach for heterogeneous database migrations with minimal downtime. SCT converts Oracle schema objects and stored procedures to PostgreSQL equivalents (flagging items needing manual review). DMS full-load replicates existing data, then CDC continuously replicates changes until cutover. During the maintenance window, you stop the application, wait for CDC lag to reach zero (typically minutes), update the connection string, and restart — achieving the 15-minute downtime target. Option B requires full downtime for the entire 2TB load. Option C (Snowball) is for offline transfers and would exceed the maintenance window. Option D doesn't address the Oracle-to-PostgreSQL conversion.",
    questionType: "single"
  },
  {
    topic: "Cost Optimization",
    question: "A company's AWS bill for EC2 has increased 300% over 6 months due to rapid growth. Analysis shows: 40% of instances run at <10% CPU utilization, 30% of EBS volumes are unattached, 20% of Elastic IPs are unassociated, and the remaining instances run at 60-80% CPU with predictable 24/7 workloads. The company wants to reduce the bill by at least 50% within 30 days without impacting production workloads. Which combination of actions achieves this?",
    options: [
      "Purchase 3-year Reserved Instances for all instances, delete unattached EBS volumes, release unassociated Elastic IPs, and right-size underutilized instances using AWS Compute Optimizer recommendations",
      "Right-size underutilized instances to smaller types using Compute Optimizer, delete unattached EBS volumes and unassociated Elastic IPs, purchase 1-year Reserved Instances or Savings Plans for the consistently-running instances, and consider Spot Instances for fault-tolerant workloads",
      "Enable S3 Intelligent-Tiering, purchase Reserved Instances for 40% of instances, and use AWS Cost Anomaly Detection to monitor future increases",
      "Migrate all workloads to Lambda functions, which eliminates EC2 costs entirely and charges only for actual compute time used"
    ],
    correctAnswers: [1],
    explanation: "Right-sizing underutilized instances (40% running at <10% CPU) can reduce those costs by 50-75%. Deleting unattached EBS volumes and releasing unassociated Elastic IPs eliminates waste immediately. Purchasing 1-year Reserved Instances or Savings Plans for the 60-80% CPU instances (which run 24/7 predictably) provides 30-40% savings over On-Demand. Together these actions can achieve >50% savings within 30 days. Option A's 3-year commitment is too long for a rapidly growing company. Option C addresses S3 (not the EC2 problem). Option D is impractical — migrating a monolithic application to Lambda in 30 days is not feasible.",
    questionType: "single"
  },
  {
    topic: "Disaster Recovery",
    question: "A global e-commerce company has an RPO of 1 hour and RTO of 4 hours for its order processing system. The primary region is us-east-1. The system uses Aurora MySQL, SQS queues, and EC2 instances in an Auto Scaling group. The company currently has no DR setup. Which DR strategy meets the RPO/RTO requirements at the LOWEST cost?",
    options: [
      "Multi-site active/active: Deploy identical infrastructure in eu-west-1, use Aurora Global Database with <1 second replication, and Route 53 health checks for automatic failover",
      "Warm standby: Deploy a scaled-down version of the infrastructure in eu-west-1 with Aurora Global Database, pre-configured Auto Scaling groups with minimum 1 instance, and Route 53 failover routing",
      "Pilot light: Deploy only Aurora Global Database secondary in eu-west-1 with automated snapshots, and use CloudFormation to provision EC2 and SQS infrastructure during a DR event",
      "Backup and restore: Take hourly Aurora snapshots and copy to eu-west-1, store CloudFormation templates in S3, and restore everything from scratch during a DR event"
    ],
    correctAnswers: [1],
    explanation: "Warm standby meets both requirements at lower cost than active/active. Aurora Global Database provides <1 second replication lag, meeting the 1-hour RPO. A scaled-down Auto Scaling group (minimum 1 instance) in eu-west-1 means infrastructure is already running and can scale up quickly. Route 53 failover with health checks triggers automatic DNS cutover. Scaling up from 1 instance to full capacity takes minutes, meeting the 4-hour RTO. Option A (active/active) exceeds requirements and costs significantly more. Option C (pilot light) requires provisioning EC2 and SQS from scratch during the DR event — this may exceed the 4-hour RTO. Option D (backup/restore) definitely cannot meet a 4-hour RTO for a complex system.",
    questionType: "single"
  },
  {
    topic: "Monitoring",
    question: "A DevOps team manages 200 microservices deployed on ECS Fargate. They are experiencing intermittent latency spikes that are difficult to diagnose because the issue spans multiple services. The team needs to identify which service in the call chain is causing the latency and correlate logs across services for a specific failing request. They currently use CloudWatch Logs but have no distributed tracing. Which solution provides the MOST comprehensive observability with the LEAST code changes?",
    options: [
      "Implement AWS X-Ray by adding the X-Ray SDK to each service, configure X-Ray daemon as a sidecar container in ECS task definitions, and use X-Ray Service Map to visualize the call chain and identify latency bottlenecks",
      "Use CloudWatch Container Insights with ECS, which automatically collects metrics and logs from all containers and provides service-level latency analysis",
      "Add correlation IDs to all service logs manually, create CloudWatch Logs Insights queries to correlate logs across services using the correlation ID, and set up CloudWatch dashboards",
      "Deploy an ELK stack (Elasticsearch, Logstash, Kibana) on EC2 instances, configure all services to ship logs to Logstash, and use Kibana for distributed tracing"
    ],
    correctAnswers: [0],
    explanation: "AWS X-Ray provides distributed tracing specifically designed for microservices. The X-Ray SDK auto-instruments HTTP calls between services, capturing timing data for each segment. The X-Ray daemon as an ECS sidecar requires only a task definition change — no application code changes for basic tracing. The Service Map visually shows the call chain and highlights latency bottlenecks. X-Ray also correlates traces with CloudWatch Logs. Option B (Container Insights) provides metrics but not distributed tracing across service call chains. Option C requires significant manual work and doesn't provide visual call chain analysis. Option D (ELK) requires significant infrastructure management and doesn't provide native AWS integration.",
    questionType: "single"
  },
  {
    topic: "Caching",
    question: "A social media application uses ElastiCache Redis for session storage and caching. The cache cluster is a single-node Redis instance. During a recent Redis node failure, all users were logged out and the application experienced a 10-minute outage while the node was replaced. Additionally, the team notices that cache hit rates drop to 0% every time they deploy new application versions because the deployment process flushes the cache. Which architecture changes address BOTH problems?",
    options: [
      "Upgrade to ElastiCache Redis with Multi-AZ and automatic failover enabled, and implement cache warming by pre-populating the cache after each deployment using a Lambda function triggered by CodeDeploy",
      "Upgrade to ElastiCache Redis Cluster Mode with multiple shards across AZs, implement blue/green deployments so the cache is never flushed during deployment, and use Redis persistence (AOF) to recover data after node failures",
      "Switch to ElastiCache Memcached with multiple nodes for redundancy, implement application-level cache warming, and use consistent hashing to minimize cache misses during node changes",
      "Use DynamoDB Accelerator (DAX) instead of Redis for caching, which provides automatic replication and doesn't require manual cache warming"
    ],
    correctAnswers: [0],
    explanation: "Multi-AZ Redis with automatic failover means a replica in another AZ is promoted within seconds of a primary failure, eliminating the 10-minute outage. Cache warming via Lambda after deployment pre-populates frequently accessed keys before traffic hits the new version, preventing the cache hit rate drop. Option B's Cluster Mode adds complexity without addressing the deployment cache flush issue directly. Option C switches to Memcached which doesn't support replication or persistence — worse for the failover problem. Option D (DAX) is only for DynamoDB and doesn't solve the session storage use case.",
    questionType: "single"
  },
  {
    topic: "Containers",
    question: "A company runs a microservices application on Amazon EKS. One service processes financial transactions and must never run more than one instance simultaneously to prevent duplicate transaction processing. Another service handles user notifications and must scale from 0 to 100 instances within 2 minutes during peak hours. A third service performs batch analytics and should only run when triggered by S3 events. Which combination of Kubernetes configurations correctly addresses all three requirements?",
    options: [
      "Transaction service: Deployment with maxReplicas=1 in HPA; Notification service: HPA with custom metrics from SQS queue depth; Analytics service: CronJob triggered every minute to check S3",
      "Transaction service: Deployment with replicas=1 and no HPA; Notification service: KEDA ScaledObject with SQS trigger and target queue length; Analytics service: Kubernetes Job triggered by S3 event via EventBridge and Lambda",
      "Transaction service: StatefulSet with replicas=1; Notification service: Deployment with HPA based on CPU; Analytics service: DaemonSet that polls S3 every 5 minutes",
      "Transaction service: Deployment with PodDisruptionBudget minAvailable=1; Notification service: Cluster Autoscaler with node groups; Analytics service: Lambda function instead of EKS"
    ],
    correctAnswers: [1],
    explanation: "Transaction service: A Deployment with replicas=1 and no HPA ensures exactly one instance. KEDA (Kubernetes Event-Driven Autoscaling) ScaledObject with SQS trigger scales the notification service based on queue depth, enabling 0-to-100 scaling within 2 minutes when messages arrive. EventBridge S3 event → Lambda → Kubernetes Job creates a Job on-demand for analytics. Option A's HPA with maxReplicas=1 still allows brief periods with 2 pods during rolling updates. Option C's CPU-based HPA for notifications won't scale fast enough from 0. Option D's PodDisruptionBudget doesn't prevent multiple replicas.",
    questionType: "single"
  },
  {
    topic: "Data Analytics",
    question: "A retail company needs to analyze 5 years of transaction data (10TB) to identify purchasing patterns. The analysis runs ad-hoc queries that take 2-4 hours and are executed by 5 data analysts. The data is currently in CSV files in S3. The company wants to minimize costs and avoid managing infrastructure. New data arrives daily as CSV files. Which architecture is MOST cost-effective for this use case?",
    options: [
      "Load all data into Amazon Redshift, use Redshift Spectrum for S3 data, and schedule daily COPY commands for new data",
      "Use Amazon Athena to query CSV files directly in S3, create an AWS Glue Data Catalog table, use AWS Glue ETL to convert new daily CSV files to Parquet format partitioned by date, and query the Parquet data with Athena",
      "Deploy an EMR cluster with Spark, mount S3 as HDFS using EMRFS, run Spark SQL queries, and use EMR Auto Scaling to shut down the cluster when not in use",
      "Use Amazon QuickSight with SPICE to import all 10TB of data, which provides fast ad-hoc querying without infrastructure management"
    ],
    correctAnswers: [1],
    explanation: "Athena is serverless and charges per query based on data scanned. Converting CSV to Parquet with Glue ETL reduces data scanned by 60-85% (columnar compression) and partitioning by date further reduces scans for time-range queries. No infrastructure to manage. For 5 analysts running occasional 2-4 hour queries, this is far cheaper than a continuously-running Redshift cluster. Option A (Redshift) requires a running cluster with fixed costs. Option C (EMR) has cluster startup time and management overhead. Option D (QuickSight SPICE) has a 25GB SPICE capacity limit per dataset — 10TB doesn't fit.",
    questionType: "single"
  },
  {
    topic: "Security",
    question: "A company's security team discovers that an IAM user's access keys were accidentally committed to a public GitHub repository 3 hours ago. The access keys have AdministratorAccess. CloudTrail shows 47 API calls were made using these keys in the last 3 hours, including CreateUser, AttachUserPolicy, and CreateAccessKey calls. What is the CORRECT order of immediate response actions?",
    options: [
      "1) Delete the IAM user, 2) Review CloudTrail logs, 3) Remove the keys from GitHub, 4) Notify the security team",
      "1) Immediately deactivate (not delete) the compromised access keys, 2) Review all CloudTrail events from the keys to identify all resources created/modified, 3) Revoke or delete any IAM users/roles/keys created by the attacker, 4) Remove keys from GitHub, 5) Rotate all potentially affected credentials",
      "1) Remove the keys from GitHub, 2) Change the IAM user's password, 3) Enable MFA on the IAM user, 4) Review CloudTrail logs next week",
      "1) Enable AWS GuardDuty, 2) Create a CloudTrail trail, 3) Deactivate the access keys, 4) Contact AWS Support"
    ],
    correctAnswers: [1],
    explanation: "The correct incident response order: First, deactivate (not delete) the keys to stop ongoing access while preserving audit evidence. Deleting immediately removes the ability to track what the keys did. Second, review CloudTrail to understand the full blast radius — the attacker created new IAM users and access keys, which remain active even after the original keys are deactivated. Third, revoke attacker-created resources (new users, roles, keys). Fourth, remove from GitHub (the keys are already compromised, but this prevents further exposure). Fifth, rotate all credentials that may have been accessed. Option A deletes the user first, losing audit capability. Option C starts with GitHub removal, leaving the keys active. Option D's first action (GuardDuty) doesn't stop the immediate threat.",
    questionType: "single"
  },
  {
    topic: "VPC",
    question: "A company has a VPC with CIDR 10.0.0.0/16. They need to add a new subnet for a database tier that must: (1) never have direct internet access, (2) allow outbound HTTPS to AWS service endpoints without traversing the internet, (3) allow inbound connections only from the application tier subnet (10.0.1.0/24), and (4) block all traffic from the on-premises network connected via Direct Connect. The database subnet will use CIDR 10.0.2.0/24. Which combination of configurations achieves ALL requirements?",
    options: [
      "Create the subnet with no route to an Internet Gateway, add a VPC Gateway Endpoint for S3 and Interface Endpoints for other services, configure a Security Group allowing inbound on database port from 10.0.1.0/24 only, and configure a Network ACL denying inbound traffic from the on-premises CIDR",
      "Create the subnet in a private route table with a NAT Gateway route for outbound traffic, configure Security Groups to allow only application tier traffic, and use VPC Flow Logs to monitor and block on-premises traffic",
      "Create the subnet with a route to a NAT Gateway for outbound internet access, configure Security Groups allowing only application tier inbound, and use AWS Network Firewall to block on-premises traffic",
      "Create the subnet with no internet route, use AWS PrivateLink for all AWS service access, configure Security Groups allowing application tier inbound, and use a Transit Gateway route table to block on-premises traffic to the database subnet"
    ],
    correctAnswers: [0],
    explanation: "VPC Endpoints (Gateway for S3/DynamoDB, Interface for other services) provide private connectivity to AWS services without internet routing — satisfying requirement 2. A Security Group with inbound rules only from 10.0.1.0/24 satisfies requirement 3. Network ACLs are stateless and can explicitly deny traffic from the on-premises CIDR range — satisfying requirement 4 (Security Groups cannot deny, only allow). No route to IGW or NAT Gateway satisfies requirement 1. Option B uses NAT Gateway which routes through the internet. Option C also uses NAT Gateway. Option D's Transit Gateway route table approach is more complex and Network ACLs are the standard tool for subnet-level blocking.",
    questionType: "single"
  },
  {
    topic: "Auto Scaling",
    question: "An e-commerce platform uses EC2 Auto Scaling with a target tracking policy based on average CPU utilization (target: 50%). During Black Friday, traffic increases 20x over 10 minutes. The Auto Scaling group has a minimum of 10 instances and maximum of 200. Despite the policy, users experience severe degradation for 25 minutes before the application stabilizes. Analysis shows the EC2 instances take 8 minutes to pass health checks and become ready to serve traffic. What changes would MOST effectively reduce the degradation period for future events?",
    options: [
      "Reduce the target CPU utilization from 50% to 30% so scaling triggers earlier, and increase the maximum instances to 500",
      "Implement scheduled scaling to pre-scale to 100 instances before Black Friday starts, use a predictive scaling policy to anticipate the traffic pattern, and use EC2 Image Builder to create a pre-warmed AMI that reduces instance startup time",
      "Switch from target tracking to step scaling with more aggressive step adjustments, and use Elastic Load Balancing slow start mode to gradually send traffic to new instances",
      "Enable EC2 Auto Scaling warm pools to maintain pre-initialized instances in a stopped state, configure lifecycle hooks to complete application initialization before instances enter service, and combine with scheduled scaling for the known peak"
    ],
    correctAnswers: [3],
    explanation: "Warm pools maintain pre-initialized instances in a stopped/hibernated state. When scaling out, these instances start much faster than launching new instances (seconds vs. 8+ minutes) because the OS and application are already initialized. Lifecycle hooks ensure instances complete any final initialization before receiving traffic. Scheduled scaling for the known Black Friday peak pre-scales capacity before traffic arrives. This combination addresses both the slow launch time and the reactive nature of the current policy. Option B's predictive scaling helps but doesn't solve the 8-minute startup time. Option C's step scaling is still reactive. Option A's lower CPU target triggers scaling earlier but doesn't fix the 8-minute startup delay.",
    questionType: "single"
  },
  {
    topic: "Messaging",
    question: "A company processes insurance claims using an SQS queue. Each claim message triggers a Lambda function that calls three downstream APIs (fraud detection, policy lookup, payment processing). The fraud detection API occasionally takes 45-90 seconds to respond. Lambda has a 30-second timeout. Failed messages go to a Dead Letter Queue (DLQ). The team notices that 30% of messages end up in the DLQ daily, but when they manually reprocess DLQ messages, 95% succeed. What is the ROOT CAUSE and the CORRECT fix?",
    options: [
      "Root cause: Lambda timeout (30s) is shorter than the fraud detection API response time (45-90s). Fix: Increase Lambda timeout to 120 seconds and increase the SQS visibility timeout to 130 seconds",
      "Root cause: SQS visibility timeout is shorter than Lambda execution time, causing messages to become visible again and be processed twice. Fix: Set SQS visibility timeout to 6x the Lambda timeout",
      "Root cause: The fraud detection API is unreliable. Fix: Implement exponential backoff retry logic in Lambda and use SQS delay queues to space out retries",
      "Root cause: Lambda cold starts add latency that pushes execution over the timeout. Fix: Enable Lambda Provisioned Concurrency to eliminate cold starts"
    ],
    correctAnswers: [0],
    explanation: "The fraud detection API takes 45-90 seconds but Lambda's timeout is 30 seconds — Lambda is killed before the API responds. This causes the Lambda to fail, the message becomes visible again in SQS after the visibility timeout, and eventually lands in the DLQ after maxReceiveCount retries. When manually reprocessed, the API happens to respond in <30 seconds (within its normal range), explaining the 95% success rate on retry. The fix is to increase Lambda timeout to 120 seconds (above the 90-second maximum API response time) and set SQS visibility timeout to at least 6x the Lambda timeout (720 seconds) to prevent duplicate processing. Option B describes a different problem (visibility timeout < execution time). Option C (retry logic) doesn't fix the timeout issue. Option D (cold starts) adds seconds, not minutes.",
    questionType: "single"
  },
  {
    topic: "CloudFormation",
    question: "A DevOps team manages 15 microservices using CloudFormation. Each service has its own stack. A new compliance requirement mandates that all EC2 instances across all stacks must have a specific tag (CostCenter: Engineering) and all S3 buckets must have server-side encryption enabled. The team wants to enforce these requirements for all future stack deployments without modifying each of the 15 existing templates. Which solution enforces these requirements with the LEAST ongoing maintenance?",
    options: [
      "Create a CloudFormation StackSet that deploys an AWS Config rule checking for the required tag and encryption, and configure the rule to auto-remediate non-compliant resources",
      "Use AWS Service Control Policies (SCPs) to deny EC2 RunInstances without the CostCenter tag and deny S3 PutBucketEncryption without SSE enabled",
      "Enable CloudFormation hooks (using AWS CloudFormation Guard or a Lambda-backed hook) to validate that EC2 instances have the required tag and S3 buckets have encryption before any stack CREATE or UPDATE operation proceeds",
      "Create a CloudFormation macro that automatically adds the required tag to all EC2 resources and encryption to all S3 resources, and require all teams to use the macro in their templates"
    ],
    correctAnswers: [2],
    explanation: "CloudFormation hooks intercept stack operations (CREATE, UPDATE, DELETE) and can validate or modify resources before they are provisioned. A hook using CloudFormation Guard (a policy-as-code tool) can check that EC2 instances have the required tag and S3 buckets have encryption configured, failing the deployment if not. This enforces compliance at the infrastructure-as-code layer without modifying templates. Option A (Config rules) detects non-compliance after deployment, not before. Option B (SCPs) works at the API level but doesn't integrate with CloudFormation's deployment workflow and may block legitimate operations. Option D (macros) requires teams to modify their templates.",
    questionType: "single"
  },
  {
    topic: "Hybrid Cloud",
    question: "A company has a 10 Gbps AWS Direct Connect connection to us-east-1. They need to access resources in us-west-2 from their on-premises data center. Currently, traffic from on-premises to us-west-2 goes: on-premises → Direct Connect → us-east-1 → VPC peering → us-west-2, adding 80ms of latency. The company wants to reduce latency to us-west-2 resources to under 30ms and ensure traffic never traverses the public internet. Which solution achieves this?",
    options: [
      "Add a second Direct Connect connection directly to us-west-2 and use BGP to route us-west-2 traffic over the new connection",
      "Use AWS Transit Gateway with Direct Connect Gateway, enabling the Direct Connect Gateway to connect to Transit Gateways in both us-east-1 and us-west-2, routing on-premises traffic directly to the nearest region",
      "Use AWS Global Accelerator to route traffic from the Direct Connect connection to us-west-2 resources via the AWS global network",
      "Configure VPC peering between us-east-1 and us-west-2, and use BGP route preferences to prefer the direct path"
    ],
    correctAnswers: [0],
    explanation: "A Direct Connect connection directly to us-west-2 eliminates the us-east-1 hop entirely. BGP routing on the on-premises router can prefer the us-west-2 Direct Connect for us-west-2 traffic. This provides the lowest possible latency (direct physical connection) and never traverses the internet. Option B (Direct Connect Gateway + Transit Gateway) is a valid architecture but Direct Connect Gateway has a limitation: it cannot route traffic between AWS regions — it connects on-premises to multiple VPCs but the inter-region path still goes through AWS backbone. A separate Direct Connect to us-west-2 is the correct answer for sub-30ms latency. Option C (Global Accelerator) uses the AWS network but requires internet entry points. Option D doesn't change the physical path.",
    questionType: "single"
  },
  {
    topic: "Lambda",
    question: "A company uses Lambda functions to process data from Kinesis Data Streams. Each Lambda function reads from a Kinesis shard and processes records in batches. The team notices that when one record in a batch causes a processing error, the entire batch is retried indefinitely, blocking all subsequent records in that shard for hours. The records causing errors are malformed JSON that will never be processable. What configuration changes resolve this WITHOUT losing valid records?",
    options: [
      "Set the Lambda event source mapping BisectBatchOnFunctionError to true, configure a destination for failed records to an SQS DLQ, and set MaximumRetryAttempts to 3",
      "Increase the batch size to 1 so each record is processed individually, and configure a DLQ on the Lambda function",
      "Add try/catch in the Lambda function to skip malformed records and log them to CloudWatch, returning success for the entire batch",
      "Configure the Kinesis stream's retention period to 7 days so records can be reprocessed after fixing the Lambda function"
    ],
    correctAnswers: [0],
    explanation: "BisectBatchOnFunctionError splits a failing batch in half recursively until it isolates the problematic record(s). Once isolated to a batch of 1, the failed record is sent to the configured destination (SQS DLQ) and processing continues with subsequent records. MaximumRetryAttempts limits how many times a batch is retried before being sent to the DLQ. This preserves all valid records while handling poison pills. Option B (batch size 1) eliminates batching benefits and increases Lambda invocations dramatically. Option C (skip in code) loses the malformed records without any record of them. Option D doesn't fix the blocking issue.",
    questionType: "single"
  },
  {
    topic: "IAM",
    question: "A company uses AWS Organizations with 50 accounts. The security team wants to ensure that no account can disable CloudTrail logging, even if an account administrator tries to do so. They also want to allow account administrators to create new CloudTrail trails for their specific needs. Which approach correctly implements this requirement?",
    options: [
      "Create an SCP attached to the root OU that denies cloudtrail:DeleteTrail, cloudtrail:StopLogging, and cloudtrail:UpdateTrail for the organization's CloudTrail trail ARN specifically, while allowing cloudtrail:CreateTrail",
      "Enable AWS Config with a managed rule 'cloud-trail-enabled' and configure auto-remediation to re-enable CloudTrail if it's disabled",
      "Create an SCP that denies all CloudTrail actions, then create permission boundaries on each account's admin role that allow only cloudtrail:CreateTrail",
      "Use CloudTrail organization trails, which automatically protect the trail from deletion by member accounts regardless of their IAM permissions"
    ],
    correctAnswers: [0],
    explanation: "SCPs are evaluated before IAM policies — even account administrators cannot perform actions denied by an SCP. By denying cloudtrail:DeleteTrail, cloudtrail:StopLogging, and cloudtrail:UpdateTrail scoped to the organization's CloudTrail trail ARN (not all trails), account admins are prevented from disabling the organization trail while retaining the ability to create their own trails. Option B (Config auto-remediation) detects and fixes after the fact — there's a window where CloudTrail is disabled. Option C denies all CloudTrail actions, preventing account admins from creating trails. Option D is partially correct but doesn't prevent StopLogging on organization trails.",
    questionType: "single"
  },
  {
    topic: "ECS",
    question: "A company runs a containerized application on ECS Fargate. The application containers need to read secrets (database passwords, API keys) at startup. Currently, secrets are passed as environment variables in the task definition, which means they appear in plain text in the ECS console and CloudTrail logs. The security team requires that secrets never appear in plain text in any AWS console, log, or API response. Which solution meets this requirement?",
    options: [
      "Store secrets in AWS Systems Manager Parameter Store as SecureString parameters, reference them in the ECS task definition using the 'secrets' field (not 'environment'), which causes ECS to inject them as environment variables at runtime without storing them in the task definition",
      "Encrypt the environment variable values using KMS before adding them to the task definition, and have the application decrypt them at startup",
      "Store secrets in S3 with SSE-KMS encryption, give the task execution role S3 read access, and have the application download and parse the secrets file at startup",
      "Use AWS Secrets Manager, store secrets there, and have the application code call the Secrets Manager API at startup to retrieve secrets, never storing them as environment variables"
    ],
    correctAnswers: [0],
    explanation: "ECS supports native Secrets Manager and SSM Parameter Store integration via the 'secrets' field in task definitions. ECS injects the secret values as environment variables at container startup — the values are never stored in the task definition, never appear in the ECS console, and are not logged in CloudTrail (only the secret ARN/name is referenced). The task execution role needs permission to access the secret. Option B (encrypt in task definition) still stores encrypted values in the task definition visible in the console. Option C (S3) requires the application to handle secret retrieval and the secret file could be logged. Option D is valid but requires application code changes; Option A requires no code changes.",
    questionType: "single"
  },
  {
    topic: "S3",
    question: "A company hosts a static website on S3 with CloudFront. The website includes a React SPA where all routes are handled client-side (e.g., /products/123 is handled by React Router, not a real file). Users report that directly accessing a URL like https://example.com/products/123 returns a 403 error, but navigating to it from the homepage works fine. The S3 bucket has public access blocked and uses an OAC (Origin Access Control). What is the correct fix?",
    options: [
      "Enable S3 static website hosting on the bucket and update the CloudFront origin to use the S3 website endpoint instead of the REST API endpoint",
      "Create a CloudFront Function or Lambda@Edge that rewrites all request URIs to /index.html before forwarding to S3, so React Router handles the routing",
      "Add a CloudFront custom error response that maps 403 errors to /index.html with HTTP status code 200",
      "Create S3 object redirects for every possible route to point to index.html"
    ],
    correctAnswers: [2],
    explanation: "When CloudFront requests /products/123 from S3, the object doesn't exist, so S3 returns 403 (with OAC, non-existent objects return 403, not 404). A CloudFront custom error response maps the 403 to serve /index.html with a 200 status code, allowing React Router to handle the route client-side. This is the standard fix for SPAs on CloudFront+S3 with OAC. Option A (S3 website hosting) would require public access, defeating the OAC security model. Option B (rewrite all URIs) would break direct file access (CSS, JS, images). Option D is impractical for dynamic routes.",
    questionType: "single"
  },
  {
    topic: "RDS",
    question: "A company's Aurora PostgreSQL cluster is experiencing performance issues. The DBA identifies that a specific query runs in 200ms on the writer instance but takes 8 seconds on read replicas. The query uses a temporary table and multiple CTEs. The application is read-heavy (90% reads) and routes read traffic to the reader endpoint. What is the MOST LIKELY cause and the correct solution?",
    options: [
      "The read replicas have less CPU/memory than the writer. Solution: Upgrade read replica instance types to match the writer",
      "The query uses temporary tables which are not replicated to read replicas, causing them to rebuild temporary data. Solution: Rewrite the query to avoid temporary tables, or use materialized CTEs",
      "Aurora's replication lag is causing read replicas to serve stale data, making the query plan suboptimal. Solution: Reduce Aurora replica lag by upgrading to Aurora I/O-Optimized",
      "The reader endpoint performs round-robin load balancing, and some replicas are overloaded. Solution: Create custom endpoints for different query types"
    ],
    correctAnswers: [1],
    explanation: "Temporary tables in PostgreSQL are session-local and not replicated. When a query uses temporary tables on a read replica, the replica must create and populate them from scratch using its local resources, which can be significantly slower than on the writer (which may have the temp table cached in memory). CTEs in PostgreSQL can be optimization fences. Rewriting to avoid temporary tables or using WITH MATERIALIZED hints resolves the performance difference. Option A (instance type) is possible but the 40x difference is too large to be explained by instance size alone. Option C (replication lag) affects data freshness, not query plan performance. Option D (custom endpoints) distributes load but doesn't fix the underlying query issue.",
    questionType: "single"
  },
  {
    topic: "CloudWatch",
    question: "A company's application generates 50GB of CloudWatch Logs per day across 200 log groups. The log retention is set to 'Never expire' on all log groups. The CloudWatch Logs bill has grown to $8,000/month. Analysis shows that 80% of logs are DEBUG-level messages that are only needed for 3 days during active development, 15% are INFO logs needed for 30 days, and 5% are ERROR logs needed for 1 year. Which combination of changes reduces the bill by the MOST while preserving the required retention?",
    options: [
      "Set all log groups to 30-day retention, which reduces storage costs significantly",
      "Configure the application to filter out DEBUG logs in production, set log group retention to 3 days for development log groups and 30 days for production INFO logs, export ERROR logs to S3 with a lifecycle policy transitioning to Glacier after 30 days",
      "Use CloudWatch Logs subscription filters to stream all logs to Kinesis Data Firehose, which delivers to S3 at lower cost, and delete the CloudWatch log groups",
      "Enable CloudWatch Logs Insights to query logs on-demand instead of storing them long-term"
    ],
    correctAnswers: [1],
    explanation: "The largest cost driver is 80% DEBUG logs stored indefinitely. Filtering DEBUG logs in production eliminates 80% of log volume immediately. Setting appropriate retention policies (3 days for dev DEBUG, 30 days for INFO) prevents indefinite storage. Exporting ERROR logs to S3 (much cheaper than CloudWatch Logs storage at $0.03/GB vs $0.50/GB) with Glacier transition after 30 days provides long-term retention at minimal cost. Option A (30-day retention) helps but doesn't address the DEBUG log volume. Option C (Kinesis to S3) is a valid architecture but requires significant setup and the question asks for the most reduction. Option D (Logs Insights) is a query service, not a storage reduction strategy.",
    questionType: "single"
  },
  {
    topic: "API Gateway",
    question: "A company exposes a REST API via API Gateway that is consumed by mobile apps. The API has 50 endpoints. The security team requires: (1) all requests must be authenticated, (2) mobile apps should use short-lived tokens, (3) the API must rate-limit to 100 requests/second per user, (4) certain admin endpoints must only be accessible to users with an 'admin' role. Which combination of API Gateway features implements ALL requirements with the LEAST custom code?",
    options: [
      "Use API Gateway Lambda authorizers for all endpoints, implement JWT validation in Lambda, check user roles in Lambda for admin endpoints, and configure usage plans with API keys for rate limiting",
      "Use Amazon Cognito User Pools as the API Gateway authorizer, configure Cognito to issue short-lived JWTs (access tokens), use API Gateway usage plans tied to Cognito identity for per-user rate limiting, and use Cognito groups with IAM roles for admin endpoint authorization via resource policies",
      "Use IAM authorization for all endpoints, require mobile apps to use Cognito Identity Pools to get temporary AWS credentials, and use IAM policies to restrict admin endpoints",
      "Use API Gateway resource policies to whitelist mobile app IP ranges, implement JWT validation in each Lambda backend function, and use DynamoDB to track per-user request counts for rate limiting"
    ],
    correctAnswers: [1],
    explanation: "Cognito User Pools natively integrate with API Gateway as an authorizer. Cognito issues short-lived JWTs (access tokens, typically 1 hour). API Gateway usage plans with per-key throttling can be tied to Cognito identity for per-user rate limiting. Cognito groups can be used to assign admin roles, and API Gateway can check the Cognito:groups claim in the JWT to authorize admin endpoints — no custom Lambda code needed. Option A (Lambda authorizers) requires writing JWT validation code. Option C (IAM auth) requires mobile apps to manage AWS credentials, which is complex. Option D (IP whitelisting) doesn't work for mobile apps with dynamic IPs.",
    questionType: "single"
  },
  {
    topic: "DynamoDB",
    question: "A company's DynamoDB table stores IoT sensor readings. The table has a partition key of deviceId and sort key of timestamp. The table receives 10,000 writes/second from 500 devices (20 writes/second per device) and 50,000 reads/second. The team observes ProvisionedThroughputExceededException errors on writes even though the total provisioned WCU is sufficient. What is the ROOT CAUSE and the correct solution?",
    options: [
      "The table needs more WCUs. Solution: Double the provisioned write capacity",
      "Hot partition problem: 500 devices writing to 500 partition keys means each partition receives 20 WCU/second, but DynamoDB distributes partitions across nodes and some nodes may be overloaded. Solution: Add a random suffix (1-10) to the deviceId partition key to distribute writes across 5,000 logical partitions",
      "The sort key (timestamp) is causing sequential writes that overwhelm a single partition. Solution: Change the sort key to a UUID to randomize write distribution",
      "DynamoDB adaptive capacity hasn't activated yet. Solution: Wait 5-10 minutes for adaptive capacity to redistribute throughput to hot partitions"
    ],
    correctAnswers: [1],
    explanation: "With 500 devices as partition keys, DynamoDB may co-locate multiple partitions on the same physical node. If several high-traffic devices land on the same node, that node's throughput limit is exceeded even if total provisioned capacity is sufficient. Adding a random suffix (write sharding) distributes each device's writes across multiple logical partitions, spreading the load across more physical nodes. The application aggregates reads across all shards for a device. Option A (more WCUs) doesn't fix the hot partition distribution problem. Option C (UUID sort key) doesn't change partition key distribution. Option D (adaptive capacity) helps with uneven access patterns but has limits and doesn't solve structural hot partitions.",
    questionType: "single"
  },
  {
    topic: "Kinesis",
    question: "A company streams clickstream data from a website to Kinesis Data Streams. The stream has 10 shards. A Lambda function processes records and writes aggregated metrics to DynamoDB. The team notices that during peak traffic (500,000 events/minute), Lambda functions are being throttled and records are aging in the stream. The Lambda concurrency limit is 500. Each Lambda invocation processes one shard's batch. What changes would MOST effectively resolve the throttling while minimizing cost?",
    options: [
      "Increase the number of Kinesis shards to 50, which proportionally increases Lambda invocations and distributes the processing load",
      "Enable Kinesis Enhanced Fan-Out for the Lambda consumer, which provides dedicated 2MB/s throughput per shard and reduces Lambda polling overhead",
      "Increase the Lambda batch size to process more records per invocation, increase the parallelization factor to allow multiple Lambda invocations per shard, and request a Lambda concurrency limit increase",
      "Switch from Kinesis Data Streams to Kinesis Data Firehose, which automatically scales and delivers to S3 without Lambda"
    ],
    correctAnswers: [2],
    explanation: "Increasing batch size means each Lambda invocation processes more records, reducing total invocations needed. The parallelization factor (1-10) allows multiple concurrent Lambda invocations per shard, increasing throughput without adding shards. Requesting a concurrency limit increase addresses the throttling directly. Together these changes maximize throughput within the existing shard count. Option A (more shards) increases cost proportionally and doesn't address the Lambda concurrency limit. Option B (Enhanced Fan-Out) reduces polling latency but doesn't address Lambda throttling. Option D (Firehose) changes the architecture significantly and doesn't support real-time Lambda processing for DynamoDB writes.",
    questionType: "single"
  },
  {
    topic: "CloudFront",
    question: "A company's CloudFront distribution serves a React application from S3 and an API from ALB. The security team requires: (1) all HTTP requests redirected to HTTPS, (2) the API origin must receive the original client IP address, (3) the application must set HSTS headers, (4) the API must not be directly accessible without going through CloudFront. Which combination of configurations achieves ALL requirements?",
    options: [
      "(1) Redirect HTTP to HTTPS in CloudFront viewer protocol policy, (2) Enable 'X-Forwarded-For' header forwarding to the ALB origin, (3) Add HSTS header via CloudFront Response Headers Policy, (4) Configure ALB security group to only allow inbound from CloudFront managed prefix list",
      "(1) Configure ALB listener to redirect HTTP to HTTPS, (2) Use CloudFront's 'True-IP' header, (3) Add HSTS in the React application's index.html meta tags, (4) Use AWS WAF on CloudFront to block direct ALB access",
      "(1) Use AWS Certificate Manager with HTTP-to-HTTPS redirect, (2) Enable CloudFront real-time logs, (3) Configure HSTS in S3 bucket policy, (4) Use VPC security groups to block non-CloudFront traffic",
      "(1) Set CloudFront viewer protocol policy to HTTPS only, (2) Enable X-Forwarded-For, (3) Use Lambda@Edge to add HSTS headers, (4) Deploy ALB in a private subnet with no internet-facing access"
    ],
    correctAnswers: [0],
    explanation: "CloudFront viewer protocol policy 'Redirect HTTP to HTTPS' handles requirement 1. CloudFront automatically adds X-Forwarded-For with the client IP when forwarding to origins — requirement 2. CloudFront Response Headers Policy can add security headers including HSTS with configurable max-age — requirement 3. The CloudFront managed prefix list contains all CloudFront edge IP ranges; restricting ALB security group inbound to this prefix list ensures only CloudFront can reach the ALB — requirement 4. Option B's ALB redirect doesn't work because CloudFront already handles the connection. Option C's S3 bucket policy can't set response headers. Option D's private subnet ALB can't be reached by CloudFront (which is internet-based).",
    questionType: "single"
  },
  {
    topic: "Organizations",
    question: "A company uses AWS Organizations with 3 OUs: Production, Development, and Sandbox. The security team wants to: (1) prevent all accounts from disabling AWS Config, (2) allow Development accounts to use any EC2 instance type, (3) restrict Production accounts to only use approved instance types (t3, m5, c5 families), (4) allow Sandbox accounts to create IAM users but prevent Production and Development from doing so. Which SCP structure correctly implements these requirements?",
    options: [
      "Attach a Deny SCP for config:StopConfigurationRecorder to the root OU; attach a Deny SCP for non-approved EC2 instance types to the Production OU; attach an Allow SCP for iam:CreateUser to the Sandbox OU and a Deny SCP to Production and Development OUs",
      "Attach a Deny SCP for config:StopConfigurationRecorder to the root OU; attach a Deny SCP for EC2 instance types not in the approved list to the Production OU only (Development and Sandbox inherit no instance type restriction); attach a Deny SCP for iam:CreateUser to the Production and Development OUs",
      "Create a single SCP with all rules and attach it to the root OU, using conditions to differentiate behavior by OU",
      "Use AWS Config rules instead of SCPs for instance type restrictions, and use IAM permission boundaries for the IAM user creation restriction"
    ],
    correctAnswers: [1],
    explanation: "SCPs use a deny-by-default model at the OU level. Attaching the Config deny SCP to the root OU applies it to all accounts. Attaching the EC2 instance type restriction only to Production OU leaves Development and Sandbox unrestricted. Attaching the iam:CreateUser deny to Production and Development OUs prevents those accounts from creating IAM users, while Sandbox (no deny SCP) can create them. Option A incorrectly tries to use Allow SCPs — SCPs don't grant permissions, they only restrict. Option C can't use conditions to differentiate by OU in a single SCP. Option D (Config rules) detects violations after the fact; SCPs prevent them.",
    questionType: "single"
  },
  {
    topic: "Networking",
    question: "A company runs a web application with the following architecture: Route 53 → CloudFront → ALB → EC2 instances in private subnets. A penetration test reveals that the EC2 instances are directly accessible from the internet via their public IPs, bypassing CloudFront and the WAF rules configured there. The instances need public IPs for outbound internet access (software updates). How should this vulnerability be FIXED while maintaining outbound internet access?",
    options: [
      "Remove public IPs from EC2 instances, add a NAT Gateway in a public subnet for outbound traffic, and update security groups to only allow inbound from the ALB security group",
      "Add a WAF rule to CloudFront that blocks requests not containing a secret header, and configure the ALB to add the secret header when forwarding to EC2",
      "Move EC2 instances to public subnets but configure security groups to only allow inbound traffic from the ALB and CloudFront IP ranges",
      "Enable VPC Flow Logs to detect direct access attempts and use AWS Lambda to automatically update security groups to block attacking IPs"
    ],
    correctAnswers: [0],
    explanation: "The root cause is EC2 instances having public IPs in a configuration that allows direct internet access. The correct fix: remove public IPs (making instances private), use a NAT Gateway for outbound traffic (software updates), and restrict security groups to only allow inbound from the ALB security group. This makes direct internet access to EC2 instances architecturally impossible. Option B (secret header) is a defense-in-depth measure but doesn't remove the direct access path — an attacker who discovers the header can still bypass CloudFront. Option C keeps public IPs and relies on security groups, which can be misconfigured. Option D is reactive, not preventive.",
    questionType: "single"
  },
  {
    topic: "Serverless",
    question: "A company has a Step Functions workflow that orchestrates a 10-step data processing pipeline. Step 7 calls an external payment API that occasionally returns HTTP 429 (rate limit) errors. The current workflow fails entirely when Step 7 fails, requiring manual restart from Step 1. The company wants Step 7 to automatically retry with exponential backoff, and if it still fails after 5 retries, the workflow should skip to a 'manual review' state rather than failing entirely. Which Step Functions configuration achieves this?",
    options: [
      "Add a Retry configuration to Step 7's state with maxAttempts=5 and backoffRate=2, and add a Catch configuration that transitions to the 'ManualReview' state on States.TaskFailed",
      "Wrap Step 7 in a Lambda function that implements retry logic internally and returns a success response even on payment API failures",
      "Use Step Functions Express Workflows instead of Standard Workflows, which have built-in retry and error handling",
      "Add an SQS queue before Step 7, have the payment API call be asynchronous, and use a callback pattern with a task token"
    ],
    correctAnswers: [0],
    explanation: "Step Functions natively supports Retry and Catch on task states. The Retry configuration with maxAttempts=5, backoffRate=2, and ErrorEquals=['States.TaskFailed'] will retry Step 7 up to 5 times with exponential backoff. The Catch configuration catches any remaining failure after all retries and transitions to the 'ManualReview' state. This is the idiomatic Step Functions approach requiring no code changes. Option B (Lambda retry) hides failures from Step Functions and makes the workflow harder to monitor. Option C (Express Workflows) doesn't change error handling capabilities. Option D (SQS callback) adds complexity without addressing the retry/fallback requirement.",
    questionType: "single"
  },
  {
    topic: "EC2",
    question: "A company runs a stateful application on EC2 that stores session data in memory. The application is deployed in an Auto Scaling group behind an ALB. During scale-in events, users whose sessions are on the terminating instance lose their sessions. The application cannot be modified to use an external session store. The company wants to ensure users don't lose sessions during scale-in while minimizing cost. Which solution is MOST appropriate?",
    options: [
      "Enable ALB sticky sessions (session affinity) using duration-based cookies, configure Auto Scaling lifecycle hooks to delay termination for 30 minutes to allow sessions to expire naturally, and set the minimum healthy percentage to 100% during scale-in",
      "Enable ALB sticky sessions, configure the Auto Scaling termination policy to use 'OldestLaunchTemplate' to avoid terminating recently-launched instances, and set scale-in protection on instances with active sessions",
      "Use EC2 Hibernate instead of termination during scale-in, which preserves in-memory state and allows instances to resume",
      "Deploy a Redis ElastiCache cluster for session storage and modify the ALB to route requests based on session IDs"
    ],
    correctAnswers: [0],
    explanation: "ALB sticky sessions ensure users are always routed to the same instance, preventing session loss during normal operation. Lifecycle hooks delay instance termination, giving existing sessions time to expire (users naturally end their sessions). Setting minimum healthy percentage to 100% ensures no instance is terminated until a replacement is healthy. This combination handles scale-in gracefully without modifying the application. Option B's scale-in protection requires automation to detect and remove protection, adding complexity. Option C (Hibernate) is not supported for Auto Scaling scale-in. Option D requires application modification, which the question explicitly prohibits.",
    questionType: "single"
  },
  {
    topic: "Security",
    question: "A company's application on EC2 needs to access an S3 bucket in a different AWS account (Account B). The EC2 instance is in Account A and has an IAM role (RoleA). The S3 bucket in Account B has a bucket policy. Which combination of permissions is REQUIRED for the EC2 instance to successfully access the bucket?",
    options: [
      "Only the S3 bucket policy in Account B needs to grant access to RoleA — no changes needed in Account A",
      "RoleA in Account A must have an IAM policy allowing s3:GetObject on the bucket ARN, AND the S3 bucket policy in Account B must allow s3:GetObject from RoleA's ARN — both are required for cross-account access",
      "Create a new IAM role in Account B, grant it S3 access, and configure RoleA to assume the Account B role using sts:AssumeRole",
      "Use S3 Access Points with a VPC restriction to allow cross-account access without modifying IAM policies"
    ],
    correctAnswers: [1],
    explanation: "For cross-account S3 access, BOTH sides must grant permission: (1) The IAM role in Account A must have an IAM policy allowing the S3 actions on the specific bucket ARN — this allows the principal to make the request. (2) The S3 bucket policy in Account B must explicitly allow the Account A role ARN — this allows the resource to accept the request from another account. If either side is missing, access is denied. Option A is incorrect — the bucket policy alone is insufficient for cross-account access (unlike same-account access where bucket policy alone can grant access). Option C (assume role) is an alternative approach but adds unnecessary complexity. Option D (Access Points) still requires both-side permissions.",
    questionType: "single"
  },
  {
    topic: "Monitoring",
    question: "A company wants to implement a comprehensive tagging strategy across 500 AWS accounts in their organization. They need to: (1) automatically tag all new resources with the account's cost center, (2) detect and alert on untagged resources within 24 hours of creation, (3) prevent resources without required tags from being deployed in production accounts. Which combination of AWS services implements all three requirements?",
    options: [
      "(1) AWS Config auto-remediation rule to add tags; (2) AWS Config rule 'required-tags' with SNS notification; (3) AWS CloudFormation StackSets with tag enforcement",
      "(1) AWS Tag Editor bulk tagging; (2) AWS Cost Explorer tag coverage report; (3) IAM permission boundaries requiring tags",
      "(1) EventBridge rule triggering Lambda to add tags on resource creation events; (2) AWS Config rule 'required-tags' with SNS/EventBridge notification within evaluation period; (3) SCPs denying resource creation without required tags in production OUs",
      "(1) AWS Systems Manager Automation to tag resources; (2) AWS Trusted Advisor tag coverage check; (3) CloudFormation hooks to validate tags before deployment"
    ],
    correctAnswers: [2],
    explanation: "EventBridge captures resource creation events (e.g., EC2 RunInstances) and triggers Lambda to automatically apply account-level tags — requirement 1. AWS Config 'required-tags' rule evaluates resources and triggers SNS notifications for non-compliant resources within the Config evaluation period (configurable to near-real-time) — requirement 2. SCPs in the production OU can deny resource creation API calls that don't include required tags using the aws:RequestTag condition key — requirement 3 (preventive control). Option A's Config auto-remediation is reactive, not preventive. Option B's Tag Editor is manual. Option D's CloudFormation hooks only work for CloudFormation-deployed resources, not all resource creation.",
    questionType: "single"
  },
  {
    topic: "Networking",
    question: "A company needs to implement a multi-region active-active architecture for their web application. The application uses DynamoDB Global Tables for data replication. Users should be routed to the nearest region, but if a region becomes unhealthy, traffic should automatically failover to the other region within 30 seconds. The company uses a custom domain. Which Route 53 configuration achieves this?",
    options: [
      "Create latency-based routing records for each region's ALB, with health checks on each ALB. Route 53 will automatically stop routing to an unhealthy region",
      "Create failover routing with us-east-1 as primary and eu-west-1 as secondary, with health checks. This provides automatic failover but not latency-based routing",
      "Create latency-based routing records for each region with associated Route 53 health checks. When a health check fails, Route 53 stops including that record in responses, effectively routing all traffic to the healthy region",
      "Use AWS Global Accelerator with endpoint groups in each region and health checks, which provides anycast routing and automatic failover within 30 seconds"
    ],
    correctAnswers: [2],
    explanation: "Route 53 latency-based routing with health checks provides both requirements: users are routed to the nearest (lowest latency) region normally, and when a health check fails, Route 53 removes that record from responses, routing all traffic to the remaining healthy region. Route 53 health check failover typically occurs within 10-30 seconds of a failure being detected. Option A is the same as Option C — both describe latency routing with health checks. Option B (failover routing) doesn't provide latency-based routing. Option D (Global Accelerator) is also valid and may provide faster failover, but Route 53 with health checks meets the 30-second requirement at lower cost.",
    questionType: "single"
  },
  {
    topic: "EKS",
    question: "A company runs a Kubernetes application on Amazon EKS. The application pods need to access AWS services (S3, DynamoDB, SQS) using IAM permissions. Currently, the EC2 worker nodes have an IAM role with broad permissions, which means all pods on a node share the same permissions. The security team requires pod-level IAM isolation. Which solution provides per-pod IAM permissions with the LEAST operational overhead?",
    options: [
      "Create separate node groups for each application, each with a different IAM role — pods on different node groups have different permissions",
      "Use IAM Roles for Service Accounts (IRSA): create an IAM role with the required permissions, annotate the Kubernetes service account with the IAM role ARN, and associate the service account with the pods",
      "Deploy the AWS credentials as Kubernetes secrets and mount them in each pod's container as environment variables",
      "Use AWS Secrets Manager to store IAM access keys, and have each pod retrieve its credentials from Secrets Manager at startup"
    ],
    correctAnswers: [1],
    explanation: "IRSA (IAM Roles for Service Accounts) is the AWS-native solution for pod-level IAM isolation on EKS. It uses OIDC federation: EKS creates an OIDC provider, IAM roles are configured to trust the OIDC provider for specific service accounts, and pods using that service account automatically receive temporary credentials via the AWS SDK's credential chain. No credential management is needed. Option A (separate node groups) is operationally expensive and doesn't scale. Option C (credentials as secrets) stores long-term credentials in Kubernetes, which is a security risk. Option D (Secrets Manager) still requires credentials to access Secrets Manager — a chicken-and-egg problem.",
    questionType: "single"
  },
  {
    topic: "Glue",
    question: "A data engineering team uses AWS Glue ETL jobs to process data from S3. A Glue job that processes 500GB of data daily has been running for 6 hours before timing out. The job reads Parquet files, performs complex joins, and writes results back to S3. The team has already increased the number of DPUs (Data Processing Units) to 100 but sees no improvement. CloudWatch metrics show that only 20% of DPUs are actively processing while 80% are idle. What is the MOST LIKELY cause and the correct solution?",
    options: [
      "The Glue job is I/O bound due to S3 read speeds. Solution: Enable S3 Transfer Acceleration for the source bucket",
      "Data skew: the join operation produces highly uneven partition sizes, causing some executors to process large partitions while others finish quickly and sit idle. Solution: Add a repartition() or salting technique to the join key to distribute data evenly",
      "The Glue job is using Python Shell instead of Spark. Solution: Change the job type to Spark to enable distributed processing",
      "The Parquet files are too small (small file problem), causing excessive S3 API calls. Solution: Use Glue's groupFiles feature to combine small files before processing"
    ],
    correctAnswers: [1],
    explanation: "When 80% of DPUs are idle while 20% are active, this is a classic data skew symptom. The join operation creates partitions of very unequal sizes — a few large partitions are processed by a few executors while the rest finish their small partitions and wait. Adding more DPUs doesn't help because the bottleneck is the few large partitions. Salting (adding a random prefix to join keys) or explicit repartitioning distributes data more evenly across executors. Option A (S3 Transfer Acceleration) addresses network throughput, not processing skew. Option C (Python Shell) — if the job is already using Spark, this doesn't apply. Option D (small files) would cause all executors to be busy with many small tasks, not idle.",
    questionType: "single"
  },
  {
    topic: "WAF",
    question: "A company's web application is experiencing a sophisticated DDoS attack. The attack uses legitimate-looking HTTP GET requests to a specific API endpoint (/api/search) with randomized query parameters to bypass caching. The requests come from 50,000 different IP addresses (a botnet). The attack generates 500,000 requests/second. AWS Shield Standard is enabled. The company needs to stop the attack within 15 minutes. Which combination of actions is MOST effective?",
    options: [
      "Enable AWS Shield Advanced, which provides automatic DDoS mitigation and a 24/7 DDoS Response Team that can implement custom mitigations",
      "Create a WAF rate-based rule limiting requests to /api/search to 100 requests per 5 minutes per IP, and add a WAF managed rule group for bot control",
      "Use CloudFront with WAF, create a rate-based rule for /api/search, enable AWS Bot Control managed rule group to identify and block bot traffic, and if the attack continues, engage AWS Shield Advanced DDoS Response Team",
      "Block all traffic to /api/search using a WAF rule, which stops the attack immediately while the team investigates"
    ],
    correctAnswers: [2],
    explanation: "For a sophisticated botnet attack: CloudFront absorbs the traffic at edge locations (reducing origin load). WAF rate-based rules limit requests per IP to /api/search. AWS Bot Control uses ML to identify bot signatures beyond simple IP-based detection, blocking bot traffic even from distributed IPs. If these measures are insufficient, Shield Advanced's DRT (DDoS Response Team) can implement custom mitigations within the 15-minute window. Option A (Shield Advanced alone) provides DRT access but the response time may exceed 15 minutes for custom mitigations. Option B (WAF rate limiting) with 50,000 IPs means each IP only needs to send 10 requests/second to generate 500K RPS total — rate limiting per IP is ineffective. Option D blocks legitimate users too.",
    questionType: "single"
  },
  {
    topic: "Backup",
    question: "A company has the following backup requirements across 200 AWS accounts: daily backups of all RDS instances retained for 35 days, weekly backups of EBS volumes retained for 90 days, monthly backups of all resources retained for 7 years, and all backups must be copied to a separate AWS account for ransomware protection. Which solution implements all requirements with the LEAST operational overhead?",
    options: [
      "Create backup scripts using AWS CLI, schedule them with EventBridge in each account, and use S3 Cross-Account replication for backup storage",
      "Use AWS Backup with backup plans defining the required schedules and retention periods, deploy the backup plans across all accounts using AWS Backup Organizations support, and configure cross-account backup copy to a dedicated backup account",
      "Use RDS automated backups for RDS instances, AWS Data Lifecycle Manager for EBS volumes, and custom Lambda functions for cross-account copying",
      "Deploy AWS Backup in each account individually, create separate backup vaults in each account, and manually configure cross-account copying"
    ],
    correctAnswers: [1],
    explanation: "AWS Backup with Organizations integration allows you to create backup policies (similar to SCPs) that are automatically applied to all accounts in the organization. A single backup plan can define multiple rules (daily/weekly/monthly) with different retention periods. Cross-account backup copy can be configured to copy all backups to a dedicated backup account, providing ransomware protection (the backup account has separate credentials). This requires configuration in one place for all 200 accounts. Option A (CLI scripts) requires per-account setup and maintenance. Option C uses multiple services without centralized management. Option D requires per-account configuration — 200 accounts × manual setup = high operational overhead.",
    questionType: "single"
  },
  {
    topic: "Compute",
    question: "A company runs a high-performance computing (HPC) workload that requires: low-latency, high-bandwidth network communication between instances (MPI workloads), access to shared storage that all instances can read/write simultaneously, and the ability to scale from 0 to 1,000 instances within 10 minutes. The workload runs for 2-4 hours and then terminates. Which architecture is MOST appropriate?",
    options: [
      "EC2 instances with Enhanced Networking (ENA), EFS for shared storage, and Auto Scaling groups with Spot Instances",
      "EC2 instances in a cluster placement group with Elastic Fabric Adapter (EFA) for low-latency networking, Amazon FSx for Lustre for high-performance shared storage, and AWS ParallelCluster for automated cluster management with Spot Instances",
      "EC2 instances with SR-IOV networking, EBS Multi-Attach volumes for shared storage, and EC2 Fleet with Spot Instances",
      "AWS Batch with multi-node parallel jobs, EFS for shared storage, and Spot Instances for cost optimization"
    ],
    correctAnswers: [1],
    explanation: "EFA (Elastic Fabric Adapter) provides OS-bypass networking for MPI workloads, achieving near on-premises HPC network performance. Cluster placement groups minimize network latency between instances. FSx for Lustre is purpose-built for HPC with sub-millisecond latency and hundreds of GB/s throughput, far exceeding EFS for HPC workloads. AWS ParallelCluster automates cluster provisioning and scaling. Spot Instances provide 60-90% cost savings for the short-duration workload. Option A (EFA is missing, EFS is too slow for HPC). Option C (EBS Multi-Attach has limited concurrent connections and lower throughput). Option D (AWS Batch doesn't support EFA for MPI communication).",
    questionType: "single"
  },
  {
    topic: "Transit Gateway",
    question: "A company has 20 VPCs across 4 AWS accounts connected via a Transit Gateway. They need to implement network segmentation so that: Production VPCs can communicate with each other but not with Development VPCs, Development VPCs can communicate with each other but not with Production VPCs, a shared services VPC (DNS, monitoring) must be accessible from both Production and Development VPCs, but the shared services VPC must not be able to initiate connections to Production or Development. Which Transit Gateway configuration achieves this?",
    options: [
      "Create separate Transit Gateways for Production and Development, peer them, and use the shared services VPC as a hub connected to both Transit Gateways",
      "Create three Transit Gateway route tables: Production RT (routes to Production VPCs + Shared Services), Development RT (routes to Development VPCs + Shared Services), and Shared Services RT (no routes to Production or Development). Associate Production VPCs with Production RT, Development VPCs with Development RT, and Shared Services VPC with Shared Services RT. Propagate routes appropriately",
      "Use VPC peering between all Production VPCs, all Development VPCs, and the Shared Services VPC, and configure route tables to prevent cross-environment routing",
      "Use Security Groups to block inter-environment traffic and configure NACLs on the Shared Services VPC to prevent outbound connections to Production and Development"
    ],
    correctAnswers: [1],
    explanation: "Transit Gateway route tables provide network segmentation. Production RT has routes to Production VPCs and Shared Services VPC — Production can reach Production and Shared Services. Development RT has routes to Development VPCs and Shared Services VPC — Development can reach Development and Shared Services. Shared Services RT has NO routes to Production or Development — Shared Services cannot initiate connections to either environment (it can only respond to inbound connections). This is the standard Transit Gateway segmentation pattern. Option A (separate TGWs) is overly complex. Option C (VPC peering) doesn't scale to 20 VPCs and can't prevent Shared Services from initiating connections. Option D (Security Groups/NACLs) is harder to manage and doesn't enforce routing-level isolation.",
    questionType: "single"
  },
  {
    topic: "CloudFormation",
    question: "A company uses CloudFormation to deploy a three-tier web application. During a stack update, the RDS database instance is being replaced (due to a change in the DB instance class that requires replacement). The CloudFormation update fails midway through because a new EC2 instance in the web tier fails its health check. The stack is now in UPDATE_ROLLBACK_FAILED state. The RDS instance has already been replaced (new instance running) but the old instance was deleted. What is the correct approach to recover the stack?",
    options: [
      "Delete the stack and redeploy from scratch using the original template",
      "Use the CloudFormation ContinueUpdateRollback API with the --resources-to-skip parameter to skip the EC2 resource that failed the health check, allowing the rollback to complete, then investigate and fix the EC2 issue separately",
      "Manually update the RDS instance to match the original configuration and then retry the CloudFormation update",
      "Contact AWS Support to restore the deleted RDS instance from automated backups and then retry the rollback"
    ],
    correctAnswers: [1],
    explanation: "UPDATE_ROLLBACK_FAILED occurs when CloudFormation cannot roll back a failed update. The ContinueUpdateRollback API with --resources-to-skip tells CloudFormation to skip specific resources during rollback (treating them as successfully rolled back). This allows the rollback to complete even if some resources can't be rolled back. After the stack returns to a stable state (UPDATE_ROLLBACK_COMPLETE), you can investigate and fix the EC2 issue, then perform a new update. Option A (delete and redeploy) loses the current state of all resources. Option C (manual RDS changes) doesn't help CloudFormation's state machine. Option D is unnecessary — the new RDS instance is running and is the desired state.",
    questionType: "single"
  },
  {
    topic: "Compliance",
    question: "A company in a regulated industry needs to demonstrate to auditors that their AWS environment has been continuously compliant with a specific set of security controls for the past 12 months. The controls include: encryption at rest for all EBS volumes, MFA enabled for all IAM users, no security groups allowing 0.0.0.0/0 on port 22, and CloudTrail enabled in all regions. Which AWS service provides the BEST evidence for continuous compliance over time?",
    options: [
      "AWS Security Hub with CIS AWS Foundations Benchmark standard enabled, which provides a compliance score and findings",
      "AWS Config with the required Config rules, combined with AWS Config's compliance history timeline which shows when resources were compliant or non-compliant over time, and AWS Audit Manager to generate audit-ready reports",
      "AWS Trusted Advisor security checks, exported to S3 daily via Lambda, providing a historical record of compliance",
      "CloudTrail logs stored in S3 for 12 months, which provide a complete record of all API calls that can be analyzed to demonstrate compliance"
    ],
    correctAnswers: [1],
    explanation: "AWS Config continuously evaluates resource configurations against rules and maintains a compliance timeline showing when each resource was compliant or non-compliant. This provides the historical evidence auditors need. AWS Audit Manager integrates with Config to automatically collect evidence and generate audit-ready reports mapped to compliance frameworks. Together they provide continuous compliance monitoring with historical records. Option A (Security Hub) provides current state and findings but limited historical compliance timelines. Option C (Trusted Advisor) doesn't have built-in historical compliance tracking. Option D (CloudTrail) records API calls but requires significant analysis to demonstrate compliance — it's not a compliance reporting tool.",
    questionType: "single"
  },
  {
    topic: "Serverless",
    question: "A company builds a real-time bidding platform using Lambda. Each bid request must be processed in under 100ms. Lambda functions are experiencing cold starts of 800ms-2 seconds due to large deployment packages (500MB including ML models). The function is invoked 10,000 times/day with traffic concentrated in 2-hour windows. Which combination of optimizations reduces cold start latency to under 100ms while minimizing cost?",
    options: [
      "Enable Lambda Provisioned Concurrency for 100 instances during the 2-hour peak windows using scheduled scaling, and optimize the deployment package by moving ML models to EFS and loading them lazily",
      "Increase Lambda memory to 10GB which proportionally increases CPU and reduces cold start time, and use Lambda layers to separate the ML models from the function code",
      "Rewrite the Lambda function in Go or Rust instead of Python/Node.js, which has faster cold start times, and use Lambda SnapStart",
      "Move the ML models to S3 and download them on each invocation, which avoids the large deployment package and reduces cold start time"
    ],
    correctAnswers: [0],
    explanation: "Provisioned Concurrency pre-initializes Lambda execution environments, eliminating cold starts entirely for the provisioned instances. Scheduling it only during the 2-hour peak windows minimizes cost (you pay for PC only when needed). Moving ML models to EFS (mounted at /mnt/efs) allows Lambda to access them without including them in the deployment package — the package size drops dramatically, reducing cold start time for non-provisioned invocations. Option B (10GB memory) reduces cold start proportionally but 500MB packages will still have significant cold starts. Option C (Go/Rust) helps but SnapStart is only for Java. Option D (S3 download per invocation) adds 100-500ms per invocation — worse than the current problem.",
    questionType: "single"
  },
  {
    topic: "Database",
    question: "A company's DynamoDB table stores user profiles with a partition key of userId. The table has 100 million items. The application needs to support three access patterns: (1) get a user by userId (current), (2) find all users in a specific city (new requirement), (3) find all users who signed up in a specific date range (new requirement). Adding a GSI for each new pattern is being considered. What is the MOST cost-effective solution that supports all three access patterns?",
    options: [
      "Add two GSIs: one with city as partition key, and one with signupDate as partition key — this directly supports all three access patterns",
      "Add a single GSI with city as partition key and signupDate as sort key, which supports all three patterns: (1) query main table by userId, (2) query GSI by city, (3) query GSI with city partition key and signupDate sort key range",
      "Migrate to Aurora PostgreSQL which supports arbitrary SQL queries including WHERE clauses on any column without pre-defining access patterns",
      "Use DynamoDB Streams with Lambda to maintain a separate search index in OpenSearch Service, which supports all three access patterns with flexible querying"
    ],
    correctAnswers: [1],
    explanation: "A single GSI with city as partition key and signupDate as sort key supports: (1) main table query by userId, (2) GSI query by city (all users in a city), (3) GSI query by city with signupDate sort key range (users in a city who signed up in a date range). If you need users by date range across all cities, you'd need a different approach, but the question implies city + date range filtering. One GSI is cheaper than two (GSI storage and write costs). Option A (two GSIs) costs more and doesn't support combined city+date queries. Option C (Aurora) requires migration. Option D (OpenSearch) adds operational complexity and cost.",
    questionType: "single"
  },
  {
    topic: "Networking",
    question: "A company's application in a VPC needs to make API calls to an external SaaS provider. The SaaS provider requires that all API calls originate from a fixed, known IP address for whitelisting. The application runs on EC2 instances in private subnets that currently use a NAT Gateway for internet access. The NAT Gateway's Elastic IP changes whenever it's recreated. The company wants a solution where the source IP never changes, even if infrastructure is recreated. Which solution achieves this?",
    options: [
      "Assign Elastic IPs directly to the EC2 instances and move them to public subnets",
      "Allocate a new Elastic IP, associate it with the existing NAT Gateway — the NAT Gateway's EIP is persistent and doesn't change unless explicitly disassociated",
      "Use AWS Global Accelerator with static anycast IPs as the egress point for the application's API calls",
      "Deploy a proxy EC2 instance with an Elastic IP in a public subnet, route all SaaS API traffic through the proxy, and use the proxy's Elastic IP for whitelisting"
    ],
    correctAnswers: [1],
    explanation: "NAT Gateway Elastic IPs are persistent — they remain associated with the NAT Gateway until explicitly disassociated. The EIP doesn't change when the NAT Gateway is recreated if you re-associate the same EIP. By allocating a dedicated EIP for this purpose and documenting it, the company can provide a stable source IP to the SaaS provider. Option A (public subnets) removes the security benefit of private subnets. Option C (Global Accelerator) provides static IPs for inbound traffic, not outbound egress. Option D (proxy EC2) is a valid alternative but adds operational overhead compared to simply using a dedicated EIP on the NAT Gateway.",
    questionType: "single"
  },
  {
    topic: "Resilience",
    question: "A company's application uses SQS FIFO queues to process financial transactions in order. The consumer Lambda function processes messages and updates a DynamoDB table. During a recent incident, a Lambda function bug caused it to crash after partially processing a batch of 10 messages. 3 messages were successfully processed and written to DynamoDB, but 7 were not. After the bug was fixed, all 10 messages were reprocessed, causing 3 duplicate transactions. How should the architecture be changed to prevent duplicate processing while maintaining FIFO ordering?",
    options: [
      "Enable SQS FIFO deduplication by setting the MessageDeduplicationId on each message, which prevents duplicate messages from being enqueued",
      "Implement idempotency in the Lambda function: before processing each transaction, check DynamoDB for a record with the transaction ID; if it exists, skip processing. Use DynamoDB conditional writes to ensure the transaction record is only written once",
      "Reduce the Lambda batch size to 1 so each message is processed individually, and set the visibility timeout to 30 seconds to prevent reprocessing",
      "Use Lambda Destinations to send failed batches to a DLQ, and manually reprocess only the failed messages from the DLQ"
    ],
    correctAnswers: [1],
    explanation: "Idempotency is the correct solution for preventing duplicate processing in distributed systems. By checking if a transaction ID already exists in DynamoDB before processing, and using DynamoDB conditional writes (condition: attribute_not_exists(transactionId)) to atomically write the result, the Lambda function becomes idempotent — processing the same message multiple times produces the same result as processing it once. Option A (SQS deduplication) prevents duplicate messages from being enqueued but doesn't help when the same message is reprocessed after a Lambda failure. Option C (batch size 1) reduces the blast radius but doesn't prevent duplicates. Option D (DLQ) requires manual intervention and doesn't prevent duplicates.",
    questionType: "single"
  },
  {
    topic: "Storage",
    question: "A company runs a genomics research platform that generates 500TB of sequencing data per year. The data is processed once when generated (intensive compute), then accessed by researchers 2-3 times per year for analysis, and must be retained for 10 years for regulatory compliance. The data cannot be deleted or modified after creation. Storage costs are the primary concern. Which combination of S3 features provides the MOST cost-effective compliant storage?",
    options: [
      "S3 Standard for initial processing, S3 Intelligent-Tiering for long-term storage, and S3 Object Lock in Governance mode for immutability",
      "S3 Standard for initial processing (30 days), S3 Glacier Instant Retrieval for years 1-2 (2-3 accesses/year with millisecond retrieval), S3 Glacier Deep Archive for years 3-10 (rare access, 12-48 hour retrieval acceptable), and S3 Object Lock in Compliance mode (cannot be overridden even by root) for immutability",
      "S3 One Zone-IA for cost savings, with cross-region replication to another One Zone-IA bucket for redundancy, and S3 Versioning for immutability",
      "S3 Standard with S3 Lifecycle policies transitioning to S3 Glacier after 1 year, and AWS Backup for immutability compliance"
    ],
    correctAnswers: [1],
    explanation: "S3 Standard for the first 30 days during active processing. Glacier Instant Retrieval for years 1-2 provides low-cost storage with millisecond retrieval for the 2-3 annual accesses. Glacier Deep Archive for years 3-10 provides the lowest storage cost ($0.00099/GB/month) — 12-48 hour retrieval is acceptable for research data accessed rarely. S3 Object Lock Compliance mode prevents deletion or modification even by the root account, satisfying regulatory immutability requirements. Option A (Intelligent-Tiering) has monitoring fees and is expensive for predictable access patterns. Option C (One Zone-IA) lacks the multi-AZ redundancy required for irreplaceable research data. Option D (AWS Backup) doesn't provide the same cost optimization as direct Glacier tiers.",
    questionType: "single"
  },
  {
    topic: "EC2",
    question: "A company runs a Windows-based application on EC2 that requires a specific version of a third-party driver. After a recent AMI update, the driver was overwritten and the application stopped working. The company wants to prevent unauthorized changes to the EC2 instance while still allowing the application team to deploy application code updates. Which combination of controls achieves this?",
    options: [
      "Use AWS Systems Manager Session Manager instead of RDP for access, enable EC2 Instance Connect, and use CloudTrail to audit all changes",
      "Create a custom AMI with the required driver baked in, use EC2 Image Builder to enforce the AMI as the base for all new instances, use AWS Config rule 'approved-amis-by-id' to detect non-compliant instances, and use IAM policies to restrict who can launch instances or modify system-level configurations via SSM Run Command",
      "Enable EC2 Hibernate to preserve the instance state and prevent AMI updates from affecting running instances",
      "Use AWS OpsWorks to manage the instance configuration and enforce the driver installation as a Chef recipe that runs on every instance update"
    ],
    correctAnswers: [1],
    explanation: "Baking the driver into a custom AMI ensures it's always present on new instances. EC2 Image Builder automates AMI creation with the required components. The AWS Config 'approved-amis-by-id' rule detects instances not using the approved AMI. IAM policies can restrict ec2:RunInstances to approved AMIs and restrict SSM Run Command to specific documents (preventing system-level changes while allowing application deployments). Option A (Session Manager/CloudTrail) provides auditing but doesn't prevent unauthorized changes. Option C (Hibernate) preserves state but doesn't prevent AMI updates on new instances. Option D (OpsWorks/Chef) is a valid configuration management approach but more complex than the AMI-based solution.",
    questionType: "single"
  },
  {
    topic: "EventBridge",
    question: "A company wants to build an event-driven architecture where multiple microservices react to business events. Events are published by a central 'Order Service' and consumed by 'Inventory Service', 'Notification Service', and 'Analytics Service'. Each service must receive ALL events, even if it's temporarily down. Events must be processed in the order they were published within each order ID. The company wants to decouple the Order Service from consumers. Which architecture correctly satisfies ALL requirements?",
    options: [
      "Order Service publishes to EventBridge, EventBridge routes to three SQS Standard queues (one per consumer), each consumer reads from its queue",
      "Order Service publishes to SNS, SNS fans out to three SQS FIFO queues (one per consumer), each consumer reads from its FIFO queue using the orderId as the MessageGroupId",
      "Order Service publishes to EventBridge, EventBridge routes to three SQS FIFO queues (one per consumer), each consumer reads from its FIFO queue using the orderId as the MessageGroupId",
      "Order Service publishes to Kinesis Data Streams with orderId as the partition key, all three consumers read from the same stream using separate consumer groups"
    ],
    correctAnswers: [2],
    explanation: "EventBridge provides decoupling and routing. FIFO queues per consumer ensure each service receives all events (durable delivery even if the service is down) and maintains order within each orderId (using MessageGroupId). EventBridge → SQS FIFO is a supported integration. Option A (Standard queues) doesn't guarantee ordering. Option B (SNS → SQS FIFO) is valid but SNS doesn't natively support FIFO queues as targets — SNS can only deliver to SQS Standard queues. Option D (Kinesis) maintains ordering but all consumers share the same stream — if one consumer falls behind, it doesn't affect others, but Kinesis has a 7-day retention limit and requires shard management.",
    questionType: "single"
  },
  {
    topic: "Security",
    question: "A company discovers that an attacker has been exfiltrating data from their S3 buckets using valid AWS credentials stolen from a developer's laptop. The attacker has been active for 2 weeks. The company wants to immediately stop the exfiltration, understand what data was accessed, and prevent similar incidents in the future. What is the correct SEQUENCE of actions?",
    options: [
      "1) Enable Amazon Macie to scan S3 for sensitive data, 2) Rotate all IAM access keys, 3) Enable S3 server access logging, 4) Enable GuardDuty for future threat detection",
      "1) Immediately deactivate the compromised IAM user's access keys, 2) Use CloudTrail and S3 server access logs to identify all objects accessed/downloaded in the past 2 weeks, 3) Assess the impact (what data was exfiltrated), 4) Rotate all potentially compromised credentials, 5) Enable GuardDuty and Macie for ongoing detection, 6) Implement preventive controls (MFA, shorter key rotation, VPN requirement for S3 access)",
      "1) Delete the IAM user account immediately, 2) Enable MFA for all users, 3) Use Athena to query CloudTrail logs, 4) File a police report",
      "1) Enable AWS Config to detect future misconfigurations, 2) Use AWS Trusted Advisor to check for exposed credentials, 3) Rotate the developer's access keys, 4) Enable CloudTrail in all regions"
    ],
    correctAnswers: [1],
    explanation: "Correct incident response sequence: Stop the bleeding first (deactivate keys). Understand the scope (CloudTrail + S3 access logs show exactly what was accessed). Assess impact (determine what sensitive data was exfiltrated for breach notification requirements). Clean up (rotate all credentials that may have been compromised). Improve detection (GuardDuty detects credential misuse, Macie identifies sensitive data). Implement prevention (MFA, shorter rotation cycles, conditional access policies). Option A starts with Macie scanning (doesn't stop the attack). Option C deletes the user (loses audit trail). Option D's first action (Config) doesn't stop the ongoing exfiltration.",
    questionType: "single"
  },
  {
    topic: "Architecture",
    question: "A company wants to migrate a monolithic application to microservices on AWS. The monolith has a single PostgreSQL database with 200 tables. The team identifies 5 bounded contexts (domains) in the application. The migration must be done incrementally without a big-bang rewrite, and the application must remain operational throughout. Which migration pattern is MOST appropriate?",
    options: [
      "Lift and shift the entire monolith to EC2, then gradually extract microservices one by one using the Strangler Fig pattern, each with its own database",
      "Rewrite all 5 microservices simultaneously in parallel teams, deploy them all at once, and migrate the database using AWS DMS",
      "Use the Strangler Fig pattern: deploy the monolith on EC2/ECS, place an API Gateway or ALB in front of it, gradually extract one microservice at a time (starting with the least coupled), give each extracted service its own RDS/Aurora database, use the monolith's database for the remaining tables, and use event-driven patterns (EventBridge/SQS) for cross-service communication",
      "Decompose the database first by creating separate schemas for each bounded context, then extract the application logic into microservices"
    ],
    correctAnswers: [2],
    explanation: "The Strangler Fig pattern is the industry-standard approach for incremental monolith migration. An API Gateway/ALB routes requests — new requests for extracted services go to microservices, remaining requests go to the monolith. Services are extracted one at a time (least coupled first), each getting its own database. The monolith continues operating throughout. Event-driven communication decouples services. Option A is correct in concept but doesn't mention the routing layer (API Gateway/ALB). Option B (big-bang rewrite) is high-risk and the question explicitly requires incremental migration. Option D (database-first decomposition) is extremely risky — the application still has a single codebase accessing a split database, creating complex distributed transactions.",
    questionType: "single"
  },
  {
    topic: "Networking",
    question: "A company has deployed an Application Load Balancer with HTTPS listeners. The security team requires that only TLS 1.2 and 1.3 are supported, specific cipher suites are used, and the ALB must present an EV (Extended Validation) SSL certificate. The company's domain is hosted in Route 53. Which combination of configurations is required?",
    options: [
      "Configure the ALB security policy to 'ELBSecurityPolicy-TLS13-1-2-2021-06', import the EV certificate into ACM, create an HTTPS listener using the ACM certificate, and create a Route 53 alias record pointing to the ALB",
      "Configure the ALB security policy to 'ELBSecurityPolicy-2016-08' (default), use AWS Certificate Manager to request an EV certificate, and configure Route 53 CNAME record",
      "Use Network Load Balancer instead of ALB for TLS 1.3 support, configure the NLB with the EV certificate, and use CloudFront in front for cipher suite control",
      "Configure TLS termination on EC2 instances behind the ALB using Nginx, which provides full control over TLS version and cipher suites, and use self-signed certificates on the ALB"
    ],
    correctAnswers: [0],
    explanation: "ELBSecurityPolicy-TLS13-1-2-2021-06 enforces TLS 1.2 minimum and supports TLS 1.3, with modern cipher suites. ACM supports importing externally-obtained EV certificates (ACM cannot issue EV certificates itself — you must purchase from a CA and import). Route 53 alias records for ALBs are the recommended approach (no TTL issues, no extra charge). Option B's default security policy allows older TLS versions. Option C (NLB) passes through TLS without termination — you'd need to handle TLS on EC2 instances. Option D (Nginx TLS termination) is overly complex and the ALB would still need a certificate.",
    questionType: "single"
  },
  {
    topic: "Cost",
    question: "A data science team uses SageMaker to train ML models. They have 10 data scientists who each run 3-5 training jobs per day. Each job uses ml.p3.8xlarge instances ($12.24/hour) and runs for 2-4 hours. The team also uses SageMaker Studio notebooks that are left running 24/7 even when not in use. The monthly bill is $85,000. Analysis shows: 60% of training jobs use only 30% of GPU capacity, notebooks run 720 hours/month but are actively used only 80 hours/month. Which optimizations reduce the bill by the MOST?",
    options: [
      "Purchase SageMaker Savings Plans for 1 year, which provides up to 64% discount on SageMaker training instances",
      "Right-size training jobs to ml.p3.2xlarge (which has 1 GPU vs 4 GPUs on ml.p3.8xlarge) since jobs only use 30% GPU capacity, implement automatic notebook shutdown using SageMaker lifecycle configurations after 1 hour of inactivity, and use Spot Training Jobs for non-critical training runs",
      "Move training jobs to EC2 Spot Instances with Deep Learning AMIs, which provides more control over costs than SageMaker managed training",
      "Use SageMaker Experiments to track and reuse model artifacts, reducing the number of training jobs needed"
    ],
    correctAnswers: [1],
    explanation: "Right-sizing from ml.p3.8xlarge (4 GPUs, $12.24/hr) to ml.p3.2xlarge (1 GPU, $3.825/hr) reduces training costs by 69% for jobs using only 30% GPU capacity. Automatic notebook shutdown eliminates 640 hours/month of idle notebook time (720-80 hours). SageMaker Spot Training provides 70-90% discount for non-critical training. Combined, these changes can reduce the bill by 70-80%. Option A (Savings Plans) provides 64% discount but requires commitment and doesn't address the idle notebooks. Option C (EC2 Spot) loses SageMaker managed training benefits (automatic checkpointing, managed spot interruptions). Option D (Experiments) reduces redundant work but doesn't address the core cost drivers.",
    questionType: "single"
  },
  {
    topic: "Networking",
    question: "A company runs a multi-tier application with web servers in public subnets and application servers in private subnets. A security audit finds that the application servers can make arbitrary outbound connections to any internet destination via the NAT Gateway. The security team wants to restrict outbound internet access from application servers to only specific domains (e.g., api.stripe.com, updates.company.com) while allowing all internal VPC traffic. Which solution enforces this with the LEAST performance impact?",
    options: [
      "Add outbound rules to the application server security groups to only allow traffic to the specific IP addresses of the allowed domains",
      "Deploy AWS Network Firewall in a dedicated subnet, route application server outbound traffic through the Network Firewall before the NAT Gateway, and configure domain-based filtering rules to allow only the specific domains",
      "Use a proxy EC2 instance (Squid) in a public subnet, configure application servers to use the proxy for all internet traffic, and configure Squid's ACL to allow only the specific domains",
      "Use VPC Endpoint policies to restrict which S3 buckets and AWS services can be accessed, and block all other outbound traffic with NACLs"
    ],
    correctAnswers: [1],
    explanation: "AWS Network Firewall supports domain-based (FQDN) filtering rules, allowing you to specify exact domains (api.stripe.com) rather than IP addresses (which change for CDN-hosted services like Stripe). The traffic path becomes: Application Server → Network Firewall → NAT Gateway → Internet. Network Firewall is a managed service with no EC2 to maintain. Option A (IP-based security groups) fails for domains with dynamic IPs (Stripe uses multiple IPs that change). Option C (Squid proxy) requires EC2 management and the proxy becomes a single point of failure. Option D (VPC Endpoint policies) only controls AWS service access, not general internet domains.",
    questionType: "single"
  },
  {
    topic: "Aurora",
    question: "A company's Aurora MySQL cluster is running out of storage. The cluster currently uses 64TB of storage. Aurora automatically scales storage in 10GB increments up to 128TB. The DBA notices that the storage growth is primarily from binary logs (binlogs) that are retained for 7 days for replication purposes, but the company no longer uses binlog-based replication. Additionally, 30% of the storage is from a table that was dropped 6 months ago but the storage was never reclaimed. Which actions reclaim storage and prevent future unnecessary growth?",
    options: [
      "Take a final snapshot, restore to a new cluster, and delete the old cluster — the new cluster will only contain current data",
      "Disable binary logging by setting binlog_format=OFF in the parameter group, run OPTIMIZE TABLE on large tables to reclaim space from the dropped table, and use Aurora's storage auto-scaling to manage future growth",
      "Reduce the binlog retention period to 0 hours (disabling binlog retention) using mysql.rds_set_configuration('binlog retention hours', 0), run ALTER TABLE ... ENGINE=InnoDB on large tables to rebuild and reclaim space from the dropped table's freed pages",
      "Use AWS DMS to migrate data to a new Aurora cluster with only the current data, then switch the application to the new cluster"
    ],
    correctAnswers: [2],
    explanation: "Setting binlog retention to 0 immediately stops retaining binary logs, reclaiming that storage over time. ALTER TABLE ... ENGINE=InnoDB rebuilds the table, reclaiming space from deleted rows and freed pages (InnoDB doesn't automatically return space to the OS). Aurora storage doesn't shrink automatically — you must rebuild tables to reclaim space. Option A (snapshot + restore) works but requires downtime and data migration. Option B is incorrect — binlog_format=OFF disables the format but doesn't stop binlog generation; you need to set binlog retention to 0. Option D (DMS migration) is a valid but expensive approach for a storage reclamation problem.",
    questionType: "single"
  },
  {
    topic: "Serverless",
    question: "A company uses API Gateway with Lambda for a REST API. The API has a /reports endpoint that generates PDF reports by querying a database and rendering complex charts. The generation takes 45-120 seconds. API Gateway has a 29-second integration timeout that cannot be increased. Users are getting 504 Gateway Timeout errors. The company wants to maintain the REST API interface for clients. Which architecture resolves the timeout issue while maintaining a good user experience?",
    options: [
      "Increase the Lambda timeout to 15 minutes — API Gateway will wait for Lambda to complete",
      "Change the /reports endpoint to be asynchronous: the POST /reports request immediately returns a 202 Accepted with a jobId, a Lambda function processes the report asynchronously and stores the result in S3, and a GET /reports/{jobId} endpoint returns the report status and a pre-signed S3 URL when complete",
      "Use WebSockets API Gateway instead of REST API, which supports long-running connections without timeouts",
      "Move the report generation to an EC2 instance with a longer timeout, and use API Gateway as a proxy to the EC2 instance"
    ],
    correctAnswers: [1],
    explanation: "The async pattern is the standard solution for long-running API operations. POST /reports triggers the job and returns 202 immediately (within the 29-second timeout). A Lambda function (or Step Functions) processes the report asynchronously. The client polls GET /reports/{jobId} until the status is 'complete', then downloads from the pre-signed S3 URL. This is a well-established REST pattern (202 Accepted with polling). Option A is incorrect — API Gateway's 29-second timeout is a hard limit that cannot be overridden by Lambda's timeout. Option C (WebSockets) changes the client interface significantly. Option D (EC2) doesn't solve the API Gateway timeout issue.",
    questionType: "single"
  },
  {
    topic: "IAM",
    question: "A company's application running on EC2 needs to assume different IAM roles based on the environment (dev, staging, prod). The application reads the environment from an environment variable and calls sts:AssumeRole to get credentials for the appropriate role. A security review finds that the EC2 instance's base IAM role has sts:AssumeRole permission for ALL roles in the account. The security team wants to restrict the base role to only assume the three environment-specific roles. Which IAM policy on the base role correctly implements this?",
    options: [
      "{ \"Effect\": \"Allow\", \"Action\": \"sts:AssumeRole\", \"Resource\": \"arn:aws:iam::123456789012:role/dev-role\" }, plus separate statements for staging-role and prod-role",
      "{ \"Effect\": \"Allow\", \"Action\": \"sts:AssumeRole\", \"Resource\": \"arn:aws:iam::123456789012:role/*-role\" } — the wildcard matches all three environment roles",
      "{ \"Effect\": \"Allow\", \"Action\": \"sts:AssumeRole\", \"Resource\": \"*\", \"Condition\": { \"StringLike\": { \"sts:RoleSessionName\": [\"dev\", \"staging\", \"prod\"] } } }",
      "{ \"Effect\": \"Deny\", \"Action\": \"sts:AssumeRole\", \"NotResource\": [\"arn:aws:iam::123456789012:role/dev-role\", \"arn:aws:iam::123456789012:role/staging-role\", \"arn:aws:iam::123456789012:role/prod-role\"] }"
    ],
    correctAnswers: [0],
    explanation: "Explicitly listing the three role ARNs in the Resource field of an Allow statement is the most precise and secure approach. It grants sts:AssumeRole only for the exact three roles. Option B (wildcard *-role) would also match any other role ending in '-role' that might be created in the future — not least privilege. Option C (RoleSessionName condition) doesn't restrict which roles can be assumed — it only restricts the session name, which the caller controls. Option D (Deny with NotResource) requires an existing Allow statement granting sts:AssumeRole, and Deny statements can interact unexpectedly with other policies.",
    questionType: "single"
  },
  {
    topic: "Migration",
    question: "A company wants to migrate 500TB of data from an on-premises NAS to Amazon S3. The data consists of 50 million small files (average 10KB). The company has a 1 Gbps internet connection shared with production traffic. The migration must complete within 2 weeks and cannot use more than 500 Mbps of bandwidth during business hours (8am-6pm). Which migration approach is MOST appropriate?",
    options: [
      "Use AWS DataSync over the internet connection with bandwidth throttling configured to 500 Mbps during business hours and 1 Gbps after hours",
      "Order AWS Snowball Edge Storage Optimized devices (80TB each), copy data to 7 devices in parallel, ship them to AWS, and use S3 Batch Operations to organize the data after import",
      "Use S3 Transfer Acceleration with a multi-threaded upload script, which optimizes the upload path through CloudFront edge locations",
      "Set up AWS Direct Connect (1 Gbps) for the migration, which provides dedicated bandwidth that doesn't affect internet traffic"
    ],
    correctAnswers: [1],
    explanation: "500TB at 500 Mbps (business hours) + 1 Gbps (off hours) = approximately 500TB / average ~750 Mbps effective = ~148 hours = ~6 days of transfer time. However, 50 million small files (10KB average) create enormous overhead for network-based transfers — each file requires multiple API calls, and at 10KB, the protocol overhead dominates. Snowball Edge physically ships data, avoiding network limitations. 7 × 80TB devices = 560TB capacity. Snowball Edge handles small files efficiently with parallel copying. AWS imports data within days of receiving devices. Option A (DataSync) would struggle with 50 million small files — the API overhead would make it extremely slow. Option C (Transfer Acceleration) doesn't help with small file overhead. Option D (Direct Connect) takes weeks to provision.",
    questionType: "single"
  },
  {
    topic: "Compute",
    question: "A company runs a video transcoding service on EC2. Jobs are submitted via SQS and processed by a fleet of c5.4xlarge instances. Each transcoding job takes 30-90 minutes and uses 100% CPU. The fleet currently runs 20 instances 24/7. Analysis shows that 70% of jobs arrive between 6pm-midnight and the queue is empty 60% of the time during off-peak hours. The company wants to reduce costs by 50% without impacting job completion times. Which combination achieves this?",
    options: [
      "Purchase 20 Reserved Instances for 1 year with all-upfront payment, which provides ~40% savings",
      "Use a mixed fleet: 6 On-Demand instances (30% of current fleet) for baseline, and configure Auto Scaling to add Spot Instances based on SQS queue depth, using a Spot Fleet with 'capacity-optimized' strategy and multiple instance types (c5.4xlarge, c5a.4xlarge, m5.4xlarge) to maximize Spot availability",
      "Switch entirely to Spot Instances with a Spot Fleet, accepting that some jobs may be interrupted and need to restart",
      "Use AWS Lambda with 10GB memory allocation for transcoding, which eliminates EC2 costs"
    ],
    correctAnswers: [1],
    explanation: "A mixed fleet with 6 On-Demand instances (baseline for off-peak) + Spot Instances scaling based on SQS queue depth achieves >50% savings. During off-peak (60% of time), only 6 On-Demand instances run. During peak (6pm-midnight), Spot Instances scale up to handle the queue. Capacity-optimized strategy reduces Spot interruptions. Multiple instance types increase Spot availability. 30-90 minute jobs are at risk of interruption with pure Spot, but the mixed fleet ensures baseline capacity. Option A (Reserved Instances) only provides ~40% savings. Option C (pure Spot) risks job interruptions for 30-90 minute jobs. Option D (Lambda) has a 15-minute timeout — incompatible with 30-90 minute transcoding jobs.",
    questionType: "single"
  },
  {
    topic: "Database",
    question: "A company's application uses RDS MySQL with Multi-AZ. During a recent Multi-AZ failover (triggered by a maintenance event), the application experienced 45 seconds of downtime. The RDS documentation states failover should complete in 60-120 seconds, but the application was down for only 45 seconds of actual RDS failover. Investigation reveals the application's database connection pool holds connections for 5 minutes before recycling them. After the failover, the connection pool was still pointing to the old primary's IP address. What is the CORRECT fix to reduce application downtime during future failovers?",
    options: [
      "Increase the Multi-AZ failover speed by upgrading to Aurora, which has sub-30-second failover",
      "Configure the application's database connection pool to use the RDS endpoint DNS name (not the IP address), set the connection pool's TCP keepalive and connection validation settings to detect stale connections quickly, and reduce the connection pool's idle connection timeout",
      "Use RDS Proxy in front of the RDS instance, which maintains a connection pool and automatically handles failover transparently to the application",
      "Implement application-level retry logic that catches connection errors and retries with exponential backoff"
    ],
    correctAnswers: [2],
    explanation: "RDS Proxy maintains a persistent connection pool to the database and handles failover transparently. During a Multi-AZ failover, RDS Proxy automatically routes connections to the new primary without the application needing to reconnect. The application connects to the RDS Proxy endpoint (which never changes), and the proxy handles the database-level failover. This reduces application-visible downtime to near-zero. Option B (DNS + connection validation) helps but DNS TTL changes during failover still take time to propagate, and connection validation adds overhead. Option A (Aurora) reduces failover time but doesn't solve the connection pool issue. Option D (retry logic) reduces impact but doesn't eliminate downtime.",
    questionType: "single"
  },
  {
    topic: "Security",
    question: "A company uses AWS KMS to encrypt sensitive data in S3, RDS, and EBS. A key administrator accidentally scheduled a KMS key for deletion with a 7-day waiting period. The key encrypts 50TB of S3 data, 3 RDS databases, and 20 EBS volumes. The team realizes the mistake 2 days after scheduling deletion. What actions should be taken IMMEDIATELY?",
    options: [
      "Wait for the 7-day period to expire, then restore from backups using a new KMS key",
      "Cancel the key deletion immediately using the KMS console or API (CancelKeyDeletion), then implement preventive controls: add a key policy condition requiring MFA for kms:ScheduleKeyDeletion, and create a CloudWatch alarm for KMS key deletion events",
      "Create a new KMS key and re-encrypt all 50TB of S3 data, RDS databases, and EBS volumes before the 7-day period expires",
      "Enable AWS Backup to create encrypted backups of all resources using a different KMS key before the deletion takes effect"
    ],
    correctAnswers: [1],
    explanation: "KMS key deletion has a mandatory waiting period (7-30 days) specifically to allow recovery from mistakes. CancelKeyDeletion immediately stops the deletion process and re-enables the key. This is the correct first action — it takes seconds and prevents any data loss. After canceling, implement preventive controls: MFA requirement for deletion operations (using kms:CallerAccount and aws:MultiFactorAuthPresent conditions), CloudWatch/EventBridge alarms for KMS deletion events, and key deletion approval workflows. Option A (wait and restore) is unnecessary — you can cancel the deletion. Option C (re-encrypt 50TB) is extremely time-consuming and unnecessary. Option D (backup) is a good practice but doesn't address the immediate threat.",
    questionType: "single"
  },
  {
    topic: "Networking",
    question: "A company's VPC has the CIDR block 10.0.0.0/16. They need to add a new subnet for a third-party vendor who requires their own isolated network segment. The vendor's application must: communicate with the company's application
