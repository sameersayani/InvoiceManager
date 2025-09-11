import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Invoice, Client, InvoiceCreate } from '../types';
import { Combobox } from '@headlessui/react';
import { invoiceAPI, logoAPI } from '../services/api';
import { LogoUpload } from './LogoUpload';

interface EditInvoiceFormProps {
  invoice: Invoice;
  clients: Client[];
  onSubmit: (data: InvoiceCreate) => Promise<void>;
  onCancel: () => void;
  onUpdateSuccess?: () => void;
}

type FormValues = {
  client_id: number | string;
  client_name: string;
  client_email: string;
  client_address: string;
  client_phone: string;
  issue_date: string;
  due_date: string;
  tax_rate?: number;
  discount?: number;
  notes?: string;
  terms?: string;
  po_number?: string;
  payment_terms?: string;
  shipping_fee?: number;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate?: number;
    item_code?: string;
  }>;
};

export const EditInvoiceForm: React.FC<EditInvoiceFormProps> = ({
  invoice,
  clients,
  onSubmit,
  onCancel,
  onUpdateSuccess
}) => {
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string>('');
  
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      client_id: invoice.client?.id || "",
      client_name: invoice.client?.name || "",
      client_email: invoice.client?.email || "",
      client_address: invoice.client?.address || "",
      client_phone: invoice.client?.phone || "",
      items: invoice.items?.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
      })) || [{ description: '', quantity: 1, unit_price: 0 }],
      tax_rate: invoice.tax_rate || 0,
      discount: invoice.discount || 0,
      issue_date: invoice.issue_date ? new Date(invoice.issue_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      due_date: invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: invoice.notes || '',
      terms: invoice.terms || '',
      shipping_fee: invoice.shipping_fee || 0
    },
  });

  const filteredClients = query === ""
    ? clients
    : clients.filter((c: Client) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      );

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  const taxRate = watch('tax_rate') || 0;
  const discount = watch('discount') || 0;
  const shippingFee = watch('shipping_fee') || 0;

  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    return sum + (quantity * unitPrice);
  }, 0);

  const discountAmount = Number(discount) || 0;
  const taxRateValue = Number(taxRate) || 0;
  const taxAmount = (subtotal - discountAmount) * (taxRateValue / 100);
  const total = subtotal - discountAmount + taxAmount + Number(shippingFee);

  // Auto-fill client details when an existing client is selected
  useEffect(() => {
    if (selectedClient) {
      setValue('client_name', selectedClient.name);
      setValue('client_email', selectedClient.email || '');
      setValue('client_address', selectedClient.address || '');
      setValue('client_phone', selectedClient.phone || '');
    }
  }, [selectedClient, setValue]);

  // Set initial selected client
  useEffect(() => {
    if (invoice.client && clients.length > 0) {
      const client = clients.find(c => c.id === invoice.client.id);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [invoice.client, clients]);

  const handleFormSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      let clientId = data.client_id;

      // If client_id is a string (new client name), create the client first
      if (typeof clientId === 'string' || String(clientId) === "") {
        const newClient = await invoiceAPI.createClient({
          name: data.client_name,
          email: data.client_email,
          address: data.client_address,
          phone: data.client_phone
        });
        clientId = newClient.id;
      }

      // Prepare the invoice data with the correct numeric client_id
      const invoiceData: InvoiceCreate = {
        client_id: clientId as number,
        issue_date: data.issue_date,
        due_date: data.due_date,
        tax_rate: data.tax_rate || 0,
        discount: data.discount || 0,
        notes: data.notes || '',
        terms: data.terms || '',
        company_logo: companyLogo,
        items: data.items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          tax_rate: item.tax_rate || 0,
          item_code: item.item_code || ''
        }))
      };

      await onSubmit(invoiceData);
      onUpdateSuccess?.();
    } catch (error) {
      console.error('Error updating invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearClientFields = () => {
    setSelectedClient(null);
    setValue('client_name', '');
    setValue('client_email', '');
    setValue('client_address', '');
    setValue('client_phone', '');
  };

  const handleLogoUpload = (logoUrl: string) => {
    setCompanyLogo(logoUrl);
  };

  return (
    <div className="card max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Invoice #{invoice.invoice_number}</h2>
      
      {/* Logo Upload Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Company Logo</h3>
        <LogoUpload onLogoUpload={handleLogoUpload} />
        {companyLogo && (
          <div className="mt-3 flex items-center">
            <span className="text-sm text-gray-600 mr-3">Current Logo:</span>
            <img 
              src={companyLogo} 
              alt="Company Logo" 
              className="w-12 h-12 rounded object-cover border"
            />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Client Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
          <Controller
            name="client_id"
            control={control}
            render={({ field }) => (
              <Combobox
                value={selectedClient}
                onChange={(client: Client | null) => {
                  setSelectedClient(client);
                  if (client) {
                    field.onChange(client.id);
                  } else {
                    field.onChange("");
                    clearClientFields();
                  }
                }}
                nullable
              >
                <div className="relative">
                  <Combobox.Input
                    className="input-field w-full"
                    onChange={(e) => setQuery(e.target.value)}
                    displayValue={(client: Client | null) => client ? client.name : ''}
                    placeholder="Search for existing client"
                  />
                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-white shadow-lg">
                    {filteredClients.map((client) => (
                      <Combobox.Option
                        key={client.id}
                        value={client}
                        className={({ active }) =>
                          `cursor-pointer px-3 py-2 ${
                            active ? "bg-indigo-600 text-white" : "text-gray-900"
                          }`
                        }
                      >
                        {client.name}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </div>
              </Combobox>
            )}
          />
        </div>

        {/* Client Details Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
            <input
              type="text"
              {...register('client_name', { required: 'Client name is required' })}
              className="input-field"
              placeholder="Client name"
            />
            {errors.client_name && (
              <p className="text-red-600 text-sm mt-1">{errors.client_name.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client Email *</label>
            <input
              type="email"
              {...register('client_email', { required: 'Client email is required' })}
              className="input-field"
              placeholder="client@example.com"
            />
            {errors.client_email && (
              <p className="text-red-600 text-sm mt-1">{errors.client_email.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Client Address *</label>
          <textarea
            {...register('client_address', { required: 'Client address is required' })}
            className="input-field"
            rows={2}
            placeholder="Full address"
          />
          {errors.client_address && (
            <p className="text-red-600 text-sm mt-1">{errors.client_address.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Client Phone *</label>
          <input
            type="text"
            {...register('client_phone', { required: 'Client phone is required' })}
            className="input-field"
            placeholder="Phone number"
          />
          {errors.client_phone && (
            <p className="text-red-600 text-sm mt-1">{errors.client_phone.message}</p>
          )}
        </div>

        {/* Date Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date *</label>
            <input
              type="date"
              {...register('issue_date', { required: 'Issue date is required' })}
              className="input-field"
            />
            {errors.issue_date && (
              <p className="text-red-600 text-sm mt-1">{errors.issue_date.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
            <input
              type="date"
              {...register('due_date', { required: 'Due date is required' })}
              className="input-field"
            />
            {errors.due_date && (
              <p className="text-red-600 text-sm mt-1">{errors.due_date.message}</p>
            )}
          </div>
        </div>

        {/* Additional Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PO Number</label>
            <input
              type="text"
              {...register('po_number')}
              className="input-field"
              placeholder="Purchase order number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
            <input
              type="text"
              {...register('payment_terms')}
              className="input-field"
              placeholder="e.g., Net 30"
            />
          </div>
        </div>

        {/* Tax, Discount, and Shipping */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('tax_rate', { valueAsNumber: true })}
              className="input-field"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('discount', { valueAsNumber: true })}
              className="input-field"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Fee ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('shipping_fee', { valueAsNumber: true })}
              className="input-field"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Items</h3>
            <button
              type="button"
              onClick={() => append({ description: '', quantity: 1, unit_price: 0 })}
              className="btn-primary text-sm"
            >
              Add Item
            </button>
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start p-3 bg-gray-50 rounded-lg">
                <div className="md:col-span-4">
                  <input
                    {...register(`items.${index}.description`, { required: 'Description is required' })}
                    placeholder="Item description"
                    className="input-field"
                  />
                  {errors.items?.[index]?.description && (
                    <p className="text-red-600 text-sm mt-1">{errors.items[index]?.description?.message}</p>
                  )}
                  <input
                    {...register(`items.${index}.item_code`)}
                    placeholder="Item code (optional)"
                    className="input-field mt-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`items.${index}.quantity`, { 
                      required: 'Quantity is required',
                      valueAsNumber: true,
                      min: { value: 0.01, message: 'Quantity must be greater than 0' }
                    })}
                    placeholder="Qty"
                    className="input-field"
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-red-600 text-sm mt-1">{errors.items[index]?.quantity?.message}</p>
                  )}
                </div>
                <div className="md:col-span-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`items.${index}.unit_price`, { 
                      required: 'Price is required',
                      valueAsNumber: true,
                      min: { value: 0.01, message: 'Price must be greater than 0' }
                    })}
                    placeholder="Unit Price"
                    className="input-field"
                  />
                  {errors.items?.[index]?.unit_price && (
                    <p className="text-red-600 text-sm mt-1">{errors.items[index]?.unit_price?.message}</p>
                  )}
                </div>
                <div className="md:col-span-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="btn-danger w-full"
                    disabled={fields.length === 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t pt-4">
          <div className="max-w-md ml-auto space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            {taxRateValue > 0 && (
              <div className="flex justify-between">
                <span>Tax ({taxRateValue}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
            )}
            {shippingFee > 0 && (
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>${shippingFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            {...register('notes')}
            className="input-field"
            rows={3}
            placeholder="Additional notes for the client..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
          <textarea
            {...register('terms')}
            className="input-field"
            rows={3}
            placeholder="Payment terms and conditions..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            className="btn-primary flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating Invoice...' : 'Update Invoice'}
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            className="btn-secondary flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};