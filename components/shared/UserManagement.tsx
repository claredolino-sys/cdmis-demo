
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { User, Role } from '../../types';

// --- Sub-Components ---

interface UserFormProps {
    user: Omit<User, 'password'> | null;
    closeModal: () => void;
    currentUser: User | null;
    users: Omit<User, 'password'>[];
    departments: any[];
    addUser: (user: User, adminId: string) => void;
    updateUser: (userId: string, userData: Partial<User>, adminId: string) => void;
}

const UserFormModal: React.FC<UserFormProps> = ({ user, closeModal, currentUser, departments, addUser, updateUser }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        id: user?.id || '',
        role: user?.role || Role.STAFF,
        department: user?.department || '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        // Validate Password Length
        if (formData.password && formData.password.length !== 4) {
            alert("Password must be exactly 4 characters long.");
            return;
        }

        const userData: Partial<User> = {
            name: formData.name,
            role: formData.role,
            department: formData.department,
        };

        // Only update password if a new one is provided
        if (formData.password) {
            userData.password = formData.password;
        }

        if (user) { // Editing
            updateUser(user.id, userData, currentUser.id);
        } else { // Adding
            if (!formData.password) {
                alert("Password is required for new users.");
                return;
            }
            // Ensure all required fields for new user are present
            addUser({ 
                ...userData, 
                id: formData.id, 
                password: formData.password 
            } as User, currentUser.id);
        }
        closeModal();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{user ? 'Edit User' : 'Add New User'}</h2>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600" title="Close">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                        <input type="text" name="id" value={formData.id} onChange={handleChange} required disabled={!!user} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500" placeholder="e.g. EMP - 0123" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select name="department" value={formData.department} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            <option value="">N/A (No Department)</option>
                            {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                    </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-xs text-gray-500 font-normal">(Exactly 4 chars)</span></label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required={!user} 
                            minLength={4} 
                            maxLength={4} 
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                            placeholder={user ? 'Leave blank to keep unchanged' : 'Set password'}
                        />
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-6">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium shadow-sm">{user ? 'Save Changes' : 'Create User'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<{ user: Omit<User, 'password'>; onConfirm: () => void; onCancel: () => void }> = ({ user, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center mb-4 text-red-600">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <h3 className="text-lg font-bold">Confirm User Deletion</h3>
                </div>
                <p className="text-gray-700 mb-6">
                    Are you sure you want to delete user <span className="font-semibold">{user.name}</span> ({user.id})? 
                    <br/><span className="text-sm text-gray-500 mt-2 block">This action cannot be undone.</span>
                </p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-sm">Delete User</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const UserManagement: React.FC = () => {
    const { users, departments, addUser, updateUser, deleteUser } = useData();
    const { currentUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Omit<User, 'password'> | null>(null);
    const [userToDelete, setUserToDelete] = useState<Omit<User, 'password'> | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [filterRole, setFilterRole] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
                                  user.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            const matchesRole = filterRole === '' || user.role === filterRole;
            
            let matchesDept = true;
            if (filterDept === 'NO_DEPT') {
                matchesDept = !user.department;
            } else if (filterDept !== '') {
                matchesDept = user.department === filterDept;
            }

            return matchesSearch && matchesRole && matchesDept;
        });
    }, [users, debouncedSearchTerm, filterRole, filterDept]);

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * usersPerPage;
        return filteredUsers.slice(start, start + usersPerPage);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const openAddModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: Omit<User, 'password'>) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const initiateDelete = (user: Omit<User, 'password'>) => {
        if (user.id === currentUser?.id) return;
        setUserToDelete(user);
    };

    const confirmDelete = () => {
        if (userToDelete && currentUser) {
            deleteUser(userToDelete.id, currentUser.id);
            setUserToDelete(null);
        }
    };

    const getRoleBadge = (role: string) => {
        switch(role) {
            case Role.ADMIN: return <span className="px-2 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200">Administrator</span>;
            case Role.DRC: return <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Records Custodian</span>;
            case Role.STAFF: return <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800 border border-gray-200">Staff</span>;
            default: return <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800">{role}</span>;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md min-h-[600px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                    <p className="text-gray-500 text-sm">Manage system access and user roles.</p>
                </div>
                <button onClick={openAddModal} className="flex items-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-sm">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add User
                </button>
            </div>

            {/* Filters Toolbar */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Search</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by Name or ID..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Role</label>
                    <select 
                        value={filterRole} 
                        onChange={e => setFilterRole(e.target.value)} 
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="">All Roles</option>
                        {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Department</label>
                    <select 
                        value={filterDept} 
                        onChange={e => setFilterDept(e.target.value)} 
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="">All Departments</option>
                        <option value="NO_DEPT">No Department</option>
                        {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                </div>
            </div>

             <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                        <tr>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Employee ID</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3">Department</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.length > 0 ? paginatedUsers.map(user => (
                            <tr key={user.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-8 w-8 rounded-full object-cover mr-3" src={`https://ui-avatars.com/api/?name=${user.name}&background=random&size=32`} alt="" />
                                        <span className="font-medium text-gray-900">{user.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-gray-600 whitespace-nowrap">{user.id}</td>
                                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                <td className="px-6 py-4 text-gray-700">{user.department || <span className="text-gray-400 italic">None</span>}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center space-x-3">
                                        <button onClick={() => openEditModal(user)} className="text-indigo-600 hover:text-indigo-900" title="Edit User">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                        </button>
                                        <button 
                                            onClick={() => initiateDelete(user)} 
                                            className={`text-red-600 hover:text-red-900 ${user.id === currentUser?.id ? 'opacity-30 cursor-not-allowed' : ''}`}
                                            title={user.id === currentUser?.id ? "You cannot delete yourself" : "Delete User"}
                                            disabled={user.id === currentUser?.id}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-500">No users found matching your filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {filteredUsers.length > 0 && (
                <div className="flex justify-between items-center mt-4 border-t pt-4">
                    <span className="text-sm text-gray-600">
                        Showing <span className="font-medium">{Math.min(filteredUsers.length, ((currentPage - 1) * usersPerPage) + 1)}</span> to <span className="font-medium">{Math.min(currentPage * usersPerPage, filteredUsers.length)}</span> of <span className="font-medium">{filteredUsers.length}</span> results
                    </span>
                    <div className="space-x-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                            disabled={currentPage === 1} 
                            className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                            disabled={currentPage === totalPages} 
                            className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <UserFormModal 
                    user={editingUser} 
                    closeModal={() => setIsModalOpen(false)} 
                    currentUser={currentUser}
                    users={users}
                    departments={departments}
                    addUser={addUser}
                    updateUser={updateUser}
                />
            )}

            {userToDelete && (
                <DeleteConfirmationModal 
                    user={userToDelete} 
                    onConfirm={confirmDelete} 
                    onCancel={() => setUserToDelete(null)} 
                />
            )}
        </div>
    );
};

export default UserManagement;
