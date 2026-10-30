import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import UserNav from './UserNav';
import { useDatabase } from '../context/DatabaseContext';

export default function InventorDashboard() {
  // We'll show applications where inventorName contains "Juan" just for the mock
  const { applications } = useDatabase();
  const myApplications = applications.filter(app => app.inventorName.includes('Juan'));

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <UserNav />
      <div className="max-w-[1200px] flex-1 min-w-0 p-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">My IP Disclosures</h1>
            <p className="text-gray-600">Track the status of your submitted intellectual property applications</p>
          </div>
          <Link 
            to="/inventor/new"
            className="flex items-center gap-2 bg-salmon-600 text-white px-5 py-2.5 rounded-lg hover:bg-salmon-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Submit New Disclosure
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {myApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Submitted</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {myApplications.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(app.dateDisclosed).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-md truncate">
                        {app.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {app.ipType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          Under Review (Unassigned)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No disclosures yet</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">You haven't submitted any intellectual property disclosures yet. Click the button above to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}