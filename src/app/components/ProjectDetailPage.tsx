import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ChevronDown, ChevronUp, Check, AlertTriangle, User, Mail, Users } from 'lucide-react';
import UserNav from './UserNav';
import { useDatabase, Application, Milestone } from '../context/DatabaseContext';

// ─── Step Definitions ────────────────────────────────────────────────────────

interface StepDef {
  id: number;
  positive: string; // accomplished label
  negative: string; // ongoing/blocked label
  conditional?: boolean;
}

const PRE_PROTECTION_STEPS: Record<string, StepDef[]> = {
  Patent: [
    { id: 1, positive: 'Submitted', negative: 'Incomplete' },
    { id: 2, positive: 'Case Handler Assigned', negative: 'For Assignment' },
    { id: 3, positive: 'Prior Art Search Done', negative: 'Under Evaluation' },
    { id: 4, positive: 'Draft Done', negative: 'For Drafting' },
    { id: 5, positive: 'Endorsed to OC', negative: 'For Endorsement' },
    { id: 6, positive: 'Filed for Patent', negative: 'For Filing — Returned by OC' },
  ],
  'Utility Model': [
    { id: 1, positive: 'Submitted', negative: 'Incomplete' },
    { id: 2, positive: 'Case Handler Assigned', negative: 'For Assignment' },
    { id: 3, positive: 'Prior Art Search Done', negative: 'Under Evaluation' },
    { id: 4, positive: 'Draft Done', negative: 'For Drafting' },
    { id: 5, positive: 'Endorsed to OC', negative: 'For Endorsement' },
    { id: 6, positive: 'Filed for Utility Model', negative: 'For Filing — Returned by OC' },
  ],
  Copyright: [
    { id: 1, positive: 'Submitted', negative: 'Incomplete' },
    { id: 2, positive: 'Case Handler Assigned', negative: 'For Assignment' },
    { id: 3, positive: 'Endorsed to OC', negative: 'Under Review' },
    { id: 4, positive: 'Filed for Copyright', negative: 'For Filing — Returned by OC' },
  ],
  Trademark: [
    { id: 1, positive: 'Submitted', negative: 'Incomplete' },
    { id: 2, positive: 'Case Handler Assigned', negative: 'For Assignment' },
    { id: 3, positive: 'Endorsed to OC', negative: 'Under Review' },
    { id: 4, positive: 'Filed for Trademark', negative: 'For Filing — Returned by OC' },
  ],
};

