import { useState, useRef, useCallback } from 'react';
import { Plus, Trash2, Upload, X, CheckCircle, ChevronDown, AlertTriangle, Printer, Info, FileText, Eye, Download } from 'lucide-react';
import ApplicantNav from './ApplicantNav';
import { toast } from 'sonner';

type IPType = 'Patent' | 'Utility Model' | 'Trademark' | 'Copyright' | 'Industrial Design';

interface Inventor { name: string; email: string; affiliation: string; contribution: string; royaltyShare: number; }

const IP_TYPE_DESCRIPTIONS: Record<IPType, string> = {
  Patent: 'A new or improved product, process, or composition of matter with industrial applicability.',
  'Utility Model': 'A functional device or product with a shorter examination process than patents.',
  Trademark: 'A sign, logo, name, or symbol that distinguishes goods or services from others.',
  Copyright: 'Original literary, artistic, or scientific work including software, manuals, and audiovisual materials.',
  'Industrial Design': 'The ornamental or aesthetic aspects of a product, including shape, pattern, or color.',
};

const IP_TYPE_FORMS: Record<IPType, { form: string }[]> = {
  Patent: [
    { form: 'Invention Disclosure Form' },
    { form: 'Deed of Assignment – Patent/UM' },
  ],
  'Utility Model': [
    { form: 'Invention Disclosure Form' },
    { form: 'Deed of Assignment – Patent/UM' },
  ],
  Trademark: [
    { form: 'Application for Trademark Registration' },
    { form: 'Deed of Assignment – Trademark' },
  ],
  Copyright: [
    { form: 'Copyright Application Form' },
    { form: 'Deed of Assignment – Copyright' },
  ],
  'Industrial Design': [
    { form: 'Industrial Design Application Form' },
    { form: 'Deed of Assignment – Industrial Design' },
  ],
};

const FUNDING_SOURCES = ['DOST-PCAARRD', 'DOST-PCHRD', 'DOST-PCIEERD', 'DA-BAR', 'CHED', 'DENR-FMB', 'University Funds', 'External Grant', 'Personal Funds', 'None', 'Others'];


