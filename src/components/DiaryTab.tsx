import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  BookHeart,
  Smile,
  Heart,
  Clock,
  Sparkles,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getTodayKey, formatArabicDateTime, formatArabicDate } from '../services/storage';
import type { DiaryEntry, MoodType } from '../types';

interface DiaryTabProps {
  diary: DiaryEntry[];
  onAddDiaryEntry: (entry: Omit<DiaryEntry, 'id'>) => void;
  onDeleteDiaryEntry: (id: string) => void;
}

export const DiaryTab: React.FC<DiaryTabProps> = ({
  diary,
  onAddDiaryEntry,
  onDeleteDiaryEntry,
}) => {
  const { themeConfig } = useTheme();
  const todayKey = getTodayKey();

  // Mood options
  const moodList: Array<{ id: MoodType; emoji: string; label: string; desc: string; bg: string }> = [
    { id: 'joyful', emoji: '🌸', label: 'مبتهجة ومتحمسة', desc: 'طاقة إيجابية وفرح', bg: 'bg-pink-50 border-pink-200 text-pink-800' },
    { id: 'grateful', emoji: '🤲', label: 'ممتنة وراضية', desc: 'سكينة وشكر لله', bg: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
    { id: 'calm', emoji: '☕', label: 'هادئة ومطمئنة', desc: 'سلام واستقرار', bg: 'bg-blue-50 border-blue-200 text-blue-800' },
    { id: 'proud', emoji: '⭐', label: 'فخورة بإنجازي', desc: 'تغلبت على التحديات', bg: 'bg-amber-50 border-amber-200 text-amber-800' },
    { id: 'tired', emoji: '🥱', label: 'متعبة ومرهقة', desc: 'أحتاج قسطاً من الراحة', bg: 'bg-purple-50 border-purple-200 text-purple-800' },
    { id: 'anxious', emoji: '🌧️', label: 'قلقة أو مشوشة', desc: 'أفرغ أفكاري هنا', bg: 'bg-slate-100 border-slate-300 text-slate-800' },
  ];

  const [selectedMood, setSelectedMood] = useState<MoodType>('grateful');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [achievement, setAchievement] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const gratitudeList = [gratitude1, gratitude2, gratitude3]
      .map((g) => g.trim())
      .filter(Boolean);

    onAddDiaryEntry({
      date: todayKey,
      time: timeStr,
      mood: selectedMood,
      title: title.trim() || `خواطر ${formatArabicDate(todayKey)}`,
      content: content.trim(),
      gratitude: gratitudeList,
      achievement: achievement.trim(),
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#8b5cf6', '#10b981'],
    });

    setTitle('');
    setContent('');
    setGratitude1('');
    setGratitude2('');
    setGratitude3('');
    setAchievement('');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  const currentMoodMeta = moodList.find((m) => m.id === selectedMood) || moodList[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <span className="text-xs font-bold text-slate-400 block mb-1">
          مساحة البوح والفضفضة والامتنان
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
          <span>حالتي ومذكراتي اليومية</span>
          <span>📝</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          كتبي ما يجول بخاطركِ، سجّلي نعم الله التي غمرتكِ، واجعلي هذا السجل ملاذكِ الآمن.
        </p>
      </div>

      {showSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>تم حفظ مذكرات وحالة اليوم بنجاح في سجل يومياتكِ 🌸</span>
        </div>
      )}

      {/* Main Journal Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Mood Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              كيف هو مزاجكِ وحالتكِ اليوم؟ 💭
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {moodList.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setSelectedMood(m.id)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    selectedMood === m.id
                      ? `${m.bg} ring-2 ring-pink-500 font-black shadow-xs scale-102`
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className="text-2xl block mb-1">{m.emoji}</span>
                  <span className="text-xs font-bold block">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Journal Title & Text Area */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                عنوان أو سطر لليوم (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: يوم دافئ مع الصغار، إنجاز رائع في المطبخ..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                مذكراتكِ وخواطركِ اليومية *
              </label>
              <textarea
                rows={4}
                required
                placeholder="اكتبي مشاعركِ، ماذا حدث اليوم، ما الذي أبهجكِ أو أثقل قلبكِ..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none text-xs sm:text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* 3. Gratitude 3 Points */}
          <div className="bg-pink-50/50 border border-pink-200/80 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-pink-800 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-pink-600 fill-pink-300" />
              ٣ نعم من الله أمتن لها اليوم:
            </h4>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="١. نعمة..."
                value={gratitude1}
                onChange={(e) => setGratitude1(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-white focus:ring-2 focus:ring-pink-400 focus:outline-none text-xs"
              />
              <input
                type="text"
                placeholder="٢. نعمة..."
                value={gratitude2}
                onChange={(e) => setGratitude2(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-white focus:ring-2 focus:ring-pink-400 focus:outline-none text-xs"
              />
              <input
                type="text"
                placeholder="٣. نعمة..."
                value={gratitude3}
                onChange={(e) => setGratitude3(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-white focus:ring-2 focus:ring-pink-400 focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* 4. Proud achievement */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              أهم إنجاز أو عمل صالح فخورة به اليوم:
            </label>
            <input
              type="text"
              placeholder="مثال: ضبطت أعصابي مع الأولاد، جهزت وجبة صحية، أنهيت ورد القرآن..."
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none text-xs"
            />
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-md transition ${themeConfig.accentBg}`}
            >
              <Sparkles className="w-4 h-4" />
              <span>حفظ مذكرات اليوم في سجلي</span>
            </button>
          </div>
        </form>
      </div>

      {/* Diary Entries History */}
      <div className="space-y-4 pt-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <BookHeart className="w-4 h-4 text-pink-600" />
          دفتر اليوميات والذكريات ({diary.length} تدوينة)
        </h3>

        {diary.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">
            سجل المذكرات فارغ حالياً. اكتبي تدوينتكِ الأولى بالأعلى!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diary.map((entry) => {
              const moodMeta = moodList.find((m) => m.id === entry.mood) || moodList[0];

              return (
                <div
                  key={entry.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-pink-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{moodMeta.emoji}</span>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                            {entry.title}
                          </h4>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {entry.date} - الساعة {entry.time}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('هل أنتِ متأكدة من حذف هذه التدوينة؟')) {
                            onDeleteDiaryEntry(entry.id);
                          }
                        }}
                        className="text-slate-300 hover:text-rose-600 p-1.5 transition"
                        title="حذف التدوينة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      {entry.content}
                    </p>

                    {entry.gratitude && entry.gratitude.length > 0 && (
                      <div className="bg-pink-50/40 p-2.5 rounded-xl border border-pink-100 text-xs">
                        <span className="font-bold text-pink-800 block text-[11px] mb-1">
                          🌸 نعم وامتنان:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                          {entry.gratitude.map((g, idx) => (
                            <li key={idx}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.achievement && (
                      <div className="text-[11px] font-medium text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                        ⭐ إنجاز اليوم: {entry.achievement}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
