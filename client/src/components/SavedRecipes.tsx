import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Divider,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { getRecipes, setCurrentRecipe, deleteRecipe } from '../features/recipes/recipeSlice';
import { Recipe } from '../services/openai';

// Lazy load the DeleteRecipeModal to improve initial load time
const DeleteRecipeModal = lazy(() => import('./DeleteRecipeModal'));

// Memoized RecipeCard component
const RecipeCard = React.memo(({
  recipe,
  onView,
  onDelete
}: {
  recipe: Recipe,
  onView: (recipe: Recipe) => void,
  onDelete: (recipe: Recipe) => void
}) => {
  const totalTime = Number(recipe.prepTime) + Number(recipe.cookTime);
  const [imageError, setImageError] = useState(false);
  
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
        <CardMedia
          component="img"
          height="180"
          image={recipe.imageUrl}
          alt={recipe.title}
          onError={handleImageError}
          sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
        />
      ) : (
        <Box
          sx={{
            height: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.03)'
          }}
        >
          <RestaurantIcon sx={{ fontSize: 60, color: 'primary.light', opacity: 0.7 }} />
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom>
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
            height: '40px',
          }}
        >
          {recipe.description}
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon color="primary" fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="caption">{totalTime} min</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RestaurantIcon color="primary" fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="caption">{recipe.servings} servings</Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => onView(recipe)}>
          View Recipe
        </Button>
        <Tooltip title="Delete Recipe">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(recipe)}
            sx={{ ml: 'auto' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
});

// Memoized filter controls component 
const FilterControls = React.memo(({
  searchTerm,
  sortBy,
  onSearchChange,
  onSortChange
}: {
  searchTerm: string,
  sortBy: string,
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onSortChange: (e: SelectChangeEvent) => void
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={onSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="sort-select-label">Sort By</InputLabel>
            <Select
              labelId="sort-select-label"
              value={sortBy}
              label="Sort By"
              onChange={onSortChange}
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon color="primary" />
                </InputAdornment>
              }
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
              <MenuItem value="alphabetical">Alphabetical (A-Z)</MenuItem>
              <MenuItem value="prep_time">Prep Time (Low to High)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
});

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
  
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    // If not logged in, redirect to login
    if (!user) {
      navigate('/login');
    } else {
      // Fetch recipes when component mounts
      dispatch(getRecipes());
    }
  }, [user, navigate, dispatch]);

  // Optimized event handlers
  const handleViewRecipe = useCallback((recipe: Recipe) => {
    if (recipe) {
      dispatch(setCurrentRecipe(recipe));
      navigate('/recipe');
    }
  }, [dispatch, navigate]);

  const handleOpenDeleteModal = useCallback((recipe: Recipe) => {
    setRecipeToDelete(recipe);
    setDeleteModalOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setRecipeToDelete(null);
  }, []);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);
  
  const handleSortChange = useCallback((e: SelectChangeEvent) => {
    setSortBy(e.target.value);
  }, []);

  // Memoized filtered and sorted recipes
  const filteredAndSortedRecipes = useMemo(() => {
    if (!recipes.length) return [];
    
    return [...recipes]
      // Filter by search term
      .filter(recipe => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.description.toLowerCase().includes(searchLower) ||
          recipe.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(searchLower)
          )
        );
      })
      // Sort based on selected option
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case 'oldest':
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          case 'alphabetical':
            return a.title.localeCompare(b.title);
          case 'prep_time':
            return Number(a.prepTime) - Number(b.prepTime);
          default:
            return 0;
        }
      });
  }, [recipes, searchTerm, sortBy]);

  if (isLoading && !filteredAndSortedRecipes.length) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary.dark" gutterBottom>
          My Recipe Collection
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and manage all your saved recipes
        </Typography>
      </Box>

      {/* Filter and Sort Controls */}
      <FilterControls 
        searchTerm={searchTerm}
        sortBy={sortBy}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
      />

      {isError && (
        <Box sx={{ mb: 4, p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
          <Typography>{message}</Typography>
        </Box>
      )}

      {!isLoading && recipes.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 6, 
            bgcolor: 'background.paper', 
            borderRadius: 2,
            boxShadow: 1 
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
        </Box>
      ) : filteredAndSortedRecipes.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 6, 
            bgcolor: 'background.paper', 
            borderRadius: 2,
            boxShadow: 1 
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No recipes match your search criteria.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setSearchTerm('')}
            sx={{ mt: 2 }}
          >
            Clear Search
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredAndSortedRecipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id || recipe._id}>
              <RecipeCard 
                recipe={recipe} 
                onView={handleViewRecipe} 
                onDelete={handleOpenDeleteModal} 
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Modal - Lazy loaded */}
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
  );
};

export default React.memo(SavedRecipes); 