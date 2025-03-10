// src/components/PostList.tsx

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Pagination,
} from "@mui/material";
import { Link } from "react-router-dom";
import { getPostsPaginated, Post } from "../api/post";


const PostList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchPosts = async (currentPage: number) => {
    try {
      const data = await getPostsPaginated(currentPage, pageSize);
      setPosts(data.posts);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handlePageChange = (value: number) => {
    setPage(value);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Latest</Typography>
      <List>
        {posts.map((post) => (
          <ListItem
            key={post.id}
            component={Link}
            to={`/post/${post.id}`}
            sx={{
              textDecoration: "none",
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >

            <ListItemText
              primary={post.title}
              secondary={post.content}
              slotProps={{
                primary: { variant: "h6", color: "primary" },
                secondary: { color: "text.secondary" },
              }}
            />

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

