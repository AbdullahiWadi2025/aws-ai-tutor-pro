import mysql from 'mysql2/promise';

// All 65 questions extracted from the uploaded file
// Format: { d: domain, t: type, q: question, o: options[], c: correct_indices[], e: explanation }
const RAW_QUESTIONS = [
  {d:"Cloud Concepts",t:"single",q:"A company wants to avoid purchasing physical servers and instead pay only for the compute resources they actually use each month. Which benefit of AWS Cloud does this best describe?",o:["High availability","Trading capital expense for variable expense","Economies of scale","Elasticity"],c:[1],e:"Trading CapEx for variable (OpEx) expense means you pay only for what you consume rather than investing in infrastructure upfront. This is one of the six core advantages of cloud computing."},
  {d:"Cloud Concepts",t:"single",q:"A startup needs to deploy its application in three countries simultaneously on day one. Which AWS global infrastructure feature makes this possible without significant upfront investment?",o:["Availability Zones within a single Region","Multiple AWS Regions around the world","AWS Edge locations","AWS Local Zones"],c:[1],e:"AWS has Regions in multiple countries globally. A startup can deploy to any Region with no upfront infrastructure cost, enabling global reach on day one."},
  {d:"Cloud Concepts",t:"single",q:"A company's website experiences 100x more traffic during Black Friday than on a typical day. The team wants to automatically handle this without manual intervention. Which cloud concept addresses this?",o:["High durability","Elasticity","Fault tolerance","Global reach"],c:[1],e:"Elasticity is the ability to automatically scale resources up or down to match demand. Auto Scaling handles traffic spikes and scales back down when traffic drops."},
  {d:"Cloud Concepts",t:"single",q:"A company is migrating to AWS and wants to move with minimal changes to their existing applications. Which migration strategy does this represent?",o:["Re-architect","Re-platform","Rehost (lift and shift)","Retire"],c:[2],e:"Rehosting (lift and shift) means moving applications to the cloud with no or minimal changes. It's the fastest migration strategy and preserves existing application architecture."},
  {d:"Cloud Concepts",t:"multi",q:"A CTO is building a business case to migrate from on-premises to AWS. Which TWO cost advantages should they highlight?",o:["Elimination of hardware refresh cycles","Guaranteed 100% uptime SLA","Reduced need to overprovision capacity","Faster software development cycles"],c:[0,2],e:"AWS eliminates the need to buy and refresh physical hardware. It also eliminates overprovisioning since you only pay for what you use. Uptime SLA guarantees and development speed are benefits but not direct cost advantages."},
  {d:"Cloud Concepts",t:"single",q:"Which pillar of the AWS Well-Architected Framework focuses on the ability of a system to recover from failures and meet customer demand?",o:["Security","Performance efficiency","Reliability","Cost optimization"],c:[2],e:"Reliability covers the ability to recover from disruptions, dynamically acquire resources, and mitigate misconfigurations or transient issues. It includes backup, disaster recovery, and fault tolerance."},
  {d:"Cloud Concepts",t:"single",q:"A company wants to understand how AWS pricing benefits them as they consume more services over time. Which cloud economics concept explains why AWS can offer lower prices than running your own data center?",o:["Variable cost model","Economies of scale","Capital expenditure savings","Reserved capacity discounts"],c:[1],e:"AWS aggregates usage from hundreds of thousands of customers, achieving massive economies of scale. This allows AWS to offer lower pay-as-you-go prices than most organizations could achieve on their own."},
  {d:"Cloud Concepts",t:"single",q:"An enterprise is evaluating cloud adoption. Their risk team is concerned about compliance in the EU. Which component of the AWS Cloud Adoption Framework (CAF) addresses governance and compliance risk?",o:["People perspective","Business perspective","Governance perspective","Platform perspective"],c:[2],e:"The Governance perspective of the AWS CAF focuses on risk management, compliance, and ensuring IT strategies align with business goals — directly addressing regulatory and compliance concerns."},
  {d:"Cloud Concepts",t:"single",q:"A company needs to move 80TB of data to AWS within two weeks. Their internet connection is 100Mbps. Which service should they use?",o:["AWS Direct Connect","AWS Snowball","AWS DataSync","Amazon S3 Transfer Acceleration"],c:[1],e:"80TB over a 100Mbps connection would take weeks to months. AWS Snowball is a physical device sent to the customer for offline data transfer and returned to AWS — ideal for large datasets with bandwidth constraints."},
  {d:"Cloud Concepts",t:"single",q:"Which deployment model describes running some workloads in AWS while keeping others in an on-premises data center, with connectivity between both environments?",o:["Cloud deployment","On-premises deployment","Hybrid deployment","Multi-region deployment"],c:[2],e:"Hybrid cloud connects on-premises infrastructure with cloud resources. Organizations use it during migration or when regulatory requirements mandate that certain data remain on-premises."},
  {d:"Security and Compliance",t:"single",q:"Under the AWS shared responsibility model, which task is ALWAYS the customer's responsibility regardless of the AWS service used?",o:["Physical security of data centers","Patching the hypervisor","Managing customer data and access permissions","Maintaining network infrastructure"],c:[2],e:"Customers are always responsible for their data — what they put in AWS, who can access it, and how it's classified. AWS manages physical security, hypervisors, and network infrastructure regardless of service."},
  {d:"Security and Compliance",t:"single",q:"A company uses Amazon RDS. Under the shared responsibility model, which security task does AWS manage that the customer would handle if using EC2 with a self-managed database?",o:["Encrypting data at rest","Database engine patching","Creating IAM policies for access","Configuring security groups"],c:[1],e:"With RDS (a managed service), AWS handles database engine patching. With EC2 and a self-managed database, the customer is responsible for patching the OS and database engine."},
  {d:"Security and Compliance",t:"single",q:"A security engineer needs to identify which AWS users made API calls that deleted S3 buckets over the last 90 days. Which service provides this information?",o:["Amazon CloudWatch","AWS Config","AWS CloudTrail","AWS Trusted Advisor"],c:[2],e:"AWS CloudTrail records all API calls including who made them, when, and from where. It provides a complete audit trail of account activity, including destructive actions like bucket deletion."},
  {d:"Security and Compliance",t:"single",q:"A company wants to enforce that all new EC2 instances must have encryption enabled on their EBS volumes. Which service can continuously evaluate and flag non-compliant resources?",o:["AWS Shield","AWS Config","Amazon Inspector","AWS Trusted Advisor"],c:[1],e:"AWS Config tracks resource configurations over time and can evaluate them against rules. You can create a rule that flags EC2 instances with unencrypted EBS volumes as non-compliant."},
  {d:"Security and Compliance",t:"single",q:"An AWS account root user is logging in daily to manage resources. What is the most important security recommendation for the root user?",o:["Create an access key for the root user for CLI access","Enable MFA on the root user account","Share root credentials with the security team","Use root user for all administrative tasks"],c:[1],e:"The root user has unrestricted access to all AWS resources. Enabling MFA is the most critical protection. AWS best practice is to use root only for tasks that require it."},
  {d:"Security and Compliance",t:"multi",q:"A company wants to protect its web application from SQL injection attacks and DDoS attacks simultaneously. Which TWO AWS services should they use?",o:["AWS WAF","Amazon GuardDuty","AWS Shield","AWS Config","Amazon Inspector"],c:[0,2],e:"AWS WAF protects against application layer attacks including SQL injection. AWS Shield provides DDoS protection. GuardDuty detects threats; Config tracks compliance; Inspector assesses vulnerabilities."},
  {d:"Security and Compliance",t:"single",q:"A developer accidentally committed AWS access keys to a public GitHub repository. AWS detected the exposure. Which service sent the alert?",o:["AWS Trusted Advisor","Amazon GuardDuty","AWS Security Hub","AWS Health Dashboard"],c:[1],e:"Amazon GuardDuty uses threat intelligence and ML to detect suspicious activity including exposed credentials being used from unexpected locations."},
  {d:"Security and Compliance",t:"single",q:"A company must store database passwords and API keys used by their applications, with automatic rotation every 30 days. Which service is purpose-built for this?",o:["AWS Systems Manager Parameter Store","AWS Secrets Manager","AWS Key Management Service","AWS Certificate Manager"],c:[1],e:"AWS Secrets Manager is designed for storing, retrieving, and automatically rotating secrets like database credentials and API keys."},
  {d:"Security and Compliance",t:"single",q:"An employee leaves the company. Their AWS IAM user account should be handled in which way to follow security best practices?",o:["Change their password immediately","Disable or delete their IAM user and revoke all associated access keys","Transfer their permissions to another user","Archive their account for 90 days before deletion"],c:[1],e:"When an employee leaves, their IAM user should be disabled immediately and access keys revoked. Changing passwords alone doesn't revoke programmatic access via access keys."},
  {d:"Security and Compliance",t:"single",q:"A company needs to meet PCI DSS compliance requirements for their AWS environment. Where can they access official AWS compliance reports and certifications?",o:["AWS Trusted Advisor","AWS Artifact","AWS Security Hub","AWS Audit Manager"],c:[1],e:"AWS Artifact is a self-service portal providing on-demand access to AWS compliance reports including PCI DSS, SOC, and ISO certifications."},
  {d:"Security and Compliance",t:"single",q:"A company wants to implement the principle of least privilege. An application only needs to read objects from a specific S3 bucket. What should they create?",o:["An IAM user with AdministratorAccess policy","An IAM role with a custom policy allowing only s3:GetObject on that specific bucket","An IAM group with AmazonS3FullAccess policy","A root user access key scoped to S3"],c:[1],e:"Least privilege means granting only the permissions required. An IAM role with a custom policy scoped to s3:GetObject on a specific bucket grants exactly what's needed and nothing more."},
  {d:"Security and Compliance",t:"single",q:"A company is running a critical public-facing application and wants protection against large-scale DDoS attacks at no additional cost. Which AWS service provides this automatically?",o:["AWS WAF","AWS Firewall Manager","AWS Shield Standard","Amazon GuardDuty"],c:[2],e:"AWS Shield Standard is automatically enabled for all AWS customers at no cost. It provides protection against common network and transport layer DDoS attacks."},
  {d:"Cloud Technology and Services",t:"single",q:"A company needs a NoSQL database that can handle millions of requests per second with single-digit millisecond latency. Which AWS service should they use?",o:["Amazon RDS","Amazon Aurora","Amazon DynamoDB","Amazon ElastiCache"],c:[2],e:"Amazon DynamoDB is a fully managed NoSQL database designed for single-digit millisecond performance at any scale. It's the go-to choice for high-throughput, low-latency workloads."},
  {d:"Cloud Technology and Services",t:"single",q:"A company wants to run containerized microservices without managing the underlying EC2 instances or clusters. Which compute option eliminates infrastructure management entirely?",o:["Amazon ECS on EC2","Amazon EKS on EC2","AWS Fargate","Amazon Lightsail"],c:[2],e:"AWS Fargate is a serverless compute engine for containers. It removes the need to provision or manage EC2 instances — you define your containers and Fargate handles the underlying infrastructure."},
  {d:"Cloud Technology and Services",t:"single",q:"An application needs to process image uploads asynchronously. When a user uploads an image, multiple downstream services should each receive a copy of the event. Which service best handles this fan-out pattern?",o:["Amazon SQS","Amazon SNS","Amazon EventBridge","AWS Step Functions"],c:[1],e:"Amazon SNS (pub/sub) fans out a single message to multiple subscribers simultaneously. SQS is point-to-point; EventBridge is for event routing; Step Functions orchestrates workflows."},
  {d:"Cloud Technology and Services",t:"single",q:"A company hosts a static website with HTML, CSS, and JavaScript files. They want the lowest possible cost hosting with high availability. Which AWS service is best suited?",o:["Amazon EC2 with Nginx","AWS Elastic Beanstalk","Amazon S3 static website hosting","Amazon Lightsail"],c:[2],e:"Amazon S3 can host static websites directly at very low cost. There are no servers to manage, and S3 provides high durability and availability automatically."},
  {d:"Cloud Technology and Services",t:"single",q:"A company needs to run a background job every night at 2am to process daily reports. The job takes about 5 minutes. Which is the most cost-effective compute solution?",o:["A dedicated EC2 instance running 24/7","AWS Lambda with a scheduled EventBridge rule","Amazon ECS with a continuously running task","AWS Batch with a reserved queue"],c:[1],e:"AWS Lambda with a scheduled EventBridge rule runs the function only when triggered. You pay only for execution time — 5 minutes per day. A 24/7 EC2 instance would cost significantly more."},
  {d:"Cloud Technology and Services",t:"single",q:"A company needs to migrate their Oracle database to AWS with minimal downtime while keeping the source database operational during migration. Which service handles this?",o:["AWS Snowball","AWS Database Migration Service (DMS)","AWS Application Migration Service","AWS Schema Conversion Tool"],c:[1],e:"AWS DMS migrates databases to AWS with minimal downtime by continuously replicating changes while the source database stays operational."},
  {d:"Cloud Technology and Services",t:"single",q:"A global e-commerce company wants to reduce latency for users worldwide by caching content closer to end users. Which service should they use?",o:["Amazon Route 53","AWS Global Accelerator","Amazon CloudFront","AWS Direct Connect"],c:[2],e:"Amazon CloudFront is AWS's CDN, caching content at 400+ edge locations globally to deliver content with low latency worldwide."},
  {d:"Cloud Technology and Services",t:"single",q:"A company needs to connect their on-premises data center to AWS with a consistent, low-latency dedicated connection instead of the public internet. Which service provides this?",o:["AWS VPN","AWS Direct Connect","Amazon CloudFront","AWS Transit Gateway"],c:[1],e:"AWS Direct Connect provides a dedicated private network connection from on-premises to AWS, bypassing the public internet. It offers consistent latency and higher bandwidth than VPN."},
  {d:"Cloud Technology and Services",t:"multi",q:"A company needs to store files that are accessed frequently for the first 30 days, then rarely accessed afterward, and must be archived after 1 year. Which TWO features of S3 help automate this?",o:["S3 Versioning","S3 Lifecycle policies","S3 Replication","S3 Storage classes","S3 Object Lock"],c:[1,3],e:"S3 Lifecycle policies automate transitioning objects between storage classes based on age. S3 Storage classes offer different price/performance tiers. Together they automate cost-optimized storage management."},
  {d:"Cloud Technology and Services",t:"single",q:"A company wants to use machine learning to automatically extract text and data from scanned documents and forms without writing ML code. Which AWS service should they use?",o:["Amazon Comprehend","Amazon Textract","Amazon Rekognition","Amazon Kendra"],c:[1],e:"Amazon Textract automatically extracts text, handwriting, and structured data from scanned documents using ML. Comprehend is for NLP; Rekognition is for image/video analysis; Kendra is an intelligent search service."},
  {d:"Cloud Technology and Services",t:"single",q:"A company's application runs across multiple Availability Zones. One AZ experiences an outage. Which design principle ensures the other AZs are not affected?",o:["AZs share the same power infrastructure","AZs are isolated with independent power, cooling, and networking","AZs are in different AWS Regions","AZs are connected via the public internet"],c:[1],e:"Each Availability Zone is physically separate with independent power, cooling, and networking. AZs are isolated from each other's failures while connected via low-latency links."},
  {d:"Cloud Technology and Services",t:"single",q:"An application needs a relational database that automatically scales storage, provides high availability with multi-AZ failover, and is compatible with MySQL. Which AWS service is best suited?",o:["Amazon DynamoDB","Amazon RDS for MySQL","Amazon Aurora","Amazon Redshift"],c:[2],e:"Amazon Aurora is MySQL and PostgreSQL compatible, automatically scales storage, provides multi-AZ by default, and offers higher performance than standard RDS."},
  {d:"Cloud Technology and Services",t:"single",q:"A company wants to provide virtual desktops to remote employees without managing physical hardware. Which AWS service enables this?",o:["Amazon AppStream 2.0","Amazon WorkSpaces","Amazon EC2","AWS Outposts"],c:[1],e:"Amazon WorkSpaces provides managed virtual desktops in the cloud. AppStream 2.0 streams individual applications, not full desktops."},
  {d:"Cloud Technology and Services",t:"single",q:"A development team wants to deploy a web application without managing servers, load balancers, or auto scaling. Which service provides this?",o:["Amazon EC2 with Auto Scaling","AWS Elastic Beanstalk","AWS Lambda","Amazon Lightsail"],c:[1],e:"AWS Elastic Beanstalk is a PaaS that lets developers upload code while AWS automatically handles deployment, capacity provisioning, load balancing, and auto scaling."},
  {d:"Billing, Pricing, and Support",t:"single",q:"A company's AWS bill was unexpectedly high last month due to a forgotten test environment. Which service would have alerted them when spending exceeded a threshold?",o:["AWS Cost Explorer","AWS Pricing Calculator","AWS Budgets","AWS Trusted Advisor"],c:[2],e:"AWS Budgets lets you set custom cost and usage thresholds and sends alerts when you approach or exceed them."},
  {d:"Billing, Pricing, and Support",t:"single",q:"A company runs EC2 instances for a database that must be available 24/7 for the next 3 years. Which purchasing option provides the greatest cost savings?",o:["On-Demand Instances","Spot Instances","Reserved Instances (3-year term)","Dedicated Hosts"],c:[2],e:"Reserved Instances with a 3-year term offer up to 72% savings over On-Demand for steady-state workloads. Spot Instances can be interrupted so they are unsuitable for always-on databases."},
  {d:"Billing, Pricing, and Support",t:"single",q:"A company runs workloads that can be interrupted and restarted. They want the lowest possible EC2 cost. Which purchasing option should they use?",o:["Reserved Instances","On-Demand Instances","Spot Instances","Savings Plans"],c:[2],e:"Spot Instances use spare AWS capacity and can offer up to 90% savings over On-Demand. They can be interrupted with 2 minutes notice — ideal for fault-tolerant, flexible workloads."},
  {d:"Billing, Pricing, and Support",t:"single",q:"A company uses multiple AWS accounts for different teams. Finance wants one invoice and the ability to share Reserved Instance discounts across all accounts. Which feature enables this?",o:["AWS Cost Explorer","AWS Organizations consolidated billing","AWS Budgets","AWS Cost and Usage Reports"],c:[1],e:"AWS Organizations consolidated billing combines charges from all member accounts into a single invoice and allows Reserved Instance discounts to be shared across accounts."},
  {d:"Billing, Pricing, and Support",t:"single",q:"Before migrating to AWS, a company wants to estimate their monthly costs for a specific architecture. Which tool should they use?",o:["AWS Cost Explorer","AWS Budgets","AWS Pricing Calculator","Migration Evaluator"],c:[2],e:"AWS Pricing Calculator lets you build cost estimates for AWS architectures before you deploy. You specify services, regions, and usage and it produces a monthly cost estimate."},
  {d:"Billing, Pricing, and Support",t:"single",q:"A company wants to identify underutilized EC2 instances and over-provisioned resources to reduce their AWS bill. Which service provides these recommendations?",o:["AWS Cost Explorer","AWS Trusted Advisor","AWS Budgets","AWS Compute Optimizer"],c:[3],e:"AWS Compute Optimizer analyzes actual usage patterns and recommends optimal AWS resource configurations to reduce cost and improve performance."},
  {d:"Billing, Pricing, and Support",t:"single",q:"A startup needs basic AWS support with 24/7 access to customer service and documentation but has a very limited budget. Which support plan meets this need?",o:["Basic Support","Developer Support","Business Support","Enterprise Support"],c:[0],e:"Basic Support is free for all AWS accounts and includes 24/7 access to customer service, documentation, whitepapers, and AWS re:Post forums."},
  {d:"Billing, Pricing, and Support",t:"multi",q:"A company wants to understand all charges on their AWS bill broken down by service, account, and resource tag. Which TWO tools help with this analysis?",o:["AWS Cost Explorer","AWS Budgets","AWS Cost and Usage Reports","AWS Pricing Calculator","AWS Trusted Advisor"],c:[0,2],e:"AWS Cost Explorer provides interactive visualizations of cost and usage data. AWS Cost and Usage Reports provide the most detailed billing data available for custom analysis."},
  {d:"Billing, Pricing, and Support",t:"single",q:"A company's production application went down due to an AWS service issue. They need a response from AWS within 1 hour. Which support plan provides this?",o:["Basic Support","Developer Support","Business Support","Enterprise Support"],c:[2],e:"Business Support provides less than 1-hour response time for production system down cases. Developer Support targets less than 12 hours for system impaired."},
  {d:"Cloud Technology and Services",t:"single",q:"A company wants to receive automatic alerts when an AWS service they use is experiencing issues or planned maintenance. Which service provides this?",o:["Amazon CloudWatch","AWS CloudTrail","AWS Health Dashboard","AWS Trusted Advisor"],c:[2],e:"AWS Health Dashboard provides personalized alerts and remediation guidance for AWS events that might affect your specific resources, including planned maintenance windows."},
  {d:"Cloud Technology and Services",t:"single",q:"A company needs to orchestrate a multi-step order processing workflow where each step must complete before the next begins, with error handling at each stage. Which service is designed for this?",o:["Amazon SQS","Amazon SNS","AWS Step Functions","Amazon EventBridge"],c:[2],e:"AWS Step Functions visually orchestrates multi-step workflows using state machines. It handles sequencing, error handling, retries, and parallel execution."},
  {d:"Cloud Technology and Services",t:"single",q:"A company wants to monitor CPU utilization of EC2 instances and automatically alert when it exceeds 80% for more than 5 minutes. Which service handles this?",o:["AWS CloudTrail","AWS Config","Amazon CloudWatch","AWS Trusted Advisor"],c:[2],e:"Amazon CloudWatch collects and monitors metrics from AWS resources. CloudWatch Alarms can trigger notifications when metrics exceed defined thresholds for specified periods."},
  {d:"Cloud Technology and Services",t:"single",q:"A company wants to build a serverless REST API that triggers Lambda functions and scales automatically. Which service should they use?",o:["Amazon Route 53","Amazon CloudFront","Amazon API Gateway","AWS App Runner"],c:[2],e:"Amazon API Gateway creates and manages REST, HTTP, and WebSocket APIs. Combined with Lambda, it provides a fully serverless API architecture with automatic scaling."},
  {d:"Security and Compliance",t:"single",q:"A company stores sensitive customer data in S3 and needs to automatically discover and classify this data using machine learning. Which service provides this?",o:["Amazon GuardDuty","Amazon Inspector","Amazon Macie","AWS Security Hub"],c:[2],e:"Amazon Macie uses ML to automatically discover and classify sensitive data in S3 such as PII and financial data, and alerts on potential data security risks."},
  {d:"Cloud Concepts",t:"single",q:"A company wants to deploy AWS infrastructure using code that can be version-controlled and repeatedly deployed consistently. Which approach does this represent?",o:["Infrastructure as Code (IaC)","Platform as a Service (PaaS)","Software as a Service (SaaS)","Containerization"],c:[0],e:"Infrastructure as Code means defining and provisioning infrastructure through code like AWS CloudFormation. It enables version control, repeatable deployments, and consistency across environments."},
  {d:"Cloud Technology and Services",t:"single",q:"A company needs to analyze petabytes of structured data using standard SQL queries without setting up or managing a database. Which AWS service should they use?",o:["Amazon RDS","Amazon Redshift","Amazon Athena","Amazon DynamoDB"],c:[2],e:"Amazon Athena is a serverless interactive query service that lets you analyze data in S3 using standard SQL. There is no infrastructure to manage — you pay only per query."},
  {d:"Cloud Technology and Services",t:"single",q:"A company wants to automatically back up data from their on-premises servers to AWS without disrupting existing applications. Which service provides a hybrid storage gateway?",o:["AWS Snowball","AWS DataSync","AWS Storage Gateway","Amazon S3 Transfer Acceleration"],c:[2],e:"AWS Storage Gateway is a hybrid cloud storage service that gives on-premises applications access to AWS cloud storage for backup and archiving without disrupting existing workflows."},
  {d:"Security and Compliance",t:"single",q:"A company needs to centrally manage firewall rules across multiple AWS accounts and VPCs from a single place. Which service enables this?",o:["AWS WAF","AWS Shield","AWS Firewall Manager","AWS Network Firewall"],c:[2],e:"AWS Firewall Manager is a security management service that allows you to centrally configure and manage firewall rules including WAF rules and Shield protections across multiple accounts."},
  {d:"Cloud Concepts",t:"single",q:"Which AWS Well-Architected Framework pillar focuses on minimizing the environmental impact of running cloud workloads?",o:["Cost optimization","Performance efficiency","Reliability","Sustainability"],c:[3],e:"The Sustainability pillar focuses on minimizing energy consumption and maximizing efficiency of AWS workloads to reduce carbon footprint."},
  {d:"Billing, Pricing, and Support",t:"single",q:"A company wants flexibility to change EC2 instance families and sizes while still receiving a discount over On-Demand pricing. Which option best fits?",o:["Standard Reserved Instances","Convertible Reserved Instances","Spot Instances","Savings Plans"],c:[3],e:"Savings Plans offer flexible discounts over On-Demand in exchange for a commitment to a consistent amount of usage. They apply across instance families, sizes, and Regions — providing the most flexibility."},
  {d:"Cloud Technology and Services",t:"single",q:"A company wants to send automated order confirmation emails to customers at scale. Which AWS service is purpose-built for this?",o:["Amazon SNS","Amazon SES","Amazon Pinpoint","Amazon Connect"],c:[1],e:"Amazon SES (Simple Email Service) is a cloud-based email sending service designed for transactional and marketing emails at scale. SNS is for pub/sub notifications; Connect is a call center service."},
  {d:"Security and Compliance",t:"single",q:"A company wants to continuously assess their EC2 instances for software vulnerabilities and unintended network exposure. Which service automates this?",o:["Amazon GuardDuty","Amazon Inspector","AWS Config","AWS Trusted Advisor"],c:[1],e:"Amazon Inspector is an automated vulnerability management service that continuously scans EC2 instances and container images for software vulnerabilities and unintended network exposure."},
  {d:"Cloud Technology and Services",t:"single",q:"A company needs a managed message queue that decouples application components so messages are not lost if one service slows down. Which service provides this?",o:["Amazon SNS","Amazon SQS","AWS Step Functions","Amazon EventBridge"],c:[1],e:"Amazon SQS is a fully managed message queuing service that decouples and scales microservices. Messages are stored durably until processed, ensuring no messages are lost even if a service is temporarily unavailable."},
  {d:"Cloud Concepts",t:"single",q:"A company is planning a migration and wants to decommission legacy applications that are no longer needed. Which migration strategy does this represent?",o:["Rehost","Retire","Retain","Re-platform"],c:[1],e:"Retire means decommissioning applications that are no longer needed. It reduces the migration scope and eliminates unnecessary costs."},
  {d:"Security and Compliance",t:"single",q:"A company uses AWS across multiple accounts and wants a unified view of security alerts and findings from GuardDuty, Inspector, and Macie in one place. Which service aggregates these findings?",o:["AWS Config","AWS CloudTrail","AWS Security Hub","AWS Trusted Advisor"],c:[2],e:"AWS Security Hub aggregates, organizes, and prioritizes security findings from multiple AWS services into a single dashboard, providing a comprehensive view of your security posture."},
  {d:"Billing, Pricing, and Support",t:"single",q:"A company wants to allocate AWS costs to specific projects and departments for internal chargeback reporting. Which AWS feature enables this?",o:["AWS Organizations SCPs","AWS Cost and Usage Reports","Resource tagging with cost allocation tags","AWS Budgets alerts"],c:[2],e:"Cost allocation tags let you label AWS resources with key-value pairs (e.g. Project:Marketing). After activating tags, they appear in Cost Explorer and Cost and Usage Reports for detailed cost allocation."},
  {d:"Cloud Technology and Services",t:"single",q:"A company needs to deploy the same application infrastructure across 50 AWS accounts consistently. Which service allows them to define the infrastructure once and deploy it repeatedly?",o:["AWS Elastic Beanstalk","AWS CloudFormation","AWS Systems Manager","AWS OpsWorks"],c:[1],e:"AWS CloudFormation lets you model and provision AWS infrastructure as code using templates. The same template can be deployed across multiple accounts and Regions, ensuring consistency."},
  {d:"Cloud Technology and Services",t:"single",q:"A company's application experiences slow database queries due to repeatedly fetching the same data. They want an in-memory caching layer to reduce database load. Which service should they use?",o:["Amazon RDS Read Replicas","Amazon DynamoDB Accelerator (DAX)","Amazon ElastiCache","Amazon Redshift"],c:[2],e:"Amazon ElastiCache is a fully managed in-memory caching service supporting Redis and Memcached. It caches frequently accessed data, dramatically reducing database load and response times."},
  {d:"Cloud Concepts",t:"single",q:"A company wants to stop maintaining their own physical data center and move everything to AWS with no on-premises infrastructure remaining. Which deployment model is this?",o:["Hybrid cloud","Private cloud","Full cloud deployment","Multi-cloud deployment"],c:[2],e:"A full cloud deployment means all components run in the cloud with no legacy on-premises infrastructure. This is sometimes called cloud-native or all-in migration. Hybrid retains some on-premises infrastructure."},
];

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

