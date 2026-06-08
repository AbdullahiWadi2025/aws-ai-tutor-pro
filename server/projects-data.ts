export interface ProjectStep {
  id: number;
  title: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  estimatedCost: string;
  certTags: string[];
  domainTags: string[];
  services: string[];
  steps: ProjectStep[];
}

export const PROJECTS: Project[] = [
  // ─── BEGINNER ───────────────────────────────────────────────────────────────
  {
    id: "s3-static-website",
    title: "Host a Static Website on S3 + CloudFront",
    description:
      "Deploy a simple HTML/CSS website to S3, enable static website hosting, and distribute it globally with CloudFront for low latency and HTTPS.",
    difficulty: "beginner",
    estimatedTime: "1–2 hours",
    estimatedCost: "< $1/month",
    certTags: ["CLF-C02", "SAA-C03"],
    domainTags: ["Storage", "Networking"],
    services: ["S3", "CloudFront", "Route 53"],
    steps: [
      { id: 1, title: "Create an S3 bucket", description: "Go to S3 → Create bucket. Disable 'Block all public access'. Enable static website hosting under Properties." },
      { id: 2, title: "Upload your website files", description: "Upload index.html and any CSS/JS files. Set the index document to index.html." },
      { id: 3, title: "Set a bucket policy for public read", description: "Add a bucket policy that allows s3:GetObject for Principal: *. Test the S3 website endpoint in your browser." },
      { id: 4, title: "Create a CloudFront distribution", description: "Go to CloudFront → Create distribution. Set the origin to your S3 website endpoint. Enable HTTPS redirect." },
      { id: 5, title: "Set a custom error page", description: "In CloudFront error pages, map 403 and 404 to /index.html with a 200 response code." },
      { id: 6, title: "Test and verify", description: "Visit your CloudFront domain (*.cloudfront.net). Confirm HTTPS works, content loads, and the 404 page redirects correctly." },
      { id: 7, title: "(Optional) Add a custom domain with Route 53", description: "Register or transfer a domain in Route 53. Create an A record alias pointing to your CloudFront distribution." },
    ],
  },
  {
    id: "ec2-web-server",
    title: "Launch a Web Server on EC2",
    description:
      "Spin up an EC2 instance, install Apache/Nginx, configure a Security Group, and serve a simple webpage from a public IP address.",
    difficulty: "beginner",
    estimatedTime: "1–2 hours",
    estimatedCost: "Free tier eligible",
    certTags: ["CLF-C02", "SAA-C03"],
    domainTags: ["Compute", "Networking"],
    services: ["EC2", "VPC", "Security Groups"],
    steps: [
      { id: 1, title: "Launch an EC2 instance", description: "Go to EC2 → Launch instance. Choose Amazon Linux 2023 AMI, t2.micro (free tier). Create a new key pair and download it." },
      { id: 2, title: "Configure a Security Group", description: "Allow inbound SSH (port 22) from your IP and HTTP (port 80) from anywhere (0.0.0.0/0)." },
      { id: 3, title: "Connect via SSH", description: "Run: ssh -i your-key.pem ec2-user@<public-ip>. If permission denied, run chmod 400 your-key.pem first." },
      { id: 4, title: "Install and start Apache", description: "Run: sudo yum install -y httpd && sudo systemctl start httpd && sudo systemctl enable httpd" },
      { id: 5, title: "Create a test webpage", description: "Run: echo '<h1>Hello from EC2!</h1>' | sudo tee /var/www/html/index.html" },
      { id: 6, title: "Test in your browser", description: "Open http://<your-ec2-public-ip> in a browser. You should see your Hello from EC2 page." },
      { id: 7, title: "Stop the instance when done", description: "Stop (not terminate) the instance to avoid charges. Note: the public IP changes on restart unless you use an Elastic IP." },
    ],
  },
  {
    id: "iam-roles-policies",
    title: "Secure Your AWS Account with IAM",
    description:
      "Create IAM users, groups, roles, and policies following the principle of least privilege. Enable MFA and set up a billing alarm.",
    difficulty: "beginner",
    estimatedTime: "1–2 hours",
    estimatedCost: "Free",
    certTags: ["CLF-C02", "SAA-C03"],
    domainTags: ["Security", "Billing"],
    services: ["IAM", "CloudWatch", "SNS"],
    steps: [
      { id: 1, title: "Enable MFA on the root account", description: "Go to IAM → Security recommendations. Enable MFA for the root user using an authenticator app. Never use root for daily tasks." },
      { id: 2, title: "Create an admin IAM user", description: "Go to IAM → Users → Create user. Attach the AdministratorAccess policy. Enable console access with a strong password." },
      { id: 3, title: "Create a developer group with limited permissions", description: "Create a group called 'Developers'. Attach AmazonEC2ReadOnlyAccess and AmazonS3ReadOnlyAccess policies. Add a test user to this group." },
      { id: 4, title: "Create a custom IAM policy", description: "Write a JSON policy that allows s3:GetObject and s3:PutObject on a specific bucket only. Attach it to the developer group." },
      { id: 5, title: "Create an IAM role for EC2", description: "Create a role with EC2 as the trusted entity. Attach AmazonS3ReadOnlyAccess. This allows EC2 instances to read S3 without hardcoding credentials." },
      { id: 6, title: "Set up a billing alarm", description: "Go to CloudWatch → Alarms → Create alarm. Choose EstimatedCharges metric. Set threshold to $5. Send notification to an SNS email topic." },
      { id: 7, title: "Review the IAM credential report", description: "Go to IAM → Credential report → Download. Review which users have MFA enabled, active access keys, and last activity dates." },
    ],
  },
  {
    id: "sns-sqs-notification",
    title: "Build a Notification System with SNS + SQS",
    description:
      "Create an SNS topic, subscribe an SQS queue and an email endpoint, then publish messages to see fan-out delivery in action.",
    difficulty: "beginner",
    estimatedTime: "1 hour",
    estimatedCost: "< $0.01",
    certTags: ["CLF-C02", "SAA-C03"],
    domainTags: ["Application Integration"],
    services: ["SNS", "SQS"],
    steps: [
      { id: 1, title: "Create an SNS topic", description: "Go to SNS → Topics → Create topic. Choose Standard type. Name it OrderNotifications." },
      { id: 2, title: "Subscribe your email to the topic", description: "Create a subscription with Protocol: Email. Enter your email. Confirm the subscription from the email you receive." },
      { id: 3, title: "Create an SQS queue", description: "Go to SQS → Create queue. Choose Standard queue. Name it OrderQueue." },
      { id: 4, title: "Subscribe the SQS queue to SNS", description: "In SNS, create another subscription. Protocol: SQS. Enter the ARN of your OrderQueue. Set the SQS access policy to allow SNS to send messages." },
      { id: 5, title: "Publish a test message", description: "In SNS, click Publish message. Enter a subject and body. Click Publish. Check your email and the SQS queue for the message." },
      { id: 6, title: "Poll the SQS queue", description: "In SQS, click Send and receive messages → Poll for messages. You should see the message SNS delivered to the queue." },
      { id: 7, title: "Understand the pattern", description: "This is the fan-out pattern: one SNS publish delivers to multiple subscribers simultaneously. Used for decoupled microservices and event-driven architectures." },
    ],
  },

  // ─── INTERMEDIATE ────────────────────────────────────────────────────────────
  {
    id: "serverless-api",
    title: "Build a Serverless REST API with Lambda + API Gateway",
    description:
      "Create a fully serverless CRUD API using Lambda functions, API Gateway, and DynamoDB — no servers to manage.",
    difficulty: "intermediate",
    estimatedTime: "3–4 hours",
    estimatedCost: "Free tier eligible",
    certTags: ["SAA-C03"],
    domainTags: ["Compute", "Databases"],
    services: ["Lambda", "API Gateway", "DynamoDB", "IAM"],
    steps: [
      { id: 1, title: "Create a DynamoDB table", description: "Go to DynamoDB → Create table. Name it Items. Set partition key to id (String). Use on-demand billing mode." },
      { id: 2, title: "Create a Lambda function", description: "Go to Lambda → Create function. Choose Python 3.12 or Node.js 20. Create a new execution role with DynamoDB full access." },
      { id: 3, title: "Write the Lambda handler", description: "Implement a handler that reads the HTTP method from event.httpMethod and performs GET/POST/DELETE on DynamoDB accordingly. Return JSON responses with statusCode 200." },
      { id: 4, title: "Create an API Gateway REST API", description: "Go to API Gateway → Create API → REST API. Create a resource /items. Add GET and POST methods, each integrated with your Lambda function." },
      { id: 5, title: "Enable Lambda proxy integration", description: "For each method, enable Use Lambda Proxy integration. This passes the full HTTP request to Lambda and returns the Lambda response directly." },
      { id: 6, title: "Deploy the API", description: "Create a deployment stage called prod. Note the Invoke URL — this is your API endpoint." },
      { id: 7, title: "Test with curl or Postman", description: "POST to /items with a JSON body. GET /items to list all. Verify items appear in DynamoDB. Check Lambda CloudWatch logs for errors." },
      { id: 8, title: "Add CORS headers", description: "Add Access-Control-Allow-Origin: * to your Lambda responses. Enable CORS on the API Gateway resource for browser access." },
    ],
  },
  {
    id: "rds-multi-az",
    title: "Deploy a Multi-AZ RDS Database",
    description:
      "Launch an RDS MySQL instance with Multi-AZ failover, set up a read replica, and connect from an EC2 instance in a private subnet.",
    difficulty: "intermediate",
    estimatedTime: "3–4 hours",
    estimatedCost: "$5–15 (stop when done)",
    certTags: ["SAA-C03"],
    domainTags: ["Databases", "Networking"],
    services: ["RDS", "EC2", "VPC", "Security Groups"],
    steps: [
      { id: 1, title: "Create a VPC with public and private subnets", description: "Use the VPC wizard to create a VPC with 1 public and 2 private subnets across 2 AZs. The private subnets will host RDS." },
      { id: 2, title: "Create a DB subnet group", description: "Go to RDS → Subnet groups → Create. Add both private subnets. This tells RDS which subnets it can use." },
      { id: 3, title: "Launch an RDS MySQL instance", description: "Choose MySQL 8.0, db.t3.micro. Enable Multi-AZ deployment. Place in the private subnet group. Set a master username and password." },
      { id: 4, title: "Configure Security Groups", description: "Create an RDS security group that allows port 3306 only from the EC2 security group. Never allow 0.0.0.0/0 on database ports." },
      { id: 5, title: "Launch an EC2 instance in the public subnet", description: "This is your bastion host. Assign the EC2 security group. Install MySQL client: sudo yum install -y mysql." },
      { id: 6, title: "Connect to RDS from EC2", description: "SSH into EC2, then run: mysql -h <rds-endpoint> -u admin -p. Enter your password. Run SHOW DATABASES; to confirm connection." },
      { id: 7, title: "Create a read replica", description: "In RDS, select your instance → Actions → Create read replica. Choose a different AZ. This offloads read traffic from the primary." },
      { id: 8, title: "Simulate a failover", description: "In RDS, select your instance → Actions → Reboot with failover. The standby becomes primary. Observe the endpoint stays the same (CNAME update)." },
    ],
  },
  {
    id: "vpc-peering",
    title: "Connect Two VPCs with VPC Peering",
    description:
      "Create two VPCs in the same region, establish a peering connection, update route tables, and verify cross-VPC communication between EC2 instances.",
    difficulty: "intermediate",
    estimatedTime: "2–3 hours",
    estimatedCost: "Free tier eligible",
    certTags: ["SAA-C03"],
    domainTags: ["Networking"],
    services: ["VPC", "EC2", "Route Tables", "Security Groups"],
    steps: [
      { id: 1, title: "Create two VPCs with non-overlapping CIDRs", description: "Create VPC-A with CIDR 10.0.0.0/16 and VPC-B with CIDR 10.1.0.0/16. Non-overlapping CIDRs are required for peering." },
      { id: 2, title: "Create a subnet in each VPC", description: "Create a public subnet in each VPC. Launch an EC2 instance in each subnet. Note the private IP addresses." },
      { id: 3, title: "Create a VPC peering connection", description: "Go to VPC → Peering connections → Create. Set VPC-A as requester and VPC-B as accepter. Accept the pending request." },
      { id: 4, title: "Update route tables in both VPCs", description: "In VPC-A's route table, add a route: destination 10.1.0.0/16, target = peering connection. Do the same in VPC-B for 10.0.0.0/16." },
      { id: 5, title: "Update Security Groups to allow cross-VPC traffic", description: "In each EC2's security group, allow ICMP (ping) and SSH from the other VPC's CIDR range." },
      { id: 6, title: "Test connectivity", description: "SSH into EC2-A. Ping the private IP of EC2-B: ping 10.1.x.x. You should get replies. Peering is not transitive — VPC-A cannot reach VPC-C through VPC-B." },
      { id: 7, title: "Understand the limitations", description: "VPC peering is non-transitive and does not support overlapping CIDRs. For hub-and-spoke topologies, use AWS Transit Gateway instead." },
    ],
  },
  {
    id: "auto-scaling-elb",
    title: "Build Auto Scaling Behind an Application Load Balancer",
    description:
      "Create a Launch Template, Auto Scaling Group, and Application Load Balancer. Watch EC2 instances scale out under simulated load.",
    difficulty: "intermediate",
    estimatedTime: "3–4 hours",
    estimatedCost: "$2–5 (stop when done)",
    certTags: ["SAA-C03"],
    domainTags: ["Compute", "Networking"],
    services: ["EC2", "Auto Scaling", "ALB", "CloudWatch"],
    steps: [
      { id: 1, title: "Create a Launch Template", description: "Go to EC2 → Launch Templates → Create. Choose Amazon Linux 2023, t2.micro. Add user data to install and start Apache on boot." },
      { id: 2, title: "Create an Application Load Balancer", description: "Go to EC2 → Load Balancers → Create ALB. Choose internet-facing. Select at least 2 AZs. Create a target group with HTTP:80." },
      { id: 3, title: "Create an Auto Scaling Group", description: "Go to Auto Scaling Groups → Create. Use your Launch Template. Set desired=1, min=1, max=4. Attach to the ALB target group." },
      { id: 4, title: "Set a scaling policy", description: "Add a Target Tracking policy: scale when average CPU > 50%. This automatically adds instances when load increases." },
      { id: 5, title: "Verify the ALB is routing traffic", description: "Copy the ALB DNS name and open it in a browser. You should see your Apache page. Refresh multiple times — the ALB routes to different instances." },
      { id: 6, title: "Simulate CPU load", description: "SSH into an instance. Run: stress --cpu 4 --timeout 300 (install with sudo yum install stress). Watch CloudWatch metrics and see a new instance launch." },
      { id: 7, title: "Verify scale-out in the console", description: "Go to Auto Scaling Group → Activity. You should see a scale-out event. After the stress test ends, the group scales back in after the cooldown period." },
    ],
  },

  // ─── ADVANCED ────────────────────────────────────────────────────────────────
  {
    id: "three-tier-architecture",
    title: "Deploy a 3-Tier Architecture (EC2 + RDS + ALB)",
    description:
      "Build a production-style 3-tier web application: public-facing ALB, private EC2 web tier, and private RDS database tier — all in a custom VPC.",
    difficulty: "advanced",
    estimatedTime: "6–8 hours",
    estimatedCost: "$10–20 (stop when done)",
    certTags: ["SAA-C03"],
    domainTags: ["Architecture", "Networking", "Databases"],
    services: ["VPC", "EC2", "ALB", "RDS", "NAT Gateway", "Security Groups"],
    steps: [
      { id: 1, title: "Design the VPC architecture", description: "Create a VPC with 6 subnets across 2 AZs: 2 public (ALB), 2 private app (EC2), 2 private data (RDS). This is the standard 3-tier layout." },
      { id: 2, title: "Create NAT Gateways", description: "Place a NAT Gateway in each public subnet. Update private subnet route tables to route 0.0.0.0/0 to the NAT Gateway. This allows private EC2 to reach the internet for updates." },
      { id: 3, title: "Launch EC2 instances in private app subnets", description: "Launch 2 EC2 instances (one per AZ) in the private app subnets. Install your web application. They have no public IP — only accessible via ALB." },
      { id: 4, title: "Create an ALB in the public subnets", description: "Create an internet-facing ALB. Add both public subnets. Create a target group pointing to your private EC2 instances." },
      { id: 5, title: "Deploy RDS in private data subnets", description: "Create an RDS MySQL instance with Multi-AZ in the private data subnets. The security group allows port 3306 only from the app tier security group." },
      { id: 6, title: "Configure Security Groups in layers", description: "ALB SG: allow 80/443 from internet. App SG: allow 80 from ALB SG only. DB SG: allow 3306 from App SG only. This is defense in depth." },
      { id: 7, title: "Connect the app tier to RDS", description: "SSH into EC2 via a bastion host or SSM Session Manager. Configure your app's database connection string using the RDS endpoint." },
      { id: 8, title: "Test end-to-end", description: "Access the ALB DNS name. Verify the app loads, reads from RDS, and all 3 tiers are working. Test failover by stopping one EC2 — ALB should route to the other." },
    ],
  },
  {
    id: "ci-cd-pipeline",
    title: "Build a CI/CD Pipeline with CodePipeline + CodeBuild",
    description:
      "Create a fully automated deployment pipeline: commit to GitHub triggers CodePipeline, CodeBuild runs tests, and the app deploys to EC2 or S3.",
    difficulty: "advanced",
    estimatedTime: "4–6 hours",
    estimatedCost: "< $5",
    certTags: ["SAA-C03"],
    domainTags: ["DevOps", "Compute"],
    services: ["CodePipeline", "CodeBuild", "CodeDeploy", "S3", "IAM"],
    steps: [
      { id: 1, title: "Create a GitHub repository", description: "Push a simple Node.js or Python app with a buildspec.yml file. The buildspec defines the build steps CodeBuild will run." },
      { id: 2, title: "Create a CodeBuild project", description: "Go to CodeBuild → Create project. Connect to your GitHub repo. Choose a managed image (Amazon Linux + Node.js). Set the buildspec to buildspec.yml." },
      { id: 3, title: "Create an S3 artifact bucket", description: "Create an S3 bucket for pipeline artifacts. Enable versioning. CodePipeline uses this to pass artifacts between stages." },
      { id: 4, title: "Create a CodePipeline", description: "Go to CodePipeline → Create pipeline. Source: GitHub. Build: CodeBuild project. Deploy: S3 or CodeDeploy. Each stage triggers automatically." },
      { id: 5, title: "Write a buildspec.yml", description: "Define phases: install (npm install), build (npm test && npm run build), artifacts (dist/**/*). CodeBuild executes these in order." },
      { id: 6, title: "Trigger the pipeline with a commit", description: "Push a change to GitHub. Watch the pipeline execute: Source → Build → Deploy. Each stage shows green/red status." },
      { id: 7, title: "Introduce a failing test", description: "Break a unit test and push. The Build stage should fail and block deployment. Fix the test and push again — the pipeline resumes." },
      { id: 8, title: "Add a manual approval stage", description: "Insert a Manual Approval action between Build and Deploy. The pipeline pauses until you approve in the console — useful for production gates." },
    ],
  },
  {
    id: "cloudfront-waf",
    title: "Protect a Web App with CloudFront + WAF",
    description:
      "Add AWS WAF to a CloudFront distribution to block SQL injection, XSS attacks, and rate-limit abusive IPs. Analyze blocked requests in CloudWatch.",
    difficulty: "advanced",
    estimatedTime: "3–4 hours",
    estimatedCost: "$5–10/month",
    certTags: ["SAA-C03"],
    domainTags: ["Security", "Networking"],
    services: ["CloudFront", "WAF", "CloudWatch", "S3"],
    steps: [
      { id: 1, title: "Set up a CloudFront distribution", description: "Create a CloudFront distribution in front of an S3 website or ALB. Ensure HTTPS is enforced." },
      { id: 2, title: "Create a WAF Web ACL", description: "Go to WAF → Web ACLs → Create. Choose CloudFront as the resource type (must be in us-east-1). Name it AppProtection." },
      { id: 3, title: "Add AWS managed rule groups", description: "Add AWSManagedRulesCommonRuleSet (blocks OWASP Top 10), AWSManagedRulesSQLiRuleSet (SQL injection), and AWSManagedRulesKnownBadInputsRuleSet." },
      { id: 4, title: "Add a rate-based rule", description: "Create a rate-based rule: block IPs that send more than 2000 requests in 5 minutes. This protects against DDoS and credential stuffing." },
      { id: 5, title: "Associate the Web ACL with CloudFront", description: "In WAF, associate the Web ACL with your CloudFront distribution. Changes take a few minutes to propagate." },
      { id: 6, title: "Test with a simulated attack", description: "Use curl to send a request with a SQL injection payload: curl 'https://your-domain.com/?id=1 OR 1=1'. WAF should return a 403 Forbidden." },
      { id: 7, title: "Enable WAF logging", description: "Create a CloudWatch log group. Enable WAF logging to send blocked request details there. Analyze which rules are triggering most often." },
      { id: 8, title: "Review the WAF dashboard", description: "Go to WAF → Web ACLs → your ACL → Overview. See allowed vs blocked requests, top blocked IPs, and which rules fired." },
    ],
  },
  {
    id: "event-driven-architecture",
    title: "Build an Event-Driven Architecture with EventBridge",
    description:
      "Create a decoupled event-driven system: S3 uploads trigger EventBridge rules, which fan out to Lambda, SQS, and SNS for parallel processing.",
    difficulty: "advanced",
    estimatedTime: "4–5 hours",
    estimatedCost: "< $1",
    certTags: ["SAA-C03"],
    domainTags: ["Architecture", "Application Integration"],
    services: ["EventBridge", "Lambda", "S3", "SQS", "SNS"],
    steps: [
      { id: 1, title: "Create an S3 bucket with EventBridge notifications enabled", description: "In S3 bucket properties, enable Amazon EventBridge under Event notifications. All S3 events will now be sent to the default event bus." },
      { id: 2, title: "Create a Lambda function for image processing", description: "Write a Lambda function that receives an S3 event and logs the file key and size. This simulates an image processing worker." },
      { id: 3, title: "Create an SQS queue for async processing", description: "Create a standard SQS queue called FileProcessingQueue. This will buffer events for downstream consumers." },
      { id: 4, title: "Create an SNS topic for notifications", description: "Create an SNS topic called FileUploadAlerts. Subscribe your email to receive upload notifications." },
      { id: 5, title: "Create an EventBridge rule", description: "Create a rule on the default event bus. Event pattern: source=aws.s3, detail-type=Object Created, bucket name=your bucket. Add 3 targets: Lambda, SQS, SNS." },
      { id: 6, title: "Upload a test file to S3", description: "Upload any file to your S3 bucket. Within seconds: Lambda logs the event, SQS receives a message, and you get an email from SNS." },
      { id: 7, title: "Add a filter to the rule", description: "Modify the rule to only trigger for .jpg files: add detail.object.key suffix filter. Test with a .txt file (no trigger) and a .jpg file (triggers)." },
      { id: 8, title: "Understand the pattern", description: "EventBridge decouples producers from consumers. Adding a new consumer requires no changes to the S3 bucket or existing consumers — just add a new target to the rule." },
    ],
  },
];
