import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { getRecipes, setCurrentRecipe, deleteRecipe, clearCurrentRecipe } from '../features/recipes/recipeSlice';
import { Recipe } from '../services/openai';
import DeleteRecipeModal from './DeleteRecipeModal';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { recipes, isLoading } = useAppSelector((state) => state.recipes);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  useEffect(() => {
    // Fetch recipes when component mounts and user is logged in
    if (user) {
      dispatch(getRecipes());
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleGenerateRecipe = () => {
    // Clear the current recipe before navigating to generate page
    dispatch(clearCurrentRecipe());
    navigate('/generate');
  };

  const handleViewRecipe = (recipe: Recipe) => {
    if (recipe) {
      dispatch(setCurrentRecipe(recipe));
      navigate('/recipe');
    }
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setRecipeToDelete(null);
  };

  const handleViewAllRecipes = () => {
    navigate('/saved-recipes');
  };

  // Get the 3 most recent recipes
  const recentRecipes = [...recipes].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  }).slice(0, 3);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {user ? (
        // Logged in view
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              backgroundImage: 'linear-gradient(to right, #4caf50, #81c784)',
              color: 'white',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Welcome to Fresh Recipes, {user.name}!
                </Typography>
                <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                  Discover personalized recipes tailored just for you
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={handleGenerateRecipe}
                  sx={{ 
                    mt: 2, 
                    fontWeight: 'bold',
                    px: 4,
                    py: 1,
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    }
                  }}
                >
                  Generate Recipe
                </Button>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
                  alt="Fresh food"
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 2,
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Recent Recipes Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" color="primary.dark">
                Your Recent Recipes
              </Typography>
              {recipes.length > 3 && (
                <Button 
                  variant="text" 
                  color="primary"
                  onClick={handleViewAllRecipes}
                >
                  View All
                </Button>
              )}
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : recipes.length === 0 ? (
              <Paper
                elevation={1}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  You don't have any saved recipes yet.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGenerateRecipe}
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  Generate Your First Recipe
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {recentRecipes.map((recipe) => (
                  <Grid item xs={12} sm={6} md={4} key={recipe.id || `recipe-${Math.random()}`}>
                    <Card 
                      elevation={2}
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.dark" noWrap>
                          {recipe.title}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            height: '40px'
                          }}
                        >
                          {recipe.description}
                        </Typography>
                        
                        <Divider sx={{ my: 1.5 }} />
                        
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                              <AccessTimeIcon color="primary" fontSize="small" />
                              <Typography variant="caption" align="center">
                                {Number(recipe.prepTime) + Number(recipe.cookTime)} min
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                              <RestaurantIcon color="primary" fontSize="small" />
                              <Typography variant="caption" align="center">
                                {recipe.servings} serv
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                              <LocalDiningIcon color="primary" fontSize="small" />
                              <Typography variant="caption" align="center">
                                {recipe.nutrition.calories} kcal
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                      
                      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => handleViewRecipe(recipe)}
                          fullWidth
                          sx={{ mr: 1 }}
                        >
                          View Recipe
                        </Button>
                        
                        <Tooltip title="Delete Recipe">
                          <IconButton 
                            size="small"
                            color="error"
                            onClick={() => handleDeleteRecipe(recipe)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      ) : (
        // Not logged in view
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            backgroundImage: 'linear-gradient(135deg, #f9fbf9 0%, #ffffff 100%)',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                component="h1" 
                variant="h3" 
                fontWeight="bold" 
                color="primary.dark"
                gutterBottom
              >
                Fresh Recipes
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph>
                AI-powered recipe generator for delicious, personalized meals
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                Get personalized recipe recommendations based on your preferences, dietary restrictions, and available ingredients. Sign up now to start cooking!
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{ px: 4, py: 1.5, fontWeight: 'bold' }}
                  >
                    Sign Up Free
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1505935428862-770b6f24f629?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
                alt="Fresh food"
                sx={{
                  width: '100%',
                  borderRadius: 3,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      <DeleteRecipeModal
        open={deleteModalOpen}
        recipe={recipeToDelete}
        onClose={handleCloseDeleteModal}
      />
    </Container>
  );
};

export default Home; 