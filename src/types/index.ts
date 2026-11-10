/**
 * Types and Data Contracts for Halaqah Recording System
 */

export type MemberStatus = 'active' | 'inactive';

export interface Member {
  member_id: string;      // e.g. "M01"
  name: string;           // e.g. "อับดุลลอฮฺ"
  status: MemberStatus;   // 'active' | 'inactive'
  initial_balance: number;// ยอดยกมาเริ่มต้น (บาท)
  created_at?: string;
}

export interface Session {
  session_id: string;         // e.g. "S001"
  session_date: string;       // YYYY-MM-DD
  amount_per_session: number; // e.g. 20
  topic_or_note?: string;     // หัวข้อการพบปะ
  created_at?: string;
}

export interface Payment {
  payment_id: string; // e.g. "P001"
  date: string;       // YYYY-MM-DD
  member_id: string;  // e.g. "M01"
  amount: number;     // e.g. 60
  note?: string;      // e.g. "จ่ายล่วงหน้า 3 ครั้ง"
  created_at?: string;
}

export type ExpenseType = 'communal' | 'individual'; // ส่วนกลาง | เฉพาะคน
export type DeductFrom = 'group_fund' | 'member_balance'; // หักจากกองกลาง | หักจากยอดสะสมคนนั้น

export interface Expense {
  expense_id: string;       // e.g. "E001"
  date: string;             // YYYY-MM-DD
  item: string;             // รายละเอียด
  amount: number;           // จำนวนเงิน
  category: string;         // หมวดหมู่
  expense_type: ExpenseType;// 'communal' | 'individual'
  member_id?: string;       // รหัสสมาชิก (กรณีเฉพาะคน)
  deduct_from: DeductFrom;  // 'group_fund' | 'member_balance'
  receipt_url?: string;     // รูปใบเสร็จ (ถ้ามี)
  created_at?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'leave'; // มา | ไม่มา | ลา

export interface AttendanceRecord {
  attendance_id?: string;
  session_date: string;    // YYYY-MM-DD
  member_id: string;       // e.g. "M01"
  status: AttendanceStatus;// 'present' | 'absent' | 'leave'
  note?: string;
  updated_at?: string;
}

export interface AmanahAssignment {
  role: string;         // e.g. "ดำเนินรายการ", "ตัฟซีร", "ฮะดีษ", "ข่าว"
  member_id: string;    // e.g. "M02"
  topic?: string;       // e.g. "ซูเราะฮฺ อัลฆอชิยะฮ์ อายัต 8 - 14"
}

export interface AmanahRecord {
  amanah_id?: string;
  session_date: string;     // YYYY-MM-DD
  assignments: AmanahAssignment[];
  general_tasks: string[];  // e.g. ["อ่านอัลกุรอาน อย่างน้อยคนละ 2 หน้า", "วากัฟ (สัปดาห์ละครั้ง)"]
  location?: string;        // e.g. "มัสยิดคอลิด/ดูความเหมาะสมของสถานที่"
  note?: string;            // หมายเหตุเพิ่มเติม
  updated_at?: string;
}

export interface AppConfig {
  group_name?: string;
  default_amount_per_session?: string | number;
  [key: string]: any;
}

export interface AppData {
  members: Member[];
  sessions: Session[];
  payments: Payment[];
  expenses: Expense[];
  attendance: AttendanceRecord[];
  amanah: AmanahRecord[];
  config: AppConfig;
}

// การวิเคราะห์สถานะการเงินของสมาชิก
export interface MemberFinancialSummary {
  member: Member;
  totalPaid: number;          // ยอดยกมา + รวม Payments
  totalExpected: number;      // ผลรวมค่าเก็บต่องวดของทุก Session ที่ผ่านมา
  individualDeductions: number;// รายจ่ายเฉพาะคนที่หักจากยอดสะสมคนนั้น
  netBalance: number;         // totalPaid - totalExpected - individualDeductions
  isOverdue: boolean;         // netBalance < 0
  isAdvance: boolean;         // netBalance > 0
  overdueSessionsCount: number; // จำนวนงวดที่ค้าง
  advanceSessionsCount: number; // จำนวนงวดที่จ่ายล่วงหน้า
  // สถานะการจ่ายต่องวด (FIFO Allocation) key: session_date
  sessionPaymentStatus: Record<string, {
    status: 'paid' | 'partial' | 'unpaid';
    allocatedAmount: number;
    requiredAmount: number;
  }>;
  // การเข้าร่วม
  attendanceStats: {
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    leaveCount: number;
    attendanceRate: number; // 0 - 100%
  };
}

// สรุปภาพรวมกลุ่ม
export interface GroupFinancialSummary {
  totalInflows: number;         // รวมยอดยกมา + รายรับทั้งหมด
  totalCommunalExpenses: number;// รายจ่ายส่วนกลาง
  totalIndividualGroupExpenses: number; // รายจ่ายเฉพาะคนที่หักจากกองกลาง
  totalOutflows: number;        // รายจ่ายที่กระทบกองกลาง
  groupBalance: number;         // คงเหลือกองกลาง
  totalMembersCount: number;
  activeMembersCount: number;
  overdueMembersCount: number;  // จำนวนคนที่ค้างชำระ
  totalOverdueAmount: number;   // ยอดค้างชำระรวมทั้งหมด
  advanceMembersCount: number;  // จำนวนคนที่จ่ายล่วงหน้า
}
