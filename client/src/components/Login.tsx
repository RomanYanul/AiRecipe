import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login, reset } from '../features/auth/authSlice';

// Memoized form field component for better performance
const FormField = React.memo(({ 
  id, 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  helperText, 
  icon,
  autoComplete
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: boolean;
  helperText: string;
  icon: React.ReactNode;
  autoComplete?: string;
}) => (
  <TextField
    margin="normal"
    required
    fullWidth
    id={id}
    label={label}
    name={name}
    type={type}
    autoComplete={autoComplete}
    value={value}
    onChange={onChange}
    error={error}
    helperText={helperText}
    InputProps={{
      startAdornment: icon,
    }}
    sx={{ mb: 2 }}
  />
));

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user, isLoading, isError, isSuccess, message } = useAppSelector(
    (state) => state.auth
  );

  // Optimize navigation with useCallback
  const navigateToRegister = useCallback(() => {
    navigate('/register');
  }, [navigate]);

  // Memoize form validation to prevent unnecessary recalculations
  const validateForm = useCallback((): boolean => {
    let valid = true;
    const errors = {
      email: '',
      password: '',
    };

    if (!email) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      valid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  }, [email, password]);

  // Optimize form field handling
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  // Optimize form submission
  const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      dispatch(login({ email, password }));
    }
  }, [dispatch, email, password, validateForm]);

  // Cleanup effect
  useEffect(() => {
    // Only navigate if user actually changed
    if (isSuccess || user) {
      navigate('/');
    }

    return () => {
      dispatch(reset());
    };
  }, [user, isSuccess, navigate, dispatch]);

  // Logo section is memoized to prevent re-renders
  const LogoSection = useMemo(() => (
    <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 3 }}>
      <RestaurantMenuIcon sx={{ color: 'primary.main', fontSize: 40, mr: 1 }} />
      <Typography variant="h4" fontWeight="bold" color="primary.main">
        Fresh Recipes
      </Typography>
    </Box>
  ), []);

  // Memoize the side panel to prevent re-renders
  const SidePanel = useMemo(() => (
    <Grid 
      item 
      xs={12} 
      md={5} 
      sx={{ 
        display: { xs: 'none', md: 'block' },
        position: 'relative',
        overflow: 'hidden',
        minHeight: 400,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          padding: 4,
        }}
      >
        <RestaurantMenuIcon sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
          Fresh Recipes
        </Typography>
        <Typography variant="body1" align="center">
          Sign in to discover delicious recipes tailored just for you
        </Typography>
      </Box>
    </Grid>
  ), []);

  // Email icon component is memoized
  const emailIcon = useMemo(() => 
    <EmailIcon color="primary" sx={{ mr: 1, opacity: 0.7 }} />, 
  []);

  // Password icon component is memoized
  const passwordIcon = useMemo(() => 
    <LockIcon color="primary" sx={{ mr: 1, opacity: 0.7 }} />, 
  []);

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        }}
      >
        <Grid container>
          {SidePanel}
          
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              {LogoSection}
              
              <Typography component="h1" variant="h5" fontWeight="bold" gutterBottom>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please sign in to your account
              </Typography>

              {isError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {message}
                </Alert>
              )}

              <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
                <FormField
                  id="email"
                  label="Email Address"
                  name="email"
                  value={email}
                  onChange={onChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  icon={emailIcon}
                  autoComplete="email"
                />
                
                <FormField
                  id="password"
                  label="Password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={onChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  icon={passwordIcon}
                  autoComplete="current-password"
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{ 
                    mt: 2, 
                    mb: 3, 
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>
                
                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>
                
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Don't have an account?
                  </Typography>
                  <Button
                    onClick={navigateToRegister}
                    variant="outlined"
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Create Account
                  </Button>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default React.memo(Login); 