import { useState } from 'react';
import { FolderOpen, MessageSquare, Check, ChevronDown, ChevronUp, ChevronRight, Search, Filter, ArrowRightLeft, LayoutGrid, LayoutList, Send, X, Info, CalendarClock, Eye, Paperclip } from 'lucide-react';
import AdminNav from './AdminNav';
import { LinkFolderModal } from './modals/LinkFolderModal';
import { UnifiedRemarksModal, UnifiedRemark, UnifiedRemarkReply } from './modals/UnifiedRemarksModal';
import { TransferHandlerModal } from './modals/TransferHandlerModal';

interface ResponseReply {
  id: string; author: 'handler' | 'applicant'; text: string; date: string; attachmentName?: string;
}
interface ResponseRequest {
  id: string;
  message: string;
  attachmentName?: string;
  requestDate: string;
  status: 'pending' | 'active' | 'closed';
  thread?: ResponseReply[];
}

type ProsType = 'patent' | 'patent-to-um' | 'utility-model' | 'trademark' | 'copyright' | 'industrial-design';

interface Stage { label: string; sublabel?: string; warning?: boolean; }

const STAGES: Record<ProsType, Stage[]> = {
  patent:        [{ label: 'Filed' }, { label: 'Formality Examination' }, { label: 'Substantive Examination' }, { label: 'Granted', sublabel: 'Letters Patent Issued', warning: true }],
  'patent-to-um':[{ label: 'Filed' }, { label: 'Formality Examination' }, { label: 'Substantive Examination' }, { label: 'Downgraded to UM' }, { label: 'Granted', sublabel: 'Letters Patent Issued', warning: true }],
  'utility-model':[{ label: 'Filed' }, { label: 'Formality Examination' }, { label: 'Registered', sublabel: 'Certificate Issued' }],
  trademark:     [{ label: 'Filed' }, { label: 'Registrability Report' }, { label: 'Registered', sublabel: 'Certificate Issued' }],
  copyright:          [{ label: 'Filed' }, { label: 'Registered', sublabel: 'Certificate Issued' }],
  'industrial-design':[{ label: 'Filed' }, { label: 'Registrability Report' }, { label: 'Registered', sublabel: 'Certificate Issued' }],
};

// IPOPHL detail steps — index ranges per stage for each prosType
const DETAIL_STEPS: Record<ProsType, { label: string; conditional?: boolean; stage: number }[]> = {
  patent: [
    { label: 'Filing of Patent Application', stage: 0 },
    { label: 'Acknowledgement & Filing Date', stage: 0 },
    { label: 'Formality Examination Report', stage: 1 },
    { label: 'Subsequent Formality Exam Report', stage: 1, conditional: true },
    { label: 'First Publication', stage: 1 },
    { label: 'Request for Substantive Examination', stage: 2 },
    { label: 'Substantive Examination Report', stage: 2 },
    { label: 'Subsequent Substantive Exam Report', stage: 2, conditional: true },
    { label: 'Notice of Allowance', stage: 2 },
    { label: 'Completion of Final Requirements', stage: 3 },
    { label: 'Second Publication', stage: 3 },
    { label: 'Issuance of Letters Patent', stage: 3 },
    { label: 'Payment of Annuities', stage: 3 },
  ],
  'patent-to-um': [
    { label: 'Filing of Patent Application', stage: 0 },
    { label: 'Acknowledgement & Filing Date', stage: 0 },
    { label: 'Formality Examination Report', stage: 1 },
    { label: 'Subsequent Formality Exam Report', stage: 1, conditional: true },
    { label: 'First Publication', stage: 1 },
    { label: 'Request for Substantive Examination', stage: 2 },
    { label: 'Substantive Examination Report', stage: 2 },
    { label: 'Subsequent Substantive Exam Report', stage: 2, conditional: true },
    { label: 'Notice of Allowance', stage: 2 },
    { label: 'Completion of Final Requirements', stage: 4 },
    { label: 'Second Publication', stage: 4 },
    { label: 'Issuance of Letters Patent', stage: 4 },
    { label: 'Payment of Annuities', stage: 4 },
  ],
  'utility-model': [
    { label: 'Filing of Utility Model Application', stage: 0 },
    { label: 'Acknowledgement & Filing Date', stage: 0 },
    { label: 'Formality Examination Report', stage: 1 },
    { label: 'Subsequent Formality Exam Report', stage: 1, conditional: true },
    { label: 'Notice of Publication', stage: 1 },
    { label: 'Issuance of Certificate', stage: 2 },
  ],
  trademark: [
    { label: 'Filing of Trademark Application', stage: 0 },
    { label: 'Acknowledgement & Filing Date', stage: 0 },
    { label: 'Registrability Report', stage: 1 },
    { label: 'Subsequent Action', stage: 1, conditional: true },
    { label: 'Notice of Allowance', stage: 1 },
    { label: 'Issuance of Certificate', stage: 2 },
  ],
  copyright: [
    { label: 'Filing of Copyright Application', stage: 0 },
    { label: 'Claim Stub Issued', stage: 0 },
    { label: 'Issuance of Certificate', stage: 1 },
  ],
  'industrial-design': [
    { label: 'Filing of Industrial Design Application', stage: 0 },
    { label: 'Acknowledgement & Filing Date', stage: 0 },
    { label: 'Registrability Report', stage: 1 },
    { label: 'Subsequent Action', stage: 1, conditional: true },
    { label: 'Notice of Allowance', stage: 1 },
    { label: 'Issuance of Certificate', stage: 2 },
  ],
};

