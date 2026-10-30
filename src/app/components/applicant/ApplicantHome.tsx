import { useNavigate, Link } from 'react-router';
import { Play, Mail, Phone, MapPin, ArrowRight, FileText, PlusCircle, Clock, HelpCircle } from 'lucide-react';
import ApplicantNav from './ApplicantNav';

const JOURNEY_STAGES = [
  {
    num: 1, label: 'IP Pre-Protection', time: '~4 months',
    color: 'bg-[#8d1436]', textColor: 'text-[#8d1436]', borderColor: 'border-[#e8b0b0]', bgLight: 'bg-[#fdf0f3]',
    desc: 'TTBDO receives and reviews your disclosure, assigns a case handler, conducts a prior art search, prepares the draft, and endorses your application to the Office of the Chancellor for filing.',
  },
  {
    num: 2, label: 'IP Application', time: '~3 days',
    color: 'bg-blue-600', textColor: 'text-blue-700', borderColor: 'border-blue-200', bgLight: 'bg-blue-50',
    desc: 'The official IP application is filed with the Intellectual Property Office of the Philippines (IPOPHL). Filing fees are processed and acknowledgment of filing is received.',
  },
  {
    num: 3, label: 'IP Prosecution', time: '~2 months per Office Action',
    color: 'bg-[#00563f]', textColor: 'text-[#00563f]', borderColor: 'border-green-200', bgLight: 'bg-green-50',
    desc: 'IPOPHL examines the application and may issue Office Actions requiring responses. TTBDO monitors the prosecution process until your IP right is granted or registered.',
  },
];

export default function ApplicantHome() {
  const navigate = useNavigate();
  const appName = (() => { try { return localStorage.getItem('app_name') || 'Applicant'; } catch { return 'Applicant'; } })();
  const firstName = appName.split(' ')[0];

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <ApplicantNav />
      <div className="flex-1 min-w-0 max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* FAQ shortcut */}
        <div className="flex justify-end mb-2">
          <Link to="/applicant/resources" className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-[#8d1436]" /> FAQ & Resources
          </Link>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#8d1436] via-[#7a1130] to-[#5a0c24] rounded-2xl px-8 py-8 text-white shadow-lg">
          <p className="text-white/70 text-sm mb-1">Welcome back</p>
          <h1 className="text-3xl font-bold mb-3">Hello, {firstName}!</h1>
          <p className="text-white/80 text-sm mb-6 max-w-xl">Track your IP applications, respond to case handler requests, and submit new disclosures — all in one place.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/applicant/submit')} className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#8d1436] rounded-xl text-sm font-bold hover:bg-white/90 transition-colors">
              <PlusCircle className="w-4 h-4" /> New Disclosure
            </button>
            <button onClick={() => navigate('/applicant/applications')} className="flex items-center gap-2 px-5 py-2.5 bg-white/15 text-white rounded-xl text-sm font-semibold hover:bg-white/25 transition-colors border border-white/20">
              <FileText className="w-4 h-4" /> My Applications
            </button>
          </div>
        </div>

        {/* Tutorial video */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Getting Started</h2>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-md aspect-video max-w-2xl mx-auto flex items-center justify-center relative cursor-pointer group">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            <div className="relative flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors border-2 border-white/40">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-base">Introduction to IPASA</p>
                <p className="text-white/60 text-xs mt-0.5">Learn how to use the Applicant Portal · 4:32</p>
              </div>
            </div>
          </div>
        </div>

        {/* IP Protection Journey */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Your IP Protection Journey</h2>
          <p className="text-xs text-gray-500 mb-4">A typical IP application goes through 3 stages. Timelines are estimates and may vary based on IP type and IPOPHL examination.</p>
          <div className="space-y-4">
            {JOURNEY_STAGES.map((stage) => (
              <div key={stage.num} className={`rounded-xl border ${stage.borderColor} ${stage.bgLight} p-5 flex items-start gap-5`}>
                <div className={`w-11 h-11 rounded-full ${stage.color} flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm`}>
                  {stage.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <p className={`text-sm font-bold ${stage.textColor}`}>{stage.label}</p>
                    <span className={`flex items-center gap-1 text-xs font-medium ${stage.textColor} opacity-70`}>
                      <Clock className="w-3.5 h-3.5" /> {stage.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 italic">* These are estimated timelines and may vary. Patent prosecution may take 2–5 years depending on IPOPHL examination complexity.</p>
        </div>

        {/* TTBDO Contact */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#00563f] to-[#004a35] px-6 py-4">
            <p className="text-white font-bold text-base">TTBDO Contact Information</p>
            <p className="text-white/70 text-xs mt-0.5">Technology Transfer and Business Development Office</p>
          </div>
          <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00563f]/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-[#00563f]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <p className="text-sm font-medium text-gray-900">ttbdo@up.edu.ph</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00563f]/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-[#00563f]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                <p className="text-sm font-medium text-gray-900">(049) 536-2279</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00563f]/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-[#00563f]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Location</p>
                <p className="text-sm font-medium text-gray-900">2/F CTTE Building, Science and Technology Park, University of the Philippines, 4031, Los Baños, Laguna</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00563f]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#00563f]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Facebook</p>
                <a href="https://www.facebook.com/ttbdo.uplb/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#00563f] hover:underline">TTBDO UPLB</a>
              </div>
            </div>
          </div>
          <div className="px-6 pb-5">
            <p className="text-xs text-gray-400">Office hours: Monday – Friday, 8:00 AM – 5:00 PM</p>
          </div>
        </div>

      </div>
    </div>
  );
}
