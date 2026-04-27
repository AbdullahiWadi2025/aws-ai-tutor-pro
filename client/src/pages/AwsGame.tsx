// @ts-nocheck
import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  bg:       "#080d14",
  panel:    "#0d1520",
  raised:   "#111c2a",
  border:   "#1a2d45",
  accent:   "#f59e0b",
  accentDim:"#92400e",
  green:    "#10b981",
  red:      "#ef4444",
  blue:     "#3b82f6",
  purple:   "#8b5cf6",
  indigo:   "#6366f1",
  text:     "#e2e8f0",
  muted:    "#64748b",
  dim:      "#1a2d45",
};
const FONT_CODE  = "'Space Mono', 'JetBrains Mono', monospace";
const FONT_BODY  = "'DM Sans', system-ui, sans-serif";

// ─── SHARED PRIMITIVES ─────────────────────────────────────────────────────────
function GlowText({ children, color = C.accent }) {
  return <span style={{ color, textShadow: `0 0 18px ${color}70` }}>{children}</span>;
}

function Chip({ children, color = C.accent }) {
  return (
    <span style={{
      background: `${color}18`, border: `1px solid ${color}45`, color,
      padding: "2px 9px", borderRadius: 4, fontSize: 10,
      fontFamily: FONT_CODE, letterSpacing: 1,
    }}>{children}</span>
  );
}

function Btn({ children, onClick, color = C.accent, disabled = false, small = false, full = false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? C.dim : `linear-gradient(135deg,${color}22,${color}0d)`,
      border: `1px solid ${disabled ? C.dim : color}`,
      color: disabled ? C.muted : color,
      padding: small ? "6px 14px" : "10px 22px",
      borderRadius: 7, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: FONT_CODE, fontSize: small ? 11 : 13, letterSpacing: 1,
      transition: "all 0.18s",
      boxShadow: disabled ? "none" : `0 0 12px ${color}28`,
      width: full ? "100%" : "auto",
    }}
      onMouseEnter={e => { if (!disabled) (e.target as HTMLElement).style.boxShadow = `0 0 22px ${color}55`; }}
      onMouseLeave={e => { if (!disabled) (e.target as HTMLElement).style.boxShadow = `0 0 12px ${color}28`; }}
    >{children}</button>
  );
}

function Panel({ children, style = {} }: any) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, ...style }}>
      {children}
    </div>
  );
}

function XPBar({ xp, maxXp, color = C.accent }) {
  const pct = Math.min(100, (xp / maxXp) * 100);
  return (
    <div style={{ background: C.dim, borderRadius: 99, height: 6, overflow: "hidden" }}>
      <div style={{
        width: `${pct}%`, height: "100%",
        background: `linear-gradient(90deg,${color},${C.green})`,
        borderRadius: 99, transition: "width 0.6s ease",
        boxShadow: `0 0 8px ${color}70`,
      }} />
    </div>
  );
}

