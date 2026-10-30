import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const iconBg = variant === 'danger' ? 'bg-red-50' : variant === 'warning' ? 'bg-amber-50' : 'bg-[#fdf0f3]';
  const iconColor = variant === 'danger' ? 'text-red-500' : variant === 'warning' ? 'text-amber-500' : 'text-[#8d1436]';
  const confirmBg = variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#8d1436] hover:bg-[#7a1130]';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <button onClick={onCancel} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
          <X className="w-4 h-4" />
        </button>
        <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-4`}>
          {variant === 'danger' || variant === 'warning'
            ? <AlertTriangle className={`w-6 h-6 ${iconColor}`} />
            : <CheckCircle2 className={`w-6 h-6 ${iconColor}`} />
          }
        </div>
        <h2 className="text-base font-bold text-gray-900 text-center mb-2">{title}</h2>
        <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors ${confirmBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
