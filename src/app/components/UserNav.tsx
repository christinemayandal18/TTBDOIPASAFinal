import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, Lightbulb, FolderOpen, PlusCircle, MoreVertical, ArrowRightLeft } from 'lucide-react';

const SIDEBAR_W = 220;
const TOP_H = 56;

const navItems = [
  { path: '/inventor/dashboard', label: 'My Disclosures',        icon: FolderOpen },
  { path: '/inventor/new',       label: 'Submit New Disclosure', icon: PlusCircle },
  { path: '/inventor/projects',  label: 'My Projects',           icon: Lightbulb },
];

export default function UserNav() {
  const location = useLocation();
  const [open, setOpen] = useState<boolean>(() => {
    try { return localStorage.getItem('ipasa_user_sidebar') === 'open'; }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('ipasa_user_sidebar', open ? 'open' : 'closed'); }
    catch {}
  }, [open]);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      {/* ── Fixed top bar ─────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50 flex items-center gap-3 px-4"
        style={{ height: TOP_H }}
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#8d1436]" />

        {/* Hamburger toggle */}
        <button
          onClick={() => setOpen(v => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-[#fdf0f3] hover:text-[#8d1436] transition-colors flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* UPLB logo + system name */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#8d1436] flex items-center justify-center flex-shrink-0 ring-2 ring-[#ffb81c] ring-offset-1">
            <span className="text-white text-[9px] font-black tracking-tighter">UPLB</span>
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide leading-none mb-0.5">
              University of the Philippines
            </p>
            <p className="text-xs font-bold text-[#8d1436] leading-none">Los Baños</p>
          </div>
          <span className="text-gray-300 mx-1 hidden sm:block">|</span>
          <span className="text-sm font-bold text-gray-800 tracking-widest uppercase">IPASA</span>
        </div>

        <div className="flex-1" />

        {/* Switch to Admin */}
        <Link
          to="/admin/dashboard"
          className="hidden md:flex items-center gap-1.5 text-xs font-medium text-[#8d1436] border border-[#8d1436] hover:bg-[#8d1436] hover:text-white px-3 py-1.5 rounded transition-colors"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Admin View
        </Link>

        {/* User info */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 text-[10px] font-bold">MS</span>
          </div>
          <div className="hidden md:block leading-tight">
            <p className="text-xs font-semibold text-gray-900">Dr. Maria Santos</p>
            <p className="text-[10px] text-gray-500">Inventor</p>
          </div>
          <MoreVertical className="w-4 h-4 text-gray-400 ml-1 cursor-pointer" />
        </div>
      </header>

      {/* ── Fixed left sidebar ────────────────────────────────────── */}
      <aside
        className="fixed left-0 bottom-0 bg-white border-r border-gray-200 z-40 flex flex-col overflow-hidden transition-all duration-300"
        style={{ top: TOP_H, width: open ? SIDEBAR_W : 0 }}
      >
        <div className="flex flex-col h-full" style={{ width: SIDEBAR_W }}>
          <nav className="flex-1 overflow-y-auto py-3 px-3">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 whitespace-nowrap ${
                    active
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

          <div className="flex-shrink-0 px-3 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="w-7 h-7 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 text-[10px] font-bold">MS</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">Dr. Maria Santos</p>
                <p className="text-[10px] text-gray-500 truncate">Inventor</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Backdrop — closes sidebar on content click ────────────── */}
      {open && (
        <div
          className="fixed z-30 inset-0 cursor-default"
          style={{ left: SIDEBAR_W, top: TOP_H }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Inline sidebar spacer ─────────────────────────────────── */}
      <div
        className="flex-shrink-0 transition-all duration-300"
        style={{ width: open ? SIDEBAR_W : 0 }}
      />
    </>
  );
}
