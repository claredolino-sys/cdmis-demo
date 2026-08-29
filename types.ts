
export enum Role {
  ADMIN = 'Administrator',
  DRC = 'Departmental Records Custodian',
  STAFF = 'Staff',
}

export interface User {
  id: string; // Employee ID, e.g., 'BiPSU - 0123'
  name: string;
  role: Role;
  department?: string;
  password?: string; // Should not be sent to client in real app
}

export interface Department {
    id: string;
    name: string;
}

export enum DocumentType {
  MEMORANDUM = 'Memorandum',
  REPORT = 'Report',
  FORM = 'Form',
  POLICY = 'Policy',
  OTHER = 'Other',
}

export type RestrictionType = 'Public' | 'Confidential';

export enum DocumentStatus {
  DRAFT = 'Draft',
  APPROVED = 'Approved',
  ARCHIVED = 'Archived',
}

export interface DocumentVersion {
  version: number;
  uploadDate: string;
  fileName: string;
  fileUrl?: string;
  uploaderId: string;
  description?: string;
}

// Specific data fields for NAP Form 1
export interface NAPData {
    officeName: string;
    department: string;
    telephone: string;
    section: string;
    email: string;
    address: string;
    personInCharge: string;
    datePrepared: string;
    
    // Record Item Details
    periodCovered: string;
    volume: string;
    medium: string;
    restriction?: string;
    location: string;
    frequency: string; // Frequency of Use
    duplication: string;
    timeValue: 'T' | 'P' | ''; // Temporary / Permanent
    utilityValue: string[]; // Adm, F, L, Arc
    retentionActive: string;
    retentionStorage: string;
    retentionTotal: string;
    disposition: string;
}

export interface Document {
  id: string;
  title: string; // Maps to "Records Series Title and Description"
  description: string; // Additional description if needed
  department: string;
  uploaderId: string; // Person-In-Charge
  uploadDate: string;
  reviewDate?: string; // Date for review or renewal
  version: number;
  restrictionType: RestrictionType;
  status: DocumentStatus;
  fileName: string;
  fileUrl?: string;
  type: DocumentType;
  metaTags: string[];
  previousVersions?: DocumentVersion[];
  
  // NAP Specific Data
  napData?: NAPData;
}

export enum RequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface DocumentRequest {
  id: string;
  documentId: string;
  requesterId: string;
  requestDate: string;
  status: RequestStatus;
  purpose: string;
  idUploadUrl?: string; // Mock URL for the uploaded ID
  approverId?: string;
  decisionDate?: string;
  reviewerComment?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
  department?: string;
  documentId?: string;
}

export interface Notification {
  id: string;
  userId: string; // Recipient
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'success' | 'error' | 'info';
  relatedDocumentId?: string;
}
