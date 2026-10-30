import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Bell, AlertTriangle, FileText, ChevronLeft, ChevronRight, X } from 'lucide-react';
import CaseHandlerNav from '../CaseHandlerNav';

interface CalendarEvent {
  id: string; date: string; title: string; type: 'deadline' | 'review' | 'filing' | 'meeting'; caseId?: string;
}
interface FeedItem {
  id: string; timestamp: string; type: 'remark' | 'action' | 'assignment' | 'warning'; message: string; caseId?: string;
}
interface MyCaseSummary {
  id: string; title: string; stage: string; ipType: string; status: string; deadlineDate?: string;
}

const MY_EVENTS: CalendarEvent[] = [
  { id: 'e1', date: '2026-07-12', title: 'PRE-2026-004 Response Deadline', type: 'deadline', caseId: 'PRE-2026-004' },
  { id: 'e2', date: '2026-07-15', title: 'PRE-2026-001 Draft Review', type: 'review', caseId: 'PRE-2026-001' },
  { id: 'e3', date: '2026-07-18', title: 'P-001 Substantive Exam Report Due', type: 'deadline', caseId: 'P-001' },
  { id: 'e4', date: '2026-07-25', title: 'PRE-2026-008 Response Deadline', type: 'deadline', caseId: 'PRE-2026-008' },
  { id: 'e5', date: '2026-07-28', title: 'Monthly Case Review Meeting', type: 'meeting' },
];

const MY_FEED: FeedItem[] = [
  { id: 'f1', timestamp: '2026-07-12T09:30:00', type: 'warning', message: 'PRE-2026-004 deadline is today. Respond promptly.', caseId: 'PRE-2026-004' },
  { id: 'f2', timestamp: '2026-07-12T08:15:00', type: 'assignment', message: 'You have been assigned a new case: PRE-2026-011.', caseId: 'PRE-2026-011' },
  { id: 'f3', timestamp: '2026-07-11T15:40:00', type: 'remark', message: 'Admin added a remark on PRE-2026-001: "Please expedite the draft."', caseId: 'PRE-2026-001' },
  { id: 'f4', timestamp: '2026-07-11T10:20:00', type: 'action', message: 'You advanced PRE-2026-003 to "Endorsed to OC".', caseId: 'PRE-2026-003' },
  { id: 'f5', timestamp: '2026-07-10T14:05:00', type: 'warning', message: 'PRE-2026-008 deadline approaching in 15 days.', caseId: 'PRE-2026-008' },
  { id: 'f6', timestamp: '2026-07-10T09:30:00', type: 'remark', message: 'Applicant responded to your document request on PRE-2026-001.', caseId: 'PRE-2026-001' },
];

const MY_CASES: MyCaseSummary[] = [
  { id: 'PRE-2026-001', title: 'Smart Irrigation System Using IoT Sensors', stage: 'Prior Art Search', ipType: 'Patent', status: 'In Progress', deadlineDate: '2026-07-15' },
  { id: 'PRE-2026-004', title: 'UPLB Web Accessibility Monitoring Tool', stage: 'Draft Done', ipType: 'Copyright', status: 'Response Needed', deadlineDate: '2026-07-12' },
  { id: 'P-001', title: 'Novel Biocontrol Agent from Indigenous Philippine Plants', stage: 'Substantive Examination', ipType: 'Patent', status: 'Active' },
  { id: 'PRE-2026-008', title: 'Field Guide to Philippine Endemic Orchids', stage: 'Submitted', ipType: 'Copyright', status: 'In Progress', deadlineDate: '2026-07-25' },
  { id: 'PRE-2026-011', title: 'Bamboo-Based Composite Materials for Construction', stage: 'Case Handler Assigned', ipType: 'Patent', status: 'New' },
];

