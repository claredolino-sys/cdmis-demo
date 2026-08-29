
import React from 'react';
import DashboardHome from './DashboardHome';
import PublicDocumentList from '../shared/PublicDocumentList';
import MyRequests from '../shared/MyRequests';
import ActivityLog from '../shared/ActivityLog';

interface StaffDashboardProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ activeView, setActiveView }) => {
  const renderView = () => {
    switch (activeView) {
      case 'Dashboard':
        return <DashboardHome onNavigate={setActiveView} />;
      case 'Document Directory':
        return <PublicDocumentList />;
      case 'My Requests':
        return <MyRequests />;
      case 'Activity Log':
        return <ActivityLog />;
      default:
        return <DashboardHome onNavigate={setActiveView} />;
    }
  };

  return <div>{renderView()}</div>;
};

export default StaffDashboard;
