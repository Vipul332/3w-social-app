import { useState } from 'react';
import { IconButton, Typography, Box, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import * as postService from '../services/postService';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

/**
 * Optimistically toggles like/unlike so the UI feels instant, and rolls
 * back to the previous state if the API call fails.
 */
const LikeButton = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLiked = post.likes.some((like) => like.userId === user.id);
  const likeUsernames = post.likes.map((like) => like.username);

  const handleToggleLike = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Optimistic update
    const previousLikes = post.likes;
    const optimisticLikes = isLiked
      ? previousLikes.filter((like) => like.userId !== user.id)
      : [...previousLikes, { userId: user.id, username: user.username }];
    onUpdate({ ...post, likes: optimisticLikes });

    try {
      const { likes } = await postService.toggleLike(post._id);
      onUpdate({ ...post, likes });
    } catch (err) {
      // Roll back on failure
      onUpdate({ ...post, likes: previousLikes });
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tooltipText =
    likeUsernames.length > 0
      ? likeUsernames.slice(0, 6).join(', ') + (likeUsernames.length > 6 ? ` and ${likeUsernames.length - 6} more` : '')
      : 'No likes yet';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <IconButton
        onClick={handleToggleLike}
        disabled={isSubmitting}
        size="small"
        sx={{ color: isLiked ? 'secondary.main' : 'text.secondary' }}
        aria-label={isLiked ? 'Unlike post' : 'Like post'}
      >
        {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
      </IconButton>
      <Tooltip title={tooltipText} placement="top" arrow>
        <Typography variant="body2" color="text.secondary" sx={{ cursor: 'default' }}>
          {post.likes.length}
        </Typography>
      </Tooltip>
    </Box>
  );
};

export default LikeButton;
