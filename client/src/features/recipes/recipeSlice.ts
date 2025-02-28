import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Recipe, RecipeParams, generateRecipe as generateRecipeApi } from '../../services/openai';

// API URLs with configurable caching
const API_URL = '/api/recipes/';

// Create axios instance with optimized config
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  // Increasing timeout for stability but not too long to prevent hanging requests
  timeout: 30000,
});

// Cache for recipes to prevent redundant fetches
interface RecipeCache {
  timestamp: number;
  data: Recipe[];
}

let recipesCache: RecipeCache | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Define a type for our state
interface RecipeState {
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  isLoading: boolean;
  isGenerating: boolean;
  isError: boolean;
  isSuccess: boolean;
  message: string;
  lastFetch: number | null;
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
  lastFetch: null,
};

// Helper function to check if recipe ID exists in a safer way
const getRecipeId = (recipe: Recipe) => recipe.id || recipe._id;

// Helper function for auth headers with memoization
const getAuthConfig = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

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

// Fetch user's recipes from backend with caching
export const getRecipes = createAsyncThunk(
  'recipes/getAll',
  async (_, thunkAPI: any) => {
    try {
      const { auth } = thunkAPI.getState();
      // Check if user is logged in
      if (!auth.user) {
        return thunkAPI.rejectWithValue('User not authenticated');
      }
      
      const token = auth.token;
      
      // Check if we have a valid cache
      const state = thunkAPI.getState().recipes;
      if (
        state.lastFetch && 
        (Date.now() - state.lastFetch < CACHE_DURATION) && 
        state.recipes.length > 0
      ) {
        // Use cached data
        return state.recipes;
      }
      
      // If no cache, fetch from API
      const config = getAuthConfig(token);
      const response = await api.get(API_URL, config);
      
      // Update cache
      recipesCache = {
        timestamp: Date.now(),
        data: response.data,
      };
      
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

// Save a recipe with optimized checks
export const saveRecipe = createAsyncThunk(
  'recipes/save',
  async (recipe: Recipe, thunkAPI: any) => {
    try {
      const { auth } = thunkAPI.getState();
      if (!auth.user) {
        return thunkAPI.rejectWithValue('Not authenticated');
      }

      const token = auth.token;
      const config = getAuthConfig(token);

      // Check if the recipe already exists in the state
      const { recipes } = thunkAPI.getState().recipes;
      const existingRecipe = recipes.find(
        (r: Recipe) => r.title === recipe.title && r.description === recipe.description
      );
      
      if (existingRecipe) {
        return thunkAPI.rejectWithValue('Recipe already exists in your collection');
      }

      // Save the recipe to the backend
      const response = await api.post(API_URL, recipe, config);
      
      // Invalidate cache
      recipesCache = null;
      
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

// Delete recipe with optimistic updates
export const deleteRecipe = createAsyncThunk(
  'recipes/delete',
  async (id: string, thunkAPI: any) => {
    try {
      const { auth } = thunkAPI.getState();
      if (!auth.user) {
        return thunkAPI.rejectWithValue('Not authenticated');
      }

      const token = auth.token;
      const config = getAuthConfig(token);

      // Delete from API
      await api.delete(`${API_URL}${id}`, config);
      
      // Invalidate cache
      recipesCache = null;
      
      return id;
    } catch (error: any) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Normalize a recipe: ensure both id and _id are present
const normalizeRecipe = (recipe: Recipe): Recipe => {
  const normalized = { ...recipe };
  if (normalized._id && !normalized.id) {
    normalized.id = normalized._id;
  } else if (normalized.id && !normalized._id) {
    normalized._id = normalized.id;
  }
  return normalized;
};

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
      state.currentRecipe = normalizeRecipe(action.payload);
    },
    invalidateCache: (state) => {
      state.lastFetch = null;
      recipesCache = null;
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
        state.currentRecipe = normalizeRecipe(action.payload);
      })
      .addCase(generateNewRecipe.rejected, (state, action) => {
        state.isGenerating = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      
      // Get recipes cases
      .addCase(getRecipes.pending, (state) => {
        if (!state.lastFetch || Date.now() - state.lastFetch > CACHE_DURATION) {
          state.isLoading = true;
        }
        state.isError = false;
      })
      .addCase(getRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.lastFetch = Date.now();
        
        // Don't update state if we're returning the same recipes from cache
        if (action.payload !== state.recipes) {
          // Normalize all recipes
          state.recipes = action.payload.map((recipe: Recipe) => normalizeRecipe(recipe));
        }
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
        
        // Add normalized recipe
        const savedRecipe = normalizeRecipe(action.payload);
        state.recipes.push(savedRecipe);
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
        
        // Remove the deleted recipe from the array with optimized filter
        const idToDelete = action.payload;
        state.recipes = state.recipes.filter(
          (recipe) => getRecipeId(recipe) !== idToDelete
        );
        state.message = 'Recipe deleted successfully!';
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset, clearCurrentRecipe, setCurrentRecipe, invalidateCache } = recipeSlice.actions;
export default recipeSlice.reducer; 