// ─── MATCH IT DATA (31 levels) ─────────────────────────────────────────────────
const MATCH_LEVELS = [
  { level:1, title:"AWS Basics", badge:"☁️ Cloud Rookie", color:"#10b981",
    pairs:[
      {left:"Amazon S3",right:"Scalable object storage in the cloud"},
      {left:"Amazon EC2",right:"Virtual servers you can rent on demand"},
      {left:"Amazon RDS",right:"Managed relational database service"},
      {left:"AWS Lambda",right:"Run code without managing servers"},
      {left:"Amazon VPC",right:"Your own private network inside AWS"},
      {left:"Amazon CloudFront",right:"Global CDN that caches content at edge"},
    ]},
  { level:2, title:"Compute — Services 101", badge:"💻 EC2 Starter", color:"#FF9900",
    pairs:[
      {left:"Amazon EC2",right:"Resizable virtual machines in the cloud"},
      {left:"AWS Lambda",right:"Event-driven serverless compute"},
      {left:"Amazon ECS",right:"Run Docker containers on AWS"},
      {left:"AWS Elastic Beanstalk",right:"Deploy web apps without managing infra"},
      {left:"Amazon Lightsail",right:"Simplified VPS for simple workloads"},
      {left:"EC2 Auto Scaling",right:"Automatically adjust number of EC2 instances"},
    ]},
  { level:3, title:"Compute — Pricing", badge:"💡 Cost Aware", color:"#FF9900",
    pairs:[
      {left:"On-Demand Instances",right:"Pay per second, no commitment"},
      {left:"Reserved Instances",right:"1 or 3 year commitment for big discount"},
      {left:"Spot Instances",right:"Bid on unused capacity, up to 90% cheaper"},
      {left:"Savings Plans",right:"Flexible discount for usage commitment"},
      {left:"Dedicated Hosts",right:"Physical server fully dedicated to you"},
      {left:"EC2 Hibernate",right:"Pause instance and resume from exact state"},
    ]},
  { level:4, title:"Compute — Containers", badge:"🐳 Container Pro", color:"#FF9900",
    pairs:[
      {left:"AWS Fargate",right:"Serverless compute engine for containers"},
      {left:"Amazon EKS",right:"Managed Kubernetes control plane on AWS"},
      {left:"Lambda Layers",right:"Share code and dependencies across functions"},
      {left:"Amazon ECR",right:"Private Docker container image registry"},
      {left:"AWS App Runner",right:"Deploy containerized web apps with one click"},
      {left:"Provisioned Concurrency",right:"Keep functions warm to eliminate cold starts"},
    ]},
  { level:5, title:"Compute — Scaling & HA", badge:"📈 Scale Master", color:"#FF9900",
    pairs:[
      {left:"Launch Template",right:"EC2 configuration blueprint for Auto Scaling"},
      {left:"Target Tracking Policy",right:"Auto Scaling that maintains a metric at a value"},
      {left:"Step Scaling Policy",right:"Add/remove capacity in steps based on alarm"},
      {left:"Warm Pool",right:"Pre-initialized EC2 instances ready to scale fast"},
      {left:"Scheduled Scaling",right:"Scale capacity at a predictable time"},
      {left:"Multi-AZ Deployment",right:"Run instances across availability zones for HA"},
    ]},
  { level:6, title:"Compute — Advanced", badge:"⚡ Serverless Guru", color:"#FF9900",
    pairs:[
      {left:"AWS Step Functions",right:"Orchestrate Lambda functions as a visual workflow"},
      {left:"EventBridge",right:"Serverless event bus connecting AWS services"},
      {left:"Lambda@Edge",right:"Run Lambda functions at CloudFront edge locations"},
      {left:"AWS Batch",right:"Run large-scale batch computing jobs on managed infra"},
      {left:"Graviton Instances",right:"ARM-based EC2 with better price-performance ratio"},
      {left:"Spot Fleet",right:"Request multiple instance types to meet capacity target"},
    ]},
  { level:7, title:"Compute — Expert", badge:"🧠 Compute Expert", color:"#FF9900",
    pairs:[
      {left:"EC2 Placement Groups",right:"Control how instances are physically placed"},
      {left:"Cluster Placement Group",right:"Low-latency packing of instances in one AZ"},
      {left:"Spread Placement Group",right:"Instances on separate hardware to reduce failure blast"},
      {left:"Nitro System",right:"AWS hardware and hypervisor behind modern EC2"},
      {left:"AWS Outposts",right:"Run AWS infrastructure on-premises in your data center"},
      {left:"ECS Task Definition",right:"Blueprint describing containers in a workload"},
    ]},
  { level:8, title:"Storage — Services 101", badge:"📦 Storage Starter", color:"#3b82f6",
    pairs:[
      {left:"Amazon S3",right:"Object storage for any type of file"},
      {left:"Amazon EBS",right:"Block storage volumes attached to EC2"},
      {left:"Amazon EFS",right:"Elastic file system shared across EC2 instances"},
      {left:"AWS Glacier",right:"Low-cost long-term archival storage"},
      {left:"AWS Storage Gateway",right:"Hybrid storage bridging on-premises to AWS"},
      {left:"Amazon FSx",right:"Managed file systems (Windows, Lustre, NetApp)"},
    ]},
  { level:9, title:"Storage — S3 Tiers", badge:"🪣 S3 Specialist", color:"#3b82f6",
    pairs:[
      {left:"S3 Standard",right:"High durability, frequently accessed data"},
      {left:"S3 Intelligent-Tiering",right:"Automatically moves data between access tiers"},
      {left:"S3 Standard-IA",right:"Cheaper storage for infrequently accessed data"},
      {left:"S3 One Zone-IA",right:"Single AZ infrequent access, lowest IA cost"},
      {left:"S3 Glacier Instant",right:"Archive with millisecond retrieval"},
      {left:"S3 Glacier Deep Archive",right:"Cheapest storage, hours retrieval time"},
    ]},
  { level:10, title:"Storage — S3 Features", badge:"🔧 S3 Power User", color:"#3b82f6",
    pairs:[
      {left:"S3 Versioning",right:"Keep multiple versions of every object"},
      {left:"S3 Lifecycle Policy",right:"Auto-transition or expire objects over time"},
      {left:"S3 Replication",right:"Copy objects to another bucket or region"},
      {left:"S3 Transfer Acceleration",right:"Speed up uploads using CloudFront edge"},
      {left:"S3 Multipart Upload",right:"Upload large objects in parallel parts"},
      {left:"S3 Event Notification",right:"Trigger Lambda or SQS on bucket events"},
    ]},
  { level:11, title:"Storage — Block & File", badge:"💾 Block Expert", color:"#3b82f6",
    pairs:[
      {left:"EBS gp3",right:"General purpose SSD, baseline 3000 IOPS"},
      {left:"EBS io2 Block Express",right:"Highest performance SSD for critical databases"},
      {left:"EBS Snapshot",right:"Point-in-time backup of a volume stored in S3"},
      {left:"EBS Multi-Attach",right:"Attach one io1/io2 volume to multiple EC2s"},
      {left:"EFS Bursting Throughput",right:"EFS throughput scales with storage size"},
      {left:"FSx for Lustre",right:"High-performance parallel file system for HPC/ML"},
    ]},
  { level:12, title:"Storage — Migration", badge:"🚚 Migration Pro", color:"#3b82f6",
    pairs:[
      {left:"AWS Snowball Edge",right:"Physical device for petabyte-scale data transfer"},
      {left:"AWS Snowmobile",right:"Truck-sized container for exabyte migration"},
      {left:"AWS DataSync",right:"Automated data transfer from on-premises to AWS"},
      {left:"AWS Transfer Family",right:"SFTP/FTP/FTPS server backed by S3 or EFS"},
      {left:"S3 Batch Operations",right:"Run operations on billions of S3 objects at once"},
      {left:"AWS Backup",right:"Centralized backup across AWS services"},
    ]},
  { level:13, title:"Storage — Security", badge:"🛡️ Storage Guardian", color:"#3b82f6",
    pairs:[
      {left:"S3 Object Lock",right:"WORM storage — prevent deletion for set period"},
      {left:"S3 Access Points",right:"Custom endpoints with unique access policies"},
      {left:"S3 Requester Pays",right:"Data transfer cost charged to requester, not owner"},
      {left:"S3 Presigned URL",right:"Temporary URL granting access to private object"},
      {left:"S3 Select",right:"Query subset of data in CSV/JSON with SQL"},
      {left:"Amazon Macie",right:"ML service that discovers sensitive data in S3"},
    ]},
  { level:14, title:"Networking — Services 101", badge:"🌐 Net Starter", color:"#8b5cf6",
    pairs:[
      {left:"Amazon VPC",right:"Private cloud network you define and control"},
      {left:"Subnet",right:"Range of IP addresses within a VPC"},
      {left:"Internet Gateway",right:"Allows public internet traffic into a VPC"},
      {left:"Route Table",right:"Rules that determine where network traffic goes"},
      {left:"Security Group",right:"Stateful firewall for EC2 instances"},
      {left:"Network ACL",right:"Stateless firewall at the subnet level"},
    ]},
  { level:15, title:"Networking — Load Balancing", badge:"⚖️ Load Balancer Pro", color:"#8b5cf6",
    pairs:[
      {left:"Application Load Balancer",right:"Layer 7 balancer with path and host routing"},
      {left:"Network Load Balancer",right:"Layer 4, ultra-low latency, static IP"},
      {left:"Gateway Load Balancer",right:"Deploy and scale third-party network appliances"},
      {left:"Target Group",right:"Group of resources that a load balancer routes to"},
      {left:"ALB Listener Rule",right:"Route requests based on path, header, or host"},
      {left:"Connection Draining",right:"Finish in-flight requests before deregistering"},
    ]},
  { level:16, title:"Networking — DNS & Edge", badge:"🧭 DNS Expert", color:"#8b5cf6",
    pairs:[
      {left:"Route 53 Simple",right:"Single resource, no health checks"},
      {left:"Route 53 Weighted",right:"Split traffic by percentage across resources"},
      {left:"Route 53 Latency",right:"Route to region with lowest latency for user"},
      {left:"Route 53 Failover",right:"Active-passive failover with health checks"},
      {left:"Route 53 Geolocation",right:"Route based on user's geographic location"},
      {left:"CloudFront Origin Group",right:"Primary and fallback origin for HA delivery"},
    ]},
  { level:17, title:"Networking — VPC Advanced", badge:"🔗 VPC Architect", color:"#8b5cf6",
    pairs:[
      {left:"VPC Peering",right:"Private connection between two VPCs"},
      {left:"AWS Transit Gateway",right:"Hub connecting thousands of VPCs and on-premises"},
      {left:"VPC Endpoint (Gateway)",right:"Private S3/DynamoDB access without internet"},
      {left:"VPC Endpoint (Interface)",right:"Private link to AWS services via ENI"},
      {left:"NAT Gateway",right:"Allows private subnet to access internet outbound"},
      {left:"Bastion Host",right:"Jump box for SSH access into private subnets"},
    ]},
  { level:18, title:"Networking — Hybrid & WAN", badge:"🌍 Hybrid Architect", color:"#8b5cf6",
    pairs:[
      {left:"AWS Direct Connect",right:"Dedicated private fiber link from data center to AWS"},
      {left:"AWS Site-to-Site VPN",right:"Encrypted IPSec tunnel over public internet"},
      {left:"AWS Client VPN",right:"Managed VPN for remote users to access VPC"},
      {left:"Direct Connect Gateway",right:"Connect one Direct Connect to multiple VPCs"},
      {left:"AWS Global Accelerator",right:"Route users to nearest AWS endpoint via Anycast"},
      {left:"AWS PrivateLink",right:"Expose services privately across VPCs without peering"},
    ]},
  { level:19, title:"Networking — Expert", badge:"🧠 Net Expert", color:"#8b5cf6",
    pairs:[
      {left:"Egress-Only IGW",right:"IPv6 outbound traffic from private subnet"},
      {left:"VPC Flow Logs",right:"Capture IP traffic metadata in VPC, subnet, or ENI"},
      {left:"Reachability Analyzer",right:"Test network path between two AWS resources"},
      {left:"AWS Network Firewall",right:"Managed stateful firewall for VPC perimeter"},
      {left:"Traffic Mirroring",right:"Copy EC2 network traffic to monitoring appliance"},
      {left:"ENI",right:"Virtual network card attached to EC2"},
    ]},
  { level:20, title:"Database — Services 101", badge:"🗄️ DB Starter", color:"#10b981",
    pairs:[
      {left:"Amazon RDS",right:"Managed relational database (MySQL, Postgres, etc.)"},
      {left:"Amazon DynamoDB",right:"Serverless NoSQL key-value and document store"},
      {left:"Amazon Aurora",right:"MySQL/Postgres compatible, 5x faster managed DB"},
      {left:"Amazon Redshift",right:"Petabyte-scale columnar data warehouse"},
      {left:"Amazon ElastiCache",right:"In-memory cache with Redis or Memcached"},
      {left:"Amazon Neptune",right:"Managed graph database for connected data"},
    ]},
  { level:21, title:"Database — RDS Deep Dive", badge:"📋 RDS Specialist", color:"#10b981",
    pairs:[
      {left:"RDS Multi-AZ",right:"Synchronous standby replica for automatic failover"},
      {left:"RDS Read Replica",right:"Async copy of DB for read-heavy workloads"},
      {left:"RDS Proxy",right:"Connection pool between Lambda/apps and RDS"},
      {left:"RDS Automated Backups",right:"Daily snapshot + transaction logs for PITR"},
      {left:"RDS Parameter Group",right:"Configure DB engine settings like max connections"},
      {left:"RDS Performance Insights",right:"Visualize DB load and identify slow queries"},
    ]},
  { level:22, title:"Database — DynamoDB", badge:"⚡ NoSQL Pro", color:"#10b981",
    pairs:[
      {left:"DynamoDB Partition Key",right:"Primary attribute that determines data placement"},
      {left:"DynamoDB Sort Key",right:"Secondary attribute enabling range queries"},
      {left:"DynamoDB GSI",right:"Global Secondary Index for alternate query patterns"},
      {left:"DynamoDB LSI",right:"Local Secondary Index on same partition key"},
      {left:"DynamoDB Streams",right:"Ordered log of item-level changes for 24 hours"},
      {left:"DynamoDB DAX",right:"In-memory cache giving microsecond read latency"},
    ]},
  { level:23, title:"Database — Aurora & Caching", badge:"🚀 Aurora Expert", color:"#10b981",
    pairs:[
      {left:"Aurora Serverless v2",right:"Auto-scales DB capacity in fine-grained increments"},
      {left:"Aurora Global Database",right:"Single DB spanning multiple regions, <1s replication"},
      {left:"Aurora Parallel Query",right:"Pushes analytical queries to storage layer"},
      {left:"ElastiCache Redis Cluster",right:"Sharded Redis for horizontal scaling"},
      {left:"ElastiCache Memcached",right:"Simple multi-threaded caching, no persistence"},
      {left:"Write-Through Cache",right:"Update cache and DB simultaneously on write"},
    ]},
  { level:24, title:"Database — Analytics", badge:"📊 Analytics DB Pro", color:"#10b981",
    pairs:[
      {left:"Redshift Spectrum",right:"Query S3 data directly from Redshift without loading"},
      {left:"Redshift RA3 Nodes",right:"Separate compute and managed storage in Redshift"},
      {left:"Amazon Timestream",right:"Serverless time-series database for IoT/metrics"},
      {left:"Amazon QLDB",right:"Immutable cryptographically verifiable ledger DB"},
      {left:"Amazon Keyspaces",right:"Managed Apache Cassandra-compatible service"},
      {left:"AWS Glue",right:"Serverless ETL service to prepare data for analytics"},
    ]},
  { level:25, title:"Database — Expert Patterns", badge:"🧠 DB Architect", color:"#10b981",
    pairs:[
      {left:"CQRS Pattern",right:"Separate read and write models using different DBs"},
      {left:"Event Sourcing",right:"Store state changes as events, not current state"},
      {left:"Database Sharding",right:"Split data across multiple DB instances by key"},
      {left:"Connection Pooling",right:"Reuse connections to avoid DB connection limits"},
      {left:"Blue/Green Deployment",right:"Deploy new DB version alongside old for safe cutover"},
      {left:"DynamoDB Conditional Writes",right:"Only write if a condition on existing item is true"},
    ]},
  { level:26, title:"Security — Services 101", badge:"🔐 Sec Starter", color:"#e11d48",
    pairs:[
      {left:"AWS IAM",right:"Control who can do what across all AWS services"},
      {left:"AWS WAF",right:"Block malicious web traffic with rules"},
      {left:"AWS Shield",right:"Protect against DDoS attacks automatically"},
      {left:"Amazon GuardDuty",right:"Detect threats using ML and threat intelligence"},
      {left:"AWS KMS",right:"Create and manage encryption keys"},
      {left:"Amazon Cognito",right:"Add sign-up and sign-in to your apps"},
    ]},
  { level:27, title:"Security — IAM Deep Dive", badge:"🪪 IAM Expert", color:"#e11d48",
    pairs:[
      {left:"IAM Policy",right:"JSON document defining allowed or denied actions"},
      {left:"IAM Role",right:"Identity with permissions assumed by services or users"},
      {left:"Permission Boundary",right:"Max permissions a role or user can ever have"},
      {left:"Service Control Policy",right:"Org-level policy limiting all accounts in an OU"},
      {left:"Resource-Based Policy",right:"Policy attached to a resource like S3 or Lambda"},
      {left:"IAM Access Analyzer",right:"Find resources shared with external principals"},
    ]},
  { level:28, title:"Security — Encryption", badge:"🔑 Crypto Pro", color:"#e11d48",
    pairs:[
      {left:"AWS KMS CMK",right:"Customer managed key in KMS for encryption"},
      {left:"AWS KMS Data Key",right:"Symmetric key generated by KMS to encrypt data"},
      {left:"Envelope Encryption",right:"Encrypt data key with master key for scale"},
      {left:"AWS CloudHSM",right:"Dedicated hardware security module in the cloud"},
      {left:"AWS Secrets Manager",right:"Store, rotate, and retrieve secrets automatically"},
      {left:"AWS Parameter Store",right:"Lightweight config and secret storage in SSM"},
    ]},
  { level:29, title:"Security — Detection", badge:"🚨 Threat Hunter", color:"#e11d48",
    pairs:[
      {left:"Amazon GuardDuty",right:"Analyze VPC Flow Logs, DNS, CloudTrail for threats"},
      {left:"AWS Security Hub",right:"Aggregate security findings across AWS services"},
      {left:"Amazon Inspector",right:"Automated vulnerability scanning for EC2 and ECR"},
      {left:"AWS CloudTrail",right:"Log every API call made in your AWS account"},
      {left:"AWS Config",right:"Track configuration changes and compliance over time"},
      {left:"Amazon Macie",right:"Discover and protect sensitive data in S3 with ML"},
    ]},
  { level:30, title:"Security — Network Defense", badge:"🛡️ Net Defender", color:"#e11d48",
    pairs:[
      {left:"WAF Managed Rules",right:"Pre-built rule groups for OWASP Top 10"},
      {left:"AWS Shield Advanced",right:"24/7 DDoS response team + cost protection"},
      {left:"AWS Firewall Manager",right:"Centrally manage WAF and Shield across accounts"},
      {left:"AWS Network Firewall",right:"Stateful managed firewall inside your VPC"},
      {left:"AWS Certificate Manager",right:"Free SSL/TLS certs for AWS services"},
      {left:"VPC Security Group",right:"Stateful firewall — return traffic allowed automatically"},
    ]},
  { level:31, title:"Security — Expert & Compliance", badge:"🧠 Security Architect", color:"#e11d48",
    pairs:[
      {left:"AWS Organizations SCP",right:"Guardrails that restrict what accounts can do"},
      {left:"AWS Control Tower",right:"Set up a secure multi-account environment fast"},
      {left:"ABAC in IAM",right:"Use tags to control access instead of writing policies"},
      {left:"Cross-Account Role",right:"Assume a role in another AWS account securely"},
      {left:"AWS Audit Manager",right:"Continuously collect evidence for compliance audits"},
      {left:"Amazon Detective",right:"Investigate security issues with graph-based analysis"},
    ]},
];

