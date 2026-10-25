import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Plus,
  Flame,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  Award,
  Calendar,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getTodayKey } from '../services/storage';
import type { HabitItem } from '../types';

interface HabitsTabProps {
  habits: HabitItem[];
  onUpdateHabits: (habits: HabitItem[]) => void;
}

export const HabitsTab: React.FC<HabitsTabProps> = ({ habits, onUpdateHabits }) => {
  const { themeConfig } = useTheme();
  const todayKey = getTodayKey();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [habitTitle, setHabitTitle] = useState('');
  const [habitCategory, setHabitCategory] = useState('صحي');
  const [habitIcon, setHabitIcon] = useState('✨');

  // Generate last 7 days keys
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayName = d.toLocaleDateString('ar-EG', { weekday: 'narrow' });
    const isToday = key === todayKey;
    return { key, dayName, isToday };
  });

  const handleToggleHabit = (habitId: string, dateKey: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const currentStatus = habit.history[dateKey] || false;
    const nextStatus = !currentStatus;

    if (nextStatus && dateKey === todayKey) {
      confetti({
        particleCount: 40,
        spread: 40,
        origin: { y: 0.7 },
        colors: ['#10b981', '#ec4899', '#8b5cf6'],
      });
    }

    const updatedHabits = habits.map((h) => {
      if (h.id === habitId) {
        return {
          ...h,
          history: {
            ...h.history,
            [dateKey]: nextStatus,
          },
        };
      }
      return h;
    });

    onUpdateHabits(updatedHabits);
  };

  const calculateStreak = (history: Record<string, boolean>) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (history[key]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const handleAddHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;

    const newHabit: HabitItem = {
      id: 'h_' + Date.now(),
      title: `${habitTitle.trim()} ${habitIcon}`,
      category: habitCategory,
      icon: habitIcon,
      history: {
        [todayKey]: false,
      },
    };

    onUpdateHabits([...habits, newHabit]);
    setHabitTitle('');
    setIsAddModalOpen(false);
  };

  const handleDeleteHabit = (id: string) => {
    if (confirm('هل ترغبين بحذف هذه العادة؟')) {
      onUpdateHabits(habits.filter((h) => h.id !== id));
    }
  };

  const completedTodayCount = habits.filter((h) => h.history[todayKey]).length;
  const habitsPercent = habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 block mb-1">
            بناء العادات اليومية وتثبيتها
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <span>متتبع العادات والإنجاز اليومي</span>
            <span>✨</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            أنجزتِ اليوم {completedTodayCount} من {habits.length} عادات ({habitsPercent}%)
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-md transition ${themeConfig.accentBg}`}
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عادة جديدة</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${habitsPercent}%` }}
        />
      </div>

      {/* Habits List with 7-Day Matrix */}
      <div className="space-y-3">
        {habits.map((habit) => {
          const isDoneToday = habit.history[todayKey] || false;
          const streak = calculateStreak(habit.history);

          return (
            <div
              key={habit.id}
              className={`bg-white rounded-3xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDoneToday ? 'border-emerald-200 bg-emerald-50/20 shadow-xs' : 'border-slate-200 hover:border-pink-300 shadow-2xs'
              }`}
            >
              {/* Left Side: Habit Info & Today Check */}
              <div className="flex items-center gap-3.5 flex-1">
                <button
                  onClick={() => handleToggleHabit(habit.id, todayKey)}
                  className="shrink-0 text-emerald-600 transition"
                  title="تحديد إنجاز اليوم"
                >
                  {isDoneToday ? (
                    <CheckCircle2 className="w-6 h-6 fill-emerald-100" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300 hover:text-pink-400" />
                  )}
                </button>

                <div>
                  <h4
                    className={`font-bold text-sm sm:text-base leading-snug ${
                      isDoneToday ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {habit.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="font-semibold bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                      {habit.category}
                    </span>
                    {streak > 0 && (
                      <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" />
                        {streak} أيام مستمرة
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: 7-Day History Matrix & Delete */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="flex items-center gap-1.5">
                  {past7Days.map((day) => {
                    const done = habit.history[day.key] || false;
                    return (
                      <button
                        key={day.key}
                        onClick={() => handleToggleHabit(habit.id, day.key)}
                        className={`w-7 h-8 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition ${
                          done
                            ? 'bg-emerald-500 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        } ${day.isToday ? 'ring-2 ring-pink-400' : ''}`}
                        title={`${day.key}: ${done ? 'تم الإنجاز' : 'لم ينجز'}`}
                      >
                        <span>{day.dayName}</span>
                        <span className="text-[9px]">{done ? '✓' : '•'}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition"
                  title="حذف العادة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Habit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pink-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">إضافة عادة جديدة للتتبع</h3>

            <form onSubmit={handleAddHabitSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم العادة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شرب الماء، قراءة سورة الملك، مشي..."
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم</label>
                  <select
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none bg-white"
                  >
                    <option value="روحي">روحي وديني</option>
                    <option value="صحي">صحي وبدني</option>
                    <option value="منزلي">منزلي وترتيب</option>
                    <option value="تطوير">تطوير وثقافة</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الأيقونة</label>
                  <select
                    value={habitIcon}
                    onChange={(e) => setHabitIcon(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none bg-white text-base"
                  >
                    <option value="✨">✨ نجوم وتألق</option>
                    <option value="📖">📖 كتاب وقراءة</option>
                    <option value="💧">💧 ماء وترطيب</option>
                    <option value="🏃‍♀️">🏃‍♀️ رياضة ومشي</option>
                    <option value="☕">☕ هدوء وقهوة</option>
                    <option value="🤲">🤲 ذكر ودعاء</option>
                    <option value="🧹">🧹 ترتيب ونظافة</option>
                    <option value="💊">💊 فيتامينات وعلاج</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white font-bold shadow-md ${themeConfig.accentBg}`}
                >
                  إضافة العادة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
