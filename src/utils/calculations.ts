import {
  AppData,
  Member,
  MemberFinancialSummary,
  GroupFinancialSummary,
  Session
} from '../types';

/**
 * คำนวณสรุปข้อมูลทางการเงินของสมาชิกแต่ละคน
 */
export function calculateMemberSummary(
  member: Member,
  sessions: Session[],
  data: AppData
): MemberFinancialSummary {
  // เรียงลำดับ Sessions ตามวันที่ จากเก่าสุดไปใหม่สุด
  const sortedSessions = [...sessions].sort((a, b) => 
    a.session_date.localeCompare(b.session_date)
  );

  // 1. รวมยอดจ่ายแล้ว = ยอดยกมา + รวม Payments ของสมาชิก
  const memberPayments = data.payments.filter(p => p.member_id === member.member_id);
  const totalPaymentsAmount = memberPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPaid = (Number(member.initial_balance) || 0) + totalPaymentsAmount;

  // 2. รายจ่ายเฉพาะคนที่หักจากยอดสะสมของคนนั้น (member_balance)
  const individualDeductions = data.expenses
    .filter(e => 
      e.expense_type === 'individual' && 
      e.member_id === member.member_id && 
      e.deduct_from === 'member_balance'
    )
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // 3. ยอดเงินสุทธิที่สมาชิกนำมาใช้ชำระค่างวดได้
  const availableForSessions = totalPaid - individualDeductions;

  // 4. ยอดควรจ่าย = ผลรวมค่าใช้จ่ายต่องวดของทุก Session ที่ผ่านมา
  const totalExpected = sortedSessions.reduce((sum, s) => sum + (Number(s.amount_per_session) || 0), 0);

  // 5. ส่วนต่างสุทธิ = จ่ายแล้ว - ควรจ่าย - รายจ่ายเฉพาะคนที่หักจากยอดสะสม
  // หรือ = availableForSessions - totalExpected
  const netBalance = availableForSessions - totalExpected;

  // คำนวณจำนวนงวดที่ค้าง หรือจ่ายล่วงหน้า
  // ค่ายอดต่อครั้งอ้างอิงจากงวดล่าสุด หรือค่าเฉลี่ย (อย่างน้อย 20 บาท ป้องกันหารด้วย 0)
  const referenceSessionAmount = sortedSessions.length > 0 
    ? (Number(sortedSessions[sortedSessions.length - 1].amount_per_session) || 20)
    : 20;

  const isOverdue = netBalance < 0;
  const isAdvance = netBalance > 0;
  const overdueSessionsCount = isOverdue 
    ? Math.ceil(Math.abs(netBalance) / referenceSessionAmount)
    : 0;
  const advanceSessionsCount = isAdvance 
    ? Math.floor(netBalance / referenceSessionAmount)
    : 0;

  // 6. การตัดงวดแบบ FIFO (เก่าสุดก่อนอัตโนมัติ)
  let remainingBudget = Math.max(0, availableForSessions);
  const sessionPaymentStatus: MemberFinancialSummary['sessionPaymentStatus'] = {};

  sortedSessions.forEach(session => {
    const required = Number(session.amount_per_session) || 0;
    if (remainingBudget >= required) {
      sessionPaymentStatus[session.session_date] = {
        status: 'paid',
        allocatedAmount: required,
        requiredAmount: required
      };
      remainingBudget -= required;
    } else if (remainingBudget > 0) {
      sessionPaymentStatus[session.session_date] = {
        status: 'partial',
        allocatedAmount: remainingBudget,
        requiredAmount: required
      };
      remainingBudget = 0;
    } else {
      sessionPaymentStatus[session.session_date] = {
        status: 'unpaid',
        allocatedAmount: 0,
        requiredAmount: required
      };
    }
  });

  // 7. สถิติการเข้าร่วม (Attendance)
  const memberAttendance = data.attendance.filter(a => a.member_id === member.member_id);
  const presentCount = memberAttendance.filter(a => a.status === 'present').length;
  const absentCount = memberAttendance.filter(a => a.status === 'absent').length;
  const leaveCount = memberAttendance.filter(a => a.status === 'leave').length;
  const totalRecorded = memberAttendance.length;
  const attendanceRate = totalRecorded > 0 ? (presentCount / totalRecorded) * 100 : 100;

  return {
    member,
    totalPaid,
    totalExpected,
    individualDeductions,
    netBalance,
    isOverdue,
    isAdvance,
    overdueSessionsCount,
    advanceSessionsCount,
    sessionPaymentStatus,
    attendanceStats: {
      totalSessions: totalRecorded,
      presentCount,
      absentCount,
      leaveCount,
      attendanceRate: Math.round(attendanceRate)
    }
  };
}

/**
 * คำนวณสรุปภาพรวมทางการเงินของกลุ่ม (Group Financial Summary)
 */
export function calculateGroupSummary(data: AppData): GroupFinancialSummary {
  // รายรับทั้งหมด = ผลรวมยอดยกมาของทุกคน + ผลรวม Payments ทั้งหมด
  const totalInitialBalances = data.members.reduce(
    (sum, m) => sum + (Number(m.initial_balance) || 0), 
    0
  );
  const totalPayments = data.payments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0), 
    0
  );
  const totalInflows = totalInitialBalances + totalPayments;

  // รายจ่ายส่วนกลาง
  const totalCommunalExpenses = data.expenses
    .filter(e => e.expense_type === 'communal')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // รายจ่ายเฉพาะคนที่หักจากกองกลาง
  const totalIndividualGroupExpenses = data.expenses
    .filter(e => e.expense_type === 'individual' && e.deduct_from === 'group_fund')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // รายจ่ายรวมที่กระทบกองกลาง
  const totalOutflows = totalCommunalExpenses + totalIndividualGroupExpenses;

  // ยอดคงเหลือกองกลาง
  const groupBalance = totalInflows - totalOutflows;

  // สรุปสมาชิก
  const activeMembers = data.members.filter(m => m.status === 'active');
  let overdueMembersCount = 0;
  let totalOverdueAmount = 0;
  let advanceMembersCount = 0;

  activeMembers.forEach(member => {
    const summary = calculateMemberSummary(member, data.sessions, data);
    if (summary.isOverdue) {
      overdueMembersCount++;
      totalOverdueAmount += Math.abs(summary.netBalance);
    } else if (summary.isAdvance) {
      advanceMembersCount++;
    }
  });

  return {
    totalInflows,
    totalCommunalExpenses,
    totalIndividualGroupExpenses,
    totalOutflows,
    groupBalance,
    totalMembersCount: data.members.length,
    activeMembersCount: activeMembers.length,
    overdueMembersCount,
    totalOverdueAmount,
    advanceMembersCount
  };
}

/**
 * Format ตัวเลขเป็นสกุลเงินบาท
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format วันที่เป็นภาษาไทย (เช่น 15 พ.ย. 2026)
 */
export function formatThaiDate(dateStr: string, options?: { short?: boolean; yearOffset?: boolean }): string {
  if (!dateStr) return '-';
  try {
    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;

    const thaiMonthsShort = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const thaiYear = options?.yearOffset === false ? year : (year < 2400 ? year + 543 : year);
    return `${day} ${thaiMonthsShort[month]} ${thaiYear}`;
  } catch (e) {
    return dateStr;
  }
}
