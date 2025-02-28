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
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { deleteRecipe, getRecipes, setCurrentRecipe } from '../features/recipes/recipeSlice';
import { Recipe } from '../services/openai';
import DeleteRecipeModal from './DeleteRecipeModal';

const SavedRecipes: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const { recipes, isLoading, isError, message } = useAppSelector(
    (state) => state.recipes
  );

  // State for delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  useEffect(() => {
    // If not logged in, redirect to login
    if (!user) {
      navigate('/login');
    } else {
      // Fetch recipes when component mounts
      dispatch(getRecipes());
    }
  }, [user, navigate, dispatch]);

  const handleViewRecipe = (recipe: Recipe) => {
    if (recipe) {
      dispatch(setCurrentRecipe(recipe));
      navigate('/recipe');
    }
  };

  const handleOpenDeleteModal = (recipe: Recipe) => {
    setRecipeToDelete(recipe);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setRecipeToDelete(null);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary.dark" sx={{ mb: 4 }}>
        My Saved Recipes
      </Typography>

      {isError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {message}
        </Alert>
      )}

      {recipes.length === 0 ? (
        <Paper
          elevation={2}
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
            onClick={() => navigate('/generate')}
            sx={{ mt: 2 }}
          >
            Generate Your First Recipe
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {recipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={4} key={recipe.id || recipe._id || `recipe-${Math.random()}`}>
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
                {recipe.imageUrl && (
                  <Box
                    component="img"
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    sx={{
                      width: '100%',
                      height: '160px',
                      objectFit: 'cover',
                    }}
                  />
                )}
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
                  >
                    View Recipe
                  </Button>
                  
                  <Tooltip title="Delete Recipe">
                    <IconButton 
                      size="small"
                      color="error"
                      onClick={() => handleOpenDeleteModal(recipe)}
                      disabled={!(recipe.id || recipe._id)}
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

      {/* Delete Recipe Modal */}
      <DeleteRecipeModal
        open={deleteModalOpen}
        recipe={recipeToDelete}
        onClose={handleCloseDeleteModal}
      />
    </Container>
  );
};

export default SavedRecipes; 