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
import { Post, Comment, getPost, getPostComments } from '../api/post';
import { createComment } from '../api/post';

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
        const postId = parseInt(id, 10)
        const postData = await getPost(postId);
        const commentData = await getPostComments(postId)
        setPost(postData);
        setComments(commentData);
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

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !id) return;
    try {
      const postId = parseInt(id, 10);
      const comment = await createComment(postId, newComment);
      setComments([...comments, comment]);
      setNewComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit comment');
      console.error(err)
    }
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

