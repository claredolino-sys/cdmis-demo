
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { DocumentType, DocumentStatus, NAPData, RestrictionType } from '../../types';

interface DocumentUploadFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({ onSuccess, onCancel }) => {
    const { addDocument } = useData();
    const { currentUser } = useAuth();
    
    // Header Fields
    const [officeName, setOfficeName] = useState('GLOBAL ORGANIZATION INC.');
    const [department, setDepartment] = useState('');
    const [telephone, setTelephone] = useState('053-500-9045');
    const [section, setSection] = useState('Administrative');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('123 Business Rd, Metropolis');
    const [personInCharge, setPersonInCharge] = useState('');
    const [datePrepared, setDatePrepared] = useState(new Date().toISOString().split('T')[0]);

    // Record Fields
    const [seriesTitle, setSeriesTitle] = useState('');
    const [description, setDescription] = useState('');
    const [periodCovered, setPeriodCovered] = useState('');
    const [volume, setVolume] = useState('');
    const [medium, setMedium] = useState('');
    const [restriction, setRestriction] = useState('Open Access');
    const [location, setLocation] = useState('');
    
    // Frequency Logic
    const [frequencySelect, setFrequencySelect] = useState('Daily');
    const [frequencySpecific, setFrequencySpecific] = useState('');

    // Duplication Logic
    const [duplication, setDuplication] = useState('');

    const [timeValue, setTimeValue] = useState<'T' | 'P' | ''>('');
    const [utilityValue, setUtilityValue] = useState<string[]>([]);
    
    // Retention Logic
    const [retentionActive, setRetentionActive] = useState('');
    const [retentionStorage, setRetentionStorage] = useState('');
    const [retentionTotal, setRetentionTotal] = useState('');
    const [disposition, setDisposition] = useState('');

    // File & System Fields
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState('');
    
    // Document Type Logic
    const [typeSelect, setTypeSelect] = useState<string>(DocumentType.MEMORANDUM);
    const [typeSpecific, setTypeSpecific] = useState('');

    // Document Restriction (Public/Confidential) - Default Public
    const [docRestriction, setDocRestriction] = useState('Public');

    const [metaTags, setMetaTags] = useState('');

    useEffect(() => {
        if (currentUser) {
            setDepartment(currentUser.department || '');
            setPersonInCharge(currentUser.name);
        }
    }, [currentUser]);

    // Auto-calculate Total Retention
    useEffect(() => {
        const active = parseFloat(retentionActive) || 0;
        const storage = parseFloat(retentionStorage) || 0;
        
        if (retentionActive || retentionStorage) {
            setRetentionTotal((active + storage).toString());
        } else {
            setRetentionTotal('');
        }
    }, [retentionActive, retentionStorage]);

