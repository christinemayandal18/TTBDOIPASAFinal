import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router';
import { FolderOpen, Bell, Search, Calendar, Check, AlertTriangle, X, Send, ChevronRight, MessageSquare, Eye, Pencil, Printer, RefreshCw, Lock, Plus, Trash2, Paperclip, Download, FileText, Info, ClipboardList } from 'lucide-react';
import ApplicantNav from './ApplicantNav';
import { LinkFolderModal } from '../modals/LinkFolderModal';
import { ConfirmDialog } from '../modals/ConfirmDialog';

const PAS_STORAGE_KEY = 'ipasa_pas_reports';
interface ApplicantPASReport { status: 'draft' | 'pending_approval' | 'approved'; title?: string; researchers?: string; abstract?: string; keywords?: string; recommendation?: string; novelty?: string; noveltyNotes?: string; inventiveness?: string; inventivenessNotes?: string; industrialApplicability?: string; industrialApplicabilityNotes?: string; conductedBy?: string; conductedDate?: string; reviewedBy?: string; reviewedDate?: string; ipcEntries?: { code: string; description: string; subEntries?: { code: string; description: string }[] }[]; [key: string]: unknown; }
function loadApplicantPasReports(): Record<string, ApplicantPASReport> {
  try { const raw = localStorage.getItem(PAS_STORAGE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

function downloadApplicantPASReport(report: ApplicantPASReport, title: string) {
  const fmt = (s?: string) => s ? new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const yn = (v?: string) => v === 'yes' ? 'Yes' : v === 'no' ? 'No' : 'Not set';
  const ipcEntries = (report.ipcEntries ?? []) as { code: string; description: string; subEntries?: { code: string; description: string }[] }[];
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>PAS Report – ${title}</title><style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;color:#333;line-height:1.5}h1{color:#8d1436;border-bottom:2px solid #8d1436;padding-bottom:8px}h2{color:#8d1436;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:28px}table{width:100%;border-collapse:collapse;margin:8px 0}th,td{border:1px solid #ddd;padding:8px 10px;text-align:left;font-size:13px}th{background:#f5f5f5;font-weight:600}.label{font-size:11px;text-transform:uppercase;color:#888;letter-spacing:.5px;margin-bottom:2px}.val{margin-bottom:12px;font-size:14px}.approved{background:#d1fae5;color:#065f46;display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600}@media print{body{margin:20px}}</style></head><body>
<h1>Prior Art Search (PAS) Report</h1>
<p class="approved">Approved</p>
<h2>General Information</h2>
<div class="label">Title of Invention</div><div class="val">${report.title || title || '—'}</div>
<div class="label">Researcher(s)</div><div class="val">${report.researchers || '—'}</div>
<div class="label">Abstract</div><div class="val">${report.abstract || '—'}</div>
<div class="label">Keywords</div><div class="val">${report.keywords || '—'}</div>
${ipcEntries.length ? `<h2>IPC Classification</h2><table><thead><tr><th>Code</th><th>Description</th></tr></thead><tbody>${ipcEntries.map(e => `<tr><td>${e.code}</td><td>${e.description}</td></tr>${e.subEntries?.map(s => `<tr><td style="padding-left:24px">└ ${s.code}</td><td>${s.description}</td></tr>`).join('') ?? ''}`).join('')}</tbody></table>` : ''}
<h2>Patentability Assessment</h2>
<table><thead><tr><th>Criterion</th><th>Result</th><th>Notes</th></tr></thead><tbody><tr><td>Novelty</td><td>${yn(report.novelty)}</td><td>${report.noveltyNotes || ''}</td></tr><tr><td>Inventiveness</td><td>${yn(report.inventiveness)}</td><td>${report.inventivenessNotes || ''}</td></tr><tr><td>Industrial Applicability</td><td>${yn(report.industrialApplicability)}</td><td>${report.industrialApplicabilityNotes || ''}</td></tr></tbody></table>
<h2>Recommendation</h2><div class="val">${report.recommendation || '—'}</div>
<h2>Certification</h2>
<table><thead><tr><th>Role</th><th>Name</th><th>Date</th></tr></thead><tbody><tr><td>Search Conducted by</td><td>${report.conductedBy || '—'}</td><td>${fmt(report.conductedDate)}</td></tr><tr><td>Search Reviewed by</td><td>${report.reviewedBy || '—'}</td><td>${fmt(report.reviewedDate)}</td></tr></tbody></table>
</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PAS_Report_${(title || 'report').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function ApplicantPASModal({ report, title, onClose }: { report: ApplicantPASReport; title: string; onClose: () => void }) {
  const fmt = (s?: string) => s ? new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const yesNo = (v?: string) => v === 'yes' ? <span className="text-green-700 font-semibold">Yes</span> : v === 'no' ? <span className="text-red-600 font-semibold">No</span> : <span className="text-gray-400">—</span>;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-[#fdf0f3]">
          <ClipboardList className="w-5 h-5 text-[#8d1436] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#8d1436]">Prior Art Search (PAS) Report</p>
            <p className="text-xs text-gray-600 truncate">{title}</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 flex-shrink-0">Approved</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-500 flex-shrink-0 ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Title of Invention</p><p className="text-gray-900">{report.title || '—'}</p></div>
            <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Researchers</p><p className="text-gray-900">{report.researchers || '—'}</p></div>
            <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Date of Research</p><p className="text-gray-900">{fmt((report as any).dateOfResearch)}</p></div>
            <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Keywords</p><p className="text-gray-900">{report.keywords || '—'}</p></div>
          </div>
          {/* IPC Classification */}
          {report.ipcEntries && report.ipcEntries.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">IPC Classification</p>
              <div className="space-y-1.5">
                {report.ipcEntries.map((entry, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-start gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-xs font-bold text-[#8d1436] font-mono mt-0.5 flex-shrink-0">{entry.code}</span>
                      <span className="text-xs text-gray-700">{entry.description}</span>
                    </div>
                    {entry.subEntries?.map((sub, j) => (
                      <div key={j} className="flex items-start gap-2 pl-7 pr-3 py-1 bg-gray-50/50 rounded border border-gray-100 ml-3">
                        <span className="text-[10px] text-gray-400">└</span>
                        <span className="text-xs font-mono text-gray-600 flex-shrink-0">{sub.code}</span>
                        <span className="text-xs text-gray-500">{sub.description}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Abstract */}
          {report.abstract && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Abstract</p>
              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">{report.abstract}</p>
            </div>
          )}
          {/* Conclusions */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Patentability Assessment</p>
            <div className="space-y-2">
              {[
                { label: 'Novelty', val: report.novelty, notes: report.noveltyNotes },
                { label: 'Inventiveness', val: report.inventiveness, notes: report.inventivenessNotes },
                { label: 'Industrial Applicability', val: report.industrialApplicability, notes: report.industrialApplicabilityNotes },
              ].map(({ label, val, notes }) => (
                <div key={label} className="flex items-start gap-3 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs font-semibold text-gray-700 w-40 flex-shrink-0">{label}</p>
                  <div className="text-xs">{yesNo(val)}{notes && <span className="ml-2 text-gray-500">{notes}</span>}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Recommendation */}
          {report.recommendation && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Recommendation</p>
              <p className="text-gray-700 text-sm leading-relaxed bg-[#fdf0f3] rounded-lg px-3 py-2.5 border border-[#e8b0b0]">{report.recommendation}</p>
            </div>
          )}
          {/* Conducted / Reviewed by */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Conducted By</p><p className="text-gray-900">{report.conductedBy || '—'}</p><p className="text-xs text-gray-400">{fmt(report.conductedDate)}</p></div>
            <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Reviewed By</p><p className="text-gray-900">{report.reviewedBy || '—'}</p><p className="text-xs text-gray-400">{fmt(report.reviewedDate)}</p></div>
          </div>
        </div>
        <div className="flex-shrink-0 px-6 py-3 border-t border-gray-200 bg-gray-50 flex gap-2">
          <button onClick={() => downloadApplicantPASReport(report, title)} className="flex items-center gap-1.5 flex-1 justify-center py-2 text-sm font-semibold text-[#8d1436] border border-[#8d1436]/30 bg-white rounded-lg hover:bg-[#fdf0f3] transition-colors">
            <Download className="w-4 h-4" /> Download Report
          </button>
          <button onClick={onClose} className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-white transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type IPType = 'Patent' | 'Utility Model' | 'Trademark' | 'Copyright' | 'Industrial Design';
type AppStage = 'pre-protection' | 'prosecution';
type ProsType = 'patent' | 'utility-model' | 'trademark' | 'copyright' | 'industrial-design';

interface ResponseReply {
  id: string; author: 'handler' | 'applicant'; text: string; date: string; attachmentName?: string;
}
interface ResponseRequest {
  id: string; message: string; attachmentName?: string; requestDate: string;
  status: 'pending' | 'active' | 'closed'; thread?: ResponseReply[];
}

interface AppInventor { name: string; email: string; contribution: string; royaltyShare: number; }

interface Application {
  id: string; title: string; ipType: IPType;
  submittedDate: string; handler?: string;
  description: string; college: string; department?: string; fundingAgency: string; contactEmail: string;
  publicDisclosureDate?: string; publicDisclosureDesc?: string;
  hasPublicDisclosure?: 'yes' | 'no';
  inventors?: AppInventor[];
  stage: AppStage;
  // pre-protection fields
  currentStep?: number; blocked?: boolean;
  // prosecution fields
  applicationNo?: string; prosType?: ProsType; currentProsStage?: number; prosStatus?: string;
  responseRequests?: ResponseRequest[];
  secondaryInventors?: string[];
  editUsed?: boolean;
  attachedFiles?: string[];
  folderLink?: string;
}

// ── Pre-protection step definitions ───────────────────────────────────────────

interface StepDef { positive: string; negative: string; }

const STEPS: Record<IPType, StepDef[]> = {
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
  'Industrial Design': [
    { positive: 'Submitted',             negative: 'Incomplete' },
    { positive: 'Case Handler Assigned', negative: 'For Assignment' },
    { positive: 'Endorsed to OC',        negative: 'Under Review' },
    { positive: 'Filed for Industrial Design', negative: 'For Filing' },
  ],
};

type StepState = 'accomplished' | 'ongoing' | 'blocked' | 'pending';
function getStepState(idx: number, cur: number, blocked: boolean): StepState {
  if (idx < cur) return 'accomplished';
  if (idx === cur) return blocked ? 'blocked' : 'ongoing';
  return 'pending';
}
function StepNode({ state }: { state: StepState }) {
  if (state === 'accomplished') return <div className="w-9 h-9 rounded-full bg-[#8d1436] flex items-center justify-center flex-shrink-0 shadow-sm"><Check className="w-4 h-4 text-white stroke-[3]" /></div>;
  if (state === 'ongoing')      return <div className="w-9 h-9 rounded-full border-2 border-[#8d1436] bg-white flex items-center justify-center flex-shrink-0 ring-4 ring-[#8d1436]/20"><div className="w-2.5 h-2.5 rounded-full bg-[#8d1436] animate-pulse" /></div>;
  if (state === 'blocked')      return <div className="w-9 h-9 rounded-full border-2 border-amber-400 bg-amber-50 flex items-center justify-center flex-shrink-0 ring-4 ring-amber-200"><AlertTriangle className="w-4 h-4 text-amber-500" /></div>;
  return <div className="w-9 h-9 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 rounded-full bg-gray-300" /></div>;
}
function CaseProgressBar({ app }: { app: Application }) {
  const steps = STEPS[app.ipType];
  const cur = app.currentStep ?? 0;
  const blocked = app.blocked ?? false;
  return (
    <div className="flex items-start gap-0 mt-4">
      {steps.map((step, i) => {
        const state = getStepState(i, cur, blocked);
        const label = state === 'accomplished' ? step.positive : state === 'ongoing' ? step.negative : state === 'blocked' ? step.negative : step.negative;
        const isLast = i === steps.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              {i > 0 && <div className={`h-0.5 flex-1 ${i <= cur ? 'bg-[#8d1436]' : 'bg-gray-200'}`} />}
              <StepNode state={state} />
              {!isLast && <div className={`h-0.5 flex-1 ${i < cur ? 'bg-[#8d1436]' : 'bg-gray-200'}`} />}
            </div>
            <p className={`text-[10px] text-center mt-1.5 leading-tight max-w-[70px] ${state === 'accomplished' ? 'text-[#8d1436] font-medium' : state === 'ongoing' || state === 'blocked' ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>{label}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── Prosecution stage tracker ─────────────────────────────────────────────────

const PROS_STAGES: Record<ProsType, string[]> = {
  patent:             ['Filed', 'Formality Examination', 'Substantive Examination', 'Granted'],
  'utility-model':    ['Filed', 'Formality Examination', 'Registered'],
  trademark:          ['Filed', 'Registrability Report', 'Registered'],
  copyright:          ['Filed', 'Registered'],
  'industrial-design':['Filed', 'Registrability Report', 'Registered'],
};

function ProsStageBar({ app }: { app: Application }) {
  const stages = PROS_STAGES[app.prosType ?? 'patent'];
  const cur = app.currentProsStage ?? 0;
  const isComplete = cur >= stages.length;
  return (
    <div className="flex items-start gap-0 mt-4">
      {stages.map((label, i) => {
        const done = i < cur || isComplete;
        const active = i === cur && !isComplete;
        const isLast = i === stages.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              {i > 0 && <div className={`h-0.5 flex-1 ${done || active ? 'bg-[#8d1436]' : 'bg-gray-200'}`} />}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-[#8d1436] shadow-sm' : active ? 'border-2 border-[#8d1436] bg-white ring-4 ring-[#8d1436]/20' : 'border-2 border-gray-200 bg-white'}`}>
                {done ? <Check className="w-4 h-4 text-white stroke-[3]" /> : active ? <div className="w-2.5 h-2.5 rounded-full bg-[#8d1436] animate-pulse" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
              </div>
              {!isLast && <div className={`h-0.5 flex-1 ${done ? 'bg-[#8d1436]' : 'bg-gray-200'}`} />}
            </div>
            <p className={`text-[10px] text-center mt-1.5 leading-tight max-w-[72px] ${done ? 'text-[#8d1436] font-medium' : active ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>{label}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── Badge colors ──────────────────────────────────────────────────────────────

const IP_TYPE_BADGE: Record<string, string> = {
  Patent: 'bg-blue-100 text-blue-800', 'Utility Model': 'bg-purple-100 text-purple-800',
  Trademark: 'bg-green-100 text-green-800', Copyright: 'bg-yellow-100 text-yellow-800',
  'Industrial Design': 'bg-orange-100 text-orange-800',
};

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockApplications: Application[] = [
  {
    id: 'PRE-2026-012', title: 'Novel Bamboo Composite Board for Construction', ipType: 'Utility Model',
    submittedDate: '2026-06-15', handler: 'Ana Reyes', stage: 'pre-protection',
    description: 'A modular bamboo composite panel engineered for structural wall and flooring applications, offering a sustainable and cost-effective alternative to conventional building materials.',
    college: 'College of Engineering and Agro-Industrial Technology', department: 'Agricultural Machinery Division',
    fundingAgency: 'DOST-PCAARRD', contactEmail: 'applicant@up.edu.ph', currentStep: 2,
    responseRequests: [{ id: 'rr1', message: 'Please provide the complete list of inventors and their respective contributions. Also attach the most recent laboratory test report confirming the material strength claims.', requestDate: '2026-07-08T10:00:00', status: 'active', thread: [{ id: 'rpl-1', author: 'applicant' as const, text: 'Dr. Liza Fernandez contributed the polymer base formula. Lab report is now attached to the folder.', date: '2026-07-09T08:30:00', attachmentName: 'lab_report_v3.pdf' }] }],
  },
  {
    id: 'PRE-2026-008', title: 'Field Guide to Philippine Endemic Orchids', ipType: 'Copyright',
    submittedDate: '2026-05-08', handler: 'Tristan Perez-Navarro', stage: 'pre-protection',
    description: 'An illustrated field guide detailing 50 endemic orchid species found in the Philippine archipelago, covering identification keys, habitat descriptions, and conservation status.',
    college: 'Museum of Natural History', department: 'Botanical Herbarium',
    fundingAgency: 'CHED', contactEmail: 'applicant@up.edu.ph', currentStep: 2,
    responseRequests: [
      { id: 'rr2', message: 'Please confirm all copyright ownership of illustrations. Attach copyright assignment agreements.', requestDate: '2026-06-15T09:00:00', status: 'closed', thread: [{ id: 'rpl-2', author: 'applicant' as const, text: 'Attached are all signed copyright assignments from the illustrators.', date: '2026-06-16T14:00:00', attachmentName: 'copyright_assignments.pdf' }] },
    ],
  },
  {
    id: 'PRE-2026-015', title: 'Organic Soil Amendment from Sugarcane Bagasse', ipType: 'Patent',
    submittedDate: '2026-07-01', handler: undefined, stage: 'pre-protection',
    description: 'A novel soil conditioner formulated from fermented sugarcane bagasse enriched with beneficial microorganisms, designed to improve soil fertility and crop yield in acidic upland soils.',
    college: 'College of Agriculture and Food Science', department: 'Institute of Crop Science',
    publicDisclosureDate: '2026-06-18', publicDisclosureDesc: 'Presented at the 2026 PCARRD Annual Symposium.',
    hasPublicDisclosure: 'yes',
    inventors: [{ name: 'Juan dela Cruz', email: 'applicant@up.edu.ph', contribution: 'Lead Researcher', royaltyShare: 60 }, { name: 'Maria Santos', email: 'msantos@up.edu.ph', contribution: 'Co-Inventor', royaltyShare: 40 }],
    fundingAgency: 'DA-BAR', contactEmail: 'applicant@up.edu.ph', currentStep: 0,
  },
  {
    id: 'APP-2024-802', title: 'Smart Soil Moisture Sensor Array', ipType: 'Patent',
    submittedDate: '2024-03-10', handler: 'Samuel Mendoza', stage: 'prosecution',
    description: 'A wireless network of soil moisture sensors with machine-learning-based irrigation control for precision farming applications.',
    college: 'College of Engineering and Agro-Industrial Technology', department: 'Dept. of Agricultural Engineering',
    publicDisclosureDate: '2024-02-20',
    fundingAgency: 'DOST-PCIEERD', contactEmail: 'applicant@up.edu.ph', applicationNo: '1-2024-498802', prosType: 'patent', currentProsStage: 2,
  },
  {
    id: 'APP-2025-115', title: 'Makiling Brew Specialty Coffee', ipType: 'Trademark',
    submittedDate: '2025-01-20', handler: 'Anna Maria Garcia', stage: 'prosecution',
    description: 'Trademark for a specialty coffee blend sourced and processed from local beans within Mount Makiling.',
    college: 'College of Forestry and Natural Resources', department: 'Institute of Renewable Natural Resources',
    fundingAgency: 'DOST-FPRDI', contactEmail: 'applicant@up.edu.ph', applicationNo: '4-2025-100115', prosType: 'trademark', currentProsStage: 1,
    responseRequests: [{ id: 'rr3', message: 'Please provide revised trademark specimens showing use in commerce.', requestDate: '2026-05-20T08:00:00', status: 'pending', thread: [] }],
  },
];

function prefixResponseFile(fileName: string, threadId: string, caseId: string): string {
  return `response_thread_${threadId}_${caseId}_${fileName}`;
}

// ── Form definitions ──────────────────────────────────────────────────────────

const IP_TYPE_FORMS: Record<IPType, string[]> = {
  Patent: ['Invention Disclosure Form', 'Deed of Assignment – Patent/UM'],
  'Utility Model': ['Invention Disclosure Form', 'Deed of Assignment – Patent/UM'],
  Trademark: ['Application for Trademark Registration', 'Deed of Assignment – Trademark'],
  Copyright: ['Copyright Application Form', 'Deed of Assignment – Copyright'],
  'Industrial Design': ['Industrial Design Application Form', 'Deed of Assignment – Industrial Design'],
};

function buildFormContent(app: Application, formName: string): string {
  const inventors = app.inventors?.filter(i => i.name) ?? [];
  const lines = [
    `UPLB TECHNOLOGY TRANSFER AND BUSINESS DEVELOPMENT OFFICE`,
    `IPASA — Auto-Generated Prefilled Form`,
    `=`.repeat(60),
    ``,
    `Form: ${formName}`,
    `IP Type: ${app.ipType}`,
    `Case ID: ${app.id}`,
    `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    ``,
    `-`.repeat(60),
    `TITLE OF INVENTION / WORK`,
    app.title,
    ``,
    `-`.repeat(60),
    `DESCRIPTION`,
    app.description,
    ``,
    `-`.repeat(60),
    `COLLEGE / UNIT`,
    app.college,
    ...(app.department ? [`DEPARTMENT: ${app.department}`] : []),
    ``,
    `-`.repeat(60),
    `FUNDING SOURCE`,
    app.fundingAgency || 'Not specified',
    ``,
    `-`.repeat(60),
    `PRIOR PUBLIC DISCLOSURE`,
    app.hasPublicDisclosure === 'yes' || app.publicDisclosureDate
      ? `Yes — Date: ${app.publicDisclosureDate ?? 'Not specified'}\nDetails: ${app.publicDisclosureDesc ?? 'Not specified'}`
      : 'No prior public disclosure',
    ``,
    `-`.repeat(60),
    `INVENTORS / AUTHORS & ROYALTY SHARES`,
    ...(inventors.length
      ? inventors.map((inv, i) => `${i + 1}. ${inv.name} <${inv.email}>${inv.contribution ? ` | ${inv.contribution}` : ''} | Share: ${inv.royaltyShare}%`)
      : ['(Refer to submitted disclosure form)']),
    ``,
    `=`.repeat(60),
    ``,
    `SIGNATURE (Wet signature required)`,
    ``,
    `Principal Inventor: ________________________  Date: __________`,
    ``,
    `NOTE: Print this form, sign with an original wet signature,`,
    `and submit to the TTBDO office at 2/F CTTE Building, UPLB.`,
  ];
  return lines.join('\n');
}

// ── Preview Forms Modal ───────────────────────────────────────────────────────

function PreviewFormsModal({ app, onClose }: { app: Application; onClose: () => void }) {
  const forms = IP_TYPE_FORMS[app.ipType] ?? [];
  const [previewForm, setPreviewForm] = useState<string | null>(null);

  const downloadForm = useCallback((formName: string) => {
    const content = buildFormContent(app, formName);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safe = formName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.href = url;
    a.download = `IPASA_${app.id}_${safe}_prefilled.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [app]);

  const downloadAll = useCallback(() => {
    forms.forEach((f, i) => setTimeout(() => downloadForm(f), i * 200));
  }, [forms, downloadForm]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-white px-6 py-5 flex items-center gap-4 flex-shrink-0 border-b border-gray-200">
          <div className="w-10 h-10 rounded-full bg-[#fdf0f3] flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#8d1436]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900">Prefilled Application Forms</h2>
            <p className="text-xs text-gray-500 truncate">{app.title}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Download all */}
          <button
            onClick={downloadAll}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#8d1436] hover:bg-[#7a1130] text-white text-sm font-bold rounded-xl transition-colors mb-5"
          >
            <Download className="w-4 h-4" />
            Download All {forms.length} Forms
          </button>

          {/* Form cards */}
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Individual Forms</p>
          <div className="space-y-2 mb-5">
            {forms.map((formName, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
                  <FileText className="w-4 h-4 text-[#8d1436] flex-shrink-0" />
                  <p className="text-sm text-gray-800 flex-1 min-w-0 font-medium">{formName}</p>
                  <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex-shrink-0">Auto-filled</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setPreviewForm(previewForm === formName ? null : formName)}
                      className="flex items-center gap-1 text-xs font-medium text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                    <button
                      onClick={() => downloadForm(formName)}
                      className="flex items-center gap-1 text-xs font-bold text-white bg-[#8d1436] hover:bg-[#7a1130] px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                </div>
                {previewForm === formName && (
                  <div className="border-t border-gray-200 bg-white p-4">
                    <pre className="text-[10px] text-gray-700 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">{buildFormContent(app, formName)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reminder */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-blue-800 mb-0.5">Submission reminder</p>
              <p className="text-xs text-blue-700">Print each form, sign with an original wet signature, and submit to the TTBDO office at 2/F CTTE Building, UPLB.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-white">
          <button onClick={onClose} className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type StageFilter = 'All' | 'Pre-Protection' | 'Prosecution';

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

export default function ApplicantMyApplications() {
  const location = useLocation();
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const hash = location.hash.slice(1);
    if (!hash) return;
    setHighlightId(hash);
    const t1 = setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
    const t2 = setTimeout(() => setHighlightId(null), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [location.hash]);

  const [apps, setApps] = useState(mockApplications);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState<StageFilter>('All');
  const [rrSidebarApp, setRrSidebarApp] = useState<Application | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const replyFileRef = useRef<HTMLInputElement>(null);
  const [viewingFile, setViewingFile] = useState<{ name: string; url?: string } | null>(null);
  const [fileUrlMap, setFileUrlMap] = useState<Record<string, string>>({});
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const [folderApp, setFolderApp] = useState<Application | null>(null);
  const [previewFormsApp, setPreviewFormsApp] = useState<Application | null>(null);
  const [pasReports] = useState<Record<string, ApplicantPASReport>>(() => loadApplicantPasReports());
  const [viewPasApp, setViewPasApp] = useState<Application | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; confirmLabel?: string; variant?: 'default' | 'danger' | 'warning'; onConfirm: () => void } | null>(null);
  const confirm = (title: string, message: string, onConfirm: () => void, opts?: { confirmLabel?: string; variant?: 'default' | 'danger' | 'warning' }) =>
    setConfirmDialog({ title, message, onConfirm, ...opts });
  const toggleDetails = (id: string) => setExpandedDetails(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // Edit modal
  const [editApp, setEditApp] = useState<Application | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editFundingAgency, setEditFundingAgency] = useState('');
  const [editHasPublicDisclosure, setEditHasPublicDisclosure] = useState<'yes' | 'no' | ''>('');
  const [editPublicDisclosureDate, setEditPublicDisclosureDate] = useState('');
  const [editPublicDisclosureDesc, setEditPublicDisclosureDesc] = useState('');
  const [editInventors, setEditInventors] = useState<AppInventor[]>([]);
  const [redownloadPrompt, setRedownloadPrompt] = useState<string | null>(null);

  const openEdit = (app: Application) => {
    setEditApp(app);
    setEditTitle(app.title);
    setEditDescription(app.description);
    setEditContactEmail(app.contactEmail);
    setEditFundingAgency(app.fundingAgency);
    setEditHasPublicDisclosure(app.hasPublicDisclosure ?? (app.publicDisclosureDate ? 'yes' : 'no'));
    setEditPublicDisclosureDate(app.publicDisclosureDate ?? '');
    setEditPublicDisclosureDesc(app.publicDisclosureDesc ?? '');
    setEditInventors(app.inventors?.length ? app.inventors : [{ name: '', email: '', contribution: '', royaltyShare: 100 }]);
  };

  const updateEditInventor = (idx: number, field: keyof AppInventor, value: string | number) =>
    setEditInventors(prev => prev.map((inv, i) => i === idx ? { ...inv, [field]: value } : inv));

  const handleSaveEdit = () => {
    if (!editApp) return;
    setApps(prev => prev.map(a => a.id === editApp.id ? {
      ...a,
      title: editTitle, description: editDescription, contactEmail: editContactEmail,
      fundingAgency: editFundingAgency,
      hasPublicDisclosure: editHasPublicDisclosure as 'yes' | 'no',
      publicDisclosureDate: editHasPublicDisclosure === 'yes' ? editPublicDisclosureDate : undefined,
      publicDisclosureDesc: editHasPublicDisclosure === 'yes' ? editPublicDisclosureDesc : undefined,
      inventors: editInventors,
      editUsed: true,
    } : a));
    setRedownloadPrompt(editApp.id);
    setEditApp(null);
  };

  const filtered = apps.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchStage = filterStage === 'All' || (filterStage === 'Pre-Protection' && a.stage === 'pre-protection') || (filterStage === 'Prosecution' && a.stage === 'prosecution');
    return matchSearch && matchStage;
  });

  const pendingRRCount = apps.reduce((sum, a) => sum + (a.responseRequests ?? []).filter(r => r.status === 'pending' || r.status === 'active').length, 0);

  const handleReplySubmit = (appId: string, rrId: string, text: string, attachmentName?: string) => {
    const reply: ResponseReply = { id: `rpl-${Date.now()}`, author: 'applicant', text, date: new Date().toISOString(), attachmentName };
    setApps(prev => prev.map(a => a.id === appId ? {
      ...a,
      responseRequests: (a.responseRequests ?? []).map(r => r.id === rrId ? { ...r, status: 'active' as const, thread: [...(r.thread ?? []), reply] } : r),
      // Section 3: auto-add attachment to folder
      attachedFiles: attachmentName ? [...(a.attachedFiles ?? []), attachmentName] : a.attachedFiles,
    } : a));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <ApplicantNav />
      <div className="flex-1 min-w-0 p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">My Applications</h1>
            <p className="text-gray-600 text-sm">Track the status and progress of your IP disclosure submissions</p>
          </div>
        </div>

        {/* Global pending response banner */}
        {pendingRRCount > 0 && (
          <div className="mb-5 bg-orange-50 border border-orange-300 rounded-xl px-5 py-4 flex items-start gap-3">
            <Bell className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-900">{pendingRRCount} application{pendingRRCount > 1 ? 's have' : ' has'} a pending response request from your case handler.</p>
              <p className="text-xs text-orange-700 mt-0.5">Please respond to keep your application moving forward.</p>
            </div>
          </div>
        )}

        {/* Search + filter */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by title or case ID..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] text-sm" />
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['All', 'Pre-Protection', 'Prosecution'] as StageFilter[]).map(s => (
              <button key={s} onClick={() => setFilterStage(s)} className={`px-4 py-2 text-xs font-medium transition-colors ${filterStage === s ? 'bg-[#8d1436] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>{s}</button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4">Showing {filtered.length} of {apps.length} applications</p>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-20 text-center shadow-sm">
            <p className="text-gray-500 font-medium">No applications found.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map(app => {
              const pendingRR = (app.responseRequests ?? []).find(r => r.status === 'pending');
              const activeRRs = (app.responseRequests ?? []).filter(r => r.status === 'pending' || r.status === 'active');
              const hasOpenRR = activeRRs.length > 0;

              return (
                <div key={app.id} id={app.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-shadow ${highlightId === app.id ? 'border-[#8d1436] ring-2 ring-[#8d1436]/30' : hasOpenRR ? 'border-orange-300' : 'border-gray-200'}`}>

                  {/* Open response request banner */}
                  {hasOpenRR && (() => {
                    const openReq = activeRRs[0];
                    const needsReply = openReq.status === 'pending' || (openReq.thread ?? []).length === 0 || (openReq.thread ?? []).at(-1)?.author === 'handler';
                    return (
                      <div className={`border-b px-8 py-3 flex items-center gap-3 ${needsReply ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
                        <Bell className={`w-4 h-4 flex-shrink-0 ${needsReply ? 'text-orange-600' : 'text-blue-600'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${needsReply ? 'text-orange-900' : 'text-blue-900'}`}>
                            {needsReply ? 'Your case handler has requested additional information.' : 'Case handler replied to your response — continue the thread.'}
                          </p>
                          <p className={`text-xs mt-0.5 line-clamp-1 ${needsReply ? 'text-orange-700' : 'text-blue-700'}`}>"{openReq.message}"</p>
                        </div>
                        <button onClick={() => setRrSidebarApp(app)} className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${needsReply ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                          <Send className="w-3 h-3" /> {needsReply ? 'Respond' : 'View Thread'}
                        </button>
                      </div>
                    );
                  })()}

                  {/* Card header */}
                  <div className="bg-gradient-to-r from-[#fdf0f3] to-white px-8 py-6">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {app.stage === 'prosecution' && app.applicationNo && (
                            <span className="text-xs font-mono text-gray-600 font-semibold">{app.applicationNo}</span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${IP_TYPE_BADGE[app.ipType] ?? 'bg-gray-100 text-gray-700'}`}>{app.ipType}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${app.stage === 'pre-protection' ? 'bg-[#fdf0f3] text-[#8d1436] border border-[#e8b0b0]' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                            {app.stage === 'pre-protection' ? 'Pre-Protection' : 'Prosecution'}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{app.title}</h3>
                        <p className="text-sm text-gray-600 max-w-3xl">{app.description}</p>
                      </div>
                      <div className="text-right ml-8 flex-shrink-0">
                        {app.handler ? (
                          <>
                            <p className="text-xs text-gray-500">Case Handler</p>
                            <p className="text-sm font-semibold text-gray-900">{app.handler}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-gray-500">Case Handler</p>
                            <p className="text-sm font-medium text-yellow-600">Awaiting Assignment</p>
                          </>
                        )}
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-end">
                          <Calendar className="w-3 h-3" />
                          {new Date(app.submittedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {app.stage === 'pre-protection' ? (
                      <CaseProgressBar app={app} />
                    ) : (
                      <ProsStageBar app={app} />
                    )}

                    {/* "Being handled by TTBDO" message */}
                    {app.stage === 'pre-protection' && (
                      <div className="mt-4 flex items-center gap-2.5 px-4 py-2.5 bg-[#fdf0f3] border border-[#e8b0b0] rounded-lg text-sm text-[#8d1436]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8d1436] animate-pulse flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-700">Your application is currently being handled by TTBDO. You will be notified of any updates.</span>
                      </div>
                    )}
                    {app.stage === 'prosecution' && (
                      <div className="mt-4 flex items-center gap-2.5 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-700">Your application is currently being prosecuted at IPOPHL.</span>
                        {app.prosStatus && <span className="ml-auto text-xs font-semibold text-blue-700">{app.prosStatus}</span>}
                      </div>
                    )}
                  </div>

                  {/* Collapsible details toggle */}
                  <div className="border-t border-gray-100">
                    <button onClick={() => toggleDetails(app.id)} className="w-full flex items-center justify-between px-8 py-3 text-xs text-gray-500 hover:bg-gray-50 transition-colors font-medium">
                      <span className="flex items-center gap-1.5">{expandedDetails.has(app.id) ? <ChevronRight className="w-3.5 h-3.5 rotate-90" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        {expandedDetails.has(app.id) ? 'Hide Details' : 'Show Submission & Case Details'}
                      </span>
                      {!expandedDetails.has(app.id) && <span className="text-[10px] text-gray-400">Click to expand</span>}
                    </button>
                  </div>
                  {expandedDetails.has(app.id) && (
                  <div className="px-8 py-4 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Submission Details</h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                      <div><p className="text-xs text-gray-400">College / Unit</p><p className="text-sm text-gray-900">{app.college}</p></div>
                      {app.department && <div><p className="text-xs text-gray-400">Department / Institute</p><p className="text-sm text-gray-900">{app.department}</p></div>}
                      <div><p className="text-xs text-gray-400">Date Submitted</p><p className="text-sm text-gray-900">{new Date(app.submittedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                      <div><p className="text-xs text-gray-400">Public Disclosure Date</p><p className="text-sm text-gray-900">{app.publicDisclosureDate ? new Date(app.publicDisclosureDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : <span className="text-gray-400">N/A</span>}</p></div>
                      <div><p className="text-xs text-gray-400">Funding Agency</p><p className="text-sm text-gray-900">{app.fundingAgency}</p></div>
                      <div><p className="text-xs text-gray-400">Contact Email</p><p className="text-sm text-gray-900">{app.contactEmail}</p></div>
                    </div>
                    {app.description && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Description</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{app.description}</p>
                      </div>
                    )}
                    {app.secondaryInventors?.length ? (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Secondary Inventors</p>
                        <div className="flex flex-wrap gap-2">
                          {app.secondaryInventors.map((n, i) => <span key={i} className="text-xs text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">{n}</span>)}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  )}

                  {/* Redownload prompt banner */}
                  {redownloadPrompt === app.id && (
                    <div className="mx-8 my-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 flex items-center gap-3">
                      <RefreshCw className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-blue-900">Redownload Prefilled Forms?</p>
                        <p className="text-xs text-blue-700 mt-0.5">Your edits have been saved. Download updated prefilled forms and resubmit with a wet signature.</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => { setPreviewFormsApp(app); setRedownloadPrompt(null); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> Preview &amp; Download
                        </button>
                        <button onClick={() => setRedownloadPrompt(null)} className="w-7 h-7 flex items-center justify-center text-blue-400 hover:text-blue-700 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center gap-2 flex-wrap">
                    <button onClick={() => setFolderApp(app)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
                      <FolderOpen className="w-3.5 h-3.5 text-[#8d1436]" /> View Folder
                    </button>

                    {/* Preview & Download forms modal */}
                    <button onClick={() => setPreviewFormsApp(app)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
                      <Eye className="w-3.5 h-3.5 text-[#8d1436]" /> Preview Forms
                    </button>

                    {/* View PAS Report — visible after Prior Art Search step is approved */}
                    {(app.ipType === 'Patent' || app.ipType === 'Utility Model') && pasReports[app.id]?.status === 'approved' && (
                      <button onClick={() => setViewPasApp(app)} className="flex items-center gap-1.5 px-3 py-2 bg-green-50 border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium">
                        <ClipboardList className="w-3.5 h-3.5" /> View PAS Report
                      </button>
                    )}

                    {/* One-time Edit — locked permanently once a handler is assigned */}
                    {app.handler ? (
                      <span title="Edit is disabled once a case handler is assigned" className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-400 rounded-lg text-xs font-medium cursor-not-allowed select-none">
                        <Lock className="w-3.5 h-3.5" /> Locked — Handler Assigned
                      </span>
                    ) : app.editUsed ? (
                      <span className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-400 rounded-lg text-xs font-medium cursor-not-allowed">
                        <Pencil className="w-3.5 h-3.5" /> Edit (Used)
                      </span>
                    ) : (
                      <button onClick={() => openEdit(app)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#8d1436] text-[#8d1436] rounded-lg hover:bg-[#fdf0f3] transition-colors text-xs font-medium">
                        <Pencil className="w-3.5 h-3.5" /> Edit Application
                      </button>
                    )}

                    <button
                      onClick={() => setRrSidebarApp(app)}
                      disabled={(app.responseRequests ?? []).length === 0}
                      className={`relative flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium transition-colors ${
                        (app.responseRequests ?? []).length === 0
                          ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                          : hasOpenRR
                            ? 'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Response Threads
                      {hasOpenRR && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">{activeRRs.length}</span>}
                    </button>
                    {!hasOpenRR && (app.responseRequests ?? []).some(r => r.status === 'closed') && (
                      <span className="flex items-center gap-1.5 text-xs text-green-700 font-medium ml-1">
                        <Check className="w-3.5 h-3.5" /> All threads closed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Response Threads sidebar — threaded multi-reply */}
      {rrSidebarApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-end pointer-events-none">
          <div className="absolute inset-0 bg-black/30 pointer-events-auto" onClick={() => { setRrSidebarApp(null); setReplyingToId(null); setReplyText(''); setReplyFiles([]); }} />
          <div className="relative pointer-events-auto bg-white shadow-2xl border-l border-gray-200 h-full w-full max-w-[420px] flex flex-col">
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#8d1436]" />
                  <h2 className="text-sm font-bold text-gray-900">Response Threads</h2>
                  {(() => { const open = (rrSidebarApp.responseRequests ?? []).filter(r => r.status !== 'closed').length; return open > 0 ? <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{open} open</span> : null; })()}
                </div>
                <p className="text-[11px] text-gray-400 truncate max-w-[300px] mt-0.5">{rrSidebarApp.title}</p>
              </div>
              <button onClick={() => { setRrSidebarApp(null); setReplyingToId(null); setReplyText(''); setReplyFiles([]); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {(rrSidebarApp.responseRequests ?? []).length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No response requests for this application.</div>
              ) : (
                (rrSidebarApp.responseRequests ?? []).map(req => {
                  const isClosed = req.status === 'closed';
                  const isReplying = replyingToId === req.id;
                  const needsApplicantReply = !isClosed && ((req.thread ?? []).length === 0 || (req.thread ?? []).at(-1)?.author === 'handler');
                  return (
                    <div key={req.id} className={`rounded-xl border overflow-hidden ${isClosed ? 'border-gray-200 opacity-70' : needsApplicantReply ? 'border-orange-200' : 'border-blue-200'}`}>
                      {/* Opening message from handler */}
                      <div className={`px-3 pt-3 pb-2 ${isClosed ? 'bg-gray-50' : needsApplicantReply ? 'bg-orange-50' : 'bg-blue-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${isClosed ? 'bg-gray-200 text-gray-600' : needsApplicantReply ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                            {isClosed ? 'Closed' : needsApplicantReply ? 'Awaiting Your Response' : 'Active Thread'}
                          </span>
                          <span className="text-[10px] text-gray-400">{new Date(req.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        {/* Handler opening — left */}
                        <div className="flex items-end gap-2 mt-2">
                          <div className="w-7 h-7 rounded-full bg-[#8d1436]/15 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-[#8d1436]">CH</div>
                          <div className="flex flex-col items-start max-w-[85%]">
                            <span className="text-[10px] text-gray-400 mb-1">From {rrSidebarApp.handler ?? 'TTBDO'} · {new Date(req.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-3 py-2 text-sm leading-relaxed">{req.message}</div>
                            {req.attachmentName && (
                              <button onClick={() => setViewingFile({ name: req.attachmentName! })} className="mt-1 flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#8d1436] bg-white border border-gray-200 rounded-lg px-2 py-1 transition-colors">
                                <Paperclip className="w-3 h-3 flex-shrink-0" /><span className="truncate max-w-[130px]">{req.attachmentName}</span><Eye className="w-3 h-3 flex-shrink-0 opacity-60" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Thread replies */}
                      {(req.thread ?? []).length > 0 && (
                        <div className="px-3 pb-3 pt-1 space-y-3 bg-white">
                          {(req.thread ?? []).map(reply => {
                            if (reply.author === 'applicant') {
                              return (
                                <div key={reply.id} className="flex items-end gap-2 justify-end">
                                  <div className="flex flex-col items-end max-w-[85%]">
                                    <span className="text-[10px] text-gray-400 mb-1">You · {new Date(reply.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    <div className="bg-[#00563f] text-white rounded-2xl rounded-br-sm px-3 py-2 text-sm leading-relaxed">{reply.text}</div>
                                    {reply.attachmentName && (
                                      <button onClick={() => setViewingFile({ name: reply.attachmentName!, url: fileUrlMap[reply.attachmentName!] })} className="mt-1 flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#00563f] bg-white border border-gray-200 rounded-lg px-2 py-1 transition-colors">
                                        <Paperclip className="w-3 h-3 flex-shrink-0" /><span className="truncate max-w-[130px]">{reply.attachmentName}</span><Eye className="w-3 h-3 flex-shrink-0 opacity-60" />
                                      </button>
                                    )}
                                  </div>
                                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-green-700">Me</div>
                                </div>
                              );
                            }
                            return (
                              <div key={reply.id} className="flex items-end gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#8d1436]/15 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-[#8d1436]">CH</div>
                                <div className="flex flex-col items-start max-w-[85%]">
                                  <span className="text-[10px] text-gray-400 mb-1">{rrSidebarApp.handler ?? 'TTBDO'} · {new Date(reply.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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
                      {/* Reply input */}
                      {!isClosed && (
                        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
                          {isReplying ? (
                            <div className="space-y-1.5">
                              <textarea
                                autoFocus
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Type your reply..."
                                rows={2}
                                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none bg-white"
                                onKeyDown={e => { if (e.key === 'Escape') { setReplyingToId(null); setReplyText(''); setReplyFiles([]); } }}
                              />
                              <input ref={replyFileRef} type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) setReplyFiles([e.target.files[0]]); }} />
                              {replyFiles.length > 0 && <div className="flex items-center gap-1.5 text-[10px] text-gray-600 bg-white border border-gray-200 rounded px-2 py-1"><Paperclip className="w-3 h-3 flex-shrink-0 text-gray-400" /><span className="flex-1 truncate">{replyFiles[0].name}</span><button onClick={() => setReplyFiles([])}><X className="w-3 h-3 text-gray-400 hover:text-red-500" /></button></div>}
                              <div className="flex gap-1.5">
                                <button type="button" onClick={() => replyFileRef.current?.click()} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-400" title="Attach file"><Paperclip className="w-3 h-3" /></button>
                                <button onClick={() => { setReplyingToId(null); setReplyText(''); setReplyFiles([]); }} className="flex-1 py-1 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100">Cancel</button>
                                <button
                                  disabled={!replyText.trim()}
                                  onClick={() => confirm('Send Reply', 'Send this reply to the case handler?', () => {
                                    const replyId = `rpl-${Date.now()}`;
                                    const attachName = replyFiles[0]?.name;
                                    const prefixedAttachName = attachName ? prefixResponseFile(attachName, replyId, rrSidebarApp.id) : undefined;
                                    handleReplySubmit(rrSidebarApp.id, req.id, replyText.trim(), prefixedAttachName);
                                    const newReply: ResponseReply = { id: replyId, author: 'applicant', text: replyText.trim(), date: new Date().toISOString(), attachmentName: prefixedAttachName };
                                    setRrSidebarApp(prev => prev ? { ...prev, responseRequests: (prev.responseRequests ?? []).map(r => r.id === req.id ? { ...r, status: 'active' as const, thread: [...(r.thread ?? []), newReply] } : r) } : null);
                                    if (replyFiles[0]) { const url = URL.createObjectURL(replyFiles[0]); setFileUrlMap(prev => ({ ...prev, ...(attachName ? { [attachName]: url } : {}), ...(prefixedAttachName ? { [prefixedAttachName]: url } : {}) })); }
                                    setReplyingToId(null); setReplyText(''); setReplyFiles([]);
                                  }, { confirmLabel: 'Send Reply' })}
                                  className="flex-1 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center gap-1"
                                ><Send className="w-3 h-3" /> Send</button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setReplyingToId(req.id); setReplyText(''); setReplyFiles([]); }}
                              className={`flex items-center gap-1 text-[11px] transition-colors py-0.5 ${needsApplicantReply ? 'text-blue-600 hover:text-blue-800 font-semibold' : 'text-gray-400 hover:text-blue-600'}`}
                            >
                              <Send className="w-3 h-3" /> {needsApplicantReply ? 'Reply to this request' : 'Add to thread'}
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
              <p className="text-[11px] text-gray-400 text-center">Respond to keep your application on track. Attachments are auto-uploaded to your case folder.</p>
            </div>
          </div>
        </div>
      )}
      {viewingFile && <FileViewerModal name={viewingFile.name} url={viewingFile.url} onClose={() => setViewingFile(null)} />}
      {previewFormsApp && <PreviewFormsModal app={previewFormsApp} onClose={() => setPreviewFormsApp(null)} />}
      {viewPasApp && pasReports[viewPasApp.id] && <ApplicantPASModal report={pasReports[viewPasApp.id]} title={viewPasApp.title} onClose={() => setViewPasApp(null)} />}

      <LinkFolderModal
        isOpen={!!folderApp}
        onClose={() => setFolderApp(null)}
        item={folderApp ? { id: folderApp.id, title: folderApp.title } : null}
        onSave={() => {}}
      />

      {/* Edit application modal */}
      {editApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditApp(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-7">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit Application</h2>
                <p className="text-xs text-gray-500 mt-0.5">{editApp.id}</p>
              </div>
              <button onClick={() => setEditApp(null)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* One-time edit notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-2.5 mb-5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900">You have <strong>one edit</strong> for this application. Once saved, this edit button will be permanently disabled.</p>
            </div>

            {/* Wet signature reminder */}
            <div className="bg-[#fdf0f3] border border-[#e8b0b0] rounded-lg px-4 py-3 flex items-start gap-2.5 mb-5">
              <Printer className="w-4 h-4 text-[#8d1436] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#8d1436]">Generated forms must be <strong>printed and submitted to the TTBDO office</strong> with an original wet signature.</p>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Disclosure Details */}
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Disclosure Details</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Title</label>
                    <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Description</label>
                    <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">Contact Email</label>
                      <input type="email" value={editContactEmail} onChange={e => setEditContactEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">Funding Agency</label>
                      <input type="text" value={editFundingAgency} onChange={e => setEditFundingAgency(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventors */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Inventors / Authors</p>
                  <button type="button" onClick={() => setEditInventors(prev => [...prev, { name: '', email: '', contribution: '', royaltyShare: 0 }])} className="text-[10px] text-[#8d1436] font-bold hover:underline flex items-center gap-0.5">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {editInventors.map((inv, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold text-gray-500">{idx === 0 ? 'Primary Inventor' : `Inventor ${idx + 1}`}</p>
                        {idx > 0 && <button type="button" onClick={() => setEditInventors(prev => prev.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={inv.name} onChange={e => updateEditInventor(idx, 'name', e.target.value)} placeholder="Full Name" className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#8d1436]/30" />
                        <input type="email" value={inv.email} onChange={e => updateEditInventor(idx, 'email', e.target.value)} placeholder="Email" className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#8d1436]/30" />
                        <input type="text" value={inv.contribution} onChange={e => updateEditInventor(idx, 'contribution', e.target.value)} placeholder="Contribution" className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#8d1436]/30" />
                        <div className="flex items-center gap-1">
                          <input type="number" min="0" max="100" value={inv.royaltyShare} onChange={e => updateEditInventor(idx, 'royaltyShare', parseFloat(e.target.value) || 0)} className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#8d1436]/30" />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(() => { const total = editInventors.reduce((s, i) => s + (i.royaltyShare || 0), 0); return (
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${Math.abs(total - 100) < 0.01 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      <span>Total Royalty</span><span>{total}% {Math.abs(total - 100) < 0.01 ? '✓' : '— must equal 100%'}</span>
                    </div>
                  ); })()}
                </div>
              </div>

              {/* Public Disclosure */}
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">First IP Public Disclosure</p>
                <div className="flex gap-2 mb-2">
                  {(['yes', 'no'] as const).map(v => (
                    <button key={v} type="button" onClick={() => setEditHasPublicDisclosure(v)} className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors ${editHasPublicDisclosure === v ? 'bg-[#8d1436] text-white border-[#8d1436]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#8d1436]'}`}>
                      {v === 'yes' ? 'Yes — publicly disclosed' : 'No prior disclosure'}
                    </button>
                  ))}
                </div>
                {editHasPublicDisclosure === 'yes' && (
                  <div className="space-y-2">
                    <input type="date" value={editPublicDisclosureDate} onChange={e => setEditPublicDisclosureDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                    <textarea value={editPublicDisclosureDesc} onChange={e => setEditPublicDisclosureDesc(e.target.value)} rows={2} placeholder="Describe how and where it was disclosed..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] resize-none" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditApp(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => confirm('Save Application Edit', 'Save changes to this application? This uses your one-time edit and cannot be undone.', handleSaveEdit, { confirmLabel: 'Save Changes', variant: 'warning' })} className="flex-1 py-2.5 bg-[#8d1436] text-white rounded-xl text-sm font-bold hover:bg-[#7a1130] transition-colors">
                Save Changes
              </button>
            </div>
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
