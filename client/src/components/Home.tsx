import React, { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
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
  Stack,
  Link,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import DeleteIcon from '@mui/icons-material/Delete';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import InventoryIcon from '@mui/icons-material/Inventory';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { getRecipes, setCurrentRecipe, deleteRecipe, clearCurrentRecipe } from '../features/recipes/recipeSlice';
import { Recipe } from '../services/openai';

// Lazy load the DeleteRecipeModal to improve initial load time
const DeleteRecipeModal = lazy(() => import('./DeleteRecipeModal'));

// Memoized key features to prevent unnecessary re-renders
const keyFeatures = [
  {
    icon: <SmartToyIcon sx={{ fontSize: 48 }} />,
    title: "AI-Powered Recipes",
    description: "Our advanced AI generates personalized recipes based on your preferences, dietary restrictions, and available ingredients."
  },
  {
    icon: <RestaurantIcon sx={{ fontSize: 48 }} />,
    title: "Customized Cooking",
    description: "Get recipes tailored specifically to your taste preferences and culinary skill level."
  },
  {
    icon: <FitnessCenterIcon sx={{ fontSize: 48 }} />,
    title: "Nutrition Tracking",
    description: "Track calories and nutritional information for all recipes to maintain your health goals."
  },
  {
    icon: <InventoryIcon sx={{ fontSize: 48 }} />,
    title: "Ingredient Management",
    description: "Find recipes based on ingredients you already have to reduce food waste and grocery expenses."
  }
];

// Memoized KeyFeatureCard component to prevent re-rendering when parent changes
const KeyFeatureCard = React.memo(({ feature, elevation = 2, hoverTransform = -5 }: { 
  feature: typeof keyFeatures[0], 
  elevation?: number,
  hoverTransform?: number
}) => (
  <Paper
    elevation={elevation}
    sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      borderRadius: elevation > 2 ? 4 : 2,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: `translateY(${hoverTransform}px)`,
        boxShadow: elevation + 1,
      }
    }}
  >
    <Box sx={{ color: 'primary.main', mb: 2 }}>
      {feature.icon}
    </Box>
    <Typography variant="h6" fontWeight="bold" gutterBottom>
      {feature.title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {feature.description}
    </Typography>
  </Paper>
));

// Optimized RecipeCard component
const RecipeCard = React.memo(({ 
  recipe, 
  onView, 
  onDelete 
}: { 
  recipe: Recipe, 
  onView: (recipe: Recipe) => void, 
  onDelete: (recipe: Recipe) => void 
}) => {
  // State to track image loading errors
  const [imageError, setImageError] = useState(false);
  
  // Handle image loading errors
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
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
      {recipe.imageUrl && !imageError ? (
        <Box
          component="img"
          src={recipe.imageUrl}
          alt={recipe.title}
          onError={handleImageError}
          sx={{
            width: '100%',
            height: '160px',
            objectFit: 'cover',
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '160px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
          }}
        >
          <RestaurantIcon sx={{ fontSize: 60, color: 'primary.light', opacity: 0.7 }} />
        </Box>
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
          onClick={() => onView(recipe)}
        >
          View Recipe
        </Button>
        
        <Tooltip title="Delete Recipe">
          <IconButton 
            size="small"
            color="error"
            onClick={() => onDelete(recipe)}
            disabled={!(recipe.id || recipe._id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
});

// Memoized Footer component
const Footer = React.memo(() => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 8,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Fresh Recipes
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 300, mb: 2 }}>
              AI-powered recipe generator helping you create delicious, personalized meals with the ingredients you have on hand.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton color="inherit" size="small">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" size="small">
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit" size="small">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" size="small">
                <GitHubIcon />
              </IconButton>
            </Stack>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              <Link href="#" color="inherit" underline="hover">Home</Link>
              <Link href="#features" color="inherit" underline="hover">Features</Link>
              <Link href="#" color="inherit" underline="hover">About Us</Link>
              <Link href="#" color="inherit" underline="hover">Contact</Link>
            </Stack>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Legal
            </Typography>
            <Stack spacing={1}>
              <Link href="#" color="inherit" underline="hover">Terms of Service</Link>
              <Link href="#" color="inherit" underline="hover">Privacy Policy</Link>
              <Link href="#" color="inherit" underline="hover">Cookie Policy</Link>
            </Stack>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4, backgroundColor: 'rgba(255,255,255,0.2)' }} />
        
        <Typography variant="body2" align="center">
          © {currentYear} Fresh Recipes. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
});