const PROSECUTION_STEPS: Record<string, StepDef[]> = {
  patent: [
    { id: 1, positive: 'Filing of Patent Application', negative: 'Filing of Patent Application' },
    { id: 2, positive: 'Filing Date Accorded', negative: 'Awaiting Filing Date' },
    { id: 3, positive: 'Formality Examination Report', negative: 'Formality Examination Pending' },
    { id: 4, positive: 'Subsequent Formality Examination', negative: 'Subsequent Formality Exam Pending', conditional: true },
    { id: 5, positive: 'First Publication', negative: 'Awaiting First Publication' },
    { id: 6, positive: 'Request for Substantive Examination', negative: 'Substantive Exam Not Yet Requested' },
    { id: 7, positive: 'Substantive Examination Report', negative: 'Substantive Examination Ongoing' },
    { id: 8, positive: 'Subsequent Substantive Examination', negative: 'Subsequent Substantive Exam Pending', conditional: true },
    { id: 9, positive: 'Notice of Allowance', negative: 'Awaiting Notice of Allowance' },
    { id: 10, positive: 'Final Requirements Completed', negative: 'Completing Final Requirements' },
    { id: 11, positive: 'Second Publication', negative: 'Awaiting Second Publication' },
    { id: 12, positive: 'Letters Patent Certificate Issued', negative: 'Certificate Issuance Pending' },
    { id: 13, positive: 'Annuities Paid', negative: 'Annuity Payment Pending' },
  ],
  'patent-to-um': [
    { id: 1, positive: 'Filing of Patent Application', negative: 'Filing of Patent Application' },
    { id: 2, positive: 'Filing Date Accorded', negative: 'Awaiting Filing Date' },
    { id: 3, positive: 'Formality Examination Report', negative: 'Formality Examination Pending' },
    { id: 4, positive: 'Subsequent Formality Examination', negative: 'Subsequent Formality Exam Pending', conditional: true },
    { id: 5, positive: 'First Publication', negative: 'Awaiting First Publication' },
    { id: 6, positive: 'Request for Substantive Examination', negative: 'Substantive Exam Not Yet Requested' },
    { id: 7, positive: 'Substantive Examination Report', negative: 'Substantive Examination Ongoing' },
    { id: 8, positive: 'Subsequent Substantive Examination', negative: 'Subsequent Substantive Exam Pending', conditional: true },
    { id: 9, positive: 'Notice of Final Refusal', negative: 'Awaiting Final Refusal Notice' },
    { id: 10, positive: 'Request to Convert to Utility Model', negative: 'Conversion Request Pending' },
    { id: 11, positive: 'Order to Grant Request', negative: 'Awaiting Order to Grant' },
    { id: 12, positive: 'Formality Examination Report (UM)', negative: 'UM Formality Exam Pending' },
    { id: 13, positive: 'Subsequent Formality Examination (UM)', negative: 'Subsequent UM Formality Pending', conditional: true },
    { id: 14, positive: 'Notice of Publication', negative: 'Awaiting Publication Notice' },
    { id: 15, positive: 'Certificate of Utility Model Issued', negative: 'Certificate Issuance Pending' },
  ],
  'utility-model': [
    { id: 1, positive: 'Filing of Utility Model Application', negative: 'Application Filed' },
    { id: 2, positive: 'Filing Date Accorded', negative: 'Awaiting Filing Date' },
    { id: 3, positive: 'Formality Examination Report', negative: 'Formality Examination Pending' },
    { id: 4, positive: 'Subsequent Formality Examination', negative: 'Subsequent Formality Pending', conditional: true },
    { id: 5, positive: 'Notice of Publication', negative: 'Awaiting Publication Notice' },
    { id: 6, positive: 'Certificate of Utility Model Issued', negative: 'Certificate Issuance Pending' },
  ],
  trademark: [
    { id: 1, positive: 'Filing of Trademark Application', negative: 'Application Filed' },
    { id: 2, positive: 'Filing Date Accorded', negative: 'Awaiting Filing Date' },
    { id: 3, positive: 'Registrability Report', negative: 'Registrability Examination Pending' },
    { id: 4, positive: 'Subsequent Action Resolved', negative: 'Subsequent Action Pending', conditional: true },
    { id: 5, positive: 'Notice of Allowance', negative: 'Awaiting Notice of Allowance' },
    { id: 6, positive: 'Certificate of Registration Issued', negative: 'Certificate Issuance Pending' },
  ],
  copyright: [
    { id: 1, positive: 'Filing of Copyright Application', negative: 'Application Filed' },
    { id: 2, positive: 'Claim Stub Issued', negative: 'Awaiting Claim Stub' },
    { id: 3, positive: 'Certificate of Registration Issued', negative: 'Certificate Issuance Pending' },
  ],
};

// Summary buckets for Phase 2 (shown by default, collapsed detail)
const PROSECUTION_SUMMARY = [
  { label: 'Filed', description: 'Application officially filed with IPOPHL' },
  { label: 'Under Examination', description: 'Formality and substantive examination ongoing' },
  { label: 'Allowance / Publication', description: 'Notice of Allowance or Publication received' },
  { label: 'Certificate Issued', description: 'IP protection certificate granted' },
];

