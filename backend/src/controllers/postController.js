const mongoose = require('mongoose');
const Post = require('../models/Post');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const cloudinary = require('../config/cloudinary');

// @route  POST /api/posts
// @access Private
const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;

  const trimmedContent =
    typeof content === 'string' ? content.trim() : '';

  let imageUrl = null;

  // Upload image to Cloudinary when an image is provided
  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: '3w-social-app',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    imageUrl = result.secure_url;
  }

  // Backend validation: post must contain text or image
  if (!trimmedContent && !imageUrl) {
    throw new ApiError(400, 'Please enter text or select an image.');
  }

  const post = await Post.create({
    user: {
      id: req.user.id,
      username: req.user.username,
    },
    content: trimmedContent,
    image: imageUrl,
  });

  res.status(201).json({
    success: true,
    message: 'Post created successfully.',
    post,
  });
});

// @route  GET /api/posts?page=1&limit=10
// @access Public
const getFeed = asyncHandler(async (req, res) => {
  const page = Math.max(
    parseInt(req.query.page, 10) || 1,
    1
  );

  const limit = Math.min(
    Math.max(parseInt(req.query.limit, 10) || 10, 1),
    50
  );

  const skip = (page - 1) * limit;

  const [posts, totalCount] = await Promise.all([
    Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Post.countDocuments(),
  ]);

  const totalPages = Math.max(
    Math.ceil(totalCount / limit),
    1
  );

  res.status(200).json({
    success: true,
    posts,
    page,
    limit,
    totalPosts: totalCount,
    totalPages,
    hasNextPage: page < totalPages,
  });
});

// @route  POST /api/posts/:postId/like
// @access Private
const toggleLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, 'Invalid post id.');
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  const userId = req.user.id;

  const existingLikeIndex = post.likes.findIndex(
    (like) => like.userId.toString() === userId
  );

  let liked;

  if (existingLikeIndex === -1) {
    post.likes.push({
      userId,
      username: req.user.username,
    });

    liked = true;
  } else {
    post.likes.splice(existingLikeIndex, 1);
    liked = false;
  }

  await post.save();

  res.status(200).json({
    success: true,
    message: liked ? 'Post liked.' : 'Post unliked.',
    liked,
    likesCount: post.likes.length,
    likes: post.likes,
  });
});

// @route  POST /api/posts/:postId/comments
// @access Private
const addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new ApiError(400, 'Invalid post id.');
  }

  const trimmedText =
    typeof text === 'string' ? text.trim() : '';

  if (!trimmedText) {
    throw new ApiError(400, 'Comment text is required.');
  }

  if (trimmedText.length > 500) {
    throw new ApiError(
      400,
      'Comment must be 500 characters or fewer.'
    );
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  post.comments.push({
    userId: req.user.id,
    username: req.user.username,
    text: trimmedText,
  });

  await post.save();

  const newComment =
    post.comments[post.comments.length - 1];

  res.status(201).json({
    success: true,
    message: 'Comment added.',
    comment: newComment,
    commentsCount: post.comments.length,
  });
});

module.exports = {
  createPost,
  getFeed,
  toggleLike,
  addComment,
};