// ─── ESCAPE ROOM DATA ──────────────────────────────────────────────────────────
const ESCAPE_ROOMS = [
  { id:1, topic:"compute", title:"Users Can't Reach the Website",
    story:"🔴 INCIDENT: HTTP 504 Gateway Timeout from ALB. EC2 instances show healthy in target group. Security group allows port 80 inbound from ALB.",
    clues:[
      {text:"ALB access log: 504 errors on all requests"},
      {text:"EC2 syslog: 'Address already in use: 8080'"},
      {text:"Netstat: port 8080 not listening on EC2"},
    ],
    choices:[
      {text:"Terminate and replace all EC2 instances",correct:false,feedback:"Fresh instances run the same broken config — the app will crash again immediately."},
      {text:"Delete and recreate the ALB",correct:false,feedback:"The ALB is working fine — the problem is the app process on EC2."},
      {text:"Fix health check port to match app port and restart the app process",correct:true,feedback:"✅ The app process crashed and stopped listening on 8080. ALB health check used port 80 — masking the crash. Fix both."},
      {text:"Add more EC2 instances to the target group",correct:false,feedback:"More broken instances won't fix the root cause — the app process is down on all of them."},
    ]},
  { id:2, topic:"compute", title:"Lambda SQS Deadlock",
    story:"🔴 INCIDENT: 85,000 messages stuck in SQS queue. Lambda processor consuming 0 messages. Queue depth growing by 2,000/minute.",
    clues:[
      {text:"Lambda reserved concurrency: 5"},
      {text:"SQS visibility timeout: 30 seconds"},
      {text:"Lambda average execution time: 45 seconds"},
    ],
    choices:[
      {text:"Delete and recreate the Lambda function",correct:false,feedback:"The code is fine. Configuration is the problem — recreating changes nothing."},
      {text:"Switch from SQS to SNS",correct:false,feedback:"SNS is push-based — you'd lose 85k queued messages and the problem would remain."},
      {text:"Raise concurrency limit + set visibility timeout > Lambda timeout",correct:true,feedback:"✅ Low concurrency throttled execution. Short visibility timeout caused a deadlock. Both must be fixed together."},
      {text:"Add more RAM to Lambda",correct:false,feedback:"RAM affects speed, not concurrency or visibility timeouts. Deadlock persists."},
    ]},
  { id:3, topic:"compute", title:"The Frozen Container",
    story:"🐳 ECS CRASH LOOP: Fargate tasks keep stopping every 3 minutes with exit code 137. Service stuck at 0 running tasks.",
    clues:[
      {text:"ECS stopped task reason: 'Essential container exited with code 137'"},
      {text:"Container Insights: MemoryUtilization hits 100% then drops to 0 before each exit"},
      {text:"Task definition memory limit: 512 MB — app recently updated with new ML model (800 MB)"},
    ],
    choices:[
      {text:"Force a new deployment to restart the tasks",correct:false,feedback:"Fresh tasks run the same image with the same memory limit — they'll OOMKill again within minutes."},
      {text:"Increase memory in the task definition and redeploy",correct:true,feedback:"✅ Exit code 137 = OOMKilled. The new ML model needs more RAM than the task limit allows. Raise the limit and redeploy."},
      {text:"Switch from Fargate to EC2 launch type",correct:false,feedback:"Same container, same memory limit — the crash would move to EC2, not go away."},
      {text:"Add an EFS volume to offload memory",correct:false,feedback:"EFS is file storage, not RAM. Memory pressure causes OOMKill — disk space doesn't help."},
    ]},
  { id:4, topic:"storage", title:"The Disappearing Files",
    story:"🗑️ DATA LOSS: Users report files uploaded yesterday are gone. S3 bucket shows objects don't exist. No one admits to deleting anything.",
    clues:[
      {text:"S3 bucket has versioning DISABLED"},
      {text:"CloudTrail: DeleteObject API calls at 2:13 AM from an automated deploy script"},
      {text:"Deploy script uses 'aws s3 sync --delete' to sync build artifacts"},
    ],
    choices:[
      {text:"Restore from the previous day's S3 backup",correct:false,feedback:"Backups help but don't fix the root cause — the deploy script will delete files again on the next deploy."},
      {text:"Enable S3 Versioning + add MFA Delete + fix the deploy script sync path",correct:true,feedback:"✅ Versioning preserves deleted objects. MFA Delete prevents accidental bulk deletions. The sync path was too broad — it deleted user uploads, not just build artifacts."},
      {text:"Make the S3 bucket public read-only",correct:false,feedback:"Read-only doesn't protect against deletion by the authenticated deploy role. IAM permissions are the real control."},
      {text:"Move user uploads to the same prefix as build artifacts",correct:false,feedback:"That would make it worse — the sync --delete would also delete uploads even faster."},
    ]},
  { id:5, topic:"networking", title:"The $47,000 Bill",
    story:"💸 COST EXPLOSION: AWS bill jumped from $3,200 to $47,000 this month. The spike is entirely in data transfer costs. No new features were deployed.",
    clues:[
      {text:"Cost Explorer: $43,800 in EC2 Data Transfer Out — cross-region"},
      {text:"Architecture: App servers in us-east-1 query a read replica in eu-west-1 for every request"},
      {text:"Read replica was added last month for 'disaster recovery' but is being used for live reads"},
    ],
    choices:[
      {text:"Delete the eu-west-1 read replica immediately",correct:false,feedback:"Deleting the replica removes DR capability. The real fix is routing reads to the same-region replica."},
      {text:"Move read traffic to a same-region read replica + use cross-region replica only for DR",correct:true,feedback:"✅ Cross-region data transfer is expensive. Reading from eu-west-1 for every us-east-1 request generated massive egress. Same-region reads are free within the same AZ."},
      {text:"Enable S3 Transfer Acceleration",correct:false,feedback:"S3 Transfer Acceleration is for S3 uploads — it has nothing to do with RDS cross-region data transfer costs."},
      {text:"Switch to DynamoDB Global Tables",correct:false,feedback:"Migrating databases is a months-long project. The immediate fix is routing reads to the correct region."},
    ]},
  { id:6, topic:"security", title:"The 3 AM Crypto Miner",
    story:"🚨 SECURITY BREACH: AWS bill jumped $12,000 in 48 hours. EC2 CPU usage at 100% on instances you don't recognize. Your team didn't launch them.",
    clues:[
      {text:"GuardDuty finding: CryptoCurrency:EC2/BitcoinTool — 3 instances in us-west-2"},
      {text:"CloudTrail: RunInstances API calls from IAM user 'deploy-bot' at 3:14 AM"},
      {text:"deploy-bot access key was committed to a public GitHub repo 3 days ago"},
    ],
    choices:[
      {text:"Terminate the rogue instances and ignore the root cause",correct:false,feedback:"The compromised key is still active — the attacker will spin up new instances within minutes."},
      {text:"Rotate the deploy-bot access key",correct:false,feedback:"Rotation alone isn't enough — the old key must be deleted immediately, not just rotated."},
      {text:"Immediately delete the compromised key + terminate rogue instances + audit all actions taken with the key + enable GuardDuty alerts",correct:true,feedback:"✅ Compromised credentials require immediate revocation (not rotation), full audit of what was done, and cleanup of all resources created. GuardDuty should have been enabled before this happened."},
      {text:"Make the GitHub repo private",correct:false,feedback:"Making the repo private doesn't revoke the already-exposed key. The attacker already has it."},
    ]},
];

