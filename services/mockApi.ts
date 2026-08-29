
import { User, Role, Document, DocumentRequest, RequestStatus, ActivityLog, DocumentType, Department, RestrictionType, DocumentVersion, DocumentStatus, Notification, NAPData } from '../types';

// --- MOCK HASHING UTILITY ---
// Simulates the MD5 hashes provided in the SQL database dump.
// Mapping common passwords to their SQL dump hashes for login functionality.
const hashPassword = (plainText: string): string => {
    const map: Record<string, string> = {
        'admn': '854f36c709b662f53c00ea2c11a40f7a', // Admin
        'drc1': '6e0e35ada31308ce0ffc4ba6f6c2a052', // IT Custodian
        'drc2': 'b8af089be2741096c7f0430ff110eccf', // HR Custodian
        'stf1': 'c52e465fe3929a28db538eb6f199336f', // Staff 1
        'stf2': '5d9d051e2cc822f3b7a3a1a4862aaeb5'  // Staff 2
    };
    // For new users created during the session, use a mock prefix
    return map[plainText] || `$$hashed_${plainText}`;
};

// --- MOCK DATABASE (Based on SQL Dump) ---

// Table: users
let mockUsers: User[] = [
  { id: 'EMP - 0123', name: 'Admin User', role: Role.ADMIN, department: 'Administration', password: '854f36c709b662f53c00ea2c11a40f7a' },
  { id: 'EMP - 0234', name: 'Records Custodian (IT)', role: Role.DRC, department: 'IT', password: '6e0e35ada31308ce0ffc4ba6f6c2a052' },
  { id: 'EMP - 0235', name: 'Records Custodian (HR)', role: Role.DRC, department: 'HR', password: 'b8af089be2741096c7f0430ff110eccf' },
  { id: 'EMP - 0345', name: 'Employee 1', role: Role.STAFF, department: 'Administration', password: 'c52e465fe3929a28db538eb6f199336f' },
  { id: 'EMP - 0346', name: 'Employee 2', role: Role.STAFF, department: 'Administration', password: '5d9d051e2cc822f3b7a3a1a4862aaeb5' },
];

// Table: departments
let mockDepartments: Department[] = [
    { id: 'dept-3', name: 'Finance' },
    { id: 'dept-2', name: 'HR' },
    { id: 'dept-1', name: 'IT' },
    { id: 'dept-admin', name: 'Administration' },
];

// Helper for Mock NAP Data (based on repeated pattern in SQL dump)
const createNAPData = (dept: string, uploader: string): NAPData => ({
    officeName: 'GLOBAL ORGANIZATION INC.',
    department: dept,
    telephone: '555-0199',
    section: 'Administrative',
    email: 'records@organization.com',
    address: '123 Business Rd, Metropolis',
    personInCharge: uploader,
    datePrepared: '2025-11-26',
    periodCovered: '2023-2024',
    volume: '1 Folder',
    medium: 'Paper/Digital',
    restriction: 'Confidential',
    location: 'Filing Cabinet A',
    frequency: 'Monthly',
    duplication: 'None',
    timeValue: 'T',
    utilityValue: ['Adm', 'F'],
    retentionActive: '2 Years',
    retentionStorage: '3 Years',
    retentionTotal: '5 Years',
    disposition: 'Disposal'
});

const SAMPLE_PDF_URL = 'https://pdfobject.com/pdf/sample.pdf';

