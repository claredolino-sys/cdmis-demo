
import { User, Document, DocumentRequest, ActivityLog, Department, Role, Notification } from '../types';

const API_BASE_URL = 'http://localhost/cdmis_backend'; // Adjust this to your XAMPP folder path

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

// --- AUTH ---
export const loginAPI = async (userId: string, password: string): Promise<User | null> => {
    try {
        const result = await fetchAPI<{ user: User }>('api.php?action=login', {
            method: 'POST',
            body: JSON.stringify({ userId, password })
        });
        return result.user;
    } catch (error) {
        console.error("Login failed", error);
        return null;
    }
};

// --- DATA FETCHING ---
export const fetchDocuments = async (): Promise<Document[]> => {
    return fetchAPI<Document[]>('api.php?action=get_documents');
};

export const fetchRequests = async (): Promise<DocumentRequest[]> => {
    return fetchAPI<DocumentRequest[]>('api.php?action=get_requests');
};

export const fetchUsers = async (): Promise<User[]> => {
    return fetchAPI<User[]>('api.php?action=get_users');
};

export const fetchDepartments = async (): Promise<Department[]> => {
    return fetchAPI<Department[]>('api.php?action=get_departments');
};

export const fetchLogs = async (): Promise<ActivityLog[]> => {
    return fetchAPI<ActivityLog[]>('api.php?action=get_logs');
};

// --- DATA MUTATIONS ---

export const uploadDocument = async (docData: any): Promise<boolean> => {
    try {
        await fetchAPI('api.php?action=add_document', {
            method: 'POST',
            body: JSON.stringify(docData)
        });
        return true;
    } catch (e) { return false; }
};

export const submitRequest = async (requestData: any): Promise<boolean> => {
     try {
        await fetchAPI('api.php?action=add_request', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
        return true;
    } catch (e) { return false; }
};

export const updateReqStatus = async (id: string, status: string, approverId: string, comment: string): Promise<boolean> => {
    try {
        await fetchAPI('api.php?action=update_request', {
            method: 'POST',
            body: JSON.stringify({ id, status, approverId, comment })
        });
        return true;
    } catch (e) { return false; }
};
