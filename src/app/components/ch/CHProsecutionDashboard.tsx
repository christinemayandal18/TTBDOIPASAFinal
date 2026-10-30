import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { FolderOpen, MessageSquare, Check, ChevronDown, ChevronUp, ChevronRight, Search, Filter, AlertTriangle, Upload, X, CheckCircle, LayoutGrid, LayoutList, Send, Paperclip, Eye } from 'lucide-react';
import CaseHandlerNav from '../CaseHandlerNav';
import { LinkFolderModal } from '../modals/LinkFolderModal';
import { UnifiedRemarksModal, UnifiedRemark, UnifiedRemarkReply } from '../modals/UnifiedRemarksModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';

export interface ResponseReply {
  id: string; author: 'handler' | 'applicant'; text: string; date: string; attachmentName?: string;
}
export interface ResponseRequest {
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
  patent:         [{ label: 'Filed' }, { label: 'Formality Examination' }, { label: 'Substantive Examination' }, { label: 'Granted', sublabel: 'Letters Patent Issued', warning: true }],
  'patent-to-um': [{ label: 'Filed' }, { label: 'Formality Examination' }, { label: 'Substantive Examination' }, { label: 'Downgraded to UM' }, { label: 'Granted', sublabel: 'Letters Patent Issued', warning: true }],
  'utility-model':[{ label: 'Filed' }, { label: 'Formality Examination' }, { label: 'Registered', sublabel: 'Certificate Issued' }],
  trademark:      [{ label: 'Filed' }, { label: 'Registrability Report' }, { label: 'Registered', sublabel: 'Certificate Issued' }],
  copyright:          [{ label: 'Filed' }, { label: 'Registered', sublabel: 'Certificate Issued' }],
  'industrial-design':[{ label: 'Filed' }, { label: 'Registrability Report' }, { label: 'Registered', sublabel: 'Certificate Issued' }],
};

const DETAIL_STEPS: Record<ProsType, { label: string; conditional?: boolean; stage: number }[]> = {
  patent: [
    { label: 'Filing of Patent Application', stage: 0 }, { label: 'Acknowledgement & Filing Date', stage: 0 },
    { label: 'Formality Examination Report', stage: 1 }, { label: 'Subsequent Formality Exam Report', stage: 1, conditional: true }, { label: 'First Publication', stage: 1 },
    { label: 'Request for Substantive Examination', stage: 2 }, { label: 'Substantive Examination Report', stage: 2 }, { label: 'Subsequent Substantive Exam Report', stage: 2, conditional: true }, { label: 'Notice of Allowance', stage: 2 },
    { label: 'Completion of Final Requirements', stage: 3 }, { label: 'Second Publication', stage: 3 }, { label: 'Issuance of Letters Patent', stage: 3 }, { label: 'Payment of Annuities', stage: 3 },
  ],
  'patent-to-um': [
    { label: 'Filing of Patent Application', stage: 0 }, { label: 'Acknowledgement & Filing Date', stage: 0 },
    { label: 'Formality Examination Report', stage: 1 }, { label: 'Subsequent Formality Exam Report', stage: 1, conditional: true }, { label: 'First Publication', stage: 1 },
    { label: 'Request for Substantive Examination', stage: 2 }, { label: 'Substantive Examination Report', stage: 2 }, { label: 'Subsequent Substantive Exam Report', stage: 2, conditional: true }, { label: 'Notice of Allowance', stage: 2 },
    { label: 'Completion of Final Requirements', stage: 4 }, { label: 'Second Publication', stage: 4 }, { label: 'Issuance of Letters Patent', stage: 4 }, { label: 'Payment of Annuities', stage: 4 },
  ],
  'utility-model': [
    { label: 'Filing of Utility Model Application', stage: 0 }, { label: 'Acknowledgement & Filing Date', stage: 0 },
    { label: 'Formality Examination Report', stage: 1 }, { label: 'Subsequent Formality Exam Report', stage: 1, conditional: true }, { label: 'Notice of Publication', stage: 1 },
    { label: 'Issuance of Certificate', stage: 2 },
  ],
  trademark: [
    { label: 'Filing of Trademark Application', stage: 0 }, { label: 'Acknowledgement & Filing Date', stage: 0 },
    { label: 'Registrability Report', stage: 1 }, { label: 'Subsequent Action', stage: 1, conditional: true }, { label: 'Notice of Allowance', stage: 1 },
    { label: 'Issuance of Certificate', stage: 2 },
  ],
  copyright: [
    { label: 'Filing of Copyright Application', stage: 0 }, { label: 'Claim Stub Issued', stage: 0 },
    { label: 'Issuance of Certificate', stage: 1 },
  ],
  'industrial-design': [
    { label: 'Filing of Industrial Design Application', stage: 0 }, { label: 'Acknowledgement & Filing Date', stage: 0 },
    { label: 'Registrability Report', stage: 1 }, { label: 'Subsequent Action', stage: 1, conditional: true }, { label: 'Notice of Allowance', stage: 1 },
    { label: 'Issuance of Certificate', stage: 2 },
  ],
};

interface AttachedFile { name: string; size: number; uploadedAt: string; folder: 'attached files'; }
interface ProsCase {
  id: string; applicationNo: string; title: string; inventorName: string; college: string;
  department: string; contactEmail: string; fundingAgency: string; filedDate: string;
  dateDisclosed: string; publicDisclosureDate?: string; currentStage: number; prosType: ProsType; ipTypeLabel: string;
  category: 'Patent' | 'Industrial Design' | 'Utility Model' | 'Trademark' | 'Copyright';
  status: 'Active' | 'Extended' | 'Awaiting Response' | 'Registered' | 'Granted' | 'Complete';
  folderLink?: string; attachedFiles?: AttachedFile[]; unifiedRemarks?: UnifiedRemark[];
  completedDetailSteps?: Set<number>;
  description?: string; secondaryInventors?: string[];
  responseRequests?: ResponseRequest[];
}

