
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  activeView: string;
  setActiveView: (view: string) => void;
  closeSidebar: () => void;
}

const AdminLinks = [ 'Dashboard', 'Document Inventory', 'User Management', 'Manage Departments', 'Requests Inbox', 'Notifications', 'Activity Log' ];
const DrcLinks = [ 'Dashboard', 'Document Inventory', 'Document Directory', 'Requests Inbox', 'My Requests', 'Activity Log' ];
const StaffLinks = [ 'Dashboard', 'Document Directory', 'My Requests', 'Activity Log' ];

const NavLink: React.FC<{ viewName: string; isActive: boolean; setActiveView: (view: string) => void; closeSidebar: () => void; }> = ({ viewName, isActive, setActiveView, closeSidebar }) => (
    <li className="mb-2">
        <button 
            onClick={() => {
                setActiveView(viewName);
                closeSidebar();
            }}
            className={`w-full text-left px-4 py-2.5 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ${isActive ? 'bg-gray-700 text-white' : ''}`}
        >
            {viewName}
        </button>
    </li>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeView, setActiveView, closeSidebar }) => {
  const { currentUser } = useAuth();

  const getLinksForRole = () => {
    switch (currentUser?.role) {
      case Role.ADMIN:
        return AdminLinks;
      case Role.DRC:
        return DrcLinks;
      case Role.STAFF:
        return StaffLinks;
      default:
        return [];
    }
  };

  return (
    <aside className={`bg-[#323c4f] text-white transition-all duration-300 ease-in-out flex-shrink-0 ${isOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
        <div className="p-4 flex flex-col h-full">
            <div className="flex items-center mb-8">
                <h2 className="text-xl font-bold">CDMIS - Demo</h2>
            </div>
            <nav className="flex-grow">
                <ul>
                    {getLinksForRole().map(link => (
                        <NavLink key={link} viewName={link} setActiveView={setActiveView} isActive={link === activeView} closeSidebar={closeSidebar} />
                    ))}
                </ul>
            </nav>
        </div>
    </aside>
  );
};

export default Sidebar;
