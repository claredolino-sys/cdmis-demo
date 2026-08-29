
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Department } from '../../types';

const ManageDepartments: React.FC = () => {
    const { departments, users, documents, addDepartment, updateDepartment, deleteDepartment } = useData();
    const { currentUser } = useAuth();
    const [newDeptName, setNewDeptName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDeptName.trim() && currentUser) {
            if (departments.some(d => d.name.toLowerCase() === newDeptName.trim().toLowerCase())) {
                alert('Department name already exists.');
                return;
            }
            addDepartment(newDeptName.trim(), currentUser.id);
            setNewDeptName('');
        }
    };

    const filteredDepartments = useMemo(() => {
        return departments.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [departments, searchTerm]);

    const getStats = (deptName: string) => {
        const userCount = users.filter(u => u.department === deptName).length;
        const docCount = documents.filter(d => d.department === deptName).length;
        return { userCount, docCount };
    };

    const startEdit = (dept: Department) => {
        setEditingId(dept.id);
        setEditName(dept.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const saveEdit = (id: string) => {
        if (editName.trim() && currentUser) {
             // Check for duplicates (excluding self)
             if (departments.some(d => d.name.toLowerCase() === editName.trim().toLowerCase() && d.id !== id)) {
                alert('Department name already exists.');
                return;
            }
            updateDepartment(id, editName.trim(), currentUser.id);
            setEditingId(null);
        }
    };

    const handleDelete = (id: string, name: string) => {
        const { userCount, docCount } = getStats(name);
        if (userCount > 0 || docCount > 0) {
            alert(`Cannot delete department "${name}" because it has ${userCount} users and ${docCount} documents associated with it. Please reassign or remove them first.`);
            return;
        }
        
        if (window.confirm(`Are you sure you want to delete the "${name}" department?`)) {
            if (currentUser) deleteDepartment(id, currentUser.id);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md min-h-[600px]">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b pb-6">
                <div className="w-full md:w-auto">
                    <h2 className="text-2xl font-bold text-gray-800">Manage Departments</h2>
                    <p className="text-gray-500 text-sm mt-1">Create and organize university departments.</p>
                </div>
                
                {/* Add Department Form */}
                <form onSubmit={handleSubmit} className="flex w-full md:w-auto space-x-2">
                     <input
                        type="text"
                        value={newDeptName}
                        onChange={e => setNewDeptName(e.target.value)}
                        placeholder="New Department Name"
                        required
                        className="flex-grow md:w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium shadow-sm whitespace-nowrap">
                        + Add Dept
                    </button>
                </form>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                 <input
                    type="search"
                    placeholder="Search departments..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
            </div>

            {/* Department Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDepartments.map(dept => {
                    const stats = getStats(dept.name);
                    const isEditing = editingId === dept.id;

                    return (
                        <div key={dept.id} className={`border rounded-lg p-5 transition-all duration-200 hover:shadow-md ${isEditing ? 'ring-2 ring-indigo-500 border-transparent bg-indigo-50' : 'bg-white'}`}>
                            <div className="flex justify-between items-start mb-4">
                                {isEditing ? (
                                    <div className="w-full mr-2">
                                        <input 
                                            type="text" 
                                            value={editName} 
                                            onChange={e => setEditName(e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-bold"
                                            autoFocus
                                        />
                                    </div>
                                ) : (
                                    <h3 className="text-lg font-bold text-gray-800 truncate pr-2" title={dept.name}>{dept.name}</h3>
                                )}
                                
                                <div className="flex space-x-1 flex-shrink-0">
                                    {isEditing ? (
                                        <>
                                            <button onClick={() => saveEdit(dept.id)} className="text-green-600 hover:bg-green-100 p-1 rounded" title="Save">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            </button>
                                            <button onClick={cancelEdit} className="text-gray-500 hover:bg-gray-200 p-1 rounded" title="Cancel">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEdit(dept)} className="text-gray-400 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50" title="Rename">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
                                            <button onClick={() => handleDelete(dept.id, dept.name)} className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50" title="Delete">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex space-x-4 text-sm text-gray-600">
                                <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                    <span className="font-semibold mr-1">{stats.userCount}</span> Users
                                </div>
                                <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    <span className="font-semibold mr-1">{stats.docCount}</span> Docs
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredDepartments.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        No departments found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageDepartments;
