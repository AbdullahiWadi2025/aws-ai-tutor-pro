import { useState, useCallback, useRef, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  ConnectionLineType,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  Handle,
  Position,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Save,
  FolderOpen,
  Trash2,
  Plus,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  PanelRightOpen,
  PanelRightClose,
  ArrowLeft,
} from "lucide-react";
import { useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Streamdown } from "streamdown";

// ─── Official AWS SVG icon URLs from icepanel.io (official AWS icon set) ───────
const AWS_SERVICES = [
  // General
  { id: "user", label: "User", category: "General", color: "#64748b", iconUrl: "" },
  { id: "internet", label: "Internet", category: "General", color: "#64748b", iconUrl: "" },
  { id: "mobile", label: "Mobile User", category: "General", color: "#64748b", iconUrl: "" },
  { id: "browser", label: "Browser", category: "General", color: "#64748b", iconUrl: "" },
  // Compute
  { id: "ec2", label: "EC2", category: "Compute", color: "#FF9900", iconUrl: "https://icon.icepanel.io/AWS/svg/Compute/EC2.svg" },
  { id: "lambda", label: "Lambda", category: "Compute", color: "#FF9900", iconUrl: "https://icon.icepanel.io/AWS/svg/Compute/Lambda.svg" },
  { id: "ecs", label: "ECS", category: "Compute", color: "#FF9900", iconUrl: "https://icon.icepanel.io/AWS/svg/Containers/Elastic-Container-Service.svg" },
  { id: "eks", label: "EKS", category: "Compute", color: "#FF9900", iconUrl: "https://icon.icepanel.io/AWS/svg/Containers/Elastic-Kubernetes-Service.svg" },
  { id: "beanstalk", label: "Elastic Beanstalk", category: "Compute", color: "#FF9900", iconUrl: "https://icon.icepanel.io/AWS/svg/Compute/Elastic-Beanstalk.svg" },
  { id: "fargate", label: "Fargate", category: "Compute", color: "#FF9900", iconUrl: "https://icon.icepanel.io/AWS/svg/Containers/Fargate.svg" },
  { id: "lightsail", label: "Lightsail", category: "Compute", color: "#FF9900", iconUrl: "https://icon.icepanel.io/AWS/svg/Compute/Lightsail.svg" },
  { id: "batch", label: "Batch", category: "Compute", color: "#FF9900", iconUrl: "https://icon.icepanel.io/AWS/svg/Compute/Batch.svg" },
  // Storage
  { id: "s3", label: "S3", category: "Storage", color: "#3F8624", iconUrl: "https://icon.icepanel.io/AWS/svg/Storage/Simple-Storage-Service.svg" },
  { id: "ebs", label: "EBS", category: "Storage", color: "#3F8624", iconUrl: "https://icon.icepanel.io/AWS/svg/Storage/Elastic-Block-Store.svg" },
  { id: "efs", label: "EFS", category: "Storage", color: "#3F8624", iconUrl: "https://icon.icepanel.io/AWS/svg/Storage/Elastic-File-System.svg" },
  { id: "glacier", label: "S3 Glacier", category: "Storage", color: "#3F8624", iconUrl: "https://icon.icepanel.io/AWS/svg/Storage/Simple-Storage-Service-Glacier.svg" },
  { id: "fsx", label: "FSx", category: "Storage", color: "#3F8624", iconUrl: "https://icon.icepanel.io/AWS/svg/Storage/FSx.svg" },
  { id: "storagegateway", label: "Storage Gateway", category: "Storage", color: "#3F8624", iconUrl: "https://icon.icepanel.io/AWS/svg/Storage/Storage-Gateway.svg" },
  // Database
  { id: "rds", label: "RDS", category: "Database", color: "#2E73B8", iconUrl: "https://icon.icepanel.io/AWS/svg/Database/RDS.svg" },
  { id: "dynamodb", label: "DynamoDB", category: "Database", color: "#2E73B8", iconUrl: "https://icon.icepanel.io/AWS/svg/Database/DynamoDB.svg" },
  { id: "elasticache", label: "ElastiCache", category: "Database", color: "#2E73B8", iconUrl: "https://icon.icepanel.io/AWS/svg/Database/ElastiCache.svg" },
  { id: "aurora", label: "Aurora", category: "Database", color: "#2E73B8", iconUrl: "https://icon.icepanel.io/AWS/svg/Database/Aurora.svg" },
  { id: "redshift", label: "Redshift", category: "Database", color: "#2E73B8", iconUrl: "https://icon.icepanel.io/AWS/svg/Database/Redshift.svg" },
  { id: "neptune", label: "Neptune", category: "Database", color: "#2E73B8", iconUrl: "https://icon.icepanel.io/AWS/svg/Database/Neptune.svg" },
  { id: "documentdb", label: "DocumentDB", category: "Database", color: "#2E73B8", iconUrl: "https://icon.icepanel.io/AWS/svg/Database/DocumentDB.svg" },
  // Networking
  { id: "vpc", label: "VPC", category: "Networking", color: "#8C4FFF", iconUrl: "https://icon.icepanel.io/AWS/svg/Networking-Content-Delivery/Virtual-Private-Cloud.svg" },
  { id: "cloudfront", label: "CloudFront", category: "Networking", color: "#8C4FFF", iconUrl: "https://icon.icepanel.io/AWS/svg/Networking-Content-Delivery/CloudFront.svg" },
  { id: "route53", label: "Route 53", category: "Networking", color: "#8C4FFF", iconUrl: "https://icon.icepanel.io/AWS/svg/Networking-Content-Delivery/Route-53.svg" },
  { id: "alb", label: "Load Balancer", category: "Networking", color: "#8C4FFF", iconUrl: "https://icon.icepanel.io/AWS/svg/Networking-Content-Delivery/Elastic-Load-Balancing.svg" },
  { id: "apigateway", label: "API Gateway", category: "Networking", color: "#8C4FFF", iconUrl: "https://icon.icepanel.io/AWS/svg/App-Integration/API-Gateway.svg" },
  { id: "directconnect", label: "Direct Connect", category: "Networking", color: "#8C4FFF", iconUrl: "https://icon.icepanel.io/AWS/svg/Networking-Content-Delivery/Direct-Connect.svg" },
  { id: "transitgateway", label: "Transit Gateway", category: "Networking", color: "#8C4FFF", iconUrl: "https://icon.icepanel.io/AWS/svg/Networking-Content-Delivery/Transit-Gateway.svg" },
  // Messaging
  { id: "sqs", label: "SQS", category: "Messaging", color: "#E7157B", iconUrl: "https://icon.icepanel.io/AWS/svg/App-Integration/Simple-Queue-Service.svg" },
  { id: "sns", label: "SNS", category: "Messaging", color: "#E7157B", iconUrl: "https://icon.icepanel.io/AWS/svg/App-Integration/Simple-Notification-Service.svg" },
  { id: "kinesis", label: "Kinesis", category: "Messaging", color: "#E7157B", iconUrl: "https://icon.icepanel.io/AWS/svg/Analytics/Kinesis.svg" },
  { id: "eventbridge", label: "EventBridge", category: "Messaging", color: "#E7157B", iconUrl: "https://icon.icepanel.io/AWS/svg/App-Integration/EventBridge.svg" },
  { id: "mq", label: "Amazon MQ", category: "Messaging", color: "#E7157B", iconUrl: "https://icon.icepanel.io/AWS/svg/App-Integration/MQ.svg" },
  { id: "stepfunctions", label: "Step Functions", category: "Messaging", color: "#E7157B", iconUrl: "https://icon.icepanel.io/AWS/svg/App-Integration/Step-Functions.svg" },
  // Security
  { id: "iam", label: "IAM", category: "Security", color: "#DD344C", iconUrl: "https://icon.icepanel.io/AWS/svg/Security-Identity-Compliance/Identity-and-Access-Management.svg" },
  { id: "cognito", label: "Cognito", category: "Security", color: "#DD344C", iconUrl: "https://icon.icepanel.io/AWS/svg/Security-Identity-Compliance/Cognito.svg" },
  { id: "waf", label: "WAF", category: "Security", color: "#DD344C", iconUrl: "https://icon.icepanel.io/AWS/svg/Security-Identity-Compliance/WAF.svg" },
  { id: "kms", label: "KMS", category: "Security", color: "#DD344C", iconUrl: "https://icon.icepanel.io/AWS/svg/Security-Identity-Compliance/Key-Management-Service.svg" },
  { id: "shield", label: "Shield", category: "Security", color: "#DD344C", iconUrl: "https://icon.icepanel.io/AWS/svg/Security-Identity-Compliance/Shield.svg" },
  { id: "secretsmanager", label: "Secrets Manager", category: "Security", color: "#DD344C", iconUrl: "https://icon.icepanel.io/AWS/svg/Security-Identity-Compliance/Secrets-Manager.svg" },
  { id: "guardduty", label: "GuardDuty", category: "Security", color: "#DD344C", iconUrl: "https://icon.icepanel.io/AWS/svg/Security-Identity-Compliance/GuardDuty.svg" },
  // Monitoring
  { id: "cloudwatch", label: "CloudWatch", category: "Monitoring", color: "#E7157B", iconUrl: "https://icon.icepanel.io/AWS/svg/Management-Governance/CloudWatch.svg" },
  { id: "cloudtrail", label: "CloudTrail", category: "Monitoring", color: "#E7157B", iconUrl: "https://icon.icepanel.io/AWS/svg/Management-Governance/CloudTrail.svg" },
  { id: "xray", label: "X-Ray", category: "Monitoring", color: "#E7157B", iconUrl: "https://icon.icepanel.io/AWS/svg/Developer-Tools/X-Ray.svg" },
  { id: "config", label: "AWS Config", category: "Monitoring", color: "#E7157B", iconUrl: "https://icon.icepanel.io/AWS/svg/Management-Governance/Config.svg" },
  { id: "trustedadvisor", label: "Trusted Advisor", category: "Monitoring", color: "#E7157B", iconUrl: "https://icon.icepanel.io/AWS/svg/Management-Governance/Trusted-Advisor.svg" },
  // AI/ML
  { id: "sagemaker", label: "SageMaker", category: "AI/ML", color: "#01A88D", iconUrl: "https://icon.icepanel.io/AWS/svg/Machine-Learning/SageMaker.svg" },
  { id: "rekognition", label: "Rekognition", category: "AI/ML", color: "#01A88D", iconUrl: "https://icon.icepanel.io/AWS/svg/Machine-Learning/Rekognition.svg" },
  { id: "bedrock", label: "Bedrock", category: "AI/ML", color: "#01A88D", iconUrl: "https://icon.icepanel.io/AWS/svg/Machine-Learning/Bedrock.svg" },
  { id: "comprehend", label: "Comprehend", category: "AI/ML", color: "#01A88D", iconUrl: "https://icon.icepanel.io/AWS/svg/Machine-Learning/Comprehend.svg" },
  { id: "textract", label: "Textract", category: "AI/ML", color: "#01A88D", iconUrl: "https://icon.icepanel.io/AWS/svg/Machine-Learning/Textract.svg" },
  { id: "polly", label: "Polly", category: "AI/ML", color: "#01A88D", iconUrl: "https://icon.icepanel.io/AWS/svg/Machine-Learning/Polly.svg" },
  // DevOps
  { id: "codepipeline", label: "CodePipeline", category: "DevOps", color: "#C7131F", iconUrl: "https://icon.icepanel.io/AWS/svg/Developer-Tools/CodePipeline.svg" },
  { id: "codebuild", label: "CodeBuild", category: "DevOps", color: "#C7131F", iconUrl: "https://icon.icepanel.io/AWS/svg/Developer-Tools/CodeBuild.svg" },
  { id: "codecommit", label: "CodeCommit", category: "DevOps", color: "#C7131F", iconUrl: "https://icon.icepanel.io/AWS/svg/Developer-Tools/CodeCommit.svg" },
  { id: "codedeploy", label: "CodeDeploy", category: "DevOps", color: "#C7131F", iconUrl: "https://icon.icepanel.io/AWS/svg/Developer-Tools/CodeDeploy.svg" },
  { id: "cloudformation", label: "CloudFormation", category: "DevOps", color: "#C7131F", iconUrl: "https://icon.icepanel.io/AWS/svg/Management-Governance/CloudFormation.svg" },
  { id: "cdk", label: "CDK", category: "DevOps", color: "#C7131F", iconUrl: "https://icon.icepanel.io/AWS/svg/Developer-Tools/Cloud-Development-Kit.svg" },
];

