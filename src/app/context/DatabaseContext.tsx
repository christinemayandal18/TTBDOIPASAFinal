import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Inventor {
  id: string;
  name: string;
  email: string;
  college: string;
  department: string;
  position: string;
  royaltyShare: number;
}

export interface CaseHandlerInfo {
  name: string;
  email: string;
}

export interface Milestone {
  phase: 1 | 2;
  stepIndex: number; // 1-indexed
  completedDate?: string;
  startedDate?: string;
}

export interface Application {
  id: string;
  dateDisclosed: string;
  publicDisclosureDate?: string;
  title: string;
  ipType: string;
  inventorName: string;
  college: string;
  department: string;
  inventors?: Inventor[];
  projectCode?: string;
  status?: string;
  // Progress tracking
  caseHandler?: CaseHandlerInfo;
  preProtectionStep?: number; // current active step (1-indexed); steps before it = accomplished
  preProtectionBlocked?: boolean; // true = current step is in negative "returned by OC" state
  prosecutionStep?: number; // current active prosecution step (1-indexed); 0 = not yet filed
  prosecutionType?: 'patent' | 'patent-to-um' | 'utility-model' | 'trademark' | 'copyright' | 'industrial-design';
  milestones?: Milestone[];
}

interface DatabaseContextType {
  applications: Application[];
  addApplication: (app: Omit<Application, 'id'>) => void;
  removeApplication: (id: string) => void;
}

