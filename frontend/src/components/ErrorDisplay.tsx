import React from 'react';

export interface ApiError {
  message: string;
  details?: Record<string, string[]> | string;
  status?: number;
  validationErrors?: Record<string, string[]>;
}

interface ErrorDisplayProps {
  error: ApiError | null;
  onClose?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-600 hover:text-red-800"
          aria-label="Close error"
        >
          ✕
        </button>
      )}
      
      <h3 className="text-red-800 font-medium mb-2">{error.message}</h3>
      
      {error.details && typeof error.details === 'string' && (
        <p className="text-red-700 text-sm">{error.details}</p>
      )}
      
      {error.validationErrors && (
        <div className="mt-3">
          <h4 className="text-red-700 font-medium text-sm mb-2">Validation Errors:</h4>
          <ul className="text-red-600 text-sm space-y-1">
            {Object.entries(error.validationErrors).map(([field, errors]) => (
              <li key={field}>
                <strong className="capitalize">{field.replace(/_/g, ' ')}:</strong>{' '}
                {Array.isArray(errors) ? errors.join(', ') : errors}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};