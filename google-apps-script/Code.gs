/**
 * ==========================================================================
 * ระบบบันทึกหะละเกาะฮฺ (Halaqah Recording System) - Backend Google Apps Script
 * ==========================================================================
 */

const SHEETS = {
  MEMBERS: 'Members',
  SESSIONS: 'Sessions',
  PAYMENTS: 'Payments',
  EXPENSES: 'Expenses',
  ATTENDANCE: 'Attendance',
  AMANAH: 'Amanah',
  CONFIG: 'Config'
};

const DEFAULT_PIN_PROPERTY = 'ADMIN_PIN';
const DEFAULT_PIN_VALUE = '123456';

/**
 * ฟังก์ชันนำเข้าข้อมูลจริงจากชีตเดิม (แบบบันทึกเก็บเงินฮะละเกาะฮฺ)
 * ให้เลือกฟังก์ชัน `importOriginalSheetData` แล้วกดปุ่ม Run (เรียกใช้) ด้านบน 1 ครั้ง
 */
function importOriginalSheetData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. ชีต Members (7 คนตามชีตเดิม พร้อมยอดยกมาจาก ท.1)
  let membersSheet = ss.getSheetByName(SHEETS.MEMBERS);
  if (!membersSheet) membersSheet = ss.insertSheet(SHEETS.MEMBERS);
  membersSheet.clear();
  membersSheet.appendRow(['member_id', 'name', 'status', 'initial_balance', 'created_at']);
  membersSheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#E2F0D9');

  const membersData = [
    ['M01', 'มะรอมือลี สาแมง', 'active', 40, '2025-07-02 09:00:00'],
    ['M02', 'มุสตาฟา แวดอเลาะ', 'active', 0, '2025-07-02 09:00:00'],
    ['M05', 'อัยมาน สอรี', 'active', 80, '2025-07-02 09:00:00'],
    ['M06', 'นัสรูลเลาะห์ อภิบาลแบ', 'active', 100, '2025-07-02 09:00:00'],
    ['M07', 'ซาการียา แม', 'active', 80, '2025-07-02 09:00:00'],
    ['M09', 'มุชริฟ ยามา', 'active', 0, '2026-07-01 09:00:00'],
    ['M10', 'อารีฟ ดือราโอะ', 'active', 0, '2026-07-08 09:00:00']
  ];
  membersData.forEach(row => membersSheet.appendRow(row));

  // 2. ชีต Sessions (7 งวดตามวันที่ในชีตเดิม)
  let sessionsSheet = ss.getSheetByName(SHEETS.SESSIONS);
  if (!sessionsSheet) sessionsSheet = ss.insertSheet(SHEETS.SESSIONS);
  sessionsSheet.clear();
  sessionsSheet.appendRow(['session_id', 'session_date', 'amount_per_session', 'topic_or_note', 'created_at']);
  sessionsSheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#E2F0D9');

  const sessionsData = [
    ['S001', '2025-07-02', 20, 'งวดวันที่ 2/7/68', '2025-07-02 09:00:00'],
    ['S002', '2025-07-09', 20, 'งวดวันที่ 9/7/68', '2025-07-09 09:00:00'],
    ['S003', '2026-07-01', 20, 'งวดวันที่ 01/07/69', '2026-07-01 09:00:00'],
    ['S004', '2026-07-08', 20, 'งวดวันที่ 8/7/69', '2026-07-08 09:00:00'],
    ['S005', '2026-07-15', 20, 'งวดวันที่ 15/7/69', '2026-07-15 09:00:00'],
    ['S006', '2026-08-19', 20, 'งวดวันที่ 19/8/26', '2026-08-19 09:00:00'],
    ['S007', '2026-09-16', 20, 'งวดวันที่ 16/9/26', '2026-09-16 09:00:00']
  ];
  sessionsData.forEach(row => sessionsSheet.appendRow(row));

  // 3. ชีต Payments (รายการรับเงินในแต่ละงวด รวม 510 บาท + ยอดยกมา 300 = 810 บาท)
  let paymentsSheet = ss.getSheetByName(SHEETS.PAYMENTS);
  if (!paymentsSheet) paymentsSheet = ss.insertSheet(SHEETS.PAYMENTS);
  paymentsSheet.clear();
  paymentsSheet.appendRow(['payment_id', 'date', 'member_id', 'amount', 'note', 'created_at']);
  paymentsSheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#E2F0D9');

  const paymentsData = [
    // งวด 2025-07-02 (รวม 100 บาท)
    ['P01_01', '2025-07-02', 'M01', 20, 'งวด 2/7/68', '2025-07-02 09:00:00'],
    ['P01_02', '2025-07-02', 'M02', 20, 'งวด 2/7/68', '2025-07-02 09:00:00'],
    ['P01_05', '2025-07-02', 'M05', 20, 'งวด 2/7/68', '2025-07-02 09:00:00'],
    ['P01_06', '2025-07-02', 'M06', 20, 'งวด 2/7/68', '2025-07-02 09:00:00'],
    ['P01_07', '2025-07-02', 'M07', 20, 'งวด 2/7/68', '2025-07-02 09:00:00'],

    // งวด 2025-07-09 (รวม 80 บาท)
    ['P02_01', '2025-07-09', 'M01', 20, 'งวด 9/7/68', '2025-07-09 09:00:00'],
    ['P02_02', '2025-07-09', 'M02', 20, 'งวด 9/7/68', '2025-07-09 09:00:00'],
    ['P02_06', '2025-07-09', 'M06', 20, 'งวด 9/7/68', '2025-07-09 09:00:00'],
    ['P02_07', '2025-07-09', 'M07', 20, 'งวด 9/7/68', '2025-07-09 09:00:00'],

    // งวด 2026-07-01 (รวม 60 บาท)
    ['P03_02', '2026-07-01', 'M02', 20, 'งวด 01/07/69', '2026-07-01 09:00:00'],
    ['P03_07', '2026-07-01', 'M07', 20, 'งวด 01/07/69', '2026-07-01 09:00:00'],
    ['P03_09', '2026-07-01', 'M09', 20, 'งวด 01/07/69', '2026-07-01 09:00:00'],

    // งวด 2026-07-08 (รวม 120 บาท)
    ['P04_01', '2026-07-08', 'M01', 60, 'งวด 8/7/69 (จ่าย 60 บาท)', '2026-07-08 09:00:00'],
    ['P04_02', '2026-07-08', 'M02', 20, 'งวด 8/7/69', '2026-07-08 09:00:00'],
    ['P04_09', '2026-07-08', 'M09', 20, 'งวด 8/7/69', '2026-07-08 09:00:00'],
    ['P04_10', '2026-07-08', 'M10', 20, 'งวด 8/7/69', '2026-07-08 09:00:00'],

    // งวด 2026-07-15 (รวม 60 บาท)
    ['P05_02', '2026-07-15', 'M02', 20, 'งวด 15/7/69', '2026-07-15 09:00:00'],
    ['P05_07', '2026-07-15', 'M07', 40, 'งวด 15/7/69 (จ่าย 40 บาท)', '2026-07-15 09:00:00'],

    // งวด 2026-08-19 (รวม 40 บาท)
    ['P06_01', '2026-08-19', 'M01', 20, 'งวด 19/8/26', '2026-08-19 09:00:00'],
    ['P06_02', '2026-08-19', 'M02', 20, 'งวด 19/8/26', '2026-08-19 09:00:00'],

    // งวด 2026-09-16 (รวม 50 บาท)
    ['P07_05', '2026-09-16', 'M05', 50, 'งวด 16/9/26 (จ่าย 50 บาท)', '2026-09-16 09:00:00']
  ];
  paymentsData.forEach(row => paymentsSheet.appendRow(row));

  // 4. ชีต Expenses (ก๋วยเตี๋ยว ครัวมาลา 305 บาท)
  let expensesSheet = ss.getSheetByName(SHEETS.EXPENSES);
  if (!expensesSheet) expensesSheet = ss.insertSheet(SHEETS.EXPENSES);
  expensesSheet.clear();
  expensesSheet.appendRow(['expense_id', 'date', 'item', 'amount', 'category', 'expense_type', 'member_id', 'deduct_from', 'receipt_url', 'created_at']);
  expensesSheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#FCE4D6');

  expensesSheet.appendRow([
    'E001',
    '2026-07-08',
    '1. ก๋วยเตี๋ยว ครัวมาลา',
    305,
    'อาหาร/เครื่องดื่ม',
    'communal',
    '',
    'group_fund',
    '',
    '2026-07-08 12:00:00'
  ]);

  // 5. ชีต Attendance (เช็คชื่อ)
  let attendanceSheet = ss.getSheetByName(SHEETS.ATTENDANCE);
  if (!attendanceSheet) attendanceSheet = ss.insertSheet(SHEETS.ATTENDANCE);
  attendanceSheet.clear();
  attendanceSheet.appendRow(['attendance_id', 'session_date', 'member_id', 'status', 'note', 'updated_at']);
  attendanceSheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#FFF2CC');

  // 6. ชีต Amanah (อามานะฮ์ หน้าที่รับผิดชอบรายสัปดาห์)
  let amanahSheet = ss.getSheetByName(SHEETS.AMANAH);
  if (!amanahSheet) amanahSheet = ss.insertSheet(SHEETS.AMANAH);
  amanahSheet.clear();
  amanahSheet.appendRow(['amanah_id', 'session_date', 'assignments_json', 'general_tasks_text', 'location', 'note', 'updated_at']);
  amanahSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#E2D9F3');

  const sampleAssignments = [
    { role: 'ตัฟซีร', member_id: 'M07', topic: 'ซูเราะฮฺ อัลฆอชิยะฮ์ อายัต 8 - 14' },
    { role: 'ฮาดิษ', member_id: 'M05', topic: '' },
    { role: 'ข่าว', member_id: 'M01', topic: '' },
    { role: 'ดำเนินรายการ', member_id: 'M02', topic: '' }
  ];
  const sampleTasks = 'อ่านอัลกุรอาน อย่างน้อยคนละ 2 หน้า\nวากัฟ (สัปดาห์ละครั้ง)';

  amanahSheet.appendRow([
    'AM_2026-09-23',
    '2026-09-23',
    JSON.stringify(sampleAssignments),
    sampleTasks,
    'มัสยิดคอลิด/ดูความเหมาะสมของสถานที่',
    'อินชาอัลลอฮฺ',
    new Date().toISOString()
  ]);

  // 7. ชีต Config
  let configSheet = ss.getSheetByName(SHEETS.CONFIG);
  if (!configSheet) configSheet = ss.insertSheet(SHEETS.CONFIG);
  configSheet.clear();
  configSheet.appendRow(['key', 'value', 'description']);
  configSheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#D9E1F2');
  configSheet.appendRow(['group_name', 'แบบบันทึกเก็บเงินฮะละเกาะฮฺ', 'ชื่อกลุ่มฮะละเกาะฮฺ']);
  configSheet.appendRow(['default_amount_per_session', '20', 'ยอดเก็บเงินต่อครั้งมาตรฐาน']);

  // กำหนดรหัส PIN เริ่มต้นถ้ายังไม่มี
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty(DEFAULT_PIN_PROPERTY)) {
    props.setProperty(DEFAULT_PIN_PROPERTY, DEFAULT_PIN_VALUE);
  }

  Logger.log('นำเข้าข้อมูลเดิมสำเร็จสมบูรณ์! ยอดรับรวม: 810 บ., รายจ่าย: 305 บ., คงเหลือ: 505 บ.');
}

