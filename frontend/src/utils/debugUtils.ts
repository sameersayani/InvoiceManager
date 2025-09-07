// utils/debugUtils.ts
export const debugApiError = (error: any) => {
  console.group('🔍 API Error Debug');
  console.log('Status:', error.response?.status);
  console.log('Status Text:', error.response?.statusText);
  console.log('Headers:', error.response?.headers);
  console.log('Request URL:', error.config?.url);
  console.log('Request Method:', error.config?.method);
  console.log('Request Data:', error.config?.data);
  console.log('Response Data:', error.response?.data);
  console.groupEnd();
  
  return error.response?.data;
};

export const logFormData = (data: any, formName: string = 'Form Data') => {
  console.group(`📋 ${formName}`);
  console.log('Form Data:', JSON.stringify(data, null, 2));
  console.groupEnd();
};