// Table: documents & document_nap_data
let mockDocuments: Document[] = [
  { 
      id: 'doc-1', 
      title: 'Q1 Financial Report', 
      description: 'Comprehensive financial report for the first quarter.', 
      department: 'Administration', 
      uploaderId: 'EMP - 0123', 
      uploadDate: '2023-01-15T10:00:00', 
      reviewDate: '2024-01-15',
      version: 1, 
      restrictionType: 'Confidential', 
      status: DocumentStatus.APPROVED,
      fileName: 'q1_financial_report.pdf', 
      fileUrl: SAMPLE_PDF_URL,
      type: DocumentType.REPORT, 
      metaTags: ['finance', 'report', 'q1'],
      napData: createNAPData('Administration', 'Admin User')
  },
  { 
      id: 'doc-2', 
      title: 'New Employee Onboarding Policy', 
      description: 'Updated policy for onboarding new hires.', 
      department: 'HR', 
      uploaderId: 'EMP - 0235', 
      uploadDate: '2023-02-20T14:30:00', 
      reviewDate: '2023-12-01', 
      version: 2, 
      restrictionType: 'Public', 
      status: DocumentStatus.DRAFT,
      fileName: 'onboarding_policy_v2.docx', 
      fileUrl: SAMPLE_PDF_URL,
      type: DocumentType.POLICY, 
      metaTags: ['hr', 'policy', 'onboarding'],
      napData: createNAPData('HR', 'Records Custodian (HR)'),
      // Table: document_versions (Linked to doc-2)
      previousVersions: [
          { 
              version: 1, 
              uploadDate: '2022-01-10T09:00:00', 
              fileName: 'onboarding_policy_v1.docx', 
              fileUrl: SAMPLE_PDF_URL,
              uploaderId: 'EMP - 0235',
              description: 'Initial draft of the onboarding policy.' 
          }
      ]
  },
  { 
      id: 'doc-3', 
      title: 'IT Department Server Maintenance Schedule', 
      description: 'Schedule for server maintenance and downtime.', 
      department: 'IT', 
      uploaderId: 'EMP - 0234', 
      uploadDate: '2023-03-05T09:00:00', 
      reviewDate: '2025-03-05',
      version: 1, 
      restrictionType: 'Confidential', 
      status: DocumentStatus.APPROVED,
      fileName: 'server_maintenance.xlsx', 
      fileUrl: SAMPLE_PDF_URL,
      type: DocumentType.MEMORANDUM, 
      metaTags: ['it', 'maintenance', 'schedule'],
      napData: createNAPData('IT', 'Records Custodian (IT)')
  },
  { 
      id: 'doc-4', 
      title: 'Annual IT Security Report', 
      description: 'Annual report on IT security vulnerabilities and measures.', 
      department: 'IT', 
      uploaderId: 'EMP - 0234', 
      uploadDate: '2023-04-10T11:00:00', 
      // reviewDate is NULL in SQL
      version: 1, 
      restrictionType: 'Public', 
      status: DocumentStatus.ARCHIVED,
      fileName: 'it_security_report_annual.pdf', 
      fileUrl: SAMPLE_PDF_URL,
      type: DocumentType.REPORT, 
      metaTags: ['it', 'security', 'report'],
      napData: createNAPData('IT', 'Records Custodian (IT)')
  },
  { 
      id: 'doc-5', 
      title: 'Leave Request Form', 
      description: 'Standard form for employee leave requests.', 
      department: 'HR', 
      uploaderId: 'EMP - 0235', 
      uploadDate: '2022-11-30T16:00:00', 
      reviewDate: '2025-12-01',
      version: 3, 
      restrictionType: 'Public', 
      status: DocumentStatus.APPROVED,
      fileName: 'leave_request_form.pdf', 
      fileUrl: SAMPLE_PDF_URL,
      type: DocumentType.FORM, 
      metaTags: ['hr', 'form', 'leave'],
      napData: createNAPData('HR', 'Records Custodian (HR)')
  },
  { 
      id: 'doc-6', 
      title: '2023 University Budget Proposal', 
      description: 'Proposed budget allocations for the upcoming academic year.', 
      department: 'Finance', 
      uploaderId: 'EMP - 0123', 
      uploadDate: '2023-05-15T08:00:00', 
      reviewDate: '2024-05-15',
      version: 1, 
      restrictionType: 'Confidential', 
      status: DocumentStatus.APPROVED,
      fileName: '2023_budget_proposal.xlsx', 
      fileUrl: SAMPLE_PDF_URL,
      type: DocumentType.REPORT, 
      metaTags: ['finance', 'budget', 'proposal'],
      napData: createNAPData('Finance', 'Admin User')
  },
  { 
      id: 'doc-7', 
      title: 'Employee Performance Evaluation Guidelines', 
      description: 'Guidelines for conducting annual employee performance reviews.', 
      department: 'HR', 
      uploaderId: 'EMP - 0235', 
      uploadDate: '2023-06-01T10:30:00', 
      reviewDate: '2024-06-01',
      version: 1, 
      restrictionType: 'Confidential', 
      status: DocumentStatus.APPROVED,
      fileName: 'performance_evaluation_guidelines.pdf', 
      fileUrl: SAMPLE_PDF_URL,
      type: DocumentType.POLICY, 
      metaTags: ['hr', 'evaluation', 'guidelines'],
      napData: createNAPData('HR', 'Records Custodian (HR)')
  },
  { 
      id: 'doc-8', 
      title: 'Network Infrastructure Upgrades', 
      description: 'Details regarding the planned campus-wide network upgrades.', 
      department: 'IT', 
      uploaderId: 'EMP - 0234', 
      uploadDate: '2023-07-20T14:00:00', 
      reviewDate: '2024-07-20',
      version: 1, 
      restrictionType: 'Public', 
      status: DocumentStatus.APPROVED,
      fileName: 'network_upgrades.pdf', 
      fileUrl: SAMPLE_PDF_URL,
      type: DocumentType.MEMORANDUM, 
      metaTags: ['it', 'network', 'upgrade'],
      napData: createNAPData('IT', 'Records Custodian (IT)')
  },
  { 
      id: 'doc-9', 
      title: 'Student Registration Procedures', 
      description: 'Standard operating procedures for student enrollment and registration.', 
      department: 'Administration', 
      uploaderId: 'EMP - 0123', 
      uploadDate: '2023-08-05T09:15:00', 
      reviewDate: '2024-08-05',
      version: 1, 
      restrictionType: 'Public', 
      status: DocumentStatus.APPROVED,
      fileName: 'student_registration_sop.docx', 
      fileUrl: SAMPLE_PDF_URL,
      type: DocumentType.POLICY, 
      metaTags: ['records', 'student', 'registration'],
      napData: createNAPData('Administration', 'Admin User')
  },
  { 
      id: 'doc-10', 
      title: 'Faculty Clearance Form', 
      description: 'Required clearance form for faculty at the end of the semester.', 
      department: 'HR', 
      uploaderId: 'EMP - 0235', 
      uploadDate: '2023-09-10T11:45:00', 
      reviewDate: '2024-09-10',
      version: 1, 
      restrictionType: 'Public', 
      status: DocumentStatus.APPROVED,
      fileName: 'faculty_clearance_form.pdf', 
      fileUrl: SAMPLE_PDF_URL,
      type: DocumentType.FORM, 
      metaTags: ['hr', 'faculty', 'clearance'],
      napData: createNAPData('HR', 'Records Custodian (HR)')
  }
];