interface AttachedFile { name: string; size: number; uploadedAt: string; folder: 'attached files'; }

interface ProsCase {
  id: string; applicationNo: string; title: string;
  inventorName: string; college: string; department: string;
  contactEmail: string; fundingAgency: string; caseHandler: string;
  filedDate: string; dateDisclosed: string; publicDisclosureDate?: string; currentStage: number;
  prosType: ProsType; ipTypeLabel: string;
  category: 'Patent' | 'Industrial Design' | 'Utility Model' | 'Trademark' | 'Copyright';
  status: 'Active' | 'Extended' | 'Awaiting Response' | 'Registered' | 'Granted';
  deadline?: string;
  folderLink?: string; attachedFiles?: AttachedFile[]; unifiedRemarks?: UnifiedRemark[];
  description?: string; secondaryInventors?: string[];
  responseRequests?: ResponseRequest[];
}

const mockCases: ProsCase[] = [
  { id: 'P-001', applicationNo: '1-2024-500112', title: 'Novel Biocontrol Agent from Indigenous Philippine Plants', description: 'A microbial formulation derived from indigenous Philippine plant extracts with proven efficacy against major fungal pathogens affecting rice and corn crops in tropical lowland environments.', inventorName: 'Dr. Maria Santos', college: 'College of Agriculture and Food Science', department: 'Institute of Crop Science', contactEmail: 'msantos@up.edu.ph', fundingAgency: 'DOST-PCAARRD', caseHandler: 'Tristan Perez-Navarro', filedDate: '2024-11-05', dateDisclosed: '2024-10-01', publicDisclosureDate: '2024-09-12', currentStage: 2, prosType: 'patent', ipTypeLabel: 'Patent', category: 'Patent', status: 'Active', deadline: '2026-07-28', secondaryInventors: ['Dr. Jose Reyes', 'Ms. Carla Bautista'], responseRequests: [{ id: 'rr-p1', message: 'Handler: please provide updated biocontrol specification document and the latest IPOPHL correspondence.', requestDate: '2026-07-05T10:00:00', status: 'pending' }] },
  { id: 'P-002', applicationNo: '1-2023-498801', title: 'Automated Plant Disease Detection Using Machine Vision', description: 'A convolutional neural network-based system mounted on a field robot that identifies 12 common plant diseases in real time, enabling early intervention and reducing crop losses by up to 40%.', inventorName: 'Dr. Ricardo Tan', college: 'College of Engineering and Agro-Industrial Technology', department: 'Dept. of Electrical Engineering', contactEmail: 'rtan@up.edu.ph', fundingAgency: 'DOST-PCIEERD', caseHandler: 'Anna Maria Garcia', filedDate: '2023-08-14', dateDisclosed: '2023-06-10', publicDisclosureDate: '2023-05-20', currentStage: 3, prosType: 'patent', ipTypeLabel: 'Patent', category: 'Patent', status: 'Granted' },
  { id: 'P-003', applicationNo: '1-2024-501340', title: 'Coconut Shell-Derived Activated Carbon for Water Purification', description: 'A low-cost activated carbon material produced from pyrolyzed coconut shell waste, demonstrating high adsorption capacity for heavy metals and organic contaminants in municipal water sources.', inventorName: 'Engr. Lena Reyes', college: 'College of Forestry and Natural Resources', department: 'Dept. of Forest Products', contactEmail: 'lreyes@up.edu.ph', fundingAgency: 'DENR-FMB', caseHandler: 'Samuel Mendoza', filedDate: '2024-06-20', dateDisclosed: '2024-04-15', currentStage: 1, prosType: 'patent', ipTypeLabel: 'Patent', category: 'Patent', status: 'Active', deadline: '2026-07-05' },
  { id: 'P-004', applicationNo: '1-2022-490220', title: 'Low-Cost Soil Moisture Sensor Array for Precision Agriculture', description: 'A wireless sensor network of capacitive soil moisture probes integrated with a LoRa-based data aggregator, providing real-time field moisture mapping for smallholder farmers.', inventorName: 'Dr. Angelo Cruz', college: 'College of Engineering and Agro-Industrial Technology', department: 'Dept. of Agricultural Engineering', contactEmail: 'acruz@up.edu.ph', fundingAgency: 'DA-BAR', caseHandler: 'Nathan Felipe Cruz', filedDate: '2022-03-01', dateDisclosed: '2021-12-10', currentStage: 3, prosType: 'patent-to-um', ipTypeLabel: 'Patent → Utility Model', category: 'Patent', status: 'Active', deadline: '2026-08-15' },
  { id: 'UM-001', applicationNo: '2-2025-001234', title: 'Modular Cassava Dehusking Machine', description: 'A manually operated cassava dehusking unit with interchangeable drum modules, designed for small-scale processing cooperatives with no electrical infrastructure.', inventorName: 'Engr. Roberto Luna', college: 'College of Engineering and Agro-Industrial Technology', department: 'Agricultural Machinery Division', contactEmail: 'rluna@up.edu.ph', fundingAgency: 'Internal UPLB Grant', caseHandler: 'Tristan Perez-Navarro', filedDate: '2025-01-08', dateDisclosed: '2024-11-20', publicDisclosureDate: '2024-10-05', currentStage: 1, prosType: 'utility-model', ipTypeLabel: 'Utility Model', category: 'Utility Model', status: 'Active', deadline: '2026-07-20', secondaryInventors: ['Engr. Danilo Cruz'] },
  { id: 'UM-002', applicationNo: '2-2024-000876', title: 'Smart Irrigation Controller with LoRa Connectivity', description: 'An embedded irrigation controller that uses LoRaWAN sensor data and evapotranspiration models to automate drip irrigation scheduling across multi-hectare farm plots.', inventorName: 'Dr. Ana Reyes', college: 'College of Engineering and Agro-Industrial Technology', department: 'Dept. of Agricultural Biosystems Engineering', contactEmail: 'areyes@up.edu.ph', fundingAgency: 'DOST-PCAARRD', caseHandler: 'Katrina Mercado', filedDate: '2024-04-22', dateDisclosed: '2024-02-18', currentStage: 2, prosType: 'utility-model', ipTypeLabel: 'Utility Model', category: 'Utility Model', status: 'Registered' },
  { id: 'TM-001', applicationNo: '4-2025-012901', title: 'UPLB Visual Identity System 2025', description: "The updated UPLB brand identity system comprising the revised university seal, wordmarks, color palette, and typographic guidelines adopted for official university communications.", inventorName: 'Prof. Juan Dela Cruz', college: 'College of Development Communication', department: 'Dept. of Communication Arts', contactEmail: 'jdelacruz@up.edu.ph', fundingAgency: 'University Funds', caseHandler: 'Anna Maria Garcia', filedDate: '2025-06-10', dateDisclosed: '2025-04-05', currentStage: 1, prosType: 'trademark', ipTypeLabel: 'Trademark', category: 'Trademark', status: 'Active', deadline: '2026-09-01' },
  { id: 'TM-002', applicationNo: '4-2024-009834', title: "Oble's Harvest — University Farm Products", description: "A trademark covering the brand name and logo for UPLB's line of farm-produced goods including fresh produce, processed foods, and value-added agricultural products.", inventorName: 'Dr. Elena Rosales', college: 'College of Agriculture and Food Science', department: 'University Animal Farm', contactEmail: 'erosales@up.edu.ph', fundingAgency: 'None', caseHandler: 'Samuel Mendoza', filedDate: '2024-09-01', dateDisclosed: '2024-07-12', currentStage: 2, prosType: 'trademark', ipTypeLabel: 'Trademark', category: 'Trademark', status: 'Registered' },
  { id: 'CR-001', applicationNo: 'CR-2026-001234', title: 'Educational Modules for Sustainable Agriculture', description: 'A series of 12 e-learning modules covering sustainable farming practices, soil health management, and climate-adaptive crop production developed for Filipino farming communities.', inventorName: 'Prof. Carlos Mendoza', college: 'College of Agriculture and Food Science', department: 'Institute of Agricultural Education', contactEmail: 'cmendoza@up.edu.ph', fundingAgency: 'FAO Philippines', caseHandler: 'Katrina Mercado', filedDate: '2026-05-09', dateDisclosed: '2026-04-22', currentStage: 1, prosType: 'copyright', ipTypeLabel: 'Copyright', category: 'Copyright', status: 'Registered' },
  { id: 'CR-002', applicationNo: 'CR-2026-002567', title: 'ForCarbon: Software for Estimating Forest Carbon Stock', description: 'An open-source desktop application that computes above-ground biomass and carbon stock estimates for Philippine forest types using allometric equations and field inventory data.', inventorName: 'Engr. Mark Bautista', college: 'College of Forestry and Natural Resources', department: 'Institute of Renewable Natural Resources', contactEmail: 'mbautista@up.edu.ph', fundingAgency: 'DENR-FMB', caseHandler: 'Samuel Mendoza', filedDate: '2026-06-17', dateDisclosed: '2026-04-18', currentStage: 0, prosType: 'copyright', ipTypeLabel: 'Copyright', category: 'Copyright', status: 'Active', deadline: '2026-07-30' },
];