const CATEGORIES = Array.from(new Set(AWS_SERVICES.map(s => s.category)));
const CATEGORY_COLORS: Record<string, string> = {
  General: "#64748b",
  Compute: "#FF9900",
  Storage: "#3F8624",
  Database: "#2E73B8",
  Networking: "#8C4FFF",
  Messaging: "#E7157B",
  Security: "#DD344C",
  Monitoring: "#E7157B",
  "AI/ML": "#01A88D",
  DevOps: "#C7131F",
};

// SVG icons for general nodes (rendered inline, no external URL needed)
const GENERAL_ICONS: Record<string, React.ReactNode> = {
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  internet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <circle cx="12" cy="12" r="9" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  mobile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="17" r="1" />
    </svg>
  ),
  browser: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M2 8h20" />
      <circle cx="6" cy="5.5" r="0.8" fill="#64748b" />
      <circle cx="9" cy="5.5" r="0.8" fill="#64748b" />
    </svg>
  ),
};

// ─── General (User/Internet) Node ────────────────────────────────────────────
function GeneralNode({ data }: { data: { label: string; iconUrl: string; color: string; category: string } }) {
  const icon = GENERAL_ICONS[data.iconUrl] ?? GENERAL_ICONS["user"];
  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-xl border-2 shadow-lg select-none"
      style={{
        width: 90,
        minHeight: 80,
        background: "#1e293b",
        borderColor: "#475569",
        borderStyle: "dashed",
        padding: "8px 6px",
        cursor: "grab",
      }}
      onMouseDown={(e) => { (e.currentTarget as HTMLDivElement).style.cursor = "grabbing"; }}
      onMouseUp={(e) => { (e.currentTarget as HTMLDivElement).style.cursor = "grab"; }}
    >
      <Handle type="source" id="top-s" position={Position.Top} style={{ background: "#64748b", width: 8, height: 8 }} />
      <Handle type="target" id="top-t" position={Position.Top} style={{ background: "#64748b", width: 8, height: 8, opacity: 0, pointerEvents: "all" }} />
      <Handle type="source" id="bottom-s" position={Position.Bottom} style={{ background: "#64748b", width: 8, height: 8 }} />
      <Handle type="target" id="bottom-t" position={Position.Bottom} style={{ background: "#64748b", width: 8, height: 8, opacity: 0, pointerEvents: "all" }} />
      <Handle type="source" id="left-s" position={Position.Left} style={{ background: "#64748b", width: 8, height: 8 }} />
      <Handle type="target" id="left-t" position={Position.Left} style={{ background: "#64748b", width: 8, height: 8, opacity: 0, pointerEvents: "all" }} />
      <Handle type="source" id="right-s" position={Position.Right} style={{ background: "#64748b", width: 8, height: 8 }} />
      <Handle type="target" id="right-t" position={Position.Right} style={{ background: "#64748b", width: 8, height: 8, opacity: 0, pointerEvents: "all" }} />
      <div className="flex items-center justify-center mb-1" style={{ width: 36, height: 36 }}>
        {icon}
      </div>
      <div className="text-[10px] font-bold text-center leading-tight text-slate-300">
        {data.label}
      </div>
    </div>
  );
}