// Table: document_requests
let mockRequests: DocumentRequest[] = [
    {
        id: 'req-1', 
        documentId: 'doc-1', 
        requesterId: 'EMP - 0345', 
        requestDate: '2023-05-10T10:00:00', 
        status: RequestStatus.PENDING, 
        purpose: 'Need for annual planning.',
        idUploadUrl: 'https://placehold.co/600x400/png?text=Mock+ID+Preview'
    },
    // New Request: For the HR Custodian (drc2) to approve
    {
        id: 'req-2', 
        documentId: 'doc-2', // HR Document
        requesterId: 'EMP - 0345', // Staff
        requestDate: new Date().toISOString(), 
        status: RequestStatus.PENDING, 
        purpose: 'Reviewing onboarding policies for new interns.',
        idUploadUrl: 'https://placehold.co/600x400/png?text=Staff+ID'
    },
    // New Request: BY the IT Custodian (drc1), to appear in "My Requests"
    {
        id: 'req-3', 
        documentId: 'doc-1', // Admin Document
        requesterId: 'EMP - 0234', // IT Custodian
        requestDate: new Date().toISOString(), 
        status: RequestStatus.PENDING, 
        purpose: 'Cross-referencing budget allocation.',
        idUploadUrl: 'https://placehold.co/600x400/png?text=IT+Custodian+ID'
    },
    {
        id: 'req-4', 
        documentId: 'doc-6', 
        requesterId: 'EMP - 0345', 
        requestDate: '2023-10-01T09:00:00', 
        status: RequestStatus.PENDING, 
        purpose: 'Reviewing budget constraints.',
        idUploadUrl: 'https://placehold.co/600x400/png?text=Staff+ID'
    },
    {
        id: 'req-5', 
        documentId: 'doc-3', 
        requesterId: 'EMP - 0346', 
        requestDate: '2023-10-05T14:30:00', 
        status: RequestStatus.APPROVED, 
        approverId: 'EMP - 0123',
        decisionDate: '2023-10-06T10:00:00',
        purpose: 'Planning team meeting around maintenance.',
        idUploadUrl: 'https://placehold.co/600x400/png?text=Staff+ID'
    },
    {
        id: 'req-6', 
        documentId: 'doc-7', 
        requesterId: 'EMP - 0234', 
        requestDate: '2023-10-12T11:15:00', 
        status: RequestStatus.REJECTED, 
        approverId: 'EMP - 0235',
        decisionDate: '2023-10-13T09:20:00',
        reviewerComment: 'Confidential HR data. Request through department head.',
        purpose: 'Reviewing guidelines for IT staff evaluations.',
        idUploadUrl: 'https://placehold.co/600x400/png?text=IT+Custodian+ID'
    },
    {
        id: 'req-7', 
        documentId: 'doc-8', 
        requesterId: 'EMP - 0345', 
        requestDate: '2023-10-20T16:00:00', 
        status: RequestStatus.APPROVED, 
        approverId: 'EMP - 0234',
        decisionDate: '2023-10-21T14:00:00',
        purpose: 'Updating departmental operations manual.',
        idUploadUrl: 'https://placehold.co/600x400/png?text=Staff+ID'
    },
    {
        id: 'req-8', 
        documentId: 'doc-2', 
        requesterId: 'EMP - 0346', 
        requestDate: '2023-11-02T10:45:00', 
        status: RequestStatus.PENDING, 
        purpose: 'Onboarding a new assistant.',
        idUploadUrl: 'https://placehold.co/600x400/png?text=Staff+ID'
    },
    {
        id: 'req-9', 
        documentId: 'doc-6', 
        requesterId: 'EMP - 0346', 
        requestDate: '2023-11-15T13:30:00', 
        status: RequestStatus.REJECTED, 
        approverId: 'EMP - 0123',
        decisionDate: '2023-11-16T11:00:00',
        reviewerComment: 'Restricted to Finance heads.',
        purpose: 'Curiosity regarding department allocations.',
        idUploadUrl: 'https://placehold.co/600x400/png?text=Staff+ID'
    },
    {
        id: 'req-10', 
        documentId: 'doc-10', 
        requesterId: 'EMP - 0345', 
        requestDate: '2023-12-01T08:15:00', 
        status: RequestStatus.APPROVED, 
        approverId: 'EMP - 0235',
        decisionDate: '2023-12-02T09:30:00',
        purpose: 'Filing end of semester requirements.',
        idUploadUrl: 'https://placehold.co/600x400/png?text=Staff+ID'
    }
];

