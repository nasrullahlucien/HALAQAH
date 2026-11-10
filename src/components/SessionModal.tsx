import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { executeAdminAction } from '../services/api';

interface SessionModalProps {
  isOpen: boolean;
  isAdmin: boolean;
  adminPin: string;
  defaultAmount: number;
  onClose: () => void;
  onOpenAdminModal: () => void;
  onRefreshData: () => void;
}

export const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  isAdmin,
  adminPin,
  defaultAmount,
  onClose,
  onOpenAdminModal,
  onRefreshData,
}) => {
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState(String(defaultAmount || 20));
  const [topic, setTopic] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    if (!sessionDate) {
      setError('กรุณาเลือกวันที่นัดพบ');
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 0) {
      setError('ยอดเก็บเงินต่อครั้งไม่ถูกต้อง');
      return;
    }

    setSaving(true);
    setError('');

    const res = await executeAdminAction('add_session', adminPin, {
      session_date: sessionDate,
      amount_per_session: amt,
      topic_or_note: topic.trim()
    });

    setSaving(false);
    if (res.success) {
      onRefreshData();
      onClose();
    } else {
      setError(res.error || 'เพิ่มงวดนัดไม่สำเร็จ');
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

        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">เพิ่มงวดนัดพบหะละเกาะฮฺ</h3>
            <p className="text-xs text-slate-500">กำหนดวันที่และยอดเรียกเก็บต่องวด</p>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ยอดเรียกเก็บต่องวด (บาท) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="20"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400">บาท</span>
            </div>
          </div>

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

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกงวดใหม่'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
