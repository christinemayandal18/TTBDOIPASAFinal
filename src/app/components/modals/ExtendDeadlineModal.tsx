import { useState } from "react";
import { X, AlertTriangle, CalendarClock, Plus } from "lucide-react";

interface ExtendDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  caseTitle: string;
  currentDeadline: string | undefined; // ISO date
  onSave: (id: string, newDate: string) => void;
}

function addDays(base: string | undefined, days: number): string {
  const d = base ? new Date(base) : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function isLate(deadline: string | undefined): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

function daysLate(deadline: string | undefined): number {
  if (!deadline) return 0;
  return Math.floor((Date.now() - new Date(deadline).getTime()) / 86400000);
}

export function ExtendDeadlineModal({ isOpen, onClose, caseId, caseTitle, currentDeadline, onSave }: ExtendDeadlineModalProps) {
  const [customDays, setCustomDays] = useState("");
  const [specificDate, setSpecificDate] = useState("");
  const [mode, setMode] = useState<"quick" | "specific">("quick");
  const [pendingDate, setPendingDate] = useState<string | null>(null);

  if (!isOpen) return null;

  const late = isLate(currentDeadline);
  const daysOverdue = daysLate(currentDeadline);

  const confirmExtension = (newDate: string) => setPendingDate(newDate);

  const handleQuick = (days: number) => {
    confirmExtension(addDays(currentDeadline, days));
  };

  const handleCustomDays = () => {
    const d = parseInt(customDays, 10);
    if (isNaN(d) || d < 1) return;
    confirmExtension(addDays(currentDeadline, d));
  };

  const handleSpecificDate = () => {
    if (!specificDate) return;
    confirmExtension(specificDate);
  };

  if (pendingDate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={() => setPendingDate(null)} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Confirm Extension?</h3>
          <p className="text-sm text-gray-600 mb-1">New deadline will be set to:</p>
          <p className="text-sm font-bold text-[#8d1436] mb-4">{new Date(pendingDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          <div className="flex gap-3">
            <button onClick={() => setPendingDate(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={() => { onSave(caseId, pendingDate); setPendingDate(null); onClose(); }} className="flex-1 py-2.5 bg-[#8d1436] text-white text-sm font-bold rounded-xl hover:bg-[#7a1130] transition-colors">Confirm</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#fdf0f3] flex items-center justify-center flex-shrink-0">
              <CalendarClock className="w-4.5 h-4.5 text-[#8d1436]" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Extend Deadline</h2>
              <p className="text-xs text-gray-500 mt-0.5 max-w-[260px] truncate">{caseTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 flex-shrink-0 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Late warning */}
          {late && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Case is overdue</p>
                <p className="text-xs text-red-600 mt-0.5">
                  Deadline was{" "}
                  <span className="font-semibold">
                    {currentDeadline
                      ? new Date(currentDeadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                      : "—"}
                  </span>{" "}
                  — {daysOverdue} day{daysOverdue !== 1 ? "s" : ""} overdue.
                </p>
              </div>
            </div>
          )}

          {/* Current deadline display */}
          {currentDeadline && (
            <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-4 py-2.5">
              <span className="text-gray-500">Current deadline</span>
              <span className={`font-semibold ${late ? "text-red-600" : "text-gray-800"}`}>
                {new Date(currentDeadline).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
          )}

          {/* Mode toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setMode("quick")}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${mode === "quick" ? "bg-[#8d1436] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              Quick Extend
            </button>
            <button
              onClick={() => setMode("specific")}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${mode === "specific" ? "bg-[#8d1436] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              Specific Date
            </button>
          </div>

          {mode === "quick" ? (
            <div className="space-y-3">
              {/* Quick add buttons */}
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Extend by</p>
              <div className="grid grid-cols-3 gap-2">
                {[3, 7, 14].map(d => (
                  <button
                    key={d}
                    onClick={() => handleQuick(d)}
                    className="flex flex-col items-center gap-0.5 py-3 rounded-xl border-2 border-gray-200 hover:border-[#8d1436] hover:bg-[#fdf0f3] transition-all group"
                  >
                    <span className="text-xl font-bold text-gray-800 group-hover:text-[#8d1436]">+{d}</span>
                    <span className="text-[10px] text-gray-500">days</span>
                    <span className="text-[10px] text-gray-400">
                      → {new Date(addDays(currentDeadline, d)).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom days */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Or enter custom days</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      value={customDays}
                      onChange={e => setCustomDays(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] text-sm"
                    />
                  </div>
                  <span className="flex items-center text-sm text-gray-500 px-1">days</span>
                  <button
                    onClick={handleCustomDays}
                    disabled={!customDays || parseInt(customDays) < 1}
                    className="px-4 py-2 text-sm bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130] transition-colors font-medium disabled:opacity-40"
                  >
                    Apply
                  </button>
                </div>
                {customDays && parseInt(customDays) > 0 && (
                  <p className="text-xs text-gray-400 mt-1.5 ml-1">
                    New deadline: {new Date(addDays(currentDeadline, parseInt(customDays))).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Set specific date</p>
              <input
                type="date"
                value={specificDate}
                onChange={e => setSpecificDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436]"
              />
              <button
                onClick={handleSpecificDate}
                disabled={!specificDate}
                className="w-full py-2.5 text-sm bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130] transition-colors font-semibold disabled:opacity-40"
              >
                Set Deadline
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
