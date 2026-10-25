import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Clock,
  Sparkles,
  Trash2,
  Edit2,
  Calendar,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { formatArabicDateTime } from '../services/storage';
import type { PantryItem, PantryCategory } from '../types';

interface PantryTabProps {
  pantry: PantryItem[];
  onUpdateItem: (item: PantryItem) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<PantryItem, 'id' | 'lastUpdated'>) => void;
  onMoveToShopping: (item: PantryItem) => void;
}

export const PantryTab: React.FC<PantryTabProps> = ({
  pantry,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onMoveToShopping,
}) => {
  const { themeConfig } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);

  // New item form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PantryCategory>('food');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('كجم');
  const [minThreshold, setMinThreshold] = useState<number>(1);
  const [notes, setNotes] = useState('');

  const categories: Array<{ id: string; label: string; icon: string }> = [
    { id: 'all', label: 'كل الخزين', icon: '📦' },
    { id: 'food', label: 'أطعمة وبقوليات', icon: '🌾' },
    { id: 'fridge', label: 'ثلاجة ومجمدات', icon: '❄️' },
    { id: 'cleaning', label: 'منظفات وغسيل', icon: '🧼' },
    { id: 'personal', label: 'عناية وورقيات', icon: '🧴' },
    { id: 'spices', label: 'بهارات ومشروبات', icon: '☕' },
  ];

  const filteredItems = pantry.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const availableCount = pantry.filter((i) => i.status === 'available').length;
  const lowCount = pantry.filter((i) => i.status === 'low').length;
  const outCount = pantry.filter((i) => i.status === 'out').length;

  const handleQuickQtyChange = (item: PantryItem, delta: number) => {
    const newQty = Math.max(0, Number((item.quantity + delta).toFixed(1)));
    let newStatus = item.status;

    if (newQty === 0) {
      newStatus = 'out';
    } else if (newQty <= item.minThreshold) {
      newStatus = 'low';
    } else {
      newStatus = 'available';
    }

    const updated: PantryItem = {
      ...item,
      quantity: newQty,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    };

    onUpdateItem(updated);

    // If it reached 0, prompt/auto move to shopping
    if (newQty === 0 && item.status !== 'out') {
      onMoveToShopping(updated);
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let computedStatus: 'available' | 'low' | 'out' = 'available';
    if (quantity === 0) computedStatus = 'out';
    else if (quantity <= minThreshold) computedStatus = 'low';

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        name: name.trim(),
        category,
        quantity,
        unit,
        minThreshold,
        status: computedStatus,
        notes: notes.trim(),
        lastUpdated: new Date().toISOString(),
      });
      setEditingItem(null);
    } else {
      onAddItem({
        name: name.trim(),
        category,
        quantity,
        unit,
        minThreshold,
        status: computedStatus,
        notes: notes.trim(),
        defaultRestockQty: quantity || 2,
      });
    }

    // Reset form
    setName('');
    setCategory('food');
    setQuantity(1);
    setUnit('كجم');
    setMinThreshold(1);
    setNotes('');
    setIsAddModalOpen(false);
  };

  const openEditModal = (item: PantryItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setQuantity(item.quantity);
    setUnit(item.unit);
    setMinThreshold(item.minThreshold);
    setNotes(item.notes || '');
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-700">أصناف متوفرة بالبيت</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">{availableCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-700">قاربت على الانتهاء</p>
            <p className="text-2xl font-black text-amber-900 mt-1">{lowCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-700">أصناف نفدت (في المشتريات)</p>
            <p className="text-2xl font-black text-rose-900 mt-1">{outCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls Bar: Search, Category Pills, Add Button */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            <input
              type="text"
              placeholder="ابحثي عن صنف (سكر، أرز، مسحوق غسيل، بهارات...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs sm:text-sm text-slate-800"
            />
          </div>

          <button
            onClick={() => {
              setEditingItem(null);
              setName('');
              setQuantity(1);
              setMinThreshold(1);
              setNotes('');
              setIsAddModalOpen(true);
            }}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer transition ${themeConfig.accentBg}`}
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صنف للخزين</span>
          </button>
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-semibold">الحالة:</span>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'available', label: 'متوفر فقط' },
            { id: 'low', label: 'قارب على الانتهاء' },
            { id: 'out', label: 'نفد / خلص' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedStatus === st.id
                  ? 'bg-pink-100 text-pink-700 border border-pink-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pantry Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">لا توجد أصناف مطابقة للبحث</h3>
          <p className="text-xs text-slate-400 mt-1">
            يمكنكِ إضافة صنف جديد لخزين البيت بسهولة بالضغط على زر "إضافة صنف للخزين" أعلاه.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isAvailable = item.status === 'available';
            const isLow = item.status === 'low';
            const isOut = item.status === 'out';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-5 border shadow-xs transition-all relative flex flex-col justify-between ${
                  isOut
                    ? 'border-rose-200 bg-rose-50/20'
                    : isLow
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200 hover:border-pink-200'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                          {item.name}
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {item.category === 'food'
                          ? 'أطعمة ومؤن'
                          : item.category === 'fridge'
                          ? 'ثلاجة وفريزر'
                          : item.category === 'cleaning'
                          ? 'منظفات وغسيل'
                          : item.category === 'personal'
                          ? 'عناية شخصية'
                          : 'بهارات وتوابل'}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold shrink-0 ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isLow
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {isAvailable ? '✓ متوفر' : isLow ? '⚠️ قارب على الانتهاء' : '✕ خلص / نفد'}
                    </span>
                  </div>

                  {/* Quantity Display & Controls */}
                  <div className="bg-slate-50 rounded-2xl p-3 my-3 flex items-center justify-between border border-slate-100">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">الكمية الحالية:</span>
                      <span className="text-lg font-black text-slate-800">
                        {item.quantity} {item.unit}
                      </span>
                      {item.minThreshold > 0 && (
                        <span className="text-[10px] text-slate-400 block">
                          حد التنبيه: {item.minThreshold} {item.unit}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                      <button
                        onClick={() => handleQuickQtyChange(item, -1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition"
                        title="إنقاص الكمية"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleQuickQtyChange(item, 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition"
                        title="زيادة الكمية"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-500 bg-white/80 p-2 rounded-xl border border-slate-100 mb-3">
                      💡 {item.notes}
                    </p>
                  )}
                </div>

                {/* Card Footer: Timestamp & Action Buttons */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      تحديث: {formatArabicDateTime(item.lastUpdated)}
                    </span>
                    {item.lastPurchasedAt && (
                      <span className="flex items-center gap-1" title="تاريخ آخر شراء">
                        <Calendar className="w-3 h-3 text-emerald-500" />
                        آخر شراء: {formatArabicDateTime(item.lastPurchasedAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {/* One-click move to shopping list button */}
                    <button
                      onClick={() => {
                        const updated: PantryItem = {
                          ...item,
                          quantity: 0,
                          status: 'out',
                          lastUpdated: new Date().toISOString(),
                        };
                        onUpdateItem(updated);
                        onMoveToShopping(updated);
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition ${
                        isOut
                          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{isOut ? 'موجود في المشتريات' : 'خلص؟ انقله للمشتريات'}</span>
                    </button>

                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
                      title="تعديل الصنف"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`هل أنتِ متأكدة من حذف "${item.name}" من خزين البيت؟`)) {
                          onDeleteItem(item.id);
                        }
                      }}
                      className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="حذف الصنف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-pink-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              {editingItem ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد لخزين البيت'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الصنف *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: زيت زيتون بكر، صابون سائل، دقيق فاخر..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التصنيف</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PantryCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none bg-white"
                  >
                    <option value="food">أطعمة ومؤن جافة</option>
                    <option value="fridge">ثلاجة ومجمدات</option>
                    <option value="cleaning">منظفات وغسيل</option>
                    <option value="personal">عناية شخصية وورقيات</option>
                    <option value="spices">بهارات ومشروبات</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">وحدة القياس</label>
                  <input
                    type="text"
                    value={unit}
                    placeholder="كجم، لتر، كيس، عبوة، قطعة"
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الكمية الحالية</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    حد التنبيه (لما يوصل له ينبهك)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات أو مكان التخزين (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: في الرف السفلي للمطبخ، يفضل الشراء من العطار..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-white font-bold shadow-md hover:opacity-95 ${themeConfig.accentBg}`}
                >
                  {editingItem ? 'حفظ التعديلات' : 'إضافة الصنف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
