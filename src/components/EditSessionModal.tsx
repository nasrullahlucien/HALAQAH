import React, { useState, useEffect } from 'react';
import { Session, AppData } from '../types';
import { formatThaiDate } from '../utils/calculations';
import { Calendar, X, Trash2, Save, Wallet, Users, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { executeAdminAction } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

interface EditSessionModalProps {
  isOpen: boolean;
  session: Session | null;
  data: AppData;
  isAdmin: boolean;
  adminPin: string;
  onClose: () => void;
  onOpenAdminModal: () => void;
  onRefreshData: () => void;
}

export const EditSessionModal: React.FC<EditSessionModalProps> = ({
  isOpen,
  session,
  data,
  isAdmin,
  adminPin,
  onClose,
  onOpenAdminModal,
  onRefreshData
}) => {
  const { t } = useLanguage();

  const [sessionDate, setSessionDate] = useState('');
  const [hasFee, setHasFee] = useState(true);
  const [amount, setAmount] = useState('20');
  const [topic, setTopic] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      setSessionDate(session.session_date);
      const isFee = (Number(session.amount_per_session) || 0) > 0;
      setHasFee(isFee);
      setAmount(isFee ? String(session.amount_per_session) : '20');
      setTopic(session.topic_or_note || '');
      setError('');
    }
  }, [session]);

  if (!isOpen || !session) return null;

  // คำนวณสถิติการเข้าพบของงวดนี้
  const sessionAttendance = data.attendance.filter(a => a.session_date === session.session_date);
  const presentCount = sessionAttendance.filter(a => a.status === 'present').length;
  const leaveCount = sessionAttendance.filter(a => a.status === 'leave').length;
  const absentCount = sessionAttendance.filter(a => a.status === 'absent').length;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    if (!sessionDate) {
      setError('กรุณาระบุวันที่นัดพบ');
      return;
    }

    const amt = hasFee ? parseFloat(amount) : 0;
    if (hasFee && (isNaN(amt) || amt < 0)) {
      setError('ยอดเงินต่องวดไม่ถูกต้อง');
      return;
    }

    setSaving(true);
    setError('');

    const res = await executeAdminAction('update_session', adminPin, {
      session_id: session.session_id,
      session_date: sessionDate,
      amount_per_session: amt,
      topic_or_note: topic.trim()
    });

    setSaving(false);
    if (res.success) {
      onRefreshData();
      onClose();
    } else {
      setError(res.error || 'อัปเดตงวดนัดไม่สำเร็จ');
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    const confirmed = window.confirm(
      `ต้องการลบงวดวันที่ ${formatThaiDate(session.session_date)} ใช่หรือไม่?\n\n* ข้อมูลการเช็คชื่อของงวดนี้จะถูกลบออกด้วย`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError('');

    const res = await executeAdminAction('delete_session', adminPin, {
      session_id: session.session_id,
      session_date: session.session_date
    });

    setDeleting(false);
    if (res.success) {
      onRefreshData();
      onClose();
    } else {
      setError(res.error || 'ลบงวดนัดไม่สำเร็จ');
    }
  };

  const handleQuickSetAllPresent = async () => {
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    setSaving(true);
    const activeMembers = data.members.filter(m => m.status === 'active');
    const records = activeMembers.map(m => ({
      member_id: m.member_id,
      status: 'present',
      note: ''
    }));

    const res = await executeAdminAction('record_attendance', adminPin, {
      session_date: session.session_date,
      records
    });

    setSaving(false);
    if (res.success) {
      onRefreshData();
    } else {
      setError(res.error || 'บันทึกไม่สำเร็จ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          aria-label="ปิด"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t('editSessionTitle')}</h3>
            <p className="text-xs text-slate-500">
              {formatThaiDate(session.session_date)}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-1.5">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* สรุปการเข้าพบของงวดนี้ */}
        <div className="mb-3.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
            <span>สถานะการเข้าพบในงวดนี้:</span>
            {isAdmin && (
              <button
                type="button"
                onClick={handleQuickSetAllPresent}
                disabled={saving}
                className="text-[10px] text-emerald-700 font-bold hover:underline"
              >
                ตั้งทุกคนเป็น "มา"
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span className="font-bold text-emerald-800">{presentCount}</span>
              <span className="text-[10px] text-emerald-600">มา</span>
            </div>
            <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-center gap-1">
              <Clock size={13} className="text-amber-600" />
              <span className="font-bold text-amber-900">{leaveCount}</span>
              <span className="text-[10px] text-amber-700">ลา</span>
            </div>
            <div className="p-1.5 bg-rose-50 rounded-lg border border-rose-200 flex items-center justify-center gap-1">
              <XCircle size={13} className="text-rose-600" />
              <span className="font-bold text-rose-800">{absentCount}</span>
              <span className="text-[10px] text-rose-600">ขาด</span>
            </div>
          </div>
        </div>

        {/* Form: ถ้าเป็นเหรัญญิก สามารถแก้ไข/ลบได้ */}
        {isAdmin ? (
          <form onSubmit={handleUpdate} className="space-y-3.5">
            {/* วันที่นัดพบ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วันที่นัดพบ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* ประเภทงวด */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('sessionFeeLabel')}
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setHasFee(true);
                    if (amount === '0') setAmount('20');
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    hasFee
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Wallet size={15} className={hasFee ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="text-[11px] text-center">{t('sessionWithFee')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHasFee(false)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    !hasFee
                      ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Users size={15} className={!hasFee ? 'text-amber-600' : 'text-slate-400'} />
                  <span className="text-[11px] text-center">{t('sessionNoFee')}</span>
                </button>
              </div>
            </div>

            {hasFee && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ยอดเรียกเก็บต่องวด (บาท) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required={hasFee}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">฿</span>
                </div>
              </div>
            )}

            {/* หัวข้อ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หัวข้อการพบปะ หรือหมายเหตุ
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="เช่น ตัฟซีรบทที่ 1, กิจกรรมพิเศษ"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* ปุ่ม Action */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || saving}
                className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border border-rose-200 transition-colors disabled:opacity-50"
                title="ลบงวดนี้"
              >
                <Trash2 size={14} />
                <span>{deleting ? 'กำลังลบ...' : t('deleteSession')}</span>
              </button>

              <button
                type="submit"
                disabled={saving || deleting}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <Save size={14} />
                <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* สมาชิกทั่วไป: แสดงแบบ Read-only */
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
              <div className="text-slate-500">ประเภทงวด:</div>
              <div className="font-bold text-slate-800">
                {(Number(session.amount_per_session) || 0) > 0
                  ? `เก็บเงินกองกลาง ฿${session.amount_per_session}/คน`
                  : 'งดเก็บเงิน (พบปะอย่างเดียว ฿0)'}
              </div>
              {session.topic_or_note && (
                <>
                  <div className="text-slate-500 pt-1">หัวข้อ:</div>
                  <div className="font-medium text-slate-800">{session.topic_or_note}</div>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              (ต้องเข้าสู่โหมดเหรัญญิกเพื่อแก้ไขหรือลบงวดนัด)
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              ปิด
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
