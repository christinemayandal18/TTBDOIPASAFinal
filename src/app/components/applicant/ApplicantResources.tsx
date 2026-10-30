import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, HelpCircle, Mail, Phone, MapPin, Search } from 'lucide-react';
import ApplicantNav from './ApplicantNav';

const FAQ_ITEMS = [
  { id: 1, category: 'Registration', q: 'How do I register for IPASA?', a: 'Click "Register Now" on the home page or "Create Account" from the User Portal dropdown. Fill in your personal information, affiliation, and create a password. Applicant accounts are activated immediately; Case Handler accounts require admin approval.' },
  { id: 2, category: 'Registration', q: "Can't create an account. What should I do?", a: 'Ensure you are using a valid email address and that your password is at least 8 characters. If the problem persists, contact TTBDO at ttbdo@up.edu.ph with a screenshot of the error.' },
  { id: 3, category: 'Registration', q: "I can't log in after registering. What should I do?", a: 'Verify you are using the correct email and password, and the correct User Portal (Applicant, Case Handler, or Admin). Case Handler accounts may be pending admin activation. Contact TTBDO if the issue continues.' },
  { id: 4, category: 'Registration', q: 'I forgot my password. How do I reset it?', a: 'Click the "Forgot password?" link on the login screen and enter your registered email address. You will receive a password reset link. Check your spam folder if you do not receive it within a few minutes.' },
  { id: 5, category: 'IP Disclosure', q: 'What is an Intellectual Property Disclosure?', a: 'An IP Disclosure is the first formal step in protecting your intellectual property at UPLB. It is a confidential document submitted to the TTBDO describing your invention, creative work, or trademark so TTBDO can assess its patentability and guide you through the protection process.' },
  { id: 6, category: 'IP Disclosure', q: 'What information do I need to submit a new disclosure?', a: "You'll need the IP title, a description of its novelty and applications, a list of inventors/authors with royalty shares, funding source, and any prior public disclosure information. Supporting documents (drawings, samples) must also be attached." },
  { id: 7, category: 'Application Process', q: 'How long does the IP application process take?', a: 'Timelines vary by IP type. Copyrights typically take a few months; trademarks 12–18 months; patents can take several years due to IPOPHL substantive examination. Your Case Handler will keep you updated through IPASA.' },
  { id: 8, category: 'Application Process', q: 'What is the difference between Pre-Protection and Prosecution?', a: 'Pre-Protection is the internal TTBDO processing stage where your Case Handler prepares your application. Prosecution is the external stage where your application is formally filed and examined by IPOPHL. Both are tracked in IPASA.' },
  { id: 9, category: 'Application Process', q: 'Can I edit my application after submission?', a: 'Each application allows one edit before a Case Handler is assigned. Once a handler is assigned, the edit option is permanently locked.' },
];

const FAQ_CATEGORIES = ['All', 'Registration', 'IP Disclosure', 'Application Process'];

export default function ApplicantResources() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState('All');

  const filteredFaqs = FAQ_ITEMS.filter(f => {
    const matchCat = faqCategory === 'All' || f.category === faqCategory;
    const matchSearch = !faqSearch || f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <ApplicantNav />
      <div className="flex-1 min-w-0 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Resources</h1>
            <p className="text-gray-600 text-sm">Reference materials and support for IP protection at UPLB TTBDO</p>
          </div>

          {/* External links */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">External Resources</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'IPOPHL Online Filing', href: 'https://www.ipophil.gov.ph', desc: 'File IP applications directly with IPOPHL' },
                { label: 'PatentScope Search', href: 'https://patentscope.wipo.int', desc: 'Search international patent databases (WIPO)' },
              ].map(link => (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-[#8d1436] hover:bg-[#fdf0f3] transition-colors group">
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#8d1436] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{link.label}</p>
                    <p className="text-xs text-gray-500">{link.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div id="faq" className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-5 h-5 text-[#8d1436]" />
                <h3 className="text-sm font-bold text-gray-900">Frequently Asked Questions</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={faqSearch}
                    onChange={e => setFaqSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {FAQ_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFaqCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${faqCategory === cat ? 'bg-[#8d1436] text-white border-[#8d1436]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#8d1436] hover:text-[#8d1436]'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredFaqs.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-400 text-sm">No questions match your search.</div>
              ) : filteredFaqs.map(faq => (
                <div key={faq.id}>
                  <button onClick={() => setFaqOpen(faqOpen === faq.id ? null : faq.id)} className="w-full flex items-start justify-between gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0 mt-0.5">{faq.category}</span>
                      <p className="text-sm font-medium text-gray-900">{faq.q}</p>
                    </div>
                    {faqOpen === faq.id ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />}
                  </button>
                  {faqOpen === faq.id && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact TTBDO */}
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
                  <p className="text-sm font-medium text-gray-900">2/F CTTE Building, Science and Technology Park, UPLB, Los Baños, Laguna</p>
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
    </div>
  );
}
