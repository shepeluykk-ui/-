/**
 * ОФИЦИАЛЬНАЯ КОНФИГУРАЦИЯ БРЕНДА «КИТ»
 * КОМПЛЕКСНЫЕ ИНЖЕНЕРНЫЕ ТЕХНОЛОГИИ
 * Единая централизованная система айдентики и корпоративного стиля
 */

export const BRAND_CONFIG = {
  name: 'КИТ',
  fullName: 'ООО «Комплексные Инженерные Технологии»',
  tagline: 'КОМПЛЕКСНЫЕ ИНЖЕНЕРНЫЕ ТЕХНОЛОГИИ',
  englishName: 'KIT — Complex Engineering Technologies',
  
  systemTitle: 'СТРОИТЕЛЬНЫЙ КОНТРОЛЬ',
  systemSubtitle: 'Единая Информационная Система Объекта',
  version: 'v1.0.0-PROD-RC1',
  buildDate: '2026-08-27',
  
  // Корпоративная палитра бренда КИТ
  colors: {
    primaryNavy: '#0B2A5E',     // Основной темно-синий
    primaryNavyHover: '#071F47',
    primaryNavyDark: '#061A3A',
    electricCyan: '#00A3E0',    // Технологичный ярко-голубой / электро-циан
    electricCyanHover: '#008EC4',
    electricCyanLight: '#E0F4FC',
    electricCyanGlow: 'rgba(0, 163, 224, 0.4)',
    
    accentBlue: '#154886',
    steelGray: '#64748B',
    lightBg: '#F8FAFC',
    darkBg: '#0B1528',
    cardBgLight: '#FFFFFF',
    cardBgDark: '#0F1D36',
    borderLight: '#E2E8F0',
    borderDark: '#1E2E4A',
  },

  // Инженерные направления бренда (6 секторов гексагонального знака)
  engineeringDomains: [
    { id: 'cctv', title: 'Видеонаблюдение & СКУД', icon: 'camera', code: 'СС' },
    { id: 'hvac', title: 'Вентиляция & ОВиК', icon: 'fan', code: 'ОВ' },
    { id: 'plumbing', title: 'Водоснабжение & Канализация', icon: 'droplet', code: 'ВК' },
    { id: 'fire_safety', title: 'Пожарная безопасность & ОПС', icon: 'shield-flame', code: 'АПС' },
    { id: 'cables', title: 'Силовые & Слаботочные сети', icon: 'cable', code: 'ЭОМ' },
    { id: 'audio_alarm', title: 'Оповещение & СОУЭ', icon: 'speaker', code: 'СОУЭ' },
    { id: 'lightning', title: 'Энергетика & Автоматизация', icon: 'zap', code: 'АВТ' }
  ],

  // Универсальные строительные и инженерные разделы проекта
  workCategories: [
    { id: 'OVIK', code: 'ОВ', name: 'Отопление, вентиляция и кондиционирование (ОВиК)', icon: 'Flame', standard: 'СП 60.13330.2020 / СП 73.13330.2016' },
    { id: 'VRF', code: 'VRF', name: 'Мультизональные VRF/VRV системы', icon: 'Cpu', standard: 'СП 73.13330.2016 / Инструкция изготовителя' },
    { id: 'VK', code: 'ВК', name: 'Водоснабжение и водоотведение (ВК)', icon: 'Droplets', standard: 'СП 30.13330.2020 / СП 73.13330.2016' },
    { id: 'EOM', code: 'ЭОМ', name: 'Силовое электрооборудование и освещение (ЭОМ)', icon: 'Zap', standard: 'СП 256.1325800.2016 / ПУЭ 7' },
    { id: 'SS', code: 'СС', name: 'Слаботочные сети, видеонаблюдение, СКУД (СС)', icon: 'Wifi', standard: 'СП 134.13330.2012' },
    { id: 'APS', code: 'АПС', name: 'Пожарная сигнализация и оповещение (АПС/СОУЭ)', icon: 'ShieldAlert', standard: 'СП 484.1311500.2020 / СП 3.13130.2009' },
    { id: 'AVT', code: 'АВТ', name: 'Автоматизация инженерных систем (АВТ/BMS)', icon: 'Sliders', standard: 'СП 77.13330.2016' },
    { id: 'AR', code: 'АР', name: 'Архитектурные решения (АР)', icon: 'Building', standard: 'СП 118.13330.2022' },
    { id: 'KR', code: 'КР', name: 'Конструктивные решения и монолит (КР)', icon: 'Box', standard: 'СП 63.13330.2018 / СП 70.13330.2012' },
    { id: 'KM', code: 'КМ', name: 'Металлоконструкции (КМ/КМД)', icon: 'Grid', standard: 'СП 16.13330.2017' },
    { id: 'CONCRETE', code: 'БЕТОН', name: 'Бетонные и железобетонные работы', icon: 'Hammer', standard: 'СП 70.13330.2012' },
    { id: 'FINISHING', code: 'ОТДЕЛКА', name: 'Отделочные работы и фальшполы', icon: 'Layers', standard: 'СП 71.13330.2017' },
    { id: 'EARTHWORK', code: 'ЗЕМЛЯ', name: 'Земляные работы и фундаменты', icon: 'Shovel', standard: 'СП 45.13330.2017' },
    { id: 'ROOFING', code: 'КРОВЛЯ', name: 'Кровельные работы и гидроизоляция', icon: 'Home', standard: 'СП 17.13330.2017' },
    { id: 'OUTDOOR_NETS', code: 'НСС/ТС', name: 'Наружные инженерные сети (НВК, ТС, НСС)', icon: 'Network', standard: 'СП 129.13330.2019 / СП 124.13330.2012' },
    { id: 'TECH_EQUIP', code: 'ТХ', name: 'Монтаж технологического оборудования (ТХ)', icon: 'Cog', standard: 'СП 75.13330.2011' },
    { id: 'PNR', code: 'ПНР', name: 'Пусконаладочные работы и опробование', icon: 'Gauge', standard: 'СП 68.13330.2017' },
    { id: 'CUSTOM', code: 'ПОЛЬЗ', name: 'Пользовательский вид работ (настраиваемый)', icon: 'PlusCircle', standard: 'По проекту / ГОСТ' }
  ]
};
