// src/components/CreatePost.tsx

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import Navbar from './Navbar';
import { createPost } from '../api/user';
import { Link } from 'react-router-dom';

const CreatePost: React.FC<{ onPostCreated?: () => void }> = ({ onPostCreated }) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const MAX_TITLE_LENGTH = 50;
  const MIN_CONTENT_LENGTH = 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.length > MAX_TITLE_LENGTH) {
      setError(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
      return;
    }
    if (content.length < MIN_CONTENT_LENGTH) {
      setError(`Content must be at least ${MIN_CONTENT_LENGTH} characters`);
      return;
    }

    setLoading(true);
    try {
      await createPost({ title, content });
      setTitle('');
      setContent('');
      if (onPostCreated) onPostCreated();
    } catch (err) {
      setError('Failed to create post');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
              Create a New Post
            </Typography>
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                  required
                  slotProps={{
                    htmlInput: { maxLength: MAX_TITLE_LENGTH },
                  }}
                  variant="outlined"
                  placeholder="Enter your post title"
                  helperText={`${title.length}/${MAX_TITLE_LENGTH} characters`}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <TextField
                  label="Content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  fullWidth
                  required
                  multiline
                  rows={6}
                  variant="outlined"
                  placeholder="Share your thoughts..."
                  helperText={`${content.length} characters (minimum ${MIN_CONTENT_LENGTH})`}
                />
              </Box>
              {error && (
                <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
                  {error}
                </Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ px: 4, py: 1, textTransform: 'none', borderRadius: 2 }}
                >
                  {loading ? 'Posting...' : 'Submit'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  component={Link}
                  to="/"
                  sx={{ px: 4, py: 1, textTransform: 'none', borderRadius: 2 }}
                >
                  Cancel
                </Button>
              </Box>
            </form>
            
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default CreatePost;

