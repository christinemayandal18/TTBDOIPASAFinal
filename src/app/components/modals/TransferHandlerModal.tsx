import { useState } from "react";
import { X, ArrowRightLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./ConfirmDialog";

const ALL_HANDLERS = [
  "Ana Reyes",
  "Nathan Felipe Cruz",
  "Samuel Mendoza",
  "Maria Santos",
  "Katrina Mercado",
  "Anna Maria Garcia",
  "Carlos Mendoza",
  "Tristan Perez-Navarro",
];

interface TransferHandlerModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  caseTitle: string;
  currentHandler: string;
  onTransfer: (id: string, newHandler: string, reason: string) => void;
}

export function TransferHandlerModal({
  isOpen,
  onClose,
  caseId,
  caseTitle,
  currentHandler,
  onTransfer,
}: TransferHandlerModalProps) {
  const [newHandler, setNewHandler] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  if (!isOpen) return null;

  const available = ALL_HANDLERS.filter(h => h !== currentHandler);

  const handleSubmit = () => {
    if (!newHandler) { toast.error("Please select a handler"); return; }
    if (!reason.trim()) { toast.error("Please provide a reason for transfer"); return; }
    setIsSubmitting(true);
    setTimeout(() => {
      onTransfer(caseId, newHandler, reason);
      toast.success(`Case transferred to ${newHandler}`);
      setIsSubmitting(false);
      setNewHandler("");
      setReason("");
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Transfer Case</h2>
              <p className="text-xs text-gray-500 mt-0.5 max-w-[260px] truncate">{caseTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 flex-shrink-0 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Current handler */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-[#8d1436] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {currentHandler.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <p className="text-xs text-gray-400">Current handler</p>
              <p className="text-sm font-semibold text-gray-900">{currentHandler}</p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-gray-400" />
          </div>

          {/* New handler */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Transfer to</label>
            <select
              value={newHandler}
              onChange={e => setNewHandler(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] bg-white text-sm"
            >
              <option value="">Select new handler...</option>
              {available.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Reason for transfer</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Original handler is on leave, workload redistribution..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] resize-none"
            />
          </div>

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">The new handler will be notified and will inherit all existing remarks and folder access.</p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
          <button
            onClick={() => {
              if (!newHandler) { toast.error("Please select a handler"); return; }
              if (!reason.trim()) { toast.error("Please provide a reason for transfer"); return; }
              setConfirmDialog({ title: 'Confirm Transfer', message: `Transfer this case from ${currentHandler} to ${newHandler}? This action will notify the new handler and cannot be undone.`, onConfirm: handleSubmit });
            }}
            disabled={isSubmitting || !newHandler || !reason.trim()}
            className="flex-1 py-2 text-sm font-semibold bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130] transition-colors disabled:opacity-40"
          >
            {isSubmitting ? "Transferring..." : "Confirm Transfer"}
          </button>
        </div>
      </div>
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel="Transfer Case"
          variant="warning"
          onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
