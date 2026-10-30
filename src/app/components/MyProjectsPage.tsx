import { Users, Building2, Award, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import UserNav from './UserNav';
import { useDatabase } from '../context/DatabaseContext';

export default function MyProjectsPage() {
  const { applications } = useDatabase();
  const navigate = useNavigate();

  // Filter to only show projects where Dr. Juan Inventor is an inventor
  const currentUserName = 'Dr. Maria Santos';
  const myProjects = applications.filter(app =>
    app.inventors?.some(inv => inv.name === currentUserName) ||
    app.inventorName === currentUserName
  );

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <UserNav />
      <div className="max-w-[1400px] flex-1 min-w-0 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">My Projects & Royalty Allocation</h1>
          <p className="text-gray-600">View your IP projects, co-inventors, and your royalty share</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-salmon-50 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-salmon-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">My Active Projects</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{myProjects.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Total Co-Inventors</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {myProjects.reduce((sum, app) => sum + ((app.inventors?.length || 1) - 1), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Average Royalty Share</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {myProjects.length > 0
                    ? Math.round(myProjects.reduce((sum, app) => {
                        const myShare = app.inventors?.find(inv => inv.name === currentUserName)?.royaltyShare || 100;
                        return sum + myShare;
                      }, 0) / myProjects.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {myProjects.map((project) => {
            const myInventorData = project.inventors?.find(inv => inv.name === currentUserName);
            const myRoyaltyShare = myInventorData?.royaltyShare || 100;
            const isBlocked = project.preProtectionBlocked;

            return (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-salmon-50 to-white p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {project.ipType}
                        </span>
                        {isBlocked && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3 h-3" />
                            Action Needed
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        {project.projectCode && (
                          <span className="font-mono text-xs text-gray-400">{project.projectCode}</span>
                        )}
                        <span>Disclosed <span className="font-medium text-gray-900">
                          {new Date(project.dateDisclosed).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span></span>
                        {project.status && (
                          <span className={`font-medium ${isBlocked ? 'text-amber-600' : 'text-salmon-600'}`}>{project.status}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-6 flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">My Royalty Share</p>
                        <p className="text-3xl font-bold text-salmon-600">{myRoyaltyShare}%</p>
                      </div>
                      <button
                        onClick={() => navigate(`/inventor/projects/${project.id}`)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-[#8d1436] hover:text-[#731029] transition-colors group"
                      >
                        View Progress
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>

                {project.inventors && project.inventors.length > 1 && (
                  <div className="p-6">
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-salmon-600" />
                      Co-Inventors & Royalty Distribution
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventor</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">College</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Royalty Share</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {project.inventors?.map((inventor) => (
                            <tr
                              key={inventor.id}
                              className={`transition-colors ${
                                inventor.name === currentUserName
                                  ? 'bg-salmon-50 hover:bg-salmon-100'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {inventor.name}
                                {inventor.name === currentUserName && (
                                  <span className="ml-2 text-xs text-salmon-600 font-semibold">(You)</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">{inventor.position}</td>
                              <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                                <div className="truncate" title={inventor.college}>{inventor.college}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                                <div className="truncate" title={inventor.department}>{inventor.department}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        inventor.name === currentUserName ? 'bg-salmon-600' : 'bg-gray-400'
                                      }`}
                                      style={{ width: `${inventor.royaltyShare}%` }}
                                    ></div>
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
                              {project.inventors?.reduce((sum, inv) => sum + inv.royaltyShare, 0)}%
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {myProjects.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                You haven't been added to any IP projects yet. Projects where you are listed as an inventor will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
