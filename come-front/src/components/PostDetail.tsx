// src/components/PostDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Typography, 
  TextField,
  SvgIcon,
  SvgIconProps,
  IconButton,
  Tooltip, 
} from '@mui/material';
import Navbar from './Navbar';
import Comments from './Comments';
import { Post, Comment, getPost, getPostComments, createComment, deletePost, updatePost, likePost, bookmarkPost } from '../api/post';
import { getProfile, User } from '../api/user';
import { jwtDecode } from 'jwt-decode';

const ThumbUpIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
  </SvgIcon>
);

const BookmarkIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
  </SvgIcon>
);

const ShareIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
  </SvgIcon>
);

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
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
  const isOwnPost = post && currentUserId !== null && currentUserId === post.authorId;
  const canEditOrDelete = token && isOwnPost && currentUser !== null && !currentUser.banned;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Invalid post ID');
        setLoading(false);
        return;
      }

      try {
        const postId = parseInt(id, 10);
        const [postData, commentData] = await Promise.all([
          getPost(postId),
          getPostComments(postId),
        ]);
        
        setPost(postData);
        setLiked(postData.isLiked);
        setBookmarked(postData.isBookmarked);
        setLikesCount(postData.likesCount);
        
        setComments(commentData);
        setEditedTitle(postData.title);
        setEditedContent(postData.content);

        if (token) {
          try {
            const userData = await getProfile();
            setCurrentUser(userData);
          } catch (err: any) {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('The link has been copied to the clipboard!');
    } catch (err) {
      setError('If the sharing fails, please copy the link manually');
    }
  };

  const handleLike = async () => {
    if (!token) return alert('Please log in first');
    if (currentUser?.banned || !post) return;
    
    try {
      const newState = !liked;
      await likePost(post.id, newState);
      setLiked(newState);
      setLikesCount(prev => newState ? prev + 1 : prev - 1);
    } catch (err) {
      setError('The operation failed, please try again');
    }
  };

  const handleBookmark = async () => {
    if (!token) return alert('Please log in first');
    if (currentUser?.banned || !post) return;

    try {
      const newState = !bookmarked;
      await bookmarkPost(post.id, newState);
      setBookmarked(newState);
    } catch (err) {
      setError('The operation failed, please try again');
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

                <div style={{ 
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      marginTop: '8px'
                    }}>
                      <Tooltip title="Like" arrow>
                        <IconButton 
                          onClick={handleLike}
                          disabled={currentUser?.banned}
                          sx={{ 
                            color: liked ? 'error.main' : 'inherit',
                            '&:hover': {
                              backgroundColor: 'rgba(245, 0, 0, 0.04)'
                            }
                          }}
                        >
                          <ThumbUpIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Bookmark" arrow>
                        <IconButton
                          onClick={handleBookmark}
                          disabled={currentUser?.banned}
                          sx={{ 
                            color: bookmarked ? 'primary.main' : 'inherit',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.04)'
                            }
                          }}
                        >
                          <BookmarkIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Share" arrow>
                        <IconButton
                          onClick={handleShare}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                
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