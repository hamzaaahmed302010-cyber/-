import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header, type ActiveTab } from './components/Header';
import { PantryTab } from './components/PantryTab';
import { ShoppingTab } from './components/ShoppingTab';
import { BudgetTab } from './components/BudgetTab';
import { KidsTab } from './components/KidsTab';
import { MyTimeTab } from './components/MyTimeTab';
import { PrayerTab } from './components/PrayerTab';
import { HabitsTab } from './components/HabitsTab';
import { DiaryTab } from './components/DiaryTab';
import { DriveBackupModal } from './components/DriveBackupModal';
import { loadAppData, saveAppData, getTodayKey } from './services/storage';
import type {
  AppData,
  PantryItem,
  ShoppingItem,
  BudgetConfig,
  KidProfile,
  MomSchedule,
  DailyPrayers,
  HabitItem,
  DiaryEntry,
  ThemeId,
} from './types';

function MainApp() {
  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('pantry');
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Sync to local storage on every state change
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // Compute counts for badges
  const lowOrOutPantryCount = appData.pantry.filter(
    (i) => i.status === 'low' || i.status === 'out'
  ).length;
  const pendingShoppingCount = appData.shoppingList.filter((i) => !i.isBought).length;

  // --- Pantry Handlers ---
  const handleUpdatePantryItem = (updatedItem: PantryItem) => {
    setAppData((prev) => ({
      ...prev,
      pantry: prev.pantry.map((p) => (p.id === updatedItem.id ? updatedItem : p)),
    }));
  };

  const handleDeletePantryItem = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      pantry: prev.pantry.filter((p) => p.id !== id),
    }));
  };

  const handleAddPantryItem = (itemData: Omit<PantryItem, 'id' | 'lastUpdated'>) => {
    const newItem: PantryItem = {
      ...itemData,
      id: 'p_' + Date.now(),
      lastUpdated: new Date().toISOString(),
    };
    setAppData((prev) => ({
      ...prev,
      pantry: [newItem, ...prev.pantry],
    }));
  };

  /**
   * When an item in pantry runs out or user clicks "Move to shopping",
   * it automatically creates or reactivates the shopping item!
   */
  const handleMoveToShopping = (pantryItem: PantryItem) => {
    setAppData((prev) => {
      // Check if already in shopping list
      const existing = prev.shoppingList.find((s) => s.pantryItemId === pantryItem.id);
      if (existing) {
        return {
          ...prev,
          shoppingList: prev.shoppingList.map((s) =>
            s.id === existing.id
              ? {
                  ...s,
                  isBought: false,
                  quantity: s.quantity || pantryItem.defaultRestockQty || 2,
                  addedAt: new Date().toISOString(),
                }
              : s
          ),
        };
      }

      const newShoppingItem: ShoppingItem = {
        id: 's_' + Date.now(),
        pantryItemId: pantryItem.id,
        name: pantryItem.name,
        category: pantryItem.category,
        quantity: pantryItem.defaultRestockQty || 2,
        unit: pantryItem.unit,
        isBought: false,
        addedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        shoppingList: [newShoppingItem, ...prev.shoppingList],
      };
    });
  };

  // --- Shopping Handlers ---
  /**
   * User marks item as bought:
   * 1. Marks shopping item as bought with timestamp
   * 2. Automatically restores pantry item to 'available', sets quantity to restockQty, updates lastPurchasedAt & lastUpdated
   * 3. Optionally deducts actual price from Budget expenses automatically!
   */
  const handleMarkAsBought = (
    shoppingItem: ShoppingItem,
    restockQty: number,
    cost?: number,
    deductFromBudget?: boolean
  ) => {
    const nowIso = new Date().toISOString();
    const today = getTodayKey();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setAppData((prev) => {
      // 1. Update shopping list
      const updatedShoppingList = prev.shoppingList.map((s) =>
        s.id === shoppingItem.id ? { ...s, isBought: true, boughtAt: nowIso } : s
      );

      // 2. Return to pantry as "متوفر"
      let updatedPantry = [...prev.pantry];
      if (shoppingItem.pantryItemId) {
        updatedPantry = updatedPantry.map((p) => {
          if (p.id === shoppingItem.pantryItemId) {
            return {
              ...p,
              quantity: restockQty,
              status: 'available',
              lastUpdated: nowIso,
              lastPurchasedAt: nowIso,
            };
          }
          return p;
        });
      } else {
        // Find by name if pantryItemId wasn't explicitly set
        const existingPantry = updatedPantry.find(
          (p) => p.name.trim().toLowerCase() === shoppingItem.name.trim().toLowerCase()
        );
        if (existingPantry) {
          updatedPantry = updatedPantry.map((p) =>
            p.id === existingPantry.id
              ? {
                  ...p,
                  quantity: restockQty,
                  status: 'available',
                  lastUpdated: nowIso,
                  lastPurchasedAt: nowIso,
                }
              : p
          );
        } else {
          // Create new pantry item
          const newPantryItem: PantryItem = {
            id: 'p_' + Date.now(),
            name: shoppingItem.name,
            category: shoppingItem.category,
            quantity: restockQty,
            unit: shoppingItem.unit,
            minThreshold: 1,
            status: 'available',
            lastUpdated: nowIso,
            lastPurchasedAt: nowIso,
          };
          updatedPantry.unshift(newPantryItem);
        }
      }

      // 3. Deduct from budget if requested
      let updatedBudget = { ...prev.budget };
      if (deductFromBudget && cost && cost > 0) {
        const newExpense = {
          id: 'e_' + Date.now(),
          amount: cost,
          category: 'pantry' as const,
          description: `شراء: ${shoppingItem.name} (${restockQty} ${shoppingItem.unit})`,
          date: today,
          time: timeStr,
          paymentMethod: 'cash' as const,
        };
        updatedBudget = {
          ...updatedBudget,
          expenses: [newExpense, ...(updatedBudget.expenses || [])],
        };
      }

      return {
        ...prev,
        shoppingList: updatedShoppingList,
        pantry: updatedPantry,
        budget: updatedBudget,
      };
    });
  };

  const handleDeleteShoppingItem = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      shoppingList: prev.shoppingList.filter((s) => s.id !== id),
    }));
  };

  const handleAddShoppingItem = (
    itemData: Omit<ShoppingItem, 'id' | 'addedAt' | 'isBought'>
  ) => {
    const newItem: ShoppingItem = {
      ...itemData,
      id: 's_' + Date.now(),
      addedAt: new Date().toISOString(),
      isBought: false,
    };
    setAppData((prev) => ({
      ...prev,
      shoppingList: [newItem, ...prev.shoppingList],
    }));
  };

  // --- Budget Handlers ---
  const handleUpdateBudget = (newBudget: BudgetConfig) => {
    setAppData((prev) => ({
      ...prev,
      budget: newBudget,
    }));
  };

  const handleAddExpense = (expenseData: any) => {
    const newExpense = {
      ...expenseData,
      id: 'e_' + Date.now(),
    };
    setAppData((prev) => ({
      ...prev,
      budget: {
        ...prev.budget,
        expenses: [newExpense, ...(prev.budget.expenses || [])],
      },
    }));
  };

  const handleDeleteExpense = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      budget: {
        ...prev.budget,
        expenses: (prev.budget.expenses || []).filter((e) => e.id !== id),
      },
    }));
  };

  // --- Kids Handlers ---
  const handleUpdateKids = (updatedKids: KidProfile[]) => {
    setAppData((prev) => ({
      ...prev,
      kids: updatedKids,
    }));
  };

  // --- Schedule Handlers ---
  const handleUpdateSchedule = (updatedSchedule: MomSchedule) => {
    setAppData((prev) => ({
      ...prev,
      momSchedule: updatedSchedule,
    }));
  };

  // --- Prayer Handlers ---
  const handleUpdatePrayers = (updatedHistory: Record<string, DailyPrayers>) => {
    setAppData((prev) => ({
      ...prev,
      prayerHistory: updatedHistory,
    }));
  };

  // --- Habits Handlers ---
  const handleUpdateHabits = (updatedHabits: HabitItem[]) => {
    setAppData((prev) => ({
      ...prev,
      habits: updatedHabits,
    }));
  };

  // --- Diary Handlers ---
  const handleAddDiaryEntry = (entryData: Omit<DiaryEntry, 'id'>) => {
    const newEntry: DiaryEntry = {
      ...entryData,
      id: 'd_' + Date.now(),
    };
    setAppData((prev) => ({
      ...prev,
      diary: [newEntry, ...prev.diary],
    }));
  };

  const handleDeleteDiaryEntry = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      diary: prev.diary.filter((d) => d.id !== id),
    }));
  };

  // --- Drive Handlers ---
  const handleRestoreData = (restored: AppData) => {
    setAppData(restored);
  };

  const handleBackupSuccess = (backupTime: string) => {
    setAppData((prev) => ({
      ...prev,
      lastBackupDate: backupTime,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 pb-20 selection:bg-pink-200 selection:text-pink-900">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        shoppingCount={pendingShoppingCount}
        lowPantryCount={lowOrOutPantryCount}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        lastBackupDate={appData.lastBackupDate}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'pantry' && (
          <PantryTab
            pantry={appData.pantry}
            onUpdateItem={handleUpdatePantryItem}
            onDeleteItem={handleDeletePantryItem}
            onAddItem={handleAddPantryItem}
            onMoveToShopping={handleMoveToShopping}
          />
        )}

        {activeTab === 'shopping' && (
          <ShoppingTab
            shoppingList={appData.shoppingList}
            onMarkAsBought={handleMarkAsBought}
            onDeleteItem={handleDeleteShoppingItem}
            onAddShoppingItem={handleAddShoppingItem}
            pantry={appData.pantry}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetTab
            budget={appData.budget}
            onUpdateBudget={handleUpdateBudget}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'kids' && (
          <KidsTab kids={appData.kids} onUpdateKids={handleUpdateKids} />
        )}

        {activeTab === 'mytime' && (
          <MyTimeTab
            schedule={appData.momSchedule}
            onUpdateSchedule={handleUpdateSchedule}
          />
        )}

        {activeTab === 'prayer' && (
          <PrayerTab
            prayerHistory={appData.prayerHistory}
            onUpdatePrayers={handleUpdatePrayers}
          />
        )}

        {activeTab === 'habits' && (
          <HabitsTab
            habits={appData.habits}
            onUpdateHabits={handleUpdateHabits}
          />
        )}

        {activeTab === 'diary' && (
          <DiaryTab
            diary={appData.diary}
            onAddDiaryEntry={handleAddDiaryEntry}
            onDeleteDiaryEntry={handleDeleteDiaryEntry}
          />
        )}
      </main>

      {/* Google Drive Backup & Restore Modal */}
      <DriveBackupModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        appData={appData}
        onRestoreData={handleRestoreData}
        onBackupSuccess={handleBackupSuccess}
      />
    </div>
  );
}

export default function App() {
  const initialTheme = (loadAppData().theme as ThemeId) || 'pink-purple';

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <MainApp />
    </ThemeProvider>
  );
}
