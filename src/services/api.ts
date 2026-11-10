import { AppData, AttendanceRecord, Expense, Member, Payment, Session } from '../types';
import { initialMockData } from '../data/mockData';

const STORAGE_KEY = 'halaqah_data_cache';
const API_URL_KEY = 'halaqah_api_url';
export const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbxuae5DUtmkkxOog5HR4d3BhyOLWQ1H5MCSS9iT716mtjxaIinzKiZUL7mWJDuJZycK/exec';

export const getApiUrl = (): string => {
  return localStorage.getItem(API_URL_KEY) || import.meta.env.VITE_API_URL || DEFAULT_API_URL;
};

export const setApiUrl = (url: string): void => {
  if (url) {
    localStorage.setItem(API_URL_KEY, url.trim());
  } else {
    localStorage.removeItem(API_URL_KEY);
  }
};

/**
 * โหลดข้อมูลเริ่มต้นจาก Cache หรือ MockData
 */
export const getCachedData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse cached data', e);
  }
  return initialMockData;
};

/**
 * บันทึกลง LocalStorage Cache
 */
export const saveCachedData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to local cache', e);
  }
};

/**
 * ดึงข้อมูลทั้งหมดจาก Google Apps Script (หรือ Cache ถ้ายังไม่ได้ใส่ URL)
 */
