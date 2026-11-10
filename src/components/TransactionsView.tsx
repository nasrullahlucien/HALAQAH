import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  User,
  FileText,
  AlertCircle,
  Trash2,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { AppData, ExpenseType, DeductFrom } from '../types';
import { formatCurrency, formatThaiDate } from '../utils/calculations';
import { executeAdminAction } from '../services/api';

interface TransactionsViewProps {
  data: AppData;
  isAdmin: boolean;
  adminPin: string;
  onOpenAdminModal: () => void;
  onRefreshData: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  data,
  isAdmin,
  adminPin,
  onOpenAdminModal,
  onRefreshData
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'income' | 'expense' | 'history'>('income');

  // Form State: รายรับ
  const [paymentMemberId, setPaymentMemberId] = useState(data.members[0]?.member_id || '');
  const [paymentAmount, setPaymentAmount] = useState('20');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState('');

  // Form State: รายจ่าย
  const [expenseItem, setExpenseItem] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('อาหาร/เครื่องดื่ม');
  const [expenseType, setExpenseType] = useState<ExpenseType>('communal');
  const [expenseMemberId, setExpenseMemberId] = useState(data.members[0]?.member_id || '');
  const [expenseDeductFrom, setExpenseDeductFrom] = useState<DeductFrom>('group_fund');
  const [expenseReceiptUrl, setExpenseReceiptUrl] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Categories
  const categories = ['อาหาร/เครื่องดื่ม', 'เอกสาร/อุปกรณ์', 'สถานที่', 'วิทยากร/ของขวัญ', 'อื่นๆ'];
  // Amount presets
  const presetAmounts = [20, 40, 60, 100, 200];

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    if (!paymentMemberId) {
      setStatusMessage({ text: 'กรุณาเลือกสมาชิก', type: 'error' });
      return;
    }
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      setStatusMessage({ text: 'กรุณาระบุจำนวนเงินที่ถูกต้อง', type: 'error' });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    const result = await executeAdminAction('add_payment', adminPin, {
      member_id: paymentMemberId,
      amount: amt,
      date: paymentDate,
      note: paymentNote
    });

