import React from 'react';
import {
  Container,
  Typography,
  Box,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import {
  AccessTime,
  Person,
  ArrowBack,
  Share,
  Bookmark,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { newsAPI } from '../services/api';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: newsData,
    isLoading,
    error,
  } = useQuery(
    ['news', id],
    () => newsAPI.getNewsById(id),
    {
      enabled: !!id,
    }
  );

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: newsData?.data?.title,
          text: newsData?.data?.summary,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading news article: {error.message}
        </Alert>
        <Box mt={2}>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  const news = newsData?.data;

  if (!news) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          News article not found.
        </Alert>
        <Box mt={2}>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Back Button */}
      <Box mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to News
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 4 }}>
        {/* Article Header */}
        <Box mb={3}>
          {/* Categories and Featured Badge */}
          <Box sx={{ mb: 2 }}>
            {news.category && (
              <Chip
                label={news.category.name}
                color="primary"
                variant="outlined"
                sx={{ mr: 1 }}
              />
            )}
            {news.is_featured && (
              <Chip
                label="Featured"
                color="secondary"
                sx={{ mr: 1 }}
              />
            )}
          </Box>

          {/* Title */}
          <Typography variant="h3" component="h1" gutterBottom>
            {news.title}
          </Typography>

          {/* Summary */}
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontWeight: 400, mb: 3 }}
          >
            {news.summary}
          </Typography>

          {/* Meta Information */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              mb: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {format(new Date(news.published_at), 'MMMM dd, yyyy • HH:mm')}
              </Typography>
            </Box>

            {news.source && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Person fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {news.source}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<Share />}
              onClick={handleShare}
              size="small"
            >
              Share
            </Button>
            <Button
              variant="outlined"
              startIcon={<Bookmark />}
              size="small"
            >
              Save
            </Button>
          </Box>

          <Divider />
        </Box>

        {/* Article Image */}
        {news.image && (
          <Box sx={{ mb: 4 }}>
            <img
              src={news.image}
              alt={news.title}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '500px',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          </Box>
        )}

        {/* Article Content */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              fontSize: '1.1rem',
              whiteSpace: 'pre-line',
            }}
          >
            {news.content}
          </Typography>
        </Box>

        {/* Article Footer */}
        <Divider sx={{ mb: 3 }} />
        
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            {news.tags && news.tags.length > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Tags:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {news.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Share />}
              onClick={handleShare}
            >
              Share Article
            </Button>
          </Box>
        </Box>

        {/* External Link */}
        {news.url && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Read Original Article
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default NewsDetail;