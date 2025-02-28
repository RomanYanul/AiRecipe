import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // This is needed for client-side usage
});

export interface RecipeParams {
  diet?: string[];
  allergies?: string[];
  calories?: number;
  mainIngredients?: string[];
  servings?: number;
}

export interface RecipeNutrition {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  sugar?: number;
  cholesterol?: number;
  fiber?: number;
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

// Generate an image for a recipe using DALL-E
export const generateRecipeImage = async (recipe: Recipe): Promise<string> => {
  try {
    // Create a prompt for the image generation
    const prompt = `A professional, appetizing food photography of ${recipe.title}. 
      The dish contains ${recipe.ingredients.slice(0, 5).join(', ')}. 
      High-quality, well-lit food photography, suitable for a cookbook or food blog.`;

    // Call OpenAI API to generate an image
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    // Get the image URL from the response
    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI");
    }

    return imageUrl;
  } catch (error) {
    console.error("Error generating recipe image:", error);
    // Return a default food image URL if image generation fails
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1024";
  }
};

export const generateRecipe = async (params: RecipeParams): Promise<Recipe> => {
  try {
    // Construct the prompt based on user preferences
    let prompt = "Generate a detailed recipe with the following structure:\n";
    prompt += "1. Title\n2. Brief description\n3. List of ingredients with measurements\n";
    prompt += "4. Step-by-step cooking instructions\n5. Nutritional information (calories, protein, fat, carbohydrates, sugar, cholesterol, fiber)\n";
    prompt += "6. Preparation time\n7. Cooking time\n8. Number of servings\n\n";
    
    // Add user preferences to the prompt
    if (params.diet && params.diet.length > 0) {
      prompt += `Diet preference: ${params.diet.join(', ')}\n`;
      
      // Add specific guidance for special diets
      if (params.diet.includes('Diabetic-Friendly')) {
        prompt += "For diabetic-friendly recipe: Focus on low glycemic index ingredients, limit added sugars, and balance carbohydrates.\n";
      }
      
      if (params.diet.includes('Low-Cholesterol')) {
        prompt += "For low-cholesterol recipe: Minimize saturated fats, avoid trans fats, and include heart-healthy ingredients.\n";
      }
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
    
    if (params.servings) {
      prompt += `Number of servings/portions: ${params.servings}\n`;
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
        "carbohydrates": number (in grams),
        "sugar": number (in grams),
        "cholesterol": number (in mg),
        "fiber": number (in grams)
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
          content: "You are a professional chef and nutritionist who creates delicious, healthy recipes. When creating recipes, follow these guidelines:\n" +
            "- For diabetic-friendly recipes: Focus on low glycemic index foods, limit added sugars, include fiber-rich ingredients, and balance carbohydrates.\n" +
            "- For low-cholesterol recipes: Minimize saturated fats, avoid trans fats, include heart-healthy fats (olive oil, avocados, nuts), and incorporate fiber-rich foods.\n" +
            "- Always provide accurate nutritional information and clear, detailed instructions."
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
    const generatedId = `recipe_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const recipe: Recipe = {
      ...recipeData,
      id: generatedId,
      _id: generatedId,
      createdAt: new Date()
    };

    // Generate an image for the recipe
    try {
      const imageUrl = await generateRecipeImage(recipe);
      recipe.imageUrl = imageUrl;
    } catch (error) {
      console.error("Error generating recipe image:", error);
      // Set a default image if generation fails
      recipe.imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1024";
    }

    return recipe;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw error;
  }
};

export default {
  generateRecipe
}; 