import React, { useState } from 'react';
import { AppData, Member } from '../types';
import { calculateMemberSummary, formatCurrency, formatThaiDate } from '../utils/calculations';
import {
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  X,
  Save
} from 'lucide-react';
import { executeAdminAction } from '../services/api';

interface MembersViewProps {
  data: AppData;
  isAdmin: boolean;
  adminPin: string;
  selectedMember: Member | null;
  onSelectMember: (member: Member | null) => void;
  onOpenAdminModal: () => void;
  onRefreshData: () => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  data,
  isAdmin,
  adminPin,
  selectedMember,
  onSelectMember,
  onOpenAdminModal,
  onRefreshData
}) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberInitial, setNewMemberInitial] = useState('0');

  // Edit Member Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');
  const [editInitial, setEditInitial] = useState('0');
  const [saving, setSaving] = useState(false);

  // คำนวณสรุปของทุกคน
  const summaries = data.members.map((m) =>
    calculateMemberSummary(m, data.sessions, data)
  );

  const filteredMembers = summaries.filter(
    (s) =>
      s.member.name.toLowerCase().includes(search.toLowerCase()) ||
      s.member.member_id.toLowerCase().includes(search.toLowerCase())
  );

  // ข้อมูลสมาชิกที่กำลังเปิดดูโปรไฟล์
  const activeSummary = selectedMember
    ? calculateMemberSummary(selectedMember, data.sessions, data)
    : null;

  const handleStartEdit = (m: Member) => {
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }
    setEditName(m.name);
    setEditStatus(m.status);
    setEditInitial(String(m.initial_balance || 0));
    setIsEditing(true);
  };

  const handleSaveMemberEdit = async () => {
    if (!selectedMember || !isAdmin) return;
    setSaving(true);

    const res = await executeAdminAction('update_member', adminPin, {
      member_id: selectedMember.member_id,
      name: editName.trim(),
      status: editStatus,
      initial_balance: parseFloat(editInitial) || 0
    });

    setSaving(false);
    if (res.success) {
      setIsEditing(false);
      onRefreshData();
      if (res.data) {
        const updated = res.data.members.find(
          (m) => m.member_id === selectedMember.member_id
        );
        if (updated) onSelectMember(updated);
      }
    } else {
      alert(res.error || 'บันทึกไม่สำเร็จ');
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    if (!newMemberName.trim()) {
      alert('กรุณาระบุชื่อสมาชิก');
      return;
    }

    setSaving(true);
    const res = await executeAdminAction('add_member', adminPin, {
      name: newMemberName.trim(),
      initial_balance: parseFloat(newMemberInitial) || 0
    });

    setSaving(false);
    if (res.success) {
      setShowAddModal(false);
      setNewMemberName('');
      setNewMemberInitial('0');
      onRefreshData();
    } else {
      alert(res.error || 'เพิ่มสมาชิกไม่สำเร็จ');
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. แถบหัวข้อและค้นหา */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">สมาชิกหะละเกาะฮฺ</h2>
            <p className="text-xs text-slate-500">
              แตะชื่อสมาชิกเพื่อดูประวัติการจ่าย ยอดค้าง และเปอร์เซ็นต์เข้าพบ
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <Plus size={14} /> เพิ่มสมาชิก
            </button>
          )}
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ หรือรหัสสมาชิก..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* 2. รายการสมาชิก (Card List) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredMembers.map((item) => {
          const m = item.member;
          return (
            <div
              key={m.member_id}
              onClick={() => onSelectMember(m)}
              className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                    item.isOverdue
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : item.isAdvance
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {m.name.slice(0, 2)}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-slate-900">{m.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {m.member_id}
                    </span>
                    {m.status === 'inactive' && (
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded">
                        ออกแล้ว
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>จ่าย ฿{formatCurrency(item.totalPaid)}</span>
                    <span>•</span>
                    <span>เข้า {item.attendanceStats.attendanceRate}%</span>
                  </div>
                </div>
              </div>

              {/* สถานะส่วนต่าง */}
              <div className="text-right">
                {item.isOverdue ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                    <AlertCircle size={12} />
                    ค้าง {item.overdueSessionsCount} ครั้ง
                  </span>
                ) : item.isAdvance ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 size={12} />
                    ล่วงหน้า {item.advanceSessionsCount} ครั้ง
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                    ครบถ้วน
                  </span>
                )}
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {item.netBalance >= 0 ? '+' : ''}฿{formatCurrency(item.netBalance)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 3. Modal โปรไฟล์สมาชิกแบบเจาะลึก (Member Detail Modal) */}
      {/* ========================================================= */}
      {selectedMember && activeSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar relative">
            <button
              onClick={() => {
                onSelectMember(null);
                setIsEditing(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              aria-label="ปิด"
            >
              <X size={20} />
            </button>

            {/* Profile Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shadow-xs">
                  {selectedMember.name.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{selectedMember.name}</span>
                    <span className="text-xs font-mono text-slate-400 font-normal">
                      {selectedMember.member_id}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    สถานะ:{' '}
                    <span
                      className={
                        selectedMember.status === 'active'
                          ? 'text-emerald-700 font-semibold'
                          : 'text-slate-400'
                      }
                    >
                      {selectedMember.status === 'active' ? 'ยังอยู่ในกลุ่ม' : 'ออกแล้ว'}
                    </span>
                  </p>
                </div>
              </div>

              {isAdmin && !isEditing && (
                <button
                  onClick={() => handleStartEdit(selectedMember)}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                >
                  <Edit2 size={13} /> แก้ไข
                </button>
              )}
            </div>

            {/* ฟอร์มแก้ไขข้อมูลสมาชิก (เฉพาะ Admin) */}
            {isEditing && (
              <div className="my-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">แก้ไขข้อมูลสมาชิก</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    ชื่อสมาชิก
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      สถานะ
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                    >
                      <option value="active">ยังอยู่ (active)</option>
                      <option value="inactive">ออกแล้ว (inactive)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ยอดยกมา (บาท)
                    </label>
                    <input
                      type="number"
                      value={editInitial}
                      onChange={(e) => setEditInitial(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSaveMemberEdit}
                    disabled={saving}
                    className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded-xl text-xs flex items-center gap-1 shadow-xs"
                  >
                    <Save size={13} /> {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>
              </div>
            )}

            {/* กล่องสรุปสถานะการเงิน */}
            <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-600">
                  สรุปสถานะการเงิน
                </span>
                {activeSummary.isOverdue ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300">
                    ค้างชำระ {activeSummary.overdueSessionsCount} ครั้ง (-฿{formatCurrency(Math.abs(activeSummary.netBalance))})
                  </span>
                ) : activeSummary.isAdvance ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    จ่ายล่วงหน้า {activeSummary.advanceSessionsCount} ครั้ง (+฿{formatCurrency(activeSummary.netBalance)})
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                    ครบถ้วนพอดี (฿0)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">ยอดยกมา</span>
                  <span className="font-bold text-slate-800 font-mono">
                    ฿{formatCurrency(selectedMember.initial_balance || 0)}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">จ่ายแล้วสะสม</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    ฿{formatCurrency(activeSummary.totalPaid)}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">ควรจ่าย</span>
                  <span className="font-bold text-slate-700 font-mono">
                    ฿{formatCurrency(activeSummary.totalExpected)}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">หักยอดสะสม</span>
                  <span className="font-bold text-rose-600 font-mono">
                    ฿{formatCurrency(activeSummary.individualDeductions)}
                  </span>
                </div>
              </div>
            </div>

            {/* สถิติการเข้าพบ (Attendance) */}
            <div className="mb-4 p-4 rounded-2xl bg-white border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  การเข้าร่วมพบปะ (Attendance)
                </span>
                <span className="text-xs font-extrabold text-emerald-700 font-mono">
                  {activeSummary.attendanceStats.attendanceRate}%
                </span>
              </div>

              {/* หลอด Progress Bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${activeSummary.attendanceStats.attendanceRate}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                  มา {activeSummary.attendanceStats.presentCount} ครั้ง
                </div>
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
                  ลา {activeSummary.attendanceStats.leaveCount} ครั้ง
                </div>
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-800">
                  ไม่มา {activeSummary.attendanceStats.absentCount} ครั้ง
                </div>
              </div>
            </div>

            {/* ประวัติการชำระเงินของคนนี้ */}
            <div className="space-y-2 mb-4">
              <h4 className="text-xs font-bold text-slate-800">ประวัติการชำระเงิน (Payments)</h4>
              {data.payments.filter((p) => p.member_id === selectedMember.member_id).length === 0 ? (
                <p className="text-center py-4 text-xs text-slate-400">ยังไม่มีประวัติการจ่ายเงิน</p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                  {data.payments
                    .filter((p) => p.member_id === selectedMember.member_id)
                    .map((p) => (
                      <div key={p.payment_id} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-full bg-emerald-100 text-emerald-700">
                            <ArrowDownLeft size={13} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {formatThaiDate(p.date)}
                            </p>
                            <p className="text-[10px] text-slate-400">{p.note || 'รับชำระเงิน'}</p>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-700 font-mono">
                          +฿{formatCurrency(p.amount)}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* รายจ่ายเฉพาะคนที่หักจากยอดสะสมคนนี้ */}
            {activeSummary.individualDeductions > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800">
                  รายการที่หักจากยอดสะสม (Individual Expenses)
                </h4>
                <div className="divide-y divide-slate-100">
                  {data.expenses
                    .filter(
                      (e) =>
                        e.expense_type === 'individual' &&
                        e.member_id === selectedMember.member_id &&
                        e.deduct_from === 'member_balance'
                    )
                    .map((e) => (
                      <div key={e.expense_id} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-full bg-rose-100 text-rose-700">
                            <ArrowUpRight size={13} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{e.item}</p>
                            <p className="text-[10px] text-slate-400">{formatThaiDate(e.date)}</p>
                          </div>
                        </div>
                        <span className="font-bold text-rose-600 font-mono">
                          -฿{formatCurrency(e.amount)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. Modal เพิ่มสมาชิกใหม่ (Add Member Modal) */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 p-1"
            >
              <X size={20} />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">เพิ่มสมาชิกใหม่</h3>
            <p className="text-xs text-slate-500 mb-4">ระบบจะสร้างรหัสสมาชิกอัตโนมัติ</p>

            <form onSubmit={handleCreateMember} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุล หรือชื่อเรียก <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="เช่น ซัยฟุลลอฮฺ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ยอดยกมาเริ่มต้น (บาท)
                </label>
                <input
                  type="number"
                  value={newMemberInitial}
                  onChange={(e) => setNewMemberInitial(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  *ใส่ยอดเป็นบวกถ้ามีเงินจ่ายเกินยกมา หรือลบถ้ามีหนี้ค้างเดิม
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {saving ? 'กำลังเพิ่ม...' : 'ยืนยันเพิ่ม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
