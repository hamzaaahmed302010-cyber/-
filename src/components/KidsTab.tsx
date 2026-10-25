import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Smile,
  Star,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Award,
  Sparkles,
  BookOpen,
  Heart,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { KidProfile, KidTask } from '../types';

interface KidsTabProps {
  kids: KidProfile[];
  onUpdateKids: (kids: KidProfile[]) => void;
}

export const KidsTab: React.FC<KidsTabProps> = ({ kids, onUpdateKids }) => {
  const { themeConfig } = useTheme();
  const [selectedKidId, setSelectedKidId] = useState<string>(kids[0]?.id || '');
  const [isAddKidOpen, setIsAddKidOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // New kid form
  const [newKidName, setNewKidName] = useState('');
  const [newKidGender, setNewKidGender] = useState<'boy' | 'girl'>('boy');
  const [newKidNotes, setNewKidNotes] = useState('');

  // New task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPoints, setTaskPoints] = useState(1);
  const [taskTime, setTaskTime] = useState('صباحاً');

  const currentKid = kids.find((k) => k.id === selectedKidId) || kids[0];

  const handleToggleTask = (taskId: string) => {
    if (!currentKid) return;

    let earnedPoints = 0;
    const updatedTasks = currentKid.tasks.map((t) => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) earnedPoints = t.points;
        return { ...t, completed: nextState };
      }
      return t;
    });

    if (earnedPoints > 0) {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#ec4899', '#3b82f6'],
      });
    }

    const updatedKids = kids.map((k) => {
      if (k.id === currentKid.id) {
        return {
          ...k,
          stars: Math.max(0, k.stars + (earnedPoints > 0 ? earnedPoints : 0)),
          tasks: updatedTasks,
        };
      }
      return k;
    });

    onUpdateKids(updatedKids);
  };

  const handleAwardStar = (delta: number) => {
    if (!currentKid) return;

    if (delta > 0) {
      confetti({
        particleCount: 40,
        spread: 45,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#ec4899'],
      });
    }

    const updated = kids.map((k) => {
      if (k.id === currentKid.id) {
        return { ...k, stars: Math.max(0, k.stars + delta) };
      }
      return k;
    });
    onUpdateKids(updated);
  };

  const handleResetTasksToday = () => {
    if (!currentKid) return;
    const updated = kids.map((k) => {
      if (k.id === currentKid.id) {
        return {
          ...k,
          tasks: k.tasks.map((t) => ({ ...t, completed: false })),
        };
      }
      return k;
    });
    onUpdateKids(updated);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !currentKid) return;

    const newTask: KidTask = {
      id: 'kt_' + Date.now(),
      title: taskTitle.trim(),
      points: taskPoints,
      completed: false,
      time: taskTime,
    };

    const updated = kids.map((k) => {
      if (k.id === currentKid.id) {
        return { ...k, tasks: [...k.tasks, newTask] };
      }
      return k;
    });

    onUpdateKids(updated);
    setTaskTitle('');
    setTaskPoints(1);
    setIsAddTaskOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!currentKid) return;
    const updated = kids.map((k) => {
      if (k.id === currentKid.id) {
        return { ...k, tasks: k.tasks.filter((t) => t.id !== taskId) };
      }
      return k;
    });
    onUpdateKids(updated);
  };

  const handleAddKidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKidName.trim()) return;

    const newProfile: KidProfile = {
      id: 'k_' + Date.now(),
      name: newKidName.trim(),
      gender: newKidGender,
      avatarColor:
        newKidGender === 'girl'
          ? 'from-pink-400 to-rose-500'
          : 'from-blue-400 to-indigo-500',
      stars: 5,
      notes: newKidNotes.trim(),
      tasks: [
        { id: 'kt_1', title: 'صلاة الفجر والظهر في وقتهما', completed: false, points: 2, time: 'صباحاً' },
        { id: 'kt_2', title: 'مذاكرة وحل الواجبات', completed: false, points: 2, time: 'عصراً' },
        { id: 'kt_3', title: 'ترتيب الغرفة والألعاب', completed: false, points: 1, time: 'مساءً' },
        { id: 'kt_4', title: 'تفريش الأسنان وأذكار النوم', completed: false, points: 1, time: 'قبل النوم' },
      ],
    };

    onUpdateKids([...kids, newProfile]);
    setSelectedKidId(newProfile.id);
    setNewKidName('');
    setNewKidNotes('');
    setIsAddKidOpen(false);
  };

  const completedTasksCount = currentKid?.tasks.filter((t) => t.completed).length || 0;
  const totalTasksCount = currentKid?.tasks.length || 0;
  const tasksPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Kids Switcher Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {kids.map((kid) => (
            <button
              key={kid.id}
              onClick={() => setSelectedKidId(kid.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
                currentKid?.id === kid.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="text-base">{kid.gender === 'girl' ? '👧' : '👦'}</span>
              <span>{kid.name}</span>
              <span className="flex items-center gap-0.5 text-amber-300 text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                {kid.stars}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAddKidOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs border border-pink-200 transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة طفل</span>
        </button>
      </div>

      {currentKid && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Kid's Card & Star Rewards */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center relative overflow-hidden">
              <div
                className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${currentKid.avatarColor} mx-auto flex items-center justify-center text-4xl shadow-lg shadow-pink-500/20 mb-3`}
              >
                {currentKid.gender === 'girl' ? '👧' : '👦'}
              </div>

              <h3 className="text-xl font-black text-slate-900">{currentKid.name}</h3>
              <p className="text-xs text-slate-500 mt-1">بطلنا المتميز ونجم البيت 🌟</p>

              {/* Star Count Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 my-5 flex items-center justify-center gap-3">
                <Star className="w-8 h-8 fill-amber-400 text-amber-500 animate-bounce" />
                <div>
                  <span className="text-3xl font-black text-amber-900 block leading-none">
                    {currentKid.stars}
                  </span>
                  <span className="text-xs font-bold text-amber-700">نجمة إنجاز وتشجيع</span>
                </div>
              </div>

              {/* Quick Reward Buttons */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleAwardStar(1)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition"
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>+ نجمة مكافأة!</span>
                </button>
                <button
                  onClick={() => handleAwardStar(-1)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition"
                  title="خصم نجمة"
                >
                  -1
                </button>
              </div>

              {/* Notes */}
              {currentKid.notes && (
                <div className="mt-4 pt-4 border-t border-slate-100 text-right">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">
                    📌 تذكيرات وملاحظات {currentKid.name}:
                  </span>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {currentKid.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Today's Tasks & Routine */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    مهام وروتين اليوم لـ {currentKid.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    أنجز {completedTasksCount} من أصل {totalTasksCount} مهام ({tasksPercent}%)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetTasksToday}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                    title="إعادة ضبط مهام اليوم لتكرارها"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>تكرار ليوم جديد</span>
                  </button>

                  <button
                    onClick={() => setIsAddTaskOpen(true)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white font-bold text-xs shadow-xs transition ${themeConfig.accentBg}`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>مهمة جديدة</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-pink-500 transition-all duration-300"
                  style={{ width: `${tasksPercent}%` }}
                />
              </div>

              {/* Task Items */}
              <div className="space-y-2.5 pt-2">
                {currentKid.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      task.completed
                        ? 'bg-emerald-50/60 border-emerald-200 text-slate-500'
                        : 'bg-white border-slate-200 hover:border-pink-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 text-emerald-600">
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <span
                          className={`font-bold text-xs sm:text-sm block ${
                            task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.time && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {task.time}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />+{task.points}
                      </span>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-300 hover:text-rose-600 p-1 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Kid Modal */}
      {isAddKidOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pink-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">إضافة طفل جديد للمتابعة</h3>

            <form onSubmit={handleAddKidSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الطفل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف، فاطمة..."
                  value={newKidName}
                  onChange={(e) => setNewKidName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">النوع</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewKidGender('boy')}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                      newKidGender === 'boy'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span>👦</span>
                    <span>ولد</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewKidGender('girl')}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                      newKidGender === 'girl'
                        ? 'bg-pink-100 text-pink-700 border border-pink-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span>👧</span>
                    <span>بنت</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ملاحظات أو مواعيد (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: حساسية فراولة، تمرين كاراتيه ثلاثاء وسبت..."
                  value={newKidNotes}
                  onChange={(e) => setNewKidNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddKidOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-white font-bold shadow-md ${themeConfig.accentBg}`}
                >
                  إضافة الطفل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pink-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              إضافة مهمة جديدة لـ {currentKid?.name}
            </h3>

            <form onSubmit={handleAddTaskSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المهمة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قراءة جزء من القصة، ترتيب السرير..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">عدد النجوم (المكافأة)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={taskPoints}
                    onChange={(e) => setTaskPoints(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">توقيت المهمة</label>
                  <select
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none bg-white"
                  >
                    <option value="صباحاً">صباحاً</option>
                    <option value="ظهراً">ظهراً</option>
                    <option value="عصراً">عصراً</option>
                    <option value="مساءً">مساءً</option>
                    <option value="قبل النوم">قبل النوم</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-white font-bold shadow-md ${themeConfig.accentBg}`}
                >
                  إضافة المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
