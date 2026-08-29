
import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

const ActivityLog: React.FC = () => {
    const { logs, users } = useData();
    const { currentUser } = useAuth();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [page, setPage] = useState(1);
    const logsPerPage = 10;
    
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const filteredLogs = useMemo(() => {
        let roleFilteredLogs = logs;
        if (!currentUser) return [];

        if (currentUser.role === Role.DRC) {
            roleFilteredLogs = logs.filter(log => {
                const user = userMap.get(log.userId);
                return user?.department === currentUser.department;
            });
        } else if (currentUser.role === Role.STAFF) {
            // Staff can only see their own logs
            roleFilteredLogs = logs.filter(log => log.userId === currentUser.id);
        }
        
        return roleFilteredLogs.filter(log => {
           const searchTermLower = debouncedSearchTerm.toLowerCase();
           const user = userMap.get(log.userId);
           return (
                (user?.name.toLowerCase() || '').includes(searchTermLower) ||
                log.action.toLowerCase().includes(searchTermLower) ||
                log.details.toLowerCase().includes(searchTermLower)
           )
        });

    }, [logs, currentUser, userMap, debouncedSearchTerm]);
    
    const paginatedLogs = filteredLogs.slice((page - 1) * logsPerPage, page * logsPerPage);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Activity Log (Audit Trail)</h2>
            <div className="mb-4">
                <input
                    type="search"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Timestamp</th>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Department</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                            <th scope="col" className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLogs.length > 0 ? paginatedLogs.map(log => {
                            const user = userMap.get(log.userId);
                            return (
                                <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-medium">{user?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4">{user?.department || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-indigo-700 mb-0.5">{user?.name || 'Unknown User'}</span>
                                            <span className="text-gray-600">{log.details}</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">No activity logs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
             <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-700">
                    Showing {Math.min(filteredLogs.length, ((page - 1) * logsPerPage) + 1)} to {Math.min(page * logsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
                </span>
                <div className="space-x-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded-md disabled:opacity-50">Previous</button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
};

export default ActivityLog;