// ─── TROUBLESHOOT DATA ─────────────────────────────────────────────────────────
const TROUBLESHOOT_CASES = [
  { id:1, title:"Lambda Timing Out at Peak Traffic",
    symptoms:["Lambda p50 duration: 200ms (normal)","Lambda p99 duration: 30,000ms (timeout)","Only happens during peak traffic hours"],
    logs:["CloudWatch: 'Task timed out after 30.00 seconds'","X-Ray trace: 28s spent waiting on RDS connection","RDS CloudWatch: DatabaseConnections maxed at 100"],
    rootCause:"Each Lambda invocation opens a new DB connection. Under high concurrency all 100 RDS connections are exhausted, causing new invocations to wait indefinitely for a slot.",
    steps:[
      {id:"a",text:"Increase Lambda timeout to 5 minutes",correct:false},
      {id:"b",text:"Check RDS DatabaseConnections CloudWatch metric",correct:true},
      {id:"c",text:"Add RDS Proxy between Lambda and RDS to pool connections",correct:true},
      {id:"d",text:"Switch Lambda to DynamoDB",correct:false},
      {id:"e",text:"Set Lambda reserved concurrency to prevent connection exhaustion until Proxy is live",correct:true},
    ],
    explanation:"Lambda + RDS connection exhaustion is a classic scaling trap. RDS Proxy pools and reuses connections across thousands of concurrent functions, eliminating the bottleneck."},
  { id:2, title:"ECS Containers Keep Restarting",
    symptoms:["ECS service tasks in RUNNING → STOPPED loop every 2 minutes","Desired count: 3, Running count oscillates 0–3","Happens even with zero incoming traffic"],
    logs:["ECS task stopped reason: 'Essential container exited with code 137'","Container logs: 'Killed'","Container Insights: MemoryUtilization hits 100% before each exit"],
    rootCause:"Exit code 137 = OOMKilled. The container's memory limit in the task definition is too low for the application's actual memory usage.",
    steps:[
      {id:"a",text:"Force a new deployment with force-new-deployment flag",correct:false},
      {id:"b",text:"Check Container Insights for memory utilization trends",correct:true},
      {id:"c",text:"Identify exit code 137 = OOMKilled in stopped task reason",correct:true},
      {id:"d",text:"Switch to EC2 launch type",correct:false},
      {id:"e",text:"Increase memory limit in ECS task definition and redeploy",correct:true},
    ],
    explanation:"OOMKill (exit code 137) is always a memory limit problem. Container Insights makes it obvious — memory hits 100% then the kernel kills the process. Fix: raise the task definition memory limit."},
  { id:3, title:"S3 Static Site Returns 403",
    symptoms:["S3 bucket hosts a static website","All URLs return 403 Forbidden","Worked fine yesterday — only change was enabling 'Block Public Access'"],
    logs:["S3 access log: 403 AccessDenied on all GET requests","Bucket policy: allows s3:GetObject for Principal: *","Block Public Access settings: all four checkboxes now enabled"],
    rootCause:"Block Public Access overrides bucket policies. Even with a bucket policy allowing public reads, enabling Block Public Access at the bucket or account level blocks all public access regardless.",
    steps:[
      {id:"a",text:"Delete and re-upload all S3 objects",correct:false},
      {id:"b",text:"Identify that Block Public Access was recently enabled",correct:true},
      {id:"c",text:"Disable 'Block public access to buckets and objects granted through new public bucket or access point policies'",correct:true},
      {id:"d",text:"Add a CloudFront distribution",correct:false},
      {id:"e",text:"Verify bucket policy still grants s3:GetObject to Principal: *",correct:true},
    ],
    explanation:"Block Public Access is a safety net that overrides bucket policies. For intentionally public static sites, the specific Block Public Access settings that block public bucket policies must be disabled."},
];

