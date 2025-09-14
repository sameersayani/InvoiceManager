export interface User {
  id: number;
  email: string;
  company_name: string;
  address?: string;
  phone?: string;
  website?: string;
  tax_id?: string;
  logo?: string;
  logo_filename?: string;
  logo_content_type?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
  company_name: string;
  address?: string;
  phone?: string;
  website?: string;
  tax_id?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    company_name: string;
  };
}

export interface TokenData {
  access_token: string;
  token_type: string;
}

export interface LogoResponse {
  message: string;
  filename: string;
  content_type: string;
}

export interface Client {
  city: string;
  id: number;
  user_id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  logo?: string;
}

export interface ClientCreate {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
}
export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
}

export interface Invoice {
  shipping_fee: number;
  amount_paid: number;
  payment_instructions: any;
  footer_note: string;
  company_website: any;
  id: number;
  invoice_number: string;
  user_id: number;
  client_id: number;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  tax_rate?: number;
  discount?: number;
  notes?: string;
  terms?: string;
  items: InvoiceItem[];
  client: Client;
}

export interface InvoiceCreate {
  client_id: number;
  issue_date: string;
  due_date: string;
  tax_rate?: number;
  discount?: number;
  notes?: string;
  terms?: string;
  items: Omit<InvoiceItem, 'id' | 'invoice_id'>[];
  company_logo?: string;
}

export interface InvoiceSummary {
  id: number;
  invoice_number: string;
  client_name: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  status: string;
}