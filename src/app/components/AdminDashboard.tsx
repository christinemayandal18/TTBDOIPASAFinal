import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import AdminNav from './AdminNav';
import { Info, TrendingUp, FileText, Clock, CheckCircle } from 'lucide-react';

const SOLID_COLORS = ['#8d1436', '#00563f', '#c8920a', '#3b5ba5', '#6b4c9a'];
const IP_TYPES = ['Patent', 'Utility Model', 'Trademark', 'Copyright', 'Industrial Design'];

const FILED_DATA: Record<number, Record<string, number>> = {
  2024: { Patent: 8, 'Utility Model': 5, Trademark: 6, Copyright: 11, 'Industrial Design': 2 },
  2025: { Patent: 12, 'Utility Model': 7, Trademark: 9, Copyright: 14, 'Industrial Design': 4 },
  2026: { Patent: 5, 'Utility Model': 3, Trademark: 4, Copyright: 6, 'Industrial Design': 2 },
};

const COMPLETED_BY_TYPE      = { Patent: 6, 'Utility Model': 4, Trademark: 5, Copyright: 9, 'Industrial Design': 2 };
const UNASSIGNED_BY_TYPE     = { Patent: 3, 'Utility Model': 2, Trademark: 2, Copyright: 1, 'Industrial Design': 1 };
const PRE_PROTECTION_BY_TYPE = { Patent: 4, 'Utility Model': 3, Trademark: 3, Copyright: 3, 'Industrial Design': 2 };
const PROSECUTION_BY_TYPE    = { Patent: 5, 'Utility Model': 3, Trademark: 3, Copyright: 3, 'Industrial Design': 1 };
const FILED_BY_TYPE          = { Patent: 8, 'Utility Model': 4, Trademark: 5, Copyright: 7, 'Industrial Design': 3 };

const CARD_DESCRIPTIONS: Record<string, string> = {
  Unassigned:       'Cases submitted by applicants that have not yet been assigned to a case handler.',
  'Pre-Protection': 'Cases currently being processed by a case handler before filing with IPOPHL.',
  Completed:        'IP applications that have completed the full protection process and received certification.',
  Filed:            'Applications successfully filed with IPOPHL across all IP types.',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm">
        <p className="font-semibold text-gray-700 mb-0.5">{label}</p>
        <p className="text-[#8d1436] font-bold">{payload[0].value} applications</p>
      </div>
    );
  }
  return null;
};

function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 leading-relaxed pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

