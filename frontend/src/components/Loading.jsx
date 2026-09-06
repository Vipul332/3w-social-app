import { Box, CircularProgress, Typography } from '@mui/material';

const Loading = ({ message = 'Loading…', size = 36, minHeight = 200 }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1.5,
      minHeight,
      color: 'text.secondary',
    }}
  >
    <CircularProgress size={size} thickness={4} />
    <Typography variant="body2">{message}</Typography>
  </Box>
);

export default Loading;
