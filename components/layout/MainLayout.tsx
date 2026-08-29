
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import AdminDashboard from '../dashboard/AdminDashboard';
import DrcDashboard from '../dashboard/DrcDashboard';
import StaffDashboard from '../dashboard/StaffDashboard';
import ProfilePage from '../shared/ProfilePage';

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser } = useAuth();
  
  const [activeView, setActiveView] = useState('Dashboard');
  const [showProfile, setShowProfile] = useState(false);
  
  const handleViewChange = (view: string) => {
    if (view === 'Profile') {
      setShowProfile(true);
    } else {
      setShowProfile(false);
      setActiveView(view);
    }
  };

  const renderContent = () => {
    if (!currentUser) return null;
    
    if (showProfile) {
      return <ProfilePage />;
    }
    
    switch (currentUser.role) {
      case Role.ADMIN:
        return <AdminDashboard activeView={activeView} setActiveView={handleViewChange} />;
      case Role.DRC:
        return <DrcDashboard activeView={activeView} setActiveView={handleViewChange} />;
      case Role.STAFF:
        return <StaffDashboard activeView={activeView} setActiveView={handleViewChange} />;
      default:
        return <div>Welcome!</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar isOpen={isSidebarOpen} setActiveView={handleViewChange} activeView={activeView} closeSidebar={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          showProfile={() => handleViewChange('Profile')}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
