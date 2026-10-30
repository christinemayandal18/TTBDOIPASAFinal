import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, ChevronDown, ChevronRight, Upload, User, Play, Download, Mail, Phone, MapPin, BookOpen, FileText } from 'lucide-react';

type Role = 'applicant' | 'handler' | 'admin';
type Screen = 'login' | 'create-account' | 'pending-activation';

const CH_POSITIONS = ['Case Handler', 'Senior Case Handler', 'IP Officer', 'Legal Officer', 'Other'];
const AFFILIATIONS = ['Faculty', 'Researcher', 'Graduate Student', 'Undergraduate Student', 'REPS', 'Administrative Staff', 'Other'];

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  applicant: 'Applicant',
  handler: 'Case Handler',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('login');
  const [role, setRole] = useState<Role>('applicant');
  const [formsOpen, setFormsOpen] = useState<Record<string, boolean>>({});

  // Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Create account — shared
  const [caFirstName, setCaFirstName] = useState('');
  const [caMiddle, setCaMiddle]       = useState('');
  const [caLastName, setCaLastName]   = useState('');
  const [caContact, setCaContact]     = useState('');
  const [caEmail, setCaEmail]         = useState('');
  const [caPassword, setCaPassword]   = useState('');
  const [caConfirm, setCaConfirm]     = useState('');
  const [showCaPw, setShowCaPw]       = useState(false);
  const [caError, setCaError]         = useState('');
  // Applicant-specific
  const [caAffiliation, setCaAffiliation] = useState('');
  const [caAffiliationOther, setCaAffiliationOther] = useState('');
  const [caOrg, setCaOrg]             = useState('');
  // Handler-specific
  const [caPosition, setCaPosition]   = useState('');
  const [caPositionOther, setCaPositionOther] = useState('');
  // ID photo
  const [idPhotoUrl, setIdPhotoUrl]   = useState<string | null>(null);
  const idPhotoRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!email || !password) { setLoginError('Please enter your email and password.'); return; }
    if (role === 'admin') navigate('/admin/home');
    else if (role === 'handler') {
      try {
        localStorage.setItem('ch_name', 'Ana Reyes');
        localStorage.setItem('ch_position', 'Senior Case Handler');
      } catch {}
      navigate('/handler/home');
    } else if (role === 'applicant') {
      try { localStorage.setItem('app_name', email.split('@')[0]); } catch {}
      navigate('/applicant/home');
    } else navigate('/admin/dashboard');
  };

  const handleIdPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setIdPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const resetCreateForm = () => {
    setCaFirstName(''); setCaMiddle(''); setCaLastName(''); setCaContact('');
    setCaEmail(''); setCaPassword(''); setCaConfirm(''); setCaAffiliation('');
    setCaAffiliationOther(''); setCaOrg(''); setCaPosition(''); setCaPositionOther('');
    setIdPhotoUrl(null); setCaError('');
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setCaError('');
    if (role === 'applicant') {
      if (!caFirstName || !caLastName || !caEmail || !caPassword || !caConfirm) { setCaError('All required fields must be filled in.'); return; }
      if (caAffiliation === 'Other' && !caAffiliationOther.trim()) { setCaError('Please specify your affiliation.'); return; }
      if (caPassword.length < 8) { setCaError('Password must be at least 8 characters.'); return; }
      if (caPassword !== caConfirm) { setCaError('Passwords do not match.'); return; }
      try { localStorage.setItem('app_name', `${caFirstName} ${caLastName}`); } catch {}
      navigate('/applicant/home');
    } else if (role === 'handler') {
      if (!caFirstName || !caLastName || !caEmail || !caPassword || !caConfirm || !caPosition) { setCaError('All required fields must be filled in.'); return; }
      if (caPosition === 'Other' && !caPositionOther.trim()) { setCaError('Please specify your position.'); return; }
      if (caPassword.length < 8) { setCaError('Password must be at least 8 characters.'); return; }
      if (caPassword !== caConfirm) { setCaError('Passwords do not match.'); return; }
      setScreen('pending-activation');
    }
  };

  const FORMS_CATS = [
    { label: 'Patent / Utility Model', color: 'bg-blue-100 text-blue-800', forms: ['Invention Disclosure Form', 'Deed of Assignment – Patent/UM'] },
    { label: 'Trademark', color: 'bg-green-100 text-green-800', forms: ['Application for Trademark Registration', 'Deed of Assignment – Trademark'] },
    { label: 'Copyright', color: 'bg-yellow-100 text-yellow-800', forms: ['Copyright Application Form', 'Deed of Assignment – Copyright'] },
    { label: 'All Types', color: 'bg-purple-100 text-purple-800', forms: ["Inventor(s) Royalty Sharing Form"] },
  ];

  const leftSide = (
    <div className="hidden lg:flex flex-col p-10 h-full overflow-y-auto gap-8">
      {/* Brand */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div>
          <p className="text-xs font-black text-[#8d1436] tracking-widest uppercase leading-none">IPASA</p>
          <p className="text-[9px] text-gray-500 leading-tight mt-0.5 max-w-[200px]">Intellectual Property Application System Administration</p>
        </div>
      </div>

      {/* Headline — reduced prominence */}
      <div className="space-y-2 flex-shrink-0">
        <p className="text-xs font-semibold text-[#8d1436] uppercase tracking-widest">Welcome to</p>
        <h1 className="text-xl font-black text-gray-900 leading-tight">
          Intellectual Property Application System Administration
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          IPASA streamlines IP protection — from disclosure to prosecution at IPOPHL — for UPLB researchers and faculty.
        </p>
      </div>

      {/* TTBDO Video */}
      <div className="flex-shrink-0">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">About TTBDO</p>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center relative cursor-pointer group shadow-md">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
          <div className="relative flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors border-2 border-white/40">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
            <div className="text-center px-4">
              <p className="text-white font-bold text-sm">Introduction to TTBDO</p>
              <p className="text-white/60 text-xs mt-0.5">Learn about IP protection at UPLB · 5:14</p>
            </div>
          </div>
        </div>
      </div>

      {/* Public Forms & Guidelines — collapsible accordion */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-[#8d1436]" />
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Public Forms &amp; Guidelines</p>
        </div>
        <div className="space-y-1.5">
          {FORMS_CATS.map(cat => (
            <div key={cat.label} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setFormsOpen(prev => ({ ...prev, [cat.label]: !prev[cat.label] }))}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-100 transition-colors text-left"
              >
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${cat.color}`}>{cat.label}</span>
                <span className="text-xs text-gray-600 font-medium flex-1">Forms &amp; Guidelines</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${formsOpen[cat.label] ? 'rotate-180' : ''}`} />
              </button>
              {formsOpen[cat.label] && (
                <div className="divide-y divide-gray-100 border-t border-gray-100">
                  {cat.forms.map(form => (
                    <div key={form} className="flex items-center gap-2 px-3 py-2">
                      <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-700 flex-1 leading-tight">{form}</span>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => alert(`Download: "${form}"\n(Demo — actual file provided by TTBDO)`)} className="flex items-center gap-0.5 text-[10px] text-[#8d1436] font-semibold border border-[#8d1436]/30 rounded px-1.5 py-0.5 hover:bg-[#fdf0f3] transition-colors">
                          <Download className="w-2.5 h-2.5" /> Form
                        </button>
                        <button onClick={() => alert(`Download: "${form} Guidelines"\n(Demo — actual file provided by TTBDO)`)} className="flex items-center gap-0.5 text-[10px] text-gray-500 font-semibold border border-gray-200 rounded px-1.5 py-0.5 hover:bg-gray-100 transition-colors">
                          <BookOpen className="w-2.5 h-2.5" /> Guide
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="flex-shrink-0">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Contact TTBDO</p>
        <div className="bg-gradient-to-r from-[#00563f] to-[#004a35] rounded-xl p-4 space-y-2.5">
          {[
            { Icon: Mail,   label: 'ttbdo@up.edu.ph' },
            { Icon: Phone,  label: '(049) 536-2279' },
            { Icon: MapPin, label: '2/F CTTE Building, Science and Technology Park, UPLB, Los Baños, Laguna' },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3 h-3 text-white" />
              </div>
              <p className="text-xs text-white/90 leading-snug">{label}</p>
            </div>
          ))}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </div>
            <a href="https://www.facebook.com/ttbdo.uplb/" target="_blank" rel="noopener noreferrer" className="text-xs text-white/90 leading-snug hover:text-white hover:underline">facebook.com/ttbdo.uplb</a>
          </div>
          <p className="text-[10px] text-white/50 pt-1">Mon – Fri, 8:00 AM – 5:00 PM</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 flex-shrink-0 pb-2">© {new Date().getFullYear()} UP Los Baños — Technology Transfer & Business Development Office</p>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left — white */}
      <div className="hidden lg:flex flex-col flex-1 max-w-[460px] border-r border-gray-100 overflow-hidden">
        {leftSide}
      </div>

      {/* Right — maroon */}
      <div className="flex-1 bg-[#8d1436] flex items-start justify-center p-6 pt-10 relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative w-full max-w-sm">

          {/* System name header — compact */}
          <div className="mb-6">
            <p className="text-xs font-black text-[#ffb81c] tracking-widest uppercase leading-none">IPASA</p>
            <p className="text-white/60 text-[10px] leading-snug">Intellectual Property Application System Administration</p>
          </div>

          {/* ── Login ── */}
          {screen === 'login' && (
            <div>
              {/* Log In / Create Account tabs */}
              <div className="flex rounded-xl overflow-hidden border border-white/20 mb-7">
                <button className="flex-1 py-2.5 text-sm font-bold bg-[#ffb81c] text-[#7a1130] transition-colors">Log In</button>
                <button onClick={() => { setScreen('create-account'); setCaError(''); }} className="flex-1 py-2.5 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors">Create Account</button>
              </div>

              <h2 className="text-xl font-black text-white mb-1">Log in to your account</h2>
              <p className="text-white/60 text-sm mb-5">UPLB TTBDO · IP Application System</p>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* User Portal (role) selector */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">User Portal</label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={e => { setRole(e.target.value as Role); setLoginError(''); }}
                      className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb81c]/60 focus:border-[#ffb81c]/60 appearance-none cursor-pointer"
                    >
                      <option value="applicant" className="text-gray-900 bg-white">Applicant</option>
                      <option value="handler" className="text-gray-900 bg-white">Case Handler</option>
                      <option value="admin" className="text-gray-900 bg-white">Admin</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@up.edu.ph" className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb81c]/60 focus:border-[#ffb81c]/60" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb81c]/60 focus:border-[#ffb81c]/60" />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 accent-[#ffb81c]" />
                    <span className="text-xs text-white/60">Remember me</span>
                  </label>
                  <button type="button" className="text-xs text-[#ffb81c] hover:underline">Forgot password?</button>
                </div>
                {loginError && (
                  <div className="flex items-center gap-2 bg-red-900/40 border border-red-400/40 text-red-200 rounded-xl px-4 py-2.5 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {loginError}
                  </div>
                )}
                <button type="submit" className="w-full py-3 bg-[#ffb81c] text-[#7a1130] font-black text-sm rounded-xl hover:bg-[#f0ab10] transition-colors shadow-lg mt-2">
                  Log In
                </button>
              </form>
            </div>
          )}

          {/* ── Create Account ── */}
          {screen === 'create-account' && (
            <div>
              {/* Log In / Create Account tabs */}
              <div className="flex rounded-xl overflow-hidden border border-white/20 mb-6">
                <button onClick={() => { setScreen('login'); resetCreateForm(); }} className="flex-1 py-2.5 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors">Log In</button>
                <button className="flex-1 py-2.5 text-sm font-bold bg-[#ffb81c] text-[#7a1130] transition-colors">Create Account</button>
              </div>
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-black text-[#8d1436]">Create your account</h2>
              </div>
              <p className="text-xs text-gray-500 mb-5">Please fill in the required information to create your account</p>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                {/* Personal Info */}
                <div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">1. Personal Information</p>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">First Name <span className="text-red-500">*</span></label>
                      <input type="text" value={caFirstName} onChange={e => setCaFirstName(e.target.value)} placeholder="First" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">MI</label>
                      <input type="text" maxLength={2} value={caMiddle} onChange={e => setCaMiddle(e.target.value)} placeholder="MI" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Last Name <span className="text-red-500">*</span></label>
                      <input type="text" value={caLastName} onChange={e => setCaLastName(e.target.value)} placeholder="Last" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Email Address <span className="text-red-500">*</span></label>
                      <input type="email" value={caEmail} onChange={e => setCaEmail(e.target.value)} placeholder="juan@up.edu.ph" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Contact Number</label>
                      <input type="tel" value={caContact} onChange={e => setCaContact(e.target.value)} placeholder="09XX XXX XXXX" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Password <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input type={showCaPw ? 'text' : 'password'} value={caPassword} onChange={e => setCaPassword(e.target.value)} placeholder="Enter password" className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                        <button type="button" onClick={() => setShowCaPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                          {showCaPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                      <input type="password" value={caConfirm} onChange={e => setCaConfirm(e.target.value)} placeholder="Confirm password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                    </div>
                  </div>
                </div>

                {/* Role details */}
                <div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">2. {role === 'handler' ? 'Position Details' : 'Affiliation Details'}</p>
                  {role === 'applicant' && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Affiliation / Role</label>
                        <select value={caAffiliation} onChange={e => setCaAffiliation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]">
                          <option value="">Select your affiliation</option>
                          {AFFILIATIONS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                      {caAffiliation === 'Other' && (
                        <input type="text" value={caAffiliationOther} onChange={e => setCaAffiliationOther(e.target.value)} placeholder="Please specify your affiliation" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                      )}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Organization / Department</label>
                        <input type="text" value={caOrg} onChange={e => setCaOrg(e.target.value)} placeholder="Enter organization or department" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                      </div>
                    </div>
                  )}
                  {role === 'handler' && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Position <span className="text-red-500">*</span></label>
                        <select value={caPosition} onChange={e => setCaPosition(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]">
                          <option value="">Select position</option>
                          {CH_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      {caPosition === 'Other' && (
                        <input type="text" value={caPositionOther} onChange={e => setCaPositionOther(e.target.value)} placeholder="Please specify your position" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                      )}
                    </div>
                  )}
                </div>

                {/* Optional ID photo */}
                <div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">3. ID Photo <span className="text-gray-400 font-normal normal-case">(Optional)</span></p>
                  <input ref={idPhotoRef} type="file" accept="image/*" onChange={handleIdPhotoChange} className="hidden" />
                  {idPhotoUrl ? (
                    <div className="flex items-center gap-3">
                      <img src={idPhotoUrl} alt="ID" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                      <div className="flex-1">
                        <p className="text-xs text-green-600 font-medium mb-1">ID photo uploaded</p>
                        <button type="button" onClick={() => { setIdPhotoUrl(null); if (idPhotoRef.current) idPhotoRef.current.value = ''; }} className="text-xs text-red-500 hover:underline">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => idPhotoRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#8d1436]/40 hover:bg-[#8d1436]/5 transition-colors text-left">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700 flex items-center gap-1"><Upload className="w-3 h-3" /> Upload ID Photo</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Valid ID, student card, or government-issued ID</p>
                      </div>
                    </button>
                  )}
                </div>

                {role === 'handler' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2.5 flex gap-2 text-xs text-yellow-800">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                    Case handler accounts require admin approval before you can log in. You will be notified by email once activated.
                  </div>
                )}

                {caError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {caError}
                  </div>
                )}

                <button type="submit" className="w-full py-2.5 bg-[#8d1436] text-white font-bold text-sm rounded-xl hover:bg-[#7a1130] transition-colors shadow-sm mt-1">
                  {role === 'handler' ? 'Submit Registration' : 'Create Account'}
                </button>
              </form>
            </div>
            </div>
          )}

          {/* ── Pending Activation ── */}
          {screen === 'pending-activation' && (
            <div className="bg-white rounded-2xl p-7 shadow-2xl text-center">
              <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-yellow-600" />
              </div>
              <h2 className="text-lg font-black text-gray-900 mb-2">Registration Submitted</h2>
              <p className="text-sm text-gray-600 mb-4">
                Your account is <strong>pending admin activation</strong>. You will receive an email at <span className="font-medium text-[#8d1436]">{caEmail || 'your registered email'}</span> once approved.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800 text-left mb-5">
                <p className="font-semibold mb-1">What happens next?</p>
                <ol className="list-decimal list-inside space-y-1 text-yellow-700 text-xs">
                  <li>Admin reviews your registration</li>
                  <li>Account is approved and activated</li>
                  <li>You receive an email notification</li>
                  <li>You can now log in as a Case Handler</li>
                </ol>
              </div>
              <button onClick={() => { setScreen('login'); resetCreateForm(); }} className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50 transition-colors">
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
