import React, { useState, useEffect } from 'react';
import { AppData, AttendanceStatus } from '../types';
import { formatThaiDate } from '../utils/calculations';
import { CheckCircle2, XCircle, Clock, Save, Calendar, Plus, AlertCircle } from 'lucide-react';
import { executeAdminAction } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

interface AttendanceViewProps {
  data: AppData;
  isAdmin: boolean;
  adminPin: string;
  onOpenAdminModal: () => void;
  onOpenSessionModal: () => void;
  onRefreshData: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  data,
  isAdmin,
  adminPin,
  onOpenAdminModal,
  onOpenSessionModal,
  onRefreshData
}) => {
  const { t } = useLanguage();
  // วันที่นัดล่าสุดเป็นค่าเริ่มต้น
  const sortedSessions = [...data.sessions].sort((a, b) => 
    b.session_date.localeCompare(a.session_date)
  );
  
  const [selectedDate, setSelectedDate] = useState<string>(
    sortedSessions[0]?.session_date || new Date().toISOString().split('T')[0]
  );

  // บันทึกสถานะของสมาชิกแต่ละคน: { member_id: { status: 'present', note: '' } }
  const [attendanceState, setAttendanceState] = useState<
    Record<string, { status: AttendanceStatus; note: string }>
  >({});

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // เมื่อเปลี่ยนวันที่ที่เลือก ให้ดึงสถานะเดิมมาใส่ใน Form หรือถ้าไม่มีให้ Default เป็น 'present'
  useEffect(() => {
    const activeMembers = data.members.filter(m => m.status === 'active');
    const newState: Record<string, { status: AttendanceStatus; note: string }> = {};

    activeMembers.forEach(member => {
      const existing = data.attendance.find(
        a => a.session_date === selectedDate && a.member_id === member.member_id
      );

      newState[member.member_id] = {
        status: existing ? existing.status : 'present', // ค่าเริ่มต้น "มา"
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

  // ข้อมูลสถิติของวันนั้น
  const activeMembers = data.members.filter(m => m.status === 'active');
  const presentCount = Object.values(attendanceState).filter(s => s.status === 'present').length;
  const leaveCount = Object.values(attendanceState).filter(s => s.status === 'leave').length;
  const absentCount = Object.values(attendanceState).filter(s => s.status === 'absent').length;

  const currentSessionObj = data.sessions.find(s => s.session_date === selectedDate);

  return (
    <div className="space-y-4 pb-20">
      {/* 1. ส่วนเลือกวันที่นัดพบ */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('attendanceTitle')}</h2>
            <p className="text-xs text-slate-500">
              {t('attendanceSubtitle')}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={onOpenSessionModal}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <Plus size={14} /> {t('newSession')}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              {sortedSessions.map((s) => (
                <option key={s.session_id} value={s.session_date}>
                  {formatThaiDate(s.session_date)} {s.topic_or_note ? `— ${s.topic_or_note}` : ''}
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
          <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-900">
            <span className="font-semibold">หัวข้อ: </span>
            <span>{currentSessionObj.topic_or_note}</span>
          </div>
        )}
      </div>

      {/* 2. สรุปยอดการมาของวันนี้ */}
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

      {/* 3. รายชื่อสมาชิกและปุ่มเช็คชื่อ */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
        {activeMembers.map((member) => {
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

      {/* 4. ปุ่มบันทึกการเช็คชื่อครั้งเดียว */}
      <div className="sticky bottom-20 z-20">
        <button
          onClick={handleSaveAttendance}
          disabled={saving}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
        >
          <Save size={16} />
          <span>{saving ? t('savingText') : `${t('saveAttendanceBatch')} (${formatThaiDate(selectedDate)})`}</span>
        </button>
      </div>
    </div>
  );
};