const ALL_HANDLERS = [...new Set(mockCases.map(c => c.caseHandler))].sort();
const CATEGORY_OPTIONS = ['All', 'Patent', 'Industrial Design', 'Utility Model', 'Trademark', 'Copyright'];

type StageState = 'done' | 'active' | 'pending';

function StageNode({ state, warning }: { state: StageState; warning?: boolean }) {
  if (state === 'done') return <div className="w-9 h-9 rounded-full bg-[#8d1436] flex items-center justify-center flex-shrink-0 shadow-sm"><Check className="w-4 h-4 text-white stroke-[3]" /></div>;
  if (state === 'active') return <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 ring-4 ${warning ? 'border-amber-400 ring-amber-100' : 'border-[#8d1436] ring-[#8d1436]/10'}`}><div className={`w-2.5 h-2.5 rounded-full animate-pulse ${warning ? 'bg-amber-400' : 'bg-[#8d1436]'}`} /></div>;
  return <div className="w-9 h-9 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 rounded-full bg-gray-300" /></div>;
}

function StageBar({ case_ }: { case_: ProsCase }) {
  const stages = STAGES[case_.prosType];
  return (
    <div className="flex items-start w-full gap-0 mb-4">
      {stages.map((stage, idx) => {
        const isComplete = case_.status === 'Granted' || case_.status === 'Registered';
        const state: StageState = isComplete ? 'done' : idx < case_.currentStage ? 'done' : idx === case_.currentStage ? 'active' : 'pending';
        const isLast = idx === stages.length - 1;
        return (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <StageNode state={state} warning={stage.warning && state === 'active'} />
              <div className="text-center" style={{ maxWidth: 90 }}>
                <p className={`text-xs font-semibold leading-tight ${state === 'done' ? 'text-gray-700' : state === 'active' ? (stage.warning ? 'text-amber-700' : 'text-[#8d1436]') : 'text-gray-400'}`}>{stage.label}</p>
                {stage.sublabel && state === 'done' && <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{stage.sublabel}</p>}
              </div>
            </div>
            {!isLast && <div className={`flex-1 h-0.5 mx-1.5 mb-6 ${state === 'done' ? 'bg-[#8d1436]' : state === 'active' ? 'bg-gradient-to-r from-[#8d1436] to-gray-200' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}

function DetailSteps({ case_, expanded }: { case_: ProsCase; expanded: boolean }) {
  const [expandedSubStages, setExpandedSubStages] = useState<Set<number>>(new Set());
  const toggleSubStage = (idx: number) => setExpandedSubStages(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n; });
  if (!expanded) return null;
  const steps = DETAIL_STEPS[case_.prosType];
  const stages = STAGES[case_.prosType];
  const isComplete = case_.status === 'Granted' || case_.status === 'Registered';
  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Sub-Steps by Stage</p>
      <div className="space-y-1.5">
        {stages.map((stage, stageIdx) => {
          const stepsForStage = steps.reduce<{ step: typeof steps[0]; i: number }[]>(
            (acc, step, i) => { if (step.stage === stageIdx) acc.push({ step, i }); return acc; }, []
          );
          if (stepsForStage.length === 0) return null;
          const isSubExpanded = expandedSubStages.has(stageIdx);
          const stageIsDone = isComplete || stageIdx < case_.currentStage;
          const stageIsActive = !isComplete && stageIdx === case_.currentStage;
          return (
            <div key={stageIdx} className={`rounded-lg border overflow-hidden ${stageIsDone ? 'border-green-200' : stageIsActive ? 'border-[#e8b0b0]' : 'border-gray-200'}`}>
              <button
                onClick={() => toggleSubStage(stageIdx)}
                className={`flex items-center gap-2 w-full px-3 py-2.5 text-left transition-colors hover:bg-black/[0.02] ${stageIsDone ? 'bg-green-50/40' : stageIsActive ? 'bg-[#fdf0f3]/60' : 'bg-gray-50/40'}`}
              >
                <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${isSubExpanded ? 'rotate-90' : ''} ${stageIsDone ? 'text-green-600' : stageIsActive ? 'text-[#8d1436]' : 'text-gray-400'}`} />
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${stageIsDone ? 'bg-[#8d1436]' : stageIsActive ? 'border-2 border-[#8d1436]' : 'border-2 border-gray-300'}`}>
                  {stageIsDone && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  {stageIsActive && !stageIsDone && <div className="w-1.5 h-1.5 rounded-full bg-[#8d1436] animate-pulse" />}
                </div>
                <span className={`text-xs font-semibold ${stageIsDone ? 'text-gray-600' : stageIsActive ? 'text-[#8d1436]' : 'text-gray-400'}`}>{stage.label}</span>
                <span className={`ml-auto text-[10px] font-medium ${stageIsDone ? 'text-green-600' : stageIsActive ? 'text-[#8d1436]/70' : 'text-gray-400'}`}>
                  {stepsForStage.length} sub-step{stepsForStage.length !== 1 ? 's' : ''}
                </span>
              </button>
              {isSubExpanded && (
                <div className="px-4 pb-3 pt-2 border-t border-gray-100 space-y-2 bg-white">
                  {stepsForStage.map(({ step, i }) => {
                    const isDone = isComplete || step.stage < case_.currentStage;
                    const isActive = !isComplete && step.stage === case_.currentStage;
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isDone ? 'bg-[#8d1436]' : isActive ? 'border-2 border-[#8d1436] bg-white' : 'border-2 border-gray-200 bg-white'}`}>
                          {isDone && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#8d1436] animate-pulse" />}
                        </div>
                        <div className="flex items-center gap-1.5 flex-1">
                          <span className={`text-xs leading-tight ${isDone ? 'text-gray-400 line-through' : isActive ? 'text-[#8d1436] font-semibold' : 'text-gray-400'}`}>{step.label}</span>
                          {step.conditional && <span className="text-[9px] px-1 rounded bg-gray-100 text-gray-400 flex-shrink-0">if applicable</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: ProsCase['status'] }) {
  const map: Record<string, string> = { Active: 'bg-blue-100 text-blue-800', Extended: 'bg-purple-100 text-purple-800', 'Awaiting Response': 'bg-amber-100 text-amber-800', Registered: 'bg-green-100 text-green-800', Granted: 'bg-[#fdf0f3] text-[#8d1436] border border-[#e8b0b0]' };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
}

function FileViewerModal({ name, url, onClose }: { name: string; url?: string; onClose: () => void }) {
  const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name);
  const isPdf = /\.pdf$/i.test(name);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Paperclip className="w-4 h-4 text-[#8d1436] flex-shrink-0" />
            <span className="text-sm font-bold text-gray-900 truncate">{name}</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 flex-shrink-0"><X className="w-4 h-4" /></button>
        </div>
        {url && isImage ? (
          <img src={url} alt={name} className="w-full rounded-lg border border-gray-200 max-h-64 object-contain bg-gray-50" />
        ) : url && isPdf ? (
          <iframe src={url} className="w-full h-64 rounded-lg border border-gray-200" title={name} />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-3 bg-gray-50 rounded-xl border border-gray-200">
            <Paperclip className="w-10 h-10 text-gray-300" />
            <p className="text-sm text-gray-500 text-center">Preview not available<br /><span className="text-xs text-gray-400">{name}</span></p>
          </div>
        )}
        <div className="flex gap-2">
          {url && <a href={url} download={name} className="flex-1 py-2 text-xs font-semibold bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130] text-center">Download</a>}
          <button onClick={onClose} className={`${url ? "flex-1" : "w-full"} py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50`}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function ProsecutionDashboard() {
  const [cases, setCases] = useState(mockCases);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const toggleDetails = (id: string) => setExpandedDetails(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterHandler, setFilterHandler] = useState('All');
  const [filterProgress, setFilterProgress] = useState<'All' | 'Ongoing' | 'Completed'>('All');
  const [compactView, setCompactView] = useState(false);
  const [folderCase, setFolderCase] = useState<ProsCase | null>(null);
  const [remarksCase, setRemarksCase] = useState<ProsCase | null>(null);
  const [transferCase, setTransferCase] = useState<ProsCase | null>(null);
  const [responseCase, setResponseCase] = useState<ProsCase | null>(null);
  const [viewingFile, setViewingFile] = useState<{ name: string; url?: string } | null>(null);
  const pendingResponseCount = (c: ProsCase) => (c.responseRequests ?? []).filter(r => r.status === 'pending' || r.status === 'active').length;

  const isProsComplete = (c: ProsCase) => c.status === 'Complete' || c.status === 'Granted' || c.status === 'Registered';

  const filtered = cases.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.inventorName.toLowerCase().includes(search.toLowerCase()) || c.applicationNo.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || c.category === filterCategory;
    const matchHandler = filterHandler === 'All' || c.caseHandler === filterHandler;
    const matchProgress = filterProgress === 'All' || (filterProgress === 'Completed' ? isProsComplete(c) : !isProsComplete(c));
    return matchSearch && matchCat && matchHandler && matchProgress;
  });

  const toggleExpand = (id: string) => setExpandedCards(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const update = (id: string, patch: Partial<ProsCase>) => setCases(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  const handleSaveFolder = (id: string, link: string) => update(id, { folderLink: link });
  const handleAttachFiles = (id: string, files: any[]) => update(id, { attachedFiles: files });
  const handleAddRemark = (id: string, remark: UnifiedRemark) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, unifiedRemarks: [...(c.unifiedRemarks ?? []), remark] } : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? { ...prev, unifiedRemarks: [...(prev.unifiedRemarks ?? []), remark] } : null);
  };
  const handleMarkResolved = (id: string, remarkId: string) => {
    const patch = (c: ProsCase) => ({ ...c, unifiedRemarks: (c.unifiedRemarks ?? []).map(r => r.id === remarkId ? { ...r, resolved: true } : r) });
    setCases(prev => prev.map(c => c.id === id ? patch(c) : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? patch(prev) : null);
  };
  const handleMarkRead = (id: string, remarkId: string) => {
    const patch = (c: ProsCase) => ({ ...c, unifiedRemarks: (c.unifiedRemarks ?? []).map(r => r.id === remarkId ? { ...r, read: true } : r) });
    setCases(prev => prev.map(c => c.id === id ? patch(c) : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? patch(prev) : null);
  };
  const handleAddReply = (id: string, remarkId: string, reply: UnifiedRemarkReply) => {
    const patch = (c: ProsCase) => ({ ...c, unifiedRemarks: (c.unifiedRemarks ?? []).map(r => r.id === remarkId ? { ...r, replies: [...(r.replies ?? []), reply] } : r) });
    setCases(prev => prev.map(c => c.id === id ? patch(c) : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? patch(prev) : null);
  };
  const handleTransfer = (id: string, newHandler: string) => update(id, { caseHandler: newHandler });

  const catCounts = CATEGORY_OPTIONS.slice(1).reduce((acc, cat) => { acc[cat] = cases.filter(c => c.category === cat).length; return acc; }, {} as Record<string, number>);
  const unreadCount = (c: ProsCase) => (c.unifiedRemarks ?? []).filter(r => !r.read && r.role !== 'admin').length;

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <AdminNav />
      <div className="flex-1 min-w-0 max-w-[1600px] p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Prosecution</h1>
          <p className="text-gray-600 text-sm">IPOPHL prosecution tracking — post-filing stage progress</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-5">
          <div className="p-4 flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search by title, inventor, or application no..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm">
                <option value="All">All IP Types</option>
                {CATEGORY_OPTIONS.slice(1).map(c => <option key={c} value={c}>{c} ({catCounts[c]})</option>)}
              </select>
              <select value={filterHandler} onChange={e => setFilterHandler(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm">
                <option value="All">All Case Handlers</option>
                {ALL_HANDLERS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <select value={filterProgress} onChange={e => setFilterProgress(e.target.value as 'All' | 'Ongoing' | 'Completed')} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm">
                <option value="All">All Progress</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden ml-auto">
              <button onClick={() => setCompactView(false)} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${!compactView ? 'bg-[#8d1436] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <LayoutGrid className="w-3.5 h-3.5" /> Cards
              </button>
              <button onClick={() => setCompactView(true)} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${compactView ? 'bg-[#8d1436] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                <LayoutList className="w-3.5 h-3.5" /> Compact
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4">Showing {filtered.length} of {cases.length} cases</p>

        {compactView ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Application No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Handler</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(case_ => {
                  const stages = STAGES[case_.prosType];
                  const isComplete = case_.status === 'Granted' || case_.status === 'Registered';
                  const pct = isComplete ? 100 : Math.round((case_.currentStage / stages.length) * 100);
                  const unread = unreadCount(case_);
                  return (
                    <tr key={case_.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-[#8d1436] font-semibold whitespace-nowrap">{case_.applicationNo}</td>
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="text-sm font-medium text-gray-900 truncate" title={case_.title}>{case_.title}</p>
                        <p className="text-xs text-gray-500 truncate">{case_.inventorName}</p>
                      </td>
                      <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium whitespace-nowrap">{case_.ipTypeLabel}</span></td>
                      <td className="px-4 py-3"><StatusChip status={case_.status} /></td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-700 whitespace-nowrap">{stages[case_.currentStage]?.label ?? 'Complete'}</p>
                        <div className="w-24 h-1 bg-gray-200 rounded-full mt-1"><div className="h-1 bg-[#8d1436] rounded-full" style={{ width: `${pct}%` }} /></div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{case_.caseHandler}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setFolderCase(case_)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#8d1436]" title="View Folder"><FolderOpen className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setRemarksCase(case_)} className="relative p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#8d1436]" title="Remarks">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#8d1436] text-white rounded-full text-[8px] flex items-center justify-center font-bold">{unread}</span>}
                          </button>
                          <button onClick={() => setTransferCase(case_)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600" title="Transfer"><ArrowRightLeft className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-12 text-center"><p className="text-gray-500 text-sm">No prosecution cases found.</p></div>}
          </div>
        ) : (
        <div className="space-y-6">
          {filtered.map(case_ => {
            const expanded = expandedCards.has(case_.id);
            const stages = STAGES[case_.prosType];
            const isComplete = case_.status === 'Granted' || case_.status === 'Registered';
            const pct = isComplete ? 100 : Math.round((case_.currentStage / stages.length) * 100);
            const unread = unreadCount(case_);
            const remarksCount = (case_.unifiedRemarks ?? []).length;
            return (
              <div key={case_.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#fdf0f3] to-white px-8 py-6">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-[#8d1436] font-semibold">{case_.applicationNo}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">{case_.ipTypeLabel}</span>
                        <StatusChip status={case_.status} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{case_.title}</h3>
                      {case_.description && <p className="text-sm text-gray-600 mb-1 max-w-2xl leading-relaxed">{case_.description}</p>}
                      <p className="text-sm text-gray-500">{case_.inventorName} · {case_.college}</p>
                    </div>
                    <div className="text-right ml-8 flex-shrink-0">
                      <p className="text-xs text-gray-500">Case Handler</p>
                      <p className="text-sm font-semibold text-gray-900">{case_.caseHandler}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Filed {new Date(case_.filedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <StageBar case_={case_} />
                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm ${isComplete ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-[#fdf0f3] border border-[#e8b0b0] text-gray-700'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isComplete ? 'bg-green-500' : 'bg-[#8d1436] animate-pulse'}`} />
                    <span className="font-semibold">{case_.status === 'Granted' ? 'Granted — Letters Patent Issued' : case_.status === 'Registered' ? 'Registered — Certificate Issued' : `Currently: ${stages[case_.currentStage]?.label ?? 'Processing'}`}</span>
                    <span className="ml-auto text-xs text-gray-500 font-medium">{pct}% complete</span>
                  </div>
                  <button onClick={() => toggleExpand(case_.id)} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 mt-3 transition-colors">
                    {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {expanded ? 'Hide' : 'Show'} detailed IPOPHL steps
                  </button>
                  <DetailSteps case_={case_} expanded={expanded} />
                </div>

                {/* Collapsible details toggle */}
                <div className="border-t border-gray-100">
                  <button onClick={() => toggleDetails(case_.id)} className="w-full flex items-center justify-between px-8 py-3 text-xs text-gray-500 hover:bg-gray-50 transition-colors font-medium">
                    <span className="flex items-center gap-1.5">{expandedDetails.has(case_.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {expandedDetails.has(case_.id) ? 'Hide Details' : 'Show Inventor & Case Details'}
                    </span>
                    {!expandedDetails.has(case_.id) && <span className="text-[10px] text-gray-400">Click to expand</span>}
                  </button>
                </div>
                {expandedDetails.has(case_.id) && (
                <div className="px-8 py-6 grid grid-cols-2 gap-6 border-t border-gray-100">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Inventor Details</h4>
                    <div className="space-y-2">
                      <div><p className="text-xs text-gray-400">Name</p><p className="text-sm font-medium text-gray-900">{case_.inventorName}</p></div>
                      <div><p className="text-xs text-gray-400">College</p><p className="text-sm text-gray-900">{case_.college}</p></div>
                      <div><p className="text-xs text-gray-400">Department</p><p className="text-sm text-gray-900">{case_.department}</p></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Processing Information</h4>
                    <div className="space-y-2">
                      <div><p className="text-xs text-gray-400">Submission Date</p><p className="text-sm font-medium text-gray-900">{new Date(case_.dateDisclosed).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Public Disclosure Date</p>
                        <p className="text-sm text-gray-900">{case_.publicDisclosureDate ? new Date(case_.publicDisclosureDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : <span className="text-gray-400 italic">Not specified</span>}</p>
                      </div>
                      <div><p className="text-xs text-gray-400">Funding Agency</p><p className="text-sm text-gray-900">{case_.fundingAgency}</p></div>
                      <div><p className="text-xs text-gray-400">Contact Email</p><p className="text-sm text-gray-900">{case_.contactEmail}</p></div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Next Deadline</p>
                        {case_.deadline ? (
                          <p className={`text-sm font-medium flex items-center gap-1.5 ${new Date(case_.deadline) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                            <CalendarClock className="w-3.5 h-3.5 flex-shrink-0" />
                            {new Date(case_.deadline) < new Date() && <span className="text-xs font-bold text-red-600">OVERDUE · </span>}
                            {new Date(case_.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">Not set</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {case_.description && (
                    <div className="col-span-2 border-t border-gray-100 pt-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Description</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{case_.description}</p>
                    </div>
                  )}
                  {case_.secondaryInventors?.length ? (
                    <div className="col-span-2 border-t border-gray-100 pt-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Secondary Inventors</p>
                      <div className="flex flex-wrap gap-2">
                        {case_.secondaryInventors.map((n, i) => <span key={i} className="text-xs text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">{n}</span>)}
                      </div>
                    </div>
                  ) : null}
                </div>
                )}

                <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center gap-2 flex-wrap">
                  <button onClick={() => setFolderCase(case_)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
                    <FolderOpen className={`w-3.5 h-3.5 ${case_.folderLink ? 'text-[#8d1436]' : ''}`} />
                    {`View Folder${case_.attachedFiles?.length ? ` (${case_.attachedFiles.length})` : ''}`}
                  </button>
                  <button onClick={() => setRemarksCase(case_)} className="relative flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
                    <MessageSquare className={`w-3.5 h-3.5 ${remarksCount ? 'text-[#8d1436]' : ''}`} />
                    Remarks{remarksCount ? ` (${remarksCount})` : ''}
                    {unread > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#8d1436] text-white rounded-full text-[9px] flex items-center justify-center font-bold">{unread}</span>}
                  </button>
                  <button onClick={() => setTransferCase(case_)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
                    Transfer Case
                  </button>
                  <button
                    onClick={() => setResponseCase(case_)}
                    className={`relative flex items-center gap-1.5 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium ${pendingResponseCount(case_) > 0 ? 'border-amber-300 text-amber-700' : 'border-gray-300 text-gray-700'}`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Response Requests
                    {pendingResponseCount(case_) > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">{pendingResponseCount(case_)}</span>}
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center"><p className="text-gray-500 text-sm">No prosecution cases found for this criteria.</p></div>}
        </div>
        )}
      </div>

      <LinkFolderModal isOpen={!!folderCase} onClose={() => setFolderCase(null)} item={folderCase} onSave={handleSaveFolder} onAttachFiles={handleAttachFiles} />
      <UnifiedRemarksModal isOpen={!!remarksCase} onClose={() => setRemarksCase(null)} item={remarksCase} currentRole="admin" onAddRemark={handleAddRemark} onMarkResolved={handleMarkResolved} onMarkRead={handleMarkRead} onAddReply={handleAddReply} />
      {transferCase && <TransferHandlerModal isOpen={!!transferCase} onClose={() => setTransferCase(null)} caseId={transferCase.id} caseTitle={transferCase.title} currentHandler={transferCase.caseHandler} onTransfer={handleTransfer} />}

      {responseCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-end pointer-events-none">
          <div className="absolute inset-0 bg-black/30 pointer-events-auto" onClick={() => setResponseCase(null)} />
          <div className="relative pointer-events-auto bg-white shadow-2xl border-l border-gray-200 h-full w-full max-w-[420px] flex flex-col">
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#8d1436]" />
                  <h2 className="text-sm font-bold text-gray-900">Response Threads</h2>
                  {pendingResponseCount(responseCase) > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingResponseCount(responseCase)} open</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 truncate max-w-[300px] mt-0.5">{responseCase.title}</p>
              </div>
              <button onClick={() => setResponseCase(null)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {(responseCase.responseRequests ?? []).length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No requests sent for this case yet.</div>
              ) : (
                (responseCase.responseRequests ?? []).map(req => (
                  <div key={req.id} className={`rounded-xl border overflow-hidden ${req.status === 'closed' ? 'border-gray-200 opacity-70' : req.status === 'pending' ? 'border-amber-200' : 'border-blue-200'}`}>
                    <div className={`px-3 pt-3 pb-2 ${req.status === 'closed' ? 'bg-gray-50' : req.status === 'pending' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${req.status === 'closed' ? 'bg-gray-200 text-gray-600' : req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {req.status === 'closed' ? 'Closed' : req.status === 'pending' ? 'Awaiting Response' : 'Active Thread'}
                        </span>
                        <span className="text-[10px] text-gray-400">{new Date(req.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      {/* Opening message — handler left */}
                      <div className="flex items-end gap-2 mt-2">
                        <div className="w-7 h-7 rounded-full bg-[#8d1436]/15 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-[#8d1436]">CH</div>
                        <div className="flex flex-col items-start max-w-[85%]">
                          <span className="text-[10px] text-gray-400 mb-1">Case Handler ({responseCase.caseHandler}) · {new Date(req.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-3 py-2 text-sm leading-relaxed">{req.message}</div>
                          {req.attachmentName && (
                            <button onClick={() => setViewingFile({ name: req.attachmentName! })} className="mt-1 flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#8d1436] bg-white border border-gray-200 rounded-lg px-2 py-1 transition-colors">
                              <Paperclip className="w-3 h-3 flex-shrink-0" /><span className="truncate max-w-[130px]">{req.attachmentName}</span><Eye className="w-3 h-3 flex-shrink-0 opacity-60" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {(req.thread ?? []).length > 0 && (
                      <div className="px-3 pb-3 pt-1 space-y-3 bg-white">
                        {(req.thread ?? []).map(reply => {
                          const isApplicant = reply.author === 'applicant';
                          const avatarCls = isApplicant ? 'bg-green-100 text-green-700' : 'bg-[#8d1436]/15 text-[#8d1436]';
                          const avatarLabel = isApplicant ? 'AP' : 'CH';
                          const label = isApplicant ? 'Applicant' : 'Case Handler';
                          return (
                            <div key={reply.id} className="flex items-end gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${avatarCls}`}>{avatarLabel}</div>
                              <div className="flex flex-col items-start max-w-[85%]">
                                <span className="text-[10px] text-gray-400 mb-1">{label} · {new Date(reply.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-3 py-2 text-sm leading-relaxed">{reply.text}</div>
                                {reply.attachmentName && (
                                  <button onClick={() => setViewingFile({ name: reply.attachmentName! })} className="mt-1 flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#8d1436] bg-white border border-gray-200 rounded-lg px-2 py-1 transition-colors">
                                    <Paperclip className="w-3 h-3 flex-shrink-0" /><span className="truncate max-w-[130px]">{reply.attachmentName}</span><Eye className="w-3 h-3 flex-shrink-0 opacity-60" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-[11px] text-gray-400 text-center">Requests are sent by the assigned case handler. Admins view thread history only.</p>
            </div>
          </div>
        </div>
      )}
      {viewingFile && <FileViewerModal name={viewingFile.name} url={viewingFile.url} onClose={() => setViewingFile(null)} />}
    </div>
  );
}
