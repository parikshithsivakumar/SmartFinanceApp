import { apiRequest } from './queryClient';

// Auth API functions
export const loginUser = async (email: string, password: string) => {
  const response = await apiRequest('POST', '/api/auth/login', { email, password });
  return response.json();
};

export const registerUser = async (name: string, email: string, password: string) => {
  const response = await apiRequest('POST', '/api/auth/register', { name, email, password });
  return response.json();
};

export const getUserProfile = async () => {
  const response = await apiRequest('GET', '/api/auth/profile');
  return response.json();
};

// Document API functions
export const uploadDocument = async (formData: FormData) => {
  const token = localStorage.getItem("token");
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload document');
  }
  
  return response.json();
};

export const getDocuments = async () => {
  const response = await apiRequest('GET', '/api/documents');
  return response.json();
};

export const getDocumentById = async (id: number) => {
  const response = await apiRequest('GET', `/api/documents/${id}`);
  return response.json();
};

export const deleteDocument = async (id: number) => {
  const response = await apiRequest('DELETE', `/api/documents/${id}`);
  return response.json();
};
