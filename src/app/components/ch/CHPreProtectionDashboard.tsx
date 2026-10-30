import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { FolderOpen, MessageSquare, Check, AlertTriangle, Search, Filter, CalendarClock, Bell, Upload, X, CheckCircle2, ArrowRightLeft, LayoutGrid, LayoutList, ChevronDown, ChevronUp, Send, Pencil, Paperclip, Eye, ClipboardList, Plus, Minus, Download } from 'lucide-react';
import CaseHandlerNav from '../CaseHandlerNav';
import { LinkFolderModal } from '../modals/LinkFolderModal';
import { UnifiedRemarksModal, UnifiedRemark, UnifiedRemarkReply } from '../modals/UnifiedRemarksModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';

export interface ResponseReply {
  id: string;
  author: 'handler' | 'applicant';
  text: string;
  date: string;
  attachmentName?: string;
}

export interface ResponseRequest {
  id: string;
  message: string;
  attachmentName?: string;
  requestDate: string;
  status: 'pending' | 'active' | 'closed';
  thread?: ResponseReply[];
}

interface PASSearchRow { id: string; database: string; searchString: string; hits: string; }
interface PASDocRow { id: string; category: string; docInfo: string; abstract: string; pubLink: string; }
interface PASCompRow { id: string; feature: string; presentInvention: string; docValues: Record<string, string>; }
interface IPCSubEntry { id: string; code: string; description: string; }
interface IPCEntry { id: string; code: string; description: string; subEntries: IPCSubEntry[]; }
interface PASReportData {
  status: 'draft' | 'pending_approval' | 'approved';
  university: string; researchers: string; title: string; dateOfResearch: string;
  abstract: string; ipcEntries: IPCEntry[]; keywords: string;
  searchRows: PASSearchRow[];
  docRows: PASDocRow[];
  compDocLabels: string[];
  compRows: PASCompRow[];
  recommendation: string;
  novelty: 'yes' | 'no' | ''; noveltyNotes: string;
  inventiveness: 'yes' | 'no' | ''; inventivenessNotes: string;
  industrialApplicability: 'yes' | 'no' | ''; industrialApplicabilityNotes: string;
  conductedBy: string; conductedDate: string;
  reviewedBy: string; reviewedDate: string;
}