    setSubmitting(false);
    if (result.success) {
      setStatusMessage({ text: 'บันทึกรายรับสำเร็จเรียบร้อย', type: 'success' });
      setPaymentNote('');
      onRefreshData();
    } else {
      setStatusMessage({ text: result.error || 'บันทึกไม่สำเร็จ', type: 'error' });
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    if (!expenseItem.trim()) {
      setStatusMessage({ text: 'กรุณาระบุรายการค่าใช้จ่าย', type: 'error' });
      return;
    }
    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt <= 0) {
      setStatusMessage({ text: 'กรุณาระบุจำนวนเงินที่ถูกต้อง', type: 'error' });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    const result = await executeAdminAction('add_expense', adminPin, {
      item: expenseItem.trim(),
      amount: amt,
      category: expenseCategory,
      expense_type: expenseType,
      member_id: expenseType === 'individual' ? expenseMemberId : '',
      deduct_from: expenseType === 'individual' ? expenseDeductFrom : 'group_fund',
      receipt_url: expenseReceiptUrl.trim(),
      date: expenseDate
    });

    setSubmitting(false);
    if (result.success) {
      setStatusMessage({ text: 'บันทึกรายจ่ายสำเร็จเรียบร้อย', type: 'success' });
      setExpenseItem('');
      setExpenseAmount('');
      setExpenseReceiptUrl('');
      onRefreshData();
    } else {
      setStatusMessage({ text: result.error || 'บันทึกไม่สำเร็จ', type: 'error' });
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }
    if (!confirm('ยืนยันการลบรายการรับเงินนี้?')) return;

    const res = await executeAdminAction('delete_payment', adminPin, { payment_id: paymentId });
    if (res.success) {
      onRefreshData();
    } else {
      alert(res.error || 'ลบไม่สำเร็จ');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }
    if (!confirm('ยืนยันการลบรายการจ่ายเงินนี้?')) return;

    const res = await executeAdminAction('delete_expense', adminPin, { expense_id: expenseId });
    if (res.success) {
      onRefreshData();
    } else {
      alert(res.error || 'ลบไม่สำเร็จ');
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* แท็บสลับ: บันทึกรับ / บันทึกจ่าย / ประวัติ */}
      <div className="bg-slate-200/80 p-1 rounded-2xl grid grid-cols-3 text-xs font-semibold">
        <button
          onClick={() => {
            setActiveSubTab('income');
            setStatusMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'income'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownLeft size={15} className="text-emerald-600" />
          <span>บันทึกรายรับ</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('expense');
            setStatusMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'expense'
              ? 'bg-white text-rose-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight size={15} className="text-rose-600" />
          <span>บันทึกรายจ่าย</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('history');
            setStatusMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'history'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText size={15} />
          <span>ประวัติทั้งหมด</span>
        </button>
      </div>

      {/* แจ้งเตือนสถานะการบันทึก */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ไม่ได้อยู่ในโหมดผู้ดูแล */}
      {!isAdmin && activeSubTab !== 'history' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 flex items-start justify-between gap-3">
          <div>
            <p className="font-bold">ขณะนี้ท่านอยู่ในโหมดสมาชิก (ดูอย่างเดียว)</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              ต้องเข้าสู่โหมดผู้ดูแล/เหรัญญิกเพื่อบันทึกรายการ
            </p>
          </div>
          <button
            onClick={onOpenAdminModal}
            className="px-3 py-1.5 bg-amber-600 text-white font-semibold rounded-lg shrink-0 shadow-xs"
          >
            ใส่ PIN เหรัญญิก
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. ฟอร์มบันทึกรายรับ (Income Form) */}
      {/* ========================================================= */}
      {activeSubTab === 'income' && (
        <form onSubmit={handleIncomeSubmit} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              บันทึกการชำระเงินของสมาชิก
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              จ่ายก้อนเดียวหลายครั้งหรือจ่ายค้างได้ ระบบจะตัดงวดเก่าสุดให้อัตโนมัติ
            </p>
          </div>

          {/* เลือกสมาชิก */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              สมาชิกผู้จ่าย <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={paymentMemberId}
                onChange={(e) => setPaymentMemberId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {data.members.map((m) => (
                  <option key={m.member_id} value={m.member_id}>
                    {m.name} ({m.member_id}) {m.status === 'inactive' ? '(ออกแล้ว)' : ''}
                  </option>
                ))}
              </select>
              <User size={15} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* จำนวนเงิน */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              จำนวนเงิน (บาท) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="any"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="ระบุจำนวนเงิน เช่น 20, 60"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <span className="absolute right-3 top-3 text-xs text-slate-400 font-medium">บาท</span>
            </div>

            {/* ปุ่มลัดจำนวนเงิน */}
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPaymentAmount(String(amt))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    paymentAmount === String(amt)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* วันที่รับเงิน */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              วันที่รับเงิน
            </label>
            <div className="relative">
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <Calendar size={15} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* หมายเหตุ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเหตุ (ถ้ามี)
            </label>
            <input
              type="text"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="เช่น โอนเข้าบัญชี, เงินสด, จ่ายล่วงหน้า 3 ครั้ง"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all active:scale-98 disabled:opacity-50"
          >
            {submitting ? 'กำลังบันทึก...' : 'บันทึกการรับเงิน'}
          </button>
        </form>
      )}

      {/* ========================================================= */}
      {/* 2. ฟอร์มบันทึกรายจ่าย (Expense Form) */}
      {/* ========================================================= */}
      {activeSubTab === 'expense' && (
        <form onSubmit={handleExpenseSubmit} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              บันทึกรายการรายจ่าย
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              รองรับทั้งรายจ่ายส่วนกลาง และรายจ่ายเฉพาะคน (เลือกแหล่งหักเงินได้)
            </p>
          </div>

          {/* รายการ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รายการค่าใช้จ่าย <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={expenseItem}
              onChange={(e) => setExpenseItem(e.target.value)}
              placeholder="เช่น ค่าอาหารว่าง, ค่าถ่ายเอกสาร, หนังสือ"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* จำนวนเงิน */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              จำนวนเงิน (บาท) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="any"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="ระบุจำนวนเงิน"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* หมวดหมู่ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมวดหมู่
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setExpenseCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    expenseCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ประเภทรายจ่าย: ส่วนกลาง vs เฉพาะคน */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ประเภทรายจ่าย
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                  expenseType === 'communal'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="expenseType"
                  value="communal"
                  checked={expenseType === 'communal'}
                  onChange={() => setExpenseType('communal')}
                  className="sr-only"
                />
                <span>ส่วนกลาง (ทั้งกลุ่ม)</span>
              </label>

              <label
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                  expenseType === 'individual'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="expenseType"
                  value="individual"
                  checked={expenseType === 'individual'}
                  onChange={() => setExpenseType('individual')}
                  className="sr-only"
                />
                <span>เฉพาะคน (รายบุคคล)</span>
              </label>
            </div>
          </div>

          {/* ตัวเลือกเพิ่มเติมเมื่อเลือก "เฉพาะคน" */}
          {expenseType === 'individual' && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
              <div>
                <label className="block text-xs font-semibold text-amber-900 mb-1">
                  เลือกสมาชิกที่เป็นเจ้าของค่าใช้จ่าย
                </label>
                <select
                  value={expenseMemberId}
                  onChange={(e) => setExpenseMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-800"
                >
                  {data.members.map((m) => (
                    <option key={m.member_id} value={m.member_id}>
                      {m.name} ({m.member_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-900 mb-1">
                  แหล่งหักเงิน
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label
                    className={`p-2 rounded-lg border cursor-pointer text-center font-medium ${
                      expenseDeductFrom === 'group_fund'
                        ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deductFrom"
                      value="group_fund"
                      checked={expenseDeductFrom === 'group_fund'}
                      onChange={() => setExpenseDeductFrom('group_fund')}
                      className="sr-only"
                    />
                    <span>หักจากกองกลาง</span>
                  </label>

                  <label
                    className={`p-2 rounded-lg border cursor-pointer text-center font-medium ${
                      expenseDeductFrom === 'member_balance'
                        ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deductFrom"
                      value="member_balance"
                      checked={expenseDeductFrom === 'member_balance'}
                      onChange={() => setExpenseDeductFrom('member_balance')}
                      className="sr-only"
                    />
                    <span>หักจากยอดสะสมคนนั้น</span>
                  </label>
                </div>
                <p className="text-[10px] text-amber-800 mt-1">
                  *หักจากยอดสะสมคนนั้น จะปรับลดยอดคงเหลือ/เพิ่มยอดค้างของคนนั้นโดยไม่กระทบกองกลาง
                </p>
              </div>
            </div>
          )}

          {/* ลิงก์รูปใบเสร็จ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ลิงก์รูปใบเสร็จ / สลิป (ถ้ามี)
            </label>
            <input
              type="url"
              value={expenseReceiptUrl}
              onChange={(e) => setExpenseReceiptUrl(e.target.value)}
              placeholder="https://drive.google.com/... หรือ ลิงก์รูปภาพ"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* วันที่จ่าย */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              วันที่จ่ายเงิน
            </label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all active:scale-98 disabled:opacity-50"
          >
            {submitting ? 'กำลังบันทึก...' : 'บันทึกรายจ่าย'}
          </button>
        </form>
      )}

      {/* ========================================================= */}
      {/* 3. ประวัติรายการทั้งหมด (All Transactions History) */}
      {/* ========================================================= */}
      {activeSubTab === 'history' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              ประวัติรายการรับ-จ่ายทั้งหมด
            </h3>

            <div className="space-y-2">
              {data.payments.length === 0 && data.expenses.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">ยังไม่มีรายการใดๆ</p>
              ) : (
                [
                  ...data.payments.map((p) => {
                    const m = data.members.find((mem) => mem.member_id === p.member_id);
                    return {
                      type: 'payment' as const,
                      id: p.payment_id,
                      date: p.date,
                      title: `รับเงิน: ${m?.name || p.member_id}`,
                      sub: p.note || 'ชำระค่าหะละเกาะฮฺ',
                      amount: p.amount,
                      raw: p
                    };
                  }),
                  ...data.expenses.map((e) => {
                    const m = e.member_id ? data.members.find((mem) => mem.member_id === e.member_id) : null;
                    return {
                      type: 'expense' as const,
                      id: e.expense_id,
                      date: e.date,
                      title: `จ่าย: ${e.item}`,
                      sub: `${e.category} • ${
                        e.expense_type === 'communal'
                          ? 'กองกลาง'
                          : `เฉพาะคน (${m?.name || e.member_id} หัก${e.deduct_from === 'group_fund' ? 'กองกลาง' : 'ยอดสะสม'})`
                      }`,
                      amount: e.amount,
                      raw: e
                    };
                  })
                ]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            item.type === 'payment'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {item.type === 'payment' ? (
                            <ArrowDownLeft size={16} />
                          ) : (
                            <ArrowUpRight size={16} />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{item.title}</p>
                          <p className="text-[11px] text-slate-500">
                            {formatThaiDate(item.date)} • {item.sub}
                          </p>
                          {item.type === 'expense' && (item.raw as any).receipt_url && (
                            <a
                              href={(item.raw as any).receipt_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-emerald-600 hover:underline mt-0.5"
                            >
                              <ExternalLink size={10} /> ดูรูปใบเสร็จ
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold ${
                            item.type === 'payment' ? 'text-emerald-700' : 'text-slate-900'
                          }`}
                        >
                          {item.type === 'payment' ? '+' : '-'}฿{formatCurrency(item.amount)}
                        </span>

                        {isAdmin && (
                          <button
                            onClick={() =>
                              item.type === 'payment'
                                ? handleDeletePayment(item.id)
                                : handleDeleteExpense(item.id)
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="ลบรายการ"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
