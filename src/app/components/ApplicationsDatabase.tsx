import { useState } from 'react';
import { Search, Filter, Eye, X } from 'lucide-react';
import AdminNav from './AdminNav';
import { AssignHandlerModal } from './modals/AssignHandlerModal';
import { useDatabase, Application } from '../context/DatabaseContext';

function CaseDetailsPanel({ app, onClose }: { app: Application; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 pointer-events-auto"
        onClick={onClose}
      />
      {/* Floating panel */}
      <div className="relative pointer-events-auto bg-white shadow-2xl border-l border-gray-200 h-full w-full max-w-md overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-[#8d1436] font-semibold uppercase tracking-wide">Case Details</p>
            <h2 className="text-base font-bold text-gray-900 leading-tight mt-0.5">{app.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* IP Type badge */}
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(app.ipType)}`}>
              {app.ipType}
            </span>
          </div>

          {/* Abstract / Description */}
          {(app as any).description && (
            <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Abstract</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{(app as any).description}</p>
            </div>
          )}

          {/* Inventor info */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Primary Inventor</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-semibold text-gray-900">{app.inventorName}</p>
              </div>
              {app.inventors?.[0]?.email && (
                <div>
                  <p className="text-xs text-gray-500">Applicant Email</p>
                  <a href={`mailto:${app.inventors[0].email}`} className="text-sm text-blue-600 hover:underline">{app.inventors[0].email}</a>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">College</p>
                <p className="text-sm text-gray-900">{app.college}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Department / Institute</p>
                <p className="text-sm text-gray-900">{app.department}</p>
              </div>
            </div>
          </div>

          {/* Submission info */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Submission</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Date Disclosed</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(app.dateDisclosed).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              {app.publicDisclosureDate && (
                <div>
                  <p className="text-xs text-gray-500">Public Disclosure Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(app.publicDisclosureDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {(app as any).fundingAgency && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Funding</h3>
              <p className="text-sm text-gray-900">{(app as any).fundingAgency}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getTypeColor(type: string) {
  switch (type) {
    case 'Patent':            return 'bg-blue-100 text-blue-800';
    case 'Trademark':         return 'bg-green-100 text-green-800';
    case 'Utility Model':     return 'bg-purple-100 text-purple-800';
    case 'Industrial Design': return 'bg-indigo-100 text-indigo-800';
    case 'Copyright':         return 'bg-yellow-100 text-yellow-800';
    default:                  return 'bg-gray-100 text-gray-800';
  }
}

export default function ApplicationsDatabase() {
  const { applications, removeApplication } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailsApp, setDetailsApp] = useState<Application | null>(null);

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.inventorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || app.ipType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleAssign = (id: string, _handler: string) => {
    removeApplication(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <AdminNav />
      <div className="flex-1 min-w-0 max-w-[1600px] p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Unassigned Cases</h1>
          <p className="text-gray-600">Unassigned IP applications awaiting case handler assignment</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or inventor name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm"
              >
                <option>All</option>
                <option>Patent</option>
                <option>Trademark</option>
                <option>Utility Model</option>

                <option>Copyright</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Disclosed</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Application Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">College</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredApplications.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(app.dateDisclosed).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs">
                      <div className="truncate" title={app.title}>{app.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(app.ipType)}`}>
                        {app.ipType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.inventorName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[160px]">
                      <div className="truncate" title={app.college}>{app.college}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[140px]">
                      <div className="truncate" title={app.department}>{app.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setDetailsApp(app)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-3 py-1.5 bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130] transition-colors text-xs font-medium"
                        >
                          Assign Case Handler
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No applications found matching your criteria.</p>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredApplications.length} of {applications.length} unassigned applications
        </div>
      </div>

      <AssignHandlerModal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        application={selectedApp ? { id: selectedApp.id, title: selectedApp.title, type: selectedApp.ipType } : null}
        onAssign={handleAssign}
      />

      {detailsApp && (
        <CaseDetailsPanel app={detailsApp} onClose={() => setDetailsApp(null)} />
      )}
    </div>
  );
}
