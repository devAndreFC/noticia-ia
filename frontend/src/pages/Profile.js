import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Divider,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  Person,
  Settings,
  Notifications,
  Category,
  Save,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, categoriesAPI } from '../services/api';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [alerts, setAlerts] = useState({});

  // Fetch user preferences
  const {
    data: preferencesData,
    isLoading: preferencesLoading,
  } = useQuery('user-preferences', userAPI.getPreferences);

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
  } = useQuery('categories', categoriesAPI.getCategories);

  // Fetch user stats
  const {
    data: statsData,
    isLoading: statsLoading,
  } = useQuery('user-stats', userAPI.getStats);

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (data) => updateProfile(data),
    {
      onSuccess: () => {
        setAlerts({ profile: { type: 'success', message: 'Profile updated successfully!' } });
        queryClient.invalidateQueries('user-preferences');
      },
      onError: (error) => {
        setAlerts({ profile: { type: 'error', message: 'Failed to update profile' } });
      },
    }
  );

  // Update preferences mutation
  const updatePreferencesMutation = useMutation(
    (data) => userAPI.updatePreferences(data),
    {
      onSuccess: () => {
        setAlerts({ preferences: { type: 'success', message: 'Preferences updated successfully!' } });
        queryClient.invalidateQueries('user-preferences');
      },
      onError: (error) => {
        setAlerts({ preferences: { type: 'error', message: 'Failed to update preferences' } });
      },
    }
  );

  // Change password mutation
  const changePasswordMutation = useMutation(
    (data) => userAPI.changePassword(data),
    {
      onSuccess: () => {
        setAlerts({ password: { type: 'success', message: 'Password changed successfully!' } });
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      },
      onError: (error) => {
        setAlerts({ password: { type: 'error', message: 'Failed to change password' } });
      },
    }
  );

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setAlerts({ password: { type: 'error', message: 'Passwords do not match' } });
      return;
    }
    changePasswordMutation.mutate({
      old_password: passwordData.old_password,
      new_password: passwordData.new_password,
    });
  };

  const handlePreferenceChange = (field, value) => {
    const updatedPreferences = {
      ...preferencesData?.data,
      [field]: value,
    };
    updatePreferencesMutation.mutate(updatedPreferences);
  };

  const handleCategoryToggle = (categoryId) => {
    const currentCategories = preferencesData?.data?.preferred_categories || [];
    const updatedCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId];
    
    handlePreferenceChange('preferred_categories', updatedCategories);
  };

  const TabButton = ({ id, label, icon }) => (
    <Button
      variant={activeTab === id ? 'contained' : 'outlined'}
      startIcon={icon}
      onClick={() => setActiveTab(id)}
      sx={{ mr: 1, mb: 1 }}
    >
      {label}
    </Button>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile Settings
      </Typography>

      {/* Tab Navigation */}
      <Box sx={{ mb: 3 }}>
        <TabButton id="profile" label="Profile" icon={<Person />} />
        <TabButton id="preferences" label="Preferences" icon={<Settings />} />
        <TabButton id="notifications" label="Notifications" icon={<Notifications />} />
        <TabButton id="stats" label="Statistics" icon={<Category />} />
      </Box>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              
              {alerts.profile && (
                <Alert severity={alerts.profile.type} sx={{ mb: 2 }}>
                  {alerts.profile.message}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleProfileSubmit}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  margin="normal"
                  disabled
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  sx={{ mt: 2 }}
                  disabled={updateProfileMutation.isLoading}
                >
                  {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              
              {alerts.password && (
                <Alert severity={alerts.password.type} sx={{ mb: 2 }}>
                  {alerts.password.message}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handlePasswordSubmit}>
                <TextField
                  fullWidth
                  type="password"
                  label="Current Password"
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, old_password: e.target.value }))}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  margin="normal"
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  sx={{ mt: 2 }}
                  disabled={changePasswordMutation.isLoading}
                >
                  {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Content Preferences
              </Typography>
              
              {alerts.preferences && (
                <Alert severity={alerts.preferences.type} sx={{ mb: 2 }}>
                  {alerts.preferences.message}
                </Alert>
              )}
              
              {!preferencesLoading && preferencesData?.data && (
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferencesData.data.show_featured_only || false}
                        onChange={(e) => handlePreferenceChange('show_featured_only', e.target.checked)}
                      />
                    }
                    label="Show only featured news"
                  />
                  
                  <TextField
                    fullWidth
                    type="number"
                    label="News per page"
                    value={preferencesData.data.max_news_per_page || 12}
                    onChange={(e) => handlePreferenceChange('max_news_per_page', parseInt(e.target.value))}
                    margin="normal"
                    inputProps={{ min: 6, max: 50 }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Preferred Categories
              </Typography>
              
              {categoriesLoading ? (
                <CircularProgress />
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {categoriesData?.data?.map((category) => (
                    <Chip
                      key={category.id}
                      label={category.name}
                      onClick={() => handleCategoryToggle(category.id)}
                      color={preferencesData?.data?.preferred_categories?.includes(category.id) ? 'primary' : 'default'}
                      variant={preferencesData?.data?.preferred_categories?.includes(category.id) ? 'filled' : 'outlined'}
                      clickable
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notification Settings
          </Typography>
          
          {!preferencesLoading && preferencesData?.data && (
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferencesData.data.email_notifications || false}
                    onChange={(e) => handlePreferenceChange('email_notifications', e.target.checked)}
                  />
                }
                label="Email notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={preferencesData.data.daily_digest || false}
                    onChange={(e) => handlePreferenceChange('daily_digest', e.target.checked)}
                  />
                }
                label="Daily digest"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={preferencesData.data.weekly_digest || false}
                    onChange={(e) => handlePreferenceChange('weekly_digest', e.target.checked)}
                  />
                }
                label="Weekly digest"
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <Grid container spacing={3}>
          {statsLoading ? (
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center">
                <CircularProgress />
              </Box>
            </Grid>
          ) : (
            statsData?.data && Object.entries(statsData.data).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={3} key={key}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      {key.replace('_', ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="h4">
                      {value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Container>
  );
};

export default Profile;