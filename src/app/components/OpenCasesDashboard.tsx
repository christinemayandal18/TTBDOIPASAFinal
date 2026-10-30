import React, { useState } from 'react';
import { FolderOpen, MessageSquare, AlertCircle, Clock, Send, X, CalendarClock, ChevronDown, ChevronUp, ChevronRight, Check, FileText, Users } from 'lucide-react';
import AdminNav from './AdminNav';
import { LinkFolderModal } from './modals/LinkFolderModal';
import { RemarksModal, Remark } from './modals/RemarksModal';
import { ConfirmDialog } from './modals/ConfirmDialog';

interface InventorRequest {
  message: string;
  sentAt: string;
  responseDeadline: string;
  responded: boolean;
  response?: string;
}

// ─── Prosecution step definitions (from PDF) ─────────────────────────────────

type ProsecutionType = 'patent' | 'patent-to-um' | 'utility-model' | 'trademark' | 'copyright';

const PROSECUTION_STEPS: Record<ProsecutionType, { label: string; conditional?: boolean }[]> = {
  patent: [
    { label: 'Filing of Patent Application' },
    { label: 'Acknowledgement and Accordance of Filing Date' },
    { label: 'Formality Examination Report' },
    { label: 'Subsequent Formality Examination Report', conditional: true },
    { label: 'First Publication' },
    { label: 'Request for Substantive Examination Report' },
    { label: 'Substantive Examination Report' },
    { label: 'Subsequent Substantive Examination Report', conditional: true },
    { label: 'Notice of Allowance' },
    { label: 'Completion of Final Requirements' },
    { label: 'Second Publication' },
    { label: 'Issuance of Letters Patent Certificate' },
    { label: 'Payment of Annuities' },
  ],
  'patent-to-um': [
    { label: 'Filing of Patent Application' },
    { label: 'Acknowledgement and Accordance of Filing Date' },
    { label: 'Formality Examination Report' },
    { label: 'Subsequent Formality Examination Report', conditional: true },
    { label: 'First Publication' },
    { label: 'Request for Substantive Examination Report' },
    { label: 'Substantive Examination Report' },
    { label: 'Subsequent Substantive Examination Report', conditional: true },
    { label: 'Notice of Final Refusal' },
    { label: 'Request to Convert to Utility Model' },
    { label: 'Order to Grant Request' },
    { label: 'Formality Examination Report (UM)' },
    { label: 'Subsequent Formality Examination Report (UM)', conditional: true },
    { label: 'Notice of Publication' },
    { label: 'Issuance of Certificate' },
  ],
  'utility-model': [
    { label: 'Filing of Utility Model Application' },
    { label: 'Acknowledgement and Accordance of Filing Date' },
    { label: 'Formality Examination Report' },
    { label: 'Subsequent Formality Examination Report', conditional: true },
    { label: 'Notice of Publication' },
    { label: 'Issuance of Certificate' },
  ],
  trademark: [
    { label: 'Filing of Trademark Application' },
    { label: 'Acknowledgement and Accordance of Filing Date' },
    { label: 'Registrability Report' },
    { label: 'Subsequent Action', conditional: true },
    { label: 'Notice of Allowance' },
    { label: 'Issuance of Certificate' },
  ],
  copyright: [
    { label: 'Filing of Copyright Application' },
    { label: 'Claim Stub Issued' },
    { label: 'Issuance of Certificate' },
  ],
};

// ─── Pre-protection step definitions ─────────────────────────────────────────

const PRE_PROTECTION_STEPS: Record<string, { label: string }[]> = {
  patent: [
    { label: 'Disclosure Submitted' },
    { label: 'Case Handler Assigned' },
    { label: 'Prior Art Search Done' },
    { label: 'Draft Done' },
    { label: 'Endorsed to OC' },
    { label: 'Filed at IPOPHL' },
  ],
  'utility-model': [
    { label: 'Disclosure Submitted' },
    { label: 'Case Handler Assigned' },
    { label: 'Prior Art Search Done' },
    { label: 'Draft Done' },
    { label: 'Endorsed to OC' },
    { label: 'Filed at IPOPHL' },
  ],
  trademark: [
    { label: 'Disclosure Submitted' },
    { label: 'Case Handler Assigned' },
    { label: 'Endorsed to OC' },
    { label: 'Filed at IPOPHL' },
  ],
  copyright: [
    { label: 'Disclosure Submitted' },
    { label: 'Case Handler Assigned' },
    { label: 'Endorsed to OC' },
    { label: 'Filed at IPOPHL' },
  ],
};

// ─── Handler data ────────────────────────────────────────────────────────────

interface Handler {
  code: string;
  name: string;
}

const HANDLERS: Handler[] = [
  { code: 'TPN', name: 'T.P. Navarro' },
  { code: 'AMG', name: 'A.M. Garcia' },
  { code: 'SME', name: 'S.M. Estrada' },
  { code: 'NFC', name: 'N.F. Cruz' },
  { code: 'KME', name: 'K.M. Espiritu' },
];

