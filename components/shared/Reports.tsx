
import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Role, RequestStatus, DocumentStatus } from '../../types';
import PieChart from './PieChart';
import BarChart from './BarChart';

const Reports: React.FC = () => {
    const { documents, requests, users, departments } = useData();
    const { currentUser } = useAuth();
    
    // Date Range State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Filter Data based on Role and Date
    const { filteredDocs, filteredRequests } = useMemo(() => {
        let docs = documents;
        let reqs = requests;

        // Role Filter
        if (currentUser?.role === Role.DRC) {
            docs = docs.filter(d => d.department === currentUser.department);
            // DRC sees requests for their docs
            const myDocIds = docs.map(d => d.id);
            reqs = reqs.filter(r => myDocIds.includes(r.documentId));
        }

        // Date Filter (based on upload date for docs, request date for reqs)
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            docs = docs.filter(d => new Date(d.uploadDate) >= start);
            reqs = reqs.filter(r => new Date(r.requestDate) >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            docs = docs.filter(d => new Date(d.uploadDate) <= end);
            reqs = reqs.filter(r => new Date(r.requestDate) <= end);
        }

        return { filteredDocs: docs, filteredRequests: reqs };
    }, [documents, requests, currentUser, startDate, endDate]);

    // Aggregations
    const stats = useMemo(() => {
        return {
            totalDocs: filteredDocs.length,
            totalRequests: filteredRequests.length,
            approvedRequests: filteredRequests.filter(r => r.status === RequestStatus.APPROVED).length,
            pendingRequests: filteredRequests.filter(r => r.status === RequestStatus.PENDING).length,
            rejectedRequests: filteredRequests.filter(r => r.status === RequestStatus.REJECTED).length,
        };
    }, [filteredDocs, filteredRequests]);

    const chartsData = useMemo(() => {
        // Doc Types Pie
        const typeCounts = filteredDocs.reduce((acc, doc) => {
            acc[doc.type] = (acc[doc.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const docTypes = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

        // Doc Status Bar
        const statusCounts = filteredDocs.reduce((acc, doc) => {
            acc[doc.status] = (acc[doc.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const docStatus = [
             { label: DocumentStatus.APPROVED, value: statusCounts[DocumentStatus.APPROVED] || 0, color: '#10B981' },
             { label: DocumentStatus.DRAFT, value: statusCounts[DocumentStatus.DRAFT] || 0, color: '#FBBF24' },
             { label: DocumentStatus.ARCHIVED, value: statusCounts[DocumentStatus.ARCHIVED] || 0, color: '#9CA3AF' },
        ];

        // Request Status Pie
        const reqCounts = filteredRequests.reduce((acc, req) => {
            acc[req.status] = (acc[req.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const reqStatus = Object.entries(reqCounts).map(([name, value]) => ({ name, value }));

        return { docTypes, docStatus, reqStatus };
    }, [filteredDocs, filteredRequests]);

    // Detailed Table Data
    const tableData = useMemo(() => {
        if (currentUser?.role === Role.ADMIN) {
            // Admin: Department Breakdown
            return departments.map(dept => {
                const deptDocs = filteredDocs.filter(d => d.department === dept.name);
                const deptReqs = filteredRequests.filter(r => {
                    const doc = documents.find(d => d.id === r.documentId);
                    return doc?.department === dept.name;
                });
                const deptUsers = users.filter(u => u.department === dept.name);
                return {
                    label: dept.name,
                    col1: deptDocs.length,
                    col2: deptReqs.length,
                    col3: deptUsers.length
                };
            });
        } else {
            // DRC: Doc Type Breakdown
            const types = Array.from(new Set(filteredDocs.map(d => d.type)));
            return types.map(type => {
                const typeDocs = filteredDocs.filter(d => d.type === type);
                const avgVersion = typeDocs.reduce((sum, d) => sum + d.version, 0) / (typeDocs.length || 1);
                const publicCount = typeDocs.filter(d => d.restrictionType === 'Public').length;
                return {
                    label: type,
                    col1: typeDocs.length,
                    col2: publicCount,
                    col3: avgVersion.toFixed(1)
                };
            });
        }
    }, [filteredDocs, filteredRequests, departments, users, currentUser, documents]);

    const exportCSV = () => {
        const headers = currentUser?.role === Role.ADMIN 
            ? ['Department', 'Total Documents', 'Total Requests', 'Total Users']
            : ['Document Type', 'Total Documents', 'Public Documents', 'Avg Version'];
        
        const rows = tableData.map(row => [row.label, row.col1, row.col2, row.col3]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `cdmis_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-lg shadow-md">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">System Reports</h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Generating report for: <span className="font-semibold text-indigo-600">{currentUser?.role === Role.ADMIN ? 'All Departments' : `${currentUser?.department} Department`}</span>
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                     <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">From:</span>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            className="border rounded-md px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                     </div>
                     <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">To:</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            className="border rounded-md px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                     </div>
                     <button 
                        onClick={() => {setStartDate(''); setEndDate('');}}
                        className="text-sm text-indigo-600 hover:underline"
                     >
                        Clear
                     </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md">
                    <h3 className="text-sm font-bold uppercase opacity-80">Total Documents</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalDocs}</p>
                </div>
                <div className="bg-orange-500 text-white p-6 rounded-lg shadow-md">
                    <h3 className="text-sm font-bold uppercase opacity-80">Total Requests</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalRequests}</p>
                </div>
                <div className="bg-green-500 text-white p-6 rounded-lg shadow-md">
                    <h3 className="text-sm font-bold uppercase opacity-80">Approved Requests</h3>
                    <p className="text-3xl font-bold mt-2">{stats.approvedRequests}</p>
                </div>
                <div className="bg-purple-500 text-white p-6 rounded-lg shadow-md">
                    <h3 className="text-sm font-bold uppercase opacity-80">Pending Requests</h3>
                    <p className="text-3xl font-bold mt-2">{stats.pendingRequests}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Charts */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Documents by Type</h3>
                    <div className="h-64 flex items-center justify-center">
                        {chartsData.docTypes.length > 0 ? <PieChart data={chartsData.docTypes} /> : <p className="text-gray-400">No data</p>}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                     <h3 className="text-lg font-bold text-gray-800 mb-4">Documents by Status</h3>
                     <div className="h-64 flex flex-col justify-center">
                         <BarChart data={chartsData.docStatus} />
                     </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">
                        {currentUser?.role === Role.ADMIN ? 'Departmental Breakdown' : 'Document Type Breakdown'}
                    </h3>
                    <button 
                        onClick={exportCSV}
                        className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors text-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Export CSV
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th className="px-6 py-3">{currentUser?.role === Role.ADMIN ? 'Department' : 'Document Type'}</th>
                                <th className="px-6 py-3">Total Documents</th>
                                <th className="px-6 py-3">{currentUser?.role === Role.ADMIN ? 'Total Requests' : 'Public Documents'}</th>
                                <th className="px-6 py-3">{currentUser?.role === Role.ADMIN ? 'Total Users' : 'Avg Version Count'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, idx) => (
                                <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{row.label}</td>
                                    <td className="px-6 py-4">{row.col1}</td>
                                    <td className="px-6 py-4">{row.col2}</td>
                                    <td className="px-6 py-4">{row.col3}</td>
                                </tr>
                            ))}
                            {tableData.length === 0 && (
                                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No data available for selected range.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
