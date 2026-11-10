import React, { useState, useEffect } from 'react';
import { AppData, AmanahRecord, AmanahAssignment } from '../types';
import { formatThaiDate } from '../utils/calculations';
import {
  BookOpen,
  Copy,
  Check,
  Edit2,
  Plus,
  Trash2,
  Calendar,
  Save,
  MessageCircle
} from 'lucide-react';
import { executeAdminAction } from '../services/api';

interface AmanahViewProps {
  data: AppData;
  isAdmin: boolean;
  adminPin: string;
  onOpenAdminModal: () => void;
  onRefreshData: () => void;
}

export const AmanahView: React.FC<AmanahViewProps> = ({
  data,
  isAdmin,
  adminPin,
  onOpenAdminModal,
  onRefreshData
}) => {
  const amanahList = data.amanah || [];

  // เรียงลำดับ Amanah ตามวันที่ จากใหม่สุดไปเก่าสุด
  const sortedAmanah = [...amanahList].sort((a, b) =>
    b.session_date.localeCompare(a.session_date)
  );

  const [selectedDate, setSelectedDate] = useState<string>(
    sortedAmanah[0]?.session_date || '2026-09-23'
  );

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Form State
  const [editSessionDate, setEditSessionDate] = useState<string>(selectedDate);
  const [editAssignments, setEditAssignments] = useState<AmanahAssignment[]>([]);
  const [editGeneralTasks, setEditGeneralTasks] = useState<string[]>([]);
  const [editLocation, setEditLocation] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');

  // ค้นหา Record ของวันที่เลือก
  const currentRecord = amanahList.find((a) => a.session_date === selectedDate) || sortedAmanah[0];

  useEffect(() => {
    if (currentRecord) {
      setEditSessionDate(currentRecord.session_date);
      setEditAssignments(currentRecord.assignments || []);
      setEditGeneralTasks(currentRecord.general_tasks || []);
      setEditLocation(currentRecord.location || '');
      setEditNote(currentRecord.note || 'อินชาอัลลอฮฺ');
    } else {
      // Default template
      setEditSessionDate(selectedDate);
      setEditAssignments([
        { role: 'ตัฟซีร', member_id: data.members[0]?.member_id || '', topic: '' },
        { role: 'ฮาดิษ', member_id: data.members[1]?.member_id || '', topic: '' },
        { role: 'ข่าว', member_id: data.members[2]?.member_id || '', topic: '' },
        { role: 'ดำเนินรายการ', member_id: data.members[3]?.member_id || '', topic: '' }
      ]);
      setEditGeneralTasks([
        'อ่านอัลกุรอาน อย่างน้อยคนละ 2 หน้า',
        'วากัฟ (สัปดาห์ละครั้ง)'
      ]);
      setEditLocation('มัสยิดคอลิด/ดูความเหมาะสมของสถานที่');
      setEditNote('อินชาอัลลอฮฺ');
    }
  }, [selectedDate, currentRecord, data.members]);

  // สร้างข้อความ LINE Format ตามรูปเป๊ะ
  const generateLineMessage = (record?: AmanahRecord): string => {
    const rec = record || currentRecord;
    if (!rec) return '';

    // แปลงวันที่เป็น ว/ด/ป (พ.ศ. 2 หลัก เช่น 23/9/69)
    const [y, m, d] = rec.session_date.split('-');
    const thaiYear2Digits = y ? String(parseInt(y, 10) + 543).slice(-2) : '69';
    const shortDateFormatted = `${parseInt(d, 10)}/${parseInt(m, 10)}/${thaiYear2Digits}`;

    let msg = `السلام عليكم ورحمة الله وبركاته\n\n`;
    msg += `** ฮาลาเกาะฮฺ สัปดาห์นี้\n`;
    msg += `${shortDateFormatted}\n\n`;

    // Roles & Assignments
    rec.assignments.forEach((assign) => {
      const member = data.members.find((m) => m.member_id === assign.member_id);
      const name = member?.name || assign.member_id;
      const honorific = name.startsWith('อ.') ? name : `อ.${name}`;

      if (assign.role.includes('ตัฟซีร')) {
        msg += `✍️ ${assign.role} ${assign.topic ? assign.topic + ' ' : ''}(${honorific})\n`;
      } else if (
        assign.role.includes('ฮาดิษ') ||
        assign.role.includes('ฮะดีษ') ||
        assign.role.includes('ฟิกฮฺ') ||
        assign.role.includes('ฟิกฮ์') ||
        assign.role.includes('อากีดะ') ||
        assign.role.includes('อะกีดะ')
      ) {
        msg += `📝 ${assign.role}${assign.topic ? ' ' + assign.topic : ''} (${honorific})\n`;
      } else if (assign.role.includes('ข่าว')) {
        msg += `✍️ ${assign.role} (${honorific})\n`;
      } else if (assign.role.includes('ดำเนินรายการ')) {
        msg += `✍️✍️ ${assign.role} (${honorific})\n`;
      } else {
        msg += `✍️ ${assign.role}${assign.topic ? ' ' + assign.topic : ''} (${honorific})\n`;
      }
    });

    // ภารกิจผู้ศรัทธา
    if (rec.general_tasks && rec.general_tasks.length > 0) {
      msg += `\n✅✅ ภารกิจผู้ศรัทธา\n`;
      rec.general_tasks.forEach((task) => {
        msg += `✍️ ${task}\n`;
      });
    }

    // สถานที่
    if (rec.location) {
      msg += `\n🏍️🚙🚲 สถานที่ ${rec.location}\n`;
    }

    // หมายเหตุ / อินชาอัลลอฮฺ
    if (rec.note) {
      msg += `\n** ${rec.note} **`;
    }

    return msg;
  };

  const handleCopyLine = () => {
    const text = generateLineMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToLine = () => {
    const text = generateLineMessage();
    const encoded = encodeURIComponent(text);
    window.open(`https://line.me/R/msg/text/?${encoded}`, '_blank');
  };

  const handleSave = async () => {
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    setSaving(true);
    const newAmanah: AmanahRecord = {
      session_date: editSessionDate,
      assignments: editAssignments,
      general_tasks: editGeneralTasks.filter((t) => t.trim().length > 0),
      location: editLocation.trim(),
      note: editNote.trim()
    };

    const res = await executeAdminAction('save_amanah', adminPin, newAmanah);
    setSaving(false);

    if (res.success) {
      setIsEditing(false);
      setSelectedDate(editSessionDate);
      onRefreshData();
    } else {
      alert(res.error || 'บันทึกข้อมูลไม่สำเร็จ');
    }
  };

  const handleAddAssignment = () => {
    setEditAssignments([
      ...editAssignments,
      { role: 'หน้าที่เพิ่มเติม', member_id: data.members[0]?.member_id || '', topic: '' }
    ]);
  };

  const handleRemoveAssignment = (index: number) => {
    setEditAssignments(editAssignments.filter((_, i) => i !== index));
  };

  const handleAddTask = () => {
    setEditGeneralTasks([...editGeneralTasks, '']);
  };

  const handleRemoveTask = (index: number) => {
    setEditGeneralTasks(editGeneralTasks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header & Date Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-bold shadow-xs">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>อามานะฮ์ประจำสัปดาห์</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                  หน้าที่รับผิดชอบ
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                มอบหมายบทบาทและภารกิจสำหรับนัดพบสัปดาห์ถัดไป
              </p>
            </div>
          </div>

          {isAdmin && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-2xs"
            >
              <Edit2 size={13} /> แก้ไข
            </button>
          )}
        </div>

        {/* เลือกรอบวันที่อามานะฮ์ */}
        {!isEditing && (
          <div className="flex items-center gap-2 pt-1">
            <Calendar size={16} className="text-slate-400 shrink-0" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              {sortedAmanah.map((a) => (
                <option key={a.session_date} value={a.session_date}>
                  นัดพบสัปดาห์นี้: {formatThaiDate(a.session_date)}
                </option>
              ))}
              {!sortedAmanah.some((a) => a.session_date === selectedDate) && (
                <option value={selectedDate}>{formatThaiDate(selectedDate)}</option>
              )}
            </select>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. โหมดแสดงผล (Preview Mode & Copy to LINE Card) */}
      {/* ========================================================= */}
      {!isEditing ? (
        <div className="space-y-3">
          {/* การ์ดจำลองข้อความ LINE (LINE Style Preview Card) */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 rounded-3xl border-2 border-emerald-500/20 p-5 shadow-sm space-y-4">
            <div className="text-center pb-2 border-b border-emerald-100">
              <p className="text-xs text-emerald-800 font-semibold tracking-wider font-mono">
                السلام عليكم ورحمة الله وبركاته
              </p>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                ⭐ ฮาลาเกาะฮฺ สัปดาห์นี้
              </h3>
              <p className="text-xs font-bold text-emerald-700 font-mono mt-0.5">
                {formatThaiDate(selectedDate)}
              </p>
            </div>

            {/* รายการหน้าที่รับผิดชอบ (Roles List) */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                หน้าที่รับผิดชอบแต่ละคน
              </h4>
              {currentRecord?.assignments.map((assign, idx) => {
                const member = data.members.find((m) => m.member_id === assign.member_id);
                const name = member?.name || assign.member_id;

                return (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">
                        {assign.role.includes('ตัฟซีร')
                          ? '📖'
                          : assign.role.includes('ฮาดิษ') ||
                            assign.role.includes('ฮะดีษ') ||
                            assign.role.includes('ฟิกฮฺ') ||
                            assign.role.includes('ฟิกฮ์') ||
                            assign.role.includes('อากีดะ') ||
                            assign.role.includes('อะกีดะ')
                          ? '📝'
                          : assign.role.includes('ดำเนินรายการ')
                          ? '🎙️'
                          : '✍️'}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-800">{assign.role}</span>
                        {assign.topic && (
                          <p className="text-[11px] text-emerald-700 font-medium">
                            {assign.topic}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        อ.{name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ภารกิจผู้ศรัทธา (General Deeds) */}
            {currentRecord?.general_tasks && currentRecord.general_tasks.length > 0 && (
              <div className="p-3.5 bg-emerald-100/40 rounded-2xl border border-emerald-200/80 space-y-2">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <span className="text-base">✅✅</span> ภารกิจผู้ศรัทธา
                </h4>
                <div className="space-y-1.5 pl-1">
                  {currentRecord.general_tasks.map((task, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="text-emerald-600 font-bold shrink-0">✍️</span>
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* สถานที่นัดพบ */}
            {currentRecord?.location && (
              <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center gap-2 text-xs text-slate-700">
                <span className="text-base">🏍️🚙🚲</span>
                <div>
                  <span className="font-semibold text-slate-900">สถานที่: </span>
                  <span>{currentRecord.location}</span>
                </div>
              </div>
            )}

            {/* ข้อความปิดท้าย */}
            {currentRecord?.note && (
              <div className="text-center pt-1 text-xs font-bold text-slate-600">
                ** {currentRecord.note} **
              </div>
            )}
          </div>

          {/* ปุ่ม Action: คัดลอกส่ง LINE & แชร์ */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCopyLine}
              className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} className="text-emerald-600" />}
              <span>{copied ? 'คัดลอกข้อความแล้ว!' : 'คัดลอกข้อความ LINE'}</span>
            </button>

            <button
              onClick={handleShareToLine}
              className="py-3 px-4 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-[#06C755]/20 transition-all active:scale-98"
            >
              <MessageCircle size={16} />
              <span>ส่งเข้ากลุ่ม LINE</span>
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* 3. โหมดแก้ไขข้อมูล (Edit / Create Amanah Form) */
        /* ========================================================= */
        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">แก้ไขข้อมูลอามานะฮ์</h3>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              ยกเลิก
            </button>
          </div>

          {/* วันที่นัดพบ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              วันที่นัดพบ (สัปดาห์นี้)
            </label>
            <input
              type="date"
              value={editSessionDate}
              onChange={(e) => setEditSessionDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>

          {/* รายการมอบหมายหน้าที่ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                หน้าที่รับผิดชอบประจำสัปดาห์
              </label>
              <button
                type="button"
                onClick={handleAddAssignment}
                className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus size={12} /> เพิ่มหน้าที่
              </button>
            </div>

            <div className="space-y-3">
              {editAssignments.map((assign, idx) => {
                const isPresetRole = ['ตัฟซีร', 'ฮาดิษ', 'อัลฟิกฮฺ', 'อากีดะห์', 'ข่าว', 'ดำเนินรายการ'].includes(assign.role);
                const isKnowledgeRole = ['ฮาดิษ', 'อัลฟิกฮฺ', 'อากีดะห์'].includes(assign.role);

                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-center gap-2">
                      {/* เมนูเลือกหน้าที่หลัก */}
                      <select
                        value={isPresetRole ? assign.role : 'อื่นๆ'}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = [...editAssignments];
                          if (val === 'อื่นๆ') {
                            updated[idx].role = '';
                          } else {
                            updated[idx].role = val;
                          }
                          setEditAssignments(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                      >
                        <optgroup label="หมวดวิชาความรู้">
                          <option value="ฮาดิษ">ฮาดิษ</option>
                          <option value="อัลฟิกฮฺ">อัลฟิกฮฺ</option>
                          <option value="อากีดะห์">อากีดะห์</option>
                          <option value="ตัฟซีร">ตัฟซีร</option>
                        </optgroup>
                        <optgroup label="บทบาททั่วไป">
                          <option value="ข่าว">ข่าว</option>
                          <option value="ดำเนินรายการ">ดำเนินรายการ</option>
                          <option value="อื่นๆ">อื่นๆ (ระบุเอง)</option>
                        </optgroup>
                      </select>

                      {/* เลือกสมาชิกผู้รับผิดชอบ */}
                      <select
                        value={assign.member_id}
                        onChange={(e) => {
                          const updated = [...editAssignments];
                          updated[idx].member_id = e.target.value;
                          setEditAssignments(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                      >
                        {data.members.map((m) => (
                          <option key={m.member_id} value={m.member_id}>
                            {m.name}
                          </option>
                        ))}
                      </select>

                      {/* ปุ่มลบหน้าที่ */}
                      <button
                        type="button"
                        onClick={() => handleRemoveAssignment(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="ลบหน้าที่นี้"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* แถบตัวเลือกด่วน "ฮาดิษ, อัลฟิกฮฺ, อากีดะห์, อื่นๆ" */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">เลือกวิชา:</span>
                      {['ฮาดิษ', 'อัลฟิกฮฺ', 'อากีดะห์', 'อื่นๆ'].map((opt) => {
                        const isSelected =
                          opt === 'อื่นๆ'
                            ? !['ฮาดิษ', 'อัลฟิกฮฺ', 'อากีดะห์', 'ตัฟซีร', 'ข่าว', 'ดำเนินรายการ'].includes(assign.role)
                            : assign.role === opt;

                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              const updated = [...editAssignments];
                              if (opt === 'อื่นๆ') {
                                if (isKnowledgeRole) {
                                  updated[idx].role = '';
                                }
                              } else {
                                updated[idx].role = opt;
                              }
                              setEditAssignments(updated);
                            }}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                              isSelected
                                ? 'bg-amber-500 text-white shadow-2xs font-bold'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* ช่องกรอกข้อความเมื่อเลือก "อื่นๆ" */}
                    {!isPresetRole && (
                      <input
                        type="text"
                        value={assign.role}
                        onChange={(e) => {
                          const updated = [...editAssignments];
                          updated[idx].role = e.target.value;
                          setEditAssignments(updated);
                        }}
                        placeholder="พิมพ์ชื่อหน้าที่/บทบาท เช่น ตัจญ์วีด, ดุอาอ์, อาหารว่าง"
                        className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    )}

                    {/* ช่องกรอกหัวข้อ/รายละเอียด */}
                    <input
                      type="text"
                      value={assign.topic || ''}
                      onChange={(e) => {
                        const updated = [...editAssignments];
                        updated[idx].topic = e.target.value;
                        setEditAssignments(updated);
                      }}
                      placeholder={
                        assign.role.includes('ตัฟซีร')
                          ? 'เช่น ซูเราะฮฺ อัลฆอชิยะฮ์ อายัต 8 - 14'
                          : assign.role === 'อัลฟิกฮฺ'
                          ? 'เช่น บทเรื่องการละหมาด หรือเงื่อนไขวุฎูอ์'
                          : assign.role === 'อากีดะห์'
                          ? 'เช่น เตาฮีด 3 ประการ'
                          : 'หัวข้อ หรือรายละเอียดเพิ่มเติม (ถ้ามี)'
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ภารกิจผู้ศรัทธา */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                ภารกิจผู้ศรัทธา (ทุกคนทำร่วมกัน)
              </label>
              <button
                type="button"
                onClick={handleAddTask}
                className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus size={12} /> เพิ่มภารกิจ
              </button>
            </div>

            <div className="space-y-1.5">
              {editGeneralTasks.map((task, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => {
                      const updated = [...editGeneralTasks];
                      updated[idx] = e.target.value;
                      setEditGeneralTasks(updated);
                    }}
                    placeholder="เช่น อ่านอัลกุรอาน 2 หน้า, วากัฟ"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* สถานที่ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              สถานที่นัดพบ
            </label>
            <input
              type="text"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              placeholder="เช่น มัสยิดคอลิด/ดูความเหมาะสมของสถานที่"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* ข้อคิด/คำลงท้าย */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ข้อความลงท้าย
            </label>
            <input
              type="text"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="เช่น อินชาอัลลอฮฺ"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* ปุ่มบันทึก */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Save size={15} />
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึกอามานะฮ์'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