function initialSetup() {
  importOriginalSheetData();
}

function setAdminPin(newPin) {
  if (!newPin || String(newPin).trim().length < 4) {
    throw new Error('รหัส PIN ต้องมีความยาวอย่างน้อย 4 หลัก');
  }
  PropertiesService.getScriptProperties().setProperty(DEFAULT_PIN_PROPERTY, String(newPin).trim());
  Logger.log('เปลี่ยนรหัส PIN ผู้ดูแลระบบสำเร็จแล้ว: ' + newPin);
}

function doGet(e) {
  try {
    const data = getAllData();
    return createJsonResponse({
      success: true,
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  const hasLock = lock.tryLock(15000);
  
  if (!hasLock) {
    return createJsonResponse({
      success: false,
      error: 'ระบบกำลังประมวลผลคำขออื่นอยู่ กรุณาลองใหม่อีกครั้งในอีกสักครู่'
    });
  }

  try {
    let requestData;
    if (e.postData && e.postData.contents) {
      requestData = JSON.parse(e.postData.contents);
    } else {
      throw new Error('ไม่พบข้อมูลในคำขอ (No payload received)');
    }

    const action = requestData.action;
    const adminPin = requestData.admin_pin;
    const payload = requestData.payload || {};

    // ตรวจสอบสิทธิ์ PIN: เฉพาะระบบการเงินและการเช็คชื่อที่ต้องใช้ PIN
    // ส่วนอามานะฮ์ (save_amanah) อนุญาตให้สมาชิกทุกคนแก้ไขและกรอกได้โดยไม่ต้องล็อกอิน
    const actionsRequiringPin = [
      'verify_pin',
      'add_payment',
      'delete_payment',
      'add_expense',
      'delete_expense',
      'record_attendance',
      'add_session',
      'add_member',
      'update_member'
    ];

    if (actionsRequiringPin.includes(action)) {
      const storedPin = PropertiesService.getScriptProperties().getProperty(DEFAULT_PIN_PROPERTY) || DEFAULT_PIN_VALUE;
      if (!adminPin || String(adminPin).trim() !== String(storedPin).trim()) {
        return createJsonResponse({
          success: false,
          error: 'รหัส PIN ผู้ดูแลระบบไม่ถูกต้อง ไม่สามารถดำเนินการได้'
        });
      }
    }

    let result;
    switch (action) {
      case 'verify_pin':
        result = { verified: true, message: 'ยืนยันตัวตนสำเร็จ' };
        break;

      case 'add_payment':
        result = handleAddPayment(payload);
        break;

      case 'add_expense':
        result = handleAddExpense(payload);
        break;

      case 'record_attendance':
        result = handleRecordAttendance(payload);
        break;

      case 'save_amanah':
        result = handleSaveAmanah(payload);
        break;

      case 'add_session':
        result = handleAddSession(payload);
        break;

      case 'add_member':
        result = handleAddMember(payload);
        break;

      case 'update_member':
        result = handleUpdateMember(payload);
        break;

      case 'delete_payment':
        result = handleDeletePayment(payload);
        break;

      case 'delete_expense':
        result = handleDeleteExpense(payload);
        break;

      default:
        throw new Error('ไม่รู้จักคำสั่ง: ' + action);
    }

    const refreshedData = getAllData();

    return createJsonResponse({
      success: true,
      action: action,
      result: result,
      data: refreshedData
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.message || 'เกิดข้อผิดพลาดในการประมวลผลคำขอ'
    });
  } finally {
    lock.releaseLock();
  }
}

function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const members = readSheetData(ss.getSheetByName(SHEETS.MEMBERS));
  const sessions = readSheetData(ss.getSheetByName(SHEETS.SESSIONS));
  const payments = readSheetData(ss.getSheetByName(SHEETS.PAYMENTS));
  const expenses = readSheetData(ss.getSheetByName(SHEETS.EXPENSES));
  const attendance = readSheetData(ss.getSheetByName(SHEETS.ATTENDANCE));
  
  const configRows = readSheetData(ss.getSheetByName(SHEETS.CONFIG));
  const config = {};
  configRows.forEach(row => {
    if (row.key) {
      config[row.key] = row.value;
    }
  });

  return {
    members: members.map(m => ({
      member_id: String(m.member_id || ''),
      name: String(m.name || ''),
      status: String(m.status || 'active'),
      initial_balance: Number(m.initial_balance || 0),
      created_at: m.created_at ? formatDateString(m.created_at) : ''
    })),
    sessions: sessions.map(s => ({
      session_id: String(s.session_id || ''),
      session_date: formatDateOnly(s.session_date),
      amount_per_session: Number(s.amount_per_session || 20),
      topic_or_note: String(s.topic_or_note || ''),
      created_at: s.created_at ? formatDateString(s.created_at) : ''
    })).sort((a, b) => a.session_date.localeCompare(b.session_date)),
    payments: payments.map(p => ({
      payment_id: String(p.payment_id || ''),
      date: formatDateOnly(p.date),
      member_id: String(p.member_id || ''),
      amount: Number(p.amount || 0),
      note: String(p.note || ''),
      created_at: p.created_at ? formatDateString(p.created_at) : ''
    })).sort((a, b) => b.date.localeCompare(a.date)),
    expenses: expenses.map(e => ({
      expense_id: String(e.expense_id || ''),
      date: formatDateOnly(e.date),
      item: String(e.item || ''),
      amount: Number(e.amount || 0),
      category: String(e.category || 'อื่นๆ'),
      expense_type: String(e.expense_type || 'communal'),
      member_id: String(e.member_id || ''),
      deduct_from: String(e.deduct_from || 'group_fund'),
      receipt_url: String(e.receipt_url || ''),
      created_at: e.created_at ? formatDateString(e.created_at) : ''
    })).sort((a, b) => b.date.localeCompare(a.date)),
    attendance: attendance.map(a => ({
      attendance_id: String(a.attendance_id || ''),
      session_date: formatDateOnly(a.session_date),
      member_id: String(a.member_id || ''),
      status: String(a.status || 'present'),
      note: String(a.note || ''),
      updated_at: a.updated_at ? formatDateString(a.updated_at) : ''
    })),
    amanah: readSheetData(ss.getSheetByName(SHEETS.AMANAH)).map(am => {
      let assignments = [];
      try {
        assignments = am.assignments_json ? JSON.parse(am.assignments_json) : [];
      } catch (e) {
        assignments = [];
      }
      const generalTasks = am.general_tasks_text ? String(am.general_tasks_text).split('\n').filter(Boolean) : [];
      return {
        amanah_id: String(am.amanah_id || ''),
        session_date: formatDateOnly(am.session_date),
        assignments: assignments,
        general_tasks: generalTasks,
        location: String(am.location || ''),
        note: String(am.note || ''),
        updated_at: am.updated_at ? formatDateString(am.updated_at) : ''
      };
    }).sort((a, b) => b.session_date.localeCompare(a.session_date)),
    config: config
  };
}

function handleAddPayment(payload) {
  const memberId = String(payload.member_id || '').trim();
  const amount = Number(payload.amount);
  const date = payload.date ? formatDateOnly(payload.date) : formatDateOnly(new Date());
  const note = String(payload.note || '').trim();

  if (!memberId) throw new Error('กรุณาระบุรหัสสมาชิก');
  if (isNaN(amount) || amount <= 0) throw new Error('จำนวนเงินต้องมากกว่า 0 บาท');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.PAYMENTS);
  if (!sheet) throw new Error('ไม่พบชีต Payments');

  validateMemberExists(ss, memberId);

  const paymentId = 'P' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd_HHmmss') + '_' + Math.floor(Math.random() * 1000);
  const newRow = [
    paymentId,
    date,
    memberId,
    amount,
    note,
    new Date().toISOString()
  ];

  sheet.appendRow(newRow);
  return { payment_id: paymentId, message: 'บันทึกรายรับสำเร็จ' };
}

function handleAddExpense(payload) {
  const item = String(payload.item || '').trim();
  const amount = Number(payload.amount);
  const date = payload.date ? formatDateOnly(payload.date) : formatDateOnly(new Date());
  const category = String(payload.category || 'อื่นๆ').trim();
  const expenseType = payload.expense_type === 'individual' ? 'individual' : 'communal';
  const memberId = String(payload.member_id || '').trim();
  let deductFrom = String(payload.deduct_from || 'group_fund').trim();
  const receiptUrl = String(payload.receipt_url || '').trim();

  if (!item) throw new Error('กรุณาระบุรายการค่าใช้จ่าย');
  if (isNaN(amount) || amount <= 0) throw new Error('จำนวนเงินต้องมากกว่า 0 บาท');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (expenseType === 'individual') {
    if (!memberId) throw new Error('กรณีรายจ่ายเฉพาะคน กรุณาเลือกรหัสสมาชิก');
    validateMemberExists(ss, memberId);
    if (deductFrom !== 'group_fund' && deductFrom !== 'member_balance') {
      deductFrom = 'group_fund';
    }
  } else {
    deductFrom = 'group_fund';
  }

  const sheet = ss.getSheetByName(SHEETS.EXPENSES);
  if (!sheet) throw new Error('ไม่พบชีต Expenses');

  const expenseId = 'E' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd_HHmmss') + '_' + Math.floor(Math.random() * 1000);
  const newRow = [
    expenseId,
    date,
    item,
    amount,
    category,
    expenseType,
    expenseType === 'individual' ? memberId : '',
    deductFrom,
    receiptUrl,
    new Date().toISOString()
  ];

  sheet.appendRow(newRow);
  return { expense_id: expenseId, message: 'บันทึกรายจ่ายสำเร็จ' };
}

function handleRecordAttendance(payload) {
  const sessionDate = formatDateOnly(payload.session_date);
  const records = payload.records;

  if (!sessionDate) throw new Error('กรุณาระบุวันที่นัด');
  if (!records || !Array.isArray(records) || records.length === 0) {
    throw new Error('ไม่พบข้อมูลรายชื่อที่ต้องการบันทึก');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.ATTENDANCE);
  if (!sheet) throw new Error('ไม่พบชีต Attendance');

  const data = sheet.getDataRange().getValues();
  const existingRowMap = {};
  for (let i = 1; i < data.length; i++) {
    const rowDate = formatDateOnly(data[i][1]);
    const rowMember = String(data[i][2]);
    const key = `${rowDate}_${rowMember}`;
    existingRowMap[key] = i + 1;
  }

  records.forEach(rec => {
    const mId = String(rec.member_id).trim();
    const status = ['present', 'absent', 'leave'].includes(rec.status) ? rec.status : 'present';
    const note = String(rec.note || '').trim();
    const key = `${sessionDate}_${mId}`;
    const nowIso = new Date().toISOString();

    if (existingRowMap[key]) {
      const rIdx = existingRowMap[key];
      sheet.getRange(rIdx, 4, 1, 3).setValues([[status, note, nowIso]]);
    } else {
      sheet.appendRow([key, sessionDate, mId, status, note, nowIso]);
    }
  });

  return { message: `บันทึกการเช็คชื่อ ${records.length} คน สำหรับวันที่ ${sessionDate} เรียบร้อยแล้ว` };
}

/**
 * บันทึกหรืออัปเดตข้อมูลอามานะฮ์ (Amanah)
 */
function handleSaveAmanah(payload) {
  const sessionDate = formatDateOnly(payload.session_date);
  if (!sessionDate) throw new Error('กรุณาระบุวันที่นัดพบ');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEETS.AMANAH);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.AMANAH);
    sheet.appendRow(['amanah_id', 'session_date', 'assignments_json', 'general_tasks_text', 'location', 'note', 'updated_at']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#E2D9F3');
  }

  const assignmentsJson = JSON.stringify(payload.assignments || []);
  const generalTasksText = Array.isArray(payload.general_tasks) ? payload.general_tasks.join('\n') : String(payload.general_tasks || '');
  const location = String(payload.location || '').trim();
  const note = String(payload.note || '').trim();
  const amanahId = payload.amanah_id || 'AM_' + sessionDate;
  const nowIso = new Date().toISOString();

  const data = sheet.getDataRange().getValues();
  let foundRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (formatDateOnly(data[i][1]) === sessionDate) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow > 0) {
    // อัปเดตแถวเดิม
    sheet.getRange(foundRow, 3, 1, 5).setValues([[
      assignmentsJson,
      generalTasksText,
      location,
      note,
      nowIso
    ]]);
  } else {
    // เพิ่มแถวใหม่
    sheet.appendRow([amanahId, sessionDate, assignmentsJson, generalTasksText, location, note, nowIso]);
  }

  return { message: `บันทึกข้อมูลอามานะฮ์สำหรับวันที่ ${sessionDate} เรียบร้อยแล้ว` };
}

