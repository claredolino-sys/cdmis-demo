
import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { RequestStatus } from '../../types';

const MyRequests: React.FC = () => {
    const { requests, documents } = useData();
    const { currentUser } = useAuth();

    const myRequests = requests.filter(r => r.requesterId === currentUser?.id);
    const getDocTitle = (id: string) => documents.find(d => d.id === id)?.title || 'Unknown Document';

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Document Requests</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Document Title</th>
                            <th scope="col" className="px-6 py-3">Request Date</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Decision Date</th>
                            <th scope="col" className="px-6 py-3">Reviewer Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myRequests.length > 0 ? myRequests.map(req => (
                            <tr key={req.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{getDocTitle(req.documentId)}</td>
                                <td className="px-6 py-4">{new Date(req.requestDate).toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        req.status === RequestStatus.APPROVED ? 'bg-green-100 text-green-800' :
                                        req.status === RequestStatus.REJECTED ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{req.decisionDate ? new Date(req.decisionDate).toLocaleString() : 'N/A'}</td>
                                <td className="px-6 py-4 text-gray-600 italic">{req.reviewerComment || '-'}</td>
                            </tr>
                        )) : (
                           <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">You haven't made any requests.</td>
                           </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyRequests;