// Table: activity_logs
let mockLogs: ActivityLog[] = [
    {
        id: 'log-1', 
        userId: 'EMP - 0123', 
        action: 'SYSTEM_LOGIN', 
        timestamp: '2025-11-26T18:37:30', 
        details: 'Logged in to the system.',
        department: 'Administration'
    },
    {
        id: 'log-2', 
        userId: 'EMP - 0123', 
        action: 'SYSTEM_LOGIN', 
        timestamp: '2025-11-27T08:00:00', 
        details: 'Logged in to the system.',
        department: 'Administration'
    },
    {
        id: 'log-3', 
        userId: 'EMP - 0235', 
        action: 'DOCUMENT_UPLOAD', 
        timestamp: '2025-11-27T09:15:00', 
        details: 'Uploaded document: "Employee Performance Evaluation Guidelines"',
        department: 'HR',
        documentId: 'doc-7'
    },
    {
        id: 'log-4', 
        userId: 'EMP - 0234', 
        action: 'DOCUMENT_UPLOAD', 
        timestamp: '2025-11-27T10:30:00', 
        details: 'Uploaded document: "Network Infrastructure Upgrades"',
        department: 'IT',
        documentId: 'doc-8'
    },
    {
        id: 'log-5', 
        userId: 'EMP - 0345', 
        action: 'REQUEST_SUBMIT', 
        timestamp: '2025-11-27T11:45:00', 
        details: 'Requested document: "2023 University Budget Proposal"',
        department: 'Finance',
        documentId: 'doc-6'
    },
    {
        id: 'log-6', 
        userId: 'EMP - 0346', 
        action: 'SYSTEM_LOGIN', 
        timestamp: '2025-11-27T13:00:00', 
        details: 'Logged in to the system.',
        department: 'Administration'
    },
    {
        id: 'log-7', 
        userId: 'EMP - 0123', 
        action: 'DOCUMENT_UPLOAD', 
        timestamp: '2025-11-27T14:20:00', 
        details: 'Uploaded document: "Student Registration Procedures"',
        department: 'Administration',
        documentId: 'doc-9'
    },
    {
        id: 'log-8', 
        userId: 'EMP - 0123', 
        action: 'REQUEST_APPROVED', 
        timestamp: '2025-11-27T15:10:00', 
        details: 'Request for "IT Department Server Maintenance Schedule" was approved.',
        department: 'IT',
        documentId: 'doc-3'
    },
    {
        id: 'log-9', 
        userId: 'EMP - 0235', 
        action: 'REQUEST_REJECTED', 
        timestamp: '2025-11-27T16:05:00', 
        details: 'Request for "Employee Performance Evaluation Guidelines" was rejected.',
        department: 'HR',
        documentId: 'doc-7'
    },
    {
        id: 'log-10', 
        userId: 'EMP - 0346', 
        action: 'REQUEST_SUBMIT', 
        timestamp: '2025-11-27T17:00:00', 
        details: 'Requested document: "2023 University Budget Proposal"',
        department: 'Finance',
        documentId: 'doc-6'
    }
];

