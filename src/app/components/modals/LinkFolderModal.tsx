import { useState, useRef, useEffect } from "react";
import { X, FolderOpen, Upload, File, FileText, Image, Trash2, ChevronRight, ExternalLink, Grid3x3, List } from "lucide-react";
import { toast } from "sonner";

interface AttachedFile {
  name: string;
  size: number;
  uploadedAt: string;
  folder: "attached files";
}

interface LinkFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: { id: string; title: string; folderLink?: string; attachedFiles?: AttachedFile[] } | null;
  onSave: (id: string, link: string) => void;
  onAttachFiles?: (id: string, files: AttachedFile[]) => void;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return <Image className="w-8 h-8 text-blue-400" />;
  if (['pdf'].includes(ext)) return <FileText className="w-8 h-8 text-red-400" />;
  if (['doc','docx'].includes(ext)) return <FileText className="w-8 h-8 text-blue-600" />;
  if (['xls','xlsx'].includes(ext)) return <FileText className="w-8 h-8 text-green-600" />;
  return <File className="w-8 h-8 text-gray-400" />;
}

function getFileIconSmall(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return <Image className="w-4 h-4 text-blue-400" />;
  if (['pdf'].includes(ext)) return <FileText className="w-4 h-4 text-red-400" />;
  if (['doc','docx'].includes(ext)) return <FileText className="w-4 h-4 text-blue-600" />;
  return <File className="w-4 h-4 text-gray-400" />;
}

// Mock pre-existing files that simulate an auto-linked Drive folder
const MOCK_DRIVE_FILES: AttachedFile[] = [
  { name: 'Invention_Disclosure_Form.pdf', size: 245000, uploadedAt: '2026-06-10T09:00:00', folder: 'attached files' },
  { name: 'Prior_Art_Search_Report.pdf', size: 1820000, uploadedAt: '2026-06-15T14:30:00', folder: 'attached files' },
  { name: 'Inventors_Declaration.docx', size: 89000, uploadedAt: '2026-06-18T11:20:00', folder: 'attached files' },
];

export function LinkFolderModal({ isOpen, onClose, item, onSave, onAttachFiles }: LinkFolderModalProps) {
  const [files, setFiles] = useState<AttachedFile[]>(() => {
    const attached = item?.attachedFiles ?? [];
    // Merge mock files with any user-attached files (avoid duplicates)
    const mockFiltered = MOCK_DRIVE_FILES.filter(m => !attached.find(a => a.name === m.name));
    return [...mockFiltered, ...attached];
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [deleteConfirmFile, setDeleteConfirmFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && item && !item.folderLink) {
      onSave(item.id, `https://drive.google.com/drive/folders/auto-${item.id}`);
    }
  }, [isOpen, item?.id]);

  if (!isOpen || !item) return null;

  const caseShortId = item.id;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    if (!newFiles.length) return;
    const added: AttachedFile[] = newFiles.map(f => ({
      name: f.name,
      size: f.size,
      uploadedAt: new Date().toISOString(),
      folder: 'attached files',
    }));
    const updated = [...files, ...added];
    setFiles(updated);
    // Only pass non-mock files to parent
    const userFiles = updated.filter(f => !MOCK_DRIVE_FILES.find(m => m.name === f.name));
    onAttachFiles?.(item.id, userFiles);
    toast.success(`${newFiles.length} file${newFiles.length > 1 ? 's' : ''} uploaded`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (name: string) => {
    const updated = files.filter(f => f.name !== name);
    setFiles(updated);
    const userFiles = updated.filter(f => !MOCK_DRIVE_FILES.find(m => m.name === f.name));
    onAttachFiles?.(item.id, userFiles);
    if (selectedFile === name) setSelectedFile(null);
    setDeleteConfirmFile(null);
    toast.success(`"${name}" removed from folder`);
  };

  const confirmDelete = (name: string) => setDeleteConfirmFile(name);

  const handleOpen = (f: AttachedFile) => {
    toast.info(`Opening "${f.name}"…`, { description: 'Demo — file preview not available in this environment.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden flex flex-col" style={{ maxHeight: '85vh' }}>
        {/* Header — Google Drive style */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <FolderOpen className="w-4 h-4 text-[#8d1436] flex-shrink-0" />
            <span className="text-xs text-gray-500">My Drive</span>
            <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500">TTBDO Cases</span>
            <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-800 truncate">{caseShortId}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500">
              {viewMode === 'grid' ? <List className="w-3.5 h-3.5" /> : <Grid3x3 className="w-3.5 h-3.5" />}
            </button>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex-shrink-0 px-4 py-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
          <p className="text-xs text-gray-600 font-medium truncate flex-1">{item.title}</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8d1436] text-white rounded-lg text-xs font-semibold hover:bg-[#7a1130] transition-colors flex-shrink-0"
          >
            <Upload className="w-3 h-3" /> Upload
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
        </div>

        {/* File area */}
        <div className="flex-1 overflow-y-auto p-4">
          {files.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#8d1436] hover:bg-[#fdf0f3] transition-all group"
            >
              <Upload className="w-8 h-8 text-gray-300 group-hover:text-[#8d1436]" />
              <p className="text-sm text-gray-400 group-hover:text-[#8d1436]">Drop files or click to upload</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-1">
              {files.map((f, i) => {
                const isSelected = selectedFile === f.name;
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedFile(isSelected ? null : f.name)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                  >
                    {getFileIconSmall(f.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{f.name}</p>
                      <p className="text-[10px] text-gray-400">{formatBytes(f.size)} · {new Date(f.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); handleOpen(f); }} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700">
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); confirmDelete(f.name); }} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-gray-300 hover:text-red-500">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {files.map((f, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedFile(selectedFile === f.name ? null : f.name)}
                  className={`relative rounded-xl border-2 p-3 flex flex-col items-center gap-2 cursor-pointer transition-all ${selectedFile === f.name ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  {getFileIcon(f.name)}
                  <p className="text-[10px] text-gray-700 text-center leading-tight w-full truncate">{f.name}</p>
                  <p className="text-[9px] text-gray-400">{formatBytes(f.size)}</p>
                  <button
                    onClick={e => { e.stopPropagation(); confirmDelete(f.name); }}
                    className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <p className="text-xs text-gray-400">{files.length} item{files.length !== 1 ? 's' : ''} · Auto-linked to case folder</p>
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            Done
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteConfirmFile && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 rounded-2xl">
          <div className="bg-white rounded-xl shadow-2xl max-w-xs w-full mx-4 p-5">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 text-center mb-1">Delete File?</h3>
            <p className="text-xs text-gray-500 text-center mb-4 break-all">"{deleteConfirmFile}" will be permanently removed from this case folder.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirmFile(null)} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => handleRemove(deleteConfirmFile)} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