export default function ApplicantSubmitDisclosure() {
  const [ipType, setIpType] = useState<IPType | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fundingSource, setFundingSource] = useState('');
  const [customFundingSource, setCustomFundingSource] = useState('');
  const [inventors, setInventors] = useState<Inventor[]>([{ name: '', email: '', affiliation: 'UPLB', contribution: '', royaltyShare: 100 }]);
  const [files, setFiles] = useState<File[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ipTypeOpen, setIpTypeOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasPublicDisclosure, setHasPublicDisclosure] = useState<'yes' | 'no' | ''>('');
  const [publicDisclosureDate, setPublicDisclosureDate] = useState('');
  const [publicDisclosureDesc, setPublicDisclosureDesc] = useState('');
  const [showFormPreview, setShowFormPreview] = useState(false);

  const totalShare = inventors.reduce((s, i) => s + (i.royaltyShare || 0), 0);
  const shareValid = Math.abs(totalShare - 100) < 0.01;

  const addInventor = () => setInventors(prev => [...prev, { name: '', email: '', affiliation: 'UPLB', contribution: '', royaltyShare: 0 }]);
  const removeInventor = (idx: number) => setInventors(prev => prev.filter((_, i) => i !== idx));
  const updateInventor = (idx: number, field: keyof Inventor, value: string | number) => setInventors(prev => prev.map((inv, i) => i === idx ? { ...inv, [field]: value } : inv));

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const publicDisclosureValid = hasPublicDisclosure !== '' && (hasPublicDisclosure === 'no' || (publicDisclosureDate && publicDisclosureDesc.trim()));
  const canSubmit = ipType && title.trim() && description.trim() && inventors.every(i => i.name && i.email) && shareValid && agreed && files.length > 0 && publicDisclosureValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    setSubmitted(true);
    toast.success('Disclosure submitted successfully!');
  };

  const resetForm = () => {
    setSubmitted(false); setIpType(''); setTitle(''); setDescription(''); setFundingSource('');
    setCustomFundingSource('');
    setInventors([{ name: '', email: '', affiliation: 'UPLB', contribution: '', royaltyShare: 100 }]);
    setFiles([]); setAgreed(false); setHasPublicDisclosure(''); setPublicDisclosureDate('');
    setPublicDisclosureDesc(''); setShowFormPreview(false);
  };

  const generateFormContent = useCallback((formName: string): string => {
    const submittedInventors = inventors.filter(i => i.name);
    const effectiveFundingSource = fundingSource === 'Others' ? customFundingSource : fundingSource;
    const lines = [
      `UPLB TECHNOLOGY TRANSFER AND BUSINESS DEVELOPMENT OFFICE`,
      `IPASA — Auto-Generated Prefilled Form`,
      `=`.repeat(60),
      ``,
      `Form: ${formName}`,
      `IP Type: ${ipType}`,
      `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      ``,
      `-`.repeat(60),
      `TITLE OF INVENTION / WORK`,
      title,
      ``,
      `-`.repeat(60),
      `DESCRIPTION`,
      description,
      ``,
      `-`.repeat(60),
      `FUNDING SOURCE`,
      effectiveFundingSource || 'Not specified',
      ``,
      `-`.repeat(60),
      `PRIOR PUBLIC DISCLOSURE`,
      hasPublicDisclosure === 'yes'
        ? `Yes — Date: ${publicDisclosureDate}\nDetails: ${publicDisclosureDesc}`
        : 'No prior public disclosure',
      ``,
      `-`.repeat(60),
      `INVENTORS / AUTHORS & ROYALTY SHARES`,
      ...submittedInventors.map((inv, i) =>
        `${i + 1}. ${inv.name} <${inv.email}> | ${inv.affiliation}${inv.contribution ? ` | ${inv.contribution}` : ''} | Share: ${inv.royaltyShare}%`
      ),
      ``,
      `=`.repeat(60),
      ``,
      `SIGNATURE (Wet signature required)`,
      ``,
      `Principal Inventor: ________________________  Date: __________`,
      ``,
      `NOTE: Print this form, sign with an original wet signature,`,
      `and submit to the TTBDO office at 2/F CTTE Building, UPLB.`,
    ];
    return lines.join('\n');
  }, [ipType, title, description, fundingSource, customFundingSource, hasPublicDisclosure, publicDisclosureDate, publicDisclosureDesc, inventors]);

  const downloadForm = useCallback((formName: string) => {
    const content = generateFormContent(formName);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = formName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.href = url;
    a.download = `IPASA_${safeName}_prefilled.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded: ${formName}`);
  }, [generateFormContent]);

  const downloadAllForms = useCallback(() => {
    const forms = ipType ? IP_TYPE_FORMS[ipType as IPType] : [];
    forms.forEach((f, i) => {
      setTimeout(() => downloadForm(f.form), i * 200);
    });
    toast.success(`Downloading ${forms.length} form${forms.length !== 1 ? 's' : ''}…`);
  }, [ipType, downloadForm]);

  const requiredForms = ipType ? IP_TYPE_FORMS[ipType] : [];

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <ApplicantNav />
      <div className="flex-1 min-w-0 max-w-[900px] mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">New Disclosure</h1>
          <p className="text-gray-600 text-sm">Fill out this form to begin the IP protection process for your work.</p>
        </div>

        {/* Instructional top banner */}
        <div className="mb-5 bg-[#8d1436] rounded-xl px-5 py-4 flex items-start gap-3">
          <FileText className="w-5 h-5 text-white/80 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-white">Fill out and system will auto generate needed forms.</p>
            <p className="text-xs text-white/70 mt-0.5">No manual form downloading required. The system will automatically populate all application forms based on your submission.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* IP Type */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">IP Type <span className="text-red-500">*</span></h2>
            <div className="relative">
              <button type="button" onClick={() => setIpTypeOpen(o => !o)} className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg text-sm transition-colors ${ipType ? 'border-[#8d1436] text-gray-900' : 'border-gray-300 text-gray-400'} bg-white hover:border-[#8d1436]`}>
                <span>{ipType || 'Select IP type...'}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${ipTypeOpen ? 'rotate-180' : ''}`} />
              </button>
              {ipTypeOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {(['Patent', 'Utility Model', 'Trademark', 'Copyright', 'Industrial Design'] as IPType[]).map(type => (
                    <button key={type} type="button" onClick={() => { setIpType(type); setIpTypeOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-[#fdf0f3] transition-colors border-b last:border-0 border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{type}</p>
                      <p className="text-xs text-gray-500">{IP_TYPE_DESCRIPTIONS[type]}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auto-generated forms preview */}
            {ipType && requiredForms.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Forms the System Will Auto-Generate for {ipType}</p>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-[#8d1436] px-4 py-2 flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-white/70" />
                    <p className="text-xs font-bold text-white">Example of Auto-Populated Form</p>
                    <span className="ml-auto text-[10px] text-white/50 font-mono">Preview</span>
                  </div>
                  <div className="p-4 bg-gray-50 space-y-2">
                    {requiredForms.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white rounded-lg px-4 py-2.5 border border-gray-200">
                        <FileText className="w-3.5 h-3.5 text-[#8d1436] flex-shrink-0" />
                        <p className="text-xs font-medium text-gray-800 flex-1">{f.form}</p>
                        <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">Auto-filled</span>
                      </div>
                    ))}
                    <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-[10px] text-blue-700">Fields like your name, IP title, inventors, and funding source will be automatically filled in from this form.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Disclosure Details</h2>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Title <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Full title of your IP" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Description <span className="text-red-500">*</span></label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Briefly describe your IP, its novelty, and its potential applications..." className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] resize-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Funding Source</label>
              <select value={fundingSource} onChange={e => { setFundingSource(e.target.value); if (e.target.value !== 'Others') setCustomFundingSource(''); }} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white">
                <option value="">Select funding source...</option>
                {FUNDING_SOURCES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              {fundingSource === 'Others' && (
                <input
                  type="text"
                  value={customFundingSource}
                  onChange={e => setCustomFundingSource(e.target.value)}
                  placeholder="Please specify your funding source..."
                  className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]"
                />
              )}
            </div>
          </div>

          {/* Inventors */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Inventors / Authors</h2>
              <button type="button" onClick={addInventor} className="flex items-center gap-1 text-xs text-[#8d1436] font-semibold hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            {inventors.map((inv, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500">{idx === 0 ? 'Primary Inventor / Author' : `Inventor / Author ${idx + 1}`}</p>
                  {idx > 0 && <button type="button" onClick={() => removeInventor(idx)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" value={inv.name} onChange={e => updateInventor(idx, 'name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Email <span className="text-red-500">*</span></label>
                    <input type="email" value={inv.email} onChange={e => updateInventor(idx, 'email', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Contribution</label>
                    <input type="text" value={inv.contribution} onChange={e => updateInventor(idx, 'contribution', e.target.value)} placeholder="e.g., Design, Fabrication" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Royalty Share (%)</label>
                    <input type="number" min="0" max="100" value={inv.royaltyShare} onChange={e => updateInventor(idx, 'royaltyShare', parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                  </div>
                </div>
              </div>
            ))}
            <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold ${shareValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              <span>Total Royalty Share</span>
              <span>{totalShare}% {shareValid ? '✓' : '— must equal 100%'}</span>
            </div>
          </div>

          {/* First IP Public Disclosure */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-0.5">First IP Public Disclosure <span className="text-red-500">*</span></h2>
              <p className="text-xs text-gray-500">Has this IP been publicly disclosed (e.g., published, presented at a conference, or demonstrated publicly) prior to this submission?</p>
            </div>
            <div className="flex gap-3">
              {(['yes','no'] as const).map(val => (
                <button key={val} type="button" onClick={() => setHasPublicDisclosure(val)} className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${hasPublicDisclosure === val ? 'bg-[#8d1436] text-white border-[#8d1436]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#8d1436]'}`}>
                  {val === 'yes' ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
            {hasPublicDisclosure === 'yes' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                <p className="text-xs text-amber-800 font-semibold">Important: Public disclosure before filing may affect patentability. Please provide details so TTBDO can advise you.</p>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Date of First Public Disclosure <span className="text-red-500">*</span></label>
                  <input type="date" value={publicDisclosureDate} onChange={e => setPublicDisclosureDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Description of Disclosure <span className="text-red-500">*</span></label>
                  <textarea value={publicDisclosureDesc} onChange={e => setPublicDisclosureDesc(e.target.value)} rows={3} placeholder="Describe how and where the IP was publicly disclosed (e.g., conference name, publication title, demonstration event)..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] resize-none" />
                </div>
              </div>
            )}
            {hasPublicDisclosure === 'no' && (
              <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">Good — no prior public disclosure means your IP is more likely to meet novelty requirements.</p>
            )}
          </div>

          {/* File Attachments */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-0.5">Supporting Documents <span className="text-red-500">*</span></h2>
            <p className="text-xs text-gray-500 mb-4">Attach the completed forms for your selected IP type plus any supporting materials. At least one file is required.</p>
            <label className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-[#8d1436] hover:bg-[#fdf0f3] transition-colors">
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-600">Click to upload files</span>
              <span className="text-xs text-gray-400">PDF, DOCX, JPG, PNG (max 20MB each)</span>
              <input type="file" multiple className="hidden" onChange={handleFiles} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
            </label>
            {files.length === 0 && <p className="text-xs text-red-500 mt-2">At least one supporting document is required.</p>}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-700">
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-gray-400 flex-shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                    <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agreement */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#8d1436] flex-shrink-0" />
              <p className="text-sm text-gray-700">I certify that the information provided is accurate and complete. I understand that submitting false or misleading information may result in the rejection of this disclosure. I agree to UPLB TTBDO's IP policies and disclosure guidelines.</p>
            </label>
          </div>

          <button type="submit" disabled={!canSubmit} className="w-full py-3 bg-[#8d1436] text-white text-sm font-bold rounded-xl hover:bg-[#7a1130] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Submit Disclosure
          </button>
        </form>
      </div>

      {/* Success modal overlay */}
      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-white px-6 py-5 flex items-center gap-4 flex-shrink-0 border-b border-gray-200">
              <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Disclosure Submitted!</h2>
                <p className="text-sm text-gray-500">Your prefilled forms are ready to download.</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Download all */}
              <button
                onClick={downloadAllForms}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#8d1436] hover:bg-[#7a1130] text-white text-sm font-bold rounded-xl transition-colors mb-4"
              >
                <Download className="w-4 h-4" />
                Download All {(ipType ? IP_TYPE_FORMS[ipType as IPType] : []).length} Forms
              </button>

              {/* Individual forms */}
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Individual Forms</p>
              <div className="space-y-2 mb-5">
                {(ipType ? IP_TYPE_FORMS[ipType as IPType] : []).map((f, i) => (
                  <div key={i} className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                    <FileText className="w-4 h-4 text-[#8d1436] flex-shrink-0" />
                    <p className="text-sm text-gray-800 flex-1 min-w-0 truncate">{f.form}</p>
                    <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex-shrink-0">Auto-filled</span>
                    <button
                      onClick={() => downloadForm(f.form)}
                      className="flex items-center gap-1 text-xs font-bold text-white bg-[#8d1436] hover:bg-[#7a1130] px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                ))}
              </div>

              {/* Next steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-800 mb-1">What happens next?</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-xs text-blue-700">
                    <li>Print the downloaded prefilled forms above</li>
                    <li>Sign with an original wet signature</li>
                    <li>Submit to the TTBDO office physically</li>
                    <li>A case handler will be assigned — you will be notified</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 flex-shrink-0 bg-white">
              <button
                onClick={resetForm}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Submit Another
              </button>
              <button
                onClick={() => setSubmitted(false)}
                className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-submission confirmation modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-7">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 text-center mb-3">Confirm Submission</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              By submitting, you confirm that all information provided is correct. This data will be used to automatically populate your application forms. Please note that entering incorrect information will result in incorrect details on your generated forms.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-2.5 mb-6">
              <Printer className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900">Generated forms must be <strong>printed and submitted to the TTBDO office</strong> with an original wet signature.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Go Back
              </button>
              <button onClick={handleConfirmSubmit} className="flex-1 py-2.5 bg-[#8d1436] text-white rounded-xl text-sm font-bold hover:bg-[#7a1130] transition-colors">
                Confirm &amp; Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
