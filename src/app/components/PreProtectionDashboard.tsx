import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { FolderOpen, MessageSquare, Check, AlertTriangle, Search, Filter, CalendarClock, ArrowRightLeft, Bell, LayoutGrid, LayoutList, ChevronDown, ChevronUp, X, Send, Info, Eye, Paperclip, ClipboardList, CheckCircle2, Download } from 'lucide-react';
import AdminNav from './AdminNav';
import { LinkFolderModal } from './modals/LinkFolderModal';
import { UnifiedRemarksModal, UnifiedRemark, UnifiedRemarkReply } from './modals/UnifiedRemarksModal';
import { ExtendDeadlineModal } from './modals/ExtendDeadlineModal';
import { TransferHandlerModal } from './modals/TransferHandlerModal';
import { ConfirmDialog } from './modals/ConfirmDialog';

interface ResponseReply { id: string; author: 'handler' | 'applicant'; text: string; date: string; attachmentName?: string; }
interface ResponseRequest { id: string; message: string; attachmentName?: string; requestDate: string; status: 'pending' | 'active' | 'closed'; thread?: ResponseReply[]; }

const PAS_STORAGE_KEY = 'ipasa_pas_reports';
interface AdminPASReport { status: 'draft' | 'pending_approval' | 'approved'; [key: string]: unknown; }
function loadAdminPasReports(): Record<string, AdminPASReport> {
  try { const raw = localStorage.getItem(PAS_STORAGE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
function saveAdminPasReports(reports: Record<string, AdminPASReport>) {
  try { localStorage.setItem(PAS_STORAGE_KEY, JSON.stringify(reports)); } catch {}
}

interface StepDef { positive: string; negative: string; }

const STEPS: Record<string, StepDef[]> = {
  Patent: [
    { positive: 'Submitted',             negative: 'Incomplete' },
    { positive: 'Case Handler Assigned', negative: 'For Assignment' },
    { positive: 'Prior Art Search Done', negative: 'Under Evaluation' },
    { positive: 'Draft Done',            negative: 'For Drafting' },
    { positive: 'Endorsed to OC',        negative: 'For Endorsement' },
    { positive: 'Filed for Patent',      negative: 'For Filing' },
  ],
  'Utility Model': [
    { positive: 'Submitted',             negative: 'Incomplete' },
    { positive: 'Case Handler Assigned', negative: 'For Assignment' },
    { positive: 'Prior Art Search Done', negative: 'Under Evaluation' },
    { positive: 'Draft Done',            negative: 'For Drafting' },
    { positive: 'Endorsed to OC',        negative: 'For Endorsement' },
    { positive: 'Filed for Utility Model', negative: 'For Filing' },
  ],
  'Industrial Design': [
    { positive: 'Submitted',             negative: 'Incomplete' },
    { positive: 'Case Handler Assigned', negative: 'For Assignment' },
    { positive: 'Prior Art Search Done', negative: 'Under Evaluation' },
    { positive: 'Draft Done',            negative: 'For Drafting' },
    { positive: 'Endorsed to OC',        negative: 'For Endorsement' },
    { positive: 'Filed for Industrial Design', negative: 'For Filing' },
  ],
  Copyright: [
    { positive: 'Submitted',             negative: 'Incomplete' },
    { positive: 'Case Handler Assigned', negative: 'For Assignment' },
    { positive: 'Endorsed to OC',        negative: 'Under Review' },
    { positive: 'Filed for Copyright',   negative: 'For Filing' },
  ],
  Trademark: [
    { positive: 'Submitted',             negative: 'Incomplete' },
    { positive: 'Case Handler Assigned', negative: 'For Assignment' },
    { positive: 'Endorsed to OC',        negative: 'Under Review' },
    { positive: 'Filed for Trademark',   negative: 'For Filing' },
  ],
};

interface AttachedFile { name: string; size: number; uploadedAt: string; folder: 'attached files'; }

export type PreProtectionIPType = 'Patent' | 'Utility Model' | 'Industrial Design' | 'Trademark' | 'Copyright';

export interface PreProtectionCase {
  id: string; title: string; description: string;
  ipType: PreProtectionIPType; caseHandler: string;
  dateDisclosed: string; inventorName: string; college: string;
  department: string; fundingAgency: string; contactEmail: string;
  firstPublicDisclosureDate?: string;
  currentStep: number; blocked?: boolean;
  folderLink?: string; attachedFiles?: AttachedFile[];
  unifiedRemarks?: UnifiedRemark[]; deadline?: string;
  extensionRequested?: boolean; extensionRequestDate?: string;
  responseRequests?: ResponseRequest[];
  transferredFrom?: string;
  secondaryInventors?: string[];
  royaltySharingNote?: string;
}

const ALL_HANDLERS = ['Ana Reyes', 'Nathan Felipe Cruz', 'Samuel Mendoza', 'Maria Santos', 'Katrina Mercado', 'Anna Maria Garcia', 'Carlos Mendoza', 'Tristan Perez-Navarro'];
const IP_TYPE_OPTIONS: PreProtectionIPType[] = ['Patent', 'Utility Model', 'Industrial Design', 'Trademark', 'Copyright'];

const mockCases: PreProtectionCase[] = [
  { id: 'PRE-2026-001', title: 'Smart Irrigation System Using IoT Sensors', description: 'An automated irrigation system using moisture sensors and weather data to optimize water usage for rice cultivation.', ipType: 'Patent', caseHandler: 'Ana Reyes', dateDisclosed: '2026-04-25', inventorName: 'Dr. Ana Reyes', secondaryInventors: ['Engr. Jose Delos Santos', 'Dr. Carla Bautista'], college: 'College of Engineering and Agro-Industrial Technology', department: 'Department of Agricultural and Biosystems Engineering', fundingAgency: 'DOST-PCAARRD', contactEmail: 'areyes@up.edu.ph', currentStep: 3, deadline: '2026-07-05', extensionRequested: true, extensionRequestDate: '2026-07-07', unifiedRemarks: [{ id: 'r1', author: 'Ana Reyes', role: 'handler', text: 'Requesting deadline extension — prior art search is taking longer due to overseas patents database being down.', date: '2026-07-07T09:00:00', read: false, resolved: false }, { id: 'r1-1', author: 'Admin', role: 'admin', text: 'Please submit the revised prior art search report by Friday.', date: '2026-07-08T10:00:00', read: true, resolved: false, attachmentName: 'remarks_thread_1.1_PRE-2026-001_prior_art.pdf', replies: [{ id: 'r1-1-reply-1', author: 'Ana Reyes', role: 'handler', text: 'Noted. Here is the updated file.', date: '2026-07-09T08:30:00', attachmentName: 'remarks_thread_1.1_PRE-2026-001_updated_report.pdf' }] }] },
  { id: 'PRE-2026-004', title: 'Bio-based Edible Coating for Tropical Fruits', description: 'A novel plant-based coating formulated to extend the shelf life of exported mangoes and bananas.', ipType: 'Patent', caseHandler: 'Nathan Felipe Cruz', dateDisclosed: '2026-05-02', inventorName: 'Dr. Maria Santos', secondaryInventors: ['Dr. Liza Fernandez', 'Prof. Ramon Aquino', 'Engr. Sophia Lee'], college: 'College of Agriculture and Food Science', department: 'Institute of Food Science and Technology', fundingAgency: 'DA-BAR', contactEmail: 'msantos@up.edu.ph', currentStep: 2, deadline: '2026-07-09', transferredFrom: 'Carlos Mendoza',
    responseRequests: [{ id: 'rr1', message: 'Please provide the complete list of inventors and their respective contributions. Also attach the most recent lab report.', requestDate: '2026-07-08T10:00:00', status: 'active', thread: [{ id: 'rpl-1', author: 'applicant' as const, text: 'Dr. Liza Fernandez contributed the polymer base formula. Lab report is now attached to the folder.', date: '2026-07-09T08:30:00', attachmentName: 'lab_report_v3.pdf' }] }] },
  { id: 'PRE-2026-005', title: 'Modular Cassava Dehusking Machine', description: 'An industrial design for a low-cost, modular cassava dehusking equipment designed for small-scale farming cooperatives.', ipType: 'Industrial Design', caseHandler: 'Samuel Mendoza', dateDisclosed: '2026-04-10', inventorName: 'Engr. Roberto Luna', secondaryInventors: ['Engr. Marita Villanueva'], college: 'College of Engineering and Agro-Industrial Technology', department: 'Agricultural Machinery Division', fundingAgency: 'Internal UPLB Grant', contactEmail: 'rluna@up.edu.ph', currentStep: 4 },
  { id: 'PRE-2026-010', title: 'Solar-Powered Grain Drying System', description: 'A utility model for an energy-efficient grain drying unit powered entirely by solar energy.', ipType: 'Utility Model', caseHandler: 'Katrina Mercado', dateDisclosed: '2026-05-15', inventorName: 'Engr. Danilo Cruz', college: 'College of Engineering and Agro-Industrial Technology', department: 'Dept. of Mechanical Engineering', fundingAgency: 'DOST-PCAARRD', contactEmail: 'dcruz@up.edu.ph', currentStep: 2 },
  { id: 'PRE-2026-002', title: 'UPLB Visual Identity System 2026', description: 'Comprehensive brand guidelines and visual identity system for the University of the Philippines Los Baños.', ipType: 'Trademark', caseHandler: 'Maria Santos', dateDisclosed: '2026-04-28', inventorName: 'Prof. Juan Dela Cruz', college: 'College of Development Communication', department: 'Department of Communication Arts', fundingAgency: 'University Funds', contactEmail: 'jdelacruz@up.edu.ph', currentStep: 1, deadline: '2026-08-01' },
  { id: 'PRE-2026-006', title: "Oble's Harvest (University Farm Products)", description: 'Trademark application for the brand name and logo covering agricultural products from the university.', ipType: 'Trademark', caseHandler: 'Katrina Mercado', dateDisclosed: '2026-05-05', inventorName: 'Dr. Elena Rosales', college: 'College of Agriculture and Food Science', department: 'University Animal Farm', fundingAgency: 'None', contactEmail: 'erosales@up.edu.ph', currentStep: 2 },
  { id: 'PRE-2026-007', title: 'Makiling Brew Specialty Coffee', description: 'Trademark for a specialty coffee blend sourced and processed from local beans within Mount Makiling.', ipType: 'Trademark', caseHandler: 'Anna Maria Garcia', dateDisclosed: '2026-04-15', inventorName: 'Prof. Antonio Villanueva', college: 'College of Forestry and Natural Resources', department: 'Institute of Renewable Natural Resources', fundingAgency: 'DOST-FPRDI', contactEmail: 'avillanueva@up.edu.ph', currentStep: 3, blocked: true },
  { id: 'PRE-2026-003', title: 'Educational Modules for Sustainable Agriculture', description: 'A comprehensive set of teaching materials covering sustainable farming practices tailored for Filipino farmers.', ipType: 'Copyright', caseHandler: 'Carlos Mendoza', dateDisclosed: '2026-04-22', inventorName: 'Prof. Carlos Mendoza', college: 'College of Agriculture and Food Science', department: 'Institute of Agricultural Education', fundingAgency: 'FAO Philippines', contactEmail: 'cmendoza@up.edu.ph', currentStep: 2, unifiedRemarks: [{ id: 'r2', author: 'Admin', role: 'admin', text: 'Please verify the copyright ownership of the chapter illustrations.', date: '2026-07-01T14:00:00', read: false, resolved: false }] },
  { id: 'PRE-2026-008', title: 'Field Guide to Philippine Endemic Orchids', description: 'An illustrated field guide detailing 50 endemic orchid species found in the Philippine archipelago.', ipType: 'Copyright', caseHandler: 'Tristan Perez-Navarro', dateDisclosed: '2026-05-08', inventorName: 'Dr. Patricia Alcantara', college: 'Museum of Natural History', department: 'Botanical Herbarium', fundingAgency: 'CHED', contactEmail: 'palcantara@up.edu.ph', currentStep: 1, deadline: '2026-07-25' },
  { id: 'PRE-2026-009', title: 'ForCarbon: Software for Estimating Forest Carbon Stock', description: 'A program to calculate and project forest carbon sequestration based on local tree allometric equations.', ipType: 'Copyright', caseHandler: 'Samuel Mendoza', dateDisclosed: '2026-04-18', inventorName: 'Engr. Mark Bautista', college: 'College of Forestry and Natural Resources', department: 'Institute of Renewable Natural Resources', fundingAgency: 'DENR-FMB', contactEmail: 'mbautista@up.edu.ph', currentStep: 3, blocked: true },
  { id: 'PRE-2026-011', title: 'Bamboo-Reinforced Composite Packaging Material', description: 'A biodegradable packaging material composed of bamboo fibers and natural binders, developed as an eco-friendly alternative to single-use plastics.', ipType: 'Patent', caseHandler: 'Nathan Felipe Cruz', dateDisclosed: '2026-03-10', inventorName: 'Dr. Lina Pascual', college: 'College of Engineering and Agro-Industrial Technology', department: 'Dept. of Chemical Engineering', fundingAgency: 'DOST-PCAARRD', contactEmail: 'lpascual@up.edu.ph', currentStep: 6 },
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
function CaseProgressBar({ case_ }: { case_: PreProtectionCase }) {
  const steps = STEPS[case_.ipType] || STEPS['Patent'];
  const blocked = case_.blocked ?? false;
  const activeStep = steps[case_.currentStep];
  const isComplete = case_.currentStep >= steps.length;
  return (
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
              {!isLast && <div className={`flex-1 h-0.5 mx-2 mb-6 ${state === 'accomplished' ? 'bg-[#8d1436]' : state === 'ongoing' ? 'bg-gradient-to-r from-[#8d1436] to-gray-200' : state === 'blocked' ? 'bg-gradient-to-r from-amber-300 to-gray-200' : 'bg-gray-200'}`} />}
            </div>
          );
        })}
      </div>
      {!isComplete && (
        <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm ${blocked ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-[#fdf0f3] border border-[#e99ab2] text-gray-700'}`}>
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${blocked ? 'bg-amber-500' : 'bg-[#8d1436] animate-pulse'}`} />
          <span className="font-semibold">{blocked ? 'Documents returned by OC — ' : 'Currently: '}</span>
          <span>{activeStep?.negative}</span>
        </div>
      )}
    </div>
  );
}

function isLate(deadline?: string) { return !!deadline && new Date(deadline) < new Date(); }
function DeadlineBadge({ deadline }: { deadline?: string }) {
  if (!deadline) return null;
  const late = isLate(deadline);
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${late ? 'bg-red-100 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
      <CalendarClock className="w-3 h-3" />
      {late ? 'OVERDUE · ' : ''}{new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    </span>
  );
}

const TYPE_BADGE: Record<PreProtectionIPType, string> = {
  Patent: 'bg-blue-100 text-blue-800', 'Utility Model': 'bg-purple-100 text-purple-800',
  'Industrial Design': 'bg-indigo-100 text-indigo-800', Trademark: 'bg-green-100 text-green-800', Copyright: 'bg-yellow-100 text-yellow-800',
};

function downloadAdminPASReport(report: AdminPASReport, caseTitle: string) {
  const fmt = (s?: unknown) => s ? new Date(String(s)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const yn = (v?: unknown) => v === 'yes' ? 'Yes' : v === 'no' ? 'No' : 'Not set';
  const r = report as Record<string, unknown>;
  const ipcEntries = (Array.isArray(r.ipcEntries) ? r.ipcEntries : []) as { code: string; description: string; subEntries?: { code: string; description: string }[] }[];
  const searchRows = (Array.isArray(r.searchRows) ? r.searchRows : []) as { database: string; searchString: string; hits: string }[];
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>PAS Report – ${caseTitle}</title><style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;color:#333;line-height:1.5}h1{color:#8d1436;border-bottom:2px solid #8d1436;padding-bottom:8px}h2{color:#8d1436;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:28px}table{width:100%;border-collapse:collapse;margin:8px 0}th,td{border:1px solid #ddd;padding:8px 10px;text-align:left;font-size:13px}th{background:#f5f5f5;font-weight:600}.label{font-size:11px;text-transform:uppercase;color:#888;letter-spacing:.5px;margin-bottom:2px}.val{margin-bottom:12px;font-size:14px}.badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600}.approved{background:#d1fae5;color:#065f46}.pending{background:#dbeafe;color:#1e40af}.draft{background:#fef3c7;color:#92400e}@media print{body{margin:20px}}</style></head><body>
<h1>Prior Art Search (PAS) Report</h1>
<p class="badge ${report.status === 'approved' ? 'approved' : report.status === 'pending_approval' ? 'pending' : 'draft'}">${report.status === 'approved' ? 'Approved' : report.status === 'pending_approval' ? 'Pending Approval' : 'Draft'}</p>
<h2>General Information</h2>
<div class="label">University</div><div class="val">${r.university || '—'}</div>
<div class="label">Researcher(s)</div><div class="val">${r.researchers || '—'}</div>
<div class="label">Title</div><div class="val">${r.title || '—'}</div>
<div class="label">Date of Research</div><div class="val">${fmt(r.dateOfResearch)}</div>
<div class="label">Abstract</div><div class="val">${r.abstract || '—'}</div>
<div class="label">Keywords</div><div class="val">${r.keywords || '—'}</div>
${ipcEntries.length ? `<h2>IPC Classification</h2><table><thead><tr><th>Code</th><th>Description</th></tr></thead><tbody>${ipcEntries.map(e => `<tr><td>${e.code}</td><td>${e.description}</td></tr>${e.subEntries?.map(s => `<tr><td style="padding-left:24px">└ ${s.code}</td><td>${s.description}</td></tr>`).join('') ?? ''}`).join('')}</tbody></table>` : ''}
${searchRows.length ? `<h2>Search Strings and Databases</h2><table><thead><tr><th>Database</th><th>Search String</th><th>Hits</th></tr></thead><tbody>${searchRows.map(row => `<tr><td>${row.database}</td><td><code>${row.searchString}</code></td><td>${row.hits}</td></tr>`).join('')}</tbody></table>` : ''}
<h2>Recommendation</h2><div class="val">${r.recommendation || '—'}</div>
<div class="label">Novelty</div><div class="val">${yn(r.novelty)}</div>
<div class="label">Inventive Step</div><div class="val">${yn(r.inventiveness)}</div>
<div class="label">Industrial Applicability</div><div class="val">${yn(r.industrialApplicability)}</div>
<h2>Certification</h2>
<table><thead><tr><th>Role</th><th>Name</th><th>Date</th></tr></thead><tbody><tr><td>Search Conducted by</td><td>${r.conductedBy || '—'}</td><td>${fmt(r.conductedDate)}</td></tr><tr><td>Search Reviewed by</td><td>${r.reviewedBy || '—'}</td><td>${fmt(r.reviewedDate)}</td></tr></tbody></table>
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

export default function PreProtectionDashboard() {
  const [cases, setCases] = useState(mockCases);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterProgress, setFilterProgress] = useState<'All' | 'Ongoing' | 'Completed'>('All');
  const [compactView, setCompactView] = useState(false);
  const [expandedCompact, setExpandedCompact] = useState<Set<string>>(new Set());
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const toggleDetails = (id: string) => setExpandedDetails(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const [folderCase, setFolderCase] = useState<PreProtectionCase | null>(null);
  const [remarksCase, setRemarksCase] = useState<PreProtectionCase | null>(null);
  const [deadlineCase, setDeadlineCase] = useState<PreProtectionCase | null>(null);
  const [transferCase, setTransferCase] = useState<PreProtectionCase | null>(null);
  const [pasReports, setPasReports] = useState<Record<string, AdminPASReport>>(() => loadAdminPasReports());
  const [viewPasCase, setViewPasCase] = useState<PreProtectionCase | null>(null);
  const refreshPasReports = () => setPasReports(loadAdminPasReports());
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; confirmLabel?: string; variant?: 'default' | 'danger' | 'warning'; onConfirm: () => void } | null>(null);
  const confirm = (title: string, message: string, onConfirm: () => void, opts?: { confirmLabel?: string; variant?: 'default' | 'danger' | 'warning' }) =>
    setConfirmDialog({ title, message, onConfirm, ...opts });
  const handleApprovePAS = (caseId: string) => {
    const current = loadAdminPasReports();
    if (!current[caseId]) return;
    const updated = { ...current, [caseId]: { ...current[caseId], status: 'approved' as const } };
    saveAdminPasReports(updated);
    setPasReports(updated);
  };
  const [responseCase, setResponseCase] = useState<PreProtectionCase | null>(null);
  const [viewingFile, setViewingFile] = useState<{ name: string; url?: string } | null>(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [filterHandler, setFilterHandler] = useState(() => searchParams.get('handler') ?? 'All');

  useEffect(() => { setFilterHandler(searchParams.get('handler') ?? 'All'); }, [searchParams]);

  useEffect(() => {
    const hash = location.hash.slice(1);
    if (!hash) return;
    setHighlightId(hash);
    const t1 = setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
    const t2 = setTimeout(() => setHighlightId(null), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [location.hash]);

  const isPreProtectionComplete = (c: PreProtectionCase) => c.currentStep >= (STEPS[c.ipType] || STEPS['Patent']).length;

  const filteredCases = cases.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.inventorName.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchHandler = filterHandler === 'All' || c.caseHandler === filterHandler;
    const matchType = filterType === 'All' || c.ipType === filterType;
    const matchProgress = filterProgress === 'All' || (filterProgress === 'Completed' ? isPreProtectionComplete(c) : !isPreProtectionComplete(c));
    return matchSearch && matchHandler && matchType && matchProgress;
  });

  const update = (id: string, patch: Partial<PreProtectionCase>) => setCases(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  const handleSaveFolder = (id: string, link: string) => update(id, { folderLink: link });
  const handleAttachFiles = (id: string, files: AttachedFile[]) => update(id, { attachedFiles: files });
  const handleAddRemark = (id: string, remark: UnifiedRemark) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, unifiedRemarks: [...(c.unifiedRemarks ?? []), remark] } : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? { ...prev, unifiedRemarks: [...(prev.unifiedRemarks ?? []), remark] } : null);
  };
  const handleMarkResolved = (id: string, remarkId: string) => {
    const patch = (c: PreProtectionCase) => ({ ...c, unifiedRemarks: (c.unifiedRemarks ?? []).map(r => r.id === remarkId ? { ...r, resolved: true } : r) });
    setCases(prev => prev.map(c => c.id === id ? patch(c) : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? patch(prev) : null);
  };
  const handleMarkRead = (id: string, remarkId: string) => {
    const patch = (c: PreProtectionCase) => ({ ...c, unifiedRemarks: (c.unifiedRemarks ?? []).map(r => r.id === remarkId ? { ...r, read: true } : r) });
    setCases(prev => prev.map(c => c.id === id ? patch(c) : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? patch(prev) : null);
  };
  const handleAddReply = (id: string, remarkId: string, reply: UnifiedRemarkReply) => {
    const patch = (c: PreProtectionCase) => ({ ...c, unifiedRemarks: (c.unifiedRemarks ?? []).map(r => r.id === remarkId ? { ...r, replies: [...(r.replies ?? []), reply] } : r) });
    setCases(prev => prev.map(c => c.id === id ? patch(c) : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? patch(prev) : null);
  };
  const handleSaveDeadline = (id: string, newDate: string) => update(id, { deadline: newDate, extensionRequested: false });
  const handleTransfer = (id: string, newHandler: string) => update(id, { caseHandler: newHandler });

  const typeCounts = IP_TYPE_OPTIONS.reduce((acc, t) => { acc[t] = cases.filter(c => c.ipType === t).length; return acc; }, {} as Record<string, number>);
  const hasUnresolvedHandlerRemarks = (c: PreProtectionCase) => (c.unifiedRemarks ?? []).some(r => !r.resolved && r.role === 'handler');
  const hasPendingRespReq = (c: PreProtectionCase) => (c.responseRequests ?? []).some(r => r.status === 'pending' || r.status === 'active');
  const unreadCount = (c: PreProtectionCase) => (c.unifiedRemarks ?? []).filter(r => !r.read && r.role !== 'admin').length;

  const toggleExpand = (id: string) => setExpandedCompact(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <AdminNav />
      <div className="flex-1 min-w-0 max-w-[1600px] p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Pre-Protection</h1>
          <p className="text-gray-600 text-sm">Internal TTBDO processing before IPOPHL filing</p>
        </div>

        {/* Active handler filter banner */}
        {filterHandler !== 'All' && (
          <div className="mb-4 bg-[#fdf0f3] border border-[#e99ab2] rounded-xl px-5 py-3 flex items-center gap-3">
            <Filter className="w-4 h-4 text-[#8d1436] flex-shrink-0" />
            <p className="text-sm text-[#8d1436] font-semibold flex-1">Filtered by handler: <span className="font-bold">{filterHandler}</span></p>
            <button onClick={() => setFilterHandler('All')} className="flex items-center gap-1 text-xs text-[#8d1436] font-semibold hover:underline flex-shrink-0">
              <X className="w-3.5 h-3.5" /> Clear filter
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-5">
          <div className="p-4 flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search by title, inventor, or case ID..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm">
                <option value="All">All IP Types</option>
                {IP_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t} ({typeCounts[t]})</option>)}
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

        <p className="text-xs text-gray-400 mb-4">Showing {filteredCases.length} of {cases.length} cases</p>

        {/* ── COMPACT VIEW ── */}
        {compactView ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-8"></th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Case</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Handler</th>
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
                  const unresolvedHandler = hasUnresolvedHandlerRemarks(case_);
                  const hasPending = hasPendingRespReq(case_);
                  const late = isLate(case_.deadline);
                  return (
                    <React.Fragment key={case_.id}>
                      <tr id={case_.id} className={`hover:bg-gray-50 transition-colors ${highlightId === case_.id ? 'bg-[#fdf0f3]' : ''}`}>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleExpand(case_.id)} className="text-gray-400 hover:text-gray-600">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-[#8d1436] font-semibold">{case_.id}</p>
                            {unresolvedHandler && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Unresolved handler remarks" />}
                            {hasPending && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" title="Handler requested response" />}
                            {case_.extensionRequested && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Extension requested" />}
                          </div>
                          <p className="text-sm font-medium text-gray-900 max-w-xs truncate">{case_.title}</p>
                          <p className="text-xs text-gray-500">{case_.inventorName}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell"><p className="text-xs text-gray-700">{case_.caseHandler}</p></td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[case_.ipType]}`}>{case_.ipType}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {case_.deadline
                            ? <span className={`text-xs font-medium ${late ? 'text-red-600' : 'text-gray-700'}`}>{late && 'OVERDUE · '}{new Date(case_.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            : <span className="text-xs text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs text-gray-600">{isComplete ? 'Complete' : activeStep?.negative ?? '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => setFolderCase(case_)} className={`p-1.5 rounded hover:bg-gray-100 ${case_.folderLink ? 'text-[#8d1436]' : 'text-gray-400'}`} title="Folder"><FolderOpen className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setRemarksCase(case_)} className={`p-1.5 rounded hover:bg-gray-100 ${unresolvedHandler ? 'text-amber-600' : 'text-gray-400'}`} title="Remarks"><MessageSquare className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeadlineCase(case_)} className={`p-1.5 rounded hover:bg-gray-100 ${case_.extensionRequested ? 'text-blue-600' : 'text-gray-400'}`} title="Deadline"><CalendarClock className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setTransferCase(case_)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400" title="Transfer"><ArrowRightLeft className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="px-8 py-5 bg-gray-50">
                            <div className="grid grid-cols-2 gap-6 mb-3">
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
                            <p className="text-xs text-gray-500">{case_.description}</p>
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
              const unread = unreadCount(case_);
              const remarksCount = (case_.unifiedRemarks ?? []).length;
              const unresolvedHandler = hasUnresolvedHandlerRemarks(case_);
              const hasPending = hasPendingRespReq(case_);
              const pendingRR = hasPending ? (case_.responseRequests ?? []).find(r => r.status === 'pending') : null;
              const pasReport = pasReports[case_.id];
              const isPASType = (case_.ipType === 'Patent' || case_.ipType === 'Utility Model' || case_.ipType === 'Industrial Design');
              const isPASStep = isPASType && case_.currentStep === 2;
              const pasPending = isPASStep && pasReport?.status === 'pending_approval';
              const pasApproved = isPASStep && pasReport?.status === 'approved';
              const hasPASReport = isPASType && !!pasReport;
              return (
                <div key={case_.id} id={case_.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${highlightId === case_.id ? 'border-[#8d1436] ring-2 ring-[#8d1436]/25 shadow-lg' : 'border-gray-200'}`}>
                  {/* Transfer note banner — admin sees a neutral tracking notice, not handler-specific language */}
                  {case_.transferredFrom && (
                    <div className="bg-sky-50 border-b border-sky-200 px-8 py-3 flex items-center gap-2.5">
                      <ArrowRightLeft className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <p className="text-xs text-sky-900">Case handler was recently reassigned. <span className="font-semibold">Previous handler: {case_.transferredFrom}.</span> Verify handover is complete.</p>
                    </div>
                  )}
                  {/* PAS Report pending approval banner */}
                  {pasPending && (
                    <div className="bg-blue-50 border-b border-blue-200 px-8 py-3 flex items-center gap-2.5">
                      <ClipboardList className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <p className="text-xs text-blue-900 flex-1 font-medium">PAS Report submitted by case handler and <span className="font-bold">awaiting Admin approval</span> before the step can be completed.</p>
                      <button onClick={() => { refreshPasReports(); setViewPasCase(case_); }} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Eye className="w-3 h-3" /> Review & Approve
                      </button>
                    </div>
                  )}
                  {/* PAS Report approved banner */}
                  {pasApproved && (
                    <div className="bg-green-50 border-b border-green-200 px-8 py-2.5 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <p className="text-xs text-green-900 font-medium flex-1">PAS Report has been approved. Case handler may now complete this step.</p>
                      <button onClick={() => { refreshPasReports(); setViewPasCase(case_); }} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 border border-green-300 rounded-lg hover:bg-green-200 transition-colors">
                        <ClipboardList className="w-3 h-3" /> View Report
                      </button>
                    </div>
                  )}
                  {/* Response request banner */}
                  {pendingRR && (
                    <div className="bg-orange-50 border-b border-orange-200 px-8 py-3 flex items-start gap-2.5">
                      <Bell className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-orange-900 font-semibold">Handler has requested a response from the applicant. Sent {new Date(pendingRR.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.</p>
                        <p className="text-xs text-orange-700 mt-0.5 line-clamp-1">"{pendingRR.message}"</p>
                      </div>
                    </div>
                  )}
                  {/* Unresolved remarks banner */}
                  {unresolvedHandler && (
                    <div className="bg-amber-50 border-b border-amber-200 px-8 py-3 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1"><p className="text-xs text-amber-900 font-semibold">This case has unresolved handler remarks that need your attention.</p></div>
                      <button onClick={() => setRemarksCase(case_)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors">
                        <MessageSquare className="w-3 h-3" /> Review Remarks
                      </button>
                    </div>
                  )}
                  {/* Extension request banner */}
                  {case_.extensionRequested && (
                    <div className="bg-blue-50 border-b border-blue-200 px-8 py-3 flex items-start gap-2.5">
                      <Bell className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-blue-900 font-semibold">Case handler requested a deadline extension on {case_.extensionRequestDate ? new Date(case_.extensionRequestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'recently'}.</p>
                      </div>
                      <button onClick={() => setDeadlineCase(case_)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-800 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg transition-colors">
                        <CalendarClock className="w-3 h-3" /> Review Extension
                      </button>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-[#fdf0f3] to-white px-8 py-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs text-gray-400 font-mono">{case_.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[case_.ipType]}`}>{case_.ipType}</span>
                          <DeadlineBadge deadline={case_.deadline} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{case_.title}</h3>
                        <p className="text-sm text-gray-600 max-w-3xl mb-1">{case_.description}</p>
                        {case_.secondaryInventors && case_.secondaryInventors.length > 0 && (
                          <p className="text-xs text-gray-500">+ {case_.secondaryInventors.join(', ')}</p>
                        )}
                      </div>
                      <div className="text-right ml-8 flex-shrink-0">
                        <p className="text-xs text-gray-500">Case Handler</p>
                        <p className="text-sm font-semibold text-gray-900">{case_.caseHandler}</p>
                      </div>
                    </div>
                    <CaseProgressBar case_={case_} />
                  </div>

                  {/* Collapsible details toggle */}
                  <div className="border-t border-gray-100">
                    <button onClick={() => toggleDetails(case_.id)} className="w-full flex items-center justify-between px-8 py-3 text-xs text-gray-500 hover:bg-gray-50 transition-colors font-medium">
                      <span className="flex items-center gap-1.5">{expandedDetails.has(case_.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {expandedDetails.has(case_.id) ? 'Hide Details' : 'Show Inventor & Case Details'}</span>
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
                          <div className="flex items-center gap-1 mb-0.5">
                            <p className="text-xs text-gray-500">Public Disclosure Date</p>
                            <div className="relative group">
                              <Info className="w-3 h-3 text-gray-300 cursor-help" />
                              <div className="absolute left-4 top-0 z-10 hidden group-hover:block w-64 bg-gray-900 text-white text-[11px] leading-relaxed rounded-lg p-3 shadow-xl">
                                The date this invention was first publicly disclosed (e.g., at a conference, in a publication, or publicly demonstrated). This date is legally significant — for most IP types, filing must occur within the applicable grace period after public disclosure to avoid affecting patentability.
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-900">{case_.firstPublicDisclosureDate ? new Date(case_.firstPublicDisclosureDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : <span className="text-gray-400 italic">Not specified</span>}</p>
                        </div>
                        <div><p className="text-xs text-gray-500">Funding Agency</p><p className="text-sm text-gray-900">{case_.fundingAgency}</p></div>
                        <div><p className="text-xs text-gray-500">Contact Email</p><p className="text-sm text-gray-900">{case_.contactEmail}</p></div>
                      </div>
                    </div>
                    {/* Secondary inventors inside expanded section */}
                    {case_.secondaryInventors && case_.secondaryInventors.length > 0 && (
                      <div className="col-span-2 border-t border-gray-100 pt-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Secondary Inventors</p>
                        <div className="flex flex-wrap gap-2">
                          {case_.secondaryInventors.map((name, i) => (
                            <span key={i} className="text-xs text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">{name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  )}

                  <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center gap-2 flex-wrap">
                    <button onClick={() => setFolderCase(case_)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
                      <FolderOpen className="w-3.5 h-3.5 text-[#8d1436]" />
                      {`View Folder${case_.attachedFiles?.length ? ` (${case_.attachedFiles.length})` : ''}`}
                    </button>
                    <button onClick={() => setRemarksCase(case_)} className={`relative flex items-center gap-1.5 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium ${unresolvedHandler ? 'border-amber-300 text-amber-700' : 'border-gray-300 text-gray-700'}`}>
                      <MessageSquare className={`w-3.5 h-3.5 ${remarksCount ? 'text-[#8d1436]' : ''}`} />
                      Remarks{remarksCount ? ` (${remarksCount})` : ''}
                      {unread > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#8d1436] text-white rounded-full text-[9px] flex items-center justify-center font-bold">{unread}</span>}
                    </button>
                    <button onClick={() => setDeadlineCase(case_)} className={`flex items-center gap-1.5 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium ${case_.extensionRequested ? 'border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'}`}>
                      <CalendarClock className={`w-3.5 h-3.5 ${isLate(case_.deadline) ? 'text-red-500' : case_.extensionRequested ? 'text-blue-500' : ''}`} />
                      Extend Deadline{case_.extensionRequested ? ' · Requested' : ''}
                    </button>
                    <button onClick={() => setTransferCase(case_)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" /> Transfer Case
                    </button>
                    {hasPASReport && (
                      <button onClick={() => { refreshPasReports(); setViewPasCase(case_); }} className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg transition-colors text-xs font-medium ${pasPending ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' : pasReport?.status === 'approved' ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        <ClipboardList className="w-3.5 h-3.5" />
                        {pasPending ? 'Approve PAS Report' : 'View PAS Report'}
                      </button>
                    )}
                    <button
                      onClick={() => setResponseCase(case_)}
                      className={`relative flex items-center gap-1.5 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium ${hasPendingRespReq(case_) ? 'border-amber-300 text-amber-700' : 'border-gray-300 text-gray-700'}`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Response Requests
                      {hasPendingRespReq(case_) && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">{(case_.responseRequests ?? []).filter(r => r.status === 'pending').length}</span>}
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredCases.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center">
                <p className="text-gray-500 text-sm">No cases found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <LinkFolderModal isOpen={!!folderCase} onClose={() => setFolderCase(null)} item={folderCase} onSave={handleSaveFolder} onAttachFiles={handleAttachFiles} />
      <UnifiedRemarksModal isOpen={!!remarksCase} onClose={() => setRemarksCase(null)} item={remarksCase} currentRole="admin" onAddRemark={handleAddRemark} onMarkResolved={handleMarkResolved} onMarkRead={handleMarkRead} onAddReply={handleAddReply} />
      {deadlineCase && <ExtendDeadlineModal isOpen={!!deadlineCase} onClose={() => setDeadlineCase(null)} caseId={deadlineCase.id} caseTitle={deadlineCase.title} currentDeadline={deadlineCase.deadline} onSave={handleSaveDeadline} />}
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
                  {hasPendingRespReq(responseCase) && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{(responseCase.responseRequests ?? []).filter(r => r.status !== 'closed').length} open</span>
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

      {/* Admin PAS Report review modal */}
      {viewPasCase && (() => {
        const report = pasReports[viewPasCase.id];
        const isPending = report?.status === 'pending_approval';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setViewPasCase(null)} />
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
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${report?.status === 'approved' ? 'bg-green-100 text-green-700' : report?.status === 'pending_approval' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {report?.status === 'approved' ? 'Approved' : report?.status === 'pending_approval' ? 'Pending Approval' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{viewPasCase.id} · {viewPasCase.title}</p>
                  </div>
                </div>
                <button onClick={() => setViewPasCase(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0 ml-4"><X className="w-4 h-4" /></button>
              </div>
              {/* Pending approval action bar */}
              {isPending && (
                <div className="flex-shrink-0 bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center gap-3">
                  <ClipboardList className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <p className="text-xs text-blue-800 flex-1 font-medium">This report is awaiting your approval. Review all sections below, then click Approve to allow the case handler to proceed.</p>
                  <button onClick={() => confirm('Approve PAS Report', `Approve the Prior Art Search Report for case ${viewPasCase.id}? The case handler will be notified and may proceed to complete the evaluation step.`, () => { handleApprovePAS(viewPasCase.id); setViewPasCase(null); }, { confirmLabel: 'Approve Report' })} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130] transition-colors flex-shrink-0">
                    <Check className="w-3.5 h-3.5" /> Approve Report
                  </button>
                </div>
              )}
              {/* Body — read-only field display */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {!report ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                    <ClipboardList className="w-12 h-12 opacity-30" />
                    <p className="text-sm">No PAS report data found for this case.</p>
                  </div>
                ) : (
                  <div className="space-y-6 text-sm">
                    {[
                      ['University', report.university as string],
                      ['Researcher(s)', report.researchers as string],
                      ['Title', report.title as string],
                      ['Date of Research', report.dateOfResearch as string],
                      ['Keywords', report.keywords as string],
                    ].map(([label, val]) => val ? (
                      <div key={label}><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p><p className="text-gray-900">{val}</p></div>
                    ) : null)}
                    {report.abstract && <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Abstract</p><p className="text-gray-900 leading-relaxed">{report.abstract as string}</p></div>}
                    {Array.isArray(report.ipcEntries) && (report.ipcEntries as unknown[]).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">IPC Classification</p>
                        <div className="space-y-2">
                          {(report.ipcEntries as {code: string; description: string; subEntries: {code: string; description: string}[]}[]).map((e, i) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <p className="font-mono text-xs font-bold text-[#8d1436]">{e.code}</p>
                              <p className="text-sm text-gray-800">{e.description}</p>
                              {e.subEntries?.map((sub, j) => (
                                <div key={j} className="ml-4 mt-1.5 flex gap-2">
                                  <span className="text-gray-300 text-xs">└</span>
                                  <div><span className="font-mono text-xs text-gray-600 font-semibold">{sub.code}</span><span className="text-xs text-gray-600 ml-2">{sub.description}</span></div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(report.searchRows) && (report.searchRows as unknown[]).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Search Strings and Databases</p>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="px-3 py-2 text-left font-semibold text-gray-500">Database</th><th className="px-3 py-2 text-left font-semibold text-gray-500">Search String</th><th className="px-3 py-2 text-center font-semibold text-gray-500 w-20">Hits</th></tr></thead>
                            <tbody className="divide-y divide-gray-100">
                              {(report.searchRows as {database: string; searchString: string; hits: string}[]).map((row, i) => (
                                <tr key={i}><td className="px-3 py-2">{row.database}</td><td className="px-3 py-2 font-mono">{row.searchString}</td><td className="px-3 py-2 text-center">{row.hits}</td></tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {report.recommendation && <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Recommendation</p><p className="text-gray-900 leading-relaxed">{report.recommendation as string}</p></div>}
                    {['novelty', 'inventiveness', 'industrialApplicability'].map(key => {
                      const val = report[key as keyof typeof report] as string;
                      const labels: Record<string, string> = { novelty: 'Novelty', inventiveness: 'Inventive Step', industrialApplicability: 'Industrial Applicability' };
                      return val ? (
                        <div key={key} className="flex items-center gap-3">
                          <p className="text-xs font-semibold text-gray-600">{labels[key]}:</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${val === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{val === 'yes' ? 'Yes' : 'No'}</span>
                        </div>
                      ) : null;
                    })}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                      <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Search Conducted by</p><p className="text-gray-900">{report.conductedBy as string || '—'}</p><p className="text-xs text-gray-500">{report.conductedDate as string}</p></div>
                      <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Search Reviewed by</p><p className="text-gray-900">{report.reviewedBy as string || '—'}</p><p className="text-xs text-gray-500">{report.reviewedDate as string}</p></div>
                    </div>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center gap-3">
                {isPending && (
                  <button onClick={() => confirm('Approve PAS Report', `Approve the Prior Art Search Report for case ${viewPasCase.id}? The case handler will be notified and may proceed to complete the evaluation step.`, () => { handleApprovePAS(viewPasCase.id); setViewPasCase(null); }, { confirmLabel: 'Approve PAS Report' })} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130] transition-colors">
                    <Check className="w-4 h-4" /> Approve PAS Report
                  </button>
                )}
                <div className="flex-1 flex justify-end gap-2">
                  {report && <button onClick={() => downloadAdminPASReport(report, viewPasCase.title)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-[#8d1436]/30 text-[#8d1436] bg-white rounded-lg hover:bg-[#fdf0f3] transition-colors">
                    <Download className="w-4 h-4" /> Download
                  </button>}
                  <button onClick={() => setViewPasCase(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 bg-white rounded-lg hover:bg-gray-50">Close</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {confirmDialog && <ConfirmDialog title={confirmDialog.title} message={confirmDialog.message} confirmLabel={confirmDialog.confirmLabel} variant={confirmDialog.variant} onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} onCancel={() => setConfirmDialog(null)} />}
    </div>
  );
}
