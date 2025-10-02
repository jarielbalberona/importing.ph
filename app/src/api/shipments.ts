import axiosInstance from './axios-instance';

export const getShipmentsAPI = async (headers?: any): Promise<{ data: any; status: number; message: string }> => {
  try {
    const response = await axiosInstance.get('/shipments', { headers });
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

export const getMyShipmentsAPI = async (headers?: any): Promise<{ data: any; status: number; message: string }> => {
  try {
    const response = await axiosInstance.get('/shipments/my-shipments', { headers });
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

export const createShipmentAPI = async (shipment: any, headers?: any): Promise<any> => {
  const { data } = await axiosInstance.post('/shipments', shipment, { headers });
  return data.data || null;
};

export const updateShipmentAPI = async (shipment: any, headers?: any): Promise<any> => {
  const { data } = await axiosInstance.put(`/shipments/${shipment.id}`, shipment, { headers });
  return data.data || null;
};

export const deleteShipmentAPI = async (shipmentId: string, headers?: any): Promise<any> => {
  const { data } = await axiosInstance.delete(`/shipments/${shipmentId}`, { headers });
  return data.data || null;
};

export const getShipmentAPI = async (shipmentId: string, headers?: any): Promise<any> => {
  const { data } = await axiosInstance.get(`/shipments/${shipmentId}`, { headers });
  return data.data || null;
};
