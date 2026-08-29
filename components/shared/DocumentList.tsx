import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Role, DocumentType } from '../../types';
import { getMockUsers } from '../../services/mockApi';

const DocumentList: React.FC = () => {
  const { documents, addRequest } = useData();
  const { currentUser } = useAuth();
  const users = getMockUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    type: '',
    startDate: '',
    endDate: '',
    custodianId: '',
  });

  const uniqueDepartments = useMemo(() => [...new Set(documents.map(d => d.department))], [documents]);
  const uniqueCustodians = useMemo(() => {
    const custodianIds = [...new Set(documents.map(d => d.uploaderId))];
    return users.filter(u => custodianIds.includes(u.id));
  }, [documents, users]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      department: '',
      type: '',
      startDate: '',
      endDate: '',
      custodianId: '',
    });
  };

  const filteredDocuments = useMemo(() => {
    let roleFilteredDocs: typeof documents = [];
    if (!currentUser) return [];

    switch (currentUser.role) {
      case Role.ADMIN:
        roleFilteredDocs = documents;
        break;
      case Role.DRC:
        roleFilteredDocs = documents.filter(doc => doc.department === currentUser.department);
        break;
      case Role.STAFF:
        // FIX: Property 'isPublic' does not exist on type 'Document'. Changed to use 'restrictionType'.
        roleFilteredDocs = documents.filter(doc => doc.restrictionType === 'Public');
        break;
      default:
        roleFilteredDocs = [];
    }

    return roleFilteredDocs.filter(doc => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = searchTermLower === '' ||
        doc.title.toLowerCase().includes(searchTermLower) ||
        doc.fileName.toLowerCase().includes(searchTermLower);

      const matchesDepartment = filters.department === '' || doc.department === filters.department;
      const matchesType = filters.type === '' || doc.type === filters.type;
      const matchesCustodian = filters.custodianId === '' || doc.uploaderId === filters.custodianId;

      const docDate = new Date(doc.uploadDate);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;
      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);
      const matchesDate = (!startDate || docDate >= startDate) && (!endDate || docDate <= endDate);

      return matchesSearch && matchesDepartment && matchesType && matchesCustodian && matchesDate;
    });
  }, [documents, currentUser, searchTerm, filters]);

  const handleRequest = (documentId: string) => {
    if (currentUser) {
      // FIX: Property 'purpose' is missing in type. Added a default purpose.
      addRequest({ documentId, requesterId: currentUser.id, purpose: 'Requesting access to the document.' });
      alert('Request submitted!');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Document Inventory</h2>
      
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2 lg:col-span-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search by Keyword</label>
            <input
              type="search"
              id="search"
              placeholder="Enter title or filename..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
            <select id="department" name="department" value={filters.department} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="">All Departments</option>
              {uniqueDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Document Type</label>
            <select id="type" name="type" value={filters.type} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="">All Types</option>
              {Object.values(DocumentType).map(docType => <option key={docType} value={docType}>{docType}</option>)}
            </select>
          </div>
          
          <div className="lg:col-span-2">
            <label htmlFor="custodian" className="block text-sm font-medium text-gray-700">Custodian</label>
            <select id="custodian" name="custodianId" value={filters.custodianId} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="">All Custodians</option>
              {uniqueCustodians.map(custodian => <option key={custodian.id} value={custodian.id}>{custodian.name}</option>)}
            </select>
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">From Date</label>
            <input type="date" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">To Date</label>
            <input type="date" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>

          <div className="lg:col-span-2">
            <button onClick={resetFilters} className="w-full bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300">
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Title</th>
              <th scope="col" className="px-6 py-3">Type</th>
              <th scope="col" className="px-6 py-3">Department</th>
              <th scope="col" className="px-6 py-3">Upload Date</th>
              <th scope="col" className="px-6 py-3">Version</th>
              {currentUser?.role === Role.STAFF && <th scope="col" className="px-6 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.length > 0 ? filteredDocuments.map(doc => (
              <tr key={doc.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{doc.title}</td>
                <td className="px-6 py-4">{doc.type}</td>
                <td className="px-6 py-4">{doc.department}</td>
                <td className="px-6 py-4">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">{doc.version}</td>
                {currentUser?.role === Role.STAFF && (
                  <td className="px-6 py-4">
                    <button onClick={() => handleRequest(doc.id)} className="font-medium text-indigo-600 hover:text-indigo-800">Request Access</button>
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                <td colSpan={currentUser?.role === Role.STAFF ? 6 : 5} className="text-center py-8 text-gray-500">No documents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentList;
