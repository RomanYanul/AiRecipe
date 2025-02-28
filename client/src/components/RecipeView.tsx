import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { saveRecipe, reset } from '../features/recipes/recipeSlice';
import { Recipe } from '../services/openai';

// Memoized recipe section components
const RecipeHeader = React.memo(({ recipe }: { recipe: Recipe }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" color="primary.dark" gutterBottom>
        {recipe.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {recipe.description}
      </Typography>
    </Box>
  );
});

const RecipeImageSection = React.memo(({ imageUrl, title }: { imageUrl?: string, title: string }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);
  
  if (!imageUrl || imageError) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
          borderRadius: 2,
          mb: 4,
        }}
      >
        <RestaurantIcon sx={{ fontSize: 80, color: 'primary.light', opacity: 0.7 }} />
      </Box>
    );
  }
  
  return (
    <Box
      component="img"
      src={imageUrl}
      alt={title}
      onError={handleImageError}
      sx={{
        width: '100%',
        height: 'auto',
        maxHeight: '400px',
        objectFit: 'cover',
        borderRadius: 2,
        mb: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
      }}
    />
  );
});

const RecipeInfoChips = React.memo(({ recipe }: { recipe: Recipe }) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
      <Chip 
        icon={<AccessTimeIcon />} 
        label={`Prep: ${recipe.prepTime} min`} 
        color="primary" 
        variant="outlined" 
      />
      <Chip 
        icon={<AccessTimeIcon />} 
        label={`Cook: ${recipe.cookTime} min`} 
        color="primary" 
        variant="outlined" 
      />
      <Chip 
        icon={<RestaurantIcon />} 
        label={`Servings: ${recipe.servings}`} 
        color="primary" 
        variant="outlined" 
      />
      <Chip 
        icon={<LocalDiningIcon />} 
        label={`Calories: ${recipe.nutrition.calories} kcal`} 
        color="primary" 
        variant="outlined" 
      />
    </Box>
  );
});

const RecipeIngredients = React.memo(({ ingredients }: { ingredients: string[] }) => {
  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Ingredients
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List sx={{ pt: 0 }}>
        {ingredients.map((ingredient, index) => (
          <ListItem key={`ingredient-${index}`} sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleOutlineIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={ingredient} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
});

const RecipeInstructions = React.memo(({ instructions }: { instructions: string[] }) => {
  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Instructions
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List sx={{ pt: 0 }}>
        {instructions.map((step, index) => (
          <ListItem key={`step-${index}`} alignItems="flex-start" sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 14,
                }}
              >
                {index + 1}
              </Box>
            </ListItemIcon>
            <ListItemText primary={step} sx={{ m: 0 }} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
});

const RecipeNutrition = React.memo(({ nutrition }: { nutrition: Recipe['nutrition'] }) => {
  const nutritionItems = useMemo(() => [
    { label: 'Calories', value: nutrition.calories },
    { label: 'Protein', value: nutrition.protein },
    { label: 'Carbs', value: nutrition.carbohydrates || '0g' },
    { label: 'Fat', value: nutrition.fat },
    { label: 'Fiber', value: nutrition.fiber },
  ], [nutrition]);

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Nutrition Information
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {nutritionItems.map((item) => (
          <Grid item xs={6} sm={4} md={2} key={item.label}>
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {item.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
});

const RecipeView: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const { currentRecipe, recipes, isLoading, isError, isSuccess, message } = useAppSelector(
    (state) => state.recipes
  );
  
  // Check if the current recipe is already saved
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  
  // Memoize the check for already saved recipe
  const checkIfRecipeIsSaved = useCallback((recipe: Recipe | null, recipesList: Recipe[]) => {
    if (!recipe || recipesList.length === 0) return false;
    
    return recipesList.some(
      r => r.title === recipe.title && r.description === recipe.description
    );
  }, []);
  
  useEffect(() => {
    // If not logged in, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }

    // If no current recipe, redirect to generate
    if (!currentRecipe) {
      navigate('/generate');
      return;
    }
    
    // Check if the recipe is already saved
    setIsAlreadySaved(checkIfRecipeIsSaved(currentRecipe, recipes));

    return () => {
      dispatch(reset());
    };
  }, [user, currentRecipe, recipes, navigate, dispatch, checkIfRecipeIsSaved]);

  const handleSaveRecipe = useCallback(() => {
    if (currentRecipe && !isAlreadySaved) {
      // Create a copy of the recipe to save, keeping the ID
      const recipeToSave = { ...currentRecipe };
      dispatch(saveRecipe(recipeToSave));
    }
  }, [currentRecipe, isAlreadySaved, dispatch]);

  const handleBackToGenerate = useCallback(() => {
    navigate('/generate');
  }, [navigate]);

  // Loading state
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

      <Box mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToGenerate}
          sx={{ mb: 2 }}
        >
          Back to Generator
        </Button>
      </Box>

      {/* Recipe Image */}
      <RecipeImageSection imageUrl={currentRecipe.imageUrl} title={currentRecipe.title} />

      {/* Recipe Header */}
      <RecipeHeader recipe={currentRecipe} />

      {/* Recipe Info */}
      <RecipeInfoChips recipe={currentRecipe} />

      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          mb: 4,
        }}
      >
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

export default React.memo(RecipeView); 