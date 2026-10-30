import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, UserCheck, UserX, Mail, Clock, AlertCircle, Eye, X, ExternalLink, Shield, ShieldOff, Calendar } from 'lucide-react';
import AdminNav from './AdminNav';
import { toast } from 'sonner';

type AccountStatus = 'active' | 'pending' | 'disabled';

interface CaseHandler {
  id: string; name: string; email: string; position: string;
  activeCases: number; completedCases: number; status: AccountStatus; joinedDate: string;
}

interface HandlerCase { id: string; title: string; stage: 'pre-protection' | 'prosecution'; ipType: string; }

const HANDLER_CASES: Record<string, HandlerCase[]> = {
  'Ana Reyes': [
    { id: 'PRE-2026-001', title: 'Smart Irrigation System Using IoT Sensors', stage: 'pre-protection', ipType: 'Patent' },
    { id: 'PRO-2025-011', title: 'Biochar Production from Rice Husk', stage: 'prosecution', ipType: 'Patent' },
    { id: 'PRE-2026-002', title: 'UPLB Visual Identity System 2026', stage: 'pre-protection', ipType: 'Trademark' },
  ],
  'Nathan Felipe Cruz': [
    { id: 'PRE-2026-004', title: 'Bio-based Edible Coating for Tropical Fruits', stage: 'pre-protection', ipType: 'Patent' },
    { id: 'PRO-2025-007', title: 'Banana Fiber Composite Panel', stage: 'prosecution', ipType: 'Utility Model' },
  ],
  'Samuel Mendoza': [
    { id: 'PRE-2026-005', title: 'Modular Cassava Dehusking Machine', stage: 'pre-protection', ipType: 'Industrial Design' },
    { id: 'PRE-2026-009', title: 'ForCarbon: Software for Estimating Forest Carbon Stock', stage: 'pre-protection', ipType: 'Copyright' },
    { id: 'PRO-2025-003', title: 'Hybrid Solar Dryer System', stage: 'prosecution', ipType: 'Utility Model' },
    { id: 'PRO-2025-014', title: 'Tilapia Feed Supplement Formula', stage: 'prosecution', ipType: 'Patent' },
  ],
  'Maria Santos': [
    { id: 'PRE-2026-002', title: 'UPLB Visual Identity System 2026', stage: 'pre-protection', ipType: 'Trademark' },
  ],
  'Katrina Mercado': [
    { id: 'PRE-2026-010', title: 'Solar-Powered Grain Drying System', stage: 'pre-protection', ipType: 'Utility Model' },
    { id: 'PRE-2026-006', title: "Oble's Harvest (University Farm Products)", stage: 'pre-protection', ipType: 'Trademark' },
  ],
  'Anna Maria Garcia': [
    { id: 'PRE-2026-007', title: 'Makiling Brew Specialty Coffee', stage: 'pre-protection', ipType: 'Trademark' },
    { id: 'PRO-2025-009', title: 'Organic Pesticide from Marigold Extract', stage: 'prosecution', ipType: 'Patent' },
  ],
  'Carlos Mendoza': [
    { id: 'PRE-2026-003', title: 'Educational Modules for Sustainable Agriculture', stage: 'pre-protection', ipType: 'Copyright' },
  ],
  'Tristan Perez-Navarro': [
    { id: 'PRE-2026-008', title: 'Field Guide to Philippine Endemic Orchids', stage: 'pre-protection', ipType: 'Copyright' },
    { id: 'PRO-2025-002', title: 'Mangrove Seedling Propagation Method', stage: 'prosecution', ipType: 'Patent' },
    { id: 'PRO-2025-018', title: 'Calamansi Extract Wound Gel', stage: 'prosecution', ipType: 'Patent' },
  ],
};

