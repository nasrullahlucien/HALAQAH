import React from 'react';
import { RefreshCw, ShieldCheck, ShieldAlert, Settings, WifiOff } from 'lucide-react';

interface HeaderProps {
  groupName: string;
  isAdmin: boolean;
  isOffline: boolean;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenAdminModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  groupName,
  isAdmin,
  isOffline,
  isLoading,
  onRefresh,
  onOpenAdminModal,
  onOpenSettingsModal
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-emerald-200">
            ห
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight flex items-center gap-1.5">
              <span>{groupName || 'บันทึกหะละเกาะฮฺ'}</span>
              {isOffline && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200" title="โหมดออฟไลน์ / ข้อมูลแคช">
                  <WifiOff size={11} /> ออฟไลน์
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500">ระบบบันทึกการเงินและการเข้าพบ</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* ปุ่ม Refresh ข้อมูล */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors active:scale-95 disabled:opacity-50"
            title="รีเฟรชข้อมูล"
            aria-label="รีเฟรชข้อมูล"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin text-emerald-600' : ''} />
          </button>

          {/* ปุ่มตั้งค่า URL API */}
          <button
            onClick={onOpenSettingsModal}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors active:scale-95"
            title="ตั้งค่าการเชื่อมต่อ Google Sheets"
            aria-label="ตั้งค่าการเชื่อมต่อ"
          >
            <Settings size={18} />
          </button>

          {/* ปุ่มโหมดผู้ดูแล */}
          <button
            onClick={onOpenAdminModal}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 ${
              isAdmin
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isAdmin ? (
              <>
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>เหรัญญิก</span>
              </>
            ) : (
              <>
                <ShieldAlert size={14} className="text-slate-400" />
                <span>สมาชิก</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