// ─── Custom AWS Node with official SVG icon ───────────────────────────────────
function AwsServiceNode({ data }: { data: { label: string; iconUrl: string; color: string; category: string } }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-xl border-2 shadow-lg select-none"
      style={{
        width: 100,
        minHeight: 88,
        background: `${data.color}18`,
        borderColor: data.color,
        padding: "8px 6px",
        cursor: "grab",
      }}
      onMouseDown={(e) => { (e.currentTarget as HTMLDivElement).style.cursor = "grabbing"; }}
      onMouseUp={(e) => { (e.currentTarget as HTMLDivElement).style.cursor = "grab"; }}
    >
      {/* Each side has both a source and target handle so connections work in any direction */}
      <Handle type="source" id="top-s" position={Position.Top} style={{ background: data.color, width: 8, height: 8 }} />
      <Handle type="target" id="top-t" position={Position.Top} style={{ background: data.color, width: 8, height: 8, opacity: 0, pointerEvents: "all" }} />
      <Handle type="source" id="bottom-s" position={Position.Bottom} style={{ background: data.color, width: 8, height: 8 }} />
      <Handle type="target" id="bottom-t" position={Position.Bottom} style={{ background: data.color, width: 8, height: 8, opacity: 0, pointerEvents: "all" }} />
      <Handle type="source" id="left-s" position={Position.Left} style={{ background: data.color, width: 8, height: 8 }} />
      <Handle type="target" id="left-t" position={Position.Left} style={{ background: data.color, width: 8, height: 8, opacity: 0, pointerEvents: "all" }} />
      <Handle type="source" id="right-s" position={Position.Right} style={{ background: data.color, width: 8, height: 8 }} />
      <Handle type="target" id="right-t" position={Position.Right} style={{ background: data.color, width: 8, height: 8, opacity: 0, pointerEvents: "all" }} />
      <div className="flex items-center justify-center rounded-lg mb-1" style={{ background: "white", width: 40, height: 40, padding: 4 }}>
        <img
          src={data.iconUrl}
          alt={data.label}
          className="w-8 h-8 object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>
      <div className="text-[10px] font-bold text-center leading-tight" style={{ color: data.color }}>
        {data.label}
      </div>
      <div className="text-[8px] text-center mt-0.5 opacity-60" style={{ color: data.color }}>
        {data.category}
      </div>
    </div>
  );
}

