import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const API = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token automatically if available
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// -------- GET Endpoints --------
export const getTasks = () => API.get('/tasks/');
export const getCompletedTasks = () => API.get('/tasks/completed/');
export const getPendingTasks = () => API.get('/tasks/pending/');
export const getHighPriorityTasks = () => API.get('/tasks/high_priority/');
export const getStatistics = () => API.get('/tasks/statistics/');

// -------- POST / PUT / DELETE Endpoints --------
export const createTask = (taskData) => API.post('/tasks/', taskData);
export const updateTask = (taskId, taskData) => API.put(`/tasks/${taskId}/`, taskData);
export const deleteTask = (taskId) => API.delete(`/tasks/${taskId}/`);

// Export the Axios instance for custom requests if needed
export default API;
