import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Avatar,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { clearCurrentRecipe } from '../features/recipes/recipeSlice';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleGenerateClick = () => {
    dispatch(clearCurrentRecipe());
    navigate('/generate');
  };

  return (
    <AppBar 
      position="static" 
      elevation={0} 
      sx={{ 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        borderRadius: 0
      }}
    >
      <Container maxWidth="xl" sx={{ borderRadius: 0 }}>
        <Toolbar disableGutters sx={{ borderRadius: 0 }}>
          <RestaurantMenuIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              mr: 2, 
              cursor: 'pointer',
              fontWeight: 700,
              letterSpacing: '.1rem',
              display: 'flex',
              alignItems: 'center'
            }}
            onClick={() => navigate('/')}
          >
            FRESH RECIPES
          </Typography>

          {user && (
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button 
                color="inherit"
                component={Link}
                to="/generate"
                startIcon={<AddCircleOutlineIcon />}
                sx={{ 
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Generate Recipe
              </Button>
              <Button 
                color="inherit"
                component={Link}
                to="/saved-recipes"
                startIcon={<BookmarkIcon />}
                sx={{ 
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Saved Recipes
              </Button>
            </Stack>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Mobile menu for recipe features */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 2 }}>
                <Tooltip title="Generate Recipe">
                  <IconButton 
                    color="inherit" 
                    onClick={handleGenerateClick}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Saved Recipes">
                  <IconButton 
                    color="inherit" 
                    onClick={() => navigate('/saved-recipes')}
                    size="small"
                  >
                    <BookmarkIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Tooltip title={user.name}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'secondary.main',
                    width: 40,
                    height: 40,
                    mr: 1,
                    fontSize: '1.2rem',
                    borderRadius: 1
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
              <Typography variant="body1" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                {user.name}
              </Typography>
              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={handleLogout}
                sx={{ 
                  borderRadius: 1,
                  px: 3,
                  py: 1,
                  borderColor: 'white',
                  '&:hover': {
                    borderRadius: 1,
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Box>
              <Button 
                color="inherit" 
                onClick={() => navigate('/login')}
                sx={{ 
                  mr: 1, 
                  borderRadius: 1,
                  '&:hover': {
                    borderRadius: 1
                  }
                }}
                startIcon={<AccountCircleIcon />}
              >
                Login
              </Button>
              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={() => navigate('/register')}
                sx={{ 
                  borderRadius: 1,
                  px: 2,
                  borderColor: 'white',
                  '&:hover': {
                    borderRadius: 1,
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 