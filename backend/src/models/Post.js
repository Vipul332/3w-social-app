const mongoose = require('mongoose');

/**
 * Comments are embedded inside posts (no separate "comments" collection),
 * per the assignment's strict two-collection requirement.
 */
const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: true }
);

/**
 * Likes are embedded inside posts (no separate "likes" collection).
 * One sub-document per user who liked the post — userId is unique
 * within the array to prevent duplicate likes.
 */
const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

/**
 * Posts collection.
 * A post must have text, an image, or both — enforced below via a
 * schema-level validator, in addition to the controller-level check.
 */
const postSchema = new mongoose.Schema(
  {
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
    },
    content: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    image: {
      type: String, // stored as a URL, not raw binary
      default: null,
    },
    likes: {
      type: [likeSchema],
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Enforce "at least one of content or image" at the schema level too,
// as a safety net in case a controller is ever bypassed.
postSchema.pre('validate', function (next) {
  const hasContent = this.content && this.content.trim().length > 0;
  const hasImage = !!this.image;

  if (!hasContent && !hasImage) {
    return next(new Error('A post must contain text, an image, or both.'));
  }
  next();
});

// Index to make "newest first" feed queries and pagination efficient.
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
