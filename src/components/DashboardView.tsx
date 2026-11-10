import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Calendar,
  CheckCircle,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  CalendarPlus
} from 'lucide-react';
import { AppData, GroupFinancialSummary } from '../types';
import { formatCurrency, formatThaiDate } from '../utils/calculations';
import { TabType } from './BottomNav';

interface DashboardViewProps {
  data: AppData;
  summary: GroupFinancialSummary;
  isAdmin: boolean;
  onNavigateTab: (tab: TabType) => void;
  onOpenSessionModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  summary,
  isAdmin,
  onNavigateTab,
  onOpenSessionModal
}) => {
  // งวดล่าสุด หรือนัดหมายครั้งถัดไป
  const latestSession = data.sessions.length > 0 
    ? data.sessions[data.sessions.length - 1]
    : null;

  // รวมรายการเคลื่อนไหว 5 รายการล่าสุด (รับ และ จ่าย)
  const combinedActivities = [
    ...data.payments.map(p => {
      const member = data.members.find(m => m.member_id === p.member_id);
      return {
        id: p.payment_id,
        type: 'income' as const,
        date: p.date,
        title: `รับเงินจาก ${member?.name || p.member_id}`,
        subtext: p.note || 'ชำระเงินหะละเกาะฮฺ',
        amount: p.amount,
        createdAt: p.created_at || p.date
      };
    }),
    ...data.expenses.map(e => ({
      id: e.expense_id,
      type: 'expense' as const,
      date: e.date,
      title: e.item,
      subtext: `${e.category} (${e.expense_type === 'communal' ? 'ส่วนกลาง' : 'เฉพาะคน'})`,
      amount: e.amount,
      createdAt: e.created_at || e.date
    }))
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="space-y-4 pb-20">
      {/* 1. การ์ดยอดคงเหลือกองกลาง (Main Treasury Hero Card) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 shadow-md">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-lg pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-emerald-100 text-xs font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <Wallet size={16} /> ยอดเงินคงเหลือกองกลาง
            </span>
            <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-[11px] backdrop-blur-xs">
              {data.config.group_name || 'หะละเกาะฮฺ'}
            </span>
          </div>

          <div className="text-3xl font-extrabold tracking-tight mt-1 mb-4">
            ฿{formatCurrency(summary.groupBalance)}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/15 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-200">
                <TrendingUp size={16} />
              </div>
              <div>
                <p className="text-emerald-200 text-[11px]">รายรับทั้งหมด</p>
                <p className="font-semibold text-white">฿{formatCurrency(summary.totalInflows)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-200">
                <TrendingDown size={16} />
              </div>
              <div>
                <p className="text-emerald-200 text-[11px]">รายจ่ายกองกลาง</p>
                <p className="font-semibold text-white">฿{formatCurrency(summary.totalOutflows)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. สรุปสถานะสมาชิกและยอดค้างชำระ (Alert & Overview Cards) */}
      <div className="grid grid-cols-2 gap-3">
        {/* กล่องสมาชิกค้างชำระ */}
        <div 
          onClick={() => onNavigateTab('matrix')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            summary.overdueMembersCount > 0
              ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-50'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">ค้างชำระ</span>
            <div className={`p-1.5 rounded-lg ${summary.overdueMembersCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold ${summary.overdueMembersCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              {summary.overdueMembersCount}
            </span>
            <span className="text-xs text-slate-500">คน</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            รวมค้าง ฿{formatCurrency(summary.totalOverdueAmount)}
          </p>
        </div>

        {/* กล่องสมาชิกทั้งหมด */}
        <div 
          onClick={() => onNavigateTab('members')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">สมาชิกทั้งหมด</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Users size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-800">
              {summary.activeMembersCount}
            </span>
            <span className="text-xs text-slate-500">/{summary.totalMembersCount} คน</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">
            จ่ายล่วงหน้า {summary.advanceMembersCount} คน
          </p>
        </div>
      </div>

      {/* 3. ปุ่มเมนูลัดสำหรับผู้ดูแล (Quick Actions) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            เมนูลัด {isAdmin ? '(โหมดเหรัญญิก)' : ''}
          </h3>
          {isAdmin && (
            <button
              onClick={onOpenSessionModal}
              className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline"
            >
              <CalendarPlus size={14} /> เพิ่มงวดนัด
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onNavigateTab('transactions')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1.5 shadow-xs">
              <ArrowDownLeft size={18} />
            </div>
            <span className="text-[11px] font-semibold">รับเงิน</span>
          </button>

          <button
            onClick={() => onNavigateTab('transactions')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 transition-colors active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center mb-1.5 shadow-xs">
              <ArrowUpRight size={18} />
            </div>
            <span className="text-[11px] font-semibold">จ่ายเงิน</span>
          </button>

          <button
            onClick={() => onNavigateTab('attendance')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 transition-colors active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center mb-1.5 shadow-xs">
              <CheckCircle size={18} />
            </div>
            <span className="text-[11px] font-semibold">เช็คชื่อ</span>
          </button>

          <button
            onClick={() => onNavigateTab('matrix')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 transition-colors active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center mb-1.5 shadow-xs">
              <Receipt size={18} />
            </div>
            <span className="text-[11px] font-semibold">ตารางค้าง</span>
          </button>
        </div>
      </div>

      {/* 4. นัดหมายล่าสุด (Latest Session) */}
      {latestSession && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Calendar size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  งวดล่าสุด: {formatThaiDate(latestSession.session_date)}
                </span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                  ฿{latestSession.amount_per_session}/คน
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                {latestSession.topic_or_note || 'พบปะกลุ่มหะละเกาะฮฺ'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 px-3 py-1.5 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            เช็คชื่อ
          </button>
        </div>
      )}

      {/* 5. รายการเคลื่อนไหวล่าสุด (Recent Activities) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            รายการเคลื่อนไหวล่าสุด
          </h3>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs text-emerald-700 font-medium hover:underline"
          >
            ดูทั้งหมด
          </button>
        </div>

        {combinedActivities.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400">ยังไม่มีรายการบันทึก</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {combinedActivities.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                      item.type === 'income'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.type === 'income' ? (
                      <ArrowDownLeft size={16} />
                    ) : (
                      <ArrowUpRight size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {formatThaiDate(item.date)} • {item.subtext}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-bold ${
                      item.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                    }`}
                  >
                    {item.type === 'income' ? '+' : '-'}฿{formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
