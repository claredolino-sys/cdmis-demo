
import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Role, DocumentType, RestrictionType, Document, DocumentVersion, DocumentStatus, RequestStatus, DocumentRequest } from '../../types';
import DocumentUploadForm from './DocumentUploadForm';
import RequestDocumentModal from './RequestDocumentModal';

// --- Sub-Components ---

interface PreviewData {
    title: string;
    fileUrl: string;
    fileName: string;
    description?: string;
    uploaderName: string;
    uploadDate: string;
    type?: string;
    department?: string;
}

const DocumentViewerModal: React.FC<{ data: PreviewData; onClose: () => void }> = ({ data, onClose }) => {
    const [zoom, setZoom] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
    }, [data.fileUrl]);

    const isPdf = data.fileName.toLowerCase().endsWith('.pdf') || data.fileUrl.endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(data.fileName) || data.fileUrl.includes('placehold.co');

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3)); // Max 300%
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5)); // Min 50%
    const handleResetZoom = () => setZoom(1);

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4">
            <div className="bg-white w-full h-full max-w-6xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 bg-gray-800 text-white border-b border-gray-700 flex-shrink-0">
                    <div className="flex-1 min-w-0 mr-4">
                        <h3 className="text-lg font-semibold truncate" title={data.title}>
                            {data.title}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">{data.fileName}</p>
                    </div>
                    
                    {/* Zoom Controls - Only for PDF and Images */}
                    {(isPdf || isImage) && (
                        <div className="hidden sm:flex items-center space-x-2 bg-gray-700 rounded-lg px-2 py-1 mr-4">
                            <button 
                                onClick={handleZoomOut}
                                className="p-1 hover:text-indigo-300 transition-colors disabled:opacity-50"
                                disabled={zoom <= 0.5}
                                title="Zoom Out"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                            </button>
                            <span className="text-xs font-mono min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
                            <button 
                                onClick={handleZoomIn}
                                className="p-1 hover:text-indigo-300 transition-colors disabled:opacity-50"
                                disabled={zoom >= 3}
                                title="Zoom In"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                            <div className="w-px h-4 bg-gray-600 mx-1"></div>
                            <button 
                                onClick={handleResetZoom}
                                className="text-xs hover:text-indigo-300 px-1"
                                title="Reset Zoom"
                            >
                                Reset
                            </button>
                        </div>
                    )}

                    <div className="flex items-center space-x-4">
                        <a 
                            href={data.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-gray-300 hover:text-white hover:underline flex items-center whitespace-nowrap"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            <span className="hidden sm:inline">Open in New Tab</span>
                        </a>
                        <button 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-full transition-colors"
                            title="Close Preview"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>

                {/* Body: Viewer + Sidebar */}
                <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
                    {/* Viewer Area */}
                    <div className="flex-1 bg-gray-100 relative overflow-auto flex justify-center items-start lg:border-r border-gray-200">
                        {isLoading && (isPdf || isImage) && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600 mb-4"></div>
                                <p className="text-gray-500 font-medium animate-pulse">Loading document preview...</p>
                            </div>
                        )}

                        {isPdf ? (
                            <div 
                                className={`transition-all duration-200 ease-in-out origin-top ${isLoading ? 'invisible' : 'visible'}`}
                                style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%`, minHeight: '100%' }}
                            >
                                <iframe src={data.fileUrl} className="w-full h-full border-none" title="PDF Viewer" onLoad={() => setIsLoading(false)} />
                            </div>
                        ) : isImage ? (
                            <div className={`p-4 flex items-center justify-center min-h-full min-w-full ${isLoading ? 'invisible' : 'visible'}`}>
                                <img src={data.fileUrl} alt={data.title} className="shadow-lg transition-all duration-200 ease-in-out object-contain" style={{ width: `${zoom * 100}%`, maxWidth: 'none', maxHeight: 'none' }} onLoad={() => setIsLoading(false)} onError={() => setIsLoading(false)} />
                            </div>
                        ) : (
                            <div className="text-center p-10 self-center">
                                <div className="bg-white p-8 rounded-lg shadow-md inline-block">
                                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    <p className="text-lg font-semibold text-gray-700 mb-2">Preview not available</p>
                                    <p className="text-gray-500 mb-6">This file type cannot be viewed directly in the browser.</p>
                                    <a href={data.fileUrl} download className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">Download File</a>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Metadata Sidebar */}
                    <div className="w-full lg:w-80 bg-white p-6 overflow-y-auto flex-shrink-0 border-t lg:border-t-0">
                        <h4 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Document Details</h4>
                        <div className="space-y-5">
                            <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Title</p><p className="text-gray-900 font-medium">{data.title}</p></div>
                            {data.description && (<div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p><p className="text-gray-700 text-sm">{data.description}</p></div>)}
                            <div className="grid grid-cols-1 gap-4">
                                <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Uploaded By</p><div className="flex items-center"><div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold mr-2">{data.uploaderName.charAt(0)}</div><p className="text-gray-900 text-sm">{data.uploaderName}</p></div></div>
                                <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Upload Date</p><p className="text-gray-900 text-sm">{new Date(data.uploadDate).toLocaleString()}</p></div>
                            </div>
                            {(data.type || data.department) && (<div className="bg-gray-50 p-3 rounded-md space-y-3">{data.type && (<div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Type</p><span className="inline-block bg-white border border-gray-200 text-gray-700 text-xs px-2 py-1 rounded">{data.type}</span></div>)}{data.department && (<div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Department</p><p className="text-gray-900 text-sm">{data.department}</p></div>)}</div>)}
                            <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Filename</p><p className="text-gray-500 text-xs break-all font-mono bg-gray-50 p-2 rounded">{data.fileName}</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DocumentEditModal: React.FC<{ doc: Document; onClose: () => void; onSave: (updates: Partial<Document>) => void }> = ({ doc, onClose, onSave }) => {
    const [title, setTitle] = useState(doc.title);
    const [description, setDescription] = useState(doc.description);
    // Status removed
    const [restrictionType, setRestrictionType] = useState(doc.restrictionType);
    const [reviewDate, setReviewDate] = useState(doc.reviewDate || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, description, restrictionType, reviewDate });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xl font-bold text-gray-800">Edit Document Metadata</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Restriction</label>
                        <select value={restrictionType} onChange={e => setRestrictionType(e.target.value as RestrictionType)} className="w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="Public">Public</option>
                            <option value="Confidential">Confidential</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Review Date</label>
                        <input type="date" value={reviewDate} onChange={e => setReviewDate(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const VersionHistoryModal: React.FC<{ doc: Document; onClose: () => void }> = ({ doc, onClose }) => {
    const history = doc.previousVersions || [];
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Version History</h3>
                        <p className="text-sm text-gray-500">for "{doc.title}"</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                </div>
                
                <div className="overflow-y-auto flex-grow">
                    <div className="space-y-4">
                        {/* Current Version */}
                        <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-green-500 rounded mb-1">Current Version ({doc.version})</span>
                                    <p className="text-sm font-medium text-gray-900">{new Date(doc.uploadDate).toLocaleString()}</p>
                                    <p className="text-xs text-gray-600 mt-1 font-mono">{doc.fileName}</p>
                                </div>
                                <span className="text-xs text-gray-500">Active</span>
                            </div>
                            {doc.description && <p className="text-sm text-gray-700 mt-2 italic">"{doc.description}"</p>}
                        </div>

                        {/* History List */}
                        {history.length > 0 ? history.map(ver => (
                            <div key={ver.version} className="border-l-4 border-gray-300 bg-gray-50 p-4 rounded-r-md hover:bg-gray-100 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="inline-block px-2 py-1 text-xs font-bold text-gray-600 bg-gray-200 rounded mb-1">Version {ver.version}</span>
                                        <p className="text-sm font-medium text-gray-900">{new Date(ver.uploadDate).toLocaleString()}</p>
                                        <p className="text-xs text-gray-600 mt-1 font-mono">{ver.fileName}</p>
                                    </div>
                                </div>
                                {ver.description && <p className="text-sm text-gray-600 mt-2 italic">"{ver.description}"</p>}
                            </div>
                        )) : (
                            <div className="text-center py-8 text-gray-500 italic">No previous versions available.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<{ doc: Document; onConfirm: () => void; onCancel: () => void }> = ({ doc, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80]">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center mb-4 text-red-600">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <h3 className="text-lg font-bold">Confirm Deletion</h3>
                </div>
                <p className="text-gray-700 mb-2">Are you sure you want to delete this document?</p>
                <p className="text-gray-900 font-medium mb-4">"{doc.title}"</p>
                <p className="text-gray-700 mb-6 text-sm">This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-sm">Delete</button>
                </div>
            </div>
        </div>
    );
};

// --- Reusable Table Component ---

interface DocumentTableProps {
    title: string;
    documents: Document[];
    onView: (doc: Document) => void;
    onEdit: (doc: Document) => void;
    onHistory: (doc: Document) => void;
    onDelete: (doc: Document) => void;
    onRequestAccess: (doc: Document) => void;
    showDepartment?: boolean;
    requests: DocumentRequest[];
    currentUserId: string;
}

const DocumentTable: React.FC<DocumentTableProps> = ({ title, documents, onView, onEdit, onHistory, onDelete, onRequestAccess, showDepartment = true, requests, currentUserId }) => {
    return (
        <div className="mb-10">
             <div className="flex items-center mb-4">
                <div className="h-8 w-1 bg-indigo-600 rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                <span className="ml-3 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                    {documents.length} records
                </span>
            </div>
            <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
                        <tr>
                            <th className="px-6 py-3">Title</th>
                            {showDepartment && <th className="px-6 py-3">Department</th>}
                            <th className="px-6 py-3">Covered Period</th>
                            <th className="px-6 py-3">Volume</th>
                            <th className="px-6 py-3">Medium</th>
                            <th className="px-6 py-3">Restriction</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.length > 0 ? documents.map(doc => {
                            const isOwnDoc = doc.uploaderId === currentUserId;
                            const existingReq = requests.find(r => r.documentId === doc.id && r.requesterId === currentUserId);
                            const hasAccess = doc.restrictionType === 'Public' || isOwnDoc || existingReq?.status === RequestStatus.APPROVED;
                            const isPending = existingReq?.status === RequestStatus.PENDING;

                            return (
                                <tr key={doc.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div className="truncate max-w-xs" title={doc.title}>{doc.title}</div>
                                    </td>
                                    {showDepartment && <td className="px-6 py-4">{doc.department}</td>}
                                    <td className="px-6 py-4">{doc.napData?.periodCovered || '-'}</td>
                                    <td className="px-6 py-4">{doc.napData?.volume || '-'}</td>
                                    <td className="px-6 py-4">{doc.napData?.medium || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${doc.restrictionType === 'Public' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {doc.restrictionType === 'Public' ? 'Public' : 'Confidential'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            {hasAccess ? (
                                                <button onClick={() => onView(doc)} className="text-gray-500 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50 transition-colors" title="View Document">
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </button>
                                            ) : isPending ? (
                                                <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded cursor-default">Pending</span>
                                            ) : (
                                                <button onClick={() => onRequestAccess(doc)} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-50 flex items-center transition-colors" title="Request Access">
                                                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                                                    Request
                                                </button>
                                            )}
                                            
                                            {(isOwnDoc || (doc.restrictionType === 'Public' && hasAccess)) && (
                                                <>
                                                    <button onClick={() => onEdit(doc)} className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors" title="Edit Metadata">
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button onClick={() => onHistory(doc)} className="text-gray-500 hover:text-orange-600 p-1 rounded hover:bg-orange-50 transition-colors" title="Version History">
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    </button>
                                                    <button onClick={() => onDelete(doc)} className="text-gray-500 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors" title="Delete">
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={showDepartment ? 7 : 6} className="text-center py-12 text-gray-500 italic">No records found in this section.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const DocumentInventory: React.FC = () => {
  const { documents, requests, users, departments, deleteDocument, editDocument } = useData();
  const { currentUser } = useAuth();

  const getSavedState = (key: string, defaultValue: any) => {
      if (!currentUser) return defaultValue;
      try {
          const saved = sessionStorage.getItem(`CDMIS_FILTERS_${currentUser.id}`);
          if (saved) {
              const parsed = JSON.parse(saved);
              return parsed[key] !== undefined ? parsed[key] : defaultValue;
          }
      } catch (e) { console.error("Failed to load filters", e); }
      return defaultValue;
  };

  const [searchTerm, setSearchTerm] = useState(() => getSavedState('searchTerm', ''));
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(() => getSavedState('showAdvancedFilters', false));
  
  const [filterDepartment, setFilterDepartment] = useState(() => getSavedState('filterDepartment', ''));
  const [filterType, setFilterType] = useState(() => getSavedState('filterType', ''));
  // Removed filterStatus state
  
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [historyDoc, setHistoryDoc] = useState<Document | null>(null);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  
  // State for requesting access to restricted documents
  const [docToRequest, setDocToRequest] = useState<Document | null>(null);

  const isAdmin = currentUser?.role === Role.ADMIN;

  useEffect(() => {
      const handler = setTimeout(() => { setDebouncedSearchTerm(searchTerm); }, 300);
      return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
      if (currentUser) {
          const filtersToSave = { searchTerm, showAdvancedFilters, filterDepartment, filterType };
          sessionStorage.setItem(`CDMIS_FILTERS_${currentUser.id}`, JSON.stringify(filtersToSave));
      }
  }, [searchTerm, showAdvancedFilters, filterDepartment, filterType, currentUser]);

  const filteredDocuments = useMemo(() => {
    let roleFilteredDocs = documents;
    if (!currentUser) return [];
    if (currentUser.role === Role.DRC) {
        roleFilteredDocs = documents.filter(doc => doc.department === currentUser.department);
    }
    return roleFilteredDocs.filter(doc => {
      const searchTermLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = searchTermLower === '' ||
        doc.title.toLowerCase().includes(searchTermLower) ||
        doc.fileName.toLowerCase().includes(searchTermLower) ||
        doc.napData?.officeName?.toLowerCase().includes(searchTermLower);
      const matchesDepartment = filterDepartment === '' || doc.department === filterDepartment;
      const matchesType = filterType === '' || doc.type === filterType;
      // Removed matchesStatus
      return matchesSearch && matchesDepartment && matchesType;
    });
  }, [documents, currentUser, debouncedSearchTerm, filterDepartment, filterType]);
  
  const { adminDocs, deptDocs } = useMemo(() => {
      if (!isAdmin) return { adminDocs: [], deptDocs: filteredDocuments };

      const adminIds = users.filter(u => u.role === Role.ADMIN).map(u => u.id);
      
      const aDocs: Document[] = [];
      const dDocs: Document[] = [];

      filteredDocuments.forEach(doc => {
          if (adminIds.includes(doc.uploaderId)) {
              aDocs.push(doc);
          } else {
              dDocs.push(doc);
          }
      });

      return { adminDocs: aDocs, deptDocs: dDocs };
  }, [filteredDocuments, users, isAdmin]);
  
  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

  const handleViewDocument = (doc: Document) => {
    // Basic check handled in UI button logic now, but keep safety check here
    const fileUrl = doc.fileUrl || `https://placehold.co/800x1000/e2e8f0/1e293b.png?text=${encodeURIComponent(doc.title)}`;
    setPreviewData({
        title: doc.title,
        fileUrl: fileUrl,
        fileName: doc.fileName,
        description: doc.description,
        uploaderName: getUserName(doc.uploaderId),
        uploadDate: doc.uploadDate,
        type: doc.type,
        department: doc.department
    });
  };

  const handleRequestAccess = (doc: Document) => {
      setDocToRequest(doc);
  };

  const handleExportNAPExcel = () => {
    // Determine export dataset: Admin sees only their docs, others see filtered list
    const docsToExport = isAdmin ? adminDocs : filteredDocuments;

    const tableRows = docsToExport.map(doc => {
        const n = doc.napData;
        return `<tr><td>${doc.title}</td><td>${n?.periodCovered || ''}</td><td>${n?.volume || ''}</td><td>${n?.medium || ''}</td><td>${n?.restriction || ''}</td><td>${n?.location || ''}</td><td>${n?.frequency || ''}</td><td>${n?.duplication || ''}</td><td>${n?.timeValue || ''}</td><td>${n?.utilityValue?.join(', ') || ''}</td><td>${n?.retentionActive || ''}</td><td>${n?.retentionStorage || ''}</td><td>${n?.retentionTotal || ''}</td><td>${n?.disposition || ''}</td></tr>`;
    }).join('');

    const footer = `
    <tr><td colspan="14" style="border:none">&nbsp;</td></tr>
    <tr><td colspan="14" style="border:none"><strong>LEGEND:</strong></td></tr>
    <tr>
        <td colspan="2" style="border:none;font-weight:bold">Time Value:</td>
        <td colspan="12" style="border:none">T - Temporary; P - Permanent</td>
    </tr>
    <tr>
        <td colspan="2" style="border:none;font-weight:bold">Utility Value:</td>
        <td colspan="12" style="border:none">Adm - Administrative; F - Fiscal; L - Legal; Arc - Archival</td>
    </tr>
    <tr><td colspan="14" style="border:none">&nbsp;</td></tr>
    <tr>
        <td colspan="4" style="border:none;font-weight:bold">PREPARED BY:</td>
        <td colspan="1" style="border:none"></td>
        <td colspan="4" style="border:none;font-weight:bold">ASSISTED BY:</td>
        <td colspan="1" style="border:none"></td>
        <td colspan="4" style="border:none;font-weight:bold">APPROVED BY:</td>
    </tr>
    <tr>
        <td colspan="4" style="border-bottom:1px solid black;height:40px;text-align:center;vertical-align:bottom;font-weight:bold">${currentUser?.name || ''}</td>
        <td colspan="1" style="border:none"></td>
        <td colspan="4" style="border-bottom:1px solid black;height:40px"></td>
        <td colspan="1" style="border:none"></td>
        <td colspan="4" style="border-bottom:1px solid black;height:40px"></td>
    </tr>
    <tr>
        <td colspan="4" style="border:none;text-align:center;font-size:9pt">Signature over Printed Name / Date</td>
        <td colspan="1" style="border:none"></td>
        <td colspan="4" style="border:none;text-align:center;font-size:9pt">Signature over Printed Name / Date</td>
        <td colspan="1" style="border:none"></td>
        <td colspan="4" style="border:none;text-align:center;font-size:9pt">Signature over Printed Name / Date</td>
    </tr>
    <tr>
        <td colspan="4" style="border:none;text-align:center;font-style:italic">Records Custodian</td>
        <td colspan="1" style="border:none"></td>
        <td colspan="4" style="border:none;text-align:center;font-style:italic">Head of Office</td>
        <td colspan="1" style="border:none"></td>
        <td colspan="4" style="border:none;text-align:center;font-style:italic">Head of Agency / Approving Authority</td>
    </tr>
    `;

    const tableTemplate = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>NAP Form 1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>table{border-collapse:collapse;width:100%;font-family:Arial,sans-serif}th,td{border:1px solid black;padding:5px;text-align:left;vertical-align:top;font-size:10pt}.header{font-weight:bold;text-align:center;background-color:#f2f2f2}</style></head><body><table><thead><tr><th colspan="3" style="text-align:center;font-weight:bold">NATIONAL ARCHIVES OF THE PHILIPPINES</th><th colspan="4">NAME OF OFFICE: ${filteredDocuments[0]?.napData?.officeName || 'GLOBAL ORGANIZATION INC.'}</th><th colspan="4">DEPARTMENT/DIVISION: ${currentUser?.department || 'ALL'}</th><th colspan="3">TELEPHONE NO.:</th></tr><tr><th colspan="3" style="text-align:center;font-style:italic">Pambansang Sinupan ng Pilipinas</th><th colspan="8">ADDRESS: 123 Business Rd, Metropolis</th><th colspan="3">EMAIL ADDRESS:</th></tr><tr><th colspan="3" style="text-align:center;font-weight:bold;font-size:12pt">RECORDS INVENTORY AND APPRAISAL</th><th colspan="8">PERSON-IN-CHARGE OF FILES: ${currentUser?.name}</th><th colspan="3">DATE PREPARED: ${new Date().toLocaleDateString()}</th></tr><tr class="header"><th rowspan="2">RECORDS SERIES TITLE AND DESCRIPTION</th><th rowspan="2">PERIOD COVERED / INCLUSIVE DATES</th><th rowspan="2">VOLUME</th><th rowspan="2">RECORDS MEDIUM</th><th rowspan="2">RESTRICTION/S</th><th rowspan="2">LOCATION OF RECORDS</th><th rowspan="2">FREQUENCY OF USE</th><th rowspan="2">DUPLICATION</th><th rowspan="2">TIME VALUE (T/P)</th><th rowspan="2">UTILITY VALUE (Adm/F/L/Arc)</th><th colspan="3">RETENTION PERIOD</th><th rowspan="2">DISPOSITION PROVISION</th></tr><tr class="header"><th>Active</th><th>Storage</th><th>Total</th></tr></thead><tbody>${tableRows}${footer}</tbody></table></body></html>`;

    const blob = new Blob([tableTemplate], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NAP_Form_1_Inventory_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Document Inventory List</h2>
            <p className="text-sm text-gray-500">Manage and track university records.</p>
        </div>
        <div className="mt-4 md:mt-0">
            <button onClick={() => setUploadModalOpen(true)} className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md transform hover:-translate-y-0.5">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Add New Document
            </button>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start md:items-center">
            <div className="relative w-full md:w-1/3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input type="search" placeholder="Search inventory..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="block w-full pl-10 px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-shadow" />
            </div>
            <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className={`flex items-center px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 transition-colors ${showAdvancedFilters ? 'bg-gray-100 border-gray-300 shadow-inner' : 'bg-white'}`}>
                     <svg className={`w-5 h-5 mr-2 text-gray-500 transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                    {showAdvancedFilters ? 'Hide Filters' : 'Filter Options'}
                </button>
                <button onClick={handleExportNAPExcel} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm font-medium">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Excel
                </button>
            </div>
      </div>

      {/* Collapsible Filters */}
      {showAdvancedFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Department</label>
                <select value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Document Type</label>
                 <select value={filterType} onChange={e => setFilterType(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    <option value="">All Types</option>
                     {Object.values(DocumentType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
             <div className="md:col-span-2 flex justify-end">
                <button onClick={() => { setFilterDepartment(''); setFilterType(''); setSearchTerm(''); }} className="text-sm text-red-600 hover:text-red-800 underline font-medium">Clear All Filters</button>
            </div>
        </div>
      )}

      {isAdmin ? (
          <>
              <DocumentTable 
                  title="Admin's Document Inventory List" 
                  documents={adminDocs} 
                  onView={handleViewDocument}
                  onEdit={setEditingDoc}
                  onHistory={setHistoryDoc}
                  onDelete={setDocToDelete}
                  onRequestAccess={handleRequestAccess}
                  showDepartment={true}
                  requests={requests}
                  currentUserId={currentUser.id}
              />
              
              <div className="my-8 border-t border-dashed border-gray-300"></div>
              
              <DocumentTable 
                  title="Departmental Document Inventory List" 
                  documents={deptDocs} 
                  onView={handleViewDocument}
                  onEdit={setEditingDoc}
                  onHistory={setHistoryDoc}
                  onDelete={setDocToDelete}
                  onRequestAccess={handleRequestAccess}
                  showDepartment={true}
                  requests={requests}
                  currentUserId={currentUser.id}
              />
          </>
      ) : (
          <DocumentTable 
              title="Document Inventory List" 
              documents={filteredDocuments} 
              onView={handleViewDocument}
              onEdit={setEditingDoc}
              onHistory={setHistoryDoc}
              onDelete={setDocToDelete}
              onRequestAccess={handleRequestAccess}
              showDepartment={false}
              requests={requests}
              currentUserId={currentUser?.id || ''}
          />
      )}
      
      {/* Add Document Modal */}
      {isUploadModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
              <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
                  <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
                      <h3 className="text-xl font-bold text-gray-800">Document Inventory Form</h3>
                      <button onClick={() => setUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                  </div>
                  <DocumentUploadForm onSuccess={() => setUploadModalOpen(false)} onCancel={() => setUploadModalOpen(false)} />
              </div>
          </div>
      )}

      {editingDoc && (
          <DocumentEditModal 
              doc={editingDoc} 
              onClose={() => setEditingDoc(null)} 
              onSave={(updates) => {
                  if(currentUser) editDocument(editingDoc.id, updates, currentUser.id);
              }} 
          />
      )}

      {historyDoc && (
          <VersionHistoryModal 
              doc={historyDoc} 
              onClose={() => setHistoryDoc(null)}
          />
      )}

      {previewData && <DocumentViewerModal data={previewData} onClose={() => setPreviewData(null)} />}
      
      {docToDelete && (
          <DeleteConfirmationModal 
              doc={docToDelete} 
              onConfirm={() => { if(currentUser) deleteDocument(docToDelete.id, currentUser.id); setDocToDelete(null); }} 
              onCancel={() => setDocToDelete(null)} 
          />
      )}

      {docToRequest && (
          <RequestDocumentModal 
              document={docToRequest} 
              closeModal={() => setDocToRequest(null)} 
          />
      )}
    </div>
  );
};

export default DocumentInventory;
