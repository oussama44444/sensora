const express = require('express');
const router = express.Router();
const multer = require('multer');
const storiesController = require('../controllers/stories');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const adminAuth = require('../middlewares/adminAuth');

router.get('/', storiesController.getAllStories);
router.get('/:id', storiesController.getStoryById);
router.post('/',adminAuth, upload.single('image'), storiesController.createStory);
router.put('/:id',adminAuth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 100 }]), storiesController.updateStory);
router.post('/upload-audio',adminAuth, upload.single('audio'), storiesController.uploadAudio);
router.post('/upload-image',adminAuth, upload.single('image'), storiesController.uploadImage);
router.delete('/:id',adminAuth, storiesController.deleteStory);
module.exports = router;