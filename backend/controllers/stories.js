const storiesService = require('../services/stories');

const getAllStories = async (req, res) => {
  try {
    const result = await storiesService.getAllStories();
    res.json({ success: true, count: result.count, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStoryById = async (req, res) => {
  try {
    const story = await storiesService.getStoryById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
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
