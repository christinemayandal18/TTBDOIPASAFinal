import { useState } from 'react';
import { Search, Filter, ExternalLink, MessageSquare, FolderOpen } from 'lucide-react';
import AdminNav from './AdminNav';
import { UnifiedRemarksModal, UnifiedRemark, UnifiedRemarkReply } from './modals/UnifiedRemarksModal';

interface AllCase {
  id: string; applicationNo: string; title: string;
  ipType: 'Patent' | 'Utility Model' | 'Industrial Design' | 'Trademark' | 'Copyright';
  caseHandler: string; inventorName: string; college: string; department: string;
  dateDisclosed: string; filedDate?: string;
  status: 'Ongoing' | 'Completed'; currentStage: string;
  folderLink?: string; unifiedRemarks?: UnifiedRemark[];
}

const mockAllCases: AllCase[] = [
  { id: 'P-001', applicationNo: '1-2024-500112', title: 'Novel Biocontrol Agent from Indigenous Philippine Plants', ipType: 'Patent', caseHandler: 'Tristan Perez-Navarro', inventorName: 'Dr. Maria Santos', college: 'College of Agriculture and Food Science', department: 'Institute of Crop Science', dateDisclosed: '2024-10-01', filedDate: '2024-11-05', status: 'Ongoing', currentStage: 'Substantive Examination', folderLink: 'https://drive.google.com/drive/folders/example-biocontrol' },
  { id: 'P-002', applicationNo: '1-2023-498801', title: 'Automated Plant Disease Detection Using Machine Vision', ipType: 'Patent', caseHandler: 'Anna Maria Garcia', inventorName: 'Dr. Ricardo Tan', college: 'College of Engineering and Agro-Industrial Technology', department: 'Dept. of Electrical Engineering', dateDisclosed: '2023-06-10', filedDate: '2023-08-14', status: 'Completed', currentStage: 'Letters Patent Issued', folderLink: 'https://drive.google.com/drive/folders/example-plant-disease' },
  { id: 'P-003', applicationNo: '1-2024-501340', title: 'Coconut Shell-Derived Activated Carbon for Water Purification', ipType: 'Patent', caseHandler: 'Samuel Mendoza', inventorName: 'Engr. Lena Reyes', college: 'College of Forestry and Natural Resources', department: 'Dept. of Forest Products', dateDisclosed: '2024-04-15', filedDate: '2024-06-20', status: 'Ongoing', currentStage: 'Formality Examination' },
  { id: 'UM-001', applicationNo: '2-2025-001234', title: 'Modular Cassava Dehusking Machine', ipType: 'Utility Model', caseHandler: 'Tristan Perez-Navarro', inventorName: 'Engr. Roberto Luna', college: 'College of Engineering and Agro-Industrial Technology', department: 'Agricultural Machinery Division', dateDisclosed: '2024-11-20', filedDate: '2025-01-08', status: 'Ongoing', currentStage: 'Formality Examination' },
  { id: 'UM-002', applicationNo: '2-2024-000876', title: 'Smart Irrigation Controller with LoRa Connectivity', ipType: 'Utility Model', caseHandler: 'Katrina Mercado', inventorName: 'Dr. Ana Reyes', college: 'College of Engineering and Agro-Industrial Technology', department: 'Dept. of Agricultural Biosystems Engineering', dateDisclosed: '2024-02-18', filedDate: '2024-04-22', status: 'Completed', currentStage: 'Certificate Issued', folderLink: 'https://drive.google.com/drive/folders/example-irrigation' },
  { id: 'TM-001', applicationNo: '4-2025-012901', title: 'UPLB Visual Identity System 2025', ipType: 'Trademark', caseHandler: 'Anna Maria Garcia', inventorName: 'Prof. Juan Dela Cruz', college: 'College of Development Communication', department: 'Dept. of Communication Arts', dateDisclosed: '2025-04-05', filedDate: '2025-06-10', status: 'Ongoing', currentStage: 'Registrability Report' },
  { id: 'TM-002', applicationNo: '4-2024-009834', title: "Oble's Harvest — University Farm Products", ipType: 'Trademark', caseHandler: 'Samuel Mendoza', inventorName: 'Dr. Elena Rosales', college: 'College of Agriculture and Food Science', department: 'University Animal Farm', dateDisclosed: '2024-07-12', filedDate: '2024-09-01', status: 'Completed', currentStage: 'Trademark Registered', folderLink: 'https://drive.google.com/drive/folders/example-obles-harvest' },
  { id: 'CR-001', applicationNo: 'CR-2026-001234', title: 'Educational Modules for Sustainable Agriculture', ipType: 'Copyright', caseHandler: 'Katrina Mercado', inventorName: 'Prof. Carlos Mendoza', college: 'College of Agriculture and Food Science', department: 'Institute of Agricultural Education', dateDisclosed: '2026-04-22', filedDate: '2026-05-09', status: 'Completed', currentStage: 'Certificate Issued' },
  { id: 'CR-002', applicationNo: 'CR-2026-002567', title: 'ForCarbon: Software for Estimating Forest Carbon Stock', ipType: 'Copyright', caseHandler: 'Samuel Mendoza', inventorName: 'Engr. Mark Bautista', college: 'College of Forestry and Natural Resources', department: 'Institute of Renewable Natural Resources', dateDisclosed: '2026-04-18', filedDate: '2026-06-17', status: 'Ongoing', currentStage: 'Filing of Copyright Application' },
  { id: 'CR-003', applicationNo: 'CR-2025-009876', title: 'Field Guide to Philippine Endemic Orchids', ipType: 'Copyright', caseHandler: 'Nathan Felipe Cruz', inventorName: 'Dr. Patricia Alcantara', college: 'Museum of Natural History', department: 'Botanical Herbarium', dateDisclosed: '2026-03-20', filedDate: '2026-03-31', status: 'Completed', currentStage: 'Certificate Issued', folderLink: 'https://drive.google.com/drive/folders/example-orchids' },
];

