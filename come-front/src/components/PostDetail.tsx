// src/components/PostDetail.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import Navbar from './Navbar';
import { Post, getPost } from '../api/post';

interface Comment {
  id: number;
  content: string;
  authorId: number;
  createdAt: string;
}

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError('Invalid post ID');
        setLoading(false);
        return;
      }

      try {
        console.log("get post calling... id =", parseInt(id, 10));
        const postData = await getPost(parseInt(id, 10));
        setPost(postData);
        // TODO: fetch comments from backend
        setComments([
          { id: 1, content: "Great post!", authorId: 2, createdAt: "2025-03-09T12:00:00Z" },
        ]);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load post');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    // TODO: comment function
    const newCommentObj: Comment = {
      id: comments.length + 1,
      content: newComment,
      authorId: 1,
      createdAt: new Date().toISOString(),
    };
    setComments([...comments, newCommentObj]);
    setNewComment('');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error">{error || 'Post not found'}</Typography>
      </Container>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {post.title}
            </Typography>
            <Typography variant="body1" component="p" sx={{ mb: 2 }}>
              {post.content}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Posted by User #{post.authorId} on {new Date(post.createdAt).toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        <Button
          variant="outlined"
          onClick={handleBack}
          sx={{ mt: 2, mb: 4 }}
        >
          Back
        </Button>

        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        <List>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <ListItem key={comment.id} divider>
                <ListItemText
                  primary={comment.content}
                  secondary={`User #${comment.authorId} - ${new Date(comment.createdAt).toLocaleString()}`}
                />
              </ListItem>
            ))
          ) : (
            <Typography>No comments yet</Typography>
          )}
        </List>

        <TextField
          label="Add a comment"
          variant="outlined"
          fullWidth
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleCommentSubmit}
          sx={{ mt: 1 }}
          disabled={!newComment.trim()}
        >
          Submit Comment
        </Button>
      </Container>
    </>
  );
};

export default PostDetail;

