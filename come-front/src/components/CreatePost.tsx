// src/components/CreatePost.tsx

import { useState } from 'react';
import { Button, TextField, Typography, Box } from '@mui/material';
import { createPost } from '../api/post';

const CreatePost: React.FC<{ onPostCreated?: () => void }> = ({ onPostCreated }) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
    <Box sx={{ padding: 2, maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h6" gutterBottom>
        Create a New Post
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          required
          multiline
          rows={4}
          margin="normal"
        />
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Posting...' : 'Submit'}
        </Button>
      </form>
    </Box>
  );
};

export default CreatePost;

