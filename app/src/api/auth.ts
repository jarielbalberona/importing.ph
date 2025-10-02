import axiosInstance from './axios-instance';

export const getMeAPI = async (_queryContext?: any, headers?: any): Promise<any> => {
  try {
    const { data } = await axiosInstance.get('/auth/me', { headers });
    return data.data || null;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const verifySessionAPI = async (_queryContext?: any, headers?: any): Promise<any> => {
  try {
    const { data } = await axiosInstance.get('/auth/session', { headers });
    return data.data || null;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const loginAPI = async (credentials: { username: string; password: string }): Promise<any> => {
  try {
    const { data } = await axiosInstance.post('/auth/login', credentials);
    return data.data || null;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const registerAPI = async (userData: any): Promise<any> => {
  try {
    const { data } = await axiosInstance.post('/auth/register', userData);
    return data.data || null;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const logoutAPI = async (): Promise<any> => {
  try {
    const { data } = await axiosInstance.post('/auth/logout');
    return data.data || null;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const CSRFTokenAPI = async (): Promise<any> => {
  try {
    const { data } = await axiosInstance.get('/csrf-token');
    return data.data || null;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
