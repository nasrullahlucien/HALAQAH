import React, { useState, useEffect } from 'react';
import { AppData, AttendanceStatus, Member, Session } from '../types';
import { formatThaiDate } from '../utils/calculations';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Calendar,
  Plus,
  AlertCircle,
  LayoutGrid,
  ListCheck,
  Search
} from 'lucide-react';
import { executeAdminAction } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

interface AttendanceViewProps {
  data: AppData;
  isAdmin: boolean;
  adminPin: string;
  onOpenAdminModal: () => void;
  onOpenSessionModal: () => void;
  onSelectSession?: (session: Session) => void;
  onRefreshData: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  data,
  isAdmin,
  adminPin,
  onOpenAdminModal,
  onOpenSessionModal,
  onSelectSession,
  onRefreshData
}) => {
  const { t } = useLanguage();

  // โหมดการแสดงผล: 'matrix' (ตารางรวมแบบ ปพ.5) vs 'daily' (เช็คชื่อด่วนรายวัน)
  const [viewMode, setViewMode] = useState<'matrix' | 'daily'>('matrix');
  const [search, setSearch] = useState('');

  // เรียงลำดับ Sessions ทั้งหมด (รวมทั้งงวดที่มีและไม่มีเก็บเงิน)
  // ในตารางแบบ ปพ.5 นิยมเรียงจากซ้ายไปขวา (เก่าสุด -> ใหม่สุด)
  const sortedSessionsChronological = [...data.sessions].sort((a, b) => 
    a.session_date.localeCompare(b.session_date)
  );

  // สำหรับโหมดรายวัน: เรียงจากใหม่สุดไปเก่าสุด เพื่อให้เจองวดล่าสุดก่อน
  const sortedSessionsDesc = [...data.sessions].sort((a, b) => 
    b.session_date.localeCompare(a.session_date)
  );

  const [selectedDate, setSelectedDate] = useState<string>(
    sortedSessionsDesc[0]?.session_date || new Date().toISOString().split('T')[0]
  );

  // สถานะในโหมดเช็คชื่อรายวัน
  const [attendanceState, setAttendanceState] = useState<
    Record<string, { status: AttendanceStatus; note: string }>
  >({});

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // เมื่อเปลี่ยนวันที่ที่เลือกในโหมดรายวัน
  useEffect(() => {
    const activeMembers = data.members.filter(m => m.status === 'active');
    const newState: Record<string, { status: AttendanceStatus; note: string }> = {};

    activeMembers.forEach(member => {
      const existing = data.attendance.find(
        a => a.session_date === selectedDate && a.member_id === member.member_id
      );

      newState[member.member_id] = {
        status: existing ? existing.status : 'present',
        note: existing?.note || ''
      };
    });

    setAttendanceState(newState);
    setMessage(null);
  }, [selectedDate, data.attendance, data.members]);

  const handleStatusChange = (memberId: string, status: AttendanceStatus) => {
    setAttendanceState(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        status
      }
    }));
  };

  const handleNoteChange = (memberId: string, note: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        note
      }
    }));
  };

  const handleSetAllPresent = () => {
    setAttendanceState(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(mId => {
        updated[mId] = { ...updated[mId], status: 'present' };
      });
      return updated;
    });
  };

  const handleSaveAttendance = async () => {
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    setSaving(true);
    setMessage(null);

    const records = Object.entries(attendanceState).map(([mId, state]) => ({
      member_id: mId,
      status: state.status,
      note: state.note
    }));

    const result = await executeAdminAction('record_attendance', adminPin, {
      session_date: selectedDate,
      records
    });

    setSaving(false);
    if (result.success) {
      setMessage({ text: t('saveAttendanceSuccess'), type: 'success' });
      onRefreshData();
    } else {
      setMessage({ text: result.error || t('saveAttendanceFail'), type: 'error' });
    }
  };

  // แตะที่ช่องในตาราง Matrix เพื่อสลับสถานะแบบรวดเร็ว (มา ➔ ลา ➔ ขาด ➔ มา)
  const handleQuickCycleStatus = async (member: Member, sessionDate: string, currentStatus?: AttendanceStatus) => {
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    let nextStatus: AttendanceStatus = 'present';
    if (!currentStatus || currentStatus === 'present') {
      nextStatus = 'leave';
    } else if (currentStatus === 'leave') {
      nextStatus = 'absent';
    } else {
      nextStatus = 'present';
    }

    // ส่งคำขออัปเดตไปที่ backend ทันที
    await executeAdminAction('record_attendance', adminPin, {
      session_date: sessionDate,
      records: [
        {
          member_id: member.member_id,
          status: nextStatus,
          note: ''
        }
      ]
    });
    onRefreshData();
  };

  // กรองสมาชิกตามค้นหา
  const filteredMembers = data.members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.member_id.toLowerCase().includes(search.toLowerCase())
  );

  // คำนวณสถิติเข้าพบของแต่ละคน
  const getMemberAttendanceStats = (memberId: string) => {
    const records = data.attendance.filter(a => a.member_id === memberId);
    const present = records.filter(a => a.status === 'present').length;
    const leave = records.filter(a => a.status === 'leave').length;
    const absent = records.filter(a => a.status === 'absent').length;
    const totalRecorded = records.length;
    const rate = totalRecorded > 0 ? Math.round((present / totalRecorded) * 100) : 100;
    return { present, leave, absent, totalRecorded, rate };
  };

  // สถิติรายวันสำหรับโหมด Quick Check
  const presentCount = Object.values(attendanceState).filter(s => s.status === 'present').length;
  const leaveCount = Object.values(attendanceState).filter(s => s.status === 'leave').length;
  const absentCount = Object.values(attendanceState).filter(s => s.status === 'absent').length;

  const currentSessionObj = data.sessions.find(s => s.session_date === selectedDate);

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header และแถบสลับโหมดมุมมอง */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{t('attendanceTitle')}</span>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {data.sessions.length} ครั้ง
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {t('attendanceSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* ปุ่มสลับโหมด: ตารางรวม (ปพ.5) vs เช็คชื่อด่วน (รายวัน) */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'matrix'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid size={14} />
                <span>{t('viewAttendanceMatrix')}</span>
              </button>

              <button
                onClick={() => setViewMode('daily')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'daily'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListCheck size={14} />
                <span>{t('viewAttendanceDaily')}</span>
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={onOpenSessionModal}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors shadow-2xs shrink-0"
              >
                <Plus size={14} /> {t('newSession')}
              </button>
            )}
          </div>
        </div>

        {/* ค้นหาชื่อสมาชิก */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchMemberPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. มุมมองที่ 1: ตารางเช็คชื่อรวมสไตล์ ปพ.5 (Attendance Matrix) */}
      {/* ========================================================= */}
      {viewMode === 'matrix' && (
        <div className="space-y-3">
          {/* แถบคำอธิบายสัญลักษณ์ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                  /
                </span>
                <span className="font-medium text-slate-700">{t('statusPresent')}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px]">
                  ล
                </span>
                <span className="font-medium text-slate-700">{t('statusLeave')}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[11px]">
                  ข
                </span>
                <span className="font-medium text-slate-700">{t('statusAbsent')}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              {isAdmin && <span>{t('tapToChangeAttendance')} • </span>}
              <span>{t('scrollHint')}</span>
            </div>
          </div>

          {/* ตารางหลักสไตล์ ปพ.5 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                {/* Header Row */}
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-semibold">
                    {/* คอลัมน์ลำดับ */}
                    <th className="py-2.5 px-2 text-center w-8 border-r border-slate-200">#</th>

                    {/* คอลัมน์ชื่อ-สกุล (Freeze Sticky ด้านซ้าย) */}
                    <th className="sticky-col-first bg-slate-100 py-2.5 px-3 min-w-[130px] border-r border-slate-200 z-20">
                      {t('colMemberName')}
                    </th>

                    {/* แต่ละงวดวันที่ */}
                    {sortedSessionsChronological.map((session) => {
                      const [, m, d] = session.session_date.split('-');
                      const isFeeSession = (Number(session.amount_per_session) || 0) > 0;

                      return (
                        <th
                          key={session.session_id}
                          onClick={() => onSelectSession?.(session)}
                          className="py-2 px-1 text-center min-w-[50px] border-r border-slate-200 cursor-pointer hover:bg-slate-200/90 transition-colors group select-none"
                          title="แตะเพื่อดูรายละเอียด / แก้ไข / ลบงวดนี้"
                        >
                          <div className="flex flex-col items-center group-hover:scale-105 transition-transform">
                            {/* เดือนด้านบน */}
                            <span className="text-[10px] font-bold text-slate-600 leading-tight">
                              {m}
                            </span>
                            {/* วันที่ด้านล่าง */}
                            <span className="text-xs font-extrabold text-slate-900 leading-tight">
                              {d}
                            </span>
                            {/* ป้ายบอกว่ามีเก็บเงินหรือไม่ */}
                            <span
                              className={`text-[9px] mt-0.5 px-1 py-0.2 rounded font-mono ${
                                isFeeSession
                                  ? 'bg-emerald-50 text-emerald-700 font-semibold group-hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-800 group-hover:bg-amber-100'
                              }`}
                            >
                              {isFeeSession ? `฿${session.amount_per_session}` : 'พบปะ'}
                            </span>
                          </div>
                        </th>
                      );
                    })}

                    {/* คอลัมน์สรุปด้านขวา */}
                    <th className="py-2.5 px-2 text-center min-w-[42px] bg-emerald-50 text-emerald-900 border-r border-slate-200 font-bold">
                      {t('colPresentCount')}
                    </th>
                    <th className="py-2.5 px-2 text-center min-w-[42px] bg-amber-50 text-amber-900 border-r border-slate-200 font-bold">
                      {t('colLeaveCount')}
                    </th>
                    <th className="py-2.5 px-2 text-center min-w-[42px] bg-rose-50 text-rose-900 border-r border-slate-200 font-bold">
                      {t('colAbsentCount')}
                    </th>
                    <th className="py-2.5 px-2 text-center min-w-[55px] bg-slate-50 border-r border-slate-200">
                      {t('colTotalAttended')}
                    </th>
                    <th className="py-2.5 px-3 text-center min-w-[65px] bg-slate-100 font-bold text-slate-900">
                      {t('colSummaryRate')}
                    </th>
                  </tr>
                </thead>

                {/* Body Rows */}
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={sortedSessionsChronological.length + 7}
                        className="py-8 text-center text-slate-400 text-xs"
                      >
                        ไม่พบรายชื่อสมาชิก
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member, idx) => {
                      const stats = getMemberAttendanceStats(member.member_id);

                      return (
                        <tr key={member.member_id} className="hover:bg-slate-50/80 transition-colors">
                          {/* ลำดับ # */}
                          <td className="py-2 px-1 text-center text-slate-400 font-mono text-[11px] border-r border-slate-200">
                            {idx + 1}
                          </td>

                          {/* ชื่อสมาชิก (Sticky Freeze) */}
                          <td className="sticky-col-first bg-white hover:bg-slate-50 py-2 px-3 border-r border-slate-200 z-10">
                            <div className="font-semibold text-slate-900 truncate max-w-[120px]">
                              {member.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {member.member_id} {member.status === 'inactive' ? `(${t('statusInactive')})` : ''}
                            </div>
                          </td>

                          {/* แต่ละงวดวันที่ */}
                          {sortedSessionsChronological.map((session) => {
                            const rec = data.attendance.find(
                              (a) => a.session_date === session.session_date && a.member_id === member.member_id
                            );
                            const st = rec?.status;

                            return (
                              <td
                                key={session.session_id}
                                onClick={() => handleQuickCycleStatus(member, session.session_date, st)}
                                className={`py-2 px-1 text-center border-r border-slate-200 ${
                                  isAdmin ? 'cursor-pointer hover:bg-emerald-50/50' : ''
                                }`}
                                title={
                                  rec?.note
                                    ? `${formatThaiDate(session.session_date)}: ${rec.note}`
                                    : formatThaiDate(session.session_date)
                                }
                              >
                                {st === 'present' ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shadow-2xs">
                                    /
                                  </span>
                                ) : st === 'leave' ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold text-xs shadow-2xs">
                                    ล
                                  </span>
                                ) : st === 'absent' ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold text-xs shadow-2xs">
                                    ข
                                  </span>
                                ) : (
                                  <span className="text-slate-300 font-mono text-xs">-</span>
                                )}
                              </td>
                            );
                          })}

                          {/* คอลัมน์สรุปรายคน */}
                          <td className="py-2 px-2 text-center border-r border-slate-200 font-bold text-emerald-700 bg-emerald-50/30">
                            {stats.present}
                          </td>
                          <td className="py-2 px-2 text-center border-r border-slate-200 font-bold text-amber-800 bg-amber-50/30">
                            {stats.leave}
                          </td>
                          <td className="py-2 px-2 text-center border-r border-slate-200 font-bold text-rose-700 bg-rose-50/30">
                            {stats.absent}
                          </td>
                          <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-slate-700 text-xs">
                            {stats.present}/{sortedSessionsChronological.length}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span
                              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                stats.rate >= 80
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : stats.rate >= 60
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-rose-100 text-rose-700 border border-rose-300'
                              }`}
                            >
                              {stats.rate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

                {/* Footer Row รวมแต่ละงวด */}
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td className="py-2.5 px-2 text-center text-slate-500 border-r border-slate-300">#</td>
                    <td className="sticky-col-first bg-slate-100 py-2.5 px-3 border-r border-slate-300 z-10">
                      รวมคนมา (ทั้งหมด {filteredMembers.length} คน)
                    </td>

                    {/* รวมแต่ละ Session */}
                    {sortedSessionsChronological.map((session) => {
                      const presentInSession = data.attendance.filter(
                        (a) => a.session_date === session.session_date && a.status === 'present'
                      ).length;

                      return (
                        <td
                          key={session.session_id}
                          className="py-2 px-1 text-center border-r border-slate-300 font-mono text-emerald-700 text-xs"
                        >
                          {presentInSession}
                        </td>
                      );
                    })}

                    {/* รวมรวมสรุป */}
                    <td colSpan={5} className="py-2.5 px-3 text-center text-slate-500 text-xs">
                      ภาพรวมการเข้าพบ
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. มุมมองที่ 2: เช็คชื่อด่วนรายวัน (Quick Daily Check-in) */}
      {/* ========================================================= */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  {sortedSessionsDesc.map((s) => (
                    <option key={s.session_id} value={s.session_date}>
                      {formatThaiDate(s.session_date)}{' '}
                      {Number(s.amount_per_session) === 0 ? '(พบปะอย่างเดียว)' : `(฿${s.amount_per_session})`}{' '}
                      {s.topic_or_note ? `— ${s.topic_or_note}` : ''}
                    </option>
                  ))}
                </select>
                <Calendar size={15} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>

              <button
                onClick={handleSetAllPresent}
                type="button"
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl whitespace-nowrap transition-colors"
                title={t('setAllPresent')}
              >
                {t('setAllPresent')}
              </button>
            </div>

            {currentSessionObj?.topic_or_note && (
              <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                <div>
                  <span className="font-semibold">หัวข้อ: </span>
                  <span>{currentSessionObj.topic_or_note}</span>
                </div>
                {Number(currentSessionObj.amount_per_session) === 0 ? (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                    งดเก็บเงิน (พบปะอย่างเดียว)
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    เก็บเงิน ฿{currentSessionObj.amount_per_session}/คน
                  </span>
                )}
              </div>
            )}
          </div>

          {/* สรุปยอดการมาของวันนี้ */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="block font-bold text-emerald-700 text-base">{presentCount}</span>
              <span className="text-[11px] text-emerald-800 font-medium">{t('statusPresent')}</span>
            </div>
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="block font-bold text-amber-700 text-base">{leaveCount}</span>
              <span className="text-[11px] text-amber-800 font-medium">{t('statusLeave')}</span>
            </div>
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="block font-bold text-rose-700 text-base">{absentCount}</span>
              <span className="text-[11px] text-rose-800 font-medium">{t('statusAbsent')}</span>
            </div>
          </div>

          {/* แจ้งเตือนข้อความ */}
          {message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* รายชื่อสมาชิกและปุ่มเช็คชื่อรายวัน */}
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {filteredMembers.map((member) => {
              const current = attendanceState[member.member_id] || { status: 'present', note: '' };

              return (
                <div key={member.member_id} className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{member.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{member.member_id}</span>
                    </div>

                    {/* 3 ปุ่มเลือกสถานะ มา / ลา / ไม่มา */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(member.member_id, 'present')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                          current.status === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs scale-102'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <CheckCircle2 size={13} />
                        <span>{t('statusPresent')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(member.member_id, 'leave')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                          current.status === 'leave'
                            ? 'bg-amber-500 text-white shadow-xs scale-102'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <Clock size={13} />
                        <span>{t('statusLeave')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(member.member_id, 'absent')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                          current.status === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs scale-102'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <XCircle size={13} />
                        <span>{t('statusAbsent')}</span>
                      </button>
                    </div>
                  </div>

                  {/* ช่องใส่หมายเหตุถ้า ลา หรือ ไม่มา */}
                  {current.status !== 'present' && (
                    <div className="pt-1">
                      <input
                        type="text"
                        value={current.note}
                        onChange={(e) => handleNoteChange(member.member_id, e.target.value)}
                        placeholder={t('reasonOptional')}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ปุ่มบันทึกการเช็คชื่อครั้งเดียว */}
          <div className="sticky bottom-20 z-20">
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              <Save size={16} />
              <span>
                {saving
                  ? t('savingText')
                  : `${t('saveAttendanceBatch')} (${formatThaiDate(selectedDate)})`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