// ─── SCENARIO QUIZ DATA ────────────────────────────────────────────────────────
const SCENARIO_QUESTIONS = [
  { q:"A startup needs to run a web app with unpredictable traffic — zero at night, spikes to 50k req/min during flash sales. Minimize cost and operational overhead. Which architecture?",
    options:["EC2 Auto Scaling + RDS","Lambda + API Gateway + DynamoDB","ECS Fargate + Aurora","EC2 Reserved + ElastiCache"],
    correct:1, explanation:"Lambda + API Gateway + DynamoDB scales to zero (no cost at night) and handles massive spikes without pre-provisioning. EC2-based solutions have minimum costs even at zero traffic."},
  { q:"Your RDS MySQL database is getting 80% reads, 20% writes. Performance is degrading at peak. What is the most cost-effective fix?",
    options:["Upgrade to a larger RDS instance class","Add RDS Read Replicas and route read traffic to them","Migrate to DynamoDB","Enable Multi-AZ deployment"],
    correct:1, explanation:"Read Replicas offload read traffic from the primary instance. Multi-AZ is for HA/failover, not read scaling. Upgrading the instance is expensive and doesn't address the read/write split."},
  { q:"A financial app must store transaction records that can never be modified or deleted, and must be cryptographically verifiable for audits. Which service?",
    options:["Amazon S3 with Object Lock","Amazon RDS with automated backups","Amazon QLDB","DynamoDB with Streams"],
    correct:2, explanation:"QLDB (Quantum Ledger Database) is an immutable, cryptographically verifiable ledger. S3 Object Lock prevents deletion but isn't a database. RDS and DynamoDB allow record modification."},
  { q:"Your Lambda function processes S3 uploads. During a batch upload of 10,000 files, Lambda hits throttling errors. What is the root cause and fix?",
    options:["Lambda timeout is too short — increase to 15 minutes","Lambda is hitting the account-level concurrency limit — request a limit increase and implement SQS as a buffer","S3 is rate-limiting the uploads — use multipart upload","Lambda memory is insufficient — increase to 10 GB"],
    correct:1, explanation:"10,000 simultaneous S3 events trigger 10,000 concurrent Lambda invocations, hitting the account concurrency limit. SQS buffers the events and Lambda processes them at a controlled rate."},
  { q:"An application in us-east-1 needs to serve users in Asia with <50ms latency. The app uses EC2 + RDS. What is the most effective solution?",
    options:["Enable CloudFront for the entire application","Deploy EC2 + RDS in ap-southeast-1 with Route 53 latency routing","Use AWS Global Accelerator with the existing us-east-1 setup","Increase EC2 instance size for faster processing"],
    correct:1, explanation:"Physical proximity is the only way to achieve <50ms latency for dynamic content. CloudFront caches static content but can't cache dynamic API responses. Global Accelerator improves routing but doesn't reduce the speed-of-light distance."},
  { q:"You need to migrate 80 TB of on-premises data to S3. Your internet connection is 1 Gbps. Transfer time over internet would be ~8 days. What is the fastest approach?",
    options:["Use S3 Transfer Acceleration","Use AWS DataSync over Direct Connect","Order an AWS Snowball Edge device","Use AWS Storage Gateway"],
    correct:2, explanation:"Snowball Edge ships a physical device to your location. You copy data locally (much faster than internet), ship it back, and AWS loads it to S3. For 80 TB, this is typically 1-2 weeks total vs. 8+ days over even a 1 Gbps link with overhead."},
];

// ─── RPG MISSIONS ──────────────────────────────────────────────────────────────
const RPG_MISSIONS = [
  { level:1, title:"The Startup Launch", badge:"🚀 Cloud Pioneer", xp:100,
    description:"A startup needs a highly available web app. Deploy EC2 instances across multiple AZs behind a load balancer with auto scaling. The database must survive an AZ failure.",
    services:["EC2","ALB","Auto Scaling","RDS Multi-AZ"],
    quiz:{ q:"Which RDS feature automatically fails over to a standby in another AZ?", options:["Read Replica","Multi-AZ","Aurora Serverless","RDS Proxy"], correct:1 }},
  { level:2, title:"The Serverless API", badge:"⚡ Lambda Legend", xp:150,
    description:"Build an API that handles spiky traffic — 0 requests at night, 100k/min during flash sales. Zero server management. Pay only for actual usage.",
    services:["Lambda","API Gateway","DynamoDB"],
    quiz:{ q:"What triggers a Lambda function from an HTTP request?", options:["EC2","API Gateway","CloudWatch","S3 alone"], correct:1 }},
  { level:3, title:"The Data Lake", badge:"🏊 Data Lake Architect", xp:200,
    description:"A company needs to store petabytes of raw data, run SQL analytics, and visualize results. Data arrives from IoT devices, web apps, and databases.",
    services:["S3","AWS Glue","Athena","QuickSight"],
    quiz:{ q:"Which service lets you run SQL queries directly on S3 data without loading it into a database?", options:["Redshift","Athena","RDS","DynamoDB"], correct:1 }},
  { level:4, title:"The Zero-Trust Network", badge:"🔐 Security Architect", xp:250,
    description:"Redesign a legacy network where everything was in public subnets. Move workloads to private subnets. Allow only necessary outbound internet access. Block all direct SSH.",
    services:["VPC","Private Subnets","NAT Gateway","Systems Manager"],
    quiz:{ q:"How do you SSH into an EC2 instance in a private subnet without a bastion host?", options:["Direct SSH over internet","AWS Systems Manager Session Manager","VPN only","You can't"], correct:1 }},
  { level:5, title:"The Global CDN", badge:"🌍 Edge Master", xp:300,
    description:"A media company serves video content globally. Origin is S3 in us-east-1. Users in Asia report 8-second load times. Reduce to under 500ms worldwide.",
    services:["CloudFront","S3","Route 53","ACM"],
    quiz:{ q:"What CloudFront feature serves cached content from the nearest edge location to the user?", options:["Origin Shield","Edge Location Caching","Transfer Acceleration","Global Accelerator"], correct:1 }},
];

