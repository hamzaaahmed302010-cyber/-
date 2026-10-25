import React, { useState } from 'react';
import {
  Wallet,
  PiggyBank,
  TrendingDown,
  Plus,
  Trash2,
  PieChart,
  Calendar,
  Clock,
  CreditCard,
  Banknote,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getTodayKey, formatArabicDateTime } from '../services/storage';
import type { BudgetConfig, ExpenseRecord, ExpenseCategory } from '../types';

interface BudgetTabProps {
  budget: BudgetConfig;
  onUpdateBudget: (newBudget: BudgetConfig) => void;
  onAddExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({
  budget,
  onUpdateBudget,
  onAddExpense,
  onDeleteExpense,
}) => {
  const { themeConfig } = useTheme();
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  // New expense form
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<ExpenseCategory>('pantry');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [expenseDate, setExpenseDate] = useState(getTodayKey());

  // Category Arabic labels and icons
  const categoryMeta: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
    pantry: { label: 'خزين وطعام ومؤن', icon: '🥘', color: 'bg-emerald-500' },
    bills: { label: 'فواتير والتزامات', icon: '⚡', color: 'bg-blue-500' },
    kids: { label: 'مصاريف الأولاد والتعليم', icon: '👶', color: 'bg-purple-500' },
    home: { label: 'مستلزمات وصيانة المنزل', icon: '🏡', color: 'bg-amber-500' },
    personal: { label: 'عناية ومصاريف شخصية', icon: '🌸', color: 'bg-pink-500' },
    health: { label: 'صحة وعلاج وأدوية', icon: '💊', color: 'bg-teal-500' },
    other: { label: 'طوارئ ومصاريف أخرى', icon: '📦', color: 'bg-slate-500' },
  };

  // Calculations
  const totalIncome = budget.totalIncome || 0;
  const savingsTarget = budget.savingsTarget || 0;
  const totalExpenses = (budget.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);

  // Remaining balance automatically deducted!
  const remainingBalance = totalIncome - savingsTarget - totalExpenses;
  const spentPercentage = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0;
  const savingsPercentage = totalIncome > 0 ? Math.round((savingsTarget / totalIncome) * 100) : 0;

  // Expenses per category
  const categoryTotals: Record<ExpenseCategory, number> = {
    pantry: 0,
    bills: 0,
    kids: 0,
    home: 0,
    personal: 0,
    health: 0,
    other: 0,
  };

  (budget.expenses || []).forEach((e) => {
    if (categoryTotals[e.category] !== undefined) {
      categoryTotals[e.category] += e.amount;
    }
  });

  const handleIncomeChange = (val: number) => {
    const newSavings = Math.round((val * (budget.savingsPercent || 20)) / 100);
    onUpdateBudget({
      ...budget,
      totalIncome: val,
      savingsTarget: newSavings,
    });
  };

