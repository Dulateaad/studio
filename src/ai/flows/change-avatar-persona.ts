'use server';

/**
 * @fileOverview This file defines a Genkit flow for changing the AI avatar's communication style.
 *
 * - changeAvatarPersona - A function that allows users to change the communication style of the AI avatar.
 * - ChangeAvatarPersonaInput - The input type for the changeAvatarPersona function.
 * - ChangeAvatarPersonaOutput - The return type for the changeAvatarPersona function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChangeAvatarPersonaInputSchema = z.object({
  persona: z
    .enum(['formal', 'humorous'])
    .describe('The desired communication style for the AI avatar.'),
});
export type ChangeAvatarPersonaInput = z.infer<typeof ChangeAvatarPersonaInputSchema>;

const ChangeAvatarPersonaOutputSchema = z.object({
  updatedPersona: z
    .enum(['formal', 'humorous'])
    .describe('The communication style that has been applied to the avatar.'),
  message: z.string().describe('A confirmation message indicating the persona change.'),
});
export type ChangeAvatarPersonaOutput = z.infer<typeof ChangeAvatarPersonaOutputSchema>;

export async function changeAvatarPersona(input: ChangeAvatarPersonaInput): Promise<ChangeAvatarPersonaOutput> {
  return changeAvatarPersonaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'changeAvatarPersonaPrompt',
  input: {schema: ChangeAvatarPersonaInputSchema},
  output: {schema: ChangeAvatarPersonaOutputSchema},
  prompt: `You are an AI avatar personality manager. The user wants to change your communication style to {{persona}}.\n\nRespond with a confirmation message that you have updated your communication style to the specified persona. The persona should be applied to future interactions. You must set the 'updatedPersona' field in the output to be equal to the provided 'persona' field. The output must be valid JSON.`, // Ensure valid JSON is returned
});

const changeAvatarPersonaFlow = ai.defineFlow(
  {
    name: 'changeAvatarPersonaFlow',
    inputSchema: ChangeAvatarPersonaInputSchema,
    outputSchema: ChangeAvatarPersonaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
