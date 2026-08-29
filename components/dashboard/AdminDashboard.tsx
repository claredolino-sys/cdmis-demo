
import React from 'react';
import DashboardHome from './DashboardHome';
import DocumentInventory from '../shared/DocumentInventory';
import UserManagement from '../shared/UserManagement';
import ManageDepartments from '../shared/ManageDepartments';
import RequestList from '../shared/RequestList';
import ActivityLog from '../shared/ActivityLog';
import NotificationsView from '../shared/NotificationsView';

interface AdminDashboardProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeView, setActiveView }) => {
  const renderView = () => {
    switch (activeView) {
      case 'Dashboard':
        return <DashboardHome onNavigate={setActiveView} />;
      case 'Document Inventory':
        return <DocumentInventory />;
      case 'User Management':
        return <UserManagement />;
      case 'Manage Departments':
        return <ManageDepartments />;
      case 'Requests Inbox':
        return <RequestList />;
      case 'Notifications':
        return <NotificationsView />;
      case 'Activity Log':
        return <ActivityLog />;
      default:
        return <DashboardHome onNavigate={setActiveView} />;
    }
  };

  return <div>{renderView()}</div>;
};

export default AdminDashboard;
