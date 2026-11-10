import React, { useState } from 'react';
import { X, Globe, Save, CheckCircle, HelpCircle } from 'lucide-react';
import { getApiUrl, setApiUrl } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [url, setUrl] = useState(getApiUrl());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiUrl(url);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSaved();
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setUrl('');
    setApiUrl('');
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSaved();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          aria-label="ปิด"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">ตั้งค่าการเชื่อมต่อฐานข้อมูล</h3>
            <p className="text-xs text-slate-500">Google Apps Script Web App URL</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Web App URL (ลงท้ายด้วย /exec)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              *หากเว้นว่างไว้ ระบบจะทำงานในโหมดสาธิต (Demo Offline Mode)
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1 font-semibold text-slate-800">
              <HelpCircle size={14} className="text-emerald-600" />
              <span>วิธีรับ Web App URL:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-500">
              <li>สร้าง Google Sheets แล้วเปิด Extensions &gt; Apps Script</li>
              <li>วางโค้ดจาก <code className="bg-slate-200 px-1 rounded text-slate-800">google-apps-script/Code.gs</code></li>
              <li>กด Deploy &gt; New deployment &gt; Web app</li>
              <li>ตั้งค่า Who has access เป็น <b>"Anyone"</b></li>
              <li>คัดลอก Web App URL มาใส่ในช่องด้านบน</li>
            </ol>
          </div>

          {saved && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs">
              <CheckCircle size={16} />
              <span>บันทึกการตั้งค่าเรียบร้อยแล้ว กำลังโหลดข้อมูล...</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 text-xs text-slate-500 hover:text-rose-600 transition-colors"
            >
              ล้างเป็นค่าเริ่มต้น
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <Save size={14} />
              <span>บันทึก</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
