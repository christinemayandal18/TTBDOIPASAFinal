import { Users, Award, TrendingUp } from 'lucide-react';
import CaseHandlerNav from '../CaseHandlerNav';

interface Inventor {
  id: string; name: string; position: string; college: string;
  department: string; email: string; royaltyShare: number;
}

interface RoyaltyProject {
  id: string; applicationNo: string; title: string; ipType: string;
  projectCode: string; dateDisclosed: string; status: string;
  inventors: Inventor[];
}

const chName = (() => { try { return localStorage.getItem('ch_name') || 'Ana Reyes'; } catch { return 'Ana Reyes'; } })();

const ALL_PROJECTS: RoyaltyProject[] = [
  {
    id: 'P-001', applicationNo: '1-2024-500112', title: 'Novel Biocontrol Agent from Indigenous Philippine Plants',
    ipType: 'Patent', projectCode: 'UPLB-2024-P-001', dateDisclosed: '2024-10-01', status: 'Active',
    inventors: [
      { id: 'inv-1', name: 'Dr. Maria Santos', position: 'Professor', college: 'College of Agriculture and Food Science', department: 'Institute of Crop Science', email: 'msantos@up.edu.ph', royaltyShare: 40 },
      { id: 'inv-2', name: 'Dr. Lorenzo Tan', position: 'Associate Professor', college: 'College of Agriculture and Food Science', department: 'Institute of Biological Sciences', email: 'ltan@up.edu.ph', royaltyShare: 30 },
      { id: 'inv-3', name: 'Ms. Raquel Navarro', position: 'Research Assistant', college: 'College of Agriculture and Food Science', department: 'Institute of Crop Science', email: 'rnavarro@up.edu.ph', royaltyShare: 20 },
      { id: 'inv-4', name: 'UPLB Institution', position: 'Institutional Share', college: 'University of the Philippines Los Baños', department: 'TTBDO', email: 'ttbdo@uplb.edu.ph', royaltyShare: 10 },
    ],
  },
  {
    id: 'UM-001', applicationNo: '2-2025-001234', title: 'Modular Cassava Dehusking Machine',
    ipType: 'Utility Model', projectCode: 'UPLB-2025-UM-001', dateDisclosed: '2024-11-20', status: 'Active',
    inventors: [
      { id: 'inv-5', name: 'Engr. Roberto Luna', position: 'Associate Professor', college: 'College of Engineering and Agro-Industrial Technology', department: 'Agricultural Machinery Division', email: 'rluna@up.edu.ph', royaltyShare: 50 },
      { id: 'inv-6', name: 'Engr. Diana Castillo', position: 'Lecturer', college: 'College of Engineering and Agro-Industrial Technology', department: 'Agricultural Machinery Division', email: 'dcastillo@up.edu.ph', royaltyShare: 30 },
      { id: 'inv-7', name: 'UPLB Institution', position: 'Institutional Share', college: 'University of the Philippines Los Baños', department: 'TTBDO', email: 'ttbdo@uplb.edu.ph', royaltyShare: 20 },
    ],
  },
  {
    id: 'TM-001', applicationNo: '4-2025-012901', title: 'UPLB Visual Identity System 2025',
    ipType: 'Trademark', projectCode: 'UPLB-2025-TM-001', dateDisclosed: '2025-04-05', status: 'Active',
    inventors: [
      { id: 'inv-8', name: 'Prof. Juan Dela Cruz', position: 'Professor', college: 'College of Development Communication', department: 'Dept. of Communication Arts', email: 'jdelacruz@up.edu.ph', royaltyShare: 60 },
      { id: 'inv-9', name: 'UPLB Institution', position: 'Institutional Share', college: 'University of the Philippines Los Baños', department: 'TTBDO', email: 'ttbdo@uplb.edu.ph', royaltyShare: 40 },
    ],
  },
];

// Handler only sees projects they handled (mock: Ana Reyes handled all 3)
const MY_PROJECTS = ALL_PROJECTS;

const IP_BADGE: Record<string, string> = {
  Patent: 'bg-blue-100 text-blue-800',
  'Utility Model': 'bg-purple-100 text-purple-800',
  'Industrial Design': 'bg-indigo-100 text-indigo-800',
  Trademark: 'bg-green-100 text-green-800',
  Copyright: 'bg-yellow-100 text-yellow-800',
};

export default function CHRoyaltyPage() {
  const totalInventors = MY_PROJECTS.reduce((sum, p) => sum + p.inventors.length, 0);
  const avgRoyaltyPerProject = MY_PROJECTS.length > 0
    ? (MY_PROJECTS.reduce((sum, p) => sum + p.inventors.reduce((s, inv) => s + inv.royaltyShare, 0), 0) / MY_PROJECTS.length).toFixed(0)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <CaseHandlerNav />
      <div className="flex-1 min-w-0 max-w-[1400px] p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Projects & Royalty</h1>
          <p className="text-gray-600 text-sm">IP projects handled by you, with inventor details and royalty distributions</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#8d1436]/10 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-[#8d1436]" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">My Projects</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{MY_PROJECTS.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Inventors</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalInventors}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg. Allocated</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{avgRoyaltyPerProject}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="space-y-6">
          {MY_PROJECTS.map(project => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#fdf0f3] to-white p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${IP_BADGE[project.ipType] ?? 'bg-gray-100 text-gray-700'}`}>{project.ipType}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                      <span>Project Code: <span className="font-medium text-gray-900">{project.projectCode}</span></span>
                      <span>•</span>
                      <span>Application No.: <span className="font-mono font-medium text-[#8d1436]">{project.applicationNo}</span></span>
                      <span>•</span>
                      <span>Disclosed: <span className="font-medium text-gray-900">{new Date(project.dateDisclosed).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span></span>
                      <span>•</span>
                      <span>Status: <span className="font-medium text-[#8d1436]">{project.status}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#8d1436]" />
                  Inventors & Royalty Distribution
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventor</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">College</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Royalty Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {project.inventors.map(inventor => (
                        <tr key={inventor.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{inventor.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{inventor.position}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 max-w-xs"><div className="truncate" title={inventor.college}>{inventor.college}</div></td>
                          <td className="px-4 py-3 text-sm text-gray-600">{inventor.email}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div className="bg-[#8d1436] h-2 rounded-full" style={{ width: `${inventor.royaltyShare}%` }} />
                              </div>
                              <span className="font-bold text-gray-900 w-12 text-right">{inventor.royaltyShare}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">Total Allocation:</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                          {project.inventors.reduce((sum, inv) => sum + inv.royaltyShare, 0)}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          ))}

          {MY_PROJECTS.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 max-w-md mx-auto text-sm">Projects assigned to you will appear here once they have inventor information and royalty allocations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
