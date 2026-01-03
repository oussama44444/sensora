const storiesService = require('../services/stories');

const getAllStories = async (req, res) => {
  try {
    console.log('Get all stories request, query params:', req.query);
    const language = req.query.language || 'fr';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    console.log('Fetching stories for language:', language, 'page:', page, 'limit:', limit);
    const includePremium = true
    const result = await storiesService.getAllStories(language, page, limit, includePremium);
    // return data with pagination metadata for client-side paging
    res.json({ success: true, count: result.count, data: result.data, pagination: result.pagination });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStoryById = async (req, res) => {
  try {
    const story = await storiesService.getStoryById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
    // If story is premium, only allow access to premium users
    if (story.isPremium && !(req.user && req.user.isPremium)) {
      return res.status(403).json({ success: false, message: 'Premium content. Upgrade to access.' });
    }
    res.json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createStory = async (req, res) => {
  try {
    const story = await storiesService.createStory({ file: req.file, body: req.body });
    res.json({ success: true, message: 'Story created successfully!', data: story });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

const updateStory = async (req, res) => {
  try {
    const updated = await storiesService.updateStory(req.params.id, { files: req.files, body: req.body });
    res.json({ success: true, message: 'Story updated successfully!', data: updated });
  } catch (error) {
    const status = error.status || 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

const uploadAudio = async (req, res) => {
  try {
    const url = await storiesService.uploadAudio(req.file);
    res.json({ success: true, audioUrl: url, message: 'Audio uploaded successfully' });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message || 'Failed to upload audio' });
  }
};

const uploadImage = async (req, res) => {
  try {
    const url = await storiesService.uploadImage(req.file);
    res.json({ success: true, imageUrl: url, message: 'Image uploaded successfully' });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message || 'Failed to upload image' });
  }
};

const deleteStory = async (req, res) => {
  try {
    const data = await storiesService.deleteStory(req.params.id);
    res.json({ success: true, message: 'Story deleted successfully', data });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllStories,
  getStoryById,
  createStory,
  updateStory,
  uploadAudio,
  uploadImage,
  deleteStory,
};
