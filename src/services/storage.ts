import type { AppData, DailyPrayers } from '../types';

const STORAGE_KEY = 'bayti_life_manager_data_v1';

export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatArabicDateTime(isoString?: string): string {
  const d = isoString ? new Date(isoString) : new Date();
  return d.toLocaleString('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatArabicDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function createDefaultDayPrayers(dateStr: string): DailyPrayers {
  return {
    date: dateStr,
    prayers: {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
    },
    sunnah: {
      fajrSunnah: false,
      duha: false,
      dhuhrSunnah: false,
      maghribSunnah: false,
      ishaSunnah: false,
      witr: false,
      qiyam: false,
    },
    dhikrMorning: false,
    dhikrEvening: false,
    quranReading: false,
  };
}

export const initialSampleData: AppData = {
  version: '1.0.0',
  lastBackupDate: null,
  theme: 'pink-purple',
  pantry: [
    {
      id: 'p1',
      name: 'أرز مصري درجة أولى',
      category: 'food',
      quantity: 5,
      unit: 'كجم',
      minThreshold: 2,
      status: 'available',
      notes: 'في خزانة البقوليات الكبيرة',
      lastUpdated: new Date().toISOString(),
      lastPurchasedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      defaultRestockQty: 5,
    },
    {
      id: 'p2',
      name: 'سكر ناعم',
      category: 'food',
      quantity: 1,
      unit: 'كجم',
      minThreshold: 2,
      status: 'low',
      notes: 'متبقي كيس واحد فقط',
      lastUpdated: new Date().toISOString(),
      lastPurchasedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      defaultRestockQty: 3,
    },
    {
      id: 'p3',
      name: 'زيت عباد الشمس نقي',
      category: 'food',
      quantity: 0,
      unit: 'لتر',
      minThreshold: 1,
      status: 'out',
      notes: 'تم استهلاك آخر زجاجة اليوم',
      lastUpdated: new Date().toISOString(),
      lastPurchasedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      defaultRestockQty: 2,
    },
    {
      id: 'p4',
      name: 'مكرونة أقلام وإسباجيتي',
      category: 'food',
      quantity: 4,
      unit: 'كيس',
      minThreshold: 2,
      status: 'available',
      notes: 'مخزون ممتاز',
      lastUpdated: new Date().toISOString(),
      lastPurchasedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      defaultRestockQty: 4,
    },
    {
      id: 'p5',
      name: 'حليب كامل الدسم',
      category: 'fridge',
      quantity: 2,
      unit: 'لتر',
      minThreshold: 1,
      status: 'available',
      notes: 'صالح حتى نهاية الأسبوع',
      lastUpdated: new Date().toISOString(),
      lastPurchasedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      defaultRestockQty: 3,
    },
    {
      id: 'p6',
      name: 'جبنة بيضاء فيتا وبيض',
      category: 'fridge',
      quantity: 1,
      unit: 'علبة / كرتونة',
      minThreshold: 1,
      status: 'low',
      notes: 'متبقي نصف كرتونة بيض',
      lastUpdated: new Date().toISOString(),
      lastPurchasedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      defaultRestockQty: 1,
    },
    {
      id: 'p7',
      name: 'مسحوق غسيل ملابس أوتوماتيك',
      category: 'cleaning',
      quantity: 3,
      unit: 'كجم',
      minThreshold: 1.5,
      status: 'available',
      notes: 'في رف الغسالة',
      lastUpdated: new Date().toISOString(),
      lastPurchasedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      defaultRestockQty: 4,
    },
    {
      id: 'p8',
      name: 'سائل غسيل الأطباق',
      category: 'cleaning',
      quantity: 1.5,
      unit: 'لتر',
      minThreshold: 1,
      status: 'available',
      notes: 'برائحة الليمون',
      lastUpdated: new Date().toISOString(),
      lastPurchasedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      defaultRestockQty: 2,
    },
    {
      id: 'p9',
      name: 'مناديل مطبخ رول قوية',
      category: 'cleaning',
      quantity: 0,
      unit: 'عبوة',
      minThreshold: 1,
      status: 'out',
      notes: 'خلصت تماماً وتنتظر الشراء',
      lastUpdated: new Date().toISOString(),
      lastPurchasedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      defaultRestockQty: 2,
    },
    {
      id: 'p10',
      name: 'شامبو وشاور جل للعائلة',
      category: 'personal',
      quantity: 2,
      unit: 'عبوة',
      minThreshold: 1,
      status: 'available',
      notes: 'في خزانة الحمام',
      lastUpdated: new Date().toISOString(),
      lastPurchasedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      defaultRestockQty: 2,
    },
  ],
  shoppingList: [
    {
      id: 's1',
      name: 'زيت عباد الشمس نقي',
      category: 'food',
      quantity: 2,
      unit: 'لتر',
      estimatedPrice: 120,
      isBought: false,
      addedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      pantryItemId: 'p3',
    },
    {
      id: 's2',
      name: 'مناديل مطبخ رول قوية',
      category: 'cleaning',
      quantity: 2,
      unit: 'عبوة',
      estimatedPrice: 55,
      isBought: false,
      addedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      pantryItemId: 'p9',
    },
    {
      id: 's3',
      name: 'كرتونة بيض طازج',
      category: 'fridge',
      quantity: 1,
      unit: 'طبق',
      estimatedPrice: 150,
      isBought: false,
      addedAt: new Date().toISOString(),
      pantryItemId: 'p6',
    },
  ],
  budget: {
    totalIncome: 16000,
    savingsTarget: 3200,
    savingsPercent: 20,
    categoryAllocations: {
      pantry: 4500,
      bills: 2200,
      kids: 3000,
      home: 1000,
      personal: 1200,
      health: 600,
      other: 500,
    },
    expenses: [
      {
        id: 'e1',
        amount: 850,
        category: 'pantry',
        description: 'مشتريات خضار ولحوم طازجة للأسبوع',
        date: getTodayKey(),
        time: '11:30',
        paymentMethod: 'cash',
      },
      {
        id: 'e2',
        amount: 320,
        category: 'bills',
        description: 'فاتورة الكهرباء الشهرية',
        date: getTodayKey(),
        time: '09:15',
        paymentMethod: 'card',
      },
      {
        id: 'e3',
        amount: 250,
        category: 'kids',
        description: 'أدوات دراسية وكشاكيل تلوين',
        date: getTodayKey(),
        time: '15:40',
        paymentMethod: 'cash',
      },
    ],
  },
  kids: [
    {
      id: 'k1',
      name: 'حمزة',
      avatarColor: 'from-blue-400 to-indigo-500',
      gender: 'boy',
      stars: 18,
      notes: 'تمرين السباحة يومي الاثنين والخميس الساعة 5 عصراً',
      tasks: [
        { id: 'kt1', title: 'صلاة الفجر والظهر في وقتهما', completed: true, points: 2, time: 'صباحاً' },
        { id: 'kt2', title: 'أداء واجب الرياضيات والإملاء', completed: true, points: 2, time: 'عصراً' },
        { id: 'kt3', title: 'ترتيب حقيبة المدرسة وملابسه', completed: false, points: 1, time: 'مساءً' },
        { id: 'kt4', title: 'تفريش الأسنان قبل النوم وقراءة قصة', completed: false, points: 1, time: 'قبل النوم' },
      ],
    },
    {
      id: 'k2',
      name: 'مريم',
      avatarColor: 'from-pink-400 to-rose-500',
      gender: 'girl',
      stars: 24,
      notes: 'فيتامين د قطرات مع وجبة الإفطار',
      tasks: [
        { id: 'kt5', title: 'ترتيب الألعاب في الصندوق المخصص', completed: true, points: 2, time: 'ظهراً' },
        { id: 'kt6', title: 'شرب كوب الحليب وتناول الفاكهة', completed: true, points: 1, time: 'صباحاً' },
        { id: 'kt7', title: 'سماع قصة الأنبياء مع ماما', completed: false, points: 2, time: 'مساءً' },
        { id: 'kt8', title: 'أذكار النوم وتفريش الأسنان', completed: false, points: 1, time: 'قبل النوم' },
      ],
    },
  ],
  momSchedule: {
    blocks: [
      {
        id: 'mb1',
        title: 'صباحي الهادئ (قهوة، مصحف، وأذكار الصباح)',
        timeRange: '06:00 - 07:00 ص',
        type: 'care',
        completed: true,
        notes: 'وقتي المفضل لبداية اليوم بروية وسكينة',
      },
      {
        id: 'mb2',
        title: 'إفطار الأولاد وتوديعهم إلى المدرسة والحضانة',
        timeRange: '07:00 - 08:30 ص',
        type: 'routine',
        completed: true,
        notes: 'تجهيز السندوتشات والعصائر',
      },
      {
        id: 'mb3',
        title: 'ترتيب سريع للمنزل وتحضير وجبة الغداء',
        timeRange: '10:30 - 12:30 م',
        type: 'work',
        completed: true,
        notes: 'طبخ أرز وخضار وسلطة طازجة',
      },
      {
        id: 'mb4',
        title: 'وقت الأسرة والمذاكرة مع الأطفال',
        timeRange: '04:00 - 06:00 م',
        type: 'routine',
        completed: false,
        notes: 'مراجعة دروس الغد واللعب معاً',
      },
      {
        id: 'mb5',
        title: 'وقتي الخاص (استرخاء، عناية بالبشرة، قراءة)',
        timeRange: '09:30 - 10:30 م',
        type: 'rest',
        completed: false,
        notes: 'مشروب دافئ وجلسة هدوء بدون شاشات',
      },
    ],
    pomodoroMinutes: 15,
    pomodoroState: 'idle',
    selfCareNotes: 'تذكري دائماً: أم سعيدة ومرتاحة = بيت سعيد ومطمئن 🌸',
  },
  prayerHistory: {
    [getTodayKey()]: {
      date: getTodayKey(),
      prayers: {
        fajr: true,
        dhuhr: true,
        asr: false,
        maghrib: false,
        isha: false,
      },
      sunnah: {
        fajrSunnah: true,
        duha: true,
        dhuhrSunnah: false,
        maghribSunnah: false,
        ishaSunnah: false,
        witr: false,
        qiyam: false,
      },
      dhikrMorning: true,
      dhikrEvening: false,
      quranReading: true,
    },
  },
  habits: [
    {
      id: 'h1',
      title: 'قراءة ورد القرآن الكريم 📖',
      category: 'روحي',
      icon: 'BookOpen',
      history: { [getTodayKey()]: true },
    },
    {
      id: 'h2',
      title: 'أذكار الصباح والمساء 🤲',
      category: 'روحي',
      icon: 'Heart',
      history: { [getTodayKey()]: true },
    },
    {
      id: 'h3',
      title: 'شرب 2 إلى 3 لتر ماء 💧',
      category: 'صحي',
      icon: 'Droplet',
      history: { [getTodayKey()]: true },
    },
    {
      id: 'h4',
      title: 'فيتامينات ومكملات الصباح 💊',
      category: 'صحي',
      icon: 'ShieldCheck',
      history: { [getTodayKey()]: true },
    },
    {
      id: 'h5',
      title: 'مشي أو نشاط حركي 20 دقيقة 🏃‍♀️',
      category: 'صحي',
      icon: 'Activity',
      history: { [getTodayKey()]: false },
    },
    {
      id: 'h6',
      title: 'ترتيب سريع للمنزل (15 دقيقة) 🧹',
      category: 'منزلي',
      icon: 'Sparkles',
      history: { [getTodayKey()]: true },
    },
    {
      id: 'h7',
      title: 'وقت قراءة أو استماع نافع 🎧',
      category: 'تطوير',
      icon: 'Coffee',
      history: { [getTodayKey()]: false },
    },
  ],
  diary: [
    {
      id: 'd1',
      date: getTodayKey(),
      time: '14:20',
      mood: 'grateful',
      title: 'يوم مبارك وهدوء مريح',
      content:
        'الحمد لله كان صباح اليوم لطيفاً ومثمراً. تمكنت من ترتيب أولويات البيت وخزانة المطبخ، والأولاد مبسوطين وذاكروا واجباتهم بهدوء. أشعر بالسكينة والرضا.',
      gratitude: [
        'نعمة الصحة والعافية لي ولعائلتي',
        'فنجان قهوة هادئ في الصباح الباكر',
        'ضحكات الأولاد ودفء بيتنا الصغير',
      ],
      achievement: 'تنظيم قائمة النواقص والخزين وحساب ميزانية الشهر بدقة.',
    },
  ],
};

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppData(initialSampleData);
      return initialSampleData;
    }
    const parsed = JSON.parse(raw) as AppData;
    // Ensure today prayer record exists
    const today = getTodayKey();
    if (!parsed.prayerHistory[today]) {
      parsed.prayerHistory[today] = createDefaultDayPrayers(today);
    }
    return parsed;
  } catch (e) {
    console.error('Error loading data from localStorage:', e);
    return initialSampleData;
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving data to localStorage:', e);
  }
}

export function exportDataAsJsonFile(data: AppData) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `بيتي_وحياتي_${getTodayKey()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