const Home: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { recipes, isLoading } = useAppSelector((state) => state.recipes);

  // State for delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  // Memoize event handlers to prevent unnecessary re-creations
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  const handleGenerateRecipe = useCallback(() => {
    dispatch(clearCurrentRecipe());
    navigate('/generate');
  }, [dispatch, navigate]);

  const handleViewRecipe = useCallback((recipe: Recipe) => {
    if (recipe) {
      dispatch(setCurrentRecipe(recipe));
      navigate('/recipe');
    }
  }, [dispatch, navigate]);

  const handleViewAllRecipes = useCallback(() => {
    navigate('/saved-recipes');
  }, [navigate]);

  const handleOpenDeleteModal = useCallback((recipe: Recipe) => {
    setRecipeToDelete(recipe);
    setDeleteModalOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setRecipeToDelete(null);
  }, []);

  // Fetch recipes only when needed
  useEffect(() => {
    // Fetch recipes when component mounts and user is logged in
    if (user) {
      dispatch(getRecipes());
    }
  }, [user, dispatch]);

  // Memoize derived data to prevent recalculations on every render
  const recentRecipes = useMemo(() => {
    if (!recipes.length) return [];
    
    return [...recipes]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 3);
  }, [recipes]);

  // Only show view all button when there are more than 3 recipes
  const shouldShowViewAllButton = useMemo(() => recipes.length > 3, [recipes.length]);

  return (
    <Box>
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
                    loading="lazy" // Add lazy loading to improve initial page load
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

            {/* Key Features Section for logged-in users */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" fontWeight="bold" color="primary.dark" sx={{ mb: 3 }}>
                What You Can Do With Fresh Recipes
              </Typography>
              <Grid container spacing={3}>
                {keyFeatures.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <KeyFeatureCard feature={feature} />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Recent Recipes Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" color="primary.dark">
                  Your Recent Recipes
                </Typography>
                {shouldShowViewAllButton && (
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
                    <Grid item xs={12} sm={6} md={4} key={recipe.id || recipe._id || `recipe-${Math.random()}`}>
                      <RecipeCard 
                        recipe={recipe} 
                        onView={handleViewRecipe} 
                        onDelete={handleOpenDeleteModal}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Box>
        ) : (
          // Not logged in view
          <Box>
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
                    loading="lazy" // Add lazy loading for images
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

            {/* Key Features Section for non-logged-in users */}
            <Box id="features" sx={{ mt: 8, mb: 6 }}>
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                color="primary.dark" 
                align="center"
                sx={{ mb: 1 }}
              >
                Key Features
              </Typography>
              <Typography 
                variant="h6" 
                align="center" 
                color="text.secondary" 
                sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}
              >
                Experience the power of AI in the kitchen with these amazing features
              </Typography>
              
              <Grid container spacing={4}>
                {keyFeatures.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <KeyFeatureCard feature={feature} elevation={3} hoverTransform={-8} />
                  </Grid>
                ))}
              </Grid>
            </Box>
            
            {/* Call to Action */}
            <Paper
              elevation={0}
              sx={{
                p: 6,
                mt: 8,
                textAlign: 'center',
                borderRadius: 3,
                backgroundColor: 'primary.light',
                color: 'white',
              }}
            >
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Ready to transform your cooking experience?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
                Join thousands of home chefs discovering new flavors and recipes every day
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ 
                  px: 6, 
                  py: 1.5, 
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                }}
              >
                Get Started Now
              </Button>
            </Paper>
          </Box>
        )}

        {/* Delete Recipe Modal - Lazy loaded */}
        <Suspense fallback={<CircularProgress />}>
          {deleteModalOpen && (
            <DeleteRecipeModal
              open={deleteModalOpen}
              recipe={recipeToDelete}
              onClose={handleCloseDeleteModal}
            />
          )}
        </Suspense>
      </Container>
      
      {/* Footer */}
      <Footer />
    </Box>
  );
};

// Export as memoized component to prevent unnecessary re-renders
export default React.memo(Home); 