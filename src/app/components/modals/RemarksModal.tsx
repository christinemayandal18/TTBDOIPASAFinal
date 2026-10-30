import { useState } from "react";
import { Dialog, DialogContent } from "../ui/Dialog";
import { toast } from "sonner";
import { MessageSquare, Clock } from "lucide-react";

export interface Remark {
  id: string;
  author: string;
  text: string;
  date: string;
}

interface RemarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: { id: string; title: string; remarks?: Remark[] } | null;
  onAddRemark: (id: string, remark: Remark) => void;
}

export function RemarksModal({ isOpen, onClose, item, onAddRemark }: RemarksModalProps) {
  const [newRemark, setNewRemark] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const remarks = item.remarks || [];

  const handleSubmit = () => {
    if (!newRemark.trim()) return;

    setIsSubmitting(true);
    
    const remark: Remark = {
      id: Math.random().toString(36).substr(2, 9),
      author: "Admin User", // In a real app, this would be the logged-in user
      text: newRemark.trim(),
      date: new Date().toISOString()
    };

    // Simulate API call
    setTimeout(() => {
      onAddRemark(item.id, remark);
      setIsSubmitting(false);
      setNewRemark("");
      toast.success("Remark added successfully");
    }, 400);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        title="Case Remarks" 
        description={item.title}
      >
        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
            {remarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                <MessageSquare className="w-8 h-8 opacity-20" />
                <p className="text-sm">No remarks yet. Be the first to add one.</p>
              </div>
            ) : (
              remarks.map((remark) => (
                <div key={remark.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900">{remark.author}</span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(remark.date).toLocaleDateString()} {new Date(remark.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{remark.text}</p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-200 pt-4 mt-auto">
            <textarea
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              placeholder="Type your remark here..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-salmon-500 resize-none mb-3 text-sm"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !newRemark.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-salmon-600 rounded-lg hover:bg-salmon-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Adding..." : "Add Remark"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}