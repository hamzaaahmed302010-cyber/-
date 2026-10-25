import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ShoppingCart,
  CheckCircle2,
  Plus,
  Trash2,
  DollarSign,
  Clock,
  ArrowRight,
  PackageCheck,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { formatArabicDateTime } from '../services/storage';
import type { ShoppingItem, PantryItem, PantryCategory } from '../types';

interface ShoppingTabProps {
  shoppingList: ShoppingItem[];
  onMarkAsBought: (
    item: ShoppingItem,
    restockQty: number,
    cost?: number,
    deductFromBudget?: boolean
  ) => void;
  onDeleteItem: (id: string) => void;
  onAddShoppingItem: (item: Omit<ShoppingItem, 'id' | 'addedAt' | 'isBought'>) => void;
  pantry: PantryItem[];
}

export const ShoppingTab: React.FC<ShoppingTabProps> = ({
  shoppingList,
  onMarkAsBought,
  onDeleteItem,
  onAddShoppingItem,
  pantry,
}) => {
  const { themeConfig } = useTheme();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [buyingItem, setBuyingItem] = useState<ShoppingItem | null>(null);

  // Form states for adding new custom shopping item
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PantryCategory>('food');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('كجم');
  const [estimatedPrice, setEstimatedPrice] = useState<number | undefined>(undefined);

  // Buy completion dialog states
  const [restockQty, setRestockQty] = useState<number>(2);
  const [actualCost, setActualCost] = useState<number>(0);
  const [deductFromBudget, setDeductFromBudget] = useState(true);

  const pendingItems = shoppingList.filter((i) => !i.isBought);
  const boughtItems = shoppingList.filter((i) => i.isBought);

  const totalEstimatedCost = pendingItems.reduce(
    (sum, i) => sum + (i.estimatedPrice || 0) * (i.quantity || 1),
    0
  );

  const handleOpenBuyDialog = (item: ShoppingItem) => {
    // Find linked pantry item if any to get suggested restock quantity
    const linkedPantry = pantry.find((p) => p.id === item.pantryItemId);
    const suggestedQty = linkedPantry?.defaultRestockQty || (item.quantity > 0 ? item.quantity : 2);

    setBuyingItem(item);
    setRestockQty(suggestedQty);
    setActualCost(item.estimatedPrice ? item.estimatedPrice * (item.quantity || 1) : 0);
    setDeductFromBudget(true);
  };

  const handleConfirmPurchase = () => {
    if (!buyingItem) return;

    // Trigger joyful confetti
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#ec4899', '#8b5cf6', '#10b981', '#f59e0b'],
    });

    onMarkAsBought(
      buyingItem,
      restockQty,
      actualCost > 0 ? actualCost : undefined,
      deductFromBudget
    );
    setBuyingItem(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddShoppingItem({
      name: name.trim(),
      category,
      quantity,
      unit,
      estimatedPrice: estimatedPrice && estimatedPrice > 0 ? estimatedPrice : undefined,
    });

    setName('');
    setCategory('food');
    setQuantity(1);
    setUnit('كجم');
    setEstimatedPrice(undefined);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview & Total Cost Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 block mb-1">
            قائمة النواقص ومشتريات البيت
          </span>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-800">
              {pendingItems.length} صنف بانتظار الشراء
            </h2>
            {totalEstimatedCost > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-pink-100 text-pink-700 border border-pink-200">
                التكلفة التقديرية: {totalEstimatedCost.toLocaleString()} ج.م
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            الأصناف التي تنفد من الخزين تصل تلقائياً هنا، وبمجرد الضغط على "تم الشراء" تعود للخزين بحالة "متوفر".
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer transition ${themeConfig.accentBg}`}
        >
          <Plus className="w-4 h-4" />
          <span>إضافة طلب للمشتريات</span>
        </button>
      </div>

      {/* Pending Items List */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-pink-600" />
          النواقص المطلوب شراؤها ({pendingItems.length})
        </h3>

        {pendingItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200">
            <PackageCheck className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 text-sm">كل خزين البيت متوفر ومكتمل! 🎉</h4>
            <p className="text-xs text-slate-400 mt-1">
              لا توجد نواقص حالياً. عندما يفرغ أي صنف من الخزين سيظهر هنا مباشرة لتسوقه.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingItems.map((item) => {
              const linkedPantry = pantry.find((p) => p.id === item.pantryItemId);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-pink-300 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base leading-snug">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                          الكمية المطلوبة: {item.quantity} {item.unit}
                        </span>
                        {item.estimatedPrice && item.estimatedPrice > 0 && (
                          <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-lg">
                            ~{item.estimatedPrice} ج.م
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                      title="حذف من المشتريات"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      أضيف: {formatArabicDateTime(item.addedAt)}
                    </span>

                    {/* Bought button with return to pantry */}
                    <button
                      onClick={() => handleOpenBuyDialog(item)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تم الشراء / جبته!</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recently Bought History */}
      {boughtItems.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-600 text-xs flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              أصناف تم شراؤها وعادت للخزين كـ "متوفر" ({boughtItems.length})
            </h3>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 max-h-56 overflow-y-auto">
            {boughtItems.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-800">{item.name}</span>
                  <span className="text-slate-400">({item.quantity} {item.unit})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400">
                    تم الشراء: {formatArabicDateTime(item.boughtAt)}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    عاد للخزين متوفر ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Confirm Buying & Restocking into Pantry */}
      {buyingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-800 text-center">
              مبروك! تم شراء {buyingItem.name} 🛍️
            </h3>
            <p className="text-xs text-slate-500 text-center">
              سيتم إعادة هذا الصنف إلى خزين البيت بحالة <strong className="text-emerald-700">"متوفر"</strong> وتحديث تاريخ الشراء الآن.
            </p>

            <div className="space-y-3 pt-2 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  الكمية التي تم شراؤها وإضافتها للخزين ({buyingItem.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.5"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المبلغ المدفوع الفعلي (ج.م)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="مثال: 75"
                  value={actualCost || ''}
                  onChange={(e) => setActualCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 p-3 bg-pink-50 border border-pink-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={deductFromBudget}
                  onChange={(e) => setDeductFromBudget(e.target.checked)}
                  className="w-4 h-4 text-pink-600 rounded-sm focus:ring-pink-500"
                />
                <span className="text-xs font-bold text-pink-900">
                  خصم هذا المبلغ تلقائياً من الميزانية والمصروفات الآن 💰
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBuyingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
              >
                تأكيد وإعادة للخزين
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Standalone Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pink-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">إضافة طلب لقائمة المشتريات</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الصنف المطلوب *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: زيت زيتون، صابون يد، حليب..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الكمية المطلوبة</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الوحدة</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">السعر التقديري (اختياري)</label>
                <input
                  type="number"
                  placeholder="مثال: 50"
                  value={estimatedPrice || ''}
                  onChange={(e) => setEstimatedPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                />
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
                  إضافة للقائمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
