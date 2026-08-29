
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Document, DocumentRequest, ActivityLog, RequestStatus, Department, User, Notification } from '../types';
import { 
  getMockDocuments, 
  getMockRequests, 
  getMockLogs, 
  getMockDepartments, 
  getMockUsers,
  getMockNotifications,
  addDocumentAPI,
  addRequestAPI,
  updateRequestStatusAPI,
  addUserAPI,
  updateUserAPI,
  addDepartmentAPI,
  getFullMockUsers,
  revertDocumentAPI,
  updateDocumentAPI,
  deleteDocumentAPI,
  logUserActivityAPI,
  deleteUserAPI,
  updateDepartmentAPI,
  deleteDepartmentAPI,
  markNotificationReadAPI
} from '../services/mockApi';

// IMPORT REAL API HERE WHEN READY:
// import * as RealApi from '../services/mysqlApi';

interface DataContextType {
  documents: Document[];
  requests: DocumentRequest[];
  logs: ActivityLog[];
  departments: Department[];
  users: Omit<User, 'password'>[];
  fullUsers: User[];
  notifications: Notification[];
  addDocument: (doc: Omit<Document, 'id' | 'uploadDate'>) => void;
  revertDocument: (docId: string, version: number, adminId: string) => void;
  editDocument: (docId: string, updates: Partial<Document>, adminId: string) => void;
  deleteDocument: (docId: string, adminId: string) => void;
  logUserAction: (userId: string, action: string, details: string, department?: string, documentId?: string) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus, approverId: string, comment?: string) => void;
  addRequest: (request: Omit<DocumentRequest, 'id' | 'requestDate' | 'status'>) => void;
  addUser: (user: User, adminId: string) => void;
  updateUser: (userId: string, userData: Partial<User>, adminId: string) => void;
  deleteUser: (userId: string, adminId: string) => void;
  addDepartment: (deptName: string, adminId: string) => void;
  updateDepartment: (id: string, newName: string, adminId: string) => void;
  deleteDepartment: (id: string, adminId: string) => boolean;
  markNotificationAsRead: (notifId: string) => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Flag to switch between Mock and Real API
  const USE_REAL_API = false; 

  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [fullUsers, setFullUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadData = useCallback(async () => {
      setIsLoading(true);
      if (USE_REAL_API) {
          // In a real deployment, you would call:
          // const docs = await RealApi.fetchDocuments();
          // setDocuments(docs);
          // ... etc
      } else {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          setDocuments([...getMockDocuments()]);
          setRequests([...getMockRequests()]);
          setLogs([...getMockLogs()]);
          setDepartments([...getMockDepartments()]);
          setUsers([...getMockUsers()]);
          setFullUsers([...getFullMockUsers()]);
          setNotifications([...getMockNotifications()]);
      }
      setIsLoading(false);
  }, [USE_REAL_API]);

  // Initial Load
  useEffect(() => {
      loadData();
  }, [loadData]);

  // For Mock Refreshing
  const refreshState = () => {
     if (!USE_REAL_API) {
        setDocuments([...getMockDocuments()]);
        setRequests([...getMockRequests()]);
        setLogs([...getMockLogs()]);
        setDepartments([...getMockDepartments()]);
        setUsers([...getMockUsers()]);
        setFullUsers([...getFullMockUsers()]);
        setNotifications([...getMockNotifications()]);
     } else {
        loadData();
     }
  };

  const addDocument = useCallback((doc: Omit<Document, 'id' | 'uploadDate'>) => {
    if(USE_REAL_API) { /* RealApi.uploadDocument(doc).then(loadData); */ }
    else { addDocumentAPI(doc); refreshState(); }
  }, [USE_REAL_API, loadData]);

  const revertDocument = useCallback((docId: string, version: number, adminId: string) => {
    if(!USE_REAL_API) { revertDocumentAPI(docId, version, adminId); refreshState(); }
  }, [USE_REAL_API]);

  const editDocument = useCallback((docId: string, updates: Partial<Document>, adminId: string) => {
    if(!USE_REAL_API) { updateDocumentAPI(docId, updates, adminId); refreshState(); }
  }, [USE_REAL_API]);

  const deleteDocument = useCallback((docId: string, adminId: string) => {
    if(!USE_REAL_API) { deleteDocumentAPI(docId, adminId); refreshState(); }
  }, [USE_REAL_API]);
  
  const logUserAction = useCallback((userId: string, action: string, details: string, department?: string, documentId?: string) => {
    if(!USE_REAL_API) { logUserActivityAPI(userId, action, details, department, documentId); refreshState(); }
  }, [USE_REAL_API]);

  const updateRequestStatus = useCallback((requestId: string, status: RequestStatus, approverId: string, comment?: string) => {
    if(USE_REAL_API) { /* RealApi.updateReqStatus(...).then(loadData); */ }
    else { updateRequestStatusAPI(requestId, status, approverId, comment); refreshState(); }
  }, [USE_REAL_API, loadData]);
  
  const addRequest = useCallback((request: Omit<DocumentRequest, 'id' | 'requestDate' | 'status'>) => {
    if(USE_REAL_API) { /* RealApi.submitRequest(request).then(loadData); */ }
    else { addRequestAPI(request); refreshState(); }
  }, [USE_REAL_API, loadData]);

  const addUser = useCallback((user: User, adminId: string) => {
    if(!USE_REAL_API) { addUserAPI(user, adminId); refreshState(); }
  }, [USE_REAL_API]);

  const updateUser = useCallback((userId: string, userData: Partial<User>, adminId: string) => {
    if(!USE_REAL_API) { updateUserAPI(userId, userData, adminId); refreshState(); }
  }, [USE_REAL_API]);

  const deleteUser = useCallback((userId: string, adminId: string) => {
    if(!USE_REAL_API) { deleteUserAPI(userId, adminId); refreshState(); }
  }, [USE_REAL_API]);

  const addDepartment = useCallback((deptName: string, adminId: string) => {
    if(!USE_REAL_API) { addDepartmentAPI(deptName, adminId); refreshState(); }
  }, [USE_REAL_API]);

  const updateDepartment = useCallback((id: string, newName: string, adminId: string) => {
    if(!USE_REAL_API) { updateDepartmentAPI(id, newName, adminId); refreshState(); }
  }, [USE_REAL_API]);

  const deleteDepartment = useCallback((id: string, adminId: string) => {
    if(!USE_REAL_API) { 
        const success = deleteDepartmentAPI(id, adminId); 
        refreshState(); 
        return success;
    }
    return false;
  }, [USE_REAL_API]);

  const markNotificationAsRead = useCallback((notifId: string) => {
    if(!USE_REAL_API) { markNotificationReadAPI(notifId); refreshState(); }
  }, [USE_REAL_API]);

  return (
    <DataContext.Provider value={{ 
      documents, requests, logs, departments, users, fullUsers, notifications,
      addDocument, revertDocument, editDocument, deleteDocument, logUserAction,
      updateRequestStatus, addRequest, addUser, updateUser, deleteUser, 
      addDepartment, updateDepartment, deleteDepartment, markNotificationAsRead,
      isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