// Table: notifications
let mockNotifications: Notification[] = [
    {
        id: 'notif-1',
        userId: 'EMP - 0123',
        message: 'Welcome to the new CDMIS system.',
        timestamp: '2025-11-26T18:37:30',
        isRead: false,
        type: 'info'
    },
    {
        id: 'notif-2',
        userId: 'EMP - 0346',
        message: 'Your request to view "IT Department Server Maintenance Schedule" has been APPROVED by Admin User.',
        timestamp: '2025-11-26T19:00:00',
        isRead: false,
        type: 'success',
        relatedDocumentId: 'doc-3'
    },
    {
        id: 'notif-3',
        userId: 'EMP - 0234',
        message: 'Your request to view "Employee Performance Evaluation Guidelines" was REJECTED by Records Custodian (HR). Reason: Confidential HR data.',
        timestamp: '2025-11-26T19:15:00',
        isRead: false,
        type: 'error',
        relatedDocumentId: 'doc-7'
    },
    {
        id: 'notif-4',
        userId: 'EMP - 0345',
        message: 'Your request to view "Network Infrastructure Upgrades" has been APPROVED by Records Custodian (IT).',
        timestamp: '2025-11-26T20:30:00',
        isRead: false,
        type: 'success',
        relatedDocumentId: 'doc-8'
    },
    {
        id: 'notif-5',
        userId: 'EMP - 0346',
        message: 'Your request to view "2023 University Budget Proposal" was REJECTED by Admin User. Reason: Restricted to Finance heads.',
        timestamp: '2025-11-27T08:45:00',
        isRead: false,
        type: 'error',
        relatedDocumentId: 'doc-6'
    },
    {
        id: 'notif-6',
        userId: 'EMP - 0345',
        message: 'Your request to view "Faculty Clearance Form" has been APPROVED by Records Custodian (HR).',
        timestamp: '2025-11-27T09:20:00',
        isRead: false,
        type: 'success',
        relatedDocumentId: 'doc-10'
    },
    {
        id: 'notif-7',
        userId: 'EMP - 0123',
        message: 'DRC Records Custodian (IT) has approved a request from Employee 2 (Staff) for document "Network Infrastructure Upgrades".',
        timestamp: '2025-11-27T10:00:00',
        isRead: false,
        type: 'info',
        relatedDocumentId: 'doc-8'
    },
    {
        id: 'notif-8',
        userId: 'EMP - 0123',
        message: 'System update completed successfully.',
        timestamp: '2025-11-27T11:15:00',
        isRead: true,
        type: 'success'
    },
    {
        id: 'notif-9',
        userId: 'EMP - 0235',
        message: 'Please review the pending requests for document "New Employee Onboarding Policy".',
        timestamp: '2025-11-27T13:30:00',
        isRead: false,
        type: 'info',
        relatedDocumentId: 'doc-2'
    },
    {
        id: 'notif-10',
        userId: 'EMP - 0123',
        message: 'New document "2023 University Budget Proposal" requires review.',
        timestamp: '2025-11-27T14:45:00',
        isRead: false,
        type: 'info',
        relatedDocumentId: 'doc-6'
    }
];

