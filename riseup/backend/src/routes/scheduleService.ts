import axios from 'axios';

const API_URL = 'http://192.168.0.105:5000/schedule';

export const addActivity = async (userId: string, activity: string, startTime: string, endTime: string) => {
  const response = await axios.post(`${API_URL}/add-activity`, { userId, activity, startTime, endTime });
  return response.data;
};

export const getSchedule = async (userId: string) => {
  const response = await axios.get(`${API_URL}/get-schedule/${userId}`);
  return response.data;
};

export const generateRoutine = async (userId: string) => {
  const response = await axios.post(`${API_URL}/generate-routine`, { userId });
  return response.data;
};
