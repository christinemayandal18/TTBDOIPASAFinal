import { useState, useRef } from "react";
import { X, Check, MessageSquare, CheckCircle2, Shield, Briefcase, Paperclip, Eye } from "lucide-react";
import { toast } from "sonner";

export interface UnifiedRemarkReply {
  id: string;
  author: string;
  role: "admin" | "handler";
  text: string;
  date: string;
  attachmentName?: string;
  fileUrl?: string;
}

export interface UnifiedRemark {
  id: string;
  author: string;
  role: "admin" | "handler";
  text: string;
  date: string;
  read: boolean;
  resolved: boolean;
  replies?: UnifiedRemarkReply[];
  attachmentName?: string;
  fileUrl?: string;
}

interface UnifiedRemarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: { id: string; title: string; unifiedRemarks?: UnifiedRemark[] } | null;
  currentRole: "admin" | "handler";
  onAddRemark: (id: string, remark: UnifiedRemark) => void;
  onMarkResolved: (id: string, remarkId: string) => void;
  onMarkRead: (id: string, remarkId: string) => void;
  onAddReply?: (itemId: string, remarkId: string, reply: UnifiedRemarkReply) => void;
}

function prefixRemarksFile(fileName: string, remarkId: string, caseId: string): string {
  return `remarks_thread_${remarkId}_${caseId}_${fileName}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function FileViewerModal({ name, url, onClose }: { name: string; url?: string; onClose: () => void }) {
  const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name);
  const isPdf = /\.pdf$/i.test(name);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Paperclip className="w-4 h-4 text-[#8d1436] flex-shrink-0" />
            <span className="text-sm font-bold text-gray-900 truncate">{name}</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 flex-shrink-0"><X className="w-4 h-4" /></button>
        </div>
        {url && isImage ? (
          <img src={url} alt={name} className="w-full rounded-lg border border-gray-200 max-h-64 object-contain bg-gray-50" />
        ) : url && isPdf ? (
          <iframe src={url} className="w-full h-64 rounded-lg border border-gray-200" title={name} />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-3 bg-gray-50 rounded-xl border border-gray-200">
            <Paperclip className="w-10 h-10 text-gray-300" />
            <p className="text-sm text-gray-500 text-center">Preview not available<br /><span className="text-xs text-gray-400">{name}</span></p>
          </div>
        )}
        <div className="flex gap-2">
          {url && <a href={url} download={name} className="flex-1 py-2 text-xs font-semibold bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130] text-center">Download</a>}
          <button onClick={onClose} className={`${url ? "flex-1" : "w-full"} py-2 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50`}>Close</button>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ isMe, initials, label, text, date, attachmentName, fileUrl, onAttachmentClick, role }: {
  isMe: boolean; initials: string; label: string; text: string; date: string;
  attachmentName?: string; fileUrl?: string; onAttachmentClick?: () => void; role: "admin" | "handler";
}) {
  const myBg = role === "admin" ? "bg-[#8d1436] text-white" : "bg-blue-600 text-white";
  const avatarCls = role === "admin" ? "bg-[#8d1436]/15 text-[#8d1436]" : "bg-blue-100 text-blue-700";
  if (isMe) {
    return (
      <div className="flex items-end gap-2 justify-end">
        <div className="flex flex-col items-end max-w-[82%]">
          <span className="text-[10px] text-gray-400 mb-1">{label} · {timeAgo(date)}</span>
          <div className={`${myBg} rounded-2xl rounded-br-sm px-3 py-2 text-sm leading-relaxed`}>{text}</div>
          {attachmentName && (
            <button onClick={onAttachmentClick} className="mt-1 flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#8d1436] bg-white border border-gray-200 rounded-lg px-2 py-1 transition-colors cursor-pointer">
              <Paperclip className="w-3 h-3 flex-shrink-0" /><span className="truncate max-w-[130px]">{attachmentName}</span><Eye className="w-3 h-3 flex-shrink-0 opacity-60" />
            </button>
          )}
        </div>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${avatarCls}`}>{initials}</div>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${avatarCls}`}>{initials}</div>
      <div className="flex flex-col items-start max-w-[82%]">
        <span className="text-[10px] text-gray-400 mb-1">{label} · {timeAgo(date)}</span>
        <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-3 py-2 text-sm leading-relaxed">{text}</div>
        {attachmentName && (
          <button onClick={onAttachmentClick} className="mt-1 flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#8d1436] bg-white border border-gray-200 rounded-lg px-2 py-1 transition-colors cursor-pointer">
            <Paperclip className="w-3 h-3 flex-shrink-0" /><span className="truncate max-w-[130px]">{attachmentName}</span><Eye className="w-3 h-3 flex-shrink-0 opacity-60" />
          </button>
        )}
      </div>
    </div>
  );
}

export function UnifiedRemarksModal({
  isOpen, onClose, item, currentRole,
  onAddRemark, onMarkResolved, onMarkRead, onAddReply,
}: UnifiedRemarksModalProps) {
  const [newText, setNewText] = useState("");
  const [activeFilter, setActiveFilter] = useState<"open" | "resolved">("open");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [fileUrlMap, setFileUrlMap] = useState<Record<string, string>>({});
  const [viewingFile, setViewingFile] = useState<{ name: string; url?: string } | null>(null);
  const newFileRef = useRef<HTMLInputElement>(null);
  const replyFileRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !item) return null;

  const remarks = item.unifiedRemarks ?? [];
  const openRemarks = remarks.filter(r => !r.resolved);
  const resolvedRemarks = remarks.filter(r => r.resolved);
  const displayed = activeFilter === "open" ? openRemarks : resolvedRemarks;
  const unreadCount = remarks.filter(r => !r.read && r.role !== currentRole).length;
  const getInitials = (author: string) => author.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  const attachFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setFileUrlMap(prev => ({ ...prev, [file.name]: url }));
    return url;
  };

  const handleAdd = () => {
    if (!newText.trim() && newFiles.length === 0) return;
    const file = newFiles[0];
    const remarkId = `rmk-${Date.now()}`;
    const prefixedName = file ? prefixRemarksFile(file.name, remarkId, item.id) : undefined;
    let fileUrl: string | undefined;
    if (file) {
      fileUrl = URL.createObjectURL(file);
      setFileUrlMap(prev => ({ ...prev, [file.name]: fileUrl!, [prefixedName!]: fileUrl! }));
    }
    const remark: UnifiedRemark = {
      id: remarkId,
      author: currentRole === "admin" ? "Admin" : "Case Handler",
      role: currentRole,
      text: newText.trim(),
      date: new Date().toISOString(),
      read: false, resolved: false, replies: [],
      attachmentName: prefixedName, fileUrl,
    };
    onAddRemark(item.id, remark);
    setNewText(""); setNewFiles([]);
  };

  const handleReply = (remarkId: string) => {
    if (!replyText.trim() && replyFiles.length === 0) return;
    const file = replyFiles[0];
    const prefixedName = file ? prefixRemarksFile(file.name, remarkId, item.id) : undefined;
    let fileUrl: string | undefined;
    if (file) {
      fileUrl = URL.createObjectURL(file);
      setFileUrlMap(prev => ({ ...prev, [file.name]: fileUrl!, [prefixedName!]: fileUrl! }));
    }
    const reply: UnifiedRemarkReply = {
      id: `rpl-${Date.now()}`,
      author: currentRole === "admin" ? "Admin" : "Case Handler",
      role: currentRole,
      text: replyText.trim(),
      date: new Date().toISOString(),
      attachmentName: prefixedName, fileUrl,
    };
    onAddReply?.(item.id, remarkId, reply);
    setReplyText(""); setReplyFiles([]); setReplyingTo(null);
    toast.success("Reply added");
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-end pointer-events-none">
        <div className="absolute inset-0 bg-black/25 pointer-events-auto" onClick={onClose} />
        <div className="relative pointer-events-auto bg-white shadow-2xl border-l border-gray-200 h-full w-full max-w-[400px] flex flex-col">
          <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#8d1436]" />
                <h2 className="text-sm font-bold text-gray-900">Comments</h2>
                {unreadCount > 0 && <span className="bg-[#8d1436] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount} new</span>}
              </div>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-[11px] text-gray-400 truncate max-w-[300px]">{item.title}</p>
          </div>

          <div className="flex-shrink-0 flex border-b border-gray-100">
            <button onClick={() => setActiveFilter("open")} className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 ${activeFilter === "open" ? "border-[#8d1436] text-[#8d1436]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Open ({openRemarks.length})</button>
            <button onClick={() => setActiveFilter("resolved")} className={`flex-1 py-2.5 text-xs font-semibold transition-colors border-b-2 ${activeFilter === "resolved" ? "border-[#8d1436] text-[#8d1436]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Resolved ({resolvedRemarks.length})</button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {displayed.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {activeFilter === "resolved" ? <CheckCircle2 className="w-5 h-5 text-gray-400" /> : <MessageSquare className="w-5 h-5 text-gray-300" />}
                </div>
                <p className="text-sm text-gray-400">{activeFilter === "open" ? "No open comments" : "No resolved comments"}</p>
                {activeFilter === "open" && <p className="text-xs text-gray-300">Add a comment below to start the thread</p>}
              </div>
            )}
            {displayed.map(remark => {
              const isUnread = !remark.read && remark.role !== currentRole;
              const isReplying = replyingTo === remark.id;
              return (
                <div key={remark.id} className={`rounded-xl border overflow-hidden ${remark.resolved ? "opacity-60" : ""} ${isUnread ? "border-[#e99ab2]" : "border-gray-200"}`} onClick={() => { if (isUnread) onMarkRead(item.id, remark.id); }}>
                  <div className={`px-3 py-1.5 flex items-center justify-between border-b border-gray-100 ${isUnread ? "bg-[#fdf8f9]" : "bg-gray-50"}`}>
                    <div className="flex items-center gap-1.5">
                      {remark.resolved && <span className="flex items-center gap-0.5 text-[9px] text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200"><CheckCircle2 className="w-2.5 h-2.5" /> Resolved</span>}
                      {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-[#8d1436]" />}
                    </div>
                    {!remark.resolved && (
                      <button onClick={e => { e.stopPropagation(); onMarkResolved(item.id, remark.id); toast.success("Comment resolved", { duration: 2500 }); }} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-green-600 border border-gray-200 hover:border-green-300 hover:bg-green-50 rounded px-1.5 py-0.5 transition-colors">
                        <Check className="w-3 h-3 stroke-[2.5]" /> Resolve
                      </button>
                    )}
                  </div>
                  <div className="px-3 py-3 space-y-3 bg-white">
                    <ChatBubble
                      isMe={remark.role === currentRole}
                      initials={getInitials(remark.author)}
                      label={remark.author}
                      text={remark.text}
                      date={remark.date}
                      attachmentName={remark.attachmentName}
                      fileUrl={remark.fileUrl ?? fileUrlMap[remark.attachmentName ?? ""]}
                      onAttachmentClick={() => remark.attachmentName && setViewingFile({ name: remark.attachmentName, url: remark.fileUrl ?? fileUrlMap[remark.attachmentName] })}
                      role={remark.role}
                    />
                    {(remark.replies ?? []).map(reply => (
                      <ChatBubble
                        key={reply.id}
                        isMe={reply.role === currentRole}
                        initials={getInitials(reply.author)}
                        label={reply.author}
                        text={reply.text}
                        date={reply.date}
                        attachmentName={reply.attachmentName}
                        fileUrl={reply.fileUrl ?? fileUrlMap[reply.attachmentName ?? ""]}
                        onAttachmentClick={() => reply.attachmentName && setViewingFile({ name: reply.attachmentName, url: reply.fileUrl ?? fileUrlMap[reply.attachmentName] })}
                        role={reply.role}
                      />
                    ))}
                  </div>
                  {!remark.resolved && (
                    <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                      {isReplying ? (
                        <div className="space-y-1.5">
                          <textarea autoFocus value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Reply..." rows={2}
                            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] resize-none bg-white"
                            onKeyDown={e => { if (e.key === "Escape") { setReplyingTo(null); setReplyText(""); setReplyFiles([]); } if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleReply(remark.id); }}
                          />
                          <input ref={replyFileRef} type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) setReplyFiles([e.target.files[0]]); }} />
                          {replyFiles.length > 0 && <div className="flex items-center gap-1.5 text-[10px] text-gray-600 bg-white border border-gray-200 rounded px-2 py-1"><Paperclip className="w-3 h-3 flex-shrink-0 text-gray-400" /><span className="flex-1 truncate">{replyFiles[0].name}</span><button onClick={() => setReplyFiles([])}><X className="w-3 h-3 text-gray-400 hover:text-red-500" /></button></div>}
                          <div className="flex gap-1.5">
                            <button type="button" onClick={() => replyFileRef.current?.click()} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-400"><Paperclip className="w-3 h-3" /></button>
                            <button onClick={() => { setReplyingTo(null); setReplyText(""); setReplyFiles([]); }} className="flex-1 py-1 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100">Cancel</button>
                            <button onClick={() => handleReply(remark.id)} disabled={!replyText.trim() && replyFiles.length === 0} className="flex-1 py-1 text-xs font-semibold bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130] disabled:opacity-40">Reply</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={e => { e.stopPropagation(); setReplyingTo(remark.id); setReplyText(""); setReplyFiles([]); }} className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#8d1436] transition-colors py-0.5">
                          <MessageSquare className="w-3 h-3" /> Reply
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex-shrink-0 px-3 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              {currentRole === "admin" ? <Shield className="w-3 h-3 text-[#8d1436]" /> : <Briefcase className="w-3 h-3 text-blue-500" />}
              <span className="text-[11px] font-semibold text-gray-500">{currentRole === "admin" ? "Admin" : "Case Handler"}</span>
            </div>
            <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Add a comment..." rows={2}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d1436]/30 focus:border-[#8d1436] resize-none bg-white"
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd(); }}
            />
            <input ref={newFileRef} type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) setNewFiles([e.target.files[0]]); }} />
            {newFiles.length > 0 && <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-gray-600 bg-white border border-gray-200 rounded px-2 py-1"><Paperclip className="w-3 h-3 flex-shrink-0 text-gray-400" /><span className="flex-1 truncate">{newFiles[0].name}</span><button onClick={() => setNewFiles([])}><X className="w-3 h-3 text-gray-400 hover:text-red-500" /></button></div>}
            <div className="flex items-center justify-between mt-2">
              <button type="button" onClick={() => newFileRef.current?.click()} className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#8d1436] transition-colors"><Paperclip className="w-3 h-3" /> Attach file</button>
              <button onClick={handleAdd} disabled={!newText.trim() && newFiles.length === 0} className="px-4 py-1.5 text-xs bg-[#8d1436] text-white rounded-lg hover:bg-[#7a1130] font-semibold disabled:opacity-40 transition-colors">Comment</button>
            </div>
          </div>
        </div>
      </div>
      {viewingFile && <FileViewerModal name={viewingFile.name} url={viewingFile.url} onClose={() => setViewingFile(null)} />}
    </>
  );
}
