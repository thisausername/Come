// src/page/Home.tsx

import { Container, Box, Typography, Card, CardContent } from '@mui/material';
import { Grid2 } from '@mui/material';
import Navbar from '../components/Navbar';
import PostList from '../components/PostList';

const Home: React.FC = () => {
  return (
    <>
      <Navbar />
      <Container sx={{ marginTop: 4, marginBottom: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom>
            Welcome to the Forum
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Share your thoughts and connect with others!
          </Typography>
        </Box>

        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, md: 8 }}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <PostList />
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 4 }}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Trending Topics
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li">#React</Typography>
                  <Typography component="li">#TypeScript</Typography>
                  <Typography component="li">#ForumFun</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>
      </Container>
    </>
  );
};

export default Home;
