import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, Home, Database, Briefcase, FileCheck, Users, MoreVertical, Settings, LogOut, CheckSquare, Shield, ArrowLeftRight } from 'lucide-react';
import NotificationBell from './NotificationBell';
import uplbLogo from '@/imports/image-1.png';
import ttbdoLogo from '@/imports/TTBDO-logo-scaled.png';

const SIDEBAR_W = 220;
const TOP_H = 56;

const navItems = [
  { path: '/admin/home',           label: 'Home',              icon: Home },
  { path: '/admin/dashboard',      label: 'Analytics',         icon: Database },
  { path: '/admin/incoming',       label: 'Unassigned Cases',  icon: Database },
  { path: '/admin/pre-protection', label: 'Pre-Protection',    icon: Briefcase },
  { path: '/admin/prosecution',    label: 'Prosecution',       icon: FileCheck },
  { path: '/admin/complete',       label: 'Completed Cases',   icon: CheckSquare },
  { path: '/admin/all-cases',      label: 'All Cases',         icon: FileCheck },
  { path: '/admin/case-handlers',  label: 'Case Handlers',     icon: Shield },
];

interface SettingsDropdownProps { onClose: () => void }

function SettingsDropdown({ onClose }: SettingsDropdownProps) {
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
      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#fdf0f3] hover:text-[#8d1436] transition-colors" onClick={() => { navigate('/admin/settings'); onClose(); }}>
        <Settings className="w-4 h-4 flex-shrink-0" /> Account Settings
      </button>
      <div className="border-t border-gray-100 my-1" />
      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors" onClick={() => { navigate('/login'); onClose(); }}>
        <LogOut className="w-4 h-4 flex-shrink-0" /> Log out
      </button>
    </div>
  );
}

export default function AdminNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(() => {
    try { return localStorage.getItem('ipasa_sidebar') === 'open'; }
    catch { return false; }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const handleSwitchToHandlerMode = () => {
    try {
      localStorage.setItem('ipasa_role_mode', 'handler');
      localStorage.setItem('ipasa_user_type', 'admin');
    } catch {}
    navigate('/handler/home');
  };
  useEffect(() => {
    try { localStorage.setItem('ipasa_sidebar', open ? 'open' : 'closed'); }
    catch {}
  }, [open]);

  return (
    <>
      {/* ── Fixed top bar ──────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50 flex items-center gap-3 px-4"
        style={{ height: TOP_H }}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#8d1436]" />

        <button
            onClick={() => setOpen(v => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-[#fdf0f3] hover:text-[#8d1436] transition-colors flex-shrink-0"
          aria-label="Toggle sidebar"
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
          <span className="hidden sm:inline text-xs text-gray-400 font-medium ml-1">· Admin Portal</span>
        </div>

        <div className="flex-1" />

        {/* Mode toggle */}
        <button onClick={handleSwitchToHandlerMode} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8d1436]/30 text-xs font-semibold text-[#8d1436] bg-[#fdf0f3] hover:bg-[#f8d9e0] transition-colors mr-2 flex-shrink-0">
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Switch to Case Handler Mode</span>
          <span className="md:hidden">CH Mode</span>
        </button>

        {/* User info + settings */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200 relative">
          <div className="w-8 h-8 rounded-full bg-[#8d1436] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">AD</span>
          </div>
          <div className="hidden md:block leading-tight">
            <p className="text-xs font-semibold text-gray-900">Admin</p>
            <p className="text-[10px] text-gray-500">TTBDO Staff</p>
          </div>
          <NotificationBell role="admin" />
          <button
            onClick={() => setSettingsOpen(v => !v)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 transition-colors ml-1"
            aria-label="Settings"
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

      {/* ── Fixed left sidebar ─────────────────────────────────────── */}
      <aside
        className="fixed left-0 bottom-0 bg-white border-r border-gray-200 z-40 flex flex-col overflow-hidden transition-all duration-300"
        style={{ top: TOP_H, width: open ? SIDEBAR_W : 0 }}
      >
        <div className="flex flex-col h-full" style={{ width: SIDEBAR_W }}>
          <nav className="flex-1 overflow-y-auto py-3 px-3">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#8d1436] text-white'
                      : 'text-gray-600 hover:bg-[#fdf0f3] hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex-shrink-0 px-3 py-4 border-t border-gray-100 space-y-2">
            <button onClick={handleSwitchToHandlerMode} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-[#8d1436]/30 text-xs font-semibold text-[#8d1436] bg-[#fdf0f3] hover:bg-[#f8d9e0] transition-colors">
              <ArrowLeftRight className="w-3.5 h-3.5 flex-shrink-0" /> Switch to Case Handler Mode
            </button>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="w-7 h-7 rounded-full bg-[#8d1436] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold">AD</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">Admin</p>
                <p className="text-[10px] text-gray-500 truncate">TTBDO Staff · Admin Mode</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div
        className="flex-shrink-0 transition-all duration-300"
        style={{ width: open ? SIDEBAR_W : 0 }}
      />
    </>
  );
}
