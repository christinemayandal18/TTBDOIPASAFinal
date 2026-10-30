import { useState } from 'react';
import { Search, Filter, Trophy, Calendar, FolderOpen, MessageSquare, LayoutGrid, LayoutList, ChevronDown, ChevronUp } from 'lucide-react';
import CaseHandlerNav from '../CaseHandlerNav';
import { LinkFolderModal } from '../modals/LinkFolderModal';
import { UnifiedRemarksModal, UnifiedRemark, UnifiedRemarkReply } from '../modals/UnifiedRemarksModal';

interface AttachedFile { name: string; size: number; uploadedAt: string; folder: 'attached files'; }

interface CompletedCase {
  id: string;
  applicationNo: string;
  title: string;
  description: string;
  ipType: 'Patent' | 'Utility Model' | 'Industrial Design' | 'Trademark' | 'Copyright';
  inventorName: string;
  college: string;
  department: string;
  completedDate: string;
  outcome: string;
  folderLink?: string;
  attachedFiles?: AttachedFile[];
  unifiedRemarks?: UnifiedRemark[];
  secondaryInventors?: string[];
}

const TYPE_BADGE: Record<string, string> = {
  Patent: 'bg-blue-100 text-blue-800', 'Utility Model': 'bg-purple-100 text-purple-800',
  'Industrial Design': 'bg-indigo-100 text-indigo-800', Trademark: 'bg-green-100 text-green-800',
  Copyright: 'bg-yellow-100 text-yellow-800',
};

const mockCompleted: CompletedCase[] = [
  {
    id: 'CR-001', applicationNo: 'CR-2026-001234',
    title: 'Educational Modules for Sustainable Agriculture',
    description: 'Comprehensive teaching materials on sustainable farming practices for Filipino farmers.',
    ipType: 'Copyright', inventorName: 'Prof. Carlos Mendoza',
    college: 'College of Agriculture and Food Science',
    department: 'Institute of Agricultural Education',
    completedDate: '2026-06-15', outcome: 'Copyright Certificate Issued',
    folderLink: 'https://drive.google.com/drive/folders/example-edu-modules',
  },
  {
    id: 'UM-002', applicationNo: '2-2024-000876',
    title: 'Smart Irrigation Controller with LoRa Connectivity',
    description: 'Low-power irrigation control system using LoRa wireless protocol for large-scale rice paddies.',
    ipType: 'Utility Model', inventorName: 'Dr. Ana Reyes',
    college: 'College of Engineering and Agro-Industrial Technology',
    department: 'Dept. of Agricultural Biosystems Engineering',
    completedDate: '2026-04-20', outcome: 'UM Certificate Issued',
  },
  {
    id: 'TM-002', applicationNo: '4-2024-009834',
    title: "Oble's Harvest — University Farm Products",
    description: 'Trademark for the brand name and logo covering agricultural products from the university farm.',
    ipType: 'Trademark', inventorName: 'Dr. Elena Rosales',
    college: 'College of Agriculture and Food Science',
    department: 'University Animal Farm',
    completedDate: '2026-02-10', outcome: 'Trademark Registered',
  },
];

function loadFromStorage(): CompletedCase[] {
  try {
    const raw = localStorage.getItem('ch_completed_cases');
    if (!raw) return [];
    const parsed = JSON.parse(raw) as any[];
    return parsed.map(e => ({
      id: e.id, applicationNo: e.applicationNo, title: e.title,
      description: e.description ?? '',
      ipType: (e.ipType as CompletedCase['ipType']) || 'Patent',
      inventorName: e.inventorName, college: e.college,
      department: e.department ?? '',
      completedDate: e.completedDate, outcome: e.stage || 'Completed',
      folderLink: e.folderLink, attachedFiles: e.attachedFiles,
      unifiedRemarks: e.unifiedRemarks, secondaryInventors: e.secondaryInventors,
    }));
  } catch { return []; }
}

