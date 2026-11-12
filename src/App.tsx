import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AppealFormSection } from './components/AppealFormSection';
import { CheckStatusSection } from './components/CheckStatusSection';
import { GuideSection } from './components/GuideSection';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'submit' | 'check' | 'admin'>('home');

  // Status check pre-fill state
  const [checkId, setCheckId] = useState('');
  const [checkPhone, setCheckPhone] = useState('');

  // Admin auth
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState<string>('');
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('tkti_admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
      setIsAdminLoggedIn(true);
    }
  }, []);

  const handleAdminLoginSuccess = (token: string) => {
    localStorage.setItem('tkti_admin_token', token);
    setAdminToken(token);
    setIsAdminLoggedIn(true);
    setActiveTab('admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('tkti_admin_token');
    setAdminToken('');
    setIsAdminLoggedIn(false);
    if (activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  const handleCheckAppealFromReceipt = (id: string, phone: string) => {
    setCheckId(id);
    setCheckPhone(phone);
    setActiveTab('check');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={handleAdminLogout}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
      />

      {/* Main Content Areas */}
      <main className="flex-1 pb-16">
        {/* 1. BOSH SAHIFA */}
        {activeTab === 'home' && (
          <div>
            <HeroSection
              onGoToSubmit={() => {
                setActiveTab('submit');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onGoToCheck={() => {
                setActiveTab('check');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <GuideSection />
          </div>
        )}

        {/* 2. MUROJAAT YUBORISH */}
        {activeTab === 'submit' && (
          <AppealFormSection
            onCheckAppeal={handleCheckAppealFromReceipt}
            onRefreshStats={() => {}}
          />
        )}

        {/* 3. MUROJAAT HOLATINI TEKSHIRISH */}
        {activeTab === 'check' && (
          <CheckStatusSection
            initialAppealId={checkId}
            initialPhone={checkPhone}
            onGoToSubmit={() => {
              setActiveTab('submit');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* 4. ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          isAdminLoggedIn ? (
            <AdminDashboard
              token={adminToken}
              onLogout={handleAdminLogout}
              onSettingsUpdated={() => {}}
            />
          ) : (
            <div className="py-20 text-center space-y-4">
              <h2 className="text-xl font-bold text-slate-800">
                Administrator paneliga kirish talab etiladi
              </h2>
              <button
                onClick={() => setIsAdminLoginModalOpen(true)}
                className="px-6 py-3 bg-[#0f3b75] hover:bg-[#154685] text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Tizimga kirish
              </button>
            </div>
          )
        )}
      </main>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