// --- MOCK API FUNCTIONS ---

const logActivity = (userId: string, action: string, details: string, department?: string, documentId?: string) => {
    const log: ActivityLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        action,
        timestamp: new Date().toISOString(),
        details,
        department,
        documentId,
    };
    mockLogs.unshift(log);
}

const saveState = () => {
    try {
        localStorage.setItem('cdmis_users', JSON.stringify(mockUsers));
        localStorage.setItem('cdmis_departments', JSON.stringify(mockDepartments));
        localStorage.setItem('cdmis_documents', JSON.stringify(mockDocuments));
        localStorage.setItem('cdmis_requests', JSON.stringify(mockRequests));
        localStorage.setItem('cdmis_logs', JSON.stringify(mockLogs));
        localStorage.setItem('cdmis_notifications', JSON.stringify(mockNotifications));
    } catch (e) {
        console.warn('LocalStorage not available');
    }
};

const loadState = () => {
    if (typeof window === 'undefined') return;
    try {
        const users = localStorage.getItem('cdmis_users');
        if (users) mockUsers = JSON.parse(users);
        const depts = localStorage.getItem('cdmis_departments');
        if (depts) mockDepartments = JSON.parse(depts);
        const docs = localStorage.getItem('cdmis_documents');
        if (docs) mockDocuments = JSON.parse(docs);
        const reqs = localStorage.getItem('cdmis_requests');
        if (reqs) mockRequests = JSON.parse(reqs);
        const logs = localStorage.getItem('cdmis_logs');
        if (logs) mockLogs = JSON.parse(logs);
        const notifs = localStorage.getItem('cdmis_notifications');
        if (notifs) mockNotifications = JSON.parse(notifs);
    } catch (e) {
        console.warn('LocalStorage not available');
    }
};

loadState();

if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', saveState);
    setInterval(saveState, 2000);
}

// --- GETTERS ---
export const getMockUsers = () => mockUsers.map(({ password, ...user }) => user);
export const getFullMockUsers = () => mockUsers;
export const getMockDepartments = () => mockDepartments;
export const getMockDocuments = () => mockDocuments;
export const getMockRequests = () => mockRequests;
export const getMockLogs = () => mockLogs;
export const getMockNotifications = () => mockNotifications;

