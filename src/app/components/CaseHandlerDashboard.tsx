import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react';
import AdminNav from './AdminNav';

interface AssignedCase {
  id: string;
  title: string;
  ipType: 'Copyright' | 'Trademark' | 'Industrial Design/Patent/UM';
  phase: 'Pre-Protection' | 'Prosecution' | 'IPOPHL Filed';
  status: string;
  prosecutionStage?: string; // e.g. "Formality Examination", "Substantive Examination"
  dateAssigned: string;
  inventorName: string;
  college: string;
  department: string;
}

const mockCaseHandler = {
  name: 'Nathan Felipe Cruz',
  id: 'CH-2024-007',
  email: 'nfcruz@up.edu.ph'
};

const mockAssignedCases: AssignedCase[] = [
  {
    id: 'PRE-2026-004',
    title: 'Bio-based Edible Coating for Tropical Fruits',
    ipType: 'Industrial Design/Patent/UM',
    phase: 'Pre-Protection',
    status: 'For Drafting',
    dateAssigned: '2026-05-02',
    inventorName: 'Dr. Maria Santos',
    college: 'College of Agriculture and Food Science',
    department: 'Institute of Food Science and Technology'
  },
  {
    id: 'PRE-2026-012',
    title: 'Automated Rice Quality Grading System',
    ipType: 'Industrial Design/Patent/UM',
    phase: 'Pre-Protection',
    status: 'Endorsed to OC',
    dateAssigned: '2026-04-20',
    inventorName: 'Prof. Roberto Santos',
    college: 'College of Engineering and Agro-Industrial Technology',
    department: 'Department of Computer Science'
  },
  {
    id: 'OC-2025-018',
    title: 'Smart Aquaculture Monitoring Device',
    ipType: 'Industrial Design/Patent/UM',
    phase: 'IPOPHL Filed',
    status: 'Examination',
    dateAssigned: '2025-11-10',
    inventorName: 'Dr. Teresa Aquino',
    college: 'College of Fisheries and Ocean Sciences',
    department: 'Institute of Aquaculture'
  },
  {
    id: 'PRE-2026-008',
    title: 'Bamboo-Based Biochar Production Method',
    ipType: 'Industrial Design/Patent/UM',
    phase: 'Pre-Protection',
    status: 'IP Audit',
    dateAssigned: '2026-05-14',
    inventorName: 'Dr. Ramon Flores',
    college: 'College of Forestry and Natural Resources',
    department: 'Department of Forest Products'
  },
  {
    id: 'OC-2024-092',
    title: 'Cassava Starch-Based Biodegradable Plastic',
    ipType: 'Industrial Design/Patent/UM',
    phase: 'IPOPHL Filed',
    status: 'Office Action Response',
    dateAssigned: '2024-06-15',
    inventorName: 'Dr. Angela Domingo',
    college: 'College of Agriculture and Food Science',
    department: 'Institute of Food Science and Technology'
  },
  {
    id: 'PRE-2026-002',
    title: 'UPLB Visual Identity System 2026',
    ipType: 'Trademark',
    phase: 'Pre-Protection',
    status: 'Endorsed to OC',
    dateAssigned: '2026-04-28',
    inventorName: 'Prof. Juan Dela Cruz',
    college: 'College of Development Communication',
    department: 'Department of Communication Arts'
  },
  {
    id: 'PRE-2026-003',
    title: 'Educational Modules for Sustainable Agriculture',
    ipType: 'Copyright',
    phase: 'Pre-Protection',
    status: 'For Drafting',
    dateAssigned: '2026-04-22',
    inventorName: 'Prof. Carlos Mendoza',
    college: 'College of Agriculture and Food Science',
    department: 'Institute of Agricultural Education'
  },
  {
    id: 'PRE-2026-009',
    title: 'ForCarbon: Software for Estimating Forest Carbon Stock',
    ipType: 'Copyright',
    phase: 'Pre-Protection',
    status: 'For Filing',
    dateAssigned: '2026-04-18',
    inventorName: 'Engr. Mark Bautista',
    college: 'College of Forestry and Natural Resources',
    department: 'Institute of Renewable Natural Resources'
  },
  {
    id: 'OC-2025-045',
    title: 'Native Chicken Breed Development Program',
    ipType: 'Trademark',
    phase: 'IPOPHL Filed',
    status: 'Allowance',
    dateAssigned: '2025-08-30',
    inventorName: 'Dr. Elena Rosales',
    college: 'College of Agriculture and Food Science',
    department: 'University Animal Farm'
  },
  {
    id: 'PRE-2026-015',
    title: 'Coconut Husk-Based Water Filtration System',
    ipType: 'Industrial Design/Patent/UM',
    phase: 'Pre-Protection',
    status: 'IP Audit',
    dateAssigned: '2026-05-10',
    inventorName: 'Dr. Sofia Martinez',
    college: 'College of Forestry and Natural Resources',
    department: 'Department of Forest Products and Paper Science'
  },
  {
    id: 'PROS-2024-003',
    title: 'Novel Biocontrol Agent from Indigenous Philippine Plants',
    ipType: 'Industrial Design/Patent/UM',
    phase: 'Prosecution',
    status: 'Substantive Examination',
    prosecutionStage: 'Substantive Examination Stage',
    dateAssigned: '2024-11-05',
    inventorName: 'Dr. Maria Santos',
    college: 'College of Agriculture and Food Science',
    department: 'Institute of Crop Science',
  },
  {
    id: 'PROS-2025-007',
    title: 'Smart Irrigation Controller with LoRa Connectivity',
    ipType: 'Industrial Design/Patent/UM',
    phase: 'Prosecution',
    status: 'Formality Examination',
    prosecutionStage: 'Formality Examination Stage',
    dateAssigned: '2024-04-22',
    inventorName: 'Dr. Ana Reyes',
    college: 'College of Engineering and Agro-Industrial Technology',
    department: 'Dept. of Agricultural Biosystems Engineering',
  },
  {
    id: 'PROS-TM-002',
    title: 'Makiling Brew Specialty Coffee',
    ipType: 'Trademark',
    phase: 'Prosecution',
    status: 'Filed — Awaiting Acknowledgement',
    prosecutionStage: 'Filed',
    dateAssigned: '2025-10-20',
    inventorName: 'Prof. Antonio Villanueva',
    college: 'College of Forestry and Natural Resources',
    department: 'Institute of Renewable Natural Resources',
  },
  {
    id: 'OC-2024-112',
    title: 'Organic Fertilizer from Agricultural Waste',
    ipType: 'Industrial Design/Patent/UM',
    phase: 'IPOPHL Filed',
    status: 'Prosecution',
    dateAssigned: '2024-09-12',
    inventorName: 'Prof. Antonio Villanueva',
    college: 'College of Agriculture and Food Science',
    department: 'Institute of Crop Science'
  },
  {
    id: 'PRE-2026-018',
    title: 'Field Guide to Philippine Endemic Orchids',
    ipType: 'Copyright',
    phase: 'Pre-Protection',
    status: 'For Drafting',
    dateAssigned: '2026-05-08',
    inventorName: 'Dr. Patricia Alcantara',
    college: 'Museum of Natural History',
    department: 'Botanical Herbarium'
  }
];

