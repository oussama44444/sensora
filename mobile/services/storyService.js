import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const api = axios.create({ baseURL: `${BACKEND_URL}/stories` });

const authHeader = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

export const getAllStories = async () => {
	const res = await api.get('/');
	return res.data;
};

export const getStoryById = async (id) => {
	const res = await api.get(`/${id}`);
	return res.data;
};

export const createStory = async (formData, token) => {
	const res = await api.post('/', formData, {
		headers: { ...authHeader(token), 'Content-Type': 'multipart/form-data' },
	});
	return res.data;
};

export const updateStory = async (id, formData, token) => {
	const res = await api.put(`/${id}`, formData, {
		headers: { ...authHeader(token), 'Content-Type': 'multipart/form-data' },
	});
	return res.data;
};

export const deleteStory = async (id, token) => {
	const res = await api.delete(`/${id}`, { headers: authHeader(token) });
	return res.data;
};

export default {
	getAllStories,
	getStoryById,
	createStory,
	updateStory,
	deleteStory,
};