const mockHandlers: CaseHandler[] = [
  { id: 'CH-001', name: 'Ana Reyes', email: 'areyes.ttbdo@up.edu.ph', position: 'Senior Case Handler', activeCases: 3, completedCases: 12, status: 'active', joinedDate: '2022-06-01' },
  { id: 'CH-002', name: 'Nathan Felipe Cruz', email: 'nfcruz.ttbdo@up.edu.ph', position: 'Case Handler', activeCases: 2, completedCases: 8, status: 'active', joinedDate: '2023-01-15' },
  { id: 'CH-003', name: 'Samuel Mendoza', email: 'smendoza.ttbdo@up.edu.ph', position: 'Senior Case Handler', activeCases: 4, completedCases: 19, status: 'active', joinedDate: '2021-08-01' },
  { id: 'CH-004', name: 'Maria Santos', email: 'msantos.ttbdo@up.edu.ph', position: 'Case Handler', activeCases: 1, completedCases: 6, status: 'active', joinedDate: '2024-03-01' },
  { id: 'CH-005', name: 'Katrina Mercado', email: 'kmercado.ttbdo@up.edu.ph', position: 'Case Handler', activeCases: 2, completedCases: 9, status: 'active', joinedDate: '2023-07-20' },
  { id: 'CH-006', name: 'Anna Maria Garcia', email: 'amgarcia.ttbdo@up.edu.ph', position: 'Case Handler', activeCases: 2, completedCases: 11, status: 'active', joinedDate: '2022-11-10' },
  { id: 'CH-007', name: 'Carlos Mendoza', email: 'cmendoza.ttbdo@up.edu.ph', position: 'Case Handler', activeCases: 1, completedCases: 4, status: 'active', joinedDate: '2024-06-01' },
  { id: 'CH-008', name: 'Tristan Perez-Navarro', email: 'tpnavarro.ttbdo@up.edu.ph', position: 'Case Handler', activeCases: 3, completedCases: 7, status: 'active', joinedDate: '2023-09-05' },
  { id: 'CH-009', name: 'Diego Lim', email: 'dlim.ttbdo@up.edu.ph', position: 'Case Handler', activeCases: 0, completedCases: 5, status: 'disabled', joinedDate: '2022-02-14' },
  { id: 'CH-010', name: 'Sophia Dela Paz', email: 'sdelapaz.ttbdo@up.edu.ph', position: 'Case Handler', activeCases: 0, completedCases: 0, status: 'pending', joinedDate: '2026-07-05' },
  { id: 'CH-011', name: 'Miguel Torres', email: 'mftorres.ttbdo@up.edu.ph', position: 'Case Handler', activeCases: 0, completedCases: 0, status: 'pending', joinedDate: '2026-07-07' },
];

const STATUS_CHIP: Record<AccountStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  active:   { label: 'Active',           cls: 'bg-green-100 text-green-800',  icon: <UserCheck className="w-3 h-3" /> },
  pending:  { label: 'Pending Approval', cls: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" /> },
  disabled: { label: 'Disabled',         cls: 'bg-gray-100 text-gray-500',    icon: <UserX className="w-3 h-3" /> },
};

const IP_TYPE_COLOR: Record<string, string> = {
  Patent: 'bg-blue-100 text-blue-800', 'Utility Model': 'bg-purple-100 text-purple-800',
  'Industrial Design': 'bg-indigo-100 text-indigo-800', Trademark: 'bg-green-100 text-green-800', Copyright: 'bg-yellow-100 text-yellow-800',
};

type Action = { handler: CaseHandler; action: 'approve' | 'reject' | 'disable' | 'enable' };

interface OICInfo { name: string; start: string; end: string; }
function loadOIC(): OICInfo | null {
  try {
    const name = localStorage.getItem('ipasa_oic_handler') || '';
    const start = localStorage.getItem('ipasa_oic_start') || '';
    const end = localStorage.getItem('ipasa_oic_end') || '';
    return name ? { name, start, end } : null;
  } catch { return null; }
}
function saveOIC(info: OICInfo | null) {
  try {
    if (info) {
      localStorage.setItem('ipasa_oic_handler', info.name);
      localStorage.setItem('ipasa_oic_start', info.start);
      localStorage.setItem('ipasa_oic_end', info.end);
    } else {
      localStorage.removeItem('ipasa_oic_handler');
      localStorage.removeItem('ipasa_oic_start');
      localStorage.removeItem('ipasa_oic_end');
    }
  } catch {}
}

