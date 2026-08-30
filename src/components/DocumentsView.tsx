import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ProjectDocument, DocumentCategory } from '../types';
import {
  FileText,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  History,
  Tag,
  Eye,
  Plus,
  Loader2,
  XCircle,
  FileCheck,
  Smartphone,
  Download,
  ShieldCheck,
  FileSpreadsheet,
  FileCode,
  ExternalLink
} from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const { documents, uploadDocument, updateDocumentStatus, can, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDoc, setSelectedDoc] = useState<ProjectDocument | null>(documents[0] || null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<{
    doc: ProjectDocument;
    version?: any;
    isDownload?: boolean;
  } | null>(null);

  // Upload Form & File State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'IDLE' | 'SELECTED' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Document Metadata State
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newSection, setNewSection] = useState('ОВ');
  const [newCategory, setNewCategory] = useState<DocumentCategory>('WORKING_DOC');
  const [newPagesCount, setNewPagesCount] = useState(1);
  const [newRevision, setNewRevision] = useState('Изм. 0');
  const [newTags, setNewTags] = useState('РД, Вентиляция, ГОСТ');

  const filteredDocs = documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.section.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    setUploadStatus('SELECTED');
    setErrorMessage(null);
    setSuccessMessage(null);

    // Auto-detect & prefill metadata from file name
    const rawName = file.name;
    const nameWithoutExt = rawName.substring(0, rawName.lastIndexOf('.')) || rawName;

    // Detect section
    let detectedSection = 'ОВ';
    const upperName = rawName.toUpperCase();
    if (upperName.includes('АР') || upperName.includes('AR')) detectedSection = 'АР';
    else if (upperName.includes('КР') || upperName.includes('KR') || upperName.includes('КЖ')) detectedSection = 'КР';
    else if (upperName.includes('ВК') || upperName.includes('VK')) detectedSection = 'ВК';
    else if (upperName.includes('ЭОМ') || upperName.includes('EOM')) detectedSection = 'ЭОМ';
    else if (upperName.includes('СС') || upperName.includes('SS')) detectedSection = 'СС';
    setNewSection(detectedSection);

    // Detect category
    let detectedCategory: DocumentCategory = 'WORKING_DOC';
    if (upperName.includes('СПЕЦИФИКАЦИЯ') || upperName.includes('СО') || upperName.includes('SPEC')) {
      detectedCategory = 'SPECIFICATION';
    } else if (upperName.includes('СМЕТА') || upperName.includes('ESTIMATE') || upperName.endsWith('.XLS') || upperName.endsWith('.XLSX')) {
      detectedCategory = 'ESTIMATE';
    } else if (upperName.endsWith('.DWG') || upperName.includes('ПЛАН') || upperName.includes('СХЕМА')) {
      detectedCategory = 'DRAWING';
    }
    setNewCategory(detectedCategory);

    // Suggest clean title
    setNewTitle(nameWithoutExt);

    // Suggest document code
    const randomCodeNum = Math.floor(100 + Math.random() * 900);
    setNewCode(`240/24-${detectedSection}${randomCodeNum}`);
    setNewPagesCount(1);
    setNewRevision('Изм. 0');
    setNewTags(`${detectedSection}, РД, 2025`);

    // Automatically open upload modal if triggered from top level
    setShowUploadModal(true);
  };

  const handleNativeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
    // Reset file input value so selecting the same file again triggers onChange
    e.target.value = '';
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    setUploadStatus('IDLE');
    setErrorMessage(null);
    setSuccessMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (quickFileInputRef.current) quickFileInputRef.current.value = '';
  };

  const handleRealUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) {
      setErrorMessage('Укажите наименование и шифр документа');
      return;
    }

    setUploadStatus('UPLOADING');
    setUploadProgress(15);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Animated progress simulation while real HTTP POST executes
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => (prev < 90 ? prev + 25 : prev));
    }, 150);

    const fileSizeMb = selectedFile
      ? parseFloat((selectedFile.size / (1024 * 1024)).toFixed(2))
      : 2.4;

    const result = await uploadDocument({
      file: selectedFile || undefined,
      fileName: selectedFile?.name || `${newCode}.pdf`,
      fileSizeMb: Math.max(0.1, fileSizeMb),
      title: newTitle.trim(),
      code: newCode.trim(),
      section: newSection,
      category: newCategory,
      pagesCount: Number(newPagesCount) || 1,
      revision: newRevision || 'Изм. 0',
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean)
    });

    clearInterval(progressInterval);
    setUploadProgress(100);

    if (result.success && result.document) {
      setUploadStatus('SUCCESS');
      setSuccessMessage(`✓ Документ успешно загружен и зарегистрирован в электронном архиве`);
      setSelectedDoc(result.document);

      // Auto close modal after successful upload
      setTimeout(() => {
        setShowUploadModal(false);
        handleClearSelectedFile();
      }, 1400);
    } else {
      setUploadStatus('ERROR');
      setErrorMessage(result.error || '✕ Не удалось загрузить документ. Проверьте права доступа и формат файла.');
    }
  };

  const acceptedFormats = '.pdf,.doc,.docx,.xls,.xlsx,.dwg,.zip,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png,application/zip,application/x-zip-compressed';

  return (
    <div className="space-y-6">
      {/* Hidden Native File Inputs for System File Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        className="hidden"
        onChange={handleNativeFileChange}
      />
      <input
        ref={quickFileInputRef}
        type="file"
        accept={acceptedFormats}
        className="hidden"
        onChange={handleNativeFileChange}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <span>ЭЛЕКТРОННЫЙ АРХИВ ДОКУМЕНТАЦИИ (ПД / РД / СПЕЦИФИКАЦИИ)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Управление ревизиями, штампами «В производство работ», коллизиями и статусами утверждения.
          </p>
        </div>

        {/* Primary Upload CTA Button */}
        {can('CREATE', 'documents') ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-upload-document-main"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                } else {
                  setShowUploadModal(true);
                }
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-neutral-900 text-white px-5 py-2.5 text-xs font-bold hover:bg-neutral-800 active:scale-[0.98] transition-all min-h-[44px] sm:min-h-[40px] shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4 text-cyan-400" />
              <span>＋ Загрузить документ</span>
            </button>
          </div>
        ) : (
          <div className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">
            Режим чтения (Роль: {currentUser.role})
          </div>
        )}
      </div>

      {/* Mobile Quick Upload Touch Bar (visible on mobile / tablet screens) */}
      {can('CREATE', 'documents') && (
        <div className="block sm:hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-neutral-600" />
              Мобильная загрузка документов
            </span>
            <span className="text-[10px] font-mono text-neutral-500 uppercase">PDF, DWG, DOCX</span>
          </div>

          <button
            type="button"
            id="btn-mobile-touch-upload"
            onClick={() => quickFileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-neutral-900 text-white px-4 py-3.5 text-sm font-bold hover:bg-neutral-800 active:scale-[0.98] transition-all min-h-[48px] shadow-sm cursor-pointer"
          >
            <Plus className="h-5 w-5 text-cyan-400" />
            <span>＋ Загрузить документ</span>
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Поиск по названию, шифру (напр. 240/24-ОВ1), марке (АР, КР, ОВ)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          {['ALL', 'WORKING_DOC', 'SPECIFICATION', 'ESTIMATE', 'DRAWING'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {cat === 'ALL'
                ? 'Все разделы'
                : cat === 'WORKING_DOC'
                ? 'РД'
                : cat === 'SPECIFICATION'
                ? 'Спецификации'
                : cat === 'ESTIMATE'
                ? 'Сметы'
                : 'Чертежи'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Documents List & Active Document Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredDocs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-xs text-neutral-500 bg-white">
              <FileText className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
              Документы не найдены
            </div>
          ) : (
            filteredDocs.map(doc => {
              const isSelected = selectedDoc?.id === doc.id;

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900/5 shadow-xs'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                        {doc.code}
                      </span>
                      <h4 className="text-xs font-bold text-neutral-900 mt-1.5 leading-snug">
                        {doc.title}
                      </h4>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                        doc.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'UNDER_REVIEW' || doc.status === 'IN_REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-500">
                    <span>
                      Раздел: <strong className="text-neutral-700">{doc.section}</strong>
                    </span>
                    <span className="font-semibold text-neutral-800">
                      {doc.currentRevision} (v{doc.currentVersion})
                    </span>
                  </div>

                  {doc.hasConflicts && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-amber-800 bg-amber-50 p-1.5 rounded">
                      <AlertTriangle className="h-3 w-3 shrink-0 text-amber-600" />
                      <span>Обнаружена коллизия со сметой</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail Card (7 cols) */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-neutral-900 text-white px-2.5 py-0.5 rounded">
                      {selectedDoc.code}
                    </span>
                    <span className="text-xs font-semibold text-neutral-500">
                      Ревизия: {selectedDoc.currentRevision}
                    </span>
                    {selectedDoc.sha256 && (
                      <span className="flex items-center gap-1 text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        SHA-256: {selectedDoc.sha256.substring(0, 10)}…
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 mt-2">
                    {selectedDoc.title}
                  </h3>
                  <div className="mt-1 text-xs text-neutral-500">
                    Автор: {selectedDoc.authorOrg} • Загрузил: {selectedDoc.uploadedBy}
                  </div>
                </div>

                {/* Primary Actions (View & Download) + Approval Controls */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <a
                    href={`/api/documents/${selectedDoc.id}/download`}
                    download
                    className="flex items-center gap-1.5 rounded-lg bg-neutral-900 text-white px-3 py-1.5 text-xs font-bold hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Скачать файл</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setViewingDoc({ doc: selectedDoc, version: selectedDoc.versions[0] })}
                    className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white text-neutral-800 px-3 py-1.5 text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-neutral-600" />
                    <span>Просмотр</span>
                  </button>

                  {/* Approve/Reject Buttons for Chief Engineer / Construction Control */}
                  {can('APPROVE', 'documents') && selectedDoc.status !== 'APPROVED' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateDocumentStatus(selectedDoc.id, 'APPROVED')}
                        className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                      >
                        В производство
                      </button>
                      <button
                        onClick={() => updateDocumentStatus(selectedDoc.id, 'REJECTED')}
                        className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-1.5 text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Отклонить
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Conflict Callout */}
              {selectedDoc.hasConflicts && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-amber-950">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Зафиксированная коллизия документа
                  </div>
                  <p className="mt-1 text-xs text-amber-900 leading-relaxed">
                    {selectedDoc.conflictNotes}
                  </p>
                  <div className="mt-2 text-[11px] font-semibold text-amber-950">
                    Статус: <span className="underline">CONFLICT (Требуется сверка авторским надзором)</span>
                  </div>
                </div>
              )}

              {/* Document Meta Table */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Марка / Раздел</span>
                  <div className="font-semibold text-neutral-800 mt-0.5">{selectedDoc.section}</div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Категория</span>
                  <div className="font-semibold text-neutral-800 mt-0.5">{selectedDoc.category}</div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Листов / Страниц</span>
                  <div className="font-semibold text-neutral-800 mt-0.5">{selectedDoc.pagesCount} листов</div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Статус согласования</span>
                  <div className="font-semibold text-emerald-700 mt-0.5">{selectedDoc.status}</div>
                </div>
              </div>

              {/* Version History (Tamper evident list) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-neutral-600" />
                  История версий и ревизий
                </h4>

                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
                  {selectedDoc.versions.map((ver, idx) => (
                    <div key={idx} className="p-3 bg-white hover:bg-neutral-50 flex items-center justify-between text-xs gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-neutral-900">{ver.revision}</span>
                          <span className="text-[11px] text-neutral-500 font-mono">({ver.fileName})</span>
                          <span className="text-[10px] bg-neutral-100 text-neutral-700 px-1.5 py-0.2 rounded font-semibold">
                            {ver.status}
                          </span>
                          {ver.sha256 && (
                            <span className="text-[9px] font-mono text-neutral-500 bg-neutral-50 border border-neutral-200 px-1.5 py-0.2 rounded">
                              SHA-256: {ver.sha256.substring(0, 8)}…
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-neutral-600">{ver.changeDescription}</p>
                        <div className="mt-1 text-[10px] text-neutral-400">
                          Загружено: {ver.uploadedBy} • {ver.uploadedAt} • {ver.fileSizeMb} МБ
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setViewingDoc({ doc: selectedDoc, version: ver })}
                          className="flex items-center gap-1 text-xs font-semibold text-neutral-800 border border-neutral-200 px-2.5 py-1 rounded hover:bg-neutral-100 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" /> Открыть
                        </button>
                        <a
                          href={`/api/documents/${selectedDoc.id}/versions/${ver.versionNumber}/download`}
                          download={ver.fileName}
                          className="flex items-center gap-1 text-xs font-semibold text-neutral-800 border border-neutral-200 px-2.5 py-1 rounded hover:bg-neutral-100 cursor-pointer"
                          title="Скачать исходный файл версии"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="h-3.5 w-3.5 text-neutral-400" />
                {selectedDoc.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center text-xs text-neutral-400">
              Выберите документ из списка для просмотра ревизий и спецификаций
            </div>
          )}
        </div>
      </div>

      {/* In-App Document Viewer & Verification Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden my-4 flex flex-col max-h-[90vh] animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-neutral-900 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-800 text-neutral-200">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-neutral-700 px-2 py-0.5 rounded">
                      {viewingDoc.doc.code}
                    </span>
                    <span className="text-xs text-neutral-300">
                      {viewingDoc.version?.revision || viewingDoc.doc.currentRevision}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    {viewingDoc.doc.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/api/documents/${viewingDoc.doc.id}/download`}
                  download={viewingDoc.version?.fileName || viewingDoc.doc.fileName}
                  className="flex items-center gap-1.5 rounded-lg bg-white text-neutral-900 px-3 py-1.5 text-xs font-bold hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Скачать файл</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="text-neutral-400 hover:text-white p-1 text-lg leading-none cursor-pointer rounded-lg hover:bg-neutral-800"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Inline Viewer or Format Handler */}
            <div className="p-6 overflow-y-auto flex-1 bg-neutral-50">
              {/* Technical Metadata & Integrity Bar */}
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 bg-white border border-neutral-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Имя файла</span>
                  <span className="font-mono text-neutral-800 break-all font-semibold">
                    {viewingDoc.version?.fileName || viewingDoc.doc.fileName || `${viewingDoc.doc.code}.pdf`}
                  </span>
                </div>
                <div className="p-3 bg-white border border-neutral-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Размер / Страниц</span>
                  <span className="font-medium text-neutral-800">
                    {viewingDoc.version?.fileSizeMb || viewingDoc.doc.fileSizeMb || 1.0} МБ • {viewingDoc.doc.pagesCount || 1} стр.
                  </span>
                </div>
                <div className="p-3 bg-white border border-neutral-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Контрольная сумма SHA-256</span>
                  <span className="font-mono text-[11px] text-emerald-700 font-semibold break-all">
                    {viewingDoc.doc.sha256 || viewingDoc.version?.sha256 || 'Вычислена при физическом сохранении'}
                  </span>
                </div>
              </div>

              {/* Viewer Preview Area */}
              {(() => {
                const fileName = (viewingDoc.version?.fileName || viewingDoc.doc.fileName || '').toLowerCase();
                const isPdf = fileName.endsWith('.pdf');
                const isImg = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.webp');
                const isDwg = fileName.endsWith('.dwg') || fileName.endsWith('.dxf');
                const isExcel = fileName.endsWith('.xls') || fileName.endsWith('.xlsx') || fileName.endsWith('.csv');

                if (isPdf) {
                  return (
                    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-xs h-[500px] flex flex-col">
                      <div className="p-2 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs text-neutral-600 px-4">
                        <span className="font-medium">Встроенный просмотр PDF-документа</span>
                        <a
                          href={`/api/documents/${viewingDoc.doc.id}/view`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-neutral-900 font-semibold hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> Во весь экран
                        </a>
                      </div>
                      <iframe
                        src={`/api/documents/${viewingDoc.doc.id}/view`}
                        title={viewingDoc.doc.title}
                        className="w-full flex-1 border-0"
                      />
                    </div>
                  );
                }

                if (isImg) {
                  return (
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-xs">
                      <img
                        src={`/api/documents/${viewingDoc.doc.id}/view`}
                        alt={viewingDoc.doc.title}
                        className="max-h-[500px] mx-auto rounded-lg object-contain shadow-xs"
                      />
                    </div>
                  );
                }

                if (isDwg) {
                  return (
                    <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center space-y-4 shadow-xs">
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <FileCode className="h-8 w-8" />
                      </div>
                      <div className="max-w-md mx-auto">
                        <h4 className="font-bold text-neutral-900 text-sm">Чертеж САПР / CAD (.DWG / .DXF)</h4>
                        <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                          Бинарный файл чертежа сохранен в защищенном архиве. Для редактирования и полноценного просмотра слоев откройте файл в специализированном ПО (AutoCAD, nanoCAD, Autodesk Viewer).
                        </p>
                      </div>
                      <div className="pt-2">
                        <a
                          href={`/api/documents/${viewingDoc.doc.id}/download`}
                          download={viewingDoc.version?.fileName || viewingDoc.doc.fileName}
                          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 text-white px-5 py-2.5 text-xs font-bold hover:bg-neutral-800 shadow-xs cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          <span>Скачать исходный DWG</span>
                        </a>
                      </div>
                    </div>
                  );
                }

                if (isExcel) {
                  return (
                    <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center space-y-4 shadow-xs">
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <FileSpreadsheet className="h-8 w-8" />
                      </div>
                      <div className="max-w-md mx-auto">
                        <h4 className="font-bold text-neutral-900 text-sm">Таблица спецификаций / Смета (.XLSX)</h4>
                        <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                          Файл ведомости объемов и сметных расчетов сохранен. Скачайте исходную таблицу для детальной обработки в MS Excel или МойОфис.
                        </p>
                      </div>
                      <div className="pt-2">
                        <a
                          href={`/api/documents/${viewingDoc.doc.id}/download`}
                          download={viewingDoc.version?.fileName || viewingDoc.doc.fileName}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold hover:bg-emerald-800 shadow-xs cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          <span>Скачать таблицу Excel</span>
                        </a>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center space-y-4 shadow-xs">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div className="max-w-md mx-auto">
                      <h4 className="font-bold text-neutral-900 text-sm">Документ зарегистрирован в электронном архиве</h4>
                      <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                        Исходный бинарный файл сохранен с контрольной суммой и доступен для загрузки.
                      </p>
                    </div>
                    <div className="pt-2">
                      <a
                        href={`/api/documents/${viewingDoc.doc.id}/download`}
                        download={viewingDoc.version?.fileName || viewingDoc.doc.fileName}
                        className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 text-white px-5 py-2.5 text-xs font-bold hover:bg-neutral-800 shadow-xs cursor-pointer"
                      >
                        <Download className="h-4 w-4" />
                        <span>Скачать исходный файл</span>
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal (Supports Native File Picker, Touch Button & Desktop Drag-and-Drop) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8 animate-in fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Загрузка документа в архив (4D Archive)</h3>
                <p className="text-[11px] text-neutral-500">Системный выбор файла с мобильного устройства и десктопа</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  handleClearSelectedFile();
                }}
                className="text-neutral-400 hover:text-neutral-700 p-1 text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800 text-xs flex items-start gap-2">
                <XCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <div className="font-bold">Ошибка загрузки</div>
                  <div className="text-[11px] mt-0.5">{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Success Notification */}
            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <div className="font-bold">Успешно</div>
                  <div className="text-[11px] mt-0.5">{successMessage}</div>
                </div>
              </div>
            )}

            {/* File Selection Zone: Native Picker Button + Drag and Drop */}
            <div className="space-y-2">
              {selectedFile ? (
                /* Selected File Summary Block */
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                      <FileCheck className="h-4 w-4 text-blue-600" />
                      [Выбран файл]
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-700 hover:text-blue-900 text-xs font-bold underline cursor-pointer"
                    >
                      Сменить файл
                    </button>
                  </div>

                  <div className="bg-white rounded-lg p-2.5 border border-blue-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 block uppercase">Имя</span>
                      <span className="font-bold text-neutral-900 truncate block">{selectedFile.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block uppercase">Размер</span>
                      <span className="font-bold text-neutral-900">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* File Picker Trigger & Drop Zone */
                <div className="space-y-2.5">
                  {/* Primary Touch / Click Button */}
                  <button
                    type="button"
                    id="btn-modal-choose-file"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 text-white px-4 py-3.5 text-xs sm:text-sm font-bold hover:bg-neutral-800 active:scale-[0.99] transition-all min-h-[48px] shadow-sm cursor-pointer"
                  >
                    <Upload className="h-4 w-4 text-cyan-400" />
                    <span>＋ Выбрать файл на устройстве</span>
                  </button>

                  {/* Drag-and-Drop Area (Desktop / Fallback) */}
                  <div
                    onDragOver={e => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        processSelectedFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-neutral-900 bg-neutral-100'
                        : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100/70'
                    }`}
                  >
                    <p className="text-xs font-semibold text-neutral-700">
                      Или перетащите файл сюда
                    </p>
                    <p className="mt-0.5 text-[10px] text-neutral-400">
                      Поддерживаются PDF, DOCX, XLSX, DWG, ZIP, JPG, PNG (до 100 МБ)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Document Metadata Form */}
            <form onSubmit={handleRealUpload} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-neutral-700">Наименование документа / комплекта</label>
                <input
                  type="text"
                  required
                  placeholder="РД ОВиК: Спецификация системы VRF"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">Шифр документа</label>
                  <input
                    type="text"
                    required
                    placeholder="240/24-ОВ1.СО"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">Раздел / Марка</label>
                  <select
                    value={newSection}
                    onChange={e => setNewSection(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                  >
                    <option value="АР">АР (Архитектура)</option>
                    <option value="КР">КР (Конструкции)</option>
                    <option value="ОВ">ОВ (ОВиК)</option>
                    <option value="ВК">ВК (Водоснабжение)</option>
                    <option value="ЭОМ">ЭОМ (Электрика)</option>
                    <option value="СС">СС (Слаботочка)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">Категория</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                  >
                    <option value="WORKING_DOC">Рабочая документация (РД)</option>
                    <option value="SPECIFICATION">Спецификация</option>
                    <option value="ESTIMATE">Смета (Excel/ГРАНД)</option>
                    <option value="DRAWING">Чертеж</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-neutral-700">Листов</label>
                  <input
                    type="number"
                    min={1}
                    value={newPagesCount}
                    onChange={e => setNewPagesCount(Math.max(1, Number(e.target.value)))}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">Ревизия</label>
                  <input
                    type="text"
                    value={newRevision}
                    onChange={e => setNewRevision(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700">Теги (через запятую)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 text-xs"
                />
              </div>

              {/* Upload Progress Bar (during upload state) */}
              {uploadStatus === 'UPLOADING' && (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin text-neutral-900" />
                      Загрузка документа на сервер...
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                    <div
                      className="h-full bg-neutral-900 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    handleClearSelectedFile();
                  }}
                  disabled={uploadStatus === 'UPLOADING'}
                  className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  id="btn-submit-document-upload"
                  disabled={uploadStatus === 'UPLOADING'}
                  className="rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs min-h-[40px]"
                >
                  {uploadStatus === 'UPLOADING' ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Загрузка...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      <span>Зарегистрировать в архиве</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