const HANDLER_WORKLOAD: Record<string, { type: string; count: number }[]> = {
  'TPN': [{ type: 'Invention', count: 3 }, { type: 'Utility Model', count: 1 }],
  'AMG': [{ type: 'Invention', count: 2 }, { type: 'Copyright', count: 2 }],
  'SME': [{ type: 'Trademark', count: 4 }],
  'NFC': [{ type: 'Invention', count: 1 }, { type: 'Industrial Design', count: 2 }],
  'KME': [{ type: 'Copyright', count: 3 }, { type: 'Utility Model', count: 1 }],
};

const HANDLER_ACTIVE_CASES: Record<string, { type: string; cases: string[] }[]> = {
  'TPN': [
    { type: 'Invention', cases: ['Smart Irrigation System for Rice Cultivation', 'Biocontrol Agent from Indigenous Plants', 'Photovoltaic Water Pump Optimization'] },
    { type: 'Utility Model', cases: ['Modular Cassava Dehusking Machine'] },
  ],
  'AMG': [
    { type: 'Invention', cases: ['Seismic Monitoring System for PHIVOLCS', 'AI-Based Soil Analysis Tool'] },
    { type: 'Copyright', cases: ['UPLB Visual Identity System 2025', 'Philippine Endemic Species Atlas'] },
  ],
  'SME': [
    { type: 'Trademark', cases: ['UPLB Agri-Tech Brand Mark', 'UPLB Bio-Research Logo', 'CAS Wordmark Design', 'CAFS Official Seal'] },
  ],
  'NFC': [
    { type: 'Invention', cases: ['Low-Cost Water Quality Sensor for Rural Use'] },
    { type: 'Industrial Design', cases: ['Ergonomic Farm Tool Handle Set', 'Portable Post-Harvest Processing Unit'] },
  ],
  'KME': [
    { type: 'Copyright', cases: ['Educational Modules for Sustainable Agriculture', 'Field Guide to Philippine Endemic Orchids', 'Rural Extension Training Manual'] },
    { type: 'Utility Model', cases: ['Solar-Powered Grain Dryer Frame'] },
  ],
};

function getCaseHandlerColor(h: string) {
  const map: Record<string, string> = {
    TPN: 'bg-green-100 text-green-800',
    AMG: 'bg-orange-100 text-orange-800',
    SME: 'bg-blue-100 text-blue-800',
    NFC: 'bg-red-100 text-red-800',
    KME: 'bg-yellow-100 text-yellow-800',
  };
  return map[h] || 'bg-gray-100 text-gray-800';
}

// ─── OpenCase interface ───────────────────────────────────────────────────────

interface InventorShare { name: string; share: number; }
interface OpenCase {
  id: string;
  applicationNo: string;
  title: string;
  caseHandler: string;
  typeOfOfficeAction: string;
  fee: string;
  mailingDate: string;
  deadline: string;
  status: 'Assigned' | 'Extended' | 'Submitted' | 'For Pickup' | 'Closed' | 'Awaiting Inventor';
  category: 'Trademark' | 'Invention' | 'Copyright';
  prosecutionType: ProsecutionType;
  prosecutionStep: number;
  folderLink?: string;
  remarks?: Remark[];
  inventorRequest?: InventorRequest;
  // Disclosure details (for unassigned cases)
  description?: string;
  fundingSource?: string;
  inventors?: InventorShare[];
  initialPublicDisclosure?: string;
  disclosureDate?: string;
}

