import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search, AccessTime, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { newsAPI, categoriesAPI } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    period: '',
    featured: '',
    page: 1,
  });

  // Fetch news with filters
  const {
    data: newsData,
    isLoading: newsLoading,
    error: newsError,
    refetch: refetchNews,
  } = useQuery(
    ['news', filters],
    () => newsAPI.getNews(filters),
    {
      keepPreviousData: true,
    }
  );

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
  } = useQuery('categories', categoriesAPI.getCategories);

  // Fetch featured news
  const {
    data: featuredData,
    isLoading: featuredLoading,
  } = useQuery('featured-news', newsAPI.getFeaturedNews);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field !== 'page' ? 1 : value, // Reset page when other filters change
    }));
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      refetchNews();
    }
  };

  const NewsCard = ({ news }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {news.image && (
        <CardMedia
          component="img"
          height="200"
          image={news.image}
          alt={news.title}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 1 }}>
          {news.category && (
            <Chip
              label={news.category.name}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          {news.is_featured && (
            <Chip
              label="Featured"
              size="small"
              color="secondary"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        
        <Typography gutterBottom variant="h6" component="h2">
          {news.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {news.summary}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {format(new Date(news.published_at), 'MMM dd, yyyy')}
            </Typography>
          </Box>
          
          {news.source && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Person fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {news.source}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          onClick={() => navigate(`/news/${news.id}`)}
        >
          Read More
        </Button>
      </CardActions>
    </Card>
  );

  if (newsError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading news: {newsError.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Latest News
      </Typography>
      
      {/* Featured News Section */}
      {!featuredLoading && featuredData?.data?.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Featured Stories
          </Typography>
          <Grid container spacing={3}>
            {featuredData.data.slice(0, 3).map((news) => (
              <Grid item xs={12} md={4} key={news.id}>
                <NewsCard news={news} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search news..."
              variant="outlined"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyPress={handleSearch}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {Array.isArray(categoriesData?.data) ? categoriesData.data.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                )) : []}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Period</InputLabel>
              <Select
                value={filters.period}
                label="Period"
                onChange={(e) => handleFilterChange('period', e.target.value)}
              >
                <MenuItem value="">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.featured}
                label="Type"
                onChange={(e) => handleFilterChange('featured', e.target.value)}
              >
                <MenuItem value="">All News</MenuItem>
                <MenuItem value="true">Featured Only</MenuItem>
                <MenuItem value="false">Regular News</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={refetchNews}
              sx={{ height: '56px' }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* News Grid */}
      {newsLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {newsData?.data?.results?.map((news) => (
              <Grid item xs={12} sm={6} md={4} key={news.id}>
                <NewsCard news={news} />
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {newsData?.data?.count > 0 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={Math.ceil(newsData.data.count / 12)}
                page={filters.page}
                onChange={(event, value) => handleFilterChange('page', value)}
                color="primary"
              />
            </Box>
          )}
          
          {newsData?.data?.results?.length === 0 && (
            <Box textAlign="center" my={4}>
              <Typography variant="h6" color="text.secondary">
                No news found matching your criteria.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Home;