// Map prosecution step to summary bucket index (0-3)
function getProsecutionSummaryBucket(prosecutionType: string, stepIndex: number): number {
  const steps = PROSECUTION_STEPS[prosecutionType] || [];
  const total = steps.length;
  if (total === 0) return 0;
  const ratio = stepIndex / total;
  if (ratio <= 0.2) return 0;
  if (ratio <= 0.65) return 1;
  if (ratio <= 0.85) return 2;
  return 3;
}

// ─── Helper: find milestone date for a step ───────────────────────────────────

function getMilestone(milestones: Milestone[] | undefined, phase: 1 | 2, stepIndex: number) {
  return milestones?.find(m => m.phase === phase && m.stepIndex === stepIndex);
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Step state type ──────────────────────────────────────────────────────────

type StepState = 'accomplished' | 'ongoing' | 'blocked' | 'pending';

function getPreProtectionStepState(
  stepId: number,
  currentStep: number,
  blocked: boolean
): StepState {
  if (stepId < currentStep) return 'accomplished';
  if (stepId === currentStep) return blocked ? 'blocked' : 'ongoing';
  return 'pending';
}

function getProsecutionStepState(stepId: number, currentStep: number): StepState {
  if (currentStep === 0) return 'pending';
  if (stepId < currentStep) return 'accomplished';
  if (stepId === currentStep) return 'ongoing';
  return 'pending';
}

// ─── IP Type Badge ────────────────────────────────────────────────────────────

const IP_TYPE_COLORS: Record<string, string> = {
  Patent: 'bg-blue-50 text-blue-700 border-blue-200',
  'Utility Model': 'bg-purple-50 text-purple-700 border-purple-200',
  Copyright: 'bg-green-50 text-green-700 border-green-200',
  Trademark: 'bg-amber-50 text-amber-700 border-amber-200',
};

function IpTypeBadge({ ipType }: { ipType: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${IP_TYPE_COLORS[ipType] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {ipType}
    </span>
  );
}

// ─── Step node visual ─────────────────────────────────────────────────────────

function StepNode({ state, small = false }: { state: StepState; small?: boolean }) {
  const size = small ? 'w-5 h-5' : 'w-8 h-8';
  const iconSize = small ? 'w-3 h-3' : 'w-4 h-4';

  if (state === 'accomplished') {
    return (
      <div className={`${size} rounded-full bg-[#8d1436] flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Check className={`${iconSize} text-white stroke-[3]`} />
      </div>
    );
  }
  if (state === 'ongoing') {
    return (
      <div className={`${size} rounded-full border-2 border-[#8d1436] bg-white flex items-center justify-center flex-shrink-0 relative`}>
        <div className="w-2 h-2 rounded-full bg-[#8d1436] animate-pulse" />
      </div>
    );
  }
  if (state === 'blocked') {
    return (
      <div className={`${size} rounded-full border-2 border-amber-500 bg-amber-50 flex items-center justify-center flex-shrink-0`}>
        <AlertTriangle className={`${iconSize} text-amber-500`} />
      </div>
    );
  }
  // pending
  return (
    <div className={`${size} rounded-full border-2 border-gray-300 bg-white flex items-center justify-center flex-shrink-0`} />
  );
}

// ─── Connector line between steps ─────────────────────────────────────────────

function HorizontalConnector({ state }: { state: 'solid' | 'dashed' | 'gray' }) {
  if (state === 'solid') return <div className="flex-1 h-0.5 bg-[#8d1436] mx-1" />;
  if (state === 'dashed') return <div className="flex-1 h-0.5 border-t-2 border-dashed border-[#8d1436] mx-1" />;
  return <div className="flex-1 h-0.5 bg-gray-200 mx-1" />;
}

function connectorState(leftState: StepState, _rightState: StepState): 'solid' | 'dashed' | 'gray' {
  if (leftState === 'accomplished') return 'solid';
  if (leftState === 'ongoing' || leftState === 'blocked') return 'dashed';
  return 'gray';
}

// ─── Status chip ──────────────────────────────────────────────────────────────

function StatusChip({ state, label }: { state: StepState; label: string }) {
  if (state === 'accomplished') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#8d1436] text-white">Done</span>;
  }
  if (state === 'ongoing') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border border-[#8d1436] text-[#8d1436] bg-white">{label}</span>;
  }
  if (state === 'blocked') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border border-amber-500 text-amber-700 bg-amber-50">Returned</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border border-gray-300 text-gray-400 bg-white">Pending</span>;
}

// ─── Phase 1: Horizontal Stepper ─────────────────────────────────────────────

function PreProtectionStepper({ app }: { app: Application }) {
  const steps = PRE_PROTECTION_STEPS[app.ipType] || PRE_PROTECTION_STEPS['Patent'];
  const currentStep = app.preProtectionStep ?? 1;
  const blocked = app.preProtectionBlocked ?? false;

  const currentStepDef = steps.find(s => s.id === currentStep);
  const isFullyComplete = currentStep > steps.length;

  const currentStatusLabel = isFullyComplete
    ? steps[steps.length - 1].positive
    : blocked
    ? currentStepDef?.negative
    : currentStepDef?.negative;

  const currentStatusDescription = isFullyComplete
    ? 'All pre-protection steps have been completed. Your case has been filed with IPOPHL.'
    : blocked
    ? 'The filing documents were returned by OC and require revision before re-submission.'
    : currentStep === 1
    ? 'Your disclosure has been submitted. The TTBDO team is reviewing the completeness of your submission.'
    : currentStep === 2
    ? 'A case handler is being assigned to your application. You will be notified once assigned.'
    : `Your case handler is currently working on this step. No action is required from you at this time.`;

  return (
    <div>
      {/* Stepper nodes */}
      <div className="flex items-center w-full mb-6 px-2">
        {steps.map((step, index) => {
          const state = isFullyComplete
            ? 'accomplished'
            : getPreProtectionStepState(step.id, currentStep, blocked);
          const nextState = index < steps.length - 1
            ? (isFullyComplete ? 'accomplished' : getPreProtectionStepState(steps[index + 1].id, currentStep, blocked))
            : 'pending';

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                <StepNode state={state} />
                <span className={`text-xs text-center leading-tight max-w-[80px] font-medium ${
                  state === 'accomplished' ? 'text-gray-700' :
                  state === 'ongoing' ? 'text-[#8d1436]' :
                  state === 'blocked' ? 'text-amber-700' :
                  'text-gray-400'
                }`}>
                  {state === 'accomplished' || isFullyComplete ? step.positive : step.negative}
                </span>
                {/* Date */}
                <span className="text-[10px] text-gray-400 text-center leading-tight max-w-[80px]">
                  {(() => {
                    const m = getMilestone(app.milestones, 1, step.id);
                    if (m?.completedDate) return formatDate(m.completedDate);
                    if (m?.startedDate && (state === 'ongoing' || state === 'blocked')) return `Since ${formatDate(m.startedDate)}`;
                    return '';
                  })()}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mt-[-28px] mx-1">
                  <HorizontalConnector state={connectorState(state, nextState as StepState)} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status card */}
      <div className={`rounded-lg p-4 border ${
        isFullyComplete ? 'bg-green-50 border-green-200' :
        blocked ? 'bg-amber-50 border-amber-200' :
        'bg-[#fdf0f3] border-[#e99ab2]'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
            isFullyComplete ? 'bg-green-500' :
            blocked ? 'bg-amber-500' :
            'bg-[#8d1436] animate-pulse'
          }`} />
          <div>
            <p className={`text-sm font-semibold mb-0.5 ${
              isFullyComplete ? 'text-green-800' :
              blocked ? 'text-amber-800' :
              'text-gray-900'
            }`}>
              Current Status: {isFullyComplete ? steps[steps.length - 1].positive : (blocked ? currentStepDef?.negative : currentStepDef?.negative)}
            </p>
            <p className="text-sm text-gray-600">{currentStatusDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phase 2: Prosecution Stepper ────────────────────────────────────────────

function ProsecutionStepper({ app }: { app: Application }) {
  const [expanded, setExpanded] = useState(false);
  const prosecutionType = app.prosecutionType || 'patent';
  const steps = PROSECUTION_STEPS[prosecutionType] || PROSECUTION_STEPS['patent'];
  const currentStep = app.prosecutionStep ?? 0;

  // Determine summary bucket progress
  const activeSummaryBucket = currentStep === 0 ? -1 : getProsecutionSummaryBucket(prosecutionType, currentStep);

  return (
    <div>
      {/* Summary buckets */}
      <div className="flex items-center w-full mb-6 px-2">
        {PROSECUTION_SUMMARY.map((bucket, index) => {
          const isAccomplished = index < activeSummaryBucket;
          const isActive = index === activeSummaryBucket;
          const state: StepState = isAccomplished ? 'accomplished' : isActive ? 'ongoing' : 'pending';

          return (
            <div key={bucket.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <StepNode state={state} />
                <span className={`text-xs text-center leading-tight max-w-[72px] font-medium ${
                  state === 'accomplished' ? 'text-gray-700' :
                  state === 'ongoing' ? 'text-[#8d1436]' :
                  'text-gray-400'
                }`}>{bucket.label}</span>
              </div>
              {index < PROSECUTION_SUMMARY.length - 1 && (
                <div className="flex-1 mt-[-28px] mx-1">
                  <HorizontalConnector state={connectorState(state, 'pending')} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expand / collapse full timeline */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-4 group"
      >
        <span className="underline underline-offset-2 decoration-gray-300 group-hover:decoration-gray-600">
          {expanded ? 'Hide full IPOPHL timeline' : 'See full IPOPHL timeline'}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {steps.map((step, index) => {
            const state = getProsecutionStepState(step.id, currentStep);
            const m = getMilestone(app.milestones, 2, step.id);
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className={`flex gap-4 p-4 ${!isLast ? 'border-b border-gray-100' : ''} ${
                state === 'accomplished' ? 'bg-white' :
                state === 'ongoing' ? 'bg-[#fdf0f3]' :
                'bg-gray-50'
              }`}>
                {/* Vertical connector + node */}
                <div className="flex flex-col items-center gap-0 flex-shrink-0">
                  <StepNode state={state} small />
                  {!isLast && (
                    <div className={`w-px flex-1 mt-1 ${state === 'accomplished' ? 'bg-[#8d1436]' : 'bg-gray-200'}`} style={{ minHeight: 12 }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${
                          state === 'accomplished' ? 'text-gray-800' :
                          state === 'ongoing' ? 'text-gray-900' :
                          'text-gray-400'
                        }`}>
                          {state === 'accomplished' ? step.positive : step.positive}
                        </span>
                        {step.conditional && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">if applicable</span>
                        )}
                      </div>
                      {state !== 'pending' && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {m?.completedDate ? `Completed ${formatDate(m.completedDate)}` :
                           m?.startedDate ? `Started ${formatDate(m.startedDate)}` : ''}
                        </p>
                      )}
                    </div>
                    <StatusChip state={state} label="In Progress" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Case Handler Card ────────────────────────────────────────────────────────

function CaseHandlerCard({ app }: { app: Application }) {
  if (!app.caseHandler) return null;
  const initials = app.caseHandler.name.split(' ').filter(w => /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0]).join('');

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-10 h-10 rounded-full bg-[#8d1436] flex items-center justify-center flex-shrink-0">
        <span className="text-white text-sm font-bold">{initials}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Case Handler</p>
        <p className="text-sm font-semibold text-gray-900">{app.caseHandler.name}</p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Mail className="w-3 h-3" />
          {app.caseHandler.email}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applications } = useDatabase();
  const [activePhase, setActivePhase] = useState<'pre-protection' | 'prosecution'>('pre-protection');

  const app = applications.find(a => a.id === id);

  if (!app) {
    return (
      <div className="min-h-screen bg-gray-50 flex pt-14">
        <UserNav />
        <div className="max-w-[900px] flex-1 min-w-0 p-8 text-center">
          <p className="text-gray-500">Project not found.</p>
          <button onClick={() => navigate('/inventor/projects')} className="mt-4 text-[#8d1436] text-sm font-medium underline">
            Back to My Projects
          </button>
        </div>
      </div>
    );
  }

  const isFiled = (app.preProtectionStep ?? 0) > (PRE_PROTECTION_STEPS[app.ipType]?.length ?? 6);
  const hasProsecution = isFiled && (app.prosecutionStep ?? 0) > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <UserNav />

      <div className="max-w-[900px] flex-1 min-w-0 p-8">
        {/* Back link */}
        <button
          onClick={() => navigate('/inventor/projects')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to My Projects
        </button>

        {/* Project header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#fdf0f3] to-white px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <IpTypeBadge ipType={app.ipType} />
                  {app.projectCode && (
                    <span className="text-xs text-gray-400 font-mono">{app.projectCode}</span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{app.title}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                  <span>{app.college}</span>
                  <span className="text-gray-300">·</span>
                  <span>{app.department}</span>
                  <span className="text-gray-300">·</span>
                  <span>Disclosed {formatDate(app.dateDisclosed)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Case handler + inventor summary */}
          <div className="px-6 py-4 flex flex-wrap gap-4">
            <CaseHandlerCard app={app} />
            {app.inventors && app.inventors.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Inventors</p>
                  <p className="text-sm font-semibold text-gray-900">{app.inventors.length} inventor{app.inventors.length > 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-500">{app.inventors.map(i => i.name.split(' ').slice(-1)[0]).join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Phase tab bar + stepper card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActivePhase('pre-protection')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
                activePhase === 'pre-protection'
                  ? 'border-[#8d1436] text-[#8d1436] bg-[#fdf0f3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Pre-Protection
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-[#8d1436]/10 text-[#8d1436] font-medium">
                Phase 1
              </span>
            </button>
            <button
              onClick={() => isFiled ? setActivePhase('prosecution') : undefined}
              disabled={!isFiled}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
                !isFiled
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : activePhase === 'prosecution'
                  ? 'border-[#8d1436] text-[#8d1436] bg-[#fdf0f3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              IPOPHL Prosecution
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                isFiled ? 'bg-[#8d1436]/10 text-[#8d1436]' : 'bg-gray-100 text-gray-400'
              }`}>
                Phase 2
              </span>
              {!isFiled && (
                <span className="ml-2 text-[10px] text-gray-300 font-normal">· Unlocks after filing</span>
              )}
            </button>
          </div>

          {/* Stepper content */}
          <div className="p-6">
            {activePhase === 'pre-protection' && (
              <PreProtectionStepper app={app} />
            )}
            {activePhase === 'prosecution' && isFiled && (
              <ProsecutionStepper app={app} />
            )}
          </div>
        </div>

        {/* Royalty allocation table */}
        {app.inventors && app.inventors.length > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8d1436]" />
                Royalty Allocation
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventor</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Department</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {app.inventors.map(inventor => (
                    <tr key={inventor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">{inventor.name}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{inventor.position}</td>
                      <td className="px-5 py-3 text-sm text-gray-600 hidden md:table-cell">{inventor.department}</td>
                      <td className="px-5 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-[#8d1436]" style={{ width: `${inventor.royaltyShare}%` }} />
                          </div>
                          <span className="font-bold text-gray-900 w-10 text-right">{inventor.royaltyShare}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-5 py-3 text-xs font-bold text-gray-600 uppercase text-right hidden md:table-cell">Total</td>
                    <td colSpan={3} className="px-5 py-3 text-xs font-bold text-gray-600 uppercase text-right md:hidden">Total</td>
                    <td className="px-5 py-3 text-sm font-bold text-gray-900 text-right">
                      {app.inventors.reduce((s, i) => s + i.royaltyShare, 0)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