export default function CHCompletedCasesDashboard() {
  const storageCases = loadFromStorage();
  const merged = [...mockCompleted.filter(m => !storageCases.find(s => s.id === m.id)), ...storageCases];
  const [cases, setCases] = useState(merged);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [compactView, setCompactView] = useState(false);
  const [folderCase, setFolderCase] = useState<CompletedCase | null>(null);
  const [remarksCase, setRemarksCase] = useState<CompletedCase | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const toggleDetails = (id: string) => setExpandedDetails(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const IP_TYPES = ['Patent', 'Utility Model', 'Industrial Design', 'Trademark', 'Copyright'];
  const typeCounts = IP_TYPES.reduce((acc, t) => { acc[t] = cases.filter(c => c.ipType === t).length; return acc; }, {} as Record<string, number>);

  const filtered = cases.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.inventorName.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'All' || c.ipType === filterType;
    return matchSearch && matchType;
  });

  const update = (id: string, patch: Partial<CompletedCase>) => setCases(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  const handleSaveFolder = (id: string, link: string) => update(id, { folderLink: link });
  const handleAttachFiles = (id: string, files: AttachedFile[]) => update(id, { attachedFiles: files });
  const handleAddRemark = (id: string, remark: UnifiedRemark) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, unifiedRemarks: [...(c.unifiedRemarks ?? []), remark] } : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? { ...prev, unifiedRemarks: [...(prev.unifiedRemarks ?? []), remark] } : null);
  };
  const handleMarkResolved = (id: string, remarkId: string) => {
    const patch = (c: CompletedCase) => ({ ...c, unifiedRemarks: (c.unifiedRemarks ?? []).map(r => r.id === remarkId ? { ...r, resolved: true } : r) });
    setCases(prev => prev.map(c => c.id === id ? patch(c) : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? patch(prev) : null);
  };
  const handleMarkRead = (id: string, remarkId: string) => {
    const patch = (c: CompletedCase) => ({ ...c, unifiedRemarks: (c.unifiedRemarks ?? []).map(r => r.id === remarkId ? { ...r, read: true } : r) });
    setCases(prev => prev.map(c => c.id === id ? patch(c) : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? patch(prev) : null);
  };
  const handleAddReply = (id: string, remarkId: string, reply: UnifiedRemarkReply) => {
    const patch = (c: CompletedCase) => ({ ...c, unifiedRemarks: (c.unifiedRemarks ?? []).map(r => r.id === remarkId ? { ...r, replies: [...(r.replies ?? []), reply] } : r) });
    setCases(prev => prev.map(c => c.id === id ? patch(c) : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? patch(prev) : null);
  };

  const unreadCount = (c: CompletedCase) => (c.unifiedRemarks ?? []).filter(r => !r.read && r.role === 'admin').length;

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <CaseHandlerNav />
      <div className="flex-1 min-w-0 max-w-[1600px] p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Completed Cases</h1>
          <p className="text-gray-600 text-sm">Your cases that have been successfully processed and closed</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-5 p-4 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search by title or inventor..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]">
              <option value="All">All IP Types</option>
              {IP_TYPES.map(t => <option key={t} value={t}>{t} ({typeCounts[t] ?? 0})</option>)}
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

        <p className="text-xs text-gray-400 mb-4">Showing {filtered.length} of {cases.length} completed cases</p>

        {compactView ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">App No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Outcome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(case_ => {
                  const unread = unreadCount(case_);
                  return (
                    <tr key={case_.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-[#00563f] font-semibold whitespace-nowrap">{case_.applicationNo}</td>
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="text-sm font-medium text-gray-900 truncate" title={case_.title}>{case_.title}</p>
                        <p className="text-xs text-gray-500 truncate">{case_.inventorName}</p>
                      </td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[case_.ipType] ?? 'bg-gray-100 text-gray-700'}`}>{case_.ipType}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{case_.outcome}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(case_.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setFolderCase(case_)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#00563f]" title="View Folder"><FolderOpen className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setRemarksCase(case_)} className="relative p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#8d1436]" title="Remarks">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#8d1436] text-white rounded-full text-[8px] flex items-center justify-center font-bold">{unread}</span>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-12 text-center"><p className="text-gray-500 text-sm">No completed cases found.</p></div>}
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map(case_ => {
              const unread = unreadCount(case_);
              const remarksCount = (case_.unifiedRemarks ?? []).length;
              return (
                <div key={case_.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-white px-8 py-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono text-[#00563f] font-semibold">{case_.applicationNo}</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[case_.ipType] ?? 'bg-gray-100 text-gray-700'}`}>{case_.ipType}</span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800"><Trophy className="w-3 h-3" />Complete</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{case_.title}</h3>
                        <p className="text-sm text-gray-600 max-w-3xl">{case_.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2.5 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                      <Trophy className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="font-semibold">{case_.outcome}</span>
                      <span className="ml-auto flex items-center gap-1.5 text-xs text-green-700"><Calendar className="w-3.5 h-3.5" />Completed {new Date(case_.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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
                        <div><p className="text-xs text-gray-500">Department</p><p className="text-sm text-gray-900">{case_.department || '—'}</p></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Case Information</h4>
                      <div className="space-y-2">
                        <div><p className="text-xs text-gray-500">Application No.</p><p className="text-sm font-mono font-semibold text-[#00563f]">{case_.applicationNo}</p></div>
                        <div><p className="text-xs text-gray-500">Date Completed</p><p className="text-sm text-gray-900">{new Date(case_.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
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

                  <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center gap-2">
                    <button onClick={() => setFolderCase(case_)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
                      <FolderOpen className={`w-3.5 h-3.5 ${case_.folderLink ? 'text-[#00563f]' : ''}`} />
                      {`View Folder${case_.attachedFiles?.length ? ` (${case_.attachedFiles.length})` : ''}`}
                    </button>
                    <button onClick={() => setRemarksCase(case_)} className="relative flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
                      <MessageSquare className={`w-3.5 h-3.5 ${remarksCount ? 'text-[#8d1436]' : ''}`} />
                      Remarks{remarksCount ? ` (${remarksCount})` : ''}
                      {unread > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#8d1436] text-white rounded-full text-[9px] flex items-center justify-center font-bold">{unread}</span>}
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-16 text-center"><p className="text-gray-500 text-sm">No completed cases found.</p></div>}
          </div>
        )}
      </div>

      <LinkFolderModal isOpen={!!folderCase} onClose={() => setFolderCase(null)} item={folderCase} onSave={handleSaveFolder} onAttachFiles={handleAttachFiles} />
      <UnifiedRemarksModal isOpen={!!remarksCase} onClose={() => setRemarksCase(null)} item={remarksCase} currentRole="handler" onAddRemark={handleAddRemark} onMarkResolved={handleMarkResolved} onMarkRead={handleMarkRead} onAddReply={handleAddReply} />
    </div>
  );
}
