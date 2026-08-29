
import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Role, RequestStatus, DocumentRequest } from '../../types';

const RequestList: React.FC = () => {
    const { requests, documents, updateRequestStatus, users } = useData();
    const { currentUser } = useAuth();

    // State for the approval/rejection modal
    const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [comment, setComment] = useState('');
    
    // State for ID viewing (stores the URL now)
    const [viewIdUrl, setViewIdUrl] = useState<string | null>(null);

    const getUsername = (id: string) => users.find(u => u.id === id)?.name || 'Unknown User';
    const getUserRole = (id: string) => users.find(u => u.id === id)?.role || 'Unknown Role';
    const getUserDepartment = (id: string) => users.find(u => u.id === id)?.department || 'N/A';
    const getDocTitle = (id: string) => documents.find(d => d.id === id)?.title || 'Unknown Document';

    const filteredRequests = useMemo(() => {
        if (!currentUser) return [];
        switch (currentUser.role) {
            case Role.ADMIN:
                return requests.filter(r => r.status === RequestStatus.PENDING);
            case Role.DRC:
                const drcDocs = documents.filter(d => d.department === currentUser.department).map(d => d.id);
                return requests.filter(r => drcDocs.includes(r.documentId) && r.status === RequestStatus.PENDING);
            default:
                return [];
        }
    }, [requests, documents, currentUser]);

    const initiateDecision = (req: DocumentRequest, type: 'approve' | 'reject') => {
        setSelectedRequest(req);
        setActionType(type);
        setComment('');
    };

    const handleConfirmDecision = () => {
        if(currentUser && selectedRequest && actionType) {
            const status = actionType === 'approve' ? RequestStatus.APPROVED : RequestStatus.REJECTED;
            updateRequestStatus(selectedRequest.id, status, currentUser.id, comment);
            setSelectedRequest(null);
            setActionType(null);
            setComment('');
        }
    };
    
    const cancelDecision = () => {
        setSelectedRequest(null);
        setActionType(null);
        setComment('');
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Incoming Document Requests</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Document Title</th>
                            <th scope="col" className="px-6 py-3">Requester</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3">Department</th>
                            <th scope="col" className="px-6 py-3">Request Date</th>
                            <th scope="col" className="px-6 py-3">ID Verification</th>
                            <th scope="col" className="px-6 py-3">Purpose</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.length > 0 ? filteredRequests.map(req => (
                            <tr key={req.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{getDocTitle(req.documentId)}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium">{getUsername(req.requesterId)}</div>
                                    <div className="text-xs text-gray-400">{req.requesterId}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUserRole(req.requesterId) === Role.ADMIN ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {getUserRole(req.requesterId)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{getUserDepartment(req.requesterId)}</td>
                                <td className="px-6 py-4">{new Date(req.requestDate).toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    {req.idUploadUrl === 'internal-admin-request' ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Internal
                                        </span>
                                    ) : req.idUploadUrl ? (
                                        <button 
                                            onClick={() => setViewIdUrl(req.idUploadUrl || null)}
                                            className="flex items-center text-indigo-600 hover:text-indigo-900 text-xs font-bold transition-colors bg-indigo-50 px-2 py-1 rounded border border-indigo-100 hover:bg-indigo-100"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                                            View ID
                                        </button>
                                    ) : (
                                        <span className="text-red-400 text-xs italic">Missing ID</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 max-w-xs truncate" title={req.purpose}>{req.purpose}</td>
                                <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                    <button onClick={() => initiateDecision(req, 'approve')} className="font-medium text-green-600 hover:text-green-800">Approve</button>
                                    <button onClick={() => initiateDecision(req, 'reject')} className="font-medium text-red-600 hover:text-red-800">Reject</button>
                                </td>
                            </tr>
                        )) : (
                           <tr>
                                <td colSpan={8} className="text-center py-8 text-gray-500">No pending requests found.</td>
                           </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal for Approval/Rejection */}
            {selectedRequest && actionType && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className={`p-4 border-b rounded-t-lg ${actionType === 'approve' ? 'bg-green-50' : 'bg-red-50'}`}>
                            <h3 className={`text-lg font-bold ${actionType === 'approve' ? 'text-green-800' : 'text-red-800'}`}>
                                {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-700">
                                You are about to <span className="font-bold">{actionType}</span> the request for 
                                <span className="font-semibold"> "{getDocTitle(selectedRequest.documentId)}"</span> by 
                                <span className="font-semibold"> {getUsername(selectedRequest.requesterId)}</span> 
                                (<span className="text-sm text-gray-600">{getUserRole(selectedRequest.requesterId)}</span>).
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Comments / Reason {actionType === 'reject' && <span className="text-red-500">*</span>}
                                </label>
                                <textarea 
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder={actionType === 'reject' ? "Please provide a reason for rejection..." : "Optional comments..."}
                                ></textarea>
                            </div>
                        </div>
                        <div className="p-4 border-t flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
                            <button 
                                onClick={cancelDecision}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmDecision}
                                disabled={actionType === 'reject' && !comment.trim()}
                                className={`px-4 py-2 text-white rounded-md shadow-sm ${
                                    actionType === 'approve' 
                                        ? 'bg-green-600 hover:bg-green-700' 
                                        : 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
                                }`}
                            >
                                Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for ID Verification Preview */}
            {viewIdUrl && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 p-4 backdrop-blur-sm" onClick={() => setViewIdUrl(null)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">ID Verification</h3>
                            <button onClick={() => setViewIdUrl(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 bg-gray-100 flex justify-center items-center min-h-[300px] max-h-[600px] overflow-auto">
                            {viewIdUrl.startsWith('blob:') || viewIdUrl.startsWith('http') ? (
                                <img 
                                    src={viewIdUrl} 
                                    alt="Uploaded ID" 
                                    className="max-w-full max-h-full object-contain rounded shadow-lg border border-gray-200"
                                />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <svg className="h-16 w-16 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    <p>Image preview unavailable.</p>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-3 bg-white border-t flex justify-between items-center">
                            <span className="text-xs text-gray-500 italic">Verify that the name matches the requester.</span>
                            <button onClick={() => setViewIdUrl(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestList;
