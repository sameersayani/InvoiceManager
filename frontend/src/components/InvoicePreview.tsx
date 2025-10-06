import React, { useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Invoice } from '../types';
import { format } from 'date-fns';
import { logoAPI, invoiceAPI } from '../services/api';
import { toast } from 'react-toastify';

interface InvoicePreviewProps {
  invoice: Invoice;
  onBack: () => void;
  companyLogo?: string;
  onMarkAsPaid: (invoiceId: number) => Promise<void>;
  onDownloadPDF: (invoiceId: number) => Promise<Blob>;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  invoice, 
  onBack, 
  companyLogo,
  onMarkAsPaid,
  onDownloadPDF
}) => {
  const componentRef = React.useRef<HTMLDivElement>(null);
  const [isMarkingAsPaid, setIsMarkingAsPaid] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [base64Logo, setBase64Logo] = useState<string | null>(null);

  // Load current user data for "From" section
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await logoAPI.getCurrentUser();
        setCurrentUser(userData);
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };
    
    loadUserData();
  }, []);
  
  // Handle logo loading
  useEffect(() => {
    if (companyLogo) {
      const img = new Image();
      img.onload = () => setLogoLoaded(true);
      img.onerror = () => {
        console.error('Failed to load logo image');
        setLogoLoaded(true);
      };
      img.src = companyLogo;
    } else {
      setLogoLoaded(true);
    }
  }, [companyLogo]);

  useEffect(() => {
    const loadLogo = async () => {
      if (companyLogo) {
        try {
          const base64 = await convertImageToBase64(companyLogo);
          setBase64Logo(base64);
          setLogoLoaded(true);
        } catch (error) {
          console.error('Failed to convert logo to base64:', error);
          setLogoLoaded(true);
        }
      } else {
        setLogoLoaded(true);
      }
    };
    
    loadLogo();
  }, [companyLogo]);

  const convertImageToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        if (logoLoaded) {
          resolve(undefined);
        } else {
          const checkLogoLoaded = setInterval(() => {
            if (logoLoaded) {
              clearInterval(checkLogoLoaded);
              resolve(undefined);
            }
          }, 100);
        }
      });
    },
    pageStyle: `
      @media print {
        @page { margin: 20px; }
        body { -webkit-print-color-adjust: exact; }
        img { max-width: 100px; height: auto; }
      }
    `,
  });

  const handleMarkAsPaid = async () => {
    setIsMarkingAsPaid(true);
    try {
      await onMarkAsPaid(invoice.id);
    } catch (error) {
      console.error('Failed to mark invoice as paid:', error);
    } finally {
      setIsMarkingAsPaid(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    try {
      const response = await invoiceAPI.downloadPDF(invoice.id);
      const pdfBlob = response;
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download PDF. Please check your authentication.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const discount = invoice.discount || 0;
  const taxRate = invoice.tax_rate || 0;
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const total = subtotal - discount + taxAmount;

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
  };

  const client = invoice.client || {};
  const clientName = client.name || 'N/A';
  const clientAddress = client.address || 'N/A';
  const clientEmail = client.email || 'N/A';
  const clientPhone = client.phone || 'N/A';

  const companyName = currentUser?.company_name || currentUser?.name || 'Your Company Name';
  const companyAddress = currentUser?.address || '123 Business Ave, Suite 100';
  const companyCity = currentUser?.city || 'New York, NY 10001';
  const companyEmail = currentUser?.email || 'contact@yourcompany.com';
  const companyPhone = currentUser?.phone || '+1 (555) 123-4567';
  const companyTaxId = currentUser?.tax_id || '';

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={onBack}
        className="btn-secondary mb-4 w-full sm:w-auto text-center"
      >
        ← Back to Invoices
      </button>
      <div className="card">
        <div ref={componentRef} className="p-4 sm:p-6 md:p-8">
          {/* Header - Responsive */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8 border-b pb-4 sm:pb-6">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">INVOICE</h1>
              <p className="text-gray-600 text-base sm:text-lg">#{invoice.invoice_number}</p>
              {companyTaxId && (
                <p className="text-gray-500 text-sm mt-1">Tax ID: {companyTaxId}</p>
              )}
            </div>
            <div className="w-full sm:w-auto text-left sm:text-right">
              {companyLogo ? (
                <img
                  src={base64Logo || companyLogo}
                  alt="Company logo"
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg object-cover mb-2 mx-auto sm:mx-0"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg mb-2 flex items-center justify-center mx-auto sm:mx-0">
                  <span className="text-white font-bold text-sm sm:text-xl">LOGO</span>
                </div>
              )}
            </div>
          </div>

          {/* From/To - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg">From:</h3>
              <div className="space-y-1 text-gray-700 text-sm sm:text-base">
                <p className="font-medium">{companyName}</p>
                <p>{companyAddress}</p>
                <p>{companyCity}</p>
                <p>{companyEmail}</p>
                <p>{companyPhone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg">To:</h3>
              <div className="space-y-1 text-gray-700 text-sm sm:text-base">
                <p className="font-medium">{clientName}</p>
                <p>{clientAddress}</p>
                <p>{clientEmail}</p>
                <p>{clientPhone}</p>
                {client.tax_id && (
                  <p className="text-sm text-gray-500">Tax ID: {client.tax_id}</p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8 bg-gray-50 p-3 sm:p-4 rounded-lg">
            <div className="space-y-2 text-sm sm:text-base">
              <p><span className="font-semibold text-gray-900">Invoice Date:</span> {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}</p>
              <p><span className="font-semibold text-gray-900">Due Date:</span> {format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
              {invoice.invoice_number && (
                <p><span className="font-semibold text-gray-900">PO Number:</span> {invoice.invoice_number}</p>
              )}
            </div>
            <div className="space-y-2 text-sm sm:text-base">
              <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-semibold text-gray-900">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                  {invoice.status?.toUpperCase() || 'DRAFT'}
                </span>
              </p>
              {invoice.terms && (
                <p><span className="font-semibold text-gray-900">Payment Terms:</span> {invoice.terms}</p>
              )}
            </div>
          </div>

          {/* Items Table - Responsive */}
          <div className="mb-6 sm:mb-8 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 font-semibold text-gray-900 text-sm sm:text-base">Description</th>
                  <th className="text-right py-3 font-semibold text-gray-900 text-sm sm:text-base">Quantity</th>
                  <th className="text-right py-3 font-semibold text-gray-900 text-sm sm:text-base">Unit Price</th>
                  <th className="text-right py-3 font-semibold text-gray-900 text-sm sm:text-base">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 sm:py-4 text-gray-700 text-sm sm:text-base">
                      <div>
                        <p className="font-medium">{item.description || 'No description'}</p>
                      </div>
                    </td>
                    <td className="text-right py-3 sm:py-4 text-gray-700 text-sm sm:text-base">{item.quantity || 0}</td>
                    <td className="text-right py-3 sm:py-4 text-gray-700 text-sm sm:text-base">${(item.unit_price || 0).toFixed(2)}</td>
                    <td className="text-right py-3 sm:py-4 text-gray-700 font-medium text-sm sm:text-base">
                      ${((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals - Responsive */}
          <div className="ml-auto w-full sm:w-80">
            <div className="space-y-2 text-sm sm:text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              
              {taxRate > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
              )}

              {invoice.shipping_fee > 0 && (
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>${invoice.shipping_fee.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between border-t-2 border-gray-200 pt-3 font-bold text-lg sm:text-xl text-gray-900">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {invoice.amount_paid > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Amount Paid:</span>
                    <span>${invoice.amount_paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-base sm:text-lg">
                    <span>Balance Due:</span>
                    <span>${(total - (invoice.amount_paid || 0)).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Instructions */}
          {invoice.payment_instructions && (
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg">Payment Instructions</h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{invoice.payment_instructions}</p>
            </div>
          )}

          {/* Notes & Terms */}
          {invoice.notes && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg">Notes</h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{invoice.notes}</p>
            </div>
          )}

          {invoice.terms && (
            <div className="mt-4 sm:mt-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg">Terms & Conditions</h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{invoice.terms}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-xs sm:text-sm">
              {invoice.footer_note || 'Thank you for your business!'}
            </p>
            {invoice.company_website && (
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Website: {invoice.company_website}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons - Responsive */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center p-4">
          <button
            onClick={handlePrint}
            className="btn-primary w-full sm:w-auto text-center py-2 sm:py-2 px-4 sm:px-6"
          >
            Print Invoice
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF}
            className="btn-secondary w-full sm:w-auto text-center py-2 sm:py-2 px-4 sm:px-6"
          >
            {isDownloadingPDF ? 'Downloading...' : 'Download PDF'}
          </button>
          {invoice.status !== 'paid' && (
            <button 
              onClick={handleMarkAsPaid}
              disabled={isMarkingAsPaid}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 sm:py-2 px-4 sm:px-6 rounded-lg transition-colors duration-200 disabled:bg-green-400 w-full sm:w-auto text-center"
            >
              {isMarkingAsPaid ? 'Processing...' : 'Mark as Paid'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};