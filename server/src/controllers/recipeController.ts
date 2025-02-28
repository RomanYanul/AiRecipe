import { Request, Response } from 'express';
import Recipe from '../models/Recipe';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all recipes for a user
// @route   GET /api/recipes
// @access  Private
export const getRecipes = async (req: AuthRequest, res: Response) => {
  try {
    const recipes = await Recipe.find({ user: req.user?.id }).sort({ createdAt: -1 });
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single recipe
// @route   GET /api/recipes/:id
// @access  Private
export const getRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the recipe belongs to the user
    if (recipe.user.toString() !== req.user?.id) {
      return res.status(401).json({ message: 'Not authorized to access this recipe' });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private
export const createRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      ingredients,
      instructions,
      prepTime,
      cookTime,
      servings,
      nutrition,
      imageUrl
    } = req.body;

    // Create recipe
    const recipe = await Recipe.create({
      user: req.user?.id,
      title,
      description,
      ingredients,
      instructions,
      prepTime: Number(prepTime),
      cookTime: Number(cookTime),
      servings: Number(servings),
      nutrition,
      imageUrl
    });

    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private
export const updateRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the recipe belongs to the user
    if (recipe.user.toString() !== req.user?.id) {
      return res.status(401).json({ message: 'Not authorized to update this recipe' });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private
export const deleteRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the recipe belongs to the user
    if (recipe.user.toString() !== req.user?.id) {
      return res.status(401).json({ message: 'Not authorized to delete this recipe' });
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 