function handleAddSession(payload) {
  const sessionDate = formatDateOnly(payload.session_date);
  const amount = Number(payload.amount_per_session || 20);
  const topicOrNote = String(payload.topic_or_note || '').trim();

  if (!sessionDate) throw new Error('กรุณาระบุวันที่นัดพบ');
  if (isNaN(amount) || amount < 0) throw new Error('ยอดต่องวดไม่ถูกต้อง');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.SESSIONS);
  if (!sheet) throw new Error('ไม่พบชีต Sessions');

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (formatDateOnly(data[i][1]) === sessionDate) {
      throw new Error(`มีงวดนัดพบวันที่ ${sessionDate} อยู่แล้วในระบบ`);
    }
  }

  const sessionId = 'S' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd_HHmmss');
  sheet.appendRow([sessionId, sessionDate, amount, topicOrNote, new Date().toISOString()]);

  return { session_id: sessionId, message: 'เพิ่มงวดนัดพบเรียบร้อยแล้ว' };
}

function handleAddMember(payload) {
  const name = String(payload.name || '').trim();
  const initialBalance = Number(payload.initial_balance || 0);

  if (!name) throw new Error('กรุณาระบุชื่อสมาชิก');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.MEMBERS);
  if (!sheet) throw new Error('ไม่พบชีต Members');

  const data = sheet.getDataRange().getValues();
  let maxIdNum = 0;
  for (let i = 1; i < data.length; i++) {
    const idStr = String(data[i][0]).replace(/\D/g, '');
    const num = parseInt(idStr, 10);
    if (!isNaN(num) && num > maxIdNum) {
      maxIdNum = num;
    }
  }
  const nextId = 'M' + String(maxIdNum + 1).padStart(2, '0');

  sheet.appendRow([nextId, name, 'active', initialBalance, new Date().toISOString()]);

  return { member_id: nextId, message: 'เพิ่มสมาชิกเรียบร้อยแล้ว' };
}