export default function CaseHandlerDashboard() {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Pre-Protection' | 'IPOPHL Filed'>('All');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const filteredCases = mockAssignedCases.filter(c => {
    if (activeFilter === 'All') return true;
    return c.phase === activeFilter;
  });

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Industrial Design/Patent/UM': return 'bg-blue-100 text-blue-800';
      case 'Trademark': return 'bg-green-100 text-green-800';
      case 'Copyright': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (phase: string) => {
    if (phase === 'IPOPHL Filed') return 'bg-purple-50 text-purple-700 border border-purple-200';
    if (phase === 'Prosecution') return 'bg-[#fdf0f3] text-[#8d1436] border border-[#e8b0b0]';
    return 'bg-orange-50 text-orange-700 border border-orange-200';
  };

  const getProcedureChecklist = (ipType: string) => {
    const workflowSteps = [
      { step: 'IP Audit', tasks: [] as string[] },
      { step: 'For Drafting', tasks: [] as string[] },
      { step: 'Endorsed to OC', tasks: [] as string[] },
      { step: 'For Filing', tasks: [] as string[] }
    ];

    if (ipType === 'Copyright') {
      workflowSteps[0].tasks = ['Review disclosure for complete author list', 'Verify original work date'];
      workflowSteps[1].tasks = ['Prepare Copyright Application Form', 'Draft Affidavit of Ownership'];
      workflowSteps[2].tasks = ['Route Deed of Assignment to Chancellor', 'Await OC Signature'];
      workflowSteps[3].tasks = ['Compile copies of work', 'Pay IPOPHL fees', 'Submit application to IPOPHL'];
    } else if (ipType === 'Trademark') {
      workflowSteps[0].tasks = ['Visual audit of mark', 'Verify class of goods/services'];
      workflowSteps[1].tasks = ['Prepare Trademark Application Form', 'Draft Declaration of Actual Use'];
      workflowSteps[2].tasks = ['Endorse documents to Chancellor', 'Await OC Signature'];
      workflowSteps[3].tasks = ['Submit trademark specimen', 'Pay IPOPHL fees', 'File application'];
    } else {
      // Industrial Design/Patent/UM
      workflowSteps[0].tasks = ['Review technical disclosure', 'Verify completeness of drawings and claims'];
      workflowSteps[1].tasks = ['Draft abstract and background', 'Draft detailed description and claims', 'Format formal drawings'];
      workflowSteps[2].tasks = ['Route drafted specification', 'Route Deed of Assignment for Chancellor signature'];
      workflowSteps[3].tasks = ['Submit complete specs to IPOPHL', 'Pay filing and publication fees'];
    }
    return workflowSteps;
  };

  const toggleRow = (id: string) => {
    if (expandedRowId === id) {
      setExpandedRowId(null);
    } else {
      setExpandedRowId(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <AdminNav />
      <div className="flex-1 min-w-0 max-w-[1400px] p-8">
        <div className="mb-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-gray-900">My Assigned Cases</h1>
              <p className="text-gray-600 mb-1">Case Handler: {mockCaseHandler.name}</p>
              <p className="text-sm text-gray-500">{mockCaseHandler.id} · {mockCaseHandler.email}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{mockAssignedCases.length}</p>
              <p className="text-sm text-gray-600">Total Assigned Cases</p>
            </div>
          </div>

          <div className="flex gap-3">
            {(['All', 'Pre-Protection', 'IPOPHL Filed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-salmon-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filter}
                {filter !== 'All' && (
                  <span className="ml-2 text-xs opacity-75">
                    ({mockAssignedCases.filter(c => c.phase === filter).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredCases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10"></th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Case ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventor</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">College</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phase</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Assigned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCases.map(case_ => (
                    <React.Fragment key={case_.id}>
                      <tr 
                        onClick={() => toggleRow(case_.id)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                          {expandedRowId === case_.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {case_.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-sm">
                          {case_.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(case_.ipType)}`}>
                            {case_.ipType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                          {case_.inventorName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                          {case_.college}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(case_.phase)}`}>
                              {case_.phase}
                            </span>
                            {case_.prosecutionStage && (
                              <span className="text-[10px] text-gray-500 font-medium">{case_.prosecutionStage}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {case_.status}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(case_.dateAssigned).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                      {expandedRowId === case_.id && (
                        <tr className="bg-gray-50/50">
                          <td colSpan={9} className="px-6 py-6 border-b border-gray-100">
                            <div className="ml-10 max-w-5xl">
                              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                                Processing Procedures for {case_.ipType}
                                <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-salmon-50 text-salmon-700 rounded border border-salmon-100">
                                  Current: {case_.status}
                                </span>
                              </h4>
                              <div className="grid grid-cols-4 gap-6">
                                {getProcedureChecklist(case_.ipType).map((stepObj, idx) => {
                                  // Simplified logic for showing step completed vs pending
                                  const stepsOrder = ['IP Audit', 'For Drafting', 'Endorsed to OC', 'For Filing'];
                                  const currentStepIdx = stepsOrder.indexOf(case_.status);
                                  const isCompleted = currentStepIdx > idx || case_.phase === 'IPOPHL Filed';
                                  const isCurrent = currentStepIdx === idx && case_.phase !== 'IPOPHL Filed';

                                  return (
                                    <div key={stepObj.step} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                      <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
                                        {isCompleted ? (
                                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : isCurrent ? (
                                          <Circle className="w-4 h-4 text-salmon-500 fill-salmon-50" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-gray-300" />
                                        )}
                                        <h5 className={`text-sm font-medium ${isCurrent ? 'text-salmon-700' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                                          {idx + 1}. {stepObj.step}
                                        </h5>
                                      </div>
                                      <ul className="space-y-2">
                                        {stepObj.tasks.map((task, tIdx) => (
                                          <li key={tIdx} className="flex items-start gap-2">
                                            <input 
                                              type="checkbox" 
                                              className="mt-0.5 rounded border-gray-300 text-salmon-600 focus:ring-salmon-500" 
                                              checked={isCompleted}
                                              readOnly
                                            />
                                            <span className={`text-xs ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                              {task}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No assigned cases</h3>
              <p className="text-gray-500 max-w-sm mx-auto">You don't have any cases assigned to you matching this filter.</p>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredCases.length} of {mockAssignedCases.length} assigned cases
        </div>
      </div>
    </div>
  );
}
