"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecipe = exports.updateRecipe = exports.createRecipe = exports.getRecipe = exports.getRecipes = void 0;
const Recipe_1 = __importDefault(require("../models/Recipe"));
// @desc    Get all recipes for a user
// @route   GET /api/recipes
// @access  Private
const getRecipes = async (req, res) => {
    var _a;
    try {
        const recipes = await Recipe_1.default.find({ user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }).sort({ createdAt: -1 });
        res.status(200).json(recipes);
    }
    catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getRecipes = getRecipes;
// @desc    Get a single recipe
// @route   GET /api/recipes/:id
// @access  Private
const getRecipe = async (req, res) => {
    var _a;
    try {
        const recipe = await Recipe_1.default.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        // Check if the recipe belongs to the user
        if (recipe.user.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: 'Not authorized to access this recipe' });
        }
        res.status(200).json(recipe);
    }
    catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getRecipe = getRecipe;
// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private
const createRecipe = async (req, res) => {
    var _a;
    try {
        const { title, description, ingredients, instructions, prepTime, cookTime, servings, nutrition, imageUrl } = req.body;
        // Create recipe
        const recipe = await Recipe_1.default.create({
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
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
    }
    catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createRecipe = createRecipe;
// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private
const updateRecipe = async (req, res) => {
    var _a;
    try {
        const recipe = await Recipe_1.default.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        // Check if the recipe belongs to the user
        if (recipe.user.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: 'Not authorized to update this recipe' });
        }
        const updatedRecipe = await Recipe_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedRecipe);
    }
    catch (error) {
        console.error('Error updating recipe:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateRecipe = updateRecipe;
// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private
const deleteRecipe = async (req, res) => {
    var _a;
    try {
        const recipe = await Recipe_1.default.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        // Check if the recipe belongs to the user
        if (recipe.user.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: 'Not authorized to delete this recipe' });
        }
        await Recipe_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ id: req.params.id });
    }
    catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteRecipe = deleteRecipe;
