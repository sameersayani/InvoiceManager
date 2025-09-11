import React from 'react';
import { useReactToPrint } from 'react-to-print';
import { Invoice } from '../types';
import { format } from 'date-fns';

interface InvoicePreviewProps {
  invoice: Invoice;
  onBack: () => void;
  companyLogo?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, onBack, companyLogo }) => {
  const componentRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

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

  // Safe access to client properties with fallbacks
  const client = invoice.client || {};
  const clientName = client.name || 'N/A';
  const clientAddress = client.address || 'N/A';
  const clientEmail = client.email || 'N/A';
  const clientPhone = client.phone || 'N/A';

  // Safe access to company details from invoice or use defaults
  const companyName = invoice.client.name || 'Demo Company Inc.';
  const companyAddress = invoice.client.address || '123 Business Ave, Suite 100';
  const companyCity = invoice.client.city || 'New York, NY 10001';
  const companyEmail = invoice.client.email || 'contact@democompany.com';
  const companyPhone = invoice.client.phone || '+1 (555) 123-4567';
  const companyTaxId = invoice.client.tax_id || '';

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="btn-secondary mb-6"
      >
        ← Back to Invoices
      </button>
      <div className="card">
        <div ref={componentRef} className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 border-b pb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
              <p className="text-gray-600 text-lg">#{invoice.invoice_number}</p>
              {companyTaxId && (
                <p className="text-gray-500 text-sm mt-1">Tax ID: {companyTaxId}</p>
              )}
            </div>
            <div className="text-right">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt="Company logo"
                  className="w-24 h-24 rounded-lg object-cover mb-2"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">LOGO</span>
                </div>
              )}
              <p className="text-sm text-gray-600 font-medium">{companyName}</p>
            </div>
          </div>

          {/* From/To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">From:</h3>
              <div className="space-y-1 text-gray-700">
                <p className="font-medium">{companyName}</p>
                <p>{companyAddress}</p>
                <p>{companyCity}</p>
                <p>{companyEmail}</p>
                <p>{companyPhone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">To:</h3>
              <div className="space-y-1 text-gray-700">
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

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <p><span className="font-semibold text-gray-900">Invoice Date:</span> {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}</p>
              <p><span className="font-semibold text-gray-900">Due Date:</span> {format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
              {invoice.invoice_number && (
                <p><span className="font-semibold text-gray-900">PO Number:</span> {invoice.invoice_number}</p>
              )}
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold text-gray-900">Status:</span> 
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${statusColors[invoice.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                  {invoice.status?.toUpperCase() || 'DRAFT'}
                </span>
              </p>
              {invoice.terms && (
                <p><span className="font-semibold text-gray-900">Payment Terms:</span> {invoice.terms}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 font-semibold text-gray-900">Description</th>
                  <th className="text-right py-3 font-semibold text-gray-900">Quantity</th>
                  <th className="text-right py-3 font-semibold text-gray-900">Unit Price</th>
                  <th className="text-right py-3 font-semibold text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 text-gray-700">
                      <div>
                        <p className="font-medium">{item.description || 'No description'}</p>
                      </div>
                    </td>
                    <td className="text-right py-4 text-gray-700">{item.quantity || 0}</td>
                    <td className="text-right py-4 text-gray-700">${(item.unit_price || 0).toFixed(2)}</td>
                    <td className="text-right py-4 text-gray-700 font-medium">
                      ${((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="ml-auto w-80">
            <div className="space-y-2">
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

              <div className="flex justify-between border-t-2 border-gray-200 pt-3 font-bold text-xl text-gray-900">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {invoice.amount_paid > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Amount Paid:</span>
                    <span>${invoice.amount_paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-lg">
                    <span>Balance Due:</span>
                    <span>${(total - (invoice.amount_paid || 0)).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Instructions */}
          {invoice.payment_instructions && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Instructions</h3>
              <p className="text-gray-700 leading-relaxed">{invoice.payment_instructions}</p>
            </div>
          )}

          {/* Notes & Terms */}
          {invoice.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
              <p className="text-gray-700 leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          {invoice.terms && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Terms & Conditions</h3>
              <p className="text-gray-700 leading-relaxed">{invoice.terms}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">
              {invoice.footer_note || 'Thank you for your business!'}
            </p>
            {invoice.company_website && (
              <p className="text-gray-500 text-sm mt-1">
                Website: {invoice.company_website}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 justify-center p-4">
          <button
            onClick={handlePrint}
            className="btn-primary"
          >
            Print Invoice
          </button>
          <button className="btn-secondary">
            Download PDF
          </button>
          {invoice.status !== 'paid' && (
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Mark as Paid
            </button>
          )}
        </div>
      </div>
    </div>
  );
};