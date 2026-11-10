import React, { useState, useEffect, useCallback } from 'react';
import { AppData, Member } from './types';
import { initialMockData } from './data/mockData';
import { fetchAllData } from './services/api';
import { calculateGroupSummary } from './utils/calculations';

// Components
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { MatrixView } from './components/MatrixView';
import { TransactionsView } from './components/TransactionsView';
import { AttendanceView } from './components/AttendanceView';
import { MembersView } from './components/MembersView';
import { AdminPinModal } from './components/AdminPinModal';
import { SettingsModal } from './components/SettingsModal';
import { SessionModal } from './components/SessionModal';

const ADMIN_PIN_SESSION_KEY = 'halaqah_admin_pin';

export const App: React.FC = () => {
  const [data, setData] = useState<AppData>(initialMockData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Admin Auth State (เก็บ PIN ใน sessionStorage ของแท็บปัจจุบันเท่านั้น)
  const [adminPin, setAdminPin] = useState<string>(() => {
    return sessionStorage.getItem(ADMIN_PIN_SESSION_KEY) || '';
  });
  const isAdmin = Boolean(adminPin);

  // Modals
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // โหลดข้อมูลจาก Google Apps Script หรือ Local Cache
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchAllData();
      setData(res.data);
      setIsOffline(res.isOffline);
    } catch (e) {
      console.error('Error loading data:', e);
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // เมื่อล็อกอิน Admin
  const handleAdminLogin = (pin: string) => {
    setAdminPin(pin);
    sessionStorage.setItem(ADMIN_PIN_SESSION_KEY, pin);
  };

  // เมื่อล็อกเอาท์ Admin
  const handleAdminLogout = () => {
    setAdminPin('');
    sessionStorage.removeItem(ADMIN_PIN_SESSION_KEY);
  };

  // คำนวณสรุปการเงินของกลุ่ม
  const groupSummary = calculateGroupSummary(data);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header แถบด้านบน */}
      <Header
        groupName={data.config.group_name || 'กลุ่มหะละเกาะฮฺ'}
        isAdmin={isAdmin}
        isOffline={isOffline}
        isLoading={isLoading}
        onRefresh={loadData}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            data={data}
            summary={groupSummary}
            isAdmin={isAdmin}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenSessionModal={() => setIsSessionModalOpen(true)}
          />
        )}

        {activeTab === 'matrix' && (
          <MatrixView
            data={data}
            onSelectMember={(m) => {
              setSelectedMember(m);
              setActiveTab('members');
            }}
            onOpenSessionModal={() => setIsSessionModalOpen(true)}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            data={data}
            isAdmin={isAdmin}
            adminPin={adminPin}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            onRefreshData={loadData}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceView
            data={data}
            isAdmin={isAdmin}
            adminPin={adminPin}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            onOpenSessionModal={() => setIsSessionModalOpen(true)}
            onRefreshData={loadData}
          />
        )}

        {activeTab === 'members' && (
          <MembersView
            data={data}
            isAdmin={isAdmin}
            adminPin={adminPin}
            selectedMember={selectedMember}
            onSelectMember={setSelectedMember}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            onRefreshData={loadData}
          />
        )}
      </main>

      {/* Bottom Navigation แถบด้านล่างสำหรับ Mobile Thumb */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        overdueCount={groupSummary.overdueMembersCount}
      />

      {/* Modals ต่างๆ */}
      <AdminPinModal
        isOpen={isAdminModalOpen}
        isAdmin={isAdmin}
        onClose={() => setIsAdminModalOpen(false)}
        onAdminLogin={handleAdminLogin}
        onAdminLogout={handleAdminLogout}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaved={loadData}
      />

      <SessionModal
        isOpen={isSessionModalOpen}
        isAdmin={isAdmin}
        adminPin={adminPin}
        defaultAmount={Number(data.config.default_amount_per_session) || 20}
        onClose={() => setIsSessionModalOpen(false)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onRefreshData={loadData}
      />
    </div>
  );
};
