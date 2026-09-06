const express = require('express');
const { createPost, getFeed, toggleLike, addComment } = require('../controllers/postController');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getFeed);
router.post('/', protect, upload.single('image'), createPost);
router.post('/:postId/like', protect, toggleLike);
router.post('/:postId/comments', protect, addComment);

module.exports = router;
