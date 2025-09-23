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
import { askAstanaGuideTool } from '../services/ask-astana-guide';

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

const languageMap = {
  English: "en",
  Russian: "ru",
  Kazakh: "kk",
}

const prompt = ai.definePrompt({
  name: 'generateAvatarResponsePrompt',
  tools: [askAstanaGuideTool],
  input: {schema: GenerateAvatarResponseInputSchema},
  output: {schema: GenerateAvatarResponseOutputSchema},
  prompt: `You are an AI avatar interacting with tourists. Respond to the user\'s query in their preferred language.

If the user asks a question about Astana, use the askAstanaGuideTool to get information.

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
    const {output} = await prompt({
      ...input,
      // @ts-ignore
      preferredLanguage: languageMap[input.preferredLanguage]
    });
    return output!;
  }
);
