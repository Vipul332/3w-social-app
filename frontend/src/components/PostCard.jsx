import { useState } from 'react';
import { Card, CardContent, CardMedia, Box, Avatar, Typography, IconButton, CardActions, Button } from '@mui/material';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import { formatRelativeTime, getInitials } from '../utils/formatters';

const PostCard = ({ post, onUpdate }) => {
  const [commentsExpanded, setCommentsExpanded] = useState(false);

  return (
    <Card
      elevation={0}
      sx={{
        mb: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 42, height: 42 }}>
            {getInitials(post.user.username)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontWeight: 600 }}>{post.user.username}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(post.createdAt)}
            </Typography>
          </Box>
          <IconButton size="small" disabled>
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Box>

        {post.content && (
          <Typography variant="body1" sx={{ mt: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {post.content}
          </Typography>
        )}
      </CardContent>

      {post.image && (
        <CardMedia
          component="img"
          image={post.image}
          alt="Post attachment"
          loading="lazy"
          sx={{ maxHeight: 480, objectFit: 'cover', bgcolor: '#f0f0f5' }}
        />
      )}

      <CardActions sx={{ px: 2, py: 0.5, justifyContent: 'space-between' }}>
        <LikeButton post={post} onUpdate={onUpdate} />
        <Button
          size="small"
          onClick={() => setCommentsExpanded((prev) => !prev)}
          startIcon={<ChatBubbleOutlineRoundedIcon fontSize="small" />}
          sx={{ color: 'text.secondary' }}
        >
          {post.comments.length}
        </Button>
      </CardActions>

      <CommentSection post={post} expanded={commentsExpanded} onUpdate={onUpdate} />
    </Card>
  );
};

export default PostCard;
