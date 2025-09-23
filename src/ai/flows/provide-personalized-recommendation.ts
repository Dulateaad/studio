'use server';

/**
 * @fileOverview Provides personalized recommendations for attractions, events, and routes based on user preferences and real-time data.
 *
 * - providePersonalizedRecommendation - A function that generates personalized recommendations.
 * - ProvidePersonalizedRecommendationInput - The input type for the providePersonalizedRecommendation function.
 * - ProvidePersonalizedRecommendationOutput - The return type for the providePersonalizedRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvidePersonalizedRecommendationInputSchema = z.object({
  userPreferences: z
    .string()
    .describe('User preferences for attractions, events, and routes.'),
  realTimeData: z
    .string()
    .describe('Real-time data such as current events, weather, and traffic.'),
});
export type ProvidePersonalizedRecommendationInput = z.infer<
  typeof ProvidePersonalizedRecommendationInputSchema
>;

const ProvidePersonalizedRecommendationOutputSchema = z.object({
  recommendations: z
    .string()
    .describe(
      'Personalized recommendations for attractions, events, and routes.'
    ),
});
export type ProvidePersonalizedRecommendationOutput = z.infer<
  typeof ProvidePersonalizedRecommendationOutputSchema
>;

export async function providePersonalizedRecommendation(
  input: ProvidePersonalizedRecommendationInput
): Promise<ProvidePersonalizedRecommendationOutput> {
  return providePersonalizedRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'providePersonalizedRecommendationPrompt',
  input: {schema: ProvidePersonalizedRecommendationInputSchema},
  output: {schema: ProvidePersonalizedRecommendationOutputSchema},
  prompt: `You are an AI travel assistant that provides personalized recommendations for attractions, events, and routes based on user preferences and real-time data.

  All recommendations must be within the city of Astana, Kazakhstan. Do not suggest any locations outside of Astana.

  User Preferences: {{{userPreferences}}}
  Real-time Data: {{{realTimeData}}}

  Provide personalized recommendations for the user. Incorporate the user's stated preferences along with the real-time data in order to make the best recommendation possible.
  `,
});

const providePersonalizedRecommendationFlow = ai.defineFlow(
  {
    name: 'providePersonalizedRecommendationFlow',
    inputSchema: ProvidePersonalizedRecommendationInputSchema,
    outputSchema: ProvidePersonalizedRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