// Shuffle array using Fisher-Yates
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Track answer distribution to ensure equal spread
const answerDistribution = { A: 0, B: 0, C: 0, D: 0 };

function getTargetPosition(currentDistribution, numOptions) {
  // Find the letter with the lowest count to balance distribution
  const letters = LETTERS.slice(0, numOptions);
  let minCount = Infinity;
  let targetLetter = letters[0];
  for (const l of letters) {
    if ((currentDistribution[l] || 0) < minCount) {
      minCount = currentDistribution[l] || 0;
      targetLetter = l;
    }
  }
  return targetLetter;
}

function processQuestion(raw, index, totalSingle) {
  const isSingle = raw.t === 'single';
  const numOptions = raw.o.length;
  
  if (isSingle) {
    const correctIdx = raw.c[0];
    const correctText = raw.o[correctIdx];
    const wrongOptions = raw.o.filter((_, i) => i !== correctIdx);
    
    // Shuffle wrong options
    const shuffledWrong = shuffle(wrongOptions);
    
    // Determine target position for correct answer to balance distribution
    const targetLetter = getTargetPosition(answerDistribution, numOptions);
    const targetIdx = LETTERS.indexOf(targetLetter);
    
    // Build final options array with correct answer at target position
    const finalOptions = [...shuffledWrong];
    finalOptions.splice(targetIdx, 0, correctText);
    
    // Update distribution
    answerDistribution[targetLetter] = (answerDistribution[targetLetter] || 0) + 1;
    
    return {
      certification: 'CLF-C02',
      topic: raw.d,
      question_text: raw.q,
      options: JSON.stringify(finalOptions),
      correct_answers: JSON.stringify([targetLetter]),
      explanation: raw.e,
      question_type: 'single',
    };
  } else {
    // Multi-select: shuffle all options and track which ones are correct
    const correctTexts = raw.c.map(i => raw.o[i]);
    const allOptions = shuffle(raw.o);
    const correctLetters = correctTexts.map(ct => {
      const idx = allOptions.indexOf(ct);
      return LETTERS[idx];
    }).sort();
    
    return {
      certification: 'CLF-C02',
      topic: raw.d,
      question_text: raw.q,
      options: JSON.stringify(allOptions),
      correct_answers: JSON.stringify(correctLetters),
      explanation: raw.e,
      question_type: 'multiple',
    };
  }
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log(`Processing ${RAW_QUESTIONS.length} questions...`);
  
  // Process all questions
  const processed = RAW_QUESTIONS.map((q, i) => processQuestion(q, i, RAW_QUESTIONS.filter(x => x.t === 'single').length));
  
  // Show distribution
  console.log('Answer distribution:', answerDistribution);
  
  // Delete existing CLF-C02 questions
  const [deleteResult] = await conn.execute('DELETE FROM aws_questions WHERE certification = ?', ['CLF-C02']);
  console.log(`Deleted ${deleteResult.affectedRows} existing CLF-C02 questions`);
  
  // Insert new questions
  let inserted = 0;
  for (const q of processed) {
    await conn.execute(
      'INSERT INTO aws_questions (certification, topic, question_text, options, correct_answers, explanation, question_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [q.certification, q.topic, q.question_text, q.options, q.correct_answers, q.explanation, q.question_type]
    );
    inserted++;
  }
  
  console.log(`Inserted ${inserted} new CLF-C02 questions`);
  
  // Verify
  const [cnt] = await conn.execute('SELECT COUNT(*) as cnt FROM aws_questions WHERE certification = ?', ['CLF-C02']);
  console.log(`Verification: ${cnt[0].cnt} CLF-C02 questions now in database`);
  
  // Show domain breakdown
  const [domains] = await conn.execute('SELECT topic, COUNT(*) as cnt FROM aws_questions WHERE certification = ? GROUP BY topic', ['CLF-C02']);
  console.log('Domain breakdown:', JSON.stringify(domains, null, 2));
  
  await conn.end();
  console.log('Done!');
}

main().catch(console.error);
