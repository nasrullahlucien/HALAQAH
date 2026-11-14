import React, { useState } from 'react';
import { AppData, Member } from '../types';
import { calculateMemberSummary, formatCurrency, formatThaiDate } from '../utils/calculations';
import { AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface MatrixViewProps {
  data: AppData;
  onSelectMember: (member: Member) => void;
  onOpenSessionModal: () => void;
  isAdmin: boolean;
}

export const MatrixView: React.FC<MatrixViewProps> = ({
  data,
  onSelectMember,
  onOpenSessionModal,
  isAdmin
}) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'overdue' | 'advance'>('all');

  // เรียงลำดับ Sessions จากเก่าไปใหม่
  const sortedSessions = [...data.sessions].sort((a, b) => 
    a.session_date.localeCompare(b.session_date)
  );

  // คำนวณสรุปของสมาชิกทุกคน
  const memberSummaries = data.members.map(member => 
    calculateMemberSummary(member, sortedSessions, data)
  );

  // กรองตามการค้นหาและ Filter mode
  const filteredSummaries = memberSummaries.filter(item => {
    const matchesSearch = item.member.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.member.member_id.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filterMode === 'overdue') return item.isOverdue;
    if (filterMode === 'advance') return item.isAdvance;
    return true; // 'all'
  });

  // รวมผลแต่ละคอลัมน์ในแถวด้านล่าง
  const totalPaidAll = memberSummaries.reduce((sum, s) => sum + s.totalPaid, 0);
  const totalExpectedAll = memberSummaries.reduce((sum, s) => sum + s.totalExpected, 0);
  const totalNetBalanceAll = memberSummaries.reduce((sum, s) => sum + s.netBalance, 0);

  // คำนวณยอดเงินที่เก็บได้ในแต่ละงวด (จาก FIFO allocation)
  const sessionTotalCollected = sortedSessions.map(session => {
    return memberSummaries.reduce((sum, s) => {
      const status = s.sessionPaymentStatus[session.session_date];
      return sum + (status ? status.allocatedAmount : 0);
    }, 0);
  });

  return (
    <div className="space-y-4 pb-20">
      {/* 1. แถบควบคุมและค้นหา (Filters & Search) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('matrixTitle')}</h2>
            <p className="text-xs text-slate-500">
              {t('matrixSubtitle')}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={onOpenSessionModal}
              className="text-xs font-semibold px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
            >
              + {t('addSession')}
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* ค้นหาชื่อ */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchMemberPlaceholder')}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* ฟิลเตอร์สถานะ */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('filterAll')} ({memberSummaries.length})
            </button>
            <button
              onClick={() => setFilterMode('overdue')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                filterMode === 'overdue'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <AlertCircle size={13} />
              <span>{t('filterOverdue')} ({memberSummaries.filter(m => m.isOverdue).length})</span>
            </button>
            <button
              onClick={() => setFilterMode('advance')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                filterMode === 'advance'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <CheckCircle2 size={13} />
              <span>{t('filterAdvance')} ({memberSummaries.filter(m => m.isAdvance).length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* คำอธิบายสัญลักษณ์สี */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> {t('legendPaid')}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> {t('legendPartial')}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> {t('legendUnpaid')}
          </span>
        </div>
        <span className="text-[10px] text-slate-400">{t('scrollHint')}</span>
      </div>

      {/* 2. ตารางหลัก (Matrix Spreadsheet View) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            {/* Header Row */}
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-semibold">
                {/* คอลัมน์ที่ 1: ชื่อสมาชิก (Freeze Sticky ด้านซ้าย) */}
                <th className="sticky-col-first bg-slate-100 py-3 px-3 min-w-[130px] border-r border-slate-200 z-20">
                  {t('colMemberName')}
                </th>

                {/* คอลัมน์ Sessions แต่ละงวด */}
                {sortedSessions.map((session, idx) => (
                  <th
                    key={session.session_id}
                    className="py-3 px-2 text-center min-w-[85px] border-r border-slate-200"
                    title={session.topic_or_note || ''}
                  >
                    <div className="font-bold text-slate-900 leading-tight">
                      {formatThaiDate(session.session_date, { yearOffset: false })}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {t('colSessionPrefix', { num: idx + 1 })} (฿{session.amount_per_session})
                    </div>
                  </th>
                ))}

                {/* คอลัมน์สรุป */}
                <th className="py-3 px-3 text-right min-w-[85px] bg-slate-50 border-r border-slate-200">
                  {t('colTotalPaid')}
                </th>
                <th className="py-3 px-3 text-right min-w-[85px] bg-slate-50 border-r border-slate-200">
                  {t('colTotalExpected')}
                </th>
                <th className="py-3 px-3 text-center min-w-[130px] bg-slate-100 font-bold text-slate-900">
                  {t('colNetBalance')}
                </th>
              </tr>
            </thead>

            {/* Body Rows */}
            <tbody className="divide-y divide-slate-100">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td
                    colSpan={sortedSessions.length + 4}
                    className="py-8 text-center text-slate-400 text-xs"
                  >
                    ไม่พบข้อมูลสมาชิกตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((item) => {
                  const m = item.member;
                  return (
                    <tr
                      key={m.member_id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => onSelectMember(m)}
                    >
                      {/* สมาชิก (Sticky Column) */}
                      <td className="sticky-col-first bg-white group-hover:bg-slate-50/80 py-2.5 px-3 border-r border-slate-200 z-10">
                        <div className="font-semibold text-slate-900 flex items-center justify-between">
                          <span className="truncate max-w-[100px]">{m.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{m.member_id}</span>
                        </div>
                        {item.attendanceStats.totalSessions > 0 && (
                          <div className="text-[10px] text-slate-400">
                            เข้า {item.attendanceStats.attendanceRate}%
                          </div>
                        )}
                      </td>

                      {/* แต่ละ Session */}
                      {sortedSessions.map((session) => {
                        const sStatus = item.sessionPaymentStatus[session.session_date];
                        const statusType = sStatus?.status || 'unpaid';

                        return (
                          <td
                            key={session.session_id}
                            className="py-2.5 px-2 text-center border-r border-slate-200"
                          >
                            {statusType === 'paid' && (
                              <span className="inline-flex items-center justify-center w-full py-1 px-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px] shadow-2xs">
                                ฿{sStatus.allocatedAmount}
                              </span>
                            )}
                            {statusType === 'partial' && (
                              <span className="inline-flex items-center justify-center w-full py-1 px-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-[11px]">
                                ฿{sStatus.allocatedAmount}
                              </span>
                            )}
                            {statusType === 'unpaid' && (
                              <span className="inline-flex items-center justify-center w-full py-1 px-1.5 rounded-lg bg-rose-50 text-rose-500 font-medium text-[11px] border border-rose-200">
                                {t('legendUnpaid')}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* ยอดจ่ายแล้ว */}
                      <td className="py-2.5 px-3 text-right border-r border-slate-200 font-medium text-slate-700 bg-slate-50/50">
                        ฿{formatCurrency(item.totalPaid)}
                      </td>

                      {/* ยอดควรจ่าย */}
                      <td className="py-2.5 px-3 text-right border-r border-slate-200 text-slate-500 bg-slate-50/50">
                        ฿{formatCurrency(item.totalExpected)}
                      </td>

                      {/* ช่องสรุปส่วนต่าง (แดงเมื่อค้าง) */}
                      <td className="py-2 px-2 text-center">
                        {item.isOverdue ? (
                          <div className="py-1 px-2 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 text-center font-bold">
                            <div className="text-xs">
                              -฿{formatCurrency(Math.abs(item.netBalance))}
                            </div>
                            <div className="text-[10px] text-rose-600 font-normal">
                              {t('overdueTimes', { count: item.overdueSessionsCount })}
                            </div>
                          </div>
                        ) : item.isAdvance ? (
                          <div className="py-1 px-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-center font-bold">
                            <div className="text-xs">
                              +฿{formatCurrency(item.netBalance)}
                            </div>
                            <div className="text-[10px] text-emerald-700 font-normal">
                              {t('advanceTimes', { count: item.advanceSessionsCount })}
                            </div>
                          </div>
                        ) : (
                          <div className="py-1 px-2 rounded-xl bg-slate-100 text-slate-600 text-center text-xs font-semibold">
                            {t('settledEqual')}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Total Row แถวรวมด้านล่าง */}
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="sticky-col-first bg-slate-100 py-3 px-3 border-r border-slate-300 z-10">
                  {t('grandTotal')} ({memberSummaries.length})
                </td>

                {/* รวมแต่ละ Session */}
                {sessionTotalCollected.map((amount, idx) => (
                  <td key={idx} className="py-3 px-2 text-center border-r border-slate-300 font-mono text-emerald-700">
                    ฿{formatCurrency(amount)}
                  </td>
                ))}

                {/* รวมจ่ายแล้ว */}
                <td className="py-3 px-3 text-right border-r border-slate-300 font-mono text-emerald-700">
                  ฿{formatCurrency(totalPaidAll)}
                </td>

                {/* รวมควรจ่าย */}
                <td className="py-3 px-3 text-right border-r border-slate-300 font-mono text-slate-700">
                  ฿{formatCurrency(totalExpectedAll)}
                </td>

                {/* รวมส่วนต่างสุทธิ */}
                <td className="py-3 px-3 text-center">
                  <span
                    className={`font-mono font-bold ${
                      totalNetBalanceAll < 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {totalNetBalanceAll >= 0 ? '+' : ''}฿{formatCurrency(totalNetBalanceAll)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