const ALL_HANDLERS = [...new Set(mockAllCases.map(c => c.caseHandler))].sort();
const ALL_COLLEGES = [...new Set(mockAllCases.map(c => c.college))].sort();
const TYPE_COLORS: Record<string, string> = { Patent: 'bg-blue-100 text-blue-800', 'Utility Model': 'bg-purple-100 text-purple-800', 'Industrial Design': 'bg-indigo-100 text-indigo-800', Trademark: 'bg-green-100 text-green-800', Copyright: 'bg-yellow-100 text-yellow-800' };

export default function AllCasesDashboard() {
  const [cases, setCases] = useState(mockAllCases);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterHandler, setFilterHandler] = useState('All');
  const [filterCollege, setFilterCollege] = useState('All');
  const [remarksCase, setRemarksCase] = useState<AllCase | null>(null);

  const availableDepartments = filterCollege === 'All' ? [] : [...new Set(mockAllCases.filter(c => c.college === filterCollege).map(c => c.department))].sort();
  const [filterDepartment, setFilterDepartment] = useState('All');

  const IP_TYPES = ['Patent', 'Utility Model', 'Industrial Design', 'Trademark', 'Copyright'];
  const typeCounts = IP_TYPES.reduce((acc, t) => { acc[t] = cases.filter(c => c.ipType === t).length; return acc; }, {} as Record<string, number>);

  const filtered = cases.filter(c => {
    const matchSearch     = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.inventorName.toLowerCase().includes(search.toLowerCase()) || c.applicationNo.toLowerCase().includes(search.toLowerCase());
    const matchType       = filterType    === 'All' || c.ipType    === filterType;
    const matchStatus     = filterStatus  === 'All' || c.status    === filterStatus;
    const matchHandler    = filterHandler === 'All' || c.caseHandler === filterHandler;
    const matchCollege    = filterCollege    === 'All' || c.college    === filterCollege;
    const matchDepartment = filterDepartment === 'All' || c.department === filterDepartment;
    return matchSearch && matchType && matchStatus && matchHandler && matchCollege && matchDepartment;
  });

  const handleAddRemark = (id: string, remark: UnifiedRemark) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, unifiedRemarks: [...(c.unifiedRemarks ?? []), remark] } : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? { ...prev, unifiedRemarks: [...(prev.unifiedRemarks ?? []), remark] } : null);
  };
  const handleMarkResolved = (id: string, remarkId: string) => {
    const patch = (c: AllCase) => ({ ...c, unifiedRemarks: (c.unifiedRemarks ?? []).map(r => r.id === remarkId ? { ...r, resolved: true } : r) });
    setCases(prev => prev.map(c => c.id === id ? patch(c) : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? patch(prev) : null);
  };
  const handleMarkRead = (id: string, remarkId: string) => {
    const patch = (c: AllCase) => ({ ...c, unifiedRemarks: (c.unifiedRemarks ?? []).map(r => r.id === remarkId ? { ...r, read: true } : r) });
    setCases(prev => prev.map(c => c.id === id ? patch(c) : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? patch(prev) : null);
  };
  const handleAddReply = (id: string, remarkId: string, reply: UnifiedRemarkReply) => {
    const patch = (c: AllCase) => ({ ...c, unifiedRemarks: (c.unifiedRemarks ?? []).map(r => r.id === remarkId ? { ...r, replies: [...(r.replies ?? []), reply] } : r) });
    setCases(prev => prev.map(c => c.id === id ? patch(c) : c));
    if (remarksCase?.id === id) setRemarksCase(prev => prev ? patch(prev) : null);
  };

  const unreadCount = (c: AllCase) => (c.unifiedRemarks ?? []).filter(r => !r.read && r.role !== 'admin').length;

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <AdminNav />
      <div className="flex-1 min-w-0 max-w-[1600px] p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 text-gray-900">All Cases</h1>
          <p className="text-gray-600 text-sm">All IP applications filed at IPOPHL — ongoing and completed</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4 flex flex-wrap gap-3">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search by title, inventor, or application no..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] text-sm" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm">
                <option value="All">All IP Types</option>
                {IP_TYPES.map(t => <option key={t} value={t}>{t} ({typeCounts[t] ?? 0})</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm">
                <option value="All">All Statuses</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
              <select value={filterHandler} onChange={e => setFilterHandler(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm">
                <option value="All">All Case Handlers</option>
                {ALL_HANDLERS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <select value={filterCollege} onChange={e => { setFilterCollege(e.target.value); setFilterDepartment('All'); }} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm max-w-[220px]">
                <option value="All">All Colleges</option>
                {ALL_COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {filterCollege !== 'All' && (
                <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm max-w-[220px]">
                  <option value="All">All Departments</option>
                  {availableDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-5 text-sm">
          <span className="text-gray-500">Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of <span className="font-semibold text-gray-900">{cases.length}</span> cases</span>
          <span className="text-gray-300">|</span>
          <span className="text-blue-700 font-medium">{filtered.filter(c => c.status === 'Ongoing').length} ongoing</span>
          <span className="text-green-700 font-medium">{filtered.filter(c => c.status === 'Completed').length} completed</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Application No.</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Case Handler</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Primary Inventor</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">College</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Stage</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(case_ => {
                  const unread = unreadCount(case_);
                  const remarksCount = (case_.unifiedRemarks ?? []).length;
                  return (
                    <tr key={case_.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono text-[#8d1436] font-semibold">{case_.applicationNo}</span>
                      </td>
                      <td className="px-5 py-4 max-w-[200px]">
                        <p className="text-sm font-medium text-gray-900 truncate" title={case_.title}>{case_.title}</p>
                        <p className="text-xs text-gray-500 truncate">{case_.college}</p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[case_.ipType] ?? 'bg-gray-100 text-gray-700'}`}>{case_.ipType}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">{case_.caseHandler}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">{case_.inventorName}</td>
                      <td className="px-5 py-4 text-xs text-gray-600 max-w-[160px]"><span className="block truncate" title={case_.college}>{case_.college}</span></td>
                      <td className="px-5 py-4 text-xs text-gray-600 max-w-[140px]"><span className="block truncate" title={case_.department}>{case_.department}</span></td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${case_.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{case_.status}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap max-w-[140px]">
                        <span className="truncate block" title={case_.currentStage}>{case_.currentStage}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {case_.folderLink ? (
                            <a href={case_.folderLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-[#00563f] rounded-lg hover:bg-green-50 transition-colors text-xs font-medium">
                              <ExternalLink className="w-3.5 h-3.5" /> View Folder
                            </a>
                          ) : (
                            <span className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-100 text-gray-300 rounded-lg text-xs">
                              <FolderOpen className="w-3.5 h-3.5" /> No Folder
                            </span>
                          )}
                          <button onClick={() => setRemarksCase(case_)} className="relative flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {remarksCount > 0 ? remarksCount : 'Remarks'}
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
          {filtered.length === 0 && <div className="text-center py-12"><p className="text-gray-500 text-sm">No cases found.</p></div>}
        </div>
      </div>

      <UnifiedRemarksModal isOpen={!!remarksCase} onClose={() => setRemarksCase(null)} item={remarksCase} currentRole="admin" onAddRemark={handleAddRemark} onMarkResolved={handleMarkResolved} onMarkRead={handleMarkRead} onAddReply={handleAddReply} />
    </div>
  );
}
