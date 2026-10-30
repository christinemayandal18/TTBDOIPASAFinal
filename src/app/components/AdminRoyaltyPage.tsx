import { Users, Building2, Award } from 'lucide-react';
import AdminNav from './AdminNav';
import { useDatabase } from '../context/DatabaseContext';

export default function AdminRoyaltyPage() {
  const { applications } = useDatabase();

  // Filter applications that have inventor arrays
  const projectsWithInventors = applications.filter(app => app.inventors && app.inventors.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <AdminNav />
      <div className="flex-1 min-w-0 max-w-[1400px] p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Projects & Royalty Allocation</h1>
          <p className="text-gray-600">View all IP projects, their inventors, institutional affiliations, and royalty share distributions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-salmon-50 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-salmon-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Active Projects</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{projectsWithInventors.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Total Inventors</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {projectsWithInventors.reduce((sum, app) => sum + (app.inventors?.length || 0), 0)}
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
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Colleges Involved</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {new Set(projectsWithInventors.flatMap(app =>
                    app.inventors?.map(inv => inv.college) || []
                  )).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {projectsWithInventors.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-salmon-50 to-white p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {project.ipType}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Project Code: <span className="font-medium text-gray-900">{project.projectCode}</span></span>
                      <span>•</span>
                      <span>Date Disclosed: <span className="font-medium text-gray-900">
                        {new Date(project.dateDisclosed).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span></span>
                      {project.status && (
                        <>
                          <span>•</span>
                          <span>Status: <span className="font-medium text-salmon-600">{project.status}</span></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-salmon-600" />
                  Inventors & Royalty Distribution
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventor</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">College</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Royalty Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {project.inventors?.map((inventor) => (
                        <tr key={inventor.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{inventor.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{inventor.position}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                            <div className="truncate" title={inventor.college}>{inventor.college}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                            <div className="truncate" title={inventor.department}>{inventor.department}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{inventor.email}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-salmon-600 h-2 rounded-full"
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
                        <td colSpan={5} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">Total Allocation:</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                          {project.inventors?.reduce((sum, inv) => sum + inv.royaltyShare, 0)}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          ))}

          {projectsWithInventors.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects with inventor data yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Projects with detailed inventor information and royalty allocations will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
