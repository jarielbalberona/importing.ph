import axiosInstance from './axios-instance';

export const getQuotesByShipmentAPI = async (shipmentId: string, headers?: any): Promise<{ data: any; status: number; message: string }> => {
  try {
    const response = await axiosInstance.get(`/quotes/shipment/${shipmentId}`, { headers });
    const { data } = response;
    return {
      data: data.data || null,
      status: response.status,
      message: data.message || 'Success',
    };
  } catch (error: any) {
    const errData = error.response?.data || {};
    return {
      data: null,
      status: error.response?.status || 500,
      message: errData.message || 'An error occurred',
    };
  }
};

export const getMyQuotesAPI = async (headers?: any): Promise<{ data: any; status: number; message: string }> => {
  try {
    const response = await axiosInstance.get('/quotes/my-quotes', { headers });
    const { data } = response;
    return {
      data: data.data || null,
      status: response.status,
      message: data.message || 'Success',
    };
  } catch (error: any) {
    const errData = error.response?.data || {};
    return {
      data: null,
      status: error.response?.status || 500,
      message: errData.message || 'An error occurred',
    };
  }
};

export const createQuoteAPI = async (quote: any, headers?: any): Promise<any> => {
  const { data } = await axiosInstance.post('/quotes', quote, { headers });
  return data.data || null;
};

export const updateQuoteAPI = async (quote: any, headers?: any): Promise<any> => {
  const { data } = await axiosInstance.put(`/quotes/${quote.id}`, quote, { headers });
  return data.data || null;
};

export const deleteQuoteAPI = async (quoteId: string, headers?: any): Promise<any> => {
  const { data } = await axiosInstance.delete(`/quotes/${quoteId}`, { headers });
  return data.data || null;
};

export const getQuoteAPI = async (quoteId: string, headers?: any): Promise<any> => {
  const { data } = await axiosInstance.get(`/quotes/${quoteId}`, { headers });
  return data.data || null;
};

export const acceptQuoteAPI = async (quoteId: string, headers?: any): Promise<any> => {
  const { data } = await axiosInstance.put(`/quotes/${quoteId}/accept`, {}, { headers });
  return data.data || null;
};

export const rejectQuoteAPI = async (quoteId: string, headers?: any): Promise<any> => {
  const { data } = await axiosInstance.put(`/quotes/${quoteId}/reject`, {}, { headers });
  return data.data || null;
};
