// src/components/PostDetail.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Container, Typography, TextField } from '@mui/material';
import Navbar from './Navbar';
import Comments from './Comments';
import { Post, Comment, getPost, getPostComments, createComment, deletePost, updatePost } from '../api/post';
import { getProfile, User } from '../api/user';
import { jwtDecode } from 'jwt-decode';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const token = localStorage.getItem('token');
  const currentUserId = token ? jwtDecode<{ user_id: number }>(token).user_id : null;
  const isOwnPost = post && currentUserId === post.authorId;
  const canEditOrDelete = isOwnPost && currentUser && !currentUser.banned;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Invalid post ID');
        setLoading(false);
        return;
      }

      try {
        const postId = parseInt(id, 10);
        const [postData, commentData, userData] = await Promise.all([
          getPost(postId),
          getPostComments(postId),
          getProfile(),
        ]);
        setPost(postData);
        setComments(commentData);
        setCurrentUser(userData);
        setEditedTitle(postData.title);
        setEditedContent(postData.content);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBack = () => navigate(-1);

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !id || (currentUser && currentUser.banned)) return;
    try {
      const postId = parseInt(id, 10);
      const comment = await createComment(postId, newComment);
      setComments([...comments, comment]);
      setNewComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit comment');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!id || !canEditOrDelete || !window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const postId = parseInt(id, 10);
      await deletePost(postId);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to delete post');
      console.error(err);
    }
  };

  const handleEdit = () => {
    if (canEditOrDelete) setIsEditing(true);
  };

  const handleSave = async () => {
    if (!id || !canEditOrDelete) return;
    try {
      const postId = parseInt(id, 10);
      const updatedPost = await updatePost(postId, { title: editedTitle, content: editedContent });
      setPost(updatedPost);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update post');
      console.error(err);
    }
  };

  if (loading) {
    return <Container maxWidth="md" sx={{ mt: 4 }}><Typography>Loading...</Typography></Container>;
  }

  if (error || !post) {
    return <Container maxWidth="md" sx={{ mt: 4 }}><Typography color="error">{error || 'Post not found'}</Typography></Container>;
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            {isEditing && canEditOrDelete ? (
              <>
                <TextField fullWidth value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} sx={{ mb: 2 }} />
                <TextField fullWidth multiline rows={4} value={editedContent} onChange={(e) => setEditedContent(e.target.value)} sx={{ mb: 2 }} />
                <Button variant="contained" onClick={handleSave} sx={{ mr: 1 }}>Save</Button>
                <Button variant="outlined" onClick={() => setIsEditing(false)}>Cancel</Button>
              </>
            ) : (
              <>
                <Typography variant="h4" gutterBottom>{post.title}</Typography>
                <Typography variant="body1" component="p" sx={{ mb: 2 }}>{post.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Posted by {post.authorId} on {new Date(post.createdAt).toLocaleString()}
                </Typography>
                {canEditOrDelete && (
                  <div>
                    <Button variant="contained" onClick={handleEdit} sx={{ mt: 2, mr: 1 }}>Edit</Button>
                    <Button variant="contained" color="error" onClick={handleDelete} sx={{ mt: 2 }}>Delete</Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Button variant="outlined" onClick={handleBack} sx={{ mt: 2, mb: 4 }}>Back</Button>

        <Comments
          comments={comments}
          newComment={newComment}
          onCommentChange={setNewComment}
          onCommentSubmit={handleCommentSubmit}
          disabled={currentUser?.banned}
        />
      </Container>
    </>
  );
};

export default PostDetail;

