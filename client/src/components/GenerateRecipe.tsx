import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  FormHelperText,
  Alert,
  CircularProgress,
  Divider,
  Slider,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { generateNewRecipe, reset } from '../features/recipes/recipeSlice';
import { RecipeParams } from '../services/openai';

// Diet options
const dietOptions = [
  'No Preference',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Paleo',
  'Low-Carb',
  'Low-Fat',
  'Mediterranean',
  'Gluten-Free',
];

// Common allergies
const allergyOptions = [
  'Dairy',
  'Eggs',
  'Peanuts',
  'Tree Nuts',
  'Soy',
  'Wheat',
  'Fish',
  'Shellfish',
  'Sesame',
];

const GenerateRecipe: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const { currentRecipe, isLoading, isGenerating, isError, isSuccess, message } = useAppSelector(
    (state) => state.recipes
  );

  // Form state
  const [diet, setDiet] = useState<string>('No Preference');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [calories, setCalories] = useState<number>(500);
  const [mainIngredients, setMainIngredients] = useState<string>('');
  const [formErrors, setFormErrors] = useState({
    mainIngredients: '',
  });
  // Local loading state to ensure immediate UI feedback
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If not logged in, redirect to login
    if (!user) {
      navigate('/login');
    }

    // If recipe generated successfully, navigate to view it
    if (isSuccess && currentRecipe) {
      setIsSubmitting(false);
      navigate('/recipe');
    }

    // Reset submitting state if there's an error
    if (isError) {
      setIsSubmitting(false);
    }

    return () => {
      dispatch(reset());
    };
  }, [user, isSuccess, isError, currentRecipe, navigate, dispatch]);

  const handleAllergiesChange = (event: SelectChangeEvent<string[]>) => {
    setAllergies(event.target.value as string[]);
  };

  const handleCaloriesChange = (event: Event, newValue: number | number[]) => {
    setCalories(newValue as number);
  };

  const validateForm = (): boolean => {
    let valid = true;
    const errors = {
      mainIngredients: '',
    };

    if (!mainIngredients.trim()) {
      errors.mainIngredients = 'Please enter at least one main ingredient';
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      // Set local loading state immediately
      setIsSubmitting(true);
      
      // Set in localStorage for GlobalLoader to detect
      localStorage.setItem('recipe_submitting', 'true');
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new Event('storage'));
      
      console.log('Form submitted, setting recipe_submitting to true');
      
      const recipeParams: RecipeParams = {
        diet: diet !== 'No Preference' ? diet : undefined,
        allergies: allergies.length > 0 ? allergies : undefined,
        calories,
        mainIngredients: mainIngredients.split(',').map(item => item.trim()),
      };

      // Dispatch the action to generate a recipe
      dispatch(generateNewRecipe(recipeParams));
    }
  };

  // Clear localStorage submission state when component unmounts or on success/error
  useEffect(() => {
    // Clear on success or error, but with a slight delay to ensure the UI transition is smooth
    if (isSuccess || isError) {
      const timer = setTimeout(() => {
        localStorage.removeItem('recipe_submitting');
        setIsSubmitting(false);
      }, 1000); // 1 second delay before removing the loading state
      
      return () => clearTimeout(timer);
    }
    
    // Clear on unmount
    return () => {
      localStorage.removeItem('recipe_submitting');
    };
  }, [isSuccess, isError]);

  // Combined loading state (either local or from Redux)
  const isButtonDisabled = isSubmitting || isGenerating;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom color="primary.dark">
          Generate Your Recipe
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Customize your preferences to generate a personalized recipe
        </Typography>

        {isError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="diet-label">Diet Preference</InputLabel>
                <Select
                  labelId="diet-label"
                  id="diet"
                  value={diet}
                  label="Diet Preference"
                  onChange={(e) => setDiet(e.target.value)}
                >
                  {dietOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="allergies-label">Allergies</InputLabel>
                <Select
                  labelId="allergies-label"
                  id="allergies"
                  multiple
                  value={allergies}
                  onChange={handleAllergiesChange}
                  input={<OutlinedInput label="Allergies" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {allergyOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      <Checkbox checked={allergies.indexOf(option) > -1} />
                      <ListItemText primary={option} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography id="calories-slider" gutterBottom>
                Calories per serving: {calories}
              </Typography>
              <Slider
                value={calories}
                onChange={handleCaloriesChange}
                aria-labelledby="calories-slider"
                valueLabelDisplay="auto"
                step={50}
                marks
                min={200}
                max={1000}
                sx={{ color: 'primary.main' }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="mainIngredients"
                label="Main Ingredients"
                name="mainIngredients"
                value={mainIngredients}
                onChange={(e) => setMainIngredients(e.target.value)}
                error={!!formErrors.mainIngredients}
                helperText={formErrors.mainIngredients || "Enter ingredients separated by commas (e.g., chicken, rice, broccoli)"}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isButtonDisabled}
              sx={{ 
                py: 1.5, 
                px: 4,
                borderRadius: 2,
                fontWeight: 'bold',
              }}
            >
              {isButtonDisabled ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Generate Recipe'
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default GenerateRecipe; 