'use server';
/**
 * @fileOverview A Genkit flow for generating appealing and creative menu item descriptions for restaurant owners.
 *
 * - generateMenuDescription - A function that generates a menu description using AI.
 * - GenerateMenuDescriptionInput - The input type for the generateMenuDescription function.
 * - GenerateMenuDescriptionOutput - The return type for the generateMenuDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateMenuDescriptionInputSchema = z.object({
  itemName: z.string().describe('The name of the menu item.'),
  ingredients: z.array(z.string()).describe('A list of key ingredients in the dish.'),
  cuisineType: z.string().optional().describe('The cuisine type of the dish (e.g., Italian, Thai, Fusion).'),
  descriptionKeywords: z.array(z.string()).optional().describe('Keywords to guide the description (e.g., spicy, creamy, fresh, hearty).'),
});
export type GenerateMenuDescriptionInput = z.infer<typeof GenerateMenuDescriptionInputSchema>;

const GenerateMenuDescriptionOutputSchema = z.object({
  description: z.string().describe('The AI-generated appealing and creative menu description.'),
});
export type GenerateMenuDescriptionOutput = z.infer<typeof GenerateMenuDescriptionOutputSchema>;

export async function generateMenuDescription(input: GenerateMenuDescriptionInput): Promise<GenerateMenuDescriptionOutput> {
  return generateMenuDescriptionFlow(input);
}

const generateMenuDescriptionPrompt = ai.definePrompt({
  name: 'generateMenuDescriptionPrompt',
  input: { schema: GenerateMenuDescriptionInputSchema },
  output: { schema: GenerateMenuDescriptionOutputSchema },
  prompt: `You are a highly creative and experienced culinary marketing expert, specialized in crafting enticing menu descriptions that make dishes irresistible to customers. Your goal is to write a captivating, concise, and delicious-sounding menu description for a restaurant.

Focus on creating a description that:
- Uses evocative and sensory language (taste, aroma, texture).
- Highlights the key ingredients and unique characteristics of the dish.
- Is appealing to a broad audience.
- Is approximately 2-3 sentences long.

Here is the information about the menu item:

Dish Name: "{{{itemName}}}"
Key Ingredients: {{#each ingredients}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if cuisineType}}Cuisine Type: "{{{cuisineType}}}"{{/if}}
{{#if descriptionKeywords}}Keywords for Description: {{#each descriptionKeywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}

Please generate only the menu description.`, 
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const generateMenuDescriptionFlow = ai.defineFlow(
  {
    name: 'generateMenuDescriptionFlow',
    inputSchema: GenerateMenuDescriptionInputSchema,
    outputSchema: GenerateMenuDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await generateMenuDescriptionPrompt(input);
    return output!;
  }
);
