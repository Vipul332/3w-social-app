import { Box, Typography } from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';

const EmptyState = ({
  title = 'Nothing here yet',
  subtitle = 'Be the first to share something with the community.',
  icon,
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      py: 8,
      px: 3,
      color: 'text.secondary',
    }}
  >
    {icon || <ForumOutlinedIcon sx={{ fontSize: 56, mb: 1.5, color: 'primary.light' }} />}
    <Typography variant="h6" sx={{ color: 'text.primary', mb: 0.5 }}>
      {title}
    </Typography>
    <Typography variant="body2">{subtitle}</Typography>
  </Box>
);

export default EmptyState;
