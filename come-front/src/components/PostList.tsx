// src/components/PostList.tsx

import { useState, useEffect, FC } from 'react';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { getPosts, Post } from '../api/post';

const PostList: FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postData = await getPosts();
        setPosts(postData);
      } catch (err) {
        setError('Failed to load posts');
        console.error(err);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Latest Posts
      </Typography>
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <List>
          {posts.length > 0 ? (
            posts.map((post) => (
              <ListItem key={post.id} divider>
                <ListItemText
                  primary={
                    <Link
                      to={`/post/${post.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {post.title}
                    </Link>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="textSecondary">
                        Posted by User #{post.authorId} on{' '}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        {post.content.substring(0, 100)}...
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Typography>No posts available</Typography>
          )}
        </List>
      )}
    </div>
  );
};

export default PostList;
