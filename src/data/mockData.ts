import { AppData } from '../types';

export const initialMockData: AppData = {
  config: {
    group_name: 'แบบบันทึกเก็บเงินฮะละเกาะฮฺ',
    default_amount_per_session: 20
  },
  members: [
    { member_id: 'M01', name: 'มะรอมือลี สาแมง', status: 'active', initial_balance: 40 },
    { member_id: 'M02', name: 'มุสตาฟา แวดอเลาะ', status: 'active', initial_balance: 0 },
    { member_id: 'M05', name: 'อัยมาน สอรี', status: 'active', initial_balance: 80 },
    { member_id: 'M06', name: 'นัสรูลเลาะห์ อภิบาลแบ', status: 'active', initial_balance: 100 },
    { member_id: 'M07', name: 'ซาการียา แม', status: 'active', initial_balance: 80 },
    { member_id: 'M09', name: 'มุชริฟ ยามา', status: 'active', initial_balance: 0 },
    { member_id: 'M10', name: 'อารีฟ ดือราโอะ', status: 'active', initial_balance: 0 }
  ],
  sessions: [
    { session_id: 'S001', session_date: '2025-07-02', amount_per_session: 20, topic_or_note: 'งวดวันที่ 2/7/68' },
    { session_id: 'S002', session_date: '2025-07-09', amount_per_session: 20, topic_or_note: 'งวดวันที่ 9/7/68' },
    { session_id: 'S003', session_date: '2026-07-01', amount_per_session: 20, topic_or_note: 'งวดวันที่ 01/07/69' },
    { session_id: 'S004', session_date: '2026-07-08', amount_per_session: 20, topic_or_note: 'งวดวันที่ 8/7/69' },
    { session_id: 'S005', session_date: '2026-07-15', amount_per_session: 20, topic_or_note: 'งวดวันที่ 15/7/69' },
    { session_id: 'S006', session_date: '2026-08-19', amount_per_session: 20, topic_or_note: 'งวดวันที่ 19/8/26' },
    { session_id: 'S007', session_date: '2026-09-16', amount_per_session: 20, topic_or_note: 'งวดวันที่ 16/9/26' }
  ],
  payments: [
    // งวด 2/7/68
    { payment_id: 'P01_01', date: '2025-07-02', member_id: 'M01', amount: 20, note: 'งวด 2/7/68' },
    { payment_id: 'P01_02', date: '2025-07-02', member_id: 'M02', amount: 20, note: 'งวด 2/7/68' },
    { payment_id: 'P01_05', date: '2025-07-02', member_id: 'M05', amount: 20, note: 'งวด 2/7/68' },
    { payment_id: 'P01_06', date: '2025-07-02', member_id: 'M06', amount: 20, note: 'งวด 2/7/68' },
    { payment_id: 'P01_07', date: '2025-07-02', member_id: 'M07', amount: 20, note: 'งวด 2/7/68' },

    // งวด 9/7/68
    { payment_id: 'P02_01', date: '2025-07-09', member_id: 'M01', amount: 20, note: 'งวด 9/7/68' },
    { payment_id: 'P02_02', date: '2025-07-09', member_id: 'M02', amount: 20, note: 'งวด 9/7/68' },
    { payment_id: 'P02_06', date: '2025-07-09', member_id: 'M06', amount: 20, note: 'งวด 9/7/68' },
    { payment_id: 'P02_07', date: '2025-07-09', member_id: 'M07', amount: 20, note: 'งวด 9/7/68' },

    // งวด 01/07/69
    { payment_id: 'P03_02', date: '2026-07-01', member_id: 'M02', amount: 20, note: 'งวด 01/07/69' },
    { payment_id: 'P03_07', date: '2026-07-01', member_id: 'M07', amount: 20, note: 'งวด 01/07/69' },
    { payment_id: 'P03_09', date: '2026-07-01', member_id: 'M09', amount: 20, note: 'งวด 01/07/69' },

    // งวด 8/7/69
    { payment_id: 'P04_01', date: '2026-07-08', member_id: 'M01', amount: 60, note: 'งวด 8/7/69 (จ่าย 60 บาท)' },
    { payment_id: 'P04_02', date: '2026-07-08', member_id: 'M02', amount: 20, note: 'งวด 8/7/69' },
    { payment_id: 'P04_09', date: '2026-07-08', member_id: 'M09', amount: 20, note: 'งวด 8/7/69' },
    { payment_id: 'P04_10', date: '2026-07-08', member_id: 'M10', amount: 20, note: 'งวด 8/7/69' },

    // งวด 15/7/69
    { payment_id: 'P05_02', date: '2026-07-15', member_id: 'M02', amount: 20, note: 'งวด 15/7/69' },
    { payment_id: 'P05_07', date: '2026-07-15', member_id: 'M07', amount: 40, note: 'งวด 15/7/69 (จ่าย 40 บาท)' },

    // งวด 19/8/26
    { payment_id: 'P06_01', date: '2026-08-19', member_id: 'M01', amount: 20, note: 'งวด 19/8/26' },
    { payment_id: 'P06_02', date: '2026-08-19', member_id: 'M02', amount: 20, note: 'งวด 19/8/26' },

    // งวด 16/9/26
    { payment_id: 'P07_05', date: '2026-09-16', member_id: 'M05', amount: 50, note: 'งวด 16/9/26 (จ่าย 50 บาท)' }
  ],
  expenses: [
    {
      expense_id: 'E001',
      date: '2026-07-08',
      item: '1. ก๋วยเตี๋ยว ครัวมาลา',
      amount: 305,
      category: 'อาหาร/เครื่องดื่ม',
      expense_type: 'communal',
      deduct_from: 'group_fund',
      receipt_url: ''
    }
  ],
  attendance: [],
  amanah: [
    {
      amanah_id: 'AM_2026-09-23',
      session_date: '2026-09-23',
      assignments: [
        {
          role: 'ตัฟซีร',
          member_id: 'M07', // ซาการียา
          topic: 'ซูเราะฮฺ อัลฆอชิยะฮ์ อายัต 8 - 14'
        },
        {
          role: 'ฮาดิษ',
          member_id: 'M05', // อัยมาน
          topic: ''
        },
        {
          role: 'ข่าว',
          member_id: 'M01', // มะรอมือลี (รอมลี)
          topic: ''
        },
        {
          role: 'ดำเนินรายการ',
          member_id: 'M02', // มุสตอฟา
          topic: ''
        }
      ],
      general_tasks: [
        'อ่านอัลกุรอาน อย่างน้อยคนละ 2 หน้า',
        'วากัฟ (สัปดาห์ละครั้ง)'
      ],
      location: 'มัสยิดคอลิด/ดูความเหมาะสมของสถานที่',
      note: 'อินชาอัลลอฮฺ'
    }
  ]
};
