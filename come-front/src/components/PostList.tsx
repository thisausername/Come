// src/components/PostList.tsx

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Pagination,
  Avatar,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import { getPostsPaginated, Post } from "../api/post";
import { getUsersBatch } from "../api/user";

const PostList = () => {
  const [posts, setPosts] = useState<(Post & { authorUsername: string; avatar: string })[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchPostsAndUsers = async (currentPage: number) => {
    try {
      const postData = await getPostsPaginated(currentPage, pageSize);
      const postsList: Post[] = postData.posts;
      setTotal(postData.total);

      const authorIds = [...new Set(postsList.map((post) => post.authorId))];
      const usersMap = await getUsersBatch(authorIds);

      const postsPreview = postsList.map((post) => ({
        ...post,
        authorUsername: usersMap[post.authorId]?.username || "Unknown",
        avatar: usersMap[post.authorId]?.avatar || "",
      }));

      setPosts(postsPreview);
    } catch (error) {
      console.error("Failed to fetch posts or users:", error);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Unknown";
      }
      const userLocale = navigator.language || 'en-US';
      return date.toLocaleString(userLocale, { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return "Unknown";
    }
  };

  useEffect(() => {
    fetchPostsAndUsers(page);
  }, [page]);

  const handlePageChange = (value: number) => {
    setPage(value);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Posts</Typography>
      <List>
        {posts.map((post) => (
          <ListItem
            key={post.id}
            component={Link}
            to={`/post/${post.id}`}
            sx={{
              textDecoration: "none",
              "&:hover": { bgcolor: "#f5f5f5" },
              display: "flex",
              alignItems: "center",
              py: 2,
            }}
          >
            <Avatar
              src={post.avatar ? `/${post.avatar}` : undefined}
              sx={{ width: 40, height: 40, mr: 2 }}
            >
              {!post.avatar && post.authorUsername[0].toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <ListItemText
                primary={post.title}
                secondary={post.content.substring(0, 100) + (post.content.length > 100 ? "..." : "")}
                slotProps={{
                  primary: { variant: "h6", color: "primary" },
                  secondary: { color: "text.secondary" },
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2, minWidth: 100 }}>
              {`last edited ${formatDate(post.updatedAt)}`}
            </Typography>
          </ListItem>
        ))}
      </List>
      {total > 0 && (
        <Pagination
          count={Math.ceil(total / pageSize)}
          page={page}
          onChange={(_, value) => handlePageChange(value)}
          color="primary"
          sx={{ mt: 2, display: "flex", justifyContent: "center" }}
        />
      )}
    </Container>
  );
};

export default PostList;

