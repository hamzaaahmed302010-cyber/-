import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sparkles,
  Coffee,
  Heart,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Smile,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { MomSchedule, TimeBlock } from '../types';

interface MyTimeTabProps {
  schedule: MomSchedule;
  onUpdateSchedule: (schedule: MomSchedule) => void;
}

export const MyTimeTab: React.FC<MyTimeTabProps> = ({ schedule, onUpdateSchedule }) => {
  const { themeConfig } = useTheme();
  const [secondsLeft, setSecondsLeft] = useState(schedule.pomodoroMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerLabel, setTimerLabel] = useState('جلسة إنجاز مركز (15 دقيقة)');

  // Add block modal
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [blockTitle, setBlockTitle] = useState('');
  const [blockTimeRange, setBlockTimeRange] = useState('');
  const [blockType, setBlockType] = useState<'routine' | 'care' | 'work' | 'rest'>('care');
  const [blockNotes, setBlockNotes] = useState('');

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      alert('انتهى وقت الجلسة! خذي نفساً عميقاً واستمتعي بإنجازك 🌸');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft]);

  const handleStartTimer = (minutes: number, label: string) => {
    setSecondsLeft(minutes * 60);
    setTimerLabel(label);
    setIsTimerRunning(true);
  };

  const formatTimerTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleToggleBlock = (blockId: string) => {
    const updatedBlocks = schedule.blocks.map((b) =>
      b.id === blockId ? { ...b, completed: !b.completed } : b
    );
    onUpdateSchedule({ ...schedule, blocks: updatedBlocks });
  };

  const handleDeleteBlock = (blockId: string) => {
    const updatedBlocks = schedule.blocks.filter((b) => b.id !== blockId);
    onUpdateSchedule({ ...schedule, blocks: updatedBlocks });
  };

  const handleAddBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitle.trim()) return;

    const newBlock: TimeBlock = {
      id: 'mb_' + Date.now(),
      title: blockTitle.trim(),
      timeRange: blockTimeRange.trim() || 'خلال اليوم',
      type: blockType,
      completed: false,
      notes: blockNotes.trim(),
    };

    onUpdateSchedule({ ...schedule, blocks: [...schedule.blocks, newBlock] });
    setBlockTitle('');
    setBlockTimeRange('');
    setBlockNotes('');
    setIsAddBlockOpen(false);
  };

  const completedBlocks = schedule.blocks.filter((b) => b.completed).length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Mom's Self-Care Affirmation */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-pink-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-pink-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              مساحتكِ الخاصة ووقتكِ الثمين
            </span>
            <h2 className="text-xl sm:text-2xl font-black">
              أنتِ قلب البيت النابض.. اعتني بنفسكِ لتسعد عائلتك 🌸
            </h2>
            <p className="text-xs text-pink-100 max-w-xl leading-relaxed">
              تخصيص وقت محدد لراحتك وهدوئكِ ليس رفاهية، بل هو سر استمرار طاقتكِ وعطائكِ وحنانكِ اليومي.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center shrink-0">
            <span className="text-xs text-pink-100 block">إنجاز روتينكِ اليوم</span>
            <span className="text-2xl font-black">{completedBlocks} / {schedule.blocks.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Focus & Relaxation Timer */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-pink-600" />
                مؤقت التركيز والاسترخاء
              </span>
              <span className="text-[11px] text-slate-400">بومودورو منزلي</span>
            </div>

            <div className="py-2">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-slate-800">
                {formatTimerTime(secondsLeft)}
              </span>
              <p className="text-xs text-slate-500 mt-2 font-medium">{timerLabel}</p>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-md transition ${themeConfig.accentBg}`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>إيقاف مؤقت</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>ابدئي الآن</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setSecondsLeft(15 * 60);
                }}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                title="إعادة ضبط"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Preset Modes */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-right">
              <span className="text-[11px] text-slate-400 font-bold block mb-1">
                جلسات مقترحة سريعة:
              </span>
              <button
                onClick={() => handleStartTimer(15, 'تنظيف وترتيب سريع للمطبخ والبيت 🧹')}
                className="w-full text-right p-2 rounded-xl bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 flex items-center justify-between"
              >
                <span>🧹 ترتيب سريع للمنزل</span>
                <span className="text-pink-600 font-bold">15 د</span>
              </button>
              <button
                onClick={() => handleStartTimer(10, 'استرخاء وتنفس عميق وكوب شاي دافئ ☕')}
                className="w-full text-right p-2 rounded-xl bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 flex items-center justify-between"
              >
                <span>☕ استرخاء وشاي دافئ</span>
                <span className="text-purple-600 font-bold">10 د</span>
              </button>
              <button
                onClick={() => handleStartTimer(25, 'وقت قراءة كتاب نافع أو قرآن كريم 📖')}
                className="w-full text-right p-2 rounded-xl bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 flex items-center justify-between"
              >
                <span>📖 قراءة وتطوير ذات</span>
                <span className="text-emerald-600 font-bold">25 د</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Time Blocks & Routine */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-purple-600" />
                  تقسيم يومكِ ومحطات الروتين
                </h3>
                <p className="text-xs text-slate-500">
                  نظمي يومكِ في كتل زمنية مريحة تعينك على التوازن بدون ضغط.
                </p>
              </div>

              <button
                onClick={() => setIsAddBlockOpen(true)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white font-bold text-xs shadow-xs transition ${themeConfig.accentBg}`}
              >
                <Plus className="w-4 h-4" />
                <span>إضافة فترة</span>
              </button>
            </div>

            <div className="space-y-3">
              {schedule.blocks.map((block) => (
                <div
                  key={block.id}
                  onClick={() => handleToggleBlock(block.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    block.completed
                      ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-80'
                      : 'bg-white border-slate-200 hover:border-pink-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBlock(block.id);
                      }}
                      className="mt-0.5 text-pink-600"
                    >
                      {block.completed ? (
                        <CheckCircle2 className="w-5 h-5 fill-pink-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </button>

                    <div>
                      <h4
                        className={`font-bold text-sm leading-snug ${
                          block.completed ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {block.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                          {block.timeRange}
                        </span>
                        <span className="text-[11px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md">
                          {block.type === 'care'
                            ? 'عناية وراحة'
                            : block.type === 'routine'
                            ? 'روتين أسري'
                            : block.type === 'work'
                            ? 'إنجاز منزلي'
                            : 'استرخاء'}
                        </span>
                      </div>
                      {block.notes && (
                        <p className="text-xs text-slate-400 mt-1.5">💡 {block.notes}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBlock(block.id);
                    }}
                    className="text-slate-300 hover:text-rose-600 p-1.5 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Time Block Modal */}
      {isAddBlockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pink-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">إضافة فترة جديدة لروتينكِ</h3>

            <form onSubmit={handleAddBlockSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الفترة أو النشاط *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فنجان قهوة الصباح، قراءة، طبخ الغداء..."
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التوقيت</label>
                  <input
                    type="text"
                    placeholder="مثال: 07:00 - 08:00 ص"
                    value={blockTimeRange}
                    onChange={(e) => setBlockTimeRange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">النوع</label>
                  <select
                    value={blockType}
                    onChange={(e) => setBlockType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none bg-white"
                  >
                    <option value="care">عناية وهدوء</option>
                    <option value="routine">روتين أسري</option>
                    <option value="work">شغل وإنجاز</option>
                    <option value="rest">استرخاء ونوم</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظة (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: بدون هاتف، موسيقى هادئة..."
                  value={blockNotes}
                  onChange={(e) => setBlockNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBlockOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white font-bold shadow-md ${themeConfig.accentBg}`}
                >
                  إضافة الفترة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
