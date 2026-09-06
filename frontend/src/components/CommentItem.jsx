import { Avatar, Box, Typography } from '@mui/material';
import { formatAbsoluteTime as formatTime, getInitials } from '../utils/formatters';

const CommentItem = ({ comment }) => (
  <Box sx={{ display: 'flex', gap: 1.25, py: 0.75 }}>
    <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.light' }}>
      {getInitials(comment.username)}
    </Avatar>
    <Box
      sx={{
        bgcolor: 'background.default',
        borderRadius: 2,
        px: 1.5,
        py: 0.75,
        flex: 1,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {comment.username}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatTime(comment.createdAt)}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {comment.text}
      </Typography>
    </Box>
  </Box>
);

export default CommentItem;
