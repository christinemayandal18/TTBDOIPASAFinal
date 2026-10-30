import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, Home, FileText, PlusCircle, BookOpen, MoreVertical, Settings, LogOut, HelpCircle } from 'lucide-react';
import NotificationBell from '../NotificationBell';
import uplbLogo from '@/imports/image-1.png';
import ttbdoLogo from '@/imports/TTBDO-logo-scaled.png';

const SIDEBAR_W = 220;
const TOP_H = 56;

const NAV_ITEMS = [
  { path: '/applicant/home',         label: 'Home',              icon: Home },
  { path: '/applicant/applications', label: 'My Applications',   icon: FileText },
  { path: '/applicant/submit',       label: 'New Disclosure',   icon: PlusCircle },
  { path: '/applicant/resources',    label: 'Resources',         icon: BookOpen },
];

function SettingsDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#fdf0f3] hover:text-[#8d1436] transition-colors" onClick={() => { navigate('/applicant/settings'); onClose(); }}>
        <Settings className="w-4 h-4 flex-shrink-0" /> Account Settings
      </button>
      <div className="border-t border-gray-100 my-1" />
      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors" onClick={() => { navigate('/login'); onClose(); }}>
        <LogOut className="w-4 h-4 flex-shrink-0" /> Log out
      </button>
    </div>
  );
}

export default function ApplicantNav() {
  const location = useLocation();
  const [open, setOpen] = useState<boolean>(() => {
    try { return localStorage.getItem('ipasa_app_sidebar') === 'open'; }
    catch { return false; }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => {
    try { localStorage.setItem('ipasa_app_sidebar', open ? 'open' : 'closed'); }
    catch {}
  }, [open]);

  const appName = (() => { try { return localStorage.getItem('app_name') || 'Applicant'; } catch { return 'Applicant'; } })();
  const initials = appName.split(' ').map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'AP';

  return (
    <>
      {/* Fixed top bar */}
      <header
        className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50 flex items-center gap-3 px-4"
        style={{ height: TOP_H }}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#8d1436]" />

        <button
          onClick={() => setOpen(v => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-[#fdf0f3] hover:text-[#8d1436] transition-colors flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <img src={uplbLogo} alt="UPLB" className="h-8 w-auto object-contain flex-shrink-0 max-w-[160px]" />
          <img src={ttbdoLogo} alt="TTBDO" className="h-7 object-contain flex-shrink-0 hidden sm:block" />
          <span className="text-gray-300 mx-1 hidden sm:block">|</span>
          <div className="hidden sm:block leading-tight">
            <p className="text-[10px] font-black text-[#8d1436] tracking-widest uppercase leading-none">IPASA</p>
            <p className="text-[8px] text-gray-400 leading-none tracking-wide">IP Management System</p>
          </div>
          <span className="sm:hidden text-sm font-bold text-[#8d1436] tracking-widest uppercase">IPASA</span>
          <span className="hidden sm:inline text-xs text-gray-400 font-medium ml-1">· Applicant Portal</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 pl-3 border-l border-gray-200 relative">
          <div className="w-8 h-8 rounded-full bg-[#ffb81c] flex items-center justify-center flex-shrink-0">
            <span className="text-[#8d1436] text-[10px] font-bold">{initials}</span>
          </div>
          <div className="hidden md:block leading-tight">
            <p className="text-xs font-semibold text-gray-900 max-w-[120px] truncate">{appName}</p>
            <p className="text-[10px] text-gray-500">Applicant</p>
          </div>
          <NotificationBell role="applicant" />
          <button
            onClick={() => setSettingsOpen(v => !v)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors ml-1"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          {settingsOpen && <SettingsDropdown onClose={() => setSettingsOpen(false)} />}
        </div>
      </header>

      {/* Backdrop: closes sidebar and relays click to underlying element in one click */}
      {open && (
        <div
          className="fixed inset-0 z-30"
          style={{ top: TOP_H }}
          onMouseDown={(e) => {
            const x = e.clientX;
            const y = e.clientY;
            setOpen(false);
            requestAnimationFrame(() => {
              (document.elementFromPoint(x, y) as HTMLElement)?.click();
            });
          }}
        />
      )}

      {/* Fixed left sidebar */}
      <aside
        className="fixed left-0 bottom-0 bg-white border-r border-gray-200 z-40 flex flex-col overflow-hidden transition-all duration-300"
        style={{ top: TOP_H, width: open ? SIDEBAR_W : 0 }}
      >
        <div className="flex flex-col h-full" style={{ width: SIDEBAR_W }}>
          <nav className="flex-1 overflow-y-auto py-3 px-3">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 whitespace-nowrap ${
                    isActive ? 'bg-[#8d1436] text-white' : 'text-gray-600 hover:bg-[#fdf0f3] hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 px-3 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="w-7 h-7 rounded-full bg-[#ffb81c] flex items-center justify-center flex-shrink-0">
                <span className="text-[#8d1436] text-[10px] font-bold">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{appName}</p>
                <p className="text-[10px] text-gray-500 truncate">Applicant</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Floating FAQ button — persistent across all applicant pages */}
      <Link
        to="/applicant/resources#faq"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#8d1436] text-white rounded-full shadow-lg hover:bg-[#7a1130] transition-all duration-200 text-sm font-semibold"
        title="Frequently Asked Questions"
      >
        <HelpCircle className="w-4 h-4 flex-shrink-0" />
        <span>FAQ</span>
      </Link>

      <div className="flex-shrink-0 transition-all duration-300" style={{ width: open ? SIDEBAR_W : 0 }} />
    </>
  );
}
