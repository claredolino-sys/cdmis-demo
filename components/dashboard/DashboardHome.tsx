
import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Role, RequestStatus, DocumentStatus, Document, ActivityLog } from '../../types';
import PieChart from '../shared/PieChart';
import BarChart from '../shared/BarChart';

// --- Shared UI Components ---

const WelcomeBanner: React.FC<{ name: string; role: string }> = ({ name, role }) => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
                <h1 className="text-3xl font-bold mb-1 text-white">{greeting}, {name}!</h1>
                <p className="text-blue-100 opacity-90">Welcome to your {role} dashboard. Here is what is happening today.</p>
            </div>
            <div className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm rounded-lg p-3 text-sm font-medium border border-white/30">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    trend?: string; // e.g., "+5% from last week"
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color, onClick }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
        red: 'bg-red-50 text-red-600',
        indigo: 'bg-indigo-50 text-indigo-600',
    };

    return (
        <div 
            onClick={onClick}
            className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-xs">
                    <span className="text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded mr-2 border border-green-100">
                        {trend}
                    </span>
                    <span className="text-gray-400">vs last month</span>
                </div>
            )}
        </div>
    );
};

const QuickActionCard: React.FC<{ title: string; desc: string; icon: React.ReactNode; onClick: () => void }> = ({ title, desc, icon, onClick }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-200 group h-full w-full text-center"
    >
        <div className="p-4 bg-gray-50 rounded-full text-gray-500 mb-3 group-hover:bg-white group-hover:text-indigo-600 transition-colors duration-300 shadow-sm">
            {icon}
        </div>
        <h4 className="font-bold text-gray-800 mb-1">{title}</h4>
        <p className="text-xs text-gray-500">{desc}</p>
    </button>
);

const SectionHeader: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
    <div className="flex justify-between items-center mb-4 mt-2">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <span className="w-1 h-6 bg-indigo-500 rounded-full mr-3"></span>
            {title}
        </h2>
        {action}
    </div>
);

// --- Lists & Widgets ---

