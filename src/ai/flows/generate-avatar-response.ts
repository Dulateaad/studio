'use server';

/**
 * @fileOverview A flow for generating responses from the AI avatar in different languages.
 *
 * - generateAvatarResponse - A function that generates the AI avatar's response.
 * - GenerateAvatarResponseInput - The input type for the generateAvatarResponse function.
 * - GenerateAvatarResponseOutput - The return type for the generateAvatarResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAvatarResponseInputSchema = z.object({
  query: z.string().describe('The user query to respond to.'),
  preferredLanguage: z.enum(['Kazakh', 'Russian', 'English']).describe('The user\'s preferred language.'),
});
export type GenerateAvatarResponseInput = z.infer<typeof GenerateAvatarResponseInputSchema>;

const GenerateAvatarResponseOutputSchema = z.object({
  response: z.string().describe('The AI avatar\'s response in the user\'s preferred language.'),
});
export type GenerateAvatarResponseOutput = z.infer<typeof GenerateAvatarResponseOutputSchema>;

export async function generateAvatarResponse(input: GenerateAvatarResponseInput): Promise<GenerateAvatarResponseOutput> {
  return generateAvatarResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAvatarResponsePrompt',
  input: {schema: GenerateAvatarResponseInputSchema},
  output: {schema: GenerateAvatarResponseOutputSchema},
  prompt: `You are an AI avatar interacting with tourists. Respond to the user\'s query in their preferred language.

Preferred Language: {{{preferredLanguage}}}
User Query: {{{query}}}

Response:`,
});

const generateAvatarResponseFlow = ai.defineFlow(
  {
    name: 'generateAvatarResponseFlow',
    inputSchema: GenerateAvatarResponseInputSchema,
    outputSchema: GenerateAvatarResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