const FEED_COLORS: Record<string, string> = {
  warning: 'bg-amber-100 text-amber-700', action: 'bg-blue-100 text-blue-700',
  remark: 'bg-purple-100 text-purple-700', assignment: 'bg-green-100 text-green-700',
};
const STATUS_COLORS: Record<string, string> = {
  'New': 'bg-blue-100 text-blue-800', 'In Progress': 'bg-gray-100 text-gray-700',
  'Active': 'bg-green-100 text-green-800', 'Response Needed': 'bg-amber-100 text-amber-800',
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CHHomePage() {
  const today = new Date('2026-07-12');
  const navigate = useNavigate();
  const handlerName = (() => { try { return localStorage.getItem('ch_name') || 'Case Handler'; } catch { return 'Case Handler'; } })();
  const firstName = handlerName.split(' ')[0];

  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calModalDate, setCalModalDate] = useState<string | null>(null);

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  const eventsByDate: Record<string, CalendarEvent[]> = {};
  MY_EVENTS.forEach(e => { if (!eventsByDate[e.date]) eventsByDate[e.date] = []; eventsByDate[e.date].push(e); });

  const todayStr = today.toISOString().split('T')[0];
  const allDeadlines = MY_EVENTS.filter(e => e.type === 'deadline');
  const upcomingDeadlines = allDeadlines.filter(e => new Date(e.date) >= today).sort((a,b) => a.date.localeCompare(b.date));
  const overdueCount = allDeadlines.filter(e => new Date(e.date) < today).length;

  const handleFeedClick = (item: FeedItem) => {
    if (!item.caseId) return;
    // Route to pre-protection or prosecution based on caseId prefix
    if (item.caseId.startsWith('PRE-')) navigate('/handler/pre-protection');
    else navigate('/handler/prosecution');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <CaseHandlerNav />
      <div className="flex-1 min-w-0 max-w-[1600px] p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Welcome back, {firstName}!</h1>
          <p className="text-gray-600 text-sm">Here is an overview of your cases and upcoming deadlines</p>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'My Cases',           value: MY_CASES.length,      icon: FileText,      color: 'text-[#8d1436]',  bg: 'bg-[#fdf0f3]' },
            { label: 'Overdue Cases',      value: overdueCount,          icon: AlertTriangle, color: 'text-red-700',    bg: 'bg-red-50' },
            { label: 'Upcoming Deadlines', value: upcomingDeadlines.length, icon: AlertTriangle, color: 'text-amber-700', bg: 'bg-amber-50' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#8d1436]" />
                  <h2 className="text-base font-bold text-gray-900">My Calendar</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
                  <span className="text-sm font-semibold text-gray-700 min-w-[120px] text-center">{MONTHS[calMonth]} {calYear}</span>
                  <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map(d => <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase pb-2">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const isToday = dateStr === todayStr;
                  const deadlines = (eventsByDate[dateStr] ?? []).filter(e => e.type === 'deadline');
                  return (
                    <div key={day} onClick={() => deadlines.length > 0 && setCalModalDate(dateStr)} className={`relative flex flex-col items-center py-1.5 rounded-lg transition-colors ${deadlines.length > 0 ? 'cursor-pointer' : 'cursor-default'} ${isToday ? 'bg-[#8d1436]' : deadlines.length > 0 ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                      <span className={`text-xs font-medium ${isToday ? 'text-white' : deadlines.length ? 'text-red-900' : 'text-gray-500'}`}>{day}</span>
                      {deadlines.length > 0 && !isToday && (
                        <div className="flex gap-0.5 mt-0.5">
                          {deadlines.slice(0, 3).map((_, ei) => <div key={ei} className="w-1 h-1 rounded-full bg-red-500" />)}
                        </div>
                      )}
                      {deadlines.length > 0 && isToday && <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 mt-0.5" />}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-red-500" /> Deadline
                </div>
                <p className="text-xs text-gray-400 ml-auto">Deadlines only</p>
              </div>
            </div>

            {/* My cases list */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">My Active Cases</h2>
              <div className="space-y-3">
                {MY_CASES.map(case_ => (
                  <div
                    key={case_.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (case_.id.startsWith('PRE-')) navigate('/handler/pre-protection');
                      else navigate('/handler/prosecution');
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-xs font-mono text-[#8d1436] font-semibold">{case_.id}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{case_.ipType}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_COLORS[case_.status] ?? 'bg-gray-100 text-gray-600'}`}>{case_.status}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate" title={case_.title}>{case_.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Stage: {case_.stage}</p>
                    </div>
                    {case_.deadlineDate && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-[10px] text-gray-400">Deadline</p>
                        <p className={`text-xs font-semibold ${case_.deadlineDate <= today.toISOString().split('T')[0] ? 'text-red-600' : 'text-amber-600'}`}>
                          {new Date(case_.deadlineDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Upcoming deadlines */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="text-base font-bold text-gray-900">Upcoming Deadlines</h2>
              </div>
              <div className="space-y-3">
                {upcomingDeadlines.map(event => (
                  <div
                    key={event.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border bg-red-50 border-red-200 ${event.caseId ? 'cursor-pointer hover:bg-red-100 transition-colors' : ''}`}
                    onClick={() => {
                      if (!event.caseId) return;
                      if (event.caseId.startsWith('PRE-')) navigate('/handler/pre-protection');
                      else navigate('/handler/prosecution');
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-800 leading-tight">{event.title}</p>
                    </div>
                    <span className="text-xs text-red-600 font-semibold whitespace-nowrap flex-shrink-0">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-[#8d1436]" />
                <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
              </div>
              <div className="space-y-3">
                {MY_FEED.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-2.5 ${item.caseId ? 'cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors' : ''}`}
                    onClick={() => handleFeedClick(item)}
                  >
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase flex-shrink-0 mt-0.5 ${FEED_COLORS[item.type]}`}>{item.type}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-relaxed">{item.message}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(item.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar day detail modal */}
      {calModalDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCalModalDate(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-[#8d1436] uppercase tracking-wide mb-0.5">Deadlines</p>
                <h3 className="text-base font-bold text-gray-900">
                  {new Date(calModalDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
              </div>
              <button onClick={() => setCalModalDate(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {(eventsByDate[calModalDate] ?? []).filter(e => e.type === 'deadline').map(ev => (
                <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl border bg-red-50 border-red-200">
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-800 leading-tight">{ev.title}</p>
                    {ev.caseId && (
                      <button
                        onClick={() => { setCalModalDate(null); navigate(ev.caseId!.startsWith('PRE-') ? '/handler/pre-protection' : '/handler/prosecution'); }}
                        className="text-xs text-[#8d1436] font-bold hover:underline mt-1"
                      >
                        View {ev.caseId} →
                      </button>
                    )}
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase text-red-700 bg-white/70 border border-red-200 flex-shrink-0">deadline</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
