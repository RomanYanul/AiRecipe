import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { saveRecipe, reset } from '../features/recipes/recipeSlice';

const RecipeView: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const { currentRecipe, recipes, isLoading, isError, isSuccess, message } = useAppSelector(
    (state) => state.recipes
  );
  
  // Check if the current recipe is already saved
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  
  useEffect(() => {
    // If not logged in, redirect to login
    if (!user) {
      navigate('/login');
    }

    // If no current recipe, redirect to generate
    if (!currentRecipe) {
      navigate('/generate');
    }
    
    // Check if the recipe is already saved
    if (currentRecipe && recipes.length > 0) {
      const recipeExists = recipes.some(
        recipe => recipe.title === currentRecipe.title && 
                 recipe.description === currentRecipe.description
      );
      setIsAlreadySaved(recipeExists);
    }

    return () => {
      dispatch(reset());
    };
  }, [user, currentRecipe, recipes, navigate, dispatch]);

  const handleSaveRecipe = () => {
    if (currentRecipe) {
      // Create a copy of the recipe to save, keeping the ID
      const recipeToSave = { ...currentRecipe };
      
      // Save the recipe with its existing ID
      dispatch(saveRecipe(recipeToSave));
    }
  };

  const handleBackToGenerate = () => {
    navigate('/generate');
  };

  if (!currentRecipe) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {isSuccess && !isAlreadySaved && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {message}
        </Alert>
      )}
      
      {isError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {message}
        </Alert>
      )}

      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBackToGenerate}
        sx={{ mb: 2 }}
      >
        Back to Generator
      </Button>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom color="primary.dark">
          {currentRecipe.title}
        </Typography>
        
        {currentRecipe.imageUrl && (
          <Box sx={{ mb: 3, mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              src={currentRecipe.imageUrl}
              alt={currentRecipe.title}
              sx={{
                width: '100%',
                maxWidth: '600px',
                height: 'auto',
                borderRadius: 2,
                boxShadow: 3,
              }}
            />
          </Box>
        )}
        
        <Typography variant="body1" paragraph>
          {currentRecipe.description}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card elevation={0} sx={{ backgroundColor: 'primary.light', color: 'white', height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <AccessTimeIcon />
                <Typography variant="body2" fontWeight="bold">
                  Prep Time
                </Typography>
                <Typography variant="body1">
                  {currentRecipe.prepTime} min
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card elevation={0} sx={{ backgroundColor: 'primary.main', color: 'white', height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <AccessTimeIcon />
                <Typography variant="body2" fontWeight="bold">
                  Cook Time
                </Typography>
                <Typography variant="body1">
                  {currentRecipe.cookTime} min
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card elevation={0} sx={{ backgroundColor: 'primary.dark', color: 'white', height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <RestaurantIcon />
                <Typography variant="body2" fontWeight="bold">
                  Servings
                </Typography>
                <Typography variant="body1">
                  {currentRecipe.servings}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Card elevation={0} sx={{ backgroundColor: 'secondary.main', color: 'white', height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <LocalDiningIcon />
                <Typography variant="body2" fontWeight="bold">
                  Calories
                </Typography>
                <Typography variant="body1">
                  {currentRecipe.nutrition.calories} kcal
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.dark">
          Nutrition Information
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1, border: '1px solid', borderColor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Protein
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {currentRecipe.nutrition.protein}g
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1, border: '1px solid', borderColor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Fat
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {currentRecipe.nutrition.fat}g
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1, border: '1px solid', borderColor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Carbs
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {currentRecipe.nutrition.carbohydrates}g
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.dark">
              Ingredients
            </Typography>
            
            <List>
              {currentRecipe.ingredients.map((ingredient, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleOutlineIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={ingredient} />
                </ListItem>
              ))}
            </List>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.dark">
              Instructions
            </Typography>
            
            <List>
              {currentRecipe.instructions.map((instruction, index) => (
                <ListItem key={index} alignItems="flex-start" sx={{ py: 1 }}>
                  <ListItemIcon>
                    <Chip 
                      label={index + 1} 
                      color="primary" 
                      size="small" 
                      sx={{ borderRadius: '50%', height: 24, width: 24, fontWeight: 'bold' }} 
                    />
                  </ListItemIcon>
                  <ListItemText primary={instruction} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ textAlign: 'center' }}>
        {!isAlreadySaved ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<FavoriteIcon />}
            onClick={handleSaveRecipe}
            disabled={isLoading}
            sx={{ 
              py: 1.5, 
              px: 4,
              borderRadius: 2,
              fontWeight: 'bold',
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Recipe'}
          </Button>
        ) : (
          <Typography variant="body1" color="success.main" sx={{ fontWeight: 'bold' }}>
            This recipe is already saved to your collection
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default RecipeView; 