import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Recipe, RecipeParams, generateRecipe as generateRecipeApi } from '../../services/openai';

// API URLs
const API_URL = '/api/recipes/';

// Define a type for our state
interface RecipeState {
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  isLoading: boolean;
  isGenerating: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
}

// Define the initial state
const initialState: RecipeState = {
  recipes: [],
  currentRecipe: null,
  isLoading: false,
  isGenerating: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Generate a new recipe using OpenAI
export const generateNewRecipe = createAsyncThunk(
  'recipes/generate',
  async (recipeParams: RecipeParams, thunkAPI) => {
    try {
      return await generateRecipeApi(recipeParams);
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch user's recipes from backend
export const getRecipes = createAsyncThunk(
  'recipes/getAll',
  async (_, thunkAPI: any) => {
    try {
      const { auth } = thunkAPI.getState();
      // Check if user is logged in
      if (!auth.user) {
        return thunkAPI.rejectWithValue('User not authenticated');
      }
      
      const token = auth.token; // Get token from the root level of auth state
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(API_URL, config);
      return response.data;
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Save a recipe
export const saveRecipe = createAsyncThunk(
  'recipes/save',
  async (recipe: Recipe, thunkAPI: any) => {
    try {
      const { auth } = thunkAPI.getState();
      if (!auth.user) {
        return thunkAPI.rejectWithValue('Not authenticated');
      }

      const token = auth.token; // Get token from the root level of auth state
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Check if the recipe already exists in the state
      const { recipes } = thunkAPI.getState().recipes;
      const existingRecipe = recipes.find(
        (r: Recipe) => r.title === recipe.title && r.description === recipe.description
      );
      
      if (existingRecipe) {
        return thunkAPI.rejectWithValue('Recipe already exists in your collection');
      }

      // Save the recipe to the backend
      const response = await axios.post(API_URL, recipe, config);
      return response.data;
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a recipe
export const deleteRecipe = createAsyncThunk(
  'recipes/delete',
  async (id: string, thunkAPI: any) => {
    try {
      const { auth } = thunkAPI.getState();
      if (!auth.user) {
        return thunkAPI.rejectWithValue('Not authenticated');
      }

      const token = auth.token; // Get token from the root level of auth state
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      console.log('Sending delete request for ID:', id);
      
      // Delete the recipe from the backend
      await axios.delete(API_URL + id, config);
      return id;
    } catch (error: any) {
      console.error('Delete recipe error:', error);
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isGenerating = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearCurrentRecipe: (state) => {
      state.currentRecipe = null;
    },
    setCurrentRecipe: (state, action: PayloadAction<Recipe>) => {
      state.currentRecipe = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate recipe cases
      .addCase(generateNewRecipe.pending, (state) => {
        state.isGenerating = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      })
      .addCase(generateNewRecipe.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.isSuccess = true;
        state.currentRecipe = action.payload;
      })
      .addCase(generateNewRecipe.rejected, (state, action) => {
        state.isGenerating = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      
      // Get recipes cases
      .addCase(getRecipes.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.recipes = action.payload;
      })
      .addCase(getRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      
      // Save recipe cases
      .addCase(saveRecipe.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(saveRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.recipes.push(action.payload);
        state.message = 'Recipe saved successfully!';
      })
      .addCase(saveRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      
      // Delete recipe cases
      .addCase(deleteRecipe.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Remove the deleted recipe from the array, checking both id and _id
        state.recipes = state.recipes.filter((recipe) => {
          // If either id or _id matches the payload, filter it out
          if (recipe.id === action.payload || recipe._id === action.payload) {
            return false; // Remove this recipe
          }
          return true; // Keep this recipe
        });
        state.message = 'Recipe deleted successfully!';
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset, clearCurrentRecipe, setCurrentRecipe } = recipeSlice.actions;
export default recipeSlice.reducer; 