const mockOpenCases: OpenCase[] = [
  {
    id: '1', applicationNo: '1-2025-501234',
    title: 'Smart Irrigation System for Rice Cultivation',
    caseHandler: 'TPN', typeOfOfficeAction: 'Formality Examination Report',
    fee: 'PHP 2,500', mailingDate: '2026-04-15', deadline: '2026-07-14',
    status: 'Assigned', category: 'Invention',
    prosecutionType: 'patent', prosecutionStep: 3,
  },
  {
    id: '2', applicationNo: '4-2026-000123',
    title: 'UPLB Visual Identity System',
    caseHandler: 'AMG', typeOfOfficeAction: 'Notice of Allowance',
    fee: 'PHP 1,200', mailingDate: '2026-04-20', deadline: '2026-07-08',
    status: 'Submitted', category: 'Trademark',
    prosecutionType: 'trademark', prosecutionStep: 5,
  },
  {
    id: '3', applicationNo: '1-2025-501567',
    title: 'Biocontrol Agent from Indigenous Plants',
    caseHandler: 'TPN', typeOfOfficeAction: 'Subsequent Formality Examination Report',
    fee: '-', mailingDate: '2026-03-10', deadline: '2026-07-10',
    status: 'Extended', category: 'Invention',
    prosecutionType: 'patent', prosecutionStep: 4,
  },
  {
    id: '4', applicationNo: '4-2025-012456',
    title: 'UPLB Official Seal',
    caseHandler: 'SME', typeOfOfficeAction: 'Registrability Report',
    fee: 'PHP 800', mailingDate: '2026-04-01', deadline: '2026-07-07',
    status: 'Awaiting Inventor', category: 'Trademark',
    prosecutionType: 'trademark', prosecutionStep: 3,
    inventorRequest: {
      message: 'Please provide additional documentation for the seal design elements as requested by IPOPHL.',
      sentAt: '2026-06-30', responseDeadline: '2026-07-07', responded: false,
    }
  },
  {
    id: '5', applicationNo: '1-2024-500987',
    title: 'Coconut Waste-Based Biocomposite',
    caseHandler: 'NFC', typeOfOfficeAction: 'Notice of Publication',
    fee: '-', mailingDate: '2026-02-15', deadline: '2026-04-01',
    status: 'Closed', category: 'Invention',
    prosecutionType: 'utility-model', prosecutionStep: 5,
  },
  {
    id: '6', applicationNo: '4-2026-000456',
    title: 'CALABARZON Development Logo',
    caseHandler: 'AMG', typeOfOfficeAction: 'Issuance of Certificate',
    fee: 'PHP 1,500', mailingDate: '2026-04-25', deadline: '2026-07-12',
    status: 'For Pickup', category: 'Trademark',
    prosecutionType: 'trademark', prosecutionStep: 6,
  },
  {
    id: '7', applicationNo: '1-2025-502345',
    title: 'Automated Plant Disease Detection System',
    caseHandler: 'TPN', typeOfOfficeAction: 'Substantive Examination Report',
    fee: 'PHP 3,200', mailingDate: '2026-03-28', deadline: '2026-07-27',
    status: 'Assigned', category: 'Invention',
    prosecutionType: 'patent', prosecutionStep: 7,
  },
  {
    id: '8', applicationNo: 'CR-2026-001234',
    title: 'Educational Modules for Sustainable Agriculture',
    caseHandler: 'KME', typeOfOfficeAction: 'Claim Stub Issued',
    fee: 'PHP 500', mailingDate: '2026-05-10', deadline: '2026-07-09',
    status: 'Assigned', category: 'Copyright',
    prosecutionType: 'copyright', prosecutionStep: 2,
  },
  {
    id: '9', applicationNo: 'CR-2026-001567',
    title: 'ForCarbon: Software for Estimating Forest Carbon Stock',
    caseHandler: 'SME', typeOfOfficeAction: 'Issuance of Certificate',
    fee: '-', mailingDate: '2026-04-18', deadline: '2026-07-07',
    status: 'For Pickup', category: 'Copyright',
    prosecutionType: 'copyright', prosecutionStep: 3,
  },
  {
    id: '10', applicationNo: 'CR-2025-009876',
    title: 'Field Guide to Philippine Endemic Orchids',
    caseHandler: 'NFC', typeOfOfficeAction: 'Claim Stub Issued',
    fee: 'PHP 500', mailingDate: '2026-06-01', deadline: '2026-07-08',
    status: 'Awaiting Inventor', category: 'Copyright',
    prosecutionType: 'copyright', prosecutionStep: 2,
    inventorRequest: {
      message: 'Please submit the signed copyright declaration form and deposit copies of the work as required.',
      sentAt: '2026-07-01', responseDeadline: '2026-07-08', responded: false,
    }
  },
  {
    id: '11', applicationNo: '1-2026-503100',
    title: 'AI-Assisted Crop Disease Classifier',
    caseHandler: '', typeOfOfficeAction: 'Formality Examination Report',
    fee: 'PHP 2,500', mailingDate: '2026-09-01', deadline: '2026-11-30',
    status: 'Assigned', category: 'Invention',
    prosecutionType: 'patent', prosecutionStep: 3,
    description: 'A convolutional neural network model trained on Philippine crop disease imagery to classify bacterial, fungal, and viral infections in rice and maize with field-deployable inference on low-cost edge devices.',
    fundingSource: 'DOST-PCAARRD Competitive Research Grant',
    inventors: [
      { name: 'Dr. Liza Arceo', share: 50 },
      { name: 'Engr. Mark Santos', share: 30 },
      { name: 'Ms. Joy Reyes', share: 20 },
    ],
    initialPublicDisclosure: 'Yes — Presented at ISAAA-ASEAN Conference, March 2026',
    disclosureDate: '2026-03-15',
  },
  {
    id: '12', applicationNo: '4-2026-001800',
    title: 'UPLB College of Veterinary Medicine Brand Mark',
    caseHandler: '', typeOfOfficeAction: 'Registrability Report',
    fee: 'PHP 800', mailingDate: '2026-09-10', deadline: '2026-12-09',
    status: 'Assigned', category: 'Trademark',
    prosecutionType: 'trademark', prosecutionStep: 3,
    description: 'Official wordmark and seal design for the UPLB College of Veterinary Medicine adopted for use across official communications, signage, and academic materials.',
    fundingSource: 'University Funds (CVM Office)',
    inventors: [
      { name: 'Prof. Anna Castillo', share: 60 },
      { name: 'Mr. Ramon Lim', share: 40 },
    ],
    initialPublicDisclosure: 'No — Internal use only prior to filing',
    disclosureDate: '2026-08-20',
  },
];

