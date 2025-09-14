import React, { useState, useEffect } from 'react';
import { InvoiceSummary, Client, Invoice, InvoiceCreate } from '../types';
import { invoiceAPI, logoAPI } from '../services/api';
import { InvoiceForm } from '../components/InvoiceForm';
import { InvoicePreview } from '../components/InvoicePreview';
import { LogoutButton } from '../components/LogoutButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faPrint, 
  faFilePdf, 
  faEdit,
  faTrashAlt,
  faCheckCircle,
  faPlus,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { EditInvoiceForm } from '../components/EditInvoiceForm';

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
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      const user_logo = await logoAPI.getLogo() || '';
      if (user_logo) {
        setCompanyLogo(user_logo);
      }
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

  const handleUpdateInvoice = async (data: any) => {
    try {
      if (!editingInvoice) return;
      await invoiceAPI.updateInvoice(editingInvoice.id, data);
      setEditingInvoice(null);
      loadData(); // Reload the invoices list
    }
    catch (error: any) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  };

const handleEditInvoice = async (invoiceSummary: InvoiceSummary) => {
  try {
    const fullInvoice = await invoiceAPI.getInvoice(invoiceSummary.id);
     const user_logo = await logoAPI.getLogo() || '';
      if (user_logo) {
        setCompanyLogo(user_logo);
      }
    setEditingInvoice(fullInvoice);
    
  } catch (error) {
    console.error('Error loading invoice for editing:', error);
    setError('Failed to load invoice for editing.');
  }
};

  const handleDeleteInvoice = async (invoice: InvoiceSummary) => {
    setInvoiceToDelete(invoice);
  };

    const confirmDelete = async () => {
    if (!invoiceToDelete) return;
    
    try {
      setIsDeleting(true);
      await invoiceAPI.deleteInvoice(invoiceToDelete.id);
      setInvoices(invoices.filter(inv => inv.id !== invoiceToDelete.id));
      setInvoiceToDelete(null);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setError('Failed to delete invoice.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setInvoiceToDelete(null);
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
        <div className="mb-8">
            <img src="/images/banner.png" alt="Logo" />
        </div>
        <div className="flex justify-between items-center mb-8">
           <div>
            {/* <h1 className="text-3xl font-bold text-gray-800">Invoice Generator</h1> */}
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
                       <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewInvoice(invoice.id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-2 rounded hover:bg-blue-50"
                            title="View Invoice"
                          >
                            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                          </button>
                          {/* <button 
                            className="text-green-600 hover:text-green-900 transition-colors duration-200 p-2 rounded hover:bg-green-50"
                            title="Print Invoice"
                          >
                            <FontAwesomeIcon icon={faPrint} className="w-4 h-4" />
                          </button> 
                          <button 
                            className="text-purple-600 hover:text-purple-900 transition-colors duration-200 p-2 rounded hover:bg-purple-50"
                            title="Download PDF"
                          >
                            <FontAwesomeIcon icon={faFilePdf} className="w-4 h-4" />
                          </button>*/}
                          <button 
                             onClick={() => handleEditInvoice(invoice)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 p-2 rounded hover:bg-indigo-50"
                            title="Edit Invoice"
                          >
                            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                          </button>
                          {invoiceToDelete && (
                            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                                <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
                                <p className="mb-6">
                                  Are you sure to delete ? This action cannot be undone
                                </p>
                                <div className="flex justify-end space-x-4">
                                  <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    disabled={isDeleting}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                          <button 
                            className="text-red-600 hover:text-red-900 transition-colors duration-200 p-2 rounded hover:bg-red-50"
                            title="Delete Invoice"
                            onClick={() => handleDeleteInvoice(invoice)}
                          >
                            <FontAwesomeIcon icon={faTrashAlt} className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={7} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          &copy; {new Date().getFullYear()} INVYGO developed & maintained by <span style={{color:'blue'}}>Yesitech solutions Pvt Ltd</span> All rights reserved.
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </>
            )}
          </div>
        )}
        {editingInvoice && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Edit Invoice</h2>
                <button
                  onClick={() => setEditingInvoice(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <EditInvoiceForm
                invoice={editingInvoice}
                clients={clients}
                onSubmit={handleUpdateInvoice}
                onCancel={() => setEditingInvoice(null)}
                companyLogo={companyLogo}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};