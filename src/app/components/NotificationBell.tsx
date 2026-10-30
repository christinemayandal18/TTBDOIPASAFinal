import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Bell, MessageSquare, Clock, ArrowRightLeft, CheckCircle, X } from 'lucide-react';

export type NotifType = 'remark' | 'activation' | 'extension' | 'transfer' | 'extension_approved';

export interface Notification {
  id: string; type: NotifType; title: string; body: string;
  link: string; read: boolean; time: string;
  caseId?: string;
  resolved?: boolean;
}

const ADMIN_NOTIFS: Notification[] = [
  { id: 'n1', type: 'remark',     title: 'Unresolved handler remark',   body: 'PRE-2026-001: Ana Reyes left a remark needing attention.',            link: '/admin/pre-protection', read: false, time: '2m ago',  caseId: 'PRE-2026-001', resolved: false },
  { id: 'n2', type: 'activation', title: 'Account pending activation',   body: 'Sophia Dela Paz registered and is awaiting admin approval.',          link: '/admin/case-handlers',  read: false, time: '15m ago', resolved: false },
  { id: 'n3', type: 'extension',  title: 'Deadline extension requested', body: 'PRE-2026-001: Case handler requests extension due to database issues.', link: '/admin/pre-protection', read: false, time: '1h ago',  caseId: 'PRE-2026-001', resolved: false },
  { id: 'n4', type: 'activation', title: 'Account approved',             body: 'Miguel Torres has been approved and can now log in.',                  link: '/admin/case-handlers',  read: true,  time: '2h ago',  resolved: true },
  { id: 'n5', type: 'remark',     title: 'Remark resolved',              body: 'PRE-2026-003: The remark thread has been resolved.',                   link: '/admin/pre-protection', read: true,  time: '1d ago',  caseId: 'PRE-2026-003', resolved: true },
];

const CH_NOTIFS: Notification[] = [
  { id: 'cn1', type: 'transfer',           title: 'Case transferred to you',       body: 'PRE-2026-004 has been reassigned to your portfolio.',               link: '/handler/pre-protection', read: false, time: '30m ago', caseId: 'PRE-2026-004' },
  { id: 'cn2', type: 'extension_approved', title: 'Extension request approved',    body: 'Deadline extension for PRE-2026-001 has been approved by admin.',   link: '/handler/pre-protection', read: false, time: '2h ago',  caseId: 'PRE-2026-001' },
  { id: 'cn3', type: 'remark',             title: 'New admin remark on your case', body: 'Admin added a remark to PRE-2026-008. Action may be required.',      link: '/handler/pre-protection', read: false, time: '1d ago',  caseId: 'PRE-2026-008' },
];

const APPLICANT_NOTIFS: Notification[] = [
  { id: 'ap1', type: 'remark',             title: 'Response request from handler', body: 'Your case handler has sent a response request on PRE-2026-012 requiring your attention.', link: '/applicant/applications', read: false, time: '1h ago',  caseId: 'PRE-2026-012' },
  { id: 'ap2', type: 'activation',         title: 'Case handler assigned',         body: 'A case handler has been assigned to your disclosure "Field Guide to Philippine Endemic Orchids".', link: '/applicant/applications', read: false, time: '3h ago', caseId: 'PRE-2026-008' },
  { id: 'ap3', type: 'extension_approved', title: 'Stage update on your case',     body: 'APP-2024-802 has advanced to the Prosecution stage.',                             link: '/applicant/applications', read: true,  time: '2d ago',  caseId: 'APP-2024-802' },
];

const ICON_MAP: Record<NotifType, React.ReactNode> = {
  remark:             <MessageSquare className="w-4 h-4 text-amber-600" />,
  activation:         <Clock className="w-4 h-4 text-yellow-600" />,
  extension:          <Clock className="w-4 h-4 text-blue-600" />,
  transfer:           <ArrowRightLeft className="w-4 h-4 text-purple-600" />,
  extension_approved: <CheckCircle className="w-4 h-4 text-green-600" />,
};