const PAS_STORAGE_KEY = 'ipasa_pas_reports';
function loadPasReports(): Record<string, PASReportData> {
  try { const raw = localStorage.getItem(PAS_STORAGE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
function savePasReports(reports: Record<string, PASReportData>) {
  try { localStorage.setItem(PAS_STORAGE_KEY, JSON.stringify(reports)); } catch {}
}

interface StepDef { positive: string; negative: string; }

const STEPS: Record<string, StepDef[]> = {
  Patent: [
    { positive: 'Submitted', negative: 'Incomplete' },
    { positive: 'Case Handler Assigned', negative: 'For Assignment' },
    { positive: 'Prior Art Search Done', negative: 'Under Evaluation' },
    { positive: 'Draft Done', negative: 'For Drafting' },
    { positive: 'Endorsed to OC', negative: 'For Endorsement' },
    { positive: 'Filed for Patent', negative: 'For Filing' },
  ],
  'Utility Model': [
    { positive: 'Submitted', negative: 'Incomplete' },
    { positive: 'Case Handler Assigned', negative: 'For Assignment' },
    { positive: 'Prior Art Search Done', negative: 'Under Evaluation' },
    { positive: 'Draft Done', negative: 'For Drafting' },
    { positive: 'Endorsed to OC', negative: 'For Endorsement' },
    { positive: 'Filed for Utility Model', negative: 'For Filing' },
  ],
  'Industrial Design': [
    { positive: 'Submitted', negative: 'Incomplete' },
    { positive: 'Case Handler Assigned', negative: 'For Assignment' },
    { positive: 'Prior Art Search Done', negative: 'Under Evaluation' },
    { positive: 'Draft Done', negative: 'For Drafting' },
    { positive: 'Endorsed to OC', negative: 'For Endorsement' },
    { positive: 'Filed for Industrial Design', negative: 'For Filing' },
  ],
  Copyright: [
    { positive: 'Submitted', negative: 'Incomplete' },
    { positive: 'Case Handler Assigned', negative: 'For Assignment' },
    { positive: 'Endorsed to OC', negative: 'Under Review' },
    { positive: 'Filed for Copyright', negative: 'For Filing' },
  ],
  Trademark: [
    { positive: 'Submitted', negative: 'Incomplete' },
    { positive: 'Case Handler Assigned', negative: 'For Assignment' },
    { positive: 'Endorsed to OC', negative: 'Under Review' },
    { positive: 'Filed for Trademark', negative: 'For Filing' },
  ],
};

type IPType = 'Patent' | 'Utility Model' | 'Industrial Design' | 'Trademark' | 'Copyright';
interface AttachedFile { name: string; size: number; uploadedAt: string; folder: 'attached files'; }
interface CHCase {
  id: string; title: string; description: string; ipType: IPType;
  dateDisclosed: string; publicDisclosureDate?: string; inventorName: string; college: string;
  department: string; fundingAgency: string; contactEmail: string;
  currentStep: number; blocked?: boolean; folderLink?: string;
  attachedFiles?: AttachedFile[]; unifiedRemarks?: UnifiedRemark[];
  deadline?: string; extensionRequested?: boolean; extensionRequestDate?: string;
  extensionApproved?: boolean; transferredFrom?: string;
  responseRequests?: ResponseRequest[];
  secondaryInventors?: string[];
}

function isLate(d?: string) { return !!d && new Date(d) < new Date(); }
function isToday(d?: string): boolean {
  if (!d) return false;
  const t = new Date(d), n = new Date();
  return t.getFullYear() === n.getFullYear() && t.getMonth() === n.getMonth() && t.getDate() === n.getDate();
}

const mockMyCases: CHCase[] = [
  {
    id: 'PRE-2026-001', title: 'Smart Irrigation System Using IoT Sensors',
    description: 'An automated irrigation system using moisture sensors and weather data.',
    ipType: 'Patent', dateDisclosed: '2026-04-25', inventorName: 'Dr. Ana Reyes',
    secondaryInventors: ['Engr. Jose Delos Santos', 'Dr. Carla Bautista'],
    college: 'College of Engineering and Agro-Industrial Technology',
    department: 'Dept. of Agricultural and Biosystems Engineering',
    fundingAgency: 'DOST-PCAARRD', contactEmail: 'areyes@up.edu.ph',
    currentStep: 3, deadline: '2026-07-05', extensionApproved: true,
  },
  {
    id: 'PRE-2026-004', title: 'Bio-based Edible Coating for Tropical Fruits',
    description: 'A novel plant-based coating formulated to extend shelf life of exported mangoes.',
    ipType: 'Patent', dateDisclosed: '2026-05-02', publicDisclosureDate: '2026-04-15', inventorName: 'Dr. Maria Santos',
    secondaryInventors: ['Dr. Liza Fernandez', 'Prof. Ramon Aquino', 'Engr. Sophia Lee'],
    college: 'College of Agriculture and Food Science',
    department: 'Institute of Food Science and Technology',
    fundingAgency: 'DA-BAR', contactEmail: 'msantos@up.edu.ph',
    currentStep: 2, deadline: '2026-07-09',
    folderLink: 'https://drive.google.com/drive/folders/example-biocoating',
    transferredFrom: 'Carlos Mendoza',
    responseRequests: [{
      id: 'rr1',
      message: 'Please provide the complete list of inventors and their respective contributions to the edible coating formulation. Also attach the most recent lab report.',
      requestDate: '2026-07-08T10:00:00',
      status: 'active',
      thread: [
        { id: 'rpl-1', author: 'applicant', text: 'Dr. Liza Fernandez contributed the polymer base formula, Prof. Ramon Aquino led the shelf-life trials, and Engr. Sophia Lee handled materials sourcing. Lab report attached above.', date: '2026-07-09T08:30:00', attachmentName: 'lab_report_v3.pdf' },
      ],
    }],
  },
  {
    id: 'PRE-2026-010', title: 'Solar-Powered Grain Drying System',
    description: 'A utility model for an energy-efficient grain drying unit.',
    ipType: 'Utility Model', dateDisclosed: '2026-05-15', inventorName: 'Engr. Danilo Cruz',
    college: 'College of Engineering and Agro-Industrial Technology',
    department: 'Dept. of Mechanical Engineering',
    fundingAgency: 'DOST-PCAARRD', contactEmail: 'dcruz@up.edu.ph', currentStep: 2,
  },
  {
    id: 'PRE-2026-008', title: 'Field Guide to Philippine Endemic Orchids',
    description: 'An illustrated field guide detailing 50 endemic orchid species.',
    ipType: 'Copyright', dateDisclosed: '2026-05-08', inventorName: 'Dr. Patricia Alcantara',
    college: 'Museum of Natural History', department: 'Botanical Herbarium',
    fundingAgency: 'CHED', contactEmail: 'palcantara@up.edu.ph',
    currentStep: 1, deadline: '2026-07-25',
    unifiedRemarks: [{
      id: 'r_admin1', author: 'Admin', role: 'admin',
      text: 'Please verify authorship documents for all orchid illustrations before endorsing to OC.',
      date: '2026-07-01T14:00:00', read: false, resolved: false,
    }],
  },
];

type StepState = 'accomplished' | 'ongoing' | 'blocked' | 'pending';
function getStepState(idx: number, cur: number, blocked: boolean): StepState {
  if (idx < cur) return 'accomplished';
  if (idx === cur) return blocked ? 'blocked' : 'ongoing';
  return 'pending';
}
function StepNode({ state }: { state: StepState }) {
  if (state === 'accomplished') return <div className="w-9 h-9 rounded-full bg-[#8d1436] flex items-center justify-center flex-shrink-0 shadow-sm"><Check className="w-4 h-4 text-white stroke-[3]" /></div>;
  if (state === 'ongoing')     return <div className="w-9 h-9 rounded-full border-2 border-[#8d1436] bg-white flex items-center justify-center flex-shrink-0 ring-4 ring-[#8d1436]/20"><div className="w-2.5 h-2.5 rounded-full bg-[#8d1436] animate-pulse" /></div>;
  if (state === 'blocked')     return <div className="w-9 h-9 rounded-full border-2 border-amber-400 bg-amber-50 flex items-center justify-center flex-shrink-0 ring-4 ring-amber-200"><AlertTriangle className="w-4 h-4 text-amber-500" /></div>;
  return <div className="w-9 h-9 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 rounded-full bg-gray-300" /></div>;
}

function DeadlineBadge({ deadline }: { deadline?: string }) {
  if (!deadline) return null;
  const late = isLate(deadline);
  const today = isToday(deadline);
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${late ? 'bg-red-100 text-red-700' : today ? 'bg-amber-100 text-amber-700' : 'bg-orange-50 text-orange-700'}`}>
      <CalendarClock className="w-3 h-3" />
      {late ? 'OVERDUE · ' : today ? 'TODAY · ' : ''}{new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    </span>
  );
}

const TYPE_BADGE: Record<IPType, string> = {
  Patent: 'bg-blue-100 text-blue-800', 'Utility Model': 'bg-purple-100 text-purple-800',
  'Industrial Design': 'bg-indigo-100 text-indigo-800', Trademark: 'bg-green-100 text-green-800', Copyright: 'bg-yellow-100 text-yellow-800',
};

// ── Step completion modal ─────────────────────────────────────────────────────
interface StepModalProps { caseId: string; stepName: string; onConfirm: (caseId: string, ipophlNo?: string, file?: File) => void; onClose: () => void; }
function StepCompletionModal({ caseId, stepName, onConfirm, onClose }: StepModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [ipophlNo, setIpophlNo] = useState('');
  const isFiled = stepName.toLowerCase().includes('filed');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="w-12 h-12 rounded-full bg-[#8d1436]/10 flex items-center justify-center mx-auto mb-4"><Check className="w-6 h-6 text-[#8d1436]" /></div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-1">Confirm Step Completion</h3>
        <p className="text-sm text-gray-600 text-center mb-4">Mark <span className="font-semibold text-gray-900">&ldquo;{stepName}&rdquo;</span> as complete?</p>
        {isFiled && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">IPOPHL Application Number</label>
            <input
              type="text"
              value={ipophlNo}
              onChange={e => setIpophlNo(e.target.value)}
              placeholder="e.g. 1-2026-500001"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]"
            />
            <p className="text-[11px] text-gray-400 mt-1">Enter the application number assigned by IPOPHL upon filing.</p>
          </div>
        )}
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
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => { onConfirm(caseId, isFiled ? ipophlNo : undefined, file ?? undefined); onClose(); }} className="flex-1 py-2 text-sm font-semibold bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130]">Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ── Extension request modal ───────────────────────────────────────────────────
interface ExtReqModalProps { caseId: string; caseTitle: string; onRequest: (id: string, reason: string) => void; onClose: () => void; }
function ExtensionRequestModal({ caseId, caseTitle, onRequest, onClose }: ExtReqModalProps) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-1">Request Deadline Extension</h3>
        <p className="text-sm text-gray-500 mb-4 truncate" title={caseTitle}>{caseTitle}</p>
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Reason for extension <span className="text-red-500">*</span></label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Explain why you need more time..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] resize-none" />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => { if (reason.trim()) { onRequest(caseId, reason); onClose(); } }} disabled={!reason.trim()} className="flex-1 py-2 text-sm font-semibold bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130] disabled:opacity-50 disabled:cursor-not-allowed">Submit Request</button>
        </div>
      </div>
    </div>
  );
}

function makePASReportData(c: CHCase): PASReportData {
  return {
    status: 'draft',
    university: 'University of the Philippines Los Baños',
    researchers: [c.inventorName, ...(c.secondaryInventors ?? [])].join(', '),
    title: c.title,
    dateOfResearch: '',
    abstract: c.description,
    ipcEntries: [],
    keywords: '',
    searchRows: [{ id: '1', database: '', searchString: '', hits: '' }],
    docRows: [{ id: '1', category: '', docInfo: '', abstract: '', pubLink: '' }],
    compDocLabels: ['D1'],
    compRows: [{ id: '1', feature: '', presentInvention: '', docValues: { D1: '' } }],
    recommendation: '',
    novelty: '', noveltyNotes: '',
    inventiveness: '', inventivenessNotes: '',
    industrialApplicability: '', industrialApplicabilityNotes: '',
    conductedBy: '', conductedDate: new Date().toISOString().slice(0, 10),
    reviewedBy: '', reviewedDate: '',
  };
}

function downloadPASReport(data: PASReportData, caseTitle: string) {
  const fmt = (s?: string) => s ? new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const yn = (v?: string) => v === 'yes' ? 'Yes' : v === 'no' ? 'No' : 'Not set';
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>PAS Report – ${caseTitle}</title><style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;color:#333;line-height:1.5}h1{color:#8d1436;border-bottom:2px solid #8d1436;padding-bottom:8px}h2{color:#8d1436;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:28px}table{width:100%;border-collapse:collapse;margin:8px 0}th,td{border:1px solid #ddd;padding:8px 10px;text-align:left;font-size:13px}th{background:#f5f5f5;font-weight:600}.label{font-size:11px;text-transform:uppercase;color:#888;letter-spacing:.5px;margin-bottom:2px}.val{margin-bottom:12px;font-size:14px}.badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600}.approved{background:#d1fae5;color:#065f46}.pending{background:#dbeafe;color:#1e40af}.draft{background:#fef3c7;color:#92400e}@media print{body{margin:20px}}</style></head><body>
<h1>Prior Art Search (PAS) Report</h1>
<p class="badge ${data.status === 'approved' ? 'approved' : data.status === 'pending_approval' ? 'pending' : 'draft'}">${data.status === 'approved' ? 'Approved' : data.status === 'pending_approval' ? 'Pending Approval' : 'Draft'}</p>
<h2>1. General Information</h2>
<div class="label">University</div><div class="val">${data.university || '—'}</div>
<div class="label">Researcher(s)</div><div class="val">${data.researchers || '—'}</div>
<div class="label">Title of Invention</div><div class="val">${data.title || '—'}</div>
<div class="label">Date of Research</div><div class="val">${fmt(data.dateOfResearch)}</div>
<div class="label">Abstract</div><div class="val">${data.abstract || '—'}</div>
<div class="label">Keywords</div><div class="val">${data.keywords || '—'}</div>
${data.ipcEntries?.length ? `<div class="label">IPC Classification</div><table><thead><tr><th>Code</th><th>Description</th></tr></thead><tbody>${data.ipcEntries.map(e => `<tr><td>${e.code}</td><td>${e.description}</td></tr>${e.subEntries?.map(s => `<tr><td style="padding-left:24px">└ ${s.code}</td><td>${s.description}</td></tr>`).join('') ?? ''}`).join('')}</tbody></table>` : ''}
<h2>2. Search Strings and Databases</h2>
<table><thead><tr><th>Database</th><th>Search String</th><th>Hits</th></tr></thead><tbody>${data.searchRows?.map(r => `<tr><td>${r.database}</td><td><code>${r.searchString}</code></td><td>${r.hits}</td></tr>`).join('') ?? ''}</tbody></table>
<h2>3. Documents Considered Relevant</h2>
${data.docRows?.map((r, i) => `<div class="label">Document ${i+1}</div><div class="val"><b>Category:</b> ${r.category} &nbsp; <b>Link:</b> ${r.pubLink || '—'}<br>${r.docInfo}<br><em>${r.abstract}</em></div>`).join('') ?? ''}
<h2>5. Recommendation</h2>
<div class="val">${data.recommendation || '—'}</div>
<div class="label">Novelty</div><div class="val">${yn(data.novelty)}${data.noveltyNotes ? ' — ' + data.noveltyNotes : ''}</div>
<div class="label">Inventive Step / Originality</div><div class="val">${yn(data.inventiveness)}${data.inventivenessNotes ? ' — ' + data.inventivenessNotes : ''}</div>
<div class="label">Industrial Applicability</div><div class="val">${yn(data.industrialApplicability)}${data.industrialApplicabilityNotes ? ' — ' + data.industrialApplicabilityNotes : ''}</div>
<h2>6. Certification &amp; Signatures</h2>
<table><thead><tr><th>Role</th><th>Name</th><th>Date</th></tr></thead><tbody><tr><td>Search Conducted by</td><td>${data.conductedBy || '—'}</td><td>${fmt(data.conductedDate)}</td></tr><tr><td>Search Reviewed by</td><td>${data.reviewedBy || '—'}</td><td>${fmt(data.reviewedDate)}</td></tr></tbody></table>
</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PAS_Report_${caseTitle.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function validatePASReport(form: PASReportData): string[] {
  const missing: string[] = [];
  if (!form.university?.trim()) missing.push('University');
  if (!form.researchers?.trim()) missing.push('Researcher(s)');
  if (!form.title?.trim()) missing.push('Title of Invention');
  if (!form.dateOfResearch?.trim()) missing.push('Date of Research');
  if (!form.abstract?.trim()) missing.push('Abstract');
  if (!form.keywords?.trim()) missing.push('Keywords');
  if (!form.ipcEntries?.length) missing.push('IPC Classification (at least 1 entry)');
  const hasSearchRow = form.searchRows?.some(r => r.database?.trim() && r.searchString?.trim());
  if (!hasSearchRow) missing.push('Search Strings and Databases (at least 1 complete row)');
  const hasDocRow = form.docRows?.some(r => r.docInfo?.trim());
  if (!hasDocRow) missing.push('Documents Considered Relevant (at least 1 document)');
  if (!form.recommendation?.trim()) missing.push('Recommendation Statement');
  if (!form.novelty) missing.push('Novelty (Yes/No)');
  if (!form.inventiveness) missing.push('Inventive Step / Originality (Yes/No)');
  if (!form.industrialApplicability) missing.push('Industrial Applicability (Yes/No)');
  if (!form.conductedBy?.trim()) missing.push('Search Conducted By — Name');
  if (!form.conductedDate?.trim()) missing.push('Search Conducted By — Date');
  return missing;
}

function PASReportModal({ case_, report, onSave, onClose, readOnly }: {
  case_: CHCase; report: PASReportData | null;
  onSave: (caseId: string, data: PASReportData) => void;
  onClose: () => void; readOnly?: boolean;
}) {
  const [form, setForm] = useState<PASReportData>(() => report ?? makePASReportData(case_));
  const set = <K extends keyof PASReportData>(key: K, val: PASReportData[K]) => setForm(f => ({ ...f, [key]: val }));
  const [pasConfirm, setPasConfirm] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const inputCls = `w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]${readOnly ? ' bg-gray-50' : ''}`;
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';
  const Req = () => readOnly ? null : <span className="text-red-500 ml-0.5">*</span>;

  const SectionHeader = ({ num, title, required }: { num: string; title: string; required?: boolean }) => (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-7 h-7 rounded-full bg-[#8d1436] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{num}</span>
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}{required && !readOnly && <span className="text-red-500 ml-1">*</span>}</h3>
    </div>
  );

  const addSearchRow = () => setForm(f => ({ ...f, searchRows: [...f.searchRows, { id: `${Date.now()}`, database: '', searchString: '', hits: '' }] }));
  const removeSearchRow = (id: string) => setForm(f => ({ ...f, searchRows: f.searchRows.filter(r => r.id !== id) }));
  const updateSearchRow = (id: string, field: keyof PASSearchRow, val: string) => setForm(f => ({ ...f, searchRows: f.searchRows.map(r => r.id === id ? { ...r, [field]: val } : r) }));

  const addDocRow = () => setForm(f => ({ ...f, docRows: [...f.docRows, { id: `${Date.now()}`, category: '', docInfo: '', abstract: '', pubLink: '' }] }));
  const removeDocRow = (id: string) => setForm(f => ({ ...f, docRows: f.docRows.filter(r => r.id !== id) }));
  const updateDocRow = (id: string, field: keyof PASDocRow, val: string) => setForm(f => ({ ...f, docRows: f.docRows.map(r => r.id === id ? { ...r, [field]: val } : r) }));

  const addIPCEntry = () => setForm(f => ({ ...f, ipcEntries: [...f.ipcEntries, { id: `${Date.now()}`, code: '', description: '', subEntries: [] }] }));
  const removeIPCEntry = (id: string) => setForm(f => ({ ...f, ipcEntries: f.ipcEntries.filter(e => e.id !== id) }));
  const updateIPCEntry = (id: string, field: 'code' | 'description', val: string) => setForm(f => ({ ...f, ipcEntries: f.ipcEntries.map(e => e.id === id ? { ...e, [field]: val } : e) }));
  const addIPCSub = (entryId: string) => setForm(f => ({ ...f, ipcEntries: f.ipcEntries.map(e => e.id === entryId ? { ...e, subEntries: [...e.subEntries, { id: `${Date.now()}`, code: '', description: '' }] } : e) }));
  const removeIPCSub = (entryId: string, subId: string) => setForm(f => ({ ...f, ipcEntries: f.ipcEntries.map(e => e.id === entryId ? { ...e, subEntries: e.subEntries.filter(s => s.id !== subId) } : e) }));
  const updateIPCSub = (entryId: string, subId: string, field: 'code' | 'description', val: string) => setForm(f => ({ ...f, ipcEntries: f.ipcEntries.map(e => e.id === entryId ? { ...e, subEntries: e.subEntries.map(s => s.id === subId ? { ...s, [field]: val } : s) } : e) }));

  const addCompDoc = () => {
    const newLabel = `D${form.compDocLabels.length + 1}`;
    setForm(f => ({ ...f, compDocLabels: [...f.compDocLabels, newLabel], compRows: f.compRows.map(r => ({ ...r, docValues: { ...r.docValues, [newLabel]: '' } })) }));
  };
  const removeLastCompDoc = () => {
    const label = form.compDocLabels[form.compDocLabels.length - 1];
    if (!label) return;
    setForm(f => ({ ...f, compDocLabels: f.compDocLabels.slice(0, -1), compRows: f.compRows.map(r => { const { [label]: _removed, ...rest } = r.docValues; return { ...r, docValues: rest }; }) }));
  };
  const addCompRow = () => setForm(f => ({ ...f, compRows: [...f.compRows, { id: `${Date.now()}`, feature: '', presentInvention: '', docValues: Object.fromEntries(f.compDocLabels.map(l => [l, ''])) }] }));
  const removeCompRow = (id: string) => setForm(f => ({ ...f, compRows: f.compRows.filter(r => r.id !== id) }));
  const updateCompRow = (id: string, field: 'feature' | 'presentInvention', val: string) => setForm(f => ({ ...f, compRows: f.compRows.map(r => r.id === id ? { ...r, [field]: val } : r) }));
  const updateCompDocVal = (rowId: string, docLabel: string, val: string) => setForm(f => ({ ...f, compRows: f.compRows.map(r => r.id === rowId ? { ...r, docValues: { ...r.docValues, [docLabel]: val } } : r) }));

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white h-full w-full max-w-3xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#8d1436]/10 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5 text-[#8d1436]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">Prior Art Search Report</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${form.status === 'approved' ? 'bg-green-100 text-green-700' : form.status === 'pending_approval' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{form.status === 'approved' ? 'Approved' : form.status === 'pending_approval' ? 'Pending Approval' : 'Draft'}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{case_.id} · {case_.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0 ml-4"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          {/* 1. General Information */}
          <section>
            <SectionHeader num="1" title="General Information" required />
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className={labelCls}>University<Req /></label><input type="text" value={form.university} onChange={e => set('university', e.target.value)} className={inputCls} readOnly={readOnly} /></div>
              <div className="col-span-2"><label className={labelCls}>Researcher(s)<Req /></label><input type="text" value={form.researchers} onChange={e => set('researchers', e.target.value)} className={inputCls} readOnly={readOnly} /></div>
              <div className="col-span-2"><label className={labelCls}>Title of Invention / Creation<Req /></label><input type="text" value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} readOnly={readOnly} /></div>
              <div><label className={labelCls}>Date of Research<Req /></label><input type="date" value={form.dateOfResearch} onChange={e => set('dateOfResearch', e.target.value)} className={inputCls} readOnly={readOnly} /></div>
              <div className="col-span-2"><label className={labelCls}>Abstract<Req /></label><textarea value={form.abstract} onChange={e => set('abstract', e.target.value)} rows={4} className={`${inputCls} resize-none`} readOnly={readOnly} /></div>
              <div className="col-span-2"><label className={labelCls}>Keywords<Req /></label><input type="text" value={form.keywords} onChange={e => set('keywords', e.target.value)} placeholder="e.g. irrigation, IoT, moisture sensor" className={inputCls} readOnly={readOnly} /></div>
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls + ' mb-0'}>International Patent Classification (IPC)<Req /></label>
                  {!readOnly && <button onClick={addIPCEntry} className="flex items-center gap-1 text-xs text-[#8d1436] font-semibold hover:text-[#7a1130]"><Plus className="w-3.5 h-3.5" /> Add IPC Entry</button>}
                </div>
                {form.ipcEntries.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">{readOnly ? 'No IPC entries recorded.' : 'No IPC entries yet. Click "Add IPC Entry" to start.'}</p>
                ) : (
                  <div className="space-y-3">
                    {form.ipcEntries.map((entry, idx) => (
                      <div key={entry.id} className="border border-gray-200 rounded-xl p-3 relative bg-gray-50">
                        {!readOnly && <button onClick={() => removeIPCEntry(entry.id)} className="absolute top-2.5 right-2.5 text-gray-300 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>}
                        <p className="text-[10px] font-bold text-[#8d1436] uppercase tracking-wide mb-2">Classification {idx + 1}</p>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div><label className={labelCls}>Code</label><input type="text" value={entry.code} onChange={e => updateIPCEntry(entry.id, 'code', e.target.value)} placeholder="e.g. A23K 30/00" className={inputCls + ' font-mono'} readOnly={readOnly} /></div>
                          <div className="col-span-2"><label className={labelCls}>Description</label><input type="text" value={entry.description} onChange={e => updateIPCEntry(entry.id, 'description', e.target.value)} placeholder="e.g. Processes for preservation of animal feeding-stuffs" className={inputCls} readOnly={readOnly} /></div>
                        </div>
                        {entry.subEntries.length > 0 && (
                          <div className="space-y-1.5 ml-4 mb-2">
                            {entry.subEntries.map(sub => (
                              <div key={sub.id} className="grid grid-cols-3 gap-2 items-center">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-gray-300 text-xs">└</span>
                                  <input type="text" value={sub.code} onChange={e => updateIPCSub(entry.id, sub.id, 'code', e.target.value)} placeholder="e.g. 30/15" className={inputCls + ' font-mono text-xs py-1'} readOnly={readOnly} />
                                </div>
                                <div className="col-span-2 flex items-center gap-1.5">
                                  <input type="text" value={sub.description} onChange={e => updateIPCSub(entry.id, sub.id, 'description', e.target.value)} placeholder="Sub-description..." className={inputCls + ' text-xs py-1 flex-1'} readOnly={readOnly} />
                                  {!readOnly && <button onClick={() => removeIPCSub(entry.id, sub.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0"><X className="w-3 h-3" /></button>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {!readOnly && <button onClick={() => addIPCSub(entry.id)} className="flex items-center gap-1 text-[11px] text-gray-500 font-medium hover:text-[#8d1436] ml-4"><Plus className="w-3 h-3" /> Add Subclassification</button>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 2. Search Strings and Databases */}
          <section>
            <SectionHeader num="2" title="Search Strings and Databases" required />
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Database</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Search String</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 w-20">Hits</th>
                    {!readOnly && <th className="px-3 py-2 w-10" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {form.searchRows.map(row => (
                    <tr key={row.id}>
                      <td className="px-2 py-1.5"><input type="text" value={row.database} onChange={e => updateSearchRow(row.id, 'database', e.target.value)} placeholder="e.g. Google Patents" className="w-full text-sm border-0 outline-none bg-transparent focus:ring-1 focus:ring-[#8d1436]/30 rounded px-1 py-0.5" readOnly={readOnly} /></td>
                      <td className="px-2 py-1.5"><input type="text" value={row.searchString} onChange={e => updateSearchRow(row.id, 'searchString', e.target.value)} placeholder='"irrigation" AND "IoT"' className="w-full text-sm border-0 outline-none bg-transparent focus:ring-1 focus:ring-[#8d1436]/30 rounded px-1 py-0.5 font-mono" readOnly={readOnly} /></td>
                      <td className="px-2 py-1.5"><input type="text" value={row.hits} onChange={e => updateSearchRow(row.id, 'hits', e.target.value)} placeholder="0" className="w-full text-sm border-0 outline-none bg-transparent focus:ring-1 focus:ring-[#8d1436]/30 rounded px-1 py-0.5 text-center" readOnly={readOnly} /></td>
                      {!readOnly && <td className="px-2 py-1.5 text-center"><button onClick={() => removeSearchRow(row.id)} className="text-gray-300 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              {!readOnly && <div className="px-3 py-2 border-t border-gray-100 bg-gray-50"><button onClick={addSearchRow} className="flex items-center gap-1 text-xs text-[#8d1436] font-semibold hover:text-[#7a1130]"><Plus className="w-3.5 h-3.5" /> Add Row</button></div>}
            </div>
          </section>

          {/* 3. Documents Considered Relevant */}
          <section>
            <SectionHeader num="3" title="Documents Considered Relevant" required />
            <div className="space-y-3">
              {form.docRows.map((row, idx) => (
                <div key={row.id} className="border border-gray-200 rounded-xl p-4 relative">
                  {!readOnly && form.docRows.length > 1 && <button onClick={() => removeDocRow(row.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>}
                  <p className="text-xs font-bold text-[#8d1436] mb-3">Document {idx + 1}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>Category<Req /></label><input type="text" value={row.category} onChange={e => updateDocRow(row.id, 'category', e.target.value)} placeholder="e.g. X, Y, A" className={inputCls} readOnly={readOnly} /></div>
                    <div><label className={labelCls}>Publication Link</label><input type="text" value={row.pubLink} onChange={e => updateDocRow(row.id, 'pubLink', e.target.value)} placeholder="https://..." className={inputCls} readOnly={readOnly} /></div>
                    <div className="col-span-2"><label className={labelCls}>Document Info<Req /></label><input type="text" value={row.docInfo} onChange={e => updateDocRow(row.id, 'docInfo', e.target.value)} placeholder="Author, title, patent no., date..." className={inputCls} readOnly={readOnly} /></div>
                    <div className="col-span-2"><label className={labelCls}>Abstract / Relevant Excerpt<Req /></label><textarea value={row.abstract} onChange={e => updateDocRow(row.id, 'abstract', e.target.value)} rows={3} className={`${inputCls} resize-none`} readOnly={readOnly} /></div>
                  </div>
                </div>
              ))}
              {!readOnly && <button onClick={addDocRow} className="flex items-center gap-1 text-xs text-[#8d1436] font-semibold hover:text-[#7a1130] px-1"><Plus className="w-3.5 h-3.5" /> Add Document</button>}
            </div>
          </section>

          {/* 4. Comparison of Technical Features */}
          <section>
            <SectionHeader num="4" title="Comparison of Technical Features" required />
            {!readOnly && (
              <div className="flex items-center gap-3 mb-3">
                <button onClick={addCompDoc} className="flex items-center gap-1 text-xs text-[#8d1436] font-semibold hover:text-[#7a1130]"><Plus className="w-3.5 h-3.5" /> Add Document Column</button>
                {form.compDocLabels.length > 1 && <button onClick={removeLastCompDoc} className="flex items-center gap-1 text-xs text-red-500 font-semibold hover:text-red-700"><Minus className="w-3.5 h-3.5" /> Remove Last Column</button>}
              </div>
            )}
            <div className="border border-gray-200 rounded-xl overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 min-w-[150px]">Technical Feature</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 min-w-[140px]">Present Invention</th>
                    {form.compDocLabels.map(l => <th key={l} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 min-w-[100px]">{l}</th>)}
                    {!readOnly && <th className="px-3 py-2 w-10" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {form.compRows.map(row => (
                    <tr key={row.id}>
                      <td className="px-2 py-1.5"><input type="text" value={row.feature} onChange={e => updateCompRow(row.id, 'feature', e.target.value)} placeholder="Feature..." className="w-full text-sm border-0 outline-none bg-transparent focus:ring-1 focus:ring-[#8d1436]/30 rounded px-1 py-0.5" readOnly={readOnly} /></td>
                      <td className="px-2 py-1.5"><input type="text" value={row.presentInvention} onChange={e => updateCompRow(row.id, 'presentInvention', e.target.value)} placeholder="Description" className="w-full text-sm border-0 outline-none bg-transparent focus:ring-1 focus:ring-[#8d1436]/30 rounded px-1 py-0.5" readOnly={readOnly} /></td>
                      {form.compDocLabels.map(l => <td key={l} className="px-2 py-1.5"><input type="text" value={row.docValues[l] ?? ''} onChange={e => updateCompDocVal(row.id, l, e.target.value)} placeholder="Present / Absent" className="w-full text-sm border-0 outline-none bg-transparent focus:ring-1 focus:ring-[#8d1436]/30 rounded px-1 py-0.5" readOnly={readOnly} /></td>)}
                      {!readOnly && <td className="px-2 py-1.5 text-center"><button onClick={() => removeCompRow(row.id)} className="text-gray-300 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              {!readOnly && <div className="px-3 py-2 border-t border-gray-100 bg-gray-50"><button onClick={addCompRow} className="flex items-center gap-1 text-xs text-[#8d1436] font-semibold hover:text-[#7a1130]"><Plus className="w-3.5 h-3.5" /> Add Feature Row</button></div>}
            </div>
          </section>

          {/* 5. Recommendation */}
          <section>
            <SectionHeader num="5" title="Recommendation" required />
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Recommendation Statement<Req /></label>
                <textarea value={form.recommendation} onChange={e => set('recommendation', e.target.value)} rows={4} placeholder="Overall recommendation based on prior art search findings..." className={`${inputCls} resize-none`} readOnly={readOnly} />
              </div>
              {([
                { key: 'novelty' as const, notesKey: 'noveltyNotes' as const, label: 'Novelty' },
                { key: 'inventiveness' as const, notesKey: 'inventivenessNotes' as const, label: 'Inventive Step / Originality' },
                { key: 'industrialApplicability' as const, notesKey: 'industrialApplicabilityNotes' as const, label: 'Industrial Applicability' },
              ]).map(({ key, notesKey, label }) => (
                <div key={key} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-800">{label}{!readOnly && <span className="text-red-500 ml-0.5 text-xs">*</span>}</p>
                    {!readOnly ? (
                      <div className="flex gap-2">
                        {(['yes', 'no'] as const).map(v => (
                          <button key={v} onClick={() => set(key, v)} className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${form[key] === v ? (v === 'yes' ? 'bg-green-100 border-green-400 text-green-800' : 'bg-red-100 border-red-400 text-red-800') : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}>{v === 'yes' ? 'Yes' : 'No'}</button>
                        ))}
                      </div>
                    ) : (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${form[key] === 'yes' ? 'bg-green-100 text-green-700' : form[key] === 'no' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{form[key] ? (form[key] === 'yes' ? 'Yes' : 'No') : 'Not set'}</span>
                    )}
                  </div>
                  <input type="text" value={form[notesKey]} onChange={e => set(notesKey, e.target.value)} placeholder="Additional notes..." className={`${inputCls} text-xs`} readOnly={readOnly} />
                </div>
              ))}
            </div>
          </section>

          {/* 6. Certification */}
          <section>
            <SectionHeader num="6" title="Certification & Signatures" required />
            <div className="grid grid-cols-2 gap-5">
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Search Conducted by{!readOnly && <span className="text-red-500 ml-0.5">*</span>}</p>
                <div className="space-y-3">
                  <div><label className={labelCls}>Name<Req /></label><input type="text" value={form.conductedBy} onChange={e => set('conductedBy', e.target.value)} placeholder="Case Handler name" className={inputCls} readOnly={readOnly} /></div>
                  <div><label className={labelCls}>Date<Req /></label><input type="date" value={form.conductedDate} onChange={e => set('conductedDate', e.target.value)} className={inputCls} readOnly={readOnly} /></div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Search Reviewed by</p>
                <div className="space-y-3">
                  <div><label className={labelCls}>Name</label><input type="text" value={form.reviewedBy} onChange={e => set('reviewedBy', e.target.value)} placeholder="Reviewer / Admin name" className={inputCls} readOnly={readOnly} /></div>
                  <div><label className={labelCls}>Date</label><input type="date" value={form.reviewedDate} onChange={e => set('reviewedDate', e.target.value)} className={inputCls} readOnly={readOnly} /></div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Pending approval notice */}
        {form.status === 'pending_approval' && (
          <div className="flex-shrink-0 px-6 py-3 bg-blue-50 border-t border-blue-200 flex items-center gap-3">
            <ClipboardList className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-800 flex-1">This report has been submitted for Admin approval. You cannot edit it until it is reviewed. Once approved, you may complete the Prior Art Search step.</p>
            {!readOnly && <button onClick={() => setPasConfirm({ title: 'Recall Draft', message: 'Recall this PAS Report from Admin review? It will revert to Draft status and you can make further edits.', onConfirm: () => { onSave(case_.id, { ...form, status: 'draft' }); setPasConfirm(null); } })} className="text-xs font-semibold text-blue-700 border border-blue-300 bg-white rounded-lg px-3 py-1.5 hover:bg-blue-50 flex-shrink-0">Recall Draft</button>}
          </div>
        )}

        {/* Validation error banner */}
        {validationErrors.length > 0 && (
          <div className="flex-shrink-0 px-6 py-3 bg-red-50 border-t border-red-200">
            <p className="text-xs font-semibold text-red-700 mb-1">Please fill in all required fields before submitting:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {validationErrors.map(e => <li key={e} className="text-xs text-red-600">{e}</li>)}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
          {!readOnly && form.status !== 'pending_approval' ? (
            <>
              <p className="text-xs text-gray-400">Fields marked <span className="text-red-500 font-semibold">*</span> are required. Save as draft to continue later.</p>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 bg-white rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={() => { onSave(case_.id, { ...form, status: 'draft' }); onClose(); }} className="px-4 py-2 text-sm font-semibold bg-gray-700 text-white rounded-lg hover:bg-gray-800">Save Draft</button>
                <button onClick={() => {
                  const errors = validatePASReport(form);
                  if (errors.length > 0) { setValidationErrors(errors); return; }
                  setValidationErrors([]);
                  setPasConfirm({ title: 'Submit for Approval', message: 'Submit this PAS Report to the Admin for review and approval? You will not be able to edit it until Admin acts on it.', onConfirm: () => { onSave(case_.id, { ...form, status: 'pending_approval' }); setPasConfirm(null); onClose(); } });
                }} className="px-4 py-2 text-sm font-semibold bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130]">Submit for Approval</button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-between gap-3">
              <button onClick={() => downloadPASReport(form, case_.title)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-[#8d1436]/30 text-[#8d1436] bg-white rounded-lg hover:bg-[#fdf0f3] transition-colors">
                <Download className="w-4 h-4" /> Download Report
              </button>
              <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130]">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
    {pasConfirm && (
      <ConfirmDialog
        title={pasConfirm.title}
        message={pasConfirm.message}
        confirmLabel={pasConfirm.title}
        onConfirm={pasConfirm.onConfirm}
        onCancel={() => setPasConfirm(null)}
      />
    )}
    </>
  );
}

function prefixResponseFile(fileName: string, threadId: string, caseId: string): string {
  return `response_thread_${threadId}_${caseId}_${fileName}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const IP_TYPE_OPTIONS: IPType[] = ['Patent', 'Utility Model', 'Industrial Design', 'Trademark', 'Copyright'];

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

export default function CHPreProtectionDashboard() {
  const [cases, setCases] = useState(mockMyCases);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterProgress, setFilterProgress] = useState<'All' | 'Ongoing' | 'Completed'>('All');
  const [compactView, setCompactView] = useState(false);
  const [expandedCompact, setExpandedCompact] = useState<Set<string>>(new Set());
  const [folderCase, setFolderCase] = useState<CHCase | null>(null);
  const [remarksCase, setRemarksCase] = useState<CHCase | null>(null);
  const [stepModal, setStepModal] = useState<{ case_: CHCase; stepName: string } | null>(null);
  const [extReqCase, setExtReqCase] = useState<CHCase | null>(null);
  const [respReqCase, setRespReqCase] = useState<CHCase | null>(null);
  const [responseSendText, setResponseSendText] = useState('');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [replyingToThreadId, setReplyingToThreadId] = useState<string | null>(null);
  const [threadReplyText, setThreadReplyText] = useState('');
  const [reqFiles, setReqFiles] = useState<File[]>([]);
  const reqFileRef = useRef<HTMLInputElement>(null);
  const newReqFileRef = useRef<HTMLInputElement>(null);
  const [newReqFiles, setNewReqFiles] = useState<File[]>([]);
  const [viewingFile, setViewingFile] = useState<{ name: string; url?: string } | null>(null);
  const [fileUrlMap, setFileUrlMap] = useState<Record<string, string>>({});
  const location = useLocation();
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const toggleDetails = (id: string) => setExpandedDetails(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const [pasReports, setPasReports] = useState<Record<string, PASReportData>>(() => loadPasReports());
  const [pasReportModal, setPasReportModal] = useState<{ case_: CHCase; readOnly: boolean } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; confirmLabel?: string; variant?: 'default' | 'danger' | 'warning'; onConfirm: () => void } | null>(null);
  const confirm = (title: string, message: string, onConfirm: () => void, opts?: { confirmLabel?: string; variant?: 'default' | 'danger' | 'warning' }) =>
    setConfirmDialog({ title, message, onConfirm, ...opts });
  const handleSavePasReport = (caseId: string, data: PASReportData) => {
    const updated = { ...pasReports, [caseId]: data };
    setPasReports(updated);
    savePasReports(updated);
  };

  useEffect(() => {
    const hash = location.hash.slice(1);
    if (!hash) return;
    setHighlightId(hash);
    const t1 = setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
    const t2 = setTimeout(() => setHighlightId(null), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [location.hash]);

  const typeCounts = IP_TYPE_OPTIONS.reduce((acc, t) => { acc[t] = cases.filter(c => c.ipType === t).length; return acc; }, {} as Record<string, number>);

  const isPreProtectionComplete = (c: CHCase) => c.currentStep >= (STEPS[c.ipType] || STEPS['Patent']).length;

  const filteredCases = cases.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || c.ipType === filterType;
    const matchProgress = filterProgress === 'All' || (filterProgress === 'Completed' ? isPreProtectionComplete(c) : !isPreProtectionComplete(c));
    return matchSearch && matchType && matchProgress;
  });

  const todayCases = filteredCases.filter(c => isToday(c.deadline));

  const update = (id: string, patch: Partial<CHCase>) => setCases(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  const handleSaveFolder = (id: string, link: string) => update(id, { folderLink: link });
  const handleAttachFiles = (id: string, files: AttachedFile[]) => update(id, { attachedFiles: files });
  const handleAddRemark = (id: string, remark: UnifiedRemark) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, unifiedRemarks: [...(c.unifiedRemarks ?? []), remark] } : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? { ...prev, unifiedRemarks: [...(prev.unifiedRemarks ?? []), remark] } : null);
  };
  const handleMarkResolved = (id: string, remarkId: string) => {
    const patch = (c: CHCase) => ({ ...c, unifiedRemarks: (c.unifiedRemarks ?? []).map(r => r.id === remarkId ? { ...r, resolved: true } : r) });
    setCases(prev => prev.map(c => c.id === id ? patch(c) : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? patch(prev) : null);
  };
  const handleMarkRead = (id: string, remarkId: string) => {
    const patch = (c: CHCase) => ({ ...c, unifiedRemarks: (c.unifiedRemarks ?? []).map(r => r.id === remarkId ? { ...r, read: true } : r) });
    setCases(prev => prev.map(c => c.id === id ? patch(c) : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? patch(prev) : null);
  };
  const handleAddReply = (id: string, remarkId: string, reply: UnifiedRemarkReply) => {
    const patch = (c: CHCase) => ({ ...c, unifiedRemarks: (c.unifiedRemarks ?? []).map(r => r.id === remarkId ? { ...r, replies: [...(r.replies ?? []), reply] } : r) });
    setCases(prev => prev.map(c => c.id === id ? patch(c) : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? patch(prev) : null);
  };
  const handleCompleteStep = (id: string, ipophlNo?: string) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, currentStep: c.currentStep + 1, ...(ipophlNo ? { applicationNo: ipophlNo } : {}) } : c));
    const c = cases.find(c => c.id === id);
    if (c && c.currentStep === 2 && (c.ipType === 'Patent' || c.ipType === 'Utility Model' || c.ipType === 'Industrial Design')) {
      setPasReports(prev => {
        const updated = { ...prev, [id]: { ...(prev[id] ?? makePASReportData(c)), status: 'approved' as const } };
        savePasReports(updated);
        return updated;
      });
    }
  };
  const handleRequestExtension = (id: string, reason: string) => {
    const chName = (() => { try { return localStorage.getItem('ch_name') || 'Case Handler'; } catch { return 'Case Handler'; } })();
    const existing = cases.find(c => c.id === id)?.unifiedRemarks ?? [];
    update(id, {
      extensionRequested: true, extensionRequestDate: new Date().toISOString(),
      unifiedRemarks: [...existing, { id: `ext-${Date.now()}`, author: chName, role: 'handler' as const, text: `Extension request: ${reason}`, date: new Date().toISOString(), read: false, resolved: false }],
    });
  };
  const handleSendRespReq = (caseId: string, message: string, attachmentName?: string) => {
    const newReq: ResponseRequest = { id: `rr-${Date.now()}`, message, attachmentName, requestDate: new Date().toISOString(), status: 'pending', thread: [] };
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, responseRequests: [...(c.responseRequests ?? []), newReq] } : c));
  };
  const handleThreadReply = (caseId: string, rrId: string, text: string, attachmentName?: string) => {
    const reply: ResponseReply = { id: `rpl-${Date.now()}`, author: 'handler', text, date: new Date().toISOString(), attachmentName };
    setCases(prev => prev.map(c => c.id === caseId ? {
      ...c,
      responseRequests: (c.responseRequests ?? []).map(r => r.id === rrId ? { ...r, status: 'active' as const, thread: [...(r.thread ?? []), reply] } : r),
    } : c));
  };
  const handleCloseThread = (caseId: string, rrId: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? {
      ...c,
      responseRequests: (c.responseRequests ?? []).map(r => r.id === rrId ? { ...r, status: 'closed' as const } : r),
    } : c));
  };

  const hasPendingRR = (c: CHCase) => (c.responseRequests ?? []).some(r => r.status === 'pending' || r.status === 'active');
  const hasUnresolvedAdmin = (c: CHCase) => (c.unifiedRemarks ?? []).some(r => !r.resolved && r.role === 'admin');
  const unresolvedAdminCnt = (c: CHCase) => (c.unifiedRemarks ?? []).filter(r => !r.resolved && r.role === 'admin').length;
  const unreadCnt = (c: CHCase) => (c.unifiedRemarks ?? []).filter(r => !r.read && r.role === 'admin').length;

  const toggleExpand = (id: string) => setExpandedCompact(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const oicBannerInfo = (() => {
    try {
      const name = localStorage.getItem('ipasa_oic_handler') || '';
      const chName = localStorage.getItem('ch_name') || '';
      const end = localStorage.getItem('ipasa_oic_end') || '';
      return (name && name === chName && end) ? { end } : null;
    } catch { return null; }
  })();

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <CaseHandlerNav />
      <div className="flex-1 min-w-0 max-w-[1600px] p-8">
        {oicBannerInfo && (
          <div className="mb-5 bg-[#fdf0f3] border border-[#8d1436]/25 rounded-xl px-5 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#8d1436]/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#8d1436]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#8d1436]">Temporary Admin Active</p>
              <p className="text-xs text-gray-600">You have been designated as Officer in Charge. Valid until <span className="font-semibold">{new Date(oicBannerInfo.end).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>. Use the "Switch to Admin Mode" button to access admin functions.</p>
            </div>
          </div>
        )}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Pre-Protection</h1>
          <p className="text-gray-600 text-sm">Your assigned cases in internal TTBDO processing</p>
        </div>

        {/* Today deadline global warning */}
        {todayCases.length > 0 && (
          <div className="mb-5 bg-amber-50 border border-amber-300 rounded-xl px-5 py-3.5 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-900">
              <span className="font-bold">{todayCases.length} case{todayCases.length > 1 ? 's' : ''}</span> {todayCases.length > 1 ? 'have' : 'has'} a deadline <span className="font-bold">today</span>:{' '}
              {todayCases.map((c, i) => (
                <span key={c.id}>
                  {i > 0 && ', '}
                  <button onClick={() => { document.getElementById(c.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setHighlightId(c.id); setTimeout(() => setHighlightId(null), 3500); }} className="font-bold underline underline-offset-2 hover:text-amber-700 transition-colors">{c.id}</button>
                </span>
              ))}
            </p>
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-5">
          <div className="p-4 flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search by title or case ID..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm">
                <option value="All">All IP Types</option>
                {IP_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t} ({typeCounts[t] ?? 0})</option>)}
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

        <p className="text-xs text-gray-400 mb-4">Showing {filteredCases.length} of {cases.length} cases</p>

        {/* ── COMPACT VIEW ── */}
        {compactView ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-8"></th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Case</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">IP Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Deadline</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Step</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCases.map(case_ => {
                  const steps = STEPS[case_.ipType] || STEPS['Patent'];
                  const isExpanded = expandedCompact.has(case_.id);
                  const blocked = case_.blocked ?? false;
                  const isComplete = case_.currentStep >= steps.length;
                  const activeStep = steps[case_.currentStep];
                  const adminWarn = hasUnresolvedAdmin(case_);
                  const hasPR = hasPendingRR(case_);
                  const today = isToday(case_.deadline);
                  const late = isLate(case_.deadline);
                  return (
                    <React.Fragment key={case_.id}>
                      <tr id={case_.id} className={`hover:bg-gray-50 transition-colors ${highlightId === case_.id ? 'bg-[#fdf0f3]' : ''} ${today ? 'bg-amber-50/30' : ''}`}>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleExpand(case_.id)} className="text-gray-400 hover:text-gray-600">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-400 font-mono">{case_.id}</span>
                            {adminWarn && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" title="Unresolved admin remarks" />}
                            {hasPR && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" title="Pending response request" />}
                            {today && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Deadline today" />}
                          </div>
                          <p className="text-sm font-medium text-gray-900 max-w-xs truncate">{case_.title}</p>
                          <p className="text-xs text-gray-500">{case_.inventorName}</p>
                          {case_.secondaryInventors && case_.secondaryInventors.length > 0 && (
                            <p className="text-xs text-gray-400">+ {case_.secondaryInventors.join(', ')}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[case_.ipType]}`}>{case_.ipType}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {case_.deadline ? (
                            <span className={`text-xs font-medium ${late ? 'text-red-600' : today ? 'text-amber-700 font-bold' : 'text-gray-700'}`}>
                              {today && '⚠ '}{new Date(case_.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          ) : <span className="text-xs text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs text-gray-600">{isComplete ? 'Complete' : activeStep?.negative ?? '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => setFolderCase(case_)} className={`p-1.5 rounded hover:bg-gray-100 ${case_.folderLink ? 'text-[#8d1436]' : 'text-gray-400'}`} title="Folder"><FolderOpen className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setRemarksCase(case_)} className={`p-1.5 rounded hover:bg-gray-100 ${adminWarn ? 'text-amber-600' : 'text-gray-400'}`} title="Remarks"><MessageSquare className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setRespReqCase(case_)} className={`p-1.5 rounded hover:bg-gray-100 ${hasPR ? 'text-blue-600' : 'text-gray-400'}`} title={hasPR ? 'Pending request' : 'Request response'}><Send className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="px-8 py-5 bg-gray-50">
                            <div className="grid grid-cols-2 gap-6 mb-4">
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Details</h4>
                                <div className="space-y-1.5">
                                  <div><p className="text-xs text-gray-500">College</p><p className="text-sm text-gray-900">{case_.college}</p></div>
                                  <div><p className="text-xs text-gray-500">Funding Agency</p><p className="text-sm text-gray-900">{case_.fundingAgency}</p></div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Progress</h4>
                                <div className="flex items-start gap-1 flex-wrap">
                                  {(STEPS[case_.ipType] || STEPS['Patent']).map((step, idx) => {
                                    const state = isComplete ? 'accomplished' : getStepState(idx, case_.currentStep, blocked);
                                    return (
                                      <div key={idx} className={`text-xs px-2 py-0.5 rounded-full ${state === 'accomplished' ? 'bg-[#8d1436]/10 text-[#8d1436]' : state === 'ongoing' ? 'bg-[#fdf0f3] border border-[#8d1436] text-[#8d1436] font-semibold' : 'bg-gray-100 text-gray-400'}`}>
                                        {step.positive}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                            {!isComplete && (
                              <button onClick={() => setStepModal({ case_, stepName: activeStep?.positive ?? 'Current Step' })}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8d1436] text-white text-xs font-semibold rounded-lg hover:bg-[#7a1130] transition-colors">
                                <Check className="w-3.5 h-3.5" /> Complete Step
                              </button>
                            )}
                            {(case_.ipType === 'Patent' || case_.ipType === 'Utility Model' || case_.ipType === 'Industrial Design') && !isComplete && case_.currentStep === 2 && pasReports[case_.id]?.status !== 'approved' && (
                              <button onClick={() => setPasReportModal({ case_, readOnly: false })} className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-colors ${pasReports[case_.id] ? 'bg-[#fdf0f3] border-[#8d1436]/30 text-[#8d1436]' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                                <ClipboardList className="w-3.5 h-3.5" />{pasReports[case_.id] ? 'Edit PAS Report' : 'Fill PAS Report'}
                              </button>
                            )}
                            {(case_.ipType === 'Patent' || case_.ipType === 'Utility Model' || case_.ipType === 'Industrial Design') && pasReports[case_.id] && (
                              <button onClick={() => setPasReportModal({ case_, readOnly: true })} className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-colors ${pasReports[case_.id]?.status === 'approved' ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100' : pasReports[case_.id]?.status === 'pending_approval' ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                                <Eye className="w-3.5 h-3.5" /> View PAS Report
                              </button>
                            )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            {filteredCases.length === 0 && <div className="py-12 text-center text-sm text-gray-500">No cases found.</div>}
          </div>
        ) : (
          /* ── CARD VIEW ── */
          <div className="space-y-6">
            {filteredCases.map(case_ => {
              const steps = STEPS[case_.ipType] || STEPS['Patent'];
              const blocked = case_.blocked ?? false;
              const isComplete = case_.currentStep >= steps.length;
              const activeStep = steps[case_.currentStep];
              const unread = unreadCnt(case_);
              const remarksCount = (case_.unifiedRemarks ?? []).length;
              const adminWarn = hasUnresolvedAdmin(case_);
              const adminCnt = unresolvedAdminCnt(case_);
              const hasPR = hasPendingRR(case_);
              const today = isToday(case_.deadline);
              const isHighlighted = highlightId === case_.id;

              return (
                <div key={case_.id} id={case_.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${isHighlighted ? 'border-[#8d1436] ring-2 ring-[#8d1436]/25 shadow-lg' : 'border-gray-200'}`}>
                  {/* Today deadline banner */}
                  {today && !isLate(case_.deadline) && (
                    <div className="bg-amber-50 border-b border-amber-300 px-8 py-2.5 flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <p className="text-xs text-amber-900 font-semibold">Deadline is today for this case.</p>
                    </div>
                  )}
                  {/* Transferred banner */}
                  {case_.transferredFrom && (
                    <div className="bg-purple-50 border-b border-purple-200 px-8 py-3 flex items-center gap-2.5">
                      <ArrowRightLeft className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <p className="text-xs text-purple-900 font-semibold">This case was transferred to you from <span className="font-bold">{case_.transferredFrom}</span>.</p>
                    </div>
                  )}
                  {/* Pending/active response request banner */}
                  {hasPR && (() => {
                    const openReq = (case_.responseRequests ?? []).find(r => r.status === 'pending' || r.status === 'active');
                    const hasApplicantReply = openReq?.thread?.some(t => t.author === 'applicant');
                    return (
                      <div className={`border-b px-8 py-2.5 flex items-center gap-2.5 ${hasApplicantReply ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                        <Bell className={`w-4 h-4 flex-shrink-0 ${hasApplicantReply ? 'text-green-600' : 'text-blue-600'}`} />
                        <p className={`text-xs font-semibold flex-1 ${hasApplicantReply ? 'text-green-900' : 'text-blue-900'}`}>
                          {hasApplicantReply ? 'Applicant has replied to your request — review and follow up if needed.' : `Awaiting applicant response. Sent ${new Date(openReq!.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`}
                        </p>
                        <button onClick={() => setRespReqCase(case_)} className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 text-xs font-semibold border rounded-lg transition-colors ${hasApplicantReply ? 'text-green-800 bg-green-100 hover:bg-green-200 border-green-300' : 'text-blue-800 bg-blue-100 hover:bg-blue-200 border-blue-300'}`}>
                          <MessageSquare className="w-3 h-3" /> View Thread
                        </button>
                      </div>
                    );
                  })()}
                  {/* Admin remarks banner */}
                  {adminWarn && (
                    <div className="bg-amber-50 border-b border-amber-200 px-8 py-3 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-amber-900 font-semibold">This case has {adminCnt} unresolved admin remark{adminCnt > 1 ? 's' : ''} that need{adminCnt === 1 ? 's' : ''} your attention.</p>
                      </div>
                      <button onClick={() => setRemarksCase(case_)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors">
                        <MessageSquare className="w-3 h-3" /> Review Remarks
                      </button>
                    </div>
                  )}
                  {/* Extension approved banner */}
                  {case_.extensionApproved && (
                    <div className="bg-green-50 border-b border-green-200 px-8 py-3 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-green-900 font-semibold">Your deadline extension request for this case has been approved.</p>
                    </div>
                  )}
                  {/* Extension pending banner */}
                  {case_.extensionRequested && !case_.extensionApproved && (
                    <div className="bg-blue-50 border-b border-blue-200 px-8 py-3 flex items-start gap-2.5">
                      <Bell className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-900 font-semibold">
                        Extension request submitted{case_.extensionRequestDate ? ` on ${new Date(case_.extensionRequestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}. Awaiting admin approval.
                      </p>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-[#fdf0f3] to-white px-8 py-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-xs text-[#8d1436] font-semibold">{case_.id}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[case_.ipType]}`}>{case_.ipType}</span>
                          <DeadlineBadge deadline={case_.deadline} />
                          {case_.transferredFrom && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
                              <ArrowRightLeft className="w-3 h-3" /> Transferred
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{case_.title}</h3>
                        <p className="text-sm text-gray-600 max-w-3xl mb-1">{case_.description}</p>
                        {case_.secondaryInventors && case_.secondaryInventors.length > 0 && (
                          <p className="text-xs text-gray-500">+ {case_.secondaryInventors.join(', ')}</p>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-start w-full gap-0 mb-5">
                        {steps.map((step, idx) => {
                          const state = isComplete ? 'accomplished' : getStepState(idx, case_.currentStep, blocked);
                          const isLast = idx === steps.length - 1;
                          return (
                            <div key={idx} className="flex items-center flex-1 last:flex-none">
                              <div className="flex flex-col items-center gap-2">
                                <StepNode state={state} />
                                <div className="text-center" style={{ maxWidth: 88 }}>
                                  <p className={`text-xs font-semibold leading-tight ${state === 'accomplished' ? 'text-gray-700' : state === 'ongoing' ? 'text-[#8d1436]' : state === 'blocked' ? 'text-amber-700' : 'text-gray-400'}`}>
                                    {state === 'accomplished' ? step.positive : step.negative}
                                  </p>
                                </div>
                              </div>
                              {!isLast && <div className={`flex-1 h-0.5 mx-2 mb-6 ${state === 'accomplished' ? 'bg-[#8d1436]' : state === 'ongoing' ? 'bg-gradient-to-r from-[#8d1436] to-gray-200' : 'bg-gray-200'}`} />}
                            </div>
                          );
                        })}
                      </div>
                      {!isComplete && (() => {
                          const pasReport = pasReports[case_.id];
                          const isPASStep = (case_.ipType === 'Patent' || case_.ipType === 'Utility Model' || case_.ipType === 'Industrial Design') && case_.currentStep === 2;
                          const pasPendingApproval = isPASStep && pasReport?.status === 'pending_approval';
                          const pasRequired = isPASStep && (!pasReport || pasReport.status === 'draft');
                          return (
                            <div className={`flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-lg text-sm ${blocked ? 'bg-amber-50 border border-amber-200 text-amber-800' : pasPendingApproval ? 'bg-blue-50 border border-blue-200 text-blue-800' : 'bg-[#fdf0f3] border border-[#e99ab2] text-gray-700'}`}>
                              <div className="flex items-center gap-2.5">
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${blocked ? 'bg-amber-500' : pasPendingApproval ? 'bg-blue-500 animate-pulse' : 'bg-[#8d1436] animate-pulse'}`} />
                                <span className="font-semibold">{blocked ? 'Documents returned by OC — ' : pasPendingApproval ? 'Awaiting Admin Approval — ' : 'Currently: '}</span>
                                <span>{pasPendingApproval ? 'PAS Report submitted, pending approval' : activeStep?.negative}</span>
                              </div>
                              {!pasPendingApproval && (
                                <button onClick={() => setStepModal({ case_, stepName: activeStep?.positive ?? 'Current Step' })}
                                  title={pasRequired ? 'Submit PAS Report for approval before completing this step' : undefined}
                                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${pasRequired ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#8d1436] text-white hover:bg-[#7a1130]'}`}
                                  disabled={pasRequired}>
                                  <Check className="w-3.5 h-3.5" /> Complete Step
                                </button>
                              )}
                            </div>
                          );
                      })()}
                      {isComplete && <div className="px-4 py-2.5 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium">All steps completed ✓</div>}
                    </div>
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
                        <div><p className="text-xs text-gray-500">Name</p><p className="text-sm font-medium text-gray-900">{case_.inventorName}</p></div>
                        <div><p className="text-xs text-gray-500">College</p><p className="text-sm text-gray-900">{case_.college}</p></div>
                        <div><p className="text-xs text-gray-500">Department</p><p className="text-sm text-gray-900">{case_.department}</p></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Processing Information</h4>
                      <div className="space-y-2">
                        <div><p className="text-xs text-gray-500">Submission Date</p><p className="text-sm font-medium text-gray-900">{new Date(case_.dateDisclosed).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Public Disclosure Date</p>
                          <p className="text-sm text-gray-900">{case_.publicDisclosureDate ? new Date(case_.publicDisclosureDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : <span className="text-gray-400 italic">Not specified</span>}</p>
                        </div>
                        <div><p className="text-xs text-gray-500">Funding Agency</p><p className="text-sm text-gray-900">{case_.fundingAgency}</p></div>
                        <div><p className="text-xs text-gray-500">Contact Email</p><p className="text-sm text-gray-900">{case_.contactEmail}</p></div>
                      </div>
                    </div>
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
                    <button onClick={() => setRemarksCase(case_)} className={`relative flex items-center gap-1.5 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium ${adminWarn ? 'border-amber-300 text-amber-700' : 'border-gray-300 text-gray-700'}`}>
                      <MessageSquare className={`w-3.5 h-3.5 ${remarksCount ? 'text-[#8d1436]' : ''}`} />
                      Remarks{remarksCount ? ` (${remarksCount})` : ''}
                      {unread > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#8d1436] text-white rounded-full text-[9px] flex items-center justify-center font-bold">{unread}</span>}
                    </button>
                    <button onClick={() => setRespReqCase(case_)} className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors text-xs font-medium ${hasPR ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                      <Send className="w-3.5 h-3.5" />
                      {hasPR ? 'Response Threads' : 'Request Response'}
                      {hasPR && (() => { const cnt = (case_.responseRequests ?? []).filter(r => r.status === 'pending' || r.status === 'active').length; return cnt > 0 ? <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">{cnt}</span> : null; })()}
                    </button>
                    {(case_.ipType === 'Patent' || case_.ipType === 'Utility Model' || case_.ipType === 'Industrial Design') && !isComplete && case_.currentStep === 2 && pasReports[case_.id]?.status !== 'approved' && (
                      <button onClick={() => setPasReportModal({ case_, readOnly: false })} className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg transition-colors text-xs font-medium ${pasReports[case_.id] ? 'bg-[#fdf0f3] border-[#8d1436]/30 text-[#8d1436] hover:bg-[#fae6ec]' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        <ClipboardList className="w-3.5 h-3.5" />
                        {pasReports[case_.id] ? 'Edit PAS Report' : 'Fill PAS Report'}
                      </button>
                    )}
                    {(case_.ipType === 'Patent' || case_.ipType === 'Utility Model' || case_.ipType === 'Industrial Design') && pasReports[case_.id] && (
                      <button onClick={() => setPasReportModal({ case_, readOnly: true })} className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:opacity-90 transition-colors text-xs font-medium ${pasReports[case_.id]?.status === 'approved' ? 'bg-green-50 border-green-300 text-green-700' : pasReports[case_.id]?.status === 'pending_approval' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}>
                        <Eye className="w-3.5 h-3.5" /> View PAS Report
                      </button>
                    )}
                    {!case_.extensionRequested && !case_.extensionApproved && (
                      <button onClick={() => setExtReqCase(case_)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
                        <CalendarClock className="w-3.5 h-3.5 text-blue-500" /> Request Extension
                      </button>
                    )}
                    {case_.extensionRequested && !case_.extensionApproved && (
                      <span className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-medium">
                        <Bell className="w-3.5 h-3.5" /> Extension Pending Approval
                      </span>
                    )}
                    {case_.extensionApproved && (
                      <span className="flex items-center gap-1.5 px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Extension Approved
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredCases.length === 0 && <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center"><p className="text-gray-500 text-sm">No cases found.</p></div>}
          </div>
        )}
      </div>

      <LinkFolderModal isOpen={!!folderCase} onClose={() => setFolderCase(null)} item={folderCase} onSave={handleSaveFolder} onAttachFiles={handleAttachFiles} />
      <UnifiedRemarksModal isOpen={!!remarksCase} onClose={() => setRemarksCase(null)} item={remarksCase} currentRole="handler" onAddRemark={handleAddRemark} onMarkResolved={handleMarkResolved} onMarkRead={handleMarkRead} onAddReply={handleAddReply} />
      {stepModal && <StepCompletionModal caseId={stepModal.case_.id} stepName={stepModal.stepName} onConfirm={handleCompleteStep} onClose={() => setStepModal(null)} />}
      {extReqCase && <ExtensionRequestModal caseId={extReqCase.id} caseTitle={extReqCase.title} onRequest={handleRequestExtension} onClose={() => setExtReqCase(null)} />}
      {pasReportModal && <PASReportModal case_={pasReportModal.case_} report={pasReports[pasReportModal.case_.id] ?? null} onSave={handleSavePasReport} onClose={() => setPasReportModal(null)} readOnly={pasReportModal.readOnly} />}
      {confirmDialog && <ConfirmDialog title={confirmDialog.title} message={confirmDialog.message} confirmLabel={confirmDialog.confirmLabel} variant={confirmDialog.variant} onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} onCancel={() => setConfirmDialog(null)} />}
      {/* Request Response sidebar — threaded */}
      {respReqCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-end pointer-events-none">
          <div className="absolute inset-0 bg-black/30 pointer-events-auto" onClick={() => { setRespReqCase(null); setShowNewRequest(false); setResponseSendText(''); }} />
          <div className="relative pointer-events-auto bg-white shadow-2xl border-l border-gray-200 h-full w-full max-w-[420px] flex flex-col">
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#8d1436]" />
                  <h2 className="text-sm font-bold text-gray-900">Response Threads</h2>
                  {(() => { const open = (respReqCase.responseRequests ?? []).filter(r => r.status !== 'closed').length; return open > 0 ? <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{open} open</span> : null; })()}
                </div>
                <p className="text-[11px] text-gray-400 truncate max-w-[300px] mt-0.5">{respReqCase.title}</p>
              </div>
              <button onClick={() => { setRespReqCase(null); setShowNewRequest(false); setResponseSendText(''); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {(respReqCase.responseRequests ?? []).length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No requests sent yet.</div>
              ) : (
                (respReqCase.responseRequests ?? []).map(req => {
                  const isClosed = req.status === 'closed';
                  const isReplying = replyingToThreadId === req.id;
                  return (
                    <div key={req.id} className={`rounded-xl border overflow-hidden ${isClosed ? 'border-gray-200 opacity-70' : req.status === 'pending' ? 'border-amber-200' : 'border-blue-200'}`}>
                      {/* Thread header */}
                      <div className={`px-3 pt-3 pb-2 ${isClosed ? 'bg-gray-50' : req.status === 'pending' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${isClosed ? 'bg-gray-200 text-gray-600' : req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            {isClosed ? 'Closed' : req.status === 'pending' ? 'Awaiting Response' : 'Active Thread'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-400">{new Date(req.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            {!isClosed && (
                              <button
                                onClick={() => confirm('Close Thread', 'Close this response thread? The applicant will no longer be able to reply and the thread will be marked as closed.', () => {
                                  handleCloseThread(respReqCase.id, req.id);
                                  setRespReqCase(prev => prev ? { ...prev, responseRequests: (prev.responseRequests ?? []).map(r => r.id === req.id ? { ...r, status: 'closed' as const } : r) } : null);
                                }, { confirmLabel: 'Close Thread', variant: 'warning' })}
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
                      {/* Thread replies */}
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
                      {/* Follow-up reply input for handler */}
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
                                    const prefixedAttachName = attachName ? prefixResponseFile(attachName, replyId, respReqCase.id) : undefined;
                                    handleThreadReply(respReqCase.id, req.id, threadReplyText.trim(), prefixedAttachName);
                                    const newReply: ResponseReply = { id: replyId, author: 'handler', text: threadReplyText.trim(), date: new Date().toISOString(), attachmentName: prefixedAttachName };
                                    setRespReqCase(prev => prev ? { ...prev, responseRequests: (prev.responseRequests ?? []).map(r => r.id === req.id ? { ...r, status: 'active' as const, thread: [...(r.thread ?? []), newReply] } : r) } : null);
                                    if (reqFiles[0]) { const url = URL.createObjectURL(reqFiles[0]); setFileUrlMap(prev => ({ ...prev, ...(attachName ? { [attachName]: url } : {}), ...(prefixedAttachName ? { [prefixedAttachName]: url } : {}) })); }
                                    setReplyingToThreadId(null); setThreadReplyText(''); setReqFiles([]);
                                  }, { confirmLabel: 'Send' })}
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
                      <button onClick={() => setNewReqFiles(prev => prev.filter((_, i) => i !== fi))} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button onClick={() => { setShowNewRequest(false); setResponseSendText(''); setNewReqFiles([]); }} className="flex-1 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button
                      disabled={!responseSendText.trim()}
                      onClick={() => confirm('Send Response Request', 'Send this request to the applicant? They will be notified and asked to respond.', () => {
                        const requestId = `rr-${Date.now()}`;
                        const attachName = newReqFiles[0]?.name;
                        const prefixedAttachName = attachName ? prefixResponseFile(attachName, requestId, respReqCase.id) : undefined;
                        handleSendRespReq(respReqCase.id, responseSendText.trim(), prefixedAttachName);
                        const updated = [...(respReqCase.responseRequests ?? []), { id: requestId, message: responseSendText.trim(), attachmentName: prefixedAttachName, requestDate: new Date().toISOString(), status: 'pending' as const, thread: [] as ResponseReply[] }];
                        setRespReqCase(prev => prev ? { ...prev, responseRequests: updated } : null);
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
    </div>
  );
}