export const fetchAllData = async (): Promise<{ data: AppData; isOffline: boolean }> => {
  const url = getApiUrl();
  if (!url) {
    return { data: getCachedData(), isOffline: true };
  }

  try {
    // ใส่ timestamp ป้องกัน Browser Cache ของ GET request
    const response = await fetch(`${url}?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success && result.data) {
      saveCachedData(result.data);
      return { data: result.data, isOffline: false };
    } else {
      throw new Error(result.error || 'โครงสร้างข้อมูลตอบกลับไม่ถูกต้อง');
    }
  } catch (error: any) {
    console.warn('Cannot fetch from Google Apps Script, falling back to cache:', error);
    return { data: getCachedData(), isOffline: true };
  }
};

/**
 * ส่งคำสั่งบันทึก / แก้ไข / ลบข้อมูลไปยัง Google Apps Script
 */
export const executeAdminAction = async (
  action: string,
  adminPin: string,
  payload: any
): Promise<{ success: boolean; data?: AppData; error?: string; message?: string }> => {
  const url = getApiUrl();

  // หากไม่มี URL ให้ทำงานแบบ Local Mock Mode เพื่อให้ทดสอบระบบได้ทันที
  if (!url) {
    return handleLocalAction(action, adminPin, payload);
  }

  try {
    // Apps Script รับ POST ดีที่สุดเมื่อใช้ text/plain เพื่อเลี่ยงปัญหา CORS Preflight
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action,
        admin_pin: adminPin,
        payload
      })
    });

    const result = await response.json();
    if (result.success) {
      if (result.data) {
        saveCachedData(result.data);
      }
      return {
        success: true,
        data: result.data,
        message: result.result?.message || 'ดำเนินการสำเร็จ'
      };
    } else {
      return {
        success: false,
        error: result.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
      };
    }
  } catch (error: any) {
    console.error('API Post error:', error);
    return {
      success: false,
      error: error.message || 'ไม่สามารถเชื่อมต่อกับ Google Apps Script ได้ กรุณาตรวจสอบอินเทอร์เน็ตและ URL'
    };
  }
};

/**
 * จำลองการประมวลผลคำสั่งในเครื่อง (Local Demo Mode)
 */
function handleLocalAction(
  action: string,
  _adminPin: string,
  payload: any
): { success: boolean; data?: AppData; error?: string; message?: string } {
  const current = getCachedData();

  switch (action) {
    case 'verify_pin':
      return { success: true, message: 'ยืนยันตัวตนสำเร็จ (โหมดสาธิต)' };

    case 'add_payment': {
      const newPayment: Payment = {
        payment_id: 'P' + Date.now(),
        date: payload.date || new Date().toISOString().split('T')[0],
        member_id: payload.member_id,
        amount: Number(payload.amount),
        note: payload.note || '',
        created_at: new Date().toISOString()
      };
      const updated = {
        ...current,
        payments: [newPayment, ...current.payments]
      };
      saveCachedData(updated);
      return { success: true, data: updated, message: 'บันทึกรายรับเรียบร้อยแล้ว' };
    }

    case 'add_expense': {
      const newExpense: Expense = {
        expense_id: 'E' + Date.now(),
        date: payload.date || new Date().toISOString().split('T')[0],
        item: payload.item,
        amount: Number(payload.amount),
        category: payload.category || 'อื่นๆ',
        expense_type: payload.expense_type,
        member_id: payload.member_id || '',
        deduct_from: payload.deduct_from || 'group_fund',
        receipt_url: payload.receipt_url || '',
        created_at: new Date().toISOString()
      };
      const updated = {
        ...current,
        expenses: [newExpense, ...current.expenses]
      };
      saveCachedData(updated);
      return { success: true, data: updated, message: 'บันทึกรายจ่ายเรียบร้อยแล้ว' };
    }

    case 'record_attendance': {
      const sessionDate = payload.session_date;
      const records = payload.records as Array<{ member_id: string; status: any; note?: string }>;
      
      const newAttendance = [...current.attendance];
      records.forEach(rec => {
        const idx = newAttendance.findIndex(
          a => a.session_date === sessionDate && a.member_id === rec.member_id
        );
        const item: AttendanceRecord = {
          attendance_id: `${sessionDate}_${rec.member_id}`,
          session_date: sessionDate,
          member_id: rec.member_id,
          status: rec.status,
          note: rec.note || '',
          updated_at: new Date().toISOString()
        };
        if (idx >= 0) {
          newAttendance[idx] = item;
        } else {
          newAttendance.push(item);
        }
      });

      const updated = {
        ...current,
        attendance: newAttendance
      };
      saveCachedData(updated);
      return { success: true, data: updated, message: 'บันทึกการเช็คชื่อเรียบร้อยแล้ว' };
    }

    case 'add_session': {
      const newSession: Session = {
        session_id: 'S' + Date.now(),
        session_date: payload.session_date,
        amount_per_session: Number(payload.amount_per_session || 20),
        topic_or_note: payload.topic_or_note || '',
        created_at: new Date().toISOString()
      };
      const updated = {
        ...current,
        sessions: [...current.sessions, newSession].sort((a, b) => a.session_date.localeCompare(b.session_date))
      };
      saveCachedData(updated);
      return { success: true, data: updated, message: 'เพิ่มงวดนัดพบเรียบร้อยแล้ว' };
    }

    case 'add_member': {
      const count = current.members.length + 1;
      const newMember: Member = {
        member_id: 'M' + String(count).padStart(2, '0'),
        name: payload.name,
        status: 'active',
        initial_balance: Number(payload.initial_balance || 0),
        created_at: new Date().toISOString()
      };
      const updated = {
        ...current,
        members: [...current.members, newMember]
      };
      saveCachedData(updated);
      return { success: true, data: updated, message: 'เพิ่มสมาชิกใหม่เรียบร้อยแล้ว' };
    }

    case 'update_member': {
      const updatedMembers = current.members.map(m => {
        if (m.member_id === payload.member_id) {
          return {
            ...m,
            name: payload.name !== undefined ? payload.name : m.name,
            status: payload.status !== undefined ? payload.status : m.status,
            initial_balance: payload.initial_balance !== undefined ? Number(payload.initial_balance) : m.initial_balance
          };
        }
        return m;
      });
      const updated = {
        ...current,
        members: updatedMembers
      };
      saveCachedData(updated);
      return { success: true, data: updated, message: 'อัปเดตข้อมูลสมาชิกเรียบร้อยแล้ว' };
    }

    default:
      return { success: false, error: 'ไม่รู้จักคำสั่งในโหมดสาธิต' };
  }
}
