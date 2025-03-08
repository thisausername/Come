// src/page/Home.tsx

import { Container } from '@mui/material';
import { Grid2 } from '@mui/material';
import Navbar from '../components/Navbar';
import PostList from '../components/PostList';

const Home: React.FC = () => {
  return (
    <>
      <Navbar />
      <Container sx={{ marginTop: 4 }}>
        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, md: 8 }}>
            <PostList />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}></Grid2>
        </Grid2>
      </Container>
    </>
  );
};

export default Home;