interface TypeBreakdownCardProps {
  title: string;
  description: string;
  data: Record<string, number>;
  total: number;
  selectedTypes: string[];
}
function TypeBreakdownCard({ title, description, data, total, selectedTypes }: TypeBreakdownCardProps) {
  const filteredTotal = selectedTypes.length === IP_TYPES.length
    ? total
    : selectedTypes.reduce((sum, t) => sum + (data[t] ?? 0), 0);
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-baseline justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
          <InfoTooltip text={description} />
        </div>
        <span className="text-2xl font-bold text-gray-900">{filteredTotal}</span>
      </div>
      <div className="space-y-2 mt-3">
        {IP_TYPES.filter(t => selectedTypes.includes(t)).map((type, i) => (
          <div key={type} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: SOLID_COLORS[IP_TYPES.indexOf(type) % SOLID_COLORS.length] }} />
              <span className="text-gray-600 text-xs">{type}</span>
            </div>
            <span className="font-semibold text-gray-900 text-xs">{data[type] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [filedYear, setFiledYear] = useState(2026);
  const [barYear, setBarYear] = useState(2026);

  // Global IP type filter
  const [selectedTypes, setSelectedTypes] = useState<string[]>([...IP_TYPES]);
  const [stackedFilter, setStackedFilter] = useState<string[]>(IP_TYPES);
  const toggleType = (t: string) => {
    setSelectedTypes(prev => prev.includes(t) ? (prev.length > 1 ? prev.filter(x => x !== t) : prev) : [...prev, t]);
  };
  const allSelected = selectedTypes.length === IP_TYPES.length;

  const filedByType = FILED_DATA[filedYear] ?? {};
  const filedTotal  = IP_TYPES.reduce((s, t) => s + (filedByType[t] ?? 0), 0);
  const filedPieData = IP_TYPES
    .filter(t => selectedTypes.includes(t))
    .map((t, _i) => ({ name: t, value: filedByType[t] ?? 0, color: SOLID_COLORS[IP_TYPES.indexOf(t)] }))
    .filter(d => d.value > 0);

  const unassignedTotal    = IP_TYPES.reduce((s, t) => s + (UNASSIGNED_BY_TYPE[t as keyof typeof UNASSIGNED_BY_TYPE] ?? 0), 0);
  const preProtectionTotal = IP_TYPES.reduce((s, t) => s + (PRE_PROTECTION_BY_TYPE[t as keyof typeof PRE_PROTECTION_BY_TYPE] ?? 0), 0);
  const completedTotal     = IP_TYPES.reduce((s, t) => s + (COMPLETED_BY_TYPE[t as keyof typeof COMPLETED_BY_TYPE] ?? 0), 0);
  const filedByTypeTotal   = IP_TYPES.reduce((s, t) => s + (FILED_BY_TYPE[t as keyof typeof FILED_BY_TYPE] ?? 0), 0);

  type MonthEntry = { name: string; Patent: number; 'Utility Model': number; Trademark: number; Copyright: number; 'Industrial Design': number };
  const MONTHLY_DATA: Record<number, MonthEntry[]> = {
    2024: [
      { name:'Jan', Patent:2, 'Utility Model':1, Trademark:2, Copyright:2, 'Industrial Design':1 },
      { name:'Feb', Patent:3, 'Utility Model':2, Trademark:2, Copyright:3, 'Industrial Design':1 },
      { name:'Mar', Patent:4, 'Utility Model':2, Trademark:3, Copyright:4, 'Industrial Design':1 },
      { name:'Apr', Patent:5, 'Utility Model':3, Trademark:3, Copyright:4, 'Industrial Design':2 },
      { name:'May', Patent:3, 'Utility Model':2, Trademark:3, Copyright:4, 'Industrial Design':1 },
      { name:'Jun', Patent:4, 'Utility Model':2, Trademark:4, Copyright:5, 'Industrial Design':1 },
      { name:'Jul', Patent:5, 'Utility Model':3, Trademark:4, Copyright:5, 'Industrial Design':1 },
      { name:'Aug', Patent:6, 'Utility Model':3, Trademark:4, Copyright:6, 'Industrial Design':1 },
      { name:'Sep', Patent:4, 'Utility Model':2, Trademark:3, Copyright:5, 'Industrial Design':1 },
      { name:'Oct', Patent:6, 'Utility Model':4, Trademark:5, Copyright:6, 'Industrial Design':1 },
      { name:'Nov', Patent:5, 'Utility Model':3, Trademark:4, Copyright:5, 'Industrial Design':2 },
      { name:'Dec', Patent:3, 'Utility Model':2, Trademark:2, Copyright:4, 'Industrial Design':1 },
    ],
    2025: [
      { name:'Jan', Patent:4, 'Utility Model':2, Trademark:3, Copyright:4, 'Industrial Design':1 },
      { name:'Feb', Patent:5, 'Utility Model':3, Trademark:4, Copyright:5, 'Industrial Design':1 },
      { name:'Mar', Patent:6, 'Utility Model':3, Trademark:5, Copyright:6, 'Industrial Design':1 },
      { name:'Apr', Patent:7, 'Utility Model':4, Trademark:5, Copyright:7, 'Industrial Design':2 },
      { name:'May', Patent:6, 'Utility Model':3, Trademark:5, Copyright:6, 'Industrial Design':2 },
      { name:'Jun', Patent:8, 'Utility Model':4, Trademark:6, Copyright:8, 'Industrial Design':2 },
      { name:'Jul', Patent:7, 'Utility Model':3, Trademark:5, Copyright:7, 'Industrial Design':2 },
      { name:'Aug', Patent:8, 'Utility Model':4, Trademark:7, Copyright:9, 'Industrial Design':2 },
      { name:'Sep', Patent:7, 'Utility Model':4, Trademark:6, Copyright:8, 'Industrial Design':2 },
      { name:'Oct', Patent:9, 'Utility Model':5, Trademark:7, Copyright:9, 'Industrial Design':2 },
      { name:'Nov', Patent:8, 'Utility Model':4, Trademark:6, Copyright:8, 'Industrial Design':3 },
      { name:'Dec', Patent:5, 'Utility Model':2, Trademark:4, Copyright:5, 'Industrial Design':2 },
    ],
    2026: [
      { name:'Jan', Patent:3, 'Utility Model':2, Trademark:3, Copyright:4, 'Industrial Design':0 },
      { name:'Feb', Patent:4, 'Utility Model':2, Trademark:3, Copyright:5, 'Industrial Design':1 },
      { name:'Mar', Patent:5, 'Utility Model':3, Trademark:4, Copyright:5, 'Industrial Design':1 },
      { name:'Apr', Patent:6, 'Utility Model':3, Trademark:5, Copyright:6, 'Industrial Design':2 },
      { name:'May', Patent:5, 'Utility Model':3, Trademark:4, Copyright:6, 'Industrial Design':1 },
      { name:'Jun', Patent:7, 'Utility Model':3, Trademark:5, Copyright:7, 'Industrial Design':2 },
      { name:'Jul', Patent:2, 'Utility Model':1, Trademark:2, Copyright:3, 'Industrial Design':1 },
    ],
  };
  const monthlyData = MONTHLY_DATA[barYear] ?? [];
  const stackedData = monthlyData.map(d => {
    const r: any = { name: d.name };
    stackedFilter.forEach(t => { r[t] = (d as any)[t] ?? 0; });
    return r;
  });

  const stackedTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const total = payload.reduce((s: number, p: any) => s + (p.value ?? 0), 0);
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
        <p className="font-semibold text-gray-700 mb-1">{label} — {total} total</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-1.5 mb-0.5">
            <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: p.fill }} />
            <span className="text-gray-600">{p.name}:</span>
            <span className="font-semibold text-gray-900">{p.value}</span>
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <AdminNav />
      <div className="flex-1 min-w-0 max-w-[1600px] p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Analytics</h1>
          <p className="text-gray-600 text-sm">Overview of IP applications across all processing stages</p>
        </div>

        {/* Summary ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <Clock className="w-4 h-4" />, label: 'Pending Assignment', value: unassignedTotal, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
            { icon: <FileText className="w-4 h-4" />, label: 'In Pre-Protection', value: preProtectionTotal, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
            { icon: <TrendingUp className="w-4 h-4" />, label: 'In Prosecution', value: IP_TYPES.reduce((s, t) => s + (FILED_BY_TYPE[t as keyof typeof FILED_BY_TYPE] ?? 0), 0), color: 'text-[#8d1436]', bg: 'bg-[#fdf0f3]', border: 'border-[#e99ab2]' },
            { icon: <CheckCircle className="w-4 h-4" />, label: 'Completed', value: completedTotal, color: 'text-[#00563f]', bg: 'bg-green-50', border: 'border-green-200' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4 flex items-center gap-3`}>
              <div className={`w-9 h-9 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-xs text-gray-500 leading-none mb-0.5">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Global IP Type Filter */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 flex items-center gap-4 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex-shrink-0">Filter by IP Type:</span>
          <button
            onClick={() => setSelectedTypes(allSelected ? [IP_TYPES[0]] : [...IP_TYPES])}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${allSelected ? 'bg-[#8d1436] text-white border-[#8d1436]' : 'bg-white text-gray-600 border-gray-300 hover:border-[#8d1436]'}`}
          >
            Select All
          </button>
          <div className="flex gap-2 flex-wrap">
            {IP_TYPES.map((t, i) => (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedTypes.includes(t) ? 'text-white border-transparent' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                style={selectedTypes.includes(t) ? { backgroundColor: SOLID_COLORS[i], borderColor: SOLID_COLORS[i] } : {}}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 4 stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <TypeBreakdownCard title="Unassigned"    description={CARD_DESCRIPTIONS['Unassigned']}    data={UNASSIGNED_BY_TYPE}     total={unassignedTotal}    selectedTypes={selectedTypes} />
          <TypeBreakdownCard title="Pre-Protection" description={CARD_DESCRIPTIONS['Pre-Protection']} data={PRE_PROTECTION_BY_TYPE} total={preProtectionTotal} selectedTypes={selectedTypes} />
          <TypeBreakdownCard title="Completed"     description={CARD_DESCRIPTIONS['Completed']}     data={COMPLETED_BY_TYPE}      total={completedTotal}     selectedTypes={selectedTypes} />
          <TypeBreakdownCard title="Filed"         description={CARD_DESCRIPTIONS['Filed']}         data={FILED_BY_TYPE}          total={filedByTypeTotal}   selectedTypes={selectedTypes} />
        </div>

        {/* Charts row — pie chart is dominant, bar chart is compact sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Filed pie chart — dominant, 3 cols */}
          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-gray-900">Filed by Type</h3>
                <InfoTooltip text="Breakdown of IP applications successfully filed with IPOPHL by type." />
              </div>
              <select value={filedYear} onChange={e => setFiledYear(Number(e.target.value))} className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#8d1436] bg-white">
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative flex items-center justify-center mb-5">
                <div className="h-[220px] w-[220px]">
                  <ResponsiveContainer key={`${filedYear}-${selectedTypes.join(',')}`} width="100%" height="100%">
                    <PieChart>
                      <Pie data={filedPieData} cx="50%" cy="50%" innerRadius={68} outerRadius={100} paddingAngle={2} dataKey="value" nameKey="name" isAnimationActive={false} strokeWidth={0}>
                        {filedPieData.map((entry, i) => (
                          <Cell key={`cell-${i}-${entry.name}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: 12 }} formatter={(val: number, name: string) => [val, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-gray-900">{filedPieData.reduce((s, d) => s + d.value, 0)}</span>
                  <span className="text-xs text-gray-400 font-medium">total filed</span>
                </div>
              </div>
              <div className="w-full space-y-2">
                {IP_TYPES.filter(t => selectedTypes.includes(t)).map((type) => {
                  const val = filedByType[type] ?? 0;
                  const total = filedPieData.reduce((s, d) => s + d.value, 0);
                  const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: SOLID_COLORS[IP_TYPES.indexOf(type)] }} />
                      <span className="text-sm text-gray-600 flex-1">{type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: SOLID_COLORS[IP_TYPES.indexOf(type)] }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-900 w-6 text-right">{val}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stacked bar chart — compact, 2 cols */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-gray-900">Applications / Month</h3>
                <InfoTooltip text="New IP disclosures received per month, broken down by IP type." />
              </div>
              <select value={barYear} onChange={e => setBarYear(Number(e.target.value))} className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#8d1436] bg-white">
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-1 mt-2 mb-3">
              {IP_TYPES.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setStackedFilter(prev => prev.includes(t) ? (prev.length > 1 ? prev.filter(x => x !== t) : prev) : [...prev, t])}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${stackedFilter.includes(t) ? 'text-white border-transparent' : 'bg-white text-gray-500 border-gray-200'}`}
                  style={stackedFilter.includes(t) ? { backgroundColor: SOLID_COLORS[i % SOLID_COLORS.length] ?? '#8d1436', borderColor: SOLID_COLORS[i % SOLID_COLORS.length] ?? '#8d1436' } : {}}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} dx={-5} />
                  <Tooltip content={stackedTooltip} cursor={{ fill: 'rgba(141,20,54,0.06)' }} />
                  {IP_TYPES.filter(t => stackedFilter.includes(t)).map(t => {
                    const idx = IP_TYPES.indexOf(t);
                    const visibleTypes = IP_TYPES.filter(x => stackedFilter.includes(x));
                    const isTop = visibleTypes[visibleTypes.length - 1] === t;
                    return (
                      <Bar key={t} dataKey={t} stackId="a" fill={SOLID_COLORS[idx]} maxBarSize={36}
                        isAnimationActive={false}
                        radius={isTop ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 mt-3">
              {IP_TYPES.filter(t => stackedFilter.includes(t)).map(t => (
                <div key={t} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: SOLID_COLORS[IP_TYPES.indexOf(t)] }} />
                  <span className="text-[10px] text-gray-500">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
