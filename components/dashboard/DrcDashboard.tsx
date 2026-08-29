
import React from 'react';
import DashboardHome from './DashboardHome';
import DocumentInventory from '../shared/DocumentInventory';
import PublicDocumentList from '../shared/PublicDocumentList';
import RequestList from '../shared/RequestList';
import ActivityLog from '../shared/ActivityLog';
import MyRequests from '../shared/MyRequests';

interface DrcDashboardProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const DrcDashboard: React.FC<DrcDashboardProps> = ({ activeView, setActiveView }) => {
  const renderView = () => {
    switch (activeView) {
      case 'Dashboard':
        return <DashboardHome onNavigate={setActiveView} />;
      case 'Document Inventory':
        return <DocumentInventory />;
      case 'Document Directory':
        return <PublicDocumentList />;
      case 'Requests Inbox':
        return <RequestList />;
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

export default DrcDashboard;
