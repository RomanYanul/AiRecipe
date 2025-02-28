import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // This is needed for client-side usage
});

export interface RecipeParams {
  diet?: string;
  allergies?: string[];
  calories?: number;
  mainIngredients?: string[];
}

export interface RecipeNutrition {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
}

export interface Recipe {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  nutrition: RecipeNutrition;
  prepTime: string;
  cookTime: string;
  servings: number;
  imageUrl?: string;
  userId?: string;
  createdAt?: Date;
}

export const generateRecipe = async (params: RecipeParams): Promise<Recipe> => {
  try {
    // Construct the prompt based on user preferences
    let prompt = "Generate a detailed recipe with the following structure:\n";
    prompt += "1. Title\n2. Brief description\n3. List of ingredients with measurements\n";
    prompt += "4. Step-by-step cooking instructions\n5. Nutritional information (calories, protein, fat, carbohydrates)\n";
    prompt += "6. Preparation time\n7. Cooking time\n8. Number of servings\n\n";
    
    // Add user preferences to the prompt
    if (params.diet) {
      prompt += `Diet preference: ${params.diet}\n`;
    }
    
    if (params.allergies && params.allergies.length > 0) {
      prompt += `Allergies (avoid these ingredients): ${params.allergies.join(', ')}\n`;
    }
    
    if (params.calories) {
      prompt += `Target calories per serving: approximately ${params.calories} calories\n`;
    }
    
    if (params.mainIngredients && params.mainIngredients.length > 0) {
      prompt += `Main ingredients to include: ${params.mainIngredients.join(', ')}\n`;
    }
    
    prompt += "\nFormat the response as JSON with the following structure:";
    prompt += `
    {
      "title": "Recipe Title",
      "description": "Brief description of the dish",
      "ingredients": ["Ingredient 1 with measurement", "Ingredient 2 with measurement", ...],
      "instructions": ["Step 1", "Step 2", ...],
      "nutrition": {
        "calories": number,
        "protein": number (in grams),
        "fat": number (in grams),
        "carbohydrates": number (in grams)
      },
      "prepTime": "time in minutes",
      "cookTime": "time in minutes",
      "servings": number
    }`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional chef and nutritionist who creates delicious, healthy recipes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // Extract the JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from OpenAI response");
    }

    const recipeData = JSON.parse(jsonMatch[0]);
    
    // Generate a random ID for the recipe
    const recipe: Recipe = {
      ...recipeData,
      id: `recipe_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date()
    };

    return recipe;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw error;
  }
};

export default {
  generateRecipe
}; 