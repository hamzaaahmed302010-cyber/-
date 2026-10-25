import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  BookHeart,
  CheckCircle2,
  Circle,
  Flame,
  Sparkles,
  Sun,
  Moon,
  Compass,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Award,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getTodayKey, createDefaultDayPrayers, formatArabicDate } from '../services/storage';
import type { DailyPrayers, PrayersState, SunnahPrayersState } from '../types';

interface PrayerTabProps {
  prayerHistory: Record<string, DailyPrayers>;
  onUpdatePrayers: (history: Record<string, DailyPrayers>) => void;
}

export const PrayerTab: React.FC<PrayerTabProps> = ({ prayerHistory, onUpdatePrayers }) => {
  const { themeConfig } = useTheme();
  const todayKey = getTodayKey();
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);

  const currentRecord: DailyPrayers =
    prayerHistory[selectedDate] || createDefaultDayPrayers(selectedDate);

  const prayersList: Array<{
    id: keyof PrayersState;
    name: string;
    rakahs: string;
    timeDesc: string;
    icon: string;
  }> = [
    { id: 'fajr', name: 'صلاة الفجر', rakahs: 'ركعتان فرضان', timeDesc: 'من طلوع الفجر حتى الشروق', icon: '🌅' },
    { id: 'dhuhr', name: 'صلاة الظهر', rakahs: '٤ ركعات فرض', timeDesc: 'عند زوال الشمس', icon: '☀️' },
    { id: 'asr', name: 'صلاة العصر', rakahs: '٤ ركعات فرض', timeDesc: 'عصراً حتى اصفرار الشمس', icon: '🌤️' },
    { id: 'maghrib', name: 'صلاة المغرب', rakahs: '٣ ركعات فرض', timeDesc: 'عند غروب الشمس تماماً', icon: '🌇' },
    { id: 'isha', name: 'صلاة العشاء', rakahs: '٤ ركعات فرض', timeDesc: 'من مغيب الشفق الأحمر', icon: '🌙' },
  ];

  const sunnahList: Array<{
    id: keyof SunnahPrayersState;
    name: string;
    rakahs: string;
    merit: string;
  }> = [
    { id: 'fajrSunnah', name: 'سنة الفجر القبلية', rakahs: 'ركعتان', merit: 'خير من الدنيا وما فيها' },
    { id: 'duha', name: 'صلاة الضحى', rakahs: 'ركعتان إلى ٨ ركعات', merit: 'تجزئ عن صدقة كل مفصل' },
    { id: 'dhuhrSunnah', name: 'سنن الظهر (قبلية وبعدية)', rakahs: '٤ قبلية + ٢ بعدية', merit: 'بيت في الجنة' },
    { id: 'maghribSunnah', name: 'سنة المغرب البعدية', rakahs: 'ركعتان', merit: 'من الرواتب المؤكدة' },
    { id: 'ishaSunnah', name: 'سنة العشاء البعدية', rakahs: 'ركعتان', merit: 'من الرواتب المؤكدة' },
    { id: 'witr', name: 'صلاة الوتر', rakahs: 'ركعة أو ٣ ركعات', merit: 'إن الله وتر يحب الوتر' },
    { id: 'qiyam', name: 'قيام الليل / التهجد', rakahs: 'ركعتان فأكثر', merit: 'شرف المؤمن قيامه بالليل' },
  ];

  const handleTogglePrayer = (prayerId: keyof PrayersState) => {
    const nextState = !currentRecord.prayers[prayerId];
    const newPrayers = { ...currentRecord.prayers, [prayerId]: nextState };

    // Check if all 5 prayers completed
    const allDone = Object.values(newPrayers).every(Boolean);
    if (allDone && !Object.values(currentRecord.prayers).every(Boolean)) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#ec4899', '#f59e0b'],
      });
    }

    const updatedRecord: DailyPrayers = {
      ...currentRecord,
      prayers: newPrayers,
    };

    onUpdatePrayers({
      ...prayerHistory,
      [selectedDate]: updatedRecord,
    });
  };

  const handleToggleSunnah = (sunnahId: keyof SunnahPrayersState) => {
    const updatedRecord: DailyPrayers = {
      ...currentRecord,
      sunnah: {
        ...currentRecord.sunnah,
        [sunnahId]: !currentRecord.sunnah[sunnahId],
      },
    };

    onUpdatePrayers({
      ...prayerHistory,
      [selectedDate]: updatedRecord,
    });
  };

  const handleToggleExtra = (field: 'dhikrMorning' | 'dhikrEvening' | 'quranReading') => {
    const updatedRecord: DailyPrayers = {
      ...currentRecord,
      [field]: !currentRecord[field],
    };

    onUpdatePrayers({
      ...prayerHistory,
      [selectedDate]: updatedRecord,
    });
  };

  // Completed prayers count
  const completedFardCount = Object.values(currentRecord.prayers).filter(Boolean).length;
  const fardPercent = Math.round((completedFardCount / 5) * 100);

  // Consecutive days streak calculation
  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const rec = prayerHistory[key];
      if (rec && Object.values(rec.prayers).filter(Boolean).length >= 4) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return Math.max(1, streak);
  };

  const streakDays = calculateStreak();

  return (
    <div className="space-y-6">
      {/* Top Banner: Prayer Streak & Daily Date */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 block mb-1">
            قال رسول الله ﷺ: «أحب الأعمال إلى الله الصلاة على وقتها»
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <span>متتبع الصلوات والسنن اليومية</span>
            <span>🕌</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {formatArabicDate(selectedDate)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak Badge */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-400 animate-pulse" />
            <div>
              <span className="text-xs text-amber-700 block font-semibold leading-none">
                أيام متتالية
              </span>
              <span className="text-lg font-black">{streakDays} أيام ما شاء الله</span>
            </div>
          </div>

          {/* Quick Date Switcher */}
          <button
            onClick={() => setSelectedDate(todayKey)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              selectedDate === todayKey
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            اليوم
          </button>
        </div>
      </div>

      {/* Main Grid: 5 Daily Fard Prayers */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              الصلوات الخمس المفروضة ({completedFardCount} من 5)
            </h3>
            <span className="text-xs text-slate-400">
              انقري على الصلاة لتحديد أداءها بوقتها
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <span>{fardPercent}% مكتمل</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-600 transition-all duration-300"
            style={{ width: `${fardPercent}%` }}
          />
        </div>

        {/* 5 Prayers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {prayersList.map((p) => {
            const isDone = currentRecord.prayers[p.id];
            return (
              <div
                key={p.id}
                onClick={() => handleTogglePrayer(p.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-right relative overflow-hidden ${
                  isDone
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-xs ring-1 ring-emerald-300'
                    : 'bg-white border-slate-200 hover:border-pink-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{p.icon}</span>
                    <div className="text-emerald-600">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{p.rakahs}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 text-[10px] text-slate-400">
                  {p.timeDesc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sunnah Prayers & Qiyam */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          سنن الرواتب، الضحى، وقيام الليل
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sunnahList.map((s) => {
            const isDone = currentRecord.sunnah[s.id];
            return (
              <div
                key={s.id}
                onClick={() => handleToggleSunnah(s.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-purple-50/70 border-purple-300 text-purple-900'
                    : 'bg-white border-slate-200 hover:border-purple-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="text-purple-600 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 fill-purple-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">{s.name}</h5>
                    <span className="text-[10px] text-slate-400 block">
                      {s.rakahs} • {s.merit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Dhikr & Quran */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => handleToggleExtra('dhikrMorning')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            currentRecord.dhikrMorning
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-white border-slate-200 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌅</span>
            <div>
              <h5 className="font-bold text-xs">أذكار الصباح</h5>
              <span className="text-[11px] text-slate-400">حصن المسلم وراحة اليوم</span>
            </div>
          </div>
          <div>
            {currentRecord.dhikrMorning ? (
              <CheckCircle2 className="w-5 h-5 text-amber-600 fill-amber-100" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300" />
            )}
          </div>
        </div>

        <div
          onClick={() => handleToggleExtra('dhikrEvening')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            currentRecord.dhikrEvening
              ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
              : 'bg-white border-slate-200 hover:border-indigo-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌙</span>
            <div>
              <h5 className="font-bold text-xs">أذكار المساء</h5>
              <span className="text-[11px] text-slate-400">سكينة وسلام للقلب</span>
            </div>
          </div>
          <div>
            {currentRecord.dhikrEvening ? (
              <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-100" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300" />
            )}
          </div>
        </div>

        <div
          onClick={() => handleToggleExtra('quranReading')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            currentRecord.quranReading
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-white border-slate-200 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <h5 className="font-bold text-xs">ورد القرآن الكريم</h5>
              <span className="text-[11px] text-slate-400">صفحة أو جزء يومي</span>
            </div>
          </div>
          <div>
            {currentRecord.quranReading ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
