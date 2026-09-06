import { useCallback, useEffect, useState } from 'react';
import { Box, Container, Button } from '@mui/material';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import * as postService from '../services/postService';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeed = useCallback(async (pageToLoad = 1, append = false) => {
    append ? setIsLoadingMore(true) : setIsLoading(true);
    setError(null);
    try {
      const data = await postService.getFeed({ page: pageToLoad, limit: 10 });
      setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));
      setHasNextPage(data.hasNextPage);
      setPage(data.page);
    } catch (err) {
      setError(err.message);
    } finally {
      append ? setIsLoadingMore(false) : setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(1, false);
  }, [fetchFeed]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <CreatePost onPostCreated={handlePostCreated} />

        {isLoading && <Loading message="Loading your feed…" />}

        {!isLoading && error && <ErrorMessage message={error} onRetry={() => fetchFeed(1, false)} />}

        {!isLoading && !error && posts.length === 0 && (
          <EmptyState
            title="No posts yet"
            subtitle="Share the first post and kick off the conversation."
          />
        )}

        {!isLoading &&
          !error &&
          posts.map((post) => <PostCard key={post._id} post={post} onUpdate={handlePostUpdate} />)}

        {!isLoading && !error && hasNextPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 3 }}>
            <Button
              variant="outlined"
              onClick={() => fetchFeed(page + 1, true)}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading…' : 'Load more'}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Home;
