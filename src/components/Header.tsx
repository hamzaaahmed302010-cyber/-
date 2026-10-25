import React, { useState } from 'react';
import {
  Cloud,
  Palette,
  Package,
  ShoppingCart,
  Wallet,
  Smile,
  Clock,
  CheckSquare,
  BookHeart,
  ChevronDown,
} from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';
import type { ThemeId } from '../types';

export type ActiveTab =
  | 'pantry'
  | 'shopping'
  | 'budget'
  | 'kids'
  | 'mytime'
  | 'prayer'
  | 'habits'
  | 'diary';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  shoppingCount: number;
  lowPantryCount: number;
  onOpenDriveModal: () => void;
  lastBackupDate: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  shoppingCount,
  lowPantryCount,
  onOpenDriveModal,
  lastBackupDate,
}) => {
  const { theme, setTheme, themeConfig } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const tabs: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }> = [
    { id: 'pantry', label: 'خزين البيت', icon: Package, badge: lowPantryCount, badgeColor: 'bg-amber-500' },
    { id: 'shopping', label: 'المشتريات', icon: ShoppingCart, badge: shoppingCount, badgeColor: 'bg-rose-500' },
    { id: 'budget', label: 'الميزانية', icon: Wallet },
    { id: 'kids', label: 'الأولاد', icon: Smile },
    { id: 'mytime', label: 'وقتي أنا', icon: Clock },
    { id: 'prayer', label: 'صلاتي', icon: BookHeart },
    { id: 'habits', label: 'العادات', icon: CheckSquare },
    { id: 'diary', label: 'حالتي ومذكراتي', icon: BookHeart },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top bar with Branding, Themes, Drive */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl ${themeConfig.accentBg} flex items-center justify-center text-white shadow-md shadow-pink-500/20`}
            >
              <span className="text-xl">🌸</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                بيتي وحياتي
              </h1>
              <p className="text-xs font-medium text-slate-500">
                مملكتكِ المنظمة: الخزين، الميزانية، الأولاد، صلاتكِ ويومياتك
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Color Palette Selector */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-slate-700 transition"
                title="تغيير ألوان التطبيق"
              >
                <Palette className="w-4 h-4 text-pink-600" />
                <span className="hidden sm:inline">{themeConfig.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showThemeMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowThemeMenu(false)}
                  />
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-right animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase">
                      اختاري ألوانكِ المفضلة
                    </div>
                    {Object.values(THEMES).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id as ThemeId);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-right ${
                          theme === t.id
                            ? 'bg-pink-50 text-pink-700 border border-pink-200'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full"
                            style={{ backgroundColor: t.primaryColor }}
                          />
                          <span>{t.name}</span>
                        </div>
                        {theme === t.id && (
                          <span className="text-[11px] font-extrabold text-pink-600">✓ الحالي</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Google Drive Sync Button */}
            <button
              onClick={onOpenDriveModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/60 shadow-xs transition"
            >
              <Cloud className="w-4 h-4 text-indigo-600" />
              <span>جوجل درايف</span>
              {lastBackupDate && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="يوجد حفظ" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1.5 pt-2.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? themeConfig.activeTab
                    : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold rounded-full text-white ${
                      isActive ? 'bg-white/30 text-white' : tab.badgeColor || 'bg-rose-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
