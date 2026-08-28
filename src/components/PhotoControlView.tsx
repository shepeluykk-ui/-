import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, MapPin, Calendar, CheckCircle2, AlertTriangle, Layers, Filter } from 'lucide-react';

export const PhotoControlView: React.FC = () => {
  const { can } = useApp();
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');

  const photos = [
    {
      id: 'photo-1',
      title: 'Узел крепления наружных блоков VRF-1 на кровле',
      building: 'Корпус 1',
      floor: 'Кровля',
      axes: 'Оси 3-5 / А-Б',
      date: '2024-08-20',
      author: 'Воронов А. М. (Технадзор)',
      type: 'BEFORE',
      status: 'APPROVED',
      observation: 'Виброопоры установлены согласно РД 240/24-ОВ1. Отклонений нет.',
      imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'photo-2',
      title: 'Утечка при опрессовке фреонопровода 41.5 бар',
      building: 'Корпус 1',
      floor: '3 этаж',
      axes: 'Оси 4-6 / Б-В',
      date: '2024-08-22',
      author: 'Воронов А. М. (Технадзор)',
      type: 'DEFECT',
      status: 'FAILED',
      observation: 'Свищ в месте пайки рефнета. Зафиксировано падение давления манометра.',
      imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'photo-3',
      title: 'Огнезащитное покрытие воздуховодов ДУ-1',
      building: 'Корпус 1',
      floor: '4 этаж',
      axes: 'Оси 1-2 / В-Г',
      date: '2024-08-21',
      author: 'Петров С. В. (Прораб)',
      type: 'INSPECTION',
      status: 'REWORK',
      observation: 'Толщина слоя 1.2 мм при норме 2.0 мм. Требуется нанесение второго слоя.',
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const filtered = photos.filter(p => selectedFloor === 'ALL' || p.floor === selectedFloor);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            ФОТОФИКСАЦИЯ И ГЕОЛОКАЦИОННЫЙ КОНТРОЛЬ
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Привязка фотоматериалов к осям, этажам, штампам времени и замечаниям технадзора.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Открыта камера мобильного устройства для фиксации фото на объекте')}
            className="flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-3.5 py-2 text-xs font-semibold hover:bg-neutral-800 shadow-xs"
          >
            <Camera className="h-4 w-4" />
            Сделать снимок с привязкой
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
        {['ALL', 'Кровля', '4 этаж', '3 этаж', '2 этаж', '1 этаж'].map(fl => (
          <button
            key={fl}
            onClick={() => setSelectedFloor(fl)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedFloor === fl
                ? 'bg-neutral-900 text-white font-semibold'
                : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {fl === 'ALL' ? 'Все этажи' : fl}
          </button>
        ))}
      </div>

      {/* Photo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(photo => (
          <div key={photo.id} className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow">
            <div className="relative h-48 bg-neutral-100">
              <img
                src={photo.imageUrl}
                alt={photo.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <span
                className={`absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                  photo.status === 'FAILED'
                    ? 'bg-red-600 text-white'
                    : photo.status === 'REWORK'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {photo.status}
              </span>
            </div>

            <div className="p-4 space-y-2">
              <h4 className="text-xs font-bold text-neutral-900 leading-snug">{photo.title}</h4>
              
              <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
                <MapPin className="h-3 w-3 text-neutral-400" />
                <span>{photo.building}, {photo.floor} ({photo.axes})</span>
              </div>

              <p className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                {photo.observation}
              </p>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
                <span>{photo.author}</span>
                <span>{photo.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
