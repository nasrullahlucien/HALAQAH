import React from 'react';
import { LayoutDashboard, Table, ArrowLeftRight, CheckSquare, Users, BookOpen } from 'lucide-react';

export type TabType = 'dashboard' | 'matrix' | 'transactions' | 'attendance' | 'amanah' | 'members';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  overdueCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  overdueCount
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'สรุปภาพรวม', icon: LayoutDashboard },
    { id: 'matrix' as TabType, label: 'ตารางเงิน', icon: Table, badge: overdueCount > 0 ? overdueCount : undefined },
    { id: 'transactions' as TabType, label: 'รับ-จ่าย', icon: ArrowLeftRight },
    { id: 'attendance' as TabType, label: 'เช็คชื่อ', icon: CheckSquare },
    { id: 'amanah' as TabType, label: 'อามานะฮ์', icon: BookOpen },
    { id: 'members' as TabType, label: 'สมาชิก', icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe shadow-lg">
      <div className="max-w-lg mx-auto grid grid-cols-6 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 transition-all duration-200 ${
                isActive
                  ? 'text-emerald-600 font-semibold scale-105'
                  : 'text-slate-500 hover:text-slate-700 font-normal'
              }`}
            >
              <div className="relative">
                <Icon size={19} className={isActive ? 'stroke-[2.3]' : 'stroke-2'} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1 py-0.2 rounded-full min-w-3.5 text-center leading-tight shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-tight tracking-tight truncate max-w-[54px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-4 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
