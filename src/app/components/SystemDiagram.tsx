import { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Connection,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';

// UPLB palette constants
const M  = '#8d1436'; // UP Maroon
const ML = '#fdf0f3'; // light maroon bg
const G  = '#00563f'; // UP Forest Green
const GL = '#f0f7f4'; // light green bg
const Y  = '#ffb81c'; // UP Gold
const YL = '#fffbf0'; // light gold bg

const initialNodes = [
  // Inventor Portal
  {
    id: '1',
    type: 'input',
    data: {
      label: (
        <div className="flex flex-col items-center p-3">
          <span className="font-bold text-gray-900 mb-1">Inventor Portal</span>
          <span className="text-xs text-gray-600">Submits Disclosure</span>
        </div>
      )
    },
    position: { x: 50, y: 300 },
    style: { background: '#fff', border: '2px solid #6B7280', borderRadius: '8px', width: 160 },
  },
  // Unassigned Phase — UP Maroon
  {
    id: '2',
    data: {
      label: (
        <div className="flex flex-col items-center p-3">
          <span style={{ color: M }} className="font-bold mb-1">New Disclosure</span>
          <span className="text-xs text-gray-600">Unassigned Queue</span>
        </div>
      )
    },
    position: { x: 280, y: 300 },
    style: { background: ML, border: `2px solid ${M}`, borderRadius: '8px', width: 160 },
  },
  {
    id: '3',
    data: {
      label: (
        <div className="flex flex-col items-center p-3">
          <span style={{ color: M }} className="font-bold mb-1">Admin Review</span>
          <span className="text-xs text-gray-600">Incoming Dashboard</span>
        </div>
      )
    },
    position: { x: 280, y: 430 },
    style: { background: ML, border: `2px solid ${M}`, borderRadius: '8px', width: 160 },
  },
  {
    id: '4',
    data: {
      label: (
        <div className="flex flex-col items-center p-3">
          <span style={{ color: M }} className="font-bold mb-1">Assign Handler</span>
          <span className="text-xs text-gray-600">Case Handler Selection</span>
        </div>
      )
    },
    position: { x: 280, y: 560 },
    style: { background: ML, border: `2px solid ${M}`, borderRadius: '8px', width: 160 },
  },
  // Pre-Protection Processing Phase — black/dark
  {
    id: '5',
    data: {
      label: (
        <div className="flex flex-col items-center p-2">
          <span className="font-bold text-gray-900 mb-1 text-sm">Prior Art Search</span>
          <span className="text-xs text-gray-600">Handler Assessment</span>
        </div>
      )
    },
    position: { x: 510, y: 200 },
    style: { background: '#F9FAFB', border: '2px solid #111827', borderRadius: '8px', width: 140 },
  },
  {
    id: '5b',
    data: {
      label: (
        <div className="flex flex-col items-center p-2">
          <span className="font-bold text-gray-900 mb-1 text-sm">IP Audit</span>
          <span className="text-xs text-gray-600">Novelty Check</span>
        </div>
      )
    },
    position: { x: 510, y: 310 },
    style: { background: '#F9FAFB', border: '2px solid #111827', borderRadius: '8px', width: 140 },
  },
  {
    id: '6',
    data: {
      label: (
        <div className="flex flex-col items-center p-2">
          <span className="font-bold text-gray-900 mb-1 text-sm">For Drafting</span>
          <span className="text-xs text-gray-600">Document Prep</span>
        </div>
      )
    },
    position: { x: 510, y: 420 },
    style: { background: '#F9FAFB', border: '2px solid #111827', borderRadius: '8px', width: 140 },
  },
  {
    id: '7',
    data: {
      label: (
        <div className="flex flex-col items-center p-2">
          <span className="font-bold text-gray-900 mb-1 text-sm">Endorsed to OC</span>
          <span className="text-xs text-gray-600">Chancellor Review</span>
        </div>
      )
    },
    position: { x: 510, y: 530 },
    style: { background: '#F9FAFB', border: '2px solid #111827', borderRadius: '8px', width: 140 },
  },
  {
    id: '8',
    data: {
      label: (
        <div className="flex flex-col items-center p-2">
          <span className="font-bold text-gray-900 mb-1 text-sm">For Filing</span>
          <span className="text-xs text-gray-600">Ready for IPOPHL</span>
        </div>
      )
    },
    position: { x: 510, y: 640 },
    style: { background: '#F9FAFB', border: '2px solid #111827', borderRadius: '8px', width: 140 },
  },
  // Open Cases Phase — neutral dark
  {
    id: '9',
    data: {
      label: (
        <div className="flex flex-col items-center p-3">
          <span className="font-bold text-gray-900 mb-1">Filed at IPOPHL</span>
          <span className="text-xs text-gray-600">Application Submitted</span>
        </div>
      )
    },
    position: { x: 720, y: 300 },
    style: { background: '#F3F4F6', border: '2px solid #111827', borderRadius: '8px', width: 160 },
  },
  {
    id: '10',
    data: {
      label: (
        <div className="flex flex-col items-center p-3">
          <span className="font-bold text-gray-900 mb-1">Prosecution</span>
          <span className="text-xs text-gray-600">Office Actions</span>
        </div>
      )
    },
    position: { x: 720, y: 430 },
    style: { background: '#F3F4F6', border: '2px solid #111827', borderRadius: '8px', width: 160 },
  },
  // Granted — UP Forest Green
  {
    id: '11',
    type: 'output',
    data: {
      label: (
        <div className="flex flex-col items-center p-3">
          <span style={{ color: G }} className="font-bold mb-1">Granted/Registered</span>
          <span className="text-xs text-gray-600">IP Protection Complete</span>
        </div>
      )
    },
    position: { x: 720, y: 560 },
    style: { background: GL, border: `2px solid ${G}`, borderRadius: '8px', width: 160 },
  },
  // Dashboard nodes — UP Gold (accent)
  {
    id: '12',
    data: {
      label: (
        <div className="flex flex-col items-center p-2">
          <span className="font-bold text-gray-900 mb-1 text-sm">Admin Dashboard</span>
          <span className="text-xs text-gray-600">Analytics & Reports</span>
        </div>
      )
    },
    position: { x: 280, y: 50 },
    style: { background: YL, border: `2px dashed ${Y}`, borderRadius: '8px', width: 180 }
  },
  {
    id: '13',
    data: {
      label: (
        <div className="flex flex-col items-center p-2">
          <span className="font-bold text-gray-900 mb-1 text-sm">Case Handler View</span>
          <span className="text-xs text-gray-600">My Assigned Cases</span>
        </div>
      )
    },
    position: { x: 490, y: 50 },
    style: { background: GL, border: `2px dashed ${G}`, borderRadius: '8px', width: 180 }
  },
  {
    id: '14',
    data: {
      label: (
        <div className="flex flex-col items-center p-2">
          <span className="font-bold text-gray-900 mb-1 text-sm">Admin Royalty View</span>
          <span className="text-xs text-gray-600">Projects & Allocations</span>
        </div>
      )
    },
    position: { x: 700, y: 50 },
    style: { background: ML, border: `2px dashed ${M}`, borderRadius: '8px', width: 180 }
  }
];

const initialEdges = [
  // Main workflow
  { id: 'e1-2', source: '1', target: '2', animated: true, label: 'Submit', style: { stroke: '#6B7280' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6B7280' }},
  { id: 'e2-3', source: '2', target: '3', label: 'Queue', style: { stroke: M }, markerEnd: { type: MarkerType.ArrowClosed, color: M }},
  { id: 'e3-4', source: '3', target: '4', label: 'Review', style: { stroke: M }, markerEnd: { type: MarkerType.ArrowClosed, color: M }},
  { id: 'e4-5', source: '4', target: '5', label: 'Assign', style: { stroke: M, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: M }},

  // Pre-Protection steps
  { id: 'e5-5b', source: '5', target: '5b', label: 'Search Complete', style: { stroke: '#111827' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#111827' }},
  { id: 'e5b-6', source: '5b', target: '6', label: 'Pass Audit', style: { stroke: '#111827' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#111827' }},
  { id: 'e6-7', source: '6', target: '7', label: 'Draft Done', style: { stroke: '#111827' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#111827' }},
  { id: 'e7-8', source: '7', target: '8', label: 'OC Approved', style: { stroke: '#111827' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#111827' }},
  { id: 'e8-9', source: '8', target: '9', label: 'File', style: { stroke: '#111827', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#111827' }},

  // Open Cases workflow
  { id: 'e9-10', source: '9', target: '10', label: 'Respond', style: { stroke: '#111827' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#111827' }},
  { id: 'e10-11', source: '10', target: '11', label: 'Approve', style: { stroke: G }, markerEnd: { type: MarkerType.ArrowClosed, color: G }},

  // Analytics connections — Gold
  { id: 'e12-a', source: '2', target: '12', type: 'step', animated: true, style: { stroke: Y, strokeDasharray: '5,5' }},
  { id: 'e12-b', source: '5b', target: '12', type: 'step', animated: true, style: { stroke: Y, strokeDasharray: '5,5' }},
  { id: 'e12-c', source: '9', target: '12', type: 'step', animated: true, style: { stroke: Y, strokeDasharray: '5,5' }},

  // Case Handler view connections — Forest Green
  { id: 'e13-a', source: '5', target: '13', type: 'step', animated: true, style: { stroke: G, strokeDasharray: '5,5' }},
  { id: 'e13-b', source: '6', target: '13', type: 'step', animated: true, style: { stroke: G, strokeDasharray: '5,5' }},
  { id: 'e13-c', source: '9', target: '13', type: 'step', animated: true, style: { stroke: G, strokeDasharray: '5,5' }},

  // Admin Royalty view connections — Maroon
  { id: 'e14-a', source: '2', target: '14', type: 'step', animated: true, style: { stroke: M, strokeDasharray: '5,5' }},
  { id: 'e14-b', source: '5b', target: '14', type: 'step', animated: true, style: { stroke: M, strokeDasharray: '5,5' }},
  { id: 'e14-c', source: '9', target: '14', type: 'step', animated: true, style: { stroke: M, strokeDasharray: '5,5' }},
];

export default function SystemDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const getNodeColor = (node: any) => {
    if (node.id === '1') return '#6B7280';
    if (['2', '3', '4'].includes(node.id)) return M;
    if (['5', '5b', '6', '7', '8'].includes(node.id)) return '#111827';
    if (['9', '10'].includes(node.id)) return '#374151';
    if (node.id === '11') return G;
    if (node.id === '12') return Y;
    if (node.id === '13') return G;
    if (node.id === '14') return M;
    return '#9CA3AF';
  };

  return (
    <div className="h-[700px] w-full border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap
          nodeColor={getNodeColor}
          zoomable
          pannable
        />
        <Background color="#f3f4f6" gap={16} />
      </ReactFlow>
    </div>
  );
}