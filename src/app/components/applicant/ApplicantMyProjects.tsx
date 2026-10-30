import { useRef, useState } from 'react';
import { BarChart2, MessageSquare, Send, X, Paperclip, ChevronRight, Bell, CheckCircle } from 'lucide-react';
import ApplicantNav from './ApplicantNav';

interface ResponseReply { id: string; author: 'handler' | 'applicant'; text: string; date: string; attachmentName?: string; }
interface ResponseRequest { id: string; message: string; requestDate: string; status: 'pending' | 'active' | 'closed'; thread?: ResponseReply[]; }

interface Project {
  id: string; title: string; ipType: string; progress: number; stage: string;
  handler: string; responseRequests?: ResponseRequest[];
}

const mockProjects: Project[] = [
  {
    id: 'PRE-2026-012', title: 'Novel Bamboo Composite Board for Construction', ipType: 'Utility Model', progress: 33, stage: 'Under Evaluation', handler: 'Ana Reyes',
    responseRequests: [{ id: 'rr1', message: 'Please provide the complete list of inventors and their respective contributions to the invention. Also attach the most recent laboratory test report confirming the material strength claims.', requestDate: '2026-07-08T10:00:00', status: 'pending', thread: [] }],
  },
  { id: 'PRE-2026-008', title: 'Field Guide to Philippine Endemic Orchids', ipType: 'Copyright', progress: 50, stage: 'Under Review', handler: 'Tristan Perez-Navarro' },
  { id: 'PRE-2025-038', title: 'Training Manual on Organic Composting', ipType: 'Copyright', progress: 75, stage: 'Endorsed to OC', handler: 'Maria Santos' },
  { id: 'PRE-2025-044', title: 'Low-Cost Water Quality Testing Kit', ipType: 'Utility Model', progress: 100, stage: 'Filed', handler: 'Samuel Mendoza' },
];

const IP_TYPE_BADGE: Record<string, string> = {
  Patent: 'bg-blue-100 text-blue-800', 'Utility Model': 'bg-purple-100 text-purple-800',
  'Industrial Design': 'bg-indigo-100 text-indigo-800', Trademark: 'bg-green-100 text-green-800', Copyright: 'bg-yellow-100 text-yellow-800',
};

