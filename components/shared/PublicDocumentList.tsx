
import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Document, DocumentType } from '../../types';
import RequestDocumentModal from './RequestDocumentModal';

const PublicDocumentList: React.FC = () => {
  const { documents, departments } = useData();
  const { currentUser } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Filters
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
      const handler = setTimeout(() => {
          setDebouncedSearchTerm(searchTerm);
      }, 300);
      return () => clearTimeout(handler);
  }, [searchTerm]);

  const directoryDocuments = useMemo(() => {
    // Show ALL documents from other departments (Public AND Confidential)
    return documents.filter(doc => doc.department !== currentUser?.department)
     .filter(doc => {
      const searchTermLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = searchTermLower === '' ||
        doc.title.toLowerCase().includes(searchTermLower) ||
        doc.description.toLowerCase().includes(searchTermLower) ||
        doc.department.toLowerCase().includes(searchTermLower) ||
        doc.metaTags.some(tag => tag.toLowerCase().includes(searchTermLower));
      
      const matchesDepartment = filterDepartment === '' || doc.department === filterDepartment;
      const matchesType = filterType === '' || doc.type === filterType;

      let matchesDate = true;
      if (startDate || endDate) {
        const docDate = new Date(doc.uploadDate);
        if (startDate) {
             const start = new Date(startDate);
             start.setHours(0, 0, 0, 0);
             matchesDate = matchesDate && docDate >= start;
        }
        if (endDate) {
             const end = new Date(endDate);
             end.setHours(23, 59, 59, 999);
             matchesDate = matchesDate && docDate <= end;
        }
      }

      return matchesSearch && matchesDepartment && matchesType && matchesDate;
    });
  }, [documents, currentUser, debouncedSearchTerm, filterDepartment, filterType, startDate, endDate]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterDepartment('');
    setFilterType('');
    setStartDate('');
    setEndDate('');
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Document Directory</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Search</label>
                <input
                    type="search"
                    placeholder="Search Title"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Department</label>
                <select
                    value={filterDepartment}
                    onChange={e => setFilterDepartment(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                    <option value="">All Departments</option>
                    {departments
                        .filter(d => d.name !== currentUser?.department) // Optional: Hide user's own department
                        .map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                </select>
            </div>

             <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">From Date</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">To Date</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>
            
             {/* Reset Button - Full width on mobile, fits col on desk */}
             <div className="md:col-span-2 lg:col-span-1 flex items-end">
                <button
                    onClick={resetFilters}
                    className="w-full bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors text-sm"
                >
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
              <th scope="col" className="px-6 py-3">Restriction</th>
              <th scope="col" className="px-6 py-3">Department</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {directoryDocuments.length > 0 ? directoryDocuments.map(doc => (
              <tr key={doc.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{doc.title}</td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${doc.restrictionType === 'Public' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {doc.restrictionType}
                    </span>
                </td>
                <td className="px-6 py-4">{doc.department}</td>
                <td className="px-6 py-4">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button onClick={() => setSelectedDoc(doc)} className="font-medium text-indigo-600 hover:text-indigo-800">Request Document</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">No documents from other departments found matching criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {selectedDoc && <RequestDocumentModal document={selectedDoc} closeModal={() => setSelectedDoc(null)} />}
    </div>
  );
};

export default PublicDocumentList;