const defaultApps: Application[] = [
  {
    id: '1',
    dateDisclosed: '2026-05-01',
    publicDisclosureDate: '2026-04-15',
    title: 'Novel Biocontrol Agent from Indigenous Philippine Plants',
    ipType: 'Patent',
    inventorName: 'Dr. Maria Santos',
    college: 'College of Agriculture and Food Science',
    department: 'Institute of Crop Science',
    projectCode: 'PROJ-2026-001',
    status: 'IP Audit',
    caseHandler: { name: 'Atty. Rosa Lim', email: 'rlim@uplb.edu.ph' },
    preProtectionStep: 3,
    preProtectionBlocked: false,
    prosecutionStep: 0,
    prosecutionType: 'patent',
    milestones: [
      { phase: 1, stepIndex: 1, completedDate: '2026-05-01' },
      { phase: 1, stepIndex: 2, completedDate: '2026-05-08' },
      { phase: 1, stepIndex: 3, startedDate: '2026-05-10' },
    ],
    inventors: [
      { id: 'inv-1', name: 'Dr. Maria Santos', email: 'msantos@uplb.edu.ph', college: 'College of Agriculture and Food Science', department: 'Institute of Crop Science', position: 'Professor', royaltyShare: 50 },
      { id: 'inv-2', name: 'Dr. Pedro Garcia', email: 'pgarcia@uplb.edu.ph', college: 'College of Agriculture and Food Science', department: 'Institute of Plant Breeding', position: 'Associate Professor', royaltyShare: 30 },
      { id: 'inv-3', name: 'Ms. Elena Cruz', email: 'ecruz@uplb.edu.ph', college: 'College of Agriculture and Food Science', department: 'Institute of Crop Science', position: 'Research Associate', royaltyShare: 20 }
    ]
  },
  {
    id: '2',
    dateDisclosed: '2026-04-28',
    title: 'UPLB Visual Identity System 2026',
    ipType: 'Trademark',
    inventorName: 'Prof. Juan Dela Cruz',
    college: 'College of Development Communication',
    department: 'Department of Communication Arts',
    projectCode: 'PROJ-2026-002',
    status: 'For Drafting',
    caseHandler: { name: 'Atty. Marco Villanueva', email: 'mvillanueva@uplb.edu.ph' },
    preProtectionStep: 2,
    preProtectionBlocked: false,
    prosecutionStep: 0,
    prosecutionType: 'trademark',
    milestones: [
      { phase: 1, stepIndex: 1, completedDate: '2026-04-28' },
      { phase: 1, stepIndex: 2, startedDate: '2026-05-02' },
    ],
    inventors: [
      { id: 'inv-4', name: 'Prof. Juan Dela Cruz', email: 'jdelacruz@uplb.edu.ph', college: 'College of Development Communication', department: 'Department of Communication Arts', position: 'Professor', royaltyShare: 100 }
    ]
  },
  {
    id: '3',
    dateDisclosed: '2026-04-25',
    publicDisclosureDate: '2026-04-10',
    title: 'Smart Irrigation System Using IoT Sensors',
    ipType: 'Utility Model',
    inventorName: 'Dr. Ana Reyes',
    college: 'College of Engineering and Agro-Industrial Technology',
    department: 'Department of Agricultural and Biosystems Engineering',
    projectCode: 'PROJ-2026-003',
    status: 'Endorsed to OC',
    caseHandler: { name: 'Atty. Rosa Lim', email: 'rlim@uplb.edu.ph' },
    preProtectionStep: 6,
    preProtectionBlocked: false,
    prosecutionStep: 0,
    prosecutionType: 'utility-model',
    milestones: [
      { phase: 1, stepIndex: 1, completedDate: '2026-04-25' },
      { phase: 1, stepIndex: 2, completedDate: '2026-04-30' },
      { phase: 1, stepIndex: 3, completedDate: '2026-05-06' },
      { phase: 1, stepIndex: 4, completedDate: '2026-05-14' },
      { phase: 1, stepIndex: 5, completedDate: '2026-05-20' },
      { phase: 1, stepIndex: 6, startedDate: '2026-05-22' },
    ],
    inventors: [
      { id: 'inv-5', name: 'Dr. Ana Reyes', email: 'areyes@uplb.edu.ph', college: 'College of Engineering and Agro-Industrial Technology', department: 'Department of Agricultural and Biosystems Engineering', position: 'Professor', royaltyShare: 60 },
      { id: 'inv-6', name: 'Engr. Ricardo Tan', email: 'rtan@uplb.edu.ph', college: 'College of Engineering and Agro-Industrial Technology', department: 'Department of Electrical and Electronics Engineering', position: 'Instructor', royaltyShare: 40 }
    ]
  },
  {
    id: '4',
    dateDisclosed: '2026-04-22',
    title: 'Educational Modules for Sustainable Agriculture',
    ipType: 'Copyright',
    inventorName: 'Prof. Carlos Mendoza',
    college: 'College of Agriculture and Food Science',
    department: 'Institute of Agricultural Education',
    projectCode: 'PROJ-2026-004',
    status: 'For Filing',
    caseHandler: { name: 'Atty. Marco Villanueva', email: 'mvillanueva@uplb.edu.ph' },
    preProtectionStep: 4,
    preProtectionBlocked: true,
    prosecutionStep: 0,
    prosecutionType: 'copyright',
    milestones: [
      { phase: 1, stepIndex: 1, completedDate: '2026-04-22' },
      { phase: 1, stepIndex: 2, completedDate: '2026-04-26' },
      { phase: 1, stepIndex: 3, completedDate: '2026-05-03' },
      { phase: 1, stepIndex: 4, startedDate: '2026-05-10' },
    ],
    inventors: [
      { id: 'inv-7', name: 'Prof. Carlos Mendoza', email: 'cmendoza@uplb.edu.ph', college: 'College of Agriculture and Food Science', department: 'Institute of Agricultural Education', position: 'Professor', royaltyShare: 70 },
      { id: 'inv-8', name: 'Dr. Lorna Bautista', email: 'lbautista@uplb.edu.ph', college: 'College of Agriculture and Food Science', department: 'Institute of Agricultural Education', position: 'Associate Professor', royaltyShare: 30 }
    ]
  },
  {
    id: '5',
    dateDisclosed: '2026-04-18',
    title: 'Coconut Waste-Based Biocomposite Material',
    ipType: 'Patent',
    inventorName: 'Dr. Sofia Martinez',
    college: 'College of Forestry and Natural Resources',
    department: 'Department of Forest Products and Paper Science',
    projectCode: 'PROJ-2026-005',
    status: 'Filed at IPOPHL',
    caseHandler: { name: 'Atty. Rosa Lim', email: 'rlim@uplb.edu.ph' },
    preProtectionStep: 7, // beyond last step = all accomplished
    preProtectionBlocked: false,
    prosecutionStep: 3,
    prosecutionType: 'patent',
    milestones: [
      { phase: 1, stepIndex: 1, completedDate: '2026-04-18' },
      { phase: 1, stepIndex: 2, completedDate: '2026-04-24' },
      { phase: 1, stepIndex: 3, completedDate: '2026-05-02' },
      { phase: 1, stepIndex: 4, completedDate: '2026-05-12' },
      { phase: 1, stepIndex: 5, completedDate: '2026-05-19' },
      { phase: 1, stepIndex: 6, completedDate: '2026-05-28' },
      { phase: 2, stepIndex: 1, completedDate: '2026-06-03' },
      { phase: 2, stepIndex: 2, completedDate: '2026-06-10' },
      { phase: 2, stepIndex: 3, startedDate: '2026-06-15' },
    ],
    inventors: [
      { id: 'inv-9', name: 'Dr. Sofia Martinez', email: 'smartinez@uplb.edu.ph', college: 'College of Forestry and Natural Resources', department: 'Department of Forest Products and Paper Science', position: 'Professor', royaltyShare: 45 },
      { id: 'inv-10', name: 'Dr. Ramon Santos', email: 'rsantos@uplb.edu.ph', college: 'College of Forestry and Natural Resources', department: 'Department of Forest Products and Paper Science', position: 'Professor', royaltyShare: 35 },
      { id: 'inv-11', name: 'Mr. Jorge Villar', email: 'jvillar@uplb.edu.ph', college: 'College of Engineering and Agro-Industrial Technology', department: 'Department of Chemical Engineering', position: 'Research Assistant', royaltyShare: 20 }
    ]
  }
];

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>(defaultApps);

  const addApplication = (app: Omit<Application, 'id'>) => {
    const newApp = {
      ...app,
      id: Math.random().toString(36).substr(2, 9)
    };
    setApplications(prev => [newApp, ...prev]);
  };

  const removeApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };

  return (
    <DatabaseContext.Provider value={{ applications, addApplication, removeApplication }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
