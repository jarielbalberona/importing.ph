import axiosInstance from './axios-instance';


export const getTasksAPI = async (_queryContext?: any, headers?: any): Promise<{ data: any; status: number; message: string }> => {
  try {
    const response = await axiosInstance.get('/tasks', { headers });
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



export const createTaskAPI = async (task: any): Promise<any> => {
  const { data } = await axiosInstance.post('/tasks', task);
  return data.data || null;
};

export const updateTaskAPI = async (task: any): Promise<any> => {
  const { data } = await axiosInstance.put(`/tasks/${task.id}`, task);
  return data.data || null;
};

export const deleteTaskAPI = async (taskId: string): Promise<any> => {
  const { data } = await axiosInstance.delete(`/tasks/${taskId}`);
  return data.data || null;
};

export const getTaskAPI = async (taskId: string, headers?: any): Promise<any> => {
  const { data } = await axiosInstance.get(`/tasks/${taskId}`, { headers });
  return data.data || null;
};

export const getTaskAssignmentsAPI = async (): Promise<any> => {
  const { data } = await axiosInstance.get('/tasks/assignment');
  return data.data || null;
};

export const getTaskAssignmentAPI = async (taskAssignmentId: string): Promise<any> => {
  const { data } = await axiosInstance.get(`/tasks/assignment${taskAssignmentId}`);
  return data.data || null;
};

export const createTaskAssignmentAPI = async (taskAssignment: any): Promise<any> => {
  const { data } = await axiosInstance.post('/tasks/assignment', taskAssignment);
  return data.data || null;
};

export const updateTaskAssignmentAPI = async (taskAssignment: any): Promise<any> => {
  const { data } = await axiosInstance.put(`/tasks/assignment/${taskAssignment.id}`, taskAssignment);
  return data.data || null;
};

export const getTaskAssignmentByTokenAPI =  async (token: string, _queryContext?: any, headers?: any): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/tasks/assignment/${token}`, { headers });
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

export const updateTaskAssignmentStatusByTokenAPI = async (token: string, status: 'approved' | 'rejected'): Promise<any> => {
  const { data } = await axiosInstance.put(`/tasks/assignment/${token}`, { status });
  return data.data || null;
};








