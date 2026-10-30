import { useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router';
import { Camera, Lock, LogOut, User, Save, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import AdminNav from './AdminNav';
import CaseHandlerNav from './CaseHandlerNav';
import ApplicantNav from './applicant/ApplicantNav';

type Tab = 'profile' | 'password';

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isHandler = location.pathname.startsWith('/handler');
  const isApplicant = location.pathname.startsWith('/applicant');
  const Nav = isApplicant ? ApplicantNav : isHandler ? CaseHandlerNav : AdminNav;

  const defaultName  = isApplicant
    ? (() => { try { return localStorage.getItem('app_name') || 'Applicant'; } catch { return 'Applicant'; } })()
    : isHandler
    ? (() => { try { return localStorage.getItem('ch_name') || 'Case Handler'; } catch { return 'Case Handler'; } })()
    : 'Admin User';
  const defaultEmail = isApplicant
    ? (() => { try { return localStorage.getItem('app_email') || 'applicant@up.edu.ph'; } catch { return 'applicant@up.edu.ph'; } })()
    : isHandler
    ? (() => { try { return localStorage.getItem('ch_email') || 'handler@uplb.edu.ph'; } catch { return 'handler@uplb.edu.ph'; } })()
    : 'admin@uplb.edu.ph';
  const avatarColor  = isApplicant ? '#ffb81c' : isHandler ? '#00563f' : '#8d1436';

  const [tab, setTab] = useState<Tab>(() => searchParams.get('tab') === 'password' ? 'password' : 'profile');
  const [name, setName] = useState(defaultName);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password tab
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveName = () => {
    if (isHandler) { try { localStorage.setItem('ch_name', name); } catch {} }
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2500);
  };

  const handleSavePassword = useCallback(() => {
    setPwError('');
    if (!currentPw) { setPwError('Current password is required.'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('New passwords do not match.'); return; }
    setPwSaved(true);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setTimeout(() => setPwSaved(false), 2500);
  }, [currentPw, newPw, confirmPw]);

  const handleLogout = () => navigate('/login');

  const pwStrength = (() => {
    if (newPw.length === 0) return null;
    let score = 0;
    if (newPw.length >= 8) score++;
    if (/[A-Z]/.test(newPw)) score++;
    if (/[0-9]/.test(newPw)) score++;
    if (/[^A-Za-z0-9]/.test(newPw)) score++;
    if (score <= 1) return { label: 'Weak', color: 'bg-red-400', width: 'w-1/4' };
    if (score === 2) return { label: 'Fair', color: 'bg-yellow-400', width: 'w-2/4' };
    if (score === 3) return { label: 'Good', color: 'bg-blue-400', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
  })();

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <Nav />
      <div className="flex-1 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Account Settings</h1>
          <p className="text-gray-500 text-sm mb-7">Manage your account details and security</p>

          {/* Tab bar */}
          <div className="flex border-b border-gray-200 mb-8 gap-6">
            {([
              { key: 'profile', icon: User, label: 'Profile' },
              { key: 'password', icon: Lock, label: 'Password' },
            ] as const).map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 pb-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === key ? 'border-[#8d1436] text-[#8d1436]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Profile tab */}
          {tab === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-3">
                  <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-white text-3xl font-bold shadow-md" style={{ backgroundColor: avatarColor }}>
                    {photoUrl ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase()}
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 rounded-full flex items-center justify-center shadow-sm hover:text-white transition-colors" style={{ borderColor: avatarColor, color: avatarColor }}>
                    <Camera className="w-4 h-4" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </div>
                <p className="text-xs text-gray-500">Click the camera icon to upload a new photo</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] text-sm" />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input type="email" value={defaultEmail} readOnly className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Email address cannot be changed</p>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleSaveName} className="flex items-center gap-2 px-5 py-2.5 bg-[#8d1436] text-white text-sm font-semibold rounded-lg hover:bg-[#7a1130] transition-colors shadow-sm">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
                {nameSaved && <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Profile updated</div>}
              </div>
            </div>
          )}

          {/* Password tab */}
          {tab === 'password' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              {[
                { label: 'Current Password', value: currentPw, set: setCurrentPw, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
                { label: 'New Password', value: newPw, set: setNewPw, show: showNew, toggle: () => setShowNew(v => !v) },
                { label: 'Confirm New Password', value: confirmPw, set: setConfirmPw, show: showConfirm, toggle: () => setShowConfirm(v => !v) },
              ].map(({ label, value, set, show, toggle }) => (
                <div key={label} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <input type={show ? 'text' : 'password'} value={value} onChange={e => set(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] text-sm pr-10" />
                    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}

              {pwStrength && (
                <div className="mb-4">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pwStrength.color} ${pwStrength.width}`} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Strength: <span className="font-medium">{pwStrength.label}</span></p>
                </div>
              )}

              {pwError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 mb-4 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {pwError}
                </div>
              )}

              <div className="flex items-center gap-3 mt-6">
                <button onClick={handleSavePassword} className="flex items-center gap-2 px-5 py-2.5 bg-[#8d1436] text-white text-sm font-semibold rounded-lg hover:bg-[#7a1130] transition-colors shadow-sm">
                  <Lock className="w-4 h-4" /> Update Password
                </button>
                {pwSaved && <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Password updated</div>}
              </div>
            </div>
          )}

          {/* Logout section */}
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Sign Out</p>
              <p className="text-xs text-gray-500 mt-0.5">End your current session and return to the login page</p>
            </div>
            {!logoutConfirm ? (
              <button onClick={() => setLogoutConfirm(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600 mr-1">Are you sure?</p>
                <button onClick={handleLogout} className="px-4 py-2 bg-[#8d1436] text-white text-sm font-semibold rounded-lg hover:bg-[#7a1130] transition-colors">Yes, Log Out</button>
                <button onClick={() => setLogoutConfirm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