function ReplyModal({ project, rr, onClose, onSubmit }: { project: Project; rr: ResponseRequest; onClose: () => void; onSubmit: (text: string, attachmentName?: string) => void }) {
  const [reply, setReply] = useState('');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thread = rr.thread ?? [];
  const needsReply = thread.length === 0 || thread[thread.length - 1].author === 'handler';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#8d1436]" />
              <h2 className="text-base font-bold text-gray-900">Response Thread</h2>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${rr.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                {rr.status === 'pending' ? 'Awaiting your reply' : 'Active'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{project.title}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thread history */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/50">
          {/* Opening message from handler */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#8d1436]/15 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-[#8d1436]">CH</div>
            <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[11px] font-semibold text-[#8d1436]">{project.handler}</span>
                <span className="text-[10px] text-gray-400">{new Date(rr.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">{rr.message}</p>
            </div>
          </div>

          {/* Thread replies */}
          {thread.map(reply => (
            <div key={reply.id} className={`flex items-start gap-2.5 ${reply.author === 'applicant' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${reply.author === 'applicant' ? 'bg-green-100 text-green-700' : 'bg-[#8d1436]/15 text-[#8d1436]'}`}>
                {reply.author === 'applicant' ? 'YOU' : 'CH'}
              </div>
              <div className={`flex-1 max-w-[85%] rounded-xl px-3 py-2.5 shadow-sm ${reply.author === 'applicant' ? 'bg-[#8d1436] text-white' : 'bg-white border border-gray-200'}`}>
                <div className={`flex items-center gap-1.5 mb-1 ${reply.author === 'applicant' ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-[11px] font-semibold ${reply.author === 'applicant' ? 'text-white/90' : 'text-[#8d1436]'}`}>{reply.author === 'applicant' ? 'You' : project.handler}</span>
                  <span className={`text-[10px] ${reply.author === 'applicant' ? 'text-white/60' : 'text-gray-400'}`}>{new Date(reply.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <p className={`text-sm leading-relaxed ${reply.author === 'applicant' ? 'text-white' : 'text-gray-800'}`}>{reply.text}</p>
                {reply.attachmentName && (
                  <div className={`mt-1.5 flex items-center gap-1 text-[10px] font-medium ${reply.author === 'applicant' ? 'text-white/80' : 'text-green-600'}`}>
                    <Paperclip className="w-3 h-3 flex-shrink-0" />
                    {reply.attachmentName}
                    {reply.author === 'applicant' && <span className="ml-1 opacity-70">(uploaded to folder)</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Reply input */}
        {needsReply && (
          <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-white space-y-3">
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              rows={3}
              placeholder="Type your reply..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] resize-none"
            />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" className="hidden" onChange={e => setAttachedFile(e.target.files?.[0]?.name ?? null)} />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#8d1436] font-medium transition-colors">
                  <Paperclip className="w-3.5 h-3.5" />
                  {attachedFile ? <span className="text-[#8d1436] truncate max-w-[140px]">{attachedFile}</span> : 'Attach file'}
                </button>
                {attachedFile && <button onClick={() => setAttachedFile(null)} className="text-gray-400 hover:text-gray-600"><X className="w-3 h-3" /></button>}
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button
                  onClick={() => { if (reply.trim()) { onSubmit(reply, attachedFile ?? undefined); onClose(); } }}
                  disabled={!reply.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130] transition-colors font-semibold disabled:opacity-40"
                >
                  <Send className="w-3 h-3" /> Send Reply
                </button>
              </div>
            </div>
            {attachedFile && (
              <p className="text-[10px] text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Attachment will be auto-uploaded to your shared view folder.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicantMyProjects() {
  const [projects, setProjects] = useState(mockProjects);
  const [replyTarget, setReplyTarget] = useState<{ project: Project; rr: ResponseRequest } | null>(null);

  const handleSubmitReply = (projectId: string, rrId: string, text: string, attachmentName?: string) => {
    const reply: ResponseReply = { id: `rpl-${Date.now()}`, author: 'applicant', text, date: new Date().toISOString(), attachmentName };
    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      responseRequests: (p.responseRequests ?? []).map(r => r.id === rrId ? { ...r, status: 'active' as const, thread: [...(r.thread ?? []), reply] } : r),
    } : p));
  };

  const pendingCount = projects.reduce((sum, p) => sum + (p.responseRequests ?? []).filter(r => r.status === 'pending' || r.status === 'active').length, 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <ApplicantNav />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Projects</h1>
          <p className="text-gray-600 text-sm">View progress and respond to requests from your case handler</p>
        </div>

        {pendingCount > 0 && (
          <div className="mb-5 bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <Bell className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-900">{pendingCount} pending response request{pendingCount > 1 ? 's' : ''} from your case handler</p>
              <p className="text-xs text-orange-700 mt-0.5">Please respond to keep your application moving forward.</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {projects.map(project => {
            const pendingRR = (project.responseRequests ?? []).find(r => r.status === 'pending' || r.status === 'active');
            const closedRR = (project.responseRequests ?? []).filter(r => r.status === 'closed');
            const isComplete = project.progress === 100;
            return (
              <div key={project.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${pendingRR ? 'border-orange-300' : 'border-gray-200'}`}>
                {pendingRR && (
                  <div className="bg-orange-50 border-b border-orange-200 px-5 py-3 flex items-center gap-3">
                    <Bell className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <p className="text-xs text-orange-900 font-semibold flex-1">Your case handler has requested additional information.</p>
                    <button onClick={() => setReplyTarget({ project, rr: pendingRR })} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                      <MessageSquare className="w-3 h-3" /> Respond
                    </button>
                  </div>
                )}
                <div className="px-5 py-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold text-[#8d1436]">{project.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${IP_TYPE_BADGE[project.ipType] ?? 'bg-gray-100 text-gray-700'}`}>{project.ipType}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{project.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Handler: {project.handler} · {project.stage}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-bold flex-shrink-0">
                      {isComplete ? <CheckCircle className="w-4 h-4 text-green-600" /> : <BarChart2 className="w-4 h-4 text-[#8d1436]" />}
                      <span className={isComplete ? 'text-green-600' : 'text-[#8d1436]'}>{project.progress}%</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-[#8d1436]'}`} style={{ width: `${project.progress}%` }} />
                  </div>
                  {/* Closed thread history */}
                  {closedRR.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Closed Threads</p>
                      {closedRR.map(r => (
                        <div key={r.id} className="flex items-start gap-2 text-xs text-gray-600">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{r.thread?.length ?? 0} message{(r.thread?.length ?? 0) !== 1 ? 's' : ''} · closed {new Date(r.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <button className="ml-auto flex items-center gap-0.5 text-[#8d1436] font-semibold hover:underline flex-shrink-0">View <ChevronRight className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {replyTarget && (
        <ReplyModal
          project={replyTarget.project}
          rr={replyTarget.rr}
          onClose={() => setReplyTarget(null)}
          onSubmit={(text, attachmentName) => handleSubmitReply(replyTarget.project.id, replyTarget.rr.id, text, attachmentName)}
        />
      )}
    </div>
  );
}
