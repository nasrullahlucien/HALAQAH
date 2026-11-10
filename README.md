# ระบบบันทึกหะละเกาะฮฺ (Halaqah Recording System)

เว็บแอปพลิเคชันสำหรับบันทึกการเงินและการเข้าพบกลุ่มหะละเกาะฮฺ ออกแบบแบบ **Mobile-First** ภาษาไทยทั้งหมด ทดแทนการใช้ Google Sheets แบบเดิม พร้อมเชื่อมต่อ Google Sheets ผ่าน Google Apps Script Web App และพร้อม Deploy ขึ้น GitHub Pages ผ่าน GitHub Actions ทันที

---

## 🌟 ฟีเจอร์หลัก (Key Features)

1. **ตารางสถานะการเงิน (Matrix View)**
   - สมาชิกเป็นแถว งวดวันที่นัดพบเป็นคอลัมน์ พร้อมตรึง (Freeze) คอลัมน์ชื่อสมาชิกด้านซ้ายบนมือถือ
   - ระบบจัดสรรเงินชำระตามงวดแบบ **FIFO (First-In, First-Out)** ตัดงวดเก่าสุดก่อนอัตโนมัติ
   - แสดงสีสถานะชัดเจน: เขียว (ครบถ้วน), ส้ม (ชำระบางส่วน), แดง (ค้างชำระ)
   - ช่องสรุปแสดงสีแดงเด่นชัดเมื่อมียอดค้างชำระ พร้อมระบุจำนวนครั้งที่ค้าง
   - แถวสรุปผลรวมท้ายตารางในแต่ละงวด

2. **การบันทึกรายรับและรายจ่าย (Transactions)**
   - **บันทึกรายรับ:** สมาชิกสามารถจ่ายแบบก้อนเดียวหลายงวด หรือจ่ายชดเชยงวดที่ค้างได้
   - **บันทึกรายจ่าย:** รองรับทั้ง **"ส่วนกลาง"** (หักจากกองกลาง) และ **"เฉพาะคน"** (เลือกระหว่างหักจากกองกลาง หรือปรับลดยอดสะสมของคนนั้น)
   - รองรับการแนบลิงก์รูปสลิปหรือใบเสร็จ

3. **เช็คชื่อการเข้าพบ (Attendance)**
   - เลือกวันที่นัดพบ (ใส่งวดใหม่ได้)
   - แตะเลือกสถานะรายคน: `มา` (เขียว) / `ลา` (เหลือง) / `ไม่มา` (แดง)
   - ค่าเริ่มต้นเป็น "มา" ทุกคน บันทึกเสร็จใน 1 คลิก
   - บันทึกแบบชุด (Batch Submit) ไม่ต้องกดทีละคน
   - การเข้าพบไม่มีผลต่อยอดเงินที่ต้องจ่าย (คำนวณแยกเพื่อประเมินความสม่ำเสมอ)

4. **โปรไฟล์สมาชิกแบบเจาะลึก (Member Profiles)**
   - สรุปยอดจ่ายแล้ว, ยอดควรจ่าย, รายจ่ายเฉพาะคน, ยอดคงเหลือ/ค้างชำระ
   - หลอดเปอร์เซ็นต์การเข้าพบ (% Attendance)
   - ประวัติการจ่ายเงินย้อนหลัง และประวัติรายจ่ายเฉพาะคน

5. **ระบบสิทธิ์และความปลอดภัย (Security & Permissions)**
   - **โหมดสมาชิก:** เปิดดูข้อมูลได้อย่างเดียว (Read-only)
   - **โหมดเหรัญญิก/ผู้ดูแล:** ปลดล็อกด้วยรหัส PIN (ตรวจสิทธิ์ที่เซิร์ฟเวอร์ Google Apps Script ปลอดภัย ไม่มีการ Hardcode รหัส PIN ในโค้ดเว็บ)
   - ป้องกันการบันทึกข้อมูลชนกันด้วย `LockService` ฝั่ง Google Apps Script

---

## 🚀 เทคโนโลยีที่ใช้
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **Backend Database:** Google Sheets ผ่าน Google Apps Script (REST Web App)
- **Deployment:** GitHub Pages (Automated with GitHub Actions)

---

## 📦 การติดตั้งและการใช้งาน

### 1. ติดตั้ง Backend (Google Apps Script)
ดูคู่มืออย่างละเอียดใน [`google-apps-script/README.md`](./google-apps-script/README.md)
1. เปิด Google Sheets ใหม่
2. ไปที่ **ส่วนขยาย (Extensions)** > **Apps Script**
3. วางโค้ดจาก `google-apps-script/Code.gs`
4. รันฟังก์ชัน `initialSetup()` 1 ครั้ง เพื่อสร้างชีตทั้ง 6 ชีตพร้อมหัวตารางและข้อมูลตัวอย่าง
5. กด **Deploy > New deployment > Web app** (Who has access: "Anyone")
6. คัดลอก Web App URL ที่ได้

### 2. รันโปรเจกต์เว็บในเครื่อง (Local Development)
```bash
# ติดตั้ง dependencies
npm install

# รัน Development Server
npm run dev
```
เปิดเว็บขึ้นมาแล้วสามารถคลิกไอคอนฟันเฟือง ⚙️ ด้านบนขวา เพื่อวาง **Web App URL** ของคุณ หรือทดสอบในโหมดออฟไลน์ด้วย Mock Data ได้ทันที

### 3. Deploy ขึ้น GitHub Pages ด้วย GitHub Actions
1. Push โค้ดทั้งหมดขึ้น GitHub Repository ของคุณ (main หรือ master)
2. ไปที่แท็บ **Settings** ของ GitHub Repo > เมนูด้านซ้ายเลือก **Pages**
3. ในส่วน **Build and deployment > Source** ให้เลือกเป็น **GitHub Actions**
4. เมื่อ push โค้ด ระบบจะรัน GitHub Actions Workflow (`.github/workflows/deploy.yml`) และ deploy หน้าเว็บขึ้น GitHub Pages ให้อัตโนมัติ!