// ─── Custom Text Label Node ───────────────────────────────────────────────────
function TextLabelNode({ data }: { data: { label: string } }) {
  return (
    <div className="px-3 py-2 rounded border border-dashed border-gray-400 bg-gray-800/50 text-gray-300 text-xs font-medium min-w-[80px] text-center">
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      {data.label}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  awsService: AwsServiceNode,
  generalNode: GeneralNode,
  textLabel: TextLabelNode,
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DiagramBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [, setLocation] = useLocation();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [diagramName, setDiagramName] = useState("Untitled Diagram");
  const [currentDiagramId, setCurrentDiagramId] = useState<number | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null); // null = show search results
  const [searchQuery, setSearchQuery] = useState("");
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const nodeIdCounter = useRef(1);

  const utils = trpc.useUtils();
  const { data: savedDiagrams } = trpc.diagram.list.useQuery();
  const saveMutation = trpc.diagram.save.useMutation({
    onSuccess: (data) => {
      setCurrentDiagramId(data.id);
      utils.diagram.list.invalidate();
      toast.success("Diagram saved!");
    },
    onError: () => toast.error("Failed to save diagram"),
  });
  const generateMutation = trpc.diagram.generateFromDescription.useMutation({
    onSuccess: (data) => {
      // Build React Flow nodes from AI response
      const newNodes: Node[] = data.nodes.map((n, i) => {
        const service = AWS_SERVICES.find(s => s.id === n.serviceId);
        const id = `ai-node-${nodeIdCounter.current++}`;
        const isGeneral = service?.category === "General";
        return {
          id,
          type: isGeneral ? "generalNode" : "awsService",
          position: { x: n.x, y: n.y },
          data: {
            label: n.label || service?.label || n.serviceId,
            iconUrl: isGeneral ? n.serviceId : (service?.iconUrl ?? `https://icon.icepanel.io/AWS/svg/Compute/EC2.svg`),
            color: service?.color ?? "#FF9900",
            category: service?.category ?? "AWS",
          },
          _aiIndex: i,
        } as Node & { _aiIndex: number };
      });

      const newEdges: Edge[] = data.edges
        .filter(e => e.from !== e.to && e.from < newNodes.length && e.to < newNodes.length)
        .map((e, i) => {
          const srcNode = newNodes[e.from];
          const tgtNode = newNodes[e.to];
          // Pick source/target handles based on relative positions to avoid top-routing
          const srcX = srcNode.position.x;
          const tgtX = tgtNode.position.x;
          const srcY = srcNode.position.y;
          const tgtY = tgtNode.position.y;
          const dx = tgtX - srcX;
          const dy = tgtY - srcY;
          let sourceHandle: string;
          let targetHandle: string;
          if (Math.abs(dx) >= Math.abs(dy)) {
            // Primarily horizontal
            sourceHandle = dx >= 0 ? "right-s" : "left-s";
            targetHandle = dx >= 0 ? "left-t" : "right-t";
          } else {
            // Primarily vertical
            sourceHandle = dy >= 0 ? "bottom-s" : "top-s";
            targetHandle = dy >= 0 ? "top-t" : "bottom-t";
          }
          return {
            id: `ai-edge-${i}`,
            source: srcNode.id,
            target: tgtNode.id,
            sourceHandle,
            targetHandle,
            label: e.label || undefined,
            type: "smoothstep",
            animated: false,
            style: { stroke: "#818cf8", strokeWidth: 2 },
            markerEnd: { type: "arrowclosed" as any, color: "#818cf8", width: 18, height: 18 },
          };
        });

      setNodes(newNodes);
      setEdges(newEdges);
      setAiPanelOpen(false);
      toast.success(`Generated ${newNodes.length} services and ${newEdges.length} connections`);
      // Auto-explain after generation
      const nodeData = newNodes.map(n => ({ serviceId: (n.data as any).category === "General" ? (n.data as any).iconUrl : (n.data as any).iconUrl?.split("/").pop()?.replace(".svg", "").toLowerCase() ?? "ec2", label: (n.data as any).label as string }));
      const edgeData = (data.edges as { from: number; to: number; label: string }[])
        .filter(e => e.from !== e.to && e.from < newNodes.length && e.to < newNodes.length)
        .map(e => ({ from: e.from, to: e.to, label: e.label || "" }));
      explainMutation.mutate({ nodes: nodeData, edges: edgeData });
    },
    onError: (err) => toast.error(err.message || "Failed to generate diagram"),
  });

  const deleteMutation = trpc.diagram.delete.useMutation({
    onSuccess: () => {
      utils.diagram.list.invalidate();
      toast.success("Diagram deleted");
    },
  });

  const explainMutation = trpc.diagram.explainDiagram.useMutation({
    onSuccess: (data) => {
      setExplanation(data.explanation);
      setExplainerOpen(true);
    },
    onError: (err) => toast.error(err.message || "Failed to explain diagram"),
  });

  const handleExplain = () => {
    if (nodes.length === 0) { toast.error("Add some services to the canvas first"); return; }
    const nodeData = nodes.map(n => ({ serviceId: (n.data as any).category === "General" ? (n.data as any).iconUrl : (n.data as any).iconUrl?.split("/").pop()?.replace(".svg", "").toLowerCase() ?? "ec2", label: (n.data as any).label as string }));
    const edgeData = edges.map(e => {
      const srcIdx = nodes.findIndex(n => n.id === e.source);
      const tgtIdx = nodes.findIndex(n => n.id === e.target);
      return { from: srcIdx, to: tgtIdx, label: (e.label as string) || "" };
    }).filter(e => e.from >= 0 && e.to >= 0);
    explainMutation.mutate({ nodes: nodeData, edges: edgeData });
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: "smoothstep",
      animated: false,
      style: { stroke: "#818cf8", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed" as any, color: "#818cf8", width: 18, height: 18 },
    }, eds)),
    [setEdges]
  );

  const addServiceNode = useCallback(
    (service: typeof AWS_SERVICES[0]) => {
      const id = `node-${nodeIdCounter.current++}`;
      const isGeneral = service.category === "General";
      const newNode: Node = {
        id,
        type: isGeneral ? "generalNode" : "awsService",
        position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
        // For general nodes, iconUrl stores the serviceId so GeneralNode can look up the SVG
        data: { label: service.label, iconUrl: isGeneral ? service.id : service.iconUrl, color: service.color, category: service.category },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleSave = () => {
    saveMutation.mutate({
      id: currentDiagramId ?? undefined,
      name: diagramName,
      nodes,
      edges,
    });
  };

  const handleLoad = async (id: number, name: string) => {
    const result = await utils.diagram.get.fetch({ id });
    setNodes(result.nodes as Node[]);
    setEdges(result.edges as Edge[]);
    setDiagramName(name);
    setCurrentDiagramId(id);
    setLoadDialogOpen(false);
    toast.success(`Loaded "${name}"`);
  };

  const handleNew = () => {
    setNodes([]);
    setEdges([]);
    setDiagramName("Untitled Diagram");
    setCurrentDiagramId(null);
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
  };

  // Filter services: search query overrides category filter
  const filteredServices = useMemo(() => {
    if (searchQuery.trim()) {
      return AWS_SERVICES.filter(s =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeCategory) {
      return AWS_SERVICES.filter(s => s.category === activeCategory);
    }
    return AWS_SERVICES;
  }, [searchQuery, activeCategory]);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden" style={{ height: "calc(100vh - 64px)", position: "relative" }}>
      {/* ── Service Palette ── */}
      <div
        className={`flex flex-col border-r border-gray-800 bg-gray-900 transition-all duration-300 ${paletteOpen ? "w-60" : "w-10"}`}
      >
        <div className="flex items-center justify-between p-2 border-b border-gray-800">
          {paletteOpen && <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">AWS Services</span>}
          <button
            onClick={() => setPaletteOpen(p => !p)}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white ml-auto"
          >
            {paletteOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {paletteOpen && (
          <>
            {/* Search bar */}
            <div className="p-2 border-b border-gray-800">
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) setActiveCategory(null);
                  }}
                  placeholder="Search services..."
                  className="w-full bg-gray-800 border border-gray-700 rounded text-xs text-gray-200 placeholder-gray-500 pl-6 pr-6 py-1.5 focus:outline-none focus:border-indigo-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>

            {/* Category tabs — only show when not searching */}
            {!searchQuery && (
              <div className="flex flex-col gap-0.5 p-1 border-b border-gray-800 overflow-y-auto max-h-44">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`text-left text-xs px-2 py-1 rounded transition-colors ${activeCategory === null ? "bg-gray-700 text-white font-semibold" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"}`}
                >
                  All Services ({AWS_SERVICES.length})
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-left text-xs px-2 py-1 rounded transition-colors ${activeCategory === cat ? "text-white font-semibold" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"}`}
                    style={activeCategory === cat ? { background: `${CATEGORY_COLORS[cat]}30`, color: CATEGORY_COLORS[cat] } : {}}
                  >
                    {cat} ({AWS_SERVICES.filter(s => s.category === cat).length})
                  </button>
                ))}
              </div>
            )}

            {/* Service icons list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {searchQuery && (
                <p className="text-xs text-gray-500 px-1 pb-1">
                  {filteredServices.length} result{filteredServices.length !== 1 ? "s" : ""}
                </p>
              )}
              {filteredServices.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">No services found</p>
              )}
              {filteredServices.map(service => (
                <button
                  key={service.id}
                  onClick={() => addServiceNode(service)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs hover:bg-gray-800 transition-colors group"
                  title={`Add ${service.label} to canvas`}
                >
                  {service.category === "General" ? (
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: 22, height: 22 }}>
                      {GENERAL_ICONS[service.id]}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded flex-shrink-0" style={{ background: "white", width: 22, height: 22, padding: 2 }}>
                      <img
                        src={service.iconUrl}
                        alt={service.label}
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                      />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-gray-300 group-hover:text-white truncate leading-tight">{service.label}</span>
                    {(searchQuery || activeCategory === null) && (
                      <span className="text-gray-600 text-[9px] truncate">{service.category}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Canvas Area ── */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 bg-gray-900">
          <Button
            size="sm"
            variant="outline"
            onClick={() => nodes.length > 0 ? setShowLeaveDialog(true) : setLocation("/dashboard")}
            className="h-7 gap-1 text-xs border-gray-700 bg-transparent text-gray-400 hover:text-white hover:bg-gray-800 flex-shrink-0"
          >
            <ArrowLeft size={12} /> Dashboard
          </Button>
          <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
            <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Leave Diagram Builder?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  Any unsaved changes to your diagram will be lost. Make sure to save before leaving.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
                  Stay
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => setLocation("/dashboard")}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Leave without saving
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="w-px h-4 bg-gray-700 mx-1 flex-shrink-0" />
          <Input
            value={diagramName}
            onChange={e => setDiagramName(e.target.value)}
            className="h-7 w-48 text-sm bg-gray-800 border-gray-700 text-white"
          />
          <div className="flex items-center gap-1 ml-2">
            <Button size="sm" variant="outline" onClick={handleNew} className="h-7 gap-1 text-xs border-gray-700 bg-transparent text-gray-300 hover:text-white hover:bg-gray-800">
              <Plus size={12} /> New
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending} className="h-7 gap-1 text-xs bg-indigo-600 hover:bg-indigo-700">
              <Save size={12} /> {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs border-gray-700 bg-transparent text-gray-300 hover:text-white hover:bg-gray-800">
                  <FolderOpen size={12} /> Load
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>Load Diagram</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {savedDiagrams?.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No saved diagrams yet.</p>
                  )}
                  {savedDiagrams?.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-2 rounded bg-gray-800 hover:bg-gray-750">
                      <button className="flex-1 text-left text-sm text-gray-200 hover:text-white" onClick={() => handleLoad(d.id, d.name)}>
                        {d.name}
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate({ id: d.id })}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={handleClear} className="h-7 gap-1 text-xs border-gray-700 bg-transparent text-gray-300 hover:text-white hover:bg-gray-800">
              <RotateCcw size={12} /> Clear
            </Button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {currentDiagramId && <Badge variant="outline" className="text-xs border-green-700 text-green-400">Saved</Badge>}
            <span className="text-xs text-gray-500">{nodes.length} nodes · {edges.length} connections</span>
            <Button
              size="sm"
              onClick={handleExplain}
              disabled={explainMutation.isPending || nodes.length === 0}
              className="h-7 gap-1 text-xs bg-emerald-700 hover:bg-emerald-600 text-white"
            >
              {explainMutation.isPending ? (
                <span className="flex items-center gap-1"><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />Explaining...</span>
              ) : (
                <><BookOpen size={12} /> Explain</>  
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => setAiPanelOpen(p => !p)}
              className="h-7 gap-1 text-xs bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Sparkles size={12} />
              AI Generate
              {aiPanelOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </Button>
            {explanation && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setExplainerOpen(p => !p)}
                className="h-7 gap-1 text-xs border-emerald-700 text-emerald-400 hover:bg-emerald-900/30"
              >
                {explainerOpen ? <PanelRightClose size={12} /> : <PanelRightOpen size={12} />}
              </Button>
            )}
          </div>
        </div>

        {/* AI Description Panel */}
        {aiPanelOpen && (
          <div className="border-b border-gray-800 bg-gray-900/80 px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={13} className="text-violet-400" />
              <span className="text-xs font-semibold text-violet-300">Describe your architecture</span>
              <span className="text-xs text-gray-500 ml-1">— AI will build the diagram automatically</span>
            </div>
            <div className="flex gap-2 items-start">
              <textarea
                value={aiDescription}
                onChange={e => setAiDescription(e.target.value)}
                placeholder="e.g. A web app with users hitting CloudFront, which routes to an ALB, two EC2 instances, an RDS database, and S3 for static assets"
                className="flex-1 resize-none rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 px-3 py-2 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                rows={2}
                disabled={generateMutation.isPending}
              />
              <Button
                onClick={() => {
                  if (aiDescription.trim().length < 5) { toast.error("Please enter a description first"); return; }
                  generateMutation.mutate({ description: aiDescription.trim() });
                }}
                disabled={generateMutation.isPending || aiDescription.trim().length < 5}
                className="h-auto py-2 px-4 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold whitespace-nowrap"
              >
                {generateMutation.isPending ? (
                  <span className="flex items-center gap-1.5"><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />Generating...</span>
                ) : (
                  <span className="flex items-center gap-1"><Sparkles size={12} />Generate</span>
                )}
              </Button>
            </div>
            <p className="text-[10px] text-gray-600">Replaces the current canvas. Save your work first if needed.</p>
          </div>
        )}

        {/* React Flow Canvas + Explainer Panel */}
        <div className="flex flex-1 overflow-hidden">
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: "#1e2433" }}
            connectionLineType={ConnectionLineType.SmoothStep}
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: false,
              style: { stroke: "#818cf8", strokeWidth: 2 },
              markerEnd: { type: "arrowclosed" as any, color: "#818cf8", width: 18, height: 18 },
            }}
          >
            <Controls className="!bg-gray-800 !border-gray-700 !text-white" />
            <MiniMap
              position="bottom-right"
              style={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
              maskColor="rgba(0,0,0,0.4)"
              nodeColor={(node) => (node.data as any)?.color ?? "#818cf8"}
            />
            <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#2d3748" />
            <Panel position="top-center">
              {nodes.length === 0 && (
                <div className="text-gray-500 text-sm bg-gray-900/80 px-4 py-2 rounded-full border border-gray-700 mt-4">
                  Search or browse services in the palette, then click to add them to the canvas
                </div>
              )}
            </Panel>
          </ReactFlow>
        </div>

        {/* ── AI Explainer Side Panel ── */}
        {explainerOpen && explanation && (
          <div
            className="flex flex-col border-l border-gray-700 bg-gray-900"
            style={{ width: 340, minWidth: 280, maxWidth: 400, height: "100%", overflow: "hidden" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-emerald-400" />
                <span className="text-sm font-semibold text-white">Architecture Explainer</span>
              </div>
              <button
                onClick={() => setExplainerOpen(false)}
                className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3" style={{ minHeight: 0 }}>
              <div className="prose prose-sm prose-invert max-w-none text-gray-200 text-xs leading-relaxed pb-16">
                <Streamdown>{explanation}</Streamdown>
              </div>
            </div>
            <div className="px-4 py-2 border-t border-gray-700 flex-shrink-0">
              <button
                onClick={handleExplain}
                disabled={explainMutation.isPending}
                className="w-full text-xs text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1.5 py-1.5 rounded hover:bg-emerald-900/20 transition-colors disabled:opacity-50"
              >
                {explainMutation.isPending ? (
                  <><span className="animate-spin inline-block w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full" />Re-explaining...</>
                ) : (
                  <><Sparkles size={11} />Re-explain current diagram</>
                )}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
