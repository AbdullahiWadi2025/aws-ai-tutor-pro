import { useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
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
  Save,
  FolderOpen,
  Trash2,
  Plus,
  Download,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// ─── AWS Service definitions ─────────────────────────────────────────────────
const AWS_SERVICES = [
  // Compute
  { id: "ec2", label: "EC2", category: "Compute", color: "#FF9900", emoji: "🖥️" },
  { id: "lambda", label: "Lambda", category: "Compute", color: "#FF9900", emoji: "λ" },
  { id: "ecs", label: "ECS", category: "Compute", color: "#FF9900", emoji: "🐳" },
  { id: "eks", label: "EKS", category: "Compute", color: "#FF9900", emoji: "☸️" },
  { id: "beanstalk", label: "Elastic Beanstalk", category: "Compute", color: "#FF9900", emoji: "🌱" },
  // Storage
  { id: "s3", label: "S3", category: "Storage", color: "#3F8624", emoji: "🪣" },
  { id: "ebs", label: "EBS", category: "Storage", color: "#3F8624", emoji: "💾" },
  { id: "efs", label: "EFS", category: "Storage", color: "#3F8624", emoji: "📁" },
  { id: "glacier", label: "S3 Glacier", category: "Storage", color: "#3F8624", emoji: "🧊" },
  // Database
  { id: "rds", label: "RDS", category: "Database", color: "#2E73B8", emoji: "🗄️" },
  { id: "dynamodb", label: "DynamoDB", category: "Database", color: "#2E73B8", emoji: "⚡" },
  { id: "elasticache", label: "ElastiCache", category: "Database", color: "#2E73B8", emoji: "🚀" },
  { id: "aurora", label: "Aurora", category: "Database", color: "#2E73B8", emoji: "🌌" },
  // Networking
  { id: "vpc", label: "VPC", category: "Networking", color: "#8C4FFF", emoji: "🔒" },
  { id: "cloudfront", label: "CloudFront", category: "Networking", color: "#8C4FFF", emoji: "🌐" },
  { id: "route53", label: "Route 53", category: "Networking", color: "#8C4FFF", emoji: "🌍" },
  { id: "alb", label: "ALB", category: "Networking", color: "#8C4FFF", emoji: "⚖️" },
  { id: "apigateway", label: "API Gateway", category: "Networking", color: "#8C4FFF", emoji: "🚪" },
  // Messaging
  { id: "sqs", label: "SQS", category: "Messaging", color: "#E7157B", emoji: "📬" },
  { id: "sns", label: "SNS", category: "Messaging", color: "#E7157B", emoji: "📣" },
  { id: "kinesis", label: "Kinesis", category: "Messaging", color: "#E7157B", emoji: "🌊" },
  { id: "eventbridge", label: "EventBridge", category: "Messaging", color: "#E7157B", emoji: "🎯" },
  // Security
  { id: "iam", label: "IAM", category: "Security", color: "#DD344C", emoji: "🔑" },
  { id: "cognito", label: "Cognito", category: "Security", color: "#DD344C", emoji: "👤" },
  { id: "waf", label: "WAF", category: "Security", color: "#DD344C", emoji: "🛡️" },
  { id: "kms", label: "KMS", category: "Security", color: "#DD344C", emoji: "🔐" },
  // Monitoring
  { id: "cloudwatch", label: "CloudWatch", category: "Monitoring", color: "#E7157B", emoji: "📊" },
  { id: "cloudtrail", label: "CloudTrail", category: "Monitoring", color: "#E7157B", emoji: "🔍" },
  { id: "xray", label: "X-Ray", category: "Monitoring", color: "#E7157B", emoji: "🩻" },
  // AI/ML
  { id: "sagemaker", label: "SageMaker", category: "AI/ML", color: "#01A88D", emoji: "🤖" },
  { id: "rekognition", label: "Rekognition", category: "AI/ML", color: "#01A88D", emoji: "👁️" },
  { id: "bedrock", label: "Bedrock", category: "AI/ML", color: "#01A88D", emoji: "🧠" },
];

const CATEGORIES = Array.from(new Set(AWS_SERVICES.map(s => s.category)));
const CATEGORY_COLORS: Record<string, string> = {
  Compute: "#FF9900",
  Storage: "#3F8624",
  Database: "#2E73B8",
  Networking: "#8C4FFF",
  Messaging: "#E7157B",
  Security: "#DD344C",
  Monitoring: "#E7157B",
  "AI/ML": "#01A88D",
};

// ─── Custom AWS Node ──────────────────────────────────────────────────────────
function AwsServiceNode({ data }: { data: { label: string; emoji: string; color: string; category: string } }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-xl border-2 shadow-lg cursor-grab active:cursor-grabbing select-none"
      style={{
        width: 100,
        minHeight: 80,
        background: `${data.color}18`,
        borderColor: data.color,
        padding: "8px 6px",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: data.color, width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: data.color, width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left} style={{ background: data.color, width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: data.color, width: 8, height: 8 }} />
      <div className="text-2xl mb-1 leading-none">{data.emoji}</div>
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
  textLabel: TextLabelNode,
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DiagramBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [diagramName, setDiagramName] = useState("Untitled Diagram");
  const [currentDiagramId, setCurrentDiagramId] = useState<number | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Compute");
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
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
  const deleteMutation = trpc.diagram.delete.useMutation({
    onSuccess: () => {
      utils.diagram.list.invalidate();
      toast.success("Diagram deleted");
    },
  });
  const getDiagramQuery = trpc.diagram.get.useQuery(
    { id: currentDiagramId! },
    { enabled: false }
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#6366f1", strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const addServiceNode = useCallback(
    (service: typeof AWS_SERVICES[0]) => {
      const id = `node-${nodeIdCounter.current++}`;
      const newNode: Node = {
        id,
        type: "awsService",
        position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: { label: service.label, emoji: service.emoji, color: service.color, category: service.category },
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

  const filteredServices = AWS_SERVICES.filter(s => s.category === activeCategory);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
      {/* ── Service Palette ── */}
      <div
        className={`flex flex-col border-r border-gray-800 bg-gray-900 transition-all duration-300 ${paletteOpen ? "w-56" : "w-10"}`}
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
            {/* Category tabs */}
            <div className="flex flex-col gap-0.5 p-1 border-b border-gray-800 overflow-y-auto max-h-40">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left text-xs px-2 py-1 rounded transition-colors ${activeCategory === cat ? "text-white font-semibold" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"}`}
                  style={activeCategory === cat ? { background: `${CATEGORY_COLORS[cat]}30`, color: CATEGORY_COLORS[cat] } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Service icons */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredServices.map(service => (
                <button
                  key={service.id}
                  onClick={() => addServiceNode(service)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs hover:bg-gray-800 transition-colors group"
                >
                  <span className="text-base leading-none w-5 text-center">{service.emoji}</span>
                  <span className="text-gray-300 group-hover:text-white truncate">{service.label}</span>
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
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: "#0f172a" }}
            defaultEdgeOptions={{ animated: true, style: { stroke: "#6366f1", strokeWidth: 2 } }}
          >
            <Controls className="!bg-gray-800 !border-gray-700 !text-white" />
            <MiniMap
              style={{ background: "#1e293b", border: "1px solid #374151" }}
              nodeColor={(node) => (node.data as any)?.color ?? "#6366f1"}
            />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e293b" />
            <Panel position="top-center">
              {nodes.length === 0 && (
                <div className="text-gray-500 text-sm bg-gray-900/80 px-4 py-2 rounded-full border border-gray-700 mt-4">
                  Click a service in the palette to add it to the canvas
                </div>
              )}
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
