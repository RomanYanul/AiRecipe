import mongoose from 'mongoose';

// Nutrition sub-schema
const NutritionSchema = new mongoose.Schema({
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true
  },
  fat: {
    type: Number,
    required: true
  },
  carbohydrates: {
    type: Number,
    required: true
  }
});

// Recipe schema
const RecipeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  ingredients: {
    type: [String],
    required: true
  },
  instructions: {
    type: [String],
    required: true
  },
  prepTime: {
    type: Number,
    required: true
  },
  cookTime: {
    type: Number,
    required: true
  },
  servings: {
    type: Number,
    required: true
  },
  nutrition: {
    type: NutritionSchema,
    required: true
  },
  imageUrl: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Recipe', RecipeSchema); 