const mockMyCases: ProsCase[] = [
  { id: 'P-001', applicationNo: '1-2024-500112', title: 'Novel Biocontrol Agent from Indigenous Philippine Plants', description: 'A microbial formulation derived from indigenous Philippine plant extracts with proven efficacy against major fungal pathogens affecting rice and corn crops in tropical lowland environments.', inventorName: 'Dr. Maria Santos', college: 'College of Agriculture and Food Science', department: 'Institute of Crop Science', contactEmail: 'msantos@up.edu.ph', fundingAgency: 'DOST-PCAARRD', filedDate: '2024-11-05', dateDisclosed: '2024-10-01', publicDisclosureDate: '2024-09-12', currentStage: 2, prosType: 'patent', ipTypeLabel: 'Patent', category: 'Patent', status: 'Active', folderLink: 'https://drive.google.com/drive/folders/example-biocontrol', secondaryInventors: ['Dr. Jose Reyes', 'Ms. Carla Bautista'], responseRequests: [{ id: 'rr-p1', message: 'Please provide the updated specification document for the biocontrol formulation.', requestDate: '2026-07-05T10:00:00', status: 'pending' }] },
  { id: 'UM-001', applicationNo: '2-2025-001234', title: 'Modular Cassava Dehusking Machine', description: 'A manually operated cassava dehusking unit with interchangeable drum modules, designed for small-scale processing cooperatives with no electrical infrastructure.', inventorName: 'Engr. Roberto Luna', college: 'College of Engineering and Agro-Industrial Technology', department: 'Agricultural Machinery Division', contactEmail: 'rluna@up.edu.ph', fundingAgency: 'Internal UPLB Grant', filedDate: '2025-01-08', dateDisclosed: '2024-11-20', publicDisclosureDate: '2024-10-05', currentStage: 1, prosType: 'utility-model', ipTypeLabel: 'Utility Model', category: 'Utility Model', status: 'Active', unifiedRemarks: [{ id: 'ra1', author: 'Admin', role: 'admin', text: 'Please follow up on the formality exam report schedule with IPOPHL.', date: '2026-07-05T10:00:00', read: false, resolved: false }], secondaryInventors: ['Engr. Danilo Cruz'] },
  { id: 'TM-001', applicationNo: '4-2025-012901', title: 'UPLB Visual Identity System 2025', description: "The updated UPLB brand identity system comprising the revised university seal, wordmarks, color palette, and typographic guidelines adopted for official university communications.", inventorName: 'Prof. Juan Dela Cruz', college: 'College of Development Communication', department: 'Dept. of Communication Arts', contactEmail: 'jdelacruz@up.edu.ph', fundingAgency: 'University Funds', filedDate: '2025-06-10', dateDisclosed: '2025-04-05', currentStage: 1, prosType: 'trademark', ipTypeLabel: 'Trademark', category: 'Trademark', status: 'Active' },
];

const CATEGORY_OPTIONS = ['All', 'Patent', 'Industrial Design', 'Utility Model', 'Trademark', 'Copyright'];

