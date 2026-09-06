import { useRef, useState } from 'react';
import { Card, CardContent, TextField, Box, Avatar, Button, IconButton, Chip } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import * as postService from '../services/postService';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { getInitials } from '../utils/formatters';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // keep in sync with backend MAX_UPLOAD_SIZE

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      showToast('Image must be smaller than 5MB.', 'error');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setContent('');
    clearImage();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedContent = content.trim();

    if (!trimmedContent && !imageFile) {
      showToast('Please enter text or select an image.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { post } = await postService.createPost({ content: trimmedContent, imageFile });
      onPostCreated(post);
      resetForm();
      showToast('Post shared successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
      component="form"
      onSubmit={handleSubmit}
    >
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            {getInitials(user.username)}
          </Avatar>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={8}
            placeholder={`What's on your mind, ${user.username}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            inputProps={{ maxLength: 2000 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.default',
                '& fieldset': { border: 'none' },
              },
            }}
          />
        </Box>

        {imagePreview && (
          <Box sx={{ position: 'relative', mt: 1.5, ml: { sm: 7 } }}>
            <Box
              component="img"
              src={imagePreview}
              alt="Selected preview"
              sx={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 2 }}
            />
            <IconButton
              size="small"
              onClick={clearImage}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.55)',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 2,
            ml: { sm: 7 },
          }}
        >
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageSelect}
            />
            <Chip
              icon={<ImageOutlinedIcon />}
              label="Photo"
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={isSubmitting || (!content.trim() && !imageFile)}
          >
            {isSubmitting ? 'Posting…' : 'Post'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
