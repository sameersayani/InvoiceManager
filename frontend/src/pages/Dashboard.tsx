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
  faTimes,
  faCalendar,
  faUser,
  faDollarSign,
  faFileInvoice,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { EditInvoiceForm } from '../components/EditInvoiceForm';
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, children }: any) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

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

  // Stats for dashboard
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadData();
    loadUserData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [invoices]);

  const calculateStats = () => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft').length;
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total_amount, 0);

    setStats({
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalRevenue
    });
  };

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

  const loadUserLogo = async () => {
    try {
      const userData = await logoAPI.getCurrentUser();
      if (userData.logo) {
        setCompanyLogo(userData.logo);
      }
    } catch (err) {
      console.error('Error loading user logo:', err);
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
      loadData();
      loadUserLogo();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
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
      loadData();
    }
    catch (error: any) {
      console.error('Error updating invoice:', error);
      throw error;
    }
    loadUserData();
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

  const markInvoiceAsPaidAPI = async (invoiceId: number) => {
    try {
      await invoiceAPI.markAsPaid(invoiceId);
      loadData();
      if (selectedInvoice) {
        handleViewInvoice(invoiceId);
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      throw error;
    }
  };

  const downloadInvoicePDFAPI = async (invoiceId: number): Promise<Blob> => {
    try {
      const blob = await invoiceAPI.downloadPDF(invoiceId);
      return blob;
    }
    catch (error) {
      console.error('Error downloading invoice PDF:', error);
      throw error;
    }
  };  

  const navigateBack = (): void => {
    setSelectedInvoice(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your invoices...</p>
        </div>
      </div>
    );
  }

  if (error && !showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Error Loading Data</p>
            <p className="mt-2 text-sm">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <img 
            src="/images/banner.png" 
            alt="INVYGO Logo" 
            className="h-12 sm:h-16 lg:h-20 w-200 mx-auto sm:mx-0"
          />
        </div>
        
        {/* Welcome and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Invoice Dashboard</h1>
            {currentUser && (
              <p className="text-gray-600 text-sm sm:text-base">
                Welcome, {currentUser.company_name || 'User'}!
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {!showCreateForm && !selectedInvoice && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto text-center flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                Create Invoice
              </button>
            )}
            <LogoutButton onLogout={onLogout} />
          </div>
        </div>

        {/* Stats Cards - Only show when not in create/view mode */}
        {!showCreateForm && !selectedInvoice && invoices.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <FontAwesomeIcon icon={faFileInvoice} className="text-blue-600 w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
                  <p className="text-xs text-gray-500">Total Invoices</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.paidInvoices}</p>
                  <p className="text-xs text-gray-500">Paid</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                  <FontAwesomeIcon icon={faClock} className="text-yellow-600 w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingInvoices}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <FontAwesomeIcon icon={faDollarSign} className="text-purple-600 w-4 h-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Total Revenue</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Invoice Form */}
        {showCreateForm ? (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Create New Invoice</h2>
              <button
                onClick={handleCancelCreate}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
              </button>
            </div>
            
            {createError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
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
            <InvoicePreview
              invoice={selectedInvoice}
              onBack={() => navigateBack()}
              companyLogo={companyLogo}
              onMarkAsPaid={async (invoiceId) => {
                await markInvoiceAsPaidAPI(invoiceId);
              }}
              onDownloadPDF={async (invoiceId) => {
                return await downloadInvoicePDFAPI(invoiceId);
              }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {invoices.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Create your first invoice to start managing your business finances efficiently</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors text-sm sm:text-base inline-flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                  Create First Invoice
                </button>
              </div>
            ) : (
              <>
                <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Your Invoices</h2>
                      <p className="text-sm text-gray-500">{invoices.length} invoice(s) total</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                        New Invoice
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Cards View */}
                <div className="block sm:hidden divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 text-sm">#{invoice.invoice_number}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {invoice.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{invoice.client_name}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faCalendar} className="w-3 h-3 text-gray-400" />
                          <span>Issued: {new Date(invoice.issue_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faCalendar} className="w-3 h-3 text-gray-400" />
                          <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-1">
                          <FontAwesomeIcon icon={faDollarSign} className="w-3 h-3 text-gray-400" />
                          <span className="font-semibold">Total: ${invoice.total_amount.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleViewInvoice(invoice.id)}
                          className="text-blue-600 hover:text-blue-900 text-sm p-2 flex items-center gap-1"
                          title="View Invoice"
                        >
                          <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        <button 
                          onClick={() => handleEditInvoice(invoice)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm p-2 flex items-center gap-1"
                          title="Edit Invoice"
                        >
                          <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteInvoice(invoice)}
                          className="text-red-600 hover:text-red-900 text-sm p-2 flex items-center gap-1"
                          title="Delete Invoice"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice #
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Issue Date
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 text-sm">#{invoice.invoice_number}</div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {invoice.client_name}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(invoice.issue_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-gray-900 text-sm">
                              ${invoice.total_amount.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewInvoice(invoice.id)}
                                className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-2 rounded hover:bg-blue-50"
                                title="View Invoice"
                              >
                                <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditInvoice(invoice)}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 p-2 rounded hover:bg-indigo-50"
                                title="Edit Invoice"
                              >
                                <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteInvoice(invoice)}
                                className="text-red-600 hover:text-red-900 transition-colors duration-200 p-2 rounded hover:bg-red-50"
                                title="Delete Invoice"
                              >
                                <FontAwesomeIcon icon={faTrashAlt} className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Footer */}
                <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center sm:text-right">
                    &copy; {new Date().getFullYear()} INVYGO developed & maintained by{' '}
                    <span className="text-blue-600 font-medium">Yesitech Solutions Pvt Ltd</span>. All rights reserved.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Edit Invoice Modal */}
        {editingInvoice && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Edit Invoice</h2>
                <button
                  onClick={() => setEditingInvoice(null)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
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

        {/* Delete Confirmation Modal */}
        {invoiceToDelete && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Confirm Deletion</h2>
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete invoice <strong>#{invoiceToDelete.invoice_number}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors text-sm sm:text-base disabled:bg-red-400"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Invoice'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};