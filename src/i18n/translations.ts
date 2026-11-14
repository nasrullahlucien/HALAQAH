export type Language = 'th' | 'en' | 'ar';

export interface Translations {
  [key: string]: {
    th: string;
    en: string;
    ar: string;
  };
}

export const translations: Translations = {
  // App Title & Header
  appTitle: {
    th: 'ระบบบันทึกหะละเกาะฮฺ',
    en: 'Halaqah Recording System',
    ar: 'نظام تسجيل الحلقة'
  },
  appSubtitle: {
    th: 'ระบบบันทึกการเงินและการเข้าพบ',
    en: 'Financial & Attendance Management',
    ar: 'إدارة المالية والحضور'
  },
  offlineMode: {
    th: 'ออฟไลน์',
    en: 'Offline',
    ar: 'غير متصل'
  },
  refreshData: {
    th: 'รีเฟรชข้อมูล',
    en: 'Refresh Data',
    ar: 'تحديث البيانات'
  },
  dbSettings: {
    th: 'ตั้งค่าการเชื่อมต่อ Google Sheets',
    en: 'Google Sheets Settings',
    ar: 'إعدادات جداول بيانات جوجل'
  },
  roleTreasurer: {
    th: 'เหรัญญิก',
    en: 'Admin/Treasurer',
    ar: 'المشرف / أمين الصندوق'
  },
  roleMember: {
    th: 'สมาชิก',
    en: 'Member',
    ar: 'عضو'
  },

  // Navigation Tabs
  tabDashboard: {
    th: 'สรุปภาพรวม',
    en: 'Overview',
    ar: 'لوحة التحكم'
  },
  tabMatrix: {
    th: 'ตารางเงิน',
    en: 'Matrix',
    ar: 'جدول الاشتراكات'
  },
  tabTransactions: {
    th: 'รับ-จ่าย',
    en: 'Finance',
    ar: 'المعاملات'
  },
  tabAttendance: {
    th: 'เช็คชื่อ',
    en: 'Attendance',
    ar: 'الحضور'
  },
  tabAmanah: {
    th: 'อามานะฮ์',
    en: 'Amanah',
    ar: 'الأمانة والتكليف'
  },
  tabMembers: {
    th: 'สมาชิก',
    en: 'Members',
    ar: 'الأعضاء'
  },

  // Dashboard View
  groupBalance: {
    th: 'ยอดเงินคงเหลือกองกลาง',
    en: 'Group Fund Balance',
    ar: 'رصيد الصندوق المشترك'
  },
  totalInflow: {
    th: 'รายรับทั้งหมด',
    en: 'Total Inflow',
    ar: 'إجمالي المقبوضات'
  },
  totalOutflow: {
    th: 'รายจ่ายกองกลาง',
    en: 'Total Outflow',
    ar: 'إجمالي المصروفات'
  },
  overdue: {
    th: 'ค้างชำระ',
    en: 'Overdue',
    ar: 'المتأخرات'
  },
  totalMembers: {
    th: 'สมาชิกทั้งหมด',
    en: 'Total Members',
    ar: 'إجمالي الأعضاء'
  },
  advanceCount: {
    th: 'จ่ายล่วงหน้า {count} คน',
    en: '{count} Paid in advance',
    ar: '{count} مدفوع مقدماً'
  },
  quickActions: {
    th: 'เมนูลัด',
    en: 'Quick Actions',
    ar: 'إجراءات سريعة'
  },
  addSession: {
    th: 'เพิ่มงวดนัด',
    en: 'Add Session',
    ar: 'إضافة لقاء'
  },
  btnIncome: {
    th: 'รับเงิน',
    en: 'Income',
    ar: 'قبض'
  },
  btnExpense: {
    th: 'จ่ายเงิน',
    en: 'Expense',
    ar: 'صرف'
  },
  btnAttendance: {
    th: 'เช็คชื่อ',
    en: 'Attendance',
    ar: 'حضور'
  },
  btnMatrix: {
    th: 'ตารางค้าง',
    en: 'Debts',
    ar: 'المتأخرات'
  },
  latestSession: {
    th: 'งวดล่าสุด',
    en: 'Latest Session',
    ar: 'آخر لقاء'
  },
  perPerson: {
    th: '฿{amount}/คน',
    en: '฿{amount}/person',
    ar: '฿{amount} / للشخص'
  },
  recentActivities: {
    th: 'รายการเคลื่อนไหวล่าสุด',
    en: 'Recent Activities',
    ar: 'آخر الحركات'
  },
  viewAll: {
    th: 'ดูทั้งหมด',
    en: 'View All',
    ar: 'عرض الكل'
  },
  noTransactionsYet: {
    th: 'ยังไม่มีรายการบันทึก',
    en: 'No transactions yet',
    ar: 'لا توجد حركات مسجلة'
  },

  // Matrix View
  matrixTitle: {
    th: 'ตารางสถานะการเงิน (Matrix)',
    en: 'Financial Status Matrix',
    ar: 'جدول الحالة المالية'
  },
  matrixSubtitle: {
    th: 'ตัดยอดตามงวดเก่าสุดก่อนอัตโนมัติ (FIFO) • แตะที่ชื่อเพื่อดูประวัติ',
    en: 'Auto-allocated oldest session first (FIFO) • Tap member name for history',
    ar: 'تسوية الأقدم أولاً تلقائياً • اضغط على اسم العضو لعرض السجل'
  },
  searchMemberPlaceholder: {
    th: 'ค้นหาชื่อสมาชิก...',
    en: 'Search member name...',
    ar: 'بحث عن اسم العضو...'
  },
  filterAll: {
    th: 'ทั้งหมด',
    en: 'All',
    ar: 'الكل'
  },
  filterOverdue: {
    th: 'ค้างชำระ',
    en: 'Overdue',
    ar: 'المتأخرون'
  },
  filterAdvance: {
    th: 'ล่วงหน้า',
    en: 'In Advance',
    ar: 'الدافعون مقدماً'
  },
  legendPaid: {
    th: 'ครบถ้วน',
    en: 'Paid',
    ar: 'مدفوع'
  },
  legendPartial: {
    th: 'บางส่วน',
    en: 'Partial',
    ar: 'جزئي'
  },
  legendUnpaid: {
    th: 'ค้าง',
    en: 'Unpaid',
    ar: 'متأخر'
  },
  scrollHint: {
    th: 'เลื่อนตารางแนวนอนได้ 👉',
    en: 'Swipe horizontally 👉',
    ar: 'اسحب أفقياً 👉'
  },
  colMemberName: {
    th: 'ชื่อสมาชิก',
    en: 'Member Name',
    ar: 'اسم العضو'
  },
  colSessionPrefix: {
    th: 'งวด {num}',
    en: 'Session {num}',
    ar: 'لقاء {num}'
  },
  colTotalPaid: {
    th: 'จ่ายแล้ว',
    en: 'Paid',
    ar: 'المدفوع'
  },
  colTotalExpected: {
    th: 'ควรจ่าย',
    en: 'Expected',
    ar: 'المستحق'
  },
  colNetBalance: {
    th: 'ส่วนต่างสุทธิ',
    en: 'Net Balance',
    ar: 'الصافي'
  },
  overdueTimes: {
    th: '(ค้าง {count} ครั้ง)',
    en: '(Overdue {count})',
    ar: '(متأخر {count} لقاءات)'
  },
  advanceTimes: {
    th: '(ล่วงหน้า {count} ครั้ง)',
    en: '(Advance {count})',
    ar: '(مقدم {count} لقاءات)'
  },
  settledEqual: {
    th: 'ครบถ้วน (฿0)',
    en: 'Settled (฿0)',
    ar: 'مستوفى (฿0)'
  },
  grandTotal: {
    th: 'รวมทั้งหมด',
    en: 'Grand Total',
    ar: 'الإجمالي العام'
  },

  // Transactions View
  tabRecordIncome: {
    th: 'บันทึกรายรับ',
    en: 'Record Income',
    ar: 'تسجيل قبض'
  },
  tabRecordExpense: {
    th: 'บันทึกรายจ่าย',
    en: 'Record Expense',
    ar: 'تسجيل صرف'
  },
  tabHistory: {
    th: 'ประวัติทั้งหมด',
    en: 'Full History',
    ar: 'السجل الكامل'
  },
  memberOnlyWarning: {
    th: 'ขณะนี้ท่านอยู่ในโหมดสมาชิก (ดูอย่างเดียว)',
    en: 'You are currently in view-only member mode',
    ar: 'أنت حالياً في وضع العرض فقط (كعضو)'
  },
  enterPinAdminPrompt: {
    th: 'ต้องเข้าสู่โหมดผู้ดูแล/เหรัญญิกเพื่อบันทึกรายการ',
    en: 'Please enter treasurer PIN to record transactions',
    ar: 'يرجى إدخال رمز المشرف لإجراء المعاملات'
  },
  enterPinBtn: {
    th: 'ใส่ PIN เหรัญญิก',
    en: 'Enter PIN',
    ar: 'إدخال الرمز'
  },
  payerMember: {
    th: 'สมาชิกผู้จ่าย',
    en: 'Paying Member',
    ar: 'العضو الدافع'
  },
  amountBaht: {
    th: 'จำนวนเงิน (บาท)',
    en: 'Amount (THB)',
    ar: 'المبلغ (بات)'
  },
  paymentDate: {
    th: 'วันที่รับเงิน',
    en: 'Payment Date',
    ar: 'تاريخ القبض'
  },
  noteOptional: {
    th: 'หมายเหตุ (ถ้ามี)',
    en: 'Note (Optional)',
    ar: 'ملاحظات (اختياري)'
  },
  btnSavePayment: {
    th: 'บันทึกการรับเงิน',
    en: 'Save Payment',
    ar: 'حفظ سند القبض'
  },
  expenseItem: {
    th: 'รายการค่าใช้จ่าย',
    en: 'Expense Item Description',
    ar: 'بيان المصروف'
  },
  category: {
    th: 'หมวดหมู่',
    en: 'Category',
    ar: 'التصنيف'
  },
  expenseType: {
    th: 'ประเภทรายจ่าย',
    en: 'Expense Type',
    ar: 'نوع المصروف'
  },
  communalGroup: {
    th: 'ส่วนกลาง (ทั้งกลุ่ม)',
    en: 'Communal (Group)',
    ar: 'عام (للمجموعة)'
  },
  individualPerson: {
    th: 'เฉพาะคน (รายบุคคล)',
    en: 'Individual (Personal)',
    ar: 'خاص (لشخص معين)'
  },
  deductFrom: {
    th: 'แหล่งหักเงิน',
    en: 'Deduct From',
    ar: 'جهة الخصم'
  },
  deductGroupFund: {
    th: 'หักจากกองกลาง',
    en: 'From Group Fund',
    ar: 'خصم من الصندوق'
  },
  deductMemberBalance: {
    th: 'หักจากยอดสะสมคนนั้น',
    en: 'From Member Balance',
    ar: 'خصم من رصيد العضو'
  },
  receiptUrl: {
    th: 'ลิงก์รูปใบเสร็จ / สลิป (ถ้ามี)',
    en: 'Receipt Image / Slip Link (Optional)',
    ar: 'رابط الإيصال / الفاتورة (إن وجد)'
  },
  btnSaveExpense: {
    th: 'บันทึกรายจ่าย',
    en: 'Save Expense',
    ar: 'حفظ سند الصرف'
  },

  // Attendance View
  attendanceTitle: {
    th: 'เช็คชื่อการเข้าพบ (Attendance)',
    en: 'Session Attendance',
    ar: 'تسجيل الحضور'
  },
  attendanceSubtitle: {
    th: 'แตะเปลี่ยนสถานะต่อคน (ค่าเริ่มต้นคือ "มา" ทุกคน)',
    en: 'Tap to change status (Default is all present)',
    ar: 'اضغط لتغيير الحالة (الافتراضي هو حضور الجميع)'
  },
  setAllPresent: {
    th: 'ตั้งทุกคน "มา"',
    en: 'Set All Present',
    ar: 'تحديد الكل "حاضر"'
  },
  statusPresent: {
    th: 'มา',
    en: 'Present',
    ar: 'حاضر'
  },
  statusLeave: {
    th: 'ลา',
    en: 'Leave',
    ar: 'مستأذن'
  },
  statusAbsent: {
    th: 'ไม่มา',
    en: 'Absent',
    ar: 'غائب'
  },
  saveAttendanceBatch: {
    th: 'บันทึกการเช็คชื่อทั้งหมด',
    en: 'Save All Attendance',
    ar: 'حفظ كشف الحضور كاملاً'
  },

  // Amanah View
  amanahTitle: {
    th: 'อามานะฮ์ประจำสัปดาห์',
    en: 'Weekly Amanah (Assignments)',
    ar: 'أمانة وتكاليف الأسبوع'
  },
  amanahBadge: {
    th: 'หน้าที่รับผิดชอบ',
    en: 'Responsibilities',
    ar: 'المهام والمسؤوليات'
  },
  amanahSubtitle: {
    th: 'มอบหมายบทบาทและภารกิจสำหรับนัดพบสัปดาห์ถัดไป',
    en: 'Assign roles & duties for the upcoming session',
    ar: 'توزيع الأدوار والمهام للقاء القادم'
  },
  btnEditAmanah: {
    th: 'แก้ไข / กรอกอามานะฮ์',
    en: 'Edit / Fill Amanah',
    ar: 'تعديل / تعبئة الأمانة'
  },
  sessionNextWeekPrefix: {
    th: 'นัดพบสัปดาห์ถัดไป:',
    en: 'Next week session:',
    ar: 'لقاء الأسبوع القادم:'
  },
  sessionNextWeekLabel: {
    th: 'วันที่นัดพบ (สัปดาห์ถัดไป)',
    en: 'Session Date (Next Week)',
    ar: 'تاريخ اللقاء (الأسبوع القادم)'
  },
  cardAmanahHeader: {
    th: '⭐ ฮาลาเกาะฮฺ สัปดาห์ถัดไป',
    en: '⭐ Halaqah Next Session',
    ar: '⭐ لقاء الحلقة القادم'
  },
  rolesSectionTitle: {
    th: 'หน้าที่รับผิดชอบแต่ละคน',
    en: 'Assigned Duties',
    ar: 'توزيع المهام الفردية'
  },
  generalTasksTitle: {
    th: 'ภารกิจผู้ศรัทธา',
    en: 'Believers Tasks',
    ar: 'مهام المؤمنين'
  },
  locationTitle: {
    th: 'สถานที่:',
    en: 'Location:',
    ar: 'المكان:'
  },
  btnCopyLine: {
    th: 'คัดลอกข้อความ LINE',
    en: 'Copy LINE Text',
    ar: 'نسخ الرسالة لـ LINE'
  },
  copiedDone: {
    th: 'คัดลอกแล้ว!',
    en: 'Copied!',
    ar: 'تم النسخ!'
  },
  btnShareLine: {
    th: 'ส่งเข้ากลุ่ม LINE',
    en: 'Share to LINE',
    ar: 'إرسال لمجموعة LINE'
  },
  selectSubjectTag: {
    th: 'เลือกวิชา:',
    en: 'Subject:',
    ar: 'المادة:'
  },
  btnSaveAmanah: {
    th: 'บันทึกอามานะฮ์',
    en: 'Save Amanah',
    ar: 'حفظ الأمانة'
  },

  // Subjects / Roles
  roleTafsir: {
    th: 'ตัฟซีร',
    en: 'Tafsir',
    ar: 'تفسير'
  },
  roleHadith: {
    th: 'ฮาดิษ',
    en: 'Hadith',
    ar: 'حديث'
  },
  roleFiqh: {
    th: 'อัลฟิกฮฺ',
    en: 'Fiqh',
    ar: 'فقه'
  },
  roleAqeedah: {
    th: 'อากีดะห์',
    en: 'Aqeedah',
    ar: 'عقيدة'
  },
  roleNews: {
    th: 'ข่าว',
    en: 'News/Sharing',
    ar: 'أخبار وفوائد'
  },
  roleMC: {
    th: 'ดำเนินรายการ',
    en: 'Moderator (MC)',
    ar: 'إدارة اللقاء'
  },
  roleOther: {
    th: 'อื่นๆ',
    en: 'Other',
    ar: 'أخرى'
  },

  // Members View
  membersTitle: {
    th: 'สมาชิกหะละเกาะฮฺ',
    en: 'Halaqah Members',
    ar: 'أعضاء الحلقة'
  },
  membersSubtitle: {
    th: 'แตะชื่อสมาชิกเพื่อดูประวัติการจ่าย ยอดค้าง และเปอร์เซ็นต์เข้าพบ',
    en: 'Tap member to view payments, debts & attendance rate',
    ar: 'اضغط على العضو لمشاهدة سجل المدفوعات والديون ونسبة الحضور'
  },
  btnAddMember: {
    th: 'เพิ่มสมาชิก',
    en: 'Add Member',
    ar: 'إضافة عضو'
  },
  statusActive: {
    th: 'ยังอยู่ในกลุ่ม',
    en: 'Active',
    ar: 'مستمر'
  },
  statusInactive: {
    th: 'ออกแล้ว',
    en: 'Inactive',
    ar: 'منسحب'
  },
  btnEdit: {
    th: 'แก้ไข',
    en: 'Edit',
    ar: 'تعديل'
  },
  btnCancel: {
    th: 'ยกเลิก',
    en: 'Cancel',
    ar: 'إلغاء'
  },
  btnSave: {
    th: 'บันทึก',
    en: 'Save',
    ar: 'حفظ'
  },
  savingText: {
    th: 'กำลังบันทึก...',
    en: 'Saving...',
    ar: 'جاري الحفظ...'
  },
  editMemberTitle: {
    th: 'แก้ไขข้อมูลสมาชิก',
    en: 'Edit Member Details',
    ar: 'تعديل بيانات العضو'
  },
  memberName: {
    th: 'ชื่อสมาชิก',
    en: 'Member Name',
    ar: 'اسم العضو'
  },
  initialBalance: {
    th: 'ยอดยกมาจากชีทเดิม (บาท)',
    en: 'Initial Balance (THB)',
    ar: 'الرصيد الافتتاحي (بات)'
  },
  memberStatus: {
    th: 'สถานะสมาชิก',
    en: 'Member Status',
    ar: 'حالة العضو'
  },
  attendanceRate: {
    th: 'อัตราการเข้าพบ',
    en: 'Attendance Rate',
    ar: 'نسبة الحضور'
  },
  newSession: {
    th: 'นัดวันใหม่',
    en: 'New Session',
    ar: 'لقاء جديد'
  },
  reasonOptional: {
    th: 'ระบุเหตุผล (เช่น ลาป่วย, ติดงาน)',
    en: 'Reason (e.g. sick leave, busy)',
    ar: 'بيان العذر (مرض، عمل...)'
  },
  saveAttendanceSuccess: {
    th: 'บันทึกการเช็คชื่อเข้าพบเรียบร้อยแล้ว',
    en: 'Attendance saved successfully',
    ar: 'تم حفظ سجل الحضور بنجاح'
  },
  saveAttendanceFail: {
    th: 'บันทึกไม่สำเร็จ',
    en: 'Failed to save attendance',
    ar: 'فشل حفظ الحضور'
  },
  incomeSuccess: {
    th: 'บันทึกรายรับสำเร็จเรียบร้อย',
    en: 'Income recorded successfully',
    ar: 'تم تسجيل سند القبض بنجاح'
  },
  expenseSuccess: {
    th: 'บันทึกรายจ่ายสำเร็จเรียบร้อย',
    en: 'Expense recorded successfully',
    ar: 'تم تسجيل سند الصرف بنجاح'
  },
  selectMemberRequired: {
    th: 'กรุณาเลือกสมาชิก',
    en: 'Please select a member',
    ar: 'يرجى اختيار عضو'
  },
  enterValidAmount: {
    th: 'กรุณาระบุจำนวนเงินที่ถูกต้อง',
    en: 'Please enter a valid amount',
    ar: 'يرجى إدخال مبلغ صحيح'
  },
  enterExpenseDesc: {
    th: 'กรุณาระบุชื่อรายการค่าใช้จ่าย',
    en: 'Please enter expense description',
    ar: 'يرجى إدخال بيان المصروف'
  },
  deleteConfirm: {
    th: 'ต้องการลบรายการนี้ใช่หรือไม่?',
    en: 'Are you sure you want to delete this item?',
    ar: 'هل أنت متأكد من حذف هذا السجل؟'
  },
  deleteSuccess: {
    th: 'ลบรายการสำเร็จ',
    en: 'Item deleted successfully',
    ar: 'تم الحذف بنجاح'
  },

  // Language names
  langThai: {
    th: 'ไทย',
    en: 'Thai',
    ar: 'التايلاندية'
  },
  langEnglish: {
    th: 'อังกฤษ',
    en: 'English',
    ar: 'الإنجليزية'
  },
  langArabic: {
    th: 'อาหรับ',
    en: 'Arabic',
    ar: 'العربية'
  }
};
