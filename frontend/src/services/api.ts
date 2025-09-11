import axios from 'axios';
import { tokenService } from './auth'
import { Invoice, InvoiceCreate, Client, InvoiceSummary, User, LogoResponse, ClientCreate } from '../types';

const API_BASE_URL = 'http://localhost:8000';

// Create a single axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenService.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const logoAPI = {
  uploadLogo: (file: File): Promise<LogoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/users/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(response => response.data);
  },

  getLogo: (): Promise<any> =>
    api.get('/users/logo').then(response => response.data),

  deleteLogo: (): Promise<void> =>
    api.delete('/users/logo').then(response => response.data),

  getCurrentUser: (): Promise<User> =>
    api.get('/users/me').then(response => response.data),
};

export const invoiceAPI = {
  getInvoices: (): Promise<InvoiceSummary[]> =>
    api.get('/invoices/').then(response => response.data),

  getInvoice: (id: number): Promise<Invoice> =>
    api.get(`/invoices/${id}`).then(response => response.data),

  createInvoice: (invoice: InvoiceCreate): Promise<Invoice> =>
    api.post('/invoices/', invoice).then(response => response.data),

  updateInvoice: (id: number, invoice: InvoiceCreate): Promise<Invoice> =>
    api.put(`/invoices/${id}`, invoice).then(response => response.data),

  updateInvoiceStatus: (id: number, status: string): Promise<void> =>
    api.patch(`/invoices/${id}/status`, { status }),

  getClients: (): Promise<Client[]> =>
    api.get('/clients/').then(response => response.data),

  createClient: (client: ClientCreate): Promise<Client> =>
    api.post('/clients/', client).then(response => response.data),
};