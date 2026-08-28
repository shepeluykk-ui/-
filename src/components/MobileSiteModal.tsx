import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../brand/BrandLogo';
import { BRAND_CONFIG } from '../brand/brandConfig';
import {
  Smartphone,
  Camera,
  AlertTriangle,
  ClipboardCheck,
  CheckCircle2,
  X,
  MapPin,
  Flame,
  Layers,
  ArrowRight,
  Wifi,
  WifiOff,
  UploadCloud,
  HardHat,
  Calendar,
  Sparkles
} from 'lucide-react';

interface MobileSiteModalProps {
  onClose: () => void;
}

export const MobileSiteModal: React.FC<MobileSiteModalProps> = ({ onClose }) => {
  const { activeProject, addDefect, addInspection, currentUser, organizations } = useApp();
  const [activeTab, setActiveTab] = useState<'PHOTO' | 'DEFECT' | 'INSPECTION' | 'CUSTOM_WORK'>('DEFECT');
  
  // Mobile form fields
  const [selectedWorkCategory, setSelectedWorkCategory] = useState('OVIK');
  const [customWorkName, setCustomWorkName] = useState('');
  const [defectTitle, setDefectTitle] = useState('');
  const [defectDescription, setDefectDescription] = useState('');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [contractorId, setContractorId] = useState('');
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  
  // Location
  const [floor, setFloor] = useState('3 этаж');
  const [room, setRoom] = useState('Помещение 304');
  const [axes, setAxes] = useState('Оси 4-6 / Б-В');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>('');

  // Media
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>('');
  
  // State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineDraftsCount, setOfflineDraftsCount] = useState<number>(0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Network listener & drafts check
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const drafts = JSON.parse(localStorage.getItem('kit_mobile_drafts') || '[]');
    setOfflineDraftsCount(drafts.length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Set default contractor
  useEffect(() => {
    if (organizations.length > 0 && !contractorId) {
      const sub = organizations.find(o => o.type === 'SUBCONTRACTOR') || organizations[0];
      setContractorId(sub.id);
    }
  }, [organizations, contractorId]);

  // Capture GPS
  const handleGetLocation = () => {
    setGpsStatus('Определение координат GPS...');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsStatus(`GPS: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        },
        err => {
          setGpsStatus('GPS: 55.7539° N, 37.6208° E (по умолчанию)');
          setGpsCoords({ lat: 55.7539, lng: 37.6208 });
        },
        { timeout: 5000 }
      );
    } else {
      setGpsStatus('GPS недоступен');
    }
  };

  // Handle Photo Capture/File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectTitle) return;

    const assignedOrg = organizations.find(o => o.id === contractorId) || organizations[0];
    const categoryName = selectedWorkCategory === 'CUSTOM'
      ? customWorkName || 'Специальные работы'
      : BRAND_CONFIG.workCategories.find(c => c.id === selectedWorkCategory)?.name || 'Общестроительные работы';

    const newDefectPayload = {
      projectId: activeProject.id,
      title: defectTitle,
      description: `${defectDescription || 'Зафиксировано инспектором на объекте.'} [Раздел: ${categoryName}]`,
      severity,
      status: 'OPEN' as const,
      location: { building: 'Корпус 1', floor, room, axes },
      responsibleContractorOrgId: assignedOrg.id,
      responsibleContractorName: assignedOrg.name,
      authorUserId: currentUser.id,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      deadlineDate,
      regulatoryBasis: selectedWorkCategory === 'OVIK' ? 'СП 73.13330.2016' : 'СП 48.13330.2019',
      designDocReference: `РД-${activeProject.code}`,
      isHoldPointBlocked: severity === 'CRITICAL',
      photoUrls: photoPreview ? [photoPreview] : ['/photos/mobile_snap.jpg'],
      afterPhotoUrls: []
    };

    if (!isOnline) {
      // Store in offline queue
      const existing = JSON.parse(localStorage.getItem('kit_mobile_drafts') || '[]');
      existing.push({ ...newDefectPayload, savedAt: new Date().toISOString() });
      localStorage.setItem('kit_mobile_drafts', JSON.stringify(existing));
      setOfflineDraftsCount(existing.length);
    } else {
      addDefect(newDefectPayload);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Mobile Device Container Frame */}
      <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-neutral-900 text-white p-3.5 sm:p-5 shadow-2xl border-2 sm:border-4 border-neutral-700 flex flex-col max-h-[92vh] h-[680px] justify-between animate-in zoom-in-95">
        {/* Top Status Bar */}
        <div>
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <BrandLogo variant="compact" size="xs" theme="white" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  ТЕРМИНАЛ ПРОРАБА
                  {isOnline ? (
                    <span className="flex items-center gap-1 text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-700 shrink-0">
                      <Wifi className="h-2.5 w-2.5" /> 5G
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.2 rounded border border-amber-700 shrink-0">
                      <WifiOff className="h-2.5 w-2.5" /> OFFLINE
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-400 truncate max-w-[170px] sm:max-w-[190px]">{activeProject.name}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-white min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Tabs */}
          <div className="grid grid-cols-3 gap-1.5 mt-3 text-center text-xs">
            <button
              onClick={() => setActiveTab('DEFECT')}
              className={`p-2 rounded-xl font-bold transition-colors ${
                activeTab === 'DEFECT' ? 'bg-red-600 text-white shadow-md' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              Замечание
            </button>
            <button
              onClick={() => setActiveTab('PHOTO')}
              className={`p-2 rounded-xl font-bold transition-colors ${
                activeTab === 'PHOTO' ? 'bg-cyan-600 text-white shadow-md' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              Фото & GPS
            </button>
            <button
              onClick={() => setActiveTab('INSPECTION')}
              className={`p-2 rounded-xl font-bold transition-colors ${
                activeTab === 'INSPECTION' ? 'bg-white text-neutral-900 shadow-md' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              Hold Points
            </button>
          </div>
        </div>

        {/* Dynamic Center Area */}
        <div className="my-auto space-y-3 overflow-y-auto max-h-[460px] pr-1">
          {savedSuccess ? (
            <div className="p-6 text-center space-y-2 bg-emerald-950/70 rounded-2xl border border-emerald-500/40 animate-in zoom-in-95">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
              <div className="text-sm font-bold text-emerald-300">ПРЕДПИСАНИЕ СФОРМИРОВАНО</div>
              <div className="text-xs text-neutral-300">
                {isOnline
                  ? 'Запись отправлена в центральную ЕИС «КИТ». Ответственный уведомлен.'
                  : 'Сохранено в локальный черновик (Offline Queue). Будет синхронизировано при появлении сети.'}
              </div>
            </div>
          ) : activeTab === 'DEFECT' ? (
            <form onSubmit={handleQuickSubmit} className="space-y-2.5 text-xs text-left">
              {/* Universal Work Category Selector */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Вид строительно-монтажных работ
                </label>
                <select
                  value={selectedWorkCategory}
                  onChange={e => setSelectedWorkCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-neutral-800 border border-neutral-700 p-2 text-white text-xs"
                >
                  {BRAND_CONFIG.workCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      [{cat.code}] {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedWorkCategory === 'CUSTOM' && (
                <div>
                  <label className="text-[10px] font-bold text-cyan-400">
                    Укажите пользовательский вид работ
                  </label>
                  <input
                    required
                    placeholder="Например: Монтаж технологического оборудования"
                    value={customWorkName}
                    onChange={e => setCustomWorkName(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-neutral-800 border border-cyan-500 p-2 text-white text-xs"
                  />
                </div>
              )}

              {/* Defect Title */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Наименование дефекта / замечания
                </label>
                <input
                  required
                  placeholder="Отклонение от РД / Негерметичность / Брак"
                  value={defectTitle}
                  onChange={e => setDefectTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-neutral-800 border border-neutral-700 p-2 text-white text-xs"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Описание нарушения
                </label>
                <textarea
                  rows={2}
                  placeholder="Точные координаты дефекта и требование..."
                  value={defectDescription}
                  onChange={e => setDefectDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-neutral-800 border border-neutral-700 p-2 text-white text-xs"
                />
              </div>

              {/* Location Matrix */}
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <div>
                  <label className="text-[9px] text-neutral-400">Этаж</label>
                  <input
                    value={floor}
                    onChange={e => setFloor(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-neutral-400">Помещение</label>
                  <input
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-neutral-400">Оси</label>
                  <input
                    value={axes}
                    onChange={e => setAxes(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-1.5 text-white"
                  />
                </div>
              </div>

              {/* Severity & Contractor */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">Критичность</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="mt-1 w-full rounded bg-neutral-800 border border-neutral-700 p-1.5 text-white text-xs"
                  >
                    <option value="CRITICAL">КРИТИЧЕСКИЙ (БЛОКЕР)</option>
                    <option value="HIGH">ВЫСОКИЙ</option>
                    <option value="MEDIUM">СРЕДНИЙ</option>
                    <option value="LOW">НИЗКИЙ</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-neutral-400 uppercase">Срок устранения</label>
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={e => setDeadlineDate(e.target.value)}
                    className="mt-1 w-full rounded bg-neutral-800 border border-neutral-700 p-1.5 text-white text-xs"
                  />
                </div>
              </div>

              {/* Photo attachment preview if captured */}
              {photoPreview && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-800 border border-neutral-700">
                  <img src={photoPreview} alt="Snap" className="h-10 w-10 object-cover rounded" />
                  <div className="text-[10px] text-neutral-300 truncate flex-1">{photoFileName || 'Фото прикреплено'}</div>
                  <button type="button" onClick={() => setPhotoPreview(null)} className="text-red-400 text-xs">Удалить</button>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-red-600 p-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-md transition-all flex items-center justify-center gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Отправить предписание в ЕИС</span>
              </button>
            </form>
          ) : activeTab === 'PHOTO' ? (
            <div className="space-y-3 text-center">
              <div className="h-48 rounded-2xl bg-neutral-800 border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {photoPreview ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <img src={photoPreview} alt="Preview" className="max-h-32 rounded-lg object-contain shadow-md" />
                    <div className="text-emerald-400 text-[11px] font-bold mt-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Снимок зафиксирован
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer text-neutral-400 hover:text-white">
                    <Camera className="h-10 w-10 text-cyan-400 animate-pulse" />
                    <span className="text-xs font-semibold">Сделать снимок / Загрузить фото</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Geolocation Tagging */}
              <div className="text-left text-xs space-y-2 bg-neutral-800/80 p-3 rounded-xl border border-neutral-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-neutral-300 font-bold">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" />
                    GPS Геопривязка & Оси
                  </div>
                  <button
                    onClick={handleGetLocation}
                    className="text-[10px] bg-neutral-700 hover:bg-neutral-600 px-2 py-0.5 rounded text-neutral-200"
                  >
                    Обновить GPS
                  </button>
                </div>
                {gpsStatus && <div className="text-[10px] font-mono text-cyan-400">{gpsStatus}</div>}
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs text-left">
              <div className="p-3 rounded-xl bg-neutral-800 border border-red-500/50">
                <div className="font-bold text-red-400 flex items-center justify-between">
                  <span>Опрессовка контура VRF-1</span>
                  <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                    HOLD POINT
                  </span>
                </div>
                <div className="text-[11px] text-neutral-300 mt-1">
                  Требуется освидетельствование инженера технадзора. 4.15 МПа / 24 часа.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-800 border border-neutral-700">
                <div className="font-bold text-emerald-400 flex items-center justify-between">
                  <span>Входной контроль кабелей ВВГнг-FRLS</span>
                  <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                    PASSED
                  </span>
                </div>
                <div className="text-[11px] text-neutral-300 mt-1">
                  Лабораторный замер сопротивления изоляции (СП 256.1325800).
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Inspector Badge & Offline Queue Status */}
        <div className="pt-3 border-t border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <HardHat className="h-3.5 w-3.5 text-amber-400" />
            <span className="truncate max-w-[160px]">{currentUser.fullName}</span>
          </div>
          {offlineDraftsCount > 0 && (
            <span className="text-amber-400 font-mono font-bold">
              Черновиков: {offlineDraftsCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
