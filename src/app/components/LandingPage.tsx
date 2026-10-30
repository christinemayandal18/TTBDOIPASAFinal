import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  ChevronDown, Search, Mail, Phone, MapPin,
  FileText, Plus, X,
  Shield, Lightbulb, ArrowRight, CheckCircle, AlertCircle,
  Menu, User, HelpCircle, Scale, Eye, EyeOff, Upload,
  ExternalLink, Lock, Globe, Award
} from 'lucide-react';
import uplbLogo from '@/imports/image-1.png';
import ttbdoLogo from '@/imports/TTBDO-logo-scaled.png';

function CounterNumber({ target, duration = 1600 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // ease-out-quart
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <>{count}</>;
}

type PublicPage = 'home' | 'about' | 'faq' | 'contact' | 'repository' | 'login' | 'create-account' | 'pending-activation';
type AuthTab = 'login' | 'create-account';
type Role = 'applicant' | 'handler' | 'admin';

const CH_POSITIONS = ['Case Handler', 'Senior Case Handler', 'IP Officer', 'Legal Officer', 'Other'];
const AFFILIATIONS = ['Faculty', 'Researcher', 'Graduate Student', 'Undergraduate Student', 'REPS', 'Administrative Staff', 'Other'];

const FAQ_ITEMS = [
  { id: 1, category: 'Registration', q: 'How do I register for IPASA?', a: 'Click "Register Now" on the home page or "Create Account" from the User Portal dropdown. Fill in your personal information, affiliation, and create a password. Applicant accounts are activated immediately; Case Handler accounts require admin approval.' },
  { id: 2, category: 'Registration', q: "Can't create an account. What should I do?", a: 'Ensure you are using a valid email address and that your password is at least 8 characters. If the problem persists, contact TTBDO at ttbdo@up.edu.ph with a screenshot of the error.' },
  { id: 3, category: 'Registration', q: "I can't log in after registering. What should I do?", a: 'Verify you are using the correct email and password, and the correct User Portal (Applicant, Case Handler, or Admin). Case Handler accounts may be pending admin activation. Contact TTBDO if the issue continues.' },
  { id: 4, category: 'Registration', q: 'I forgot my password. How do I reset it?', a: 'Click the "Forgot password?" link on the login screen and enter your registered email address. You will receive a password reset link. Check your spam folder if you do not receive it within a few minutes.' },
  { id: 5, category: 'IP Disclosure', q: 'What is an Intellectual Property Disclosure?', a: 'An IP Disclosure is the first formal step in protecting your intellectual property at UPLB. It is a confidential document submitted to the TTBDO describing your invention, creative work, or trademark so TTBDO can assess its patentability and guide you through the protection process.' },
  { id: 6, category: 'IP Disclosure', q: 'What information do I need to submit a new disclosure?', a: "You'll need the IP title, a description of its novelty and applications, a list of inventors/authors with royalty shares, funding source, and any prior public disclosure information. Supporting documents (completed forms, drawings) must also be attached." },
  { id: 7, category: 'Application Process', q: 'How long does the IP application process take?', a: 'Timelines vary by IP type. Copyrights typically take a few months; trademarks 12–18 months; patents can take several years due to IPOPHL substantive examination. Your Case Handler will keep you updated through IPASA.' },
  { id: 8, category: 'Application Process', q: 'What is the difference between Pre-Protection and Prosecution?', a: 'Pre-Protection is the internal TTBDO processing stage where your Case Handler prepares your application. Prosecution is the external stage where your application is formally filed and examined by IPOPHL. Both are tracked in IPASA.' },
  { id: 9, category: 'Application Process', q: 'Can I edit my application after submission?', a: 'Each application allows one edit before a Case Handler is assigned. Once a handler is assigned, the edit option is permanently locked.' },
];


interface RepoIP {
  id: string; title: string; ipType: string; inventors: string;
  year: number; description: string; publiclyVisible: boolean; dept: string;
}

const REPO_IPS: RepoIP[] = [
  { id: 'P-001', title: 'Novel Biocontrol Agent from Indigenous Philippine Plants', ipType: 'Patent', inventors: 'D. Santos, M. Reyes, R. Cruz', year: 2024, description: 'A novel biocontrol formulation derived from indigenous Philippine plant extracts effective against common rice fungal pathogens, reducing dependency on synthetic fungicides while promoting sustainable agriculture.', publiclyVisible: true, dept: 'Institute of Plant Breeding' },
  { id: 'UM-002', title: 'Low-Cost Portable Water Quality Testing Kit', ipType: 'Utility Model', inventors: 'A. Mendoza, L. Garcia', year: 2025, description: 'A portable, low-cost kit for rapid field testing of water quality parameters including pH, turbidity, and coliform presence, designed for community-level use in rural areas.', publiclyVisible: true, dept: 'Institute of Environmental Science' },
  { id: 'CR-003', title: 'Field Guide to Philippine Endemic Orchids (2nd Ed.)', ipType: 'Copyright', inventors: 'T. Perez-Navarro', year: 2024, description: '', publiclyVisible: false, dept: 'Institute of Biological Sciences' },
  { id: 'TM-001', title: 'UPLB Freshbrew™ Cold Press Coffee Blend', ipType: 'Trademark', inventors: 'UPLB Technology Business Incubator', year: 2023, description: 'Registered trademark for a signature cold-press coffee blend developed under the UPLB Agri-Enterprise Program, derived from locally sourced Arabica cultivars from the UPLB Coffee Research Program.', publiclyVisible: true, dept: 'College of Agriculture and Food Technology' },
  { id: 'P-005', title: 'Smart Irrigation Valve System Using IoT Sensors', ipType: 'Patent', inventors: 'R. Dela Cruz, E. Santos, J. Lim', year: 2025, description: 'An IoT-based smart irrigation valve system with soil moisture sensing and automated scheduling for water-efficient rice paddy management, validated across multiple field sites in Laguna and Nueva Ecija.', publiclyVisible: true, dept: 'Institute of Agricultural Engineering' },
  { id: 'ID-001', title: 'Ergonomic Bamboo Seedling Tray Design', ipType: 'Industrial Design', inventors: 'K. Mercado, B. Salazar', year: 2023, description: 'An award-winning ergonomic bamboo seedling tray design for nursery use, featuring interlocking modular panels fabricated from locally sourced UPLB-grown bamboo species.', publiclyVisible: true, dept: 'College of Forestry and Natural Resources' },
  { id: 'UM-007', title: 'Compact Biomass Gasifier for Rural Electrification', ipType: 'Utility Model', inventors: 'P. Ramos, C. Bautista', year: 2024, description: 'A compact, household-scale biomass gasifier unit designed for rice hull combustion, enabling off-grid electrification in rural barangays with minimal operational cost.', publiclyVisible: true, dept: 'Institute of Agricultural Engineering' },
  { id: 'CR-010', title: 'Training Manual on Organic Vermicompost Production', ipType: 'Copyright', inventors: 'M. Santos, V. Aquino', year: 2023, description: 'A practical training manual covering vermiculture best practices, substrate management, and harvest protocols, developed for use in UPLB extension programs and community-based organic farming.', publiclyVisible: true, dept: 'College of Agriculture and Food Technology' },
];

const TTBDO_STATS = [
  { value: 142, label: 'Cases Handled', sub: 'All IP types since inception', color: 'text-[#8d1436]', bg: 'bg-[#fdf0f3]' },
  { value: 89, label: 'Filed with IPOPHL', sub: 'All IP types', color: 'text-blue-700', bg: 'bg-blue-50' },
  { value: 61, label: 'Completed / Registered', sub: 'All IP types', color: 'text-yellow-700', bg: 'bg-yellow-50' },
];

const IP_TYPE_BADGE_REPO: Record<string, string> = {
  Patent: 'bg-blue-100 text-blue-800 border-blue-200',
  'Utility Model': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Trademark: 'bg-green-100 text-green-800 border-green-200',
  Copyright: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Industrial Design': 'bg-purple-100 text-purple-800 border-purple-200',
};

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [page, setPage] = useState<PublicPage>('home');
  const [portalOpen, setPortalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState('All');
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set([1]));
  const [repoSearch, setRepoSearch] = useState('');
  const [repoTypeFilter, setRepoTypeFilter] = useState('All');
  const [repoExpanded, setRepoExpanded] = useState<string | null>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  // Auth state
  const [role, setRole] = useState<Role>('applicant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [caFirstName, setCaFirstName] = useState('');
  const [caMiddle, setCaMiddle] = useState('');
  const [caLastName, setCaLastName] = useState('');
  const [caContact, setCaContact] = useState('');
  const [caEmail, setCaEmail] = useState('');
  const [caPassword, setCaPassword] = useState('');
  const [caConfirm, setCaConfirm] = useState('');
  const [showCaPw, setShowCaPw] = useState(false);
  const [caError, setCaError] = useState('');
  const [caAffiliation, setCaAffiliation] = useState('');
  const [caAffiliationOther, setCaAffiliationOther] = useState('');
  const [caOrg, setCaOrg] = useState('');
  const [caPosition, setCaPosition] = useState('');
  const [caPositionOther, setCaPositionOther] = useState('');
  const [idPhotoUrl, setIdPhotoUrl] = useState<string | null>(null);
  const idPhotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (portalRef.current && !portalRef.current.contains(e.target as Node)) setPortalOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  const resetCreateForm = () => {
    setCaFirstName(''); setCaMiddle(''); setCaLastName(''); setCaContact('');
    setCaEmail(''); setCaPassword(''); setCaConfirm(''); setCaAffiliation('');
    setCaAffiliationOther(''); setCaOrg(''); setCaPosition(''); setCaPositionOther('');
    setIdPhotoUrl(null); setCaError('');
  };

  const detectRoleFromEmail = (emailVal: string): Role => {
    const lower = emailVal.toLowerCase();
    if (lower === 'admin@up.edu.ph') return 'admin';
    if (lower === 'casehandler@up.edu.ph') return 'handler';
    return 'applicant';
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!email || !password) { setLoginError('Please enter your email and password.'); return; }
    if (!email.endsWith('@up.edu.ph')) { setLoginError('Please use your official @up.edu.ph account.'); return; }
    const detectedRole = detectRoleFromEmail(email);
    if (detectedRole === 'admin') navigate('/admin/home');
    else if (detectedRole === 'handler') {
      try { localStorage.setItem('ch_name', 'Ana Reyes'); localStorage.setItem('ch_position', 'Senior Case Handler'); } catch {}
      navigate('/handler/home');
    } else {
      try { localStorage.setItem('app_name', email.split('@')[0]); } catch {}
      navigate('/applicant/home');
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setCaError('');
    if (!caEmail.endsWith('@up.edu.ph')) { setCaError('You must use your official @up.edu.ph account to register.'); return; }
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
      setPage('pending-activation');
    }
  };

  const handleIdPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setIdPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const toggleFaq = (id: number) => setOpenFaqs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const goToAuth = (tab: AuthTab) => { setPage(tab); setCaError(''); setLoginError(''); };
  const isAuthPage = page === 'login' || page === 'create-account' || page === 'pending-activation';

  const NAV_LINKS: { label: string; page: PublicPage }[] = [
    { label: 'HOME', page: 'home' },
    { label: 'IP REPOSITORY', page: 'repository' },
    { label: 'FAQs', page: 'faq' },
    { label: 'ABOUT US', page: 'about' },
    { label: 'CONTACT US', page: 'contact' },
  ];

  const filteredFaqs = FAQ_ITEMS.filter(f => {
    const matchCat = faqCategory === 'All' || f.category === faqCategory;
    const matchSearch = !faqSearch || f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Navbar ──
  const navbar = (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 h-20 flex items-center gap-3">
        <button onClick={() => setPage('home')} className="flex items-center gap-3 flex-shrink-0 mr-3">
          <img src={uplbLogo} alt="UPLB" className="h-12 w-auto object-contain" />
          <img src={ttbdoLogo} alt="TTBDO" className="h-11 object-contain" />
          <span className="hidden md:block text-gray-300 mx-1">|</span>
          <div className="hidden md:block">
            <p className="text-xs font-black text-[#8d1436] tracking-widest uppercase leading-none">IPASA</p>
            <p className="text-[9px] text-gray-400 leading-none mt-0.5">UPLB TTBDO</p>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-0.5 flex-1">
          {NAV_LINKS.map(n => (
            <button
              key={n.page}
              onClick={() => setPage(n.page)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wide transition-colors ${page === n.page ? 'text-[#8d1436] font-black bg-[#fdf0f3]' : 'text-gray-600 hover:text-[#8d1436] hover:bg-[#fdf0f3]'}`}
            >
              {n.label}
            </button>
          ))}
        </div>

        <div ref={portalRef} className="relative ml-auto flex-shrink-0">
          <button
            onClick={() => setPortalOpen(v => !v)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-[#8d1436]/40 text-[#8d1436] text-xs font-bold hover:bg-[#fdf0f3] hover:border-[#8d1436] transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            User Portal
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${portalOpen ? 'rotate-180' : ''}`} />
          </button>
          {portalOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
              <button onClick={() => { setPortalOpen(false); goToAuth('login'); }} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors">Log In</button>
              <button onClick={() => { setPortalOpen(false); goToAuth('create-account'); }} className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Create Account</button>
            </div>
          )}
        </div>

        <button onClick={() => setMobileMenuOpen(v => !v)} className="md:hidden text-gray-700 ml-2">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 pb-4 pt-2 space-y-1">
          {NAV_LINKS.map(n => (
            <button key={n.page} onClick={() => { setPage(n.page); setMobileMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md text-sm font-semibold transition-colors ${page === n.page ? 'bg-[#fdf0f3] text-[#8d1436]' : 'text-gray-600 hover:text-[#8d1436] hover:bg-[#fdf0f3]'}`}>
              {n.label}
            </button>
          ))}
          <div className="pt-2 border-t border-gray-200 flex gap-2">
            <button onClick={() => { setMobileMenuOpen(false); goToAuth('login'); }} className="flex-1 py-2 bg-[#8d1436] text-white rounded-lg text-sm font-black">Log In</button>
            <button onClick={() => { setMobileMenuOpen(false); goToAuth('create-account'); }} className="flex-1 py-2 border-2 border-[#8d1436] text-[#8d1436] rounded-lg text-sm font-semibold">Register</button>
          </div>
        </div>
      )}
    </nav>
  );

  // ── Shared Hero ──
  const HeroBadge = ({ label }: { label: string }) => (
    <div className="inline-flex items-center gap-1.5 bg-white rounded-full px-3 py-1 shadow-sm border border-gray-100 mb-5">
      <span className="w-1.5 h-1.5 rounded-full bg-[#8d1436]" />
      <span className="text-xs font-semibold text-gray-600">{label}</span>
    </div>
  );

  const heroSection = (badge: string, title: React.ReactNode, subtitle: string) => (
    <div className="bg-gray-50 py-16 px-4 flex flex-col items-center text-center">
      <div className="max-w-2xl">
        <HeroBadge label={badge} />
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">{title}</h1>
        <div className="w-12 h-1 rounded-full bg-[#8d1436] mx-auto mb-4" />
        <p className="text-gray-500 text-sm md:text-base leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );

  // ── HOME ──
  const homePage = (
    <div>
      {/* Home hero — dedicated layout */}
      <div className="bg-white border-b border-gray-200">
        {/* Text + CTAs */}
        <div className="max-w-[1100px] mx-auto px-4 pt-16 pb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            Welcome to <span className="text-[#8d1436]">IPASA</span>
          </h1>
          <div className="w-10 h-1 bg-[#8d1436] rounded-full mx-auto mb-5" />
          <p className="text-gray-500 text-base leading-relaxed max-w-xl mx-auto mb-8">
            The Intellectual Property Application System Administration of the University of the Philippines Los Baños — manage IP disclosures, track applications, and monitor prosecution from one place.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => goToAuth('create-account')} className="flex items-center gap-2 px-6 py-2.5 bg-[#8d1436] text-white text-sm font-bold rounded-xl hover:bg-[#7a1130] transition-colors">
              Register Now <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => goToAuth('login')} className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              Log In
            </button>
          </div>
        </div>

        {/* Metrics strip — spans full width inside hero */}
        <div className="border-t border-gray-100 bg-gray-50 relative overflow-hidden">
          {/* Decorative SVG network — subtle background */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1100 80" fill="none" preserveAspectRatio="xMidYMid slice">
            <circle cx="100" cy="20" r="8" fill="#8d1436" />
            <circle cx="300" cy="55" r="5" fill="#8d1436" />
            <circle cx="500" cy="18" r="7" fill="#8d1436" />
            <circle cx="700" cy="58" r="6" fill="#8d1436" />
            <circle cx="900" cy="22" r="5" fill="#8d1436" />
            <circle cx="1050" cy="50" r="7" fill="#8d1436" />
            <line x1="100" y1="20" x2="300" y2="55" stroke="#8d1436" strokeWidth="1.5" />
            <line x1="300" y1="55" x2="500" y2="18" stroke="#8d1436" strokeWidth="1.5" />
            <line x1="500" y1="18" x2="700" y2="58" stroke="#8d1436" strokeWidth="1.5" />
            <line x1="700" y1="58" x2="900" y2="22" stroke="#8d1436" strokeWidth="1.5" />
            <line x1="900" y1="22" x2="1050" y2="50" stroke="#8d1436" strokeWidth="1.5" />
          </svg>

          <div className="relative max-w-[1100px] mx-auto px-4 grid grid-cols-3 divide-x divide-gray-200">
            {[
              { ...TTBDO_STATS[0], icon: <FileText className="w-4 h-4" />, iconBg: 'bg-[#fdf0f3] text-[#8d1436]' },
              { ...TTBDO_STATS[1], icon: <Globe className="w-4 h-4" />,    iconBg: 'bg-blue-50 text-blue-600' },
              { ...TTBDO_STATS[2], icon: <Award className="w-4 h-4" />,    iconBg: 'bg-yellow-50 text-yellow-600' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-4 px-8 py-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
                  {stat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-600 leading-tight">{stat.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{stat.sub}</p>
                </div>
                <p className="text-4xl font-black text-[#8d1436] tabular-nums leading-none flex-shrink-0">
                  <CounterNumber target={stat.value} />
                </p>
              </div>
            ))}
          </div>
          <div className="relative border-t border-gray-200 bg-white py-3 text-center">
            <button onClick={() => setPage('repository')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#8d1436] transition-colors">
              <Globe className="w-3.5 h-3.5" /> Browse IP Repository
            </button>
          </div>
        </div>
      </div>

      {/* IPASA description — two column */}
      <div className="max-w-[1100px] mx-auto px-4 pt-10 pb-6 grid md:grid-cols-2 gap-6">
        {/* Announcement card — light, bordered */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-7 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8d1436] rounded-l-xl" />
          <div className="inline-flex items-center gap-1.5 self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8d1436] animate-pulse" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Official Advisory</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-2 leading-tight">IPASA is now live for UPLB researchers</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">The TTBDO officially launches IPASA — a centralized platform for IP disclosure, case management, and prosecution tracking for all UP Los Baños constituents.</p>
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Who can use IPASA?</p>
              {['UPLB Faculty, Researchers, and REPS', 'Graduate and Undergraduate Students', 'University Administrative Staff'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-auto">For inquiries: ttbdo@up.edu.ph</p>
        </div>

        {/* IPASA description card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-7 flex flex-col gap-5">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight mb-1">Intellectual Property<br /><span className="text-[#8d1436]">Application System Administration</span></h2>
            <div className="w-8 h-0.5 bg-[#8d1436] rounded-full my-3" />
            <p className="text-sm text-gray-600 leading-relaxed">IPASA is a web-based information system that manages IP disclosure, pre-protection processing, and prosecution tracking for research outputs developed at UPLB.</p>
            <p className="text-sm text-gray-600 leading-relaxed mt-3">Researchers and faculty interested in protecting their intellectual property may submit disclosures through IPASA and track their applications from initial filing to IPOPHL prosecution.</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-500 border border-gray-100">
            You need to register and create an account first before you can submit an IP disclosure.
          </div>
          <div className="flex gap-3">
            <button onClick={() => goToAuth('create-account')} className="flex-1 py-2.5 bg-[#8d1436] text-white rounded-xl text-sm font-bold hover:bg-[#7a1130] transition-colors flex items-center justify-center gap-2">
              Register Now <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => goToAuth('login')} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">Log In</button>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="max-w-[1100px] mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Globe className="w-4 h-4" />, label: 'IP Repository', sub: 'Browse completed IPs', action: () => setPage('repository') },
          { icon: <HelpCircle className="w-4 h-4" />, label: 'FAQs', sub: 'Common questions', action: () => setPage('faq') },
          { icon: <FileText className="w-4 h-4" />, label: 'About TTBDO', sub: 'Our office & mission', action: () => setPage('about') },
          { icon: <Mail className="w-4 h-4" />, label: 'Contact Us', sub: 'Get in touch', action: () => setPage('contact') },
        ].map(item => (
          <button key={item.label} onClick={item.action} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-[#8d1436]/30 hover:shadow-sm transition-all text-left">
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[#8d1436] flex-shrink-0">{item.icon}</div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-400">{item.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── IP REPOSITORY ──
  const filteredRepo = REPO_IPS.filter(ip => {
    if (repoTypeFilter !== 'All' && ip.ipType !== repoTypeFilter) return false;
    if (repoSearch) {
      const q = repoSearch.toLowerCase();
      return ip.title.toLowerCase().includes(q) || ip.inventors.toLowerCase().includes(q) || ip.dept.toLowerCase().includes(q);
    }
    return true;
  });

  const repositoryPage = (
    <div>
      {heroSection('Completed IP Applications', 'UPLB IP Repository', 'Browse completed and granted intellectual property applications from UPLB researchers, faculty, and students. All entries are uploaded and managed by the TTBDO.')}
      <div className="max-w-[1100px] mx-auto px-4 py-8">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" placeholder="Search by title, inventor, or department..." value={repoSearch} onChange={e => setRepoSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white" />
          </div>
          <select value={repoTypeFilter} onChange={e => setRepoTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm">
            <option value="All">All IP Types</option>
            <option value="Patent">Patent</option>
            <option value="Utility Model">Utility Model</option>
            <option value="Trademark">Trademark</option>
            <option value="Copyright">Copyright</option>
            <option value="Industrial Design">Industrial Design</option>
          </select>
          <span className="text-xs text-gray-400 self-center whitespace-nowrap">{filteredRepo.length} result{filteredRepo.length !== 1 ? 's' : ''}</span>
        </div>

        {/* IP Cards */}
        <div className="space-y-2.5 mb-8">
          {filteredRepo.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No IP applications match your search.</p>
            </div>
          ) : filteredRepo.map(ip => (
            <div key={ip.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
              <div className="flex items-start gap-4 px-5 py-4 cursor-pointer" onClick={() => setRepoExpanded(repoExpanded === ip.id ? null : ip.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-[11px] font-mono font-semibold text-[#8d1436]">{ip.id}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${IP_TYPE_BADGE_REPO[ip.ipType] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>{ip.ipType}</span>
                    <span className="text-[10px] text-gray-400">{ip.year}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{ip.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{ip.dept} · {ip.inventors}</p>
                </div>
                <Award className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform ${repoExpanded === ip.id ? 'text-[#8d1436]' : 'text-gray-300'}`} />
              </div>
              {repoExpanded === ip.id && ip.description && (
                <div className="px-5 pb-4 border-t border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed mt-3">{ip.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── ABOUT US ──
  const aboutPage = (
    <div>
      {heroSection('About TTBDO', 'IP Protection at UPLB', 'The Technology Transfer & Business Development Office supports UPLB researchers in protecting and commercializing their intellectual assets.')}
      <div className="max-w-[1100px] mx-auto px-4 py-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8d1436] rounded-l-xl" />
          <p className="text-xs font-bold text-[#8d1436] uppercase tracking-widest mb-3">Program Overview</p>
          <h2 className="text-2xl font-black text-gray-900 mb-4">UPLB TTBDO</h2>
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>The Technology Transfer and Business Development Office (TTBDO) of the University of the Philippines Los Baños (UPLB) is mandated to protect and commercialize the university's intellectual assets, facilitate technology transfer, and foster industry-academic linkages.</p>
            <p>Through IPASA, the TTBDO manages the complete IP lifecycle — from the moment an inventor discloses a new creation to the final issuance of a patent, trademark registration certificate, or copyright. The system coordinates between inventors, case handlers, and the Intellectual Property Office of the Philippines (IPOPHL).</p>
            <p>TTBDO handles all major IP types recognized under the Intellectual Property Code of the Philippines, including Patents, Utility Models, Trademarks, Copyrights, and Industrial Designs.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {[
            { icon: <FileText className="w-7 h-7 text-[#8d1436]" />, title: 'IP Disclosure & Assessment', desc: 'Submit your invention, creative work, or trademark through IPASA. Case handlers guide you through documentation, novelty assessment, and filing preparation.' },
            { icon: <Scale className="w-7 h-7 text-[#00563f]" />, title: 'IPOPHL Filing & Prosecution', desc: 'Track your application through formal filing and examination at the Intellectual Property Office of the Philippines, with real-time status updates.' },
            { icon: <Lightbulb className="w-7 h-7 text-[#ffb81c]" />, title: 'Technology Transfer & Licensing', desc: "Valorize your protected IP through TTBDO-facilitated technology transfer, licensing arrangements, and industry-academic partnerships." },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">{f.icon}</div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
          <p className="text-xs font-bold text-[#8d1436] uppercase tracking-widest mb-1">IP Types Handled by TTBDO</p>
          <h3 className="text-xl font-black text-gray-900 mb-5">Intellectual Property Categories</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Patent', icon: '⚗️', accent: 'border-blue-200 bg-blue-50', badge: 'bg-blue-100 text-blue-800', desc: 'Protects new or improved products, processes, or compositions of matter that have industrial applicability. Requires novelty, inventive step, and industrial use. UPLB patents are filed at IPOPHL for examination and grant.' },
              { label: 'Utility Model', icon: '🔧', accent: 'border-indigo-200 bg-indigo-50', badge: 'bg-indigo-100 text-indigo-800', desc: 'A shorter-term protection for functional devices and products. Similar to patents but with a less rigorous examination process and faster grant — ideal for incremental innovations with shorter commercial lifecycles.' },
              { label: 'Trademark', icon: '™️', accent: 'border-green-200 bg-green-50', badge: 'bg-green-100 text-green-800', desc: 'Protects signs, logos, names, or symbols that identify and distinguish goods or services. TTBDO handles trademark registrations for UPLB-branded products and university research outputs with commercial potential.' },
              { label: 'Copyright', icon: '©️', accent: 'border-yellow-200 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-800', desc: 'Protects original literary, artistic, and scientific works including software, instructional materials, maps, databases, and audiovisual works. Copyright arises automatically upon creation but formal deposit with IPOPHL is recommended.' },
              { label: 'Industrial Design', icon: '🎨', accent: 'border-purple-200 bg-purple-50', badge: 'bg-purple-100 text-purple-800', desc: 'Protects the ornamental or aesthetic aspects of a product — its shape, configuration, pattern, or combination of colors. Particularly relevant for agricultural equipment, packaging design, and product innovations developed at UPLB.' },
            ].map(t => (
              <div key={t.label} className={`rounded-xl border-2 p-5 ${t.accent}`}>
                <div className="mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.badge}`}>{t.label}</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#fdf0f3] rounded-xl border border-[#8d1436]/15 p-8 text-center">
          <h3 className="text-base font-bold text-gray-900 mb-2">UPLB TTBDO · IPASA</h3>
          <p className="text-gray-500 text-sm mb-5">Start your IP protection journey through IPASA — the official portal for UPLB IP disclosures and case management.</p>
          <button onClick={() => goToAuth('create-account')} className="px-7 py-2.5 bg-[#8d1436] text-white font-semibold rounded-xl text-sm hover:bg-[#7a1130] transition-colors">Register Now</button>
        </div>
      </div>
    </div>
  );

  // ── FAQ ──
  const faqPage = (
    <div>
      {heroSection('IPASA Help Center', 'Frequently Asked Questions', 'Find quick answers about registration, IP disclosure, application process, and IPASA guides.')}
      <div className="max-w-[900px] mx-auto px-4 py-8">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search questions..." value={faqSearch} onChange={e => setFaqSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white shadow-sm" />
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {['All', 'Registration', 'IP Disclosure', 'Application Process'].map(cat => (
            <button key={cat} onClick={() => setFaqCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${faqCategory === cat ? 'bg-[#8d1436] text-white border-[#8d1436]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#8d1436] hover:text-[#8d1436]'}`}>{cat}</button>
          ))}
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Common Questions</h3>
          <span className="text-xs text-gray-400">{filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="space-y-2 mb-10">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><HelpCircle className="w-8 h-8 mx-auto mb-2" /><p className="text-sm">No questions match your search.</p></div>
          ) : filteredFaqs.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button onClick={() => toggleFaq(item.id)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                <span className="text-xs font-semibold text-[#8d1436]/60 w-6 flex-shrink-0">{String(item.id).padStart(2, '0')}</span>
                <span className="text-sm font-semibold text-gray-900 flex-1">{item.q}</span>
                {openFaqs.has(item.id) ? <X className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </button>
              {openFaqs.has(item.id) && (
                <div className="px-5 pb-4 border-t border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed mt-3 pl-10">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="bg-[#fdf0f3] rounded-xl border border-[#8d1436]/15 p-8 text-center">
          <h3 className="text-base font-bold text-gray-900 mb-2">Still need assistance?</h3>
          <p className="text-gray-500 text-sm mb-5">For questions or clarifications, please email the TTBDO Helpdesk.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:ttbdo@up.edu.ph" className="px-6 py-2.5 bg-[#8d1436] text-white font-semibold rounded-xl text-sm hover:bg-[#7a1130] transition-colors">Email TTBDO</a>
            <button onClick={() => setPage('home')} className="px-6 py-2.5 border border-gray-300 text-gray-600 font-medium rounded-xl text-sm hover:bg-gray-50 transition-colors">Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── CONTACT US ──
  const contactPage = (
    <div>
      {heroSection('TTBDO Helpdesk', 'Contact Us', "Need assistance with your IPASA account, IP disclosure, or application status? Reach out to the TTBDO.")}
      <div className="max-w-[1100px] mx-auto px-4 py-10">

        {/* Program overview card — mirrors About Us left-bar card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8d1436] rounded-l-xl" />
          <p className="text-xs font-bold text-[#8d1436] uppercase tracking-widest mb-3">Official Helpdesk</p>
          <h2 className="text-2xl font-black text-gray-900 mb-4">UPLB TTBDO</h2>
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>The Technology Transfer and Business Development Office (TTBDO) provides assistance to UPLB researchers, faculty, and students on all matters related to IP disclosure, application processing, and IPASA account management.</p>
            <p>For general inquiries and concerns, reach the TTBDO helpdesk through email at <span className="font-bold text-[#8d1436]">ttbdo@up.edu.ph</span>. For urgent or in-person concerns, visit the office at the CTTE Building during regular working hours.</p>
            <p>When sending an email, please include your registered email address, a description of your concern, and your application ID or case number if applicable — this helps TTBDO staff assist you faster.</p>
          </div>
        </div>

        {/* 3-column contact channel cards — mirrors About Us feature cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {[
            {
              icon: <Mail className="w-7 h-7 text-[#8d1436]" />,
              title: 'Email Support',
              desc: 'Send your inquiry to ttbdo@up.edu.ph. For faster resolution, include your registered email, a description of the concern, and your case or application ID.',
            },
            {
              icon: <Phone className="w-7 h-7 text-[#00563f]" />,
              title: 'Phone & Office',
              desc: 'Reach TTBDO by phone at (049) 536-2279, or visit the office at 2/F CTTE Building, Science and Technology Park, UPLB. Open Mon – Fri, 8:00 AM – 5:00 PM.',
            },
            {
              icon: <ExternalLink className="w-7 h-7 text-[#ffb81c]" />,
              title: 'Facebook Page',
              desc: 'Follow and message the TTBDO on Facebook for updates, announcements, and quick inquiries. Visit facebook.com/ttbdo.uplb for the official page.',
            },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">{f.icon}</div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* What to include + We assist with — mirrors About Us IP categories grid */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
          <p className="text-xs font-bold text-[#8d1436] uppercase tracking-widest mb-1">Before You Email</p>
          <h3 className="text-xl font-black text-gray-900 mb-5">How to Reach Us Effectively</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Registered Email', icon: '📧', accent: 'border-blue-200 bg-blue-50', badge: 'bg-blue-100 text-blue-800', desc: 'Always include the email address you used when registering on IPASA so TTBDO staff can locate your account quickly.' },
              { label: 'Description of Concern', icon: '📝', accent: 'border-indigo-200 bg-indigo-50', badge: 'bg-indigo-100 text-indigo-800', desc: 'Briefly describe the issue or question, including what you were doing in IPASA when the problem occurred.' },
              { label: 'Application or Case ID', icon: '🔖', accent: 'border-green-200 bg-green-50', badge: 'bg-green-100 text-green-800', desc: 'If your concern is about a specific disclosure or application, include the case ID (e.g., PRE-2026-001) for faster assistance.' },
              { label: 'Screenshot of Error', icon: '🖼️', accent: 'border-yellow-200 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-800', desc: 'Attach a screenshot if you encountered an error or unexpected behavior in the system — this greatly speeds up diagnosis.' },
              { label: 'Account Concerns', icon: '👤', accent: 'border-orange-200 bg-orange-50', badge: 'bg-orange-100 text-orange-800', desc: "For login issues, password resets, or account activation, indicate your account type (Applicant, Case Handler) and the error message received." },
              { label: 'Office Hours Note', icon: '🕐', accent: 'border-purple-200 bg-purple-50', badge: 'bg-purple-100 text-purple-800', desc: 'TTBDO responds to emails during regular working hours, Monday to Friday, 8:00 AM to 5:00 PM. Expect a reply within one to two working days.' },
            ].map(t => (
              <div key={t.label} className={`rounded-xl border-2 p-5 ${t.accent}`}>
                <div className="mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.badge}`}>{t.label}</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Maroon CTA block — identical to About Us bottom block */}
        <div className="bg-[#fdf0f3] rounded-xl border border-[#8d1436]/15 p-8 text-center">
          <h3 className="text-base font-bold text-gray-900 mb-2">Get in Touch with TTBDO</h3>
          <p className="text-gray-500 text-sm mb-5">Send your inquiry directly to the TTBDO helpdesk at ttbdo@up.edu.ph. We are happy to assist with any IPASA or IP-related concern.</p>
          <a href="mailto:ttbdo@up.edu.ph" className="inline-flex items-center gap-2 px-7 py-2.5 bg-[#8d1436] text-white font-semibold rounded-xl text-sm hover:bg-[#7a1130] transition-colors">
            <Mail className="w-4 h-4" /> Send Email
          </a>
        </div>

      </div>
    </div>
  );

  // ── AUTH TAB SWITCHER ──
  const AuthTabBar = ({ active }: { active: AuthTab }) => (
    <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6 bg-gray-100">
      <button onClick={() => goToAuth('login')} className={`flex-1 py-2.5 text-sm font-bold transition-colors ${active === 'login' ? 'bg-[#8d1436] text-white' : 'text-gray-500 hover:text-gray-700'}`}>Log In</button>
      <button onClick={() => { goToAuth('create-account'); resetCreateForm(); }} className={`flex-1 py-2.5 text-sm font-bold transition-colors ${active === 'create-account' ? 'bg-[#8d1436] text-white' : 'text-gray-500 hover:text-gray-700'}`}>Create Account</button>
    </div>
  );

  // ── LOGIN PAGE ──
  const loginPage = (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <AuthTabBar active="login" />
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-black text-gray-900 mb-1">Welcome Back</h2>
          <p className="text-gray-500 text-xs mb-5">Sign in using your UP Mail account. Your role is recognized automatically.</p>

          {/* Test credentials hint */}
          <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1.5">Prototype Test Credentials</p>
            <div className="space-y-0.5">
              {[
                { label: 'Applicant', email: 'applicant@up.edu.ph' },
                { label: 'Case Handler', email: 'casehandler@up.edu.ph' },
                { label: 'Admin', email: 'admin@up.edu.ph' },
              ].map(c => (
                <button
                  key={c.email}
                  type="button"
                  onClick={() => setEmail(c.email)}
                  className="w-full flex items-center justify-between text-left hover:bg-blue-100 rounded-lg px-2 py-1 transition-colors group"
                >
                  <span className="text-[11px] text-blue-600 font-medium">{c.label}</span>
                  <span className="text-[10px] text-blue-500 font-mono group-hover:text-blue-700">{c.email}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-blue-500 mt-1.5">Click to auto-fill · use any password</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">UP Mail / Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@up.edu.ph" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 accent-[#8d1436]" />
                <span className="text-xs text-gray-500">Remember me</span>
              </label>
              <button type="button" className="text-xs text-[#8d1436] hover:underline font-medium">Forgot password?</button>
            </div>
            {loginError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {loginError}
              </div>
            )}
            <button type="submit" className="w-full py-3 bg-[#8d1436] text-white font-black text-sm rounded-xl hover:bg-[#7a1130] transition-colors shadow-md mt-1">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );

  // ── CREATE ACCOUNT PAGE ──
  const createAccountPage = (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <AuthTabBar active="create-account" />
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8 max-h-[75vh] overflow-y-auto">
          <h2 className="text-xl font-black text-gray-900 mb-1">Create your account</h2>
          <p className="text-xs text-gray-500 mb-4">Register using your official UP Mail account.</p>

          {/* OSAM-style account type selector */}
          <div className="mb-5">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Account Type</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'applicant' as Role, label: 'Applicant Registration', sub: 'For UPLB researchers, faculty & students' },
                { value: 'handler' as Role, label: 'Case Handler Registration', sub: 'For TTBDO staff — requires admin approval' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`flex flex-col items-start gap-0.5 px-3 py-3 rounded-xl border-2 text-left transition-all ${role === opt.value ? 'border-[#8d1436] bg-[#fdf0f3]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <span className={`text-xs font-bold leading-tight ${role === opt.value ? 'text-[#8d1436]' : 'text-gray-800'}`}>{opt.label}</span>
                  <span className="text-[10px] text-gray-500 leading-tight">{opt.sub}</span>
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-start gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-white text-[8px] font-bold">i</span></span>
              <p className="text-[10px] text-blue-700">You must use your official <span className="font-bold">@up.edu.ph</span> email address to register.</p>
            </div>
          </div>

          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">1. Personal Information</p>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div><label className="block text-xs text-gray-600 mb-1">First Name <span className="text-red-500">*</span></label><input type="text" value={caFirstName} onChange={e => setCaFirstName(e.target.value)} placeholder="First" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" /></div>
                <div><label className="block text-xs text-gray-600 mb-1">MI</label><input type="text" maxLength={2} value={caMiddle} onChange={e => setCaMiddle(e.target.value)} placeholder="MI" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" /></div>
                <div><label className="block text-xs text-gray-600 mb-1">Last Name <span className="text-red-500">*</span></label><input type="text" value={caLastName} onChange={e => setCaLastName(e.target.value)} placeholder="Last" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div><label className="block text-xs text-gray-600 mb-1">Email <span className="text-red-500">*</span></label><input type="email" value={caEmail} onChange={e => setCaEmail(e.target.value)} placeholder="juan@up.edu.ph" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" /></div>
                <div><label className="block text-xs text-gray-600 mb-1">Contact No.</label><input type="tel" value={caContact} onChange={e => setCaContact(e.target.value)} placeholder="09XX XXX XXXX" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs text-gray-600 mb-1">Password <span className="text-red-500">*</span></label>
                  <div className="relative"><input type={showCaPw ? 'text' : 'password'} value={caPassword} onChange={e => setCaPassword(e.target.value)} placeholder="Min 8 chars" className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" /><button type="button" onClick={() => setShowCaPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">{showCaPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button></div>
                </div>
                <div><label className="block text-xs text-gray-600 mb-1">Confirm <span className="text-red-500">*</span></label><input type="password" value={caConfirm} onChange={e => setCaConfirm(e.target.value)} placeholder="Confirm" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" /></div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">2. {role === 'handler' ? 'Position Details' : 'Affiliation Details'}</p>
              {role === 'applicant' && (
                <div className="space-y-2">
                  <div><label className="block text-xs text-gray-600 mb-1">Affiliation / Role</label><select value={caAffiliation} onChange={e => setCaAffiliation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]"><option value="">Select affiliation</option>{AFFILIATIONS.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
                  {caAffiliation === 'Other' && <input type="text" value={caAffiliationOther} onChange={e => setCaAffiliationOther(e.target.value)} placeholder="Please specify" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />}
                  <div><label className="block text-xs text-gray-600 mb-1">Organization / Department</label><input type="text" value={caOrg} onChange={e => setCaOrg(e.target.value)} placeholder="Enter org or dept" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" /></div>
                </div>
              )}
              {role === 'handler' && (
                <div className="space-y-2">
                  <div><label className="block text-xs text-gray-600 mb-1">Position <span className="text-red-500">*</span></label><select value={caPosition} onChange={e => setCaPosition(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]"><option value="">Select position</option>{CH_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                  {caPosition === 'Other' && <input type="text" value={caPositionOther} onChange={e => setCaPositionOther(e.target.value)} placeholder="Please specify" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">3. ID Photo <span className="text-gray-400 font-normal normal-case">(Optional)</span></p>
              <input ref={idPhotoRef} type="file" accept="image/*" onChange={handleIdPhotoChange} className="hidden" />
              {idPhotoUrl ? (
                <div className="flex items-center gap-3">
                  <img src={idPhotoUrl} alt="ID" className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                  <div><p className="text-xs text-green-600 font-medium mb-1">ID photo uploaded</p><button type="button" onClick={() => { setIdPhotoUrl(null); if (idPhotoRef.current) idPhotoRef.current.value = ''; }} className="text-xs text-red-500 hover:underline">Remove</button></div>
                </div>
              ) : (
                <button type="button" onClick={() => idPhotoRef.current?.click()} className="w-full flex items-center gap-3 px-3 py-2.5 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#8d1436]/40 hover:bg-[#8d1436]/5 transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-gray-400" /></div>
                  <div><p className="text-xs font-medium text-gray-700 flex items-center gap-1"><Upload className="w-3 h-3" /> Upload ID Photo</p><p className="text-[10px] text-gray-400 mt-0.5">Valid ID, student card, or gov-issued ID</p></div>
                </button>
              )}
            </div>
            {role === 'handler' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2.5 flex gap-2 text-xs text-yellow-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600" />
                Case handler accounts require admin approval before you can log in. You will be notified by email once activated.
              </div>
            )}
            {caError && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-xs"><AlertCircle className="w-4 h-4 flex-shrink-0" /> {caError}</div>}
            <button type="submit" className="w-full py-2.5 bg-[#8d1436] text-white font-bold text-sm rounded-xl hover:bg-[#7a1130] transition-colors shadow-sm">
              {role === 'handler' ? 'Submit Registration' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  // ── PENDING ACTIVATION ──
  const pendingPage = (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-7 h-7 text-yellow-600" /></div>
          <h2 className="text-lg font-black text-gray-900 mb-2">Registration Submitted</h2>
          <p className="text-sm text-gray-600 mb-4">Your account is <strong>pending admin activation</strong>. You will receive an email at <span className="font-medium text-[#8d1436]">{caEmail || 'your registered email'}</span> once approved.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800 text-left mb-5">
            <p className="font-semibold mb-1">What happens next?</p>
            <ol className="list-decimal list-inside space-y-1 text-yellow-700 text-xs">
              <li>Admin reviews your registration</li>
              <li>Account is approved and activated</li>
              <li>You receive an email notification</li>
              <li>You can now log in as a Case Handler</li>
            </ol>
          </div>
          <button onClick={() => { setPage('login'); resetCreateForm(); }} className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-50 transition-colors">Back to Login</button>
        </div>
      </div>
    </div>
  );

  const pageContent: Record<PublicPage, React.ReactNode> = {
    home: homePage,
    repository: repositoryPage,
    about: aboutPage,
    faq: faqPage,
    contact: contactPage,
    login: loginPage,
    'create-account': createAccountPage,
    'pending-activation': pendingPage,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {navbar}
      <main className="flex-1 pt-20">
        {pageContent[page]}
      </main>
      {!isAuthPage && (
        <footer className="bg-white border-t border-gray-200 py-8 px-4">
          <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
            {/* Branding */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <img src={uplbLogo} alt="UPLB" className="h-12 w-auto object-contain" />
              <img src={ttbdoLogo} alt="TTBDO" className="h-11 object-contain" />
              <span className="text-gray-200 mx-1 self-stretch w-px bg-gray-200" />
              <div>
                <p className="text-xs font-black text-[#8d1436] tracking-widest uppercase leading-none">IPASA</p>
                <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">Intellectual Property Application<br />System Administration</p>
              </div>
            </div>

            {/* Office info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-700 mb-2">Technology Transfer and Business Development Office</p>
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500">2/F CTTE Building, Science and Technology Park, University of the Philippines, 4031, Los Baños, Laguna</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <p className="text-xs text-gray-500">+501 4756</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <a href="mailto:ttbdo.uplb@up.edu.ph" className="text-xs text-gray-500 hover:text-[#8d1436] transition-colors">ttbdo.uplb@up.edu.ph</a>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-xs text-gray-400 flex-shrink-0 self-end">© {new Date().getFullYear()} UP Los Baños</p>
          </div>
        </footer>
      )}
    </div>
  );
}
