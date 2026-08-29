
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Document, Role } from '../../types';

interface RequestDocumentModalProps {
    document: Document;
    closeModal: () => void;
}

const RequestDocumentModal: React.FC<RequestDocumentModalProps> = ({ document, closeModal }) => {
    const { currentUser } = useAuth();
    const { addRequest } = useData();
    const [purpose, setPurpose] = useState('');
    const [idFile, setIdFile] = useState<File | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const isAdmin = currentUser?.role === Role.ADMIN;

    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!purpose) {
            alert('Please provide a purpose for the request.');
            return;
        }
        // Admins don't need to upload an ID for internal requests
        if (!idFile && !isAdmin) {
            alert('You must upload a valid ID to proceed.');
            return;
        }
        if (!currentUser) return;
        setIsConfirming(true);
    };

    const handleFinalSubmit = () => {
        if (!currentUser) return;
        
        let uploadUrl = '';

        if (isAdmin) {
            uploadUrl = 'internal-admin-request';
        } else if (idFile) {
            // Create a Blob URL for local preview in this session
            // In a real app with a backend, this would be the URL returned from the file upload API
            uploadUrl = URL.createObjectURL(idFile);
        } else {
            uploadUrl = 'missing-id';
        }
        
        addRequest({
            documentId: document.id,
            requesterId: currentUser.id,
            purpose,
            idUploadUrl: uploadUrl,
        });
        alert('Request submitted successfully!');
        closeModal();
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                {!isConfirming ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4">{isAdmin ? 'Request Internal Access' : 'Request Document Access'}</h2>
                        <div className="bg-gray-50 p-4 rounded-md mb-6 border">
                            <p className="font-semibold text-gray-800">{document.title}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Department: <span className="font-medium text-indigo-600">{document.department}</span>
                            </p>
                        </div>

                        <form onSubmit={handleInitialSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                                    {isAdmin ? 'Reason for Access' : 'Purpose for Request'}
                                </label>
                                <textarea
                                    id="purpose"
                                    rows={4}
                                    value={purpose}
                                    onChange={e => setPurpose(e.target.value)}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder={isAdmin ? "Please specify why you need to view this confidential document..." : "Explain why you need access..."}
                                />
                            </div>
                            
                            {!isAdmin && (
                                <div>
                                    <label htmlFor="id-upload" className="block text-sm font-medium text-gray-700">Upload ID <span className="text-red-500">*</span></label>
                                    <input
                                        id="id-upload"
                                        type="file"
                                        accept=".png,.jpg,.jpeg"
                                        onChange={e => setIdFile(e.target.files ? e.target.files[0] : null)}
                                        required={!isAdmin}
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Valid ID is required for verification. (PNG, JPG only)</p>
                                </div>
                            )}

                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Next</button>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Request</h2>
                        <div className="mb-6 space-y-4">
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            {isAdmin 
                                                ? "You are requesting access as an Administrator. The Departmental Records Custodian will receive this request for approval."
                                                : "Please confirm that you have uploaded a valid ID. Requests with invalid or missing IDs will be rejected."
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {!isAdmin && idFile && (
                                <div className="border rounded-md p-4">
                                    <p className="text-sm font-medium text-gray-500 mb-2">Attached File:</p>
                                    <div className="flex items-center text-gray-900 font-medium">
                                        <svg className="flex-shrink-0 h-5 w-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                        </svg>
                                        {idFile.name}
                                    </div>
                                    <div className="mt-3">
                                        <img 
                                            src={URL.createObjectURL(idFile)} 
                                            alt="ID Preview" 
                                            className="h-32 w-auto object-cover rounded border border-gray-200"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 pt-2">
                            <button 
                                type="button" 
                                onClick={() => setIsConfirming(false)} 
                                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Back
                            </button>
                            <button 
                                type="button" 
                                onClick={handleFinalSubmit} 
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium shadow-sm"
                            >
                                Confirm & Submit
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RequestDocumentModal;
