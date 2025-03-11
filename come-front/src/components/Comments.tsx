// src/components/Comments.tsx

import React from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
} from '@mui/material';
import { Comment } from '../api/post';

interface CommentsSectionProps {
  comments: Comment[];
  newComment: string;
  disabled?: boolean;
  onCommentChange: (value: string) => void;
  onCommentSubmit: () => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  newComment,
  disabled,
  onCommentChange,
  onCommentSubmit,
}) => {
  return (
    <>
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
        onChange={(e) => onCommentChange(e.target.value)}
        sx={{ mt: 2 }}
        disabled={disabled}
      />
      <Button
        variant="contained"
        onClick={onCommentSubmit}
        sx={{ mt: 1 }}
        disabled={!newComment.trim() || disabled}
      >
        Submit Comment
      </Button>
    </>
  );
};

export default CommentsSection;

