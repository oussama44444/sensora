import { useState, useEffect } from "react";
import axios from "axios";

export function useStories() {
	const [stories, setStories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchStories = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await axios.get(`/stories`);
			setStories(res.data.data);
		} catch (err) {
			setError(err.response ? err.response.data.message : err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// Ensure baseURL is set (in case AdminDashboard mounted later)
		axios.defaults.baseURL = axios.defaults.baseURL || "http://192.168.1.22:5000";
		fetchStories();
	}, []);

	const createStory = async (formData) => {
		try {
			const res = await axios.post(`/stories`, formData, {
				headers: { "Content-Type": "multipart/form-data" }
			});
			setStories((prev) => [res.data.data, ...prev]);
		} catch (err) {
			setError(err.response ? err.response.data.message : err.message);
		}
	};

	const updateStory = async (id, formData) => {
		try {
			const res = await axios.put(`/stories/${id}`, formData, {
				headers: { "Content-Type": "multipart/form-data" }
			});
			setStories((prev) => prev.map((story) => (story._id === id ? res.data.data : story)));
		} catch (err) {
			setError(err.response ? err.response.data.message : err.message);
		}
	};

	const deleteStory = async (id) => {
		try {
			await axios.delete(`/stories/${id}`);
			setStories((prev) => prev.filter((story) => story._id !== id));
		} catch (err) {
			setError(err.response ? err.response.data.message : err.message);
		}
	};

	return { stories, loading, error, createStory, updateStory, deleteStory };
}