// ─── MATCH IT GAME ─────────────────────────────────────────────────────────────
function MatchRound({ levelData, onLevelComplete }) {
  const shuffledRight = useMemo(() => {
    const arr = levelData.pairs.map((p, i) => ({ ...p, originalIdx: i }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [levelData.level]);

  const [selLeft, setSelLeft] = useState(null);
  const [selRight, setSelRight] = useState(null);
  const [matched, setMatched] = useState(new Set());
  const [wrongFlash, setWrongFlash] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const handleLeft = (idx) => {
    if (matched.has(idx) || done) return;
    setSelLeft(idx); setWrongFlash(false); setSelRight(null);
  };
  const handleRight = (pos) => {
    if (done) return;
    const item = shuffledRight[pos];
    if (matched.has(item.originalIdx)) return;
    if (selLeft === null) { setSelRight(pos); return; }
    if (selLeft === item.originalIdx) {
      const nm = new Set([...matched, selLeft]);
      const pts = score + 50;
      setMatched(nm); setScore(pts); setSelLeft(null); setSelRight(null);
      if (nm.size === levelData.pairs.length) {
        setDone(true);
        setTimeout(() => onLevelComplete(pts), 900);
      }
    } else {
      setWrongFlash(true); setSelRight(pos);
      setTimeout(() => { setWrongFlash(false); setSelLeft(null); setSelRight(null); }, 700);
    }
  };

  return (
    <div>
      <p style={{ color: C.muted, fontSize: 11, fontFamily: FONT_CODE, margin: "0 0 14px" }}>
        Click a service on the left → then its definition on the right
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {levelData.pairs.map((pair, origIdx) => {
            const isM = matched.has(origIdx), isSel = selLeft === origIdx;
            return (
              <div key={origIdx} onClick={() => handleLeft(origIdx)} style={{
                padding: "10px 12px", borderRadius: 8,
                border: `2px solid ${isM ? C.green : isSel ? levelData.color : C.border}`,
                background: isM ? `${C.green}18` : isSel ? `${levelData.color}18` : C.bg,
                color: isM ? C.green : isSel ? levelData.color : C.text,
                cursor: isM ? "default" : "pointer",
                fontFamily: FONT_CODE, fontSize: 11,
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
            const isM = matched.has(item.originalIdx), isSel = selRight === pos, isWrong = wrongFlash && isSel;
            return (
              <div key={item.originalIdx} onClick={() => handleRight(pos)} style={{
                padding: "10px 12px", borderRadius: 8,
                border: `2px solid ${isM ? C.green : isWrong ? C.red : isSel ? C.purple : C.border}`,
                background: isM ? `${C.green}18` : isWrong ? `${C.red}18` : isSel ? `${C.purple}18` : C.bg,
                color: isM ? C.green : isWrong ? C.red : C.text,
                cursor: isM ? "default" : "pointer",
                fontFamily: "monospace", fontSize: 10, lineHeight: 1.4,
                transition: "all 0.15s", userSelect: "none",
              }}>
                {isM ? "✅ " : ""}{item.right}
              </div>
            );
          })}
        </div>
      </div>
      {wrongFlash && <div style={{ textAlign: "center", color: C.red, marginTop: 10, fontFamily: FONT_CODE, fontSize: 11 }}>❌ Not a match — try again!</div>}
      {done && <div style={{ textAlign: "center", color: C.green, marginTop: 10, fontFamily: FONT_CODE, fontSize: 12 }}>🎉 Level complete! +{score} pts</div>}
      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
        <Chip color={levelData.color}>{matched.size}/{levelData.pairs.length} matched</Chip>
        <Chip color={C.green}>Score: {score}</Chip>
      </div>
    </div>
  );
}

function MatchingGame({ onComplete }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [phase, setPhase] = useState("play");
  const level = MATCH_LEVELS[levelIdx];

  const handleLevelComplete = (pts) => {
    const newTotal = totalScore + pts;
    setTotalScore(newTotal);
    if (levelIdx + 1 >= MATCH_LEVELS.length) { setPhase("done"); setTimeout(() => onComplete(newTotal), 400); }
    else setPhase("levelup");
  };
  const nextLevel = () => { setLevelIdx(i => i + 1); setPhase("play"); };

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {MATCH_LEVELS.map((l, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < levelIdx ? C.green : i === levelIdx ? l.color : C.border, transition: "background 0.4s" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ color: level.color, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 2 }}>LEVEL {level.level} / {MATCH_LEVELS.length}</div>
          <div style={{ color: C.text, fontFamily: FONT_CODE, fontSize: 14 }}>{level.title}</div>
        </div>
        <Chip color={C.accent}>Total: {totalScore}</Chip>
      </div>
      {phase === "play" && <MatchRound key={levelIdx} levelData={level} onLevelComplete={handleLevelComplete} />}
      {phase === "levelup" && (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏅</div>
          <div style={{ color: level.color, fontFamily: FONT_CODE, fontSize: 18, marginBottom: 6 }}>{level.badge}</div>
          <div style={{ color: C.muted, fontFamily: "monospace", fontSize: 12, marginBottom: 24 }}>
            Level {level.level} cleared! Next: {MATCH_LEVELS[levelIdx + 1]?.title}
          </div>
          <Btn onClick={nextLevel} color={MATCH_LEVELS[levelIdx + 1]?.color || C.accent}>Next Level →</Btn>
        </div>
      )}
    </div>
  );
}

// ─── ESCAPE ROOM GAME ──────────────────────────────────────────────────────────
function EscapeRoomGame({ onComplete }) {
  const [roomIdx, setRoomIdx] = useState(0);
  const [cluesFound, setCluesFound] = useState([false, false, false]);
  const [chosen, setChosen] = useState(null);
  const [phase, setPhase] = useState("investigate"); // investigate | solve | result
  const [timer, setTimer] = useState(90);
  const [score, setScore] = useState(0);
  const room = ESCAPE_ROOMS[roomIdx];

  useEffect(() => {
    if (phase !== "investigate") return;
    const t = setInterval(() => setTimer(p => {
      if (p <= 1) { clearInterval(t); setPhase("solve"); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [phase, roomIdx]);

  const findClue = (i) => {
    if (cluesFound[i]) return;
    const next = [...cluesFound]; next[i] = true; setCluesFound(next);
    if (next.every(Boolean)) setTimeout(() => setPhase("solve"), 600);
  };

  const choose = (idx) => {
    if (chosen !== null) return;
    setChosen(idx);
    if (room.choices[idx].correct) setScore(s => s + Math.max(50, timer * 2));
    setPhase("result");
  };

  const nextRoom = () => {
    if (roomIdx + 1 >= ESCAPE_ROOMS.length) { onComplete(score); return; }
    setRoomIdx(r => r + 1);
    setCluesFound([false, false, false]);
    setChosen(null);
    setPhase("investigate");
    setTimer(90);
  };

  const timerColor = timer > 60 ? C.green : timer > 30 ? C.accent : C.red;

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {ESCAPE_ROOMS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < roomIdx ? C.green : i === roomIdx ? C.red : C.border }} />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ color: C.red, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 2 }}>INCIDENT {roomIdx + 1} / {ESCAPE_ROOMS.length}</div>
          <div style={{ color: C.text, fontFamily: FONT_CODE, fontSize: 14 }}>{room.title}</div>
        </div>
        {phase === "investigate" && (
          <div style={{ fontFamily: FONT_CODE, fontSize: 20, color: timerColor, textShadow: `0 0 12px ${timerColor}70` }}>
            {String(Math.floor(timer / 60)).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}
          </div>
        )}
        <Chip color={C.accent}>Score: {score}</Chip>
      </div>

      <Panel style={{ marginBottom: 14, borderColor: `${C.red}40` }}>
        <div style={{ color: C.red, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>🚨 INCIDENT REPORT</div>
        <p style={{ color: C.text, margin: 0, fontFamily: "monospace", fontSize: 12, lineHeight: 1.7 }}>{room.story}</p>
      </Panel>

      {phase === "investigate" && (
        <div>
          <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>
            INVESTIGATE CLUES — click each to reveal ({cluesFound.filter(Boolean).length}/{room.clues.length} found)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {room.clues.map((clue, i) => (
              <div key={i} onClick={() => findClue(i)} style={{
                padding: "12px 16px", borderRadius: 8,
                border: `1px solid ${cluesFound[i] ? C.blue : C.border}`,
                background: cluesFound[i] ? `${C.blue}12` : C.raised,
                cursor: cluesFound[i] ? "default" : "pointer",
                transition: "all 0.2s",
              }}>
                {cluesFound[i] ? (
                  <span style={{ color: C.blue, fontFamily: "monospace", fontSize: 12 }}>🔍 {clue.text}</span>
                ) : (
                  <span style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 11 }}>[ CLUE {i + 1} — click to investigate ]</span>
                )}
              </div>
            ))}
          </div>
          {cluesFound.every(Boolean) && (
            <div style={{ marginTop: 14 }}>
              <Btn onClick={() => setPhase("solve")} color={C.accent}>Solve the Incident →</Btn>
            </div>
          )}
        </div>
      )}

      {phase === "solve" && chosen === null && (
        <div>
          <div style={{ color: C.accent, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>SELECT THE CORRECT REMEDIATION:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {room.choices.map((choice, i) => (
              <div key={i} onClick={() => choose(i)} style={{
                padding: "12px 16px", borderRadius: 8,
                border: `1px solid ${C.border}`, background: C.raised,
                cursor: "pointer", color: C.text, fontFamily: "monospace", fontSize: 12,
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.accent; (e.currentTarget as HTMLElement).style.background = `${C.accent}0d`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.background = C.raised; }}
              >
                {String.fromCharCode(65 + i)}. {choice.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "result" && chosen !== null && (
        <div>
          <Panel style={{
            marginBottom: 14,
            borderColor: room.choices[chosen].correct ? `${C.green}60` : `${C.red}60`,
            background: room.choices[chosen].correct ? `${C.green}08` : `${C.red}08`,
          }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>
              {room.choices[chosen].correct ? "✅ Incident Resolved!" : "❌ Wrong Remediation"}
            </div>
            <p style={{ color: C.text, margin: 0, fontFamily: "monospace", fontSize: 12, lineHeight: 1.7 }}>
              {room.choices[chosen].feedback}
            </p>
          </Panel>
          <Btn onClick={nextRoom} color={C.accent}>
            {roomIdx + 1 >= ESCAPE_ROOMS.length ? "Complete Escape Room 🏁" : "Next Incident →"}
          </Btn>
        </div>
      )}
    </div>
  );
}

// ─── TROUBLESHOOT GAME ─────────────────────────────────────────────────────────
function TroubleshootGame({ onComplete }) {
  const [caseIdx, setCaseIdx] = useState(0);
  const [selected, setSelected] = useState(new Set());
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const tc = TROUBLESHOOT_CASES[caseIdx];

  const toggle = (id) => {
    if (checked) return;
    const ns = new Set(selected);
    ns.has(id) ? ns.delete(id) : ns.add(id);
    setSelected(ns);
  };

  const check = () => {
    const correctIds = tc.steps.filter(s => s.correct).map(s => s.id);
    const correctSelected = correctIds.filter(id => selected.has(id)).length;
    const wrongSelected = [...selected].filter(id => !correctIds.includes(id)).length;
    const pts = Math.max(0, (correctSelected - wrongSelected) * 50);
    setScore(s => s + pts);
    setChecked(true);
  };

  const next = () => {
    if (caseIdx + 1 >= TROUBLESHOOT_CASES.length) { onComplete(score); return; }
    setCaseIdx(c => c + 1);
    setSelected(new Set());
    setChecked(false);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {TROUBLESHOOT_CASES.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < caseIdx ? C.green : i === caseIdx ? "#e11d48" : C.border }} />
        ))}
      </div>

      <div style={{ color: "#e11d48", fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>
        CASE {caseIdx + 1} / {TROUBLESHOOT_CASES.length}
      </div>
      <div style={{ color: C.text, fontFamily: FONT_CODE, fontSize: 14, marginBottom: 14 }}>{tc.title}</div>

      <Panel style={{ marginBottom: 10, borderColor: `${C.red}30` }}>
        <div style={{ color: C.red, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>SYMPTOMS</div>
        {tc.symptoms.map((s, i) => <div key={i} style={{ color: C.text, fontFamily: "monospace", fontSize: 11, marginBottom: 4 }}>• {s}</div>)}
      </Panel>

      <Panel style={{ marginBottom: 14, borderColor: `${C.blue}30` }}>
        <div style={{ color: C.blue, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>LOG EVIDENCE</div>
        {tc.logs.map((l, i) => <div key={i} style={{ color: C.muted, fontFamily: "monospace", fontSize: 10, marginBottom: 4 }}>$ {l}</div>)}
      </Panel>

      <div style={{ color: C.accent, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>
        SELECT ALL CORRECT TROUBLESHOOTING STEPS:
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
        {tc.steps.map(step => {
          const isSel = selected.has(step.id);
          const isCorrect = checked && step.correct;
          const isWrong = checked && isSel && !step.correct;
          const isMissed = checked && !isSel && step.correct;
          return (
            <div key={step.id} onClick={() => toggle(step.id)} style={{
              padding: "10px 14px", borderRadius: 8,
              border: `1px solid ${isCorrect ? C.green : isWrong ? C.red : isMissed ? `${C.green}50` : isSel ? C.accent : C.border}`,
              background: isCorrect ? `${C.green}12` : isWrong ? `${C.red}12` : isMissed ? `${C.green}06` : isSel ? `${C.accent}0d` : C.raised,
              color: isCorrect ? C.green : isWrong ? C.red : isMissed ? `${C.green}80` : C.text,
              cursor: checked ? "default" : "pointer",
              fontFamily: "monospace", fontSize: 11, transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{ width: 16, height: 16, borderRadius: 3, border: `1px solid ${isSel ? C.accent : C.border}`, background: isSel ? `${C.accent}30` : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
                {isSel ? "✓" : ""}
              </div>
              {step.text}
              {isCorrect && <span style={{ marginLeft: "auto" }}>✅</span>}
              {isWrong && <span style={{ marginLeft: "auto" }}>❌</span>}
              {isMissed && <span style={{ marginLeft: "auto", fontSize: 10, color: `${C.green}80` }}>missed</span>}
            </div>
          );
        })}
      </div>

      {!checked && <Btn onClick={check} disabled={selected.size === 0}>Check Diagnosis</Btn>}
      {checked && (
        <div>
          <Panel style={{ marginBottom: 14, borderColor: `${C.blue}40`, background: `${C.blue}08` }}>
            <div style={{ color: C.blue, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>ROOT CAUSE</div>
            <p style={{ color: C.text, margin: 0, fontFamily: "monospace", fontSize: 12, lineHeight: 1.7 }}>{tc.rootCause}</p>
            <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginTop: 10, marginBottom: 6 }}>EXPLANATION</div>
            <p style={{ color: C.muted, margin: 0, fontFamily: "monospace", fontSize: 11, lineHeight: 1.6 }}>{tc.explanation}</p>
          </Panel>
          <Btn onClick={next} color={C.accent}>
            {caseIdx + 1 >= TROUBLESHOOT_CASES.length ? "Complete Troubleshoot 🏁" : "Next Case →"}
          </Btn>
        </div>
      )}
    </div>
  );
}

// ─── SCENARIO QUIZ ─────────────────────────────────────────────────────────────
function ScenarioQuiz({ onComplete }) {
  const [qIdx, setQIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState(0);
  const q = SCENARIO_QUESTIONS[qIdx];

  const pick = (i) => {
    if (chosen !== null) return;
    setChosen(i);
    if (i === q.correct) setScore(s => s + 100);
  };

  const next = () => {
    if (qIdx + 1 >= SCENARIO_QUESTIONS.length) { onComplete(score); return; }
    setQIdx(i => i + 1);
    setChosen(null);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {SCENARIO_QUESTIONS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < qIdx ? C.green : i === qIdx ? C.accent : C.border }} />
        ))}
      </div>
      <div style={{ color: C.accent, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>
        SCENARIO {qIdx + 1} / {SCENARIO_QUESTIONS.length}
      </div>
      <Panel style={{ marginBottom: 14, borderColor: `${C.accent}30` }}>
        <p style={{ color: C.text, margin: 0, fontFamily: "monospace", fontSize: 13, lineHeight: 1.7 }}>{q.q}</p>
      </Panel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {q.options.map((opt, i) => {
          const isC = i === q.correct, isCh = i === chosen;
          let border = C.border, bg = C.raised, col = C.text;
          if (chosen !== null) {
            if (isC) { border = C.green; bg = `${C.green}15`; col = C.green; }
            else if (isCh) { border = C.red; bg = `${C.red}15`; col = C.red; }
          }
          return (
            <div key={i} onClick={() => pick(i)} style={{
              padding: "12px 16px", borderRadius: 8,
              border: `1px solid ${border}`, background: bg, color: col,
              cursor: chosen !== null ? "default" : "pointer",
              fontFamily: "monospace", fontSize: 12, transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: chosen !== null && isC ? C.green : chosen !== null && isCh ? C.red : C.dim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", flexShrink: 0 }}>
                {String.fromCharCode(65 + i)}
              </div>
              {opt}
            </div>
          );
        })}
      </div>
      {chosen !== null && (
        <Panel style={{ marginBottom: 14, borderColor: `${C.blue}40`, background: `${C.blue}08` }}>
          <div style={{ color: C.blue, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>💡 EXPLANATION</div>
          <p style={{ color: C.text, margin: 0, fontFamily: "monospace", fontSize: 12, lineHeight: 1.6 }}>{q.explanation}</p>
        </Panel>
      )}
      {chosen !== null && <Btn onClick={next} color={C.blue}>{qIdx + 1 >= SCENARIO_QUESTIONS.length ? "Finish Quiz 🏁" : "Next Question →"}</Btn>}
    </div>
  );
}

// ─── RPG CAMPAIGN ──────────────────────────────────────────────────────────────
function RPGCampaign({ onComplete }) {
  const [missionIdx, setMissionIdx] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [phase, setPhase] = useState("briefing");
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
      <Panel style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: C.accent, fontFamily: FONT_CODE, fontSize: 12, fontWeight: "bold" }}>🧙 AWS Architect</div>
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              {badges.map((b, i) => <Chip key={i} color={C.purple}>{b}</Chip>)}
              {badges.length === 0 && <span style={{ color: C.muted, fontSize: 11, fontFamily: "monospace" }}>No badges yet...</span>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: C.green, fontFamily: FONT_CODE, fontSize: 22, fontWeight: "bold" }}>{totalXP}</div>
            <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 9 }}>XP</div>
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <XPBar xp={totalXP} maxXp={1000} color={C.green} />
        </div>
      </Panel>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {RPG_MISSIONS.map((m, i) => (
          <div key={i} style={{
            flex: 1, padding: "8px 10px", borderRadius: 8,
            border: `1px solid ${i === missionIdx ? C.accent : i < missionIdx ? C.green : C.border}`,
            background: i === missionIdx ? `${C.accent}15` : "transparent",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 16 }}>{i < missionIdx ? "✅" : i === missionIdx ? "⚔️" : "🔒"}</div>
            <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 9, marginTop: 3 }}>LVL {m.level}</div>
          </div>
        ))}
      </div>

      {phase === "briefing" && (
        <Panel style={{ borderColor: `${C.accent}40` }}>
          <div style={{ color: C.accent, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>
            ⚔️ MISSION {mission.level}: {mission.title.toUpperCase()}
          </div>
          <p style={{ color: C.text, margin: "0 0 14px", fontSize: 12, lineHeight: 1.7, fontFamily: "monospace" }}>{mission.description}</p>
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 10, marginBottom: 8 }}>REQUIRED SERVICES:</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {mission.services.map(s => <Chip key={s} color={C.blue}>{s}</Chip>)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Btn onClick={() => setPhase("quiz")}>Accept Mission ⚔️</Btn>
            <Chip color={C.green}>+{mission.xp} XP reward</Chip>
          </div>
        </Panel>
      )}

      {phase === "quiz" && (
        <div>
          <Panel style={{ marginBottom: 14, borderColor: `${C.purple}40` }}>
            <p style={{ color: C.text, margin: 0, fontSize: 13, fontFamily: "monospace", lineHeight: 1.6 }}>🧠 {mission.quiz.q}</p>
          </Panel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {mission.quiz.options.map((opt, i) => {
              let bc = C.border, bg = C.raised, col = C.text;
              if (chosen !== null) {
                if (i === mission.quiz.correct) { bc = C.green; bg = `${C.green}15`; col = C.green; }
                else if (i === chosen) { bc = C.red; bg = `${C.red}15`; col = C.red; }
              }
              return (
                <div key={i} onClick={() => pick(i)} style={{
                  padding: "12px 16px", borderRadius: 8,
                  border: `1px solid ${bc}`, background: bg, color: col,
                  cursor: "pointer", fontFamily: "monospace", fontSize: 12, transition: "all 0.2s",
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
            marginBottom: 14,
            borderColor: chosen === mission.quiz.correct ? `${C.green}60` : `${C.red}60`,
            background: chosen === mission.quiz.correct ? `${C.green}08` : `${C.red}08`,
          }}>
            {chosen === mission.quiz.correct ? (
              <>
                <div style={{ fontSize: 22, marginBottom: 8 }}>🏆 Mission Complete!</div>
                <div style={{ color: C.green, fontFamily: "monospace", fontSize: 12 }}>
                  +{mission.xp} XP earned! Badge unlocked: {mission.badge}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 22, marginBottom: 8 }}>💀 Mission Failed</div>
                <div style={{ color: C.red, fontFamily: "monospace", fontSize: 12 }}>
                  No XP earned. Correct answer: <strong>{mission.quiz.options[mission.quiz.correct]}</strong>
                </div>
              </>
            )}
          </Panel>
          <Btn onClick={next} color={C.accent}>
            {missionIdx + 1 >= RPG_MISSIONS.length ? "Complete Campaign! 🎖️" : "Next Mission →"}
          </Btn>
        </div>
      )}
    </div>
  );
}

// ─── RESULT SCREEN ─────────────────────────────────────────────────────────────
function ResultScreen({ mode, score, onBack }) {
  const tier = score >= 400 ? "🥇 GOLD" : score >= 200 ? "🥈 SILVER" : "🥉 BRONZE";
  const tierColor = score >= 400 ? C.accent : score >= 200 ? "#94a3b8" : "#cd7f32";
  return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🏁</div>
      <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>MODE COMPLETE</div>
      <div style={{ color: C.text, fontFamily: FONT_CODE, fontSize: 18, marginBottom: 24 }}>{mode.toUpperCase()}</div>
      <div style={{
        fontSize: 52, fontWeight: "bold", color: tierColor,
        fontFamily: FONT_CODE, textShadow: `0 0 30px ${tierColor}80`, marginBottom: 8,
      }}>{score}</div>
      <div style={{ color: tierColor, fontFamily: FONT_CODE, fontSize: 16, marginBottom: 32 }}>{tier}</div>
      <Btn onClick={onBack} color={C.accent}>← Back to Hub</Btn>
    </div>
  );
}

// ─── GAME MODES CONFIG ─────────────────────────────────────────────────────────
const MODES = [
  { id:"matching",     label:"Match It",      icon:"🔗", color:C.purple,  desc:"Match AWS services to their definitions across 31 levels",     difficulty:"Beginner" },
  { id:"escape",       label:"Escape Room",   icon:"🚨", color:C.red,     desc:"Investigate clues and solve 6 real AWS incidents under the clock", difficulty:"Advanced" },
  { id:"troubleshoot", label:"Troubleshoot",  icon:"🔧", color:"#e11d48", desc:"Diagnose real AWS issues from symptoms and log evidence",        difficulty:"Advanced" },
  { id:"scenario",     label:"Scenario Quiz", icon:"💼", color:C.accent,  desc:"Answer real-world architecture scenario questions",              difficulty:"Intermediate" },
  { id:"rpg",          label:"RPG Campaign",  icon:"⚔️", color:C.green,   desc:"Complete missions, earn XP, unlock badges as an AWS Architect",  difficulty:"All Levels" },
];

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function AwsGame() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [view, setView] = useState("hub");
  const [activeMode, setActiveMode] = useState(null);
  const [result, setResult] = useState(null);
  const [allScores, setAllScores] = useState({});
  const submitScore = trpc.game?.submitScore?.useMutation?.();
  const { data: leaderboard } = trpc.game?.getLeaderboard?.useQuery?.() ?? { data: null };
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const totalScore = Object.values(allScores).reduce((a: number, b: any) => a + b, 0);

  const handleComplete = (score) => {
    setAllScores(s => ({ ...s, [activeMode]: (s[activeMode] || 0) + score }));
    if (user && submitScore) {
      submitScore.mutate({ xpEarned: score, lessonsCompleted: 1, streak: 0 });
    }
    setResult({ mode: activeMode, score });
  };

  // Result screen
  if (result) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 640 }}>
        <ResultScreen mode={result.mode} score={result.score}
          onBack={() => { setResult(null); setView("hub"); setActiveMode(null); }} />
      </div>
    </div>
  );

  // Active game
  if (view === "game" && activeMode) {
    const mode = MODES.find(m => m.id === activeMode);
    return (
      <div style={{ minHeight: "100vh", background: C.bg, padding: "20px 16px" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@400;600;700&display=swap');`}</style>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <button onClick={() => { setView("hub"); setActiveMode(null); }} style={{
              background: "none", border: `1px solid ${C.border}`, color: C.muted,
              padding: "6px 14px", borderRadius: 6, cursor: "pointer",
              fontFamily: FONT_CODE, fontSize: 11, letterSpacing: 1,
            }}>← HUB</button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: mode.color, fontFamily: FONT_CODE, fontSize: 11, letterSpacing: 1 }}>{mode.icon} {mode.label.toUpperCase()}</span>
            </div>
            <Chip color={C.accent}>Total: {totalScore}</Chip>
          </div>
          <Panel>
            {activeMode === "matching"     && <MatchingGame onComplete={handleComplete} />}
            {activeMode === "escape"       && <EscapeRoomGame onComplete={handleComplete} />}
            {activeMode === "troubleshoot" && <TroubleshootGame onComplete={handleComplete} />}
            {activeMode === "scenario"     && <ScenarioQuiz onComplete={handleComplete} />}
            {activeMode === "rpg"          && <RPGCampaign onComplete={handleComplete} />}
          </Panel>
        </div>
      </div>
    );
  }

  // Hub
  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "20px 16px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@400;600;700&display=swap');`}</style>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <button onClick={() => navigate("/dashboard")} style={{
              background: "none", border: "none", color: C.muted, cursor: "pointer",
              fontFamily: FONT_CODE, fontSize: 11, letterSpacing: 1, padding: 0, marginBottom: 10,
            }}>← BACK TO DASHBOARD</button>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `linear-gradient(135deg,${C.accent}30,${C.accentDim}20)`,
                border: `1px solid ${C.accent}50`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>☁️</div>
              <div>
                <div style={{ color: C.text, fontFamily: FONT_CODE, fontSize: 16, fontWeight: "bold" }}>
                  <GlowText color={C.accent}>AWS</GlowText> Training Arena
                </div>
                <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1 }}>
                  {MODES.length} GAME MODES · {MATCH_LEVELS.length} MATCH LEVELS · {ESCAPE_ROOMS.length} INCIDENTS
                </div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: C.accent, fontFamily: FONT_CODE, fontSize: 20, fontWeight: "bold" }}>{totalScore}</div>
            <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 9, letterSpacing: 1 }}>SESSION XP</div>
          </div>
        </div>

        {/* Leaderboard toggle */}
        {leaderboard && leaderboard.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <button onClick={() => setShowLeaderboard(!showLeaderboard)} style={{
              background: "none", border: `1px solid ${C.border}`, color: C.muted,
              padding: "6px 14px", borderRadius: 6, cursor: "pointer",
              fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 1,
            }}>
              {showLeaderboard ? "▲ HIDE LEADERBOARD" : "▼ SHOW LEADERBOARD"}
            </button>
            {showLeaderboard && (
              <Panel style={{ marginTop: 10 }}>
                <div style={{ color: C.accent, fontFamily: FONT_CODE, fontSize: 11, letterSpacing: 1, marginBottom: 12 }}>🏆 TOP PLAYERS</div>
                {leaderboard.map((row: any) => (
                  <div key={row.userId} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0", borderBottom: `1px solid ${C.border}`,
                    background: row.isCurrentUser ? `${C.green}08` : "transparent",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: C.accent, fontFamily: FONT_CODE, fontSize: 12, width: 24 }}>#{row.rank}</span>
                      <span style={{ color: row.isCurrentUser ? C.green : C.text, fontFamily: "monospace", fontSize: 12 }}>
                        {row.name}{row.isCurrentUser ? " (you)" : ""}
                      </span>
                    </div>
                    <Chip color={C.accent}>{row.totalXp} XP</Chip>
                  </div>
                ))}
              </Panel>
            )}
          </div>
        )}

        {/* Mode grid */}
        <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 10, letterSpacing: 2, marginBottom: 14 }}>SELECT GAME MODE</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          {MODES.map(mode => (
            <div key={mode.id} onClick={() => { setActiveMode(mode.id); setView("game"); }} style={{
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "18px 16px",
              cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = mode.color;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${mode.color}20`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = C.border;
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{mode.icon}</div>
              <div style={{ color: mode.color, fontFamily: FONT_CODE, fontSize: 13, fontWeight: "bold", marginBottom: 4 }}>{mode.label}</div>
              <div style={{ color: C.muted, fontFamily: "monospace", fontSize: 10, lineHeight: 1.5, marginBottom: 10 }}>{mode.desc}</div>
              <Chip color={mode.color}>{mode.difficulty}</Chip>
              {allScores[mode.id] && (
                <div style={{ marginTop: 8 }}>
                  <Chip color={C.green}>Best: {allScores[mode.id]}</Chip>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
            <div>
              <div style={{ color: C.accent, fontFamily: FONT_CODE, fontSize: 20, fontWeight: "bold" }}>{MATCH_LEVELS.length}</div>
              <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 9, letterSpacing: 1 }}>MATCH LEVELS</div>
            </div>
            <div>
              <div style={{ color: C.red, fontFamily: FONT_CODE, fontSize: 20, fontWeight: "bold" }}>{ESCAPE_ROOMS.length}</div>
              <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 9, letterSpacing: 1 }}>INCIDENTS</div>
            </div>
            <div>
              <div style={{ color: C.blue, fontFamily: FONT_CODE, fontSize: 20, fontWeight: "bold" }}>{SCENARIO_QUESTIONS.length}</div>
              <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 9, letterSpacing: 1 }}>SCENARIOS</div>
            </div>
            <div>
              <div style={{ color: C.green, fontFamily: FONT_CODE, fontSize: 20, fontWeight: "bold" }}>{RPG_MISSIONS.length}</div>
              <div style={{ color: C.muted, fontFamily: FONT_CODE, fontSize: 9, letterSpacing: 1 }}>RPG MISSIONS</div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
