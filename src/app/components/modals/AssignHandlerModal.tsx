import { useState, useMemo } from "react";
import { X, User, CalendarDays, StickyNote, Search, Filter, Briefcase, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./ConfirmDialog";

interface AssignHandlerModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: { id: string; title: string; type: string } | null;
  onAssign: (id: string, handler: string, deadline?: string) => void;
}

const CASE_HANDLERS: { name: string; specializations: string[]; activeCases: number; email: string }[] = [
  { name: "Ana Reyes",             specializations: ["Patent", "Utility Model"],           activeCases: 5,  email: "areyes@up.edu.ph" },
  { name: "Nathan Felipe Cruz",    specializations: ["Patent", "Industrial Design"],        activeCases: 4,  email: "ncruz@up.edu.ph" },
  { name: "Samuel Mendoza",        specializations: ["Copyright", "Industrial Design"],     activeCases: 3,  email: "smendoza@up.edu.ph" },
  { name: "Maria Santos",          specializations: ["Trademark", "Copyright"],             activeCases: 6,  email: "msantos@up.edu.ph" },
  { name: "Katrina Mercado",       specializations: ["Trademark", "Patent"],                activeCases: 4,  email: "kmercado@up.edu.ph" },
  { name: "Anna Maria Garcia",     specializations: ["Trademark", "Copyright"],             activeCases: 2,  email: "amgarcia@up.edu.ph" },
  { name: "Carlos Mendoza",        specializations: ["Patent", "Utility Model"],            activeCases: 7,  email: "cmendoza@up.edu.ph" },
  { name: "Tristan Perez-Navarro", specializations: ["Copyright", "Industrial Design"],     activeCases: 3,  email: "tpnavarro@up.edu.ph" },
];

const IP_TYPES = ["Patent", "Utility Model", "Trademark", "Copyright", "Industrial Design"];

function WorkloadBar({ count }: { count: number }) {
  const max = 8;
  const pct = Math.min((count / max) * 100, 100);
  const color = count >= 7 ? "bg-red-500" : count >= 5 ? "bg-amber-500" : "bg-[#00563f]";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[10px] font-bold w-4 text-right ${count >= 7 ? "text-red-600" : count >= 5 ? "text-amber-600" : "text-gray-600"}`}>{count}</span>
    </div>
  );
}

export function AssignHandlerModal({ isOpen, onClose, application, onAssign }: AssignHandlerModalProps) {
  const [selectedHandler, setSelectedHandler] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [ipFilter, setIpFilter] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const filtered = useMemo(() => {
    return CASE_HANDLERS.filter(h => {
      const matchSearch = !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.email.toLowerCase().includes(search.toLowerCase());
      const matchType = !ipFilter || h.specializations.includes(ipFilter);
      return matchSearch && matchType;
    });
  }, [search, ipFilter]);

  if (!isOpen || !application) return null;

  const selected = CASE_HANDLERS.find(h => h.name === selectedHandler);

  const handleSubmit = () => {
    if (!selectedHandler) { toast.error("Please select a case handler"); return; }
    setIsSubmitting(true);
    setTimeout(() => {
      onAssign(application.id, selectedHandler, deadline || undefined);
      setIsSubmitting(false);
      setSelectedHandler("");
      setDeadline("");
      setNotes("");
      setSearch("");
      setIpFilter("");
      onClose();
      toast.success(`Assigned to ${selectedHandler}${deadline ? ` — deadline ${new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}`);
    }, 500);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Assign Case Handler</h2>
            <p className="text-xs text-gray-500 mt-0.5 max-w-[320px] truncate">{application.title}</p>
            <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{application.type}</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 flex-shrink-0 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Search + filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search handler name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              <select
                value={ipFilter}
                onChange={e => setIpFilter(e.target.value)}
                className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] appearance-none"
              >
                <option value="">All IP Types</option>
                {IP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Handler list with workload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                <User className="w-3.5 h-3.5" />
                Select Case Handler
              </label>
              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00563f] inline-block" /> Low (≤4)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Med (5–6)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> High (7+)</span>
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-[240px] overflow-y-auto">
              {filtered.length === 0 && (
                <div className="py-6 text-center text-gray-400 text-xs">No handlers match your filter.</div>
              )}
              {filtered.map(h => (
                <button
                  key={h.name}
                  type="button"
                  onClick={() => setSelectedHandler(h.name)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${selectedHandler === h.name ? "bg-[#fdf0f3] border-l-4 border-[#8d1436]" : "hover:bg-gray-50 border-l-4 border-transparent"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${selectedHandler === h.name ? "bg-[#8d1436] text-white" : "bg-gray-100 text-gray-600"}`}>
                    {h.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-900 truncate">{h.name}</p>
                      {h.activeCases >= 7 && <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-gray-400 mb-1 truncate">{h.specializations.join(" · ")}</p>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Briefcase className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-[10px] text-gray-500 mr-1">{h.activeCases} active</span>
                      <WorkloadBar count={h.activeCases} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {selected && selected.activeCases >= 7 && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {selected.name} has a high caseload ({selected.activeCases} active cases). Consider another handler.
              </div>
            )}
          </div>

          {/* Deadline */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              <CalendarDays className="w-3.5 h-3.5" />
              Deadline <span className="text-gray-400 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              min={today}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">The case handler will see this as their processing deadline.</p>
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              <StickyNote className="w-3.5 h-3.5" />
              Internal Notes <span className="text-gray-400 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add specific instructions or notes for the handler..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] resize-none text-sm"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
          <button
            onClick={() => {
              if (!selectedHandler) { toast.error("Please select a case handler"); return; }
              setConfirmDialog({ title: 'Assign Handler', message: `Assign ${selectedHandler} as the case handler for "${application.title}"?`, onConfirm: handleSubmit });
            }}
            disabled={isSubmitting || !selectedHandler}
            className="flex-1 py-2 text-sm font-semibold bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130] transition-colors disabled:opacity-40"
          >
            {isSubmitting ? "Assigning..." : "Assign Handler"}
          </button>
        </div>
      </div>
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel="Assign Handler"
          onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
