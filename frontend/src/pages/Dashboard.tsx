import React, { useState, useEffect } from 'react';
import { InvoiceSummary, Client, Invoice } from '../types';
import { invoiceAPI, logoAPI } from '../services/api';
import { InvoiceForm } from '../components/InvoiceForm';
import { InvoicePreview } from '../components/InvoicePreview';
import { LogoutButton } from '../components/LogoutButton';

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    loadUserData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [invoicesData, clientsData] = await Promise.all([
        invoiceAPI.getInvoices(),
        invoiceAPI.getClients()
      ]);
      setInvoices(invoicesData);
      setClients(clientsData);
    } catch (err) {
      setError('Failed to load data. Please check if the backend server is running.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await logoAPI.getCurrentUser();
      setCurrentUser(userData);
      if (userData.logo) {
        setCompanyLogo(userData.logo);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const handleLogoUpload = (logoUrl: string) => {
    setCompanyLogo(logoUrl);
    loadUserData();
  };

  const handleCreateInvoice = async (data: any) => {
    try {
      setCreateError(null);
      await invoiceAPI.createInvoice(data);
      setShowCreateForm(false);
      loadData(); // Reload the invoices list
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      // The error will be handled by the InvoiceForm component itself
      // Re-throw the error so InvoiceForm can catch it
      throw error;
    }
  };

  const handleViewInvoice = async (id: number) => {
    try {
      const invoice = await invoiceAPI.getInvoice(id);
      setSelectedInvoice(invoice);
    } catch (error) {
      console.error('Error loading invoice:', error);
      setError('Failed to load invoice details.');
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setCreateError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md">
            <p className="font-semibold">Error</p>
            <p className="mt-2">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
           <div>
            <h1 className="text-3xl font-bold text-gray-800">Invoice Generator</h1>
            {currentUser && (
              <p className="text-gray-600 mt-1">
                Welcome, { currentUser.company_name || 'User'}!
              </p>
            )}
          </div>
          <div className="flex space-x-4">
            {!showCreateForm && !selectedInvoice && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Create Invoice
              </button>
            )}
            <LogoutButton onLogout={onLogout} />
          </div>
        </div>

        {showCreateForm ? (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Create New Invoice</h2>
              <button
                onClick={handleCancelCreate}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {createError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {createError}
              </div>
            )}
            
            <InvoiceForm 
              clients={clients} 
              onSubmit={handleCreateInvoice} 
              onCancel={handleCancelCreate}
            />
          </div>
        ) : selectedInvoice ? (
          <div>
            {/* <button
              onClick={() => setSelectedInvoice(null)}
              className="mb-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              ← Back to List
            </button> */}
            <InvoicePreview 
              invoice={selectedInvoice} 
              onBack={() => setSelectedInvoice(null)} 
              companyLogo={companyLogo}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
                <p className="text-gray-500 mb-4">Create your first invoice to get started</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Create First Invoice
                </button>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Invoices</h2>
                  <p className="text-sm text-gray-500">{invoices.length} invoice(s) total</p>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Issue Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {invoice.invoice_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{invoice.client_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(invoice.issue_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          ${invoice.total_amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          <button
                            onClick={() => handleViewInvoice(invoice.id)}
                            className="text-blue-600 hover:text-blue-900 underline text-sm"
                          >
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-900 underline text-sm">
                            Print
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};