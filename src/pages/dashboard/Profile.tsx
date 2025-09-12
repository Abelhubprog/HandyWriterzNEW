import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Avatar, 
  Paper, 
  Tabs, 
  Tab, 
  Divider, 
  Alert, 
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Person as PersonIcon, 
  Security as SecurityIcon, 
  Notifications as NotificationsIcon, 
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { cloudflareDb } from '@/lib/cloudflare';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useUser } from '@clerk/clerk-react';
import { d1Client } from '@/lib/d1Client';
import { CloudflareR2Client } from '@/lib/cloudflareR2Client';

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  email: string;
  created_at: string;
  phone?: string;
  bio?: string;
  notification_preferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const Profile: React.FC = () => {
  const { user, session, updatePassword, signInWithMagicLink, logout } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    push: true,
    sms: false
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Don't redirect, let the component handle the UI for not logged in
    } else if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) return;

      const { data, error } = await d1Client
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFullName(data.full_name || '');
      setBio(data.bio || '');
      setPhone(data.phone || '');
      
      if (data.notification_preferences) {
        setNotificationPreferences(data.notification_preferences);
      }
      
    } catch (error: any) {
      setError('Failed to load profile data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setUpdating(true);
      setError(null);

      if (!user) return;

      // Upload avatar if changed
      let avatarUrl = profile?.avatar_url;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        // Create R2 client instance
        const r2Client = new CloudflareR2Client();
        
        // Upload to Cloudflare R2
        try {
          const uploadResult = await r2Client.uploadFile(avatarFile, filePath);
          avatarUrl = r2Client.getPublicUrl(filePath);
        } catch (uploadError) {
          throw new Error(`Failed to upload avatar: ${uploadError}`);
        }
      }

      const updates = {
        id: user?.id,
        full_name: fullName,
        bio,
        phone,
        avatar_url: avatarUrl,
        notification_preferences: notificationPreferences,
        updated_at: new Date().toISOString(),
      };

      const { error } = await d1Client
        .from('profiles')
        .upsert(updates);  

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully!');
      
    } catch (error: any) {
      toast.error('Failed to update profile. Please try again.');
      setError('Failed to update profile. Please try again later.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setUpdating(true);
      setError(null);

      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }

      if (newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }

      // For security, we require the current password
      if (!currentPassword) {
        toast.error('Please enter your current password');
        return;
      }

      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        toast.error('Current password is incorrect');
        return;
      }

      const { error } = await updatePassword(newPassword);

      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully!');
      
    } catch (error: any) {
      toast.error('Failed to update password. Please try again.');
      setError('Failed to update password. Please try again later.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendMagicLink = async () => {
    try {
      setUpdating(true);
      setError(null);

      if (!user?.email) return;

      const { error } = await signInWithMagicLink(user?.email);

      if (error) throw error;

      toast.success('Magic link sent to your email!');
      
    } catch (error: any) {
      toast.error('Failed to send magic link. Please try again.');
      setError('Failed to send magic link. Please try again later.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setUpdating(true);
      setError(null);

      if (!user) return;

      // Delete user data from profiles table
      const { error: profileError } = await d1Client
        .from('profiles')
        .delete()
        .eq('id', user?.id);

      if (profileError) throw profileError;
      
      // Note: User authentication is now handled by Clerk
      // We don't need to delete from Supabase auth, just remove the user's profile data
      // Additional cleanup for user assets in R2 could be added here if needed

      toast.success('Your account has been deleted');
      await logout();
      navigate('/');
      
    } catch (error: any) {
      toast.error('Failed to delete account. Please try again.');
      setError('Failed to delete account. Please try again later.');
    } finally {
      setUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoaded && !isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Profile - HandyWriterz</title>
        </Helmet>
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <div className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-orange-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-orange-800">Authentication required</h3>
              <p className="text-orange-700 mt-1">You need to be logged in to view this page.</p>
              <div className="mt-3">
                <button 
                  onClick={() => navigate('/sign-in')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Helmet>
        <title>My Profile | HandyWriterz</title>
        <meta name="description" content="Manage your HandyWriterz profile and account settings" />
      </Helmet>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Grid container gap="4">
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                <Box position="relative">
                  <Avatar 
                    src={avatarPreview || profile?.avatar_url} 
                    alt={fullName || (user?.email || 'User')} 
                    sx={{ width: 120, height: 120, mb: 2 }}
                  />
                  <IconButton 
                    component="label"
                    sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      right: 0, 
                      backgroundColor: 'primary.main',
                      '&:hover': { backgroundColor: 'primary.dark' },
                      color: 'white'
                    }}
                  >
                    <PhotoCameraIcon />
                    <VisuallyHiddenInput type="file" accept="image/*" onChange={handleAvatarChange} />
                  </IconButton>
                </Box>
                
                <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                  {fullName || 'Your Name'}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user?.email || 'No email available'}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  {profile?.bio || 'No bio added yet'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ width: '100%' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="profile tabs"
                variant="fullWidth"
              >
                <Tab icon={<PersonIcon />} label="Profile" id="profile-tab-0" aria-controls="profile-tabpanel-0" />
                <Tab icon={<SecurityIcon />} label="Security" id="profile-tab-1" aria-controls="profile-tabpanel-1" />
                <Tab icon={<NotificationsIcon />} label="Notifications" id="profile-tab-2" aria-controls="profile-tabpanel-2" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Box component="form" noValidate>
                  <Grid container gap="3">
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={user?.email || 'No email available'}
                        disabled
                        variant="outlined"
                        helperText="Email cannot be changed"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        multiline
                        rows={4}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={updateProfile}
                        disabled={updating}
                        startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
                      >
                        {updating ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box component="form" noValidate>
                  <Typography variant="h6" gutterBottom>
                    Change Password
                  </Typography>
                  <Grid container gap="3">
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handlePasswordChange}
                        disabled={updating}
                        startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
                      >
                        {updating ? 'Updating...' : 'Update Password'}
                      </Button>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4 }} />

                  <Typography variant="h6" gutterBottom>
                    Account Actions
                  </Typography>
                  <Grid container gap="3">
                    <Grid item xs={12} sm={6}>
                      <Button 
                        fullWidth
                        variant="outlined" 
                        color="primary" 
                        onClick={handleSendMagicLink}
                        disabled={updating}
                      >
                        Send Magic Link
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button 
                        fullWidth
                        variant="outlined" 
                        color="error" 
                        onClick={() => setShowDeleteConfirm(true)}
                        startIcon={<DeleteIcon />}
                      >
                        Delete Account
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Notification Preferences
                </Typography>
                <Grid container gap="3">
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" py={1}>
                      <Typography>Email Notifications</Typography>
                      <Button 
                        variant={notificationPreferences.email ? "contained" : "outlined"}
                        color={notificationPreferences.email ? "primary" : "inherit"}
                        onClick={() => setNotificationPreferences(prev => ({
                          ...prev,
                          email: !prev.email
                        }))}
                      >
                        {notificationPreferences.email ? 'Enabled' : 'Disabled'}
                      </Button>
                    </Box>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" py={1}>
                      <Typography>Push Notifications</Typography>
                      <Button 
                        variant={notificationPreferences.push ? "contained" : "outlined"}
                        color={notificationPreferences.push ? "primary" : "inherit"}
                        onClick={() => setNotificationPreferences(prev => ({
                          ...prev,
                          push: !prev.push
                        }))}
                      >
                        {notificationPreferences.push ? 'Enabled' : 'Disabled'}
                      </Button>
                    </Box>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" py={1}>
                      <Typography>SMS Notifications</Typography>
                      <Button 
                        variant={notificationPreferences.sms ? "contained" : "outlined"}
                        color={notificationPreferences.sms ? "primary" : "inherit"}
                        onClick={() => setNotificationPreferences(prev => ({
                          ...prev,
                          sms: !prev.sms
                        }))}
                      >
                        {notificationPreferences.sms ? 'Enabled' : 'Disabled'}
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={updateProfile}
                      disabled={updating}
                      startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                      {updating ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </Grid>
                </Grid>
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>

        {/* Delete Account Confirmation Dialog */}
        <Dialog
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
        >
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteConfirm(false)} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteAccount} 
              color="error" 
              disabled={updating}
              startIcon={updating ? <CircularProgress size={20} /> : <DeleteIcon />}
            >
              {updating ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ErrorBoundary>
  );
};

export default Profile; 