    const handleUtilityChange = (val: string) => {
        setUtilityValue(prev => 
            prev.includes(val) ? prev.filter(item => item !== val) : [...prev, val]
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files ? e.target.files[0] : null;
        setFileError('');
        if (selectedFile) {
            setFile(selectedFile);
        } else {
            setFile(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!seriesTitle) {
            alert("Series Title is required.");
            return;
        }

        if (!file) {
            setFileError("Please upload a document file.");
            return;
        }

        if (!currentUser) return;

        const finalFrequency = frequencySelect === 'Others (specify)' ? frequencySpecific : frequencySelect;
        
        // Resolve Type: If 'Other (Specify)' is selected, use the input value
        const finalType = typeSelect === 'Other (Specify)' ? (typeSpecific || 'Other') : typeSelect;

        const napData: NAPData = {
            officeName, department, telephone, section, email, address, personInCharge, datePrepared,
            periodCovered, volume, medium, 
            restriction, 
            location, 
            frequency: finalFrequency, 
            duplication,
            timeValue: timeValue as 'T' | 'P' | '',
            utilityValue, retentionActive, retentionStorage, retentionTotal, disposition
        };

        // Map NAP data to main document structure
        addDocument({
            title: seriesTitle,
            description: description || seriesTitle,
            department: department || currentUser.department || 'General',
            uploaderId: currentUser.id,
            version: 1,
            restrictionType: docRestriction as RestrictionType, // Use the specific Document Restriction from Section 4
            status: DocumentStatus.DRAFT,
            fileName: file.name,
            fileUrl: URL.createObjectURL(file), // Mock URL for demo
            type: finalType as DocumentType,
            metaTags: metaTags.split(',').map(t => t.trim()).filter(Boolean),
            napData: napData
        });

        if (onSuccess) onSuccess();
    };

    // Common styles for inputs to be black box with white text
    const inputClass = "w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 placeholder-gray-400 transition-colors";
    const labelClass = "block text-sm font-bold text-gray-800 mb-1.5";

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-8 text-gray-700 bg-gray-50/50">
            
            {/* Section 1: Header Information */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center mb-5 border-b pb-3">
                    <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3 shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 leading-none">Office Information</h4>
                        <p className="text-xs text-gray-500 mt-1">Details about the department and personnel.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="group">
                        <label className={labelClass}>Name of Office</label>
                        <input type="text" value={officeName} onChange={e => setOfficeName(e.target.value)} className={inputClass} />
                    </div>
                    <div className="group">
                        <label className={labelClass}>Department/Division</label>
                        <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className={inputClass} />
                    </div>
                    <div className="group">
                        <label className={labelClass}>Telephone No.</label>
                        <input type="text" value={telephone} onChange={e => setTelephone(e.target.value)} className={inputClass} placeholder="e.g. 053-500-xxxx" />
                    </div>
                    <div className="group">
                        <label className={labelClass}>Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="e.g. office@organization.com" />
                    </div>
                    <div className="group">
                        <label className={labelClass}>Address</label>
                        <input type="text" value={address} onChange={e => setAddress(e.target.value)} className={`${inputClass} opacity-80 cursor-not-allowed`} readOnly />
                    </div>
                    <div className="group">
                        <label className={labelClass}>Person In Charge</label>
                        <input type="text" value={personInCharge} onChange={e => setPersonInCharge(e.target.value)} className={inputClass} />
                    </div>
                     <div className="group">
                        <label className={labelClass}>Date Prepared</label>
                        <input type="date" value={datePrepared} onChange={e => setDatePrepared(e.target.value)} className={inputClass} />
                    </div>
                </div>
            </div>

            {/* Section 2: Record Details */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                 <div className="flex items-center mb-5 border-b pb-3">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3 shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 leading-none">Record Series Details</h4>
                        <p className="text-xs text-gray-500 mt-1">Specific information about the document series.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className={labelClass}>Records Series Title <span className="text-red-500">*</span></label>
                        <input type="text" value={seriesTitle} onChange={e => setSeriesTitle(e.target.value)} required className={inputClass} placeholder="e.g., Financial Reports 2023" />
                    </div>
                    <div className="col-span-2">
                        <label className={labelClass}>Description / Remarks</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={inputClass} placeholder="Brief description of the document content..." />
                    </div>
                    <div>
                        <label className={labelClass}>Period Covered</label>
                        <input type="text" value={periodCovered} onChange={e => setPeriodCovered(e.target.value)} className={inputClass} placeholder="e.g., Jan 2023 - Dec 2023" />
                    </div>
                    <div>
                        <label className={labelClass}>Volume</label>
                        <input type="text" value={volume} onChange={e => setVolume(e.target.value)} className={inputClass} placeholder="e.g., 1 Binder, 500MB" />
                    </div>
                     <div>
                        <label className={labelClass}>Records Medium</label>
                        <input type="text" value={medium} onChange={e => setMedium(e.target.value)} className={inputClass} placeholder="e.g., Paper, Electronic" />
                    </div>
                     <div>
                        <label className={labelClass}>Restrictions</label>
                        <select value={restriction} onChange={e => setRestriction(e.target.value)} className={inputClass}>
                            <option value="Open Access">Open Access</option>
                            <option value="Restricted Access">Restricted Access</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Location of Records</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} className={inputClass} placeholder="e.g., Filing Cabinet A" />
                    </div>
                     <div className={frequencySelect === 'Others (specify)' ? 'col-span-1 md:col-span-2' : 'col-span-1'}>
                        <label className={labelClass}>Frequency of Use</label>
                        <div className="flex flex-col md:flex-row gap-2">
                            <select 
                                value={frequencySelect} 
                                onChange={e => setFrequencySelect(e.target.value)} 
                                className={inputClass}
                            >
                                <option value="Daily">Daily</option>
                                <option value="Once a month">Once a month</option>
                                <option value="As the need arises (ANA)">As the need arises (ANA)</option>
                                <option value="Others (specify)">Others (specify)</option>
                            </select>
                            {frequencySelect === 'Others (specify)' && (
                                <input 
                                    type="text" 
                                    value={frequencySpecific} 
                                    onChange={e => setFrequencySpecific(e.target.value)} 
                                    className={inputClass} 
                                    placeholder="Please specify frequency..."
                                    autoFocus
                                />
                            )}
                        </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                        <label className={labelClass}>Duplication</label>
                        <input 
                            type="text" 
                            value={duplication} 
                            onChange={e => setDuplication(e.target.value)} 
                            className={inputClass} 
                            placeholder="Indicate organizational units/offices holding copies..." 
                        />
                    </div>
                </div>
            </div>

            {/* Section 3: Appraisal */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                 <div className="flex items-center mb-5 border-b pb-3">
                    <div className="bg-green-100 text-green-600 p-2 rounded-lg mr-3 shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 leading-none">Appraisal & Disposition</h4>
                        <p className="text-xs text-gray-500 mt-1">Retention policy and value assessment.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 h-full">
                        <label className="block text-sm font-bold text-gray-800 mb-3">Time Value</label>
                        <div className="space-y-3">
                            <label className="flex items-center p-2 rounded hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                                <input type="radio" className="form-radio text-indigo-600 h-4 w-4" name="timeValue" value="T" checked={timeValue === 'T'} onChange={() => setTimeValue('T')} />
                                <span className="ml-3 text-gray-800 font-medium">Temporary</span>
                            </label>
                            <label className="flex items-center p-2 rounded hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                                <input type="radio" className="form-radio text-indigo-600 h-4 w-4" name="timeValue" value="P" checked={timeValue === 'P'} onChange={() => setTimeValue('P')} />
                                <span className="ml-3 text-gray-800 font-medium">Permanent</span>
                            </label>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 h-full">
                        <label className="block text-sm font-bold text-gray-800 mb-3">Utility Value</label>
                        <div className="space-y-3">
                            {['Administrative', 'Fiscal', 'Legal', 'Archival'].map(val => {
                                const code = val.substring(0,3); 
                                const isChecked = utilityValue.includes(code);
                                return (
                                    <label key={val} className="flex items-center p-2 rounded hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                                        <input 
                                            type="checkbox" 
                                            className="form-checkbox text-indigo-600 h-4 w-4 rounded" 
                                            checked={isChecked} 
                                            onChange={() => handleUtilityChange(code)} 
                                        />
                                        <span className="ml-3 text-gray-800 font-medium">{val}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6 mt-2">
                        <div>
                            <label className={labelClass}>Retention (Active - Years)</label>
                            <input 
                                type="number" 
                                value={retentionActive} 
                                onChange={e => setRetentionActive(e.target.value)} 
                                className={inputClass} 
                                placeholder="e.g., 1"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Retention (Storage - Years)</label>
                            <input 
                                type="number" 
                                value={retentionStorage} 
                                onChange={e => setRetentionStorage(e.target.value)} 
                                className={inputClass} 
                                placeholder="e.g., 4"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Retention (Total - Years)</label>
                            <input 
                                type="text" 
                                value={retentionTotal} 
                                readOnly
                                className={`${inputClass} opacity-80 cursor-default`} 
                                placeholder="Auto-calculated"
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <label className={labelClass}>Disposition Provision</label>
                             <input 
                                type="text"
                                value={disposition} 
                                onChange={e => setDisposition(e.target.value)} 
                                className={inputClass}
                                placeholder="e.g., Disposal, Archival..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: File Attachment */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                 <div className="flex items-center mb-5 border-b pb-3">
                    <div className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3 shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 leading-none">File Attachment</h4>
                        <p className="text-xs text-gray-500 mt-1">Upload the digital copy of the record.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={typeSelect === 'Other (Specify)' ? 'col-span-1 md:col-span-2' : 'col-span-1'}>
                        <label className={labelClass}>Document Type Category</label>
                        <div className="flex flex-col md:flex-row gap-2">
                            <select 
                                value={typeSelect} 
                                onChange={e => setTypeSelect(e.target.value)} 
                                className={inputClass}
                            >
                                {Object.values(DocumentType).filter(t => t !== 'Other').map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                                <option value="Other (Specify)">Other (Specify)</option>
                            </select>
                            {typeSelect === 'Other (Specify)' && (
                                <input 
                                    type="text" 
                                    value={typeSpecific} 
                                    onChange={e => setTypeSpecific(e.target.value)} 
                                    className={inputClass} 
                                    placeholder="Please specify document category..." 
                                    autoFocus
                                />
                            )}
                        </div>
                    </div>
                    
                    <div className="col-span-1">
                         <label className={labelClass}>Document Restriction</label>
                         <select 
                            value={docRestriction} 
                            onChange={e => setDocRestriction(e.target.value)} 
                            className={inputClass}
                         >
                             <option value="Public">Public</option>
                             <option value="Confidential">Confidential</option>
                         </select>
                    </div>

                    <div className={typeSelect === 'Other (Specify)' ? 'col-span-1' : 'col-span-1 md:col-span-2'}>
                        <label className={labelClass}>Meta Tags (comma separated)</label>
                        <input type="text" value={metaTags} onChange={e => setMetaTags(e.target.value)} className={inputClass} placeholder="e.g., finance, 2023, audit" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-800 mb-2">Upload File <span className="text-red-500">*</span></label>
                        <div 
                            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all ${
                                file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                            }`}
                        >
                            <div className="space-y-2 text-center">
                                {file ? (
                                    <div className="flex flex-col items-center text-green-700">
                                        <div className="bg-green-100 p-3 rounded-full mb-2">
                                            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </div>
                                        <p className="text-lg font-bold">{file.name}</p>
                                        <p className="text-sm font-medium opacity-75">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <label htmlFor="file-upload" className="mt-4 inline-flex items-center cursor-pointer bg-white py-2 px-4 border border-green-300 rounded-md shadow-sm text-sm font-bold text-green-700 hover:bg-green-50 focus:outline-none transition-colors">
                                            Change File
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.tiff,.tif" />
                                        </label>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mx-auto h-12 w-12 text-gray-400">
                                            <svg stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.tiff,.tif" />
                                            </label>
                                            <p className="pl-1 font-medium">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">PDF, TIFF up to 10MB</p>
                                    </>
                                )}
                                {fileError && <p className="text-sm font-bold text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-200">{fileError}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-4 bg-white/95 backdrop-blur border-t border-gray-200 flex justify-end space-x-3 z-10 rounded-b-xl">
                {onCancel && (
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="bg-white py-2.5 px-5 border border-gray-300 rounded-lg shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                    >
                        Cancel
                    </button>
                )}
                <button 
                    type="submit" 
                    className="inline-flex justify-center py-2.5 px-8 border border-transparent shadow-md text-sm font-bold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all hover:scale-105"
                >
                    Save Record
                </button>
            </div>
        </form>
    );
};

export default DocumentUploadForm;