// ─── Deadline helpers ─────────────────────────────────────────────────────────

function getDaysUntil(dateStr: string) {
  return Math.floor((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── 7-day countdown bar ──────────────────────────────────────────────────────

function CountdownBar({ deadline }: { deadline: string }) {
  const days = getDaysUntil(deadline);

  if (days > 7 || days < 0) return null;

  const pct = Math.max(0, Math.min(100, (days / 7) * 100));
  const barColor = days <= 2 ? '#dc2626' : days <= 4 ? '#f97316' : '#eab308';
  const bgColor = days <= 2 ? '#fee2e2' : days <= 4 ? '#ffedd5' : '#fef9c3';

  return (
    <div className="mt-1.5">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] font-bold" style={{ color: barColor }}>
          {days === 0 ? 'Due today!' : `${days}d remaining`}
        </span>
        <span className="text-[10px] text-gray-400">7-day window</span>
      </div>
      <div className="w-full h-1.5 rounded-full" style={{ background: bgColor }}>
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

// ─── Request Response Modal ───────────────────────────────────────────────────

// ─── Process Panel (Pre-Protection + Prosecution) ────────────────────────────

function ProcessPanel({ case_ }: { case_: OpenCase }) {
  const preSteps = PRE_PROTECTION_STEPS[case_.prosecutionType] || PRE_PROTECTION_STEPS['patent'];
  const prosSteps = PROSECUTION_STEPS[case_.prosecutionType];
  const totalPreSteps = preSteps.length;

  return (
    <div className="px-6 py-5 bg-gray-50 border-t border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Pre-Protection (always fully done for open cases) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Phase 1 — Pre-Protection</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-semibold">Completed</span>
          </div>
          <div className="space-y-1.5">
            {preSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#00563f] flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                </div>
                <span className="text-xs text-gray-600">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prosecution process */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Phase 2 — IPOPHL Prosecution</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-[#fdf0f3] text-[#8d1436] rounded font-semibold">In Progress</span>
          </div>
          <div className="space-y-1.5">
            {prosSteps.map((step, i) => {
              const stepNo = i + 1;
              const isDone = stepNo < case_.prosecutionStep;
              const isActive = stepNo === case_.prosecutionStep;
              const isPending = stepNo > case_.prosecutionStep;
              return (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isDone   ? 'bg-[#8d1436]' :
                    isActive ? 'border-2 border-[#8d1436] bg-white' :
                               'border-2 border-gray-200 bg-white'
                  }`}>
                    {isDone   && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#8d1436] animate-pulse" />}
                  </div>
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className={`text-xs leading-tight ${
                      isDone   ? 'text-gray-500 line-through' :
                      isActive ? 'text-[#8d1436] font-semibold' :
                                 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                    {step.conditional && (
                      <span className="text-[9px] px-1 py-0.5 bg-gray-100 text-gray-400 rounded flex-shrink-0">if applicable</span>
                    )}
                    {isActive && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#fdf0f3] text-[#8d1436] rounded font-bold flex-shrink-0">CURRENT</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-400 mt-3">
            Step {case_.prosecutionStep} of {prosSteps.length} · {Math.round((case_.prosecutionStep / prosSteps.length) * 100)}% complete
          </p>
        </div>

      </div>
    </div>
  );
}

// ─── Extend Deadline Modal ────────────────────────────────────────────────────

function ExtendModal({
  case_,
  onClose,
  onExtend,
}: {
  case_: OpenCase;
  onClose: () => void;
  onExtend: (id: string, days: number) => void;
}) {
  const [days, setDays] = useState(7);
  const [custom, setCustom] = useState('');
  const presets = [7, 14, 30, 60];
  const effectiveDays = custom !== '' ? Math.max(1, parseInt(custom) || 1) : days;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-bold text-gray-900">Extend Deadline</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[240px]">{case_.applicationNo} · {case_.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Current deadline</p>
            <p className="text-sm font-semibold text-gray-900">{formatDate(case_.deadline)}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Choose extension
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {presets.map(d => (
                <button
                  key={d}
                  onClick={() => { setDays(d); setCustom(''); }}
                  className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                    days === d && custom === ''
                      ? 'bg-[#8d1436] text-white border-[#8d1436]'
                      : 'border-gray-300 text-gray-600 hover:border-[#8d1436] hover:text-[#8d1436]'
                  }`}
                >
                  +{d}d
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">Custom days:</span>
              <input
                type="number"
                min="1"
                max="365"
                value={custom}
                onChange={e => setCustom(e.target.value)}
                placeholder="e.g. 45"
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]"
              />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg px-4 py-3 text-sm">
            <span className="text-gray-600">New deadline: </span>
            <span className="font-bold text-purple-800">
              {formatDate(addDays(case_.deadline, effectiveDays))}
            </span>
            <span className="text-gray-500 ml-1">(+{effectiveDays} days)</span>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onExtend(case_.id, effectiveDays); onClose(); }}
            className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <CalendarClock className="w-3.5 h-3.5" />
            Extend Deadline
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Request Response Modal ───────────────────────────────────────────────────

function RequestResponseModal({
  case_,
  onClose,
  onSend,
}: {
  case_: OpenCase;
  onClose: () => void;
  onSend: (id: string, message: string, extendDays: number) => void;
}) {
  const [message, setMessage] = useState('');
  const [extendDays, setExtendDays] = useState(7);
  const [confirmSend, setConfirmSend] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-bold text-gray-900">Request Inventor Response</h2>
            <p className="text-xs text-gray-500 mt-0.5">{case_.applicationNo} · {case_.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
              Message / Feedback to Inventor
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              placeholder="Describe what the inventor needs to provide or clarify..."
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
              Grant Response Extension
            </label>
            <div className="flex items-center gap-3">
              {[3, 7, 14].map(d => (
                <button
                  key={d}
                  onClick={() => setExtendDays(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    extendDays === d
                      ? 'bg-[#8d1436] text-white border-[#8d1436]'
                      : 'border-gray-300 text-gray-600 hover:border-[#8d1436] hover:text-[#8d1436]'
                  }`}
                >
                  +{d} days
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Inventor's response deadline: <span className="font-semibold text-gray-800">{formatDate(addDays(new Date().toISOString().split('T')[0], extendDays))}</span>
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { if (message.trim()) setConfirmSend(true); }}
            disabled={!message.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-[#8d1436] text-white text-sm font-medium rounded-lg hover:bg-[#731029] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            Send Request
          </button>
        </div>
      </div>
      {confirmSend && (
        <ConfirmDialog
          title="Send Request"
          message="Send this response request to the inventor? They will be notified and given the specified deadline."
          confirmLabel="Send Request"
          onConfirm={() => { onSend(case_.id, message, extendDays); setConfirmSend(false); onClose(); }}
          onCancel={() => setConfirmSend(false)}
        />
      )}
    </div>
  );
}

// ─── Assign Handler Modal ─────────────────────────────────────────────────────

function AssignHandlerModal({
  case_,
  onClose,
  onAssign,
}: {
  case_: OpenCase;
  onClose: () => void;
  onAssign: (id: string, handlerCode: string) => void;
}) {
  const [selected, setSelected] = useState(case_.caseHandler || '');
  const [expandedHandler, setExpandedHandler] = useState<string | null>(null);
  const [confirmAssign, setConfirmAssign] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {case_.caseHandler ? 'Reassign Case Handler' : 'Assign Case Handler'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[280px]">{case_.applicationNo} · {case_.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Select Handler</p>
          <div className="space-y-2">
            {HANDLERS.map(handler => {
              const workload = HANDLER_WORKLOAD[handler.code] ?? [];
              const totalCases = workload.reduce((sum, w) => sum + w.count, 0);
              const isSelected = selected === handler.code;
              const isExpanded = expandedHandler === handler.code;
              return (
                <div
                  key={handler.code}
                  className={`rounded-lg border transition-colors ${
                    isSelected ? 'border-[#8d1436] bg-[#fdf0f3]' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center px-4 py-3">
                    <button
                      className="flex-1 flex items-center justify-between text-left"
                      onClick={() => setSelected(handler.code)}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${getCaseHandlerColor(handler.code)}`}>
                          {handler.code}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{handler.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          totalCases >= 4 ? 'bg-red-100 text-red-700' :
                          totalCases >= 3 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {totalCases} case{totalCases !== 1 ? 's' : ''}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#8d1436]" />}
                      </div>
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setExpandedHandler(isExpanded ? null : handler.code); }}
                      className="ml-2 p-1 rounded hover:bg-gray-200/60 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                      title={isExpanded ? 'Hide IP types' : 'Show active IP types'}
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-3 pt-0 border-t border-gray-100">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-2">Active IP Types & Cases</p>
                      {(HANDLER_ACTIVE_CASES[handler.code] ?? []).length > 0 ? (
                        <div className="space-y-2">
                          {(HANDLER_ACTIVE_CASES[handler.code] ?? []).map(group => (
                            <div key={group.type}>
                              <p className="text-[10px] font-bold text-gray-600 mb-1">{group.type} <span className="text-gray-400 font-normal">({group.cases.length})</span></p>
                              <ul className="space-y-0.5 pl-2">
                                {group.cases.map(c => (
                                  <li key={c} className="flex items-start gap-1.5 text-[10px] text-gray-500">
                                    <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0 mt-1.5" />
                                    <span className="leading-tight">{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 italic">No active cases</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { if (selected) setConfirmAssign(true); }}
            disabled={!selected || selected === case_.caseHandler}
            className="flex items-center gap-2 px-5 py-2 bg-[#8d1436] text-white text-sm font-medium rounded-lg hover:bg-[#731029] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" />
            {case_.caseHandler ? 'Reassign Handler' : 'Assign Handler'}
          </button>
        </div>
      </div>
      {confirmAssign && (
        <ConfirmDialog
          title={case_.caseHandler ? 'Reassign Case Handler' : 'Assign Case Handler'}
          message={`${case_.caseHandler ? 'Reassign' : 'Assign'} this case to the selected handler?`}
          confirmLabel={case_.caseHandler ? 'Reassign' : 'Assign'}
          onConfirm={() => { onAssign(case_.id, selected); setConfirmAssign(false); onClose(); }}
          onCancel={() => setConfirmAssign(false)}
        />
      )}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function OpenCasesDashboard() {
  const [activeTab, setActiveTab] = useState<'Trademark' | 'Invention' | 'Copyright' | 'Unassigned'>('Invention');
  const [cases, setCases] = useState(mockOpenCases);
  const [selectedFolderApp, setSelectedFolderApp] = useState<OpenCase | null>(null);
  const [selectedRemarksApp, setSelectedRemarksApp] = useState<OpenCase | null>(null);
  const [requestResponseCase, setRequestResponseCase] = useState<OpenCase | null>(null);
  const [extendCase, setExtendCase] = useState<OpenCase | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [assigningCase, setAssigningCase] = useState<OpenCase | null>(null);
  const toggleRow = (id: string) => setExpandedRows(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const filteredCases = activeTab === 'Unassigned'
    ? cases.filter(c => !c.caseHandler)
    : cases.filter(c => c.category === activeTab);

  const handleSaveFolder = (id: string, link: string) =>
    setCases(prev => prev.map(c => c.id === id ? { ...c, folderLink: link } : c));

  const handleAddRemark = (id: string, remark: Remark) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, remarks: [...(c.remarks || []), remark] } : c));
    if (selectedRemarksApp?.id === id)
      setSelectedRemarksApp(prev => prev ? { ...prev, remarks: [...(prev.remarks || []), remark] } : null);
  };

  const handleExtend = (id: string, days: number) =>
    setCases(prev => prev.map(c =>
      c.id === id ? { ...c, deadline: addDays(c.deadline, days), status: 'Extended' as const } : c
    ));

  const handleAssign = (id: string, handlerCode: string) =>
    setCases(prev => prev.map(c => c.id === id ? { ...c, caseHandler: handlerCode } : c));

  const handleSendRequest = (id: string, message: string, extendDays: number) =>
    setCases(prev => prev.map(c =>
      c.id === id ? {
        ...c,
        status: 'Awaiting Inventor' as const,
        deadline: addDays(c.deadline, extendDays),
        inventorRequest: {
          message,
          sentAt: new Date().toISOString().split('T')[0],
          responseDeadline: addDays(new Date().toISOString().split('T')[0], extendDays),
          responded: false,
        }
      } : c
    ));

  const getDeadlineBadge = (deadline: string) => {
    const days = getDaysUntil(deadline);
    if (days < 0) return { cls: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Expired' };
    if (days <= 7) return { cls: 'bg-red-100 text-red-700 border-red-200', label: `${days}d left` };
    if (days <= 14) return { cls: 'bg-orange-100 text-orange-700 border-orange-200', label: `${days}d left` };
    return { cls: 'bg-green-100 text-green-700 border-green-200', label: `${days}d left` };
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      Assigned: 'bg-blue-100 text-blue-800',
      Extended: 'bg-purple-100 text-purple-800',
      Submitted: 'bg-green-100 text-green-800',
      'For Pickup': 'bg-yellow-100 text-yellow-800',
      Closed: 'bg-gray-100 text-gray-700',
      'Awaiting Inventor': 'bg-amber-100 text-amber-800',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <AdminNav />
      <div className="flex-1 min-w-0 max-w-[1800px] p-8">
        <div className="mb-8">
          <h1 className="mb-2">Open Cases Dashboard</h1>
          <p className="text-gray-600">IPOPHL monitoring and office action tracking</p>
        </div>

        {/* Tab bar */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-6">
            {(['Copyright', 'Trademark', 'Invention'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-2 border-b-2 transition-colors text-sm font-medium ${
                  activeTab === tab
                    ? 'border-[#8d1436] text-[#8d1436]'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab}s
              </button>
            ))}
            <button
              onClick={() => setActiveTab('Unassigned')}
              className={`pb-3 px-2 border-b-2 transition-colors text-sm font-medium flex items-center gap-1.5 ${
                activeTab === 'Unassigned'
                  ? 'border-[#8d1436] text-[#8d1436]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Unassigned
              {cases.filter(c => !c.caseHandler).length > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'Unassigned' ? 'bg-[#8d1436] text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {cases.filter(c => !c.caseHandler).length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {(activeTab === 'Unassigned'
                    ? ['Application No.', 'Title', 'Category', 'Disclosed By', 'Funding Source', 'Deadline', 'Actions']
                    : ['Application / Paper No.', 'Title', 'Handler', 'Type of Office Action', 'Fee', 'Mailing Date', 'Deadline', 'Status', 'Actions']
                  ).map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredCases.map(case_ => {
                  const badge = getDeadlineBadge(case_.deadline);
                  const daysLeft = getDaysUntil(case_.deadline);
                  const isActive = !['Closed', 'Submitted'].includes(case_.status);

                  return (
                    <React.Fragment key={case_.id}>
                      <tr
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${case_.status === 'Awaiting Inventor' ? 'bg-amber-50/40' : ''} ${expandedRows.has(case_.id) ? 'bg-[#fdf0f3]/30' : ''}`}
                      onClick={() => toggleRow(case_.id)}
                    >
                        {activeTab === 'Unassigned' ? (
                          <>
                            <td className="px-4 py-3 text-xs font-medium text-gray-900 whitespace-nowrap">{case_.applicationNo}</td>
                            <td className="px-4 py-3 text-xs text-gray-900 max-w-[220px]">
                              <p className="font-medium leading-snug">{case_.title}</p>
                              {case_.description && <p className="text-gray-400 mt-0.5 line-clamp-1">{case_.description}</p>}
                            </td>
                            <td className="px-4 py-3 text-xs whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">{case_.category}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-700 max-w-[160px]">
                              {case_.inventors?.map(inv => inv.name).join(', ') ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-700 max-w-[160px]">{case_.fundingSource ?? '—'}</td>
                            <td className="px-4 py-3 whitespace-nowrap min-w-[130px]">
                              <div className="text-xs text-gray-900 font-medium mb-0.5">{formatDate(case_.deadline)}</div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badge.cls}`}>
                                {daysLeft <= 7 && daysLeft >= 0 && <AlertCircle className="w-3 h-3" />}
                                {badge.label}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-xs font-medium text-gray-900 whitespace-nowrap">{case_.applicationNo}</td>
                            <td className="px-4 py-3 text-xs text-gray-900 max-w-[200px]">{case_.title}</td>
                            <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                              {case_.caseHandler ? (
                                <button onClick={() => setAssigningCase(case_)} title="Reassign handler" className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold transition-opacity hover:opacity-75 ${getCaseHandlerColor(case_.caseHandler)}`}>{case_.caseHandler}</button>
                              ) : (
                                <button onClick={() => setAssigningCase(case_)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-dashed border-gray-300 text-gray-400 hover:border-[#8d1436] hover:text-[#8d1436] transition-colors">+ Assign</button>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-700 max-w-[160px]">{case_.typeOfOfficeAction}</td>
                            <td className="px-4 py-3 text-xs text-gray-900 whitespace-nowrap">{case_.fee}</td>
                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{formatDate(case_.mailingDate)}</td>
                            <td className="px-4 py-3 whitespace-nowrap min-w-[160px]">
                              <div className="text-xs text-gray-900 font-medium mb-0.5">{formatDate(case_.deadline)}</div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badge.cls}`}>
                                {daysLeft <= 7 && daysLeft >= 0 && <AlertCircle className="w-3 h-3" />}
                                {daysLeft > 7 && daysLeft <= 14 && <Clock className="w-3 h-3" />}
                                {badge.label}
                              </span>
                              {daysLeft >= 0 && daysLeft <= 7 && isActive && <CountdownBar deadline={case_.deadline} />}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>{case_.status}</span>
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleRow(case_.id)}
                              title={activeTab === 'Unassigned' ? 'View disclosure details' : 'View process'}
                              className={`p-1.5 rounded transition-colors ${expandedRows.has(case_.id) ? 'text-[#8d1436] bg-[#fdf0f3]' : 'text-gray-400 hover:bg-gray-100'}`}
                            >
                              {expandedRows.has(case_.id) ? <ChevronUp className="w-4 h-4" /> : (activeTab === 'Unassigned' ? <FileText className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                            </button>
                            {activeTab === 'Unassigned' && (
                              <button
                                onClick={() => setAssigningCase(case_)}
                                title="Assign handler"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border border-dashed border-[#8d1436] text-[#8d1436] hover:bg-[#fdf0f3] transition-colors"
                              >
                                <Users className="w-3 h-3" /> Assign
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedFolderApp(case_)}
                              title={case_.folderLink ? 'Open Folder' : 'Link Folder'}
                              className={`p-1.5 rounded transition-colors ${case_.folderLink ? 'text-[#8d1436] hover:bg-[#fdf0f3]' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                              <FolderOpen className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedRemarksApp(case_)}
                              title={case_.remarks?.length ? `Remarks (${case_.remarks.length})` : 'Add Remarks'}
                              className={`p-1.5 rounded transition-colors ${case_.remarks?.length ? 'text-[#8d1436] hover:bg-[#fdf0f3]' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            {isActive && (
                              <>
                                <button
                                  onClick={() => setExtendCase(case_)}
                                  title="Extend deadline"
                                  className="p-1.5 rounded transition-colors text-purple-600 hover:bg-purple-50"
                                >
                                  <CalendarClock className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setRequestResponseCase(case_)}
                                  title="Request inventor response"
                                  className="p-1.5 rounded transition-colors text-amber-600 hover:bg-amber-50"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Prosecution process panel */}
                      {expandedRows.has(case_.id) && (
                        <tr key={`${case_.id}-process`}>
                          <td colSpan={activeTab === 'Unassigned' ? 7 : 9} className="p-0">
                            {activeTab === 'Unassigned' ? (
                              <div className="bg-[#fdf8f9] border-t border-[#f0d4db] px-6 py-5">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2"><FileText className="w-4 h-4 text-[#8d1436]" /> Full Disclosure Details</h4>
                                  <span className="text-[10px] text-gray-400 font-medium">Submitted {case_.disclosureDate ? formatDate(case_.disclosureDate) : '—'}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                  <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Title</p>
                                    <p className="text-sm font-medium text-gray-900">{case_.title}</p>
                                  </div>
                                  <div className="sm:col-span-2 lg:col-span-2">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
                                    <p className="text-sm text-gray-700 leading-relaxed">{case_.description || <span className="italic text-gray-400">Not provided</span>}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Funding Source</p>
                                    <p className="text-sm text-gray-700">{case_.fundingSource ?? '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Initial Public Disclosure</p>
                                    <p className="text-sm text-gray-700">{case_.initialPublicDisclosure ?? '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">IP Type</p>
                                    <span className="inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{case_.category}</span>
                                  </div>
                                  {case_.inventors && case_.inventors.length > 0 && (
                                    <div className="sm:col-span-2 lg:col-span-3">
                                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Inventors / Authors & Shares</p>
                                      <div className="flex flex-wrap gap-2">
                                        {case_.inventors.map((inv, i) => (
                                          <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                                            <span className="text-xs font-medium text-gray-900">{inv.name}</span>
                                            <span className="text-[10px] font-bold text-[#8d1436] bg-[#fdf0f3] px-1.5 py-0.5 rounded-full">{inv.share}%</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <ProcessPanel case_={case_} />
                            )}
                          </td>
                        </tr>
                      )}

                      {/* Inventor request info row */}
                      {case_.inventorRequest && (
                        <tr key={`${case_.id}-req`} className="bg-amber-50/60">
                          <td colSpan={9} className="px-6 py-3">
                            <div className="flex items-start gap-3">
                              <div className="w-1 self-stretch rounded-full bg-amber-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-semibold text-amber-800">Inventor Response Requested</span>
                                  <span className="text-[10px] text-amber-600">· Sent {formatDate(case_.inventorRequest.sentAt)}</span>
                                  <span className="text-[10px] text-amber-600">· Response due {formatDate(case_.inventorRequest.responseDeadline)}</span>
                                  {case_.inventorRequest.responded
                                    ? <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">Responded</span>
                                    : <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Pending</span>
                                  }
                                </div>
                                <p className="text-xs text-gray-700">{case_.inventorRequest.message}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredCases.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-gray-500">{activeTab === 'Unassigned' ? 'All cases have been assigned a handler.' : 'No open cases found for this category.'}</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {filteredCases.length} {activeTab === 'Unassigned' ? 'unassigned' : `open ${activeTab.toLowerCase()}`} case{filteredCases.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5 text-purple-500" /> Extend +7 days</span>
            <span className="flex items-center gap-1.5"><Send className="w-3.5 h-3.5 text-amber-500" /> Request inventor response</span>
          </div>
        </div>
      </div>

      <LinkFolderModal
        isOpen={!!selectedFolderApp}
        onClose={() => setSelectedFolderApp(null)}
        item={selectedFolderApp}
        onSave={handleSaveFolder}
      />
      <RemarksModal
        isOpen={!!selectedRemarksApp}
        onClose={() => setSelectedRemarksApp(null)}
        item={selectedRemarksApp}
        onAddRemark={handleAddRemark}
      />
      {extendCase && (
        <ExtendModal
          case_={extendCase}
          onClose={() => setExtendCase(null)}
          onExtend={handleExtend}
        />
      )}
      {requestResponseCase && (
        <RequestResponseModal
          case_={requestResponseCase}
          onClose={() => setRequestResponseCase(null)}
          onSend={handleSendRequest}
        />
      )}
      {assigningCase && (
        <AssignHandlerModal
          case_={assigningCase}
          onClose={() => setAssigningCase(null)}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
}
