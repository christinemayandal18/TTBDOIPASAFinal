import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Bell, Users, AlertTriangle, FileText, ChevronLeft, ChevronRight, X } from 'lucide-react';
import AdminNav from './AdminNav';

interface CalendarEvent {
  id: string; date: string; title: string; type: 'deadline' | 'review' | 'filing' | 'meeting';
  caseId?: string; handler?: string;
}
interface HandlerAssignment {
  name: string; cases: number; preProtection: number; prosecution: number; photo?: string;
}
interface FeedItem {
  id: string; timestamp: string; type: 'remark' | 'action' | 'assignment' | 'warning';
  actor: string; message: string; caseId?: string;
}

const EVENTS: CalendarEvent[] = [
  { id: 'e1', date: '2026-07-12', title: 'PRE-2026-004 Response Deadline', type: 'deadline', caseId: 'PRE-2026-004', handler: 'Nathan Felipe Cruz' },
  { id: 'e2', date: '2026-07-15', title: 'PRE-2026-001 Draft Review', type: 'review', caseId: 'PRE-2026-001', handler: 'Ana Reyes' },
  { id: 'e3', date: '2026-07-18', title: 'P-001 Substantive Exam Report Due', type: 'deadline', caseId: 'P-001', handler: 'Tristan Perez-Navarro' },
  { id: 'e4', date: '2026-07-20', title: 'TM-001 Filing Deadline', type: 'filing', caseId: 'TM-001', handler: 'Anna Maria Garcia' },
  { id: 'e5', date: '2026-07-22', title: 'Monthly Case Review Meeting', type: 'meeting' },
  { id: 'e6', date: '2026-07-25', title: 'PRE-2026-008 Response Deadline', type: 'deadline', caseId: 'PRE-2026-008', handler: 'Tristan Perez-Navarro' },
  { id: 'e7', date: '2026-07-28', title: 'UM-001 Formality Exam Follow-up', type: 'review', caseId: 'UM-001', handler: 'Katrina Mercado' },
  { id: 'e8', date: '2026-07-30', title: 'PRE-2026-005 Endorsement to OC', type: 'action', caseId: 'PRE-2026-005', handler: 'Samuel Mendoza' },
];

const HANDLER_ASSIGNMENTS: HandlerAssignment[] = [
  { name: 'Ana Reyes',              cases: 4, preProtection: 2, prosecution: 2 },
  { name: 'Nathan Felipe Cruz',     cases: 3, preProtection: 2, prosecution: 1 },
  { name: 'Samuel Mendoza',         cases: 5, preProtection: 3, prosecution: 2 },
  { name: 'Katrina Mercado',        cases: 3, preProtection: 2, prosecution: 1 },
  { name: 'Anna Maria Garcia',      cases: 3, preProtection: 1, prosecution: 2 },
  { name: 'Tristan Perez-Navarro',  cases: 4, preProtection: 2, prosecution: 2 },
];

const FEED: FeedItem[] = [
  { id: 'f1', timestamp: '2026-07-12T09:30:00', type: 'warning', actor: 'System', message: 'PRE-2026-004 deadline is today. Handler: Nathan Felipe Cruz.', caseId: 'PRE-2026-004' },
  { id: 'f2', timestamp: '2026-07-12T08:45:00', type: 'action', actor: 'Samuel Mendoza', message: 'Marked PRE-2026-003 as "Draft Done" — ready for endorsement.', caseId: 'PRE-2026-003' },
  { id: 'f3', timestamp: '2026-07-11T16:20:00', type: 'remark', actor: 'Tristan Perez-Navarro', message: 'Added remark on P-001: "Waiting for substantive examination report from IPOPHL."', caseId: 'P-001' },
  { id: 'f4', timestamp: '2026-07-11T14:10:00', type: 'assignment', actor: 'Admin', message: 'Assigned PRE-2026-010 to Katrina Mercado.', caseId: 'PRE-2026-010' },
  { id: 'f5', timestamp: '2026-07-11T11:05:00', type: 'action', actor: 'Anna Maria Garcia', message: 'Advanced TM-001 to Registrability Report stage.', caseId: 'TM-001' },
  { id: 'f6', timestamp: '2026-07-10T15:30:00', type: 'remark', actor: 'Ana Reyes', message: 'Requested additional documents from applicant on PRE-2026-001.', caseId: 'PRE-2026-001' },
  { id: 'f7', timestamp: '2026-07-10T10:00:00', type: 'warning', actor: 'System', message: 'PRE-2026-008 deadline approaching in 15 days. Handler: Tristan Perez-Navarro.', caseId: 'PRE-2026-008' },
  { id: 'f8', timestamp: '2026-07-09T13:55:00', type: 'action', actor: 'Katrina Mercado', message: 'Completed Prior Art Search for PRE-2026-010.', caseId: 'PRE-2026-010' },
];

const TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  deadline: { bg: 'bg-red-50 border-red-200',    text: 'text-red-800',    dot: 'bg-red-500' },
  review:   { bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-800',   dot: 'bg-blue-500' },
  filing:   { bg: 'bg-purple-50 border-purple-200',text: 'text-purple-800',dot: 'bg-purple-500' },
  meeting:  { bg: 'bg-green-50 border-green-200', text: 'text-green-800',  dot: 'bg-green-500' },
  action:   { bg: 'bg-gray-50 border-gray-200',   text: 'text-gray-700',   dot: 'bg-gray-500' },
};
const FEED_COLORS: Record<string, string> = {
  warning:    'bg-amber-100 text-amber-700',
  action:     'bg-blue-100 text-blue-700',
  remark:     'bg-purple-100 text-purple-700',
  assignment: 'bg-green-100 text-green-700',
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

export default function AdminHomePage() {
  const today = new Date('2026-07-12');
  const navigate = useNavigate();
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 6 = July
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calModalDate, setCalModalDate] = useState<string | null>(null);

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  const eventsByDate: Record<string, CalendarEvent[]> = {};
  EVENTS.forEach(e => { if (!eventsByDate[e.date]) eventsByDate[e.date] = []; eventsByDate[e.date].push(e); });

  const deadlineEvents = EVENTS.filter(e => e.type === 'deadline');
  const upcomingDeadlines = deadlineEvents.filter(e => new Date(e.date) >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const overdueDeadlines  = deadlineEvents.filter(e => new Date(e.date) < today);
  const totalActive = HANDLER_ASSIGNMENTS.reduce((s, h) => s + h.cases, 0);
  const todayStr = today.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <AdminNav />
      <div className="flex-1 min-w-0 max-w-[1600px] p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Home</h1>
          <p className="text-gray-600 text-sm">Overview of all active cases, upcoming deadlines, and handler activity</p>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'My Cases',           value: totalActive,              icon: FileText,     color: 'text-[#8d1436]',  bg: 'bg-[#fdf0f3]' },
            { label: 'Case Handlers',      value: HANDLER_ASSIGNMENTS.length, icon: Users,     color: 'text-blue-700',   bg: 'bg-blue-50' },
            { label: 'Overdue Cases',      value: overdueDeadlines.length,  icon: AlertTriangle, color: 'text-red-700',  bg: 'bg-red-50' },
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
          {/* Calendar — spans 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#8d1436]" />
                  <h2 className="text-base font-bold text-gray-900">Master Calendar</h2>
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
                  const hasDeadlines = deadlines.length > 0;
                  return (
                    <div key={day} onClick={() => hasDeadlines && setCalModalDate(dateStr)} className={`relative flex flex-col items-center py-1.5 rounded-lg transition-colors ${hasDeadlines ? 'cursor-pointer' : 'cursor-default'} ${isToday ? 'bg-[#8d1436]' : hasDeadlines ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                      <span className={`text-xs font-medium ${isToday ? 'text-white' : hasDeadlines ? 'text-red-900 font-semibold' : 'text-gray-500'}`}>{day}</span>
                      {hasDeadlines && !isToday && (
                        <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[28px]">
                          {deadlines.slice(0, 3).map((_, ei) => (
                            <div key={ei} className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          ))}
                        </div>
                      )}
                      {hasDeadlines && isToday && <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 mt-0.5" />}
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Deadline
                </div>
                <p className="text-xs text-gray-400 ml-auto">Case deadlines only</p>
              </div>
            </div>

            {/* Upcoming deadlines list */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Upcoming Deadlines</h2>
              <div className="space-y-3">
                {upcomingDeadlines.length === 0 && <p className="text-sm text-gray-400 italic">No upcoming deadlines.</p>}
                {upcomingDeadlines.map(event => (
                  <div
                    key={event.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border bg-red-50 border-red-200 ${event.caseId ? 'cursor-pointer hover:bg-red-100 transition-colors' : ''}`}
                    onClick={() => {
                      if (!event.caseId) return;
                      if (event.caseId.startsWith('PRE-')) navigate('/admin/pre-protection');
                      else navigate('/admin/prosecution');
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-800">{event.title}</p>
                      {event.handler && <p className="text-xs text-gray-500 mt-0.5">Handler: {event.handler}</p>}
                    </div>
                    <span className="text-xs text-red-600 font-semibold whitespace-nowrap flex-shrink-0">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Handler Assignments */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-[#8d1436]" />
                <h2 className="text-base font-bold text-gray-900">Handler Assignments</h2>
              </div>
              <div className="space-y-3">
                {HANDLER_ASSIGNMENTS.sort((a, b) => b.cases - a.cases).map(handler => (
                  <div key={handler.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#8d1436]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-[#8d1436]">{handler.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{handler.name}</p>
                      <div className="flex gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-500">{handler.preProtection} pre-prot.</span>
                        <span className="text-[10px] text-gray-500">{handler.prosecution} prosec.</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 flex-shrink-0">{handler.cases}</span>
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
                {FEED.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-2.5 ${item.caseId ? 'cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors' : ''}`}
                    onClick={() => {
                      if (!item.caseId) return;
                      if (item.caseId.startsWith('PRE-')) navigate('/admin/pre-protection');
                      else navigate('/admin/prosecution');
                    }}
                  >
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase flex-shrink-0 mt-0.5 ${FEED_COLORS[item.type]}`}>{item.type}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-relaxed">{item.message}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.actor} · {timeAgo(item.timestamp)}</p>
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
                <p className="text-xs font-semibold text-[#8d1436] uppercase tracking-wide mb-0.5">Scheduled Events</p>
                <h3 className="text-base font-bold text-gray-900">
                  {new Date(calModalDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
              </div>
              <button onClick={() => setCalModalDate(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(eventsByDate[calModalDate] ?? []).filter(ev => ev.type === 'deadline').map(ev => (
                <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl border bg-red-50 border-red-200">
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-800 leading-tight">{ev.title}</p>
                    {ev.handler && <p className="text-xs text-gray-500 mt-0.5">Handler: {ev.handler}</p>}
                    {ev.caseId && (
                      <button
                        onClick={() => { setCalModalDate(null); navigate(ev.caseId!.startsWith('PRE-') ? '/admin/pre-protection' : '/admin/prosecution'); }}
                        className="text-xs text-[#8d1436] font-bold hover:underline mt-1"
                      >
                        View {ev.caseId} →
                      </button>
                    )}
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase flex-shrink-0 text-red-700 bg-white/70 border border-red-200">deadline</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