const RecentActivityWidget: React.FC<{ logs: ActivityLog[]; users: any[]; onViewAll?: () => void }> = ({ logs, users, onViewAll }) => {
    const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

    const getActionColor = (action: string) => {
        if (action.includes('DELETE')) return 'bg-red-50 text-red-600 border-red-100';
        if (action.includes('ADD') || action.includes('UPLOAD')) return 'bg-green-50 text-green-600 border-green-100';
        if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-blue-50 text-blue-600 border-blue-100';
        return 'bg-gray-50 text-gray-600 border-gray-200';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Recent System Activity</h3>
            </div>
            <div className="divide-y divide-gray-100 flex-grow overflow-auto">
                {logs.slice(0, 6).map(log => (
                    <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getActionColor(log.action)}`}>
                                {log.action.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span>
                        </div>
                        <p className="text-sm text-gray-800 mt-1">{log.details}</p>
                        <p className="text-xs text-gray-500 mt-1">By: <span className="font-medium text-gray-700">{getUserName(log.userId)}</span></p>
                    </div>
                ))}
                {logs.length === 0 && <div className="p-6 text-center text-gray-500 italic">No recent activity.</div>}
            </div>
            {onViewAll && (
                <button 
                    onClick={onViewAll}
                    className="p-3 bg-gray-50 text-indigo-600 text-sm font-bold hover:bg-gray-100 transition-colors border-t border-gray-100 w-full"
                >
                    View Full Log
                </button>
            )}
        </div>
    );
};

const PendingRequestsWidget: React.FC<{ requests: any[]; documents: Document[]; users: any[]; onProcess: () => void }> = ({ requests, documents, users, onProcess }) => {
    const pending = requests.filter(r => r.status === RequestStatus.PENDING).slice(0, 5);
    const getDocTitle = (id: string) => documents.find(d => d.id === id)?.title || 'Unknown Doc';
    const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown User';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-orange-50/50 flex justify-between items-center">
                <h3 className="font-bold text-orange-800">Pending Approvals</h3>
                <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">{pending.length}</span>
            </div>
            <div className="divide-y divide-gray-100 flex-grow">
                {pending.map(req => (
                    <div key={req.id} className="p-4 hover:bg-orange-50/20 transition-colors">
                        <div className="flex justify-between">
                            <h4 className="text-sm font-bold text-gray-800 truncate pr-2">{getDocTitle(req.documentId)}</h4>
                            <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(req.requestDate).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Requester: {getUserName(req.requesterId)}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">"{req.purpose}"</p>
                    </div>
                ))}
                {pending.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                        <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p className="text-sm">No pending requests</p>
                    </div>
                )}
            </div>
            {pending.length > 0 && (
                <button 
                    onClick={onProcess}
                    className="p-3 bg-gray-50 text-indigo-600 text-sm font-bold hover:bg-gray-100 transition-colors border-t border-gray-100 w-full"
                >
                    View All Requests
                </button>
            )}
        </div>
    );
};

// --- Main Dashboard Component ---

interface DashboardHomeProps {
    onNavigate: (view: string) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
    const { currentUser } = useAuth();
    const { documents, requests, logs, users, departments } = useData();

    // Icons
    const Icons = {
        Doc: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
        Users: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>,
        Dept: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>,
        Storage: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>,
        Pending: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
        Check: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
        Upload: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>,
        Search: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>,
        AddUser: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>,
        Report: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    };

    // --- Data Calculation ---

    // Admin Data
    const adminData = useMemo(() => {
        const totalDocs = documents.length;
        const pending = requests.filter(r => r.status === RequestStatus.PENDING).length;
        
        const docsByStatus = [
            { label: DocumentStatus.APPROVED, value: documents.filter(d => d.status === DocumentStatus.APPROVED).length, color: '#10B981' },
            { label: DocumentStatus.DRAFT, value: documents.filter(d => d.status === DocumentStatus.DRAFT).length, color: '#FBBF24' },
            { label: DocumentStatus.ARCHIVED, value: documents.filter(d => d.status === DocumentStatus.ARCHIVED).length, color: '#9CA3AF' },
        ];

        // Top 5 Departments by Doc Count
        const deptCounts = documents.reduce((acc, doc) => {
            acc[doc.department] = (acc[doc.department] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const docsByDept = Object.entries(deptCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a,b) => b.value - a.value)
            .slice(0, 5);

        return { totalDocs, pending, docsByStatus, docsByDept };
    }, [documents, requests]);

    // DRC Data
    const drcData = useMemo(() => {
        if (!currentUser) return null;
        const myDocs = documents.filter(d => d.department === currentUser.department);
        const myDocIds = myDocs.map(d => d.id);
        const pending = requests.filter(r => myDocIds.includes(r.documentId) && r.status === RequestStatus.PENDING);
        
        const typeCounts = myDocs.reduce((acc, doc) => {
            acc[doc.type] = (acc[doc.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const docsByType = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

        return { 
            totalDocs: myDocs.length, 
            pendingRequests: pending,
            approvedCount: requests.filter(r => myDocIds.includes(r.documentId) && r.status === RequestStatus.APPROVED).length,
            docsByType
        };
    }, [documents, requests, currentUser]);

    // Filter Logs for DRC
    const drcLogs = useMemo(() => {
        if (!currentUser || currentUser.role !== Role.DRC) return [];
        return logs.filter(log => {
            const user = users.find(u => u.id === log.userId);
            return user?.department === currentUser.department;
        });
    }, [logs, users, currentUser]);

    // Staff Data
    const staffData = useMemo(() => {
         if (!currentUser) return null;
         const myRequests = requests.filter(r => r.requesterId === currentUser.id);
         // Filter matches PublicDocumentList logic: documents from other departments
         const directoryDocs = documents.filter(d => d.department !== currentUser.department);
         
         return {
             totalRequests: myRequests.length,
             pending: myRequests.filter(r => r.status === RequestStatus.PENDING).length,
             approved: myRequests.filter(r => r.status === RequestStatus.APPROVED).length,
             availableDocs: directoryDocs.length
         };
    }, [requests, documents, currentUser]);


    // --- View Renders ---

    const renderAdminView = () => (
        <div className="animate-fade-in pb-10">
            <WelcomeBanner name={currentUser?.name || 'Admin'} role="System Administrator" />
            
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Documents" value={adminData.totalDocs} icon={Icons.Doc} color="blue" trend="+12" onClick={() => onNavigate('Document Inventory')} />
                <StatCard title="Total Users" value={users.length} icon={Icons.Users} color="indigo" trend="+2" onClick={() => onNavigate('User Management')} />
                <StatCard title="Pending Requests" value={adminData.pending} icon={Icons.Pending} color="orange" onClick={() => onNavigate('Requests Inbox')} />
                <StatCard title="Departments" value={departments.length} icon={Icons.Dept} color="purple" onClick={() => onNavigate('Manage Departments')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <SectionHeader title="System Statistics" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-64 flex flex-col items-center justify-center">
                                {/* Changed to Document by Department */}
                                <h4 className="text-sm font-semibold text-gray-500 mb-4">Document by Department</h4>
                                <PieChart data={adminData.docsByDept.map(d => ({ name: d.name, value: d.value }))} />
                            </div>
                            <div className="h-64 flex flex-col justify-center">
                                <h4 className="text-sm font-semibold text-gray-500 mb-4">Top Departments (Doc Volume)</h4>
                                <BarChart data={adminData.docsByDept.map((d, i) => ({ label: d.name, value: d.value, color: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'][i % 5] }))} />
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                         <SectionHeader title="Quick Actions" />
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <QuickActionCard title="Add User" desc="Create new account" icon={Icons.AddUser} onClick={() => onNavigate('User Management')} />
                            <QuickActionCard title="Inventory" desc="Manage documents" icon={Icons.Doc} onClick={() => onNavigate('Document Inventory')} />
                            <QuickActionCard title="Approvals" desc="Review requests" icon={Icons.Check} onClick={() => onNavigate('Requests Inbox')} />
                         </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                     <div className="h-[500px]">
                        <RecentActivityWidget 
                            logs={logs} 
                            users={users} 
                            onViewAll={() => onNavigate('Activity Log')} 
                        />
                     </div>
                </div>
            </div>
        </div>
    );

    const renderDrcView = () => (
        <div className="animate-fade-in pb-10">
            <WelcomeBanner name={currentUser?.name || 'Custodian'} role="Records Custodian" />
            
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Department Documents" value={drcData?.totalDocs || 0} icon={Icons.Doc} color="blue" onClick={() => onNavigate('Document Inventory')} />
                <StatCard title="Pending Approvals" value={drcData?.pendingRequests.length || 0} icon={Icons.Pending} color="orange" onClick={() => onNavigate('Requests Inbox')} />
                <StatCard title="Approved Requests" value={drcData?.approvedCount || 0} icon={Icons.Check} color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Charts */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                         <SectionHeader title="Department Overview" />
                         <div className="h-72 flex flex-col items-center justify-center">
                            {drcData?.docsByType && drcData.docsByType.length > 0 ? (
                                <PieChart data={drcData.docsByType} />
                            ) : (
                                <div className="text-gray-400 italic">No documents uploaded yet.</div>
                            )}
                         </div>
                    </div>

                    {/* Actions */}
                    <div>
                         <SectionHeader title="Quick Actions" />
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <QuickActionCard title="Upload" desc="Add new document" icon={Icons.Upload} onClick={() => onNavigate('Document Inventory')} />
                            <QuickActionCard title="Search" desc="Find documents" icon={Icons.Search} onClick={() => onNavigate('Document Inventory')} />
                            <QuickActionCard title="Approvals" desc="Review requests" icon={Icons.Check} onClick={() => onNavigate('Requests Inbox')} />
                         </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-8">
                     {/* Recent Activity for DRC */}
                    <div className="h-[500px]">
                        <RecentActivityWidget 
                            logs={drcLogs} 
                            users={users} 
                            onViewAll={() => onNavigate('Activity Log')} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStaffView = () => (
        <div className="animate-fade-in pb-10">
            <WelcomeBanner name={currentUser?.name || 'Staff'} role="Staff Member" />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Available Documents" value={staffData?.availableDocs || 0} icon={Icons.Search} color="indigo" onClick={() => onNavigate('Document Directory')} />
                <StatCard title="My Active Requests" value={staffData?.pending || 0} icon={Icons.Pending} color="orange" onClick={() => onNavigate('My Requests')} />
                <StatCard title="Approved Requests" value={staffData?.approved || 0} icon={Icons.Check} color="green" onClick={() => onNavigate('My Requests')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Left Column - Main Content */}
                 <div className="lg:col-span-2 space-y-8">
                    {/* Quick Actions */}
                    <div>
                        <SectionHeader title="Quick Actions" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <QuickActionCard title="Browse Directory" desc="Search available records" icon={Icons.Search} onClick={() => onNavigate('Document Directory')} />
                            <QuickActionCard title="Check Status" desc="View request progress" icon={Icons.Pending} onClick={() => onNavigate('My Requests')} />
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar Widgets */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
                        <div className="p-4 border-b border-gray-100 bg-blue-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-blue-800">My Recent Requests</h3>
                        </div>
                        <div className="divide-y divide-gray-100 flex-grow">
                            {requests.filter(r => r.requesterId === currentUser?.id).slice(0, 5).map(req => (
                                <div key={req.id} className="p-4 hover:bg-blue-50/20 transition-colors">
                                    <div className="flex justify-between">
                                        <h4 className="text-sm font-bold text-gray-800 truncate pr-2">{documents.find(d => d.id === req.documentId)?.title}</h4>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                            req.status === RequestStatus.APPROVED ? 'bg-green-50 text-green-700 border-green-100' :
                                            req.status === RequestStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(req.requestDate).toLocaleDateString()}</p>
                                </div>
                            ))}
                             {requests.filter(r => r.requesterId === currentUser?.id).length === 0 && (
                                <div className="p-6 text-center text-gray-400 italic">No recent requests.</div>
                            )}
                        </div>
                         <button 
                            onClick={() => onNavigate('My Requests')}
                            className="p-3 bg-gray-50 text-indigo-600 text-sm font-bold hover:bg-gray-100 transition-colors border-t border-gray-100 w-full"
                        >
                            View All Requests
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    switch(currentUser?.role) {
        case Role.ADMIN: return renderAdminView();
        case Role.DRC: return renderDrcView();
        case Role.STAFF: return renderStaffView();
        default: return <div>Loading...</div>;
    }
};

export default DashboardHome;
