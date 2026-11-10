import { AppData } from '../types';

export const initialMockData: AppData = {
  config: {
    group_name: 'กลุ่มหะละเกาะฮฺอัล-อิคลาศ',
    default_amount_per_session: 20
  },
  members: [
    { member_id: 'M01', name: 'อับดุลลอฮฺ', status: 'active', initial_balance: 0 },
    { member_id: 'M02', name: 'มุฮัมมัด', status: 'active', initial_balance: 0 },
    { member_id: 'M03', name: 'อะหมัด', status: 'active', initial_balance: 0 },
    { member_id: 'M04', name: 'อิบรอฮีม', status: 'active', initial_balance: 0 },
    { member_id: 'M05', name: 'ยูซุฟ', status: 'active', initial_balance: 0 }
  ],
  sessions: [
    { session_id: 'S001', session_date: '2026-10-04', amount_per_session: 20, topic_or_note: 'ปฐมนิเทศและเป้าหมายกลุ่ม' },
    { session_id: 'S002', session_date: '2026-10-18', amount_per_session: 20, topic_or_note: 'ตัฟซีร ซูเราะฮฺ อัลฟาติหะฮฺ' },
    { session_id: 'S003', session_date: '2026-11-01', amount_per_session: 20, topic_or_note: 'มารยาทการแสวงหาความรู้' }
  ],
  payments: [
    { payment_id: 'P001', date: '2026-10-04', member_id: 'M01', amount: 60, note: 'จ่ายล่วงหน้า 3 ครั้ง (โอน)' },
    { payment_id: 'P002', date: '2026-10-04', member_id: 'M02', amount: 40, note: 'จ่าย 2 ครั้ง' },
    { payment_id: 'P003', date: '2026-10-18', member_id: 'M03', amount: 20, note: 'จ่ายเงินสดครั้งที่ 2' },
    { payment_id: 'P004', date: '2026-11-01', member_id: 'M04', amount: 60, note: 'โอนรวม 3 ครั้ง' }
  ],
  expenses: [
    {
      expense_id: 'E001',
      date: '2026-10-04',
      item: 'สมุดบันทึกและเอกสารหะละเกาะฮฺ',
      amount: 50,
      category: 'เอกสาร',
      expense_type: 'communal',
      deduct_from: 'group_fund',
      receipt_url: ''
    },
    {
      expense_id: 'E002',
      date: '2026-10-18',
      item: 'น้ำดื่มและอินทผาลัม',
      amount: 40,
      category: 'อาหาร/เครื่องดื่ม',
      expense_type: 'communal',
      deduct_from: 'group_fund',
      receipt_url: ''
    }
  ],
  attendance: [
    { attendance_id: '2026-10-04_M01', session_date: '2026-10-04', member_id: 'M01', status: 'present' },
    { attendance_id: '2026-10-04_M02', session_date: '2026-10-04', member_id: 'M02', status: 'present' },
    { attendance_id: '2026-10-04_M03', session_date: '2026-10-04', member_id: 'M03', status: 'leave', note: 'ติดธุระครอบครัว' },
    { attendance_id: '2026-10-04_M04', session_date: '2026-10-04', member_id: 'M04', status: 'present' },
    { attendance_id: '2026-10-04_M05', session_date: '2026-10-04', member_id: 'M05', status: 'absent', note: 'ไม่สามารถติดต่อได้' },
    { attendance_id: '2026-10-18_M01', session_date: '2026-10-18', member_id: 'M01', status: 'present' },
    { attendance_id: '2026-10-18_M02', session_date: '2026-10-18', member_id: 'M02', status: 'present' },
    { attendance_id: '2026-10-18_M03', session_date: '2026-10-18', member_id: 'M03', status: 'present' },
    { attendance_id: '2026-10-18_M04', session_date: '2026-10-18', member_id: 'M04', status: 'present' },
    { attendance_id: '2026-10-18_M05', session_date: '2026-10-18', member_id: 'M05', status: 'leave', note: 'ป่วย' }
  ]
};