  const handleSavingsPercentChange = (percent: number) => {
    const newSavings = Math.round((totalIncome * percent) / 100);
    onUpdateBudget({
      ...budget,
      savingsPercent: percent,
      savingsTarget: newSavings,
    });
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0 || !description.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onAddExpense({
      amount: Number(amount),
      category,
      description: description.trim(),
      date: expenseDate || getTodayKey(),
      time: timeStr,
      paymentMethod,
    });

    setAmount('');
    setDescription('');
    setIsAddExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Income, Savings & Real-Time Remaining Balance */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">
              إدارة الدخل والميزانية الشهرية
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
              حساب الميزانية والاقتطاع التلقائي
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              اكتبي دخلكِ، وحددي نسبة الادخار، وأي مصروف تضيفينه يُخصم فوراً وتلقائياً من المتبقي.
            </p>
          </div>

          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer transition ${themeConfig.accentBg}`}
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مصروف جديد</span>
          </button>
        </div>

        {/* 4 Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Income */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>إجمالي الدخل</span>
              <Wallet className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="my-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={totalIncome || ''}
                  onChange={(e) => handleIncomeChange(Number(e.target.value))}
                  className="text-2xl font-black text-slate-900 bg-transparent border-b-2 border-indigo-300 focus:border-indigo-600 focus:outline-none w-32"
                  placeholder="0"
                />
                <span className="text-sm font-bold text-slate-500">ج.م</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400">انقري لتعديل إجمالي الدخل</span>
          </div>

          {/* 2. Savings Allocated */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-purple-700 text-xs font-bold">
              <span>الادخار المقتطع ({budget.savingsPercent || 20}%)</span>
              <PiggyBank className="w-4 h-4 text-purple-600" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-purple-900">
                {savingsTarget.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-purple-600 mr-1.5">ج.م</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] text-purple-700 font-semibold">نسبة الادخار:</span>
              <div className="flex gap-1">
                {[10, 15, 20, 25, 30].map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSavingsPercentChange(p)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                      budget.savingsPercent === p
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    %{p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Total Expenses Spent */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-700 text-xs font-bold">
              <span>إجمالي المصروفات المنفقة</span>
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </div>
            <div className="my-2">
              <span className="text-2xl font-black text-rose-900">
                {totalExpenses.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-rose-600 mr-1.5">ج.م</span>
            </div>
            <span className="text-[11px] text-rose-600 font-bold">
              استهلكتِ {spentPercentage}% من إجمالي الدخل
            </span>
          </div>

          {/* 4. Net Remaining Balance (Auto Deducted) */}
          <div
            className={`border rounded-2xl p-4 flex flex-col justify-between ${
              remainingBalance < 0
                ? 'bg-rose-100/70 border-rose-300 text-rose-900'
                : remainingBalance < totalIncome * 0.15
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span>المتبقي الفعلي المتاح</span>
              {remainingBalance < 0 ? (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div className="my-2">
              <span className="text-2xl font-black">
                {remainingBalance.toLocaleString()}
              </span>
              <span className="text-sm font-bold mr-1.5">ج.م</span>
            </div>
            <span className="text-[11px] font-bold">
              {remainingBalance < 0
                ? '⚠️ تم تجاوز الميزانية بمقدار ' + Math.abs(remainingBalance) + ' ج.م'
                : '✓ رصيد متاح للصرف بسلام وأمان'}
            </span>
          </div>
        </div>
      </div>

      {/* Category Allocations & Progress Bars */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <PieChart className="w-4 h-4 text-pink-600" />
          توزيع المصروفات حسب الأقسام
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(categoryMeta) as ExpenseCategory[]).map((catKey) => {
            const meta = categoryMeta[catKey];
            const spent = categoryTotals[catKey] || 0;
            const targetAlloc = budget.categoryAllocations?.[catKey] || 1000;
            const percentOfCat = targetAlloc > 0 ? Math.min(100, Math.round((spent / targetAlloc) * 100)) : 0;

            return (
              <div
                key={catKey}
                className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </span>
                    <span className="text-xs font-black text-slate-700">
                      {spent.toLocaleString()} ج.م
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden my-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        percentOfCat >= 100
                          ? 'bg-rose-500'
                          : percentOfCat > 75
                          ? 'bg-amber-500'
                          : 'bg-pink-500'
                      }`}
                      style={{ width: `${percentOfCat}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>المخصص المقترح: {targetAlloc.toLocaleString()} ج.م</span>
                  <span className="font-bold text-slate-600">%{percentOfCat}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses Log History */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            سجل المصروفات المخصومة (تاريخ ووقت كل عملية)
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {budget.expenses?.length || 0} عملية مسجلة
          </span>
        </div>

        {(!budget.expenses || budget.expenses.length === 0) ? (
          <p className="text-center text-xs text-slate-400 py-6">
            لا توجد مصروفات مسجلة بعد. عند إضافة أي مصروف سيتم خصمه تلقائياً وتسجيل وقته هنا.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {budget.expenses.map((expense) => {
              const meta = categoryMeta[expense.category] || categoryMeta.other;

              return (
                <div
                  key={expense.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm hover:bg-slate-50/50 rounded-xl px-2 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-base">
                      {meta.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 leading-tight">
                        {expense.description}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-slate-600 font-semibold">{meta.label}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {expense.date} {expense.time}
                        </span>
                        <span>•</span>
                        <span className="text-slate-500">
                          {expense.paymentMethod === 'cash'
                            ? 'نقداً (كاش)'
                            : expense.paymentMethod === 'card'
                            ? 'بطاقة / فيزا'
                            : 'تحويل'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-rose-600 shrink-0">
                      -{expense.amount.toLocaleString()} ج.م
                    </span>
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      title="حذف هذا المصروف وإعادته للرصيد"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pink-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              تسجيل مصروف جديد (خصم تلقائي)
            </h3>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">المبلغ (ج.م) *</label>
                <input
                  type="number"
                  step="any"
                  min="0.5"
                  required
                  placeholder="مثال: 150"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none text-base font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التصنيف *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none bg-white font-medium"
                >
                  {(Object.keys(categoryMeta) as ExpenseCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryMeta[cat].icon} {categoryMeta[cat].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الوصف أو البيان *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: لحوم ودواجن، صيدلية، كتب المدرسة..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة الدفع</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none bg-white"
                  >
                    <option value="cash">نقداً (كاش)</option>
                    <option value="card">بطاقة / فيزا</option>
                    <option value="transfer">تحويل محفظة / بنك</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">التاريخ</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-white font-bold shadow-md ${themeConfig.accentBg}`}
                >
                  خصم وتسجيل المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