type StageState = 'done' | 'active' | 'pending';
function StageNode({ state, warning }: { state: StageState; warning?: boolean }) {
  if (state === 'done') return <div className="w-9 h-9 rounded-full bg-[#8d1436] flex items-center justify-center flex-shrink-0 shadow-sm"><Check className="w-4 h-4 text-white stroke-[3]" /></div>;
  if (state === 'active') return <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 ring-4 ${warning ? 'border-amber-400 ring-amber-100' : 'border-[#8d1436] ring-[#8d1436]/10'}`}><div className={`w-2.5 h-2.5 rounded-full animate-pulse ${warning ? 'bg-amber-400' : 'bg-[#8d1436]'}`} /></div>;
  return <div className="w-9 h-9 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 rounded-full bg-gray-300" /></div>;
}

function StatusChip({ status }: { status: ProsCase['status'] }) {
  const map: Record<string, string> = { Active: 'bg-blue-100 text-blue-800', Extended: 'bg-purple-100 text-purple-800', 'Awaiting Response': 'bg-amber-100 text-amber-800', Registered: 'bg-green-100 text-green-800', Granted: 'bg-[#fdf0f3] text-[#8d1436] border border-[#e8b0b0]', Complete: 'bg-green-100 text-green-800' };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
}

// ── Step confirmation modal ───────────────────────────────────────────────────
interface StepConfirmProps {
  stepLabel: string; hasDrive: boolean;
  onConfirm: (file?: File) => void; onClose: () => void;
}
function StepConfirmModal({ stepLabel, hasDrive, onConfirm, onClose }: StepConfirmProps) {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="w-12 h-12 rounded-full bg-[#8d1436]/10 flex items-center justify-center mx-auto mb-4">
          <Check className="w-6 h-6 text-[#8d1436]" />
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-1">Confirm Step Completion</h3>
        <p className="text-sm text-gray-600 text-center mb-4">Mark <span className="font-semibold text-gray-900">&ldquo;{stepLabel}&rdquo;</span> as complete?</p>
        {hasDrive ? (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Attach supporting file (optional)</p>
            {file ? (
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2"><Upload className="w-3.5 h-3.5 text-gray-400" /><span className="text-xs text-gray-700 truncate max-w-[160px]">{file.name}</span></div>
                <button onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg py-3 cursor-pointer hover:border-[#8d1436]/40 transition-colors">
                <Upload className="w-4 h-4 text-gray-400" /><span className="text-xs text-gray-500">Click to attach file</span>
                <input type="file" className="hidden" onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
              </label>
            )}
          </div>
        ) : (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700"><span className="font-semibold">No drive linked.</span> Link a folder first to attach files.</div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => { onConfirm(file ?? undefined); onClose(); }} className="flex-1 py-2 text-sm font-semibold bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130]">Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ── Mark as Complete modal ────────────────────────────────────────────────────
function MarkCompleteModal({ caseTitle, onConfirm, onClose }: { caseTitle: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-6 h-6 text-green-600" /></div>
        <h3 className="text-base font-bold text-gray-900 mb-2">Mark Case as Complete</h3>
        <p className="text-sm text-gray-600 mb-3">This confirms all IPOPHL prosecution steps are done. The case will remain visible here and a record will also be added to <span className="font-semibold">Completed Cases</span> for archiving.</p>
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-5 text-left truncate" title={caseTitle}>{caseTitle}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700">Mark Complete</button>
        </div>
      </div>
    </div>
  );
}

function prefixResponseFile(fileName: string, threadId: string, caseId: string): string {
  return `response_thread_${threadId}_${caseId}_${fileName}`;
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

export default function CHProsecutionDashboard() {
  const [cases, setCases] = useState<ProsCase[]>(mockMyCases.map(c => ({ ...c, completedDetailSteps: new Set<number>() })));
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const [expandedSubStages, setExpandedSubStages] = useState<Set<string>>(new Set());
  const toggleDetails = (id: string) => setExpandedDetails(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSubStage = (caseId: string, stageIdx: number) => {
    const key = `${caseId}-${stageIdx}`;
    setExpandedSubStages(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSteps, setFilterSteps] = useState<'all' | 'steps-done'>('all');
  const [filterProgress, setFilterProgress] = useState<'All' | 'Ongoing' | 'Completed'>('All');
  const [compactView, setCompactView] = useState(false);
  const location = useLocation();
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const hash = location.hash.slice(1);
    if (!hash) return;
    setHighlightId(hash);
    const timer1 = setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
    const timer2 = setTimeout(() => setHighlightId(null), 3500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [location.hash]);
  const [folderCase, setFolderCase] = useState<ProsCase | null>(null);
  const [remarksCase, setRemarksCase] = useState<ProsCase | null>(null);
  const [stepConfirm, setStepConfirm] = useState<{ case_: ProsCase; stepIdx: number; stepLabel: string } | null>(null);
  const [markComplete, setMarkComplete] = useState<ProsCase | null>(null);
  const [downgradePrompt, setDowngradePrompt] = useState<ProsCase | null>(null);
  const [downgradeConfirm, setDowngradeConfirm] = useState(false);
  const [keepPatentConfirm, setKeepPatentConfirm] = useState(false);
  const [advanceConfirm, setAdvanceConfirm] = useState<ProsCase | null>(null);
  const [responseCase, setResponseCase] = useState<ProsCase | null>(null);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [responseSendText, setResponseSendText] = useState('');
  const [replyingToThreadId, setReplyingToThreadId] = useState<string | null>(null);
  const [threadReplyText, setThreadReplyText] = useState('');
  const [reqFiles, setReqFiles] = useState<File[]>([]);
  const [newReqFiles, setNewReqFiles] = useState<File[]>([]);
  const [viewingFile, setViewingFile] = useState<{ name: string; url?: string } | null>(null);
  const [fileUrlMap, setFileUrlMap] = useState<Record<string, string>>({});
  const reqFileRef = useRef<HTMLInputElement>(null);
  const newReqFileRef = useRef<HTMLInputElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void; confirmLabel?: string; variant?: 'default' | 'danger' | 'warning' } | null>(null);
  const confirm = (title: string, message: string, onConfirm: () => void, opts?: { confirmLabel?: string; variant?: 'default' | 'danger' | 'warning' }) => setConfirmDialog({ title, message, onConfirm, ...opts });

  const pendingResponseCount = (c: ProsCase) => (c.responseRequests ?? []).filter(r => r.status === 'pending' || r.status === 'active').length;

  const allCurrentStageDone = (c: ProsCase) => {
    const steps = DETAIL_STEPS[c.prosType];
    const stageSteps = steps.filter(s => s.stage === c.currentStage);
    if (!stageSteps.length) return false;
    return stageSteps.every((_, si) => {
      const globalIdx = steps.findIndex((step, gi) => steps.filter(s => s.stage === c.currentStage)[si] === step);
      return (c.completedDetailSteps ?? new Set()).has(globalIdx);
    });
  };

  const isProsComplete = (c: ProsCase) => c.status === 'Complete' || c.status === 'Granted' || c.status === 'Registered';

  const filtered = cases.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.applicationNo.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || c.category === filterCategory;
    const matchSteps = filterSteps === 'all' || allCurrentStageDone(c);
    const matchProgress = filterProgress === 'All' || (filterProgress === 'Completed' ? isProsComplete(c) : !isProsComplete(c));
    return matchSearch && matchCat && matchSteps && matchProgress;
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

  const handleSendRespReq = (caseId: string, message: string, attachmentName?: string) => {
    const newReq: ResponseRequest = { id: `rr-${Date.now()}`, message, attachmentName, requestDate: new Date().toISOString(), status: 'pending', thread: [] };
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, responseRequests: [...(c.responseRequests ?? []), newReq] } : c));
  };
  const handleThreadReply = (caseId: string, rrId: string, text: string, attachmentName?: string) => {
    const reply: ResponseReply = { id: `rpl-${Date.now()}`, author: 'handler', text, date: new Date().toISOString(), attachmentName };
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, responseRequests: (c.responseRequests ?? []).map(r => r.id === rrId ? { ...r, status: 'active' as const, thread: [...(r.thread ?? []), reply] } : r) } : c));
  };
  const handleCloseThread = (caseId: string, rrId: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, responseRequests: (c.responseRequests ?? []).map(r => r.id === rrId ? { ...r, status: 'closed' as const } : r) } : c));
  };

  const handleCompleteDetailStep = (caseId: string, stepIdx: number) => {
    setCases(prev => prev.map(c => {
      if (c.id !== caseId) return c;
      const newDone = new Set(c.completedDetailSteps ?? []);
      newDone.add(stepIdx);
      return { ...c, completedDetailSteps: newDone };
    }));
  };

  const handleMarkCaseComplete = (id: string) => {
    const case_ = cases.find(c => c.id === id);
    if (!case_) return;
    // Push a copy to localStorage for CHCompletedCases
    try {
      const existing = JSON.parse(localStorage.getItem('ch_completed_cases') || '[]');
      const entry = {
        id: case_.id, applicationNo: case_.applicationNo, title: case_.title,
        ipType: case_.ipTypeLabel, inventorName: case_.inventorName, college: case_.college,
        completedDate: new Date().toISOString().split('T')[0], stage: STAGES[case_.prosType]?.[STAGES[case_.prosType].length - 1]?.sublabel ?? 'Completed',
        folderLink: case_.folderLink, unifiedRemarks: case_.unifiedRemarks,
        source: 'prosecution',
      };
      const updated = [...existing.filter((e: any) => e.id !== case_.id), entry];
      localStorage.setItem('ch_completed_cases', JSON.stringify(updated));
    } catch {}
    // Mark as complete in prosecution list — do NOT remove
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: 'Complete' } : c));
  };

  const hasUnresolvedAdminRemarks = (c: ProsCase) => (c.unifiedRemarks ?? []).some(r => !r.resolved && r.role === 'admin');
  const unreadCount = (c: ProsCase) => (c.unifiedRemarks ?? []).filter(r => !r.read && r.role === 'admin').length;

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <CaseHandlerNav />
      <div className="flex-1 min-w-0 max-w-[1600px] p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Prosecution</h1>
          <p className="text-gray-600 text-sm">Your IPOPHL prosecution cases — update progress and steps</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-5">
          <div className="p-4 flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search by title or application no..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm">
                <option value="All">All IP Types</option>
                {CATEGORY_OPTIONS.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterSteps} onChange={e => setFilterSteps(e.target.value as 'all' | 'steps-done')} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm">
                <option value="all">All Cases</option>
                <option value="steps-done">Steps Completed</option>
              </select>
              <select value={filterProgress} onChange={e => setFilterProgress(e.target.value as 'All' | 'Ongoing' | 'Completed')} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm">
                <option value="All">All Progress</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden ml-1">
                <button onClick={() => setCompactView(false)} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${!compactView ? 'bg-[#8d1436] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  <LayoutGrid className="w-3.5 h-3.5" /> Cards
                </button>
                <button onClick={() => setCompactView(true)} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${compactView ? 'bg-[#8d1436] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  <LayoutList className="w-3.5 h-3.5" /> Compact
                </button>
              </div>
            </div>
          </div>
        </div>

        {compactView ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Application No.</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Type</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(case_ => {
                    const stages = STAGES[case_.prosType];
                    const isComplete = case_.status === 'Granted' || case_.status === 'Registered' || case_.status === 'Complete';
                    const stageName = isComplete ? stages[stages.length - 1]?.label : stages[case_.currentStage]?.label ?? '—';
                    const unread = unreadCount(case_);
                    const remarksCount = (case_.unifiedRemarks ?? []).length;
                    return (
                      <tr key={case_.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap"><span className="text-xs font-mono text-[#8d1436] font-semibold">{case_.applicationNo}</span></td>
                        <td className="px-5 py-4 max-w-[220px]"><p className="text-sm font-medium text-gray-900 truncate" title={case_.title}>{case_.title}</p><p className="text-xs text-gray-500 truncate">{case_.inventorName}</p></td>
                        <td className="px-5 py-4 whitespace-nowrap"><span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">{case_.ipTypeLabel}</span></td>
                        <td className="px-5 py-4 whitespace-nowrap"><StatusChip status={case_.status} /></td>
                        <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">{stageName}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => setFolderCase(case_)} className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-xs font-medium"><FolderOpen className="w-3.5 h-3.5" /> Folder</button>
                            <button onClick={() => setRemarksCase(case_)} className="relative flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-xs font-medium">
                              <MessageSquare className="w-3.5 h-3.5" /> {remarksCount > 0 ? remarksCount : 'Remarks'}
                              {unread > 0 && <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#8d1436] text-white rounded-full text-[8px] flex items-center justify-center font-bold">{unread}</span>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <div className="text-center py-12"><p className="text-gray-500 text-sm">No prosecution cases found.</p></div>}
          </div>
        ) : (

        <div className="space-y-6">
          {filtered.map(case_ => {
            const expanded = expandedCards.has(case_.id);
            const stages = STAGES[case_.prosType];
            const isComplete = case_.status === 'Granted' || case_.status === 'Registered' || case_.status === 'Complete';
            const pct = isComplete ? 100 : Math.round((case_.currentStage / stages.length) * 100);
            const unread = unreadCount(case_);
            const remarksCount = (case_.unifiedRemarks ?? []).length;
            const hasAdminWarning = hasUnresolvedAdminRemarks(case_);
            const unresolvedAdminCount = (case_.unifiedRemarks ?? []).filter(r => !r.resolved && r.role === 'admin').length;
            const allStagesDone = case_.currentStage >= stages.length;
            const detailSteps = DETAIL_STEPS[case_.prosType];
            const isHighlighted = highlightId === case_.id;

            return (
              <div key={case_.id} id={case_.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${isHighlighted ? 'border-[#8d1436] ring-2 ring-[#8d1436]/25 shadow-lg' : 'border-gray-200'}`}>
                {hasAdminWarning && (
                  <div className="bg-amber-50 border-b border-amber-200 px-8 py-3 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-amber-900 font-semibold">This case has {unresolvedAdminCount} unresolved admin remark{unresolvedAdminCount > 1 ? 's' : ''} that need{unresolvedAdminCount === 1 ? 's' : ''} your attention.</p>
                    </div>
                    <button onClick={() => setRemarksCase(case_)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors">
                      <MessageSquare className="w-3 h-3" /> Review Remarks
                    </button>
                  </div>
                )}

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
                      <p className="text-xs text-gray-400 mt-0.5">Filed {new Date(case_.filedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>

                  {/* Stage bar */}
                  <div className="flex items-start w-full gap-0 mb-4">
                    {stages.map((stage, idx) => {
                      const state: StageState = isComplete ? 'done' : idx < case_.currentStage ? 'done' : idx === case_.currentStage ? 'active' : 'pending';
                      const isLast = idx === stages.length - 1;
                      return (
                        <div key={idx} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center gap-2">
                            <StageNode state={state} warning={stage.warning && state === 'active'} />
                            <div className="text-center" style={{ maxWidth: 90 }}>
                              <p className={`text-xs font-semibold leading-tight ${state === 'done' ? 'text-gray-700' : state === 'active' ? (stage.warning ? 'text-amber-700' : 'text-[#8d1436]') : 'text-gray-400'}`}>{stage.label}</p>
                            </div>
                          </div>
                          {!isLast && <div className={`flex-1 h-0.5 mx-1.5 mb-6 ${state === 'done' ? 'bg-[#8d1436]' : state === 'active' ? 'bg-gradient-to-r from-[#8d1436] to-gray-200' : 'bg-gray-200'}`} />}
                        </div>
                      );
                    })}
                  </div>

                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm ${isComplete ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-[#fdf0f3] border border-[#e8b0b0] text-gray-700'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isComplete ? 'bg-green-500' : 'bg-[#8d1436] animate-pulse'}`} />
                    <span className="font-semibold">{isComplete ? `${case_.status} — ${stages[stages.length-1]?.sublabel ?? 'Complete'}` : `Currently: ${stages[case_.currentStage]?.label ?? 'Processing'}`}</span>
                    <span className="ml-auto text-xs text-gray-500 font-medium">{pct}% complete</span>
                    {!isComplete && (
                      <button onClick={() => {
                        if (case_.prosType === 'patent' && case_.currentStage === 2) {
                          setDowngradePrompt(case_);
                        } else {
                          setAdvanceConfirm(case_);
                        }
                      }} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#8d1436] text-white text-xs font-semibold rounded-lg hover:bg-[#7a1130] transition-colors">
                        <Check className="w-3.5 h-3.5" /> {case_.prosType === 'patent' && case_.currentStage === 2 ? 'Complete Step' : 'Advance Stage'}
                      </button>
                    )}
                  </div>

                  <button onClick={() => toggleExpand(case_.id)} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 mt-3 transition-colors">
                    {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {expanded ? 'Hide' : 'Show'} detailed IPOPHL steps
                  </button>

                  {expanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Sub-Steps by Stage — expand a stage to view and complete</p>
                      {allCurrentStageDone(case_) && !isComplete && (
                        <div className="mb-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <p className="text-xs text-green-800 font-medium">All steps for this stage are marked complete. Use "Advance Stage" to proceed to the next stage.</p>
                        </div>
                      )}
                      <div className="space-y-1.5">
                        {stages.map((stage, stageIdx) => {
                          const stepsForStage = detailSteps.reduce<{ step: typeof detailSteps[0]; i: number }[]>(
                            (acc, step, i) => { if (step.stage === stageIdx) acc.push({ step, i }); return acc; }, []
                          );
                          if (stepsForStage.length === 0) return null;
                          const subKey = `${case_.id}-${stageIdx}`;
                          const isSubExpanded = expandedSubStages.has(subKey);
                          const stageIsDone = isComplete || stageIdx < case_.currentStage;
                          const stageIsActive = !isComplete && stageIdx === case_.currentStage;
                          return (
                            <div key={stageIdx} className={`rounded-lg border overflow-hidden ${stageIsDone ? 'border-green-200' : stageIsActive ? 'border-[#e8b0b0]' : 'border-gray-200'}`}>
                              <button
                                onClick={() => toggleSubStage(case_.id, stageIdx)}
                                className={`flex items-center gap-2 w-full px-3 py-2.5 text-left transition-colors hover:bg-black/[0.02] ${stageIsDone ? 'bg-green-50/40' : stageIsActive ? 'bg-[#fdf0f3]/60' : 'bg-gray-50/40'}`}
                              >
                                <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${isSubExpanded ? 'rotate-90' : ''} ${stageIsDone ? 'text-green-600' : stageIsActive ? 'text-[#8d1436]' : 'text-gray-400'}`} />
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${stageIsDone ? 'bg-[#8d1436]' : stageIsActive ? 'border-2 border-[#8d1436]' : 'border-2 border-gray-300'}`}>
                                  {stageIsDone && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                                  {stageIsActive && !stageIsDone && <div className="w-1.5 h-1.5 rounded-full bg-[#8d1436] animate-pulse" />}
                                </div>
                                <span className={`text-xs font-semibold ${stageIsDone ? 'text-gray-600' : stageIsActive ? 'text-[#8d1436]' : 'text-gray-400'}`}>
                                  {stage.label}
                                </span>
                                <span className={`ml-auto text-[10px] font-medium ${stageIsDone ? 'text-green-600' : stageIsActive ? 'text-[#8d1436]/70' : 'text-gray-400'}`}>
                                  {stepsForStage.length} sub-step{stepsForStage.length !== 1 ? 's' : ''}
                                </span>
                              </button>
                              {isSubExpanded && (
                                <div className="px-4 pb-3 pt-2 border-t border-gray-100 space-y-2 bg-white">
                                  {stepsForStage.map(({ step, i }) => {
                                    const isDone = isComplete || (case_.completedDetailSteps ?? new Set()).has(i) || step.stage < case_.currentStage;
                                    const isActive = !isComplete && step.stage === case_.currentStage;
                                    return (
                                      <div key={i} className="flex items-start gap-2">
                                        <button
                                          disabled={isDone || !isActive}
                                          onClick={() => {
                                            if (case_.prosType === 'patent' && step.label === 'Substantive Examination Report' && isActive && !isDone) {
                                              setDowngradePrompt(case_);
                                            } else {
                                              setStepConfirm({ case_, stepIdx: i, stepLabel: step.label });
                                            }
                                          }}
                                          className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isDone ? 'bg-[#8d1436]' : isActive ? 'border-2 border-[#8d1436] bg-white hover:bg-[#8d1436]/10' : 'border-2 border-gray-200 bg-white'}`}
                                        >
                                          {isDone && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                                          {isActive && !isDone && <div className="w-1.5 h-1.5 rounded-full bg-[#8d1436] animate-pulse" />}
                                        </button>
                                        <div className="flex items-center gap-1.5 flex-1">
                                          <span className={`text-xs leading-tight ${isDone ? 'text-gray-400 line-through' : isActive ? 'text-[#8d1436] font-semibold cursor-pointer hover:underline' : 'text-gray-400'}`}
                                            onClick={() => {
                                              if (!isActive || isDone) return;
                                              if (case_.prosType === 'patent' && step.label === 'Substantive Examination Report') {
                                                setDowngradePrompt(case_);
                                              } else {
                                                setStepConfirm({ case_, stepIdx: i, stepLabel: step.label });
                                              }
                                            }}>
                                            {step.label}
                                          </span>
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
                  )}
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
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Processing Information</h4>
                    <div className="space-y-2">
                      <div><p className="text-xs text-gray-400">Filed</p><p className="text-sm font-medium text-gray-900">{new Date(case_.filedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                      <div><p className="text-xs text-gray-400">Submission Date</p><p className="text-sm text-gray-900">{new Date(case_.dateDisclosed).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Public Disclosure Date</p>
                        <p className="text-sm text-gray-900">{case_.publicDisclosureDate ? new Date(case_.publicDisclosureDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : <span className="text-gray-400 italic">Not specified</span>}</p>
                      </div>
                      <div><p className="text-xs text-gray-400">Funding Agency</p><p className="text-sm text-gray-900">{case_.fundingAgency}</p></div>
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
                    View Folder
                  </button>
                  <button onClick={() => setRemarksCase(case_)} className={`relative flex items-center gap-1.5 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium ${hasAdminWarning ? 'border-amber-300 text-amber-700' : 'border-gray-300 text-gray-700'}`}>
                    <MessageSquare className={`w-3.5 h-3.5 ${remarksCount ? 'text-[#8d1436]' : ''}`} />
                    Remarks{remarksCount ? ` (${remarksCount})` : ''}
                    {unread > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#8d1436] text-white rounded-full text-[9px] flex items-center justify-center font-bold">{unread}</span>}
                  </button>
                  <button
                    onClick={() => setResponseCase(case_)}
                    className={`relative flex items-center gap-1.5 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium ${pendingResponseCount(case_) > 0 ? 'border-amber-300 text-amber-700' : 'border-gray-300 text-gray-700'}`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Request Response
                    {pendingResponseCount(case_) > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">{pendingResponseCount(case_)}</span>}
                  </button>
                  {(allStagesDone || case_.currentStage >= stages.length) && case_.status !== 'Complete' && case_.status !== 'Registered' && case_.status !== 'Granted' && (
                    <button onClick={() => setMarkComplete(case_)} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 border border-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-semibold ml-auto">
                      <CheckCircle className="w-3.5 h-3.5" /> Mark as Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center"><p className="text-gray-500 text-sm">No prosecution cases found.</p></div>}
        </div>
        )}
      </div>

      {advanceConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAdvanceConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#8d1436]/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-[#8d1436]" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Advance Stage?</h3>
            <p className="text-sm text-gray-600 mb-2">Advance <span className="font-semibold text-gray-900">{advanceConfirm.title}</span> to the next stage?</p>
            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2 mb-5">Current: <span className="font-semibold text-gray-700">{STAGES[advanceConfirm.prosType][advanceConfirm.currentStage]?.label}</span> → Next: <span className="font-semibold text-gray-700">{STAGES[advanceConfirm.prosType][Math.min(advanceConfirm.currentStage + 1, STAGES[advanceConfirm.prosType].length - 1)]?.label ?? 'Final Stage'}</span></p>
            <div className="flex gap-3">
              <button onClick={() => setAdvanceConfirm(null)} className="flex-1 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => {
                setCases(prev => prev.map(c => c.id === advanceConfirm!.id ? { ...c, currentStage: Math.min(c.currentStage + 1, STAGES[c.prosType].length) } : c));
                setAdvanceConfirm(null);
              }} className="flex-1 py-2 text-sm font-semibold bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130]">Advance Stage</button>
            </div>
          </div>
        </div>
      )}
      {responseCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-end pointer-events-none">
          <div className="absolute inset-0 bg-black/30 pointer-events-auto" onClick={() => { setResponseCase(null); setShowNewRequest(false); setResponseSendText(''); setReplyingToThreadId(null); setThreadReplyText(''); }} />
          <div className="relative pointer-events-auto bg-white shadow-2xl border-l border-gray-200 h-full w-full max-w-[420px] flex flex-col">
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#8d1436]" />
                  <h2 className="text-sm font-bold text-gray-900">Response Threads</h2>
                  {(() => { const open = (responseCase.responseRequests ?? []).filter(r => r.status !== 'closed').length; return open > 0 ? <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{open} open</span> : null; })()}
                </div>
                <p className="text-[11px] text-gray-400 truncate max-w-[300px] mt-0.5">{responseCase.title}</p>
              </div>
              <button onClick={() => { setResponseCase(null); setShowNewRequest(false); setResponseSendText(''); setReplyingToThreadId(null); setThreadReplyText(''); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {(responseCase.responseRequests ?? []).length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No requests sent yet.</div>
              ) : (
                (responseCase.responseRequests ?? []).map(req => {
                  const isClosed = req.status === 'closed';
                  const isReplying = replyingToThreadId === req.id;
                  return (
                    <div key={req.id} className={`rounded-xl border overflow-hidden ${isClosed ? 'border-gray-200 opacity-70' : req.status === 'pending' ? 'border-amber-200' : 'border-blue-200'}`}>
                      <div className={`px-3 pt-3 pb-2 ${isClosed ? 'bg-gray-50' : req.status === 'pending' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${isClosed ? 'bg-gray-200 text-gray-600' : req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            {isClosed ? 'Closed' : req.status === 'pending' ? 'Awaiting Response' : 'Active Thread'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-400">{new Date(req.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            {!isClosed && (
                              <button
                                onClick={() => {
                                  handleCloseThread(responseCase.id, req.id);
                                  setResponseCase(prev => prev ? { ...prev, responseRequests: (prev.responseRequests ?? []).map(r => r.id === req.id ? { ...r, status: 'closed' as const } : r) } : null);
                                }}
                                className="text-[10px] text-gray-400 hover:text-green-600 font-semibold flex items-center gap-0.5 border border-gray-200 rounded px-1.5 py-0.5 hover:border-green-300 hover:bg-green-50"
                              ><Check className="w-3 h-3" /> Close</button>
                            )}
                          </div>
                        </div>
                        {/* Opening message — handler right */}
                        <div className="flex items-end gap-2 justify-end mt-2">
                          <div className="flex flex-col items-end max-w-[85%]">
                            <span className="text-[10px] text-gray-400 mb-1">You (Case Handler) · {new Date(req.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <div className="bg-[#8d1436] text-white rounded-2xl rounded-br-sm px-3 py-2 text-sm leading-relaxed">{req.message}</div>
                            {req.attachmentName && (
                              <button onClick={() => setViewingFile({ name: req.attachmentName!, url: fileUrlMap[req.attachmentName!] })} className="mt-1 flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#8d1436] bg-white border border-gray-200 rounded-lg px-2 py-1 transition-colors">
                                <Paperclip className="w-3 h-3 flex-shrink-0" /><span className="truncate max-w-[130px]">{req.attachmentName}</span><Eye className="w-3 h-3 flex-shrink-0 opacity-60" />
                              </button>
                            )}
                          </div>
                          <div className="w-7 h-7 rounded-full bg-[#8d1436]/15 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-[#8d1436]">CH</div>
                        </div>
                      </div>
                      {(req.thread ?? []).length > 0 && (
                        <div className="px-3 pb-3 pt-1 space-y-3 bg-white">
                          {(req.thread ?? []).map(reply => {
                            const isHandler = reply.author === 'handler';
                            if (isHandler) {
                              return (
                                <div key={reply.id} className="flex items-end gap-2 justify-end">
                                  <div className="flex flex-col items-end max-w-[85%]">
                                    <span className="text-[10px] text-gray-400 mb-1">You (Case Handler) · {new Date(reply.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    <div className="bg-[#8d1436] text-white rounded-2xl rounded-br-sm px-3 py-2 text-sm leading-relaxed">{reply.text}</div>
                                    {reply.attachmentName && (
                                      <button onClick={() => setViewingFile({ name: reply.attachmentName!, url: fileUrlMap[reply.attachmentName!] })} className="mt-1 flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#8d1436] bg-white border border-gray-200 rounded-lg px-2 py-1 transition-colors">
                                        <Paperclip className="w-3 h-3 flex-shrink-0" /><span className="truncate max-w-[130px]">{reply.attachmentName}</span><Eye className="w-3 h-3 flex-shrink-0 opacity-60" />
                                      </button>
                                    )}
                                  </div>
                                  <div className="w-7 h-7 rounded-full bg-[#8d1436]/15 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-[#8d1436]">CH</div>
                                </div>
                              );
                            }
                            return (
                              <div key={reply.id} className="flex items-end gap-2">
                                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-green-700">AP</div>
                                <div className="flex flex-col items-start max-w-[85%]">
                                  <span className="text-[10px] text-gray-400 mb-1">Applicant · {new Date(reply.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                  <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-3 py-2 text-sm leading-relaxed">{reply.text}</div>
                                  {reply.attachmentName && (
                                    <button onClick={() => setViewingFile({ name: reply.attachmentName!, url: fileUrlMap[reply.attachmentName!] })} className="mt-1 flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#8d1436] bg-white border border-gray-200 rounded-lg px-2 py-1 transition-colors">
                                      <Paperclip className="w-3 h-3 flex-shrink-0" /><span className="truncate max-w-[130px]">{reply.attachmentName}</span><Eye className="w-3 h-3 flex-shrink-0 opacity-60" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {!isClosed && (
                        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
                          {isReplying ? (
                            <div className="space-y-1.5">
                              <textarea
                                autoFocus
                                value={threadReplyText}
                                onChange={e => setThreadReplyText(e.target.value)}
                                placeholder="Follow up with the applicant..."
                                rows={2}
                                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] resize-none bg-white"
                                onKeyDown={e => { if (e.key === 'Escape') { setReplyingToThreadId(null); setThreadReplyText(''); } }}
                              />
                              <input ref={reqFileRef} type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) setReqFiles([e.target.files[0]]); }} />
                              {reqFiles.length > 0 && <div className="flex items-center gap-1.5 text-[10px] text-gray-600 bg-white border border-gray-200 rounded px-2 py-1"><Paperclip className="w-3 h-3 flex-shrink-0 text-gray-400" /><span className="flex-1 truncate">{reqFiles[0].name}</span><button onClick={() => setReqFiles([])}><X className="w-3 h-3 text-gray-400 hover:text-red-500" /></button></div>}
                              <div className="flex gap-1.5">
                                <button type="button" onClick={() => reqFileRef.current?.click()} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-400" title="Attach file"><Paperclip className="w-3 h-3" /></button>
                                <button onClick={() => { setReplyingToThreadId(null); setThreadReplyText(''); setReqFiles([]); }} className="flex-1 py-1 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100">Cancel</button>
                                <button
                                  disabled={!threadReplyText.trim()}
                                  onClick={() => confirm('Send Reply', 'Send this reply to the applicant?', () => {
                                    const replyId = `rpl-${Date.now()}`;
                                    const attachName = reqFiles[0]?.name;
                                    const prefixedAttachName = attachName ? prefixResponseFile(attachName, replyId, responseCase.id) : undefined;
                                    handleThreadReply(responseCase.id, req.id, threadReplyText.trim(), prefixedAttachName);
                                    const newReply: ResponseReply = { id: replyId, author: 'handler', text: threadReplyText.trim(), date: new Date().toISOString(), attachmentName: prefixedAttachName };
                                    setResponseCase(prev => prev ? { ...prev, responseRequests: (prev.responseRequests ?? []).map(r => r.id === req.id ? { ...r, status: 'active' as const, thread: [...(r.thread ?? []), newReply] } : r) } : null);
                                    if (reqFiles[0]) { const url = URL.createObjectURL(reqFiles[0]); setFileUrlMap(prev => ({ ...prev, ...(attachName ? { [attachName]: url } : {}), ...(prefixedAttachName ? { [prefixedAttachName]: url } : {}) })); }
                                    setReplyingToThreadId(null); setThreadReplyText(''); setReqFiles([]);
                                  }, { confirmLabel: 'Send Reply' })}
                                  className="flex-1 py-1 text-xs font-semibold bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130] disabled:opacity-40 flex items-center justify-center gap-1"
                                ><Send className="w-3 h-3" /> Send</button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setReplyingToThreadId(req.id); setThreadReplyText(''); setReqFiles([]); }}
                              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#8d1436] transition-colors py-0.5"
                            >
                              <Send className="w-3 h-3" /> Follow up
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50">
              {showNewRequest ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600">New Request Thread</p>
                  <textarea
                    value={responseSendText}
                    onChange={e => setResponseSendText(e.target.value)}
                    placeholder="Describe what information or documents you need from the applicant..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] resize-none bg-white"
                  />
                  <input ref={newReqFileRef} type="file" multiple className="hidden" onChange={e => { if (e.target.files) setNewReqFiles(prev => [...prev, ...Array.from(e.target.files!)]); }} />
                  <button type="button" onClick={() => newReqFileRef.current?.click()} className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 w-full">
                    <Paperclip className="w-3 h-3" /> Attach files {newReqFiles.length > 0 && `(${newReqFiles.length})`}
                  </button>
                  {newReqFiles.length > 0 && newReqFiles.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" /><span className="flex-1 truncate">{f.name}</span>
                      <button onClick={() => setNewReqFiles(prev => prev.filter((_, i) => i !== fi))}><X className="w-3 h-3 text-gray-400 hover:text-red-500" /></button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button onClick={() => { setShowNewRequest(false); setResponseSendText(''); setNewReqFiles([]); }} className="flex-1 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button
                      disabled={!responseSendText.trim()}
                      onClick={() => confirm('Open Request Thread', 'Send this response request to the applicant?', () => {
                        const requestId = `rr-${Date.now()}`;
                        const attachName = newReqFiles[0]?.name;
                        const prefixedAttachName = attachName ? prefixResponseFile(attachName, requestId, responseCase.id) : undefined;
                        handleSendRespReq(responseCase.id, responseSendText.trim(), prefixedAttachName);
                        const updated = [...(responseCase.responseRequests ?? []), { id: requestId, message: responseSendText.trim(), attachmentName: prefixedAttachName, requestDate: new Date().toISOString(), status: 'pending' as const, thread: [] as ResponseReply[] }];
                        setResponseCase(prev => prev ? { ...prev, responseRequests: updated } : null);
                        if (newReqFiles[0]) { const url = URL.createObjectURL(newReqFiles[0]); setFileUrlMap(prev => ({ ...prev, ...(attachName ? { [attachName]: url } : {}), ...(prefixedAttachName ? { [prefixedAttachName]: url } : {}) })); }
                        setShowNewRequest(false); setResponseSendText(''); setNewReqFiles([]);
                      }, { confirmLabel: 'Send Request' })}
                      className="flex-1 py-2 text-xs font-semibold bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130] disabled:opacity-40"
                    >Open Thread</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewRequest(true)}
                  className="w-full py-2 text-xs font-semibold bg-[#8d1436] text-white rounded-xl hover:bg-[#7a1130] flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> New Request Thread
                </button>
              )}
            </div>
          </div>
          {viewingFile && <FileViewerModal name={viewingFile.name} url={viewingFile.url} onClose={() => setViewingFile(null)} />}
        </div>
      )}
      <LinkFolderModal isOpen={!!folderCase} onClose={() => setFolderCase(null)} item={folderCase} onSave={handleSaveFolder} onAttachFiles={handleAttachFiles} />
      <UnifiedRemarksModal isOpen={!!remarksCase} onClose={() => setRemarksCase(null)} item={remarksCase} currentRole="handler" onAddRemark={handleAddRemark} onMarkResolved={handleMarkResolved} onMarkRead={handleMarkRead} onAddReply={handleAddReply} />
      {stepConfirm && <StepConfirmModal stepLabel={stepConfirm.stepLabel} hasDrive={!!stepConfirm.case_.folderLink} onConfirm={() => handleCompleteDetailStep(stepConfirm.case_.id, stepConfirm.stepIdx)} onClose={() => setStepConfirm(null)} />}
      {markComplete && <MarkCompleteModal caseTitle={markComplete.title} onConfirm={() => handleMarkCaseComplete(markComplete.id)} onClose={() => setMarkComplete(null)} />}
      {downgradePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setDowngradePrompt(null); setDowngradeConfirm(false); setKeepPatentConfirm(false); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            {!downgradeConfirm && !keepPatentConfirm ? (
              <>
                <h3 className="text-base font-bold text-gray-900 mb-1">Substantive Examination — Next Step</h3>
                <p className="text-sm text-gray-500 mb-1 truncate">{downgradePrompt.title}</p>
                <p className="text-xs text-gray-400 mb-5">Select how to proceed with this patent application at the Substantive Examination stage.</p>
                <div className="space-y-3">
                  <button
                    onClick={() => setDowngradeConfirm(true)}
                    className="w-full flex items-start gap-3 p-4 rounded-xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-800">Downgrade to Utility Model</p>
                      <p className="text-xs text-amber-600 mt-0.5">Application will be converted to a Utility Model track. This action cannot be undone.</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setKeepPatentConfirm(true)}
                    className="w-full flex items-start gap-3 p-4 rounded-xl border-2 border-[#8d1436]/30 bg-[#fdf0f3] hover:bg-[#fae4e8] transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#8d1436]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-[#8d1436]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#8d1436]">Continue as Patent</p>
                      <p className="text-xs text-[#8d1436]/70 mt-0.5">Proceed to the next stage. Keep the application on the patent track.</p>
                    </div>
                  </button>
                </div>
                <button onClick={() => setDowngradePrompt(null)} className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
              </>
            ) : keepPatentConfirm ? (
              <>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#8d1436]/10 mx-auto mb-4">
                  <Check className="w-6 h-6 text-[#8d1436]" />
                </div>
                <h3 className="text-base font-bold text-gray-900 text-center mb-2">Confirm — Keep as Patent</h3>
                <p className="text-sm text-gray-600 text-center mb-1 truncate font-medium">{downgradePrompt.title}</p>
                <p className="text-sm text-gray-500 text-center mb-5">
                  The application will advance past Substantive Examination and remain on the <span className="font-semibold text-gray-700">Patent</span> track. The case will proceed toward the Granted stage.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setKeepPatentConfirm(false)}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={() => {
                      setCases(prev => prev.map(c => c.id === downgradePrompt!.id ? { ...c, currentStage: Math.min(c.currentStage + 1, STAGES[c.prosType].length) } : c));
                      setDowngradePrompt(null);
                      setKeepPatentConfirm(false);
                    }}
                    className="flex-1 py-2.5 text-sm font-bold text-white bg-[#8d1436] hover:bg-[#7a1230] rounded-xl transition-colors"
                  >
                    Yes, Keep as Patent
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 text-center mb-2">Confirm Downgrade to Utility Model</h3>
                <p className="text-sm text-gray-600 text-center mb-1 truncate font-medium">{downgradePrompt.title}</p>
                <p className="text-sm text-gray-500 text-center mb-5">
                  This will permanently change the IP type from <span className="font-semibold text-gray-700">Patent</span> to <span className="font-semibold text-amber-700">Utility Model</span>. The application will restart from the Utility Model examination track. <span className="font-semibold text-red-600">This action cannot be undone.</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDowngradeConfirm(false)}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={() => {
                      update(downgradePrompt.id, { prosType: 'patent-to-um', ipTypeLabel: 'Patent → UM', currentStage: 3 });
                      setDowngradePrompt(null);
                      setDowngradeConfirm(false);
                    }}
                    className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                  >
                    Yes, Downgrade
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          variant={confirmDialog.variant}
          onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
