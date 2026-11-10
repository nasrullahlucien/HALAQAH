import React, { useState } from 'react';
import { Lock, X, KeyRound, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { executeAdminAction } from '../services/api';

interface AdminPinModalProps {
  isOpen: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onAdminLogin: (pin: string) => void;
  onAdminLogout: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  isAdmin,
  onClose,
  onAdminLogin,
  onAdminLogout,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('กรุณาใส่รหัส PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await executeAdminAction('verify_pin', pin.trim(), {});
      if (result.success) {
        onAdminLogin(pin.trim());
        setPin('');
        onClose();
      } else {
        setError(result.error || 'รหัส PIN ไม่ถูกต้อง');
      }
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถตรวจสอบสิทธิ์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onAdminLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          aria-label="ปิด"
        >
          <X size={20} />
        </button>

        {isAdmin ? (
          <div className="text-center py-2">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">กำลังอยู่ในโหมดผู้ดูแล/เหรัญญิก</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              ท่านสามารถบันทึกรายรับ รายจ่าย เช็คชื่อ และจัดการสมาชิกได้
            </p>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium rounded-xl border border-rose-200 transition-colors"
            >
              <LogOut size={16} />
              <span>ออกจากโหมดผู้ดูแล (กลับเป็นโหมดดูอย่างเดียว)</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-700">
              <Lock size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">เข้าสู่โหมดผู้ดูแล / เหรัญญิก</h3>
            <p className="text-xs text-slate-500 text-center mt-1 mb-4">
              กรอกรหัส PIN เพื่อปลดล็อกสิทธิ์การบันทึกและแก้ไขข้อมูลการเงิน
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัส PIN ผู้ดูแลระบบ
                </label>
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    autoFocus
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setError('');
                    }}
                    placeholder="ใส่ PIN 4-6 หลัก"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <KeyRound size={16} className="absolute left-3 top-3.5 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-400 text-center mt-1">
                  (รหัสเริ่มต้น: 123456 สามารถเปลี่ยนได้ใน Apps Script)
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'กำลังตรวจ...' : 'เข้าสู่ระบบ'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
