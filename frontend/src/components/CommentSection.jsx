import { useState } from 'react';
import { Box, Collapse, TextField, IconButton, Divider } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CommentItem from './CommentItem';
import * as postService from '../services/postService';
import useToast from '../hooks/useToast';
import useAuth from '../hooks/useAuth';

const CommentSection = ({ post, expanded, onUpdate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);

    // Optimistic append; rolled back if the request fails.
    const tempComment = {
      _id: `temp-${Date.now()}`,
      userId: user.id,
      username: user.username,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    const previousComments = post.comments;
    onUpdate({ ...post, comments: [...previousComments, tempComment] });
    setText('');

    try {
      const { comment } = await postService.addComment(post._id, trimmed);
      onUpdate({ ...post, comments: [...previousComments, comment] });
    } catch (err) {
      onUpdate({ ...post, comments: previousComments });
      setText(trimmed);
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <Divider sx={{ mt: 1 }} />
      <Box sx={{ px: 2, pt: 1.5, pb: 2 }}>
        {post.comments.length > 0 && (
          <Box sx={{ maxHeight: 260, overflowY: 'auto', mb: 1 }}>
            {post.comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} />
            ))}
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Write a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSubmitting}
            inputProps={{ maxLength: 500 }}
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={!text.trim() || isSubmitting}
            aria-label="Post comment"
          >
            <SendRoundedIcon />
          </IconButton>
        </Box>
      </Box>
    </Collapse>
  );
};

export default CommentSection;