const BG_MAP: Record<NotifType, string> = {
  remark:             'bg-amber-100',
  activation:         'bg-yellow-100',
  extension:          'bg-blue-100',
  transfer:           'bg-purple-100',
  extension_approved: 'bg-green-100',
};

type Tab = 'all' | 'unread' | 'read';

interface Props { role?: 'admin' | 'handler' | 'applicant'; }

function loadNotifs(role: 'admin' | 'handler' | 'applicant'): Notification[] {
  const base = role === 'admin' ? ADMIN_NOTIFS : role === 'handler' ? CH_NOTIFS : APPLICANT_NOTIFS;
  try {
    const readIds: string[] = JSON.parse(localStorage.getItem(`ipasa_notifs_read_${role}`) || '[]');
    const dismissedIds: string[] = JSON.parse(localStorage.getItem(`ipasa_notifs_dismissed_${role}`) || '[]');
    return base
      .filter(n => !dismissedIds.includes(n.id))
      .map(n => ({ ...n, read: readIds.includes(n.id) || n.read }));
  } catch {
    return base;
  }
}

function persistRead(role: 'admin' | 'handler' | 'applicant', notifs: Notification[]) {
  try {
    localStorage.setItem(`ipasa_notifs_read_${role}`, JSON.stringify(notifs.filter(n => n.read).map(n => n.id)));
  } catch {}
}

function persistDismissed(role: 'admin' | 'handler' | 'applicant', notifs: Notification[]) {
  try {
    const base = role === 'admin' ? ADMIN_NOTIFS : role === 'handler' ? CH_NOTIFS : APPLICANT_NOTIFS;
    const remaining = notifs.map(n => n.id);
    const dismissed = base.map(n => n.id).filter(id => !remaining.includes(id));
    localStorage.setItem(`ipasa_notifs_dismissed_${role}`, JSON.stringify(dismissed));
  } catch {}
}

export default function NotificationBell({ role = 'admin' }: Props) {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<Notification[]>(() => loadNotifs(role));
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('all');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifs.filter(n => !n.read && n.resolved !== true).length;

  const displayed = notifs.filter(n => {
    if (tab === 'unread') return !n.read;
    if (tab === 'read')   return n.read;
    return true;
  });

  const markAllRead = () => {
    setNotifs(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      persistRead(role, updated);
      return updated;
    });
  };

  const markRead = (id: string) => {
    setNotifs(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      persistRead(role, updated);
      return updated;
    });
  };

  const dismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifs(prev => {
      const updated = prev.filter(n => n.id !== id);
      persistRead(role, updated);
      persistDismissed(role, updated);
      return updated;
    });
  };

  const handleClick = (n: Notification) => {
    markRead(n.id);
    setOpen(false);
    const dest = n.caseId ? `${n.link}#${n.caseId}` : n.link;
    navigate(dest);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors" aria-label="Notifications">
        <Bell className="w-5 h-5 text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#8d1436] text-white rounded-full text-[9px] flex items-center justify-center font-bold leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-[#8d1436] font-medium hover:underline">Mark all read</button>
            )}
          </div>

          <div className="flex border-b border-gray-100 px-2 pt-1">
            {(['all', 'unread', 'read'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-[#8d1436] text-[#8d1436]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {t}{t === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
              </button>
            ))}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {displayed.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">No notifications</div>
            ) : (
              displayed.map(n => (
                <div key={n.id} role="button" tabIndex={0} onClick={() => handleClick(n)} onKeyDown={e => e.key === 'Enter' && handleClick(n)} className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-start gap-3 group cursor-pointer ${!n.read ? 'bg-blue-50/40' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${BG_MAP[n.type]}`}>
                    {ICON_MAP[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className={`text-xs font-semibold truncate ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#8d1436] flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 leading-snug line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                  </div>
                  <button onClick={(e) => dismiss(n.id, e)} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-0.5 hover:bg-gray-200 rounded">
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