function ViewCasesPanel({ handler, onClose }: { handler: CaseHandler; onClose: () => void }) {
  const navigate = useNavigate();
  const cases = HANDLER_CASES[handler.name] ?? [];
  const preProtection = cases.filter(c => c.stage === 'pre-protection');
  const prosecution = cases.filter(c => c.stage === 'prosecution');

  const goToFiltered = (stage: 'pre-protection' | 'prosecution') => {
    const path = stage === 'pre-protection' ? '/admin/pre-protection' : '/admin/prosecution';
    navigate(`${path}?handler=${encodeURIComponent(handler.name)}`);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#8d1436] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {handler.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{handler.name}</p>
              <p className="text-xs text-gray-500">{handler.position}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Pre-Protection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pre-Protection ({preProtection.length})</h3>
              {preProtection.length > 0 && (
                <button onClick={() => goToFiltered('pre-protection')} className="flex items-center gap-1 text-xs text-[#8d1436] font-semibold hover:underline">
                  View all <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
            {preProtection.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No pre-protection cases.</p>
            ) : (
              <div className="space-y-2">
                {preProtection.map(c => (
                  <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#8d1436] font-semibold">{c.id}</p>
                      <p className="text-sm font-medium text-gray-900 leading-snug">{c.title}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${IP_TYPE_COLOR[c.ipType] ?? 'bg-gray-100 text-gray-700'}`}>{c.ipType}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prosecution */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Prosecution ({prosecution.length})</h3>
              {prosecution.length > 0 && (
                <button onClick={() => goToFiltered('prosecution')} className="flex items-center gap-1 text-xs text-[#8d1436] font-semibold hover:underline">
                  View all <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
            {prosecution.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No prosecution cases.</p>
            ) : (
              <div className="space-y-2">
                {prosecution.map(c => (
                  <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#8d1436] font-semibold">{c.id}</p>
                      <p className="text-sm font-medium text-gray-900 leading-snug">{c.title}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${IP_TYPE_COLOR[c.ipType] ?? 'bg-gray-100 text-gray-700'}`}>{c.ipType}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => goToFiltered('pre-protection')} className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold border border-[#8d1436] text-[#8d1436] rounded-lg hover:bg-[#fdf0f3] transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Pre-Protection
            </button>
            <button onClick={() => goToFiltered('prosecution')} className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold border border-[#8d1436] text-[#8d1436] rounded-lg hover:bg-[#fdf0f3] transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Prosecution
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// OIC Assignment modal
function OICDurationModal({ handlerName, onConfirm, onCancel }: {
  handlerName: string;
  onConfirm: (start: string, end: string) => void;
  onCancel: () => void;
}) {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const defaultStart = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState('');
  const valid = start && end && new Date(end) > new Date(start);
  const fmt = (s: string) => s ? new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#fdf0f3] mx-auto mb-4">
          <Shield className="w-6 h-6 text-[#8d1436]" />
        </div>
        <h2 className="text-base font-bold text-gray-900 text-center mb-1">Designate OIC</h2>
        <p className="text-sm text-gray-500 text-center mb-5">Set the duration of temporary admin authority for <span className="font-semibold text-gray-800">{handlerName}</span>.</p>
        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Start Date &amp; Time</label>
            <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">End Date &amp; Time</label>
            <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} min={start}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
          </div>
        </div>
        {valid && (
          <div className="mb-4 bg-[#fdf0f3] border border-[#8d1436]/20 rounded-lg px-4 py-2.5 text-xs text-gray-700">
            <p className="font-semibold text-[#8d1436] mb-1">Confirm OIC Assignment</p>
            <p>Designate <span className="font-bold">{handlerName}</span> as Officer in Charge from <span className="font-medium">{fmt(start)}</span> until <span className="font-medium">{fmt(end)}</span>?</p>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => valid && onConfirm(start, end)} disabled={!valid}
            className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors ${valid ? 'bg-[#8d1436] hover:bg-[#7a1130]' : 'bg-gray-300 cursor-not-allowed'}`}>
            Confirm OIC
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CaseHandlersPage() {
  const [handlers, setHandlers] = useState(mockHandlers);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | AccountStatus>('All');
  const [pending, setPending] = useState<Action | null>(null);
  const [viewCasesHandler, setViewCasesHandler] = useState<CaseHandler | null>(null);
  const [oicInfo, setOicInfo] = useState<OICInfo | null>(() => loadOIC());
  const [oicModalHandler, setOicModalHandler] = useState<CaseHandler | null>(null);
  const [removeOicConfirm, setRemoveOicConfirm] = useState(false);
  const oicName = oicInfo?.name ?? '';
  const isOICAdmin = (() => { try { return localStorage.getItem('ipasa_user_type') === 'oic'; } catch { return false; } })();

  const confirmDesignateOIC = (name: string, start: string, end: string) => {
    const info: OICInfo = { name, start, end };
    setOicInfo(info);
    saveOIC(info);
    setOicModalHandler(null);
    toast.success(`${name} designated as OIC until ${new Date(end).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}.`);
  };

  const handleRemoveOIC = () => {
    const name = oicName;
    setOicInfo(null);
    saveOIC(null);
    setRemoveOicConfirm(false);
    toast.info(`OIC designation removed for ${name}.`);
  };

  const filtered = handlers.filter(h => {
    const matchSearch = !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || h.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = { active: handlers.filter(h => h.status === 'active').length, pending: handlers.filter(h => h.status === 'pending').length, disabled: handlers.filter(h => h.status === 'disabled').length };

  const doAction = () => {
    if (!pending) return;
    const { handler, action } = pending;
    const newStatus: AccountStatus = action === 'approve' ? 'active' : action === 'reject' ? 'disabled' : action === 'disable' ? 'disabled' : 'active';
    setHandlers(prev => prev.map(h => h.id === handler.id ? { ...h, status: newStatus } : h));
    if (action === 'approve') toast.success(`Account activated for ${handler.name}. A notification email has been sent.`);
    else if (action === 'reject') toast.info(`Account request rejected for ${handler.name}.`);
    else if (action === 'disable') toast.info(`Account disabled for ${handler.name}.`);
    else toast.success(`Account re-enabled for ${handler.name}.`);
    setPending(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <AdminNav />
      <div className="flex-1 min-w-0 max-w-[1600px] p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Case Handlers</h1>
          <p className="text-gray-600 text-sm">Manage case handler accounts — approve new registrations and enable or disable access</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Handlers</p>
            <p className="text-3xl font-bold text-gray-900">{handlers.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Active</p>
            <p className="text-3xl font-bold text-[#00563f]">{counts.active}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 border-l-4 border-l-yellow-400">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pending Approval</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-yellow-700">{counts.pending}</p>
              {counts.pending > 0 && <AlertCircle className="w-5 h-5 text-yellow-500" />}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Disabled</p>
            <p className="text-3xl font-bold text-gray-400">{counts.disabled}</p>
          </div>
        </div>

        {/* Pending activation banner */}
        {counts.pending > 0 && (
          <div className="mb-5 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3.5 flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">{counts.pending} new account{counts.pending > 1 ? 's' : ''}</span> awaiting admin activation. New case handlers cannot log in until their account is approved.
            </p>
            <button onClick={() => setFilterStatus('pending')} className="ml-auto px-3 py-1.5 text-xs font-semibold bg-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-300 transition-colors flex-shrink-0">
              Review
            </button>
          </div>
        )}

        {/* Search + filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-5 p-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] text-sm" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm">
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending Approval</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        {/* OIC banner */}
        {isOICAdmin ? (
          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-800"><span className="font-semibold">You are currently acting as OIC (Temporary Admin).</span> OIC delegation is restricted to the Main Admin only. You may view handler accounts but cannot assign or remove OIC status.</p>
          </div>
        ) : oicInfo ? (
          <div className="mb-5 bg-[#fdf0f3] border border-[#8d1436]/20 rounded-xl px-5 py-3.5 flex items-center gap-3 flex-wrap">
            <Shield className="w-5 h-5 text-[#8d1436] flex-shrink-0" />
            <div className="flex-1 min-w-[200px]">
              <p className="text-sm text-gray-800"><span className="font-bold text-[#8d1436]">{oicInfo.name}</span> is currently designated as Officer in Charge (OIC / Temporary Admin).</p>
              {oicInfo.start && oicInfo.end && (
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Valid from <span className="font-medium text-gray-700">{new Date(oicInfo.start).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                  {' '}until <span className="font-medium text-gray-700">{new Date(oicInfo.end).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                </p>
              )}
            </div>
            <button onClick={() => setRemoveOicConfirm(true)} className="ml-auto px-3 py-1.5 text-xs font-semibold text-[#8d1436] border border-[#8d1436]/30 bg-white rounded-lg hover:bg-[#fdf0f3] transition-colors flex-shrink-0 flex items-center gap-1.5">
              <ShieldOff className="w-3.5 h-3.5" /> Remove OIC
            </button>
          </div>
        ) : (
          <div className="mb-5 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-500">No OIC designated. Use the <span className="font-semibold">Designate OIC</span> button on any active case handler to assign temporary admin access.</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Cases</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Joined</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(handler => {
                  const chip = STATUS_CHIP[handler.status];
                  const hasCases = handler.status === 'active' && handler.activeCases > 0;
                  const isThisOIC = oicName === handler.name;
                  return (
                    <tr key={handler.id} className={`hover:bg-gray-50 transition-colors ${handler.status === 'disabled' ? 'opacity-60' : ''} ${handler.status === 'pending' ? 'bg-yellow-50/40' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${handler.status === 'active' ? 'bg-[#8d1436]' : handler.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                            {handler.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">{handler.name}</span>
                            {isThisOIC && <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#fdf0f3] text-[#8d1436] border border-[#8d1436]/20"><Shield className="w-2.5 h-2.5" /> OIC</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> {handler.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{handler.position}</td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">{handler.activeCases}</td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-[#00563f]">{handler.completedCases}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(handler.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${chip.cls}`}>
                          {chip.icon} {chip.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {hasCases && (
                            <button onClick={() => setViewCasesHandler(handler)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[#8d1436]/30 text-[#8d1436] hover:bg-[#fdf0f3] transition-colors">
                              <Eye className="w-3.5 h-3.5" /> Cases
                            </button>
                          )}
                          {handler.status === 'pending' && (<>
                            <button onClick={() => setPending({ handler, action: 'approve' })} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-green-300 text-green-700 hover:bg-green-50 transition-colors">Approve</button>
                            <button onClick={() => setPending({ handler, action: 'reject' })} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors">Reject</button>
                          </>)}
                          {handler.status === 'active' && !isOICAdmin && (
                            <button
                              onClick={() => isThisOIC ? setRemoveOicConfirm(true) : setOicModalHandler(handler)}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${isThisOIC ? 'border-[#8d1436]/30 text-[#8d1436] bg-[#fdf0f3] hover:bg-[#f8d9e0]' : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-[#8d1436]/30 hover:text-[#8d1436]'}`}
                              title={isThisOIC ? 'Remove OIC designation' : 'Designate as OIC / Temp Admin'}>
                              {isThisOIC ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                              {isThisOIC ? 'Remove OIC' : 'OIC'}
                            </button>
                          )}
                          {handler.status === 'active' && (
                            <button onClick={() => setPending({ handler, action: 'disable' })} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors">Disable</button>
                          )}
                          {handler.status === 'disabled' && (
                            <button onClick={() => setPending({ handler, action: 'enable' })} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-green-200 text-green-700 hover:bg-green-50 transition-colors">Enable</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-12"><p className="text-gray-500 text-sm">No case handlers found.</p></div>}
        </div>
      </div>

      {viewCasesHandler && <ViewCasesPanel handler={viewCasesHandler} onClose={() => setViewCasesHandler(null)} />}

      {oicModalHandler && (
        <OICDurationModal
          handlerName={oicModalHandler.name}
          onConfirm={(start, end) => confirmDesignateOIC(oicModalHandler.name, start, end)}
          onCancel={() => setOicModalHandler(null)}
        />
      )}

      {removeOicConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRemoveOicConfirm(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
              <ShieldOff className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-base font-bold text-gray-900 text-center mb-2">Remove OIC Status</h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Confirm removal of OIC status for <span className="font-semibold">{oicName}</span>? Their temporary admin access will be revoked immediately.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRemoveOicConfirm(false)} className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleRemoveOIC} className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors">Remove OIC</button>
            </div>
          </div>
        </div>
      )}

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPending(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${pending.action === 'approve' || pending.action === 'enable' ? 'bg-green-100' : 'bg-red-50'}`}>
              {pending.action === 'approve' || pending.action === 'enable' ? <UserCheck className="w-6 h-6 text-green-600" /> : <UserX className="w-6 h-6 text-red-500" />}
            </div>
            <h2 className="text-base font-bold text-gray-900 text-center mb-2 capitalize">{pending.action === 'approve' ? 'Activate Account' : pending.action === 'reject' ? 'Reject Registration' : pending.action === 'disable' ? 'Disable Account' : 'Enable Account'}</h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              {pending.action === 'approve' && `Activate ${pending.handler.name}'s account? They will be notified by email and can log in immediately.`}
              {pending.action === 'reject' && `Reject the registration request from ${pending.handler.name}? Their account will be disabled.`}
              {pending.action === 'disable' && `Disable ${pending.handler.name}'s account? They will no longer be able to log in.`}
              {pending.action === 'enable' && `Re-enable access for ${pending.handler.name}?`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setPending(null)} className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={doAction} className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors ${pending.action === 'approve' || pending.action === 'enable' ? 'bg-[#00563f] hover:bg-[#004a35]' : 'bg-red-600 hover:bg-red-700'}`}>
                {pending.action === 'approve' ? 'Activate' : pending.action === 'reject' ? 'Reject' : pending.action === 'disable' ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