function handleUpdateMember(payload) {
  const memberId = String(payload.member_id || '').trim();
  if (!memberId) throw new Error('กรุณาระบุรหัสสมาชิก');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.MEMBERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === memberId) {
      if (payload.name !== undefined) sheet.getRange(i + 1, 2).setValue(String(payload.name).trim());
      if (payload.status !== undefined) sheet.getRange(i + 1, 3).setValue(payload.status === 'inactive' ? 'inactive' : 'active');
      if (payload.initial_balance !== undefined) sheet.getRange(i + 1, 4).setValue(Number(payload.initial_balance));
      return { member_id: memberId, message: 'อัปเดตข้อมูลสมาชิกเรียบร้อยแล้ว' };
    }
  }

  throw new Error(`ไม่พบสมาชิกรหัส ${memberId}`);
}

function handleDeletePayment(payload) {
  const paymentId = String(payload.payment_id || '').trim();
  if (!paymentId) throw new Error('กรุณาระบุ payment_id');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.PAYMENTS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === paymentId) {
      sheet.deleteRow(i + 1);
      return { message: 'ลบรายการรับเงินเรียบร้อยแล้ว' };
    }
  }

  throw new Error(`ไม่พบรายการรับเงิน ${paymentId}`);
}

function handleDeleteExpense(payload) {
  const expenseId = String(payload.expense_id || '').trim();
  if (!expenseId) throw new Error('กรุณาระบุ expense_id');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.EXPENSES);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === expenseId) {
      sheet.deleteRow(i + 1);
      return { message: 'ลบรายการค่าใช้จ่ายเรียบร้อยแล้ว' };
    }
  }

  throw new Error(`ไม่พบรายการจ่ายเงิน ${expenseId}`);
}

function readSheetData(sheet) {
  if (!sheet) return [];
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length <= 1) return [];

  const headers = values[0].map(h => String(h).trim());
  const rows = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row.every(cell => cell === '' || cell === null)) continue;

    const rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = row[j];
    }
    rows.push(rowObj);
  }
  return rows;
}

function validateMemberExists(ss, memberId) {
  const sheet = ss.getSheetByName(SHEETS.MEMBERS);
  if (!sheet) return;
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === memberId) {
      return true;
    }
  }
  throw new Error(`ไม่พบสมาชิกรหัส ${memberId} ในระบบ`);
}

function formatDateOnly(dateVal) {
  if (!dateVal) return '';
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    return dateVal;
  }
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return Utilities.formatDate(d, 'GMT+7', 'yyyy-MM-dd');
  } catch (e) {
    return String(dateVal);
  }
}

function formatDateString(dateVal) {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return Utilities.formatDate(d, 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
  } catch (e) {
    return String(dateVal);
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