// --- AUTH ---
export const authenticateUser = (userId: string, password: string): User | null => {
  // Hash the incoming password to compare with stored hash from SQL dump
  const hashedPassword = hashPassword(password);
  
  const user = mockUsers.find(u => u.id === userId && u.password === hashedPassword);
  if (user) {
    logActivity(user.id, 'SYSTEM_LOGIN', 'Logged in to the system.', user.department);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

// --- DATA MUTATIONS (with logging) ---

export const addDocumentAPI = (docData: Omit<Document, 'id' | 'uploadDate'>): Document => {
    const newDoc: Document = {
        ...docData,
        id: `doc-${Date.now()}`,
        uploadDate: new Date().toISOString(),
    };
    mockDocuments.unshift(newDoc);
    logActivity(docData.uploaderId, 'DOCUMENT_UPLOAD', `Uploaded document: "${docData.title}"`, docData.department, newDoc.id);
    return newDoc;
}

export const revertDocumentAPI = (docId: string, targetVersion: number, adminId: string): Document | undefined => {
    const docIndex = mockDocuments.findIndex(d => d.id === docId);
    if (docIndex > -1) {
        const doc = mockDocuments[docIndex];
        const targetVer = doc.previousVersions?.find(v => v.version === targetVersion);

        if (targetVer) {
            // Snapshot current
            const currentSnapshot: DocumentVersion = {
                version: doc.version,
                uploadDate: doc.uploadDate,
                fileName: doc.fileName,
                fileUrl: doc.fileUrl,
                uploaderId: doc.uploaderId,
                description: doc.description
            };
            
            const newVersion = doc.version + 1;

            // Update doc
            mockDocuments[docIndex] = {
                ...doc,
                version: newVersion,
                uploadDate: new Date().toISOString(),
                fileName: targetVer.fileName,
                fileUrl: targetVer.fileUrl,
                description: targetVer.description || doc.description,
                uploaderId: adminId, 
                previousVersions: [currentSnapshot, ...(doc.previousVersions || [])].sort((a, b) => b.version - a.version)
            };
            
            logActivity(adminId, 'DOCUMENT_REVERT', `Reverted document "${doc.title}" to version ${targetVersion}`, doc.department, doc.id);
            return mockDocuments[docIndex];
        }
    }
    return undefined;
}

export const updateDocumentAPI = (docId: string, updates: Partial<Document>, adminId: string): Document | undefined => {
    const docIndex = mockDocuments.findIndex(d => d.id === docId);
    if (docIndex > -1) {
        mockDocuments[docIndex] = { ...mockDocuments[docIndex], ...updates };
        const doc = mockDocuments[docIndex];
        logActivity(adminId, 'DOCUMENT_EDIT', `Updated document metadata for "${doc.title}"`, doc.department, doc.id);
        return doc;
    }
    return undefined;
}

export const deleteDocumentAPI = (docId: string, adminId: string): boolean => {
    const docIndex = mockDocuments.findIndex(d => d.id === docId);
    if (docIndex > -1) {
        const doc = mockDocuments[docIndex];
        mockDocuments.splice(docIndex, 1);
        logActivity(adminId, 'DOCUMENT_DELETE', `Deleted document "${doc.title}"`, doc.department, doc.id);
        return true;
    }
    return false;
}

export const addRequestAPI = (reqData: Omit<DocumentRequest, 'id'| 'requestDate' | 'status'>): DocumentRequest => {
    const newReq: DocumentRequest = {
        ...reqData,
        id: `req-${Date.now()}`,
        requestDate: new Date().toISOString(),
        status: RequestStatus.PENDING,
    };
    mockRequests.unshift(newReq);
    const doc = mockDocuments.find(d => d.id === reqData.documentId);
    logActivity(reqData.requesterId, 'REQUEST_SUBMIT', `Requested document: "${doc?.title || 'Unknown'}"`, doc?.department, doc?.id);
    return newReq;
}

export const updateRequestStatusAPI = (requestId: string, status: RequestStatus, approverId: string, comment?: string): DocumentRequest | undefined => {
    const requestIndex = mockRequests.findIndex(r => r.id === requestId);
    if (requestIndex > -1) {
        const req = mockRequests[requestIndex];
        mockRequests[requestIndex] = {
            ...req,
            status,
            approverId,
            decisionDate: new Date().toISOString(),
            reviewerComment: comment,
        };
        const doc = mockDocuments.find(d => d.id === req.documentId);
        
        logActivity(approverId, `REQUEST_${status.toUpperCase()}`, `Request for "${doc?.title || 'Unknown'}" was ${status.toLowerCase()}.`, doc?.department, doc?.id);
        
        // --- 1. Notification for Requester ---
        const approver = mockUsers.find(u => u.id === approverId);
        const approverName = approver?.name || 'Records Custodian';
        
        let notifMessage = '';
        let notifType: 'success' | 'error' = 'success';
        
        if (status === RequestStatus.APPROVED) {
            notifMessage = `Your request to view "${doc?.title || 'Document'}" has been APPROVED by ${approverName}.`;
            notifType = 'success';
        } else if (status === RequestStatus.REJECTED) {
            notifMessage = `Your request to view "${doc?.title || 'Document'}" was REJECTED by ${approverName}. Reason: ${comment || 'No reason provided.'}`;
            notifType = 'error';
        }

        if (notifMessage) {
            const newNotif: Notification = {
                id: `notif-${Date.now()}`,
                userId: req.requesterId,
                message: notifMessage,
                timestamp: new Date().toISOString(),
                isRead: false,
                type: notifType,
                relatedDocumentId: doc?.id
            };
            mockNotifications.unshift(newNotif);
        }

        // --- 2. NEW LOGIC: Notification for Admin ---
        // Condition: DRC approves/rejects request from Staff (Records & Archives) or other DRC.
        // Admin ID is 'EMP - 0123'
        const adminId = 'EMP - 0123';
        const requester = mockUsers.find(u => u.id === req.requesterId);

        if (approver && approver.role === Role.DRC && requester && requester.id !== adminId) {
            
            const isStaffRAO = requester.role === Role.STAFF && requester.department === 'Administration';
            const isOtherDRC = requester.role === Role.DRC; // Request from another DRC

            if (isStaffRAO || isOtherDRC) {
                 const adminMsg = `DRC ${approver.name} has ${status.toLowerCase()} a request from ${requester.name} (${requester.role}) for document "${doc?.title || 'Unknown'}".`;
                 
                 const adminNotif: Notification = {
                    id: `notif-admin-${Date.now()}`,
                    userId: adminId, // Admin receives this
                    message: adminMsg,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    type: 'info',
                    relatedDocumentId: doc?.id
                };
                mockNotifications.unshift(adminNotif);
            }
        }

        return mockRequests[requestIndex];
    }
}

export const markNotificationReadAPI = (notifId: string): void => {
    const notif = mockNotifications.find(n => n.id === notifId);
    if (notif) {
        notif.isRead = true;
    }
}

export const addUserAPI = (userData: User, adminId: string): User => {
    // Hash password before storage
    const newUser = { 
        ...userData,
        password: userData.password ? hashPassword(userData.password) : undefined
    };
    
    mockUsers.push(newUser);
    logActivity(adminId, 'USER_ADD', `Added new user: ${userData.name} (${userData.role})`, userData.department);
    return newUser;
}

export const updateUserAPI = (userId: string, userData: Partial<User>, adminId: string): User | undefined => {
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if(userIndex > -1) {
        const updates = { ...userData };
        
        // If password is being updated, hash it
        if (updates.password) {
            updates.password = hashPassword(updates.password);
        }

        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
        logActivity(adminId, 'USER_UPDATE', `Updated user: ${mockUsers[userIndex].name}`, mockUsers[userIndex].department);
        return mockUsers[userIndex];
    }
}

export const deleteUserAPI = (userId: string, adminId: string): boolean => {
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        const user = mockUsers[userIndex];
        mockUsers.splice(userIndex, 1);
        logActivity(adminId, 'USER_DELETE', `Deleted user: ${user.name}`, user.department);
        return true;
    }
    return false;
}

export const addDepartmentAPI = (deptName: string, adminId: string): Department => {
    const newDept: Department = { id: `dept-${Date.now()}`, name: deptName };
    mockDepartments.push(newDept);
    logActivity(adminId, 'DEPT_ADD', `Added new department: ${deptName}`);
    return newDept;
}

export const updateDepartmentAPI = (id: string, newName: string, adminId: string): Department | undefined => {
    const dept = mockDepartments.find(d => d.id === id);
    if (dept) {
        const oldName = dept.name;
        dept.name = newName;
        // Cascade update to Users and Documents
        mockUsers.forEach(u => { if (u.department === oldName) u.department = newName; });
        mockDocuments.forEach(d => { if (d.department === oldName) d.department = newName; });
        
        logActivity(adminId, 'DEPT_UPDATE', `Renamed department ${oldName} to ${newName}`);
        return dept;
    }
}

export const deleteDepartmentAPI = (id: string, adminId: string): boolean => {
    const index = mockDepartments.findIndex(d => d.id === id);
    if (index > -1) {
        const deptName = mockDepartments[index].name;
        // Integrity Check
        const hasUsers = mockUsers.some(u => u.department === deptName);
        const hasDocs = mockDocuments.some(d => d.department === deptName);
        
        if (hasUsers || hasDocs) {
            return false;
        }

        mockDepartments.splice(index, 1);
        logActivity(adminId, 'DEPT_DELETE', `Deleted department ${deptName}`);
        return true;
    }
    return false;
}

export const logUserActivityAPI = (userId: string, action: string, details: string, department?: string, documentId?: string) => {
    logActivity(userId, action, details, department, documentId);
}
